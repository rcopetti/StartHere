import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveAuthStage } from './authState';

const base = {
  authReady: true,
  hasFirebaseUser: true,
  profileLoaded: true,
  onboarded: true,
};

test('waits while Firebase restores the session', () => {
  assert.equal(
    resolveAuthStage({ ...base, authReady: false, hasFirebaseUser: false }),
    'loading'
  );
});

test('shows sign-in when no user is present', () => {
  assert.equal(
    resolveAuthStage({ ...base, hasFirebaseUser: false, onboarded: false }),
    'signed_out'
  );
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
