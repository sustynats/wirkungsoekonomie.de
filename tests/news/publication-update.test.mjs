import test from "node:test";
import assert from "node:assert/strict";
import { publishedContentRevision, caseContentUpdatedAt, storyUpdateNotice } from "../../scripts/news/publication-update.mjs";
import { buildCaseFiles } from "../../scripts/news/case-files.mjs";
import { renderUpdateBanner, storyCard } from "../../scripts/news/build.mjs";

const first = "2026-09-06T12:00:00.000Z";
const later = "2026-09-07T13:43:00.000Z";
const entry = (more = {}) => ({
  story_id: "one", slug: "erste-meldung", title: "Nordstern GmbH beantragt Insolvenzverfahren",
  published: true, listed: true, published_at: first, first_seen: first, last_updated: first,
  current_version: 1, publication_history: [{ version: 1, published_at: first }], versions: [],
  topic: ["Wirtschaft"], source_summary: "Die Nordstern GmbH hat ein Insolvenzverfahren beantragt.",
  sources: [{ publisher: "Testquelle", url: "https://example.org/one", published_at: first }], claims: [],
  analysis: { summary: "Ein Insolvenzverfahren wurde beantragt.", why_relevant: "Arbeitsplätze sind betroffen.", importance: "hoch", status: "laufende Entwicklung", analysis_type: "ex_ante",
    human: { relevance: "hoch", rationale: "Arbeitsplätze" }, planet: { relevance: "offen", rationale: "offen" }, democracy: { relevance: "mittel", rationale: "Verfahren" } },
  ...more,
});
const revised = (more = {}) => entry({ current_version: 2, last_updated: later,
  publication_history: [{ version: 1, published_at: first }, { version: 2, published_at: later }], ...more });

test("first publications and technical timestamps do not create update banners", () => {
  for (const more of [{}, { last_updated: later, updated_at: later, pending_update: { at: later }, image_generated_at: later }, { current_version: 4 }]) {
    const story = entry(more), before = structuredClone(story);
    assert.equal(storyUpdateNotice(story), null);
    assert.equal(renderUpdateBanner(story), "");
    assert.deepEqual(story, before);
  }
  assert.match(storyCard(entry(), 0), /data-news-new-badge/);
});

test("a published revision gets a dated accessible banner, not another New badge", () => {
  const story = revised({ last_updated: "2026-09-08T18:00:00Z" });
  const html = storyCard(story, 0);
  assert.equal(publishedContentRevision(story).at, later);
  assert.match(html, /Meldung aktualisiert/);
  assert.match(html, /07\.09\.2026, 15:43 Uhr/);
  assert.match(html, /<time datetime="2026-09-07T13:43:00.000Z">/);
  assert.match(html, /href="\.\/erste-meldung\/#versionsverlauf"/);
  assert.match(html, /Aktualisierter Stand – keine doppelte Meldung/);
  assert.doesNotMatch(html, /data-news-new-badge|Akte aktualisiert · v/);
  assert.ok(html.indexOf("data-news-update-banner") < html.indexOf("news-card__topline"));
  assert.match(renderUpdateBanner(story, { detail: true }), /href="#versionsverlauf"/);
});

test("legacy public snapshots work without guessing from version number or fetch time", () => {
  const story = revised({ publication_history: [], versions: [{ version: 1, analyzed_at: first }, { version: 2, analyzed_at: later }] });
  assert.equal(storyUpdateNotice(story).at, later);
  for (const more of [{ published: false }, { listed: false }, { published_at: "unknown" }, { versions: [{ version: 3, analyzed_at: later }] }, { versions: [{ version: 2, analyzed_at: "invalid" }] }]) {
    assert.equal(storyUpdateNotice({ ...story, ...more }), null);
  }
});

test("a new version-one development updates an existing case using public content receipts", () => {
  const members = [entry(), entry({ story_id: "two", slug: "zweite-meldung", title: "Insolvenzverfahren: Gericht bestellt Verwalter für Nordstern GmbH", published_at: "2026-09-07T10:00:00Z", publication_history: [], last_updated: "2026-09-07T10:00:00Z" }),
    entry({ story_id: "three", slug: "dritte-meldung", title: "Nordstern GmbH: Gläubiger beraten im Insolvenzverfahren", published_at: later, publication_history: [], last_updated: later })];
  const before = structuredClone(members);
  const grouping = buildCaseFiles(members);
  assert.equal(grouping.cases.length, 1);
  const current = grouping.visibleStories[0], caseFile = grouping.cases[0];
  assert.equal(current.current_version, 1);
  assert.equal(caseFile.content_updated_at, later);
  assert.match(storyCard(current, 0), /Lageakte fortgeschrieben/);
  assert.doesNotMatch(storyCard(current, 0), /data-news-new-badge/);
  assert.match(renderUpdateBanner(current, { detail: true }), /href="#lageakte"/);
  assert.match(renderUpdateBanner(members[0], { detail: true, caseFile }), /href="\.\.\/dritte-meldung\/#lageakte"/);
  assert.equal(caseContentUpdatedAt(members.map(item => ({ ...item, last_updated: "2026-09-08T23:00:00Z" }))), later);
  assert.deepEqual(members, before);
});

test("regrouping, duplicate membership, held work and simultaneous first publications are not new content", () => {
  assert.equal(caseContentUpdatedAt([entry(), entry()]), null);
  assert.equal(caseContentUpdatedAt([entry(), entry({ story_id: "two", last_updated: later })]), null);
  assert.equal(caseContentUpdatedAt([entry(), revised({ story_id: "two", published: false })]), null);
  assert.equal(storyUpdateNotice(entry(), { content_updated_at: later, representative_slug: "../wrong" }), null);
});

test("Berlin winter time is explicit and malformed dates never reach the renderer", () => {
  const html = renderUpdateBanner(revised({ publication_history: [{ version: 2, published_at: "2026-12-01T13:15:00Z" }] }));
  assert.match(html, /01\.12\.2026, 14:15 Uhr/);
  assert.equal(renderUpdateBanner(revised({ publication_history: [{ version: 2, published_at: '<script>alert(1)</script>' }] })), "");
});
