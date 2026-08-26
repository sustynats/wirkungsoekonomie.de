import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("six programmes keep approved visuals and six cases are prepared without publishing an asset", () => {
  assert.equal(saxonyAnhaltImpactVisualDescriptor.records.length, 12);
  for (const sourceKey of expectedSourceKeys) {
    const records = saxonyAnhaltImpactVisualDescriptor.records.filter((record) => record.source_key === sourceKey);
    assert.deepEqual(records.map((record) => record.visual_scope).sort(), ["CASE_SCENARIO", "PROGRAM_SCENARIO"]);
    const programme = records.find((record) => record.visual_scope === "PROGRAM_SCENARIO");
    const caseRecord = records.find((record) => record.visual_scope === "CASE_SCENARIO");
    assert.ok(programme && caseRecord);
    assert.equal(programme.editorial_review_status, "APPROVED_FOR_PUBLICATION");
    assert.equal(programme.source_fidelity_status, "PASS_APPROVED_ANALYSIS_ONLY");
    assert.ok(programme.asset_path?.endsWith("-program-scenario-v1.webp"));
    assert.ok(programme.alt_text?.endsWith("ist keine Prognose."));
    assert.equal(programme.visible_elements.length, 0, "ambiguous visual candidates must remain NO_MARKER");
    assert.ok(programme.omitted_marker_candidates.length > 0);
    assert.equal(programme.non_visual_effects.length, 4);
    assert.equal(caseRecord.editorial_review_status, "PREPARED_AWAITING_ASSET");
    assert.equal(caseRecord.source_fidelity_status, "PASS_APPROVED_ANALYSIS_ONLY_AWAITING_ASSET");
    assert.equal(caseRecord.asset_path, null);
    assert.equal(caseRecord.asset_sha256, null);
    assert.equal(caseRecord.asset_metadata, null);
    assert.equal(caseRecord.visible_elements.length, 0);
    assert.ok(caseRecord.visual_brief);
    assert.ok(caseRecord.alt_text);
    assert.ok(caseRecord.case_analysis_binding);
    assert.equal(caseRecord.non_visual_effects_review_status, "REVIEWED_COMPLETE");
    assert.ok(caseRecord.non_visual_effects.length > 0);
    assert.deepEqual(caseRecord.missing_approved_inputs.map((input) => input.code).sort(), ["FINAL_IMAGE_SIGNOFF", "IMAGE_ASSET"]);
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
    assert.equal(record.case_analysis_binding?.editorial_input_status.image_asset, "NOT_YET_SUPPLIED");
    assert.equal(record.case_analysis_binding?.editorial_input_status.final_image_signoff, "PENDING_ASSET");
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
