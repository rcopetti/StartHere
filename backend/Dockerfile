# syntax=docker/dockerfile:1

# ── Builder: resolve dependencies into a self-contained virtualenv ──────────
FROM python:3.12-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Project metadata first so dependency layers cache independently of source.
COPY pyproject.toml README.md ./
COPY app ./app
RUN pip install --upgrade pip && pip install .

# ── Runtime: slim image with only the virtualenv and application code ───────
FROM python:3.12-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH"

RUN groupadd --system app && useradd --system --gid app --create-home app

COPY --from=builder /opt/venv /opt/venv

WORKDIR /app
COPY --chown=app:app app ./app

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/healthz', timeout=4)"

# Configuration comes from the environment (see .env.example); the image is
# stateless and never bakes secrets in. Set ENVIRONMENT=production to disable
# the interactive /docs routes.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
