"""Firebase ID-token verification without Admin SDK credentials.

The token is verified against Google's Firebase JWKS: RS256 signature,
audience, issuer, expiry, and subject. Revocation is not checked, matching the
previous ``check_revoked=False`` behavior.

The Auth emulator issues unsigned tokens, so that branch is enabled only when
``FIREBASE_AUTH_EMULATOR_HOST`` is set.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from threading import RLock
from typing import Any

import jwt
from jwt import PyJWKClient
from jwt.exceptions import PyJWKClientConnectionError

from app.config import Settings
from app.core.errors import AuthNotConfiguredError, InvalidTokenError

logger = logging.getLogger(__name__)

FIREBASE_JWKS_URL = (
    "https://www.googleapis.com/service_accounts/v1/jwk/"
    "securetoken@system.gserviceaccount.com"
)
FIREBASE_ISSUER = "https://securetoken.google.com/{project_id}"
CLOCK_SKEW_SECONDS = 10
JWKS_LIFESPAN_SECONDS = 300
JWKS_TIMEOUT_SECONDS = 10


@dataclass(frozen=True)
class AuthenticatedUser:
    uid: str
    email: str | None = None
    name: str | None = None


class FirebaseTokenVerifier:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._jwks: PyJWKClient | None = None
        self._lock = RLock()

    def verify(self, token: str) -> AuthenticatedUser:
        project_id = self._settings.firebase_project_id
        if not project_id:
            logger.error(
                "firebase_project_id_missing: set FIREBASE_PROJECT_ID to the same "
                "project the web client signs in with"
            )
            raise AuthNotConfiguredError(
                "FIREBASE_PROJECT_ID is not set, so ID tokens cannot be verified."
            )

        if self._settings.firebase_auth_emulator_host:
            claims = self._verify_emulator_token(token, project_id)
        else:
            claims = self._verify_real_token(token, project_id)

        uid = claims.get("sub") or claims.get("user_id")
        if not uid:
            raise InvalidTokenError("Firebase token has no user id")

        return AuthenticatedUser(
            uid=str(uid),
            email=claims.get("email"),
            name=claims.get("name"),
        )

    def _verify_real_token(self, token: str, project_id: str) -> dict[str, Any]:
        try:
            with self._lock:
                signing_key = self._jwks_client().get_signing_key_from_jwt(token)
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=project_id,
                issuer=FIREBASE_ISSUER.format(project_id=project_id),
                leeway=CLOCK_SKEW_SECONDS,
                options={"require": ["exp", "iat", "aud", "iss", "sub"]},
            )
        except PyJWKClientConnectionError as exc:
            logger.error(
                "firebase_jwks_unreachable type=%s reason=%s",
                type(exc).__name__,
                _safe_reason(exc),
            )
            raise AuthNotConfiguredError(
                "Could not reach Google's Firebase signing keys."
            ) from exc
        except Exception as exc:  # noqa: BLE001 - PyJWT raises many error types
            logger.warning(
                "firebase_token_rejected type=%s reason=%s",
                type(exc).__name__,
                _safe_reason(exc),
            )
            raise InvalidTokenError("Firebase rejected the ID token") from exc

        _check_auth_time(claims)
        return claims

    def _verify_emulator_token(self, token: str, project_id: str) -> dict[str, Any]:
        try:
            claims = jwt.decode(
                token,
                options={
                    "verify_signature": False,
                    "verify_aud": False,
                    "verify_exp": False,
                },
            )
        except Exception as exc:  # noqa: BLE001
            raise InvalidTokenError("The emulator token is not a valid JWT") from exc

        audience = claims.get("aud")
        issuer = claims.get("iss")
        if audience and audience != project_id:
            raise InvalidTokenError("Emulator token audience mismatch")
        if issuer and issuer != FIREBASE_ISSUER.format(project_id=project_id):
            raise InvalidTokenError("Emulator token issuer mismatch")

        expires_at = claims.get("exp")
        if isinstance(expires_at, (int, float)) and expires_at < time.time() - CLOCK_SKEW_SECONDS:
            raise InvalidTokenError("Emulator token has expired")

        return claims

    def _jwks_client(self) -> PyJWKClient:
        with self._lock:
            if self._jwks is None:
                self._jwks = PyJWKClient(
                    FIREBASE_JWKS_URL,
                    cache_keys=True,
                    lifespan=JWKS_LIFESPAN_SECONDS,
                    timeout=JWKS_TIMEOUT_SECONDS,
                )
            return self._jwks


def _check_auth_time(claims: dict[str, Any]) -> None:
    auth_time = claims.get("auth_time")
    if auth_time is None:
        raise InvalidTokenError("Firebase token has no auth_time")
    if not isinstance(auth_time, (int, float)) or auth_time > time.time() + CLOCK_SKEW_SECONDS:
        raise InvalidTokenError("Firebase token has an invalid auth_time")


def _safe_reason(exc: Exception) -> str:
    """A short rejection reason. PyJWT never puts the token in its message."""
    return " ".join(str(exc).split())[:300]
