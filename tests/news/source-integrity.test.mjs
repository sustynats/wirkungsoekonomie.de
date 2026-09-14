import test from "node:test";
import assert from "node:assert/strict";
import { auditSourceIntegrity, reconcileKnownSourceAliases, reconcileSourceIdentity, sourceIntegrityForStory, sourceSupportFingerprint } from "../../scripts/news/source-integrity.mjs";

const registry = { sources: [
  { source_id: "swr", publisher_id: "swr", name: "SWR", url: "https://www.swr.de/", feed_url: "https://www.swr.de/feed.xml", primary_source: false, source_type: "media_rss", publisher_kind: "public_broadcasting", research_lane: "media", geography: ["DE"] },
  { source_id: "tagesschau", publisher_id: "tagesschau", name: "tagesschau / ARD", url: "https://www.tagesschau.de/", feed_url: "https://www.tagesschau.de/feed.xml", primary_source: false, source_type: "media_rss", publisher_kind: "public_broadcasting", research_lane: "media", geography: ["DE"] },
] };
const source = (title, url, extra = {}) => ({ source_id: "swr", publisher_id: "swr", publisher: "SWR", title, summary: title, url, published_at: "2026-09-05T08:00:00Z", primary_source: false, ...extra });
const story = (title, sources) => ({ story_id: `story-${title}`, title, source_summary: title, sources, published: true, listed: true, last_updated: "2026-09-05T09:00:00Z" });

test("historische HTTP-Dublette wird nur mit identischem bekannten HTTPS-Beleg bereinigt",()=>{
  const secure=source("Gleicher Artikel", "https://www.swr.de/artikel.html"), old={...secure,url:"http://www.swr.de/artikel.html"};
  const originals=structuredClone([secure,old]);
  assert.deepEqual(reconcileKnownSourceAliases([old,secure]),[secure]);
  assert.deepEqual([secure,old],originals);
  assert.deepEqual(reconcileKnownSourceAliases([old]),[old]);
  for(const change of [{summary:'Widerspruch'},{source_id:'anderer'},{primary_source:true},{published_at:'2026-09-04T08:00:00Z'},{article_excerpt:'Ein zusätzlicher Gegenbeleg.'}]) assert.equal(reconcileKnownSourceAliases([secure,{...old,...change}]).length,2);
});

test("eine registrierte Feed-Weiterleitung wird dem Zielpublisher zugeordnet", () => {
  const item = source("Wahl in Sachsen-Anhalt", "https://www.tagesschau.de/inland/wahl-sachsen-anhalt.html");
  const normalized = reconcileSourceIdentity(item, registry.sources[0], registry);
  assert.equal(normalized.source_id, "tagesschau");
  assert.equal(normalized.publisher_id, "tagesschau");
  assert.equal(normalized.collection_source_id, "swr");
});

test("Berlin-Wahlquelle hält eine Sachsen-Anhalt-Story vor Veröffentlichung", () => {
  const item = source("BerlinTrend vor der Berlin-Wahl", "https://www.swr.de/berlin-wahl.html");
  const result = sourceIntegrityForStory(story("Vor der Wahl in Sachsen-Anhalt", [item]), registry, [], "2026-09-05T09:00:00Z");
  assert.equal(result.status, "open");
  assert.equal(result.publication_status, "hold");
  assert.ok(result.issues.some((issue) => issue.code === "SOURCE_STORY_SUBJECT_CONFLICT"));
});

test("passende Story-Quelle besteht den Integritätscheck", () => {
  const item = source("Stimmung vor der Wahl in Sachsen-Anhalt", "https://www.swr.de/wahl-sachsen-anhalt.html");
  const result = sourceIntegrityForStory(story("Vor der Wahl in Sachsen-Anhalt", [item]), registry, [], "2026-09-05T09:00:00Z");
  assert.equal(result.status, "verified", JSON.stringify(result));
});

test("Bestandsaudit listet nur offene Storys als Findings", () => {
  const good = story("Vor der Wahl in Sachsen-Anhalt", [source("Stimmung vor der Wahl in Sachsen-Anhalt", "https://www.swr.de/wahl-sachsen-anhalt.html")]);
  const bad = story("Vor der Wahl in Sachsen-Anhalt", [source("BerlinTrend vor der Berlin-Wahl", "https://www.swr.de/berlin-wahl.html")]);
  const report = auditSourceIntegrity([good, bad], registry, "2026-09-05T09:00:00Z");
  assert.equal(report.stories_checked, 2);
  assert.equal(report.held, 1);
  assert.equal(report.findings[0].story_id, bad.story_id);
});

const bind = (item, record) => {
  record.editorial_evidence = { source_bindings: [{ source_id: item.source_id, url: item.url,
    review_method: "source_text_comparison", reviewed_at: "2026-09-05T09:00:00Z",
    rationale: "Der Quellenauszug und die übersetzte Zusammenfassung beschreiben denselben geprüften Gegenstand und bewahren die Attribution.",
    fingerprint: sourceSupportFingerprint(item, record) }] };
};

test("geprüfte Übersetzung besteht trotz geringer Wortüberschneidung", () => {
  const item = source("Cargo vessel struck near Qeshm Island", "https://www.swr.de/schiff.html");
  const record = story("Frachter vor Insel getroffen: Staatsmedien berichten", [item]);
  assert.ok(sourceIntegrityForStory(record, registry).issues.some(x => x.code === 'SOURCE_SEMANTIC_FIT_OPEN'));
  bind(item, record);
  assert.equal(sourceIntegrityForStory(record, registry).status, 'verified');
  for (const change of [r => {r.title += ' anders';}, r => {r.source_summary += ' Zusatz';}, r => {r.analysis = {summary:'Neu'};}, r => {r.sources[0].summary += ' geändert';}, r => {r.sources[0].article_excerpt = 'Neue Belege';}, r => {r.sources[0].url += '?other';}, r => {r.sources[0].published_at = '2026-09-04T08:00:00Z';}]) {
    const changed = structuredClone(record); change(changed);
    assert.ok(sourceIntegrityForStory(changed, registry).issues.some(x => x.code === 'SOURCE_SEMANTIC_FIT_OPEN'));
  }
});

test("Quellenzuordnung setzt Register-, Datum- und Gegenstandsprüfung nicht außer Kraft", () => {
  const cases = [
    [source('BerlinTrend vor der Berlin-Wahl', 'https://www.swr.de/wahl.html'), 'Vor der Wahl in Sachsen-Anhalt', 'SOURCE_STORY_SUBJECT_CONFLICT'],
    [source('Quelle', 'https://www.fremd.de/quelle'), 'Eigener Titel', 'SOURCE_PUBLISHER_URL_MISMATCH'],
    [source('Quelle', 'https://www.swr.de/quelle', {published_at:null}), 'Eigener Titel', 'SOURCE_PUBLICATION_DATE_INVALID'],
    [source('Quelle', 'https://www.swr.de/quelle', {source_id:'unknown'}), 'Eigener Titel', 'SOURCE_REGISTRY_ID_UNKNOWN'],
  ];
  for(const [item,title,code] of cases) {const record=story(title,[item]);bind(item,record);assert.ok(sourceIntegrityForStory(record,registry).issues.some(x=>x.code===code));}
});

test("fehlende Begründung oder ungeprüfte Zuordnung genügt nicht", () => {
  const item=source('Cargo vessel struck near Qeshm Island','https://www.swr.de/schiff.html');
  for(const change of [{rationale:''},{review_method:'automatic_similarity'},{reviewed_at:null},{fingerprint:'invalid'}]) {
    const record=story('Frachter vor Insel getroffen',[item]);bind(item,record);
    Object.assign(record.editorial_evidence.source_bindings[0],change);
    assert.ok(sourceIntegrityForStory(record,registry).issues.some(x=>x.code==='SOURCE_SEMANTIC_FIT_OPEN'));
  }
});
