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

test('header renders the complete canonical asset rather than a separately scaled glyph', () => {
  const asset = compact(read('assets/favicon.svg'));
  const html = read('src/index.template.html');
  const header = html.match(/<div class="brand-mark"[^>]*>\s*(<svg[\s\S]*?<\/svg>)/);
  assert.ok(header, 'inline header icon');
  assert.equal(compact(header[1]), asset, 'header artwork matches assets/favicon.svg');
  assert.match(html, /\.brand-mark svg\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;/);
});

test('local-processing badge uses the PDF Fill & Sign shield artwork', () => {
  const html = read('src/index.template.html');
  const badge = html.match(/<div class="local-badge">\s*(<svg[\s\S]*?<\/svg>)/);
  assert.ok(badge, 'inline local-processing badge');
  assert.match(badge[1], /d="M12 3 5 6v5c0 4\.6 2\.8 8 7 10 4\.2-2 7-5\.4 7-10V6z"/);
  assert.match(badge[1], /d="m9 12 2 2 4-5"/);
  assert.match(badge[1], /aria-hidden="true"/);
});
