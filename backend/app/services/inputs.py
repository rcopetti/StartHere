"""Turn raw request input into something the model can read.

Images travel to the model as data URIs. Documents are reduced to text so the
same code path works for every provider, including text-only local models.
"""

from __future__ import annotations

import base64
import zipfile
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.config import Settings
from app.core.errors import ApiError
from app.models.scam_check import InputType
from app.services.guards import redact_sensitive

PREVIEW_CHARS = 120

IMAGE_MIME_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}
TEXT_MIME_TYPES = {
    "text/plain",
    "text/csv",
    "text/markdown",
    "text/html",
    "text/xml",
    "application/json",
    "application/xml",
}
PDF_MIME_TYPES = {"application/pdf"}
DOCX_MIME_TYPES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}
TEXT_EXTENSIONS = {".txt", ".csv", ".md", ".json", ".log", ".xml", ".html"}

_WORD_NAMESPACE = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


@dataclass(frozen=True)
class ImageAttachment:
    data: bytes
    mime_type: str

    @property
    def base64_data(self) -> str:
        return base64.b64encode(self.data).decode("ascii")


@dataclass(frozen=True)
class PreparedInput:
    text: str
    image: ImageAttachment | None
    input_type: InputType
    preview_text: str


def prepare_text(text: str, settings: Settings) -> PreparedInput:
    cleaned = _truncate(text.strip(), settings.max_text_chars)
    if not cleaned:
        raise ApiError(422, "empty_text", "Please paste the message you want checked.")
    return PreparedInput(
        text=cleaned,
        image=None,
        input_type="text",
        preview_text=redact_sensitive(cleaned[:PREVIEW_CHARS]),
    )


def prepare_file(
    filename: str | None,
    declared_mime: str | None,
    data: bytes,
    settings: Settings,
) -> PreparedInput:
    if not data:
        raise ApiError(422, "empty_file", "That file is empty. Please try another one.")

    mime = (declared_mime or "").split(";")[0].strip().lower()
    suffix = Path(filename or "").suffix.lower()

    image_mime = _detect_image_mime(data)
    if image_mime is not None:
        return PreparedInput(
            text="",
            image=ImageAttachment(data=data, mime_type=image_mime),
            input_type="image",
            preview_text="Photo of a message",
        )

    if data.startswith(b"%PDF-") or mime in PDF_MIME_TYPES or suffix == ".pdf":
        text = _extract_pdf_text(data, settings)
        return _prepared_document(text, "file")

    if data.startswith(b"PK\x03\x04") or mime in DOCX_MIME_TYPES or suffix == ".docx":
        text = _extract_docx_text(data, settings)
        return _prepared_document(text, "file")

    if mime in TEXT_MIME_TYPES or suffix in TEXT_EXTENSIONS:
        text = _truncate(data.decode("utf-8", errors="replace").strip(), settings.max_text_chars)
        return _prepared_document(text, "file")

    raise ApiError(
        415,
        "unsupported_file",
        "Please share a photo, a PDF, a Word document, or a text file.",
    )


def merge_inputs(
    text_input: PreparedInput | None,
    file_input: PreparedInput | None,
    settings: Settings,
) -> PreparedInput:
    if text_input is None and file_input is None:
        raise ApiError(
            422,
            "missing_input",
            "Please paste a message or attach a photo or file to check.",
        )
    if text_input is None:
        return file_input  # type: ignore[return-value]
    if file_input is None:
        return text_input

    combined_text = _truncate(
        "\n\n".join(part for part in (text_input.text, file_input.text) if part),
        settings.max_text_chars,
    )
    if file_input.image is not None:
        input_type: InputType = "mixed"
        preview = text_input.preview_text
    else:
        input_type = "file"
        preview = redact_sensitive(combined_text[:PREVIEW_CHARS])

    return PreparedInput(
        text=combined_text,
        image=file_input.image,
        input_type=input_type,
        preview_text=preview,
    )


def _prepared_document(text: str, input_type: InputType) -> PreparedInput:
    cleaned = text.strip()
    if not cleaned:
        raise ApiError(
            422,
            "unreadable_file",
            "We could not read any words from that file. Try a clearer photo or another file.",
        )
    return PreparedInput(
        text=cleaned,
        image=None,
        input_type=input_type,
        preview_text=redact_sensitive(cleaned[:PREVIEW_CHARS]),
    )


def _detect_image_mime(data: bytes) -> str | None:
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def _extract_pdf_text(data: bytes, settings: Settings) -> str:
    try:
        reader = PdfReader(BytesIO(data))
        if reader.is_encrypted:
            reader.decrypt("")
        pages = reader.pages[: settings.max_pdf_pages]
        text = "\n".join(page.extract_text() or "" for page in pages)
    except (
        PdfReadError,
        ValueError,
        KeyError,
        TypeError,
        IndexError,
        AttributeError,
        NotImplementedError,
    ) as exc:
        raise ApiError(
            422,
            "unreadable_file",
            "We could not read that PDF. Try a clearer photo or another file.",
        ) from exc
    return _truncate(text.strip(), settings.max_text_chars)


def _extract_docx_text(data: bytes, settings: Settings) -> str:
    try:
        with zipfile.ZipFile(BytesIO(data)) as archive:
            document = archive.read("word/document.xml")
        root = ElementTree.fromstring(document)
    except (zipfile.BadZipFile, KeyError, ElementTree.ParseError) as exc:
        raise ApiError(
            415,
            "unsupported_file",
            "Please share a photo, a PDF, a Word document, or a text file.",
        ) from exc

    paragraphs = []
    for paragraph in root.iter(f"{_WORD_NAMESPACE}p"):
        words = [node.text or "" for node in paragraph.iter(f"{_WORD_NAMESPACE}t")]
        line = "".join(words).strip()
        if line:
            paragraphs.append(line)
    return _truncate("\n".join(paragraphs), settings.max_text_chars)


def _truncate(text: str, limit: int) -> str:
    return text[:limit]
