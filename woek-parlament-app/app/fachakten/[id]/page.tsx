import { notFound } from "next/navigation";
import Link from "next/link";
import { fachakteById, readProgrammeSummary } from "@/lib/fachbasis";

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
    <section className="shell section fachakte-document-wrap" aria-labelledby="fachakte-full-title">
      <div className="section-heading"><div><p className="eyebrow">Vollständige Fachakte</p><h2 id="fachakte-full-title">Quellen, Wirkpfade, Risiken, Bedingungen und Datenlücken</h2></div></div>
      <p className="fachakte-note">Die Kurzansicht oben erleichtert die Orientierung. Die vollständige Fachakte wird ohne Kürzung als eigene, statische Lesefassung ausgeliefert – damit auch umfangreiche Quellenakten zuverlässig erreichbar bleiben.</p>
      <a className="button button-primary" href={`/fachakten/dossiers/${entry.id}.html`}>Vollständige Fachakte lesen <span aria-hidden="true">→</span></a>
    </section>
  </main>;
}
