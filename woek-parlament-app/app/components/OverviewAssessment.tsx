import type { OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import { BoundaryIcon, CalculationIcon, CheckCircleIcon, EvidenceIcon, MonitorIcon, PathIcon } from "@/app/components/icons";

type AssessmentIconKind = "positive" | "risk" | "ambivalent" | "open" | "portfolio" | "conditional" | "protection";

function assessmentIconKind(label: string): AssessmentIconKind {
  const normalized = label.toLocaleLowerCase("de-DE");
  if (/portfolio|einzelma(?:ß|ss)nahmen|disaggreg|einheitsrichtung/.test(normalized)) return "portfolio";
  if (/schutz/.test(normalized) && /risik|freiheit|recht|nebenwirkung/.test(normalized)) return "protection";
  if (/gegenläufig|ambivalent|zielkonflikt/.test(normalized)) return "ambivalent";
  if (/risiko|negativ|schaden/.test(normalized)) return "risk";
  if (/offen|unklar|nicht bewertbar/.test(normalized)) return "open";
  if (/bedingt|voraussetzung|umsetzung|abhängig/.test(normalized)) return "conditional";
  return "positive";
}

function AssessmentIcon({ label }: { label: string }) {
  const kind = assessmentIconKind(label);
  const iconLabel = `Symbol für die WÖk-Kurzbewertung: ${label}`;
  return (
    <span className={`overview-assessment-icon overview-assessment-icon--${kind}`} role="img" aria-label={iconLabel} data-woek-assessment-icon={kind}>
      {kind === "portfolio" ? <CalculationIcon aria-hidden="true" />
        : kind === "protection" || kind === "risk" ? <BoundaryIcon aria-hidden="true" />
          : kind === "ambivalent" ? <PathIcon aria-hidden="true" />
            : kind === "open" ? <EvidenceIcon aria-hidden="true" />
              : kind === "conditional" ? <MonitorIcon aria-hidden="true" />
                : <CheckCircleIcon aria-hidden="true" />}
    </span>
  );
}

export function OverviewAssessment({ assessment, compact = false }: { assessment: OverviewAssessmentData; compact?: boolean }) {
  return (
    <section
      className={`overview-assessment${compact ? " overview-assessment--compact" : ""}`}
      aria-label="Zusammenfassende WÖk-Bewertung"
      data-woek-preview-assessment="published"
      data-woek-assessment-surface={compact ? "preview" : "detail"}
    >
      <div className="overview-assessment-heading">
        <AssessmentIcon label={assessment.assessmentLabel} />
        <div>
          <p className="eyebrow">{compact ? "WÖk-Kurzbewertung" : "Executive-WÖk-Zusammenfassung"}</p>
          <p className="overview-assessment-label"><strong>{assessment.assessmentLabel}</strong></p>
        </div>
      </div>
      <p className="overview-assessment-summary"><strong>Wirkungspotenzial kompakt:</strong> {assessment.editorialSummary}</p>
      <p className="overview-assessment-core"><strong>Wirkungskern:</strong> {assessment.impactCoreSummary}</p>
      <p className="overview-assessment-finding"><strong>Key Finding:</strong> {assessment.keyFinding}</p>
      <dl className="overview-assessment-axis">
        <div><dt>Wirkungsrichtung</dt><dd>{assessment.directionLabel}</dd></div>
        <div><dt>Evidenzstatus</dt><dd>{assessment.evidenceSummary}</dd></div>
        {assessment.realityCheckSummary && <div><dt>Reality-Check</dt><dd>{assessment.realityCheckSummary}</dd></div>}
      </dl>
    </section>
  );
}
