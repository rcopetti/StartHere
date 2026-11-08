import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ROUTES,
  activeTabForPath,
  shouldShowTabs,
  lessonIdFromPath,
  parentRouteForPath,
} from './routes';

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
