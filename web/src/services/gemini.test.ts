import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

test('browser bundle loads when no Gemini API key is configured', async () => {
  const originalGeminiKey = process.env.GEMINI_API_KEY;
  const originalViteGeminiKey = process.env.VITE_GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = '';
  process.env.VITE_GEMINI_API_KEY = '';

  try {
    const { outputFiles } = await build({
      entryPoints: [new URL('./gemini.ts', import.meta.url).pathname],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      write: false,
    });
    const bundleUrl = `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`;

    const gemini = await import(bundleUrl);
    const result = await gemini.analyzeScamCheck({ text: 'Hello, your appointment is confirmed.' });

    assert.equal(result.verdict, 'caution');
  } finally {
    if (originalGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalGeminiKey;

    if (originalViteGeminiKey === undefined) delete process.env.VITE_GEMINI_API_KEY;
    else process.env.VITE_GEMINI_API_KEY = originalViteGeminiKey;
  }
});
