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
  official_source_refs: string[];
  data_quality: string;
  attribution_status: string;
  linked_impact_case_ids: string[];
  relation_to_impact_case: string;
  what_changed_or_may_change: string;
  publication_status: "APPROVED_PUBLIC";
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
    .filter((event) => event.publication_status === "APPROVED_PUBLIC" && event.linked_impact_case_ids.includes(id))
    .sort((a, b) => a.observation_date.localeCompare(b.observation_date));
}

export function analysisUpdatesForImpactCase(id: string) {
  return readJsonl<PublicAnalysisVersionUpdate>("analysis-version-updates.jsonl")
    .filter((update) => update.fach_approval === "APPROVED_ANALYSIS_UPDATE" && update.impact_case_id === id);
}
