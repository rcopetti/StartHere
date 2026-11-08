"""Scam-check orchestration: guard, prompt, parse, normalize."""

from __future__ import annotations

import logging
import math
import time
from typing import Any
from uuid import uuid4

from app.config import Settings
from app.core.errors import ApiError
from app.models.scam_check import (
    Channel,
    RiskCategory,
    ScamCheckResult,
    Verdict,
)
from app.prompts.scam_check import build_messages
from app.services.guards import (
    contains_sensitive_data,
    detect_stop_screen,
    infer_risk_categories,
    redact_sensitive,
    sensitive_risk_categories,
)
from app.services.inputs import PreparedInput
from app.services.llm import JsonCompletion, LlmClient, LlmError

logger = logging.getLogger(__name__)

HEADLINE_LIMIT = 80
EXPLANATION_LIMIT = 400
ACTION_LIMIT = 220
SIGNAL_LIMIT = 80
MAX_SIGNALS = 3

VERDICT_BANDS: dict[Verdict, tuple[int, int]] = {
    "likely_scam": (70, 100),
    "caution": (35, 69),
    "looks_safe": (0, 34),
}

DEFAULT_COPY: dict[Verdict, tuple[str, str, str]] = {
    "looks_safe": (
        "This looks safe",
        "Nothing here asks for money, codes, or private details. "
        "It reads like an ordinary message.",
        "You can go ahead. If anything feels odd later, check it again.",
    ),
    "caution": (
        "Be careful with this one",
        "Something about this message is unusual. It is worth checking before you act.",
        "Do not tap anything yet. Call the company using the number on your card or bill.",
    ),
    "likely_scam": (
        "This is a scam",
        "This message is trying to get money, codes, or private details from you. "
        "You are safe because you checked.",
        "Do not reply or tap anything. Delete this message now.",
    ),
}

UNAVAILABLE_MESSAGE = (
    "We could not check this right now. Please try again in a moment."
)


class ScamCheckService:
    def __init__(self, llm: LlmClient, settings: Settings) -> None:
        self._llm = llm
        self._settings = settings

    async def check(self, prepared: PreparedInput, channel: Channel) -> ScamCheckResult:
        check_id = f"chk_{uuid4().hex}"
        started = time.perf_counter()

        if prepared.text and contains_sensitive_data(prepared.text):
            result = self._sensitive_result(check_id, prepared)
        else:
            messages = build_messages(prepared, channel)
            try:
                completion = await self._llm.complete_json(messages)
            except LlmError as exc:
                logger.warning("scam_check_failed id=%s reason=%s", check_id, type(exc).__name__)
                raise ApiError(503, "check_unavailable", UNAVAILABLE_MESSAGE) from exc

            result = normalize_result(completion, prepared, check_id)

        logger.info(
            "scam_check id=%s verdict=%s score=%d input=%s model=%s fallback=%s latency_ms=%d",
            result.id,
            result.verdict,
            result.risk_score,
            result.input_type,
            result.model,
            result.used_fallback,
            int((time.perf_counter() - started) * 1000),
        )
        return result

    def _sensitive_result(self, check_id: str, prepared: PreparedInput) -> ScamCheckResult:
        categories = [category.value for category in sensitive_risk_categories(prepared.text)]
        return ScamCheckResult(
            id=check_id,
            verdict="likely_scam",
            headline="This asks for private details",
            explanation=(
                "This message mentions a password, card, or personal number. "
                "Real companies never ask for those in a message."
            ),
            action=(
                "Do not reply or send anything. Delete this message and call the company "
                "using the number on your card."
            ),
            signals=["Mentions private details", "Asks you to share a secret"],
            risk_score=95,
            stop_screen_required=True,
            risk_categories=categories[:5],
            input_type=prepared.input_type,
            preview_text=prepared.preview_text,
            created_at=_now_ms(),
            model="sensitive-guard",
            used_fallback=False,
        )


def normalize_result(
    completion: JsonCompletion, prepared: PreparedInput, check_id: str
) -> ScamCheckResult:
    data = completion.data
    raw_score = _coerce_int(data.get("riskScore"))
    verdict = _coerce_verdict(data.get("verdict"), raw_score)
    score = _align_score(verdict, raw_score)

    default_headline, default_explanation, default_action = DEFAULT_COPY[verdict]
    headline = redact_sensitive(
        _coerce_text(data.get("headline"), default_headline, HEADLINE_LIMIT)
    )
    explanation = redact_sensitive(
        _coerce_text(data.get("explanation"), default_explanation, EXPLANATION_LIMIT)
    )
    action = redact_sensitive(
        _coerce_text(data.get("action"), default_action, ACTION_LIMIT)
    )
    signals = [
        redact_sensitive(signal)
        for signal in _coerce_signals(data.get("signals"))
    ]

    model_categories = _coerce_categories(data.get("riskCategories"))
    inferred = infer_risk_categories(prepared.text)
    categories = list(dict.fromkeys([*model_categories, *(c.value for c in sorted(inferred))]))

    stop_screen = _coerce_bool(data.get("stopScreenRequired"))
    stop_screen = stop_screen or detect_stop_screen(verdict, inferred, prepared.text)
    if verdict == "looks_safe":
        stop_screen = False

    return ScamCheckResult(
        id=check_id,
        verdict=verdict,
        headline=headline,
        explanation=explanation,
        action=action,
        signals=signals,
        risk_score=score,
        stop_screen_required=stop_screen,
        risk_categories=categories[:5],
        input_type=prepared.input_type,
        preview_text=prepared.preview_text,
        created_at=_now_ms(),
        model=completion.model,
        used_fallback=completion.used_fallback,
    )


def _coerce_verdict(value: Any, score: int | None) -> Verdict:
    if isinstance(value, str):
        candidate = value.strip().lower()
        if candidate in VERDICT_BANDS:
            return candidate  # type: ignore[return-value]
    if score is not None:
        if score >= 70:
            return "likely_scam"
        if score >= 35:
            return "caution"
        return "looks_safe"
    return "caution"


def _align_score(verdict: Verdict, score: int | None) -> int:
    low, high = VERDICT_BANDS[verdict]
    if score is None:
        return (low + high) // 2
    return min(max(score, low), high)


def _coerce_int(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        if isinstance(value, float) and not math.isfinite(value):
            return None
        return int(round(value))
    if isinstance(value, str):
        try:
            return int(round(float(value.strip())))
        except ValueError:
            return None
    return None


def _coerce_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"true", "yes", "1"}
    if isinstance(value, (int, float)):
        return value == 1
    return False


def _coerce_text(value: Any, fallback: str, limit: int) -> str:
    if isinstance(value, str):
        cleaned = " ".join(value.split())
        if cleaned:
            return cleaned[:limit]
    return fallback


def _coerce_signals(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    signals: list[str] = []
    for item in value:
        if not isinstance(item, str):
            continue
        cleaned = " ".join(item.split())
        if cleaned:
            signals.append(cleaned[:SIGNAL_LIMIT])
        if len(signals) == MAX_SIGNALS:
            break
    return signals


def _coerce_categories(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    allowed = {category.value for category in RiskCategory}
    categories: list[str] = []
    for item in value:
        if isinstance(item, str):
            candidate = item.strip().lower().replace("-", "_").replace(" ", "_")
            if candidate in allowed and candidate not in categories:
                categories.append(candidate)
    return categories


def _now_ms() -> int:
    return int(time.time() * 1000)
