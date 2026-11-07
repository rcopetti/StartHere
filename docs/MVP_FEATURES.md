# StartHere — MVP Feature Specification

> **Document Version**: MVP Scope 1.1  
> **Source Document**: Derived from `docs/SPECIFICATION.md` & `docs/HANDOFF.md`  
> **Date**: November 2026  
> **Special Directives**:
> 1. **Voice Engine Excluded** for MVP (tactile, text-first accessible interface).
> 2. **Privacy & Screenshot Lifecycle Excluded** for MVP (no hourly purge cron, no temporary signed URLs, no automated GDPR deletion cascade).

---

## 1. Executive Summary & Scope Strategy

**StartHere** is an accessibility-first technology empowerment and fraud protection platform designed specifically for older adults (seniors) and their trusted family circles.

For the **Minimum Viable Product (MVP)**, the platform focuses on delivering rock-solid confidence, clarity, and safety with a streamlined operational footprint:
1. **No Voice Engine**: All speech-to-text (STT) mic dictation and text-to-speech (TTS) audio playback are avoided for the MVP. The UI relies on high-legibility typography, clear on-screen buttons, preset response chips, and concise 1–2 sentence text guidance.
2. **No Privacy & Screenshot Lifecycle Services**: Automated Cloud Storage screenshot deletion crons (`purgeScreenshots`), dynamic 1-hour signed URL generation, and the automated recursive GDPR wipe (`deleteMyData`) are deferred post-MVP. This removes complex IAM permissions (such as Service Account Token Creator) and background scheduler dependencies for the demo.

---

## 2. MVP Scope Matrix: Included vs. Excluded

| Feature / Domain | Included in MVP? | MVP Implementation Details | Deferred Post-MVP |
|---|:---:|---|---|
| **Voice Input (STT / Mic)** | ❌ **Excluded** | Oversized text input, pre-set suggestion chips, and clear touch controls. | Microphone dictation (`speech_to_text`, on-device whisper/STT). |
| **Voice Output (TTS / Audio)** | ❌ **Excluded** | High-contrast text, clear status cards, and large font size options. | Spoken coaching voice (`flutter_tts`, audio streaming). |
| **Privacy & Screenshot Lifecycle** | ❌ **Excluded** | Text-based alerts and direct image analysis without background lifecycle daemons. | Hourly screenshot purge cron (`purgeScreenshots`), 1-hour signed URLs for alerts, and `deleteMyData` GDPR cascade deletion. |
| **Patient Tech Coach (`coachTurn`)** | ✅ **Included** | Text-based guided micro-lessons & open Q&A; strict 1–2 sentence clamp; jargon blocklist retry. | Multi-modal live conversation. |
| **Pre-AI Sensitive PII Guard** | ✅ **Included** | Client/backend regex interceptor catching SSNs, card numbers, passwords before AI. | Advanced PII entity detection models. |
| **Instant Scam Check (`scamCheck`)** | ✅ **Included** | Text & image scam analysis; deterministic verdict (`likely_scam`, `caution`, `looks_safe`). | Real-time automated caller ID / live call audio interception. |
| **Family Safety Circle (`sendAlert`)** | ✅ **Included** | 1-tap manual help alert, auto-alert on scam, FCM notifications, and "I've got it" acknowledgment. | SMS carrier fallback gateway (e.g. Twilio). |
| **Family Invite System (`acceptInvite`)** | ✅ **Included** | 32-character single-use invite tokens, contact linkage, web-accessible family portal. | Dynamic native deep-linking / universal links. |
| **Senior Accessible UI System** | ✅ **Included** | 3 dynamic text sizes (18px, 20px, 24px), $\ge 48\times 48\text{px}$ touch targets, zero-pill layout. | Voice accessibility reader. |
| **30-Sample Evaluation Suite** | ✅ **Included** | Benchmark verification requiring $\ge 93.3\%$ scam recall and $\ge 80.0\%$ safe specificity. | Community-contributed scam datasets. |

---

## 3. Core MVP Features Breakdown

### 3.1 Pillar 1: The Patient Tech Coach (Interactive Scenario Practice)
The Tech Coach provides calm, scenario-based digital tutoring modeled after `foundation/starthere-dev-handoff/lesson_step_concept.png`. Instead of passive reading or overwhelming freeform typing, seniors practice evaluating realistic digital scenarios in a safe environment.

- **Interactive Scenario Cases (Legit vs. Scam)**:
  - **Authentic Scene Simulation**: Every turn displays a simulated mobile scene (text message, WhatsApp bubble, incoming call, email notification, or browser pop-up).
  - **Clear Two-Choice Decision**: Seniors are asked: *"Is this a legit message or a scam?"* with two oversized, tactile buttons: `[ A. Legit ]` and `[ B. Scam ]` ($\ge 58\text{px}$ touch targets).
  - **Instant Reassuring Feedback**: Immediately confirms whether the choice is correct (`🎉 Spot on!` or `⚠️ Not quite`) and explains why in 1–2 plain sentences with no technical jargon.
  - **Key Warning Signals & Safe Actions**: Highlights the exact clues (e.g. secret PIN reset code, artificial urgency, foreign numbers) and gives the concrete next step.
- **Curated Guided Micro-Lessons**:
  - `fake-bank-text`: *Spot a fake bank text* (PIN reset codes, fraud alert shortcodes, locked account threats, deposit receipts).
  - `package-delivery-text`: *The package delivery text* (Fake $1.99 redelivery fees, official UPS delivery confirmations, address phishing).
  - `family-emergency-call`: *When “family” calls in trouble* (Grandparent bail emergency, everyday family check-in, wire transfer threats).
  - `tech-support-popup`: *The scary computer pop-up* (Flashing virus alarm with 1-800 number, real Windows update, remote access fraud).
  - `thank-you-note`: *Write a thank-you note* (Real family notes vs. fake downloadable e-greeting card attachments).
- **"Ask Me Anything" (Open Coach)**:
  - Free-form tech question field where seniors can ask anything (e.g., *"How do I turn up my ringer?"*, *"What does this cloud icon mean?"*).
- **Strict Anti-Overwhelm Guardrails**:
  - **1–2 Sentence Clamp**: Every coach response is hard-limited to 1–2 short, plain sentences.
  - **Jargon Blocklist with Automatic Retry**: Terms like `cache`, `URL`, `cookie`, `DNS`, `API`, `RAM`, `operating system` trigger an automatic backend retry instructing the model to rephrase in everyday terms.
  - **Pre-AI Credential & PII Interceptor**:
    - Regex interceptor catches Social Security Numbers, 13–16 digit credit/debit card numbers, and passwords **before** reaching the AI engine.
    - Credentials are never logged or stored in the database.
    - Immediately outputs a reassuring safety explanation:
      > *"For your privacy and security, please never share passwords, cards, or personal numbers. Your information is safe with you, and I will never ask for them."*
- **Lesson Completion Synthesis**:
  - Once all scenario steps are answered, synthesizes a congratulatory summary card reporting the senior's score (e.g., 5/5 correct) and key takeaway rules based on the lesson's `finishTemplate`.


---

### 3.2 Pillar 2: Instant Scam Check
A fast, conservative analysis tool for suspicious messages, emails, and screenshots.

- **Dual Input Modes**:
  - **Pasted Text / Message Input**: Seniors can paste or type suspicious text, links, or emails.
  - **Screenshot / Photo Upload**: Seniors can upload an image or take a screenshot of a suspicious screen (analyzed with an untrusted content wrapper to protect against prompt injection, without requiring complex cloud storage lifecycle daemons).
- **Clear, Deterministic Verdict Taxonomy**:
  - 🔴 **Likely Scam (`likely_scam`)**: High fraud confidence (risk score $\ge 70$). Displays immediate red caution card: *"Stop. Do not reply or send money."*
  - 🟡 **Caution (`caution`)**: Ambiguous or unverified source (risk score $35–69$). Recommends independent verification.
  - 🟢 **Looks Safe (`looks_safe`)**: Standard legitimate communication (risk score $< 35$).
- **Structured Scam Result Output**:
  - Plain-language **Headline** (e.g., *"Urgent Fake Delivery Notice"*).
  - Two-sentence **Explanation** detailing the core red flag.
  - Concrete **Immediate Action Step** (e.g., *"Do not click the link. Delete the message."*).
  - Highlighting of identified **Signals** (e.g., *"Artificial urgency"*, *"Demands immediate payment"*, *"Unfamiliar domain"*).
- **Fail-Closed Security**:
  - Malformed AI outputs or network timeouts trigger a safe fallback screen rather than presenting an unverified "safe" verdict.
- **Configurable Auto-Alert Integration**:
  - If `autoAlertOnScam` is enabled in user settings, any `likely_scam` verdict automatically dispatches a text alert to linked family members.

---

### 3.3 Pillar 3: Family Safety Circle
Bridges the senior with their adult children, caregivers, or trusted neighbors.

- **Simple Contact Invitation & Linking**:
  - Senior generates a secure, 32-character single-use invite token (`inviteToken`).
  - Family member opens the link in their browser/app, accepts the invite via `acceptInvite`, and is granted the `family` role.
  - Contact status transitions from `invited` to `active`.
- **One-Tap Emergency Alert (`sendAlert`)**:
  - A prominent, always-accessible button on the home screen: **"Ask Family for Help"**.
  - Dispatches an instant high-priority notification to all linked family devices.
- **Family Dashboard & Notification Reception**:
  - Family members receive alert notifications with senior's name, phone, timestamp, verdict, headline, and action summary.
  - *MVP Simplification*: Alerts transmit the clear textual scam verdict and warning directly, without generating complex 1-hour signed screenshot URLs.
- **Two-Way Reassurance Loop**:
  - Family members have two primary responses:
    1. **"I've got it" Button**: Stamps `ackAt` in Firestore; immediately informs the senior on their screen that family is handling it.
    2. **"Call [Senior]" Button**: Direct phone dialer link.

---

### 3.4 Pillar 4: Senior-Centered Accessible UI (Text & Touch First)
Because the voice engine is avoided for the MVP, the visual and tactile interface is engineered for effortless legibility and ease of use.

- **Dynamic Typography Modes**:
  - **Standard**: 18px body font.
  - **Large**: 20px body font.
  - **Extra Large**: 24px body font.
- **High Motor-Control Touch Ergonomics**:
  - Minimum touch target size: **$48 \times 48\text{px}$** (exceeding standard mobile guidelines).
  - Generous spacing between interactive elements to prevent accidental taps.
  - Prominent, colorful `BigButton` action elements.
- **Zero-Pill Discipline & Visual Clarity**:
  - Warm, non-intimidating color palette with high contrast ratios (WCAG AAA compliant text).
  - No cryptic icon-only buttons, tech jargon, or nested settings menus.
  - Every button has both a clear icon and an explicit plain-text label.
- **Simplified Screen Structure**:
  1. **Home Screen**: 3 primary large action cards:
     - 🎓 *Learn Something New* (Tech Coach)
     - 🛡️ *Check a Suspicious Message* (Scam Check)
     - 👨‍👩‍👧 *Family Safety Circle* (Contacts & Urgent Alert)
  2. **Learn / Coach Screen (Active Scenario Turn)**: Progress indicator ("Question X of 5"), simulated device scene card (SMS, WhatsApp, email, popup), "Is this a legit message or a scam?" prompt, large `[ A. Legit ]` and `[ B. Scam ]` buttons, and instant coach explanation feedback card.
  3. **Scam Check Screen**: Single text box or image upload card, large "Check This Message" button, and prominent color-coded verdict banner.
  4. **Family Screen**: Contact cards, pending invites, and alert history.
  5. **Settings Screen**: Font size selector, High Contrast toggle, and Auto-Alert toggle.

---

### 3.5 Pillar 5: Core Security & Rate Limiting (Streamlined for MVP)
Essential protections retained for the MVP while omitting complex deletion and storage pipelines.

- **Strict User Data Isolation**:
  - Firestore security rules ensure users can only access their own documents.
  - Family members only read authorized alert records, never the senior's private lesson conversations or general app activity.
- **Per-User Rate Limiting**:
  - 60 calls per user per hour on interactive endpoints (`coachTurn` and `scamCheck`) to prevent runaway costs or loops.
- **Pre-AI Redaction**:
  - Sensitive PII (card numbers, SSNs, passwords) intercepted and scrubbed before calling AI models.
- **Deferred Post-MVP Items**:
  - *Hourly Screenshot Purge (`purgeScreenshots`)*: Background Cloud Scheduler cron job is omitted.
  - *Temporary Signed URLs*: Avoids Service Account Token Creator IAM configuration.
  - *Right-to-be-Forgotten Wipe (`deleteMyData`)*: Recursive multi-collection deletion cascades are deferred to the production release.

---

## 4. Evaluation & Quality Benchmark for MVP

The MVP includes the deterministic 30-sample test runner (`functions/eval/samples.json`) to validate Gemini's scam detection accuracy prior to deployment.

- **Benchmark Dataset**:
  - **15 Realistic Scams**: Grandparent bail emergency, USPS delivery fee, toll suspension, bank lockout, tech support virus pop-up, Medicare fee, IRS tax warrant, lottery win, Geek Squad renewal, utility shutoff, unauthorized Amazon charge, SSA suspension, crypto romance, missed jury duty, 2FA code theft.
  - **15 Legitimate Messages**: Official bank fraud text, real 2FA code, Medicare enrollment reminder, CVS pharmacy pickup, dentist reminder, UPS porch delivery, family group photo text, utility e-bill, doctor's check-in link, library hold notice, airline boarding pass, streaming receipt, weather emergency alert, community schedule, credit card statement.
- **MVP Pass Criteria**:
  - Scam Detection Recall: **$\ge 14 / 15$ scams flagged ($\ge 93.3\%$)**.
  - Legitimate Message Specificity: **$\ge 12 / 15$ safe messages marked `looks_safe` ($\ge 80.0\%$)**.

---

## 5. Scope Rationale: Why These Exclusions Benefit the MVP

1. **Voice Engine Exclusion**:
   - Eliminates background room noise interference, speech accents, and dropped voice packets during live demos.
   - Avoids browser mic permissions and platform-specific audio session bugs.
   - Empowers seniors to read and absorb answers at their own pace using adjustable font sizes.

2. **Privacy & Screenshot Lifecycle Exclusion**:
   - Eliminates dependency on Google Cloud Scheduler and Pub/Sub cron triggers for hourly purges.
   - Removes the need for GCP `Service Account Token Creator` role required to mint signed Cloud Storage URLs.
   - Keeps alerts lightweight and immediate, delivering the critical fraud verdict directly to family members without media access token latency.
   - Prevents accidental cascading data loss during early demo and testing iterations.
