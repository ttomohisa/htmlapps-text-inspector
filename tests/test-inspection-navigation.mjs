import assert from 'node:assert/strict';
import { test } from 'node:test';
import { harness, html, cards, card, markers, focused } from './inspection-harness.mjs';

test('full app harness runs actual input debounce and original copy unchanged', async () => {
  const h = harness({ text: 'cat cat' });
  h.edit('dog dog');
  assert.equal(h.els.frequencyList.children[0].dataset.word, 'cat');
  h.advance(44);
  assert.equal(h.els.frequencyList.children[0].dataset.word, 'cat');
  h.advance(1);
  assert.equal(h.els.frequencyList.children[0].dataset.word, 'dog');
  await h.copyText();
  assert.equal(h.context.copied, 'dog dog');
});

test('stale invisible card never highlights an ordinary letter during debounce', () => {
  const h = harness({ text: 'a\u200b b' });
  const old = card(h, 'U+200B');
  h.edit('normal'); old.click(); h.flushFrames();
  assert.equal(focused(h).length, 0);
  assert.equal(h.els.xrayPreview.textContent, 'normal');
  assert.equal(cards(h).length, 0);
  assert.equal(h.els.input.value, 'normal');
});

test('stale frequency action cannot render a captured old text snapshot', () => {
  const h = harness({ text: 'cat cat' });
  const old = h.els.frequencyList.children[0];
  h.edit('dog dog'); old.click();
  assert.equal(h.els.xrayPreview.textContent, 'dog dog');
  assert.equal(h.state.selectedWord, '');
  assert.equal(h.els.input.value, 'dog dog');
  h.els.frequencyList.children[0].click();
  assert.equal(h.state.selectedWord, 'dog');
  assert.equal(h.els.xrayPreview.children.filter(n => n.classList.contains('word-highlight')).length, 2);
});

test('stale long/repeat/space/punctuation checks cannot reuse obsolete ranges', () => {
  for (const text of ['a'.repeat(81), 'cat cat', 'a  b', 'a!!']) {
    const h = harness({ text });
    const old = cards(h)[0];
    h.edit('normal'); old.dispatch('keydown', { key: ' ' }); h.flushFrames();
    assert.equal(focused(h).length, 0, text);
    assert.equal(h.els.xrayPreview.textContent, 'normal');
    assert.equal(h.state.selectedWord, '');
  }
});

test('each of five types navigates original UTF-16 occurrences without wrapping', () => {
  for (const [char, code] of [['\u200b', 'U+200B'], ['\u00a0', 'U+00A0'], ['\u202f', 'U+202F'], ['\u2060', 'U+2060'], ['\ufeff', 'U+FEFF']]) {
    const text = `😀e\u0301${char} a${char} b${char}`;
    const h = harness({ text });
    card(h, code).click();
    assert.equal(h.els.invisibleNavigation.hidden, false);
    assert.match(h.els.invisibleNavigationLabel.textContent, new RegExp(code.replace('+', '\\+')));
    assert.equal(h.els.invisiblePosition.textContent, '1 / 3');
    assert.equal(h.els.invisiblePrevious.disabled, true);
    assert.equal(h.els.invisibleNext.disabled, false);
    h.els.invisibleNext.click();
    assert.equal(h.state.focusRange.start, text.indexOf(char, 5));
    assert.equal(h.els.invisiblePosition.textContent, '2 / 3');
    h.els.invisibleNext.click(); h.els.invisibleNext.click();
    assert.equal(h.state.focusRange.start, text.lastIndexOf(char));
    assert.equal(h.els.invisiblePosition.textContent, '3 / 3');
    assert.equal(h.els.invisibleNext.disabled, true);
    h.els.invisiblePrevious.click(); h.els.invisiblePrevious.click(); h.els.invisiblePrevious.click();
    assert.equal(h.state.focusRange.start, 4);
    assert.equal(h.els.invisiblePosition.textContent, '1 / 3');
    assert.equal(h.els.input.value, text);
  }
});

test('single occurrence disables both buttons and switching types resets ordinal', () => {
  const h = harness({ text: '\u200b\u00a0\u200b\u2060' });
  card(h, 'U+200B').dispatch('keydown', { key: 'Enter' }); h.els.invisibleNext.click();
  card(h, 'U+00A0').dispatch('keydown', { key: ' ' });
  assert.equal(h.els.invisiblePosition.textContent, '1 / 1');
  assert.equal(h.els.invisiblePrevious.disabled, true);
  assert.equal(h.els.invisibleNext.disabled, true);
  card(h, 'U+200B').click();
  assert.equal(h.els.invisiblePosition.textContent, '1 / 2');
  assert.equal(h.state.focusRange.start, 0);
  h.flushFrames();
  assert.equal(h.document.activeElement, focused(h)[0]);
});

test('navigation reserves targets beyond the marker cap and stays inside analyzed prefix', () => {
  const h = harness({ text: '\u200b\u00a0\u200b\u200b\u200b\u2060\u200b', markerLimit: 2, analysisLimit: 6 });
  card(h, 'U+200B').click();
  h.els.invisibleNext.click(); h.els.invisibleNext.click(); h.els.invisibleNext.click();
  assert.equal(h.els.invisiblePosition.textContent, '4 / 4');
  assert.equal(h.state.focusRange.start, 4);
  assert.equal(h.els.invisibleNext.disabled, true);
  assert.equal(markers(h).length, 2);
  assert.equal(focused(h)[0].textContent, '[ZWSP]');
  assert.equal(h.els.xrayMarkerNote.hidden, false);
  h.els.invisiblePrevious.click();
  assert.equal(h.state.focusRange.start, 3);
  card(h, 'U+2060').click();
  assert.equal(h.state.focusRange.start, 5);
  assert.equal(h.els.invisiblePosition.textContent, '1 / 1');
  assert.equal(focused(h)[0].textContent, '[WJ]');
});

test('input immediately resets navigation and stale next cannot apply the old target', () => {
  const h = harness({ text: '\u200b a\u200b' });
  card(h, 'U+200B').click(); h.els.invisibleNext.click();
  const pendingMarker = focused(h)[0];
  h.edit('😀new\u200b');
  assert.equal(h.els.invisibleNavigation.hidden, true);
  assert.equal(h.state.focusRange, null);
  h.els.invisibleNext.dispatch('click'); h.flushFrames();
  assert.notEqual(h.document.activeElement, pendingMarker);
  h.advance(45);
  card(h, 'U+200B').click();
  assert.equal(h.els.invisiblePosition.textContent, '1 / 1');
  assert.equal(h.state.focusRange.start, 5);
});

test('navigation guards a replaced editor even before its input event is observed', () => {
  const h = harness({ text: '\u200b a\u200b' });
  card(h, 'U+200B').click();
  h.els.input.value = 'normal'; h.els.invisibleNext.click();
  assert.equal(h.els.invisibleNavigation.hidden, true);
  assert.equal(h.els.xrayPreview.textContent, 'normal');
  assert.equal(focused(h).length, 0);
});

test('language change preserves type and ordinal with bilingual native buttons', () => {
  const h = harness({ text: '\u200b\u200b' });
  card(h, 'U+200B').click(); h.els.invisibleNext.click();
  h.els.language.click();
  assert.equal(h.els.invisiblePosition.textContent, '2 / 2');
  assert.match(h.els.invisibleNavigationLabel.textContent, /ゼロ幅スペース/);
  assert.equal(h.els.invisiblePrevious.textContent, '前へ');
  assert.equal(h.els.invisibleNext.textContent, '次へ');
  assert.equal(h.state.focusRange.start, 1);
  h.els.language.click();
  assert.equal(h.els.invisiblePrevious.textContent, 'Previous');
  assert.equal(h.els.invisibleNext.textContent, 'Next');
  assert.equal(h.els.invisiblePrevious.tag, 'button');
  assert.ok(h.els.invisiblePrevious.classList.contains('button'), 'uses the shared responsive button and disabled styles');
  assert.equal(h.els.invisiblePrevious.attrs.type, 'button');
  assert.match(h.els.invisiblePrevious.attrs['aria-label'], /Previous/);
  assert.equal(h.els.invisiblePosition.attrs['aria-live'], 'polite');
  assert.match(html, /\.invisible-navigation[^}]*flex-wrap:\s*wrap/);
});

test('frequency and ordinary check selection exit invisible navigation', () => {
  const h = harness({ text: 'cat cat  \u200b\u200b!!' });
  card(h, 'U+200B').click(); h.els.frequencyList.children[0].click();
  assert.equal(h.els.invisibleNavigation.hidden, true);
  assert.equal(h.state.selectedWord, 'cat');
  card(h, 'U+200B').click();
  cards(h).find(n => n.textContent.includes('spaces')).click();
  assert.equal(h.els.invisibleNavigation.hidden, true);
  assert.equal(focused(h)[0].textContent, '  ');
});

test('cancel preserves position; confirmed clear/sample and undo/redo reset navigation', async () => {
  const text = 'original\u200b\u200b';
  const h = harness({ text });
  const activate = () => { card(h, 'U+200B').click(); h.els.invisibleNext.click(); };
  activate(); h.els.clear.click(); h.els.confirmCancel.click(); await Promise.resolve();
  assert.equal(h.els.invisiblePosition.textContent, '2 / 2');
  h.els.clear.click(); h.els.confirmAccept.click(); await Promise.resolve();
  assert.equal(h.els.input.value, ''); assert.equal(h.els.invisibleNavigation.hidden, true);
  h.els.undoButton.click(); h.advance(45);
  assert.equal(h.els.input.value, text); assert.equal(h.els.invisibleNavigation.hidden, true);
  activate(); h.els.redoButton.click();
  assert.equal(h.els.input.value, ''); assert.equal(h.els.invisibleNavigation.hidden, true);
  h.els.undoButton.click(); h.advance(45); activate();
  h.els.sample.click(); h.els.confirmAccept.click(); await Promise.resolve();
  assert.equal(h.els.invisibleNavigation.hidden, true);
  assert.notEqual(h.els.input.value, text);
});

test('navigation never changes original copy, selection, history or stored text/settings', async () => {
  const text = '😀\u200b\u200b\u00a0\u202f\u2060\ufeff';
  const h = harness({ text });
  const history = JSON.stringify(h.state.history);
  const stored = JSON.stringify([...h.storage]);
  h.els.input.selectionStart = 2; h.els.input.selectionEnd = 4;
  card(h, 'U+200B').click(); h.els.invisibleNext.click(); h.flushFrames();
  await h.copyText(); h.advance(500);
  assert.equal(h.context.copied, text);
  assert.equal(h.els.input.value, text);
  assert.equal(h.els.input.selectionStart, 2); assert.equal(h.els.input.selectionEnd, 4);
  assert.equal(JSON.stringify(h.state.history), history);
  assert.equal(JSON.stringify([...h.storage]), stored);
});
