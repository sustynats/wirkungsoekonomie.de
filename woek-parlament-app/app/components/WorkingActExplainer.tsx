import type { PublicImpactPathDetail, PublicWorkingAct } from "@/data/cases";
import Link from "next/link";
import { humanizeSystemValue } from "@/lib/presentation/labels";
import { ImpactReviewMap } from "@/app/components/ImpactReviewMap";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

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

function List({ items, empty }: { items: string[]; empty?: string }) {
  return items.length > 0 ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : empty ? <p>{empty}</p> : null;
}

function formatVoteNumber(value: number | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat("de-DE").format(value) : "–";
}

function parentImpactPath(path: PublicImpactPathDetail, allPaths: PublicImpactPathDetail[]) {
  const parentId = path.id.includes("-R") ? path.id.split("-R")[0] : null;
  return parentId ? allPaths.find((candidate) => candidate.id === parentId || candidate.id === `${parentId}-P`) : undefined;
}

function detailedHypothesis(path: PublicImpactPathDetail, allPaths: PublicImpactPathDetail[]) {
  if (path.hypothesis.trim().length >= 60) return path.hypothesis;
  const parent = parentImpactPath(path, allPaths);
  if (parent) {
    return `${path.hypothesis} ist ein eigenständig ausgewiesenes negatives Wirkungsrisiko innerhalb des übergeordneten Mechanismus: ${parent.hypothesis} Die Richtung ist negativ, weil der Eintritt dieses Risikos die betroffenen Zustände oder Schutzgüter verschlechtern würde. Damit ist nicht behauptet, dass der Nachteil sicher oder in einer bestimmten Größenordnung eintritt.`;
  }
  return `${path.hypothesis} bezeichnet die mögliche Zustandsänderung dieses Wirkpfads. Die Richtungsangabe folgt dem fachlichen Referenzrahmen; Eintritt, Größenordnung und kausale Zurechnung bleiben bis zu einer belastbaren Beobachtung und Vergleichsprüfung offen.`;
}

function detailedEvidenceBoundary(path: PublicImpactPathDetail) {
  return path.evidenceBoundary?.trim() || "Die vorliegenden Quellen tragen die fachliche Ex-ante-Hypothese, belegen aber weder eine bereits eingetretene Zustandsänderung noch deren Größenordnung oder eindeutige Zurechnung zur Entscheidung. Erforderlich sind Vollzugs- und Beobachtungsdaten sowie ein belastbares Gegenfaktum.";
}

function ImpactPathChain({ path, allPaths }: { path: PublicImpactPathDetail; allPaths: PublicImpactPathDetail[] }) {
  const prerequisite = path.prerequisites[0] ?? "Keine zusätzliche Voraussetzung dokumentiert";
  return <figure className="impact-path-chain" aria-label={`Wirkpfad ${path.id}: ${path.lever}`}>
    <ol>
      <li><span>1</span><strong>Entscheidung / Stellhebel</strong><p>{path.lever}</p></li>
      <li><span>2</span><strong>Angenommener Mechanismus</strong><p>{detailedHypothesis(path, allPaths)}</p></li>
      <li className="is-critical"><span>3</span><strong>Kritische Voraussetzung</strong><p>{prerequisite}</p></li>
      <li className="is-boundary"><span>4</span><strong>Hier bleibt der Pfad unsicher</strong><p>{detailedEvidenceBoundary(path)}</p></li>
    </ol>
    <figcaption>Die markierte Stelle zeigt keine gescheiterte Wirkung, sondern die Voraussetzung und Evidenzgrenze, an der der mögliche Wirkpfad besonders geprüft werden muss.</figcaption>
  </figure>;
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
        {hasDetails && <div className="working-act-details" id="working-act-open-items">
          {workingAct.changeLevers.length > 0 && <article><h3>Was könnte die Wirkung robuster machen?</h3><List items={workingAct.changeLevers} /></article>}
          {workingAct.risks.length > 0 && <article><h3>Wirkungsrisiken, die nicht untergehen dürfen</h3><List items={workingAct.risks} /></article>}
          {workingAct.counterfactualQuestions.length > 0 && <article><h3>Welche Vergleichsfragen sind entscheidend?</h3><List items={workingAct.counterfactualQuestions} /></article>}
          {workingAct.dataGaps.length > 0 && <article><h3>Welche Daten fehlen noch?</h3><List items={workingAct.dataGaps} /></article>}
        </div>}
      </section>

      {workingAct.voteLayer && <section className="decision-section public-vote-layer" aria-labelledby="public-vote-title">
        <p className="eyebrow">Amtlicher Beschluss</p><h2 id="public-vote-title">Wie wurde tatsächlich abgestimmt?</h2>
        <div className="vote-layer-facts">
          {workingAct.voteLayer.date && <div><span>Datum</span><strong>{new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(new Date(`${workingAct.voteLayer.date}T12:00:00Z`))}</strong></div>}
          {workingAct.voteLayer.result && <div><span>Ergebnis</span><strong>{humanizeSystemValue(workingAct.voteLayer.result)}</strong></div>}
          <div><span>Abstimmungsart</span><strong>{workingAct.voteLayer.rollCall === "ROLL_CALL_OFFICIAL" ? "Namentliche Abstimmung" : "Keine namentliche Abstimmung für diesen Vorgang"}</strong></div>
        </div>
        {workingAct.voteLayer.overall && <dl className="vote-overall-grid">
          <div><dt>Ja</dt><dd>{formatVoteNumber(workingAct.voteLayer.overall.yes)}</dd></div>
          <div><dt>Nein</dt><dd>{formatVoteNumber(workingAct.voteLayer.overall.no)}</dd></div>
          <div><dt>Enthaltung</dt><dd>{formatVoteNumber(workingAct.voteLayer.overall.abstain)}</dd></div>
          {typeof workingAct.voteLayer.overall.notVoted === "number" && <div><dt>Nicht abgestimmt</dt><dd>{formatVoteNumber(workingAct.voteLayer.overall.notVoted)}</dd></div>}
        </dl>}
        {workingAct.voteLayer.factions.length > 0 && <div className="vote-faction-table" role="region" aria-label="Amtliche Fraktionsangaben" tabIndex={0}><table><thead><tr><th scope="col">Fraktion / Gruppe</th><th scope="col">Votum</th><th scope="col">Ja</th><th scope="col">Nein</th><th scope="col">Enthaltung</th><th scope="col">Nicht abgestimmt</th></tr></thead><tbody>{workingAct.voteLayer.factions.map((faction) => <tr key={faction.name}><th scope="row">{faction.name}</th><td>{faction.result ? humanizeSystemValue(faction.result) : "–"}</td><td>{formatVoteNumber(faction.summary?.yes)}</td><td>{formatVoteNumber(faction.summary?.no)}</td><td>{formatVoteNumber(faction.summary?.abstain)}</td><td>{formatVoteNumber(faction.summary?.notVoted)}</td></tr>)}</tbody></table></div>}
        <p className="vote-interpretation-boundary">Fraktionsangaben werden nicht als individuelle Stimmen rekonstruiert. Personenprofile verwenden ausschließlich amtliche, maschinell geprüfte Individualdaten aus namentlichen Abstimmungen.</p>
        {workingAct.voteLayer.sourceConflict && <aside className="vote-source-conflict"><strong>Dokumentierter Quellenkonflikt</strong><p>{workingAct.voteLayer.sourceConflict}</p></aside>}
        {workingAct.voteLayer.note && <p className="small-meta">{workingAct.voteLayer.note}</p>}
        {workingAct.voteLayer.sourceUrl && <Link className="text-link" href={sourceDetailHrefForUrl(workingAct.voteLayer.sourceUrl)}>Amtliche Quelle und Einordnung ansehen →</Link>}
      </section>}

      {detail && detail.impactPaths.length > 0 && <ImpactReviewMap
        title="Wirkungslogik im Überblick"
        dimensions={detail.impactPaths.slice(0, 3).map((path) => ({
          id: path.id,
          label: path.lever,
          detail: `${humanizeSystemValue(path.direction)}: ${detailedHypothesis(path, detail.impactPaths)}`,
          status: humanizeSystemValue(path.evidenceStatus)
        }))}
      />}

      {detail && <section className="review-deep-dive" aria-labelledby="review-deep-dive-title">
        <header className="review-deep-dive-header"><p className="eyebrow">Vertiefung</p><h2 id="review-deep-dive-title">Die vollständige Wirkungslogik</h2><p>Die folgenden Ebenen stammen aus der strukturierten Fachprüfung. Sie sind aufklappbar, damit die Kurzfassung verständlich bleibt und die fachliche Herleitung vollständig zugänglich ist.</p></header>

        {detail.impactDomains.length > 0 && <section className="review-detail-section" aria-labelledby="impact-domains-title"><h3 id="impact-domains-title">Mensch, Planet und Demokratie</h3><div className="review-domain-grid">{detail.impactDomains.map((domain) => <article key={domain.domain}><p className="eyebrow">{domain.domain}</p><h4>{humanizeSystemValue(domain.assessment)}</h4><List items={domain.relevance} /></article>)}</div></section>}

        {detail.impactPaths.length > 0 && <section className="review-detail-section" aria-labelledby="impact-paths-title"><h3 id="impact-paths-title">Wirkpfade und Stellschrauben</h3><p className="section-intro">Ein Wirkpfad beschreibt eine begründete Annahme darüber, wie aus einer Entscheidung eine Veränderung entstehen könnte. Er ist kein Nachweis, dass diese Veränderung eintritt.</p><div className="review-accordion-list">{detail.impactPaths.map((path) => <details key={path.id} className="review-accordion"><summary><span>{path.id}</span><strong>{path.lever}</strong><em>{humanizeSystemValue(path.direction)}</em></summary><div className="review-accordion-content"><ImpactPathChain path={path} allPaths={detail.impactPaths} /><p><strong>Ausführliche Begründung der Richtung:</strong> {detailedHypothesis(path, detail.impactPaths)}</p><div className="review-detail-columns"><div><h4>Betroffen</h4><List items={[...path.affectedDimensions, ...path.affectedGroups]} /></div><div><h4>Voraussetzungen</h4><List items={path.prerequisites} /></div><div><h4>Risiken und Nebenwirkungen</h4><List items={path.risks} /></div></div><p className="review-evidence-boundary"><strong>Was ist belegt – und was noch nicht?</strong> {detailedEvidenceBoundary(path)}</p><p className="review-change-lever"><strong>Was könnte eine positive Netto-Wirkung robuster machen?</strong> {path.changeLever || "Für diesen Teilpfad ist noch keine konkrete Stellschraube fachlich freigegeben."}</p></div></details>)}</div></section>}

        {detail.calculations.length > 0 && <section className="review-detail-section" aria-labelledby="calculation-title"><h3 id="calculation-title">Berechnungsansätze und Datengrundlage</h3><p className="section-intro">Wo eine Rechnung möglich ist, zeigt die Akte die Formel- und Datenanforderung. Fehlende Werte werden nicht geschätzt, sondern als Datenlücke ausgewiesen.</p><div className="review-accordion-list">{detail.calculations.map((calculation) => <details key={calculation.id} className="review-accordion"><summary><span>{calculation.id}</span><strong>{calculation.name}</strong><em>{humanizeSystemValue(calculation.status)}</em></summary><div className="review-accordion-content"><p>{calculation.specification}</p><div className="review-detail-columns"><div><h4>Benötigte Eingaben</h4><List items={calculation.requiredInputs} /></div><div><h4>Bereits vorhanden</h4><List items={calculation.availableInputs} /></div><div><h4>Noch erforderlich</h4><List items={calculation.missingInputs} /></div></div></div></details>)}</div></section>}

        {(detail.risks.length > 0 || detail.boundaries.length > 0 || detail.counterfactuals.length > 0) && <section className="review-detail-section review-protection-grid" id="review-protection" aria-label="Risiken, Schutzgrenzen und Vergleichsfragen">{detail.risks.length > 0 && <article><h3>Risiken</h3><List items={detail.risks.map((risk) => `${risk.id}: ${risk.description} (${humanizeSystemValue(risk.status)})`)} /></article>}{detail.boundaries.length > 0 && <article><h3>Schutzgrenzen</h3><List items={detail.boundaries.map((boundary) => `${boundary.boundary}${boundary.reason ? ` – ${boundary.reason}` : ""} (${humanizeSystemValue(boundary.status)})`)} /></article>}{detail.counterfactuals.length > 0 && <article><h3>Vergleichsfragen</h3><List items={detail.counterfactuals.map((counterfactual) => `${counterfactual.question} (${humanizeSystemValue(counterfactual.status)})`)} /></article>}</section>}

        {detail.counterarguments.length > 0 && <section className="review-detail-section review-counterarguments" id="review-counterarguments"><h3>Gegenprüfung</h3><List items={detail.counterarguments} /></section>}

        {detail.feedback && <section className="review-detail-section review-feedback" aria-labelledby="feedback-title"><h3 id="feedback-title">Rückkopplung und spätere Prüfung</h3>{detail.feedback.interpretation && <p>{detail.feedback.interpretation}</p>}<div className="review-detail-columns"><div><h4>Vollzug beobachten</h4><p>{detail.feedback.outputFeedback || "Die Vollzugsbeobachtung wird nach Veröffentlichung der Umsetzung konkretisiert."}</p></div><div><h4>Zustandsänderungen beobachten</h4><p>{detail.feedback.outcomeFeedback || "Die späteren Zustandsindikatoren werden mit dem Wirkpfad verknüpft."}</p></div><div><h4>Zurechnung prüfen</h4><p>{detail.feedback.causalReview || "Eine starke Zurechnung setzt eine begründete Vergleichsfrage voraus."}</p></div></div>{detail.feedback.dataGaps.length > 0 && <div><h4>Rückkopplung: fehlende Daten</h4><List items={detail.feedback.dataGaps} /></div>}</section>}
      </section>}
    </>
  );
}
