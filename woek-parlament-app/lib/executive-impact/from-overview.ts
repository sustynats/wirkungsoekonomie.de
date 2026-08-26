import type { OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import { executiveImpactSummarySchema, type ExecutiveImpactSummary, type ImpactDimensionSummary } from "./contracts";

function openDimension(label: string): ImpactDimensionSummary {
  return {
    direction: "OPEN",
    materiality: "OPEN",
    evidence: "NOT_ASSESSABLE",
    headline: `Keine freigegebene ${label}-Gesamtprojektion`,
    state_changes: [],
    rationale: `Der freigegebene Kurzbefund enthält keine eigenständige ${label}-Richtung, Materialität und Evidenz. Das Portal zeigt diese Lücke offen und leitet keine Zuordnung aus Themenwörtern ab.`,
  };
}

export function executiveImpactFromOverview({
  id,
  objectType,
  assessment,
  analysisVersion,
  knowledgeCutoff,
  systemBoundary,
  sourceRefs,
}: {
  id: string;
  objectType: ExecutiveImpactSummary["object_type"];
  assessment: OverviewAssessmentData;
  analysisVersion: string;
  knowledgeCutoff: string;
  systemBoundary: string;
  sourceRefs: ExecutiveImpactSummary["source_refs"];
}): ExecutiveImpactSummary {
  return executiveImpactSummarySchema.parse({
    schema_version: "woek-executive-impact-summary-1.0",
    id: `woek-executive-impact-${id}-v1`,
    object_type: objectType,
    object_id: id,
    stage: "EX_ANTE",
    analysis_version: analysisVersion,
    knowledge_cutoff: knowledgeCutoff,
    bottom_line: assessment.assessmentLabel,
    editorial_summary: assessment.editorialSummary,
    key_finding: assessment.keyFinding,
    direction_label: assessment.directionLabel,
    overall_character: assessment.directionKind === "positive" ? "PREDOMINANTLY_POSITIVE" : assessment.directionKind === "risk" ? "PREDOMINANTLY_NEGATIVE" : assessment.directionKind === "ambivalent" ? "MIXED" : assessment.directionKind === "open" ? "OPEN" : "NO_SINGLE_DIRECTION",
    why_it_matters: assessment.impactCoreSummary,
    system_boundary: systemBoundary,
    mpd: { human: openDimension("Mensch"), planet: openDimension("Planet"), democracy: openDimension("Demokratie") },
    sdg_impacts: [],
    material_paths: [],
    materiality_selection_status: "FAIL_CLOSED_NO_APPROVED_RANKING",
    materiality_selection_rationale: "Der freigegebene Kurzbefund enthält keine quellengebundene Auswahl der drei bis fünf materiellsten Einzelpfade. Deshalb wird weder die Reihenfolge vorhandener Texte noch ein technischer Themenabgleich als Fachauswahl verwendet.",
    noncompensable_risks: [],
    noncompensation_status: "NOT_AVAILABLE",
    key_tradeoffs: [],
    evidence_summary: assessment.evidenceSummary,
    uncertainty_summary: assessment.realityCheckSummary ?? "Eine separate freigegebene Unsicherheitsprojektion liegt nicht vor.",
    open_questions: [],
    reality_check_indicators: [],
    source_refs: sourceRefs,
    communication_preview: null,
    editorial_status: "PARTIAL",
  });
}
