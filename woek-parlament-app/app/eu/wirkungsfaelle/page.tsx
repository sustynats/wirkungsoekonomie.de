import { EuImpactCase } from "@/app/components/eu/EuImpactCase";
import { getEuImpactCases } from "@/lib/eu/impact-cases";

export const metadata = { title: "EU-Wirkungsfälle", description: "Fachlich freigegebene Wirkungsanalysen zu Maßnahmen der Europäischen Union." };

export default function EuImpactCasesPage() {
  const records = getEuImpactCases();
  return <div className="shell content-page"><header className="page-intro"><p className="eyebrow">Europäische Union · Wirkung zuerst</p><h1>Welche Zustände können EU-Maßnahmen verändern?</h1><p className="lead">Die {records.length} initialen Fachfälle bilden eine materialitätsorientierte Auswahl. Sie sind keine Vollständigkeitsbehauptung über sämtliche EU-Akte.</p></header><div className="government-impact-list">{records.map((record) => <EuImpactCase key={record.impact_case_id} record={record} compact />)}</div></div>;
}
