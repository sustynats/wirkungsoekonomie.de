import Link from "next/link";
import { politicalJurisdictions } from "@/lib/autopilot/registry";
import { getEuImpactCases } from "@/lib/eu/impact-cases";
import { EuImpactCase } from "@/app/components/eu/EuImpactCase";

export const metadata = { title: "Europäische Union", description: "Wirkungsfälle der Europäischen Union mit institutionell getrenntem Lebenslauf von Kommission, Parlament, Rat und Rechtsakt." };

export default function EuropeanUnionPage() {
  const eu = politicalJurisdictions.find((entry) => entry.jurisdiction_id === "EU");
  const impactCases = getEuImpactCases();
  return <main className="shell content-page jurisdiction-hub"><header className="page-intro"><p className="eyebrow">Europäische Union</p><h1>Kommissionsarbeit, Gesetzgebung und Wirkung.</h1><p className="lead">Die Europäische Kommission bildet den exekutiven Kern. Europäisches Parlament und Rat werden als eigenständige Legislativschichten geführt; der Europäische Rat bleibt strategische Governance-Ebene.</p></header>
    <section className="jurisdiction-facts"><div><span>Europäisches Parlament</span><strong>10. Wahlperiode seit {eu?.institutional_terms?.european_parliament_term_start ?? "offen"}</strong></div><div><span>Europäische Kommission</span><strong>Amtszeit seit {eu?.institutional_terms?.european_commission_term_start ?? "offen"}</strong></div><div><span>Adapterstatus</span><strong>Quellenprüfung und Backfill</strong></div></section>
    <section className="section section-compact"><div className="section-heading"><div><p className="eyebrow">Aktuelle EU-Wirkungsfälle</p><h2>Wirkungspotenziale, Risiken und institutionelle Zuständigkeit.</h2></div><Link className="text-link" href="/eu/wirkungsfaelle">Alle {impactCases.length} Fälle</Link></div><p>Ein Verfahren aus einer früheren Kommission wird nicht rückwirkend der aktuellen Kommission zugerechnet. Änderungen durch Parlament, Rat und Trilog bleiben als eigene Fassungen sichtbar.</p><div className="government-impact-list">{impactCases.slice(0, 3).map((record) => <EuImpactCase key={record.impact_case_id} record={record} compact />)}</div></section>
    <section className="jurisdiction-link-grid"><Link href="/eu/wirkungsfaelle"><strong>Wirkungsfälle</strong><span>Wirkungspotenziale, Risiken, Evidenz und Kompetenz</span></Link><Link href="/eu/kommission"><strong>Kommissionsarbeit</strong><span>Vorschläge, Strategien, Programme und Vollzug</span></Link><Link href="/eu/gesetzgebung"><strong>EU-Gesetzgebung</strong><span>Kommission, Parlament, Rat, Trilog und Rechtsakt</span></Link><Link href="/eu/mandat"><strong>Mandatsarchitektur</strong><span>Leitlinien, Mission Letters, Arbeitsprogramme und Strategische Agenda</span></Link></section>
  </main>;
}
