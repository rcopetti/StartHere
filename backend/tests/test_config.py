from __future__ import annotations

from app.config import Settings


def test_provider_prefix_is_added_when_missing() -> None:
    settings = Settings(
        _env_file=None,
        llm_provider="bedrock",
        llm_model="anthropic.claude-3-5-sonnet-20241022-v2:0",
    )

    assert settings.resolved_model == (
        "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0"
    )


def test_explicit_model_prefix_wins() -> None:
    settings = Settings(_env_file=None, llm_provider="gemini", llm_model="ollama/llama3.2")

    assert settings.resolved_model == "ollama/llama3.2"


def test_fallbacks_receive_the_provider_prefix() -> None:
    settings = Settings(
        _env_file=None,
        llm_provider="ollama",
        llm_model="llama3.2",
        llm_fallback_models="llama3.1, ollama/qwen2.5",
    )

    assert settings.resolved_model == "ollama/llama3.2"
    assert settings.resolved_fallback_models == ["ollama/llama3.1", "ollama/qwen2.5"]


def test_cloudflare_models_receive_the_provider_prefix() -> None:
    settings = Settings(
        _env_file=None,
        llm_provider="cloudflare",
        llm_model="@cf/meta/llama-3.1-8b-instruct",
        llm_fallback_models="@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    )

    assert settings.resolved_model == "cloudflare/@cf/meta/llama-3.1-8b-instruct"
    assert settings.resolved_fallback_models == [
        "cloudflare/@cf/meta/llama-3.3-70b-instruct-fp8-fast"
    ]


def test_blank_environment_values_are_treated_as_unset(monkeypatch) -> None:
    monkeypatch.setenv("LLM_API_KEY", "")
    monkeypatch.setenv("LLM_API_BASE", "")
    monkeypatch.setenv("LLM_PROVIDER", "")
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "")

    settings = Settings(_env_file=None)

    assert settings.llm_api_key is None
    assert settings.llm_api_base is None
    assert settings.llm_provider is None
    assert settings.firebase_project_id is None
    assert settings.resolved_model == "gemini/gemini-2.5-flash"


def test_cors_origins_are_split_and_trimmed() -> None:
    settings = Settings(
        _env_file=None,
        cors_allow_origins="http://localhost:3000, https://app.example.com ",
    )

    assert settings.cors_origins == ["http://localhost:3000", "https://app.example.com"]
