#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  assertRecommendationHandoffRecord,
  CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS,
  nextOpenRecommendationQueueEntries,
  recommendationBackfillDisposition,
  recommendationBackfillDispositionWithReconciliation,
  ZIP_IS_NOT_CANONICAL_SOURCE,
  type RecommendationIdentity,
  type RecommendationLedgerRecord,
  type RecommendationQueueEntry,
} from "../lib/recommendation-backfill";

const BATCH_ID = "2026-08-18-PM-B01";
const EXPECTED_IMPACT_CASES = new Set([
  "WOEK-IMPACT-BUND-STROMVKG-2026",
  "WOEK-IMPACT-BUND-KHAG-2025-2026",
  "WOEK-IMPACT-BUND-ALTERSVORSORGE-2026",
]);
const TARGET_JSONL = `GOVERNMENT-RECOMMENDATIONS-${BATCH_ID}.jsonl`;
const TARGET_MARKDOWN = `GOVERNMENT-RECOMMENDATIONS-${BATCH_ID}.md`;
const FACH_HANDOFF = `RECOMMENDATION-BACKFILL-HANDOFF-${BATCH_ID}.json`;
const CODEX_IMPORT_STATUS = `CODEX-RECOMMENDATION-IMPORT-STATUS-${BATCH_ID}.json`;
const SCHEMAFIX_ID = `${BATCH_ID}-SCHEMAFIX-R1`;
const SCHEMAFIX_JSONL = `GOVERNMENT-RECOMMENDATIONS-${SCHEMAFIX_ID}.jsonl`;
const SCHEMAFIX_HANDOFF = `RECOMMENDATION-BACKFILL-HANDOFF-${SCHEMAFIX_ID}.json`;
const LEDGER_RECONCILIATION = `RECOMMENDATION-LEDGER-RECONCILIATION-${BATCH_ID}.json`;
const SCHEMAFIX_IMPORT_STATUS = `CODEX-RECOMMENDATION-IMPORT-STATUS-${SCHEMAFIX_ID}.json`;

type JsonObject = Record<string, unknown>;
type Ledger = {
  schema_version: string;
  canonical_root: string;
  updated_at: string;
  processing_rule: string;
  records: Array<RecommendationLedgerRecord & JsonObject>;
};
type PackageContent = {
  transportMode: "CANONICAL_DIRECT_FILES" | "OPTIONAL_ZIP_CONTAINER";
  jsonl: Buffer;
  markdown?: Buffer;
  handoff: Buffer;
  reconciliation?: Buffer;
  hashes: Record<string, string>;
  packageSha256?: string;
  manifestSha256?: string;
};

function fail(message: string): never {
  throw new Error(message);
}

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function recordSha256(record: JsonObject) {
  return sha256(JSON.stringify(record));
}

function lines<T>(value: Buffer | string): T[] {
  return value.toString().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T);
}

function berlinTimestamp() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).format(now).replace(" ", "T");
  const offsetName = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Berlin", timeZoneName: "longOffset",
  }).formatToParts(now).find((part) => part.type === "timeZoneName")?.value ?? "GMT+00:00";
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

function assertNoLocalPath(value: unknown, context = "record") {
  if (typeof value === "string" && (/^\/tmp\//.test(value) || /^\/Users\//.test(value) || /^file:\/\//.test(value))) {
    fail(`Local path is forbidden in canonical/public recommendation ${context}: ${value}`);
  }
  if (Array.isArray(value)) value.forEach((item, index) => assertNoLocalPath(item, `${context}[${index}]`));
  else if (value && typeof value === "object") {
    Object.entries(value as JsonObject).forEach(([key, item]) => assertNoLocalPath(item, `${context}.${key}`));
  }
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

function replaceJsonlAtomically(file: string, records: JsonObject[]) {
  if (!records.length && existsSync(file) && readFileSync(file, "utf8").trim() === "") return;
  const temporary = `${file}.tmp-${process.pid}`;
  writeFileSync(temporary, records.length ? `${records.map((record) => JSON.stringify(record)).join("\n")}\n` : "");
  renameSync(temporary, file);
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

function waitingStatus(missing: string[]) {
  process.stdout.write(`${JSON.stringify({
    status: "WAITING_FOR_FACH_RECOMMENDATION_HANDOFF",
    batch_id: BATCH_ID,
    canonical_root: "/WOEK",
    missing,
    transport_zip_required: false,
    ZIP_IS_NOT_CANONICAL_SOURCE,
    p0_blocker: false,
    importer_error: false,
    production_impact: "NONE",
    independent_ui_work_may_continue: true,
    CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS,
    NO_HISTORY_OVERWRITTEN: true,
  }, null, 2)}\n`);
}

function readDirectPackage(paths: { jsonl: string; markdown: string; handoff: string }): PackageContent | null {
  const canonicalPaths: Record<keyof typeof paths, string> = {
    jsonl: `/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/${TARGET_JSONL}`,
    markdown: `/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/${TARGET_MARKDOWN}`,
    handoff: `/WOEK/WOEK-AUTOPILOT/CONTROL/${FACH_HANDOFF}`,
  };
  const missing = (Object.keys(paths) as Array<keyof typeof paths>)
    .filter((name) => !existsSync(paths[name]))
    .map((name) => canonicalPaths[name]);
  if (missing.length) {
    waitingStatus(missing);
    return null;
  }
  const jsonl = readFileSync(paths.jsonl);
  const markdown = readFileSync(paths.markdown);
  const handoff = readFileSync(paths.handoff);
  return {
    transportMode: "CANONICAL_DIRECT_FILES",
    jsonl, markdown, handoff,
    hashes: {
      recommendation_jsonl_sha256: sha256(jsonl),
      recommendation_markdown_sha256: sha256(markdown),
      fach_handoff_sha256: sha256(handoff),
    },
  };
}

function readSchemafixDirectPackage(paths: { jsonl: string; handoff: string; reconciliation: string }): PackageContent | null {
  const canonicalPaths: Record<keyof typeof paths, string> = {
    jsonl: `/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/${SCHEMAFIX_JSONL}`,
    handoff: `/WOEK/WOEK-AUTOPILOT/CONTROL/${SCHEMAFIX_HANDOFF}`,
    reconciliation: `/WOEK/WOEK-AUTOPILOT/CONTROL/${LEDGER_RECONCILIATION}`,
  };
  const missing = (Object.keys(paths) as Array<keyof typeof paths>)
    .filter((name) => !existsSync(paths[name]))
    .map((name) => canonicalPaths[name]);
  if (missing.length) {
    waitingStatus(missing);
    return null;
  }
  const jsonl = readFileSync(paths.jsonl);
  const handoff = readFileSync(paths.handoff);
  const reconciliation = readFileSync(paths.reconciliation);
  return {
    transportMode: "CANONICAL_DIRECT_FILES",
    jsonl, handoff, reconciliation,
    hashes: {
      recommendation_jsonl_sha256: sha256(jsonl),
      fach_handoff_sha256: sha256(handoff),
      ledger_reconciliation_sha256: sha256(reconciliation),
    },
  };
}

async function readOptionalZipPackage(zipPath: string): Promise<PackageContent> {
  const packageBytes = readFileSync(zipPath);
  const zip = await JSZip.loadAsync(packageBytes);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  const byBaseName = new Map(entries.map((entry) => [path.basename(entry.name), entry]));
  const pick = (names: string[]) => names.map((name) => byBaseName.get(name)).find(Boolean);
  const jsonlEntry = pick([TARGET_JSONL, `GOVERNMENT-RECOMMENDATIONS-${BATCH_ID}-PROPOSED.jsonl`])
    ?? fail(`Optional ZIP is missing ${TARGET_JSONL}`);
  const markdownEntry = pick([TARGET_MARKDOWN, `GOVERNMENT-RECOMMENDATIONS-${BATCH_ID}-PROPOSED.md`])
    ?? fail(`Optional ZIP is missing ${TARGET_MARKDOWN}`);
  const handoffEntry = byBaseName.get(FACH_HANDOFF) ?? fail(`Optional ZIP is missing ${FACH_HANDOFF}`);
  const manifestEntry = entries.find((entry) => /(?:manifest|sha256)/i.test(path.basename(entry.name)))
    ?? fail("Optional ZIP is missing its SHA-256 manifest.");
  const [jsonl, markdown, handoff, manifest] = await Promise.all([
    jsonlEntry.async("nodebuffer"), markdownEntry.async("nodebuffer"),
    handoffEntry.async("nodebuffer"), manifestEntry.async("nodebuffer"),
  ]);
  const expected = manifestEntries(manifest);
  for (const [entry, bytes] of [[jsonlEntry, jsonl], [markdownEntry, markdown], [handoffEntry, handoff]] as const) {
    const manifestItem = expected.find((item) => path.basename(item.name) === path.basename(entry.name))
      ?? fail(`SHA-256 manifest has no entry for ${path.basename(entry.name)}`);
    if (manifestItem.hash !== sha256(bytes)) fail(`SHA-256 mismatch for ${path.basename(entry.name)}`);
  }
  return {
    transportMode: "OPTIONAL_ZIP_CONTAINER",
    jsonl, markdown, handoff,
    packageSha256: sha256(packageBytes),
    manifestSha256: sha256(manifest),
    hashes: {
      recommendation_jsonl_sha256: sha256(jsonl),
      recommendation_markdown_sha256: sha256(markdown),
      fach_handoff_sha256: sha256(handoff),
    },
  };
}

function approvedIdsFromHandoff(handoff: JsonObject) {
  if (Array.isArray(handoff.approved_recommendation_ids)) return handoff.approved_recommendation_ids.map(String);
  if (Array.isArray(handoff.APPROVED_RECOMMENDATIONS)) return handoff.APPROVED_RECOMMENDATIONS.map(String);
  if (Array.isArray(handoff.recommendation_ids)) return handoff.recommendation_ids.map(String);
  return [];
}

function approvedImpactCasesFromHandoff(handoff: JsonObject) {
  if (Array.isArray(handoff.approved_impact_case_ids)) return handoff.approved_impact_case_ids.map(String);
  return Array.isArray(handoff.impact_case_ids) ? handoff.impact_case_ids.map(String) : [];
}

function exactMembers(actual: string[], expected: string[]) {
  return actual.length === expected.length && actual.every((value) => expected.includes(value));
}

function assertSchemafixHandoff(handoff: JsonObject, packageContent: PackageContent, ids: string[], impactCases: string[]) {
  if (handoff.status !== "APPROVED_FOR_CANONICAL_IMPORT") fail("Schemafix handoff is not approved for canonical import.");
  if (handoff.records !== 3 || handoff.schema_validation_status !== "PASS"
    || handoff.schema_valid_count !== 3 || handoff.schema_invalid_count !== 0) {
    fail("Schemafix handoff does not confirm 3/3 schema-valid RecommendationRecords.");
  }
  if (handoff.fach_status !== "APPROVED") fail("Schemafix handoff fach_status must be APPROVED.");
  if (handoff.content_changed !== false || handoff.no_fachliche_upgrade !== true) {
    fail("Schemafix handoff does not preserve the no-content-change/no-fach-upgrade contract.");
  }
  if (handoff.transport_zip_required !== false) fail("Schemafix handoff improperly requires a ZIP transport.");
  if (!exactMembers(approvedIdsFromHandoff(handoff), ids)
    || !exactMembers(approvedImpactCasesFromHandoff(handoff), impactCases)) {
    fail("Schemafix handoff identities do not match the Recommendation JSONL.");
  }
  const hashes = handoff.output_sha256 as JsonObject | undefined;
  if (!hashes || hashes.jsonl !== packageContent.hashes.recommendation_jsonl_sha256
    || hashes.ledger_reconciliation !== packageContent.hashes.ledger_reconciliation_sha256) {
    fail("Schemafix handoff SHA-256 values do not match the canonical inputs.");
  }
}

function assertLedgerReconciliation(reconciliation: JsonObject, ids: string[], impactCases: string[]) {
  if (reconciliation.canonical_root !== "/WOEK") fail("Ledger reconciliation does not use canonical root /WOEK.");
  if (reconciliation.status !== "RECONCILIATION_REQUIRED_BEFORE_CANONICAL_IMPORT") {
    fail("Ledger reconciliation has an unexpected status.");
  }
  if (reconciliation.skip_override_scope !== "EXACTLY_THE_THREE_PM_B01_IMPACT_CASES") {
    fail("Ledger reconciliation is not limited to exactly the three PM-B01 ImpactCases.");
  }
  const reconciliationIds = Array.isArray(reconciliation.affected_recommendation_ids)
    ? reconciliation.affected_recommendation_ids.map(String) : [];
  const reconciliationImpactCases = Array.isArray(reconciliation.affected_impact_case_ids)
    ? reconciliation.affected_impact_case_ids.map(String) : [];
  if (!exactMembers(reconciliationIds, ids) || !exactMembers(reconciliationImpactCases, impactCases)) {
    fail("Ledger reconciliation identities do not match the Schemafix JSONL.");
  }
  if (reconciliation.observed_completed_approved_count !== 6
    || reconciliation.validated_canonical_import_count_before_pm_b01 !== 3
    || reconciliation.expected_post_import_completed_approved !== 6
    || reconciliation.expected_post_import_remaining_backlog_count !== 127) {
    fail("Ledger reconciliation counts do not match the approved PM-B01 correction contract.");
  }
  return new Set(reconciliationImpactCases);
}

function assertRecommendationSchema(records: JsonObject[]) {
  const contractsRoot = path.resolve(process.cwd(), "data/autopilot/contracts");
  const optionSetSchema = JSON.parse(readFileSync(path.join(contractsRoot, "option-set.schema.json"), "utf8"));
  const recommendationSchema = JSON.parse(readFileSync(path.join(contractsRoot, "recommendation-record.schema.json"), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(optionSetSchema);
  const validate = ajv.compile(recommendationSchema);
  for (const record of records) {
    const recommendationId = String(record.recommendation_id);
    if (!validate(record)) {
      fail(`Recommendation schema validation failed for ${recommendationId}: ${JSON.stringify(validate.errors)}`);
    }
  }
}

function canonicalRecommendationIdentities(analysisRoot: string) {
  return readdirSync(analysisRoot)
    .filter((name) => /^GOVERNMENT-RECOMMENDATIONS-.+\.jsonl$/.test(name) && !/(?:PROPOSED|BLOCKED|PENDING)/.test(name))
    .flatMap((name) => lines<JsonObject>(readFileSync(path.join(analysisRoot, name))))
    .map((record): RecommendationIdentity => ({
      impact_case_id: String(record.impact_case_id),
      recommendation_id: String(record.recommendation_id),
      recommendation_version: String(record.recommendation_version),
      recommendation_content_sha256: recordSha256(record),
      supersedes_recommendation_version: record.supersedes_recommendation_version == null ? null : String(record.supersedes_recommendation_version),
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

function updatePublicStore(records: JsonObject[]) {
  const publicPath = path.resolve(process.cwd(), "data/recommendations/public/recommendations.jsonl");
  const historyPath = path.resolve(process.cwd(), "data/recommendations/history/recommendation-versions.jsonl");
  const current = lines<JsonObject>(readFileSync(publicPath));
  const history = lines<JsonObject>(readFileSync(historyPath));
  const next = [...current];
  const nextHistory = [...history];
  for (const record of records) {
    const sameIdentity = next.find((candidate) => candidate.recommendation_id === record.recommendation_id
      && candidate.recommendation_version === record.recommendation_version);
    if (sameIdentity) {
      if (recordSha256(sameIdentity) !== recordSha256(record)) fail(`Public RecommendationVersion content conflict: ${String(record.recommendation_id)}`);
      continue;
    }
    const currentIndex = next.findIndex((candidate) => candidate.impact_case_id === record.impact_case_id);
    if (currentIndex >= 0) {
      const previous = next[currentIndex];
      if (record.supersedes_recommendation_version !== previous.recommendation_version) {
        fail(`New public RecommendationVersion does not supersede current version: ${String(record.impact_case_id)}`);
      }
      if (!nextHistory.some((candidate) => candidate.recommendation_id === previous.recommendation_id
        && candidate.recommendation_version === previous.recommendation_version)) nextHistory.push(previous);
      next[currentIndex] = record;
    } else next.push(record);
  }
  replaceJsonlAtomically(publicPath, next);
  replaceJsonlAtomically(historyPath, nextHistory);
  return { public_count: next.length, history_count: nextHistory.length };
}

async function main() {
  if (!CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS) fail("Recommendation generation invariant is disabled.");
  if (!ZIP_IS_NOT_CANONICAL_SOURCE) fail("ZIP canonical-source invariant is disabled.");
  if ((process.env.WOEK_DROPBOX_ROOT ?? "/WOEK") !== "/WOEK") fail("WOEK_DROPBOX_ROOT must be exactly /WOEK.");
  const localRoot = path.resolve(process.env.WOEK_CANONICAL_LOCAL_ROOT ?? "");
  if (!localRoot || path.basename(localRoot) !== "WOEK") fail("WOEK_CANONICAL_LOCAL_ROOT must point to the local mirror of /WOEK.");

  const analysisRoot = assertBelowRoot(path.join(localRoot, "WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0", "analysis"), localRoot);
  const controlRoot = assertBelowRoot(path.join(localRoot, "WOEK-AUTOPILOT", "CONTROL"), localRoot);
  const ledgerPath = assertBelowRoot(path.join(localRoot, "WOEK-AUTOPILOT", "LEDGERS", "RECOMMENDATION-BACKFILL-LEDGER.json"), localRoot);
  const queuePath = assertBelowRoot(path.join(controlRoot, "RECOMMENDATION-BACKFILL-QUEUE-2.3.jsonl"), localRoot);
  const reconciliationArg = arg("--reconciliation");
  const schemafixMode = Boolean(reconciliationArg);
  const targetJsonl = assertBelowRoot(arg("--jsonl") ?? path.join(analysisRoot, schemafixMode ? SCHEMAFIX_JSONL : TARGET_JSONL), localRoot);
  const targetMarkdown = assertBelowRoot(path.join(analysisRoot, TARGET_MARKDOWN), localRoot);
  const fachHandoffPath = assertBelowRoot(arg("--handoff") ?? path.join(controlRoot, schemafixMode ? SCHEMAFIX_HANDOFF : FACH_HANDOFF), localRoot);
  const reconciliationPath = schemafixMode ? assertBelowRoot(reconciliationArg!, localRoot) : null;
  const codexStatusPath = assertBelowRoot(path.join(controlRoot, schemafixMode ? SCHEMAFIX_IMPORT_STATUS : CODEX_IMPORT_STATUS), localRoot);
  const nextBatchPath = assertBelowRoot(path.join(controlRoot, schemafixMode
    ? "RECOMMENDATION-NEXT-BATCH-HANDOFF-2026-08-18-PM-B02-SCHEMAFIX-R1.json"
    : "RECOMMENDATION-NEXT-BATCH-HANDOFF-2026-08-18-PM-B02.json"), localRoot);

  const optionalZipArg = arg("--package");
  if (schemafixMode && optionalZipArg) fail("Schemafix-R1 must use the canonical direct-file interface, not a ZIP.");
  const packageContent = schemafixMode
    ? readSchemafixDirectPackage({ jsonl: targetJsonl, handoff: fachHandoffPath, reconciliation: reconciliationPath! })
    : optionalZipArg
    ? await readOptionalZipPackage(assertBelowRoot(optionalZipArg, localRoot))
    : readDirectPackage({ jsonl: targetJsonl, markdown: targetMarkdown, handoff: fachHandoffPath });
  if (!packageContent) return;

  const records = lines<JsonObject>(packageContent.jsonl);
  if (records.length !== 3) fail(`Expected exactly 3 RecommendationRecords, received ${records.length}`);
  const ids = records.map((record) => String(record.recommendation_id));
  const impactCases = records.map((record) => String(record.impact_case_id));
  if (new Set(ids).size !== 3 || new Set(impactCases).size !== 3) fail("Recommendation and ImpactCase IDs must be unique within PM-B01.");
  if (impactCases.some((id) => !EXPECTED_IMPACT_CASES.has(id)) || EXPECTED_IMPACT_CASES.size !== new Set(impactCases).size) {
    fail("PM-B01 does not contain the exact three expected ImpactCases.");
  }
  records.forEach((record) => {
    assertRecommendationHandoffRecord(record);
    assertNoLocalPath(record);
  });
  assertRecommendationSchema(records);

  const fachHandoff = JSON.parse(packageContent.handoff.toString("utf8")) as JsonObject;
  assertNoLocalPath(fachHandoff, "fach_handoff");
  if (fachHandoff.canonical_root !== "/WOEK") fail("Fach handoff does not use canonical root /WOEK.");
  const reconciliation = packageContent.reconciliation
    ? JSON.parse(packageContent.reconciliation.toString("utf8")) as JsonObject
    : null;
  if (schemafixMode) {
    if (!reconciliation) fail("Schemafix-R1 requires the canonical ledger reconciliation.");
    assertNoLocalPath(reconciliation, "ledger_reconciliation");
    assertSchemafixHandoff(fachHandoff, packageContent, ids, impactCases);
  }
  const handoffIds = approvedIdsFromHandoff(fachHandoff);
  if (!handoffIds.length || handoffIds.length !== ids.length || ids.some((id) => !handoffIds.includes(id))) {
    fail("Fach handoff approval IDs do not match the Recommendation JSONL.");
  }
  const handoffImpacts = approvedImpactCasesFromHandoff(fachHandoff);
  if (handoffImpacts.length && (handoffImpacts.length !== impactCases.length || impactCases.some((id) => !handoffImpacts.includes(id)))) {
    fail("Fach handoff ImpactCase IDs do not match the Recommendation JSONL.");
  }
  const reconciliationOverrides = reconciliation
    ? assertLedgerReconciliation(reconciliation, ids, impactCases)
    : new Set<string>();

  const ledger = JSON.parse(readFileSync(ledgerPath, "utf8")) as Ledger;
  if (ledger.canonical_root !== "/WOEK") fail("Recommendation ledger does not use canonical root /WOEK.");
  const canonical = canonicalRecommendationIdentities(analysisRoot);
  const identities = records.map((record): RecommendationIdentity => ({
    impact_case_id: String(record.impact_case_id), recommendation_id: String(record.recommendation_id),
    recommendation_version: String(record.recommendation_version), recommendation_content_sha256: recordSha256(record),
    supersedes_recommendation_version: record.supersedes_recommendation_version == null ? null : String(record.supersedes_recommendation_version),
  }));
  const dispositions = identities.map((incoming) => ({
    incoming,
    disposition: reconciliationOverrides.has(incoming.impact_case_id)
      ? recommendationBackfillDispositionWithReconciliation({
          incoming, ledgerRecords: ledger.records, canonicalRecommendations: canonical,
          reconcileCompletedApproved: true,
        })
      : recommendationBackfillDisposition({ incoming, ledgerRecords: ledger.records, canonicalRecommendations: canonical }),
  }));
  const conflicts = dispositions.filter((item) => item.disposition.startsWith("CONFLICT"));
  if (conflicts.length) fail(`Recommendation identity/version/content conflict: ${JSON.stringify(conflicts)}`);

  const now = berlinTimestamp();
  const canonicalJsonlRef = `/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/${path.basename(targetJsonl)}`;
  const canonicalHandoffRef = `/WOEK/WOEK-AUTOPILOT/CONTROL/${path.basename(fachHandoffPath)}`;
  const canonicalReconciliationRef = reconciliationPath
    ? `/WOEK/WOEK-AUTOPILOT/CONTROL/${path.basename(reconciliationPath)}`
    : null;
  const queue = lines<RecommendationQueueEntry & JsonObject>(readFileSync(queuePath));
  const queueById = new Map(queue.map((entry) => [entry.impact_case_id, entry]));
  if (queueById.size !== queue.length) fail("Central recommendation queue contains duplicate impact_case_id values.");
  for (const identity of identities) if (!queueById.has(identity.impact_case_id)) fail(`ImpactCase is absent from central queue: ${identity.impact_case_id}`);

  const completedBefore = new Set(ledger.records.filter((record) => record.status === "COMPLETED_APPROVED").map((record) => record.impact_case_id));
  if (schemafixMode && completedBefore.size !== 6) {
    fail(`Ledger reconciliation expected 6 observed COMPLETED_APPROVED records, received ${completedBefore.size}.`);
  }
  const updatedRecords = ledger.records.map((record) => ({ ...record }));
  for (const identity of identities) {
    const exactIndex = updatedRecords.findIndex((record) => record.impact_case_id === identity.impact_case_id
      && record.recommendation_id === identity.recommendation_id && record.recommendation_version === identity.recommendation_version);
    if (exactIndex >= 0) {
      if (!reconciliationOverrides.has(identity.impact_case_id)) continue;
      const exact = updatedRecords[exactIndex];
      updatedRecords[exactIndex] = {
        ...exact,
        recommendation_content_sha256: identity.recommendation_content_sha256,
        status: "COMPLETED_APPROVED",
        canonical_import_validated_at: now,
        canonical_output_reference: `${canonicalJsonlRef}#${identity.recommendation_id}`,
        handoff_batch_id: SCHEMAFIX_ID,
        source_hashes: {
          ...(exact.source_hashes && typeof exact.source_hashes === "object" ? exact.source_hashes : {}),
          ...packageContent.hashes,
        },
      };
      continue;
    }
    const queueEntry = queueById.get(identity.impact_case_id)!;
    updatedRecords.push({
      impact_case_id: identity.impact_case_id,
      recommendation_id: identity.recommendation_id,
      input_analysis_version: String(queueEntry.current_analysis_version ?? "UNKNOWN"),
      recommendation_version: identity.recommendation_version,
      recommendation_content_sha256: identity.recommendation_content_sha256,
      status: "COMPLETED_APPROVED",
      completed_at: now,
      canonical_output_reference: `${canonicalJsonlRef}#${identity.recommendation_id}`,
      handoff_batch_id: schemafixMode ? SCHEMAFIX_ID : BATCH_ID,
      source_hashes: {
        ...packageContent.hashes,
        ...(packageContent.packageSha256 ? { optional_transport_zip_sha256: packageContent.packageSha256 } : {}),
        ...(packageContent.manifestSha256 ? { optional_transport_manifest_sha256: packageContent.manifestSha256 } : {}),
      },
    });
  }
  const completedAfter = new Set(updatedRecords.filter((record) => record.status === "COMPLETED_APPROVED").map((record) => record.impact_case_id));
  const remaining = queue.filter((entry) => !completedAfter.has(entry.impact_case_id));
  const expectedRemaining = 127;
  const backlogPlausibility = remaining.length === expectedRemaining
    ? "MATCHES_EXPECTED_PM_B01_BASELINE"
    : `DIFFERS_FROM_2026-08-18_BASELINE_BY_${remaining.length - expectedRemaining}`;
  if (schemafixMode && (completedAfter.size !== 6 || remaining.length !== 127)) {
    fail(`Post-import ledger reconciliation failed: completed=${completedAfter.size}, remaining=${remaining.length}.`);
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

  const canonicalInputFiles = [
    canonicalJsonlRef,
    canonicalHandoffRef,
    ...(canonicalReconciliationRef ? [canonicalReconciliationRef] : []),
    "/WOEK/WOEK-AUTOPILOT/LEDGERS/RECOMMENDATION-BACKFILL-LEDGER.json",
  ];
  const codexImportStatus = {
    schema_version: "2.3", status: "IMPORTED_OR_IDEMPOTENT", batch_id: schemafixMode ? SCHEMAFIX_ID : BATCH_ID,
    created_at: now, timezone: "Europe/Berlin", canonical_root: "/WOEK",
    transport_mode: packageContent.transportMode, transport_zip_required: false, ZIP_IS_NOT_CANONICAL_SOURCE,
    APPROVED_RECOMMENDATIONS: ids, REVIEW_REQUIRED: [], BLOCKED: [], impact_case_ids: impactCases,
    recommendation_versions: Object.fromEntries(identities.map((item) => [item.recommendation_id, item.recommendation_version])),
    canonical_input_files: schemafixMode ? canonicalInputFiles : [
      canonicalJsonlRef,
      `/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/${TARGET_MARKDOWN}`,
      canonicalHandoffRef,
      "/WOEK/WOEK-AUTOPILOT/LEDGERS/RECOMMENDATION-BACKFILL-LEDGER.json",
    ],
    completed_before: completedBefore.size, completed_after: completedAfter.size,
    recommendation_subjects_total: queue.length, remaining_backlog_count: remaining.length,
    expected_remaining_backlog_count_for_pm_b01_baseline: expectedRemaining, backlog_plausibility: backlogPlausibility,
    integrity: {
      ...packageContent.hashes, records: records.length, recommendation_ids_unique: true,
      impact_case_ids_unique: true, fach_handoff_matches_jsonl: true, local_paths_absent: true,
      recommendation_record_schema: "PASS", option_set_schema: "PASS",
      recommendation_fach_status_contract_consistent: true,
      recommendation_schema_and_importer_use_same_enum: true,
      ledger_reconciliation: schemafixMode ? "PASS" : "NOT_REQUIRED",
    },
    hindsight_guard_status: "PRESERVED_FROM_FACH_APPROVED_RECORDS",
    source_vs_view_status: "PENDING_STAGING_RENDER_AFTER_IMPORT",
    staging_recommendation_ui_status: "DATA_IMPORTED_AWAITING_STAGING_BUILD",
    production_impact: "NONE",
    CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS,
    NO_HISTORY_OVERWRITTEN: true,
  };
  const nextHandoff = {
    schema_version: "2.3", handoff_id: "RECOMMENDATION-NEXT-BATCH-2026-08-18-PM-B02",
    created_at: now, timezone: "Europe/Berlin", canonical_root: "/WOEK",
    source_queue: "/WOEK/WOEK-AUTOPILOT/CONTROL/RECOMMENDATION-BACKFILL-QUEUE-2.3.jsonl",
    source_ledger: "/WOEK/WOEK-AUTOPILOT/LEDGERS/RECOMMENDATION-BACKFILL-LEDGER.json",
    selection_rule: "Original queue order after skipping only COMPLETED_APPROVED impact_case_id values.",
    remaining_backlog_count: remaining.length, next_batch: nextBatch,
    CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS,
  };
  assertNoLocalPath(codexImportStatus, "codex_import_status");
  assertNoLocalPath(nextHandoff, "next_batch_handoff");

  const targetStates = packageContent.transportMode === "OPTIONAL_ZIP_CONTAINER"
    ? {
        jsonl: atomicWrite(targetJsonl, packageContent.jsonl),
        markdown: atomicWrite(targetMarkdown, packageContent.markdown!),
        fach_handoff: atomicWrite(fachHandoffPath, packageContent.handoff),
      }
    : {
        jsonl: "CANONICAL_INPUT_PRESERVED",
        fach_handoff: "CANONICAL_INPUT_PRESERVED",
        ...(schemafixMode ? { ledger_reconciliation: "CANONICAL_INPUT_PRESERVED" } : { markdown: "CANONICAL_INPUT_PRESERVED" }),
      };
  const publicStore = updatePublicStore(records);
  replaceJsonAtomically(ledgerPath, { ...ledger, updated_at: now, records: updatedRecords });
  replaceJsonAtomically(codexStatusPath, codexImportStatus);
  replaceJsonAtomically(nextBatchPath, nextHandoff);
  const statusState = "WRITTEN_ATOMICALLY";
  const nextBatchState = "WRITTEN_ATOMICALLY";
  process.stdout.write(`${JSON.stringify({
    ...codexImportStatus,
    target_states: { ...targetStates, codex_import_status: statusState, next_batch: nextBatchState },
    public_store: publicStore,
    next_batch: nextBatch.map((entry) => entry.impact_case_id),
  }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
