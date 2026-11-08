# StartHere

**Empowering seniors with patient, jargon-free technology coaching and real-time scam protection.**

StartHere is designed specifically for older adults and their family circle. It combines accessible, plain-language technology coaching with an instant Scam Check tool and a family safety alert network.

---

## Run as a Web App

The StartHere client is a **React Native Web** app served by Vite. This repository does not contain a native iOS or Android project; the web client is the runnable app.

### Prerequisites

- **Node.js 24.12.0 or newer** (required by the resolved Firebase packages)
- **npm**

If you use `nvm`:

```bash
nvm install 24.12.0
nvm use 24.12.0
```

### Install dependencies

```bash
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required because the current manifest's Vite/esbuild peer range conflicts.

### Start the development server

```bash
npm run dev
```

Open **http://localhost:3000/**.

Vite also prints a Network URL. Use it to open the app on a phone on the same network, or use an HTTPS tunnel such as ngrok when testing PWA installation.

### Build and preview the production app

```bash
npm run build
npm run preview
```

Open **http://localhost:4173/**.

The production build includes the PWA manifest, icons, and service worker. The service worker is registered only in production builds.

### AI configuration

Scam Check calls the FastAPI service in `backend/` whenever `VITE_API_BASE_URL`
is set. `"/"` (the default) keeps requests on the current host; the Vite dev
server proxies `/api` to `http://localhost:8080`. Use an absolute URL to call the
API directly. If no API URL is configured, the client uses a deterministic
offline check that never reports "looks safe" and never holds a provider key. Do
not embed Gemini or Vertex AI keys in the web client or commit them to the
repository; provider credentials belong to the backend.

### Sign-in setup (Firebase Authentication)

StartHere signs people in with Google. Anonymous sessions and demo accounts are not used; every visitor must sign in before the app opens.

Firebase web configuration lives in the repository-root `.env` file (see `.env.example`). Vite loads it because `vite.config.ts` sets `envDir` to the repository root, and only `VITE_`-prefixed values reach the browser bundle.

1. Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values from Firebase Console → **Project settings** → **Your apps**.
2. Firebase Console → **Authentication** → **Sign-in method** → enable **Google**.
3. Firebase Console → **Authentication** → **Settings** → **Authorized domains**: add `localhost`, the production host, and any tunnel host used for device testing.
4. Deploy the hardened Firestore rules once the client is updated:

```bash
firebase deploy --only firestore:rules --project starthere-3e5dc
```

The Firestore database is named `ai-studio-starthereseniort-d5bbff61-0c13-49da-bde7-6558da3396b5`, so a `firebase.json` Firestore target that names the database is required for CLI deploys.

### Verify the app

```bash
npm run lint
node --import tsx --test web/src/navigation/routes.test.ts web/src/auth/authState.test.ts web/src/services/firestoreValues.test.ts scripts/scamcheck-ai.test.ts web/src/pwa.test.ts web/src/services/scamCheckFallback.test.ts web/src/services/scamCheckApi.test.ts
```

### Scam Check API (FastAPI backend)

`backend/` is a stateless FastAPI service that performs the scam check
server-side, so the model choice and provider keys never reach the browser. It
accepts typed text, a photo, or a PDF/DOCX/TXT file.

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
cp .env.example .env
.venv/bin/uvicorn app.main:app --reload --port 8080
```

- `LLM_MODEL` selects the backend through LiteLLM: `gemini/gemini-2.5-flash`,
  `bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0`, `ollama/llama3.2`, and so on.
  `LLM_FALLBACK_MODELS` adds a fallback chain.
- Every check requires a Firebase ID token. Set `FIREBASE_PROJECT_ID` in
  `backend/.env` to the same value as `VITE_FIREBASE_PROJECT_ID`; verification
  uses Google's public signing keys and needs no service account.
  `FIREBASE_AUTH_EMULATOR_HOST` is optional for local emulator testing.
- `VITE_API_BASE_URL="/"` in the root `.env` routes the web client through the
  API on the same origin; Vite proxies `/api` to `http://localhost:8080`
  (override the target with `VITE_API_PROXY_TARGET`). Use an absolute URL to
  call the API directly, or leave it blank to keep the on-device fallback.
- Endpoints, response schema, and the full variable list:
  [backend/README.md](./backend/README.md).

```bash
cd backend
.venv/bin/pytest
.venv/bin/ruff check .
```

### Scam Check benchmark

`npm run eval:scamcheck` scores the 30-sample set against whichever provider `.env` selects:

| Variable | Values | Default |
|---|---|---|
| `SCAMCHECK_AI_PROVIDER` | `gemini`, `ollama`, `heuristic` | `gemini` |
| `SCAMCHECK_AI_MODEL` | provider model name | `gemini-2.5-flash` / `llama3.2` |
| `SCAMCHECK_AI_BASE_URL` | custom endpoint | Gemini default / `http://localhost:11434` |
| `SCAMCHECK_AI_TIMEOUT_MS` | request timeout in ms | `60000` |

```bash
npm run eval:scamcheck
```

For a local model, start Ollama and point the runner at it:

```bash
ollama pull llama3.2
SCAMCHECK_AI_PROVIDER=ollama SCAMCHECK_AI_MODEL=llama3.2 npm run eval:scamcheck
```

The runner prints the provider, model, endpoint, and how many samples used a heuristic fallback. It exits non-zero when any AI call fails or when the accuracy thresholds are missed, so a broken key or offline endpoint can no longer masquerade as a passing benchmark.

### Install as a PWA

The web client includes standalone display metadata, PWA icons, safe-area handling for notched phones, and a production service worker.

- **iPhone/iPad Safari:** Share → **Add to Home Screen**
- **Android Chrome:** menu → **Add to Home screen** / **Install app**

If you change the manifest or app icon, remove and re-add the home-screen app because mobile operating systems cache those assets.

### Main routes

| Route | Screen |
|---|---|
| `/sign-in` | Google sign-in |
| `/onboarding` | First-run text-size setup |
| `/home` | Guided Home |
| `/check` | Scam Check input (text, photo, or file) |
| `/check/result` | Latest Scam Check result |
| `/check/stop` | Stop Screen for money or code scams |
| `/coach` | Coach session list |
| `/coach/:lessonId` | Session quiz |
| `/family` | Family Circle |
| `/settings` | Settings and accessibility |

---

## Documentation Quick Links

- [Complete Project Specification](./docs/SPECIFICATION.md): Full technical architecture, Cloud Functions, data models, security rules, and evaluation benchmark.
- [Mobile Caller ID & Call Screening Architecture](./docs/MOBILE_CALLER_ID_APPROACH.md): Platform-specific implementation guide (Android CallScreeningService & iOS CallKit) integrated with StartHere.
- [Developer Handoff Note](./web/public/assets/aistudio/HANDOFF_ce82f4b8.md): The original handoff notes from Nov 7, 2026.

---

## Key Features

1. **Patient Tech Coach**
   - A session list with short, scenario-based quizzes covering phone basics, everyday tasks, and scam safety.
   - One question at a time with plain-language explanations and calm feedback.
   - Pre-AI sensitive number guard for SSNs, card numbers, and passwords.

2. **Instant Scam Check (`scamCheck`)**
   - Text, photo, and PDF/DOCX/TXT checks powered by the FastAPI service and LiteLLM.
   - Plain-language verdict: `likely_scam`, `caution`, or `looks_safe`.
   - Clear recommended action steps and danger signals.
   - Automated family alerting option on high-risk scams.

3. **Family Safety Circle (`sendAlert`, `acceptInvite`)**
   - Trusted contact invitations with secure 32-character tokens.
   - Instant push notifications and temporary 1-hour screenshot sharing.
   - Family companion view with "I've got it" acknowledgment and direct call shortcuts.

4. **Scam Check 30-Sample Test Benchmark**
   - 15 scam samples covering grandparent scams, delivery fees, bank lockouts, utility shutoffs, and tech support.
   - 15 legitimate messages including real bank fraud alerts, 2FA codes, and Medicare notices.
   - Strict benchmark gating: requires $\ge 14/15$ scams flagged and $\ge 12/15$ legitimate messages marked safe.

---

## Project Structure

```
├── backend/                              # FastAPI Scam Check service (Python, LiteLLM)
│   ├── app/                              # routes, services, prompts, models
│   ├── tests/                            # pytest suite
│   └── README.md                         # provider, auth, and endpoint reference
├── docs/
│   ├── SPECIFICATION.md                  # Full technical spec & architecture
│   ├── MOBILE_CALLER_ID_APPROACH.md      # Mobile caller ID & screening architecture
│   └── superpowers/                      # Design specs and implementation plans
├── web/
│   ├── index.html                        # Web shell and PWA metadata
│   ├── public/
│   │   ├── manifest.webmanifest          # PWA manifest
│   │   ├── sw.js                         # Production service worker
│   │   └── icons/                        # PWA and Apple touch icons
│   └── src/
│       ├── navigation/                   # React Router routes and helpers
│       ├── components/                   # AppShell, BottomTabs, AppHeader, BigButton
│       ├── screens/                      # Home, Check, Coach, Family, Settings
│       ├── context/                      # App state and Firebase sync
│       └── services/                     # Scam Check API, offline fallback, Firebase
├── vite.config.ts                        # Vite, React Native Web aliasing, public assets
├── package.json                          # Dependencies and scripts
└── README.md                             # Project overview and run guide
```
