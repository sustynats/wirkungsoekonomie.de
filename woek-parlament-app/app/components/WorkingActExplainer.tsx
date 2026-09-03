import type { PublicWorkingAct } from "@/data/cases";
import { humanizeSystemValue } from "@/lib/presentation/labels";
import { ImpactReviewMap } from "@/app/components/ImpactReviewMap";
import { ImpactProfileRadar, type ImpactProfileAxis } from "@/app/components/ImpactProfileRadar";

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

export type WorkingActView = "ueberblick" | "wirkprofil" | "wirkpfade" | "berechnungen";

function List({ items, empty = "Keine weiteren Angaben dokumentiert." }: { items: string[]; empty?: string }) {
  return items.length > 0 ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{empty}</p>;
}

function documentedStatus(available: boolean): ImpactProfileAxis["status"] {
  return available ? "AUSGEWIESEN" : "OFFEN";
}

function profileAxes(workingAct: PublicWorkingAct): ImpactProfileAxis[] {
  const detail = workingAct.reviewDetail;
  return [
    { id: "gegenstand", label: "Gegenstand", status: "AUSGEWIESEN", description: "Entscheidungsgegenstand und Prüfrahmen" },
    { id: "wirkpfade", label: "Wirkpfade", status: documentedStatus((detail?.impactPaths.length ?? 0) > 0), description: "mögliche Veränderungslogik" },
    { id: "risiken", label: "Risiken", status: documentedStatus(workingAct.risks.length > 0 || (detail?.risks.length ?? 0) > 0), description: "mögliche Nebenwirkungen" },
    { id: "evidenz", label: "Evidenz", status: workingAct.dataGaps.length > 0 ? "TEILWEISE_AUSGEWIESEN" : "AUSGEWIESEN", description: "Quellen, Datenlücken und Grenzen" },
    { id: "schutz", label: "Schutzgrenzen", status: documentedStatus((detail?.boundaries.length ?? 0) > 0), description: "nicht kompensierbare Belange" },
    { id: "rueckkopplung", label: "Rückkopplung", status: documentedStatus(Boolean(detail?.feedback)), description: "spätere Beobachtung und Korrektur" }
  ];
}

/**
 * Every validated review is presented with the same progressive disclosure:
 * an understandable summary first, then its complete public reasoning.
 */
export function WorkingActExplainer({ workingAct, view = "ueberblick", publicEvidenceSummary }: { workingAct: PublicWorkingAct; view?: WorkingActView; publicEvidenceSummary: string }) {
  const detail = workingAct.reviewDetail;
  const editorial = workingAct.editorialSummary;
  const hasDetails = workingAct.changeLevers.length > 0 || workingAct.risks.length > 0 || workingAct.dataGaps.length > 0 || workingAct.counterfactualQuestions.length > 0;
  const isPortfolioReview = (detail?.impactPaths.length ?? 0) >= 8;
  const detailTitle = view === "wirkprofil" ? "Wirkprofil: Mensch, Planet und Demokratie" : view === "wirkpfade" ? "Wirkpfade und Stellschrauben" : "Rechenweg, Schutzgates und Rückkopplung";
  const detailLead = view === "wirkprofil"
    ? "Das Wirkprofil trennt berührte Zustände und Schutzgüter. Es ist weder eine Gesamtnote noch ein Nachweis bereits eingetretener Wirkung."
    : view === "wirkpfade"
      ? "Jeder Wirkpfad beschreibt eine begründete Annahme darüber, wie aus einer Entscheidung eine Veränderung entstehen könnte. Er ist kein Kausalitätsbeweis."
      : "Wo eine Rechnung möglich ist, zeigt die Akte Formel- und Datenanforderung. Fehlende Werte bleiben als Datenlücke sichtbar; Schutzgates werden nicht weggerechnet.";
  return (
    <>
      {view === "ueberblick" && <section className="working-act" aria-labelledby="working-act-title">
        <div className="working-act-summary">
          <p className="eyebrow">Prüfstand · {workingActMaturityLabel(workingAct.maturity)}</p>
          <h2 id="working-act-title">Was diese Analyse vor der Entscheidung zeigt</h2>
          <p><strong>Fallbezogene Evidenz:</strong> {publicEvidenceSummary}</p>
          <p className="working-act-potential"><strong>Wirkungspotenzial und Grenze der Aussage:</strong> {workingAct.overallPotential}</p>
          <p className="working-act-boundary"><strong>Noch offen:</strong> {editorial?.whatIsNotYetKnown || editorial?.evidenceBoundary || "Die Akte unterscheidet Wirkungspotenziale, Risiken und beobachtete Wirkung. Eine belastbare Aussage folgt nur, soweit Quellen, Vergleichsfrage und Zurechnung dies tragen."}</p>
        </div>
        {hasDetails && <div className="working-act-details">
          {workingAct.changeLevers.length > 0 && <article><h3>Was könnte die Wirkung robuster machen?</h3><List items={workingAct.changeLevers} /></article>}
          {workingAct.risks.length > 0 && <article><h3>Wirkungsrisiken, die nicht untergehen dürfen</h3><List items={workingAct.risks} /></article>}
          {workingAct.counterfactualQuestions.length > 0 && <article><h3>Welche Vergleichsfragen sind entscheidend?</h3><List items={workingAct.counterfactualQuestions} /></article>}
          {workingAct.dataGaps.length > 0 && <article><h3>Welche Daten fehlen noch?</h3><List items={workingAct.dataGaps} /></article>}
          {editorial?.improvementOptions.length ? <article><h3>Was könnte noch verbessert werden?</h3><List items={editorial.improvementOptions} /></article> : null}
        </div>}
      </section>}

      {view === "ueberblick" && detail && detail.impactPaths.length > 0 && <ImpactReviewMap
        title="Wirkungslogik im Überblick"
        dimensions={detail.impactPaths.slice(0, 3).map((path) => ({
          id: path.id,
          label: path.lever,
          detail: `${humanizeSystemValue(path.direction)}: ${path.hypothesis}`,
          status: humanizeSystemValue(path.evidenceStatus)
        }))}
      />}

      {view === "ueberblick" && <ImpactProfileRadar axes={profileAxes(workingAct)} />}

      {detail && view !== "ueberblick" && <section className="review-deep-dive" aria-labelledby="review-deep-dive-title">
        <header className="review-deep-dive-header"><p className="eyebrow">Wirkungsakte · Vertiefung</p><h2 id="review-deep-dive-title">{detailTitle}</h2><p>{detailLead}</p></header>

        {view === "wirkprofil" && detail.impactDomains.length > 0 && <section id="wirkprofil" className="review-detail-section" aria-labelledby="impact-domains-title"><h3 id="impact-domains-title">Mensch, Planet und Demokratie</h3><p className="section-intro">Das Wirkprofil zeigt berührte Zustände und Schutzgüter. Es ist weder eine Gesamtnote noch ein Nachweis bereits eingetretener Wirkung.</p><div className="review-domain-grid">{detail.impactDomains.map((domain) => <article key={domain.domain}><p className="eyebrow">{domain.domain}</p><h4>{humanizeSystemValue(domain.assessment)}</h4><List items={domain.relevance} empty="Für diesen Bereich sind noch keine einzelnen Bezugspunkte dokumentiert." /></article>)}</div></section>}

        {view === "wirkpfade" && isPortfolioReview && <section id="portfolio" className="review-detail-section portfolio-overview" aria-labelledby="portfolio-title"><p className="eyebrow">Wirkungsportfolio</p><h3 id="portfolio-title">{detail.impactPaths.length} Wirkungsfelder – getrennt statt aufgerechnet</h3><p className="section-intro">Dieses Portfolio bündelt die geprüften Wirkpfade der Entscheidung. Mittel, Zusagen oder Reichweite sind noch keine Wirkung. Deshalb bleibt jeder Pfad mit Voraussetzungen, Risiken, Datenlücken und Schutzgates einzeln prüfbar.</p><ol className="portfolio-path-grid">{detail.impactPaths.map((path) => <li key={path.id}><a href={`#wirkpfad-${path.id}`}><span>{path.id}</span><strong>{path.lever}</strong><small>{humanizeSystemValue(path.direction)}</small></a></li>)}</ol></section>}

        {view === "wirkpfade" && detail.impactPaths.length > 0 && <section id="wirkpfade" className="review-detail-section" aria-labelledby="impact-paths-title"><h3 id="impact-paths-title">Alle Wirkpfade</h3><p className="section-intro">Ein Wirkpfad beschreibt eine begründete Annahme darüber, wie aus einer Entscheidung eine Veränderung entstehen könnte. Er ist kein Nachweis, dass diese Veränderung eintritt.</p><div className="review-accordion-list">{detail.impactPaths.map((path) => <details id={`wirkpfad-${path.id}`} key={path.id} className="review-accordion"><summary><span>{path.id}</span><strong>{path.lever}</strong><em>{humanizeSystemValue(path.direction)}</em></summary><div className="review-accordion-content"><p><strong>Wirkannahme:</strong> {path.hypothesis}</p><div className="review-detail-columns"><div><h4>Betroffen</h4><List items={[...path.affectedDimensions, ...path.affectedGroups]} /></div><div><h4>Voraussetzungen</h4><List items={path.prerequisites} /></div><div><h4>Risiken und Nebenwirkungen</h4><List items={path.risks} /></div></div><p className="review-evidence-boundary"><strong>Evidenzgrenze:</strong> {path.evidenceBoundary}</p><p className="review-change-lever"><strong>Stellschraube:</strong> {path.changeLever}</p></div></details>)}</div></section>}

        {view === "berechnungen" && detail.calculations.length > 0 && <section id="berechnungen" className="review-detail-section" aria-labelledby="calculation-title"><h3 id="calculation-title">Berechnungsansätze und Datengrundlage</h3><p className="section-intro">Wo eine Rechnung möglich ist, zeigt die Akte die Formel- und Datenanforderung. Fehlende Werte werden nicht geschätzt, sondern als Datenlücke ausgewiesen.</p><div className="review-accordion-list">{detail.calculations.map((calculation) => <details key={calculation.id} className="review-accordion"><summary><span>{calculation.id}</span><strong>{calculation.name}</strong><em>{humanizeSystemValue(calculation.status)}</em></summary><div className="review-accordion-content"><p>{calculation.specification}</p><div className="review-detail-columns"><div><h4>Benötigte Eingaben</h4><List items={calculation.requiredInputs} /></div><div><h4>Bereits vorhanden</h4><List items={calculation.availableInputs} /></div><div><h4>Noch erforderlich</h4><List items={calculation.missingInputs} /></div></div></div></details>)}</div></section>}

        {view === "berechnungen" && (detail.risks.length > 0 || detail.boundaries.length > 0 || detail.counterfactuals.length > 0) && <section id="schutzgates" className="review-detail-section review-protection-grid" aria-label="Risiken, Schutzgrenzen und Vergleichsfragen">{detail.risks.length > 0 && <article><h3>Risiken</h3><List items={detail.risks.map((risk) => `${risk.id}: ${risk.description} (${humanizeSystemValue(risk.status)})`)} /></article>}{detail.boundaries.length > 0 && <article><h3>Schutzgates</h3><List items={detail.boundaries.map((boundary) => `${boundary.boundary} – ${boundary.reason} (${humanizeSystemValue(boundary.status)})`)} /></article>}{detail.counterfactuals.length > 0 && <article><h3>Vergleichsfragen</h3><List items={detail.counterfactuals.map((counterfactual) => `${counterfactual.question} (${humanizeSystemValue(counterfactual.status)})`)} /></article>}</section>}

        {view === "berechnungen" && detail.counterarguments.length > 0 && <section className="review-detail-section review-counterarguments"><h3>Gegenprüfung</h3><List items={detail.counterarguments} /></section>}

        {view === "berechnungen" && detail.feedback && <section id="rueckkopplung" className="review-detail-section review-feedback" aria-labelledby="feedback-title"><h3 id="feedback-title">Rückkopplung und spätere Prüfung</h3>{detail.feedback.interpretation && <p>{detail.feedback.interpretation}</p>}<div className="review-detail-columns"><div><h4>Vollzug beobachten</h4><p>{detail.feedback.outputFeedback || "Die Vollzugsbeobachtung wird nach Veröffentlichung der Umsetzung konkretisiert."}</p></div><div><h4>Zustandsänderungen beobachten</h4><p>{detail.feedback.outcomeFeedback || "Die späteren Zustandsindikatoren werden mit dem Wirkpfad verknüpft."}</p></div><div><h4>Zurechnung prüfen</h4><p>{detail.feedback.causalReview || "Eine starke Zurechnung setzt eine begründete Vergleichsfrage voraus."}</p></div></div>{detail.feedback.dataGaps.length > 0 && <div><h4>Rückkopplung: fehlende Daten</h4><List items={detail.feedback.dataGaps} /></div>}</section>}
      </section>}
    </>
  );
}
