#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { inspectImage } from "../../news/title-image/image-file.mjs";
import { IMAGE_CONFIG as C, digest, imageError } from "../../news/title-image/policy.mjs";
import {
  buildReferenceScenePrompt,
  referenceSceneItem,
  validateContractAgainstDescriptor,
  validateGenerationRequest,
  validateReferenceSceneContract,
} from "./reference-scene-contract.mjs";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const DEFAULT_CONTRACT = "woek-parlament-app/data/impact-visuals/sachsen-anhalt-2026-reference-scene-v1.json";

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { throw imageError("REFERENCE_SCENE_LOCAL_INPUT_INVALID"); }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function assertExactCleanCommit({ root = ROOT, commit }) {
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const status = execFileSync("git", ["status", "--short"], { cwd: root, encoding: "utf8" });
  if (head !== commit) throw imageError("REFERENCE_SCENE_HEAD_MISMATCH");
  if (status.trim()) throw imageError("REFERENCE_SCENE_WORKTREE_NOT_CLEAN");
}

export async function requestReferenceSceneItem(request, { endpoint, token, fetchImpl = fetch } = {}) {
  validateGenerationRequest(request);
  if (!endpoint || !token) throw imageError("REFERENCE_SCENE_ORACLE_NOT_CONFIGURED");
  const url = new URL(endpoint);
  if (url.protocol !== "https:" || url.username || url.password) throw imageError("REFERENCE_SCENE_ORACLE_ENDPOINT_INVALID");
  const response = await fetchImpl(url, {
    method: "POST",
    redirect: "error",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(C.generation_timeout_ms + 60_000),
  });
  if (!response.ok) throw imageError(response.status === 403 ? "HIGGSFIELD_AUTH_UNAVAILABLE" : response.status === 429 ? "HIGGSFIELD_RATE_LIMIT" : "REFERENCE_SCENE_ORACLE_UNAVAILABLE");
  const text = await response.text();
  if (Buffer.byteLength(text) > C.max_image_bytes * 1.5) throw imageError("IMAGE_SIZE_INVALID");
  let result;
  try { result = JSON.parse(text); }
  catch { throw imageError("HIGGSFIELD_INVALID_JSON"); }
  if (!result.ok || typeof result.image_base64 !== "string") throw imageError(/^[A-Z][A-Z0-9_]{2,90}$/.test(result.reason || "") ? result.reason : "HIGGSFIELD_GENERATION_FAILED");
  const bytes = Buffer.from(result.image_base64, "base64");
  const info = inspectImage(bytes);
  if (info.sha256 !== result.sha256 || result.model !== C.model || result.item_id !== request.item_id || result.contract_sha256 !== request.contract_sha256 || result.source_commit !== request.commit_sha) throw imageError("REFERENCE_SCENE_RESULT_BINDING_INVALID");
  return { ...result, ...info, bytes };
}

export async function generateReferenceSceneSet({
  root = ROOT,
  commit,
  contractPath = DEFAULT_CONTRACT,
  outputDirectory,
  endpoint = process.env.WOEK_PARLIAMENT_VISUAL_API_URL,
  token = process.env.WOEK_NEWS_ANALYSIS_TOKEN,
  fetchImpl = fetch,
  execute = false,
  verifyGit = true,
} = {}) {
  const contractFile = path.join(root, contractPath);
  const contract = validateReferenceSceneContract(readJson(contractFile));
  const descriptor = readJson(path.join(root, contract.source_descriptor_path));
  validateContractAgainstDescriptor(contract, descriptor);
  const requestedCommit = commit || execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  if (verifyGit) assertExactCleanCommit({ root, commit: requestedCommit });
  const items = [contract.base.item_id, ...contract.variants.map((item) => item.item_id)];
  const plan = items.map((itemId) => ({
    item_id: itemId,
    kind: referenceSceneItem(contract, itemId).kind,
    prompt_sha256: digest(buildReferenceScenePrompt(contract, itemId)),
  }));
  if (!execute) return { mode: "DRY_RUN", commit: requestedCommit, contract_sha256: contract.contract_sha256, max_new_images: contract.generation.max_new_images, plan };
  if (!outputDirectory) throw imageError("REFERENCE_SCENE_OUTPUT_DIRECTORY_REQUIRED");
  const output = path.resolve(outputDirectory);
  fs.mkdirSync(output, { recursive: true });
  const results = [];
  let baseSha256 = null;
  for (const entry of plan) {
    const request = { commit_sha: requestedCommit, contract_path: contractPath, contract_sha256: contract.contract_sha256, item_id: entry.item_id };
    const result = await requestReferenceSceneItem(request, { endpoint, token, fetchImpl });
    if (entry.kind === "BASE") baseSha256 = result.sha256;
    else if (!baseSha256 || result.reference_sha256 !== baseSha256) throw imageError("REFERENCE_SCENE_REFERENCE_BINDING_INVALID");
    const variant = contract.variants.find((item) => item.item_id === entry.item_id);
    const filename = variant?.output_filename || contract.base.output_filename;
    fs.writeFileSync(path.join(output, filename), result.bytes);
    results.push({
      item_id: entry.item_id,
      kind: entry.kind,
      filename,
      sha256: result.sha256,
      byte_length: result.byte_length,
      width: result.width,
      height: result.height,
      mime: result.mime,
      reference_sha256: result.reference_sha256 || null,
      provider: result.provider,
      model: result.model,
      job_id: result.job_id,
      prompt_version: result.prompt_version,
      prompt_sha256: entry.prompt_sha256,
      generated_at: result.generated_at,
      reused: Boolean(result.reused),
      source_key: variant?.source_key || null,
      selected_impact_path_ids: variant?.selected_impact_path_ids || [],
      not_depicted_as_fact: variant?.not_depicted_as_fact || [],
    });
  }
  const manifest = {
    schema_version: "woek-parliament-reference-scene-results-1.0",
    set_id: contract.set_id,
    source_commit: requestedCommit,
    contract_path: contractPath,
    contract_sha256: contract.contract_sha256,
    source_descriptor_manifest_sha256: contract.source_descriptor_manifest_sha256,
    common_reference_sha256: baseSha256,
    generation_count: results.filter((result) => !result.reused).length,
    outputs: results,
    publication_status: "CANDIDATE_FAIL_CLOSED_PENDING_ASSET_SOURCE_FIDELITY_AND_VISUAL_QA",
  };
  writeJson(path.join(output, "reference-scene-results.json"), manifest);
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await generateReferenceSceneSet({
    commit: argument("commit"),
    contractPath: argument("contract") || DEFAULT_CONTRACT,
    outputDirectory: argument("output"),
    endpoint: argument("endpoint") || process.env.WOEK_PARLIAMENT_VISUAL_API_URL,
    execute: process.argv.includes("--execute"),
  });
  console.log(JSON.stringify(result, null, 2));
}
