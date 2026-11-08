# Firebase Google Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace main's silent anonymous session with explicit Google sign-in, an `onboarded` profile gate, hardened Firestore rules, and a senior-only route tree.

**Architecture:** Firebase Auth owns identity. `AppContext` subscribes to `onAuthStateChanged`, provisions or normalizes `users/{uid}`, and exposes an `AuthStage` (`loading` | `signed_out` | `needs_onboarding` | `ready`). React Router guards the shell with `RequireAuth` and `RequireOnboarded`; `/sign-in` and `/onboarding` sit outside the tab chrome. Firestore rules validate schema and scope every read to `request.auth.uid`.

**Tech Stack:** React 19, TypeScript, Vite 8, React Native Web, React Router 7, Firebase 13 (`firebase/auth`, `firebase/firestore`), Node's built-in test runner with tsx.

**Source branch reviewed:** `StartHere/codex/starthere-updates` (`84c83fd`, `89540f8`), branched from `6f7d053` — before the guided-home rewrite. Only its auth *pattern* and hardened rules port over; its shell, dashboards, Tailwind screens, demo personas, ISO timestamps, alternate `appId`, and local ScamCheck server do not.

**Decisions:**
- Google popup sign-in only (redirect fallback when popups are blocked).
- No anonymous auth and no demo personas.
- Senior experience only; `/family-portal` is removed until invite linking ships.

---

## Auth state machine

```
loading ──► signed_out ──► needs_onboarding ──► ready
   ▲            │                  │              │
   └── boot ────┴── sign out ◄──────┴──────────────┘
```

`ready` means a Firebase user exists **and** `users/{uid}.onboarded === true`.

---

### Task 1: Types and pure auth-state helper

**Files:**
- Modify: `web/src/types/index.ts`
- Create: `web/src/auth/authState.ts`
- Create: `web/src/auth/authState.test.ts`
- Modify: `web/src/services/firebase.ts` (keep existing literals typechecking)

- [ ] **Step 1: Write failing tests**

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveAuthStage } from './authState';

const base = { authReady: true, hasFirebaseUser: true, profileLoaded: true, onboarded: true };

test('waits while Firebase restores the session', () => {
  assert.equal(resolveAuthStage({ ...base, authReady: false, hasFirebaseUser: false }), 'loading');
});

test('shows sign-in when no user is present', () => {
  assert.equal(resolveAuthStage({ ...base, hasFirebaseUser: false, onboarded: false }), 'signed_out');
});

test('waits for the profile document', () => {
  assert.equal(resolveAuthStage({ ...base, profileLoaded: false }), 'loading');
});

test('routes a signed-in user without onboarding to setup', () => {
  assert.equal(resolveAuthStage({ ...base, onboarded: false }), 'needs_onboarding');
});

test('routes an onboarded user into the app', () => {
  assert.equal(resolveAuthStage(base), 'ready');
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `node --import tsx --test web/src/auth/authState.test.ts`
Expected: FAIL because `./authState` does not exist.

- [ ] **Step 3: Implement the helper**

```ts
export type AuthStage = 'loading' | 'signed_out' | 'needs_onboarding' | 'ready';

export interface AuthStageInput {
  authReady: boolean;
  hasFirebaseUser: boolean;
  profileLoaded: boolean;
  onboarded: boolean;
}

export function resolveAuthStage(input: AuthStageInput): AuthStage {
  if (!input.authReady) return 'loading';
  if (!input.hasFirebaseUser) return 'signed_out';
  if (!input.profileLoaded) return 'loading';
  return input.onboarded ? 'ready' : 'needs_onboarding';
}
```

- [ ] **Step 4: Extend `UserProfile`**

```ts
export interface UserProfile {
  uid: string;
  role: UserRole;
  displayName: string;
  email?: string;
  phone?: string;
  onboarded: boolean;
  fontSizePreference: FontSizePreference;
  highContrast: boolean;
  autoAlertOnScam: boolean;
  createdAt: number;
  updatedAt?: number;
}
```

Add `onboarded: true` to the two profile literals in `web/src/services/firebase.ts` so the build stays green until Task 2 removes that code.

- [ ] **Step 5: Run tests and lint**

Run: `node --import tsx --test web/src/auth/authState.test.ts`
Expected: PASS (5 tests).

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web/src/types/index.ts web/src/auth web/src/services/firebase.ts
git commit -m "feat: add auth stage helper and onboarded profile field"
```

---

### Task 2: Rewrite the Firebase auth service

**Files:**
- Modify: `web/src/services/firebase.ts`

- [ ] **Step 1: Remove anonymous auth**

Delete the `signInAnonymously` import, `initAuthAndProfile()`, `seedDefaultContacts()`, and its call. Delete the "Eleanor Miller" fallback profile — a Firestore failure must surface, never be masked.

- [ ] **Step 2: Add Google sign-in with redirect fallback**

```ts
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function observeAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function completeGoogleRedirectSignIn() {
  try {
    await getRedirectResult(auth);
  } catch {
    // The auth listener reports the failure; nothing else to do here.
  }
}

export async function signInWithGoogle() {
  await setPersistence(auth, browserLocalPersistence);
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw err;
  }
}

export async function signOutUser() {
  await signOut(auth);
}
```

- [ ] **Step 3: Provision and normalize the profile**

```ts
export async function ensureUserProfile(fbUser: User): Promise<UserProfile> {
  const ref = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const existing = snap.data() as Partial<UserProfile>;
    if (typeof existing.onboarded === 'boolean') return existing as UserProfile;
    const normalized: UserProfile = { ...defaultProfile(fbUser), ...existing, uid: fbUser.uid, onboarded: false };
    await setDoc(ref, normalized);
    return normalized;
  }
  const profile = defaultProfile(fbUser);
  await setDoc(ref, profile);
  return profile;
}

export function subscribeToProfile(uid: string, cb: (profile: UserProfile | null) => void) { /* onSnapshot */ }

export async function saveUserProfile(profile: UserProfile) {
  await setDoc(doc(db, 'users', profile.uid), { ...profile, updatedAt: Date.now() });
}
```

- [ ] **Step 4: Scope alert queries to the signed-in senior**

Change `subscribeToAlerts(seniorUid, cb)` to:

```ts
query(collection(db, 'alerts'), where('seniorUid', '==', seniorUid), orderBy('sentAt', 'desc'))
```

The unscoped `list` leaks every senior's alerts today and will be rejected by Task 8's rules.

- [ ] **Step 5: Use a crypto invite token**

Replace `Math.random()` in `generateInviteToken()` with `crypto.getRandomValues` over the same 32-character alphabet.

- [ ] **Step 6: Verify and commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add web/src/services/firebase.ts
git commit -m "feat: add Google auth and profile provisioning services"
```

---

### Task 3: Auth-aware `AppContext` bootstrap

**Files:**
- Modify: `web/src/context/AppContext.tsx`

- [ ] **Step 1: Replace the one-shot bootstrap with an auth listener**

Add `authStage`, `firebaseUser`, `authError`, `signInWithGoogle`, `signOutUser`, and `completeOnboarding` to the context. Boot sequence:

1. `void completeGoogleRedirectSignIn()`
2. `observeAuth(fbUser => ...)`
   - no user → clear profile and data, `authStage = 'signed_out'`
   - user → `ensureUserProfile()` → `setUser(profile)` → stage from `resolveAuthStage`
   - Firestore error → calm `authError`; no fabricated profile
3. A second effect keyed on `[user?.uid, authStage]` starts `subscribeToProfile`, `subscribeToAlerts(uid, …)`, `subscribeToTrustedContacts(uid, …)`, and `seedLessonsIfEmpty()` only when `authStage === 'ready'`, and tears them down on sign-out.

- [ ] **Step 2: Persist onboarding**

```ts
const completeOnboarding = async (prefs) => {
  if (!user) return;
  const next: UserProfile = { ...user, ...prefs, role: 'senior', onboarded: true, updatedAt: Date.now() };
  await saveUserProfile(next);
  setUser(next);
  setAuthStage('ready');
};
```

- [ ] **Step 3: Verify and commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add web/src/context/AppContext.tsx
git commit -m "feat: drive app context from Firebase auth state"
```

---

### Task 4: Sign-in screen, route, and guards

**Files:**
- Create: `web/src/screens/SignInScreen.tsx`
- Create: `web/src/auth/AuthGuards.tsx`
- Modify: `web/src/navigation/routes.ts`
- Modify: `web/src/navigation/AppRoutes.tsx`
- Modify: `web/src/navigation/routes.test.ts`

- [ ] **Step 1: Add the route**

Add `signIn: '/sign-in'` to `ROUTES`; `shouldShowTabs('/sign-in')` stays `false`; `parentRouteForPath('/sign-in')` returns `/sign-in`. Add route tests.

- [ ] **Step 2: Build the guarded route tree**

```tsx
<Routes>
  <Route path={ROUTES.signIn} element={<SignInScreen />} />
  <Route element={<RequireAuth />}>
    <Route element={<AppShell />}>
      <Route path={ROUTES.onboarding} element={<OnboardingScreen />} />
      <Route element={<RequireOnboarded />}>
        {/* home, check, check/result, coach, coach/:lessonId, coach/:lessonId/complete, family, settings */}
      </Route>
    </Route>
  </Route>
  <Route path="*" element={<RootRedirect />} />
</Routes>
```

`RequireAuth` redirects to `/sign-in` with `state.from`; `RequireOnboarded` redirects to `/onboarding`; `RootRedirect` switches on `authStage`.

- [ ] **Step 3: Build the sign-in screen with existing primitives**

Use `Heading` and `BigButton` (not Tailwind) so text scaling and high contrast are inherited.

- Headline: **Welcome to StartHere**
- One line: *"Sign in with your Google account so your lessons, checks, and family circle stay with you."*
- One primary 64pt button: **Sign in with Google**
- Reassurance: *"StartHere will never ask for your password, bank card, or Social Security number. We only use Google to know it's you."*
- Calm amber errors only; no red, no demo-persona buttons.

- [ ] **Step 4: Verify and commit**

Run: `npm run lint` and `node --import tsx --test web/src/navigation/routes.test.ts`
Expected: PASS.

```bash
git add web/src/screens/SignInScreen.tsx web/src/auth/AuthGuards.tsx web/src/navigation
git commit -m "feat: add Google sign-in screen and auth route guards"
```

---

### Task 5: Persist onboarding choices

**Files:**
- Modify: `web/src/screens/OnboardingScreen.tsx`

- [ ] **Step 1: Remove the role cards**

Seniors only for now; selecting `family` would lead to a removed route. Keep `role: 'senior'` in the written profile.

- [ ] **Step 2: Save and continue**

Primary action calls `completeOnboarding({ role: 'senior', displayName, email, fontSizePreference: fontSize, highContrast, autoAlertOnScam: true })`, then `navigate(ROUTES.home, { replace: true })`.

Add a subordinate line: *"Signed in as {name} · Not you? Sign out"*.

- [ ] **Step 3: Verify and commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add web/src/screens/OnboardingScreen.tsx
git commit -m "feat: persist onboarding choices to the user profile"
```

---

### Task 6: Sign-out and account card

**Files:**
- Modify: `web/src/screens/SettingsScreen.tsx`

- [ ] **Step 1: Remove the role switch**

Delete the "Active view or role" card and `setRole` usage. Back always returns `/home`.

- [ ] **Step 2: Add the account card**

Show signed-in name and email plus a `Sign out` button. Use an inline confirmation, never a one-tap destructive action:

> Sign out of StartHere? Your lessons and checks stay saved.
> `[ Yes, sign out ]` `[ No, stay signed in ]`

- [ ] **Step 3: Verify and commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add web/src/screens/SettingsScreen.tsx
git commit -m "feat: add account card and confirmed sign-out"
```

---

### Task 7: Remove the family portal and demo contacts

**Files:**
- Modify: `web/src/navigation/AppRoutes.tsx`
- Modify: `web/src/navigation/routes.ts`
- Modify: `web/src/screens/FamilyCircleScreen.tsx`
- Modify: `web/src/screens/HomeScreen.tsx`
- Keep (unreferenced): `web/src/screens/FamilyPortalScreen.tsx`

- [ ] **Step 1: Remove the route**

Delete `familyPortal` from `ROUTES` and its `<Route>` and import. `/family-portal` falls through to `RootRedirect`.

- [ ] **Step 2: Add calm empty states**

- Family Circle with no contacts: *"No one added yet. Tap Add a new contact to invite someone you trust."*
- Emergency alert confirmation: *"Your help alert was sent to the people in your circle."*
- Empty circle: *"You don't have anyone in your circle yet. Add a family member first."*

- [ ] **Step 3: Verify and commit**

Run: `npm run lint`
Expected: PASS (watch for `noUnusedLocals` on removed imports).

```bash
git add web/src/navigation web/src/screens/FamilyCircleScreen.tsx web/src/screens/HomeScreen.tsx
git commit -m "feat: hide family portal until invite linking exists"
```

---

### Task 8: Harden Firestore rules

**Files:**
- Modify: `firestore.rules`
- Optional: add `firebase.json` + `.firebaserc`

- [ ] **Step 1: Replace the permissive rules**

```rules
match /users/{uid} {
  allow get: if isOwner(uid);
  allow list: if false;
  allow create, update: if isOwner(uid) && isValidUser(request.resource.data);
  allow delete: if isOwner(uid);

  match /trustedContacts/{contactId} {
    allow read, create, update, delete: if isOwner(uid) && isValidContact(request.resource.data, uid);
  }
  match /sessions/{sessionId} {
    allow read, create, update, delete: if isOwner(uid) && isValidSession(request.resource.data, uid);
  }
}

match /alerts/{alertId} {
  allow get, list: if isSignedIn() && resource.data.seniorUid == request.auth.uid;
  allow create: if isSignedIn()
    && request.resource.data.seniorUid == request.auth.uid
    && isValidAlert(request.resource.data);
  allow update, delete: if isSignedIn() && resource.data.seniorUid == request.auth.uid;
}

match /scamChecks/{checkId} {
  allow get, list: if isSignedIn() && resource.data.seniorUid == request.auth.uid;
  allow create: if isSignedIn()
    && request.resource.data.seniorUid == request.auth.uid
    && isValidScamCheck(request.resource.data);
  allow update, delete: if isSignedIn() && resource.data.seniorUid == request.auth.uid;
}

match /lessons/{lessonId} { allow read: if true; allow write: if isSignedIn(); }
match /test/connection { allow read: if true; }
```

`isValidUser` must require `uid == request.auth.uid`, `role in ['senior','family']`, `onboarded is bool`, bounded string lengths, and the font-size enum.

- [ ] **Step 2: Handle legacy documents**

Docs created by the old anonymous flow have no `onboarded`. `ensureUserProfile()` normalizes them on first login; unreachable anonymous accounts become orphaned. Review or purge before deploying.

- [ ] **Step 3: Deploy**

```json
{ "firestore": [{ "database": "ai-studio-starthereseniort-d5bbff61-0c13-49da-bde7-6558da3396b5", "rules": "firestore.rules" }] }
```

```bash
firebase deploy --only firestore:rules --project starthere-3e5dc
```

- [ ] **Step 4: Verify isolation**

In the Rules Playground or emulator, confirm a second signed-in account cannot read another user's profile, contacts, sessions, alerts, or checks, and cannot write a doc with someone else's `seniorUid`.

---

### Task 9: Firebase Console prerequisites

- [ ] Enable **Google** under Authentication → Sign-in method.
- [ ] Add authorized domains: `localhost`, the production host, and `carless-almost-brought.ngrok-free.dev`.
- [ ] Confirm the web app registration matches main's `appId` (`1:508232394857:web:dcdc07ce7bfec8fc4a5af8`). Do **not** use the branch's alternate appId.
- [ ] Add an App Check debug token if Identity Toolkit enforcement is enabled.

---

### Task 10: Final verification

- [ ] `npm run lint`
- [ ] `node --import tsx --test web/src/navigation/routes.test.ts web/src/auth/authState.test.ts web/src/pwa.test.ts web/src/services/gemini.test.ts`
- [ ] `npm run build`
- [ ] Signed out, `/`, `/home`, `/check`, `/coach`, `/settings` all land on `/sign-in`.
- [ ] First sign-in → onboarding → home; reload goes straight home.
- [ ] Sign-out returns to `/sign-in`; reload stays signed out.
- [ ] Deep link `/coach/fake-bank-text` returns there after sign-in.
- [ ] Two accounts see no shared alerts, contacts, or scam history.
- [ ] Popup-blocked browser completes sign-in through the redirect fallback.
- [ ] 200% text scaling and reduced motion: no clipped text on sign-in or onboarding.
