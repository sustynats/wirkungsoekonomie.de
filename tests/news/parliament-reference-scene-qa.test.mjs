import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { evaluateReferenceSceneCandidates, checkReferenceSceneAudit } from "../../scripts/parliament/impact-visuals/check-reference-scene-candidates.mjs";
const read = (file) => JSON.parse(fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8"));
const audit = read("docs/audits/parliament-reference-scene-visual-qa-2026-09-06.json");
const results = read(audit.results_path);
const contract = read(results.contract_path);
const descriptor = read(contract.source_descriptor_path);
const input = () => structuredClone({ contract, descriptor, results, audit });

test("pure image QA does not trigger unrelated branch-writing #253 projections", () => {
  const workflow = fs.readFileSync(new URL("../../.github/workflows/state-sustainability-audit.yml", import.meta.url), "utf8");
  assert.ok(workflow.indexOf("- '!scripts/parliament/impact-visuals/**'") > workflow.indexOf("- 'scripts/**'"));
  assert.ok(workflow.includes("- 'tools/check_state_sustainability_architecture.py'"));
  assert.ok(workflow.includes("- 'sitemap.xml'"));
});

test("generation manifest and dated typography correction remain bound to exact evidence", () => {
  for (const [file, sha] of [
    [audit.results_path, "3bcbc24d45369dee6d4697791d5da948f0f419daddb6f71d1187b8228b4d650c"],
    ["docs/audits/parliament-reference-scene-visual-qa-2026-09-06.json", "87f6564029ac898cc6a4320862cc3a4da4ba38959bdb3044e485927df88cf3eb"],
  ]) assert.equal(createHash("sha256").update(fs.readFileSync(new URL(`../../${file}`, import.meta.url))).digest("hex"), sha);

  // The dated correction changes exactly six coordinate-range dashes. Reversing
  // those characters must recover the original reviewed evidence byte for byte.
  const corrected = fs.readFileSync(new URL("../../docs/audits/parliament-reference-scene-visual-qa-2026-09-06.json", import.meta.url), "utf8");
  const ranges = /\b(26-29|57-62|45-51|47-52) %/g;
  assert.equal([...corrected.matchAll(ranges)].length, 6);
  const original = corrected.replace(ranges, value => value.replace("-", "\u2013"));
  const correction = read("assets/data/publication-hygiene-2026-09-06.json").sourceCorrections["docs/audits/parliament-reference-scene-visual-qa-2026-09-06.json"];
  assert.equal(correction.beforeSha256, "f47ab63cada474cbd97b83ae24c1178cead329cee4e9d4b39fdc57e6142804af");
  assert.equal(createHash("sha256").update(original).digest("hex"), correction.beforeSha256);
  assert.equal(createHash("sha256").update(corrected).digest("hex"), correction.afterSha256);
});
test("normal CLI denies publication and audit-only mode cannot disguise a missing asset argument", () => {
  const script = fileURLToPath(new URL("../../scripts/parliament/impact-visuals/check-reference-scene-candidates.mjs", import.meta.url));
  assert.equal(spawnSync(process.execPath, [script]).status, 1);
  assert.equal(spawnSync(process.execPath, [script, "--expect-rejected"]).status, 0);
  assert.equal(spawnSync(process.execPath, [script, "--assets", "--expect-rejected"]).status, 1);
});

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
