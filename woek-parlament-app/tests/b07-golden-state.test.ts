import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const checker = readFileSync("scripts/quality/check-b07-golden-state.mjs", "utf8");
const materializer = readFileSync("scripts/materialize-fachvollstaendigkeit-b07.mjs", "utf8");
const auditRunner = readFileSync("scripts/quality/run-b07-local-audits.mjs", "utf8");

test("B07 Golden State is a release-blocking rendered route and content gate", () => {
  for (const field of [
    "required_content_paths", "rendered_content_paths", "unrendered_content_paths", "required_routes",
    "rendered_routes", "missing_required_routes", "navigation_targets", "search_targets", "sitemap_targets",
    "analysis_layers_by_object", "source_hashes", "fach_version", "renderer_version",
    "semantic_diff_against_last_accepted_production",
  ]) assert.match(checker, new RegExp(field));
  assert.match(auditRunner, /check-b07-golden-state\.mjs/);
});

test("new quality layers fail closed without technical Fach synthesis", () => {
  for (const layer of [
    "MATERIAL_OMISSIONS", "POLICY_COHERENCE", "DELIVERY_FEASIBILITY", "RESOURCE_FINANCING",
    "SPATIAL_DISTRIBUTION", "INTERNATIONAL_LEAKAGE", "ROBUSTNESS_STRESS_TEST",
    "REVERSIBILITY_LOCKIN", "FALSIFICATION_TRIGGERS", "LIFECYCLE_TRACEABILITY",
    "VERSION_DELTA", "COVERAGE_SCOPE", "COMMUNICATION_MEDIA_EFFECTS",
  ]) assert.match(checker, new RegExp(layer));
  assert.match(checker, /CONTENT_GAP_REQUIRES_FACH_REVIEW/);
});

test("B07 semantic diff blocks loss of previously public Fach objects", () => {
  assert.match(materializer, /government_public_ids_lost/);
  assert.match(materializer, /recommendation_ids_lost/);
  assert.match(materializer, /common_target_review_ids_lost/);
  assert.match(materializer, /B07_GOLDEN_STATE_SEMANTIC_LOSS/);
  assert.match(materializer, /B07_COMMITTED_PUBLIC_STORE_PASS/);
  assert.match(materializer, /public_output_hashes/);
});
