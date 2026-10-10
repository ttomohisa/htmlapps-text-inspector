import { readFileSync } from 'node:fs';
import vm from 'node:vm';

export const html = readFileSync(process.env.TEXT_INSPECTOR_HTML || new URL('../src/index.template.html', import.meta.url), 'utf8');

// Executes the complete app, including its actual event bindings and debounce.
// This adapter checks DOM state, not native keyboard behavior, selection or layout.
export function harness({ text = '', markerLimit, analysisLimit } = {}) {
  const frames = [];
  const timers = new Map();
  const storage = new Map([['browser-kitty:text-inspector:v1', text], ['browser-kitty:text-inspector:settings:v1', '{"lang":"en"}']]);
  const downloads = [], blobUrls = new Map(), revokedUrls = [];
  let urlId = 0;
  let now = 0;
  let timerId = 0;
  let document;
  class Node {
    constructor(tag = 'div') { this.tag = tag; this.children = []; this.classes = new Set(); this.style = {}; this.attrs = {}; this.events = {}; this.dataset = {}; this.isConnected = true; this.hidden = false; this.value = ''; }
    get className() { return [...this.classes].join(' '); }
    set className(value) { this.classes = new Set(value.split(/\s+/)); }
    get classList() { return { add: (...names) => names.forEach(n => this.classes.add(n)), contains: n => this.classes.has(n), remove: n => this.classes.delete(n), toggle: (n, active) => active ? this.classes.add(n) : this.classes.delete(n) }; }
    set textContent(value) { this.text = String(value); this.replaceChildren(); }
    get textContent() { return (this.text || '') + this.children.map(n => n.textContent).join(''); }
    set innerHTML(value) { this.html = value; }
    append(...nodes) { this.children.push(...nodes); nodes.forEach(node => { node.parentNode = this; }); }
    appendChild(node) { this.append(node); return node; }
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(node => node !== this); this.parentNode = null; this.isConnected = false; }
    replaceChildren(...nodes) { this.children.forEach(n => n.isConnected = false); this.children = nodes; }
    setAttribute(key, value) { this.attrs[key] = String(value); }
    removeAttribute(key) { delete this.attrs[key]; }
    addEventListener(event, fn) { (this.events[event] ||= []).push(fn); }
    dispatch(event, data = {}) { for (const fn of this.events[event] || []) fn({ target: this, preventDefault() {}, ...data }); }
    click() {
      if (this.disabled) return;
      if (this.tag === 'a' && this.download) downloads.push({ filename: this.download, blob: blobUrls.get(this.href), url: this.href, connected: !!this.parentNode });
      this.dispatch('click');
    }
    focus() { document.activeElement = this; this.focused = true; }
    scrollIntoView() { this.scrolled = true; }
    showModal() { this.open = true; }
    close() { this.open = false; }
    querySelectorAll() { return []; }
    matches(selector) { return ['input', 'textarea'].includes(this.tag) && selector.includes(this.tag); }
    select() { this.selectionStart = 0; this.selectionEnd = this.value.length; }
  }
  const nodes = [...html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)].map(([, tag, attrs]) => {
    const node = new Node(tag);
    for (const [, key, value] of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) {
      node.setAttribute(key, value);
      if (key === 'id') node.id = value;
      if (key === 'class') node.className = value;
      if (key.startsWith('data-')) node.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    }
    node.hidden = /\shidden\b/.test(attrs); node.disabled = /\sdisabled\b/.test(attrs);
    return node;
  });
  const byId = Object.fromEntries(nodes.filter(n => n.id).map(n => [n.id, n]));
  const tabs = new Node();
  document = {
    documentElement: {}, activeElement: null, body: new Node('body'),
    getElementById: id => byId[id], createElement: tag => new Node(tag),
    createTextNode: text => Object.assign(new Node(), { text }),
    querySelector: () => tabs,
    querySelectorAll: selector => selector.startsWith('.') ? nodes.filter(n => n.classList.contains(selector.slice(1))) : nodes.filter(n => Object.hasOwn(n.attrs, selector.slice(1, -1))),
    addEventListener() {}
  };
  byId.targetSelect.value = '0';
  const context = {
    Blob,
    URL: { createObjectURL: blob => { const url = `blob:test-${++urlId}`; blobUrls.set(url, blob); return url; }, revokeObjectURL: url => { revokedUrls.push(url); blobUrls.delete(url); } },
    document, localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    window: {
      isSecureContext: true, matchMedia: () => ({ matches: true }), requestAnimationFrame: fn => frames.push(fn),
      setTimeout: (fn, delay) => { const id = ++timerId; timers.set(id, { fn, at: now + delay }); return id; },
      clearTimeout: id => timers.delete(id)
    },
    navigator: { clipboard: { writeText: async value => { context.copied = value; } } }
  };
  let script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  if (markerLimit) script = script.replace('const MAX_INVISIBLE_MARKERS = 1000;', `const MAX_INVISIBLE_MARKERS = ${markerLimit};`);
  if (analysisLimit) script = script.replace('const MAX_LIVE_ANALYSIS = 200000;', `const MAX_LIVE_ANALYSIS = ${analysisLimit};`);
  script = script.replace('    })();', '      globalThis.api = { state, els, buildAnalysis, renderChecks, renderXray, renderFrequency, analyzeNow, copyText, undoText, redoText };\n    })();');
  vm.runInNewContext(script, context);
  return {
    ...context.api, context, document, storage, downloads, blobUrls, revokedUrls,
    edit(value) { context.api.els.input.value = value; context.api.els.input.dispatch('input'); },
    advance(ms) {
      const until = now + ms;
      for (;;) {
        const next = [...timers.entries()].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at; timers.delete(next[0]); next[1].fn();
      }
      now = until;
    },
    flushFrames() { while (frames.length) frames.shift()(); }
  };
}

export const cards = h => h.els.checksList.children.filter(n => n.attrs.role === 'button');
export const card = (h, code) => cards(h).find(n => n.textContent.includes(code));
export const markers = h => h.els.xrayPreview.children.filter(n => n.classList.contains('invisible-marker'));
export const focused = h => h.els.xrayPreview.children.filter(n => n.classList.contains('issue-focus'));
