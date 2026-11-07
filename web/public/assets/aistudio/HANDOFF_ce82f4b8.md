# StartHere — Developer Handoff

As of Nov 7, 2026. The demo is Sunday, Nov 8. The spec is the source of truth: [StartHere — Architecture & Feature Spec (Developer Handoff)](https://claude.ai/artifact/73unDRkeRbHfxnHSAFZn8x). This file covers what's built, what's verified, and what's left.

## Status at a glance

| Area | State | Verified |
| --- | --- | --- |
| Cloud Functions (6) | Written | Typechecks (`tsc --noEmit`) clean; offline guardrail checks pass |
| Firestore + Storage rules | Written | Not tested; no emulator tests yet |
| Lesson seed (3 lessons + Ask me anything) | Written | Not run against a project |
| Flutter app (all MVP screens) | Written | **Never compiled.** Only parse-checked with `dart format` |
| Scam Check test set + scorer | Written | Mock run passes; **real Gemini run not done yet** |
| Firebase project | Not set up here | — |

**Do first:** run `flutter analyze` and fix whatever comes up, then run the real test set (below).

## Repo layout

```
README.md                 setup + demo-day checklist
firebase.json             functions, rules, emulators
firestore.rules           storage.rules
firestore.indexes.json    alerts by contactUid/seniorUid + sentAt
storage-lifecycle.json    1-day delete on scam-checks/ (backstop only)
functions/
  src/
    config.ts             model, region, timeouts, rate limit, minInstances, App Check flag
    gemini.ts             Vertex AI client + generateJson (8 s timeout, fails closed)
    scamCore.ts           Scam Check prompt, JSON schema, strict validation
    coachCore.ts          Coach prompt, jargon blocklist, sensitive-number guard
    shared.ts             admin init, auth/arg checks, per-user rate limiter
    coachTurn.ts          Learn turn
    scamCheck.ts          verdict + optional auto-alert
    alerts.ts             deliverAlert, sendAlert, acceptInvite
    privacy.ts            purgeScreenshots (hourly), deleteMyData
    index.ts
  scripts/seed-lessons.ts + lessons.json
  eval/samples.json (15 scam / 15 legit) + score.ts
  .env.example
app/
  pubspec.yaml            no android/ or web/ folders yet; generate with flutter create
  lib/
    main.dart             Firebase + App Check init, routing gate
    models.dart  theme.dart  state.dart
    services/api.dart     every callable; no AI key in the app
    services/voice.dart   speech_to_text + flutter_tts
    widgets/ui.dart       AppPage, BigButton, Caption, MicButton
    screens/              sign_in, onboarding, home, learn, scam_check, family, settings
```

## Cloud Functions

| Function | Trigger | Notes |
| --- | --- | --- |
| `coachTurn` | callable | Loads the scenario step (`scene`, `question`, `options`, `correctAnswer`) + session progress, Gemini at temperature 0.4. Evaluates user's choice (`legit` vs `scam`), returning verdict feedback banner and 1–2 plain sentences explanation; retried once if it uses a blocklisted word. Passwords, card numbers and SSNs are caught *before* Gemini, never stored, and get a fixed reply. On the last step, a second call builds `result` from `finishTemplate` and calculates final score. |
| `scamCheck` | callable | Image (from Storage) or text. Temperature 0.1. Content is wrapped as untrusted data. Strict JSON validation; any failure writes `error: true` and returns `{ok:false}`, never a verdict. Auto-alert on `likely_scam` if `autoAlertOnScam`, never with the screenshot. |
| `sendAlert` | callable | Writes `alerts/{id}` and sends FCM to the contact's `fcmTokens`, pruning dead tokens. The screenshot is included only on the senior's yes, as a 1-hour signed URL. |
| `acceptInvite` | callable | Checks the one-time `inviteToken` on the contact, then sets `linkedUid` and `status: active` and marks the caller `role: family`. |
| `deleteMyData` | callable | Recursive delete of `users/{uid}`, the user's screenshots, alerts as senior or contact, the rate-limit doc, and the Auth user. |
| `purgeScreenshots` | every 60 min | Deletes screenshots older than 24 h and clears `storagePath` on their checks. |

All callables: `us-central1`, App Check enforced (`ENFORCE_APP_CHECK`), 60 calls per user per hour for `coachTurn` and `scamCheck`, and logs that carry no message or screenshot text.

## Data model changes vs. the original spec

Every change below is already in the spec doc.

- `users/{uid}`: added `phone`, `onboarded`, `fcmTokens[]` and (family accounts) `linkedSeniors{}`.
- `trustedContacts`: added `inviteToken` (32+ chars, written by the senior's app, cleared on accept) and `linkedAt`.
- `alerts`: added `seniorName`, `seniorPhone`, `contactName`, `contactPhone` and an optional `screenshotUrl`, so the family app never reads the senior's tree.
- New `rateLimits/{uid}`, functions only.

## Security rules summary

- Users read and write only their own tree, and can't change `role` or `linkedSeniors`.
- `sessions`: the client may only *create* one, with `currentStep 0`, `status active` and empty `messages`. All updates come from functions.
- `scamChecks`: read-only to the owner; written by functions.
- `trustedContacts`: created as `invited` with no `linkedUid`; the client can later edit only name and phone.
- `alerts`: readable by the senior or the contact. The contact can set `ackAt` once, to the server time.
- Storage: `scam-checks/{uid}/{checkId}.jpg`, owner only, image types, under 8 MB.

## Run it

```bash
cd functions && npm install && cp .env.example .env
npm run typecheck
npm run eval:mock                                   # offline scorer check
gcloud auth login && gcloud auth application-default login
GCLOUD_PROJECT=<project-id> npm run eval            # real Gemini run
GCLOUD_PROJECT=<project-id> npm run seed
firebase deploy --only functions,firestore,storage
```

```bash
cd app
flutter create --platforms=android,web --org app.starthere --project-name starthere .
flutterfire configure
flutter pub get && flutter analyze
flutter run -d <android-device>
```

IAM for the functions service account: **Vertex AI User**, plus **Service Account Token Creator** for signed screenshot URLs. Android manifest needs `RECORD_AUDIO`, `INTERNET` and `<queries>` for `tel`, `sms` and `https`.

Web dart-defines: `RECAPTCHA_KEY`, `VAPID_KEY`, `APP_URL` (the hosted web build the invite link points to). Optional: `STT_ON_DEVICE=false` when the demo phone has no offline speech pack.

## Test set

`functions/eval/samples.json`: 30 text samples. The 15 scams cover the grandparent scam, delivery, tolls, bank lockout, tech support, Medicare, the IRS, prizes, fake renewals, utility shutoff, fake orders, SSA, romance/crypto, jury duty and code theft. The 15 legitimate messages include hard cases: a real bank fraud alert, a two-factor code and a real Medicare notice.

`npm run eval` passes only when **≥ 14/15 scams** are flagged and **≥ 12/15 legitimate** messages return Looks safe; it exits with code 1 on failure. Results go to `eval/results/` with the model and a hash of the prompt, and never the sample text. Run it after every prompt or model change, and record the score for the MVP checklist.

Text only for now. Add screenshot samples before the pilot.

## MVP checklist: where each item stands

- [ ] Firebase project with Auth, Firestore, Storage, Functions, App Check and FCM enabled. *Not done.*
- [ ] Demo setup: Android device, Google sign-in or test phone numbers, App Check debug token registered.
- [ ] Seed lessons. *Script ready.*
- [ ] Flutter shell: onboarding, home, settings. *Written; needs to compile.*
- [ ] Speech wired to the coach. *Written; on-device on Android.*
- [ ] `coachTurn` + thank-you-note lesson end to end. *Written; not run.*
- [ ] `scamCheck` + verdict screen with read-aloud. *Written; not run.*
- [ ] `minInstances: 1` on demo day. *`MIN_INSTANCES=1` in `.env`, then redeploy.*
- [ ] `sendAlert` + Family mode with Call and I've got it. *Written; not run.*
- [ ] `acceptInvite` + invite link. *Written; the link opens the web build.*
- [ ] 30-sample test set run once, score recorded. *Mock passes; real run pending.*
- [ ] Demo rehearsed; backup screen recording made.

## Known gaps and risks

1. **Flutter compile.** Plugin APIs were checked against current package sources (firebase_core 5, firebase_app_check 0.5, riverpod 3, speech_to_text 7.5, share_plus 13), but nothing has been built. Expect small fixes.
2. **Invite links** open the web build. An Android App Link for the installed app is v1 work. For the demo, open the link on the family phone's browser, or paste it into the field on the Family screen.
3. **Rules aren't tested.** Write emulator tests for the session-create shape, the `alerts.ackAt` update and the contact-create constraints.
4. **Model pin** defaults to `gemini-2.5-flash` in `.env.example`. That's still an open question in the spec; confirm it before the pilot.
5. **Web voice** goes through the browser's cloud speech service. That's why the demo device is Android.
6. **Cold starts:** set `MIN_INSTANCES=1` only for demo day. Idle instances cost money.

## Open questions (from the spec)

- Final product name and demo persona name
- SMS provider for v1 alerts, and its per-message cost
- Which Gemini Flash version and region to pin
- Legal review of the Scam Check disclaimer wording before the public pilot
- Who owns the lesson library content, and how lessons are reviewed for accuracy
