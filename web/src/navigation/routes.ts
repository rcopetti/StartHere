export type AppTab = 'home' | 'check' | 'coach';

export const ROUTES = {
  signIn: '/sign-in',
  onboarding: '/onboarding',
  home: '/home',
  check: '/check',
  checkResult: '/check/result',
  coach: '/coach',
  coachLesson: (lessonId: string) => `/coach/${encodeURIComponent(lessonId)}`,
  coachComplete: (lessonId: string) => `/coach/${encodeURIComponent(lessonId)}/complete`,
  family: '/family',
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
  if (pathname === ROUTES.signIn) return ROUTES.signIn;
  if (pathname.startsWith('/check')) return ROUTES.check;
  if (pathname.startsWith('/coach')) return ROUTES.coach;
  if (pathname === ROUTES.family || pathname === ROUTES.settings) return ROUTES.home;
  return ROUTES.home;
}
