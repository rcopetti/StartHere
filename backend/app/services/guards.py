"""Pre-AI guards: sensitive-data detection, redaction, and risk heuristics."""

from __future__ import annotations

import re

from app.models.scam_check import STOP_SCREEN_CATEGORIES, RiskCategory

SSN_REGEX = re.compile(r"\b\d{3}[- ]?\d{2}[- ]?\d{4}\b")
CARD_REGEX = re.compile(r"\b(?:\d[ -]*?){13,16}\b")
PASSWORD_REGEX = re.compile(
    r"\b(?:password|passcode|pin\s*code|bank\s*pin|security\s*code)\s*[:=]?\s*\S+\b",
    re.IGNORECASE,
)

REDACTION = "[hidden]"

_STOP_KEYWORDS: dict[RiskCategory, tuple[str, ...]] = {
    RiskCategory.GIFT_CARDS: (
        "gift card",
        "itunes card",
        "google play card",
        "steam card",
        "amazon card",
    ),
    RiskCategory.MONEY_TRANSFER: (
        "wire transfer",
        "western union",
        "moneygram",
        "zelle",
        "cash app",
        "cashapp",
        "venmo",
        "send money",
        "send cash",
        "pay a fee",
        "redelivery fee",
    ),
    RiskCategory.CRYPTO: (
        "bitcoin",
        "crypto",
        "usdt",
        "ethereum",
        "wallet address",
        "bitcoin atm",
    ),
    RiskCategory.BANK_ACCOUNT: (
        "bank account",
        "routing number",
        "account number",
        "debit card",
        "credit card",
        "social security",
        "medicare number",
    ),
    RiskCategory.VERIFICATION_CODE: (
        "verification code",
        "6-digit code",
        "six digit code",
        "one-time code",
        "security code",
        "code we sent",
        "read that code",
        "send the code",
    ),
    RiskCategory.FAMILY_IMPOSTOR: (
        "your grandson",
        "your granddaughter",
        "your son",
        "your daughter",
        "i am in jail",
        "in jail",
        "arrested",
        "bail money",
        "safe word",
    ),
    RiskCategory.TECH_SUPPORT: (
        "tech support",
        "microsoft support",
        "apple support",
        "virus on your computer",
        "your computer is infected",
    ),
    RiskCategory.PRIZE: (
        "you have won",
        "you've won",
        "sweepstakes",
        "lottery",
        "prize",
    ),
    RiskCategory.DELIVERY_FEE: (
        "delivery fee",
        "redelivery fee",
        "package is on hold",
        "unpaid fee",
        "customs fee",
    ),
}


def contains_sensitive_data(text: str) -> bool:
    """True when the text carries a password, card number, or SSN."""
    return bool(
        PASSWORD_REGEX.search(text) or CARD_REGEX.search(text) or SSN_REGEX.search(text)
    )


def redact_sensitive(text: str) -> str:
    """Replace private numbers and passwords before text is stored or shown."""
    redacted = PASSWORD_REGEX.sub(REDACTION, text)
    redacted = CARD_REGEX.sub(REDACTION, redacted)
    return SSN_REGEX.sub(REDACTION, redacted)


def infer_risk_categories(text: str) -> set[RiskCategory]:
    """Deterministic keyword fallback used to confirm the model's categories."""
    lower = text.lower()
    return {
        category
        for category, keywords in _STOP_KEYWORDS.items()
        if any(keyword in lower for keyword in keywords)
    }


def sensitive_risk_categories(text: str) -> list[RiskCategory]:
    """Categories for a message caught by the pre-AI guard."""
    categories = infer_risk_categories(text)
    if CARD_REGEX.search(text) or SSN_REGEX.search(text):
        categories.add(RiskCategory.BANK_ACCOUNT)
    if not categories:
        categories.add(RiskCategory.OTHER)
    return sorted(categories)


def detect_stop_screen(
    verdict: str, categories: set[RiskCategory], text: str
) -> bool:
    """The Stop Screen appears only for non-safe verdicts involving money or codes."""
    if verdict == "looks_safe":
        return False
    if categories & STOP_SCREEN_CATEGORIES:
        return True
    return bool(infer_risk_categories(text) & STOP_SCREEN_CATEGORIES)
