import { overviewAssessmentPublicCopy, type AssessmentIconKind, type OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import { BoundaryIcon, CalculationIcon, CheckCircleIcon, EvidenceIcon, MonitorIcon, PathIcon } from "@/app/components/icons";

function AssessmentIcon({ directionLabel, kind }: { directionLabel: string; kind: AssessmentIconKind }) {
  const iconLabel = `Symbol für Wirkungsrichtung: ${directionLabel}`;
  return (
    <span className={`overview-assessment-icon overview-assessment-icon--${kind}`} role="img" aria-label={iconLabel} data-woek-assessment-icon={kind}>
      {kind === "portfolio" ? <CalculationIcon aria-hidden="true" />
        : kind === "protection" || kind === "risk" ? <BoundaryIcon aria-hidden="true" />
          : kind === "ambivalent" ? <PathIcon aria-hidden="true" />
            : kind === "open" || kind === "neutral" || kind === "unknown" ? <EvidenceIcon aria-hidden="true" />
              : kind === "conditional" ? <MonitorIcon aria-hidden="true" />
                : <CheckCircleIcon aria-hidden="true" />}
    </span>
  );
}

export function OverviewAssessment({ assessment, compact = false }: { assessment: OverviewAssessmentData; compact?: boolean }) {
  const publicCopy = overviewAssessmentPublicCopy(assessment);
  return (
    <section
      className={`overview-assessment${compact ? " overview-assessment--compact" : ""}`}
      aria-label="Zusammenfassende WÖk-Bewertung"
      data-woek-preview-assessment="published"
      data-woek-assessment-surface={compact ? "preview" : "detail"}
      data-woek-assessment-direction={assessment.directionKind}
    >
      <div className="overview-assessment-heading">
        <AssessmentIcon directionLabel={assessment.directionLabel} kind={assessment.directionKind} />
        <div>
          <p className="eyebrow">{compact ? "WÖk-Kurzbewertung" : "Executive-WÖk-Zusammenfassung"}</p>
          <p className="overview-assessment-label">{assessment.assessmentLabel}</p>
        </div>
      </div>
      <p className="overview-assessment-summary"><strong>Wirkungspotenzial kompakt:</strong> {publicCopy.summary}</p>
      {publicCopy.impactCore ? <p className="overview-assessment-core"><strong>Wirkungskern:</strong> {publicCopy.impactCore}</p> : null}
      {publicCopy.keyFinding ? <p className="overview-assessment-finding"><strong>Key Finding:</strong> {publicCopy.keyFinding}</p> : null}
      <dl className="overview-assessment-axis">
        <div><dt>Wirkungsrichtung</dt><dd>{assessment.directionLabel}</dd></div>
        <div><dt>Evidenzstatus</dt><dd>{assessment.evidenceSummary}</dd></div>
        {assessment.realityCheckSummary && <div><dt>Reality-Check</dt><dd>{assessment.realityCheckSummary}</dd></div>}
      </dl>
    </section>
  );
}
