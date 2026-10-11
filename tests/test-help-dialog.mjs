import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, html } from './inspection-harness.mjs';

// Source/readable structure only; native outside-wheel and close paths need browser QA.
for (const element of ['html', 'body']) {
  test(`${element} locks background scrolling while a native modal is active`, () => {
    const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
    const selector = `${element}:has(dialog:modal)`;
    const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .find(([, selectors]) => selectors.split(',').some(value => value.trim() === selector));
    assert.ok(rule, `${selector} must follow native modal state`);
    assert.match(rule[2], /(?:^|;)\s*overflow\s*:\s*hidden\s*(?:;|$)/);
  });
}

test('help reading area is labeled and explicitly keyboard-focusable across browsers', () => {
  const h = harness();
  assert.equal(h.els.helpBody.attrs.tabindex, '0');
  assert.equal(h.els.helpBody.attrs['aria-labelledby'], 'helpTitle');
  assert.equal(h.els.helpDialog.attrs['aria-labelledby'], 'helpTitle');
});

test('opening and reopening help always starts at the beginning without changing input', () => {
  const original = 'Keep my text.\u200b';
  const h = harness({ text: original });
  // The old dialog scrolls as a whole; the fixed dialog scrolls its body.
  const scroller = h.els.helpBody || h.els.helpDialog;
  for (const close of ['button', 'backdrop', 'button']) {
    scroller.scrollTop = 157;
    h.els.help.click();
    assert.equal(h.els.helpDialog.open, true);
    assert.equal(scroller.scrollTop, 0, 'each open resets the reading position');
    if (close === 'backdrop') h.els.helpDialog.click();
    else h.els.helpClose.click();
    assert.equal(h.els.helpDialog.open, false);
    assert.equal(h.els.input.value, original);
    assert.equal(h.storage.get('browser-kitty:text-inspector:v1'), original);
    h.els.language.click();
  }
});
