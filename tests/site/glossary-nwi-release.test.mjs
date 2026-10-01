import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const term = (path, id) => JSON.parse(read(path)).terms.find((value) => value.id === id || value.termId === id);

test('Wirkungscontrolling names the WÖk index explicitly in its canonical source and public projection', () => {
  for (const path of ['assets/data/term-registry.json', 'public/data/glossary.terms.json']) {
    const value = term(path, 'wirkungscontrolling');
    assert.ok(value, path);
    for (const field of ['shortDefinition', 'short_definition', 'hoverDefinition']) {
      assert.match(value[field], /WÖk-Netto-Wirkungsindex/, `${path}: ${field}`);
      assert.doesNotMatch(value[field], /\bNWI\b/, `${path}: ${field}`);
    }
    // Stable internal identifiers are not renamed for a terminology correction.
    assert.ok(value.relatedTerms.includes('nwi'));
  }
});

test('glossary overview does not reintroduce the release-blocking legacy index label', () => {
  const page = read('begriffe/index.html');
  assert.equal(/Wirkungscontrolling ist das Controlling-System[^<]*\bNWI\b/.test(page), false);
  assert.equal(/Wirkungscontrolling ist das Controlling-System[^<]*WÖk-Netto-Wirkungsindex/.test(page), true);
});

test('official NWI and the WÖk index retain distinct public names and stable routes', () => {
  assert.equal(term('public/data/glossary.terms.json', 'nationaler-wohlfahrtsindex').canonicalLabel, 'Nationaler Wohlfahrtsindex (NWI)');
  const woek = term('public/data/glossary.terms.json', 'nwi');
  assert.equal(woek.canonicalLabel, 'WÖk-Netto-Wirkungsindex');
  assert.equal(woek.pageUrl, '/begriffe/nwi/');
});
