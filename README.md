# StartHere

**Empowering seniors with patient, jargon-free technology coaching and real-time scam protection.**

StartHere is designed specifically for older adults and their family circle. It combines an accessible, voice-enabled AI coach that explains technology step-by-step with an instant Scam Check tool and a family safety alert network.

---

## Documentation Quick Links

- [Complete Project Specification](./docs/SPECIFICATION.md): Full technical architecture, Cloud Functions, data models, security rules, and evaluation benchmark.
- [Mobile Caller ID & Call Screening Architecture](./docs/MOBILE_CALLER_ID_APPROACH.md): Platform-specific implementation guide (Android CallScreeningService & iOS CallKit) integrated with StartHere.
- [Developer Handoff Note](./public/assets/aistudio/HANDOFF_ce82f4b8.md): The original handoff notes from Nov 7, 2026.

---

## Key Features

1. **Patient Tech Coach (`coachTurn`)**
   - Step-by-step guided lessons (Thank-you notes, spotting scam links, video calls) and open Q&A.
   - Pre-Gemini sensitive number guard (SSNs, passwords, and cards intercepted before AI).
   - Jargon blocklist with automatic plain-language retry.
   - Responses clamped to 1–2 short, friendly sentences.
   - Senior-friendly voice dictation (`MicButton`) and text-to-speech audio playback.

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
│   ├── SPECIFICATION.md          # Full technical spec & architecture
│   └── MOBILE_CALLER_ID_APPROACH.md # Mobile caller ID & screening architecture
├── README.md                     # Project overview and run guide
├── public/
│   └── assets/aistudio/          # Handoff assets & developer notes
├── src/                          # Client application
├── metadata.json                 # AI Studio applet configuration
└── package.json                  # Project dependencies and scripts
```
