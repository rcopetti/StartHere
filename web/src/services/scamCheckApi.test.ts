import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildScamCheckForm, isScamCheckApiConfigured } from './scamCheckApi';

test('builds a text form with the unknown channel', () => {
  const form = buildScamCheckForm({ text: '  Your package is on hold.  ' });

  assert.equal(form.get('text'), 'Your package is on hold.');
  assert.equal(form.get('channel'), 'unknown');
  assert.equal(form.get('file'), null);
});

test('builds a photo form with the image file', () => {
  const form = buildScamCheckForm({
    imageBase64: Buffer.from('fake-image').toString('base64'),
    imageMime: 'image/png',
  });

  const file = form.get('file');
  assert.equal(form.get('channel'), 'photo');
  assert.ok(file instanceof Blob);
  assert.equal((file as File).type, 'image/png');
});

test('strips a data URI prefix before decoding', () => {
  const form = buildScamCheckForm({
    imageBase64: `data:image/jpeg;base64,${Buffer.from('fake-image').toString('base64')}`,
    imageMime: 'image/jpeg',
  });

  assert.equal((form.get('file') as File).size, 'fake-image'.length);
});

test('reports the API as unconfigured without an env value', () => {
  assert.equal(isScamCheckApiConfigured(), false);
});
