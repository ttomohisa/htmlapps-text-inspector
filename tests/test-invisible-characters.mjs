import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = readFileSync(new URL('../src/index.template.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
// Evaluate the real analysis code before UI setup; no production-only test API.
const analysisCode = script.slice(script.indexOf("'use strict';"), script.indexOf('      const $ ='))
  + script.slice(script.indexOf('      function t('), script.indexOf('      function renderSummary('));
const core = vm.runInNewContext(`${analysisCode}; ({ buildAnalysis, scanInvisibleCharacters: typeof scanInvisibleCharacters === 'function' ? scanInvisibleCharacters : null })`);
const plain = value => JSON.parse(JSON.stringify(value));

test('detects exactly the five supported characters with counts and UTF-16 ranges', () => {
  const text = '😀e\u0301\u200bA\u00a0\u202f\u2060\ufeff\u200b';
  const a = core.buildAnalysis(text);
  assert.ok(a.invisible, 'analysis includes invisible-character findings');
  assert.equal(a.invisible.total, 6);
  assert.deepEqual(plain(a.invisible.groups.map(g => [g.code, g.count, g.firstRange])), [
    ['U+200B', 2, { start: 4, end: 5 }],
    ['U+00A0', 1, { start: 6, end: 7 }],
    ['U+202F', 1, { start: 7, end: 8 }],
    ['U+2060', 1, { start: 8, end: 9 }],
    ['U+FEFF', 1, { start: 9, end: 10 }]
  ]);
  for (const range of a.invisible.ranges) assert.equal(text.slice(range.start, range.end).length, 1);
  assert.equal(a.text, text);
  assert.equal(a.fullText, text);
});

test('ignores ZWJ, ZWNJ, emoji modifiers, combining marks and ordinary whitespace', () => {
  const a = core.buildAnalysis('👩🏽‍💻 می\u200cروم e\u0301 \t\n\r');
  assert.equal(a.invisible?.total, 0);
  assert.deepEqual(plain(a.invisible.groups), []);
});

test('keeps all counts while bounding stored marker ranges', () => {
  const a = core.buildAnalysis('\u200b'.repeat(1100) + '\u00a0');
  assert.equal(a.invisible?.total, 1101);
  assert.equal(a.invisible.ranges.length, 1000);
  assert.equal(a.invisible.groups[0].count, 1100);
  assert.deepEqual(plain(a.invisible.groups[1].firstRange), { start: 1100, end: 1101 });
});

test('uses the existing first-200000 UTF-16-unit analysis limit', () => {
  const text = '😀'.repeat(99999) + '\u200b\u00a0\u202f';
  const a = core.buildAnalysis(text);
  assert.equal(a.invisible?.total, 2);
  assert.equal(a.limited, true);
  assert.equal(a.text.length, 200000);
  assert.equal(a.fullText, text);
  assert.equal(a.chars, 100002);
  assert.deepEqual(plain(a.invisible.ranges.map(r => r.start)), [199998, 199999]);
});

test('handles empty and whitespace-only text without dropping NBSP or BOM', () => {
  assert.equal(core.buildAnalysis('').invisible?.total, 0);
  assert.equal(core.buildAnalysis('\u00a0\u202f\ufeff').invisible?.total, 3);
});
