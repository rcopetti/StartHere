# Guided Home and Coach Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace state-based screen switching with URL routes, remove the simulated phone frame, and implement the approved guided Home plus Coach session-list design.

**Architecture:** React Router owns page navigation. `AppShell` renders the full-page responsive app and a three-tab bottom bar. `AppContext` keeps user, lesson, quiz, and scam-check data but no longer stores `currentScreen`. Screens navigate with route helpers, and lesson/quiz state is initialized from route parameters.

**Tech Stack:** React 19, TypeScript, Vite 8, React Native Web, React Router 7, Node's built-in test runner with esbuild.

---

### Task 1: Route helpers and tests

**Files:**
- Create: `web/src/navigation/routes.ts`
- Test: `web/src/navigation/routes.test.ts`

- [ ] **Step 1: Write failing route-helper tests**

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ROUTES, activeTabForPath, shouldShowTabs, lessonIdFromPath, parentRouteForPath } from './routes';

test('builds lesson and result routes', () => {
  assert.equal(ROUTES.coachLesson('fake-bank-text'), '/coach/fake-bank-text');
  assert.equal(ROUTES.coachComplete('fake-bank-text'), '/coach/fake-bank-text/complete');
});

test('maps top-level routes to tabs', () => {
  assert.equal(activeTabForPath('/home'), 'home');
  assert.equal(activeTabForPath('/check'), 'check');
  assert.equal(activeTabForPath('/coach'), 'coach');
  assert.equal(activeTabForPath('/coach/fake-bank-text'), null);
});

test('shows tabs only on top-level destinations', () => {
  assert.equal(shouldShowTabs('/home'), true);
  assert.equal(shouldShowTabs('/check'), true);
  assert.equal(shouldShowTabs('/coach'), true);
  assert.equal(shouldShowTabs('/check/result'), false);
  assert.equal(shouldShowTabs('/coach/fake-bank-text'), false);
  assert.equal(shouldShowTabs('/settings'), false);
});

test('reads a lesson id from the quiz route', () => {
  assert.equal(lessonIdFromPath('/coach/fake-bank-text'), 'fake-bank-text');
  assert.equal(lessonIdFromPath('/coach/fake-bank-text/complete'), 'fake-bank-text');
  assert.equal(lessonIdFromPath('/coach'), null);
});

test('finds a calm parent route', () => {
  assert.equal(parentRouteForPath('/check/result'), '/check');
  assert.equal(parentRouteForPath('/coach/fake-bank-text'), '/coach');
  assert.equal(parentRouteForPath('/settings'), '/home');
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `node --import tsx --test web/src/navigation/routes.test.ts`
Expected: FAIL because `./routes` does not exist.

- [ ] **Step 3: Implement route helpers**

```ts
export type AppTab = 'home' | 'check' | 'coach';

export const ROUTES = {
  onboarding: '/onboarding',
  home: '/home',
  check: '/check',
  checkResult: '/check/result',
  coach: '/coach',
  coachLesson: (lessonId: string) => `/coach/${encodeURIComponent(lessonId)}`,
  coachComplete: (lessonId: string) => `/coach/${encodeURIComponent(lessonId)}/complete`,
  family: '/family',
  familyPortal: '/family-portal',
  settings: '/settings',
} as const;

export function activeTabForPath(pathname: string): AppTab | null {
  if (pathname === ROUTES.home) return 'home';
  if (pathname === ROUTES.check) return 'check';
  if (pathname === ROUTES.coach) return 'coach';
  return null;
}

export function shouldShowTabs(pathname: string): boolean {
  return activeTabForPath(pathname) !== null;
}

export function lessonIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/coach\/([^/]+)(?:\/complete)?\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function parentRouteForPath(pathname: string): string {
  if (pathname.startsWith('/check')) return ROUTES.check;
  if (pathname.startsWith('/coach')) return ROUTES.coach;
  if (pathname === ROUTES.family || pathname === ROUTES.settings) return ROUTES.home;
  return ROUTES.home;
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `node --import tsx --test web/src/navigation/routes.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/navigation/routes.ts web/src/navigation/routes.test.ts
git commit -m "feat: add route helpers for app navigation"
```

---

### Task 2: Router, app shell, and bottom tabs

**Files:**
- Create: `web/src/navigation/AppRoutes.tsx`
- Create: `web/src/components/AppShell.tsx`
- Create: `web/src/components/BottomTabs.tsx`
- Modify: `web/src/App.tsx`
- Modify: `web/src/index.css`
- Delete: `web/src/components/DevicePreviewShell.tsx`

- [ ] **Step 1: Add `BrowserRouter` to `App.tsx`**

```tsx
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppRoutes } from './navigation/AppRoutes';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
```

- [ ] **Step 2: Add full-height page CSS**

```css
@import "tailwindcss";

html,
body,
#root {
  height: 100%;
}

body {
  margin: 0;
  background: #faf8f5;
}
```

- [ ] **Step 3: Implement `BottomTabs`**

Three tabs (`Home`, `Check`, `Coach`) using `useLocation` and `useNavigate`; each `Pressable` has `accessibilityRole="tab"`, `accessibilityState={{ selected }}`, min height 64, emoji icon, text label, and a visible underline/check for the selected tab.

- [ ] **Step 4: Implement `AppShell`**

Full-page responsive shell with no phone frame, notch, status bar, or home indicator. It renders `<Outlet />` inside a centered column (`maxWidth: 760`) and shows `BottomTabs` only when `shouldShowTabs(pathname)`.

- [ ] **Step 5: Implement `AppRoutes`**

```tsx
<Routes>
  <Route element={<AppShell />}>
    <Route path="/onboarding" element={<OnboardingScreen />} />
    <Route path="/home" element={<HomeScreen />} />
    <Route path="/check" element={<ScamCheckScreen />} />
    <Route path="/check/result" element={<ScamVerdictScreen />} />
    <Route path="/coach" element={<LessonCatalogScreen />} />
    <Route path="/coach/:lessonId" element={<ScenarioLessonScreen />} />
    <Route path="/coach/:lessonId/complete" element={<LessonSummaryScreen />} />
    <Route path="/family" element={<FamilyCircleScreen />} />
    <Route path="/family-portal" element={<FamilyPortalScreen />} />
    <Route path="/settings" element={<SettingsScreen />} />
    <Route path="*" element={<RootRedirect />} />
  </Route>
</Routes>
```

`RootRedirect` waits for `loading`, then redirects to `/home` when the user has a display name or `/onboarding` otherwise.

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add web/src/App.tsx web/src/index.css web/src/navigation/AppRoutes.tsx web/src/components/AppShell.tsx web/src/components/BottomTabs.tsx
git rm web/src/components/DevicePreviewShell.tsx
git commit -m "feat: add routed full-page app shell and bottom tabs"
```

---

### Task 3: Remove screen state from AppContext and screens

**Files:**
- Modify: `web/src/context/AppContext.tsx`
- Modify: `web/src/screens/OnboardingScreen.tsx`
- Modify: `web/src/screens/ScamCheckScreen.tsx`
- Modify: `web/src/screens/ScamVerdictScreen.tsx`
- Modify: `web/src/screens/FamilyCircleScreen.tsx`
- Modify: `web/src/screens/FamilyPortalScreen.tsx`
- Modify: `web/src/screens/SettingsScreen.tsx`
- Modify: `web/src/screens/LessonSummaryScreen.tsx`
- Modify: `web/src/screens/ScenarioLessonScreen.tsx`
- Modify: `web/src/components/AppHeader.tsx`

- [ ] **Step 1: Remove `currentScreen`/`setScreen` from `AppContext`**

Delete the `ScreenId` import, context fields, state, `setScreen`, and provider values. Remove `setCurrentScreen` calls from `bootstrap`, `setRole`, `startLesson`, `nextScenario`, `exitLesson`, and `runScamCheck`.

- [ ] **Step 2: Make `nextScenario` report completion**

Change the signature to `nextScenario: () => boolean`. Return `false` when advancing to another question, and `true` after saving the completed session.

- [ ] **Step 3: Update each screen to use `useNavigate` and `ROUTES`**

- Onboarding: `navigate(role === 'family' ? ROUTES.familyPortal : ROUTES.home)`.
- ScamCheck: Back → `/home`; after `runScamCheck` resolves → `/check/result`.
- ScamVerdict: Back → `/check`; Done/Notify completion → `/home`.
- FamilyCircle: Back → `/home`.
- FamilyPortal: switch role → `setRole('senior')` then `/home`.
- Settings: Back → role family ? `/family-portal` : `/home`.
- LessonSummary: practice again → `/coach`; home → `/home`.
- ScenarioLesson: use `useParams`, `useNavigate`; if `activeLesson` is missing or has a different id, find it in `allLessons` and call `startLesson` in an effect; `nextScenario()` result chooses `/coach/:id/complete` or stays.
- AppHeader: settings button navigates to `/settings`; add `showPersonMenu` prop for a visible person button that opens a small panel with Family Circle and Settings links plus a close button.

- [ ] **Step 4: Run type check and tests**

Run: `npm run lint`
Run: `node --import tsx --test web/src/navigation/routes.test.ts`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add web/src/context/AppContext.tsx web/src/screens web/src/components/AppHeader.tsx
git commit -m "refactor: use routes for page navigation"
```

---

### Task 4: Guided Home

**Files:**
- Modify: `web/src/screens/HomeScreen.tsx`
- Modify: `web/src/components/BigButton.tsx`

- [ ] **Step 1: Add a navy `BigButton` variant**

Add `navy` to the variant union and return `#18334D` (pressed `#0F2539`) for its background.

- [ ] **Step 2: Replace the Home screen with the approved guided layout**

Use warm `#FAF8F5` background, a greeting with the signed-in first name, one primary `Check something` button (68 pt tall), a `Learn something new` session preview card with `See all sessions` linking to `/coach`, a trusted-contact status card linking to `/family`, and one daily tip. Use `AppHeader` with `showPersonMenu`. Do not render a phone frame.

- [ ] **Step 3: Verify Home renders and links route correctly**

Run the dev server and check `/home`, the Check button, the session-preview link, and the person menu at 390 px and 1280 px.

- [ ] **Step 4: Commit**

```bash
git add web/src/screens/HomeScreen.tsx web/src/components/BigButton.tsx
git commit -m "feat: implement guided home screen"
```

---

### Task 5: Coach session list

**Files:**
- Modify: `web/src/screens/LessonCatalogScreen.tsx`

- [ ] **Step 1: Add category filter state**

Derive filter options from the three lesson tracks plus `All sessions`. Filter `allLessons` without mutating it.

- [ ] **Step 2: Implement the session-list design**

Use the approved headline and subtitle, wrapping filter chips (min 44 pt tall), and session cards with track, duration, title, goal, and a `Start session` action. Each card calls `startLesson(lesson)` and navigates to `ROUTES.coachLesson(lesson.lessonId)`. Include a calm empty state.

- [ ] **Step 3: Verify filter and start behavior**

Check `/coach`, each filter, and that starting a session opens `/coach/:lessonId`.

- [ ] **Step 4: Commit**

```bash
git add web/src/screens/LessonCatalogScreen.tsx
git commit -m "feat: implement coach session list"
```

---

### Task 6: Quiz and result route polish

**Files:**
- Modify: `web/src/screens/ScenarioLessonScreen.tsx`
- Modify: `web/src/screens/LessonSummaryScreen.tsx`
- Modify: `web/src/screens/ScamVerdictScreen.tsx`

- [ ] **Step 1: Use plain answer labels**

Render `Looks safe` for `legit` and `This is a scam` for `scam`, while preserving the underlying lesson data.

- [ ] **Step 2: Keep visible Back/Close controls**

Quiz header keeps Close → `/coach`; result and verdict screens keep Back to their parent route.

- [ ] **Step 3: Verify the full flow**

Home → Check → result → Home; Coach → session → answer → feedback → next → complete → Coach.

- [ ] **Step 4: Commit**

```bash
git add web/src/screens/ScenarioLessonScreen.tsx web/src/screens/LessonSummaryScreen.tsx web/src/screens/ScamVerdictScreen.tsx
git commit -m "feat: polish quiz and result navigation"
```

---

### Task 7: Final verification

- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `node --import tsx --test web/src/navigation/routes.test.ts`.
- [ ] Verify direct refresh for `/home`, `/check`, `/coach`, `/coach/fake-bank-text`, `/family`, and `/settings`.
- [ ] Verify no simulated phone frame at 390 px and 1280 px.
- [ ] Verify 200% text scaling and visible focus on tabs and primary actions.
- [ ] Commit any final fixes.
