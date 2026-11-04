import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {buildErlebenPortal, validateRegistry, topSections} from '../../scripts/site/build-erleben-portal.mjs';
import {retainedErlebenDirectory, buildPublicAreaDirectories} from '../../scripts/quality/build-public-area-directories.mjs';
import {dom, constructors} from './helpers/erleben-dom.mjs';

const root = process.cwd();
const read = file => fs.readFileSync(file, 'utf8');
const registry = JSON.parse(read('assets/data/tool-registry.json'));
const html = read('erleben/index.html');
const legacy = read('erleben.html');
const document = dom(html);
const routeFile = route => '.' + route.split('#')[0] + (route.split('#')[0].endsWith('/') ? 'index.html' : '');
function subtree(source, selector) {
  const start = [...source.matchAll(/<(article|section)\b[^>]*>/g)].find(m => m[0].includes(selector));
  assert.ok(start, selector);
  let depth = 0;
  const tags = new RegExp(`<\\/?${start[1]}\\b[^>]*>`, 'g'); tags.lastIndex = start.index;
  for (const tag of source.matchAll(tags)) {
    depth += tag[0].startsWith('</') ? -1 : 1;
    if (!depth) return source.slice(start.index + start[0].length, tag.index);
  }
  throw new Error('Unclosed protected element ' + selector);
}
function fixture() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-erleben-'));
  const files = new Set(['erleben.html','erleben/index.html','index.html','assets/data/tool-registry.json']);
  for (const tool of registry) {
    files.add(routeFile(tool.route).slice(2));
    if (tool.catalog.sourceRuntime && tool.catalog.sourceRuntime !== 'inline') files.add(tool.catalog.sourceRuntime);
  }
  for (const file of files) {
    const target = path.join(temp, file); fs.mkdirSync(path.dirname(target), {recursive:true}); fs.copyFileSync(path.join(root, file), target);
  }
  return temp;
}

test('canonical URL, requested SEO and exactly one H1 are retained', () => {
  assert.equal(document.querySelectorAll('h1').length, 1);
  assert.equal(document.querySelector('h1').textContent, 'Die Wirkungsökonomie erleben');
  assert.match(html, /<title>Wirkungsökonomie erleben \| Simulatoren &amp; Rechner<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/wirkungsoekonomie.de\/erleben\/"/);
  assert.doesNotMatch(html, /name="robots" content="noindex/);
  assert.match(html, /Erlebe die Wirkungsökonomie interaktiv: Entdecke Simulatoren und Rechner für Produktwirkung, Wirkungssteuer, Unternehmen, Klima, Wohnen und Demokratie\./);
  assert.ok(html.indexOf('portal-quick-grid') < html.indexOf('tool-directory-title'));
  assert.ok(html.indexOf('tool-directory-title') < html.indexOf('id="ergebnisse-verstehen"'));
});
test('six direct quick starts cover the requested themes and link to actual interactive pages', () => {
  const quick = registry.filter(t => t.catalog.quickStart);
  assert.equal(quick.length, 6);
  const links = document.querySelectorAll('a').filter(a => (a.attributes.class || '').split(' ').includes('portal-quick-card'));
  assert.deepEqual(links.map(a => a.attributes.href), quick.map(t => t.route));
  assert.ok(links.every(a => !a.attributes.href.includes('#')));
  assert.ok(links.every(a => fs.existsSync(routeFile(a.attributes.href))));
  assert.match(read('index.html'), /href="\/erleben\/" data-erleben-home-cta>Wirkungsökonomie selbst ausprobieren/);
  assert.ok(JSON.parse(read('assets/data/navigation.json')).footerGroups.find(g => g.title === 'Praxis & Tools').items.some(i => i.href === 'erleben/' && i.label === 'Erleben & Simulieren'));
});
test('all catalog entries are unique, complete and distinguish descriptions from active demos', () => {
  validateRegistry(registry, root);
  assert.equal(document.querySelectorAll('[data-method-card]').length, registry.length);
  for (const t of registry) {
    const card = document.querySelector(`[data-tool-id="${t.id}"]`); assert.ok(card);
    assert.ok(card.textContent.includes(t.catalog.question)); assert.ok(card.querySelector('a'));
    if (t.catalog.status === 'method') {
      assert.match(card.textContent, /ohne Rechner/); assert.equal(t.hasResults, false);
    }
    if (t.route.startsWith('/erleben/#')) assert.equal(document.querySelectorAll('#'+t.route.split('#')[1]).length, 1);
  }
  const ids = document.querySelectorAll('[id]').map(n => n.attributes.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ['pension-calculator-method','enterprise-check-method','future-subject-method']) assert.equal(registry.find(t => t.id === id).catalog.status, 'method');
});
test('every existing Erleben child URL is discoverable in the single static catalog', () => {
  const routes = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (file.endsWith('.html') && file !== path.join('erleben','index.html')) routes.push({url:'/'+file.replaceAll(path.sep,'/').replace(/index\.html$/, '')});
    }
  }
  walk('erleben');
  assert.ok(routes.length >= 25);
  const result = retainedErlebenDirectory(html, {hubRoute:'/erleben/', routes}); assert.equal(result.cards, 47);
  assert.throws(() => retainedErlebenDirectory(html, {hubRoute:'/erleben/',routes:[...routes,{url:'/erleben/new-uncatalogued/'}]}), /missing public routes/);
});
test('packaging retains the complete catalog once, preserves children, and the unchanged checker can read its routes', () => {
  const temp = fixture();
  try {
    fs.writeFileSync(path.join(temp,'suche.html'), '<html><body><main><h1>Suche</h1></main></body></html>');
    const children = registry.filter(t => t.route.startsWith('/erleben/') && !t.route.includes('#')).map(t => ({url:t.route, area:'erleben', title:t.title}));
    const routes = [{url:'/',area:'start'},{url:'/suche.html',area:'start'},{url:'/erleben/',area:'erleben'},...children];
    fs.writeFileSync(path.join(temp,'assets/data/public-routes.json'),JSON.stringify({routes}));
    const before = read(path.join(temp,'erleben/index.html'));
    const child = read(path.join(temp,'erleben/produktwirkung.html'));
    const result = buildPublicAreaDirectories(temp); const group = result.areas.find(a => a.area === 'erleben');
    assert.equal(group.pages,1); assert.deepEqual(group.generatedPages,[]);
    assert.equal(read(path.join(temp,'erleben/index.html')),before);
    assert.equal(read(path.join(temp,'erleben/produktwirkung.html')),child);
    assert.equal((before.match(/data-public-area-directory="true"/g) || []).length, 1);
  } finally { fs.rmSync(temp,{recursive:true,force:true}); }
});
test('existing widget bodies and all original IDs survive the reordering byte for byte', () => {
  const selectors = ['data-compass','data-price-truth','data-radar','data-policy-check','data-tax-game','data-communication-check','data-mini-quiz','data-cycle',...['impact','product','media','capital'].map(k => `data-quiz-module="${k}"`)];
  for (const selector of selectors) assert.equal(subtree(html,selector),subtree(legacy,selector),selector);
  const original = dom(legacy);
  for (const id of original.querySelectorAll('[id]').map(n => n.attributes.id)) assert.ok(document.querySelector('#'+id),id);
  for (const quote of ['Der Score ist kein Wahrheitsurteil','Der Score ist keine Prognose','kein reales Audit']) assert.ok(html.includes(quote));
  assert.ok(html.includes('Nichtkompensation')); assert.ok(html.includes('Reverse Merit Order')); assert.ok(html.includes('SDG+'));
});
test('generator is repeatable and adds no duplicate homepage CTA or legacy redirect', () => {
  const temp = fixture();
  try {
    buildErlebenPortal(temp);
    const before = ['erleben/index.html','erleben.html','index.html'].map(f => read(path.join(temp,f)));
    buildErlebenPortal(temp);
    const after = ['erleben/index.html','erleben.html','index.html'].map(f => read(path.join(temp,f)));
    assert.deepEqual(after,before);
    assert.equal((after[2].match(/data-erleben-home-cta/g)||[]).length,1);
    assert.equal((after[1].match(/erleben-legacy-redirect:start/g)||[]).length,1);
  } finally { fs.rmSync(temp,{recursive:true,force:true}); }
});
test('legacy redirect retains query and fragments, canonical page does not redirect itself', () => {
  const script = legacy.match(/<!-- erleben-legacy-redirect:start --><script>([\s\S]*?)<\/script>/)[1];
  const called = [];
  const location = {pathname:'/erleben.html',search:'?scenario=apfel',hash:'#alltag',replace:url => called.push(url)};
  vm.runInNewContext(script,{window:{location}}); assert.deepEqual(called,['/erleben/?scenario=apfel#alltag']);
  called.length=0; location.pathname='/erleben/'; vm.runInNewContext(script,{window:{location}}); assert.deepEqual(called,[]);
  assert.match(legacy,/name="robots" content="noindex,follow"/);
  assert.doesNotMatch(html,/erleben-legacy-redirect:start/);
});
test('registry guards reject duplicate targets, missing source pages and misleading method status', () => {
  assert.throws(() => validateRegistry([...registry,registry[0]],root),/Duplicate/);
  const missing=structuredClone(registry);missing[0].route='/erleben/does-not-exist/';assert.throws(()=>validateRegistry(missing,root),/Missing tool page/);
  const wrong=structuredClone(registry);wrong.find(t=>t.catalog.status==='method').hasResults=true;assert.throws(()=>validateRegistry(wrong,root),/Method advertised/);
  assert.throws(()=>topSections('<section><section></section>'),/Unclosed/);
});
test('native filter controls, status announcements and mobile styles have accessible source contracts', () => {
  const form=document.querySelector('[data-tool-filter]');
  for (const field of form.querySelectorAll('input').concat(form.querySelectorAll('select'))) {
    assert.equal(document.querySelectorAll('label').filter(l=>l.attributes.for===field.attributes.id).length,1);
    assert.equal(field.attributes['aria-controls'],'tool-catalog-cards');
  }
  const count=document.querySelector('[data-tool-filter-count]');assert.equal(count.attributes.role,'status');assert.equal(count.attributes['aria-live'],'polite');
  assert.equal(form.querySelector('button').type,'button');
  const css=read('assets/css/erleben-portal.css');assert.match(css,/:focus-visible/);assert.match(css,/max-width: 600px/);assert.match(css,/max-width: 960px/);assert.match(css,/min-height: 44px/);assert.match(css,/\[hidden\][^{]*\{ display: none !important/);
});

test('unchanged Erleben runtime initializes the rearranged widgets and responds to actual input and clicks', () => {
  const doc=dom(html);const deferred=[];
  const context=vm.createContext({document:doc,window:{location:{search:'',hash:''},setTimeout:f=>deferred.push(f)},URLSearchParams,Intl,...constructors});
  vm.runInContext(read('assets/js/erleben.js'),context);
  const get=s=>doc.querySelector(s);
  assert.match(get('[data-compass-score]').textContent,/\/ 100/);
  const before=get('[data-compass-score]').textContent;get('#compass-price').value='0';get('#compass-price').dispatch('input');
  assert.notEqual(get('[data-compass-score]').textContent,before);
  const oldPrice=get('[data-truth-output]').innerHTML;get('[data-truth-select]').value='phone';get('[data-truth-select]').dispatch('change');assert.notEqual(get('[data-truth-output]').innerHTML,oldPrice);
  const oldRadar=get('[data-radar-note]').textContent;get('[data-radar-select]').value='Social Media';get('[data-radar-select]').dispatch('change');assert.notEqual(get('[data-radar-note]').textContent,oldRadar);
  assert.ok(get('[data-policy-output]').children.length>0);
  const oldPolicy=get('[data-policy-output]').innerHTML;const select=get('[data-policy-select]');select.value=select.children[1].value;select.dispatch('change');assert.notEqual(get('[data-policy-output]').innerHTML,oldPolicy);
  const oldStats=get('[data-game-stats]').innerHTML;get('[data-game-action="prevent"]').dispatch('click');assert.notEqual(get('[data-game-stats]').innerHTML,oldStats);
  const oldCommunication=get('[data-communication-output]').innerHTML;get('[data-communication-input]').value='Gemeinsam konkret lernen';get('[data-communication-input]').dispatch('input');assert.notEqual(get('[data-communication-output]').innerHTML,oldCommunication);
  const oldCycle=get('[data-cycle-output]').innerHTML;get('[data-cycle-index="1"]').dispatch('click');assert.notEqual(get('[data-cycle-output]').innerHTML,oldCycle);
  get('[data-quiz-option="1"]').dispatch('click');assert.ok(get('[data-quiz-feedback]').textContent.length>0);assert.equal(deferred.length,1);
  for(const quiz of doc.querySelectorAll('[data-quiz-module]')) {quiz.querySelector('[data-module-answer="0"]').dispatch('click');assert.ok(quiz.querySelector('[data-module-feedback]').textContent.length>0);}
});
