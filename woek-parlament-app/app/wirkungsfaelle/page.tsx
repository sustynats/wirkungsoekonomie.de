import Link from "next/link";
import { GovernmentImpactCase } from "@/app/components/government/GovernmentImpactCase";
import { EuImpactCase } from "@/app/components/eu/EuImpactCase";
import { getPublicImpactCases, publicRecordFromFullSchema } from "@/lib/government/impact-cases";
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
    <section className="section section-compact" aria-labelledby="eu-impact-cases"><p className="eyebrow">Europäische Union</p><h2 id="eu-impact-cases">Initiale EU-Wirkungsfälle</h2><div className="government-impact-list">{eu.map((record) => <EuImpactCase key={record.impact_case_id} record={record} compact />)}</div></section>
    <section className="section section-compact" aria-labelledby="current-impact-cases">
      <p className="eyebrow">Gemeinsames Fachmodell</p><h2 id="current-impact-cases">Aktuelle WÖkImpactCases</h2>
      {government.length + parliamentDaily.length ? <div className="government-impact-list">{government.map((record) => <GovernmentImpactCase key={`${record.impact_case_id}-${record.analysis_version}`} record={record} compact />)}{parliamentDaily.map((record) => <GovernmentImpactCase key={`${record.impact_case_id}-${record.analysis_version}`} record={publicRecordFromFullSchema(record)} compact />)}</div> : <div className="open-state"><span aria-hidden="true">!</span><div><strong>Noch keine gemeinsame Fachfreigabe veröffentlicht.</strong><p>Faktenakten und bestehende Fachakten bleiben erreichbar. Neue ImpactCases erscheinen erst nach technischer Validierung und fachlicher Freigabe.</p></div></div>}
    </section>
    <section className="section section-compact" aria-labelledby="legacy-files"><p className="eyebrow">Historischer Bestand</p><h2 id="legacy-files">Bestehende Parlamentsakten bleiben vorerst getrennt.</h2><p>Die 28 älteren Parlamentsakten werden erst dann als WÖkImpactCases 2.3 geführt, wenn ihre vollständigen Fachquellen und der Source-vs.-View-Nachweis vorliegen. Bis dahin sind sie bewusst nicht in diese gemeinsame Wirkungsfall-Zahl eingerechnet.</p><Link className="text-link" href="/entscheidungen">Historische Parlamentsakten separat öffnen <span aria-hidden="true">→</span></Link></section>
  </main>;
}
