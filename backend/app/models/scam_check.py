"""Scam-check request and response contracts.

Field names serialize to camelCase so the React client can consume the
response without a translation layer.
"""

from __future__ import annotations

from enum import StrEnum
from typing import Literal

from pydantic import Field

from app.models.common import ApiModel

Verdict = Literal["likely_scam", "caution", "looks_safe"]
InputType = Literal["text", "image", "file", "mixed"]
Channel = Literal["sms", "email", "link", "call", "photo", "file", "unknown"]


class RiskCategory(StrEnum):
    MONEY_TRANSFER = "money_transfer"
    GIFT_CARDS = "gift_cards"
    CRYPTO = "crypto"
    BANK_ACCOUNT = "bank_account"
    VERIFICATION_CODE = "verification_code"
    FAMILY_IMPOSTOR = "family_impostor"
    TECH_SUPPORT = "tech_support"
    PRIZE = "prize"
    DELIVERY_FEE = "delivery_fee"
    ROMANCE = "romance"
    OTHER = "other"


# Categories that always warrant the full-screen Stop Screen.
STOP_SCREEN_CATEGORIES: frozenset[RiskCategory] = frozenset(
    {
        RiskCategory.MONEY_TRANSFER,
        RiskCategory.GIFT_CARDS,
        RiskCategory.CRYPTO,
        RiskCategory.BANK_ACCOUNT,
        RiskCategory.VERIFICATION_CODE,
    }
)


class ScamCheckRequest(ApiModel):
    text: str = Field(min_length=1)
    channel: Channel = "unknown"


class ScamCheckResult(ApiModel):
    id: str
    verdict: Verdict
    headline: str
    explanation: str
    action: str
    signals: list[str]
    risk_score: int = Field(ge=0, le=100)
    stop_screen_required: bool
    risk_categories: list[str]
    input_type: InputType
    preview_text: str
    created_at: int
    model: str
    used_fallback: bool


class ScamCheckResponse(ApiModel):
    ok: bool = True
    result: ScamCheckResult
