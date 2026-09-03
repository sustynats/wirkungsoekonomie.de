import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve("data/government/public");
const actions = readFileSync(resolve(root, "government-actions.jsonl"), "utf8").trim().split("\n").map((line) => JSON.parse(line));
const registry = JSON.parse(readFileSync(resolve(root, "executive-institutions.json"), "utf8"));
const coverage = JSON.parse(readFileSync(resolve(root, "coverage.json"), "utf8"));

test("government staging uses only public facts that passed the publication gate", () => {
  assert.equal(actions.length, coverage.counts.government_actions_public);
  assert.equal(coverage.data_version, "1.2");
  const forbidden = ["fach_review_status", "review_notes", "canonicalization_notes", "impact_direction", "sdg_direction", "government_score", "minister_score", "party_score"];
  for (const action of actions) {
    assert.equal(action.publication_status, "APPROVED");
    assert.equal(action.identity_status, "VERIFIED");
    assert.equal(action.source_provenance, "PASS");
    assert.equal(action.no_open_p0_overmerge, true);
    assert.ok(action.source_refs.length > 0);
    assert.ok(action.decision_date);
    for (const field of forbidden) assert.equal(field in action, false, `${field} leaked into ${action.government_action_id}`);
  }
});

test("constitutional executive institutions are separate and effective-dated", () => {
  assert.equal(registry.institutions.filter((row: { institution_type: string }) => row.institution_type === "FEDERAL_MINISTRY").length, 16);
  assert.equal(registry.institutions.find((row: { institution_id: string }) => row.institution_id === "BKAmt")?.institution_type, "FEDERAL_CHANCELLERY");
  assert.equal(registry.institutions.find((row: { institution_id: string }) => row.institution_id === "NSR")?.institution_type, "CABINET_COMMITTEE");
  const bmg = registry.office_holder_assignments.filter((row: { institution_id: string }) => row.institution_id === "BMG");
  assert.ok(bmg.some((row: { office_holder_name: string; valid_to: string }) => row.office_holder_name === "Nina Warken" && row.valid_to === "2026-07-28"));
  assert.ok(bmg.some((row: { office_holder_name: string; valid_from: string }) => row.office_holder_name === "Carsten Linnemann" && row.valid_from === "2026-07-29"));
});

test("cabinet coverage has an auditable denominator", () => {
  const cabinet = coverage.sources.find((row: { source_id: string }) => row.source_id === "BREG_CABINET_ARCHIVE");
  assert.equal(cabinet.found_records, "53");
  assert.equal(cabinet.processed_records, "53");
  assert.equal(cabinet.found_items, "729");
  assert.equal(cabinet.processed_items, "729");
  assert.equal(cabinet.unexplained_items, "0");
  assert.equal(cabinet.coverage_status, "COMPLETE_ENUMERATED_SOURCE");
});

test("all required staging routes exist", () => {
  const routes = [
    "app/regierung/page.tsx", "app/regierung/akte/page.tsx", "app/regierung/akte/[id]/page.tsx",
    "app/regierung/kabinett/page.tsx", "app/regierung/ressorts/page.tsx", "app/regierung/ressorts/[id]/page.tsx",
    "app/regierung/haushalt-foerderung/page.tsx", "app/regierung/umsetzung/page.tsx",
    "app/regierung/wirkungsmonitor/page.tsx", "app/regierung/mandat-praxis/page.tsx",
    "app/regierung/ministerien/page.tsx", "app/regierung/mandat-und-praxis/page.tsx",
    "app/regierung/methodik/page.tsx", "app/regierung/transparenz/page.tsx",
  ];
  for (const route of routes) assert.ok(existsSync(resolve(route)), route);
});

test("Data 1.2 keeps each DIP procedure as its own identity and passes known regressions", () => {
  const validation = JSON.parse(readFileSync(resolve("data/government/audit/VALIDATION-RESULT.json"), "utf8"));
  assert.equal(validation.gates.DATA_1_2_VALIDATION, "PASS");
  assert.equal(validation.gates.KNOWN_OVERMERGE_REGRESSIONS, "PASS");
  assert.equal(validation.multi_dip_remaining, 0);
  assert.deepEqual(validation.duplicate_dip_ids, []);
  assert.equal(validation.overmerge_guard_objects_scanned, validation.canonical_objects + validation.semantic_entity_review_required);
  assert.equal(validation.known_overmerge_regressions.every((row: { result: string }) => row.result === "PASS"), true);
  const seen = new Set<string>();
  for (const action of actions) {
    const ids = action.official_identifiers?.dip_ids ?? [];
    assert.ok(ids.length <= 1, action.government_action_id);
    if (ids.length === 1) {
      assert.equal(seen.has(ids[0]), false, ids[0]);
      seen.add(ids[0]);
    }
  }
});

test("known Kindergeld case and cabinet split are not hidden in compound records", () => {
  const byId = new Map(actions.map((action) => [action.government_action_id, action]));
  const kindergeld = byId.get("govaction:dip:333136");
  assert.ok(kindergeld);
  assert.match(kindergeld.title, /Kindergeld/i);
  assert.deepEqual(kindergeld.official_identifiers.dip_ids, ["333136"]);
  assert.equal(byId.has("govaction:breg-cabinet:2445448:top:4"), false);
  assert.equal(byId.has("govaction:breg-cabinet:2445448:top:4:bundeswehr-infrastruktur"), true);
  assert.equal(byId.has("govaction:breg-cabinet:2445448:top:4:sicherstellung-vorsorge"), true);
});

test("system-wide semantic cluster guards keep flagged objects out of public", () => {
  const review = readFileSync(resolve("data/government/audit/OVERMERGE-REVIEW.csv"), "utf8").trim().split("\n");
  assert.equal(review.length - 1, JSON.parse(readFileSync(resolve("data/government/audit/VALIDATION-RESULT.json"), "utf8")).overmerge_guard_objects_scanned);
  const flagged = review.filter((line) => line.includes("SEMANTIC_ENTITY_REVIEW_REQUIRED"));
  assert.ok(flagged.length > 0);
  for (const line of flagged) {
    const id = line.match(/^"([^"]+)"/)?.[1];
    assert.ok(id);
    assert.equal(actions.some((action) => action.government_action_id === id), false, id);
  }
});

test("portal homepage provides a prominent entry into current government work", () => {
  const homepage = readFileSync(resolve("app/page.tsx"), "utf8");
  assert.match(homepage, /Regierungshandeln &amp; Wirkung/);
  assert.match(homepage, /was war über mögliche Folgen schon bekannt/i);
  assert.match(homepage, /href="\/regierung"/);
  assert.match(homepage, /getGovernmentPublicData\(\)\.actions\.slice\(0, 3\)/);
});

test("public government projection contains no private paths or provider artefacts", () => {
  const payload = readFileSync(resolve(root, "government-actions.jsonl"), "utf8") + readFileSync(resolve(root, "source-index.json"), "utf8");
  const providerMarkers = ["chat" + "gpt", "open" + "ai", "clau" + "de"];
  for (const pattern of [/\/Users\//i, /\/private\//i, /localhost/i, ...providerMarkers.map((value) => new RegExp(value, "i"))]) {
    assert.equal(pattern.test(payload), false, String(pattern));
  }
});
