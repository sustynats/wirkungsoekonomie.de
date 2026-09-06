import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { prepareReviewedStory } from "../../scripts/news/publish-reviewed.mjs";
import { loadNewsRegistry } from "../../scripts/news/registry.mjs";
import { sourceIntegrityForStory } from "../../scripts/news/source-integrity.mjs";
import { duplicateGroups } from "../../scripts/news/living-files.mjs";
import { storyPage } from "../../scripts/news/build.mjs";

const review = JSON.parse(fs.readFileSync(new URL("../../content/news/reviews/sachsen-anhalt-kandidatur-2026-09-05.json", import.meta.url)));
const registry = loadNewsRegistry(new URL("../../", import.meta.url).pathname);
const now = "2026-09-05T23:00:00Z";

const mediaReview = JSON.parse(fs.readFileSync(new URL("../../content/news/reviews/seelze-media-2026-09-06.json", import.meta.url)));
function originalMediaStory() {
  const item = structuredClone(JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url))).stories.find(story => story.story_id === mediaReview.story_id));
  item.title = item.sources[0].title;
  item.analysis = structuredClone(item.versions[0].analysis);
  item.source_summary = item.versions[0].source_summary;
  item.current_version = 1;
  item.versions = item.versions.slice(0, 1);
  delete item.corrections;
  return item;
}

test("media-only review preserves event, sources, claims, scores and history", () => {
  const original = originalMediaStory();
  const copy = structuredClone(original);
  const result = prepareReviewedStory(mediaReview, registry, [original], "2026-09-06T11:40:00Z");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(original, copy, "preparation must not mutate its input");
  const record = result.record;
  for (const key of ["story_id", "slug", "event_id", "content_hash", "published_at", "claims", "sources", "source_summary"]) assert.deepEqual(record[key], original[key], key);
  for (const key of Object.keys(original.analysis).filter(key => !key.startsWith("media_"))) assert.deepEqual(record.analysis[key], original.analysis[key], key);
  assert.equal(record.title, "Großbrand zerstört Sonderpostenmarkt in Seelze");
  assert.deepEqual(record.versions[0], original.versions[0]);
  assert.equal(record.versions[1].previous_title, original.title);
  assert.equal(record.versions[1].self_frame_rewrites, 1);
  assert.equal(record.current_version, 2);
  assert.equal(record.analysis.media_impact.observed_impact.present, false);
  assert.equal(record.analysis.media_impact.discourse_effect.repetition_risk, "open");
  assert.equal(record.analysis.media_impact.source_comparison.sufficient_basis, false);
  const html = storyPage(record);
  assert.match(html, /id="medienwirkung"/);
  assert.ok(html.includes(mediaReview.correction_note));
  assert.match(html, /Eine solche Wiederholung und ein Illusory-Truth-Effekt sind für diesen Fall nicht nachgewiesen/);
  assert.ok(html.includes(original.sources[0].title), "Originalheadline stays visible at the source");
  assert.equal(prepareReviewedStory(mediaReview, registry, [record], "2026-09-06T11:45:00Z").unchanged, true);
});

test("media-only review rejects changed source content or wrong publisher URL", () => {
  const original = originalMediaStory();
  original.content_hash = "changed";
  assert.throws(() => prepareReviewedStory(mediaReview, registry, [original], "2026-09-06T11:40:00Z"), /EDITORIAL_MEDIA_SOURCE_CHANGED/);
  original.content_hash = mediaReview.expected_content_hash;
  original.sources[0].url = "https://example.org/wrong";
  assert.ok(prepareReviewedStory(mediaReview, registry, [original], "2026-09-06T11:40:00Z").errors.includes("SOURCE_PUBLISHER_URL_MISMATCH"));
});

test("media-only review cannot bypass the no-intent quality gate", () => {
  const wrong = structuredClone(mediaReview);
  wrong.media_impact.editorial_assessment = "Die Redaktion will manipulieren.";
  assert.ok(prepareReviewedStory(wrong, registry, [originalMediaStory()], "2026-09-06T11:40:00Z").errors.includes("MEDIA_INTENT_ATTRIBUTION_NOT_ALLOWED"));
});

test("reviewed election story passes production source, evidence, media and self-frame gates", () => {
  const result = prepareReviewedStory(review, registry, [], now);
  assert.deepEqual(result.errors, []);
  assert.equal(result.record.analysis.media_impact.relevant, true);
  assert.equal(result.record.analysis.media_impact.observed_impact.present, false);
  assert.equal(result.record.analysis.planet.relevance, "offen");
  assert.ok(result.record.source_summary.includes("bereits am Mittwoch"));
  assert.ok(result.record.source_summary.includes("keinen erneuten Kurswechsel"));
  assert.ok(!result.record.title.includes("Kurswechsel"));
  assert.equal(result.record.news_status, "corrected");
  assert.equal(result.record.sources.some(source => "article_excerpt" in source), false);
  assert.equal(result.record.sources.find(source => source.source_id === "bild-access").provenance.origin, result.record.sources.find(source => source.source_id === "focus-case-research").provenance.origin);
  assert.equal(result.record.sources.find(source => source.url.includes("31272045")).agency_origin, "afp");
  assert.equal(result.record.claims.some(claim => claim.status === "confirmed_claim"), false);
  assert.equal(result.record.claims.find(claim => claim.evidence.some(evidence => evidence.url.includes("31273399"))).status, "single_source_claim");
  assert.ok(result.record.title.includes("Unterschiedliche Berichte"));
  assert.equal(result.record.sources.find(source => source.url.includes("31273399")).provenance.independence_established, false);
  assert.ok(result.record.claims.some(claim => claim.status === "uncertain_claim"));
});
test("reprinting a restricted-origin interview is not independent corroboration", () => {
  const overstated = structuredClone(review);
  overstated.analysis.event_claims.find(claim => claim.evidence.some(evidence => evidence.source_id === "focus-case-research")).status = "single_source_claim";
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
test("later correction keeps the event and URL, preserves history and explains the change", () => {
  const initial = structuredClone(review);
  delete initial.correction_note;
  initial.title = "Frühere Kandidaturaussage vor der Sachsen-Anhalt-Wahl";
  initial.sources.reverse();
  const first = prepareReviewedStory(initial, registry, [], now).record;
  const next = prepareReviewedStory(review, registry, [first], now);
  assert.deepEqual(next.errors, []);
  assert.equal(next.record.current_version, 2);
  assert.equal(next.record.event_id, first.event_id);
  assert.equal(next.record.slug, first.slug);
  assert.deepEqual(next.record.versions[0], first.versions[0]);
  assert.equal(next.record.corrections.length, 1);
  assert.equal(next.record.corrections[0].note, review.correction_note);
  const repeated = prepareReviewedStory(review, registry, [next.record], now);
  assert.equal(repeated.unchanged, true);
  assert.equal(repeated.record.corrections.length, 1);
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
