from __future__ import annotations

import zipfile
from io import BytesIO

from fastapi.testclient import TestClient

from app.api.deps import require_user
from app.config import Settings
from app.main import create_app
from app.services.auth import AuthenticatedUser
from app.services.llm import LlmError, LlmOutputError
from tests.conftest import FakeLlm, FakeVerifier

CHECK_URL = "/api/v1/scam-check"
TEXT_URL = "/api/v1/scam-check/text"

PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32
GIFT_CARD_TEXT = (
    "Grandma, I am in jail and need bail money. Please buy gift cards and send the codes."
)


def _docx_bytes(text: str) -> bytes:
    document = (
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f"<w:body><w:p><w:r><w:t>{text}</w:t></w:r></w:p></w:body></w:document>"
    )
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("word/document.xml", document)
    return buffer.getvalue()


def test_text_check_returns_camel_case_result(client: TestClient, fake_llm: FakeLlm) -> None:
    response = client.post(TEXT_URL, json={"text": GIFT_CARD_TEXT, "channel": "sms"})

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True

    result = body["result"]
    assert result["verdict"] == "likely_scam"
    assert result["headline"] == "Fake delivery fee"
    assert result["riskScore"] == 88
    assert result["stopScreenRequired"] is True
    assert {"delivery_fee", "money_transfer"} <= set(result["riskCategories"])
    assert result["inputType"] == "text"
    assert result["previewText"].startswith("Grandma, I am in jail")
    assert result["createdAt"] > 0
    assert result["model"] == "fake/model"
    assert result["usedFallback"] is False
    assert result["id"].startswith("chk_")

    assert len(fake_llm.calls) == 1
    messages = fake_llm.calls[0]
    assert messages[0]["role"] == "system"
    assert "<<<BEGIN UNTRUSTED USER CONTENT>>>" in messages[1]["content"][0]["text"]


def test_multipart_text_check(client: TestClient) -> None:
    response = client.post(
        CHECK_URL, data={"text": "Your account is locked. Verify now.", "channel": "sms"}
    )

    assert response.status_code == 200
    assert response.json()["result"]["verdict"] == "likely_scam"


def test_image_upload_is_sent_to_the_model(client: TestClient, fake_llm: FakeLlm) -> None:
    response = client.post(
        CHECK_URL,
        data={"channel": "photo"},
        files={"file": ("message.png", PNG_BYTES, "image/png")},
    )

    assert response.status_code == 200
    result = response.json()["result"]
    assert result["inputType"] == "image"
    assert result["previewText"] == "Photo of a message"

    parts = fake_llm.calls[0][1]["content"]
    assert parts[0]["type"] == "text"
    assert parts[1]["type"] == "image_url"
    assert parts[1]["image_url"]["url"].startswith("data:image/png;base64,")


def test_image_and_text_are_combined(client: TestClient, fake_llm: FakeLlm) -> None:
    response = client.post(
        CHECK_URL,
        data={"text": "This came from my bank.", "channel": "photo"},
        files={"file": ("message.jpg", b"\xff\xd8\xff" + b"\x00" * 16, "image/jpeg")},
    )

    assert response.status_code == 200
    assert response.json()["result"]["inputType"] == "mixed"
    assert "This came from my bank." in fake_llm.calls[0][1]["content"][0]["text"]


def test_docx_text_is_extracted(client: TestClient, fake_llm: FakeLlm) -> None:
    response = client.post(
        CHECK_URL,
        data={"channel": "file"},
        files={
            "file": (
                "letter.docx",
                _docx_bytes("Pay the delivery fee today or your parcel is returned."),
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )

    assert response.status_code == 200
    assert response.json()["result"]["inputType"] == "file"
    prompt = fake_llm.calls[0][1]["content"][0]["text"]
    assert "Pay the delivery fee today" in prompt


def test_pdf_text_is_extracted(
    client: TestClient, fake_llm: FakeLlm, monkeypatch
) -> None:
    monkeypatch.setattr(
        "app.services.inputs._extract_pdf_text",
        lambda data, settings: "Your bank account is suspended. Call this number.",
    )

    response = client.post(
        CHECK_URL,
        data={"channel": "file"},
        files={"file": ("notice.pdf", b"%PDF-1.7\nbody", "application/pdf")},
    )

    assert response.status_code == 200
    assert "Your bank account is suspended" in fake_llm.calls[0][1]["content"][0]["text"]


def test_unreadable_pdf_fails_closed(client: TestClient) -> None:
    response = client.post(
        CHECK_URL,
        data={"channel": "file"},
        files={"file": ("broken.pdf", b"%PDF-1.7\nnot really a pdf", "application/pdf")},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "unreadable_file"


def test_unsupported_file_type_is_rejected(client: TestClient) -> None:
    response = client.post(
        CHECK_URL,
        data={"channel": "file"},
        files={"file": ("archive.exe", b"MZ\x90\x00", "application/octet-stream")},
    )

    assert response.status_code == 415
    assert response.json()["error"]["code"] == "unsupported_file"


def test_oversized_file_is_rejected(client: TestClient) -> None:
    response = client.post(
        CHECK_URL,
        data={"channel": "photo"},
        files={"file": ("big.png", PNG_BYTES + b"\x00" * 2048, "image/png")},
    )

    assert response.status_code == 413
    assert response.json()["error"]["code"] == "file_too_large"


def test_empty_request_is_rejected(client: TestClient) -> None:
    response = client.post(CHECK_URL, data={"channel": "sms"})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "missing_input"


def test_blank_text_is_rejected(client: TestClient) -> None:
    response = client.post(TEXT_URL, json={"text": "   "})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "empty_text"


def test_unparseable_model_reply_fails_closed(
    client: TestClient, fake_llm: FakeLlm
) -> None:
    fake_llm.error = LlmOutputError("not json")

    response = client.post(TEXT_URL, json={"text": GIFT_CARD_TEXT})

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "check_unavailable"


def test_provider_failure_fails_closed(client: TestClient, fake_llm: FakeLlm) -> None:
    fake_llm.error = LlmError("provider down")

    response = client.post(TEXT_URL, json={"text": GIFT_CARD_TEXT})

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "check_unavailable"


def test_sensitive_data_short_circuits_the_model(
    client: TestClient, fake_llm: FakeLlm
) -> None:
    response = client.post(
        TEXT_URL,
        json={"text": "Send your card number 4111 1111 1111 1111 and your password: hunter2"},
    )

    assert response.status_code == 200
    result = response.json()["result"]
    assert result["verdict"] == "likely_scam"
    assert result["stopScreenRequired"] is True
    assert result["model"] == "sensitive-guard"
    assert "4111" not in result["previewText"]
    assert "hunter2" not in result["previewText"]
    assert fake_llm.calls == []


def test_looks_safe_never_shows_the_stop_screen(
    client: TestClient, fake_llm: FakeLlm
) -> None:
    fake_llm.data = {
        "verdict": "looks_safe",
        "riskScore": 5,
        "stopScreenRequired": True,
        "headline": "Pharmacy pickup",
        "explanation": "This is an ordinary pickup notice. It asks for nothing.",
        "action": "You can go to the pharmacy.",
        "signals": ["Known store", "No payment asked"],
    }

    response = client.post(TEXT_URL, json={"text": "CVS: your prescription is ready."})

    assert response.status_code == 200
    assert response.json()["result"]["stopScreenRequired"] is False


def test_verdict_is_derived_from_score_when_missing(
    client: TestClient, fake_llm: FakeLlm
) -> None:
    fake_llm.data = {"riskScore": 45}

    response = client.post(TEXT_URL, json={"text": "Someone you do not know says hello."})

    result = response.json()["result"]
    assert result["verdict"] == "caution"
    assert result["riskScore"] == 45
    assert result["headline"] == "Be careful with this one"


def test_score_is_aligned_to_the_verdict_band(
    client: TestClient, fake_llm: FakeLlm
) -> None:
    fake_llm.data = {"verdict": "likely_scam", "riskScore": 10}

    response = client.post(TEXT_URL, json={"text": "Pay with gift cards now."})

    assert response.json()["result"]["riskScore"] == 70


def test_money_keywords_force_the_stop_screen(
    client: TestClient, fake_llm: FakeLlm
) -> None:
    fake_llm.data = {
        "verdict": "caution",
        "riskScore": 50,
        "stopScreenRequired": False,
        "riskCategories": [],
    }

    response = client.post(
        TEXT_URL, json={"text": "Please buy a Google Play gift card and send the code."}
    )

    result = response.json()["result"]
    assert result["stopScreenRequired"] is True
    assert "gift_cards" in result["riskCategories"]


def test_fallback_model_is_reported(client: TestClient, fake_llm: FakeLlm) -> None:
    fake_llm.used_fallback = True

    response = client.post(TEXT_URL, json={"text": "Check this please."})

    assert response.json()["result"]["usedFallback"] is True


def test_rate_limit_returns_429(settings: Settings, fake_llm: FakeLlm) -> None:
    limited = settings.model_copy(update={"rate_limit_per_hour": 1})
    application = create_app(limited, llm_client=fake_llm)
    application.state.token_verifier = FakeVerifier()
    application.dependency_overrides[require_user] = lambda: AuthenticatedUser(uid="user-1")

    with TestClient(application) as test_client:
        first = test_client.post(TEXT_URL, json={"text": "First message."})
        second = test_client.post(TEXT_URL, json={"text": "Second message."})

    assert first.status_code == 200
    assert second.status_code == 429
    assert second.json()["error"]["code"] == "rate_limited"
    assert int(second.headers["Retry-After"]) > 0
