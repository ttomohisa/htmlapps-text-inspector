import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import vm from 'node:vm';
import { test } from 'node:test';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const readable = read('dist/index.html');
const selfExtract = read('dist/index.self-extract.html');

test('standalone output matches the current source template', () => {
  const config = JSON.parse(read('app.config.json'));
  const report = JSON.parse(read('dist/build-size-report.json').replace(/^\uFEFF/, ''));
  const expected = read('src/index.template.html').replaceAll('{{VERSION}}', config.version).replaceAll('{{BUILD_TIMESTAMP}}', report.generatedAt);
  assert.equal(readable, expected, 'rebuild stale standalone artifacts');
  assert.equal(Buffer.byteLength(readable), report.readableBytes);
  assert.equal(Buffer.byteLength(selfExtract), report.selfExtractBytes);
});

test('self-extract payload restores the exact readable release', () => {
  const payload = selfExtract.match(/atob\("([A-Za-z0-9+/=]+)"\)/)?.[1];
  assert.ok(payload);
  assert.equal(gunzipSync(Buffer.from(payload, 'base64')).toString('utf8'), readable);
});

test('release JavaScript parses and preserves offline CSP and app boundaries', () => {
  for (const html of [readable, selfExtract]) {
    for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  }
  for (const marker of ["connect-src 'none'", 'APP:BEGIN', 'APP:END', 'APP:HELP:BEGIN', 'APP:HELP:END']) assert.ok(readable.includes(marker));
  assert.doesNotMatch(readable, /<script[^>]+src=|<link[^>]+rel=["']stylesheet["'][^>]+href=|<iframe|(?:src|href)=["']https?:\/\//i);
});
