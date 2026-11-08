import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ScamCheckApiError,
  buildScamCheckForm,
  isScamCheckApiConfigured,
  scamCheckErrorMessage,
} from './scamCheckApi';

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

test('builds a document form for an uploaded file', () => {
  const file = new File(['%PDF-1.7'], 'notice.pdf', { type: 'application/pdf' });

  const form = buildScamCheckForm({ file, text: 'This came from my bank.' });

  assert.equal(form.get('channel'), 'file');
  assert.equal(form.get('text'), 'This came from my bank.');
  assert.equal((form.get('file') as File).name, 'notice.pdf');
});

test('honours an explicit channel', () => {
  const form = buildScamCheckForm({ text: 'A note', channel: 'email' });

  assert.equal(form.get('channel'), 'email');
});

test('maps API failures to calm, actionable copy', () => {
  const rateLimited = scamCheckErrorMessage(new ScamCheckApiError('rate_limited', 'x'));
  const unavailable = scamCheckErrorMessage(new ScamCheckApiError('check_unavailable', 'x'));
  const expired = scamCheckErrorMessage(new ScamCheckApiError('invalid_token', 'x'));
  const network = scamCheckErrorMessage(new TypeError('fetch failed'));
  const unknown = scamCheckErrorMessage(new Error('boom'));

  assert.match(rateLimited, /last hour/);
  assert.match(unavailable, /Don't reply to the message yet/);
  assert.match(expired, /sign in again/i);
  assert.match(network, /Don't reply to the message yet/);
  assert.match(unknown, /Don't reply to the message yet/);
});

test('reports the API as unconfigured without an env value', () => {
  assert.equal(isScamCheckApiConfigured(), false);
});
