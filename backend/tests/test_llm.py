from __future__ import annotations

from typing import Any

import pytest

from app.config import Settings
from app.services.llm import (
    LiteLlmClient,
    LlmError,
    LlmOutputError,
    extract_json_object,
)


class StubMessage:
    def __init__(self, content: Any) -> None:
        self.content = content


class StubChoice:
    def __init__(self, content: Any) -> None:
        self.message = StubMessage(content)


class StubResponse:
    def __init__(self, content: Any) -> None:
        self.choices = [StubChoice(content)]


class StubLitellm:
    def __init__(self, responses: dict[str, list[Any]]) -> None:
        self.responses = responses
        self.calls: list[dict[str, Any]] = []

    async def acompletion(self, **kwargs: Any) -> StubResponse:
        self.calls.append(kwargs)
        queue = self.responses[kwargs["model"]]
        result = queue.pop(0)
        if isinstance(result, Exception):
            raise result
        return StubResponse(result)


def make_client(
    responses: dict[str, list[Any]], **overrides: Any
) -> tuple[LiteLlmClient, StubLitellm]:
    settings = Settings(
        _env_file=None,
        llm_model="primary/model",
        llm_fallback_models="backup/model",
        llm_max_repair_attempts=1,
        **overrides,
    )
    client = LiteLlmClient.__new__(LiteLlmClient)
    client._settings = settings  # type: ignore[attr-defined]
    stub = StubLitellm(responses)
    client._litellm = stub  # type: ignore[attr-defined]
    return client, stub


def test_extract_json_handles_fences_and_prose() -> None:
    assert extract_json_object('```json\n{"verdict": "caution"}\n```') == {"verdict": "caution"}
    assert extract_json_object('Here you go: {"verdict": "caution"} thanks') == {
        "verdict": "caution"
    }
    assert extract_json_object("not json at all") is None
    assert extract_json_object("[1, 2, 3]") is None


async def test_complete_json_parses_a_plain_object() -> None:
    client, stub = make_client({"primary/model": ['{"verdict": "looks_safe"}']})

    completion = await client.complete_json([{"role": "user", "content": "hi"}])

    assert completion.data == {"verdict": "looks_safe"}
    assert completion.model == "primary/model"
    assert completion.used_fallback is False
    assert stub.calls[0]["temperature"] == 0.1
    assert stub.calls[0]["drop_params"] is True


async def test_complete_json_repairs_once() -> None:
    client, stub = make_client(
        {"primary/model": ["sorry, no json", '{"verdict": "caution"}']}
    )

    completion = await client.complete_json([{"role": "user", "content": "hi"}])

    assert completion.data == {"verdict": "caution"}
    assert len(stub.calls) == 2
    repair_messages = stub.calls[1]["messages"]
    assert repair_messages[-1]["content"].startswith("Your previous reply")


async def test_complete_json_fails_closed_after_repair() -> None:
    client, stub = make_client({"primary/model": ["nope", "still nope"]})

    with pytest.raises(LlmOutputError):
        await client.complete_json([{"role": "user", "content": "hi"}])

    assert len(stub.calls) == 2


async def test_fallback_model_is_used_when_primary_fails() -> None:
    client, _ = make_client(
        {
            "primary/model": [RuntimeError("provider down")],
            "backup/model": ['{"verdict": "caution"}'],
        }
    )

    completion = await client.complete_json([{"role": "user", "content": "hi"}])

    assert completion.model == "backup/model"
    assert completion.used_fallback is True


async def test_all_models_failing_raises_llm_error() -> None:
    client, _ = make_client(
        {
            "primary/model": [RuntimeError("down")],
            "backup/model": [RuntimeError("also down")],
        }
    )

    with pytest.raises(LlmError):
        await client.complete_json([{"role": "user", "content": "hi"}])


async def test_empty_reply_is_an_error() -> None:
    client, _ = make_client(
        {
            "primary/model": [None],
            "backup/model": [None],
        }
    )

    with pytest.raises(LlmError):
        await client.complete_json([{"role": "user", "content": "hi"}])


async def test_structured_content_parts_are_joined() -> None:
    client, _ = make_client(
        {
            "primary/model": [
                [{"type": "text", "text": '{"verdict":'}, {"type": "text", "text": ' "caution"}'}]
            ]
        }
    )

    completion = await client.complete_json([{"role": "user", "content": "hi"}])

    assert completion.data == {"verdict": "caution"}
