import type { PublicAssessment } from "@/data/cases";
import { humanizeSystemValue } from "@/lib/presentation/labels";

export function AssessmentExplainer({ assessment }: { assessment: PublicAssessment }) {
  const coverage = assessment.calculationCoverage;
  return (
    <section className="assessment-explainer" aria-labelledby="assessment-title">
      <div className="assessment-summary">
        <p className="eyebrow">WÖk-Einordnung</p>
        <h2 id="assessment-title">{assessment.category}</h2>
        <p>{assessment.summary}</p>
        <p className="assessment-evidence"><strong>Evidenzstatus:</strong> {humanizeSystemValue(assessment.evidenceStatus)}</p>
      </div>

      <div className="assessment-why">
        <h3>Warum diese Einordnung?</h3>
        <ol>{assessment.rationale.map((reason) => <li key={reason}>{reason}</li>)}</ol>
      </div>

      <div className="assessment-coverage" aria-label="Transparenz der Einordnung">
        <div><strong>{coverage.quantified}</strong><span>quantifizierte Wirkungsaspekte</span></div>
        <div><strong>{coverage.ruleBased}</strong><span>regelbasiert eingeordnet</span></div>
        <div><strong>{coverage.notRobustlyQuantifiable}</strong><span>nicht belastbar quantifizierbar</span></div>
      </div>

      <details className="calculation-drawer">
        <summary>Wie wurde das berechnet?</summary>
        <p>Der Rechenweg trennt Beobachtung, Gegenfaktum, Zurechnung und normative Einordnung. Werte ohne belastbare Grundlage bleiben sichtbar als Datenlücke.</p>
        <dl>
          {assessment.calculationSteps.map((step) => <div key={`${step.label}-${step.value}`}><dt>{step.label}</dt><dd><strong>{step.value}</strong><span>{step.note}</span></dd></div>)}
        </dl>
      </details>

      <details className="calculation-drawer">
        <summary>Unsicherheit und was das Ergebnis verändern würde</summary>
        <p>{assessment.uncertainty}</p>
        <ul>{assessment.changeConditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
      </details>
    </section>
  );
}
