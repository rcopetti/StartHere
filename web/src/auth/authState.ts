/**
 * Auth Stage Resolution
 * Pure helper that decides which surface the app should show while Firebase
 * restores the session and the Firestore profile document loads.
 */

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
