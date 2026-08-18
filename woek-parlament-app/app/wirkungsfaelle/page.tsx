import Link from "next/link";
import { getPublicImpactCases } from "@/lib/government/impact-cases";
import { getApprovedParliamentDailyImpactCases } from "@/lib/parliament/daily-impact-cases";
import { getEuImpactCases } from "@/lib/eu/impact-cases";

export const metadata = {
  title: "Wirkungsfälle",
  description: "Politische Wirkungsgegenstände aus Bund, Ländern und Europäischer Union - mit Wirkungspotenzialen, Risiken, Evidenz und späteren Reality Checks.",
};

export default function ImpactCasesPage() {
  const government = getPublicImpactCases();
  const parliamentDaily = getApprovedParliamentDailyImpactCases();
  const eu = getEuImpactCases();
  return <main className="shell content-page impact-case-index">
    <header className="page-intro">
      <p className="eyebrow">Wirkung zuerst</p>
      <h1>Politische Entscheidungen nach ihrem Wirkungsgegenstand verstehen.</h1>
      <p className="lead">Ein Gesetzentwurf, ein Kabinettsbeschluss und die spätere Verkündung können Stationen derselben Sache sein. Deshalb bündelt ein WÖkImpactCase den fachlich zusammengehörenden Wirkungsgegenstand - ohne Prozessschritte doppelt zu bewerten.</p>
    </header>
    <section className="impact-case-status" aria-label="Veröffentlichungsstand">
      <div><strong>{government.length + parliamentDaily.length + eu.length}</strong><span>fachlich freigegebene ImpactCases im gemeinsamen Modell</span></div>
      <div><strong>0</strong><span>Regierungs- oder Parteienranglisten</span></div>
    </section>
    <section className="section section-compact" aria-labelledby="eu-impact-cases"><p className="eyebrow">Europäische Union</p><h2 id="eu-impact-cases">Initiale EU-Wirkungsfälle</h2><div className="source-register">{eu.map((record) => <article key={record.impact_case_id}><p className="source-register-label">{record.primary_direction} · Evidenz {record.evidence_level}</p><h3>{record.title}</h3><p>{record.editorial_summary}</p><p><strong>Wirkungskern:</strong> {record.impact_core_summary}</p><Link className="text-link" href={`/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`}>Vollständige EU-Wirkungsanalyse ansehen <span aria-hidden="true">→</span></Link></article>)}</div></section>
    <section className="section section-compact" aria-labelledby="current-impact-cases">
      <p className="eyebrow">Gemeinsames Fachmodell</p><h2 id="current-impact-cases">Aktuelle WÖkImpactCases</h2>
      {government.length + parliamentDaily.length ? <div className="source-register">{government.map((record) => <article key={`${record.impact_case_id}-${record.analysis_version}`}>
        <p className="source-register-label">{record.analysis_mode === "IMPACT_REALITY_CHECK" ? "Reality Check" : "Wirkungspotenzial ex ante"} · Version {record.analysis_version}</p>
        <h3>{record.title}</h3><p>{record.editorial_summary}</p>
        <p><strong>Wirkungskern:</strong> {record.impact_core_summary}</p>
        <Link className="text-link" href={`/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`}>Vollständige Wirkungsanalyse ansehen <span aria-hidden="true">→</span></Link>
      </article>)}{parliamentDaily.map((record) => <article key={`${record.impact_case_id}-${record.analysis_version}`}>
        <p className="source-register-label">{record.analysis_mode === "IMPACT_REALITY_CHECK" ? "Reality Check" : "Wirkungspotenzial ex ante"} · Version {record.analysis_version}</p>
        <h3>{record.title}</h3><p>{record.impact_summary.public_summary}</p>
        <p><strong>Wirkungskern:</strong> {record.impact_summary.central_lever}</p>
        <Link className="text-link" href={`/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`}>Vollständige Wirkungsanalyse ansehen <span aria-hidden="true">→</span></Link>
      </article>)}</div> : <div className="open-state"><span aria-hidden="true">!</span><div><strong>Noch keine gemeinsame Fachfreigabe veröffentlicht.</strong><p>Faktenakten und bestehende Fachakten bleiben erreichbar. Neue ImpactCases erscheinen erst nach technischer Validierung und fachlicher Freigabe.</p></div></div>}
    </section>
    <section className="section section-compact" aria-labelledby="legacy-files"><p className="eyebrow">Historischer Bestand</p><h2 id="legacy-files">Bestehende Parlamentsakten bleiben vorerst getrennt.</h2><p>Die 28 älteren Parlamentsakten werden erst dann als WÖkImpactCases 2.3 geführt, wenn ihre vollständigen Fachquellen und der Source-vs.-View-Nachweis vorliegen. Bis dahin sind sie bewusst nicht in diese gemeinsame Wirkungsfall-Zahl eingerechnet.</p><Link className="text-link" href="/entscheidungen">Historische Parlamentsakten separat öffnen <span aria-hidden="true">→</span></Link></section>
  </main>;
}
