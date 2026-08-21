import "server-only";

import { cache } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";

export const referenceLayerIds = [
  "FUNDAMENTAL_RIGHTS_AND_CONSTITUTIONAL_PRINCIPLES",
  "STATE_GOALS_AND_OTHER_LEGAL_BINDINGS",
  "UN_SDG",
  "WOEK_SDGPLUS",
  "WOEK_MPD",
  "GERMAN_SUSTAINABLE_DEVELOPMENT_STRATEGY_2025",
  "SUSTAINABILITY_ACTION_PLAN_2026",
  "WOEK_BOUNDARIES_AND_NON_COMPENSATION",
  "SCIENTIFIC_THRESHOLDS_RESILIENCE_GENERATIONS",
] as const;

export type ReferenceLayerId = (typeof referenceLayerIds)[number];
export type ReviewObject = Record<string, unknown>;

export type PublicDecisionReview = ReviewObject & {
  impact_case_id: string;
  title?: string;
  fach_status?: string;
  review_status?: string;
  review_id?: string;
  review_batch_id?: string;
  review_version?: string;
  schema_version?: string;
  source_analysis_version?: string;
  reviewed_at: string;
  knowledge_cutoff_date?: string;
  problem_review: ReviewObject;
  goal_review: ReviewObject;
  official_source_refs?: string[];
};

export type PublicCommonTargetMapping = {
  target_reference_id: string;
  target_label: string;
  direction_actual: string;
  direction_woek: string;
  mechanism_rationale: string;
  evidence_grade: string;
  uncertainty: string;
  source_refs: string[];
  limitations: string[];
};

export type PublicCommonTargetReview = ReviewObject & {
  common_targets_review_id: string;
  recommendation_id: string;
  impact_case_id: string;
  review_version: string;
  reviewed_at: string;
  knowledge_cutoff_date: string;
  fach_status: string;
  common_targets_status?: string;
  not_applicable_reason?: string;
  actual_option: { option_id: string; label: string };
  woek_option: { option_id: string; label: string } | null;
  source_catalog: Record<string, string>;
  mappings: PublicCommonTargetMapping[];
  hindsight_guard: string;
  causal_attribution_disclaimer: string;
  aggregation_rule: string;
  machine_mapping_public_allowed: false;
};

const approvedReviewStatuses = new Set(["APPROVED", "APPROVED_WITH_OPEN_DATA", "REVIEWED_NOT_ASSESSABLE"]);

export function reviewObject(value: unknown): ReviewObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as ReviewObject : null;
}

export function reviewText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function publicReviewProse(value: string): string {
  return value
    .replace(/\bRecommendationRecord 2\.3\b/g, "fachlich freigegebene WÖk-Handlungsoption")
    .replace(/\bNO_ROBUST_RECOMMENDATION\b/g, "keine robuste WÖk-Handlungsoption")
    .replace(/\bwoek_preferred_option=null\b/g, "keine fachlich freigegebene WÖk-Präferenz")
    .replace(/\bReality Check oder neue RecommendationVersion\b/g, "den Reality Check oder eine neue Fassung der WÖk-Handlungsoption")
    .replace(/\bRecommendationVersion\b/g, "Fassung der WÖk-Handlungsoption");
}

export function reviewTextList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function isDecisionReview(value: unknown): value is PublicDecisionReview {
  const record = reviewObject(value);
  if (!record) return false;
  const fachStatus = reviewText(record.fach_status) ?? reviewText(record.review_status);
  const sources = [
    ...reviewTextList(reviewObject(record.problem_review)?.source_refs),
    ...reviewTextList(reviewObject(record.goal_review)?.source_refs),
    ...reviewTextList(record.official_source_refs),
  ];
  return Boolean(
    reviewText(record.impact_case_id)
    && reviewText(record.reviewed_at)
    && fachStatus
    && approvedReviewStatuses.has(fachStatus)
    && reviewObject(record.problem_review)
    && reviewObject(record.goal_review)
    && sources.some((source) => /^https:\/\//i.test(source)),
  );
}

function isCommonTargetMapping(value: unknown): value is PublicCommonTargetMapping {
  const record = reviewObject(value);
  return Boolean(record
    && [record.target_reference_id, record.target_label, record.direction_actual, record.direction_woek, record.mechanism_rationale, record.evidence_grade, record.uncertainty].every(reviewText)
    && Array.isArray(record.source_refs)
    && Array.isArray(record.limitations));
}

function isCommonTargetReview(value: unknown): value is PublicCommonTargetReview {
  const record = reviewObject(value);
  const actual = reviewObject(record?.actual_option);
  const preferred = reviewObject(record?.woek_option);
  const notApplicable = record?.common_targets_status === "NOT_APPLICABLE";
  return Boolean(record
    && [record.common_targets_review_id, record.recommendation_id, record.impact_case_id, record.review_version, record.reviewed_at, record.knowledge_cutoff_date].every(reviewText)
    && approvedReviewStatuses.has(String(record.fach_status))
    && actual && reviewText(actual.option_id) && reviewText(actual.label)
    && (notApplicable
      ? record.woek_option === null && reviewText(record.not_applicable_reason)
      : preferred && reviewText(preferred.option_id) && reviewText(preferred.label))
    && reviewObject(record.source_catalog)
    && Array.isArray(record.mappings) && (notApplicable ? record.mappings.length === 0 : record.mappings.length > 0 && record.mappings.every(isCommonTargetMapping))
    && reviewText(record.hindsight_guard)
    && reviewText(record.causal_attribution_disclaimer)
    && reviewText(record.aggregation_rule)
    && record.machine_mapping_public_allowed === false);
}

function readJsonl(file: string) {
  return readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as unknown);
}

export const publicDecisionReviews = cache(() => {
  const file = path.join(process.cwd(), "data", "method", "public-decision-reviews.jsonl");
  return readJsonl(file).filter(isDecisionReview);
});

export const publicCommonTargetReviews = cache(() => {
  const file = path.join(process.cwd(), "data", "method", "public-common-target-reviews.jsonl");
  return readJsonl(file).filter(isCommonTargetReview);
});

export function decisionReviewForImpactCase(impactCaseId: string) {
  return publicDecisionReviews().find((record) => record.impact_case_id === impactCaseId) ?? null;
}

export function commonTargetReviewForImpactCase(impactCaseId: string) {
  return publicCommonTargetReviews().find((record) => record.impact_case_id === impactCaseId) ?? null;
}

export function approvedCommonTargetLayerIdsForImpactCase(impactCaseId: string): ReferenceLayerId[] {
  const review = commonTargetReviewForImpactCase(impactCaseId);
  if (!review) return [];
  return [...new Set(review.mappings.flatMap((mapping) => {
    const disposition = `${mapping.direction_actual} ${mapping.direction_woek}`;
    if (/REVIEWED_NOT_ASSESSABLE|OPEN_REVIEW_REQUIRED|OPEN_NOT_MAPPED/.test(disposition)) return [];
    return [referenceLayerForTargetId(mapping.target_reference_id)];
  }))];
}

export function publicReviewSourceRefs(sources: unknown[]) {
  return [...new Set(sources.flatMap((value) => reviewTextList(value)).filter((source) => /^https:\/\//i.test(source)))];
}

export function reviewSourceRefs(review: PublicDecisionReview) {
  return publicReviewSourceRefs([
    review.problem_review.source_refs,
    review.goal_review.source_refs,
    review.official_source_refs,
  ]);
}

const publicSystemLabels: Record<string, string> = {
  IMPLEMENTATION: "Umsetzungsstand",
  OUTPUT: "unmittelbare Leistung",
  OUTCOME: "beobachtete Zustandsänderung",
  CONTEXT: "Kontextgröße",
  APPROVED_WITH_OPEN_DATA: "fachlich freigegeben; offene Daten sind ausgewiesen",
  REVIEWED_NOT_ASSESSABLE: "fachlich geprüft, derzeit nicht belastbar bewertbar",
  HIGH: "hoch",
  MEDIUM: "mittel",
  LOW: "gering",
  VERY_HIGH: "sehr hoch",
  HIGH_MEDIUM: "hoch bis mittel",
  MEDIUM_HIGH: "mittel bis hoch",
  MEDIUM_LOW: "mittel bis gering",
  LOW_MEDIUM: "gering bis mittel",
  LOW_TO_MEDIUM: "gering bis mittel",
  LOW_TO_MEDIUM_PORTFOLIO: "portfolioweit gering bis mittel",
  NOT_ASSESSABLE: "nicht belastbar bewertbar",
  MEDIUM_HIGH_PROCESS: "mittel bis hoch für den Prozessbefund",
  HIGH_FOR_GOVERNANCE_PROBLEM_MEDIUM_FOR_DOWNSTREAM_OUTCOMES: "hoch für das Governanceproblem, mittel für nachgelagerte Zustandsänderungen",
  HIGH_FOR_COST_RISK_MECHANISM_MEDIUM_FOR_ADDITIONALITY: "hoch für den Kostenrisiko-Mechanismus, mittel für die Additionalität",
  MEDIUM_HIGH_FOR_PROCESS_PROBLEM_MEDIUM_FOR_BINDING_BOTTLENECK: "mittel bis hoch für das Prozessproblem, mittel für den bindenden Engpass",
  HIGH_FOR_SYSTEMIC_CYBER_RISK_MEDIUM_FOR_PUBLIC_BASELINE_DETAIL: "hoch für das systemische Cyberrisiko, mittel für die öffentlich belegte Ausgangslage",
  HIGH_FOR_DIRECT_ENTITLEMENT_MEDIUM_FOR_SECOND_ORDER: "hoch für den unmittelbaren Anspruch, mittel für Wirkungen zweiter Ordnung",
  HIGH_FOR_STATE_MEDIUM_FOR_ATTRIBUTION_DESIGN: "hoch für den Zustandsbefund, mittel für das Zurechnungsdesign",
  HIGH_DIRECT_PROCESS_MECHANISM: "hoch für den unmittelbaren Prozessmechanismus",
  HIGH_FINANCIAL_MECHANISM: "hoch für den finanziellen Mechanismus",
  HIGH_FOR_PROBLEM_MEDIUM_FOR_FUTURE_EFFECT: "hoch für den Problembefund, mittel für die künftige Zustandsänderung",
  HIGH_LEGAL_MEDIUM_IMPLEMENTATION: "hoch für die Rechtslage, mittel für die Umsetzung",
  MEDIUM_HIGH_FOR_THREAT_LOW_MEDIUM_FOR_INTERVENTION_OUTCOME: "mittel bis hoch für die Gefährdungslage, gering bis mittel für das Ergebnis der Intervention",
  HIGH_FOR_PROBLEM_MEDIUM_FOR_EU_ADDITIONALITY: "hoch für den Problembefund, mittel für die Additionalität auf EU-Ebene",
  HIGH_FOR_TRANSITION_MEDIUM_FOR_POLICY_ADDITIONALITY: "hoch für den Übergangsmechanismus, mittel für die politische Additionalität",
  TERMINAL_STATE_GOAL: "angestrebter Zielzustand",
  INTERMEDIATE_GOAL: "Zwischenziel",
  INSTRUMENT_GOAL: "Instrumentenziel",
  OPEN: "fachlich noch offen",
  OPEN_REVIEW_REQUIRED: "fachliche Zuordnung noch offen",
  OPEN_NOT_MAPPED: "fachlich geprüft, noch nicht zugeordnet",
  NOT_APPLICABLE_EU_LEVEL: "auf EU-Ebene nicht anwendbar",
  NOT_APPLICABLE_EU_LAYER: "auf EU-Ebene nicht anwendbar",
  NO_SEPARATELY_VERIFIED_GOAL_STATE_IN_CURRENT_FACH_RECORD: "im aktuellen Fachdatensatz kein eigenständig belegter Zielzustand",
  PORTFOLIO_HAS_NO_SINGLE_SEPARATELY_VERIFIED_PROBLEM_CLAIM: "für das Gesamtportfolio liegt keine einzelne, separat verifizierte Problembehauptung vor",
  NO_ROBUST_GOAL_JUDGMENT: "keine belastbare Zielbeurteilung",
  NO_ROBUST_PROBLEM_JUDGMENT: "keine belastbare einheitliche Problembeurteilung",
  PROBLEM_WELL_SUPPORTED: "Problem fachlich gut belegt",
  PROBLEM_PARTIALLY_SUPPORTED: "Problem teilweise belegt",
  PROBLEM_IS_RISK_NOT_CURRENT_STATE: "Risikolage, kein bereits eingetretener Zustand",
  SYMPTOM_NOT_ROOT_CAUSE: "Symptom beschrieben; bindende Ursache nicht belegt",
  GOAL_SUPPORTED: "Ziel fachlich problemadäquat",
  GOAL_NEEDS_REFINEMENT: "Ziel muss fachlich präzisiert werden",
  GOAL_LEGALLY_CONSTRAINED: "Ziel ist rechtlich begrenzt",
  GOAL_INSTRUMENT_MASQUERADING_AS_GOAL: "Instrument wird als Ziel formuliert",
  CAPACITY_PROBLEM: "Kapazitätsproblem",
  DATA_GOVERNANCE_PROBLEM: "Daten- und Governanceproblem",
  DISTRIBUTION_PROBLEM: "Verteilungsproblem",
  ENVIRONMENTAL_RISK: "Umweltrisiko",
  FRAME_DEPENDENT_PROBLEM: "vom Deutungsrahmen abhängige Problembehauptung",
  HEALTH_SAFETY_PROBLEM: "Gesundheits- und Sicherheitsproblem",
  INSTITUTIONAL_CAPACITY_PROBLEM: "institutionelles Kapazitätsproblem",
  LEGAL_CAPACITY_PROBLEM: "rechtliches Kapazitätsproblem",
  PERCEIVED_PROBLEM: "wahrgenommenes Problem",
  RESOURCE_PROBLEM: "Ressourcenproblem",
  RIGHTS_PROBLEM: "Rechts- und Schutzproblem",
  RISK_PROBLEM: "Risikolage",
  STATE_PROBLEM: "beobachteter Zustandsbefund",
  SYSTEMIC_RISK: "systemisches Risiko",
  TREND_PROBLEM: "problematische Entwicklung",
  VERY_HIGH_CLIMATE_NATURE: "sehr hohe Klima- und Naturrelevanz",
  VERY_HIGH_HEALTH_SOCIAL_FINANCE: "sehr hohe Relevanz für Gesundheit, Soziales und Finanzierung",
  VERY_HIGH_INTERGENERATIONAL: "sehr hohe generationenübergreifende Relevanz",
  VERY_HIGH_DEMOCRATIC: "sehr hohe demokratische Relevanz",
  VERY_HIGH_SOCIAL: "sehr hohe soziale Relevanz",
  VERY_HIGH_RIGHTS_GOVERNANCE: "sehr hohe Rechts- und Governancerelevanz",
  VERY_HIGH_RIGHTS_SECURITY: "sehr hohe Grundrechts- und Sicherheitsrelevanz",
  HIGH_SYSTEMIC: "hohe systemische Relevanz",
  AMBIVALENT_CONDITIONAL: "gegenläufige Wirkungsrichtungen unter Bedingungen",
  AMBIVALENT_CONDITIONAL_WITH_HARD_RISK: "gegenläufige Wirkungsrichtungen mit materiellem Schutzrisiko",
  AMBIVALENT_CONDITIONAL_WITH_RIGHTS_RISK: "gegenläufige Wirkungsrichtungen mit Grundrechtsrisiko",
  AMBIVALENT_ACCESS_RISK: "gegenläufige Wirkungsrichtungen mit Zugangsrisiko",
  BOUNDARY_PROTECTIVE_DESIGN: "Ausgestaltung schützt eine nicht kompensierbare Grenze",
  NEGATIVE_RISK_CONDITIONAL: "materielles Wirkungsrisiko unter Bedingungen",
  NEGATIVE_RISK_IF_ADMIN_BARRIER: "Risiko bei zusätzlichen Verwaltungshürden",
  NEGATIVE_RISK_IF_FOSSIL_LOCKIN: "Risiko eines fossilen Lock-ins",
  NEGATIVE_RISK_IF_SANCTION_DOMINANT: "Risiko bei sanktionsdominierter Ausgestaltung",
  NEGATIVE_RISK_IF_LOW_TAKEUP_OR_SEQUENCE_LOSS: "Risiko bei geringer Inanspruchnahme oder Verlust der Wirkungsabfolge",
  OPEN_CONDITIONAL: "Wirkungsrichtung unter den Bedingungen noch offen",
  POSITIVE_POTENTIAL: "positives Wirkungspotenzial",
  POSITIVE_POTENTIAL_CONDITIONAL: "positives Wirkungspotenzial unter Bedingungen",
  POSITIVE_POTENTIAL_IMPLEMENTATION_DEPENDENT: "positives, umsetzungsabhängiges Wirkungspotenzial",
  POSITIVE_POTENTIAL_WEAK_NATIONAL_LINK: "positives Potenzial bei schwachem nationalem Messbezug",
  POSITIVE_POTENTIAL_WITH_CONCENTRATION_RISK: "positives Potenzial mit Konzentrationsrisiko",
  POSITIVE_POTENTIAL_WITH_COST_RISK: "positives Potenzial mit Kostenrisiko",
  POSITIVE_POTENTIAL_WITH_IMPLEMENTATION_RISK: "positives Potenzial mit Umsetzungsrisiko",
  POSITIVE_POTENTIAL_WITH_NET_ZUBAU_RISK: "positives Potenzial mit Risiko für den Nettozubau",
  POSITIVE_POTENTIAL_WITH_QUALITY_RISK: "positives Potenzial mit Qualitätsrisiko",
  POSITIVE_POTENTIAL_WITH_SAFETY_AND_CAPACITY_RISK: "positives Potenzial mit Sicherheits- und Kapazitätsrisiken",
  POSITIVE_POTENTIAL_WITH_CAPACITY_RISK: "positives Potenzial mit Kapazitätsrisiko",
  POSITIVE_POTENTIAL_WITH_DISTRIBUTION_AND_SEQUENCE_RISK: "positives Potenzial mit Verteilungs- und Abfolgerisiko",
  POSITIVE_POTENTIAL_LONG_HORIZON_CONDITIONAL: "langfristiges positives Potenzial unter Bedingungen",
  POSITIVE_POTENTIAL_WEAK_LONG_HORIZON_LINK: "positives Potenzial bei schwachem langfristigem Wirkungsbezug",
  POSITIVE_POTENTIAL_WITH_SEQUENCE_RISK: "positives Potenzial mit Abfolgerisiko",
  NO_DIRECT_UN_SDG_MAPPING_REQUIRED_FOR_TIERWOHL: "kein unmittelbarer UN-SDG-Bezug für Tierwohl fachlich freigegeben",
  OPEN_REVIEW_REQUIRED_PER_MISSION: "Zuordnung je Mission fachlich noch offen",
  OPEN_REVIEW_REQUIRED_TIERSCHUTZ: "SDG+-Zuordnung zum Tierschutz fachlich noch offen",
};

export function publicReviewSystemLabel(value: unknown) {
  const text = reviewText(value);
  if (!text) return null;
  if (!/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(text)) return text;
  return publicSystemLabels[text] ?? "Öffentliche Klartextzuordnung fachlich noch offen";
}

export function referenceLayerForTargetId(targetId: string): ReferenceLayerId {
  if (/^MPD-/.test(targetId)) return "WOEK_MPD";
  if (/^UN-SDG-/.test(targetId)) return "UN_SDG";
  if (/^DNS-/.test(targetId)) return "GERMAN_SUSTAINABLE_DEVELOPMENT_STRATEGY_2025";
  if (/^BOUNDARY-/.test(targetId)) return "WOEK_BOUNDARIES_AND_NON_COMPENSATION";
  if (/^RESILIENCE-/.test(targetId)) return "SCIENTIFIC_THRESHOLDS_RESILIENCE_GENERATIONS";
  if (/^(GG-|RIGHTS-|REF-NON-REFOULEMENT|EU-REG-)/.test(targetId)) return "FUNDAMENTAL_RIGHTS_AND_CONSTITUTIONAL_PRINCIPLES";
  if (/^(DE-|PRINCIPLE-)/.test(targetId)) return "STATE_GOALS_AND_OTHER_LEGAL_BINDINGS";
  return "WOEK_SDGPLUS";
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
