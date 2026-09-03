import type { WoeKImpactCase } from "@/lib/government/impact-cases";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import type { OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import { executiveImpactSummarySchema, type ExecutiveEvidence, type ExecutiveImpactSummary, type ImpactDimensionSummary } from "./contracts";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function evidenceFor(values: string[]): ExecutiveEvidence {
  const filtered = unique(values).filter((value): value is ExecutiveEvidence => ["HIGH", "MEDIUM", "LOW", "NOT_ASSESSABLE"].includes(value));
  return filtered.length === 1 ? filtered[0] : "NOT_ASSESSABLE";
}

function aggregateDirection(values: Array<WoeKImpactCase["impact_paths"][number]["direction"]>): ExecutiveImpactSummary["mpd"]["human"]["direction"] {
  const directions = new Set(values);
  if (directions.has("OPEN")) return "OPEN";
  if (directions.size === 1) return [...directions][0] ?? "OPEN";
  if (directions.has("POSITIVE") && directions.has("NEGATIVE")) return "AMBIVALENT";
  if (directions.has("AMBIVALENT")) return "AMBIVALENT";
  if (directions.has("NEUTRAL") && directions.size > 1) return "AMBIVALENT";
  return "OPEN";
}

function dimension(record: WoeKImpactCase, key: "MENSCH" | "PLANET" | "DEMOKRATIE"): ImpactDimensionSummary {
  const paths = record.impact_paths.filter((path) => path.mpd.includes(key));
  const changes = unique(paths.map((path) => path.state_change));
  return {
    direction: "OPEN",
    materiality: "OPEN",
    evidence: paths.length ? evidenceFor(paths.map((path) => path.evidence)) : "NOT_ASSESSABLE",
    headline: changes.length === 1 ? changes[0] : changes.length ? `${changes.length} getrennte, freigegebene Zustandsänderungen` : "Keine freigegebene Zuordnung",
    state_changes: changes,
    rationale: changes.length
      ? "Die Zustandsänderungen stammen ausschließlich aus den diesem MPD-Bereich ausdrücklich zugeordneten Fachpfaden. Eine domänenweite Richtung und Materialität bleiben ohne eigene fachlich freigegebene Aggregation offen."
      : "Ein fehlender MPD-Bezug wird nicht als neutrale Wirkung interpretiert.",
    source_path_ids: paths.length ? paths.map((path) => path.path_id) : [record.impact_case_id],
  };
}

function order(value: WoeKImpactCase["impact_paths"][number]["impact_order"]): 1 | 2 | 3 | null {
  return value === "FIRST" ? 1 : value === "SECOND" ? 2 : value === "THIRD" ? 3 : null;
}

function horizon(value: WoeKImpactCase["impact_paths"][number]["time_horizon"]): "SHORT" | "MEDIUM" | "LONG" | "MULTI_GENERATIONAL" | null {
  if (value === "SHORT" || value === "MEDIUM" || value === "LONG") return value;
  if (value === "INTERGENERATIONAL") return "MULTI_GENERATIONAL";
  return null;
}

function overallCharacter(value: string): ExecutiveImpactSummary["overall_character"] {
  if (value === "PREDOMINANTLY_POSITIVE" || value === "PREDOMINANTLY_NEGATIVE" || value === "MIXED" || value === "OPEN" || value === "NO_SINGLE_DIRECTION") return value;
  return "NO_SINGLE_DIRECTION";
}

export function governmentExecutiveImpactSummary(record: WoeKImpactCase, assessment: OverviewAssessmentData): ExecutiveImpactSummary {
  const allPathsFit = record.impact_paths.length >= 1 && record.impact_paths.length <= 5;
  const sdgIds = unique(record.impact_paths.flatMap((path) => path.sdg_refs ?? []));
  const sdgPlusIds = unique(record.impact_paths.flatMap((path) => path.sdg_plus_refs ?? []));
  const sdgProjection = (id: string, framework: "UN_SDG" | "WOEK_SDG_PLUS") => {
    const paths = record.impact_paths.filter((path) => (framework === "UN_SDG" ? path.sdg_refs : path.sdg_plus_refs)?.includes(id));
    return {
      sdg_id: id,
      label: id,
      framework,
      direction: aggregateDirection(paths.map((path) => path.direction)),
      materiality: "OPEN" as const,
      evidence: evidenceFor(paths.map((path) => path.evidence)),
      rationale: `${unique(paths.map((path) => path.state_change)).join(" · ") || "Zielbezug ohne separate Zustandsänderung"} Die qualitative Zielrichtung folgt ausschließlich den expliziten Richtungen dieser Pfade; eine zielbezogene Materialität bleibt offen.`,
      source_path_ids: paths.length ? paths.map((path) => path.path_id) : [record.impact_case_id],
    };
  };
  const sourceUrls = unique([...record.references.official_fact_sources, ...record.references.mechanism_sources, ...record.references.post_decision_sources]);
  const summary = {
    schema_version: "woek-executive-impact-summary-1.0" as const,
    id: `woek-executive-impact-${record.impact_case_id}-v1`,
    object_type: "GOVERNMENT_ACTION" as const,
    object_id: record.impact_case_id,
    stage: record.analysis_mode === "IMPACT_REALITY_CHECK" ? "EX_POST" as const : "EX_ANTE" as const,
    analysis_version: record.analysis_version,
    knowledge_cutoff: record.scope.decision_knowledge_cutoff ?? String(record.scope.analysis_as_of).slice(0, 10),
    bottom_line: assessment.assessmentLabel,
    editorial_summary: assessment.editorialSummary,
    key_finding: assessment.keyFinding,
    direction_label: assessment.directionLabel,
    overall_character: overallCharacter(record.impact_summary.overall_character),
    overall_materiality: record.materiality.level,
    why_it_matters: assessment.impactCoreSummary,
    system_boundary: [record.scope.intervention, record.scope.policy_object, record.scope.competence_note].filter(Boolean).join(" · "),
    mpd: { human: dimension(record, "MENSCH"), planet: dimension(record, "PLANET"), democracy: dimension(record, "DEMOKRATIE") },
    sdg_impacts: [...sdgIds.map((id) => sdgProjection(id, "UN_SDG")), ...sdgPlusIds.map((id) => sdgProjection(id, "WOEK_SDG_PLUS"))],
    material_paths: allPathsFit ? record.impact_paths.map((path) => ({
      id: path.path_id,
      title: path.state_variable,
      affected_group_or_system: path.affected_groups.length ? path.affected_groups.join("; ") : record.scope.affected_systems.join("; ") || null,
      state_change: path.state_change,
      mechanism: path.mechanism,
      direction: path.direction,
      materiality: "OPEN" as const,
      evidence: evidenceFor([path.evidence]),
      effect_order: order(path.impact_order),
      time_horizon: horizon(path.time_horizon),
      why_relevant: path.risks[0] ?? path.conditions[0] ?? record.materiality.rationale,
      source_path_ids: [path.path_id],
    })) : [],
    materiality_selection_status: "FAIL_CLOSED_NO_APPROVED_RANKING" as const,
    materiality_selection_rationale: allPathsFit
      ? `Die Fachakte enthält insgesamt ${record.impact_paths.length} Wirkpfade; die Executive-Ansicht zeigt deshalb die vollständige Menge ohne Ranking oder Stichprobe. Eine fachlich freigegebene Materialitätsauswahl liegt nicht vor.`
      : `Die Fachakte enthält ${record.impact_paths.length} Wirkpfade, aber keine freigegebene Materialitätsrangfolge für eine Auswahl von höchstens fünf. Die Executive-Auswahl bleibt geschlossen; alle Pfade stehen in der vollständigen Fachakte.`,
    noncompensable_risks: record.boundary_review.filter((boundary) => boundary.status === "BLOCK").map((boundary) => ({
      protected_interest: boundary.boundary,
      severity: "CRITICAL" as const,
      reason: boundary.reason,
      source_path_ids: record.impact_paths.map((path) => path.path_id),
    })),
    noncompensation_status: record.boundary_review.some((boundary) => boundary.status === "BLOCK") ? "APPROVED_BOUNDARIES" as const : record.boundary_review.length ? "REVIEWED_NONE" as const : "NOT_AVAILABLE" as const,
    key_tradeoffs: record.impact_summary.main_risk_or_tradeoff ? [{ title: "Zentraler Zielkonflikt", explanation: record.impact_summary.main_risk_or_tradeoff, source_path_ids: record.impact_paths.map((path) => path.path_id) }] : [],
    evidence_summary: assessment.evidenceSummary,
    uncertainty_summary: `${record.evidence_summary.uncertainty} ${record.evidence_summary.decision_time_evidence_boundary}`,
    open_questions: record.fach_review.open_questions,
    reality_check_indicators: unique(record.impact_paths.flatMap((path) => path.indicators.map((indicator) => indicator.indicator))),
    source_refs: sourceUrls.length ? sourceUrls.map((url, index) => ({ id: `${record.impact_case_id}:source:${index + 1}`, label: `Quellenakte ${index + 1}`, href: sourceDetailHrefForUrl(url) })) : [{ id: `${record.impact_case_id}:fachakte`, label: "Vollständige Fachakte", href: `/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}` }],
    communication_preview: null,
    editorial_status: "PARTIAL" as const,
  };
  return executiveImpactSummarySchema.parse(summary);
}
