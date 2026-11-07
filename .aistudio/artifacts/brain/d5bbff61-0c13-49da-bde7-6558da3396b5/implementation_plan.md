# StartHere — React Native Expo & Firebase Implementation Plan

A senior-centered technology empowerment and fraud protection application built with React Native Expo, backed by Firebase Firestore and Cloud Functions, and evaluated with a developer-side benchmark runner.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Summary of Confirmed Decisions:**
> 1. **Framework & Client**: React Native Expo with universal rendering (native Android/iOS components running seamlessly in browser preview via React Native Web).
> 2. **Persistence & Backend (Option B)**: Firebase Firestore database and Cloud Functions architecture as defined in `docs/SPECIFICATION.md` for real-time safety circle sync, multi-role user profiles, and secure cloud operations.
> 3. **Benchmark Test Runner**: Built as a developer CLI script (`scripts/run-scamcheck-eval.ts`) to benchmark Gemini Flash accuracy against 30 ground-truth samples without cluttering the senior user interface.
> 
> **Architectural Defaults Applied:**
> - **Dual-Role Universal Portal**: The app supports both Senior Mode (accessible high-contrast interface) and Family Companion Portal (alert response and "I've got it" acknowledgment), switchable via role or invitation token.
> - **Scenario Case Architecture**: Lessons run directly on the 50 scenario steps in `lessons.json` modeled after `lesson_step_concept.png`, featuring simulated device scenes, `Legit` vs `Scam` choices, and 1–2 sentence coach explanations.

---

## 1. Overview & Core Concept

- **What It Does**: StartHere provides older adults with a patient, jargon-free digital coach that teaches smartphone skills through realistic scenario cases, an instant fraud analyzer for suspicious messages and screenshots, and an emergency family safety net that notifies loved ones with one tap.
- **Target Audience & Persona**:
  - **Seniors (Primary Users)**: Older adults (65+) navigating smartphones, text messages, and digital services who value high legibility, tactile clarity, patience, and safety from fraud.
  - **Family Members & Carers (Safety Circle)**: Adult children and caregivers who receive immediate alerts when scams or panic events occur, with the ability to acknowledge ("I've got it") or dial directly.
- **Key Value**: Replaces anxiety and isolation with confidence, autonomy, and family protection—eliminating confusing tech jargon and stopping scams before financial harm occurs.

---

## 2. User Experience & Visual Design

### Design Constitution & Senior Ergonomics
- **Touch Target Math**: Every interactive button, tab, and card has a minimum hit target of **$48 \times 48\text{px}$** (with primary action CTAs at **$56\text{px}–$58\text{px}$**).
- **Dynamic Text Scaling**: 3 senior-friendly font size presets:
  - Standard (18px body)
  - Large (20px body — default recommended)
  - Extra Large (24px body)
- **Zero-Pill Discipline**: No tiny badge capsules, cryptic status chips, or metadata tags. Information is communicated through clear typography, color accents, and full-width card structures.
- **Color Palette & Contrast**:
  - Reassuring Deep Slate (`#0F172A`) on warm Cream/White surfaces (`#F8FAFC`).
  - Trust Blue (`#1E40AF`) for coach guidance and safe navigation.
  - Caution Amber (`#D97706`) for ambiguous messages requiring double-checking.
  - High-Alert Crimson (`#DC2626`) for detected scams and emergency help.
  - Reassuring Emerald (`#059669`) for verified safe communications.

### Core Screens & Interaction Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SENIOR NAVIGATION FLOW                          │
│                                                                        │
│   [Screen 1: Welcome & Text Size]                                      │
│                  │                                                     │
│                  ▼                                                     │
│   [Screen 2: Senior Home Hub] ──┬──► [Screen 3: Lesson Catalog]        │
│                                 │                 │                    │
│                                 │                 ▼                    │
│                                 │    [Screen 4: Scenario Case Turn]    │
│                                 │                 │                    │
│                                 │                 ▼                    │
│                                 │    [Screen 5: Lesson Completion]     │
│                                 │                                      │
│                                 ├──► [Screen 6: Scam Check Input]      │
│                                 │                 │                    │
│                                 │                 ▼                    │
│                                 │    [Screen 7: Scam Verdict Card]     │
│                                 │                                      │
│                                 └──► [Screen 8: Family Safety Circle]  │
│                                                   │                    │
│                                                   ▼                    │
│                                      [Screen 9: Family Portal View]    │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Screen 1: Welcome & Onboarding**:
   - Immediate text size selector (Standard 18px, Large 20px, Extra Large 24px) with live sample preview.
   - Senior vs. Family Member role selection.
2. **Screen 2: Senior Home Hub**:
   - 3 large, unmissable hero cards:
     - 🎓 **Learn Something New**: Patient guided scenario lessons.
     - 🛡️ **Check a Suspicious Message**: Instant photo/text scam analyzer.
     - 👨‍👩‍👧 **Family Safety Circle**: View trusted contacts or tap 🚨 **Ask Family for Help**.
3. **Screen 3: Lesson Catalog**:
   - Clean list of 10 micro-lessons grouped by track (Basics, Everyday, Safety) with clear titles and estimated times (3–6 minutes).
4. **Screen 4: Active Lesson Turn (Interactive Coach — Scenario Case)**:
   - **State 4A (Challenge Scene)**: Realistic device simulation (SMS, WhatsApp, email, popup, or call) with sender contact and message bubble.
   - Challenge prompt: *"Is this a legit message or a scam?"*.
   - Two oversized decision buttons: `[ A. Legit ]` and `[ B. Scam ]` ($\ge 58\text{px}$ height).
   - **State 4B (Instant Coach Explanation & Signals)**: High-visibility verdict header (`🎉 Spot on!` or `⚠️ Not quite`), 1–2 plain sentences explanation, bulleted warning signs, safe next step, and `[ NEXT QUESTION ➔ ]`.
5. **Screen 5: Lesson Completed (Summary Card)**:
   - Celebratory completion view with user's score (e.g., 5/5 correct), key safety takeaways synthesized from `finishTemplate`, and action to practice again or return home.
6. **Screen 6: Instant Scam Check Input**:
   - Dual input options: Paste suspicious text/link or upload a photo/screenshot.
   - Large bold action button: `[ 🔍 CHECK THIS MESSAGE NOW ]`.
7. **Screen 7: Scam Verdict States**:
   - **🔴 Likely Scam**: Red banner, plain-language headline, 2-sentence explanation, immediate safe action (*"Do not tap link. Delete message."*), and button to auto-alert family.
   - **🟡 Caution**: Amber banner, unverified sender notice, safe verification advice.
   - **🟢 Looks Safe**: Green banner, verified routine communication explanation.
8. **Screen 8: Family Safety Circle**:
   - One-tap 🚨 **Ask Family for Help Now** emergency alert trigger.
   - Contact cards for active family members with direct call buttons.
   - Generate single-use 32-character invitation tokens for new family members.
9. **Screen 9: Family Member / Carer Companion View**:
   - Immediate notification feed of alerts sent by the senior.
   - Two-way response loop: **"✅ I've got it — handling now"** button (stamps `ackAt` and reassures the senior) and **"📞 Call [Senior]"** shortcut.
10. **Screen 10: Settings & Accessibility**:
    - Text size adjustment, High Contrast mode toggle, and automatic family alerting toggle on high-risk scams.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: React Native Expo Architecture**:
  - *Chosen Approach*: Build using React Native Expo primitives (`View`, `Text`, `Pressable`, `ScrollView`, `StyleSheet`, Lucide icons). Run universally across web preview (via React Native for Web) and mobile devices.
  - *Why*: Allows true cross-platform mobile delivery for iOS and Android while offering instant interactive browser preview for AI Studio testing.
  - *Trade-Off*: Web bundler requires clean React Native Web aliasing and responsive container clamping so desktop browsers display a natural mobile frame with desktop tablet responsiveness.
- **Decision 2: Option B — Firebase Firestore & Cloud Architecture**:
  - *Chosen Approach*: Provision Firebase via `show_aistudio_ui` and `rpc_action (ProvisionFirebase)`. Wire Firestore collections (`users`, `trustedContacts`, `alerts`, `sessions`, `lessons`, `scamChecks`) with declarative security rules.
  - *Why*: Enables genuine cross-device persistence, reliable push notification pipelines, and multi-device family circle synchronization.
- **Decision 3: Developer Script-Side Evaluation Runner**:
  - *Chosen Approach*: Implement `scripts/run-scamcheck-eval.ts` reading `scamcheck-testset.csv` and validating against Gemini Flash.
  - *Why*: Keeps the senior user interface 100% clean and free of confusing developer metric tables while maintaining strict fraud detection accuracy standards ($\ge 93.3\%$ scam recall, $\ge 80.0\%$ safe specificity).
- **Decision 4: Scenario-Case Interactive Coach**:
  - *Chosen Approach*: Structure lessons as practical binary decisions (`Legit` vs `Scam`) using realistic visual simulations and instant feedback rather than open-ended conversational text chat.
  - *Why*: Eliminates typing intimidation for seniors, reinforces pattern recognition of fraud clues, and provides deterministic safety training.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT NATIVE EXPO CLIENT                        │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │   Senior UI Layer: BigButton, ScenarioCard, VerdictBanner      │   │
│   │   Dynamic Theme Provider: Standard (18px) | Large | XL         │   │
│   │   Role Navigation: Senior Shell <─── Switch ───> Family Portal │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                         Firebase SDK & HTTPS
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    FIREBASE BACKEND & SERVICES (OPTION B)              │
│                                                                        │
│   1. Firestore Collections:                                            │
│      • users/{uid}               • trustedContacts/{contactId}         │
│      • sessions/{sessionId}      • alerts/{alertId}                    │
│      • lessons/{lessonId}        • scamChecks/{checkId}                │
│                                                                        │
│   2. AI Services / Cloud Endpoints:                                    │
│      • coachTurn                 - Scenario feedback & summary         │
│      • scamCheck                 - Multimodal Gemini Flash analyzer    │
│      • sendAlert / ackAlert      - Family push alerts & status sync    │
│      • acceptInvite              - 32-char crypto token validation     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        GEMINI FLASH AI ENGINE                          │
│   - Model: gemini-3.8-flash (API Key via server proxy)                 │
│   - Scam Check: Temp 0.1, strict JSON schema, fail-closed security     │
│   - Tech Coach: Temp 0.4, 1–2 sentence clamp, jargon blocklist retry   │
│   - Pre-AI Interceptor: Regex catches SSNs, cards, passwords before AI │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App Root
├── SafeAreaProvider
│   └── ThemeProvider (FontSize: 18/20/24, HighContrast)
│       └── RoleGate (Senior vs. Family Member)
│           ├── SeniorAppShell
│           │   ├── TopNavBar (Settings [Aa], Back button)
│           │   ├── ScreenRouter
│           │   │   ├── WelcomeScreen (Font selector, role)
│           │   │   ├── HomeScreen (3 Hero Action Cards)
│           │   │   ├── LessonCatalogScreen (10 topic cards)
│           │   │   ├── ScenarioLessonScreen (State 4A & 4B)
│           │   │   ├── LessonSummaryScreen (Score & rules)
│           │   │   ├── ScamCheckScreen (Text/Image input)
│           │   │   ├── ScamResultScreen (Red/Yellow/Green verdict)
│           │   │   ├── FamilyCircleScreen (Contacts & 🚨 Help button)
│           │   │   └── SettingsScreen (Text size, contrast, auto-alert)
│           │   └── BottomStickyAlertBar (Quick emergency trigger)
│           │
│           └── FamilyCompanionShell
│               ├── FamilyPortalHeader (Senior status summary)
│               ├── AlertHistoryList (Live scam & panic alert stream)
│               └── AlertResponseCard ("I've got it" ack + Phone dialer)
```

### Firestore Data Model Schema

```typescript
// users/{uid}
interface UserProfile {
  uid: string;
  role: 'senior' | 'family';
  displayName: string;
  phone?: string;
  fontSizePreference: 'standard' | 'large' | 'extra_large';
  highContrast: boolean;
  autoAlertOnScam: boolean;
  createdAt: number;
}

// users/{seniorUid}/trustedContacts/{contactId}
interface TrustedContact {
  id: string;
  seniorUid: string;
  name: string;
  relationship: string;      // e.g., "Daughter", "Son"
  phone: string;
  status: 'invited' | 'active';
  inviteToken?: string;      // 32-character crypto token
  linkedUid?: string;
  linkedAt?: number;
}

// alerts/{alertId}
interface AlertItem {
  id: string;
  seniorUid: string;
  seniorName: string;
  seniorPhone?: string;
  type: 'scam_detected' | 'manual_help_request';
  verdict: 'likely_scam' | 'caution' | 'looks_safe';
  headline: string;
  summary: string;
  actionTaken: string;
  sentAt: number;
  ackAt?: number;            // Timestamp when family tapped "I've got it"
  acknowledgedBy?: string;
}

// users/{seniorUid}/sessions/{sessionId}
interface CoachSession {
  id: string;
  seniorUid: string;
  lessonId: string;
  currentStep: number;
  totalSteps: number;
  status: 'active' | 'completed';
  scenarioAnswers: Array<{
    stepOrder: number;
    selectedAnswer: 'legit' | 'scam';
    correctAnswer: 'legit' | 'scam';
    isCorrect: boolean;
  }>;
  score: number;             // e.g., 5 of 5
  startedAt: number;
  completedAt?: number;
}

// scamChecks/{checkId}
interface ScamCheckRecord {
  id: string;
  seniorUid: string;
  inputType: 'text' | 'image';
  previewText: string;
  verdict: 'likely_scam' | 'caution' | 'looks_safe';
  headline: string;
  explanation: string;
  action: string;
  signals: string[];
  riskScore: number;
  alertSent: boolean;
  createdAt: number;
}
```

---

## 5. Phased Implementation Strategy

- **Phase 1: Project Setup & Universal Expo Foundation**:
  - Configure React Native Expo with React Native Web support for seamless browser preview.
  - Build senior design system tokens (touch targets $\ge 48\text{px}$, typography scaling 18/20/24px, high-contrast palette).
  - Implement reusable UI primitives: `AppPage`, `BigButton`, `ScenarioCard`, `VerdictBanner`.
- **Phase 2: Firebase Integration & Seeding (Option B)**:
  - Present Firebase UI confirmation flow via `show_aistudio_ui` / `ProvisionFirebase` RPC.
  - Configure Firestore rules, auth initialization, and data services.
  - Seed Firestore `lessons` collection with all 10 lessons and 50 scenario steps from `lessons.json`.
- **Phase 3: Interactive Scenario Coach (Screen 4)**:
  - Implement State 4A challenge scene (simulated phone container with SMS/WhatsApp/email bubbles).
  - Implement two-button choice flow (`A. Legit` vs `B. Scam`).
  - Implement State 4B instant coach explanation, warning signals, and score tracking.
  - Wire pre-AI sensitive number interceptor and 1–2 sentence clamp.
- **Phase 4: Multimodal Scam Check & Family Safety Circle**:
  - Implement text and image upload scam analysis with Gemini Flash (temp 0.1, strict schema).
  - Build color-coded verdict screens (Likely Scam, Caution, Looks Safe).
  - Implement 1-tap family help alert, auto-alert on high-risk scams, and the Family Companion Portal view.
- **Phase 5: Developer Evaluation Script & Polish**:
  - Implement `scripts/run-scamcheck-eval.ts` running the 30 samples from `scamcheck-testset.csv` against Gemini and reporting recall/specificity against benchmark gating criteria.
  - Verify responsive touch ergonomics and compilation.
