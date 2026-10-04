import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const script = readFileSync(new URL('../src/index.template.html', import.meta.url), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
// Small DOM adapter for the renderer; full layout/browser coverage is separate.
class Node {
  constructor(tag = '') { this.tag = tag; this.children = []; this.classes = new Set(); this.style = {}; this.attrs = {}; this.events = {}; this.dataset = {}; this.isConnected = true; this.hidden = false; }
  get className() { return [...this.classes].join(' '); }
  set className(value) { this.classes = new Set(value.split(/\s+/)); }
  get classList() { return { add: (...names) => names.forEach(n => this.classes.add(n)), contains: n => this.classes.has(n), remove: n => this.classes.delete(n), toggle: (n, active) => active ? this.classes.add(n) : this.classes.delete(n) }; }
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return (this.text || '') + this.children.map(n => n.textContent).join(''); }
  set innerHTML(value) { this.html = value; }
  append(...nodes) { this.children.push(...nodes); }
  appendChild(node) { this.append(node); return node; }
  replaceChildren(...nodes) { this.children.forEach(n => n.isConnected = false); this.children = nodes; this.text = ''; }
  setAttribute(key, value) { this.attrs[key] = value; }
  addEventListener(event, fn) { this.events[event] = fn; }
  focus() { this.focused = true; }
  scrollIntoView() { this.scrolled = true; }
  showModal() { this.open = true; }
  close() { this.open = false; }
}
function harness() {
  const ids = ['xrayPreview', 'xrayMarkerNote', 'selectedWordLegend', 'checksList', 'styleResult', 'frequencyList', 'frequencyNote', 'undoButton', 'redoButton', 'mobileUndoButton', 'mobileRedoButton', 'toast', 'toastMessage', 'toastAction', 'saved', 'confirmDialog', 'confirmTitle', 'confirmMessage', 'confirmAccept', 'confirmCancel', 'selection'];
  const els = Object.fromEntries(ids.map(id => [id, new Node()]));
  els.input = Object.assign(new Node('textarea'), { value: '', select() { this.selected = this.value; this.selectionStart = 0; this.selectionEnd = this.value.length; } });
  const frames = [];
  const tabs = ['checks', 'xray'].map(name => Object.assign(new Node('button'), { dataset: { tab: name } }));
  const panels = ['checks', 'xray'].map(name => Object.assign(new Node(), { id: `panel-${name}` }));
  const context = {
    els,
    document: { createElement: tag => new Node(tag), createTextNode: text => Object.assign(new Node(), { text }), querySelectorAll: selector => selector === '.tab' ? tabs : panels },
    window: { requestAnimationFrame: fn => frames.push(fn), matchMedia: () => ({ matches: true }), setTimeout: () => 1, clearTimeout() {}, isSecureContext: true }, navigator: { clipboard: { writeText: async text => { context.copied = text; } } }
  };
  const code = script.slice(script.indexOf("'use strict';"), script.indexOf('      const $ ='))
    + script.slice(script.indexOf('      function t('), script.indexOf('      function mountMobileBottomBar('));
  const api = vm.runInNewContext(`${code}; ({ state, buildAnalysis, renderChecks, renderXray, copyText, initializeHistory, replaceText, undoText, redoText, confirmAndReplace, finishConfirm })`, context);
  api.state.lang = 'en';
  return { ...api, context, els, tabs, frames, flushFrames() { while (frames.length) frames.shift()(); } };
}
const markers = h => h.els.xrayPreview.children.filter(n => n.classList.contains('invisible-marker'));

test('whitespace-only findings become actionable Unicode check cards', () => {
  const h = harness();
  h.els.input.value = '\u00a0\u202f\ufeff';
  h.renderChecks(h.buildAnalysis(h.els.input.value));
  const cards = h.els.checksList.children.filter(n => n.attrs.role === 'button');
  assert.equal(cards.length, 3);
  assert.match(cards[0].textContent, /U\+00A0/);
  assert.match(cards[0].textContent, /1/);
  cards[0].events.keydown({ key: 'Enter', preventDefault() {} });
  h.flushFrames();
  const focused = markers(h).find(n => n.classList.contains('issue-focus'));
  assert.equal(focused?.textContent, '[NBSP]');
  assert.ok(focused.focused && focused.scrolled, 'keyboard focus and scrolling follow the selected occurrence');
  assert.equal(h.els.input.value, '\u00a0\u202f\ufeff');
});

test('rendered markers preserve UTF-16 positions, untrusted text and overlapping highlights', () => {
  const h = harness();
  const text = '<img>😀e\u0301\u200b' + '文'.repeat(85) + '\u2060。';
  const a = h.buildAnalysis(text);
  h.state.selectedWord = 'e\u0301\u200b';
  h.state.focusRange = { start: 9, end: 10 };
  h.renderXray(a);
  assert.equal(markers(h).length, 2);
  const m = markers(h)[0];
  assert.equal(m.textContent, '[ZWSP]');
  assert.match(m.title, /U\+200B/);
  assert.ok(m.classList.contains('long-sentence'));
  assert.ok(m.classList.contains('word-highlight'));
  assert.ok(m.classList.contains('issue-focus'));
  assert.ok(h.els.xrayPreview.textContent.startsWith('<img>😀e\u0301[ZWSP]'));
  assert.ok(h.els.xrayPreview.children.every(n => !n.html), 'rendered input never becomes HTML');
});

test('marker cap includes a selected rare type beyond the first 1000 markers', () => {
  const h = harness();
  h.els.input.value = '\u200b'.repeat(1100) + '\u00a0';
  const a = h.buildAnalysis(h.els.input.value);
  h.renderChecks(a);
  const card = h.els.checksList.children.find(n => n.textContent.includes('U+00A0'));
  assert.ok(card, 'later rare type remains actionable');
  card.events.click();
  assert.equal(markers(h).length, 1000);
  assert.equal(markers(h).find(n => n.classList.contains('issue-focus')).textContent, '[NBSP]');
  assert.match(h.els.xrayMarkerNote.textContent, /1,000/);
  assert.equal(h.els.xrayMarkerNote.hidden, false);
  assert.equal(a.invisible.ranges.length, 1000, 'render does not mutate analysis ranges');
  h.state.focusRange = null;
  h.renderXray(h.buildAnalysis('normal'));
  h.flushFrames();
  assert.equal(markers(h).length, 0);
  assert.equal(h.els.xrayMarkerNote.hidden, true);
});

test('repeated activation and language switches refresh readable marker names', () => {
  const h = harness();
  h.els.input.value = '\u200b\u00a0\u202f\u2060\ufeff';
  const a = h.buildAnalysis(h.els.input.value);
  h.renderChecks(a);
  const cards = h.els.checksList.children.filter(n => n.attrs.role === 'button');
  assert.equal(cards.length, 5);
  cards[0].events.click();
  cards[1].events.keydown({ key: ' ', preventDefault() {} });
  h.flushFrames();
  assert.equal(markers(h).filter(n => n.focused).length, 1);
  assert.equal(markers(h).find(n => n.focused).textContent, '[NBSP]');
  h.state.lang = 'ja';
  h.renderXray(a);
  assert.match(markers(h)[0].title, /ゼロ幅/);
  assert.equal(h.els.input.value, a.fullText);
});


test('Copy sends the untouched original, including all invisible characters', async () => {
  const h = harness();
  const text = '😀\u200b\u00a0\u202f\u2060\ufeff';
  h.els.input.value = text;
  h.renderXray(h.buildAnalysis(text));
  await h.copyText();
  assert.equal(h.context.copied, text);
  h.context.navigator.clipboard = undefined;
  h.context.document.execCommand = command => { assert.equal(command, 'copy'); return true; };
  await h.copyText();
  assert.equal(h.els.input.selected, text, 'fallback selects the original textarea');
  assert.equal(h.els.toastMessage.textContent, 'Copied');
});

test('cancel, clear, undo and redo retain original text and clear stale issue focus', async () => {
  const h = harness();
  const text = 'original\u200b\u00a0';
  h.els.input.value = text;
  h.initializeHistory(text);
  const cancelled = h.confirmAndReplace('clear');
  assert.equal(h.els.confirmDialog.open, true);
  h.finishConfirm(false);
  await cancelled;
  assert.equal(h.els.input.value, text);
  const sampleCancelled = h.confirmAndReplace('sample');
  h.finishConfirm(false);
  await sampleCancelled;
  assert.equal(h.els.input.value, text);
  h.state.focusRange = { start: 8, end: 9 };
  const cleared = h.confirmAndReplace('clear');
  h.finishConfirm(true);
  await cleared;
  assert.equal(h.els.input.value, '');
  assert.equal(h.state.focusRange, null);
  h.undoText();
  assert.equal(h.els.input.value, text);
  h.redoText();
  assert.equal(h.els.input.value, '');
});
