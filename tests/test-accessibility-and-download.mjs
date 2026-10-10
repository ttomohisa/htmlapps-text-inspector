import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './inspection-harness.mjs';

test('all interface accessible labels follow repeated Japanese/English changes', () => {
  const h = harness({ text: 'Preserve my text.\u200b' });
  const expected = {
    textInput: ['Text to analyze', '分析するテキスト'],
    targetSelect: ['Target character count', '目標文字数'],
    targetInput: ['Custom target character count', '自由入力の目標文字数'],
    analysisSection: ['Text analysis', '文章分析'],
    toastClose: ['Close', '閉じる'],
  };
  for (const lang of ['en', 'ja', 'en', 'ja']) {
    assert.equal(h.state.lang, lang);
    for (const [id, labels] of Object.entries(expected)) assert.equal(h.document.getElementById(id).attrs['aria-label'], labels[lang === 'en' ? 0 : 1], id);
    const tabs = h.document.querySelectorAll('[role]').find(node => node.attrs.role === 'tablist');
    assert.equal(tabs.attrs['aria-label'], lang === 'en' ? 'Analysis views' : '分析項目');
    if (lang === 'en') {
      for (const node of h.document.querySelectorAll('[aria-label]')) {
        // The language switch intentionally names the target language in Japanese.
        if (node.id !== 'languageButton') assert.doesNotMatch(node.attrs['aria-label'], /[\u3040-\u30ff\u3400-\u9fff]/u, node.id || node.tag);
      }
    }
    assert.equal(h.els.input.value, 'Preserve my text.\u200b');
    h.els.language.click();
  }
});

test('Save .txt downloads original UTF-8 text without BOM or newline additions', async () => {
  const original = '日本語 😀 e\u0301\nsecond\tline\u200b\u00a0\u202f\u2060\ufeff  \n';
  const h = harness({ text: original });
  const save = h.document.getElementById('downloadButton');
  assert.ok(save, 'Save .txt button exists');
  h.els.input.selectionStart = 2; h.els.input.selectionEnd = 5;
  const history = JSON.stringify(h.state.history);
  save.click();
  assert.equal(h.downloads.length, 1);
  const file = h.downloads[0];
  assert.equal(file.filename, 'text-inspector.txt');
  assert.equal(file.blob.type, 'text/plain;charset=utf-8');
  assert.deepEqual(Buffer.from(await file.blob.arrayBuffer()), Buffer.from(original, 'utf8'));
  assert.equal(file.connected, true, 'download anchor is attached for browser compatibility');
  assert.equal(h.document.body.children.length, 0, 'temporary anchor is removed');
  assert.equal(h.revokedUrls.length, 0, 'the URL is not revoked before the browser can consume it');
  h.advance(1000);
  assert.deepEqual(h.revokedUrls, [file.url]);
  assert.equal(h.blobUrls.size, 0);
  assert.equal(h.els.input.value, original);
  assert.equal(h.els.input.selectionStart, 2); assert.equal(h.els.input.selectionEnd, 5);
  assert.equal(JSON.stringify(h.state.history), history);
  assert.equal(h.storage.get('browser-kitty:text-inspector:v1'), original);
});

test('downloads use the latest full input, including empty and whitespace-only text', async () => {
  const h = harness({ text: 'old' });
  const save = h.document.getElementById('downloadButton');
  assert.ok(save, 'Save .txt button exists');
  const samples = ['latest\ntext\u200b', '', '\t\n  ', '\ufeffleading BOM', 'x'.repeat(200001) + '\u200bTAIL'];
  for (const text of samples) {
    h.edit(text); // Save before analysis/autosave debounce fires.
    save.click();
    const file = h.downloads.at(-1);
    assert.deepEqual(Buffer.from(await file.blob.arrayBuffer()), Buffer.from(text, 'utf8'));
    h.els.language.click();
  }
  assert.equal(h.downloads.length, samples.length);
  assert.equal(new Set(h.downloads.map(file => file.url)).size, samples.length);
  h.advance(1000);
  assert.equal(h.revokedUrls.length, samples.length);
  assert.equal(h.blobUrls.size, 0);
});

test('a download failure is localized, cleans up and leaves the editor usable', () => {
  const h = harness({ text: 'Keep me' });
  const save = h.document.getElementById('downloadButton');
  assert.ok(save, 'Save .txt button exists');
  const create = h.document.createElement;
  h.document.createElement = tag => {
    const node = create(tag);
    if (tag === 'a') node.click = () => { throw new Error('blocked download'); };
    return node;
  };
  for (const message of ['Could not start download', 'ダウンロードを開始できませんでした']) {
    save.click();
    assert.equal(h.els.toastMessage.textContent, message);
    assert.equal(h.document.body.children.length, 0);
    assert.equal(h.els.input.value, 'Keep me');
    h.els.language.click();
  }
  h.advance(1000);
  assert.equal(h.blobUrls.size, 0);
  assert.equal(h.downloads.length, 0);
});
