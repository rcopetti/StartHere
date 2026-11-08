"""Request dependencies: authentication and rate limiting."""

from __future__ import annotations

from typing import Annotated

import anyio.to_thread
from fastapi import Depends, Header, Request

from app.config import Settings
from app.core.errors import ApiError, AuthNotConfiguredError, InvalidTokenError
from app.core.rate_limit import InMemoryRateLimiter
from app.services.auth import AuthenticatedUser, FirebaseTokenVerifier
from app.services.scam_check import ScamCheckService


def get_settings_from_app(request: Request) -> Settings:
    return request.app.state.settings


def get_verifier(request: Request) -> FirebaseTokenVerifier:
    return request.app.state.token_verifier


def get_rate_limiter(request: Request) -> InMemoryRateLimiter:
    return request.app.state.rate_limiter


def get_scam_check_service(request: Request) -> ScamCheckService:
    return request.app.state.scam_check_service


async def require_user(
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
) -> AuthenticatedUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise ApiError(
            401,
            "missing_token",
            "Sign in is required to check a message.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise ApiError(
            401,
            "missing_token",
            "Sign in is required to check a message.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    verifier = get_verifier(request)
    try:
        # Token verification may fetch Google's signing certificates on first use.
        return await anyio.to_thread.run_sync(verifier.verify, token)
    except InvalidTokenError as exc:
        raise ApiError(
            401,
            "invalid_token",
            "Your sign-in has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except AuthNotConfiguredError as exc:
        raise ApiError(
            503,
            "auth_unavailable",
            "Sign-in is not available right now. Please try again later.",
        ) from exc


async def enforce_rate_limit(
    request: Request,
    user: Annotated[AuthenticatedUser, Depends(require_user)],
) -> AuthenticatedUser:
    settings = get_settings_from_app(request)
    limiter = get_rate_limiter(request)
    allowed, retry_after = limiter.hit(user.uid, settings.rate_limit_per_hour)
    if not allowed:
        raise ApiError(
            429,
            "rate_limited",
            "You have checked a lot of messages in the last hour. Please try again soon.",
            headers={"Retry-After": str(retry_after)},
        )
    return user
