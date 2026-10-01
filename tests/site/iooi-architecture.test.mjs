import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { impactArchitectureVisual } from "../../scripts/lib/impact-architecture-visual.mjs";
import {iooiPrecision, renderIooiPrecision, applyIooiPrecisionNotices} from '../../scripts/lib/iooi-precision.mjs';

const read = file => fs.readFileSync(file, "utf8");
const glossary = JSON.parse(read("public/data/glossary.terms.json")).terms;
const term = id => glossary.find(t => t.termId === id);
const pages = ["verstehen/iooi-und-wirkungsoekonomie/index.html", "modell.html", "so-wirkt-wirkungsoekonomie/index.html", "begriffe/iooi/index.html", "begriffe/wirkpfad/index.html"];
const compact = value => String(value).replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");

test("IOOI acronym has four terms; activity is optional and external taxonomy survives the merge", () => {
  assert.match(term("iooi").shortDefinition, /Input, Output, Outcome und Impact/);
  assert.ok(!term("iooi").aliases.includes("Wirkungskette"), "not every impact chain is IOOI");
  for (const id of ["iooi", "input", "aktivitaet", "output", "outcome", "impact"]) {
    assert.equal(term(id).status, "anschlussbegriff", id);
    assert.equal(term(id).category, "Anschlussbegriff", id);
    assert.deepEqual(term(id).categories, ["anschlussbegriff"], id);
    assert.match(term(id).type, /Results-Chain/);
  }
  assert.match(term("aktivitaet").usageNote, /nicht zum Akronym/);
  assert.match(term("iooi").longDefinition, /gehört aber nicht zum Akronym/);
});

test("IOOI terms are reachable through the public Anschlussbegriffe filter", () => {
  const cards = [...read("begriffe/index.html").matchAll(/<article[^>]*data-glossary-card[\s\S]*?<\/article>/g)].map(m => m[0]);
  for (const id of ["iooi", "input", "aktivitaet", "output", "outcome", "impact"]) {
    const card = cards.find(card => card.includes('href="' + id + '/"'));
    assert.ok(card, id);
    const tokens = card.match(/data-type="([^"]*)"/)[1].split(" ");
    assert.ok(tokens.includes("anschlussbegriff"), id);
    assert.ok(tokens.some(token => token.startsWith("results-chain")), id);
  }
});

test("current explanation does not reintroduce a longer temporal IOOI chain", () => {
  const sources = [...pages, "vergleich.html", "content/glossary/imports/iooi-wirkungsarchitektur.json", "content/glossary/imports/begriffsleitfaden-v1.5.json", "content/kompass/compass-answer-templates.json", "docs/woek-knowledge/TERMINOLOGY.md"];
  for (const file of sources) {
    const body = compact(read(file));
    for (const forbidden of [/WÖk erweitert IOOI/i, /IOOI erklärt den Wirkpfad/i, /Vor IOOI:\s*Wirkungspotenzial/i, /Danach:.*Transformationswirkung/i, /Impact\s*(?:→|->)\s*Transformationswirkung/i, /IOOI-Wirkpfad/i, /IOOI steht für Input, Aktivität/i]) {
      assert.doesNotMatch(body, forbidden, file);
    }
  }
});

test("potentials, mechanisms, evidence and normative assessment remain distinct", () => {
  for (const id of ["wirkpfad", "wirkungspotenzial", "wirkungsrisiko"]) assert.match(JSON.stringify(term(id)), /keine Stationen|keine Pfadstationen/, id);
  assert.match(term("wirkmechanismus").woekRelation, /keine zeitliche Station/);
  assert.match(term("wirkungsrisiko").shortDefinition, /Möglichkeit.*negative Zustandsveränderungen/);
  assert.match(term("transformationswirkung").shortDefinition, /eingetretene Zustandsveränderung/);
  assert.match(term("wirkungsrueckkopplung").shortDefinition, /Lernmechanismus/);
  assert.doesNotMatch(JSON.stringify(term("wirkungspotenzial")), /behandelt Wirkungspotenzial als Zwischenstufe|Auslöser -> Wirkungspotenzial/);
  assert.match(term("wirkungsbewertung").shortDefinition, /eingetretenen oder ausdrücklich modellierten Zustandsveränderung/);
  assert.match(term("wirkungsbewertung").longDefinition, /modellierte Wirkungsbewertung/);
  assert.match(term("wirkungsarchitektur").woekRelation, /Der Wirkpfad beschreibt, was in der Welt passieren kann oder passiert/);
});

test("transformation is an evidence-bound system lens and Impact may include structural change", () => {
  assert.match(term("impact").woekRelation, /systemische oder strukturelle Veränderungen/);
  assert.match(term("transformationswirkung").woekRelation, /keine automatische Stufe nach Impact/);
  assert.match(term("transformationswirkung").woekRelation, /Richtung gesondert/);
});

test("six modules are questions rather than six real chronological stations", () => {
  assert.match(compact(read(pages[2])), /sechs Prüf-Fragen, keine sechs Stationen/);
  assert.match(compact(read(pages[1])), /sechs Module sind Prüffragen, keine zwingende reale Chronologie/);
  assert.match(compact(read(pages[1])), /operativer Bewertungs- und Implementierungsworkflow, nicht der kausale Wirkpfad/);
});

test("all five required routes use accessible responsive layer visuals, not the legacy graphic", () => {
  for (const page of pages) {
    const html = read(page);
    assert.match(html, /data-impact-architecture/);
    assert.match(html, /woek_wirkpfad_iooi_architektur_mobile\.svg/);
    assert.doesNotMatch(html, /woek_wirkungskreislauf_iooi/);
  }
  assert.match(impactArchitectureVisual(), /alt="Schichtenmodell:/);
  assert.match(impactArchitectureVisual(), /#ebenen/);
  for (const suffix of ["", "_mobile"]) {
    const svg = read("assets/visuals/model/woek_wirkpfad_iooi_architektur" + suffix + ".svg");
    for (const pattern of [/<title id="title">/, /<desc id="desc">/, /EX ANTE/, /EVIDENZ/, /BEWERTUNG/, /SYSTEMLINSE/, /RÜCKKOPPLUNG/, /Nichtkompensation/, /Reverse Merit Order/]) assert.match(svg, pattern);
  }
});

test("bus example precedes terminology and metadata uses one consistent description", () => {
  const html = read(pages[0]);
  assert.ok(html.indexOf('id="buslinie"') < html.indexOf('id="ebenen"'));
  assert.ok(html.indexOf('id="ebenen"') < html.indexOf('id="iooi"'));
  assert.match(html, /Ein erfundenes Beispiel, kein Wirkungsnachweis/);
  const metas = [...html.matchAll(/<meta (?:name|property)="(?:description|search_description|og:description|twitter:description)" content="([^"]*)"/g)].map(m => m[1]);
  assert.equal(metas.length, 4);
  assert.equal(new Set(metas).size, 1);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.description, metas[0]);
  for (const host of ["one.oecd.org", "impactfrontiers.org", "www.phineo.org", "www.bertelsmann-stiftung.de"]) assert.ok(html.includes(host));
});

test("compass bus path does not turn checking and assessment into causal stations", () => {
  const data = JSON.parse(read("content/kompass/impact-paths.json"));
  const paths = Array.isArray(data) ? data : Object.values(data).find(Array.isArray);
  const path = paths.find(p => p.id === "iooi-und-wirkungsoekonomie");
  assert.match(path.title, /kein Kausalbeweis/);
  assert.doesNotMatch(path.steps.join(" → "), /Wirkungspotenzial|Wirkungsrisiko|Attribution|Bewertung|Nichtkompensation/);
});

test("updated glossary pages share canonical descriptions with DefinedTerm metadata", () => {
  for (const id of JSON.parse(read("content/glossary/imports/iooi-wirkpfad-clarification-2026-09-30.json")).terms.map(t => t.termId)) {
    const t = term(id), html = read("begriffe/" + t.slug + "/index.html");
    const schema = JSON.parse(html.match(new RegExp('<script type="application/ld[+]json">(.*?)</script>', "s"))[1]);
    assert.equal(schema["@type"], "DefinedTerm");
    assert.equal(schema.description, t.metaDescription);
    assert.equal(schema.name, t.canonicalLabel);
  }
});

test('IOOI is a part perspective and precision applies inside the chain, without a blanket superiority claim', () => {
  const html = compact(renderIooiPrecision());
  assert.match(html, /kein Gegenmodell/);
  assert.match(html, /innerhalb der (?:Ergebnis)?[Kk]ette/);
  for (const required of ['Gegenfaktum', 'doppelt zählen', 'Nichtkompensation', 'Reverse Merit Order', 'keine einheitliche Rechenvorschrift', 'kein empirischer Überlegenheitsnachweis']) assert.ok(html.includes(required), required);
  assert.match(term('iooi').woekRelation, /innerhalb der Ergebniskette/);
  assert.match(term('phineo-wirkungslogik').woekRelation, /auch innerhalb/);
  assert.doesNotMatch(JSON.stringify(term('phineo-wirkungslogik').deepGlossarySections), /beginnt früher|endet später|Zielerreichung beweist Wirksamkeit/);
});

test('earlier and beyond describe decision scope, not extra causal stations', () => {
  const html = compact(renderIooiPrecision());
  for (const required of ['Problem Review', 'Goal Review', 'Früher ansetzen', 'Innerhalb präzisieren', 'Weitergehen', 'keine zusätzliche', 'wirtschaftliche und gesellschaftliche Entscheidungen']) {
    assert.ok(html.includes(required) || (required === 'keine zusätzliche' && html.includes('nicht eine zusätzliche')), required);
  }
  for (const text of [term('iooi').woekRelation, compact(read(pages[0]))]) {
    assert.match(text, /Problem/);
    assert.match(text, /vor der Auswahl von Inputs/);
    assert.doesNotMatch(text, /Unterschied.*(?:kein früherer Start|nicht in einem früheren Start)/);
  }
});

test('societal scope is distinct from an IOOI chain without denying societal outcomes', () => {
  const html = compact(renderIooiPrecision());
  for (const required of ['IOOI kann gesellschaftliche Veränderungen', 'SDG+', 'nicht offizielle UN-Erweiterung', 'Demokratie', 'Medienqualität', 'Resonanzräume', 'keine Kausalität', 'kein Ersatz für empirische Kommunikationsforschung']) assert.ok(html.includes(required), required);
});

test('local publication outputs and intermediate originals are excluded from the website artifact', () => {
  const excluded = read('scripts/quality/build-public-artifact.mjs').match(/const excludedTopLevelDirs = new Set\(\[([\s\S]*?)\]\)/)?.[1];
  assert.ok(excluded);
  for (const directory of ['output', 'outputs', 'tmp']) assert.ok(excluded.includes('"'+directory+'"'), directory);
});

test('the shared calculation is explicitly fictional and retains accessible table semantics', () => {
  assert.match(iooiPrecision.example.notice, /keine Messdaten und kein Kausalitätsnachweis/);
  assert.deepEqual(iooiPrecision.example.rows.map(row=>row[1]), ['40 %', '55 %', '50 %', '5 Prozentpunkte']);
  const html=renderIooiPrecision();
  assert.match(html, /role="region"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /<caption>/);
  assert.match(html, /<th scope="row">/);
  assert.match(html, /explanation-table-scroll/);
  assert.match(read('assets/css/style.css'), /body \.explanation-table-scroll\.table-wrap \.data-table \{ min-width: 42rem !important/);
  assert.ok(read(pages[0]).includes('data-iooi-precision="2026-10-01"'));
});

test('dated book and dossier notices survive regeneration without changing historical paragraphs', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'woek-iooi-notice-'));
  const original='<main><h1>Historische Fassung</h1><p id="historisch">Originaltext mit zitierfähigem Anker.</p></main>';
  try {
    for (const file of ['buch.html','werkzeuge/impact-controlling/dossiers/wirkungscontrolling/index.html']) {
      const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,original);
    }
    assert.equal(applyIooiPrecisionNotices(root).length,2);
    const updated=fs.readFileSync(path.join(root,'buch.html'),'utf8');
    assert.match(updated,/1\. Oktober 2026/);
    assert.match(updated,/<p id="historisch">Originaltext mit zitierfähigem Anker\.<\/p>/);
    assert.equal(updated.replace(/<!-- iooi-publication-20261001:start -->[\s\S]*?<!-- iooi-publication-20261001:end -->/g,''),original);
    assert.deepEqual(applyIooiPrecisionNotices(root),[]);
    fs.writeFileSync(path.join(root,'buch.html'),original);
    applyIooiPrecisionNotices(root);
    assert.equal(fs.readFileSync(path.join(root,'buch.html'),'utf8'),updated);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});

test('book, dossiers and reference update expose the dated precision', () => {
  for(const file of ['buch.html','referenz/kapitel-104-wirkungsmessung-manipulation-und-wirkungssimulation/index.html','werkzeuge/impact-controlling/dossiers/wirkungscontrolling/index.html']) assert.match(read(file),/data-iooi-publication-note="2026-10-01"/,file);
  assert.match(read('referenz/aktualisierung/index.html'), /data-iooi-precision="2026-10-01"/);
});
