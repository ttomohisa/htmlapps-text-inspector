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

test('settings failure remains visible after a successful text autosave', () => {
  const h = harness({text:'draft'}), put = h.context.localStorage.setItem;
  h.context.localStorage.setItem = (key,value) => { if (key.endsWith(':settings:v1')) throw Error('settings quota'); put(key,value); };
  h.els.targetSelect.value = '400'; h.els.targetSelect.dispatch('change');
  h.edit('saved text'); h.advance(500);
  const status = h.document.getElementById('settingsSaveStatus');
  assert.ok(status, 'separate settings status'); assert.equal(status.attrs['data-bk-save-status'],'error');
  assert.match(status.textContent,/settings/i); assert.equal(h.els.saved.attrs['data-bk-save-status'],'saved');
  h.context.localStorage.setItem = put; h.els.targetSelect.dispatch('change');
  assert.equal(status.attrs['data-bk-save-status'],'saved');
});

test('clipboard failure persists with translated recovery until a retry succeeds', async () => {
  const h=harness({text:'keep me'});
  h.context.navigator.clipboard.writeText=async()=>{throw Error('denied')};
  h.els.copy.click(); await new Promise(resolve=>setImmediate(resolve)); h.advance(10000);
  const status=h.document.getElementById('copyError'); assert.ok(status,'persistent error'); assert.match(status.textContent,/Copy/i);
  h.els.language.click(); assert.match(status.textContent,/[\u3040-\u9fff]/); assert.equal(h.els.input.value,'keep me');
  h.context.navigator.clipboard.writeText=async()=>{}; h.els.copy.click(); await new Promise(resolve=>setImmediate(resolve));
  assert.equal(status.textContent,'');
});

test('new typing invalidates Clear toast Undo before it can revert later work', async () => {
  const h=harness({text:'original'}); h.els.clear.click(); h.els.confirmAccept.click(); await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.els.input.value,''); assert.ok(h.state.undo);
  h.edit('new text'); assert.equal(h.state.undo,null); assert.equal(h.els.toast.classList.contains('show'),false);
  h.els.toastAction.click(); assert.equal(h.els.input.value,'new text');
});
