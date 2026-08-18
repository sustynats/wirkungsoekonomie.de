import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

const reviewProviderNames = ["chat" + "gpt", "cla" + "ude", "open" + "ai", "anth" + "ropic", "co" + "pilot"].join("|");

const forbidden = [
  /(?:^|["'\s])\/(?:Users|home)\/[A-Za-z0-9._-]+(?:\/|$)/i,
  /\/(?:tmp|private|var\/folders)\//i,
  /file:\/\/(?:\/|localhost)/i,
  new RegExp(reviewProviderNames, "i"),
  /(?:api[_-]?key|authorization|bearer|service[_-]?role|webhook[_-]?url)\s*[:=]/i
];

function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value;
}

function array(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value;
}

function string(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string.`);
  return value;
}

function safe(value, label) {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  if (forbidden.some((expression) => expression.test(serialized))) throw new Error(`${label} failed the publication-safety gate.`);
}

function rootPrefix(zip) {
  const roots = new Set(Object.values(zip.files).filter((entry) => !entry.dir).map((entry) => entry.name.split("/")[0]).filter(Boolean));
  return roots.size === 1 ? `${[...roots][0]}/` : "";
}

function logicalName(entry, prefix) {
  return prefix && entry.name.startsWith(prefix) ? entry.name.slice(prefix.length) : entry.name;
}

function files(zip, prefix, expression) {
  return Object.values(zip.files).filter((entry) => !entry.dir && expression.test(logicalName(entry, prefix)));
}

function required(zip, prefix, filename) {
  const entry = zip.file(`${prefix}${filename}`);
  if (!entry) throw new Error(`Missing ${filename}.`);
  return entry;
}

async function json(entry) {
  return JSON.parse(await entry.async("string"));
}

function date(value, label) {
  const parsed = new Date(string(value, label));
  if (Number.isNaN(parsed.getTime())) throw new Error(`${label} is not a valid timestamp.`);
}

function uuid(value, label) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(string(value, label))) {
    throw new Error(`${label} is not a UUID.`);
  }
}

function reviewIsValid(review, index) {
  const label = `review ${index + 1}`;
  const candidate = object(review, label);
  safe(candidate, label);
  uuid(candidate.case_id, `${label}.case_id`);
  string(candidate.review_id, `${label}.review_id`);
  if (!/^[a-f0-9]{64}$/i.test(string(candidate.input_package_hash, `${label}.input_package_hash`))) throw new Error(`${label}.input_package_hash is invalid.`);
  date(candidate.generated_at, `${label}.generated_at`);
  if (!["FULL_REVIEW", "INCREMENTAL_REVIEW", "EXCEPTION_REVIEW"].includes(candidate.review_type)) throw new Error(`${label}.review_type is invalid.`);
  if (!["COMPLETE", "DATA_GAP", "SOURCE_CONFLICT", "METHOD_REVIEW_REQUIRED", "PARTIAL"].includes(candidate.review_status)) throw new Error(`${label}.review_status is invalid.`);
  for (const key of ["impact_paths", "impact_domains", "calculation_requirements", "risks", "data_gaps", "counterfactuals", "cross_case_links"]) array(candidate[key], `${label}.${key}`);
  const provenance = object(candidate.provenance, `${label}.provenance`);
  array(provenance.source_refs_used, `${label}.provenance.source_refs_used`);
  date(provenance.review_generated_at, `${label}.provenance.review_generated_at`);
  const mapping = object(candidate.normative_mapping, `${label}.normative_mapping`);
  for (const tile of array(mapping.tile_mappings, `${label}.normative_mapping.tile_mappings`)) {
    const item = object(tile, `${label}.normative_mapping.tile`);
    string(item.id, `${label}.normative_mapping.tile.id`);
    array(item.source_refs, `${label}.normative_mapping.tile.source_refs`);
  }
  return candidate.review_id;
}

function registerIsValid(register, index) {
  const label = `commitment register ${index + 1}`;
  const candidate = object(register, label);
  safe(candidate, label);
  string(candidate.source_key, `${label}.source_key`);
  if (!/^[a-f0-9]{64}$/i.test(string(candidate.source_sha256 ?? candidate.source_hash, `${label}.source hash`))) throw new Error(`${label} has no valid source hash.`);
  for (const commitment of array(candidate.commitments, `${label}.commitments`)) {
    const entry = object(commitment, `${label}.commitment`);
    string(entry.commitment_key, `${label}.commitment_key`);
    string(entry.exact_text ?? entry.commitment_text, `${label}.commitment text`);
  }
  return candidate.source_key;
}

async function main() {
  const argument = process.argv.find((item) => item.startsWith("--input="));
  if (!argument) throw new Error("Usage: node scripts/quality/validate-final-release-delivery.mjs --input=/path/to/release.zip");
  const input = path.resolve(argument.slice("--input=".length));
  const raw = await readFile(input);
  if (raw.byteLength === 0 || raw.byteLength > 60 * 1024 * 1024) throw new Error("Release archive has an invalid size.");
  const zip = await JSZip.loadAsync(raw);
  if (Object.values(zip.files).some((entry) => entry.name.startsWith("/") || entry.name.split("/").includes(".."))) throw new Error("Release archive contains an unsafe entry.");
  const prefix = rootPrefix(zip);
  const report = await required(zip, prefix, "RELEASE-REPORT.md").async("string");
  if (report.trim().length < 200) throw new Error("Release report is too short.");
  safe(report, "release report");
  const summary = object(await json(required(zip, prefix, "release-summary.json")), "release summary");
  safe(summary, "release summary");
  if (summary.publisher !== "Institut für Wirkungsökonomie") throw new Error("Release summary publisher is invalid.");
  object(summary.coverage, "release summary.coverage");
  object(summary.reference_snapshot, "release summary.reference_snapshot");
  for (const key of ["methodology_notes", "source_conflicts", "data_gaps", "public_key_messages", "next_verifiable_steps"]) array(summary[key], `release summary.${key}`);

  const reviews = await Promise.all(files(zip, prefix, /(^|\/)review-result\.json$/i).map(json));
  if (reviews.length !== 28) throw new Error(`Expected 28 review results, found ${reviews.length}.`);
  const reviewIds = reviews.map(reviewIsValid);
  if (new Set(reviewIds).size !== reviewIds.length) throw new Error("Review IDs must be unique.");

  const registers = await Promise.all(files(zip, prefix, /^commitment-registers\/[^/]+\/commitment-register\.json$/i).map(json));
  if (registers.length !== 7) throw new Error(`Expected 7 commitment registers, found ${registers.length}.`);
  const keys = registers.map(registerIsValid);
  if (new Set(keys).size !== keys.length) throw new Error("Commitment source keys must be unique.");

  const linksPayload = await json(required(zip, prefix, "commitment-links.json"));
  safe(linksPayload, "commitment links");
  const links = Array.isArray(linksPayload) ? linksPayload : array(object(linksPayload, "commitment links").links, "commitment links.links");
  if (links.length > 2_000) throw new Error("Too many commitment links.");
  for (const link of links) {
    const item = object(link, "commitment link");
    string(item.commitment_key, "commitment link.commitment_key");
    if (item.case_id !== null) uuid(item.case_id, "commitment link.case_id");
    string(item.relationship_status, "commitment link.relationship_status");
  }

  const targets = object(await json(required(zip, prefix, "state-target-register.json")), "state target register");
  safe(targets, "state target register");
  if (targets.jurisdiction_id !== "sachsen-anhalt") throw new Error("State target register jurisdiction is invalid.");
  if (array(targets.targets, "state target register.targets").length !== 28) throw new Error("Expected 28 Saxony-Anhalt targets.");

  console.log(JSON.stringify({
    archive: path.basename(input), status: "VALID", layout: prefix ? "SINGLE_TOP_LEVEL_DIRECTORY" : "ROOT_FILES",
    manifest: zip.file(`${prefix}manifest.json`) ? "SUPPLIED" : "DERIVED_AT_PROTECTED_IMPORT",
    reviews: reviews.length, commitmentRegisters: registers.length, commitmentLinks: links.length, stateTargets: targets.targets.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Final delivery validation failed.");
  process.exit(1);
});
