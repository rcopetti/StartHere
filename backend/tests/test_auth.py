from __future__ import annotations

import base64
import json
import time
from types import SimpleNamespace

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.testclient import TestClient
from jwt.exceptions import PyJWKClientConnectionError

from app.config import Settings
from app.core.errors import AuthNotConfiguredError, InvalidTokenError
from app.services.auth import FirebaseTokenVerifier
from tests.conftest import FakeVerifier

CHECK_URL = "/api/v1/scam-check/text"
BODY = {"text": "Your package is on hold. Pay $1.99 now."}

PROJECT_ID = "starthere-test"
ISSUER = f"https://securetoken.google.com/{PROJECT_ID}"


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


def _key():
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


def _claims(**overrides) -> dict:
    now = int(time.time())
    claims = {
        "iss": ISSUER,
        "aud": PROJECT_ID,
        "auth_time": now,
        "user_id": "user-1",
        "sub": "user-1",
        "iat": now,
        "exp": now + 3600,
        "email": "dorothy@example.com",
        "name": "Dorothy",
        "firebase": {"sign_in_provider": "google.com"},
    }
    claims.update(overrides)
    return claims


def _token(key, **overrides) -> str:
    return jwt.encode(
        _claims(**overrides), key, algorithm="RS256", headers={"kid": "test-key"}
    )


def _unsigned_token(claims: dict) -> str:
    def encode(data: dict) -> str:
        raw = json.dumps(data, separators=(",", ":")).encode()
        return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

    return f"{encode({'alg': 'none', 'typ': 'JWT'})}.{encode(claims)}."


def _verifier(settings: Settings, public_key) -> FirebaseTokenVerifier:
    verifier = FirebaseTokenVerifier(settings)
    verifier._jwks = SimpleNamespace(
        get_signing_key_from_jwt=lambda token: SimpleNamespace(key=public_key)
    )
    return verifier


def test_valid_token_returns_the_user() -> None:
    key = _key()
    verifier = _verifier(
        Settings(_env_file=None, firebase_project_id=PROJECT_ID), key.public_key()
    )

    user = verifier.verify(_token(key))

    assert user.uid == "user-1"
    assert user.email == "dorothy@example.com"
    assert user.name == "Dorothy"


def test_wrong_audience_is_rejected() -> None:
    key = _key()
    verifier = _verifier(
        Settings(_env_file=None, firebase_project_id=PROJECT_ID), key.public_key()
    )

    with pytest.raises(InvalidTokenError):
        verifier.verify(_token(key, aud="another-project"))


def test_expired_token_is_rejected() -> None:
    key = _key()
    now = int(time.time())
    verifier = _verifier(
        Settings(_env_file=None, firebase_project_id=PROJECT_ID), key.public_key()
    )

    with pytest.raises(InvalidTokenError):
        verifier.verify(_token(key, iat=now - 7200, exp=now - 3600))


def test_missing_subject_is_rejected() -> None:
    key = _key()
    verifier = _verifier(
        Settings(_env_file=None, firebase_project_id=PROJECT_ID), key.public_key()
    )

    with pytest.raises(InvalidTokenError):
        verifier.verify(_token(key, sub="", user_id=""))


def test_missing_auth_time_is_rejected() -> None:
    key = _key()
    claims = _claims()
    claims.pop("auth_time")
    verifier = _verifier(
        Settings(_env_file=None, firebase_project_id=PROJECT_ID), key.public_key()
    )

    with pytest.raises(InvalidTokenError):
        verifier.verify(jwt.encode(claims, key, algorithm="RS256"))


def test_missing_project_id_is_a_server_problem_not_a_bad_token() -> None:
    verifier = FirebaseTokenVerifier(Settings(_env_file=None))

    with pytest.raises(AuthNotConfiguredError):
        verifier.verify("any-token")


def test_unreachable_signing_keys_are_a_server_problem() -> None:
    def unreachable(token):
        raise PyJWKClientConnectionError("Could not fetch JWKS")

    verifier = FirebaseTokenVerifier(
        Settings(_env_file=None, firebase_project_id=PROJECT_ID)
    )
    verifier._jwks = SimpleNamespace(get_signing_key_from_jwt=unreachable)

    with pytest.raises(AuthNotConfiguredError):
        verifier.verify("any-token")


def test_emulator_token_is_accepted_without_a_signature() -> None:
    verifier = FirebaseTokenVerifier(
        Settings(
            _env_file=None,
            firebase_project_id=PROJECT_ID,
            firebase_auth_emulator_host="127.0.0.1:9099",
        )
    )

    user = verifier.verify(_unsigned_token(_claims()))

    assert user.uid == "user-1"


def test_emulator_token_with_wrong_audience_is_rejected() -> None:
    verifier = FirebaseTokenVerifier(
        Settings(
            _env_file=None,
            firebase_project_id=PROJECT_ID,
            firebase_auth_emulator_host="127.0.0.1:9099",
        )
    )

    with pytest.raises(InvalidTokenError):
        verifier.verify(_unsigned_token(_claims(aud="another-project")))
