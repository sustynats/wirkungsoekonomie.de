import type { OverviewAssessmentData } from "@/lib/presentation/overview-assessment";

export function OverviewAssessment({ assessment, compact = false }: { assessment: OverviewAssessmentData; compact?: boolean }) {
  return (
    <section className={`overview-assessment${compact ? " overview-assessment--compact" : ""}`} aria-label="Zusammenfassende WÖk-Bewertung">
      <p className="eyebrow">Zusammenfassende WÖk-Bewertung</p>
      <p className="overview-assessment-label"><strong>{assessment.assessmentLabel}</strong></p>
      <p className="overview-assessment-core"><strong>Wirkungskern:</strong> {assessment.impactCoreSummary}</p>
      {assessment.editorialSummary !== assessment.impactCoreSummary && <p className="overview-assessment-summary">{assessment.editorialSummary}</p>}
      <p className="overview-assessment-finding"><strong>Key Finding:</strong> {assessment.keyFinding}</p>
      <dl className="overview-assessment-axis">
        <div><dt>Wirkungsrichtung</dt><dd>{assessment.directionLabel}</dd></div>
        <div><dt>Evidenzstatus</dt><dd>{assessment.evidenceSummary}</dd></div>
        {assessment.realityCheckSummary && <div><dt>Reality-Check</dt><dd>{assessment.realityCheckSummary}</dd></div>}
      </dl>
    </section>
  );
}
