export type RealityTrigger =
  | "NEW_EVALUATION"
  | "OUTCOME_VALUE"
  | "REVIEW_DATE"
  | "RISK_MATERIALIZED"
  | "POSITIVE_POTENTIAL_MATERIALIZED"
  | "BASELINE_CHANGE"
  | "CONTEXT_CHANGE"
  | "EXTERNAL_SHOCK";

export function requiresPublicEvidenceForAnalysisChange(update: {
  analysis_version: string;
  supersedes_analysis_version: string;
  triggering_evidence_event_ids: string[];
  public_change_summary: string;
}) {
  return Boolean(
    update.analysis_version &&
    update.supersedes_analysis_version &&
    update.public_change_summary.trim() &&
    update.triggering_evidence_event_ids.length,
  );
}

export function realityCheckTrigger(trigger: RealityTrigger, linkedImpactCaseIds: string[]) {
  return linkedImpactCaseIds.length > 0 && Boolean(trigger);
}

export function nextObservationRevision(current: {
  observation_id: string;
  revision: number;
}, replacementObservationId: string) {
  if (!replacementObservationId || replacementObservationId === current.observation_id) {
    throw new Error("OBSERVATION_REVISION_REQUIRES_NEW_STABLE_ID");
  }
  return {
    observation_id: replacementObservationId,
    revision: current.revision + 1,
    supersedes_observation_id: current.observation_id,
    revision_status: "REVISED" as const,
  };
}

export function attributionFromTemporalCoOccurrence() {
  return "OPEN" as const;
}

export function observationRequiresEvidenceEvent(materiality: "ROUTINE_OBSERVATION" | "MATERIAL" | "MATERIAL_EARLY_WARNING") {
  return materiality !== "ROUTINE_OBSERVATION";
}
