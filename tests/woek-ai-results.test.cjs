const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const source = fs.readFileSync('assets/js/main.js', 'utf8');
const storeSource = source.slice(source.indexOf('const WoekUserSpace ='), source.indexOf('const WirkungsraumLayer ='));
const resultSource = fs.readFileSync('assets/js/woek-ai-results.js', 'utf8');
function storage() {
  const data = new Map();
  return { blocked: false, getItem: (key) => data.get(key) || null, removeItem: (key) => data.delete(key),
    setItem(key, value) { if (this.blocked) throw new Error('QuotaExceededError'); data.set(key, value); } };
}
function store(localStorage) {
  const context = { window: { localStorage }, crypto, URL, TextEncoder, TextDecoder };
  vm.runInNewContext(storeSource, context);
  return context.window.WoekUserSpace;
}
test('unique generations, idempotent saves, full answers/sources, >120 items and reload', () => {
  const disk = storage(); const api = store(disk);
  const item = { question: 'Was ist Wirkung?', answer: 'Vollständige Antwort '.repeat(1000), sources: [{ url: 'https://wirkungsoekonomie.de/begriffe/wirkung/', title: 'Wirkung', excerpt: 'Quelle '.repeat(100) }] };
  const first = api.recordAiQuery(item); const second = api.recordAiQuery(item);
  assert.notEqual(first.id, second.id);
  api.recordAiQuery(first);
  assert.equal(api.getItems('ai_query_history').length, 2);
  for (let i = 0; i < 121; i++) api.recordAiQuery({ ...item, answer: String(i) });
  const restored = store(disk).getItems('ai_query_history').find((entry) => entry.id === first.id);
  assert.equal(restored.answer, item.answer.trim());
  assert.equal(restored.sources[0].excerpt, item.sources[0].excerpt);
});
test('quota failure throws without destroying previously saved answers', () => {
  const disk = storage(); const api = store(disk);
  const first = api.recordAiQuery({ question: 'Erste Frage', answer: 'Bleibt erhalten' });
  disk.blocked = true;
  assert.throws(() => api.recordAiQuery({ question: 'Zweite Frage', answer: 'Nicht gespeichert' }));
  disk.blocked = false;
  assert.equal(store(disk).getItems('ai_query_history')[0].id, first.id);
});
// Minimal isolated DOM adapter: tests behavior without reading any user's browser data.
function controller({ search = '', fetchImpl, saved = [], blocked = false } = {}) {
  const elements = [];
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.handlers = {}; this.hidden = false; this.value = ''; this.textContent = ''; elements.push(this); }
    append(...nodes) { this.children.push(...nodes); }
    after(node) { this.sibling = node; }
    setAttribute(k, v) { this.attrs[k] = v; }
    removeAttribute(k) { delete this.attrs[k]; }
    addEventListener(k, fn) { this.handlers[k] = fn; }
    focus() {} select() {}
    click() { return this.handlers.click?.(); }
  }
  const answer = new Element('div'), warning = new Element('p'), head = new Element('head');
  let requests = 0, renders = 0, writes = 0;
  const context = {
    window: { WoekUserSpace: { recordAiQuery(item) { writes++; if (blocked) throw new Error('quota'); return item; }, getItems: () => saved } },
    document: { documentElement: { lang: 'de' }, head, createElement: (tag) => new Element(tag), dispatchEvent() {}, querySelector: (s) => s === '#woek-ai-answer' ? answer : s === '#woek-ai-warning' ? warning : null },
    crypto, URL, URLSearchParams, AbortSignal, CustomEvent: class {},
    location: { search, href: 'https://wirkungsoekonomie.de/woek-ki/' + search }, history: { replaceState() {} },
    navigator: { clipboard: { writeText: async () => { throw new Error('Denied'); } } },
    fetch: async (...args) => { requests++; return fetchImpl(...args); }
  };
  vm.runInNewContext(resultSource, context);
  const api = context.window.WoekAiResults.attach({ apiBase: 'https://api.example', render() { renders++; } });
  const byText = (text) => elements.find((el) => el.textContent === text);
  return { api, elements, byText, warning, counts: () => ({ requests, renders, writes }) };
}
test('sharing is explicit, only one snapshot is uploaded, repeated clicks reuse the link', async () => {
  let body;
  const c = controller({ fetchImpl: async (url, request) => { body = JSON.parse(request.body); return { ok: true, json: async () => ({ ok: true, id: 'sr-11111111-1111-4111-8111-111111111111' }) }; } });
  c.api.begin(); c.api.capture({ question: 'Was ist Wirkung?', answer: '<script>not executable</script>', sources: [], privateHistory: 'never upload' });
  await c.byText('Antwort teilen').click();
  assert.equal(c.counts().requests, 0);
  await c.byText('Öffentlichen Link erstellen').click();
  assert.equal(body.privateHistory, undefined);
  assert.equal(body.answer, '<script>not executable</script>');
  await c.byText('Öffentlichen Link erstellen').click();
  assert.equal(c.counts().requests, 1);
  await c.byText('Link kopieren').click();
  assert.ok(c.byText('Bitte den markierten Link manuell kopieren.'));
});
test('a blocked save remains visible and sharing errors do not claim success', async () => {
  const c = controller({ blocked: true, fetchImpl: async () => { throw new Error('offline'); } });
  c.api.capture({ question: 'Testfrage', answer: 'Antwort', sources: [] });
  assert.ok(c.elements.some((el) => el.textContent.startsWith('Nicht gespeichert:')));
  await c.byText('Öffentlichen Link erstellen').click();
  assert.ok(c.elements.some((el) => el.textContent.startsWith('Der Link konnte nicht erstellt werden.')));
});
test('local restore does not call AI; public restore does not silently save', async () => {
  const item = { id: 'legacy-id', question: 'Gespeicherte Frage', answer: 'Originalantwort', sources: [] };
  const local = controller({ search: '?antwort=legacy-id', saved: [item] });
  await local.api.restore();
  assert.deepEqual(local.counts(), { requests: 0, renders: 1, writes: 0 });
  const publicView = controller({ search: '?share=sr-11111111-1111-4111-8111-111111111111', fetchImpl: async () => ({ ok: true, json: async () => ({ ok: true, result: { ...item, target: 'woek-ai' } }) }) });
  await publicView.api.restore();
  assert.deepEqual(publicView.counts(), { requests: 1, renders: 1, writes: 0 });
  const missing = controller({ search: '?antwort=missing' });
  await missing.api.restore(); assert.equal(missing.warning.hidden, false);
});
test('URL sanitation and share allowlist', () => {
  const context = { module: { exports: {} }, URL };
  vm.runInNewContext(resultSource, context);
  const { safeSources, sharePayload } = context.module.exports;
  assert.equal(safeSources([{ url: 'javascript:alert(1)' }, { url: 'data:text/html,test' }, {}, null, { url: '/begriffe/wirkung/' }]).length, 1);
  assert.deepEqual(Object.keys(sharePayload({ question: 'Test', answer: 'Test', sources: [], profile: 'secret' })).sort(), ['answer', 'question', 'route', 'sections', 'sources', 'target', 'title']);
});
