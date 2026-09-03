import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

export type PublicEvidenceEvent = {
  evidence_event_id: string;
  title: string;
  concise_public_summary: string;
  observation_date: string;
  publication_date: string;
  affected_state_variables: string[];
  official_source_refs: Array<string | { source: string; url: string; claim: string }>;
  source_function: string | string[];
  data_quality: string | Record<string, string>;
  attribution_status: string;
  linked_impact_case_ids: string[];
  state_observation_ids?: string[];
  relation_to_impact_case: string | string[];
  materiality: string;
  what_changed_or_may_change: string;
  publication_status: "APPROVED_PUBLIC" | "APPROVED_PUBLIC_EVIDENCE";
  notes_public?: string | null;
};

export type PublicRealityCheckCandidate = {
  reality_candidate_id: string;
  triggering_evidence_event_ids: string[];
  linked_impact_case_id: string;
  priority: string;
  relation_types: string[];
  reason_for_recheck: string;
  attribution_status: string;
  required_review_questions: string[];
  publication_status: "APPROVED_REALITY_CHECK_CANDIDATE";
};

export type PublicAnalysisVersionUpdate = {
  impact_case_id: string;
  analysis_version: string;
  supersedes_analysis_version: string;
  triggering_evidence_event_ids: string[];
  change_reason: string;
  public_change_summary: string;
  changed_fields: string[];
  fach_approval: "APPROVED_ANALYSIS_UPDATE";
};

export type StateObservation = {
  observation_id: string;
  indicator_id: string;
  definition: string;
  unit: string;
  geography: string;
  observation_period: string;
  observation_date: string;
  publication_date: string;
  value: number | string | null;
  baseline: number | string | null;
  reference: string | null;
  source_ref: string;
  source_function: string;
  data_quality: string;
  revision_status: string;
  revision: number;
};

export type OutcomeSeries = {
  outcome_series_id: string;
  indicator_id: string;
  definition: string;
  unit: string;
  geography: string;
  source_refs: string[];
  observation_ids: string[];
  status: string;
};

export type ExternalShock = {
  external_shock_id: string;
  shock_type: string;
  title: string;
  observation_date: string;
  geography: string[];
  source_refs: string[];
  attribution_status: string;
  object_type: "EXTERNAL_SHOCK";
};

function readJsonl<T>(name: string): T[] {
  try {
    return readFileSync(path.join(process.cwd(), "data", "observatory", "public", name), "utf8")
      .split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T);
  } catch {
    return [];
  }
}

export function evidenceEventsForImpactCase(id: string) {
  return readJsonl<PublicEvidenceEvent>("evidence-events.jsonl")
    .filter((event) => ["APPROVED_PUBLIC", "APPROVED_PUBLIC_EVIDENCE"].includes(event.publication_status) && event.linked_impact_case_ids.includes(id))
    .sort((a, b) => a.observation_date.localeCompare(b.observation_date));
}

export function listPublicEvidenceEvents() {
  return readJsonl<PublicEvidenceEvent>("evidence-events.jsonl")
    .filter((event) => ["APPROVED_PUBLIC", "APPROVED_PUBLIC_EVIDENCE"].includes(event.publication_status))
    .sort((a, b) => b.observation_date.localeCompare(a.observation_date));
}

export function listPublicRealityCheckCandidates() {
  return readJsonl<PublicRealityCheckCandidate>("reality-check-candidates.jsonl")
    .filter((candidate) => candidate.publication_status === "APPROVED_REALITY_CHECK_CANDIDATE");
}

export function analysisUpdatesForImpactCase(id: string) {
  return readJsonl<PublicAnalysisVersionUpdate>("analysis-version-updates.jsonl")
    .filter((update) => update.fach_approval === "APPROVED_ANALYSIS_UPDATE" && update.impact_case_id === id);
}

export function listStateObservations() {
  return readJsonl<StateObservation>("state-observations.jsonl");
}

export function listOutcomeSeries() {
  return readJsonl<OutcomeSeries>("outcome-series.jsonl");
}

export function listExternalShocks() {
  return readJsonl<ExternalShock>("external-shocks.jsonl");
}
