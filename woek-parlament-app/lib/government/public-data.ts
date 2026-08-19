import "server-only";

import { cache } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";

export type SourceRef = {
  source_event_id: string;
  source_function: string;
  title: string;
  url: string;
  published_at: string | null;
  retrieved_at: string;
  official_identifiers?: Record<string, string>;
};

export type GovernmentAction = {
  government_action_id: string;
  title: string;
  action_type: string;
  responsible_institutions: string[];
  responsible_ministries: string[];
  decision_date: string | null;
  effective_date: string | null;
  lifecycle_status: string;
  publication_status: "APPROVED";
  identity_status: "VERIFIED";
  source_provenance: "PASS";
  no_open_p0_overmerge: true;
  coverage_scope_status: string;
  official_identifiers: Record<string, unknown>;
  source_refs: SourceRef[];
  parliamentary_case_refs: string[];
  related_actions: string[];
  has_woek_analysis: boolean;
  analysis_stage: string | null;
  last_verified_at: string;
  data_version: string;
};

export type ExecutiveInstitution = {
  institution_id: string;
  institution_type: string;
  official_name: string;
  short_name: string;
  official_site: string;
  valid_from: string;
  valid_to: string | null;
  coverage_scope_status: string;
};

export type OfficeHolderAssignment = {
  assignment_id: string;
  institution_id: string;
  office_holder_name: string;
  role_label: string;
  valid_from: string;
  valid_to: string | null;
};

export type CoverageSource = {
  source_id: string;
  scope: string;
  period_start: string;
  period_end: string;
  found_records: string;
  processed_records: string;
  failed_records: string;
  found_items: string;
  processed_items: string;
  unexplained_items: string;
  coverage_status: string;
  note: string;
};

export type GovernmentPublicData = {
  actions: GovernmentAction[];
  institutions: ExecutiveInstitution[];
  assignments: OfficeHolderAssignment[];
  coverage: {
    as_of: string;
    data_version: string;
    disclaimer: string;
    counts?: {
      government_actions_total: number;
      government_actions_public: number;
      government_actions_review: number;
      multi_dip_clusters_split: number;
      superseded_ids: number;
    };
    sources: CoverageSource[];
  };
};

const dataRoot = path.join(process.cwd(), "data", "government", "public");

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(dataRoot, name), "utf8")) as T;
}

function readJsonl<T>(name: string): T[] {
  return readFileSync(path.join(dataRoot, name), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

export const getGovernmentPublicData = cache((): GovernmentPublicData => {
  const registry = readJson<{
    institutions: ExecutiveInstitution[];
    office_holder_assignments: OfficeHolderAssignment[];
  }>("executive-institutions.json");
  const actions = readJsonl<GovernmentAction>("government-actions.jsonl")
    .sort((a, b) => (b.decision_date ?? "").localeCompare(a.decision_date ?? ""));

  return {
    actions,
    institutions: registry.institutions,
    assignments: registry.office_holder_assignments,
    coverage: readJson<GovernmentPublicData["coverage"]>("coverage.json"),
  };
});

export function actionById(id: string) {
  return getGovernmentPublicData().actions.find((action) => action.government_action_id === id);
}

export function institutionById(id: string) {
  return getGovernmentPublicData().institutions.find((institution) => institution.institution_id === id);
}

export function actionsForInstitution(institution: ExecutiveInstitution) {
  const names = new Set([institution.institution_id, institution.short_name, institution.official_name]);
  return getGovernmentPublicData().actions.filter((action) =>
    [...action.responsible_institutions, ...action.responsible_ministries].some((value) => names.has(value)),
  );
}

export const actionTypeLabels: Record<string, string> = {
  CABINET_DECISION: "Kabinettsentscheidung",
  GOVERNMENT_BILL: "Regierungsentwurf",
  REGULATION: "Verordnung",
  ADMINISTRATIVE_RULE: "Verwaltungsregel",
  STRATEGY: "Strategie",
  ACTION_PLAN: "Aktionsplan",
  GOVERNMENT_PROGRAMME: "Regierungsprogramm",
  FUNDING_PROGRAMME: "Förderprogramm",
  BUDGET_ACTION: "Haushaltshandlung",
  IMPLEMENTATION_ACTION: "Umsetzungsschritt",
  PROCUREMENT_ACTION: "Beschaffung",
  STATE_OWNERSHIP_ACTION: "Beteiligungshandlung",
  INTERNATIONAL_POSITION: "Internationale Position",
  INTERNATIONAL_AGREEMENT: "Internationale Vereinbarung",
  GOVERNMENT_REPORT: "Regierungsbericht",
  GOVERNANCE_ORGANISATION: "Organisationsentscheidung",
  COMMUNICATION: "Amtliche Kommunikation",
  OTHER: "Sonstiger Regierungsakt",
};

export const lifecycleLabels: Record<string, string> = {
  ANNOUNCED: "angekündigt",
  MINISTRY_DRAFT: "Ressortentwurf",
  CONSULTATION: "Anhörung",
  CABINET_DECIDED: "im Kabinett beschlossen",
  SUBMITTED_TO_PARLIAMENT: "dem Parlament zugeleitet",
  PARLIAMENTARY_PROCESS: "im parlamentarischen Verfahren",
  ADOPTED: "beschlossen",
  PROMULGATED: "verkündet",
  IN_FORCE: "in Kraft",
  IMPLEMENTING: "in Umsetzung",
  MONITORED: "im Monitoring",
  EVALUATED: "evaluiert",
  WITHDRAWN: "zurückgezogen",
  SUPERSEDED: "abgelöst",
  UNKNOWN: "Verfahrensstand offen",
};

export const coverageLabels: Record<string, string> = {
  COMPLETE_ENUMERATED_SOURCE: "Vollständig für diesen enumerierten Quellenraum",
  BEST_EFFORT_DEFINED_SOURCE_SCOPE: "Best effort für definierte amtliche Quellen",
  PARTIAL: "Teilweise erschlossen",
  SOURCE_UNAVAILABLE: "Quelle derzeit technisch nicht verfügbar",
  UNKNOWN: "Abdeckung noch nicht bestimmt",
};

export const sourceFunctionLabels: Record<string, string> = {
  OFFICIAL_DECISION: "Amtliche Entscheidung",
  PROCEDURAL_STATUS: "Verfahrensstand",
  LEGAL_TEXT: "Rechtstext",
  CONSOLIDATED_LAW: "Konsolidiertes Recht",
  MINISTRY_DRAFT: "Ressortentwurf",
  IMPLEMENTATION_RULE: "Umsetzungsregel",
  BUDGET_DATA: "Haushaltsdaten",
  FUNDING_RULE: "Förderregel",
  MONITORING_DATA: "Monitoringdaten",
  EVALUATION: "Evaluation",
  COMMUNICATION: "Amtliche Erläuterung",
  CONTEXT: "Kontextquelle",
};

export function formatDate(value: string | null | undefined) {
  if (!value) return "Datum offen";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
}

export function readableInstitution(value: string) {
  const institution = getGovernmentPublicData().institutions.find((row) =>
    [row.institution_id, row.short_name, row.official_name].includes(value),
  );
  return institution?.official_name ?? value;
}
