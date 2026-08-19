import "server-only";

import { cache } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";

export const referenceLayerIds = ["FUNDAMENTAL_RIGHTS_AND_CONSTITUTIONAL_PRINCIPLES", "STATE_GOALS_AND_OTHER_LEGAL_BINDINGS", "UN_SDG", "WOEK_SDGPLUS", "WOEK_MPD", "GERMAN_SUSTAINABLE_DEVELOPMENT_STRATEGY_2025", "SUSTAINABILITY_ACTION_PLAN_2026", "WOEK_BOUNDARIES_AND_NON_COMPENSATION", "SCIENTIFIC_THRESHOLDS_RESILIENCE_GENERATIONS"] as const;
export type ReferenceLayerId = (typeof referenceLayerIds)[number];
export type ReviewPublicationStatus = "APPROVED" | "APPROVED_WITH_OPEN_DATA";
export type TargetEffectAssessment = {
  relation_or_expected_direction: string;
  mechanism_link_or_reason: string;
  evidence_or_review_status: string;
  indicator_or_state_variable_if_reviewed: string[];
  limitations_or_open_points: string[];
  source_refs: string[];
};
export type CommonTargetRow = {
  reference_id_or_target: string;
  plain_language_target_label: string;
  actual_or_adopted_option: TargetEffectAssessment;
  woek_preferred_option?: TargetEffectAssessment;
};
export type ReferenceComparison = { layer: ReferenceLayerId; review_status: "FACH_REVIEWED" | "CANONICAL" | "OPEN"; targets: CommonTargetRow[] };
export type PublicDecisionReview = {
  impact_case_id: string;
  fach_status: ReviewPublicationStatus;
  problem_review?: { status: ReviewPublicationStatus; summary: string; evidence_boundary: string; source_refs: string[] };
  goal_review?: { status: ReviewPublicationStatus; summary: string; hierarchy: string[]; conflicts: string[]; source_refs: string[] };
  common_targets?: ReferenceComparison[];
  source_refs?: string[];
};

function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

function validTargetEffect(value: unknown): value is TargetEffectAssessment {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return [item.relation_or_expected_direction, item.mechanism_link_or_reason, item.evidence_or_review_status].every((field) => typeof field === "string" && field.trim().length > 0)
    && stringArray(item.indicator_or_state_variable_if_reviewed)
    && stringArray(item.limitations_or_open_points)
    && stringArray(item.source_refs)
    && item.source_refs.length > 0
    && item.source_refs.every((source) => /^https:\/\//i.test(source));
}

function validComparison(value: unknown): value is ReferenceComparison {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (!referenceLayerIds.includes(item.layer as ReferenceLayerId) || !["FACH_REVIEWED", "CANONICAL", "OPEN"].includes(String(item.review_status)) || !Array.isArray(item.targets)) return false;
  if (item.review_status === "OPEN") return item.targets.length === 0;
  return item.targets.length > 0 && item.targets.every((target) => {
    if (!target || typeof target !== "object" || Array.isArray(target)) return false;
    const row = target as Record<string, unknown>;
    return typeof row.reference_id_or_target === "string" && row.reference_id_or_target.length > 0
      && typeof row.plain_language_target_label === "string" && row.plain_language_target_label.length > 0
      && validTargetEffect(row.actual_or_adopted_option)
      && (row.woek_preferred_option === undefined || validTargetEffect(row.woek_preferred_option));
  });
}

function validReviewLayer(value: unknown, kind: "problem" | "goal") {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  const sourcesValid = stringArray(item.source_refs) && item.source_refs.length > 0 && item.source_refs.every((source) => /^https:\/\//i.test(source));
  const coreValid = ["APPROVED", "APPROVED_WITH_OPEN_DATA"].includes(String(item.status)) && typeof item.summary === "string" && item.summary.trim().length > 0 && sourcesValid;
  return kind === "problem"
    ? coreValid && typeof item.evidence_boundary === "string" && item.evidence_boundary.trim().length > 0
    : coreValid && stringArray(item.hierarchy) && stringArray(item.conflicts);
}

function validRecord(value: unknown): value is PublicDecisionReview {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return typeof row.impact_case_id === "string"
    && ["APPROVED", "APPROVED_WITH_OPEN_DATA"].includes(String(row.fach_status))
    && (row.problem_review === undefined || validReviewLayer(row.problem_review, "problem"))
    && (row.goal_review === undefined || validReviewLayer(row.goal_review, "goal"))
    && (row.common_targets === undefined || (Array.isArray(row.common_targets) && row.common_targets.every(validComparison)))
    && (row.source_refs === undefined || stringArray(row.source_refs));
}

export const publicDecisionReviews = cache(() => {
  const file = path.join(process.cwd(), "data", "method", "public-decision-reviews.jsonl");
  return readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as unknown).filter(validRecord);
});

export function decisionReviewForImpactCase(impactCaseId: string) {
  return publicDecisionReviews().find((record) => record.impact_case_id === impactCaseId) ?? null;
}

export const referenceLayerLabels: Record<ReferenceLayerId, string> = {
  FUNDAMENTAL_RIGHTS_AND_CONSTITUTIONAL_PRINCIPLES: "Grundrechte und Verfassungsprinzipien",
  STATE_GOALS_AND_OTHER_LEGAL_BINDINGS: "Staatsziele und rechtliche Bindungen",
  UN_SDG: "17 Ziele der Vereinten Nationen",
  WOEK_SDGPLUS: "SDG+ – WÖk-Erweiterung",
  WOEK_MPD: "Mensch · Planet · Demokratie",
  GERMAN_SUSTAINABLE_DEVELOPMENT_STRATEGY_2025: "Deutsche Nachhaltigkeitsstrategie 2025",
  SUSTAINABILITY_ACTION_PLAN_2026: "Aktionsplan Nachhaltigkeit 2026",
  WOEK_BOUNDARIES_AND_NON_COMPENSATION: "WÖk-Schutzgrenzen und Nichtkompensation",
  SCIENTIFIC_THRESHOLDS_RESILIENCE_GENERATIONS: "Wissenschaftliche Schwellen, Resilienz und Generationen",
};
