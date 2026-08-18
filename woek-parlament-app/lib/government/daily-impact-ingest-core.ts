import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import Ajv2020, { type ErrorObject } from "ajv/dist/2020";
import addFormats from "ajv-formats";

export const dailyFilePattern = /^GOVERNMENT-DAILY-(\d{4}-\d{2}-\d{2})\.jsonl$/;

export type Direction = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "AMBIVALENT" | "OPEN";
export type FachReviewStatus = "APPROVED" | "APPROVED_WITH_OPEN_DATA" | "OPEN" | "SUPERSEDED";

export type WoeKImpactCase = {
  impact_case_id: string;
  title: string;
  analysis_mode: "IMPACT_POTENTIAL_EX_ANTE" | "IMPACT_REALITY_CHECK";
  publication_analysis_status: "FULL_WOEK_ANALYSIS" | "STANDARD_WOEK_ANALYSIS" | "REALITY_CHECK" | "BOUNDARY_REVIEW" | "NO_INDEPENDENT_EFFECT_OBJECT" | "OPEN_ANALYSIS";
  analysis_version: string;
  supersedes_analysis_version?: string | null;
  linked_objects: {
    government_action_ids: string[];
    parliament_case_ids: string[];
    legal_act_ids: string[];
    implementation_object_ids: string[];
    programme_ids: string[];
    source_event_ids: string[];
  };
  scope: { analysis_as_of: string; implementation_state: string; [key: string]: unknown };
  materiality: { level: "HIGH" | "MEDIUM" | "LOW" | "OPEN"; [key: string]: unknown };
  impact_summary: {
    overall_character: string;
    central_lever: string;
    strongest_positive_potential: string;
    main_risk_or_tradeoff: string;
    direction_dependencies: string;
    measurement_priority: string;
    public_summary: string;
    [key: string]: unknown;
  };
  evidence_summary: {
    fact_evidence: string;
    mechanism_evidence: string;
    effect_evidence: string;
    uncertainty: string;
    decision_time_evidence_boundary: string;
  };
  impact_paths: Array<{
    path_id: string;
    direction: Direction;
    evidence: string;
    data_status: string;
    mpd: string[];
    sdg_refs?: string[];
    sdg_plus_refs?: string[];
    legal_refs?: string[];
    [key: string]: unknown;
  }>;
  boundary_review: Array<{ boundary_id: string; status: "PASS" | "WATCH" | "BLOCK" | "OPEN"; [key: string]: unknown }>;
  data_needs: Array<{ priority: "P0" | "P1" | "P2"; [key: string]: unknown }>;
  reality_check: { status: string; [key: string]: unknown };
  references: { official_fact_sources: string[]; mechanism_sources: string[]; post_decision_sources: string[] };
  fach_review: { status: FachReviewStatus; reviewer: string; reviewed_at: string; open_questions: string[]; [key: string]: unknown };
  method_version: string;
  [key: string]: unknown;
};

export type ImpactCaseHistoryEntry = {
  impact_case_id: string;
  analysis_version: string;
  supersedes_analysis_version: string | null;
  source_file: string;
  source_hash: string;
  ingested_at: string;
  classification: "NEW_IMPACT_CASE" | "UPDATED_IMPACT_CASE" | "LIFECYCLE_UPDATE" | "REALITY_CHECK_UPDATE" | "FACT_ONLY";
  record: WoeKImpactCase;
};

export type LedgerEntry = {
  date: string;
  source_file: string;
  source_hash: string;
  ingested_at: string;
  impact_cases_new: number;
  impact_cases_updated: number;
  lifecycle_updates: number;
  reality_check_updates: number;
  fact_only_objects: number;
  open_data_issues: number;
  schema_errors: number;
  deploy_commit: string | null;
  deploy_status: "NOT_REQUIRED" | "BLOCKED" | "REQUESTED" | "DEPLOYED" | "FAILED";
  expected_public_hash?: string | null;
  public_items?: Array<{
    title: string;
    summary: string;
    url: string;
    section: "WIRKUNGSANALYSE" | "REALITY_CHECK" | "ABSTIMMUNG" | "LEBENSZYKLUS" | "KORREKTUR";
    topics: Array<"ALL_UPDATES" | "UPCOMING_DECISIONS" | "PUBLISHED_CHECKS" | "CORRECTIONS" | "HEALTH_CARE" | "HOUSING" | "WORK_AND_SKILLS" | "CLIMATE_AND_ENERGY" | "DEMOCRACY_AND_DIGITAL">;
  }>;
  digest_status?: "PENDING" | "SENT" | "FAILED" | "NOT_APPLICABLE";
};

export type DailyIngestState = {
  schema_version: "1.0";
  updated_at: string | null;
  ledger: LedgerEntry[];
  history: ImpactCaseHistoryEntry[];
  review_queue: ReviewQueueItem[];
};

export type ReviewQueueItem = {
  task_id: string;
  date: string;
  source_file: string;
  kind: "SCHEMA_ERROR" | "OPEN_DATA_ISSUE" | "FACH_REVIEW_REQUIRED" | "LINKAGE_REVIEW_REQUIRED" | "FILE_CONFLICT";
  target_release: "GOVERNMENT_DATA_1.2_PLUS" | "FACHRELEASE_2.0" | "TECHNICAL_INGEST";
  impact_case_id: string | null;
  description: string;
  status: "OPEN";
  created_at: string;
};

export type DeploymentGates = {
  data_1_2_validation: "PASS" | "FAIL";
  known_overmerge_regressions?: "PASS" | "FAIL";
  public_export: "PASS" | "FAIL";
  fach_import?: "PASS" | "FAIL";
  source_vs_view?: "PASS" | "FAIL";
  semantic_ui: "PASS" | "FAIL";
  accessibility?: "PASS" | "FAIL";
  build?: "PASS" | "FAIL";
  privacy?: "PASS" | "FAIL";
  background_automation?: "PASS" | "FAIL";
  freshness?: "PASS" | "FAIL";
  p0_source_adapters?: "PASS" | "FAIL";
  source_vs_view_staging?: "PASS" | "FAIL";
  external_re_audit?: "PASS" | "FAIL";
  updated_at: string;
  note: string;
};

export type DailyBundle = {
  date: string;
  jsonl: { name: string; content: string; hash: string };
  markdown: { name: string; content: string; hash: string };
  sources: { name: string; content: string; hash: string };
};

export type DailyRunReport = {
  DATE: string;
  FILES_FOUND: number;
  FILES_NEW: number;
  SCHEMA_VALID: boolean;
  NEW_IMPACT_CASES: number;
  UPDATED_IMPACT_CASES: number;
  LIFECYCLE_UPDATES: number;
  REALITY_CHECK_UPDATES: number;
  FACT_ONLY: number;
  OPEN_DATA_ISSUES: number;
  OPEN_FACH_REVIEWS: number;
  DEPLOYED: boolean;
  DEPLOY_COMMIT: string | null;
  blockers: string[];
  validation_errors: Array<{ line: number; impact_case_id: string | null; errors: string[] }>;
};

const schemaPath = path.join(process.cwd(), "data", "government", "impact-cases", "WOEK-IMPACT-CASE-SCHEMA-2.0.1.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile<WoeKImpactCase>(schema);

export function emptyDailyIngestState(): DailyIngestState {
  return { schema_version: "1.0", updated_at: null, ledger: [], history: [], review_queue: [] };
}

export function reviewTasksFromReport(report: DailyRunReport, sourceFile: string, now: string): ReviewQueueItem[] {
  const tasks: ReviewQueueItem[] = [];
  const add = (kind: ReviewQueueItem["kind"], target: ReviewQueueItem["target_release"], description: string, impactCaseId: string | null) => {
    tasks.push({
      task_id: `government-review-${sha256(`${sourceFile}\n${kind}\n${impactCaseId ?? ""}\n${description}`).slice(0, 20)}`,
      date: report.DATE,
      source_file: sourceFile,
      kind,
      target_release: target,
      impact_case_id: impactCaseId,
      description,
      status: "OPEN",
      created_at: now,
    });
  };
  for (const error of report.validation_errors) {
    add("SCHEMA_ERROR", "FACHRELEASE_2.0", `Zeile ${error.line}: ${error.errors.join(" | ")}`, error.impact_case_id);
  }
  for (const blocker of report.blockers) {
    const id = blocker.match(/^(WOEK-[^:]+):/)?.[1] ?? null;
    if (/gleichem Namen mit verändertem Hash/.test(blocker)) add("FILE_CONFLICT", "TECHNICAL_INGEST", blocker, id);
    else if (/Overmerge|Datenblocker|GovernmentAction-Verknüpfung|ParliamentaryCase-Verknüpfung/.test(blocker)) add("OPEN_DATA_ISSUE", "GOVERNMENT_DATA_1.2_PLUS", blocker, id);
    else if (/fach_review/.test(blocker)) add("FACH_REVIEW_REQUIRED", "FACHRELEASE_2.0", blocker, id);
    else if (!blocker.startsWith("Globale Deployment-Gates")) add("LINKAGE_REVIEW_REQUIRED", "TECHNICAL_INGEST", blocker, id);
  }
  return tasks;
}

export function sha256(content: string) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function governmentPublicStateHash(history: ImpactCaseHistoryEntry[]) {
  const latest = latestVersions(history);
  const records = [...latest.values()]
    .map((entry) => entry.record)
    .filter((record) => publicationAllowed(record))
    .sort((a, b) => a.impact_case_id.localeCompare(b.impact_case_id));
  return sha256(JSON.stringify(records));
}

function validationMessages(errors: ErrorObject[] | null | undefined) {
  return (errors ?? []).map((error) => `${error.instancePath || "/"}: ${error.message ?? error.keyword}`);
}

export function parseImpactCaseJsonl(content: string) {
  const lines = content.split(/\r?\n/);
  const records: Array<{ line: number; value: WoeKImpactCase }> = [];
  const errors: DailyRunReport["validation_errors"] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index].trim();
    if (!raw) continue;
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch (error) {
      errors.push({ line: index + 1, impact_case_id: null, errors: [`Ungültiges JSON: ${error instanceof Error ? error.message : "Parsefehler"}`] });
      continue;
    }
    if (!validate(value)) {
      const candidate = value as { impact_case_id?: unknown };
      errors.push({
        line: index + 1,
        impact_case_id: typeof candidate.impact_case_id === "string" ? candidate.impact_case_id : null,
        errors: validationMessages(validate.errors),
      });
      continue;
    }
    records.push({ line: index + 1, value });
  }
  return { records, errors };
}

function latestVersions(history: ImpactCaseHistoryEntry[]) {
  const byId = new Map<string, ImpactCaseHistoryEntry>();
  for (const entry of history) byId.set(entry.impact_case_id, entry);
  return byId;
}

function sourceReferencesPresent(record: WoeKImpactCase) {
  if (record.references.official_fact_sources.length === 0) return false;
  if (record.publication_analysis_status === "NO_INDEPENDENT_EFFECT_OBJECT") return true;
  return record.references.mechanism_sources.length > 0;
}

function publicationAllowed(record: WoeKImpactCase) {
  return record.fach_review.status === "APPROVED" || record.fach_review.status === "APPROVED_WITH_OPEN_DATA";
}

export function globalGatesPass(gates: DeploymentGates) {
  const currentKeys: Array<keyof DeploymentGates> = [
    "data_1_2_validation",
    "known_overmerge_regressions",
    "public_export",
    "fach_import",
    "source_vs_view",
    "semantic_ui",
    "accessibility",
    "build",
    "privacy",
    "background_automation",
  ];
  if (gates.known_overmerge_regressions !== undefined) return currentKeys.every((key) => gates[key] === "PASS");
  const legacyKeys: Array<keyof DeploymentGates> = [
    "data_1_2_validation", "freshness", "p0_source_adapters", "public_export",
    "source_vs_view_staging", "semantic_ui", "external_re_audit",
  ];
  return legacyKeys.every((key) => gates[key] === "PASS");
}

export function processDailyBundle(input: {
  bundle: DailyBundle;
  state: DailyIngestState;
  gates: DeploymentGates;
  knownGovernmentActionIds: Set<string>;
  knownParliamentCaseIds?: Set<string>;
  blockedObjectIds: Set<string>;
  now: string;
}) {
  const { bundle, state, gates, knownGovernmentActionIds, knownParliamentCaseIds, blockedObjectIds, now } = input;
  const report: DailyRunReport = {
    DATE: bundle.date,
    FILES_FOUND: 3,
    FILES_NEW: 3,
    SCHEMA_VALID: true,
    NEW_IMPACT_CASES: 0,
    UPDATED_IMPACT_CASES: 0,
    LIFECYCLE_UPDATES: 0,
    REALITY_CHECK_UPDATES: 0,
    FACT_ONLY: 0,
    OPEN_DATA_ISSUES: 0,
    OPEN_FACH_REVIEWS: 0,
    DEPLOYED: false,
    DEPLOY_COMMIT: null,
    blockers: [],
    validation_errors: [],
  };

  const previousFile = state.ledger.find((entry) => entry.source_file === bundle.jsonl.name);
  if (previousFile) {
    report.FILES_NEW = 0;
    if (previousFile.source_hash !== bundle.jsonl.hash) {
      report.blockers.push(`STOP: ${bundle.jsonl.name} wurde unter gleichem Namen mit verändertem Hash geliefert.`);
      report.OPEN_DATA_ISSUES += 1;
      return { state, report, deployAllowed: false, accepted: [] as ImpactCaseHistoryEntry[] };
    }
    return { state, report, deployAllowed: false, accepted: [] as ImpactCaseHistoryEntry[] };
  }

  const noNewEffectCases = /\bNO_NEW_EFFECT_BEARING_CASES\b/.test(bundle.markdown.content);
  const parsed = parseImpactCaseJsonl(bundle.jsonl.content);
  report.validation_errors = parsed.errors;
  report.SCHEMA_VALID = parsed.errors.length === 0;
  if (parsed.errors.length > 0) report.blockers.push(`${parsed.errors.length} Schema-/JSON-Fehler in ${bundle.jsonl.name}.`);
  if (noNewEffectCases && parsed.records.length > 0) {
    report.blockers.push("NO_NEW_EFFECT_BEARING_CASES widerspricht nichtleerem JSONL.");
  }
  if (!noNewEffectCases && parsed.records.length === 0 && parsed.errors.length === 0) {
    report.blockers.push("Leere Tagesübergabe ohne NO_NEW_EFFECT_BEARING_CASES.");
  }

  const idsInFile = new Set<string>();
  const latest = latestVersions(state.history);
  const accepted: ImpactCaseHistoryEntry[] = [];

  for (const { line, value: record } of parsed.records) {
    if (idsInFile.has(record.impact_case_id)) {
      report.blockers.push(`Doppelte impact_case_id ${record.impact_case_id} in Zeile ${line}.`);
      continue;
    }
    idsInFile.add(record.impact_case_id);
    if (record.scope.analysis_as_of !== bundle.date) {
      report.blockers.push(`${record.impact_case_id}: analysis_as_of ${record.scope.analysis_as_of} stimmt nicht mit ${bundle.date} überein.`);
    }
    if (!sourceReferencesPresent(record)) {
      report.blockers.push(`${record.impact_case_id}: erforderliche Fakten-/Mechanismusquellen fehlen.`);
    }
    if (record.boundary_review.length === 0 && record.publication_analysis_status !== "NO_INDEPENDENT_EFFECT_OBJECT") {
      report.blockers.push(`${record.impact_case_id}: boundary_review fehlt.`);
    }
    if (!publicationAllowed(record)) {
      report.OPEN_FACH_REVIEWS += 1;
      report.blockers.push(`${record.impact_case_id}: fach_review ${record.fach_review.status} erlaubt keine Veröffentlichung.`);
    }

    const allLinkedIds = Object.values(record.linked_objects).flat();
    const blockedLinks = allLinkedIds.filter((id) => blockedObjectIds.has(id));
    if (blockedLinks.length > 0) {
      report.OPEN_DATA_ISSUES += 1;
      report.blockers.push(`${record.impact_case_id}: bestätigte Overmerge-/Datenblocker ${blockedLinks.join(", ")}.`);
    }
    const unresolvedGovernment = record.linked_objects.government_action_ids.filter((id) => !knownGovernmentActionIds.has(id));
    if (unresolvedGovernment.length > 0) {
      report.OPEN_DATA_ISSUES += 1;
      report.blockers.push(`${record.impact_case_id}: GovernmentAction-Verknüpfung offen: ${unresolvedGovernment.join(", ")}.`);
    }
    if (knownParliamentCaseIds) {
      const unresolvedParliament = record.linked_objects.parliament_case_ids.filter((id) => !knownParliamentCaseIds.has(id));
      if (unresolvedParliament.length > 0) {
        report.OPEN_DATA_ISSUES += 1;
        report.blockers.push(`${record.impact_case_id}: ParliamentaryCase-Verknüpfung offen: ${unresolvedParliament.join(", ")}.`);
      }
    }

    const prior = latest.get(record.impact_case_id);
    let classification: ImpactCaseHistoryEntry["classification"];
    if (!prior) {
      classification = record.publication_analysis_status === "NO_INDEPENDENT_EFFECT_OBJECT" ? "FACT_ONLY" : "NEW_IMPACT_CASE";
      if (classification === "NEW_IMPACT_CASE") report.NEW_IMPACT_CASES += 1;
      else report.FACT_ONLY += 1;
    } else if (prior.analysis_version === record.analysis_version) {
      report.blockers.push(`${record.impact_case_id}: Analyseversion ${record.analysis_version} existiert bereits.`);
      continue;
    } else if (record.supersedes_analysis_version !== prior.analysis_version) {
      report.blockers.push(`${record.impact_case_id}: supersedes_analysis_version muss ${prior.analysis_version} referenzieren.`);
      continue;
    } else if (record.analysis_mode === "IMPACT_REALITY_CHECK") {
      classification = "REALITY_CHECK_UPDATE";
      report.REALITY_CHECK_UPDATES += 1;
    } else if (record.publication_analysis_status === "NO_INDEPENDENT_EFFECT_OBJECT") {
      classification = "LIFECYCLE_UPDATE";
      report.LIFECYCLE_UPDATES += 1;
    } else {
      classification = "UPDATED_IMPACT_CASE";
      report.UPDATED_IMPACT_CASES += 1;
    }

    accepted.push({
      impact_case_id: record.impact_case_id,
      analysis_version: record.analysis_version,
      supersedes_analysis_version: record.supersedes_analysis_version ?? null,
      source_file: bundle.jsonl.name,
      source_hash: bundle.jsonl.hash,
      ingested_at: now,
      classification,
      record,
    });
  }

  if (!globalGatesPass(gates)) {
    const failed = Object.entries(gates).filter(([key, value]) => !["updated_at", "note"].includes(key) && value === "FAIL").map(([key]) => key);
    report.blockers.push(`Globale Deployment-Gates nicht grün: ${failed.join(", ")}.`);
  }

  const technicalValidationPassed = report.blockers.filter((item) => !item.startsWith("Globale Deployment-Gates")).length === 0;
  const nextState = technicalValidationPassed ? {
    ...state,
    updated_at: now,
    history: [...state.history, ...accepted],
  } : state;

  return {
    state: nextState,
    report,
    accepted: technicalValidationPassed ? accepted : [],
    deployAllowed: technicalValidationPassed && accepted.length > 0 && globalGatesPass(gates),
  };
}

export function coverageFromHistory(history: ImpactCaseHistoryEntry[], factActionsPublic: number) {
  const latest = latestVersions(history);
  const records = [...latest.values()].map((entry) => entry.record);
  const assessed = records.filter((record) => ["FULL_WOEK_ANALYSIS", "STANDARD_WOEK_ANALYSIS", "REALITY_CHECK", "BOUNDARY_REVIEW"].includes(record.publication_analysis_status));
  const high = records.filter((record) => record.materiality.level === "HIGH");
  const highAssessed = high.filter((record) => assessed.includes(record));
  const mature = records.filter((record) => record.scope.implementation_state === "MATURE_IMPLEMENTATION" || record.scope.implementation_state === "EVALUATED");
  const matureChecked = mature.filter((record) => record.analysis_mode === "IMPACT_REALITY_CHECK");
  return {
    fact_actions_public: factActionsPublic,
    effect_bearing_candidates: records.filter((record) => record.publication_analysis_status !== "NO_INDEPENDENT_EFFECT_OBJECT").length,
    impact_cases_total: records.length,
    impact_cases_full_analysis: records.filter((record) => record.publication_analysis_status === "FULL_WOEK_ANALYSIS").length,
    impact_cases_standard_analysis: records.filter((record) => record.publication_analysis_status === "STANDARD_WOEK_ANALYSIS").length,
    impact_cases_boundary_review: records.filter((record) => record.publication_analysis_status === "BOUNDARY_REVIEW").length,
    impact_cases_reality_check: records.filter((record) => record.publication_analysis_status === "REALITY_CHECK").length,
    impact_cases_fact_only_lifecycle_objects: records.filter((record) => record.publication_analysis_status === "NO_INDEPENDENT_EFFECT_OBJECT").length,
    high_materiality_cases_total: high.length,
    high_materiality_cases_analyzed: highAssessed.length,
    high_materiality_coverage_percent: high.length ? Math.round((highAssessed.length / high.length) * 10_000) / 100 : null,
    reality_check_mature_cases_total: mature.length,
    reality_check_mature_cases_checked: matureChecked.length,
    reality_check_coverage_percent: mature.length ? Math.round((matureChecked.length / mature.length) * 10_000) / 100 : null,
    open_fach_questions: records.reduce((sum, record) => sum + record.fach_review.open_questions.length, 0),
    open_data_needs: records.reduce((sum, record) => sum + record.data_needs.length, 0),
    open_boundary_reviews: records.reduce((sum, record) => sum + record.boundary_review.filter((boundary) => boundary.status === "OPEN").length, 0),
  };
}
