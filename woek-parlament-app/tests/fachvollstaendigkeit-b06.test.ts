import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const readJsonl = (file: string) => readFileSync(file, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const sha256 = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

const reviews = readJsonl("data/method/public-decision-reviews.jsonl");
const commonTargets = readJsonl("data/method/public-common-target-reviews.jsonl");
const manifest = JSON.parse(readFileSync("data/method/fachvollstaendigkeit-b06-manifest.json", "utf8"));

test("B06 materialization preserves the centrally approved record counts and identities", () => {
  assert.equal(reviews.length, 99);
  assert.equal(new Set(reviews.map((record) => record.impact_case_id)).size, 99);
  assert.equal(commonTargets.length, 9);
  assert.equal(new Set(commonTargets.map((record) => record.impact_case_id)).size, 9);
  assert.equal(new Set(commonTargets.map((record) => record.recommendation_id)).size, 9);
  assert.equal(manifest.problem_goal.problem_review_approved, 95);
  assert.equal(manifest.problem_goal.problem_review_not_assessable, 4);
  assert.equal(manifest.problem_goal.goal_review_approved, 83);
  assert.equal(manifest.problem_goal.goal_review_not_assessable, 16);
});

test("the exact six B05 parliamentary reviews are present without inferred goals", () => {
  const expected = new Set([
    "bt21-dip-f562f80bc03c",
    "bt21-dip-a035653fbebc",
    "bt21-dip-8d2a11d412de",
    "bt21-dip-c262bf7797f8",
    "bt21-dip-e89615651d49",
    "bt21-dip-0b72759f3d8c",
  ]);
  const records = reviews.filter((record) => expected.has(record.impact_case_id));
  assert.equal(records.length, 6);
  assert.ok(records.every((record) => record.goal_review.review_disposition === "REVIEWED_NOT_ASSESSABLE"));
  assert.ok(records.every((record) => record.goal_review.stated_goal === null));
  assert.ok(records.every((record) => record.guards?.recommendation_untouched === true));
  assert.ok(records.every((record) => record.guards?.machine_mapping_created === false));
});

test("the exact seventeen B06 full-scope reviews are present without technical Fach inference", () => {
  const expected = new Set([
    "WOEK-IMPACT-BUND-WOHNGELD-2027",
    "WOEK-IMPACT-BUND-SFVV-EIGENSTAENDIGKEIT-2026",
    "WOEK-IMPACT-BUND-EPA-AFRIKA-RATIFIZIERUNG-2025-2026",
    "WOEK-IMPACT-BUND-OPFERBEAUFTRAGTER-2026",
    "WOEK-IMPACT-BUND-ARBEITSFOERDERUNG-DIGITAL-JOB2JOB-2026",
    "WOEK-IMPACT-BUND-GENOSSENSCHAFTSRECHT-2026",
    "WOEK-IMPACT-BUND-MEDIEN-INVESTITIONSPFLICHT-2026",
    "EU-IMPACT-2026-009",
    "EU-IMPACT-2026-010",
    "EU-IMPACT-2026-011",
    "EU-IMPACT-2026-012",
    "EU-IMPACT-2026-015",
    "EU-IMPACT-2026-016",
    "EU-IMPACT-2026-017",
    "EU-IMPACT-2026-018",
    "bt21-dip-a5035b912cc6",
    "bt21-dip-ab9fa96b9b29",
  ]);
  const records = reviews.filter((record) => expected.has(record.impact_case_id));
  assert.equal(records.length, 17);
  assert.ok(records.every((record) => ["APPROVED", "APPROVED_WITH_OPEN_DATA", "REVIEWED_NOT_ASSESSABLE"].includes(record.fach_status ?? record.review_status)));
  assert.ok(records.every((record) => record.recommendation_untouched === true
    || record.recommendation_mutation?.performed === false
    || record.recommendation_scope === "NOT_IN_SCOPE_SHARD"));
  assert.ok(records.every((record) => record.machine_mapping_created === false
    || record.common_targets_review?.machine_mapping_public_allowed === false
    || record.common_targets_scope === "NOT_IN_SCOPE_SHARD"));
});

test("Parliamentary goal reviews fail closed where no robust goal can be reconstructed", () => {
  const ids = new Set(["bt21-dip-907488f49a72", "bt21-dip-3cc228c09318", "bt21-dip-ae2d0359b4d8", "bt21-dip-6345cfda82c0"]);
  const records = reviews.filter((record) => ids.has(record.impact_case_id));
  assert.equal(records.length, 4);
  for (const record of records) {
    assert.equal(record.goal_review.review_disposition, "REVIEWED_NOT_ASSESSABLE");
    assert.equal(record.goal_review.goal_adequacy_status, "NO_ROBUST_GOAL_JUDGMENT");
    assert.equal(record.goal_review.stated_goal, null);
  }
});

test("Bundeshaushalt 2027 remains non-aggregable and has no synthetic overall goal", () => {
  const budget = reviews.find((record) => record.impact_case_id === "WOEK-IMPACT-BUND-BHH-2027");
  assert.ok(budget);
  assert.equal(budget.problem_review.problem_adequacy_status, "NO_ROBUST_PROBLEM_JUDGMENT");
  assert.equal(budget.goal_review.goal_adequacy_status, "NO_ROBUST_GOAL_JUDGMENT");
  assert.match(budget.problem_review.rationale, /Disaggregation/i);
  assert.match(budget.goal_review.rationale, /heterogen/i);
  assert.equal(manifest.gates.budget_2027_non_aggregable, true);
});

test("Common-target reviews are Fach-approved, non-causal and never machine-public mappings", () => {
  for (const record of commonTargets) {
    assert.ok(["APPROVED", "APPROVED_WITH_OPEN_DATA"].includes(record.fach_status));
    assert.equal(record.machine_mapping_public_allowed, false);
    assert.match(record.causal_attribution_disclaimer, /Kausal|Zurechnung|Korrelation|kein Beweis|verursacht/i);
    assert.match(record.aggregation_rule, /keine|nicht|Nichtkompensation/i);
    assert.ok(record.mappings.length > 0);
    assert.ok(record.mappings.every((mapping: { source_refs: string[] }) => mapping.source_refs.length > 0));
  }
});

test("B06 does not mutate or generate RecommendationRecords", () => {
  assert.equal(sha256("data/recommendations/public/recommendations.jsonl"), "5bdbf3f9698d1df492dd5339899608aaa24d114b507700f9ade2701d3f997ed1");
  assert.equal(manifest.gates.no_recommendation_mutation, true);
  assert.equal(manifest.gates.no_machine_mapping, true);
  assert.equal(manifest.gates.no_fach_rewrite, true);
});

test("DNS and master indicator registries remain stable", () => {
  const dns = JSON.parse(readFileSync("data/indicators/dns-official-registry.json", "utf8"));
  const master = JSON.parse(readFileSync("data/indicators/masterregister-release-manifest.json", "utf8"));
  assert.equal(dns.record_count, 82);
  assert.equal(master.authoritative_item_count, 621);
  assert.equal(master.unique_id_count, 621);
  assert.equal(master.publication_rule, "NO_MACHINE_MAPPING_AS_FACH_REVIEW");
});

test("public component keeps Problem before Goal before Impact and hides canonical paths", () => {
  const component = readFileSync("app/components/DecisionMethodLayers.tsx", "utf8");
  assert.ok(component.indexOf("1 · Problemprüfung") < component.indexOf("2 · Zielprüfung"));
  assert.doesNotMatch(component, /catalog\[alias\][\s\S]*<Link[^>]*href=\{url\}/);
  assert.doesNotMatch(component, /JSON\.stringify/);
  assert.match(component, /Offen bedeutet weder neutral noch wirkungslos/);
  assert.match(component, /publicReviewProse\(review\.hindsight_guard\)/);
  assert.doesNotMatch(component, />Hindsight Guard:</);
});
