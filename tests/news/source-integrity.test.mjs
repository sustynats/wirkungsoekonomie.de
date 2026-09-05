import test from "node:test";
import assert from "node:assert/strict";
import { auditSourceIntegrity, reconcileSourceIdentity, sourceIntegrityForStory } from "../../scripts/news/source-integrity.mjs";

const registry = { sources: [
  { source_id: "swr", publisher_id: "swr", name: "SWR", url: "https://www.swr.de/", feed_url: "https://www.swr.de/feed.xml", primary_source: false, source_type: "media_rss", publisher_kind: "public_broadcasting", research_lane: "media", geography: ["DE"] },
  { source_id: "tagesschau", publisher_id: "tagesschau", name: "tagesschau / ARD", url: "https://www.tagesschau.de/", feed_url: "https://www.tagesschau.de/feed.xml", primary_source: false, source_type: "media_rss", publisher_kind: "public_broadcasting", research_lane: "media", geography: ["DE"] },
] };
const source = (title, url, extra = {}) => ({ source_id: "swr", publisher_id: "swr", publisher: "SWR", title, summary: title, url, published_at: "2026-09-05T08:00:00Z", primary_source: false, ...extra });
const story = (title, sources) => ({ story_id: `story-${title}`, title, source_summary: title, sources, published: true, listed: true, last_updated: "2026-09-05T09:00:00Z" });

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
