import Link from "next/link";
import { listPublishedCases } from "@/lib/cases";
import { getPublicImpactCases } from "@/lib/government/impact-cases";
import { getApprovedParliamentDailyImpactCases } from "@/lib/parliament/daily-impact-cases";

export const metadata = {
  title: "Wirkungsfälle",
  description: "Politische Wirkungsgegenstände aus Bund, Ländern und Europäischer Union - mit Wirkungspotenzialen, Risiken, Evidenz und späteren Reality Checks.",
};

export default function ImpactCasesPage() {
  const government = getPublicImpactCases();
  const parliamentDaily = getApprovedParliamentDailyImpactCases();
  const established = listPublishedCases();
  return <main className="shell content-page impact-case-index">
    <header className="page-intro">
      <p className="eyebrow">Wirkung zuerst</p>
      <h1>Politische Entscheidungen nach ihrem Wirkungsgegenstand verstehen.</h1>
      <p className="lead">Ein Gesetzentwurf, ein Kabinettsbeschluss und die spätere Verkündung können Stationen derselben Sache sein. Deshalb bündelt ein WÖkImpactCase den fachlich zusammengehörenden Wirkungsgegenstand - ohne Prozessschritte doppelt zu bewerten.</p>
    </header>
    <section className="impact-case-status" aria-label="Veröffentlichungsstand">
      <div><strong>{established.length}</strong><span>veröffentlichte Parlamentsakten</span></div>
      <div><strong>{government.length + parliamentDaily.length}</strong><span>fachlich freigegebene ImpactCases im gemeinsamen Modell</span></div>
      <div><strong>0</strong><span>Regierungs- oder Parteienranglisten</span></div>
    </section>
    <section className="section section-compact" aria-labelledby="current-impact-cases">
      <p className="eyebrow">Gemeinsames Fachmodell</p><h2 id="current-impact-cases">Aktuelle WÖkImpactCases</h2>
      {government.length + parliamentDaily.length ? <div className="source-register">{[...government, ...parliamentDaily].map((record) => <article key={`${record.impact_case_id}-${record.analysis_version}`}>
        <p className="source-register-label">{record.analysis_mode === "IMPACT_REALITY_CHECK" ? "Reality Check" : "Wirkungspotenzial ex ante"} · Version {record.analysis_version}</p>
        <h3>{record.title}</h3><p>{record.impact_summary.public_summary}</p>
        <p><strong>Wirkungskern:</strong> {record.impact_summary.central_lever}</p>
        <Link className="text-link" href={`/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`}>Vollständige Wirkungsanalyse ansehen <span aria-hidden="true">→</span></Link>
      </article>)}</div> : <div className="open-state"><span aria-hidden="true">!</span><div><strong>Noch keine gemeinsame Fachfreigabe veröffentlicht.</strong><p>Faktenakten und bestehende Fachakten bleiben erreichbar. Neue ImpactCases erscheinen erst nach technischer Validierung und fachlicher Freigabe.</p></div></div>}
    </section>
    <section className="section section-compact" aria-labelledby="established-files"><p className="eyebrow">Bestehender Bestand</p><h2 id="established-files">Parlamentarische Fachakten</h2><p>Die ausführlichen bestehenden Analysen werden nicht verkürzt oder durch neue Kurzobjekte ersetzt.</p><div className="source-register">{established.slice(0, 12).map((record) => <article key={record.slug}><h3>{record.plainTitle || record.title}</h3><p>{record.summary}</p><Link className="text-link" href={`/entscheidungen/${record.slug}`}>Fachakte öffnen <span aria-hidden="true">→</span></Link></article>)}</div></section>
  </main>;
}
