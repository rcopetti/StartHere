"""Scam-check endpoints.

``POST /scam-check``      multipart: ``text``, ``channel``, optional ``file``
``POST /scam-check/text`` JSON: ``{"text": "...", "channel": "sms"}``
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile

from app.api.deps import enforce_rate_limit, get_scam_check_service
from app.config import Settings
from app.core.errors import ApiError
from app.models.scam_check import (
    Channel,
    ScamCheckRequest,
    ScamCheckResponse,
)
from app.services.auth import AuthenticatedUser
from app.services.inputs import merge_inputs, prepare_file, prepare_text

router = APIRouter(prefix="/scam-check", tags=["scam-check"])


@router.post("", response_model=ScamCheckResponse, response_model_by_alias=True)
async def check_message(
    request: Request,
    user: Annotated[AuthenticatedUser, Depends(enforce_rate_limit)],
    text: Annotated[str | None, Form()] = None,
    channel: Annotated[Channel, Form()] = "unknown",
    file: Annotated[UploadFile | None, File()] = None,
) -> ScamCheckResponse:
    settings: Settings = request.app.state.settings

    text_input = prepare_text(text, settings) if text and text.strip() else None
    file_input = None
    if file is not None:
        data = await _read_upload(file, settings)
        file_input = prepare_file(file.filename, file.content_type, data, settings)

    prepared = merge_inputs(text_input, file_input, settings)
    result = await get_scam_check_service(request).check(prepared, channel)
    return ScamCheckResponse(result=result)


@router.post("/text", response_model=ScamCheckResponse, response_model_by_alias=True)
async def check_text(
    payload: ScamCheckRequest,
    request: Request,
    user: Annotated[AuthenticatedUser, Depends(enforce_rate_limit)],
) -> ScamCheckResponse:
    settings: Settings = request.app.state.settings
    prepared = prepare_text(payload.text, settings)
    result = await get_scam_check_service(request).check(prepared, payload.channel)
    return ScamCheckResponse(result=result)


async def _read_upload(upload: UploadFile, settings: Settings) -> bytes:
    data = await upload.read(settings.max_file_bytes + 1)
    if len(data) > settings.max_file_bytes:
        raise ApiError(
            413,
            "file_too_large",
            "That file is too large. Please share a smaller photo or file.",
        )
    return data
