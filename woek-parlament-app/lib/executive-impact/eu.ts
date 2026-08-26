import type { EuImpactRecord } from "@/lib/eu/impact-cases";
import type { PublicEditorialProjection } from "@/lib/publication/public-editorial-projection.mjs";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import type { OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import { executiveImpactSummarySchema, type ExecutiveImpactSummary, type ImpactDimensionSummary } from "./contracts";

const openDimension = (label: string): ImpactDimensionSummary => ({
  direction: "OPEN",
  materiality: "OPEN",
  evidence: "NOT_ASSESSABLE",
  headline: `Keine freigegebene ${label}-Projektion`,
  state_changes: [],
  rationale: `Der freigegebene EU-Kurzrecord enthält keine eigenständige ${label}-Richtung oder Materialität. Das wird nicht als neutraler Effekt ausgegeben.`,
});

export function euExecutiveImpactSummary(record: EuImpactRecord, editorial: PublicEditorialProjection, assessment: OverviewAssessmentData): ExecutiveImpactSummary {
  if (editorial.status !== "PASS") throw new Error(`No public editorial projection for ${record.impact_case_id}`);
  const sourceUrls = [...new Set([...(record.official_sources ?? []), ...(record.source_refs ?? [])])];
  return executiveImpactSummarySchema.parse({
    schema_version: "woek-executive-impact-summary-1.0",
    id: `woek-executive-impact-${record.impact_case_id}-v1`,
    object_type: "EU_CASE",
    object_id: record.impact_case_id,
    stage: record.analysis_mode.includes("REALITY") ? "EX_POST" : "EX_ANTE",
    analysis_version: record.analysis_version,
    knowledge_cutoff: record.analysis_as_of.slice(0, 10),
    bottom_line: editorial.fields.overview_assessment_label,
    editorial_summary: editorial.fields.editorial_summary,
    key_finding: editorial.fields.key_finding,
    direction_label: assessment.directionLabel,
    overall_character: record.primary_direction === "OPEN" ? "OPEN" : record.primary_direction === "AMBIVALENT" ? "MIXED" : record.primary_direction === "POSITIVE" ? "PREDOMINANTLY_POSITIVE" : record.primary_direction === "NEGATIVE" ? "PREDOMINANTLY_NEGATIVE" : "NO_SINGLE_DIRECTION",
    why_it_matters: editorial.fields.impact_core_summary,
    system_boundary: [record.competence_scope, record.institutional_actor_role, record.legal_feasibility_status].join(" · "),
    mpd: { human: openDimension("Mensch"), planet: openDimension("Planet"), democracy: openDimension("Demokratie") },
    sdg_impacts: [],
    material_paths: [],
    materiality_selection_status: "FAIL_CLOSED_NO_APPROVED_RANKING",
    materiality_selection_rationale: "Der veröffentlichte EU-Kurzdatensatz enthält keine freigegebene Auswahl von drei bis fünf materiellen Einzelpfaden. Technische Metadaten oder die Reihenfolge im Fachtext ersetzen keine Fachauswahl.",
    noncompensable_risks: [],
    noncompensation_status: "NOT_AVAILABLE",
    key_tradeoffs: record.boundary_status === "BLOCK" ? [{ title: "Schutzgrenze im Fachrecord", explanation: editorial.fields.key_finding, source_path_ids: [record.impact_case_id] }] : [],
    evidence_summary: editorial.fields.evidence_summary,
    uncertainty_summary: (record.limitations ?? []).join(" · ") || "Eine separate freigegebene Unsicherheitsprojektion liegt im EU-Kurzrecord nicht vor.",
    open_questions: record.limitations ?? [],
    reality_check_indicators: record.key_indicators,
    source_refs: sourceUrls.length ? sourceUrls.map((url, index) => ({ id: `${record.impact_case_id}:source:${index + 1}`, label: `Quellenakte ${index + 1}`, href: sourceDetailHrefForUrl(url) })) : [{ id: `${record.impact_case_id}:fachakte`, label: "Vollständige EU-Fachakte", href: `/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}` }],
    communication_preview: null,
    editorial_status: "PARTIAL",
  });
}
