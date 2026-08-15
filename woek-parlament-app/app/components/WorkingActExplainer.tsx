import type { PublicWorkingAct } from "@/data/cases";
import { humanizeSystemValue } from "@/lib/presentation/labels";
import { ImpactReviewMap } from "@/app/components/ImpactReviewMap";

const maturityLabel: Record<PublicWorkingAct["maturity"], string> = {
  PRELIMINARY_REVIEW: "Vor der Entscheidung geprüft",
  MONITORING: "Beobachtung und Rückkopplung",
  EVIDENCE_REVIEW: "Evidenz wird weiter geprüft",
  CALCULATION: "Berechnungsgrundlagen werden vervollständigt",
  METHOD_REVIEW: "Methodische Frage offen",
  REVIEW_COMPLETE: "Fachliche Prüfung vollständig vorbereitet"
};

export function workingActMaturityLabel(value: PublicWorkingAct["maturity"]) {
  return maturityLabel[value];
}

function List({ items, empty = "Keine weiteren Angaben dokumentiert." }: { items: string[]; empty?: string }) {
  return items.length > 0 ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{empty}</p>;
}

/**
 * Every validated review is presented with the same progressive disclosure:
 * an understandable summary first, then its complete public reasoning.
 */
export function WorkingActExplainer({ workingAct }: { workingAct: PublicWorkingAct }) {
  const detail = workingAct.reviewDetail;
  const hasDetails = workingAct.changeLevers.length > 0 || workingAct.risks.length > 0 || workingAct.dataGaps.length > 0 || workingAct.counterfactualQuestions.length > 0;
  return (
    <>
      <section className="working-act" aria-labelledby="working-act-title">
        <div className="working-act-summary">
          <p className="eyebrow">Prüfstand · {workingActMaturityLabel(workingAct.maturity)}</p>
          <h2 id="working-act-title">Was diese Analyse vor der Entscheidung zeigt</h2>
          <p>{workingAct.scopeStatement}</p>
          <p className="working-act-potential"><strong>Wirkungspotenzial und Grenze der Aussage:</strong> {workingAct.overallPotential}</p>
          <p className="working-act-boundary"><strong>Wichtig:</strong> Diese Seite beschreibt belegte Ausgangslagen, Wirkungspotenziale, Risiken und Bedingungen. Sie behauptet keine bereits eingetretene Wirkung und ersetzt keine parlamentarische Entscheidung.</p>
        </div>
        {hasDetails && <div className="working-act-details">
          {workingAct.changeLevers.length > 0 && <article><h3>Was könnte die Wirkung robuster machen?</h3><List items={workingAct.changeLevers} /></article>}
          {workingAct.risks.length > 0 && <article><h3>Wirkungsrisiken, die nicht untergehen dürfen</h3><List items={workingAct.risks} /></article>}
          {workingAct.counterfactualQuestions.length > 0 && <article><h3>Welche Vergleichsfragen sind entscheidend?</h3><List items={workingAct.counterfactualQuestions} /></article>}
          {workingAct.dataGaps.length > 0 && <article><h3>Welche Daten fehlen noch?</h3><List items={workingAct.dataGaps} /></article>}
        </div>}
      </section>

      {detail && detail.impactPaths.length > 0 && <ImpactReviewMap
        title="Wirkungslogik im Überblick"
        dimensions={detail.impactPaths.slice(0, 3).map((path) => ({
          id: path.id,
          label: path.lever,
          detail: `${humanizeSystemValue(path.direction)}: ${path.hypothesis}`,
          status: humanizeSystemValue(path.evidenceStatus)
        }))}
      />}

      {detail && <section className="review-deep-dive" aria-labelledby="review-deep-dive-title">
        <header className="review-deep-dive-header"><p className="eyebrow">Vertiefung</p><h2 id="review-deep-dive-title">Die vollständige Wirkungslogik</h2><p>Die folgenden Ebenen stammen aus der strukturierten Fachprüfung. Sie sind aufklappbar, damit die Kurzfassung verständlich bleibt und die fachliche Herleitung vollständig zugänglich ist.</p></header>

        {detail.impactDomains.length > 0 && <section className="review-detail-section" aria-labelledby="impact-domains-title"><h3 id="impact-domains-title">Mensch, Planet und Demokratie</h3><div className="review-domain-grid">{detail.impactDomains.map((domain) => <article key={domain.domain}><p className="eyebrow">{domain.domain}</p><h4>{humanizeSystemValue(domain.assessment)}</h4><List items={domain.relevance} empty="Für diesen Bereich sind noch keine einzelnen Bezugspunkte dokumentiert." /></article>)}</div></section>}

        {detail.impactPaths.length > 0 && <section className="review-detail-section" aria-labelledby="impact-paths-title"><h3 id="impact-paths-title">Wirkpfade und Stellschrauben</h3><p className="section-intro">Ein Wirkpfad beschreibt eine begründete Annahme darüber, wie aus einer Entscheidung eine Veränderung entstehen könnte. Er ist kein Nachweis, dass diese Veränderung eintritt.</p><div className="review-accordion-list">{detail.impactPaths.map((path) => <details key={path.id} className="review-accordion"><summary><span>{path.id}</span><strong>{path.lever}</strong><em>{humanizeSystemValue(path.direction)}</em></summary><div className="review-accordion-content"><p><strong>Wirkannahme:</strong> {path.hypothesis}</p><div className="review-detail-columns"><div><h4>Betroffen</h4><List items={[...path.affectedDimensions, ...path.affectedGroups]} /></div><div><h4>Voraussetzungen</h4><List items={path.prerequisites} /></div><div><h4>Risiken und Nebenwirkungen</h4><List items={path.risks} /></div></div><p className="review-evidence-boundary"><strong>Evidenzgrenze:</strong> {path.evidenceBoundary}</p><p className="review-change-lever"><strong>Stellschraube:</strong> {path.changeLever}</p></div></details>)}</div></section>}

        {detail.calculations.length > 0 && <section className="review-detail-section" aria-labelledby="calculation-title"><h3 id="calculation-title">Berechnungsansätze und Datengrundlage</h3><p className="section-intro">Wo eine Rechnung möglich ist, zeigt die Akte die Formel- und Datenanforderung. Fehlende Werte werden nicht geschätzt, sondern als Datenlücke ausgewiesen.</p><div className="review-accordion-list">{detail.calculations.map((calculation) => <details key={calculation.id} className="review-accordion"><summary><span>{calculation.id}</span><strong>{calculation.name}</strong><em>{humanizeSystemValue(calculation.status)}</em></summary><div className="review-accordion-content"><p>{calculation.specification}</p><div className="review-detail-columns"><div><h4>Benötigte Eingaben</h4><List items={calculation.requiredInputs} /></div><div><h4>Bereits vorhanden</h4><List items={calculation.availableInputs} /></div><div><h4>Noch erforderlich</h4><List items={calculation.missingInputs} /></div></div></div></details>)}</div></section>}

        {(detail.risks.length > 0 || detail.boundaries.length > 0 || detail.counterfactuals.length > 0) && <section className="review-detail-section review-protection-grid" aria-label="Risiken, Schutzgrenzen und Vergleichsfragen">{detail.risks.length > 0 && <article><h3>Risiken</h3><List items={detail.risks.map((risk) => `${risk.id}: ${risk.description} (${humanizeSystemValue(risk.status)})`)} /></article>}{detail.boundaries.length > 0 && <article><h3>Schutzgrenzen</h3><List items={detail.boundaries.map((boundary) => `${boundary.boundary} – ${boundary.reason} (${humanizeSystemValue(boundary.status)})`)} /></article>}{detail.counterfactuals.length > 0 && <article><h3>Vergleichsfragen</h3><List items={detail.counterfactuals.map((counterfactual) => `${counterfactual.question} (${humanizeSystemValue(counterfactual.status)})`)} /></article>}</section>}

        {detail.counterarguments.length > 0 && <section className="review-detail-section review-counterarguments"><h3>Gegenprüfung</h3><List items={detail.counterarguments} /></section>}

        {detail.feedback && <section className="review-detail-section review-feedback" aria-labelledby="feedback-title"><h3 id="feedback-title">Rückkopplung und spätere Prüfung</h3>{detail.feedback.interpretation && <p>{detail.feedback.interpretation}</p>}<div className="review-detail-columns"><div><h4>Vollzug beobachten</h4><p>{detail.feedback.outputFeedback || "Die Vollzugsbeobachtung wird nach Veröffentlichung der Umsetzung konkretisiert."}</p></div><div><h4>Zustandsänderungen beobachten</h4><p>{detail.feedback.outcomeFeedback || "Die späteren Zustandsindikatoren werden mit dem Wirkpfad verknüpft."}</p></div><div><h4>Zurechnung prüfen</h4><p>{detail.feedback.causalReview || "Eine starke Zurechnung setzt eine begründete Vergleichsfrage voraus."}</p></div></div>{detail.feedback.dataGaps.length > 0 && <div><h4>Rückkopplung: fehlende Daten</h4><List items={detail.feedback.dataGaps} /></div>}</section>}
      </section>}
    </>
  );
}
