import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('index.html declares standalone PWA metadata', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /rel="manifest"/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /apple-touch-icon/);
});

test('manifest declares standalone display and installable icons', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8')
  );

  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
  assert.ok(manifest.icons.length >= 3);
  assert.ok(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === 'maskable'));
});

test('global CSS exposes safe-area insets', () => {
  const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');

  assert.match(css, /--safe-area-top:\s*env\(safe-area-inset-top/);
  assert.match(css, /--safe-area-bottom:\s*env\(safe-area-inset-bottom/);
  assert.match(css, /100dvh/);
});
