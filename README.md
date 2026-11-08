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

Scam Check and Coach still run without an AI key and use their local fallback behavior. For production, route AI calls through the Cloud Functions described in [the specification](./docs/SPECIFICATION.md); do not embed Gemini or Vertex AI keys in the web client or commit them to the repository.

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
node --import tsx --test web/src/navigation/routes.test.ts web/src/auth/authState.test.ts web/src/services/firestoreValues.test.ts web/src/pwa.test.ts web/src/services/gemini.test.ts
```

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
| `/check` | Scam Check input |
| `/check/result` | Latest Scam Check result |
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
   - Pre-Gemini sensitive number guard for SSNs, card numbers, and passwords.

2. **Instant Scam Check (`scamCheck`)**
   - Text message and screenshot scam analyzer powered by Gemini Flash (temp 0.1).
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
│       └── services/                     # Gemini and Firebase services
├── vite.config.ts                        # Vite, React Native Web aliasing, public assets
├── package.json                          # Dependencies and scripts
└── README.md                             # Project overview and run guide
```
