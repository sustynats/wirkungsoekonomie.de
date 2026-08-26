import projectionData from "@/data/executive-impact/sachsen-anhalt-programme-projections-v1.json";
import type { ProgrammeEditorial, ProgrammeFindingKind } from "@/data/presentation/sachsen-anhalt-programme-editorial-v2";
import type { ProgrammeModel } from "@/lib/presentation/sachsen-anhalt-programme-model";
import type { CommunicationMediaImpactRecord } from "@/lib/state-programmes/communication-media-impact";
import { executiveImpactSummarySchema, type ExecutiveImpactSummary } from "./contracts";

type Projection = (typeof projectionData.programmes)[number];

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())))];
}

function tradeoffKinds(kind: ProgrammeFindingKind) {
  return kind === "tradeoff" || kind === "risk";
}

function programmeProjection(sourceKey: string): Projection {
  const projection = projectionData.programmes.find((item) => item.source_key === sourceKey);
  if (!projection) throw new Error(`Missing delegated Sachsen-Anhalt programme projection for ${sourceKey}`);
  return projection;
}

export function saxonyAnhaltExecutiveImpactSummary({
  sourceKey,
  model,
  editorial,
  communication,
}: {
  sourceKey: string;
  model: ProgrammeModel;
  editorial: ProgrammeEditorial;
  communication: CommunicationMediaImpactRecord;
}): ExecutiveImpactSummary {
  const projection = programmeProjection(sourceKey);
  const byKey = new Map(model.commitments.map((commitment) => [commitment.key, commitment]));
  const selectedIds = projection.selected_paths.map((path) => path.id);
  const materialPaths = projection.selected_paths.map((path) => {
    const assessment = editorial.centralAssessments[path.id];
    if (!assessment) throw new Error(`Delegated material path ${path.id} is not bound to the approved Editorial-v2 stock`);
    const commitment = byKey.get(path.id);
    return {
      id: path.id,
      title: assessment.keyFinding,
      affected_group_or_system: path.affected_group_or_system,
      state_change: assessment.impactCoreSummary,
      mechanism: assessment.directionRationale,
      direction: assessment.direction,
      materiality: path.materiality,
      evidence: assessment.evidence,
      effect_order: path.effect_order,
      time_horizon: path.time_horizon,
      why_relevant: path.why_relevant,
      source_path_ids: [path.id],
      reality_check: commitment?.primaryIndicator ?? null,
    };
  });

  const summary = {
    schema_version: "woek-executive-impact-summary-1.0" as const,
    id: `woek-executive-impact-${sourceKey}-v1`,
    object_type: "PROGRAMME" as const,
    object_id: sourceKey,
    stage: "EX_ANTE" as const,
    analysis_version: projectionData.analysis_version,
    knowledge_cutoff: projectionData.knowledge_cutoff,
    bottom_line: projection.bottom_line,
    editorial_summary: editorial.editorialSummary,
    key_finding: projection.why_it_matters,
    direction_label: projection.direction_label,
    overall_character: projection.overall_character,
    overall_materiality: projection.overall_materiality,
    why_it_matters: projection.why_it_matters,
    system_boundary: projection.system_boundary,
    mpd: projection.mpd,
    sdg_impacts: projection.sdg_impacts,
    material_paths: materialPaths.map(({ reality_check: _realityCheck, ...path }) => path),
    materiality_selection_status: "APPROVED_MATERIALITY_SELECTION" as const,
    materiality_selection_rationale: `${projectionData.selection_rule} Auswahl aus dem terminalen Vollbestand mit ${projection.terminal_effect_mechanisms.toLocaleString("de-DE")} quellengebundenen Wirkungsmechanismen sowie der getrennten freigegebenen Kommunikationsanalyse; keine Auswahl nach den zuerst geprüften vier Pfaden.`,
    noncompensable_risks: projection.noncompensable_risks,
    noncompensation_status: projection.noncompensable_risks.length ? "APPROVED_BOUNDARIES" as const : "REVIEWED_NONE" as const,
    key_tradeoffs: editorial.keyFindings.filter((finding) => tradeoffKinds(finding.kind)).map((finding) => ({ title: finding.label, explanation: finding.text, source_path_ids: selectedIds })),
    evidence_summary: projection.evidence_summary,
    uncertainty_summary: projection.uncertainty_summary,
    open_questions: unique([...projection.open_questions, ...communication.open_points]),
    reality_check_indicators: unique([...projection.reality_check_indicators, ...materialPaths.map((path) => path.reality_check)]),
    source_refs: [
      { id: `${sourceKey}:terminal`, label: `Terminaler Vollbestand · ${projection.terminal_effect_mechanisms.toLocaleString("de-DE")} Wirkungsmechanismen · Manifest ${projection.terminal_manifest_sha256.slice(0, 12)}…`, href: `/laender/sachsen-anhalt/wahlprogramme/${sourceKey}#quellenstatus` },
      { id: `${sourceKey}:fachakte`, label: "Vollständige versionierte WÖk-Wirkungsakte", href: `/laender/sachsen-anhalt/wahlprogramme/${sourceKey}#vollstaendige-wirkungsakte` },
      { id: `${sourceKey}:quellen`, label: "Originalquellen und Fachstand", href: "/laender/sachsen-anhalt/quellen" },
      { id: communication.communication_review_id, label: "Getrennte Fachanalyse Kommunikationswirkung", href: communication.fach_source.url },
    ],
    communication_preview: {
      assessment_label: communication.overview_assessment_label,
      summary: communication.public_summary,
      evidence_summary: `Text-Evidenz ${communication.evidence.text}; Mechanismus ${communication.evidence.mechanism}; beobachteter Outcome ${communication.evidence.observed_outcome}; Zurechnung ${communication.evidence.attribution}.`,
      noncompensation: communication.noncompensation,
      href: "#kommunikationswirkung",
    },
    editorial_status: "APPROVED" as const,
  };

  return executiveImpactSummarySchema.parse(summary);
}
