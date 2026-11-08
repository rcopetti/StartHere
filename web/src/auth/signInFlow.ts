/**
 * Google Sign-In Flow Helpers
 * iOS Safari needs its own handling: the popup blocker can swallow the sign-in
 * window, the redirect flow cannot finish across a cross-origin authDomain, and
 * Google refuses OAuth inside the Home Screen webview. These helpers keep that
 * knowledge in one place and turn Firebase error codes into calm plain words.
 */

export interface SignInEnvironment {
  userAgent?: string;
  standalone?: boolean;
  maxTouchPoints?: number;
}

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export const REDIRECT_PENDING_KEY = 'starthere.auth.redirect-pending';

/**
 * A Home Screen web app on iOS runs in a standalone webview that Google blocks
 * as an embedded user agent, so sign-in can never finish there. iPadOS reports
 * a desktop "Macintosh" user agent, hence the touch-point check.
 */
export function isIosStandalonePwa(env: SignInEnvironment = readEnvironment()): boolean {
  const agent = env.userAgent ?? '';
  const isIos =
    /iphone|ipad|ipod/i.test(agent) ||
    (/macintosh/i.test(agent) && (env.maxTouchPoints ?? 0) > 1);
  return isIos && env.standalone === true;
}

/**
 * Safari 16.1+ (and every browser on iOS, which all use WebKit) partitions
 * third-party storage, so Firebase's redirect flow cannot read its state back
 * from a cross-origin authDomain. Retrying the popup works; the redirect does not.
 */
export function isSafariBrowser(env: SignInEnvironment = readEnvironment()): boolean {
  const agent = env.userAgent ?? '';
  const isIos =
    /iphone|ipad|ipod/i.test(agent) ||
    (/macintosh/i.test(agent) && (env.maxTouchPoints ?? 0) > 1);
  if (isIos) return true;
  return /safari/i.test(agent) && !/chrome|chromium|crios|fxios|edgios|edg\//i.test(agent);
}

export class SignInFlowError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = 'SignInFlowError';
    this.code = code;
  }
}

export type PopupFailureAction = 'redirect' | 'open-in-safari' | 'surface-error';

/**
 * Decides what to do after signInWithPopup fails. WebKit partitions
 * third-party storage, so on Safari and every iOS browser a redirect comes
 * back without its state and the reader sees a dead end. There the only
 * useful recovery is a second tap, or moving the page into Safari.
 */
export function popupFailureAction(
  code: string | undefined,
  safariLike: boolean
): PopupFailureAction {
  if (code === 'auth/popup-blocked') {
    return safariLike ? 'surface-error' : 'redirect';
  }
  if (code === 'auth/operation-not-supported-in-this-environment') {
    return safariLike ? 'open-in-safari' : 'redirect';
  }
  return 'surface-error';
}

export function firebaseErrorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : undefined;
}

export function signInErrorMessage(code?: string): string {
  switch (code) {
    case 'auth/ios-standalone':
      return "Google sign-in can't open inside the Home Screen app on iPhone. Open StartHere in Safari instead, and sign in there.";
    case 'auth/popup-closed-by-user':
      return 'The sign-in window closed before you finished. Nothing was shared. Tap the button to try again.';
    case 'auth/popup-blocked':
      return 'Safari stopped the sign-in window. Tap the button again, and allow pop-ups for StartHere if it asks.';
    case 'auth/open-in-safari':
      return "Sign-in can't open inside this app. Open StartHere in Safari, then tap Sign in with Google there.";
    case 'auth/missing-initial-state':
      return "The sign-in didn't finish. Please tap the button to try again.";
    case 'auth/web-storage-unsupported':
      return 'Safari is blocking the sign-in memory. Turn off Private Browsing, or open StartHere in a normal Safari window, and try again.';
    case 'auth/network-request-failed':
      return "I couldn't reach Google just now. Please check that you're online and try again.";
    case 'auth/unauthorized-domain':
    case 'auth/redirect-uri-mismatch':
    case 'auth/app-not-authorized':
    case 'auth/operation-not-allowed':
      return "Sign-in isn't set up on this address yet. Please ask Mark for help.";
    case 'auth/redirect-no-result':
    case 'auth/redirect-cancelled-by-user':
      return "The sign-in didn't finish. Please tap the button to try again.";
    default:
      return "We couldn't sign you in just now. Nothing was shared. Please try again.";
  }
}

/**
 * sessionStorage survives the redirect round trip in the same tab. Marking the
 * attempt lets the returning page tell "the redirect failed" apart from "there
 * was never a redirect", so a failure is shown instead of silently ignored.
 */
export function markRedirectPending(storage?: StorageLike): void {
  try {
    storage?.setItem(REDIRECT_PENDING_KEY, '1');
  } catch {
    // Private Browsing can refuse writes; the sign-in itself still works.
  }
}

export function consumeRedirectPending(storage?: StorageLike): boolean {
  try {
    const pending = storage?.getItem(REDIRECT_PENDING_KEY) === '1';
    storage?.removeItem(REDIRECT_PENDING_KEY);
    return pending;
  } catch {
    return false;
  }
}

function readEnvironment(): SignInEnvironment {
  if (typeof navigator === 'undefined') return {};
  const nav = navigator as Navigator & { standalone?: boolean };
  return {
    userAgent: nav.userAgent,
    standalone: nav.standalone,
    maxTouchPoints: nav.maxTouchPoints,
  };
}
