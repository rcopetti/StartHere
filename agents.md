# StartHere — AI Agent UX & Architectural Guidelines

> **Document Purpose**: Operational guidelines and full technical stack reference for software engineers and autonomous AI agents building, modifying, or reviewing StartHere application features.  
> **Source Material**: Consolidated directly from `StartHere_UX_Spec.pdf` (Author: @Maury, Nov 7, 2026), `foundation/HANDOFF.md`, `docs/SPECIFICATION.md`, and `docs/MVP_FEATURES.md`.  
> **Target Personas**:  
> - **Primary ("Dorothy", 72)**: Lives alone, uses a smartphone for family calls and grandkid photos, receives 3–5 scam messages weekly, fears losing independence or being judged for asking questions.  
> - **Secondary ("Mark", 45)**: Her son, lives two states away, wants to keep Mom safe without hovering, needs timely high-risk alerts with actionable responses.

---

## 1. The Core Product Question

Every feature, screen, component, and AI prompt must directly answer one question for Dorothy:

> **"Is this safe, and what do I do next?"**

If a screen or interaction does not immediately answer this question with clarity and reassurance, it violates the design charter.

---

## 2. The Six Non-Negotiable UX Design Principles

When any implementation decision is ambiguous, these six rules decide it:

| # | Principle | Strict Agent Implementation Rule |
|---|---|---|
| **1** | **One Job Per Screen** | Exactly **one headline** and **one primary action button** per view. Any secondary actions must sit below as clear, subordinate text links. Never present competing primary actions. |
| **2** | **Big & High-Contrast** | **Body text $\ge 20\text{pt}$**, **headlines $\ge 28\text{pt}$**, **buttons $\ge 64\text{pt}$ tall and full width**. Color contrast must satisfy **7:1 (WCAG AAA)**. Support dynamic system text scaling up to **200%** with zero clipped text. |
| **3** | **Voice First, Touch Always** | Where voice is used, every voice interaction has an on-screen visual/touch equivalent. Everything the app says can be read on screen. *(Note: Voice engine is excluded for MVP, making touch/tactile text-first the primary path).* |
| **4** | **Plain Words (6th-Grade Level)** | Strictly ban technical jargon. Words like *phishing*, *URL*, *2FA*, *cache*, *API*, *malware*, *operating system*, and *CTA* are forbidden unless accompanied by an immediate plain-language definition (e.g. *"A link is the blue words you can tap"*). |
| **5** | **Calm, Never Scary** | No flashing red alerts, no siren sound effects, and no alarmist warning banners. Even a scam verdict must be delivered steadily: (1) what it is, (2) that she is safe *because* she checked, and (3) what to do now. |
| **6** | **Nothing Hidden, Nothing Irreversible** | **No swipe gestures, no long-press, and no hamburger menus.** Every single screen must have a visible `Back` button, and every destructive or communicative action must have a confirmation or undo step. |

---

## 3. Visual System Design Tokens

Agents must enforce the following visual tokens across all web and mobile components:

```
┌─────────────────┬─────────────────────────────────────────────────────────────┐
│ Token           │ Specification & Usage                                       │
├─────────────────┼─────────────────────────────────────────────────────────────┤
│ Base Background │ Warm off-white (#FAF8F5 / #F8F6F0), near-black text (#1A1A1A)│
│ Safe Token      │ Deep green (#1E5E3A) + Check Icon + text "Looks safe"        │
│ Caution Token   │ Amber (#B45309) + Question Icon + text "Be careful"         │
│ Scam Token      │ Deep red (#B91C1C) + Stop-Hand Icon + text "This is a scam" │
│ Color Rule      │ NEVER use color alone: Always combine Icon + Color + Word.  │
│ Tap Targets     │ Minimum 64x64pt target area, 16pt margin between targets.   │
│ Motion / Anim   │ Simple fades only (≤200ms); strictly honor prefers-reduced- │
│                 │ motion. No bouncing, sliding, or spinning widgets.          │
└─────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 4. Voice & Copy Guidelines for Agents (Tone Charter)

The voice of StartHere is a **calm, respectful grandchild who happens to know tech**: warm, brief, patient, never condescending, and never alarmist.

### Approved Copy Patterns (Do's and Don'ts)

| Situation | ❌ NEVER Say (Banned) | ✅ ALWAYS Say (Approved) |
|---|---|---|
| **Scam Detected** | *"Warning! High-risk threat detected!"* | *"This is a scam. You're safe because you didn't reply."* |
| **User Checks Item** | *"Scanning initiated for suspicious payload."* | *"Good call checking this."* |
| **Call to Action** | *"Navigate to the CTA button."* | *"Tap the green button."* |
| **Explaining Links** | *"Don't click suspicious phishing URLs."* | *"A link is the blue words you can tap."* |
| **Uncertainty** | Model hallucinating or guessing | *"I'm not sure. Let's ask Mark."* |
| **Credit / Card Guard** | *"Authentication token invalid."* | *"For your privacy, please never share passwords, cards, or personal numbers. I will never ask for them."* |
| **Error / Offline** | *"Network error 503: Connection dropped."* | *"I can't check right now because the internet is off. Don't reply to the message yet. I'll check as soon as you're back online."* |
| **Empty History** | *"No database entries found."* | *"Nothing checked yet. When something seems off, tap Check something."* |

---

## 5. Screen Inventory & Architecture

### Information Architecture (4 Persistent Main Tabs)
1. **House · Home**: "Check something" button, "Ask my coach" button, today's tip, family status line.
2. **Shield · Check**: Scam Checker input (paste text, photo, link, describe call) and past check history.
3. **Chat bubble · Coach**: AI Coach interactive step-by-step assistant.
4. **Book · Learn**: Guided micro-lessons and skill progress.
*Note: Family Circle and Settings open from an unmissable person icon at top-right of Home to preserve the clean 4-tab bar.*

### Critical Screen Specifications

#### 1. The Scam Checker (`scamCheck`)
- **4 Distinct Inputs**:
  1. *Share a text*: Via native share sheet or quick paste.
  2. *Take a photo*: Of a letter, computer screen, or pop-up.
  3. *Paste a link*: Or a phone number or email address.
  4. *Describe a call*: Type or dictate what the caller claimed.
- **Calm Progress State**: Avoid spinning rings alone. Display calm progress text: *"Reading the message… Looking for warning signs…"*
- **3 Standard Verdict Templates**:
  - `looks_safe`: Headline *"This looks safe"*, 1-line reason, one gentle caution if any, primary button `Done`.
  - `caution`: Headline *"Be careful with this one"*, up to 3 plain signs + how to verify, primary button `Show me how to check`.
  - `likely_scam`: Headline *"This is a scam"*, scam type + 1 to 3 signs + *"You did the right thing"*, primary button `What do I do now?`.

#### 2. The Stop Screen (High-Risk Interrupt)
Triggered immediately whenever a scam involves **money, gift cards, cryptocurrency, bank account info, or 2FA verification codes**:
- Full-screen view with a deep red band at the top and a stop-hand icon.
- Three numbered instructions:
  1. *Don't reply.*
  2. *Don't send money, gift cards, or codes.*
  3. *Call someone you trust.*
- Primary Big Button: **`[ Call Mark ]`** (her designated trusted contact).
- If the scam is family-impostor/grandparent bail: Display reminder: *"Ask for your family safe word."*
- Secondary link: *"I already replied or paid"* &rarr; opens a calm recovery checklist (call bank's real number on the card, change password, report it).

#### 3. The Patient Tech Coach (`coachTurn`)
- **Step-by-Step Mode**: Teaches phone tasks with numbered cards shown **one card at a time**.
  - One instruction per card.
  - A picture/diagram of the exact button to press.
  - Two buttons: `[ Done, next step ]` and `[ I'm stuck ]` (which rephrases the step in simpler terms).
- **Hard Constraints**:
  - Responses clamped to **1–2 short sentences**.
  - Jargon blocklist with automatic single retry.
  - Pre-AI regex guard: catches SSNs, credit card numbers, and passwords *before* contacting any LLM.
- **Coach Guardrails**:
  - *User mentions sending money or codes*: Pause immediately, run scam check, show Stop Screen if high risk.
  - *User asks for medical/legal/financial advice*: Give calm general info, advise calling doctor/lawyer/family.
  - *User asks to enter passwords/accounts*: Decline gently, explain the coach will never ask for credentials.
  - *User seems upset/confused*: Slow down, shorten sentences, offer to call trusted contact.

#### 4. The Trusted Family Circle
- **Senior Ownership**: The senior owns the circle; she invites contacts, selects what is visible, and can revoke access anytime.
- **Alert Defaults**:
  - On by default: High-risk scam verdict involving money/codes or tapping *"Call my trusted person"*.
  - Off by default: Routine safe checks (sent as optional weekly digest instead).
- **Family Alert Notification**:
  - Push notification format: *"Mom checked a text that looks like a bank-impersonation scam asking for a code. She was told not to reply. Tap to call her."*
  - Buttons: `[ Call Mom ]` / `[ See details ]`.
- **Family Member View (Mark's Portal)**:
  - Clean status card: *"All quiet this week · 6 checks, 0 scams"*.
  - Recent high-risk alerts.
  - One-tap `[ Call Mom ]` button and `[ I've Got It ]` acknowledgment button.
  - Coaching guide for Mark: *"How to talk with Mom about scams without making her feel bad."*

#### 5. Guided Lessons (Competency-Based)
- Lessons build measurable skills in **5 to 7 minutes**:
  1. *Skill Goal*: Single line on first card (e.g. *"By the end, you'll spot a fake bank text on your own."*).
  2. *Teach*: 3 to 4 cards, one sign or step per card with realistic examples.
  3. *Drill*: 5 realistic examples, sorting Safe / Be careful / Scam. Requires 4 of 5 to pass.
  4. *Factual Result*: *"You got 4 of 5. You can spot fake bank texts."*
- **No streaks, points, or badge walls**: Progress is tracked as a clean skill list showing `Learning`, `Passed`, or `Mastered`.

---

## 6. Complete Technology Stack Implementation

Consolidated from `foundation/HANDOFF.md` and `docs/SPECIFICATION.md`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SENIOR CLIENT / FRONTEND                        │
│  - Flutter Mobile (Android/Web): app/lib/                              │
│    • State: flutter_riverpod 3.x                                       │
│    • Firebase: firebase_core 5, firebase_app_check 0.5                │
│    • System: share_plus 13, speech_to_text 7.5, flutter_tts            │
│    • Widgets: AppPage, BigButton, Caption, MicButton                   │
│  - React Web SPA: web/src/                                             │
│    • React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide, Motion     │
│    • API SDK: @google/genai                                            │
└───────────────────▲────────────────────────────────┬───────────────────┘
                    │                                │
          HTTPS / App Check                Callable Cloud Functions
                    │                                │
┌───────────────────┴────────────────────────────────▼───────────────────┐
│                    BACKEND SERVICES & CLOUD FUNCTIONS                  │
│                     (Node.js / TypeScript, us-central1)                │
│                                                                        │
│  1. coachTurn         - Interactive lessons & open Q&A tutor           │
│                         • Pre-AI sensitive number regex guard          │
│                         • 2-sentence clamp & jargon blocklist retry    │
│                         • Final step summary synthesis                 │
│                                                                        │
│  2. scamCheck         - Multimodal scam analyzer (image + text)        │
│                         • Temperature 0.1, strict JSON schema          │
│                         • Untrusted envelope, fails closed             │
│                         • Auto-alerts family if configured             │
│                                                                        │
│  3. sendAlert         - Creates alert record & triggers FCM push       │
│                         • Prunes dead device tokens                    │
│                         • Optional 1-hour signed URL (post-MVP)        │
│                                                                        │
│  4. acceptInvite      - Validates 32-char crypto token & links family  │
│                                                                        │
│  5. deleteMyData      - Complete GDPR right-to-be-forgotten (post-MVP) │
│                                                                        │
│  6. purgeScreenshots  - Hourly cron: deletes images > 24h (post-MVP)   │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
             Firestore & Storage                Gemini AI Engine
                    │                                │
┌───────────────────▼──────────────┐   ┌─────────────▼───────────────────┐
│  FIRESTORE & STORAGE PERSISTENCE │   │       GEMINI FLASH ENGINE       │
│  - users/{uid}                   │   │  - Vertex AI / Google Gen AI    │
│  - trustedContacts               │   │  - Model pin: gemini-2.5-flash  │
│  - alerts                        │   │  - Temp 0.1 for Scam Check      │
│  - sessions                      │   │  - Temp 0.4 for Tech Coach      │
│  - scamChecks                    │   │  - 8-second execution timeout   │
│  - rateLimits/{uid}              │   │  - 60 calls/hour rate limit     │
│  - scam-checks/{uid}/{checkId}   │   └─────────────────────────────────┘
└──────────────────────────────────┘
```

### 6.1 Backend Cloud Functions (`functions/src/`)

All callables run on `us-central1`, enforce Firebase App Check (`ENFORCE_APP_CHECK`), apply a per-user rate limit of **60 calls per user per hour**, and enforce strict logging privacy (logs never include user message content or screenshot text).

| Function | Trigger | Parameters & Behavior | Safety & Validation Rules |
|---|---|---|---|
| `coachTurn` | Callable | Context: lesson scenario metadata (`scene`, `question`, `options`, `correctAnswer`), user selection (`legit` or `scam`), step progress, and session history. Gemini Flash at temp `0.4`, 8s timeout. | **1. Scenario Case Evaluation**: Validates user selection against `step.correctAnswer`, returning verdict banner (`Spot on!` vs `Not quite`) and 1–2 plain sentences explanation.<br>**2. Pre-AI Regex Guard**: Scans for SSNs (`\b\d{3}[- ]?\d{2}[- ]?\d{4}\b`), card numbers (`\b(?:\d[ -]*?){13,16}\b`), and passwords before contacting AI. Credentials never stored.<br>**3. Jargon Blocklist**: Forbidden terms (`cache`, `URL`, `cookie`, `RAM`, `DNS`, `API`, `JSON`, etc.) trigger an automatic single retry.<br>**4. Sentence Clamp**: Clamped strictly to 1–2 sentences.<br>**5. Finish Synthesis**: On the final step, synthesizes congratulatory summary and final score using `finishTemplate`. |
| `scamCheck` | Callable | Evaluates text, email, link, or uploaded screenshot. Gemini Flash at temp `0.1` (deterministic), 8s timeout. | **1. Untrusted Wrapper**: Input wrapped in prompt-injection guard envelope.<br>**2. Strict JSON Schema**: Outputs `verdict`, `headline`, `explanation`, `action`, `signals[]`, `riskScore`.<br>**3. Fail-Closed**: Any schema mismatch or timeout returns `{error: true, ok: false}`, never an unverified verdict.<br>**4. Auto-Alert**: Automatically triggers alert if `verdict === "likely_scam"` and user has `autoAlertOnScam: true`. |
| `sendAlert` | Callable | Creates alert record in `alerts/{alertId}`. | Dispatches Firebase Cloud Messaging (FCM) notifications to all tokens in `contact.fcmTokens`, automatically pruning dead tokens. |
| `acceptInvite`| Callable | Validates 32+ character single-use `inviteToken`. | Sets `linkedUid: seniorUid`, marks contact `status: "active"`, sets caller to `role: "family"`, and clears `inviteToken` to prevent replay. |
| `deleteMyData`| Callable *(Post-MVP)* | GDPR right-to-be-forgotten. | Recursively wipes `users/{uid}`, screenshots in Storage, associated alerts, rate limit docs, and Auth user record. |
| `purgeScreenshots` | Scheduled Cron *(Post-MVP)* | Runs every 60 minutes. | Purges images older than 24 hours from Cloud Storage (`scam-checks/`) and clears `storagePath` on the corresponding check doc. |

---

### 6.2 Data Models & Firestore Collections

#### 1. `users/{uid}`
```typescript
interface UserProfile {
  uid: string;
  role: 'senior' | 'family';
  displayName: string;
  phone?: string;
  onboarded: boolean;
  fontSizePreference: 'standard' | 'large' | 'extra_large';
  highContrast: boolean;
  autoAlertOnScam: boolean;
  fcmTokens: string[];
  // For family accounts:
  linkedSeniors?: {
    [seniorUid: string]: {
      seniorName: string;
      seniorPhone?: string;
      linkedAt: FirebaseFirestore.Timestamp;
    };
  };
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

#### 2. `trustedContacts/{contactId}` (Subcollection of `users/{seniorUid}`)
```typescript
interface TrustedContact {
  id: string;
  seniorUid: string;
  name: string;
  relationship: string;      // e.g. "Daughter", "Son", "Neighbor"
  phone: string;
  status: 'invited' | 'active';
  inviteToken?: string;      // 32+ character crypto token, cleared once accepted
  linkedUid?: string;        // Auth UID of the linked family member
  linkedAt?: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
}
```

#### 3. `alerts/{alertId}` (Root Collection)
```typescript
interface AlertItem {
  id: string;
  seniorUid: string;
  seniorName: string;
  seniorPhone?: string;
  contactUid: string;
  contactName: string;
  contactPhone?: string;
  type: 'scam_detected' | 'manual_help_request';
  verdict: 'likely_scam' | 'caution' | 'looks_safe';
  headline: string;
  summary: string;
  actionTaken: string;
  screenshotUrl?: string;    // Optional 1-hour signed URL if senior explicitly approved
  sentAt: FirebaseFirestore.Timestamp;
  ackAt?: FirebaseFirestore.Timestamp; // Set once when family taps "I've got it"
  acknowledgedBy?: string;
}
```

#### 4. `sessions/{sessionId}` (Subcollection of `users/{seniorUid}`)
```typescript
interface CoachSession {
  id: string;
  seniorUid: string;
  lessonId: string;
  lessonTitle: string;
  currentStep: number;
  totalSteps: number;
  status: 'active' | 'completed' | 'abandoned';
  messages: Array<{
    role: 'user' | 'coach' | 'system';
    text: string;
    timestamp: number;
    guardTriggered?: boolean;
  }>;
  resultSummary?: string;
  startedAt: FirebaseFirestore.Timestamp;
  completedAt?: FirebaseFirestore.Timestamp;
}
```

#### 5. `scamChecks/{checkId}` (Subcollection of `users/{seniorUid}`)
```typescript
interface ScamCheckRecord {
  id: string;
  seniorUid: string;
  inputType: 'text' | 'image';
  previewText: string;
  storagePath?: string;      // Nullified after 24h purge
  verdict: 'likely_scam' | 'caution' | 'looks_safe';
  headline: string;
  explanation: string;
  action: string;
  signals: string[];
  riskScore: number;
  alertSent: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}
```

#### 6. `rateLimits/{uid}` (Backend Functions Only)
```typescript
interface RateLimitRecord {
  windowStart: number;
  callCount: number;
}
```

---

### 6.3 Security Rules Implementation

1. **User Data Isolation**: Users can only read and write documents in their own user tree (`request.auth.uid == resource.data.uid`). Users cannot mutate their own `role` or `linkedSeniors`.
2. **Session Creation Restriction**: Clients may only *create* a session with `currentStep: 0`, `status: "active"`, and `messages: []`. All message appends and step progressions are executed strictly by Cloud Functions.
3. **Scam Checks Immutability**: The `scamChecks` collection is read-only to the senior. Creation and edits originate strictly from Cloud Functions.
4. **Alerts Access**: Readable only by the senior (`seniorUid`) or designated contact (`contactUid`). The contact can only update `ackAt` once, using `request.time`.
5. **Storage Security**: Bucket path strictly constrained to `scam-checks/{uid}/{checkId}.jpg`, owner only, image MIME types only, maximum file size 8 MB.

---

### 6.4 Evaluation Benchmark Suite (`functions/eval/`)

The 30-sample evaluation harness (`samples.json` + `score.ts`) verifies model precision and recall before deployment.

- **Coverage**: 15 realistic scams (bail emergency, USPS delivery fee, toll suspension, bank lockout, tech support virus pop-up, Medicare fee, IRS warrant, lottery, Geek Squad renewal, utility shutoff, Amazon charge, SSA suspension, crypto romance, jury duty, 2FA code theft) and 15 legitimate messages (bank fraud text, 2FA code, Medicare reminder, pharmacy pickup, dentist reminder, UPS delivery, family photo text, utility e-bill, doctor check-in, library notice, boarding pass, streaming receipt, weather alert, community schedule, card statement).
- **Pass Criteria**:
  - **Scam Detection Recall**: Flag at least **14 out of 15 scams** ($\ge 93.3\%$).
  - **Legitimate Specificity**: Mark at least **12 out of 15 safe messages** as `looks_safe` ($\ge 80.0\%$).
- **Privacy Compliance**: Evaluation results record model pin and prompt hash, never sample text.

---

### 6.5 Client Repository Structure

```
app/                              # Flutter Mobile Client (Android & Web)
  pubspec.yaml                    # Riverpod 3, Firebase 5, SharePlus 13
  lib/
    main.dart                     # App Check init, route gating
    models.dart  theme.dart  state.dart
    services/api.dart             # Callable Cloud Functions wrapper (zero client AI keys)
    services/voice.dart           # Speech recognition & TTS (deferred for MVP)
    widgets/ui.dart               # AppPage, BigButton, Caption, MicButton
    screens/                      # sign_in, onboarding, home, learn, scam_check, family, settings

web/                              # React Web Client (Clean SPA)
  index.html                      # Senior-optimized viewport & meta
  src/
    main.tsx  App.tsx  index.css  # React 19 + Tailwind v4 + Lucide icons
    vite-env.d.ts

functions/                        # Backend Cloud Functions (Node.js/TypeScript)
  src/
    config.ts                     # Region, rate limits, App Check flag, minInstances
    gemini.ts                     # Vertex AI / Google Gen AI client (8s timeout, fail-closed)
    scamCore.ts                   # Scam Check prompt, JSON schema, validation
    coachCore.ts                  # Coach prompt, jargon blocklist, regex PII guard
    shared.ts                     # Admin init, auth/arg checks, rate limiter
    coachTurn.ts  scamCheck.ts  alerts.ts  privacy.ts  index.ts
  scripts/seed-lessons.ts         # Lessons seeder script
  eval/samples.json  score.ts     # 30-sample precision/recall scorer
```

---

## 7. Rules for Autonomous Agents Modifying Code

1. **Zero Client AI Keys**: Never store Gemini or Vertex AI API keys in the Flutter or React clients. All AI calls must route through callable Cloud Functions (`coachTurn`, `scamCheck`).
2. **Never Inject Technical Jargon**: System prompts, UI text, and error states must always adhere to 6th-grade reading level.
3. **Preserve Minimum Button and Font Dimensions**: Primary buttons $\ge 64\text{pt}$ tall, full width; body text $\ge 20\text{pt}$. Do not use small pill badges or micro floating action buttons.
4. **Respect MVP Directives**:
   - **Voice Engine**: Kept deferred for MVP. Maintain touch/tactile text-first components with oversized input fields and preset suggestion chips.
   - **Screenshot Lifecycle**: Keep alerts and scam check workflows direct without introducing Cloud Storage purge daemons or signed URL minting complexity in MVP.
5. **Preserve Two-Way Reassurance**: Any alert sent to family must provide a way for family to acknowledge (`ackAt`) so the senior's screen can show *"Mark is handling this"*.
6. **Always Verify Accessibility**: Run linter and compiler checks after every change. Ensure no nested elements clip text when font sizes scale up to 200%.
