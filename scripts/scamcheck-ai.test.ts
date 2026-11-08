import assert from 'node:assert/strict';
import { test } from 'node:test';
import { heuristicVerdict, normalizeVerdict, resolveAiConfig } from './scamcheck-ai';

test('defaults to Gemini with the pinned model', () => {
  const config = resolveAiConfig({ GEMINI_API_KEY: 'real-key' });

  assert.equal(config.provider, 'gemini');
  assert.equal(config.model, 'gemini-2.5-flash');
  assert.equal(config.baseUrl, undefined);
});

test('rejects the example placeholder key for Gemini', () => {
  assert.throws(
    () => resolveAiConfig({ GEMINI_API_KEY: 'MY_GEMINI_API_KEY' }),
    /needs a real GEMINI_API_KEY/
  );
});

test('configures a local Ollama endpoint without an API key', () => {
  const config = resolveAiConfig({ SCAMCHECK_AI_PROVIDER: 'ollama' });

  assert.equal(config.provider, 'ollama');
  assert.equal(config.model, 'llama3.2');
  assert.equal(config.baseUrl, 'http://localhost:11434');
});

test('accepts an explicit Ollama host, model, and timeout', () => {
  const config = resolveAiConfig({
    SCAMCHECK_AI_PROVIDER: 'ollama',
    OLLAMA_HOST: '127.0.0.1:11434',
    SCAMCHECK_AI_MODEL: 'mistral',
    SCAMCHECK_AI_TIMEOUT_MS: '1500',
  });

  assert.equal(config.baseUrl, 'http://127.0.0.1:11434');
  assert.equal(config.model, 'mistral');
  assert.equal(config.timeoutMs, 1500);
});

test('rejects an unknown provider', () => {
  assert.throws(
    () => resolveAiConfig({ SCAMCHECK_AI_PROVIDER: 'openai' }),
    /Unknown SCAMCHECK_AI_PROVIDER/
  );
});

test('rejects a non-positive timeout', () => {
  assert.throws(
    () => resolveAiConfig({ SCAMCHECK_AI_PROVIDER: 'heuristic', SCAMCHECK_AI_TIMEOUT_MS: '0' }),
    /positive number/
  );
});

test('heuristic flags a gift-card demand as a scam', () => {
  const result = heuristicVerdict('Please pay with a gift card right now');

  assert.equal(result.verdict, 'likely_scam');
  assert.equal(result.riskScore, 85);
});

test('heuristic leaves a routine reminder safe', () => {
  const result = heuristicVerdict('Your appointment is Tuesday at 10am.');

  assert.equal(result.verdict, 'looks_safe');
  assert.equal(result.riskScore, 15);
});

test('normalizeVerdict derives a verdict from the risk score', () => {
  assert.equal(normalizeVerdict({ riskScore: 80 }).verdict, 'likely_scam');
  assert.equal(normalizeVerdict({ riskScore: 50 }).verdict, 'caution');
  assert.equal(normalizeVerdict({ riskScore: 10 }).verdict, 'looks_safe');
});

test('normalizeVerdict keeps known verdicts and clamps the score', () => {
  const result = normalizeVerdict({ verdict: 'caution', riskScore: 140, signals: ['odd link', 3] });

  assert.equal(result.verdict, 'caution');
  assert.equal(result.riskScore, 100);
  assert.deepEqual(result.signals, ['odd link']);
});
