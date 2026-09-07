import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { prepareReviewedStory } from "../../scripts/news/publish-reviewed.mjs";
import { loadNewsRegistry, registryErrors } from "../../scripts/news/registry.mjs";
import { buildCaseFiles } from "../../scripts/news/case-files.mjs";
import { duplicateGroups } from "../../scripts/news/living-files.mjs";
import { storyPage } from "../../scripts/news/build.mjs";

const root = new URL("../../", import.meta.url).pathname;
const registry = loadNewsRegistry(root);
const review = JSON.parse(fs.readFileSync(`${root}content/news/reviews/sachsen-anhalt-internationale-reaktionen-2026-09-07.json`));
const stories = JSON.parse(fs.readFileSync(`${root}data/news/stories.json`)).stories;
const now = "2026-09-07T19:30:00Z";

test("international reaction report passes normal gates with attributable statements, not a global consensus", () => {
  const result = prepareReviewedStory(review, registry, [], now);
  assert.deepEqual(result.errors, []);
  assert.equal(result.record.source_integrity.status, "verified");
  assert.equal(result.record.analysis.media_impact.observed_impact.present, false);
  assert.equal(result.record.analysis.planet.tendency, "offen");
  assert.equal(result.record.analysis.visuals.path_directions.length, 4);
  assert.equal(result.record.claims.filter(claim => claim.status === "primary_source_claim").length, 2);
  assert.ok(result.record.claims.every(claim => claim.status !== "confirmed_claim"));
  const html = storyPage(result.record, { allStories: stories });
  for (const text of ["Polskie Radio", "Europaminister", "Matteo Salvini", "Eva Umlauf", "Charlotte Knobloch", "keine gemeinsame europäische Regierungsposition", "nicht pauschal gegen deutsche Wähler"])
    assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /data-news-update-banner|review_basis|403|<img[^>]+(?:ikg-m|auschwitz\.info|bild\.de)/);
  assert.match(html, /data-direction="positive"/);
  assert.match(html, /data-direction="negative"/);
});

test("reaction report cannot swallow the ongoing election case or become a duplicate of it", () => {
  const record = prepareReviewedStory(review, registry, [], now).record;
  const others = stories.filter(story => story.story_id !== record.story_id);
  const grouped = buildCaseFiles([...others, record]);
  assert.equal(grouped.caseByStory.has(record.story_id), false);
  assert.ok(grouped.visibleStories.some(story => story.story_id === record.story_id));
  assert.equal(duplicateGroups([...others, record]).some(group => group.duplicate_ids.includes(record.story_id)), false);
});

test("new case-research sources never silently enable automatic crawling", () => {
  assert.deepEqual(registryErrors(registry), []);
  for (const id of ["polskie-radio-case-research", "ikg-muenchen-statements", "auschwitz-komitee-statements"]) {
    const source = registry.sources.find(source => source.source_id === id);
    assert.equal(source.enabled, false);
    assert.ok(["C", "D"].includes(source.role));
    assert.equal(source.access.article, "disabled");
    assert.equal(source.legal_use_status, "open");
  }
});
