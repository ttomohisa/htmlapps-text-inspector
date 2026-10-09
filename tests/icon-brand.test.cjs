// Changing the brand background color/radius or allowing favicon drift fails this contract.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const compact = svg => svg.replace(/>\s+</g, '><').trim();
test('brand asset, embedded favicon and responsive header use the canonical color and 25% corners', () => {
  const asset = read('assets/favicon.svg');
  assert.match(asset, /<rect width="38" height="38" rx="9\.5" fill="#16624f"\/>/);
  for (const file of ['src/index.template.html', 'dist/index.html', 'text-inspector.html']) {
    const html = read(file);
    const favicon = html.match(/<link rel="icon" href="data:image\/svg\+xml,([^"]+)"/);
    assert.ok(favicon, file + ': inline favicon');
    assert.equal(compact(decodeURIComponent(favicon[1])), compact(asset), file + ': asset parity');
    const headers = [...html.matchAll(/\.brand-mark\s*\{([^}]+)\}/g)].map(m => m[1]);
    assert.equal(headers.length, 2);
    for (const rule of headers) assert.match(rule, /border-radius:\s*25%/);
    assert.match(headers[0], /background:\s*var\(--accent\)/);
    assert.match(html, /--accent:\s*#16624f;/);
  }
});
