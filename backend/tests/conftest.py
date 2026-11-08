from __future__ import annotations

from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.api.deps import require_user
from app.config import Settings
from app.main import create_app
from app.services.auth import AuthenticatedUser
from app.services.llm import JsonCompletion

# LiteLLM calls load_dotenv() on import, so backend/.env leaks into os.environ.
# Clear these before each test so settings assertions are deterministic.
_SETTINGS_ENV_VARS = (
    "APP_NAME",
    "APP_VERSION",
    "API_PREFIX",
    "ENVIRONMENT",
    "LOG_LEVEL",
    "CORS_ALLOW_ORIGINS",
    "LLM_MODEL",
    "LLM_PROVIDER",
    "LLM_FALLBACK_MODELS",
    "LLM_API_KEY",
    "LLM_API_BASE",
    "LLM_TIMEOUT_SECONDS",
    "LLM_TEMPERATURE",
    "LLM_MAX_TOKENS",
    "LLM_NUM_RETRIES",
    "LLM_MAX_REPAIR_ATTEMPTS",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_AUTH_EMULATOR_HOST",
    "MAX_TEXT_CHARS",
    "MAX_FILE_BYTES",
    "MAX_PDF_PAGES",
    "RATE_LIMIT_PER_HOUR",
)


@pytest.fixture(autouse=True)
def clean_settings_env(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in _SETTINGS_ENV_VARS:
        monkeypatch.delenv(name, raising=False)


class FakeVerifier:
    def __init__(self, user: AuthenticatedUser | None = None, error: Exception | None = None):
        self.user = user or AuthenticatedUser(uid="user-1", email="dorothy@example.com")
        self.error = error

    def verify(self, token: str) -> AuthenticatedUser:
        if self.error is not None:
            raise self.error
        return self.user


class FakeLlm:
    def __init__(
        self,
        data: dict[str, Any] | None = None,
        error: Exception | None = None,
        model: str = "fake/model",
        used_fallback: bool = False,
    ) -> None:
        self.data = data
        self.error = error
        self.model = model
        self.used_fallback = used_fallback
        self.calls: list[list[dict[str, Any]]] = []

    async def complete_json(self, messages: list[dict[str, Any]]) -> JsonCompletion:
        self.calls.append(messages)
        if self.error is not None:
            raise self.error
        return JsonCompletion(
            data=self.data or {}, model=self.model, used_fallback=self.used_fallback
        )


@pytest.fixture
def settings() -> Settings:
    return Settings(
        _env_file=None,
        environment="test",
        llm_model="fake/model",
        llm_api_key=None,
        rate_limit_per_hour=60,
        max_file_bytes=1024,
        firebase_project_id="starthere-test",
    )


@pytest.fixture
def fake_llm() -> FakeLlm:
    return FakeLlm(
        data={
            "verdict": "likely_scam",
            "headline": "Fake delivery fee",
            "explanation": (
                "This asks for a small fee to release a package. "
                "Real post offices do not ask this way."
            ),
            "action": "Do not tap the link. Delete this message.",
            "signals": ["Small fee demand", "Link to pay"],
            "riskScore": 88,
            "riskCategories": ["delivery_fee", "money_transfer"],
            "stopScreenRequired": True,
        }
    )


@pytest.fixture
def app(settings: Settings, fake_llm: FakeLlm):
    application = create_app(settings, llm_client=fake_llm)
    application.state.token_verifier = FakeVerifier()
    application.dependency_overrides[require_user] = lambda: AuthenticatedUser(uid="user-1")
    return application


@pytest.fixture
def client(app) -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_client(settings: Settings, fake_llm: FakeLlm) -> TestClient:
    """Client without the auth override, for exercising token verification."""
    application = create_app(settings, llm_client=fake_llm)
    application.state.token_verifier = FakeVerifier()
    with TestClient(application) as test_client:
        yield test_client
