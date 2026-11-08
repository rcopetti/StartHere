from __future__ import annotations

from fastapi.testclient import TestClient

from app.core.errors import AuthNotConfiguredError, InvalidTokenError
from tests.conftest import FakeVerifier

CHECK_URL = "/api/v1/scam-check/text"
BODY = {"text": "Your package is on hold. Pay $1.99 now."}


def test_missing_token_is_rejected(auth_client: TestClient) -> None:
    response = auth_client.post(CHECK_URL, json=BODY)

    assert response.status_code == 401
    assert response.headers["WWW-Authenticate"] == "Bearer"
    assert response.json()["error"]["code"] == "missing_token"


def test_non_bearer_scheme_is_rejected(auth_client: TestClient) -> None:
    response = auth_client.post(
        CHECK_URL, json=BODY, headers={"Authorization": "Token abc"}
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "missing_token"


def test_invalid_token_is_rejected(auth_client: TestClient) -> None:
    auth_client.app.state.token_verifier = FakeVerifier(error=InvalidTokenError("nope"))

    response = auth_client.post(
        CHECK_URL, json=BODY, headers={"Authorization": "Bearer not-a-real-token"}
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_token"


def test_unconfigured_firebase_returns_503(auth_client: TestClient) -> None:
    auth_client.app.state.token_verifier = FakeVerifier(
        error=AuthNotConfiguredError("no credentials")
    )

    response = auth_client.post(
        CHECK_URL, json=BODY, headers={"Authorization": "Bearer any-token"}
    )

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "auth_unavailable"


def test_valid_token_reaches_the_service(auth_client: TestClient) -> None:
    response = auth_client.post(
        CHECK_URL, json=BODY, headers={"Authorization": "Bearer good-token"}
    )

    assert response.status_code == 200
    assert response.json()["ok"] is True
