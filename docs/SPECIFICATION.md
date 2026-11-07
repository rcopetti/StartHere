# StartHere — Project Specification & Architecture

> **Document Status**: Current Project Specification  
> **Source**: Extracted & Consolidated from Developer Handoff (`HANDOFF_ce82f4b8.md`)  
> **Last Updated**: November 7, 2026  
> **Target Release / Demo**: November 8, 2026  

---

## 1. Executive Summary & Product Vision

**StartHere** is an accessibility-first technology empowerment and scam protection platform built for older adults (seniors) and their trusted family circles. 

Modern technology often overwhelms seniors with confusing jargon, fast-changing interfaces, and aggressive digital fraud (such as grandparent scams, fake toll notices, phishing bank alerts, and tech support extortion). **StartHere** eliminates technical intimidation through:
1. **The Patient Tech Coach (`coachTurn`)**: A calm, voice-enabled AI tutor that explains digital concepts in 1–2 simple sentences, strictly bans technical jargon, and protects sensitive personal credentials before AI processing.
2. **Instant Scam Check (`scamCheck`)**: A fast, deterministic scam analyzer for screenshots and text messages that outputs plain-language verdicts, clear action steps, and high-visibility status flags.
3. **The Family Safety Circle (`sendAlert`, `acceptInvite`)**: A trusted contact network enabling seniors to notify loved ones with one tap, auto-alert family upon scam detection, and allow family members to respond ("I've got it" / "Call").

---

## 2. Core Architecture & System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SENIOR CLIENT / APP                             │
│  - Flutter (Android/Web) & React SPA                                   │
│  - Senior-friendly UI: AppPage, BigButton, Caption, MicButton         │
│  - Voice Engine: Speech-to-Text (STT) & Text-to-Speech (TTS)           │
│  - Screens: Onboarding, Home, Learn (Coach), Scam Check, Family, Specs │
└───────────────────▲────────────────────────────────┬───────────────────┘
                    │                                │
          HTTPS / App Check                Callable Cloud Functions
                    │                                │
┌───────────────────┴────────────────────────────────▼───────────────────┐
│                    BACKEND SERVICES & CLOUD FUNCTIONS                  │
│                                                                        │
│  1. coachTurn         - Guided micro-lessons & free-form Q&A           │
│                         • Pre-AI sensitive number guard (SSN, cards)   │
│                         • 2-sentence clamp & jargon blocklist retry    │
│                         • Finish template synthesis                    │
│                                                                        │
│  2. scamCheck         - Image & text scam analysis                     │
│                         • Strict JSON validation schema                │
│                         • Fails closed on malformed input              │
│                         • Auto-alerts family if configured             │
│                                                                        │
│  3. sendAlert         - Creates alerts & triggers FCM push             │
│                         • 1-hour signed URL for optional screenshot    │
│                                                                        │
│  4. acceptInvite      - Validates 32-char token & links family role    │
│                                                                        │
│  5. deleteMyData      - Complete right-to-be-forgotten GDPR/privacy    │
│                                                                        │
│  6. purgeScreenshots  - Hourly cron: deletes screenshots older than 24h│
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
            Firestore & Storage                Gemini AI Engine
                    │                                │
┌───────────────────▼──────────────┐   ┌─────────────▼───────────────────┐
│  FIRESTORE & STORAGE PERSISTENCE │   │       GEMINI FLASH ENGINE       │
│  - users/{uid}                   │   │  - Vertex AI / Google Gen AI    │
│  - trustedContacts               │   │  - Temp 0.1 for Scam Check      │
│  - alerts                        │   │  - Temp 0.4 for Tech Coach      │
│  - sessions                      │   │  - 8-second execution timeout   │
│  - scamChecks                    │   │  - 60 calls/hour rate limit     │
│  - rateLimits/{uid}              │   └─────────────────────────────────┘
│  - scam-checks/{uid}/{checkId}   │
└──────────────────────────────────┘
```

---

## 3. Cloud Functions Specification

All functions run on `us-central1`, enforce **Firebase App Check** (`ENFORCE_APP_CHECK`), apply a per-user rate limit of **60 calls per user per hour** for interactive endpoints, and enforce strict logging privacy (logs never include user message content or screenshot text).

### 3.1 `coachTurn` (Callable & Scenario Case Engine)
- **Purpose**: Powers interactive, scenario-based coaching turns for lessons and open Q&A (modeled after `foundation/starthere-dev-handoff/lesson_step_concept.png`).
- **Interactive Scenario Architecture**:
  - Each lesson step presents an authentic simulated scene: text message, WhatsApp, email alert, phone call, or system popup.
  - The senior is presented with a clear question: *"Is this a legit message or a scam?"* and two prominent action choices: `[ A. Legit ]` or `[ B. Scam ]`.
  - When the senior selects an option, `coachTurn` evaluates the choice against `step.correctAnswer`, records user progress, and provides instant, reassuring feedback.
- **Model Parameters**: Temperature `0.4`, 8-second execution timeout.
- **Context Loaded**: Lesson metadata, active scenario `scene` object, `correctAnswer`, step progress, and the last 10 session messages.
- **Feedback & Synthesis**:
  1. **Verdict Header**: Immediate confirmation (`Spot on! This is a scam.` or gentle guidance `Not quite — this is actually a scam.`).
  2. **1–2 Sentence Plain Explanation**: Explains exactly why the scenario is legitimate or fraudulent (e.g. *"WhatsApp will never ask you to reply with your 6-digit verification code. If someone asks for your code, they are trying to steal your account."*).
  3. **Warning Signs & Safe Action**: Clear bulleted signals (e.g. artificial urgency, unfamiliar link, gift card demands) and the concrete safe next step.
- **Safety Guardrails**:
  1. **Pre-AI Sensitive Number Interceptor**: Regex scans for Social Security Numbers (`\b\d{3}[- ]?\d{2}[- ]?\d{4}\b`), credit/debit card numbers (`\b(?:\d[ -]*?){13,16}\b`), and plaintext passwords *before* touching Gemini. Credentials are never written to Firestore or sent to AI models. The senior receives an immediate reassuring reply:
     > *"For your privacy and security, please never share passwords, cards, or personal numbers. Your information is safe with you, and I will never ask for them."*
  2. **Jargon Blocklist**: Technical jargon is forbidden (e.g., `cache`, `URL`, `browser cookie`, `RAM`, `operating system`, `DNS`, `IP address`, `bandwidth`, `API`, `JSON`, `root directory`). If the model output contains a forbidden token, the function retries once with an explicit prompt to rephrase in plain language.
  3. **Sentence Clamp**: Responses are strictly limited to **1–2 short sentences** to avoid overwhelming the reader.
  4. **Lesson Completion Synthesis**: On reaching the final step, a second prompt synthesizes a congratulatory summary using the lesson's `finishTemplate` and reports the senior's score (e.g., 5/5 correct).


### 3.2 `scamCheck` (Callable)
- **Purpose**: Evaluates suspicious text messages, emails, links, or uploaded screenshots.
- **Model Parameters**: Temperature `0.1` (deterministic & conservative).
- **Untrusted Input Envelope**: Raw text or OCR/image input is isolated inside an untrusted content wrapper to protect against prompt injection.
- **Output Schema**:
  ```json
  {
    "verdict": "likely_scam | caution | looks_safe",
    "headline": "Short plain-language description (e.g. Urgent Fake Delivery Notice)",
    "explanation": "Two simple sentences explaining the key reason for the verdict.",
    "action": "Immediate recommended step (e.g. Do not click the link. Delete the message.)",
    "signals": ["Urgency tactic", "Unfamiliar short link", "Demands payment"],
    "riskScore": 85
  }
  ```
- **Error Handling**: Fails closed. Any JSON validation error or timeout sets `error: true` and `{ok: false}`, never emitting an unverified verdict.
- **Auto-Alert Integration**: When `verdict === "likely_scam"` and the senior's profile has `autoAlertOnScam: true`, automatically enqueues a family alert (screenshot excluded for privacy).

### 3.3 `sendAlert` (Callable)
- **Purpose**: Transmits a high-priority alert from the senior to their trusted family contacts.
- **Actions**:
  - Writes a record to `alerts/{alertId}`.
  - Sends Firebase Cloud Messaging (FCM) notifications to all devices in `contact.fcmTokens`, automatically pruning invalid or expired tokens.
  - Generates a **1-hour signed URL** for the screenshot only if the senior explicitly taps "Yes, share screenshot".

### 3.4 `acceptInvite` (Callable)
- **Purpose**: Connects a family member's device to a senior's safety circle.
- **Flow**:
  1. Validates the 32+ character single-use `inviteToken`.
  2. Sets `linkedUid: seniorUid`, marks contact `status: "active"`, records `linkedAt`.
  3. Sets the caller's role to `role: "family"`.
  4. Invalidates the `inviteToken` to prevent reuse.

### 3.5 `deleteMyData` (Callable)
- **Purpose**: Complete self-service GDPR / CCPA right-to-be-forgotten.
- **Actions**:
  - Recursively deletes user documents under `users/{uid}`.
  - Purges all stored screenshots in `scam-checks/{uid}/`.
  - Cleans up alert references where the user is senior or contact.
  - Removes the rate-limiting document `rateLimits/{uid}`.
  - Deletes the Firebase Auth user record.

### 3.6 `purgeScreenshots` (Scheduled Hourly)
- **Trigger**: Every 60 minutes (`every 60 minutes`).
- **Policy**: Deletes all uploaded images older than 24 hours from Google Cloud Storage (`scam-checks/`) and nullifies the `storagePath` reference on the corresponding scam check document.

---

## 4. Data Model & Schema

### `users/{uid}`
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
  // For family role accounts:
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

### `trustedContacts/{contactId}` (Subcollection of `users/{seniorUid}`)
```typescript
interface TrustedContact {
  id: string;
  seniorUid: string;
  name: string;
  relationship: string;      // e.g. "Daughter", "Son", "Neighbor"
  phone: string;
  status: 'invited' | 'active';
  inviteToken?: string;      // 32+ character crypto token, cleared once accepted
  linkedUid?: string;        // The Auth UID of the family member
  linkedAt?: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
}
```

### `alerts/{alertId}`
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
  screenshotUrl?: string;    // Temporary 1-hour signed URL if senior approved
  sentAt: FirebaseFirestore.Timestamp;
  ackAt?: FirebaseFirestore.Timestamp; // Set once when family taps "I've got it"
  acknowledgedBy?: string;
}
```

### `sessions/{sessionId}` (Subcollection of `users/{seniorUid}`)
```typescript
interface CoachSession {
  id: string;
  seniorUid: string;
  lessonId: string;
  lessonTitle: string;
  currentStep: number;
  totalSteps: number;
  status: 'active' | 'completed' | 'abandoned';
  scenarioAnswers: Array<{
    stepOrder: number;
    selectedAnswer: 'legit' | 'scam';
    correctAnswer: 'legit' | 'scam';
    isCorrect: boolean;
    timestamp: number;
  }>;
  score: number;             // e.g. 5 out of 5 correct
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

### `lessons/{lessonId}` (Firestore Collection)
```typescript
interface LessonStep {
  order: number;
  scene: {
    type: 'sms' | 'whatsapp' | 'email' | 'popup' | 'phone_call';
    sender: string;
    senderDetail: string;   // e.g. "Text Message • Today 6:08 PM"
    content: string;        // The simulated message bubble / alert text
  };
  question: string;         // e.g. "Is this a legit message or a scam?"
  options: Array<{
    id: 'legit' | 'scam';
    label: string;          // e.g. "A. Legit", "B. Scam"
  }>;
  correctAnswer: 'legit' | 'scam';
  explanation: string;      // 1–2 plain sentences explaining why
  warningSigns: string[];   // Key red flags (or verification markers)
  safeAction: string;       // Next safe step (e.g. "Delete or ignore.")
  instruction?: string;     // Backward-compatible guidance text
  checkQuestion?: string;
  successHint?: string;
}

interface LessonDocument {
  lessonId: string;
  order: number;
  title: string;
  track: 'basics' | 'everyday' | 'safety';
  cardIcon: string;
  minutes: number;
  mvp: boolean;
  goal: string;
  steps: LessonStep[];
  finishTemplate: string;
  coachNote?: string;
  version: number;
}
```

### `scamChecks/{checkId}` (Subcollection of `users/{seniorUid}`)
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

### `rateLimits/{uid}` (Backend Functions Only)
```typescript
interface RateLimitRecord {
  windowStart: number;
  callCount: number;
}
```

---

## 5. Security & Access Rules Summary

1. **User Data Isolation**: Users can only read and modify documents in their own tree (`request.auth.uid == resource.data.uid`).
2. **Session Creation Restriction**: Clients may only *create* a session with `currentStep: 0`, `status: "active"`, and an empty `messages: []` array. All state progressions and message append operations are performed exclusively by Cloud Functions.
3. **Scam Checks Immutability**: The `scamChecks` collection is read-only to the senior; creations and edits originate only from Cloud Functions.
4. **Alert Visibility**: Alerts can only be read by the designated senior or linked contact. The contact can only update `ackAt` once, using `request.time`.
5. **Storage Constraints**: Path strictly enforced as `scam-checks/{uid}/{checkId}.jpg`. Maximum file size 8 MB; must match image MIME types.

---

## 6. Curated Lesson Library & Coach Content

| Lesson ID | Title | Target Skills | Step Breakdown |
|---|---|---|---|
| `lesson-thankyou` | **Sending a Thank-You Note & Photo** | Messaging, camera roll, typing | 1. Find the Messages app<br>2. Pick family recipient<br>3. Type warm note<br>4. Attach photo & press Send |
| `lesson-scam-links` | **Spotting Suspicious Links & Texts** | Phishing awareness, scam detection | 1. Check sender address/number<br>2. Look for artificial urgency<br>3. Verify via Scam Check |
| `lesson-video-call` | **Making a Video Call with Family** | FaceTime, WhatsApp, mic/camera | 1. Open calling app<br>2. Check camera preview & lighting<br>3. Unmute microphone & connect |
| `lesson-ask-anything` | **Ask Me Anything (Open Coach)** | General digital troubleshooting | Free-form senior-friendly tech tutor |

---

## 7. 30-Sample Evaluation Benchmark (`functions/eval/samples.json`)

To verify scam detection accuracy before deployment, the 30-sample benchmark assesses model precision and recall.

### Pass Criteria
- **Scam Detection Recall**: Flag at least **14 out of 15 scams** ($\ge 93.3\%$).
- **Legitimate Message Specificity**: Mark at least **12 out of 15 safe messages** as `looks_safe` ($\ge 80.0\%$).

### Benchmark Sample Coverage
- **Scams (15)**:
  1. Grandparent bail emergency
  2. USPS package unpaid delivery fee
  3. Toll violation & license suspension
  4. Chase/Wells Fargo account lockout link
  5. Microsoft / Apple tech support virus warning
  6. Medicare replacement card fee
  7. IRS urgent tax lien warrant
  8. Publishers Clearing House / lottery prize
  9. Geek Squad / Norton automatic renewal invoice ($499)
  10. Power/utility shutoff within 30 minutes
  11. Amazon unauthorized $899 iPhone order
  12. Social Security number suspension notice
  13. Romantic crypto investment guarantee
  14. Missed jury duty summons & arrest warrant
  15. Two-factor authentication code theft request
- **Legitimate Messages (15)**:
  1. Real bank fraud alert (with instructions to call the number on the card)
  2. Official 2FA login code ("Do not share this code")
  3. Official Medicare open enrollment reminder
  4. CVS/Walgreens prescription ready for pickup
  5. Dental appointment confirmation reminder
  6. UPS package delivered to front porch
  7. Family group text with photo attachment
  8. Real utility monthly e-bill notification
  9. Doctor's appointment check-in link from hospital portal
  10. Public library hold ready notification
  11. Airline boarding pass notification
  12. Streaming subscription monthly receipt
  13. Weather emergency alert from National Weather Service
  14. Church/community event schedule update
  15. Credit card statement monthly summary

---

## 8. Senior-Centered UI & Accessibility Guidelines

- **Typography**: 
  - Standard mode: 18px body font.
  - Large mode: 20px body font.
  - Extra Large mode: 24px body font.
- **Touch Targets**: Minimum $48 \times 48\text{px}$ (exceeding standard 40px rules for senior motor control).
- **Audio Feedback**: Text-to-Speech (TTS) integrated on every coach message and scam verdict.
- **Voice Input**: Dedicated high-contrast microphone button (`MicButton`) utilizing speech recognition so seniors do not have to type.
- **Zero-Pill Discipline**: High contrast typography, clear cards, warm reassuring palettes, no confusing technical badges.
- **Emotional Tone**: Reassuring, patient, non-judgmental, emphasizing safety and family connection.

---

## 9. Current Status & Demo Readiness

| Area | Status | Verification & Next Step |
|---|---|---|
| Cloud Functions (6) | Spec defined | Typechecks clean; deploy with `MIN_INSTANCES=1` on demo day |
| Firestore & Storage Rules | Spec defined | Rules formulated; emulator testing pending |
| Lesson Seed Script | Spec defined | 3 micro-lessons + Open Coach ready |
| Mobile / Web App | Shell & screens specified | Senior UI, Voice TTS/STT, Scam Check, Family View |
| Scam Check Test Set | 30 samples defined | Scorer requires $\ge 14/15$ scams and $\ge 12/15$ safe |
| Firebase Configuration | In progress | Provision Auth, Firestore, Storage, Functions, FCM |

---
*End of StartHere Project Specification.*
