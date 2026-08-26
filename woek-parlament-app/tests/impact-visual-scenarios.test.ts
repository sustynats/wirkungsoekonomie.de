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

test("all Sachsen-Anhalt impact visual governance gates pass", () => {
  const results = evaluateImpactVisualGates({ descriptor: saxonyAnhaltImpactVisualDescriptor, expectedSourceKeys, approvedAnalysisRefs, stylesheet });
  assert.deepEqual(results.filter((result) => !result.pass), []);
});

test("six programmes have approved programme visuals and symmetric fail-closed case records", () => {
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
    assert.equal(caseRecord.editorial_review_status, "NO_APPROVED_VISUAL_SCENARIO");
    assert.equal(caseRecord.asset_path, null);
    assert.equal(caseRecord.visible_elements.length, 0);
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

test("case slots name the finite candidates without choosing a case", () => {
  for (const sourceKey of expectedSourceKeys) {
    const expected = Object.keys(saxonyAnhaltProgrammeEditorial(sourceKey)?.centralAssessments ?? {});
    const record = saxonyAnhaltImpactVisualDescriptor.records.find((candidate) => candidate.source_key === sourceKey && candidate.visual_scope === "CASE_SCENARIO");
    assert.ok(record);
    assert.deepEqual(record.eligible_approved_analysis_refs, expected);
    assert.deepEqual(record.selected_impact_path_ids, []);
    assert.ok(record.missing_approved_inputs.some((input) => input.code === "APPROVED_CASE_SELECTION"));
  }
});
