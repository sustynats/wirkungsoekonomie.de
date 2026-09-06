#!/usr/bin/env node
// Read-only publication check. A provider/OCR success is not visual approval.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { inspectImage } from "../../news/title-image/image-file.mjs";
import { digest } from "../../news/title-image/policy.mjs";
import { buildReferenceScenePrompt, validateReferenceSceneContract, validateContractAgainstDescriptor } from "./reference-scene-contract.mjs";

const ROOT = path.resolve(import.meta.dirname, "../../..");
export const AUDIT_PATH = "docs/audits/parliament-reference-scene-visual-qa-2026-09-06.json";
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const same = (actual, expected, code) => assert.deepEqual(actual, expected, code);

export function evaluateReferenceSceneCandidates({ contract, descriptor, results, audit, assetDirectory }) {
  validateReferenceSceneContract(contract);
  validateContractAgainstDescriptor(contract, descriptor);
  same(results.schema_version, "woek-parliament-reference-scene-results-1.0", "RESULT_SCHEMA");
  same(audit.schema_version, "woek-parliament-reference-scene-visual-qa-1.0", "QA_SCHEMA");
  same(results.set_id, contract.set_id, "RESULT_SET");
  same(audit.set_id, contract.set_id, "QA_SET");
  same(results.contract_sha256, contract.contract_sha256, "RESULT_CONTRACT");
  same(audit.contract_sha256, contract.contract_sha256, "QA_CONTRACT");
  assert.match(results.source_commit, /^[a-f0-9]{40}$/, "SOURCE_COMMIT");
  same(audit.source_commit, results.source_commit, "QA_COMMIT");
  same(results.source_descriptor_manifest_sha256, descriptor.manifest_sha256, "RESULT_SOURCE_DESCRIPTOR");
  same(results.publication_status, "CANDIDATE_FAIL_CLOSED_PENDING_ASSET_SOURCE_FIDELITY_AND_VISUAL_QA", "GENERATION_IS_NOT_APPROVAL");
  same(audit.review.method, "ALL_SEVEN_ORIGINAL_IMAGES_INSPECTED", "QA_FULL_SET_REQUIRED");
  const items = [contract.base, ...contract.variants];
  const ids = items.map((item) => item.item_id).sort();
  same(results.outputs.map((item) => item.item_id).sort(), ids, "RESULT_EXACT_SET");
  same(audit.outputs.map((item) => item.item_id).sort(), ids, "QA_EXACT_SET");
  same(results.generation_count, results.outputs.filter((item) => !item.reused).length, "GENERATION_COUNT");
  assert.ok(results.generation_count <= contract.generation.max_new_images, "GENERATION_LIMIT");
  const base = results.outputs.find((item) => item.item_id === contract.base.item_id);
  same(results.common_reference_sha256, base.sha256, "COMMON_REFERENCE");
  const blockers = [];
  for (const item of items) {
    const output = results.outputs.find((candidate) => candidate.item_id === item.item_id);
    const qa = audit.outputs.find((candidate) => candidate.item_id === item.item_id);
    const isBase = item.item_id === contract.base.item_id;
    assert.match(output.sha256, /^[a-f0-9]{64}$/, "ASSET_SHA");
    same(output.filename, item.output_filename, "ASSET_FILENAME");
    same(path.basename(output.filename), output.filename, "ASSET_PATH");
    same(output.kind, isBase ? "BASE" : "PROGRAMME_VARIANT", "ASSET_KIND");
    same(output.provider, contract.generation.provider, "PROVIDER");
    same(output.model, contract.generation.model, "MODEL");
    same(output.prompt_sha256, digest(buildReferenceScenePrompt(contract, item.item_id)), "PROMPT_BINDING");
    same(output.reference_sha256, isBase ? null : base.sha256, "REFERENCE_BINDING");
    same(output.source_key, item.source_key || null, "SOURCE_KEY");
    same(output.selected_impact_path_ids, item.selected_impact_path_ids || [], "FACH_PATH_BINDING");
    same(output.not_depicted_as_fact, item.not_depicted_as_fact || [], "OPEN_PATH_GUARDS");
    same(qa.sha256, output.sha256, "QA_ASSET_HASH");
    assert.ok(typeof qa.observation === "string" && qa.observation.trim().length > 20, "EXACT_VISUAL_OBSERVATION_REQUIRED");
    for (const key of ["text_free", "same_scene", "no_people_or_campaign_symbols", "no_unapproved_outcome_depiction"]) {
      const allowed = key === "same_scene" && isBase ? ["NOT_APPLICABLE"] : ["PASS", "FAIL"];
      assert.ok(allowed.includes(qa[key]), `QA_STATUS_${key}`);
      if (qa[key] === "FAIL") blockers.push({ item_id: item.item_id, gate: key, reason: qa.observation });
    }
    if (assetDirectory) {
      const actual = inspectImage(fs.readFileSync(path.join(assetDirectory, output.filename)));
      for (const key of ["sha256", "byte_length", "width", "height", "mime"]) same(actual[key], output[key], `BYTES_${key}`);
    }
  }
  same(audit.publication_status, blockers.length ? "REJECTED_SET_VISUAL_QA" : "PASS_ASSET_AND_SOURCE_FIDELITY_QA", "QA_RESULT_CONSISTENCY");
  return { gate: "PARLIAMENT_REFERENCE_SCENE_PUBLICATION", publication_allowed: blockers.length === 0, outputs: items.length, blockers, asset_bytes_verified: Boolean(assetDirectory) };
}

export function checkReferenceSceneAudit({ root = ROOT, assetDirectory } = {}) {
  const audit = read(path.join(root, AUDIT_PATH));
  const results = read(path.join(root, audit.results_path));
  const contract = read(path.join(root, results.contract_path));
  const descriptor = read(path.join(root, contract.source_descriptor_path));
  const result = evaluateReferenceSceneCandidates({ contract, descriptor, results, audit, assetDirectory });
  // Keep rejected candidates out of the public tree, including renamed copies.
  const publicDirectory = path.join(root, "woek-parlament-app/public/visuals/impact-scenarios");
  if (!result.publication_allowed && fs.existsSync(publicDirectory)) {
    const denied = new Set(results.outputs.map((item) => item.sha256));
    for (const file of fs.readdirSync(publicDirectory, { recursive: true })) {
      const fullPath = path.join(publicDirectory, file);
      if (fs.statSync(fullPath).isFile()) assert.ok(!denied.has(digest(fs.readFileSync(fullPath))), "REJECTED_CANDIDATE_IN_PUBLIC_TREE");
    }
  }
  return result;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const index = process.argv.indexOf("--assets");
  if (index >= 0) assert.ok(process.argv[index + 1] && !process.argv[index + 1].startsWith("--"), "ASSET_DIRECTORY_REQUIRED");
  const result = checkReferenceSceneAudit({ assetDirectory: index < 0 ? undefined : process.argv[index + 1] });
  console.log(JSON.stringify(result, null, 2));
  // Audit CI proves correct rejection; normal publication invocation stays red.
  if (process.argv.includes("--expect-rejected")) assert.equal(result.publication_allowed, false, "EXPECTED_REJECTION_DRIFT");
  else if (!result.publication_allowed) process.exitCode = 1;
  else assert.ok(result.asset_bytes_verified, "PUBLICATION_REQUIRES_VERIFIED_ASSET_BYTES");
}
