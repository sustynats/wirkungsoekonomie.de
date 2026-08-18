import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";
import { projectGovernmentEditorial } from "../lib/publication/public-editorial-projection.mjs";

const readJsonl = (file: string) => readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const allImpactCases = [
  ...readJsonl("data/government/impact-cases/public-impact-records.jsonl"),
  ...readJsonl("data/government/impact-cases/review-impact-records.jsonl"),
];

test("risk wording does not invert three predominantly positive Fach directions", () => {
  for (const id of ["WOEK-IMPACT-BUND-MIGRATION-DIGITAL-2026", "WOEK-IMPACT-BUND-WISSZEIT-2026", "WOEK-IMPACT-BUND-CCFD-2026"]) {
    const record = allImpactCases.find((entry) => entry.impact_case_id === id);
    assert.ok(record, id);
    assert.equal(record.primary_direction, "POSITIVE", id);
    assert.match(record.overview_assessment_label, /positiv/i, id);
  }
});

test("the federal budget retains no single direction and OPEN is not neutral", () => {
  const record = allImpactCases.find((entry) => entry.impact_case_id === "WOEK-IMPACT-BUND-BHH-2027");
  assert.ok(record);
  assert.equal(record.primary_direction, "OPEN");
  assert.equal(record.overview_assessment_label, "PORTFOLIO_DISAGGREGATION_REQUIRED");
  assert.equal(projectGovernmentEditorial(record).fields.overview_assessment_label, "Wirkung nur auf Ebene der Einzelmaßnahmen belastbar bewertbar");
  assert.notEqual(record.primary_direction, "NEUTRAL");
});

test("compact and competence-incomplete cases are visibly limited rather than upgraded", () => {
  for (const record of allImpactCases) {
    assert.equal(record.public_analysis_depth, "LIMITED_FACH_RECORD", record.impact_case_id);
    assert.equal(record.competence_review_status, "NOT_STRUCTURED", record.impact_case_id);
    assert.ok(record.missing_structured_fields.includes("competence_review"), record.impact_case_id);
  }
});

test("known Fach ID mismatch resolves through an explicit alias", () => {
  const aliases = readJsonl("data/government/impact-cases/impact-case-aliases.jsonl");
  assert.ok(aliases.some((entry) => entry.alias_id === "WOEK-IMPACT-BUND-DIGITALE-MIGRATIONSVERWALTUNG-2025-2026" && entry.canonical_impact_case_id === "WOEK-IMPACT-BUND-MIGRATION-DIGITAL-2026"));
});

test("SEFE LNG remains an ExternalActorEvent and is not a ministerial GovernmentAction", () => {
  const events = readJsonl("data/government/canonical/external-actor-events.jsonl");
  const actions = readJsonl("data/government/canonical/government-actions.jsonl");
  assert.ok(events.some((entry) => entry.external_actor_event_id === "external:sefe:ksi-lisims-lng-loi:2026-05-27" && entry.government_action_status === "NOT_A_GOVERNMENT_ACTION"));
  assert.equal(actions.some((entry) => /Katherina Reiche.*(schließt|unterzeichnet).*LNG/i.test(`${entry.title_canonical} ${entry.title_official_preferred}`)), false);
});

test("all 16 state entries fail closed without an operational adapter", () => {
  const states = JSON.parse(readFileSync("data/political-jurisdictions.json", "utf8")).jurisdictions.filter((entry: { jurisdiction_type: string }) => entry.jurisdiction_type === "STATE");
  assert.equal(states.length, 16);
  assert.equal(states.filter((entry: { monitoring_enabled: boolean }) => entry.monitoring_enabled).length, 0);
  assert.ok(states.every((entry: { source_status: string; source_health: string }) => entry.source_status === "STATIC_INITIAL_DATASET_NO_OPERATIONAL_ADAPTER" && entry.source_health === "BLOCKED"));
});

test("remediated Parliament delivery is complete, READY is last, and votes stay unverified zero", () => {
  const root = "data/parliament/daily/remediated/2026-08-18-AM";
  const required = ["MANIFEST.json", "PARLIAMENTARY-DELTA.jsonl", "UPCOMING-AGENDA.jsonl", "VOTE-EVENTS.jsonl", "INDIVIDUAL-VOTES.jsonl", "SOURCE-MANIFEST.jsonl", "RELATIONSHIP-DELTA.jsonl", "OPEN-DATA-ISSUES.csv", "INGESTION-REPORT.md", "READY.json"];
  for (const name of required) assert.ok(statSync(`${root}/${name}`).isFile(), name);
  const manifest = JSON.parse(readFileSync(`${root}/MANIFEST.json`, "utf8"));
  assert.equal(manifest.counts.vote_events, 0);
  assert.equal(manifest.counts.individual_votes, 0);
  assert.equal(readFileSync(`${root}/VOTE-EVENTS.jsonl`, "utf8"), "");
  assert.equal(readFileSync(`${root}/INDIVIDUAL-VOTES.jsonl`, "utf8"), "");
  for (const [name, expected] of Object.entries(manifest.files) as Array<[string, { sha256: string; bytes: number }]>) {
    const content = readFileSync(`${root}/${name}`);
    assert.equal(content.byteLength, expected.bytes, `${name} bytes`);
    assert.equal(createHash("sha256").update(content).digest("hex"), expected.sha256, `${name} hash`);
  }
  const ready = JSON.parse(readFileSync(`${root}/READY.json`, "utf8"));
  const manifestHash = createHash("sha256").update(readFileSync(`${root}/MANIFEST.json`)).digest("hex");
  assert.equal(ready.manifest_sha256, manifestHash);
  assert.ok(statSync(`${root}/READY.json`).mtimeMs >= Math.max(...required.filter((name) => name !== "READY.json").map((name) => statSync(`${root}/${name}`).mtimeMs)));
});

test("observatory chain links source, observation, EvidenceEvent and RealityCheckCandidate", () => {
  const observations = readJsonl("data/observatory/public/state-observations.jsonl");
  const events = readJsonl("data/observatory/public/evidence-events.jsonl");
  const candidates = readJsonl("data/observatory/public/reality-check-candidates.jsonl");
  const observation = observations.find((entry) => entry.observation_id === "OBS-DE-RHEIN-KAUB-2026-08-18-0700-R1");
  const event = events.find((entry) => entry.evidence_event_id === "EVID-DE-RHEIN-KAUB-LOWWATER-2026-08-18-0700");
  assert.ok(observation?.source_ref.startsWith("https://"));
  assert.ok(event?.state_observation_ids.includes(observation.observation_id));
  assert.ok(candidates.some((entry) => entry.triggering_evidence_event_ids.includes(event.evidence_event_id)));
  assert.equal(event.attribution_status, "EXTERNAL_CONTEXT");
});

test("Legacy 28 are explicitly excluded from the 2.3 count until full sources exist", () => {
  const exclusion = JSON.parse(readFileSync("data/autopilot/audit/2.3-remediated/LEGACY-28-EXCLUSION.json", "utf8"));
  assert.equal(exclusion.count, 28);
  assert.equal(exclusion.status, "EXCLUDED_FROM_WOEK_IMPACT_CASE_2_3_UNTIL_FULL_SOURCE");
});

test("generated provenance timestamps are not in the future", () => {
  const now = Date.now() + 1000;
  const validation = JSON.parse(readFileSync("data/government/audit/VALIDATION-RESULT.json", "utf8"));
  const meta = JSON.parse(readFileSync("data/government/impact-cases/public-impact-records-meta.json", "utf8"));
  assert.ok(Date.parse(validation.generated_at) <= now);
  assert.ok(Date.parse(meta.imported_at) <= now);
});

test("the complete Recommendation 2.3 schema is represented by the public UI", () => {
  const source = readFileSync("app/components/recommendations/RecommendationSection.tsx", "utf8");
  for (const field of [
    "root_cause_or_binding_bottleneck", "option_set", "woek_preferred_option", "key_tradeoffs",
    "cascade_effects", "first_order_effects", "second_order_effects", "third_order_effects",
    "rebound_spillover_leakage", "distributional_effects", "time_and_generation_effects",
    "resilience_effects", "transformation_effects", "competence_scope", "implementation_route",
    "legal_constraints", "rights_and_boundary_conditions", "non_compensation_check", "reversibility",
    "resource_and_capacity_constraints", "safeguards", "monitoring_indicators", "reality_check_plan",
    "fallback_option", "knowledge_cutoff_date", "hindsight_limitations", "recommendation_version",
  ]) assert.match(source, new RegExp(field), field);
});

test("bootstrap and remediation builds never read mutable Dropbox handoffs", () => {
  for (const file of [
    "scripts/sync-approved-government-impact-cases.mjs",
    "scripts/sync-approved-parliament-daily.mjs",
    "scripts/sync-approved-observatory.mjs",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /WOEK_AUTOPILOT_RUNTIME_MODE !== "NORMAL"/, file);
    assert.ok(source.indexOf("WOEK_AUTOPILOT_RUNTIME_MODE") < source.indexOf("DROPBOX_APP_KEY"), file);
  }
});

test("the remediated Work Reconciliation artifacts share one PASS state and exact hashes", () => {
  const root = "data/autopilot/audit/2.3-remediated";
  const manifest = JSON.parse(readFileSync(`${root}/RECONCILIATION-ARTIFACT-MANIFEST-2.3-REMEDIATED.json`, "utf8"));
  const summary = JSON.parse(readFileSync(`${root}/CODEX-WORK-RECONCILIATION-2.3-SUMMARY.json`, "utf8"));
  assert.equal(manifest.status, "PASS");
  assert.equal(summary.status, "PASS");
  assert.equal(manifest.reconciliation_id, summary.reconciliation_id);
  for (const artifact of manifest.artifacts) {
    const digest = createHash("sha256").update(readFileSync(`${root}/${artifact.name}`)).digest("hex");
    assert.equal(digest, artifact.sha256, artifact.name);
  }
});

test("long case-specific German terms cannot widen 320px impact cards", () => {
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.government-impact-case h2[\s\S]*?overflow-wrap: anywhere;[\s\S]*?hyphens: auto;/);
});
