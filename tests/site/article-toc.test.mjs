import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../assets/js/main.js', import.meta.url), 'utf8');
const start = source.indexOf('function slugifyHeading(');
const end = source.indexOf('\nenhanceLongArticleToc();', start);
assert.ok(start >= 0 && end > start, 'The production article-navigation initializer must be present.');
const initialize = source.slice(start, end) + '\nenhanceLongArticleToc();';

// Small DOM adapter for the standard class, tag and attribute selectors used here.
// The same production initializer is also audited against real journal DOMs in the browser.
function element(tagName, attributes = {}, textContent = '') {
  return {
    tagName, attributes, textContent, innerHTML: '',
    get id() { return this.attributes.id || ''; },
    set id(value) { this.attributes.id = value; },
    get className() { return this.attributes.class || ''; },
    set className(value) { this.attributes.class = value; },
    setAttribute(name, value) { this.attributes[name] = value; },
  };
}
function matches(node, selector) {
  return selector.split(',').some(part => {
    const match = part.trim().match(/^(?:(\w+)|\.([\w-]+))?(?:\[([\w-]+)(?:=['"]([^'"]*)['"])?\])?$/);
    assert.ok(match, `Unsupported DOM selector in the test adapter: ${part}`);
    const [, tag, className, attribute, value] = match;
    return (!tag || tag === node.tagName)
      && (!className || node.className.split(/\s+/).includes(className))
      && (!attribute || Object.hasOwn(node.attributes, attribute) && (value === undefined || node.attributes[attribute] === value));
  });
}
function article({ navigation, count = 9, minutes = 11, body = true } = {}) {
  const inserted = [];
  const headings = Array.from({ length: count }, (_, i) => element('h2', i === 0 ? { id: 'existing-anchor' } : {}, i < 3 ? 'Eine Frage' : `Abschnitt ${i}`));
  const articleBody = element('div', { class: 'article-body' });
  articleBody.querySelectorAll = selector => headings.filter(heading => matches(heading, selector));
  articleBody.before = node => inserted.push(node);
  const nodes = [element('p', { class: 'hero-kicker' }, `${minutes} Min.`), element('div', { id: 'eine-frage' }), ...(body ? [articleBody, ...headings] : []), ...(navigation ? [navigation] : [])];
  const document = {
    querySelector: selector => [...nodes, ...inserted].find(node => matches(node, selector)) || null,
    querySelectorAll: selector => [...nodes, ...inserted].filter(node => matches(node, selector)),
    createElement: tag => element(tag),
  };
  const run = () => vm.runInNewContext(initialize, { document });
  return { document, headings, inserted, run };
}

for (const [label, navigation] of [
  ['collapsible In diesem Beitrag without aria-label', element('details', { class: 'toc-card no-print' }, 'In diesem Beitrag')],
  ['a differently named contents card', element('details', { class: 'toc-card', 'aria-label': 'Auf dieser Seite' })],
  ['a static contents navigation', element('nav', { class: 'article-toc', 'aria-label': 'Inhaltsverzeichnis' })],
  ['an existing debate navigation', element('nav', { 'data-debate-toc': '' })],
]) {
  test(`${label} prevents a second contents navigation`, () => {
    const h = article({ navigation });
    h.run(); h.run();
    assert.equal(h.inserted.length, 0);
    assert.equal(h.headings[0].id, 'existing-anchor');
    assert.equal(navigation.attributes.open, undefined, 'Keep the existing disclosure state.');
  });
}

test('a long article without navigation still gets one usable contents list, even after repeated initialization', () => {
  const h = article();
  h.run(); h.run();
  assert.equal(h.inserted.length, 1);
  assert.equal(h.inserted[0].attributes['aria-label'], 'Inhaltsverzeichnis');
  assert.equal(new Set(h.headings.map(heading => heading.id)).size, h.headings.length);
  assert.equal(h.headings[0].id, 'existing-anchor');
  assert.equal(h.headings[1].id, 'eine-frage-2');
  assert.equal(h.headings[2].id, 'eine-frage-3');
  for (const heading of h.headings) assert.ok(h.inserted[0].innerHTML.includes(`href="#${heading.id}"`));
});

test('ordinary disclosure content does not suppress a needed contents navigation', () => {
  const h = article({ navigation: element('details', { class: 'article-example' }, 'Ein Beispiel') });
  h.run();
  assert.equal(h.inserted.length, 1);
});

test('short articles and pages without an article body do not gain unnecessary navigation', () => {
  for (const options of [{ count: 3, minutes: 4 }, { body: false }]) {
    const h = article(options); h.run();
    assert.equal(h.inserted.length, 0);
  }
});

test('reading time can still trigger a contents list with fewer headings', () => {
  const h = article({ count: 4, minutes: 25 }); h.run();
  assert.equal(h.inserted.length, 1);
});
