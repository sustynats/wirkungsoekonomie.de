import type { ProgrammeEditorial, ProgrammeFindingKind } from "@/data/presentation/sachsen-anhalt-programme-editorial-v2";
import type { ProgrammeCommitment, ProgrammeModel } from "@/lib/presentation/sachsen-anhalt-programme-model";
import type { CommunicationMediaImpactRecord } from "@/lib/state-programmes/communication-media-impact";
import { executiveImpactSummarySchema, type ExecutiveImpactSummary, type ImpactDimensionSummary } from "./contracts";

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())))];
}

function openDimension(label: string, values: string[]): ImpactDimensionSummary {
  return {
    direction: "OPEN",
    materiality: "OPEN",
    evidence: "NOT_ASSESSABLE",
    headline: values.length === 1 ? values[0] : values.length > 1 ? `${values.length} freigegebene Einzelzuordnungen · keine domänenweite Aggregation` : `Keine freigegebene ${label}-Projektion`,
    state_changes: values,
    rationale: values.length
      ? `Die Fachakte ordnet diese Einzelpfade ${label} zu. Eine fachlich freigegebene domänenweite Richtung, Materialität oder Evidenzaggregation liegt nicht vor und bleibt deshalb offen.`
      : `Für ${label} liegt im aktuellen Executive-Datensatz keine fachlich freigegebene Zuordnung vor. Das wird nicht als neutrale Wirkung ausgegeben.`,
  };
}

function tradeoffKinds(kind: ProgrammeFindingKind) {
  return kind === "tradeoff" || kind === "risk";
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
  const byKey = new Map(model.commitments.map((commitment) => [commitment.key, commitment]));
  const reviewed = Object.entries(editorial.centralAssessments)
    .map(([id, assessment]) => ({ id, assessment, commitment: byKey.get(id) ?? null }));
  const dimensionValues = (selector: (commitment: ProgrammeCommitment) => string[]) => unique(reviewed.flatMap(({ commitment }) => commitment ? selector(commitment) : []));
  const sdgIds = unique(reviewed.flatMap(({ commitment }) => commitment?.sdgs ?? []));
  const sdgPlusIds = unique(reviewed.flatMap(({ commitment }) => commitment?.sdgPlus ?? []));
  const allPathIds = reviewed.map(({ id }) => id);
  const noncompensable = reviewed.flatMap(({ id, commitment }) => {
    if (commitment?.boundaryStatus !== "BLOCK") return [];
    return commitment.boundaryConcerns.flatMap((concern, index) => {
      const reason = commitment.boundaryRationales[index] ?? commitment.boundaryRationales[0];
      return reason ? [{ protected_interest: concern, severity: "CRITICAL" as const, reason, source_path_ids: [id] }] : [];
    });
  });
  const allCentralBoundariesReviewed = reviewed.every(({ commitment }) => Boolean(commitment?.boundaryStatus));

  const summary = {
    schema_version: "woek-executive-impact-summary-1.0" as const,
    id: `woek-executive-impact-${sourceKey}-v1`,
    object_type: "PROGRAMME" as const,
    object_id: sourceKey,
    stage: "EX_ANTE" as const,
    analysis_version: `WOEK-WAHLPROGRAMM-BLAUPAUSE-V${editorial.version}+WOEK-CMI-V${communication.communication_review_version}`,
    knowledge_cutoff: "2026-08-23",
    bottom_line: editorial.overallLabel,
    editorial_summary: editorial.editorialSummary,
    key_finding: null,
    direction_label: "Keine programmweite Wirkungsrichtung freigegeben; die vier Schlüsselpfade bleiben getrennt.",
    overall_character: "NO_SINGLE_DIRECTION" as const,
    why_it_matters: editorial.impactCoreSummary,
    system_boundary: model.implementationBoundary ?? "Eine separate programmweite Systemgrenze ist im freigegebenen Kurzdatensatz nicht strukturiert; Zuständigkeit und Grenze bleiben je Einzelpfad maßgeblich.",
    mpd: {
      human: openDimension("Mensch", dimensionValues((commitment) => commitment.human)),
      planet: openDimension("Planet", dimensionValues((commitment) => commitment.planet)),
      democracy: openDimension("Demokratie", dimensionValues((commitment) => commitment.democracy)),
    },
    sdg_impacts: [
      ...sdgIds.map((sdg) => ({
        sdg_id: sdg,
        label: sdg,
        framework: "UN_SDG" as const,
        direction: "OPEN" as const,
        materiality: "OPEN" as const,
        evidence: "NOT_ASSESSABLE" as const,
        rationale: "Der Zielbezug ist im freigegebenen Einzelpfad ausgewiesen; eine eigenständige SDG-Richtung, -Materialität und -Evidenz ist nicht freigegeben.",
      })),
      ...sdgPlusIds.map((sdg) => ({
        sdg_id: sdg,
        label: sdg,
        framework: "WOEK_SDG_PLUS" as const,
        direction: "OPEN" as const,
        materiality: "OPEN" as const,
        evidence: "NOT_ASSESSABLE" as const,
        rationale: "Der Bezug zur WÖk-Erweiterung ist im freigegebenen Einzelpfad ausgewiesen; Richtung, Materialität und Evidenz bleiben ohne separate Fachfreigabe offen.",
      })),
    ],
    material_paths: reviewed.map(({ id, assessment, commitment }) => ({
      id,
      title: assessment.keyFinding,
      affected_group_or_system: commitment?.affectedGroups.length ? commitment.affectedGroups.join("; ") : null,
      state_change: assessment.impactCoreSummary,
      mechanism: assessment.directionRationale,
      direction: assessment.direction,
      materiality: "OPEN" as const,
      evidence: assessment.evidence,
      effect_order: null,
      time_horizon: null,
      why_relevant: assessment.editorialSummary,
      source_path_ids: [id],
    })),
    materiality_selection_status: "FAIL_CLOSED_NO_APPROVED_RANKING" as const,
    materiality_selection_rationale: "Gezeigt wird die unveränderte, redaktionell freigegebene Vierer-Menge der Schlüsselpfade. Da keine separate fachliche Materialitätsrangfolge vorliegt, werden diese Pfade nicht als programmweit wichtigste Folgen behauptet und ihre Materialität bleibt offen.",
    noncompensable_risks: noncompensable,
    noncompensation_status: noncompensable.length ? "APPROVED_BOUNDARIES" as const : allCentralBoundariesReviewed ? "REVIEWED_NONE" as const : "NOT_AVAILABLE" as const,
    key_tradeoffs: editorial.keyFindings.filter((finding) => tradeoffKinds(finding.kind)).map((finding) => ({ title: finding.label, explanation: finding.text, source_path_ids: allPathIds })),
    evidence_summary: editorial.readingGuide,
    uncertainty_summary: `Die vier redaktionell nachgeprüften Schlüsselpfade weisen die Evidenzstufen ${unique(reviewed.map(({ assessment }) => assessment.evidence)).join(", ")} aus. Nicht nachgeprüfte Programmdetails bleiben fachlich offen.`,
    open_questions: unique([...communication.open_points, ...reviewed.flatMap(({ commitment }) => commitment?.dataGaps ?? [])]),
    reality_check_indicators: unique(reviewed.map(({ commitment }) => commitment?.primaryIndicator)),
    source_refs: [
      { id: `${sourceKey}:fachakte`, label: "Vollständige versionierte WÖk-Wirkungsakte", href: `/laender/sachsen-anhalt/wahlprogramme/${sourceKey}#vollstaendige-wirkungsakte` },
      { id: `${sourceKey}:quellen`, label: "Quellen- und Fachstand Sachsen-Anhalt", href: "/laender/sachsen-anhalt/quellen" },
      { id: communication.communication_review_id, label: "Fachhandoff Kommunikationswirkung", href: communication.fach_source.url },
    ],
    communication_preview: {
      assessment_label: communication.overview_assessment_label,
      summary: communication.public_summary,
      evidence_summary: `Text-Evidenz ${communication.evidence.text}; Mechanismus ${communication.evidence.mechanism}; beobachteter Outcome ${communication.evidence.observed_outcome}; Zurechnung ${communication.evidence.attribution}.`,
      noncompensation: communication.noncompensation,
      href: "#kommunikationswirkung",
    },
    editorial_status: "PARTIAL" as const,
  };
  return executiveImpactSummarySchema.parse(summary);
}
