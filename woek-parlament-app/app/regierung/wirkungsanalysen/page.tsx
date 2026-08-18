import Link from "next/link";
import { GovernmentImpactCase } from "@/app/components/government/GovernmentImpactCase";
import { getPublicImpactCases } from "@/lib/government/impact-cases";

export default function GovernmentImpactCasesPage() {
  const cases = getPublicImpactCases();
  return (
    <main className="section shell">
      <header className="government-list-header">
        <p className="eyebrow">Regierungsarbeit · fachlich freigegeben</p>
        <h1>Wirkungsanalysen</h1>
        <p className="lead">Hier steht die Wirkung im Mittelpunkt: Was kann eine Maßnahme für Mensch, Planet und Demokratie verändern, in welcher Richtung, mit welcher Evidenz und unter welchen Bedingungen?</p>
      </header>
      {cases.length ? <div className="government-impact-list">{cases.map((record) => <GovernmentImpactCase key={record.impact_case_id} record={record} compact />)}</div> : <div className="open-state"><span aria-hidden="true">!</span><div><strong>Noch keine Regierungs-Wirkungsanalyse für Production freigegeben.</strong><p>Die Fachanalysen und Government Data 1.2 durchlaufen derzeit Identitäts-, Quellen- und Publication-Gates. Offen bedeutet nicht neutral und nicht wirkungslos.</p></div></div>}
      <p><Link className="text-link" href="/regierung/methodik">Methodik und Prüflogik verstehen</Link></p>
    </main>
  );
}
