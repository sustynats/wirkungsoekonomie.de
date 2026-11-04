import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {dom, constructors} from './helpers/erleben-dom.mjs';

const html = fs.readFileSync('erleben/index.html', 'utf8');
const source = fs.readFileSync('assets/js/main.js', 'utf8');
const layer = source.slice(source.indexOf('const MethodToolFilterLayer ='), source.indexOf('const CopyAnswerLayer ='));
function fixture() {
  const document = dom(html + '<article data-method-card data-tool-id="outside" data-search="outside"></article>');
  const context = vm.createContext({document, ...constructors});
  vm.runInContext(layer + '\nMethodToolFilterLayer.init();', context);
  const find = s => document.querySelector(s);
  const change = (s, value) => { find(s).value = value; find(s).dispatch('input'); };
  const visible = () => document.querySelector('[data-tool-directory]').querySelectorAll('[data-method-card]').filter(c => !c.hidden);
  return {document, context, find, change, visible};
}
test('all registered tools are visible initially and search becomes available only after initialization', () => {
  const before = dom(html); assert.equal(before.querySelector('[data-tool-filter]').hidden, true);
  assert.ok(before.querySelectorAll('[data-method-card]').every(c => !c.hidden));
  const f = fixture(); assert.equal(f.visible().length, 47); assert.equal(f.find('[data-tool-filter]').hidden, false);
  assert.equal(f.find('[data-tool-filter-count]').textContent, '47 von 47 Einträgen');
});
test('topic, type and status filters combine and keep the existing search index local', () => {
  const f = fixture();
  f.change('[data-tool-filter-cluster]', 'products'); f.change('[data-tool-filter-type]', 'calculator'); f.change('[data-tool-filter-status]', 'demo');
  assert.deepEqual(f.visible().map(c => c.dataset.toolId).sort(), ['price-truth-mini','product-impact-calculator']);
  assert.equal(f.find('[data-tool-filter-count]').textContent, '2 von 47 Einträgen');
  assert.equal(f.find('[data-tool-id="outside"]').hidden, false);
});
test('search matches title, question and metadata independently of case, accents and word order', () => {
  const f = fixture(); f.change('[data-tool-filter-search]', 'RÜCKVERTEILUNG');
  assert.deepEqual(f.visible().map(c => c.dataset.toolId), ['wirkungsfonds-method']);
  f.change('[data-tool-filter-search]', 'steuer produkt');
  assert.ok(f.visible().some(c => c.dataset.toolId === 'product-impact-simulator'));
  f.change('[data-tool-filter-search]', 'demokratie');
  assert.ok(f.visible().some(c => c.dataset.toolId === 'platform-impact-simulator'));
});
test('no results is announced and reset restores everything and returns focus to search', () => {
  const f = fixture(); f.change('[data-tool-filter-status]', 'method'); f.change('[data-tool-filter-type]', 'calculator');
  assert.equal(f.visible().length, 0); assert.equal(f.find('[data-tool-filter-empty]').hidden, false);
  assert.equal(f.find('[data-tool-filter-count]').textContent, '0 von 47 Einträgen');
  f.find('[data-tool-filter-reset]').dispatch('click');
  assert.equal(f.visible().length, 47); assert.equal(f.find('[data-tool-filter-empty]').hidden, true);
  assert.equal(f.document.activeElement, f.find('[data-tool-filter-search]'));
});
test('submit stays on the page, search is text only and duplicate initialization does not add listeners', () => {
  const f = fixture(); assert.equal(f.find('[data-tool-filter]').dispatch('submit').defaultPrevented, true);
  f.change('[data-tool-filter-search]', '<img src=x onerror=alert(1)>'); assert.equal(f.visible().length, 0);
  const input = f.find('[data-tool-filter-search]'); const n = input.listeners.input.length;
  vm.runInContext('MethodToolFilterLayer.init();', f.context); assert.equal(input.listeners.input.length, n);
});
test('existing method filter panels outside the new directory retain their behavior', () => {
  const document = dom('<form data-tool-filter><input data-tool-filter-search><select data-tool-filter-cluster></select></form><article data-method-card data-search="Klima" data-cluster="planet"></article><article data-method-card data-search="Medien" data-cluster="media"></article>');
  const context = vm.createContext({document, ...constructors}); vm.runInContext(layer + '\nMethodToolFilterLayer.init();', context);
  const input = document.querySelector('[data-tool-filter-search]'); input.value = 'klima'; input.dispatch('input');
  assert.deepEqual(document.querySelectorAll('[data-method-card]').map(c => c.hidden), [false, true]);
});
