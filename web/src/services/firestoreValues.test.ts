import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withoutUndefined } from './firestoreValues';

test('removes undefined fields but keeps false, zero, empty strings, and null', () => {
  const cleaned = withoutUndefined({
    missing: undefined,
    flag: false,
    count: 0,
    label: '',
    nothing: null,
  });

  assert.deepEqual(cleaned, {
    flag: false,
    count: 0,
    label: '',
    nothing: null,
  });
});

test('cleans nested objects and arrays', () => {
  const cleaned = withoutUndefined({
    nested: { missing: undefined, kept: 1 },
    list: [{ missing: undefined, kept: 2 }],
  });

  assert.deepEqual(cleaned, {
    nested: { kept: 1 },
    list: [{ kept: 2 }],
  });
});

test('leaves non-plain objects untouched', () => {
  const createdAt = new Date(0);
  const cleaned = withoutUndefined({ createdAt, missing: undefined });

  assert.equal(cleaned.createdAt, createdAt);
  assert.equal('missing' in cleaned, false);
});
