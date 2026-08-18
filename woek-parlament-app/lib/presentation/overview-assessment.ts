import overrides from "@/data/presentation/overview-assessment-overrides.json";
import type { ParliamentaryCase } from "@/data/cases";
import { humanizeSystemValue } from "@/lib/presentation/labels";
import { isGenericPublicEditorialText, projectParliamentEditorial } from "@/lib/publication/public-editorial-projection.mjs";

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

function normalized(value: string) {
  return value.toLocaleLowerCase("de-DE").replace(/[^a-z0-9äöüß]+/gi, " ").replace(/\s+/g, " ").trim();
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
    const result = {
      assessmentLabel: assessment.category,
      impactCoreSummary: assessment.summary,
      editorialSummary: assessment.rationale.join(" "),
      keyFinding: assessment.rationale[0] ?? assessment.summary,
      directionLabel: assessment.category,
      evidenceSummary: compact([assessment.evidenceStatus, assessment.uncertainty]),
      realityCheckSummary: "Ein getrennter Reality-Check ist in dieser Fassung nicht ausgewiesen.",
    };
    return normalized(result.assessmentLabel) === normalized(result.impactCoreSummary) || [result.impactCoreSummary, result.editorialSummary, result.keyFinding].some(isGenericPublicEditorialText) ? null : result;
  }

  const workingAct = item.publicWorkingAct;
  if (!workingAct) return null;
  const projection = projectParliamentEditorial(item as unknown as Record<string, unknown>);
  if (projection.status !== "PASS") return null;
  const pathDirections = [...new Set((workingAct.reviewDetail?.impactPaths ?? []).map((path) => humanizeSystemValue(path.direction)))];
  return {
    assessmentLabel: projection.fields.overview_assessment_label,
    impactCoreSummary: projection.fields.impact_core_summary,
    editorialSummary: projection.fields.editorial_summary,
    keyFinding: projection.fields.key_finding,
    directionLabel: pathDirections.length ? `Getrennte Wirkpfade: ${pathDirections.join(", ")}` : "Keine Einheitsrichtung ausgewiesen; die Wirkpfade bleiben getrennt.",
    evidenceSummary: projection.fields.evidence_summary,
    realityCheckSummary: projection.fields.reality_check_summary,
  };
}
