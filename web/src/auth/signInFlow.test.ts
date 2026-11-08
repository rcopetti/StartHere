import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  REDIRECT_PENDING_KEY,
  consumeRedirectPending,
  firebaseErrorCode,
  isIosStandalonePwa,
  isSafariBrowser,
  markRedirectPending,
  signInErrorMessage,
} from './signInFlow';

const iphoneAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const macAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';

test('flags an iPhone Home Screen web app', () => {
  assert.equal(isIosStandalonePwa({ userAgent: iphoneAgent, standalone: true }), true);
});

test('leaves sign-in alone in iPhone Safari', () => {
  assert.equal(isIosStandalonePwa({ userAgent: iphoneAgent, standalone: false }), false);
  assert.equal(isIosStandalonePwa({ userAgent: iphoneAgent }), false);
});

test('flags an iPadOS Home Screen web app that reports a Mac user agent', () => {
  assert.equal(
    isIosStandalonePwa({ userAgent: macAgent, standalone: true, maxTouchPoints: 5 }),
    true
  );
});

test('ignores the standalone flag on desktop browsers', () => {
  assert.equal(
    isIosStandalonePwa({ userAgent: macAgent, standalone: true, maxTouchPoints: 0 }),
    false
  );
});

test('detects the browsers where the redirect flow is unreliable', () => {
  assert.equal(isSafariBrowser({ userAgent: iphoneAgent }), true);
  assert.equal(isSafariBrowser({ userAgent: macAgent }), true);
  assert.equal(
    isSafariBrowser({
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1',
    }),
    true
  );
  assert.equal(
    isSafariBrowser({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
    }),
    false
  );
});

test('explains the Home Screen limitation in plain words', () => {
  const message = signInErrorMessage('auth/ios-standalone');
  assert.match(message, /Home Screen/);
  assert.match(message, /Safari/);
});

test('explains a blocked popup and a broken redirect', () => {
  assert.match(signInErrorMessage('auth/popup-blocked'), /Tap the button again/);
  assert.match(signInErrorMessage('auth/redirect-no-result'), /didn't finish/);
  assert.match(signInErrorMessage('auth/redirect-cancelled-by-user'), /didn't finish/);
});

test('keeps the existing sign-in copy for unknown and unset domains', () => {
  assert.match(signInErrorMessage('auth/unauthorized-domain'), /ask Mark for help/);
  assert.match(signInErrorMessage('auth/redirect-uri-mismatch'), /ask Mark for help/);
  assert.match(signInErrorMessage('auth/operation-not-allowed'), /ask Mark for help/);
  assert.match(signInErrorMessage('auth/something-new'), /Nothing was shared/);
  assert.match(signInErrorMessage(undefined), /Nothing was shared/);
});

test('reads the Firebase error code without leaking the error', () => {
  assert.equal(firebaseErrorCode({ code: 'auth/popup-blocked' }), 'auth/popup-blocked');
  assert.equal(firebaseErrorCode(new Error('boom')), undefined);
  assert.equal(firebaseErrorCode(null), undefined);
});

test('remembers a redirect attempt across the round trip', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };

  markRedirectPending(storage);
  assert.equal(values.get(REDIRECT_PENDING_KEY), '1');
  assert.equal(consumeRedirectPending(storage), true);
  assert.equal(consumeRedirectPending(storage), false);
});

test('survives storage that refuses writes', () => {
  const blocked = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
    removeItem: () => {
      throw new Error('blocked');
    },
  };

  assert.doesNotThrow(() => markRedirectPending(blocked));
  assert.equal(consumeRedirectPending(blocked), false);
  assert.equal(consumeRedirectPending(undefined), false);
});
