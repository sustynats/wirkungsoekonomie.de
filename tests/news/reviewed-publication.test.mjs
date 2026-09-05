import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { prepareReviewedStory } from "../../scripts/news/publish-reviewed.mjs";
import { loadNewsRegistry } from "../../scripts/news/registry.mjs";
import { sourceIntegrityForStory } from "../../scripts/news/source-integrity.mjs";
import { duplicateGroups } from "../../scripts/news/living-files.mjs";

const review = JSON.parse(fs.readFileSync(new URL("../../content/news/reviews/sachsen-anhalt-kandidatur-2026-09-05.json", import.meta.url)));
const registry = loadNewsRegistry(new URL("../../", import.meta.url).pathname);
const now = "2026-09-05T22:15:00Z";

test("reviewed election story passes production source, evidence, media and self-frame gates", () => {
  const result = prepareReviewedStory(review, registry, [], now);
  assert.deepEqual(result.errors, []);
  assert.equal(result.record.analysis.media_impact.relevant, true);
  assert.equal(result.record.analysis.media_impact.observed_impact.present, false);
  assert.equal(result.record.analysis.planet.relevance, "offen");
  assert.ok(result.record.source_summary.includes("nicht neu"));
  assert.ok(!result.record.title.includes("Kurswechsel"));
  assert.equal(result.record.news_status, "preliminary");
  assert.equal(result.record.sources.some(source => "article_excerpt" in source), false);
  assert.equal(result.record.sources[0].provenance.origin, result.record.sources[1].provenance.origin);
  assert.equal(result.record.claims.some(claim => claim.status === "confirmed_claim"), false);
  assert.equal(result.record.claims[0].status, "uncertain_claim");
});
test("reprinting a restricted-origin interview is not independent corroboration", () => {
  const overstated = structuredClone(review);
  overstated.analysis.event_claims[0].status = "single_source_claim";
  assert.ok(prepareReviewedStory(overstated, registry, [], now).errors.includes("CLAIM_CRITICAL_SOURCE_UNCORROBORATED"));
});
test("editorial intake is idempotent; subsequent changes preserve the original version", () => {
  const first = prepareReviewedStory(review, registry, [], now).record;
  assert.equal(prepareReviewedStory(review, registry, [first], now).unchanged, true);
  const changed = structuredClone(review);
  changed.analysis.watch_next.push("Weitere Originalerklärungen prüfen.");
  const next = prepareReviewedStory(changed, registry, [first], now);
  assert.deepEqual(next.errors, []);
  assert.equal(next.record.current_version, 2);
  assert.deepEqual(next.record.versions[0], first.versions[0]);
});
test("a wrong publisher URL blocks editorial intake too", () => {
  const wrong = structuredClone(review);
  wrong.sources[0].url = "https://example.org/wrong";
  assert.ok(prepareReviewedStory(wrong, registry, [], now).errors.includes("SOURCE_PUBLISHER_URL_MISMATCH"));
});
test("undated official context is explicit, never a made-up news date", () => {
  const record = prepareReviewedStory(review, registry, [], now).record;
  assert.equal(sourceIntegrityForStory(record, registry, [], now).status, "verified");
  const legal = record.sources.find(source => source.date_status === "undated_reference");
  assert.equal(legal.published_at, null);
  assert.ok(legal.retrieved_at);
  for (const change of [{ source_role: "journalistic_report" }, { retrieved_at: null }, { retrieved_at: "2030-01-01T00:00:00Z" }]) {
    const copy = structuredClone(record);
    Object.assign(copy.sources.find(source => source.date_status === "undated_reference"), change);
    assert.ok(sourceIntegrityForStory(copy, registry, [], now).issues.some(issue => issue.code === "SOURCE_PUBLICATION_DATE_INVALID"));
  }
});
test("new concrete candidacy development is not automatically merged into generic election coverage", () => {
  const record = prepareReviewedStory(review, registry, [], now).record;
  const stories = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url))).stories;
  assert.equal(duplicateGroups([...stories.filter(story => story.story_id !== record.story_id), record]).some(group => group.duplicate_ids.includes(record.story_id)), false);
});
