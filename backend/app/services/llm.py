"""LiteLLM provider layer.

A single ``LLM_MODEL`` string selects the backend. LiteLLM maps the provider
prefix (``gemini/``, ``bedrock/``, ``ollama/``, ``openai/``, ``azure/`` ...) to
the right transport and reads that provider's usual environment variables.
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Protocol

from app.config import Settings
from app.prompts.scam_check import REPAIR_INSTRUCTION

logger = logging.getLogger(__name__)

_FENCE_PATTERN = re.compile(r"^```[a-zA-Z0-9_-]*\s*|\s*```$")


class LlmError(RuntimeError):
    """The provider could not be reached or refused the request."""


class LlmOutputError(LlmError):
    """The provider replied, but not with a JSON object we can use."""


@dataclass(frozen=True)
class JsonCompletion:
    data: dict[str, Any]
    model: str
    used_fallback: bool


class LlmClient(Protocol):
    async def complete_json(self, messages: list[dict[str, Any]]) -> JsonCompletion: ...


def extract_json_object(raw: str) -> dict[str, Any] | None:
    """Pull a JSON object out of a model reply, tolerating code fences and prose."""
    if not raw:
        return None

    text = _FENCE_PATTERN.sub("", raw.strip())
    candidates = [text]

    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end > start:
        candidates.append(text[start : end + 1])

    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
        except (json.JSONDecodeError, ValueError):
            continue
        if isinstance(parsed, dict):
            return parsed
    return None


class LiteLlmClient:
    def __init__(self, settings: Settings) -> None:
        import litellm

        litellm.suppress_debug_info = True
        litellm.telemetry = False
        litellm.turn_off_message_logging = True
        self._litellm = litellm
        self._settings = settings

    @property
    def model(self) -> str:
        return self._settings.resolved_model

    async def complete_json(self, messages: list[dict[str, Any]]) -> JsonCompletion:
        conversation = list(messages)
        attempts = self._settings.llm_max_repair_attempts + 1

        for attempt in range(attempts):
            text, model, used_fallback = await self._complete_with_fallbacks(conversation)
            data = extract_json_object(text)
            if data is not None:
                return JsonCompletion(data=data, model=model, used_fallback=used_fallback)

            logger.warning(
                "model returned unparseable JSON model=%s attempt=%d chars=%d",
                model,
                attempt + 1,
                len(text),
            )
            conversation = [
                *conversation,
                {"role": "assistant", "content": text},
                {"role": "user", "content": REPAIR_INSTRUCTION},
            ]

        raise LlmOutputError("The model did not return a usable JSON object.")

    async def _complete_with_fallbacks(
        self, messages: list[dict[str, Any]]
    ) -> tuple[str, str, bool]:
        models = [self._settings.resolved_model, *self._settings.resolved_fallback_models]
        last_error: Exception | None = None

        for index, model in enumerate(models):
            try:
                return await self._call(model, messages), model, index > 0
            except Exception as exc:  # noqa: BLE001 - provider errors vary widely
                last_error = exc
                # Log the error class only: provider messages can echo prompt text.
                logger.warning("LLM call failed model=%s error=%s", model, type(exc).__name__)

        raise LlmError("Every configured model failed.") from last_error

    async def _call(self, model: str, messages: list[dict[str, Any]]) -> str:
        settings = self._settings
        kwargs: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": settings.llm_temperature,
            "max_tokens": settings.llm_max_tokens,
            "timeout": settings.llm_timeout_seconds,
            "num_retries": settings.llm_num_retries,
            "drop_params": True,
            "response_format": {"type": "json_object"},
        }
        if settings.llm_api_key is not None:
            kwargs["api_key"] = settings.llm_api_key.get_secret_value()
        if settings.llm_api_base:
            kwargs["api_base"] = settings.llm_api_base

        response = await self._litellm.acompletion(**kwargs)
        message = response.choices[0].message
        content = message.content

        if isinstance(content, list):
            content = "".join(
                part.get("text", "")
                for part in content
                if isinstance(part, dict) and part.get("type") in {"text", None}
            )

        if not isinstance(content, str) or not content.strip():
            raise LlmError("The model returned an empty reply.")

        return content
