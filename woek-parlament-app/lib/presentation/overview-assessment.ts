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
  directionKind: AssessmentIconKind;
  evidenceSummary: string;
  realityCheckSummary?: string;
};

export type AssessmentIconKind = "positive" | "risk" | "ambivalent" | "open" | "neutral" | "portfolio" | "conditional" | "protection" | "unknown";
export type AssessmentPresentationMode = "DEFAULT" | "PORTFOLIO" | "CONDITIONAL" | "PROTECTION";

/**
 * Reviewed public/contract values only. This map deliberately contains no
 * sentiment or substring rules: an unknown value must never become positive.
 */
export const reviewedAssessmentDirectionKinds: Readonly<Record<string, AssessmentIconKind>> = {
  POSITIVE: "positive",
  POSITIVE_POTENTIAL: "positive",
  OBSERVED_POSITIVE: "positive",
  "positives Wirkungspotenzial": "positive",
  NEGATIVE: "risk",
  NEGATIVE_RISK: "risk",
  OBSERVED_NEGATIVE: "risk",
  "negatives Wirkungspotenzial": "risk",
  AMBIVALENT: "ambivalent",
  "gegenläufige Potenziale und Risiken": "ambivalent",
  OPEN: "open",
  EVIDENCE_OPEN: "open",
  "Wirkungsrichtung offen": "open",
  NEUTRAL: "neutral",
  "begründet ohne materielle Richtungsänderung": "neutral",
  "Keine robuste Einheitsrichtung; Wirkpfade müssen getrennt bewertet werden.": "portfolio",
  "Keine Einheitsrichtung ausgewiesen; die Wirkpfade bleiben getrennt.": "portfolio",
};

const portfolioOverallCharacters = new Set([
  "NO_SINGLE_DIRECTION_ALLOWED",
  "HIGH_TRANSFORMATION_POTENTIAL_NO_SINGLE_DIRECTION_ALLOWED",
]);

export function assessmentPresentationModeForOverallCharacter(overallCharacter?: string): AssessmentPresentationMode {
  return overallCharacter && portfolioOverallCharacters.has(overallCharacter) ? "PORTFOLIO" : "DEFAULT";
}

export function assessmentIconKindFromStructuredSignal(signal: { direction?: string; presentation?: AssessmentPresentationMode }): AssessmentIconKind {
  if (signal.presentation === "PORTFOLIO") return "portfolio";
  if (signal.presentation === "CONDITIONAL") return "conditional";
  if (signal.presentation === "PROTECTION") return "protection";
  if (!signal.direction) return "unknown";
  return reviewedAssessmentDirectionKinds[signal.direction] ?? "unknown";
}

export function impactRecordAssessmentIconKind(record: { primary_direction: string; overall_character?: string }): AssessmentIconKind {
  return assessmentIconKindFromStructuredSignal({
    direction: record.primary_direction,
    presentation: assessmentPresentationModeForOverallCharacter(record.overall_character),
  });
}

export function assessmentIconKindFromPathDirections(directions: string[]): AssessmentIconKind {
  const kinds = new Set(directions.map((direction) => assessmentIconKindFromStructuredSignal({ direction })));
  if (kinds.has("positive") && kinds.has("risk")) return "ambivalent";
  if (kinds.has("ambivalent")) return "ambivalent";
  if (kinds.size === 1) return [...kinds][0];
  if (kinds.has("unknown")) return "unknown";
  return "open";
}

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
      directionKind: assessmentIconKindFromStructuredSignal({ direction: override.direction_label }),
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
      directionKind: assessmentIconKindFromStructuredSignal({ direction: assessment.category }),
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
    directionKind: pathDirections.length
      ? assessmentIconKindFromPathDirections((workingAct.reviewDetail?.impactPaths ?? []).map((path) => path.direction))
      : "portfolio",
    evidenceSummary: projection.fields.evidence_summary,
    realityCheckSummary: projection.fields.reality_check_summary,
  };
}
