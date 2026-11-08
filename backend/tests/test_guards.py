from __future__ import annotations

from app.models.scam_check import RiskCategory
from app.services.guards import (
    contains_sensitive_data,
    detect_stop_screen,
    infer_risk_categories,
    redact_sensitive,
    sensitive_risk_categories,
)


def test_detects_card_numbers() -> None:
    assert contains_sensitive_data("My card is 4111 1111 1111 1111")
    assert contains_sensitive_data("4111111111111111")


def test_detects_social_security_numbers() -> None:
    assert contains_sensitive_data("SSN 123-45-6789")


def test_detects_passwords() -> None:
    assert contains_sensitive_data("password: hunter2")
    assert contains_sensitive_data("PIN CODE = 9988")


def test_ignores_ordinary_text() -> None:
    assert not contains_sensitive_data("Your prescription is ready for pickup at 4 PM.")


def test_redaction_removes_private_values() -> None:
    text = "Card 4111 1111 1111 1111, SSN 123-45-6789, password: hunter2"

    redacted = redact_sensitive(text)

    assert "4111" not in redacted
    assert "123-45-6789" not in redacted
    assert "hunter2" not in redacted
    assert redacted.count("[hidden]") == 3


def test_infers_money_and_code_categories() -> None:
    categories = infer_risk_categories(
        "Buy a Google Play gift card and send the 6-digit code right away."
    )

    assert RiskCategory.GIFT_CARDS in categories
    assert RiskCategory.VERIFICATION_CODE in categories


def test_ordinary_message_has_no_stop_categories() -> None:
    assert infer_risk_categories("CVS: your prescription is ready.") == set()


def test_stop_screen_requires_a_non_safe_verdict() -> None:
    text = "Send a gift card code."

    assert detect_stop_screen("looks_safe", set(), text) is False
    assert detect_stop_screen("likely_scam", set(), text) is True
    assert detect_stop_screen("caution", {RiskCategory.BANK_ACCOUNT}, "hello") is True


def test_sensitive_categories_flag_bank_details() -> None:
    assert RiskCategory.BANK_ACCOUNT in sensitive_risk_categories(
        "Card 4111 1111 1111 1111"
    )


def test_sensitive_categories_fall_back_to_other() -> None:
    assert sensitive_risk_categories("password: hunter2") == [RiskCategory.OTHER]
