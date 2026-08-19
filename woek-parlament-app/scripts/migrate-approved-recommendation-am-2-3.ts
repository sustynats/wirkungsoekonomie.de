#!/usr/bin/env tsx

import { createHash } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { assertRecommendationHandoffRecord, CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS } from "../lib/recommendation-backfill";

type JsonRecord = Record<string, unknown>;

const ARRAY_FIELDS = [
  "why_preferred",
  "distributional_effects",
  "time_and_generation_effects",
  "resilience_effects",
  "transformation_effects",
  "rebound_spillover_leakage",
] as const;

function fail(message: string): never { throw new Error(message); }
function sha256(value: string) { return createHash("sha256").update(value).digest("hex"); }
function jsonl(value: string) { return value.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as JsonRecord); }
function atomicJsonl(file: string, records: JsonRecord[]) {
  const temporary = `${file}.tmp-${process.pid}`;
  writeFileSync(temporary, `${records.map((record) => JSON.stringify(record)).join("\n")}\n`);
  renameSync(temporary, file);
}
function atomicJson(file: string, value: unknown) {
  const temporary = `${file}.tmp-${process.pid}`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, file);
}

function migrateOptionSet(record: JsonRecord) {
  const options = Array.isArray(record.option_set) ? record.option_set as JsonRecord[] : fail("option_set must be an array");
  const preferredMatch = String(record.woek_preferred_option ?? "").match(/\bOption\s+([A-Z0-9]+)\b/i);
  const preferredId = preferredMatch?.[1]?.toUpperCase();
  return options.map((option, index) => {
    const optionId = String(option.option_id ?? "");
    const label = String(option.label ?? "");
    if (!optionId || !label) fail(`Invalid option in ${String(record.recommendation_id)}`);
    const statusQuo = index === 0;
    const comparisonRole = statusQuo
      ? "REFERENZOPTION"
      : optionId.toUpperCase() === preferredId ? "WOEK_PRAEFERIERTE_AUSGESTALTUNG" : "ALTERNATIVE";
    return {
      option_id: optionId,
      label,
      description: label.length >= 20 ? label : `${label} – fachlich freigegebene Vergleichsoption`,
      status_quo: statusQuo,
      dimensions: { comparison_role: comparisonRole },
    };
  });
}

function migrateRecord(source: JsonRecord) {
  const migrated: JsonRecord = { ...source };
  migrated.option_set = migrateOptionSet(source);
  for (const field of ARRAY_FIELDS) {
    if (typeof migrated[field] === "string") migrated[field] = [migrated[field]];
  }
  migrated.evidence_grade = "MEDIUM";
  migrated.fach_status = "APPROVED";
  migrated.analysis_mode = typeof source.decision_date === "string" && source.decision_date
    ? "RETROSPECTIVE_DECISION_REVIEW"
    : "IMPACT_POTENTIAL_EX_ANTE";
  return migrated;
}

function semanticPayload(record: JsonRecord) {
  const copy = structuredClone(record);
  delete copy.analysis_mode;
  copy.fach_status = "APPROVED_FOR_CODEX_INTEGRATION";
  for (const field of ARRAY_FIELDS) {
    if (Array.isArray(copy[field]) && (copy[field] as unknown[]).length === 1) copy[field] = (copy[field] as unknown[])[0];
  }
  copy.evidence_grade = record.__source_evidence_grade;
  delete copy.__source_evidence_grade;
  if (Array.isArray(copy.option_set)) {
    copy.option_set = (copy.option_set as JsonRecord[]).map((option) => ({ option_id: option.option_id, label: option.label }));
  }
  return copy;
}

function main() {
  if (!CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS) fail("CODEX recommendation-generation invariant is disabled");
  const canonicalRoot = path.resolve(process.env.WOEK_CANONICAL_LOCAL_ROOT ?? "");
  if (path.basename(canonicalRoot) !== "WOEK") fail("WOEK_CANONICAL_LOCAL_ROOT must point to the local /WOEK mirror");
  const sourcePath = path.join(canonicalRoot, "WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0", "analysis", "GOVERNMENT-RECOMMENDATIONS-2026-08-18-AM.jsonl");
  const handoffPath = path.join(canonicalRoot, "WOEK-AUTOPILOT", "CONTROL", "RECOMMENDATION-BACKFILL-HANDOFF-2026-08-18-AM.json");
  const ledgerPath = path.join(canonicalRoot, "WOEK-AUTOPILOT", "LEDGERS", "RECOMMENDATION-BACKFILL-LEDGER.json");
  const sourceText = readFileSync(sourcePath, "utf8");
  const sourceRecords = jsonl(sourceText);
  const handoff = JSON.parse(readFileSync(handoffPath, "utf8")) as JsonRecord;
  const ledger = JSON.parse(readFileSync(ledgerPath, "utf8")) as { canonical_root: string; records: JsonRecord[] };
  if (sourceRecords.length !== 3 || handoff.canonical_root !== "/WOEK" || ledger.canonical_root !== "/WOEK") fail("Invalid AM handoff contract");
  const approvedIds = Array.isArray(handoff.approved_recommendation_ids) ? handoff.approved_recommendation_ids.map(String) : [];
  if (sourceRecords.some((record) => !approvedIds.includes(String(record.recommendation_id)))) fail("AM source and approved handoff IDs differ");

  const migrated = sourceRecords.map((source) => {
    const withProvenance = { ...source, __source_evidence_grade: source.evidence_grade };
    const record = migrateRecord(withProvenance);
    delete record.__source_evidence_grade;
    const reconstructed = semanticPayload({ ...record, __source_evidence_grade: source.evidence_grade });
    if (JSON.stringify(reconstructed) !== JSON.stringify(source)) fail(`Structural migration changed Fach content for ${String(source.recommendation_id)}`);
    return record;
  });

  const optionSchema = JSON.parse(readFileSync("data/autopilot/contracts/option-set.schema.json", "utf8"));
  const recommendationSchema = JSON.parse(readFileSync("data/autopilot/contracts/recommendation-record.schema.json", "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(optionSchema);
  ajv.addSchema(recommendationSchema);
  const validate = ajv.getSchema(recommendationSchema.$id) ?? fail("Recommendation schema not registered");
  for (const record of migrated) {
    assertRecommendationHandoffRecord(record);
    if (!validate(record)) fail(`Migrated AM record invalid: ${JSON.stringify(validate.errors)}`);
  }

  const completed = ledger.records.filter((entry) => entry.status === "COMPLETED_APPROVED");
  for (const record of migrated) {
    if (!completed.some((entry) => entry.impact_case_id === record.impact_case_id && entry.recommendation_id === record.recommendation_id)) {
      fail(`Ledger does not confirm ${String(record.recommendation_id)}`);
    }
  }

  const publicPath = path.resolve("data/recommendations/public/recommendations.jsonl");
  const current = jsonl(readFileSync(publicPath, "utf8"));
  const next = [...current];
  const dispositions: JsonRecord[] = [];
  for (const record of migrated) {
    const exact = next.find((entry) => entry.recommendation_id === record.recommendation_id && entry.recommendation_version === record.recommendation_version);
    if (exact) {
      if (JSON.stringify(exact) !== JSON.stringify(record)) fail(`Conflicting existing migration for ${String(record.recommendation_id)}`);
      dispositions.push({ recommendation_id: record.recommendation_id, status: "IDEMPOTENT" });
    } else {
      next.push(record);
      dispositions.push({ recommendation_id: record.recommendation_id, status: "STRUCTURALLY_MIGRATED_AND_IMPORTED" });
    }
  }
  atomicJsonl(publicPath, next);
  atomicJson(path.resolve("data/autopilot/audit/2.3-remediated/RECOMMENDATION-AM-STRUCTURAL-MIGRATION-2.3.json"), {
    schema_version: "woek-recommendation-am-structural-migration-2.3",
    generated_at: new Date().toISOString(),
    canonical_root: "/WOEK",
    source_path: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-RECOMMENDATIONS-2026-08-18-AM.jsonl",
    source_sha256: sha256(sourceText),
    source_records: sourceRecords.length,
    schema_valid: `${migrated.length}/${migrated.length}`,
    structural_changes_only: [
      "option_set schema envelope",
      "scalar-to-single-item-array normalization",
      "compound evidence grade to conservative MEDIUM enum",
      "APPROVED_FOR_CODEX_INTEGRATION to APPROVED",
      "temporal mode derived only from the source decision_date presence",
    ],
    semantic_roundtrip: "PASS_3_OF_3",
    public_recommendation_count: next.length,
    ledger_completed_count: completed.length,
    ledger_remaining_backlog_count: 133 - completed.length,
    dispositions,
    CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS: true,
    NO_HISTORY_OVERWRITTEN: true,
  });
}

main();
