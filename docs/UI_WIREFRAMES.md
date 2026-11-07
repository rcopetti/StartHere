# StartHere — Mobile UI Wireframes (MVP Specification)

> **Document Status**: Approved MVP Wireframes  
> **Source**: Aligned with `docs/SPECIFICATION.md`, `docs/HANDOFF.md`, and `docs/MVP_FEATURES.md`  
> **Target Platform**: Mobile (Flutter / Responsive Web)  
> **Design Directives**:
> - **Voice Engine Avoided**: All interactions are text-first, high-legibility, and tactile.
> - **Privacy & Lifecycle Deferrals**: Direct text-based alerts without temporary signed URL loaders or purge countdowns.
> - **Senior Ergonomics**: Minimum $48 \times 48\text{px}$ touch targets, zero-pill discipline, high contrast, warm reassuring tone, and dynamic typography (18px–24px).

---

## 1. Design System & Component Guidelines

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SENIOR DESIGN PRINCIPLES                        │
│                                                                        │
│  • Touch Targets:  Minimum 48x48px (BigButton components).             │
│  • Typography:     Standard (18px) | Large (20px) | Extra Large (24px).│
│  • Zero-Pill:      No cryptic mini badges, tech jargon, or pill tags. │
│  • Contrast:       High contrast (Dark Slate on Cream/White or Amber). │
│  • Clarity:        Every button features an explicit icon + verb label.│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Screen 1: Welcome & Onboarding

*Purpose: Welcomes the senior, establishes a calm emotional tone, and allows immediate font size adjustment before proceeding.*

```
┌────────────────────────────────────────────────────────┐
│  StartHere                                      Step 1 │
├────────────────────────────────────────────────────────┤
│                                                        │
│                     👋 Welcome to                      │
│                      StartHere                         │
│                                                        │
│        Your patient helper for using your phone        │
│          and staying safe from tricky messages.        │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│   CHOOSE YOUR TEXT SIZE:                               │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │  ( )  Standard Text (18px)                     │   │
│   ├────────────────────────────────────────────────┤   │
│   │  (•)  Large Text (20px)          [Recommended] │   │
│   ├────────────────────────────────────────────────┤   │
│   │  ( )  Extra Large Text (24px)                  │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
│   PREVIEW:                                             │
│   "This is how your lessons and messages will look."   │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│   WHO IS USING THIS PHONE?                             │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │  [👴 I am a Senior]                            │   │
│   │  I want help with my phone & scam protection   │   │
│   ├────────────────────────────────────────────────┤   │
│   │  [👨‍👩‍👧 I am a Family Member / Carer]             │   │
│   │  I want to link to a loved one's phone         │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │                                                │   │
│   │           [ GET STARTED  ➔ ]                   │   │
│   │           (Height: 56px, High Contrast)        │   │
│   │                                                │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 3. Screen 2: Senior Home Screen (Hub)

*Purpose: The main hub for the senior. Emphasizes 3 primary, unmissable action cards with generous touch spacing and warm color accents.*

```
┌────────────────────────────────────────────────────────┐
│  StartHere                         ⚙️ Settings [Aa]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Good afternoon, Eleanor! ☀️                           │
│  What would you like to do today?                      │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  🎓 LEARN SOMETHING NEW                            │ │
│ │                                                    │ │
│ │  Patient, step-by-step guidance for your phone.    │ │
│ │  Send photos, video call family, or ask anything.  │ │
│ │                                                    │ │
│ │  [ START A LESSON  ➔ ]                             │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  🛡️ CHECK A SUSPICIOUS MESSAGE                     │ │
│ │                                                    │ │
│ │  Got a weird text, bill, or popup?                 │ │
│ │  Check it here to see if it is safe or a scam.     │ │
│ │                                                    │ │
│ │  [ CHECK A MESSAGE NOW  ➔ ]                        │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  👨‍👩‍👧 FAMILY SAFETY CIRCLE                           │ │
│ │                                                    │ │
│ │  Connected with: Sarah (Daughter), Tom (Son)       │ │
│ │                                                    │ │
│ │  [ 🚨 ASK FAMILY FOR HELP ]                         │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 4. Screen 3: Patient Tech Coach — Lesson Catalog

*Purpose: Displays curated, bite-sized lessons with clear titles and zero confusing tech terminology.*

```
┌────────────────────────────────────────────────────────┐
│  ‹ Back to Home             🎓 Tech Coach              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Choose a topic to practice at your own pace:          │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  💌 Sending a Thank-You Note & Photo               │ │
│ │  Learn how to type a warm note and attach a photo  │ │
│ │  from your camera roll.                            │ │
│ │  Steps: 4 short steps • 3 minutes                  │ │
│ │  [ START THIS LESSON ]                             │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  🔍 Spotting Suspicious Links & Texts              │ │
│ │  Learn how to spot fake delivery alerts and bank   │ │
│ │  messages before you tap them.                     │ │
│ │  Steps: 3 short steps • 2 minutes                  │ │
│ │  [ START THIS LESSON ]                             │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  📹 Making a Video Call with Family                │ │
│ │  How to turn on your camera and speak face-to-face │ │
│ │  with your children and grandchildren.             │ │
│ │  Steps: 3 short steps • 3 minutes                  │ │
│ │  [ START THIS LESSON ]                             │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  💬 Ask Me Anything (Open Coach)                   │ │
│ │  Have a general phone question? Type it here and   │ │
│ │  get a simple, jargon-free answer.                 │ │
│ │  [ ASK A QUESTION ]                                │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 5. Screen 4: Active Lesson Turn (Interactive Coach — Scenario Case)

*Purpose: Guides the senior through realistic, bite-sized scenario cases (modeled after `foundation/starthere-dev-handoff/lesson_step_concept.png`). Each turn presents an authentic simulated scene (text message, WhatsApp, email, or system dialog), prompts the senior with "Is this a legit message or a scam?", and accepts a simple two-choice decision (`Legit` vs. `Scam`).*

### State 4A: Challenge Scene (Unanswered)

```
┌────────────────────────────────────────────────────────┐
│  [‹ Back]          🎓 Spot a Fake Bank Text        [✕] │
├────────────────────────────────────────────────────────┤
│  [■■■■■■■■░░░░░░░░░░░░░░░░░░░░░░░░░░░] Question 2 of 5  │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📱 SIMULATED PHONE SCENARIO:                       │ │
│ │ ┌────────────────────────────────────────────────┐ │ │
│ │ │ ‹ 1049               👤                        │ │ │
│ │ │               12 (16) 555-0132 ›               │ │ │
│ │ │                                                │ │ │
│ │ │                  Text Message                  │ │ │
│ │ │                  Today 6:08 PM                 │ │ │
│ │ │                                                │ │ │
│ │ │  ┌──────────────────────────────────────────┐  │ │ │
│ │ │  │ WhatsApp: We have received a request     │  │ │ │
│ │ │  │ to reset your PIN                        │  │ │ │
│ │ │  │                                          │  │ │ │
│ │ │  │ Please send the 6-digit code             │  │ │ │
│ │ │  │ to verify this request:                  │  │ │ │
│ │ │  └──────────────────────────────────────────┘  │ │ │
│ │ └────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│   ❓ Is this a legit message or a scam?                │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │   [ A.  Legit ]                                    │ │
│ │   (Min Height: 58px, Large 20px Bold, White Card)  │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │   [ B.  Scam ]                                     │ │
│ │   (Min Height: 58px, Large 20px Bold, White Card)  │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  Progress: Question 2/5                                │
└────────────────────────────────────────────────────────┘
```

---

### State 4B: Instant Coach Explanation & Verdict Feedback

*Trigger: Immediately shown after the senior taps Option A (Legit) or Option B (Scam).*

```
┌────────────────────────────────────────────────────────┐
│  [‹ Back]          🎓 Spot a Fake Bank Text        [✕] │
├────────────────────────────────────────────────────────┤
│  [■■■■■■■■░░░░░░░░░░░░░░░░░░░░░░░░░░░] Question 2 of 5  │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  🎉 SPOT ON! THIS IS A SCAM                        │ │
│ │  (High-visibility Emerald / Amber feedback banner) │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🤖 PATIENT COACH EXPLANATION:                      │ │
│ │                                                    │ │
│ │ "WhatsApp will never ask you to reply with your    │ │
│ │  6-digit verification code. If someone asks for    │ │
│ │  your code, they are trying to steal your account."│ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  🔍 WARNING SIGNS IN THIS SCENE:                       │
│  • Requests secret 6-digit PIN reset code              │
│  • Unsolicited message from personal unknown number    │
│  • Artificial verification pressure                    │
│                                                        │
│  👉 SAFE NEXT STEP:                                    │
│  Never share verification codes with anyone.           │
│  Delete or ignore the message.                         │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │         [ NEXT QUESTION ➔  (3 of 5) ]              │ │
│ │         (Min Height: 56px, High Contrast Accent)   │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---


## 6. Screen 5: Lesson Completed (Summary Card)

*Purpose: Celebrates progress, reinforces key takeaways, and builds confidence.*

```
┌────────────────────────────────────────────────────────┐
│  Lesson Completed!                              🎉     │
├────────────────────────────────────────────────────────┤
│                                                        │
│                   🌟 Great Job, Eleanor!               │
│                                                        │
│       You finished: "Sending a Thank-You Note & Photo" │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  WHAT YOU LEARNED TODAY:                           │ │
│ │                                                    │ │
│ │  ✓ How to open your Messages app                   │ │
│ │  ✓ How to pick a family contact                    │ │
│ │  ✓ How to attach a favorite picture                │ │
│ │  ✓ How to press the send button with confidence    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  "You can practice this lesson whenever you want, or   │
│   try sending a real photo to Sarah right now!"        │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │         [ PRACTICE ANOTHER TOPIC ]                 │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │         [ RETURN TO HOME SCREEN ]                  │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 7. Screen 6: Instant Scam Check — Input Screen

*Purpose: Clear, reassuring entry screen where seniors can paste a text or upload an image without confusing file managers.*

```
┌────────────────────────────────────────────────────────┐
│  ‹ Back to Home             🛡️ Scam Check             │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Check a Suspicious Message                            │
│  Not sure if a text or email is real? We can check it. │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│  OPTION A: PASTE OR TYPE THE MESSAGE                   │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Example: "USPS: Your package cannot be delivered   │ │
│ │ until you pay a $2.95 fee. Tap here to pay..."     │ │
│ │                                                    │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│   [ 📋 Paste Copied Text ]                             │
│                                                        │
│ ─────────────────── OR ──────────────────────────────── │
│                                                        │
│  OPTION B: UPLOAD A PICTURE OR SCREENSHOT              │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  📷 [ Choose Photo from Gallery ]                  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │            [ 🔍 CHECK THIS MESSAGE NOW ]           │ │
│ │            (Min Height: 54px, Bold Blue)           │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  ℹ️ We never store your passwords or banking details.   │
└────────────────────────────────────────────────────────┘
```

---

## 8. Screen 7: Scam Verdict States

### State 7A: 🔴 Likely Scam (High Risk)
*Purpose: Clear, unmissable red warning banner that stops the senior from clicking links or paying money.*

```
┌────────────────────────────────────────────────────────┐
│  ‹ Check Another            🛡️ Scam Result            │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  ⛔ STOP — THIS LOOKS LIKE A SCAM                  │ │
│ │  Risk Rating: High (85% Suspicious)                │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  HEADLINE:                                             │
│  Fake Package Delivery Fee                             │
│                                                        │
│  WHAT THIS MEANS:                                      │
│  The post office does not send texts asking for card   │
│  payments to deliver a package. This is a common trick │
│  used to steal bank card details.                      │
│                                                        │
│  RECOMMENDED ACTION:                                   │
│  👉 Do not tap the link. Delete the message now.       │
│                                                        │
│  WARNING SIGNS FOUND:                                  │
│  • Fake urgent delivery deadline                       │
│  • Unfamiliar website link                             │
│  • Asks for unexpected money                           │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  [ 🚨 NOTIFY FAMILY ABOUT THIS SCAM ]               │ │
│ │  (Sends an instant text summary to Sarah and Tom)  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  [ 🗑️ I DELETED THE MESSAGE — I'M ALL SET ]         │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### State 7B: 🟡 Caution (Uncertain / Proceed with Care)

```
┌────────────────────────────────────────────────────────┐
│  ‹ Check Another            🛡️ Scam Result            │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  ⚠️ CAUTION — PROCEED CAREFULLY                    │ │
│ │  Risk Rating: Medium (45% Suspicious)              │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  HEADLINE:                                             │
│  Unverified Bank or Account Notice                     │
│                                                        │
│  WHAT THIS MEANS:                                      │
│  This message mentions your account, but the sender    │
│  number is unfamiliar.                                 │
│                                                        │
│  RECOMMENDED ACTION:                                   │
│  👉 Do not call the number in the text. Call the phone │
│     number on the back of your bank card instead.      │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  [ 👨‍👩‍👧 ASK FAMILY TO DOUBLE-CHECK ]                  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### State 7C: 🟢 Looks Safe

```
┌────────────────────────────────────────────────────────┐
│  ‹ Check Another            🛡️ Scam Result            │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  ✅ LOOKS SAFE                                      │ │
│ │  Risk Rating: Low (Safe Message)                   │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  HEADLINE:                                             │
│  Standard Medical or Pharmacy Reminder                 │
│                                                        │
│  WHAT THIS MEANS:                                      │
│  This matches typical reminder notices sent by clinics │
│  and pharmacies for upcoming appointments or pickups.  │
│                                                        │
│  RECOMMENDED ACTION:                                   │
│  👉 You can safely review your appointment details.    │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  [ BACK TO HOME ]                                  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 9. Screen 8: Family Safety Circle (Senior View)

*Purpose: Lets the senior see who is protecting them and gives a one-touch panic/help button.*

```
┌────────────────────────────────────────────────────────┐
│  ‹ Back to Home             👨‍👩‍👧 Family Circle          │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │      🚨 ASK FAMILY FOR HELP NOW                    │ │
│ │      Tap here to send an urgent help alert to      │ │
│ │      Sarah and Tom immediately.                    │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  YOUR TRUSTED CONTACTS (2):                            │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  👩 Sarah Miller (Daughter)           ✅ Active     │ │
│ │  Phone: (555) 234-5678                             │ │
│ │  [ 📞 Call Sarah ]                                 │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  👨 Tom Miller (Son)                  ✅ Active     │ │
│ │  Phone: (555) 876-5432                             │ │
│ │  [ 📞 Call Tom ]                                   │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  ➕ Invite Another Family Member                   │ │
│ │  Share an invite link with a family member to add  │ │
│ │  them to your safety circle.                       │ │
│ │  [ SEND INVITATION LINK ]                          │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 10. Screen 9: Family Member / Carer View (Mobile Portal)

*Purpose: The screen seen by adult children or caregivers upon receiving a push notification.*

```
┌────────────────────────────────────────────────────────┐
│  StartHere Family Portal               Logged in as:   │
│  Protected Senior: Eleanor Miller      Sarah (Daughter)│
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  🚨 INCOMING ALERT: SCAM DETECTED                  │ │
│ │  Received: Today at 2:14 PM                        │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  SENIOR DETAILS:                                       │
│  Eleanor Miller • (555) 345-6789                       │
│                                                        │
│  ALERT SUMMARY:                                        │
│  🔴 Verdict: Likely Scam (Risk: 85%)                   │
│  Headline: Fake Package Delivery Fee                   │
│  Explanation: Eleanor received a text claiming USPS    │
│  requires $2.95 to deliver a package.                  │
│                                                        │
│  STATUS:                                               │
│  🟡 Awaiting acknowledgment                            │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│  CHOOSE YOUR ACTION:                                   │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │      [  ✅ I'VE GOT IT — HANDLING NOW  ]           │ │
│ │      (Instantly notifies Mom that you are on it)   │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │      [  📞 CALL ELEANOR (MOM)  ]                   │ │
│ │      (Opens phone dialer directly)                 │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 11. Screen 10: Settings & Accessibility

*Purpose: Allows easy customization of text size, contrast, and automatic family alerting.*

```
┌────────────────────────────────────────────────────────┐
│  ‹ Back to Home             ⚙️ Settings               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  TEXT DISPLAY SIZE:                                    │
│  Choose the size that is easiest for your eyes:        │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ( ) Standard (18px)                              │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ (•) Large (20px)                   [Active]      │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ ( ) Extra Large (24px)                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│  CONTRAST & COLORS:                                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ High Contrast Mode               [ ON / OFF ]    │  │
│  │ Extra dark text on light backgrounds             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│  AUTOMATIC SAFETY ALERTS:                              │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Auto-Alert Family on Scams       [ ON / OFF ]    │  │
│  │ Automatically sends a text summary to your       │  │
│  │ family circle when a high-risk scam is detected. │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│  ABOUT & PRIVACY:                                      │
│  • StartHere Version 1.0 (MVP)                         │
│  • All data is protected and private                   │
│  • We never ask for passwords or bank cards            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 12. Component & Layout Matrix Summary

| Screen | Primary Action Target | Key Accessibility Feature |
|---|---|---|
| **1. Onboarding** | `[ GET STARTED ]` (56px) | In-situ font size switcher with live preview sentence. |
| **2. Home Hub** | 3 oversized action cards | Zero-pill layout, warm icons, high-contrast action verbs. |
| **3. Lesson Catalog** | `[ START THIS LESSON ]` | Plain-language lesson titles, step counts, estimated duration. |
| **4. Active Coach Turn** | Quick reply chips & `[ SEND ]` | 1–2 sentence clamp, jargon-free retry, pre-AI PII guard notice. |
| **5. Lesson Summary** | `[ PRACTICE ANOTHER ]` | Positive emotional reinforcement and key learned skills list. |
| **6. Scam Check Input** | `[ CHECK THIS MESSAGE ]` | Dual input (paste text vs. gallery photo) with zero clutter. |
| **7. Scam Result** | Red / Yellow / Green Card | Immediate action command (e.g. *"Do not tap link"*), optional alert. |
| **8. Family Circle (Senior)** | `[ ASK FAMILY FOR HELP ]` | 1-tap urgent trigger + direct phone call buttons. |
| **9. Family Portal (Carer)** | `[ I'VE GOT IT ]` & `[ CALL ]`| Two-way reassurance loop without complex token handshakes. |
| **10. Settings** | Text size & Contrast toggles | Immediate tactile feedback without confusing deep submenus. |
