import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { evaluateReferenceSceneCandidates, checkReferenceSceneAudit } from "../../scripts/parliament/impact-visuals/check-reference-scene-candidates.mjs";
const read = (file) => JSON.parse(fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8"));
const audit = read("docs/audits/parliament-reference-scene-visual-qa-2026-09-06.json");
const results = read(audit.results_path);
const contract = read(results.contract_path);
const descriptor = read(contract.source_descriptor_path);
const input = () => structuredClone({ contract, descriptor, results, audit });

test("all seven exact candidates are inventoried and the observed text failures reject the whole set", () => {
  const result = checkReferenceSceneAudit();
  assert.equal(result.outputs, 7);
  assert.equal(result.publication_allowed, false);
  assert.deepEqual(result.blockers.map((item) => item.item_id.split("-").at(-1)), ["base", "cdu", "gruene"]);
});
test("successful generation or OCR cannot replace visual QA or permit a partial set", () => {
  for (const mutation of [
    (x) => { x.audit.outputs.pop(); },
    (x) => { x.results.outputs.pop(); },
    (x) => { x.audit.publication_status = "PASS_ASSET_AND_SOURCE_FIDELITY_QA"; },
    (x) => { x.audit.review.method = "OCR_ONLY"; },
    (x) => { x.audit.outputs[0].text_free = "PASS"; x.audit.outputs[1].text_free = "PASS"; x.audit.outputs[3].text_free = "PASS"; },
  ]) { const value = input(); mutation(value); assert.throws(() => evaluateReferenceSceneCandidates(value)); }
});
test("QA cannot be reused for different bytes, source commits, prompts, provider, filenames or Fach", () => {
  for (const mutation of [
    (x) => { x.audit.outputs[0].sha256 = "a".repeat(64); },
    (x) => { x.audit.source_commit = "a".repeat(40); },
    (x) => { x.results.outputs[1].prompt_sha256 = "a".repeat(64); },
    (x) => { x.results.outputs[1].reference_sha256 = "a".repeat(64); },
    (x) => { x.results.outputs[1].provider = "other"; },
    (x) => { x.results.outputs[1].filename = "../escape.png"; },
    (x) => { x.results.outputs[1].selected_impact_path_ids.pop(); },
    (x) => { x.results.outputs[1].not_depicted_as_fact = []; },
    (x) => { x.results.generation_count = 8; },
    (x) => { x.audit.outputs[2] = x.audit.outputs[1]; },
    (x) => { x.audit.outputs[0].observation = ""; },
  ]) { const value = input(); mutation(value); assert.throws(() => evaluateReferenceSceneCandidates(value)); }
});
