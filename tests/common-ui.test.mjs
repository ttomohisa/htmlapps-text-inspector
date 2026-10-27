import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './inspection-harness.mjs';

test('URL and common preference override JSON legacy language without startup writes', () => {
  const h = harness({ url: 'https://example.invalid/?lang=ja', sharedLanguage: 'en' });
  assert.equal(h.state.lang, 'ja');
  assert.equal(h.storage.get('browser-kitty:text-inspector:settings:v1'), '{"lang":"en"}');
  assert.equal(h.storage.get('browser-kitty:ui-language:v1'), 'en');
  h.els.language.click();
  assert.equal(h.storage.get('browser-kitty:ui-language:v1'), 'en');
  assert.equal(harness({ sharedLanguage: 'ja' }).state.lang, 'ja');
});

test('autosave failure stays visible across language changes and preserves download escape', async () => {
  const h = harness({ text: 'original', failStorage: true });
  h.edit('unsaved draft'); h.advance(500);
  assert.equal(h.els.saved.attrs['data-bk-save-status'], 'error');
  assert.match(h.els.saved.textContent, /Could not save/);
  h.els.language.click();
  assert.equal(h.els.saved.attrs['data-bk-save-status'], 'error');
  assert.equal(h.els.input.value, 'unsaved draft');
  h.els.download.click();
  assert.equal(await h.downloads[0].blob.text(), 'unsaved draft');
});

test('download filename is editable and language changes preserve it', () => {
  const h = harness({ text: 'draft' });
  const filename = h.document.getElementById('downloadFilename');
  assert.ok(filename, 'editable filename'); filename.value = 'my-draft.txt';
  h.els.language.click(); h.els.download.click();
  assert.equal(h.downloads[0].filename, 'my-draft.txt');
});

test('open confirmation translates without changing input or losing cancellation', () => {
  const h = harness({ text: 'keep this draft' });
  h.els.clear.click(); h.advance(0);
  assert.equal(h.document.activeElement, h.els.confirmCancel);
  h.els.language.click();
  assert.match(h.els.confirmTitle.textContent, /[\u3040-\u9fff]/);
  h.els.confirmCancel.click();
  assert.equal(h.els.input.value, 'keep this draft');
});

test('clipboard remains disabled during the real asynchronous operation', async () => {
  const h = harness({ text: 'copy this' }); let release; let calls = 0;
  h.context.navigator.clipboard.writeText = () => { calls++; return new Promise(resolve => { release = resolve; }); };
  h.els.copy.click(); h.els.copy.click();
  assert.equal(calls, 1); assert.equal(h.els.copy.disabled, true);
  release(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.els.copy.disabled, false);
});
