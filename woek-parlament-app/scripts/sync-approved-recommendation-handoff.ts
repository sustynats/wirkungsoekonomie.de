#!/usr/bin/env tsx

import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  assertRecommendationHandoffRecord,
  CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS,
  ZIP_IS_NOT_CANONICAL_SOURCE,
} from "../lib/recommendation-backfill";

type JsonObject = Record<string, unknown>;

function fail(message: string): never { throw new Error(message); }
function sha256(value: Buffer | string) { return createHash("sha256").update(value).digest("hex"); }
function lines(value: Buffer | string) { return value.toString().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as JsonObject); }
function arg(name: string) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined; }

function assertBelowRoot(candidate: string, root: string) {
  const resolved = path.resolve(candidate);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) fail(`Path must stay below the canonical /WOEK mirror: ${resolved}`);
  return resolved;
}

function assertNoLocalPath(value: unknown, context = "record") {
  if (typeof value === "string" && (/^\/tmp\//.test(value) || /^\/Users\//.test(value) || /^file:\/\//.test(value))) {
    fail(`Local path is forbidden in ${context}: ${value}`);
  }
  if (Array.isArray(value)) value.forEach((item, index) => assertNoLocalPath(item, `${context}[${index}]`));
  else if (value && typeof value === "object") Object.entries(value as JsonObject).forEach(([key, item]) => assertNoLocalPath(item, `${context}.${key}`));
}

function replaceJsonlAtomically(file: string, records: JsonObject[]) {
  const temporary = `${file}.tmp-${process.pid}`;
  writeFileSync(temporary, records.length ? `${records.map((record) => JSON.stringify(record)).join("\n")}\n` : "");
  renameSync(temporary, file);
}

function replaceJsonAtomically(file: string, value: unknown) {
  const temporary = `${file}.tmp-${process.pid}`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, file);
}

function contentHash(record: JsonObject) { return sha256(JSON.stringify(record)); }

async function main() {
  if (!CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS) fail("Recommendation generation invariant is disabled.");
  if (!ZIP_IS_NOT_CANONICAL_SOURCE) fail("ZIP interface invariant is disabled.");
  const localRoot = path.resolve(process.env.WOEK_CANONICAL_LOCAL_ROOT ?? "");
  if (!localRoot || path.basename(localRoot) !== "WOEK") fail("WOEK_CANONICAL_LOCAL_ROOT must point to the local /WOEK mirror.");

  const jsonlPath = assertBelowRoot(arg("--jsonl") ?? fail("--jsonl is required"), localRoot);
  const handoffPath = assertBelowRoot(arg("--handoff") ?? fail("--handoff is required"), localRoot);
  const ledgerPath = assertBelowRoot(arg("--ledger") ?? path.join(localRoot, "WOEK-AUTOPILOT", "LEDGERS", "RECOMMENDATION-BACKFILL-LEDGER.json"), localRoot);
  for (const file of [jsonlPath, handoffPath, ledgerPath]) if (!existsSync(file)) fail(`Required canonical input is missing: ${file}`);

  const jsonlBytes = readFileSync(jsonlPath);
  const records = lines(jsonlBytes);
  const handoff = JSON.parse(readFileSync(handoffPath, "utf8")) as JsonObject;
  const ledger = JSON.parse(readFileSync(ledgerPath, "utf8")) as { canonical_root: string; records: JsonObject[] };
  assertNoLocalPath(records);
  assertNoLocalPath(handoff, "handoff");

  if (handoff.canonical_root !== "/WOEK" || ledger.canonical_root !== "/WOEK") fail("Canonical root must be exactly /WOEK.");
  if (handoff.batch_status !== "COMPLETED_APPROVED_CANONICAL" || handoff.schema_validation_status !== "PASS") fail("Handoff is not approved and schema-valid.");
  if (handoff.schema_valid_count !== records.length || handoff.schema_invalid_count !== 0) fail("Handoff schema counts do not match the JSONL.");
  if (handoff.transport_zip_required !== false) fail("ZIP must remain optional.");

  const recommendationIds = records.map((record) => String(record.recommendation_id));
  const impactCaseIds = records.map((record) => String(record.impact_case_id));
  if (new Set(recommendationIds).size !== records.length || new Set(impactCaseIds).size !== records.length) fail("Recommendation and ImpactCase IDs must be unique in the handoff.");
  const approved = Array.isArray(handoff.APPROVED_RECOMMENDATIONS) ? handoff.APPROVED_RECOMMENDATIONS.map(String) : [];
  const approvedImpacts = Array.isArray(handoff.impact_case_ids) ? handoff.impact_case_ids.map(String) : [];
  if (approved.length !== records.length || recommendationIds.some((id) => !approved.includes(id))) fail("Approved Recommendation IDs do not match the JSONL.");
  if (approvedImpacts.length !== records.length || impactCaseIds.some((id) => !approvedImpacts.includes(id))) fail("Approved ImpactCase IDs do not match the JSONL.");
  const verifiedHash = (handoff.canonical_jsonl_verification as JsonObject | undefined)?.sha256;
  if (verifiedHash !== sha256(jsonlBytes)) fail("Canonical JSONL SHA-256 does not match the fach handoff.");

  const contracts = path.resolve("data/autopilot/contracts");
  const optionSchema = JSON.parse(readFileSync(path.join(contracts, "option-set.schema.json"), "utf8"));
  const recommendationSchema = JSON.parse(readFileSync(path.join(contracts, "recommendation-record.schema.json"), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(optionSchema);
  ajv.addSchema(recommendationSchema);
  const validate = ajv.getSchema(recommendationSchema.$id) ?? fail("Recommendation schema was not registered.");
  records.forEach((record) => {
    assertRecommendationHandoffRecord(record);
    if (!validate(record)) fail(`Recommendation schema failed for ${String(record.recommendation_id)}: ${JSON.stringify(validate.errors)}`);
  });

  const completed = ledger.records.filter((entry) => entry.status === "COMPLETED_APPROVED");
  for (const record of records) {
    const matching = completed.find((entry) => entry.impact_case_id === record.impact_case_id
      && entry.recommendation_id === record.recommendation_id
      && entry.recommendation_version === record.recommendation_version);
    if (!matching) fail(`Ledger does not confirm COMPLETED_APPROVED for ${String(record.recommendation_id)}.`);
  }

  const publicPath = path.resolve("data/recommendations/public/recommendations.jsonl");
  const historyPath = path.resolve("data/recommendations/history/recommendation-versions.jsonl");
  const current = lines(readFileSync(publicPath));
  const history = lines(readFileSync(historyPath));
  const next = [...current];
  const nextHistory = [...history];
  const dispositions: Array<{ recommendation_id: string; status: string }> = [];
  for (const record of records) {
    const exact = next.find((entry) => entry.recommendation_id === record.recommendation_id && entry.recommendation_version === record.recommendation_version);
    if (exact) {
      if (contentHash(exact) !== contentHash(record)) fail(`Existing RecommendationVersion has conflicting content: ${String(record.recommendation_id)}`);
      dispositions.push({ recommendation_id: String(record.recommendation_id), status: "IDEMPOTENT" });
      continue;
    }
    const currentIndex = next.findIndex((entry) => entry.impact_case_id === record.impact_case_id);
    if (currentIndex >= 0) {
      const previous = next[currentIndex];
      if (record.supersedes_recommendation_version !== previous.recommendation_version) fail(`Supersession mismatch for ${String(record.impact_case_id)}`);
      if (!nextHistory.some((entry) => entry.recommendation_id === previous.recommendation_id && entry.recommendation_version === previous.recommendation_version)) nextHistory.push(previous);
      next[currentIndex] = record;
      dispositions.push({ recommendation_id: String(record.recommendation_id), status: "NEW_VERSION_IMPORTED" });
    } else {
      next.push(record);
      dispositions.push({ recommendation_id: String(record.recommendation_id), status: "IMPORTED" });
    }
  }
  replaceJsonlAtomically(publicPath, next);
  replaceJsonlAtomically(historyPath, nextHistory);

  const report = {
    schema_version: "woek-recommendation-canonical-sync-2.3",
    generated_at: new Date().toISOString(),
    canonical_root: "/WOEK",
    source_jsonl: `/WOEK/${path.relative(localRoot, jsonlPath)}`,
    source_handoff: `/WOEK/${path.relative(localRoot, handoffPath)}`,
    source_sha256: sha256(jsonlBytes),
    recommendation_schema_valid: `${records.length}/${records.length}`,
    imported_or_idempotent: `${records.length}/${records.length}`,
    public_recommendation_count: next.length,
    ledger_completed_count: completed.length,
    ledger_remaining_backlog_count: Number((handoff.ledger_commit as JsonObject | undefined)?.remaining_backlog_count ?? NaN),
    dispositions,
    CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS,
    ZIP_IS_NOT_CANONICAL_SOURCE,
    NO_HISTORY_OVERWRITTEN: true,
    production_impact: "NONE_STAGING_ONLY",
  };
  replaceJsonAtomically(path.resolve("data/autopilot/audit/2.3-remediated/RECOMMENDATION-LATEST-IMPORT-2.3.json"), report);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
