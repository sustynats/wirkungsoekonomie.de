import type { ParliamentaryCase, PublicImpactPathDetail, PublicNormativeMappingItem } from "@/data/cases";
import type { OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { executiveImpactSummarySchema, type ExecutiveEvidence, type ExecutiveImpactSummary, type ImpactDirection, type ImpactDimensionSummary } from "./contracts";

function direction(value: string): ImpactDirection {
  const map: Record<string, ImpactDirection> = {
    POSITIVE: "POSITIVE", POSITIVE_POTENTIAL: "POSITIVE", OBSERVED_POSITIVE: "POSITIVE",
    NEGATIVE: "NEGATIVE", NEGATIVE_RISK: "NEGATIVE", OBSERVED_NEGATIVE: "NEGATIVE",
    AMBIVALENT: "AMBIVALENT", EVIDENCE_OPEN: "OPEN", OPEN: "OPEN", NEUTRAL: "NEUTRAL",
  };
  return map[value] ?? "OPEN";
}

function evidence(value: string): ExecutiveEvidence {
  const upper = value.toUpperCase();
  if (upper.includes("HIGH") || upper.includes("HOCH")) return "HIGH";
  if (upper.includes("MEDIUM") || upper.includes("MITTEL")) return "MEDIUM";
  if (upper.includes("LOW") || upper.includes("GERING")) return "LOW";
  return "NOT_ASSESSABLE";
}

function dimension(item: ParliamentaryCase, key: "MENSCH" | "PLANET" | "DEMOKRATIE"): ImpactDimensionSummary {
  const paths = item.publicWorkingAct?.reviewDetail?.impactPaths.filter((path) => path.affectedDimensions.includes(key)) ?? [];
  const changes = [...new Set(paths.map((path) => path.hypothesis))];
  return {
    direction: "OPEN",
    materiality: "OPEN",
    evidence: "NOT_ASSESSABLE",
    headline: changes.length === 1 ? changes[0] : changes.length ? `${changes.length} getrennte Zustandsänderungen` : "Keine freigegebene Zuordnung",
    state_changes: changes,
    rationale: changes.length ? `Die Zustandsänderungen stammen ausschließlich aus den ausdrücklich ${key} zugeordneten Wirkpfaden dieser Fachakte. Eine domänenweite Richtung, Materialität und Evidenzaggregation ist nicht freigegeben.` : `Ein fehlender ${key}-Bezug wird nicht als neutrale Wirkung interpretiert.`,
  };
}

function normative(item: PublicNormativeMappingItem) {
  return {
    sdg_id: item.code,
    label: item.label,
    framework: item.framework === "SDG_PLUS" ? "WOEK_SDG_PLUS" as const : "UN_SDG" as const,
    direction: direction(item.direction),
    materiality: "OPEN" as const,
    evidence: evidence(item.evidenceStatus),
    rationale: item.rationale,
  };
}

function materialPath(path: PublicImpactPathDetail) {
  return {
    id: path.id,
    title: path.lever,
    affected_group_or_system: path.affectedGroups.length ? path.affectedGroups.join("; ") : null,
    state_change: path.hypothesis,
    mechanism: path.changeLever,
    direction: direction(path.direction),
    materiality: "OPEN" as const,
    evidence: evidence(path.evidenceStatus),
    effect_order: null,
    time_horizon: null,
    why_relevant: path.risks[0] ?? path.prerequisites[0] ?? path.evidenceBoundary,
    source_path_ids: [path.id],
  };
}

export function parliamentExecutiveImpactSummary(item: ParliamentaryCase, assessment: OverviewAssessmentData): ExecutiveImpactSummary {
  const workingAct = item.publicWorkingAct;
  if (!workingAct) throw new Error(`No published working act for ${item.slug}`);
  const paths = workingAct.reviewDetail?.impactPaths ?? [];
  const allFit = paths.length >= 1 && paths.length <= 5;
  const mapping = item.publicAssessment?.normativeMapping ?? workingAct.normativeMapping;
  const sourcePathIds = paths.map((path) => path.id);
  const noncompensable: ExecutiveImpactSummary["noncompensable_risks"] = (workingAct.reviewDetail?.risks ?? []).filter((risk) => risk.nonCompensationRelevant).map((risk) => ({
    protected_interest: risk.description,
    severity: "HIGH" as const,
    reason: risk.description,
    source_path_ids: sourcePathIds.length ? sourcePathIds : [item.slug],
  }));
  for (const boundary of workingAct.reviewDetail?.boundaries ?? []) if (boundary.status === "BLOCK") noncompensable.push({
    protected_interest: boundary.boundary,
    severity: "CRITICAL",
    reason: boundary.reason,
    source_path_ids: sourcePathIds.length ? sourcePathIds : [item.slug],
  });
  const sourceRefs = item.sources.map((source, index) => ({ id: `${item.slug}:source:${index + 1}`, label: source.title, href: sourceDetailHrefForUrl(source.url) }));
  return executiveImpactSummarySchema.parse({
    schema_version: "woek-executive-impact-summary-1.0",
    id: `woek-executive-impact-${item.slug}-v1`,
    object_type: item.kind === "RETROSPECTIVE_CASE" ? "LAW" : "PARLIAMENT_CASE",
    object_id: item.slug,
    stage: item.retrospective ? "EX_POST" : "EX_ANTE",
    analysis_version: String(workingAct.fullReview?.result.analysis_version ?? item.lastUpdated),
    knowledge_cutoff: item.lastUpdated,
    bottom_line: assessment.assessmentLabel,
    editorial_summary: assessment.editorialSummary,
    key_finding: assessment.keyFinding,
    direction_label: assessment.directionLabel,
    overall_character: assessment.directionKind === "positive" ? "PREDOMINANTLY_POSITIVE" : assessment.directionKind === "risk" ? "PREDOMINANTLY_NEGATIVE" : assessment.directionKind === "ambivalent" ? "MIXED" : assessment.directionKind === "open" ? "OPEN" : "NO_SINGLE_DIRECTION",
    why_it_matters: assessment.impactCoreSummary,
    system_boundary: workingAct.scopeStatement,
    mpd: { human: dimension(item, "MENSCH"), planet: dimension(item, "PLANET"), democracy: dimension(item, "DEMOKRATIE") },
    sdg_impacts: [...(mapping?.sdgItems ?? []).map(normative), ...(mapping?.sdgPlusItems ?? []).map(normative)],
    material_paths: allFit ? paths.map(materialPath) : [],
    materiality_selection_status: "FAIL_CLOSED_NO_APPROVED_RANKING",
    materiality_selection_rationale: allFit ? `Die Fachakte enthält ${paths.length} Wirkpfade; die Executive-Ansicht zeigt die vollständige Menge ohne Ranking. Eine fachlich freigegebene Materialitätsauswahl liegt nicht vor.` : `Für ${paths.length} Wirkpfade liegt keine freigegebene Auswahl der drei bis fünf materiellsten Pfade vor; die Auswahl bleibt geschlossen.`,
    noncompensable_risks: noncompensable,
    key_tradeoffs: workingAct.risks.map((risk) => ({ title: "Risiko oder Zielkonflikt", explanation: risk, source_path_ids: sourcePathIds })),
    evidence_summary: assessment.evidenceSummary,
    uncertainty_summary: item.publicAssessment?.uncertainty ?? workingAct.editorialSummary?.evidenceBoundary ?? "Unsicherheitsgrenze in der vollständigen Fachakte dokumentiert.",
    open_questions: workingAct.dataGaps,
    reality_check_indicators: workingAct.reviewDetail?.feedback?.dataGaps ?? [],
    source_refs: sourceRefs.length ? sourceRefs : [{ id: `${item.slug}:fachakte`, label: "Vollständige Fachakte", href: `/entscheidungen/${item.slug}?ansicht=fachakte` }],
    communication_preview: null,
    editorial_status: "PARTIAL",
  });
}
