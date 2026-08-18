import overrides from "@/data/presentation/overview-assessment-overrides.json";
import type { ParliamentaryCase } from "@/data/cases";
import { humanizeSystemValue } from "@/lib/presentation/labels";

export type OverviewAssessmentData = {
  assessmentLabel: string;
  impactCoreSummary: string;
  editorialSummary: string;
  keyFinding: string;
  directionLabel: string;
  evidenceSummary: string;
  realityCheckSummary?: string;
};

type OverrideRecord = {
  overview_assessment_label: string;
  impact_core_summary: string;
  editorial_summary: string;
  key_finding: string;
  direction_label: string;
  evidence_summary: string;
  reality_check_summary: string;
};

const assessmentOverrides = overrides.records as Record<string, OverrideRecord>;

function compact(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value?.trim())).join(" ");
}

export function parliamentaryOverviewAssessment(item: ParliamentaryCase): OverviewAssessmentData | null {
  const override = assessmentOverrides[item.slug];
  if (override) {
    return {
      assessmentLabel: override.overview_assessment_label,
      impactCoreSummary: override.impact_core_summary,
      editorialSummary: override.editorial_summary,
      keyFinding: override.key_finding,
      directionLabel: override.direction_label,
      evidenceSummary: override.evidence_summary,
      realityCheckSummary: override.reality_check_summary,
    };
  }

  if (item.publicAssessment) {
    const assessment = item.publicAssessment;
    return {
      assessmentLabel: assessment.category,
      impactCoreSummary: assessment.summary,
      editorialSummary: assessment.rationale.join(" "),
      keyFinding: assessment.rationale[0] ?? assessment.summary,
      directionLabel: assessment.category,
      evidenceSummary: compact([assessment.evidenceStatus, assessment.uncertainty]),
      realityCheckSummary: "Ein getrennter Reality-Check ist in dieser Fassung nicht ausgewiesen.",
    };
  }

  const workingAct = item.publicWorkingAct;
  if (!workingAct) return null;
  const editorial = workingAct.editorialSummary;
  const pathDirections = [...new Set((workingAct.reviewDetail?.impactPaths ?? []).map((path) => humanizeSystemValue(path.direction)))];
  const feedback = workingAct.reviewDetail?.feedback;
  return {
    assessmentLabel: editorial?.keyStatement ?? workingAct.overallPotential,
    impactCoreSummary: editorial?.keyStatement ?? workingAct.scopeStatement,
    editorialSummary: workingAct.overallPotential,
    keyFinding: workingAct.risks[0] ?? workingAct.changeLevers[0] ?? editorial?.whatIsNotYetKnown ?? workingAct.scopeStatement,
    directionLabel: pathDirections.length ? `Getrennte Wirkpfade: ${pathDirections.join(", ")}` : "Keine Einheitsrichtung ausgewiesen; die Wirkpfade bleiben getrennt.",
    evidenceSummary: compact([editorial?.whatIsKnown, editorial?.evidenceBoundary, editorial?.whatIsNotYetKnown]) || "Evidenzgrenze in der Fachakte ausgewiesen.",
    realityCheckSummary: feedback?.interpretation || feedback?.currentStatus || "Noch kein getrennt fachlich freigegebener Reality-Check.",
  };
}
