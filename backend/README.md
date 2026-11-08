# StartHere API

FastAPI backend for **Check a suspicious message**. It accepts typed text, a
photo, or a document, sends it through one configured language model, and
returns a calm, plain-language verdict for the senior client.

- **One endpoint, three inputs**: text, image, and PDF/DOCX/TXT files.
- **One model setting**: LiteLLM selects Gemini, Bedrock, Ollama, OpenAI, Azure,
  or any other supported provider from `LLM_MODEL`.
- **Firebase sign-in required**: every request carries a Firebase ID token.
- **Fail closed**: a timeout, provider error, or unreadable model reply returns
  `503 check_unavailable` instead of an unverified verdict.
- **Stateless**: no message content is stored or logged.

---

## Quick start

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
cp .env.example .env          # then fill in the values you need
.venv/bin/uvicorn app.main:app --reload --port 8080
```

Interactive docs: <http://localhost:8080/docs> (development only).

---

## Choosing a model

`LLM_MODEL` is a [LiteLLM model string](https://docs.litellm.ai/docs/providers).
The provider prefix picks the transport; each provider reads its usual
environment variables, so switching backends needs no code change.

| Provider | `LLM_MODEL` | Credentials |
|---|---|---|
| Google Gemini | `gemini/gemini-2.5-flash` | `GEMINI_API_KEY` |
| AWS Bedrock | `bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0` | `AWS_REGION_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (or an instance role) |
| Ollama (local) | `ollama/llama3.2` | none; set `LLM_API_BASE=http://localhost:11434` if it is not the default |
| OpenAI | `openai/gpt-4o-mini` | `OPENAI_API_KEY` |
| Azure OpenAI | `azure/<deployment-name>` | `AZURE_API_KEY`, `AZURE_API_BASE`, `AZURE_API_VERSION` |

If your provider needs a key that LiteLLM does not read automatically, set
`LLM_API_KEY` and `LLM_API_BASE` instead.

`LLM_PROVIDER` is optional. Set it when you prefer to keep the provider out of
the model name: `LLM_PROVIDER=bedrock` with
`LLM_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0` resolves to
`bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0`. A model that already has a
prefix always wins.

`LLM_FALLBACK_MODELS` is a comma-separated list tried in order when the primary
model errors. The response reports `usedFallback: true` when one is used.

### Bedrock example

```bash
LLM_MODEL="bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0"
AWS_REGION_NAME="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

### Ollama example

```bash
ollama pull llama3.2
LLM_MODEL="ollama/llama3.2"
LLM_API_BASE="http://localhost:11434"
LLM_TIMEOUT_SECONDS=60
```

Local models are slower and less accurate. Keep `LLM_TIMEOUT_SECONDS` generous
and use a vision-capable model if you need photo checks.

---

## Firebase authentication

Every `/api/v1/scam-check*` request needs `Authorization: Bearer <Firebase ID token>`.
The server validates signature, issuer, audience, and expiry with the Firebase
Admin SDK.

Pick one credential source:

| Variable | Use |
|---|---|
| `FIREBASE_CREDENTIALS_PATH` | Path to a service-account JSON file |
| `FIREBASE_CREDENTIALS_JSON` | The service-account JSON itself (for secret managers) |
| `FIREBASE_AUTH_EMULATOR_HOST` | Local Auth emulator, e.g. `127.0.0.1:9099` |

`FIREBASE_PROJECT_ID` is required when the service account does not imply it.
Without any of these, check requests return `503 auth_unavailable`.

---

## Endpoints

### `POST /api/v1/scam-check` (multipart)

| Field | Type | Notes |
|---|---|---|
| `text` | string | Optional if `file` is present |
| `file` | file | PNG, JPEG, WebP, GIF, PDF, DOCX, TXT, CSV, MD, JSON |
| `channel` | string | `sms`, `email`, `link`, `call`, `photo`, `file`, `unknown` |

```bash
curl -X POST http://localhost:8080/api/v1/scam-check \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -F "text=USPS: your package is on hold. Pay $1.99 now." \
  -F "channel=sms"

curl -X POST http://localhost:8080/api/v1/scam-check \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -F "channel=photo" \
  -F "file=@screenshot.png"
```

### `POST /api/v1/scam-check/text` (JSON)

```bash
curl -X POST http://localhost:8080/api/v1/scam-check/text \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "We locked your account. Reply with the 6-digit code.", "channel": "sms"}'
```

### `GET /healthz`

Unauthenticated. Reports the configured model so deployments can be verified
without exposing credentials.

---

## Response

```json
{
  "ok": true,
  "result": {
    "id": "chk_9f1c...",
    "verdict": "likely_scam",
    "headline": "Fake delivery fee",
    "explanation": "This asks for a small fee to release a package. Real post offices do not ask this way.",
    "action": "Do not tap the link. Delete this message.",
    "signals": ["Small fee demand", "Link to pay"],
    "riskScore": 88,
    "stopScreenRequired": true,
    "riskCategories": ["delivery_fee", "money_transfer"],
    "inputType": "text",
    "previewText": "USPS: your package is on hold...",
    "createdAt": 1762560000000,
    "model": "gemini/gemini-2.5-flash",
    "usedFallback": false
  }
}
```

- `verdict` is one of `likely_scam`, `caution`, `looks_safe`.
- `riskScore` is always inside its verdict band: 70-100, 35-69, 0-34.
- `stopScreenRequired` is true for scams or cautions involving money, gift
  cards, cryptocurrency, bank details, or verification codes. The client should
  show the full-screen Stop Screen.
- `previewText` is redacted before it leaves the service.

Errors use one envelope:

```json
{"ok": false, "error": {"code": "check_unavailable", "message": "We could not check this right now. Please try again in a moment."}}
```

| Status | `code` | Meaning |
|---|---|---|
| 401 | `missing_token` / `invalid_token` | Sign in again |
| 413 | `file_too_large` | Over `MAX_FILE_BYTES` |
| 415 | `unsupported_file` | File type not supported |
| 422 | `empty_text`, `missing_input`, `unreadable_file` | Nothing usable was sent |
| 429 | `rate_limited` | Over `RATE_LIMIT_PER_HOUR` for this user |
| 503 | `check_unavailable` | Model failed or returned unusable JSON |
| 503 | `auth_unavailable` | Firebase credentials missing on the server |

---

## Safety behavior

- **Sensitive-data guard** runs before any model call. Card numbers, SSNs, and
  passwords short-circuit to a high-risk verdict and are never sent to a
  provider. `previewText` and all model output are redacted.
- **Untrusted envelope** wraps the message and the system prompt tells the model
  to ignore instructions inside it.
- **Fail closed**: unparseable JSON gets one repair attempt, then `503`.
- **Logging privacy**: logs contain ids, verdicts, timings, and model names —
  never message text, file text, or screenshots.

---

## Configuration reference

| Variable | Default | Purpose |
|---|---|---|
| `LLM_MODEL` | `gemini/gemini-2.5-flash` | Primary LiteLLM model |
| `LLM_PROVIDER` | empty | Optional prefix for models written without one |
| `LLM_FALLBACK_MODELS` | empty | Comma-separated fallbacks |
| `LLM_API_KEY` / `LLM_API_BASE` | empty | Overrides for providers that need them |
| `LLM_TIMEOUT_SECONDS` | `20` | Per-call timeout |
| `LLM_TEMPERATURE` | `0.1` | Deterministic verdicts |
| `LLM_MAX_TOKENS` | `700` | Reply budget |
| `LLM_NUM_RETRIES` | `0` | Provider-level retries |
| `LLM_MAX_REPAIR_ATTEMPTS` | `1` | Extra calls when JSON is malformed |
| `MAX_TEXT_CHARS` | `20000` | Truncation limit |
| `MAX_FILE_BYTES` | `10485760` | Upload limit (10 MB) |
| `MAX_PDF_PAGES` | `20` | Pages read from a PDF |
| `RATE_LIMIT_PER_HOUR` | `60` | Per-user limit; `0` disables |
| `CORS_ALLOW_ORIGINS` | `http://localhost:3000,http://localhost:4173` | Allowed web origins |
| `ENVIRONMENT` | `development` | `production` disables `/docs` |
| `LOG_LEVEL` | `INFO` | Log verbosity |

---

## Tests

```bash
.venv/bin/pytest
.venv/bin/ruff check .
```

The suite covers token rejection, verdict normalization, fail-closed behavior,
sensitive-data short-circuiting, image/PDF/DOCX handling, upload limits, and
rate limiting. No network calls are made.

---

## Notes

- Rate limiting is per process. Use a shared store before running multiple
  replicas.
- Images are passed to the model directly; there is no separate OCR step, so
  use a vision-capable model for photo checks.
- Scanned PDFs without a text layer return `422 unreadable_file`. A photo of
  the page works better.
