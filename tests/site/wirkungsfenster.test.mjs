import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const read = file => fs.readFileSync(file, 'utf8');
const json = file => JSON.parse(read(file));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const hash = value => sha(JSON.stringify(value));
const baseline = json('tests/site/fixtures/wirkungsfenster-baseline.json');
const source = json('content/glossary/imports/begriffsleitfaden-v1.8.json');
const terms = json('public/data/glossary.terms.json').terms;
const term = terms.find(x => x.termId === 'wirkungsfenster');
const ids = ['F13', 'I06', 'E10', 'H02', 'H06', 'H07'];
const short = 'Bereich der Anwendung einer Maßnahme, in dem sie unter benannten Bedingungen ausreichend zum Wirkungsziel beitragen kann, ohne festgelegte Wirkungsgrenzen zu verletzen.';
const long = 'Das Wirkungsfenster bezeichnet den kontext- und zeitabhängigen Bereich der Ausgestaltung, Intensität, Dauer und Kombination einer Maßnahme, in dem unter offengelegten Annahmen ein zuvor begründeter Zielbeitrag und positive Netto-Wirkung für Mensch, Planet und Demokratie erwartet werden können, ohne festgelegte Wirkungsgrenzen zu verletzen. Vor der Anwendung wird dieser Bereich als überprüfbare Hypothese beschrieben. Beobachtung, Evidenzprüfung und Rückkopplung dienen dazu, diese Annahme zu überprüfen und bei Bedarf die Anwendung zu verändern. Die Abgrenzung kann offen bleiben; nicht für jede Maßnahme lässt sich ein solcher Bereich begründen.';

test('one canonical term, exact source/registry/hover definitions, medical analogy not an alias', () => {
  assert.equal(source.terms.length, 1);
  assert.equal(terms.filter(x => x.canonicalLabel === 'Wirkungsfenster').length, 1);
  for (const item of [source.terms[0], term]) {
    assert.equal(item.shortDefinition, short);
    assert.equal(item.longDefinition, long);
    assert.doesNotMatch(JSON.stringify(item.aliases), /therapeut|Wirkungskorridor/i);
  }
  assert.equal(term.hoverDefinition, short);
  assert.ok(read('assets/js/glossaryTerms.js').includes(short));
  for (const extension of source.extensions) {
    const item = terms.find(t => t.termId === extension.termId);
    assert.ok(item.relatedTerms.includes('wirkungsfenster'), extension.termId);
    assert.ok(item.deepGlossarySections.some(section => section.body === extension.body));
  }
});

test('protected definitions remain unchanged', () => {
  for (const [id, expected] of Object.entries(baseline.definitions)) {
    const item = terms.find(t => t.termId === id);
    assert.equal(hash(Object.fromEntries(['shortDefinition', 'longDefinition'].map(k => [k, item[k]]))), expected, id);
  }
});

test('protected calculations, 621-ID register, source registry, transcript and previous PDFs are unchanged', () => {
  for (const [file, expected] of Object.entries(baseline.protectedFiles)) {
    assert.equal(sha(fs.readFileSync(file)), expected, file);
  }
  const podcasts = json('assets/data/podcast-index.json');
  let updates = 0;
  for (const episode of podcasts) {
    if (episode.id === 'wirkung-ist-nicht-absicht') {
      assert.equal(episode.editorialUpdates.length, 1);
      delete episode.editorialUpdates;
      updates++;
    }
  }
  assert.equal(updates, 1);
  assert.equal(hash(podcasts), baseline.podcastHash);
  assert.deepEqual((read('workflow.html').match(/<table\b[\s\S]*?<\/table>/g) || []).map(sha), baseline.workflowTables);
});

test('only six existing methods extended; no new canvases or mandatory fields', () => {
  const methods = json('content/methods/woems-methoden.json').methods;
  const canvases = json('content/methods/woems-canvas.json');
  assert.deepEqual(methods.map(m => m.id).sort(), Object.keys(baseline.methods).sort());
  assert.deepEqual(canvases.canvases.map(c => c.id).sort(), Object.keys(baseline.canvases).sort());
  assert.equal(hash(canvases.mindeststandard), baseline.minimum);
  for (const method of methods) {
    if (!ids.includes(method.id)) assert.equal(hash(method), baseline.methods[method.id], method.id);
    else {
      assert.match(JSON.stringify(method), /Wirkungsfenster/);
      assert.match(JSON.stringify(method), /offen, nicht null oder neutral/);
      assert.ok(method.schnittstellen.bautAuf.includes('A05'));
      assert.ok(method.schnittstellen.bautAuf.includes('C07'));
      assert.ok(method.schnittstellen.fuehrtZu.includes('F14'));
    }
  }
  for (const canvas of canvases.canvases) {
    const structure = {...canvas, felder: canvas.felder.map(({leitfrage, ...field}) => field)};
    assert.equal(hash(structure), baseline.canvases[canvas.id].structure, canvas.id);
    if (!ids.includes(canvas.methodId) || canvas.id !== `canvas-${canvas.methodId}`) {
      assert.equal(hash(canvas), baseline.canvases[canvas.id].hash, canvas.id);
    }
  }
});

test('new pages: canonical, exact definition, structured data and application anchor', () => {
  for (const route of ['begriffe/wirkungsfenster/', 'verstehen/wirkungsfenster/']) {
    const html = read(`${route}index.html`);
    assert.ok(html.includes(short));
    assert.ok(html.includes(long));
    assert.ok(html.includes(`rel="canonical" href="https://wirkungsoekonomie.de/${route}"`));
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const defined = schemas.flatMap(x => [x, x.about]).find(x => x?.['@type'] === 'DefinedTerm');
    assert.equal(defined.description, short);
    assert.ok(!html.includes('href="/begriffe/gegenfaktum/"'));
  }
  const explanation = read('verstehen/wirkungsfenster/index.html');
  assert.match(explanation, /id="anwendung"/);
  assert.match(explanation, /data-no-glossary><h2>Woher die medizinische Analogie/);
  assert.match(explanation, /FDA/);
  assert.match(explanation, /keine Nebenwirkungsfreiheit/);
  assert.match(explanation, /nicht null oder neutral/);
  assert.match(explanation, /Zielbeitrag, Schutzgrenzen, Evidenz und Entscheidung/);
  assert.match(explanation, /role="region"[^>]*tabindex="0"|tabindex="0"[^>]*role="region"/);
});

test('new explanation internal links and anchors resolve', () => {
  const html = read('verstehen/wirkungsfenster/index.html');
  for (const [, raw] of html.matchAll(/href="([^"?]+)"/g)) {
    const url = new URL(raw, 'https://wirkungsoekonomie.de/verstehen/wirkungsfenster/');
    if (url.hostname !== 'wirkungsoekonomie.de') continue;
    let file = decodeURIComponent(url.pathname).slice(1);
    if (file.endsWith('/') || !file) file += 'index.html';
    assert.ok(fs.existsSync(file), `${raw} -> ${file}`);
    if (url.hash && file.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(read(file).includes(`id="${id}"`) || read(file).includes(`name="${id}"`), `${raw}: missing anchor`);
    }
  }
});

test('current v1.8 is cumulative, v1.7 remains archived and analogies have source records', () => {
  const guide = read('source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.8.md');
  for (const text of [short, long, 'Ergänzung v1.7', 'Ergänzung v1.6', '§ 7 BHO', 'eNAP', 'IOOI', 'Wirkungsfenster']) assert.ok(guide.includes(text), text);
  const docs = json('content/documents/documents.json');
  const list = Array.isArray(docs) ? docs : docs.documents;
  assert.equal(list.find(d => d.id === 'woek-begriffsleitfaden-fuehrend').version, 'v1.8');
  assert.equal(list.find(d => d.id === 'woek-begriffsleitfaden-fuehrend-v1-7').version, 'v1.7');
  const readerEntry = json('assets/data/library-source-details.json').entries.find(entry => entry.detailSlug === 'leading-reference-bibliothek-woek-begriffsleitfaden-fuehrend-index-html');
  assert.match(readerEntry.title, /v1\.8/);
  assert.equal(readerEntry.status, 'führend');
  assert.equal(readerEntry.readerEdition.sourceVersion, 'v1.0');
  assert.equal(readerEntry.readerEdition.status, 'archiviert');
  const legacy = read('bibliothek/eintraege/leading-reference-bibliothek-woek-begriffsleitfaden-fuehrend-index-html/lesen/00-fuhrender-begriffsleitfaden-der/index.html');
  assert.match(legacy, /historische Lesefassung/);
  assert.match(legacy, /data-reader-status="archiviert"/);
  assert.match(legacy, /21\. Mai 2026/);
  for (const record of term.officialSources) {
    const route = record.split('|').at(-1);
    assert.ok(fs.existsSync(path.join(route.slice(1), 'index.html')), route);
  }
});

test('new routes and concept are discoverable in sitemap and search', () => {
  const search = json('assets/search/search-index.json');
  for (const route of ['/begriffe/wirkungsfenster/', '/verstehen/wirkungsfenster/']) {
    assert.ok(read('sitemap.xml').includes(`https://wirkungsoekonomie.de${route}`), route);
    assert.ok(search.some(entry => entry.url === route), route);
  }
  const apiTerm = json('api/v1/glossary.json').terms.find(entry => entry.id === 'wirkungsfenster');
  assert.equal(apiTerm.shortDefinition, short);
  assert.equal(apiTerm.definition, long);
  const concept = search.find(entry => entry.url === '/begriffe/wirkungsfenster/');
  assert.equal(concept.description, short);
  assert.match(JSON.stringify(concept), /therapeutische/);
  assert.match(read('verstehen/index.html'), /href="\/verstehen\/wirkungsfenster\/"/);
});
