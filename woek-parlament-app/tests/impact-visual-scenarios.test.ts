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

test("six programmes have symmetric fail-closed programme and case records", () => {
  assert.equal(saxonyAnhaltImpactVisualDescriptor.records.length, 12);
  for (const sourceKey of expectedSourceKeys) {
    const records = saxonyAnhaltImpactVisualDescriptor.records.filter((record) => record.source_key === sourceKey);
    assert.deepEqual(records.map((record) => record.visual_scope).sort(), ["CASE_SCENARIO", "PROGRAM_SCENARIO"]);
    assert.ok(records.every((record) => record.editorial_review_status === "NO_APPROVED_VISUAL_SCENARIO"));
    assert.ok(records.every((record) => record.asset_path === null && record.visible_elements.length === 0));
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
