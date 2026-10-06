import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { harness, html } from './inspection-harness.mjs';

test('header uses canonical version and local-processing privacy copy', () => {
  const config = JSON.parse(readFileSync(new URL('../app.config.json', import.meta.url), 'utf8'));
  assert.equal(config.version, '1.0.1');
  assert.match(html, /class="version-badge">v(?:\{\{VERSION\}\}|1\.0\.1)<\/span>/);
  assert.match(html, /data-i18n="localBadge">完全ローカル処理<\/span>/);
  assert.match(html, /localBadge: '完全ローカル処理'/);
  assert.match(html, /localBadge: 'Processed only in your browser'/);
});

test('header language targets and help names stay localized through repeated clicks', () => {
  const original = 'Header checks preserve original text.\u200b';
  const h = harness({ text: original });
  for (const language of ['en', 'ja', 'en', 'ja']) {
    assert.equal(h.state.lang, language);
    assert.equal(h.document.documentElement.lang, language);
    const japanese = language === 'ja';
    assert.equal(h.els.language.textContent, japanese ? 'EN' : 'JA');
    assert.equal(h.els.language.attrs['aria-label'], japanese ? 'Switch to English' : '日本語に切り替え');
    assert.equal(h.els.language.title, h.els.language.attrs['aria-label']);
    assert.equal(h.els.help.attrs['aria-label'], japanese ? '使い方と注意事項' : 'How to use & notes');
    assert.equal(h.els.help.title, h.els.help.attrs['aria-label']);
    assert.equal(h.els.input.value, original);
    assert.equal(h.storage.get('browser-kitty:text-inspector:v1'), original);
    assert.equal(JSON.parse(h.storage.get('browser-kitty:text-inspector:settings:v1')).lang, language);
    h.els.language.click();
  }
});
