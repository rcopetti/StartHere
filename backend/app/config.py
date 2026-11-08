"""Environment-driven configuration.

Every provider knob is read from the environment so the same image can run
against Gemini, Bedrock, Ollama, or any other LiteLLM-supported backend.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "test", "production"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "StartHere API"
    app_version: str = "0.1.0"
    environment: Environment = "development"
    log_level: str = "INFO"
    api_prefix: str = "/api/v1"
    cors_allow_origins: str = "http://localhost:3000,http://localhost:4173"

    # LiteLLM model identifier, e.g. "gemini/gemini-2.5-flash",
    # "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0", or "ollama/llama3.2".
    llm_model: str = "gemini/gemini-2.5-flash"
    # Optional provider prefix. When set, a model without a prefix gets one,
    # e.g. LLM_PROVIDER=bedrock + LLM_MODEL=anthropic.claude-3-5-sonnet...
    llm_provider: str | None = None
    # Comma-separated models tried in order when the primary call fails.
    llm_fallback_models: str = ""
    llm_api_key: SecretStr | None = None
    llm_api_base: str | None = None
    llm_timeout_seconds: float = 20.0
    llm_temperature: float = 0.1
    # Reasoning-capable local models spend tokens before the JSON reply; 1200
    # leaves room for both. Raise it further for verbose models.
    llm_max_tokens: int = 1200
    llm_num_retries: int = 0
    # Extra calls allowed when the model replies with unparseable JSON.
    llm_max_repair_attempts: int = 1

    firebase_project_id: str | None = None
    firebase_credentials_json: SecretStr | None = None
    firebase_credentials_path: str | None = None
    firebase_auth_emulator_host: str | None = None

    max_text_chars: int = 20_000
    max_file_bytes: int = 10 * 1024 * 1024
    max_pdf_pages: int = 20
    rate_limit_per_hour: int = 60

    @field_validator(
        "llm_provider",
        "llm_api_key",
        "llm_api_base",
        "firebase_project_id",
        "firebase_credentials_path",
        "firebase_credentials_json",
        "firebase_auth_emulator_host",
        mode="before",
    )
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        """Treat empty env values as unset so provider defaults still apply."""
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("llm_timeout_seconds")
    @classmethod
    def _positive_timeout(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("LLM_TIMEOUT_SECONDS must be greater than zero")
        return value

    @field_validator("llm_temperature")
    @classmethod
    def _valid_temperature(cls, value: float) -> float:
        if not 0 <= value <= 2:
            raise ValueError("LLM_TEMPERATURE must be between 0 and 2")
        return value

    @field_validator("max_text_chars", "max_file_bytes", "max_pdf_pages")
    @classmethod
    def _positive_limits(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("limits must be greater than zero")
        return value

    @field_validator("rate_limit_per_hour")
    @classmethod
    def _non_negative_rate_limit(cls, value: int) -> int:
        if value < 0:
            raise ValueError("RATE_LIMIT_PER_HOUR must be zero or greater")
        return value

    @property
    def fallback_models(self) -> list[str]:
        return [model.strip() for model in self.llm_fallback_models.split(",") if model.strip()]

    @property
    def resolved_model(self) -> str:
        return self._with_provider(self.llm_model)

    @property
    def resolved_fallback_models(self) -> list[str]:
        return [self._with_provider(model) for model in self.fallback_models]

    def _with_provider(self, model: str) -> str:
        if self.llm_provider and "/" not in model:
            return f"{self.llm_provider}/{model}"
        return model

    @property
    def cors_origins(self) -> list[str]:
        origins = [
            origin.strip() for origin in self.cors_allow_origins.split(",") if origin.strip()
        ]
        return origins or ["*"]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
