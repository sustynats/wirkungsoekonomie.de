import test from "node:test";
import assert from "node:assert/strict";
import { documentKey, fileSubject, subjectConflict, livingFileMatch, duplicateGroups, mergeLivingFiles, relatedStories } from "../../scripts/news/living-files.mjs";
import { clusterItems } from "../../scripts/news/lib.mjs";
import { renderRelatedStories } from "../../scripts/news/build.mjs";
import { runWirkungsticker, publishedRecord } from "../../scripts/news/run.mjs";

const now = "2026-09-04T06:00:00Z";
const source = (title, url = "https://example.org/a", more = {}) => ({ title, url, source_id: "test", published_at: now, ...more });
const story = (id, title, more = {}) => ({ story_id: id, slug: id, title, source_summary: "", published: true, listed: true, published_at: now, last_updated: now, first_seen: now, sources: [source(title, `https://example.org/${id}`)], claims: [], analysis: { summary: title }, versions: [{ version: 1, analyzed_at: now }], current_version: 1, ...more });
const dormagen = story("dormagen", "Mutmaßlich Sabotage-Versuch an Umspannwerk in Dormagen");

test("article identity follows changed publisher slugs, not arbitrary IDs or query resources", () => {
  assert.equal(documentKey("https://www.stern.de/alt-38205422.html?utm_source=x#top"), documentKey("https://www.stern.de/neu-38205422.html"));
  assert.notEqual(documentKey("https://example.org/a?id=1"), documentKey("https://example.org/a?id=2"));
  assert.equal(documentKey("javascript:alert(1)"), "");
});
test("object, place and time distinguish follow-up from a different incident or response", () => {
  assert.equal(livingFileMatch(source("Polizei geht von Sabotage an Umspannwerk in Dormagen aus"), dormagen).score, 0.98);
  assert.equal(livingFileMatch(source("Polizei geht von Sabotage an Umspannwerk in Oldenburg aus"), dormagen).score, 0);
  assert.equal(livingFileMatch(source("Polizei geht von Sabotage an Umspannwerk in Dormagen aus", undefined, { published_at: "2026-10-01" }), dormagen).score, 0);
  assert.equal(subjectConflict(source("Hessen erhöht Schutz für Umspannwerke"), dormagen), true);
  assert.equal(fileSubject({ title: "Sabotage an Umspannwerk Jänschwalde", summary: "Das Schreiben wurde in Nordrhein-Westfalen abgeschickt." }).key, "grid_incident:janschwalde");
  assert.equal(fileSubject(source("Sabotage an Umspannwerk in Dormagen und weiterer Einsatz in Oldenburg")).key, null);
  assert.equal(livingFileMatch(source("Weiterer Angriff an Umspannwerk in Dormagen"), dormagen).score, 0);
});
test("known existing document is routed before high-priority unanchored batch entries", () => {
  const existing = story("old", "Erste Nachricht zum Stromnetz", { sources: [source("Erste Nachricht zum Stromnetz", "https://example.org/known")] });
  const items = [source("Polizei untersucht Sabotage an Umspannwerk in Dormagen", "https://example.org/new", { source_priority: 100 }), source("Polizei untersucht Sabotage an Umspannwerk in Dormagen", "https://example.org/known", { source_priority: 1 })];
  for (const input of [items, [...items].reverse()]) {
    const clusters = clusterItems(input, [existing], now);
    assert.equal(clusters.length, 1);
    assert.equal(clusters[0].story_id, "old");
    assert.equal(clusters[0].sources.length, 2);
  }
});
test("high title similarity and broad policy words cannot override different places", () => {
  const incoming = source("Mutmaßlich Sabotage-Versuch an Umspannwerk in Oldenburg");
  assert.notEqual(clusterItems([incoming], [dormagen], now)[0].story_id, "dormagen");
  const german = story("de", "Kommission genehmigt deutschen Kapazitätsmechanismus");
  assert.notEqual(clusterItems([source("Kommission genehmigt französischen Kapazitätsmechanismus")], [german], now)[0].story_id, "de");
});
test("consolidation is idempotent, preserves histories, queues review and routes aliases", () => {
  const canonical = structuredClone(dormagen);
  const duplicate = story("duplicate", "Polizei: Verdächtiger Gegenstand an Umspannwerk in Dormagen", { pending_update: { sources: [source("Sabotage in Dormagen", "https://example.org/pending")], reason: "AI_PROVIDER_UNAVAILABLE" }, followups: [{ followup_id: "f1", status: "scheduled" }] });
  const beforeCanonical = structuredClone(canonical), beforeDuplicate = structuredClone(duplicate);
  const stories = [canonical, duplicate];
  const groups = [{ canonical_id: canonical.story_id, duplicate_ids: [duplicate.story_id], reason: "test" }];
  assert.equal(mergeLivingFiles(stories, groups, now).length, 1);
  assert.equal(mergeLivingFiles(stories, groups, now).length, 0);
  for (const key of ["analysis", "claims", "versions", "current_version", "sources", "last_updated", "published_at"]) assert.deepEqual(canonical[key], beforeCanonical[key]);
  for (const key of ["analysis", "claims", "versions", "sources", "pending_update", "last_updated"]) assert.deepEqual(duplicate[key], beforeDuplicate[key]);
  assert.equal(duplicate.listed, false);
  assert.equal(canonical.pending_update.sources.length, 3);
  assert.equal(canonical.followups[0].origin_story_id, "duplicate");
  const clusters = clusterItems([source("Neuer Ermittlungsstand", duplicate.sources[0].url)], stories, now);
  assert.equal(clusters[0].story_id, canonical.story_id);
  assert.equal(clusters[0].existing_story, canonical);
});
test("automatic merging excludes other places, response policies and multi-event roundups", () => {
  const duplicate = story("dup", "Polizei geht von Sabotage an Umspannwerk in Dormagen aus");
  const separate = [story("elsewhere", "Sabotage an Umspannwerk in Oldenburg"), story("response", "Hessen erhöht Schutz für Umspannwerke"), story("roundup", "Sabotage an Umspannwerk in Dormagen und in Oldenburg")];
  const groups = duplicateGroups([dormagen, duplicate, ...separate]);
  assert.equal(groups.length, 1);
  assert.deepEqual([groups[0].canonical_id, ...groups[0].duplicate_ids].sort(), ["dormagen", "dup"].sort());
});
test("related links are capped, relevant, unique and never filled by shared category alone", () => {
  const relevant = Array.from({ length: 7 }, (_, i) => story(`related-${i}`, `Sicherheitsmaßnahmen für Umspannwerke ${i}`));
  const irrelevant = story("offshore", "Neue Ausschreibung für Windenergie auf See", { topic: ["Energie"] });
  const archived = story("archived", "Sabotage an Umspannwerk in Essen", { listed: false });
  const results = relatedStories(dormagen, [dormagen, ...relevant, irrelevant, archived]);
  assert.equal(results.length, 5);
  assert.ok(results.every(({ story }) => story.story_id.startsWith("related-")));
  assert.equal(relatedStories(dormagen, [dormagen, irrelevant]).length, 0);
  assert.equal(renderRelatedStories(dormagen, [dormagen, irrelevant]), "");
  assert.match(renderRelatedStories(dormagen, [dormagen, ...relevant]), /data-search-exclude/);
});

test("headless runs consolidate before AI and never retry a retired duplicate", async () => {
  const registrySource = { source_id: "test", publisher_id: "test", name: "Test", url: "https://example.org/", feed_url: "https://example.org/rss", enabled: true, source_type: "official_rss", primary_source: true, access: { status: "public", article: "metadata_only", cost_usd: 0 }, frequency_class: "high_frequency" };
  const canonical = structuredClone(dormagen);
  const duplicate = story("old", "Polizei geht von Sabotage an Umspannwerk in Dormagen aus", { last_updated: "2026-09-04T05:00:00Z", pending_update: { reason: "AI_PROVIDER_UNAVAILABLE", sources: [source("Sabotage an Umspannwerk in Dormagen", "https://example.org/new-source")] } });
  let captured, calls = [];
  const options = { dryRun: true, now, registry: { schema_version: "1.0", sources: [registrySource], policy: {} }, state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: "4.0" }, storyStore: { stories: [canonical, duplicate] }, usage: { runs: [] }, newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] }, budgetFx: { rate_date: "2026-09-04", rate_usd_per_eur: 1.16 }, fetchFeedImpl: async () => ({ not_modified: true, final_url: registrySource.feed_url }), callAiImpl: async (candidates) => { calls.push(...candidates.map((item) => item.story_id)); throw Object.assign(new Error("TEST_PROVIDER_UNAVAILABLE"), { requestAttempts: 0 }); }, captureState: (value) => { captured = value; } };
  const first = await runWirkungsticker(options);
  assert.deepEqual(calls, [canonical.story_id]);
  assert.equal(first.living_file_merges.length, 1);
  assert.equal(first.updated_stories, 0);
  assert.equal(first.published_stories, 0);
  assert.equal(first.public_changed, true);
  assert.deepEqual(captured.state.pending_story_ids, [canonical.story_id]);
  assert.equal(captured.storyStore.stories.find((item) => item.story_id === canonical.story_id).pending_update.consolidation, true);
  calls = [];
  const second = await runWirkungsticker({ ...options, ...captured });
  assert.deepEqual(calls, [canonical.story_id]);
  assert.equal(second.living_file_merges.length, 0);
  assert.equal(second.public_changed, false);
});

test("a verified update retains canonical URL/history and uses one new publication version", () => {
  const old = { ...structuredClone(dormagen), living_file: { merged_story_ids: ["old-alias"], consolidations: [{ story_id: "old-alias" }] }, publication_history: [{ version: 1, published_at: now }] };
  const at = "2026-09-04T07:00:00Z";
  const candidate = { ...old, existing_story: old, claims: [], topic: ["Energie"] };
  const next = publishedRecord(candidate, { summary: "Neue geprüfte Entwicklung", source_summary: "Neu", followups: [] }, { provider: "test", model: "test" }, at);
  assert.equal(next.slug, old.slug);
  assert.equal(next.published_at, old.published_at);
  assert.equal(next.last_updated, at);
  assert.equal(next.current_version, 2);
  assert.equal(next.versions.length, 2);
  assert.deepEqual(next.versions[0], old.versions[0]);
  assert.deepEqual(next.living_file, old.living_file);
  assert.equal(next.publication_history.length, 2);
});
