"""Firebase ID-token verification.

Every request must carry a Firebase ID token. The Admin SDK validates the
signature, issuer, audience, and expiry. In local development, point
``FIREBASE_AUTH_EMULATOR_HOST`` at the Auth emulator.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass

from app.config import Settings
from app.core.errors import AuthNotConfiguredError, InvalidTokenError

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AuthenticatedUser:
    uid: str
    email: str | None = None
    name: str | None = None


class FirebaseTokenVerifier:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._initialized = False

    def verify(self, token: str) -> AuthenticatedUser:
        try:
            from firebase_admin import auth
        except ImportError as exc:  # pragma: no cover - dependency is declared
            raise AuthNotConfiguredError("firebase-admin is not installed") from exc

        self._ensure_initialized()

        try:
            claims = auth.verify_id_token(token, check_revoked=False)
        except Exception as exc:  # noqa: BLE001 - the SDK raises many error types
            raise InvalidTokenError("Firebase rejected the ID token") from exc

        uid = claims.get("uid") or claims.get("sub")
        if not uid:
            raise InvalidTokenError("Firebase token has no user id")

        return AuthenticatedUser(
            uid=str(uid),
            email=claims.get("email"),
            name=claims.get("name"),
        )

    def _ensure_initialized(self) -> None:
        if self._initialized:
            return

        import firebase_admin
        from firebase_admin import credentials

        settings = self._settings

        if settings.firebase_auth_emulator_host:
            os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = settings.firebase_auth_emulator_host

        try:
            firebase_admin.get_app()
        except ValueError:
            pass
        else:  # pragma: no cover - single init in practice
            self._initialized = True
            return

        credential = None
        if settings.firebase_credentials_json is not None:
            credential = credentials.Certificate(
                json.loads(settings.firebase_credentials_json.get_secret_value())
            )
        elif settings.firebase_credentials_path:
            credential = credentials.Certificate(settings.firebase_credentials_path)
        elif not settings.firebase_auth_emulator_host:
            try:
                credential = credentials.ApplicationDefault()
            except Exception as exc:  # noqa: BLE001
                raise AuthNotConfiguredError(
                    "No Firebase credentials found. Set FIREBASE_CREDENTIALS_PATH, "
                    "FIREBASE_CREDENTIALS_JSON, or FIREBASE_AUTH_EMULATOR_HOST."
                ) from exc

        options = (
            {"projectId": settings.firebase_project_id}
            if settings.firebase_project_id
            else None
        )

        try:
            firebase_admin.initialize_app(credential, options)
        except ValueError:
            # Another worker initialized the default app first.
            pass

        self._initialized = True
        logger.info(
            "firebase_auth_initialized emulator=%s",
            bool(settings.firebase_auth_emulator_host),
        )
