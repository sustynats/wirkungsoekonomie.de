import { notFound } from "next/navigation";
import Link from "next/link";
import { fachakteById, readProgrammeSummary } from "@/lib/fachbasis";
import { PathIcon } from "@/app/components/icons";

export const dynamic = "force-dynamic";

export default async function FachaktePage({ params }: { params: Promise<{ id: string }> }) {
  const entry = fachakteById((await params).id);
  if (!entry) notFound();
  const summary = await readProgrammeSummary(entry);

  return <main>
    <section className="shell fachakte-header">
      <Link className="text-link" href={entry.caseId ? "/entscheidungen" : entry.id.startsWith("sachsen-anhalt-") ? "/laender/sachsen-anhalt" : "/mandat-und-praxis"}>← Zur Übersicht</Link>
      <p className="eyebrow">{entry.eyebrow}</p>
      <h1>{summary?.title ?? entry.title}</h1>
      {summary && <div className="fachakte-summary">
        <p className="lead">{summary.summary}</p>
        <dl>
          <div><dt>{entry.caseId ? "Wirkpfade" : "Quellengebundene Zusagen"}</dt><dd>{entry.caseId ? summary.impactPaths || "–" : summary.commitments || "–"}</dd></div>
          <div><dt>{entry.caseId ? "Berechnungsansätze" : "Zentrale Wirkpfade"}</dt><dd>{entry.caseId ? summary.calculations || "–" : summary.impactPaths || "–"}</dd></div>
          <div><dt>{entry.caseId ? "Datenlücken" : "Berührte Politikfelder"}</dt><dd>{entry.caseId ? summary.dataGaps || "–" : summary.domains || "–"}</dd></div>
        </dl>
      </div>}
    </section>
    {!entry.caseId && summary?.resultHeadline && <section className="shell section programme-result" aria-labelledby="programme-result-title">
      <div className="section-heading"><div><p className="eyebrow">Ergebnis der Ex-ante-Prüfung</p><h2 id="programme-result-title">{summary.resultHeadline}</h2><p className="lead">{summary.resultTeaser}</p></div></div>
      <div className="programme-result-grid">
        <article>
          <p className="programme-result-icon programme-result-icon--potential"><PathIcon aria-hidden="true" /></p>
          <h3>Erkennbares Wirkungspotenzial</h3>
          <ul>{summary.potentialHighlights.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <p className="programme-result-icon" aria-hidden="true">!</p>
          <h3>Risiken und Zielkonflikte</h3>
          <ul>{summary.riskHighlights.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <p className="programme-result-icon" aria-hidden="true">?</p>
          <h3>Was noch geklärt werden muss</h3>
          <ul>{summary.conditions.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </div>
      {summary.communicationNote && <aside className="programme-communication-note"><strong>Kommunikative Vorwirkung:</strong> {summary.communicationNote}</aside>}
      <p className="programme-result-boundary"><strong>Einordnung:</strong> Das ist eine Prüfung des Wirkungspotenzials vor einer politischen Entscheidung. Sie bewertet weder Menschen noch Parteien und behauptet keine bereits eingetretene Wirkung.</p>
    </section>}
    <section className="shell section fachakte-document-wrap" aria-labelledby="fachakte-full-title">
      <div className="section-heading"><div><p className="eyebrow">Vollständige Fachakte</p><h2 id="fachakte-full-title">Quellen, Wirkpfade, Risiken, Bedingungen und Datenlücken</h2></div></div>
      <p className="fachakte-note">Die Kurzansicht oben erleichtert die Orientierung. Die vollständige Fachakte wird ohne Kürzung als eigene, statische Lesefassung ausgeliefert – damit auch umfangreiche Quellenakten zuverlässig erreichbar bleiben.</p>
      <a className="button button-primary" href={`/fachakten/dossiers/${entry.id}.html`}>Vollständige Fachakte lesen <span aria-hidden="true">→</span></a>
    </section>
  </main>;
}
