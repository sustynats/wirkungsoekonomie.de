#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import {
  assertRecommendationIsFachApprovedRecord,
  CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS,
  nextOpenRecommendationQueueEntries,
  recommendationBackfillDisposition,
  type RecommendationIdentity,
  type RecommendationLedgerRecord,
  type RecommendationQueueEntry,
} from "../lib/recommendation-backfill";

const BATCH_ID = "2026-08-18-PM-B01";
const EXPECTED_IDS = new Set([
  "WOEK-REC-BUND-STROMVKG-2026-R1",
  "WOEK-REC-BUND-KHAG-2025-2026-R1",
  "WOEK-REC-BUND-ALTERSVORSORGE-2026-R1",
]);
const EXPECTED_IMPACT_CASES = new Set([
  "WOEK-IMPACT-BUND-STROMVKG-2026",
  "WOEK-IMPACT-BUND-KHAG-2025-2026",
  "WOEK-IMPACT-BUND-ALTERSVORSORGE-2026",
]);
const SOURCE_JSONL = `GOVERNMENT-RECOMMENDATIONS-${BATCH_ID}-PROPOSED.jsonl`;
const SOURCE_MARKDOWN = `GOVERNMENT-RECOMMENDATIONS-${BATCH_ID}-PROPOSED.md`;
const TARGET_JSONL = `GOVERNMENT-RECOMMENDATIONS-${BATCH_ID}.jsonl`;
const TARGET_MARKDOWN = `GOVERNMENT-RECOMMENDATIONS-${BATCH_ID}.md`;

type JsonObject = Record<string, unknown>;
type Ledger = {
  schema_version: string;
  canonical_root: string;
  updated_at: string;
  processing_rule: string;
  records: RecommendationLedgerRecord[] & JsonObject[];
};

function fail(message: string): never {
  throw new Error(message);
}

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function lines<T>(value: Buffer | string): T[] {
  return value.toString().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T);
}

function berlinTimestamp() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date()).replace(" ", "T");
  const offsetName = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Berlin",
    timeZoneName: "longOffset",
  }).formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value ?? "GMT+00:00";
  return `${parts}${offsetName.replace("GMT", "")}`;
}

function arg(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function assertBelowRoot(candidate: string, root: string) {
  const resolved = path.resolve(candidate);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    fail(`Managed recommendation path must stay below canonical /WOEK mirror: ${resolved}`);
  }
  return resolved;
}

function manifestEntries(raw: Buffer) {
  const text = raw.toString("utf8");
  try {
    const parsed = JSON.parse(text) as JsonObject;
    const files = Array.isArray(parsed.files) ? parsed.files : [];
    const entries = files.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const object = entry as JsonObject;
      const name = String(object.name ?? object.path ?? object.file ?? "");
      const hash = String(object.sha256 ?? object.hash ?? "").toLowerCase();
      return name && /^[a-f0-9]{64}$/.test(hash) ? [{ name, hash }] : [];
    });
    if (entries.length) return entries;
  } catch {
    // Text manifests are supported below.
  }
  return text.split(/\r?\n/).flatMap((line) => {
    const match = line.trim().match(/^([a-fA-F0-9]{64})\s+\*?(.+)$/);
    return match ? [{ name: match[2].trim(), hash: match[1].toLowerCase() }] : [];
  });
}

async function readPackage(zipPath: string) {
  const packageBytes = readFileSync(zipPath);
  const zip = await JSZip.loadAsync(packageBytes);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  const byBaseName = new Map(entries.map((entry) => [path.basename(entry.name), entry]));
  const jsonlEntry = byBaseName.get(SOURCE_JSONL) ?? fail(`Package is missing ${SOURCE_JSONL}`);
  const markdownEntry = byBaseName.get(SOURCE_MARKDOWN) ?? fail(`Package is missing ${SOURCE_MARKDOWN}`);
  const manifestEntry = entries.find((entry) => /(?:manifest|sha256)/i.test(path.basename(entry.name)))
    ?? fail("Package is missing its SHA-256 manifest.");
  const [jsonl, markdown, manifest] = await Promise.all([
    jsonlEntry.async("nodebuffer"),
    markdownEntry.async("nodebuffer"),
    manifestEntry.async("nodebuffer"),
  ]);
  const expected = manifestEntries(manifest);
  for (const [name, bytes] of [[SOURCE_JSONL, jsonl], [SOURCE_MARKDOWN, markdown]] as const) {
    const manifestItem = expected.find((entry) => path.basename(entry.name) === name)
      ?? fail(`SHA-256 manifest has no entry for ${name}`);
    if (manifestItem.hash !== sha256(bytes)) fail(`SHA-256 mismatch for ${name}`);
  }
  return {
    jsonl,
    markdown,
    packageSha256: sha256(packageBytes),
    manifestSha256: sha256(manifest),
    manifestName: path.basename(manifestEntry.name),
  };
}

function atomicWrite(file: string, content: Buffer | string) {
  if (existsSync(file)) {
    const existing = readFileSync(file);
    const incoming = Buffer.isBuffer(content) ? content : Buffer.from(content);
    if (existing.equals(incoming)) return "IDEMPOTENT";
    fail(`Refusing to overwrite existing history: ${file}`);
  }
  const temporary = `${file}.tmp-${process.pid}`;
  writeFileSync(temporary, content);
  renameSync(temporary, file);
  return "WRITTEN";
}

function replaceJsonAtomically(file: string, value: unknown) {
  const temporary = `${file}.tmp-${process.pid}`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, file);
}

function canonicalRecommendationIdentities(analysisRoot: string) {
  return readdirSync(analysisRoot)
    .filter((name) => /^GOVERNMENT-RECOMMENDATIONS-.+\.jsonl$/.test(name) && !/(?:PROPOSED|BLOCKED|PENDING)/.test(name))
    .flatMap((name) => lines<JsonObject>(readFileSync(path.join(analysisRoot, name))))
    .map((record) => ({
      impact_case_id: String(record.impact_case_id),
      recommendation_id: String(record.recommendation_id),
      recommendation_version: String(record.recommendation_version),
    }));
}

function latestOverlayPaths(analysisRoot: string, impactCaseId: string) {
  return readdirSync(analysisRoot)
    .filter((name) => /(?:EDITORIAL|EVIDENCE).+\.jsonl$/.test(name))
    .filter((name) => readFileSync(path.join(analysisRoot, name), "utf8").includes(`\"impact_case_id\":\"${impactCaseId}\"`))
    .sort()
    .map((name) => `/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/${name}`);
}

function sourceAnalysisRecord(analysisRoot: string, entry: RecommendationQueueEntry & JsonObject) {
  const sources = entry.available_fach_sources as string[] | undefined ?? [];
  for (const source of sources.filter((name) => name.endsWith(".jsonl"))) {
    const local = path.join(analysisRoot, path.basename(source));
    if (!existsSync(local)) continue;
    const record = lines<JsonObject>(readFileSync(local)).find((candidate) => candidate.impact_case_id === entry.impact_case_id);
    if (record) return record;
  }
  return null;
}

function nestedObject(record: JsonObject | null, key: string) {
  const value = record?.[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

async function main() {
  if (!CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS) fail("Recommendation generation invariant is disabled.");
  if ((process.env.WOEK_DROPBOX_ROOT ?? "/WOEK") !== "/WOEK") fail("WOEK_DROPBOX_ROOT must be exactly /WOEK.");
  const localRoot = path.resolve(process.env.WOEK_CANONICAL_LOCAL_ROOT ?? "");
  if (!localRoot || path.basename(localRoot) !== "WOEK") fail("WOEK_CANONICAL_LOCAL_ROOT must point to the local mirror of /WOEK.");
  const packagePath = assertBelowRoot(arg("--package") ?? fail("Usage: --package /path/below/WOEK/package.zip"), localRoot);
  const analysisRoot = assertBelowRoot(path.join(localRoot, "WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0", "analysis"), localRoot);
  const controlRoot = assertBelowRoot(path.join(localRoot, "WOEK-AUTOPILOT", "CONTROL"), localRoot);
  const ledgerPath = assertBelowRoot(path.join(localRoot, "WOEK-AUTOPILOT", "LEDGERS", "RECOMMENDATION-BACKFILL-LEDGER.json"), localRoot);
  const queuePath = assertBelowRoot(path.join(controlRoot, "RECOMMENDATION-BACKFILL-QUEUE-2.3.jsonl"), localRoot);
  const targetJsonl = assertBelowRoot(path.join(analysisRoot, TARGET_JSONL), localRoot);
  const targetMarkdown = assertBelowRoot(path.join(analysisRoot, TARGET_MARKDOWN), localRoot);
  const handoffPath = assertBelowRoot(path.join(controlRoot, `RECOMMENDATION-BACKFILL-HANDOFF-${BATCH_ID}.json`), localRoot);
  const nextBatchPath = assertBelowRoot(path.join(controlRoot, "RECOMMENDATION-NEXT-BATCH-HANDOFF-2026-08-18-PM-B02.json"), localRoot);
  const packageContent = await readPackage(packagePath);
  const records = lines<JsonObject>(packageContent.jsonl);
  if (records.length !== 3) fail(`Expected exactly 3 RecommendationRecords, received ${records.length}`);
  const ids = records.map((record) => String(record.recommendation_id));
  const impactCases = records.map((record) => String(record.impact_case_id));
  if (new Set(ids).size !== 3 || new Set(impactCases).size !== 3) fail("Recommendation and ImpactCase IDs must be unique within PM-B01.");
  if (ids.some((id) => !EXPECTED_IDS.has(id)) || impactCases.some((id) => !EXPECTED_IMPACT_CASES.has(id))) {
    fail("PM-B01 does not contain the exact three approved RecommendationRecords.");
  }
  records.forEach(assertRecommendationIsFachApprovedRecord);
  const ledger = JSON.parse(readFileSync(ledgerPath, "utf8")) as Ledger;
  if (ledger.canonical_root !== "/WOEK") fail("Recommendation ledger does not use canonical root /WOEK.");
  const canonical = canonicalRecommendationIdentities(analysisRoot);
  const identities = records.map((record): RecommendationIdentity => ({
    impact_case_id: String(record.impact_case_id),
    recommendation_id: String(record.recommendation_id),
    recommendation_version: String(record.recommendation_version),
  }));
  const dispositions = identities.map((incoming) => ({
    incoming,
    disposition: recommendationBackfillDisposition({ incoming, ledgerRecords: ledger.records, canonicalRecommendations: canonical }),
  }));
  const conflicts = dispositions.filter((item) => item.disposition.startsWith("CONFLICT"));
  if (conflicts.length) fail(`Recommendation identity/version conflict: ${JSON.stringify(conflicts)}`);
  const sourceHash = sha256(packageContent.jsonl);
  const now = berlinTimestamp();
  const queue = lines<RecommendationQueueEntry & JsonObject>(readFileSync(queuePath));
  const queueById = new Map(queue.map((entry) => [entry.impact_case_id, entry]));
  for (const identity of identities) {
    if (!queueById.has(identity.impact_case_id)) fail(`ImpactCase is absent from central queue: ${identity.impact_case_id}`);
  }
  const completedBefore = new Set(ledger.records.filter((record) => record.status === "COMPLETED_APPROVED").map((record) => record.impact_case_id));
  const updatedRecords = [...ledger.records];
  for (const identity of identities) {
    const queueEntry = queueById.get(identity.impact_case_id)!;
    const index = updatedRecords.findIndex((record) => record.impact_case_id === identity.impact_case_id);
    const updated = {
      impact_case_id: identity.impact_case_id,
      recommendation_id: identity.recommendation_id,
      input_analysis_version: String(queueEntry.current_analysis_version ?? "UNKNOWN"),
      recommendation_version: identity.recommendation_version,
      status: "COMPLETED_APPROVED",
      completed_at: now,
      canonical_output_reference: `/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/${TARGET_JSONL}#${identity.recommendation_id}`,
      handoff_batch_id: BATCH_ID,
      source_hashes: {
        package_sha256: packageContent.packageSha256,
        package_manifest_sha256: packageContent.manifestSha256,
        recommendation_output_sha256: sourceHash,
      },
    };
    if (index >= 0) updatedRecords[index] = updated;
    else updatedRecords.push(updated);
  }
  const completedAfter = new Set(updatedRecords.filter((record) => record.status === "COMPLETED_APPROVED").map((record) => record.impact_case_id));
  const remaining = queue.filter((entry) => !completedAfter.has(entry.impact_case_id));
  if (queue.length !== 133 || completedAfter.size !== 6 || remaining.length !== 127) {
    fail(`Backlog reconciliation mismatch: queue=${queue.length}, completed=${completedAfter.size}, remaining=${remaining.length}`);
  }
  const nextBatch = nextOpenRecommendationQueueEntries(queue, updatedRecords, 3).map((entry) => {
    const analysis = sourceAnalysisRecord(analysisRoot, entry);
    const scope = nestedObject(analysis, "scope");
    const reality = nestedObject(analysis, "reality_check");
    const references = nestedObject(analysis, "references");
    const sourcePaths = (entry.available_fach_sources as string[] | undefined ?? []).map((name) =>
      name.startsWith("/WOEK/") ? name : `/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/${name}`);
    return {
      impact_case_id: entry.impact_case_id,
      subsystem: entry.jurisdiction === "EU" ? "EU" : String(entry.jurisdiction).startsWith("DE-") ? "STATES_OR_FEDERAL" : "FEDERAL",
      analysis_files: sourcePaths,
      latest_editorial_evidence_overlays: latestOverlayPaths(analysisRoot, entry.impact_case_id),
      evidence_events: [],
      mechanism_and_post_decision_source_refs: [
        ...(references?.mechanism_sources as unknown[] | undefined ?? []),
        ...(references?.post_decision_sources as unknown[] | undefined ?? []),
      ],
      missing_data_or_sources: analysis?.data_needs ?? entry.missing_fields ?? [],
      decision_date: analysis?.decision_date ?? null,
      knowledge_cutoff: scope?.decision_knowledge_cutoff ?? entry.knowledge_cutoff_date_if_known ?? null,
      current_reality_check_status: reality?.status ?? analysis?.reality_check ?? entry.retrospective_or_ex_ante ?? "OPEN",
      canonical_source_paths: sourcePaths,
    };
  });
  const handoff = {
    schema_version: "2.3",
    batch_id: BATCH_ID,
    created_at: now,
    timezone: "Europe/Berlin",
    canonical_root: "/WOEK",
    APPROVED_RECOMMENDATIONS: identities.map((item) => item.recommendation_id),
    REVIEW_REQUIRED: [],
    BLOCKED: [],
    remaining_backlog_count: remaining.length,
    impact_case_ids: identities.map((item) => item.impact_case_id),
    recommendation_versions: Object.fromEntries(identities.map((item) => [item.recommendation_id, item.recommendation_version])),
    output_files: [
      `/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/${TARGET_JSONL}`,
      `/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/${TARGET_MARKDOWN}`,
    ],
    ledger_status: "6_COMPLETED_APPROVED_127_REMAINING",
    integrity: {
      package_sha256: packageContent.packageSha256,
      manifest_file: packageContent.manifestName,
      manifest_sha256: packageContent.manifestSha256,
      recommendation_jsonl_sha256: sourceHash,
      records: records.length,
      recommendation_ids_unique: true,
      impact_case_ids_unique: true,
    },
    hindsight_guard_status: "PRESERVED_FROM_FACH_APPROVED_RECORDS",
    CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS: true,
  };
  const nextHandoff = {
    schema_version: "2.3",
    handoff_id: "RECOMMENDATION-NEXT-BATCH-2026-08-18-PM-B02",
    created_at: now,
    timezone: "Europe/Berlin",
    canonical_root: "/WOEK",
    source_queue: "/WOEK/WOEK-AUTOPILOT/CONTROL/RECOMMENDATION-BACKFILL-QUEUE-2.3.jsonl",
    source_ledger: "/WOEK/WOEK-AUTOPILOT/LEDGERS/RECOMMENDATION-BACKFILL-LEDGER.json",
    selection_rule: "Original queue order after skipping only COMPLETED_APPROVED impact_case_id values.",
    remaining_backlog_count: remaining.length,
    next_batch: nextBatch,
    CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS: true,
  };
  const targetStates = {
    jsonl: atomicWrite(targetJsonl, packageContent.jsonl),
    markdown: atomicWrite(targetMarkdown, packageContent.markdown),
    handoff: atomicWrite(handoffPath, `${JSON.stringify(handoff, null, 2)}\n`),
    next_batch: atomicWrite(nextBatchPath, `${JSON.stringify(nextHandoff, null, 2)}\n`),
  };
  replaceJsonAtomically(ledgerPath, { ...ledger, updated_at: now, records: updatedRecords });
  process.stdout.write(`${JSON.stringify({
    status: "IMPORTED_OR_IDEMPOTENT",
    batch_id: BATCH_ID,
    completed_before: completedBefore.size,
    completed_after: completedAfter.size,
    remaining_backlog_count: remaining.length,
    target_states: targetStates,
    next_batch: nextBatch.map((entry) => entry.impact_case_id),
    CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS: true,
    NO_HISTORY_OVERWRITTEN: true,
  }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
