import "server-only";

import { cache } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";

export type RecommendationStatus =
  | "PREFERRED_OPTION"
  | "PREFERRED_DESIGN"
  | "DECISION_CORRIDOR"
  | "PILOT_AND_LEARN"
  | "KEEP_CURRENT_WITH_MODIFICATIONS"
  | "STOP_OR_REVERSE"
  | "NO_ROBUST_RECOMMENDATION"
  | "OPEN";

export type RecommendationRecord = {
  recommendation_id: string;
  impact_case_id: string;
  jurisdiction_id: string;
  recommendation_status: RecommendationStatus;
  analysis_mode: "IMPACT_POTENTIAL_EX_ANTE" | "RETROSPECTIVE_DECISION_REVIEW" | "CURRENT_RECOMMENDATION_AFTER_REALITY_CHECK";
  decision_date?: string | null;
  knowledge_cutoff_date?: string | null;
  evidence_available_at_decision_time?: string[];
  evidence_only_available_later?: string[];
  hindsight_limitations?: string | null;
  problem_state: string;
  target_state: string;
  recommendation_core_summary: string;
  root_cause_or_binding_bottleneck: string;
  option_set: Array<{ option_id: string; label: string; description: string; status_quo: boolean; dimensions: Record<string, string> }>;
  woek_preferred_option: string | null;
  why_preferred: string[];
  key_tradeoffs: string[];
  cascade_effects: string[];
  system_leverage: string;
  first_order_effects: string[];
  second_order_effects: string[];
  third_order_effects: string[];
  affected_groups: string[];
  distributional_effects: string[];
  time_and_generation_effects: string[];
  resilience_effects: string[];
  transformation_effects: string[];
  rebound_spillover_leakage: string[];
  competence_scope: string;
  implementation_route: string;
  legal_constraints: string[];
  rights_and_boundary_conditions: string[];
  non_compensation_check: string;
  reversibility: string;
  resource_and_capacity_constraints: string[];
  safeguards: string[];
  monitoring_indicators: string[];
  reality_check_plan: string;
  fallback_option: string | null;
  evidence_grade: "HIGH" | "MEDIUM" | "LOW" | "NOT_ASSESSABLE";
  uncertainty: string;
  recommendation_version: string;
  supersedes_recommendation_version: string | null;
  triggering_evidence_event_ids: string[];
  public_change_summary: string;
  fach_status: "APPROVED" | "APPROVED_WITH_OPEN_DATA";
  source_refs: string[];
};

const recommendationRoot = path.join(process.cwd(), "data", "recommendations");

function readJsonl<T>(file: string): T[] {
  const content = readFileSync(path.join(recommendationRoot, file), "utf8");
  return content.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T);
}

export const getPublicRecommendations = cache(() => readJsonl<RecommendationRecord>("public/recommendations.jsonl")
  .filter((record) => record.fach_status === "APPROVED" || record.fach_status === "APPROVED_WITH_OPEN_DATA"));

export function recommendationForImpactCase(impactCaseId: string) {
  return getPublicRecommendations().find((record) => record.impact_case_id === impactCaseId) ?? null;
}

export const recommendationStatusLabels: Record<RecommendationStatus, string> = {
  PREFERRED_OPTION: "bevorzugte Option",
  PREFERRED_DESIGN: "bevorzugte Ausgestaltung",
  DECISION_CORRIDOR: "wirkungstragfähiger Entscheidungskorridor",
  PILOT_AND_LEARN: "begrenzen, erproben und lernen",
  KEEP_CURRENT_WITH_MODIFICATIONS: "mit Änderungen fortführen",
  STOP_OR_REVERSE: "stoppen oder zurücknehmen",
  NO_ROBUST_RECOMMENDATION: "keine belastbare Präferenz",
  OPEN: "fachlich offen",
};
