import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { saxonyAnhaltElectionProgrammes } from "../data/sachsen-anhalt-election-programmes";
import { saxonyAnhaltProgrammeEditorial } from "../data/presentation/sachsen-anhalt-programme-editorial-v2";
import { saxonyAnhaltImpactVisualDescriptor } from "../lib/impact-visuals/records";
import { evaluateImpactVisualGates } from "../lib/impact-visuals/gates";

const stylesheet = readFileSync(fileURLToPath(new URL("../app/components/impact-visuals/ImpactVisualScenario.module.css", import.meta.url)), "utf8");
const expectedSourceKeys = saxonyAnhaltElectionProgrammes.map((programme) => programme.sourceKey);
const approvedAnalysisRefs = Object.fromEntries(expectedSourceKeys.map((sourceKey) => [
  sourceKey,
  Object.keys(saxonyAnhaltProgrammeEditorial(sourceKey)?.centralAssessments ?? {}),
]));
const approvedCaseIds: Record<string, string> = {
  "ltw-2026-st-cdu": "ltw-2026-st-cdu-0018-das-institut-fuer-brand-und-katastrophenschutz-in-heyroths",
  "ltw-2026-st-spd": "ltw-2026-st-spd-0005-repair-caf-s-werden-wir-weiterhin-finanziell-unterstuetzen",
  "ltw-2026-st-gruene": "ltw-2026-st-gruene-0042-solche-strukturen-sollen-die-ausbreitung-von-feuer-kontrol",
  "ltw-2026-st-linke": "ltw-2026-st-linke-0005-dass-bei-volksinitiativen-volksbegehren-und-volksentscheid",
  "ltw-2026-st-bsw": "ltw-2026-st-bsw-0011-auch-auf-kommunaler-ebene-sollen-buergerbudgets-und-buerge",
  "ltw-2026-st-afd": "ltw-2026-st-afd-0001-gesellschaftspolitische-steuerungsinstrumente-die-nicht-nu",
};

test("all Sachsen-Anhalt impact visual governance gates pass", () => {
  const results = evaluateImpactVisualGates({ descriptor: saxonyAnhaltImpactVisualDescriptor, expectedSourceKeys, approvedAnalysisRefs, stylesheet });
  assert.deepEqual(results.filter((result) => !result.pass), []);
});

test("all twelve final assets are approved, byte-bound and free of missing image inputs", () => {
  assert.equal(saxonyAnhaltImpactVisualDescriptor.records.length, 12);
  for (const sourceKey of expectedSourceKeys) {
    const records = saxonyAnhaltImpactVisualDescriptor.records.filter((record) => record.source_key === sourceKey);
    assert.deepEqual(records.map((record) => record.visual_scope).sort(), ["CASE_SCENARIO", "PROGRAM_SCENARIO"]);
    const programme = records.find((record) => record.visual_scope === "PROGRAM_SCENARIO");
    const caseRecord = records.find((record) => record.visual_scope === "CASE_SCENARIO");
    assert.ok(programme && caseRecord);
    for (const record of records) {
      assert.equal(record.editorial_review_status, "APPROVED_FOR_PUBLICATION");
      assert.equal(record.source_fidelity_status, "PASS_APPROVED_ANALYSIS_ONLY");
      assert.equal(record.final_image_signoff, "APPROVED");
      assert.deepEqual(record.missing_approved_inputs, []);
      assert.ok(record.asset_path);
      assert.ok(record.asset_sha256);
      assert.ok(record.asset_metadata);
      assert.equal(record.asset_metadata.asset_handoff_id, "SA-2026-WIRKUNGSBILDER-FINAL-12-OF-12");
      assert.equal(record.asset_metadata.asset_handoff_manifest_sha256, "ff4d217bef7dc2971a304d9eb69b0931f3aead728a40fbddbfc5effce3f8c9c3");
      const publicFile = fileURLToPath(new URL(`../public${record.asset_path}`, import.meta.url));
      assert.equal(createHash("sha256").update(readFileSync(publicFile)).digest("hex"), record.asset_sha256);
    }
    assert.ok(programme.id.endsWith("-program-v2"));
    assert.ok(programme.asset_path?.endsWith("-program-scenario-v2.webp"));
    assert.ok(programme.supersedes_asset_path?.endsWith("-program-scenario-v1.webp"));
    assert.equal(programme.public_label, "Wirkungsbild · Programm");
    assert.equal(programme.visible_elements.length, 0, "approved composite path cards must not create spatial UI markers");
    assert.ok(programme.omitted_marker_candidates.length > 0);
    assert.equal(programme.non_visual_effects.length, 4);
    assert.ok(caseRecord.id.endsWith("-case-v1"));
    assert.ok(caseRecord.asset_path?.endsWith("-case-scenario-v1.webp"));
    assert.equal(caseRecord.supersedes_asset_path, null);
    assert.equal(caseRecord.public_label, "Wirkungsbild · Fallvertiefung");
    assert.equal(caseRecord.visible_elements.length, 0);
    assert.ok(caseRecord.visual_brief);
    assert.ok(caseRecord.case_analysis_binding);
    assert.equal(caseRecord.non_visual_effects_review_status, "REVIEWED_COMPLETE");
    assert.ok(caseRecord.non_visual_effects.length > 0);
    const oldProgrammeAsset = fileURLToPath(new URL(`../public${programme.supersedes_asset_path}`, import.meta.url));
    assert.equal(existsSync(oldProgrammeAsset), false, "superseded v1 programme asset must not remain public");
  }
});

test("programme slots reuse exactly the existing four curated key paths", () => {
  for (const sourceKey of expectedSourceKeys) {
    const expected = Object.keys(saxonyAnhaltProgrammeEditorial(sourceKey)?.centralAssessments ?? {});
    const record = saxonyAnhaltImpactVisualDescriptor.records.find((candidate) => candidate.source_key === sourceKey && candidate.visual_scope === "PROGRAM_SCENARIO");
    assert.ok(record);
    assert.deepEqual(record.selected_impact_path_ids, expected);
    assert.equal(record.selected_impact_path_ids.length, 4);
  }
});

test("case slots bind exactly the six delegated cases and no replacement", () => {
  for (const sourceKey of expectedSourceKeys) {
    const expected = Object.keys(saxonyAnhaltProgrammeEditorial(sourceKey)?.centralAssessments ?? {});
    const record = saxonyAnhaltImpactVisualDescriptor.records.find((candidate) => candidate.source_key === sourceKey && candidate.visual_scope === "CASE_SCENARIO");
    assert.ok(record);
    assert.deepEqual(record.eligible_approved_analysis_refs, expected);
    assert.deepEqual(record.selected_impact_path_ids, [approvedCaseIds[sourceKey]]);
    assert.deepEqual(record.source_statement_refs, [approvedCaseIds[sourceKey]]);
    assert.equal(record.object_id, approvedCaseIds[sourceKey]);
    assert.equal(record.case_analysis_binding?.selected_case_id, approvedCaseIds[sourceKey]);
    assert.equal(record.case_analysis_binding?.approval_provenance.approval_basis, "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26");
    assert.equal(record.case_analysis_binding?.approval_provenance.human_individual_record_review_claimed, false);
    assert.equal(record.case_analysis_binding?.editorial_input_status.image_asset, "SUPPLIED");
    assert.equal(record.case_analysis_binding?.editorial_input_status.final_image_signoff, "APPROVED");
  }
});

test("AfD uses the approved null marker while the other five defer marker placement to the real asset", () => {
  const cases = saxonyAnhaltImpactVisualDescriptor.records.filter((record) => record.visual_scope === "CASE_SCENARIO");
  for (const record of cases) {
    assert.equal(
      record.case_analysis_binding?.marker_decision,
      record.source_key === "ltw-2026-st-afd" ? "NULL_MARKER_APPROVED" : "ALLOWED_IF_CANONICAL_PATH_BINDING_PASSES",
    );
  }
});
