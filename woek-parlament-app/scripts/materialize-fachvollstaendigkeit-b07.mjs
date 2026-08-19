#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { projectGovernmentEditorial, projectEuEditorial } from "../lib/publication/public-editorial-projection.mjs";

const ROOT = "/WOEK";
const ANALYSIS_ROOT = `${ROOT}/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis`;
const CONTROL_ROOT = `${ROOT}/WOEK-AUTOPILOT/CONTROL`;
const LEDGER_CURRENT = `${ROOT}/WOEK-AUTOPILOT/LEDGERS/RECOMMENDATION-BACKFILL-LEDGER.json`;
const REC_HANDOFF = `${CONTROL_ROOT}/RECOMMENDATION-BACKFILL-HANDOFF-2026-08-19-FINAL-R1-FINAL.json`;
const REC_JSONL = `${ANALYSIS_ROOT}/GOVERNMENT-RECOMMENDATIONS-2026-08-19-FINAL-R1.jsonl`;
const CT_HANDOFF = `${CONTROL_ROOT}/BRIDGE/WOEK-COMMON-TARGETS-NEW-RECOMMENDATIONS-20260819T1905CEST-FINAL.json`;
const CT_JSONL = `${ANALYSIS_ROOT}/COMMON-TARGETS-REVIEW-20260819T1905CEST-FINAL.jsonl`;
const EDITORIAL_HANDOFF = `${CONTROL_ROOT}/BRIDGE/WOEK-GOVERNMENT-EDITORIAL-EVIDENCE-B03-20260819-FINAL.json`;
const EDITORIAL_JSONL = `${ANALYSIS_ROOT}/GOVERNMENT-EDITORIAL-EVIDENCE-BACKFILL-2026-08-19-FINAL-B03.jsonl`;

const expectedNewRecommendationIds = new Set([
  "WOEK-REC-BUND-ABSCHIEBEHAFT-RECHTSBEISTAND-2026-R1",
  "WOEK-REC-GEAS-DE-2026-R1",
  "WOEK-REC-BUND-MIGRATION-DIGITAL-2026-R1",
  "WOEK-REC-BUND-KI-MIGRATION-2026-R1",
]);
const expectedEditorialIds = new Set([
  "WOEK-IMPACT-BUND-MIGRATION-DIGITAL-2026",
  "WOEK-IMPACT-BUND-KI-MIGRATION-2026",
]);
const terminalRecommendationStatuses = new Set([
  "COMPLETED_APPROVED",
  "NO_ROBUST_RECOMMENDATION",
  "REVIEW_REQUIRED_WITH_EXACT_REASON",
  "BLOCKED_WITH_EXACT_REASON",
  "NOT_APPLICABLE",
]);

function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function readJsonlText(text) { return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => JSON.parse(line)); }
function readJsonlFile(file) { return readJsonlText(readFileSync(file, "utf8")); }
function writeJsonlFile(file, records) { writeFileSync(file, `${records.map((record) => JSON.stringify(record)).join("\n")}\n`); }
function assertManagedPath(value) {
  if (!value.startsWith("/WOEK/") || /[^\x00-\x7F]/.test(value) || value.includes("..") || value.split("/").some((part) => /\s/.test(part))) {
    throw new Error(`PATH_NAMING_VIOLATION: ${value}`);
  }
}
async function dropboxAccessToken() {
  for (const key of ["DROPBOX_APP_KEY", "DROPBOX_APP_SECRET", "DROPBOX_REFRESH_TOKEN"]) if (!process.env[key]) throw new Error(`B07_DROPBOX_CONFIG_MISSING:${key}`);
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: process.env.DROPBOX_REFRESH_TOKEN });
  const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${process.env.DROPBOX_APP_KEY}:${process.env.DROPBOX_APP_SECRET}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`B07_DROPBOX_TOKEN_FAILED:${response.status}`);
  const json = await response.json();
  if (!json.access_token) throw new Error("B07_DROPBOX_TOKEN_MISSING");
  return json.access_token;
}
async function download(token, target) {
  assertManagedPath(target);
  const response = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "dropbox-api-arg": JSON.stringify({ path: target }) },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`B07_CANONICAL_SOURCE_READ_FAILED:${target}:${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const metadataHeader = response.headers.get("dropbox-api-result");
  return { bytes, metadata: metadataHeader ? JSON.parse(metadataHeader) : {} };
}
function verifiedShaFromRecommendationHandoff(handoff, target) {
  const item = (handoff.verified_artifacts ?? []).find((entry) => entry.path === target);
  return item?.local_sha256 ?? null;
}
function verifiedShaFromEditorialHandoff(handoff, target) {
  const item = (handoff.verified_artifacts ?? []).find((entry) => entry.path === target);
  return item?.local_sha256 ?? null;
}
function mergeUnique(existing, incoming, key, label) {
  const map = new Map(existing.map((record) => [record[key], record]));
  for (const record of incoming) {
    const id = record[key];
    const current = map.get(id);
    if (current) {
      if (JSON.stringify(current) !== JSON.stringify(record)) throw new Error(`B07_${label}_CONFLICT:${id}`);
      continue;
    }
    map.set(id, record);
  }
  return [...map.values()];
}
function validateCommonTarget(review) {
  for (const key of ["common_targets_review_id", "recommendation_id", "impact_case_id", "review_version", "reviewed_at", "knowledge_cutoff_date", "fach_status", "hindsight_guard", "causal_attribution_disclaimer", "aggregation_rule"]) {
    if (typeof review[key] !== "string" || !review[key].trim()) throw new Error(`B07_COMMON_TARGET_SCHEMA:${review.impact_case_id}:${key}`);
  }
  if (!review.actual_option?.option_id || !review.actual_option?.label || !review.woek_option?.option_id || !review.woek_option?.label) throw new Error(`B07_COMMON_TARGET_OPTIONS:${review.impact_case_id}`);
  if (!Array.isArray(review.mappings) || !review.mappings.length || review.machine_mapping_public_allowed !== false) throw new Error(`B07_COMMON_TARGET_MAPPINGS:${review.impact_case_id}`);
}
function validateEditorialOverlay(record) {
  if (!expectedEditorialIds.has(record.impact_case_id)) throw new Error(`B07_EDITORIAL_UNEXPECTED:${record.impact_case_id}`);
  if (record.fach_status !== "APPROVED_FOR_PUBLIC_IMPORT" || record.editorial_quality_gate !== "PASS" || record.recommendation_record_created !== false) throw new Error(`B07_EDITORIAL_GATE:${record.impact_case_id}`);
  for (const key of ["overview_assessment_label", "impact_core_summary", "editorial_summary", "key_finding", "evidence_summary", "reality_check_summary", "public_evidence_explanation", "boundary_review_note"]) if (typeof record[key] !== "string" || record[key].trim().length < 30) throw new Error(`B07_EDITORIAL_FIELD:${record.impact_case_id}:${key}`);
}

const token = await dropboxAccessToken();
const [recHandoffRead, recRead, ledgerRead, ctHandoffRead, ctRead, editorialHandoffRead, editorialRead] = await Promise.all([
  download(token, REC_HANDOFF), download(token, REC_JSONL), download(token, LEDGER_CURRENT),
  download(token, CT_HANDOFF), download(token, CT_JSONL), download(token, EDITORIAL_HANDOFF), download(token, EDITORIAL_JSONL),
]);
const recHandoff = JSON.parse(recHandoffRead.bytes.toString("utf8"));
const ctHandoff = JSON.parse(ctHandoffRead.bytes.toString("utf8"));
const editorialHandoff = JSON.parse(editorialHandoffRead.bytes.toString("utf8"));
const ledger = JSON.parse(ledgerRead.bytes.toString("utf8"));
if (recHandoff.canonical_root !== ROOT || recHandoff.expected_final_classified_count !== 133 || recHandoff.expected_remaining_unreviewed_count !== 0) throw new Error("B07_RECOMMENDATION_HANDOFF_NOT_FINAL");
if (sha256(ledgerRead.bytes) !== recHandoff.expected_current_ledger_sha256) throw new Error("B07_RECOMMENDATION_LEDGER_HASH_CHANGED");
if (ledger.final_end_status !== "COMPLETE" || Number(ledger.final_classified_count) !== 133 || Number(ledger.remaining_unreviewed_count) !== 0) throw new Error("B07_RECOMMENDATION_LEDGER_NOT_COMPLETE");
const recExpectedSha = verifiedShaFromRecommendationHandoff(recHandoff, REC_JSONL);
if (!recExpectedSha || sha256(recRead.bytes) !== recExpectedSha) throw new Error("B07_RECOMMENDATION_SOURCE_HASH_FAIL");
if (ctHandoff.canonical_root !== ROOT || ctHandoff.status !== "READY_FOR_PORTAL_IMPORT" || ctHandoff.records !== 4 || ctHandoff.source_vs_view_required_before_publication !== true) throw new Error("B07_COMMON_TARGET_HANDOFF_FAIL");
if (sha256(ctRead.bytes) !== ctHandoff.canonical_jsonl_verification?.sha256) throw new Error("B07_COMMON_TARGET_HASH_FAIL");
if (editorialHandoff.canonical_root !== ROOT || editorialHandoff.status !== "READY_FOR_PUBLIC_IMPORT" || editorialHandoff.records !== 2 || editorialHandoff.source_vs_view_required !== true) throw new Error("B07_EDITORIAL_HANDOFF_FAIL");
const editorialExpectedSha = verifiedShaFromEditorialHandoff(editorialHandoff, EDITORIAL_JSONL);
if (!editorialExpectedSha || sha256(editorialRead.bytes) !== editorialExpectedSha) throw new Error("B07_EDITORIAL_HASH_FAIL");

const newRecommendations = readJsonlText(recRead.bytes.toString("utf8"));
if (newRecommendations.length !== 4 || new Set(newRecommendations.map((record) => record.recommendation_id)).size !== 4 || !newRecommendations.every((record) => expectedNewRecommendationIds.has(record.recommendation_id))) throw new Error("B07_RECOMMENDATION_SET_FAIL");
const schemaDir = path.join(process.cwd(), "data", "autopilot", "contracts");
const recommendationSchema = JSON.parse(readFileSync(path.join(schemaDir, "recommendation-record.schema.json"), "utf8"));
const optionSchema = JSON.parse(readFileSync(path.join(schemaDir, "option-set.schema.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(optionSchema, "woek-option-set-2.3.schema.json");
const validateRecommendation = ajv.compile(recommendationSchema);
for (const record of newRecommendations) if (!validateRecommendation(record)) throw new Error(`B07_RECOMMENDATION_SCHEMA:${record.recommendation_id}:${JSON.stringify(validateRecommendation.errors)}`);

const newCommonTargets = readJsonlText(ctRead.bytes.toString("utf8"));
if (newCommonTargets.length !== 4) throw new Error("B07_COMMON_TARGET_COUNT_FAIL");
for (const review of newCommonTargets) {
  validateCommonTarget(review);
  const recommendation = newRecommendations.find((record) => record.recommendation_id === review.recommendation_id);
  if (!recommendation || recommendation.impact_case_id !== review.impact_case_id) throw new Error(`B07_COMMON_TARGET_JOIN_FAIL:${review.recommendation_id}`);
}
const editorialOverlays = readJsonlText(editorialRead.bytes.toString("utf8"));
if (editorialOverlays.length !== 2 || new Set(editorialOverlays.map((record) => record.impact_case_id)).size !== 2) throw new Error("B07_EDITORIAL_COUNT_FAIL");
editorialOverlays.forEach(validateEditorialOverlay);

const recommendationsFile = path.join(process.cwd(), "data", "recommendations", "public", "recommendations.jsonl");
const commonTargetsFile = path.join(process.cwd(), "data", "method", "public-common-target-reviews.jsonl");
const publicGovernmentFile = path.join(process.cwd(), "data", "government", "impact-cases", "public-impact-records.jsonl");
const reviewGovernmentFile = path.join(process.cwd(), "data", "government", "impact-cases", "review-impact-records.jsonl");
const publicRecommendations = mergeUnique(readJsonlFile(recommendationsFile), newRecommendations, "recommendation_id", "RECOMMENDATION");
const publicCommonTargets = mergeUnique(readJsonlFile(commonTargetsFile), newCommonTargets, "common_targets_review_id", "COMMON_TARGET");
if (publicRecommendations.length !== 13 || publicCommonTargets.length !== 13) throw new Error(`B07_PUBLIC_COUNTS_FAIL:${publicRecommendations.length}:${publicCommonTargets.length}`);
writeJsonlFile(recommendationsFile, publicRecommendations);
writeJsonlFile(commonTargetsFile, publicCommonTargets);

const recommendationByCase = new Map(publicRecommendations.map((record) => [record.impact_case_id, record]));
let publicGovernment = readJsonlFile(publicGovernmentFile);
let reviewGovernment = readJsonlFile(reviewGovernmentFile);
const overlayByCase = new Map(editorialOverlays.map((record) => [record.impact_case_id, record]));
const promoted = [];
for (const impactCaseId of expectedEditorialIds) {
  const index = reviewGovernment.findIndex((record) => record.impact_case_id === impactCaseId);
  if (index < 0) throw new Error(`B07_EDITORIAL_REVIEW_RECORD_MISSING:${impactCaseId}`);
  const base = reviewGovernment[index];
  const overlay = overlayByCase.get(impactCaseId);
  const recommendation = recommendationByCase.get(impactCaseId);
  const candidate = {
    ...base,
    publication_status: "APPROVED",
    overview_assessment_label: overlay.overview_assessment_label,
    impact_core_summary: overlay.impact_core_summary,
    editorial_summary: overlay.editorial_summary,
    key_finding: overlay.key_finding,
    evidence_summary_text: overlay.evidence_summary,
    evidence_summary: overlay.evidence_summary,
    public_evidence_explanation: overlay.public_evidence_explanation,
    boundary_review_note: overlay.boundary_review_note,
    reality_check_summary: overlay.reality_check_summary,
    recommendation_status: recommendation.recommendation_status,
    editorial_evidence_overlay: {
      source_file: EDITORIAL_JSONL.split("/").at(-1),
      source_sha256: sha256(editorialRead.bytes),
      editorial_backfill_version: overlay.editorial_backfill_version,
      fach_status: overlay.fach_status,
    },
  };
  const projection = projectGovernmentEditorial(candidate);
  if (projection.status !== "PASS") throw new Error(`B07_EDITORIAL_STILL_BLOCKED:${impactCaseId}:${projection.failed.join(",")}`);
  publicGovernment.push(candidate);
  reviewGovernment.splice(index, 1);
  promoted.push(impactCaseId);
}

// Reconcile the recommendation status for already-public cases without rewriting any Fachtext.
publicGovernment = publicGovernment.map((record) => {
  const recommendation = recommendationByCase.get(record.impact_case_id);
  return recommendation ? { ...record, recommendation_status: recommendation.recommendation_status } : record;
});
if (new Set(publicGovernment.map((record) => record.impact_case_id)).size !== publicGovernment.length) throw new Error("B07_GOVERNMENT_DUPLICATE_PUBLIC_ID");
writeJsonlFile(publicGovernmentFile, publicGovernment);
writeJsonlFile(reviewGovernmentFile, reviewGovernment);

const queueIds = new Set((recHandoff.newly_terminal_classifications ?? []).map((entry) => entry.impact_case_id));
const ledgerById = new Map((ledger.records ?? []).map((entry) => [entry.impact_case_id, entry]));
const remainingGovernmentExclusions = reviewGovernment.map((record) => {
  const projection = projectGovernmentEditorial(record);
  const terminal = ledgerById.get(record.impact_case_id) ?? null;
  return {
    impact_case_id: record.impact_case_id,
    title: record.title,
    public_status: "FAIL_CLOSED_FACT_ONLY_OR_NOT_PUBLISHED",
    editorial_blockers: projection.failed,
    recommendation_terminal_status: terminal?.status ?? (queueIds.has(record.impact_case_id) ? "FINAL_CLASSIFIED" : "NOT_IN_RECOMMENDATION_QUEUE"),
    recommendation_exact_reason: terminal?.exact_reason ?? null,
    publication_rule: "No public WÖk recommendation or full impact analysis is inferred while the fach/publication gate remains unresolved. The underlying official fact record may remain available separately.",
  };
});
const euRecords = readJsonlFile(path.join(process.cwd(), "data", "eu", "impact-cases", "public-impact-records.jsonl"));
const remainingEuExclusions = euRecords.map((record) => ({ record, editorial: projectEuEditorial(record) })).filter(({ editorial }) => editorial.status !== "PASS").map(({ record, editorial }) => ({ impact_case_id: record.impact_case_id, blockers: editorial.failed }));
const exclusionReport = {
  schema_version: "woek-publication-exclusions-b07-1.0",
  generated_at: "2026-08-19T19:35:00+02:00",
  canonical_root: ROOT,
  government_review_exclusions: remainingGovernmentExclusions,
  government_review_exclusion_count: remainingGovernmentExclusions.length,
  eu_editorial_exclusions: remainingEuExclusions,
  eu_editorial_exclusion_count: remainingEuExclusions.length,
  semantics: "Exclusion is an explicit fail-closed publication state, not a neutral or negative impact judgment and not an unreviewed queue item.",
};
writeFileSync(path.join(process.cwd(), "data", "method", "publication-exclusions-b07.json"), `${JSON.stringify(exclusionReport, null, 2)}\n`);

const manifest = {
  schema_version: "woek-fachvollstaendigkeit-public-materialization-1.1",
  merge_id: "FACHVOLLSTAENDIGKEIT-B07-20260819T1935CEST",
  generated_at: "2026-08-19T19:35:00+02:00",
  canonical_root: ROOT,
  problem_goal: { records: 99, source_manifest: "data/method/fachvollstaendigkeit-b06-manifest.json" },
  recommendations: {
    public_records: publicRecommendations.length,
    new_records: newRecommendations.length,
    final_queue_classified: 133,
    remaining_unreviewed: 0,
    source: REC_JSONL,
    source_sha256: sha256(recRead.bytes),
    handoff: REC_HANDOFF,
    ledger_sha256: sha256(ledgerRead.bytes),
  },
  common_targets: {
    public_records: publicCommonTargets.length,
    new_records: newCommonTargets.length,
    source: CT_JSONL,
    source_sha256: sha256(ctRead.bytes),
    handoff: CT_HANDOFF,
  },
  editorial_evidence_b03: {
    promoted_public_cases: promoted,
    source: EDITORIAL_JSONL,
    source_sha256: sha256(editorialRead.bytes),
    handoff: EDITORIAL_HANDOFF,
  },
  publication_exclusions: {
    government: remainingGovernmentExclusions.length,
    eu: remainingEuExclusions.length,
    exact_report: "data/method/publication-exclusions-b07.json",
  },
  gates: {
    no_recommendation_generated_by_code: true,
    no_machine_common_target_mapping: true,
    no_fach_rewrite: true,
    canonical_hashes_verified: true,
    recommendation_queue_final: true,
    common_targets_coverage_for_public_recommendations: publicCommonTargets.length === publicRecommendations.length,
    editorial_b03_projection_pass: promoted.length === 2,
    open_is_not_neutral: true,
  },
};
if (!manifest.gates.common_targets_coverage_for_public_recommendations) throw new Error("B07_COMMON_TARGET_COVERAGE_FAIL");
writeFileSync(path.join(process.cwd(), "data", "method", "fachvollstaendigkeit-b07-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify({
  status: "B07_MATERIALIZATION_PASS",
  problem_goal: 99,
  recommendations: publicRecommendations.length,
  common_targets: publicCommonTargets.length,
  promoted_government_cases: promoted,
  remaining_government_fail_closed: remainingGovernmentExclusions.length,
  remaining_eu_fail_closed: remainingEuExclusions.length,
  recommendation_final_classified: 133,
  recommendation_remaining_unreviewed: 0,
}, null, 2));
