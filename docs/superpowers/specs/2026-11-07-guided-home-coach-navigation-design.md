# Guided Home and Coach Navigation Design

**Status:** Approved in conversation; awaiting written-spec review
**Date:** 2026-11-07
**Scope:** Senior Home, primary navigation, Coach session list, and existing quiz entry

## Product Lens

Dorothy, a 72-year-old senior, opens StartHere to decide whether a message is safe and what to do next. The Home screen should reassure her, make checking something the clearest next action, and keep short practice sessions and trusted family support easy to find. Coach is the learning experience: a list of short sessions, each made up of quiz questions. It is not an open-ended AI chat screen.

## Design Contract

**User + job:** Help Dorothy choose a safe next step or start a short practice session.

**First-read object:** A calm, personal reassurance followed by one clear action: “Check something.”

**Primary action:** Open the Scam Check screen.

**Density decision:** Spacious, but with useful session and family information visible without decorative filler.

**Hierarchy:** Greeting and reassurance → primary check action → next session preview → trusted contact status → daily tip.

**Interaction model:** A guided home hub, a filterable vertical session list, and one quiz question at a time, with URL routes as the source of page navigation.

**Responsive priority:** Design first for a narrow phone viewport, but render the app directly in the page at every size. Do not wrap the interface in a simulated phone frame, bezel, notch, status bar, or home indicator. Let content adapt naturally to wider desktop viewports.

**References and transferable patterns:**
- User-provided property-app image: raised rounded surfaces, obvious categories, short metadata, and icon navigation. Adapt these into safety and lesson cards; do not copy property imagery or compact text.
- Existing StartHere components: large `BigButton` controls, lesson scenario cards, and family-circle data. Preserve the accessible touch-first interaction and reuse the existing lesson/session model.
- Familiar mobile navigation: keep each main destination visible with icon and text labels, rather than hiding destinations in a menu.

**Forbidden defaults:** No separate AI chat masquerading as Coach; no separate Learn tab; no swipe-only interaction; no tiny icon-only navigation; no competing primary actions on Home; no alarmist or color-only safety states.

**Finish evidence:** Verify Home and Coach at 320–390 CSS px and 1024–1440 CSS px; confirm the app fills the page without a simulated phone frame. Check keyboard and accessible labels; verify loading/empty states, tab routing, lesson launch, question answer, progress, and return navigation; confirm text remains visible at 200% scaling.

## Approved Screen Design

### Home

- Use the guided-home Option B composition shown in the visual companion.
- Render the app directly in the responsive page. Remove the desktop-only simulated phone bezel, notch/status-bar strip, and home-indicator strip; do not add another device frame around any screen.
- Use a warm off-white background, layered white surfaces with restrained shadows, dark navy for the main action, and green only with a check icon and clear status wording.
- Show a short greeting such as “You have support, Eleanor.” Use the signed-in first name when available and a neutral fallback when it is not.
- Show one primary, full-width `Check something` button. It opens the existing Scam Check screen.
- Below the primary action, show a compact `Learn something new` session preview. The card includes a title, a short learning goal or description, duration or progress when available, and a subordinate `See all sessions` action that opens Coach. Session start/continue actions live in the Coach list.
- Show trusted-person status as a calm, subordinate card. Do not suggest that family is watching routine checks.
- Show one short daily tip as supporting information, not as another competing action.
- Provide a visible person control in the header. Activating it opens a simple, accessible choice panel with two large destinations: Family Circle and Settings. Include a visible close/back action; do not turn this into a hamburger menu.

### Primary Navigation

- Use three labeled tabs: `Home`, `Check`, and `Coach`.
- `Home` opens the guided home hub, `Check` opens Scam Check, and `Coach` opens the lesson/session list.
- Do not add a separate `Learn` destination or an open-ended Coach chat in this scope.
- Use icon plus text on each tab, with at least a 64×64 point target and visible selected state. Color must not be the only selected-state cue.
- Keep the tab bar on the three top-level destinations. Hide it during a focused quiz or other deep task, where a visible Back or Close control is used instead.
- Do not use swipe navigation or a hamburger menu.

### Route Contract

- Use explicit browser URL routes for page navigation in this React Native Web/Vite app. Use React Router rather than keeping `currentScreen` as the navigation source of truth.
- Route map:
  - `/` redirects to `/onboarding` for a new user or `/home` for an onboarded user.
  - `/onboarding` shows welcome/setup.
  - `/home` shows the guided home hub.
  - `/check` shows Scam Check; `/check/result` shows the current verdict.
  - `/coach` shows the session list.
  - `/coach/:lessonId` shows that session's quiz.
  - `/coach/:lessonId/complete` shows the session result.
  - `/family`, `/family-portal`, and `/settings` keep the existing destinations addressable.
- The three tabs link to `/home`, `/check`, and `/coach`; session cards link to their `/coach/:lessonId` route.
- Browser Back and Forward must follow route history. In-app Back/Close controls navigate to a sensible parent route and remain visible on focused quiz/result screens.
- Keep quiz answer and question progress in the existing lesson/session state; route changes identify the page, not each answer selection.
- Unknown or incomplete routes show a calm recovery path to the relevant parent page. Refreshing a supported route must render the application rather than a server 404.

### Coach Session List

- Treat Coach as the existing patient tech-coach lesson catalog.
- Use a single screen headline and a short explanation that each session contains five practice questions and can be completed at the user's pace.
- Present sessions in a vertical list. Each card includes its track/category, time estimate, title, plain-language goal, and a `Start session` or `Continue session` action.
- Use visible, wrapping category filters (for example, `All sessions`, `Phone basics`, `Everyday tasks`, and `Safety`). Do not require horizontal scrolling or swiping.
- Reuse the existing lesson documents and progress information. Do not invent new lesson content or duplicate the catalog in a second tab.

### Quiz Entry and Progression

- Selecting a session opens the existing scenario quiz flow.
- Show one question at a time, with visible question count/progress, the realistic message or situation, and large answer choices.
- After an answer, show calm explanatory feedback and a clear next-question action. Keep a visible way to leave or go back.
- Preserve the existing quiz data and scoring behavior. This design does not change lesson content or grading rules.

## Interaction and Data Flow

- Home reads the existing user, trusted contacts, and lesson list from `AppContext`.
- `Check something` navigates to `/check`.
- The Home session preview's `See all sessions` action and Coach tab navigate to `/coach`. Starting or continuing a session navigates to `/coach/:lessonId` and initializes the existing lesson state.
- Page routes replace `currentScreen`/`setScreen` as the navigation source of truth. `AppContext` remains responsible for user, lesson, quiz, and scam-check data.
- Category filters affect only the visible session list; they do not mutate lesson data.
- Family and settings controls use existing routes and data. No new persistence model is required for this design.

## States and Copy

- **Loading lessons:** Use short, reassuring text such as “Getting your sessions ready…”; never rely on a spinner by itself.
- **No sessions available:** Explain plainly that sessions are not ready yet and leave the Check tab available.
- **No trusted contact:** Offer a subordinate route to add someone; do not imply that a contact is already connected.
- **No saved progress:** Show the session as ready to start, without points, streaks, or pressure.
- **Offline or unavailable data:** Keep the screen calm and make any available local lessons usable. Do not expose technical error codes.
- Follow StartHere's plain-language tone. Do not use jargon such as “phishing,” “URL,” or “API” without an immediate plain-language definition.

## Accessibility and Visual Tokens

- Preserve the project design rules: body text at least 20 pt, headlines at least 28 pt, full-width primary buttons at least 64 pt tall, and tap targets at least 64×64 pt with 16 pt spacing.
- Honor user text-size preferences and system text scaling up to 200% without clipping or hiding actions.
- Use the warm base `#FAF8F5` or `#F8F6F0` and near-black text `#1A1A1A`.
- Pair all safety colors with an icon and words. Safe status uses deep green `#1E5E3A` plus a check and reassuring text.
- Keep contrast at the project's 7:1 target for primary text and controls.
- Use fades no longer than 200 ms only, and honor reduced-motion settings.
- The person icon, tab items, session cards, and quiz answers must have clear accessible names and selected/pressed states.

## Scope Boundaries

**Included:** Home content hierarchy and card treatment, three-tab navigation, Coach session catalog presentation/filtering, and the existing quiz entry/progression presentation.

**Not included:** A new AI chat Coach, new lesson or quiz content, backend or Firebase schema changes, changing quiz scoring, family alert policy changes, and native iOS/Android packaging. The current project uses React Native primitives through React Native Web and does not contain a native mobile project.

## Verification Plan

1. Run the TypeScript check and production build.
2. Verify route rendering and refresh for `/home`, `/check`, `/check/result`, `/coach`, `/coach/:lessonId`, `/family`, and `/settings`.
3. Verify tab links, Home session preview → `/coach`, Coach session → quiz route, Browser Back/Forward, and visible Back/Close controls.
4. Verify category filters, loading state, empty session list, no trusted contact, quiz feedback, and progress display.
5. Check the narrow phone layout and full-page desktop layout at 1024–1440 CSS px; confirm there is no simulated phone frame, labels wrap, and no controls are clipped.
6. Check tap target size, keyboard navigation, visible focus, accessible names, high contrast, and 200% text scaling.
7. Confirm the app remains usable with local lessons when remote lesson data is unavailable.
