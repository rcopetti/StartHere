import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeScamCheck } from './scamCheckFallback';

test('offline check stays cautious when it cannot verify', () => {
  const result = analyzeScamCheck({ text: 'Hello, your appointment is confirmed.' });

  assert.equal(result.verdict, 'caution');
  assert.equal(result.stopScreenRequired, false);
  assert.equal(result.inputType, 'text');
});

test('offline check flags gift card requests and opens the stop screen', () => {
  const result = analyzeScamCheck({
    text: 'Buy a Google Play gift card and send me the code right away.',
  });

  assert.equal(result.verdict, 'likely_scam');
  assert.equal(result.stopScreenRequired, true);
  assert.ok(result.riskCategories?.includes('gift_cards'));
});

test('offline check redacts private numbers', () => {
  const result = analyzeScamCheck({
    text: 'Send your card 4111 1111 1111 1111 and password: hunter2',
  });

  assert.equal(result.verdict, 'likely_scam');
  assert.equal(result.stopScreenRequired, true);
  assert.ok(!result.previewText.includes('4111'));
  assert.ok(!result.previewText.includes('hunter2'));
});

test('offline check marks photo input', () => {
  const result = analyzeScamCheck({ imageBase64: 'AAAA', imageMime: 'image/png' });

  assert.equal(result.inputType, 'image');
  assert.equal(result.previewText, 'Screenshot verification');
});
