import Link from "next/link";
import { GovernmentImpactCase } from "@/app/components/government/GovernmentImpactCase";
import { getPublicImpactCases } from "@/lib/government/impact-cases";
import { ActionPlanMetaPreview, ActionPlanMissionPreview } from "@/app/components/government/StrategyImpactCase";
import { getActionPlanMissions } from "@/lib/government/strategy-impact";

export default function GovernmentImpactCasesPage() {
  const cases = getPublicImpactCases();
  const missions = getActionPlanMissions();
  return (
    <div className="section shell">
      <header className="government-list-header">
        <p className="eyebrow">Regierungsarbeit · fachlich freigegeben</p>
        <h1>Wirkungsanalysen</h1>
        <p className="lead">Hier steht die Wirkung im Mittelpunkt: Was kann eine Maßnahme für Mensch, Planet und Demokratie verändern, in welcher Richtung, mit welcher Evidenz und unter welchen Bedingungen?</p>
      </header>
      <section aria-labelledby="strategy-impact-list-title">
        <p className="eyebrow">Strategie- und Aktionsplan-Wirkung</p>
        <h2 id="strategy-impact-list-title">Aktionsplan Nachhaltigkeit 2026</h2>
        <p>Der Meta-Wirkungsfall prüft die gemeinsame Steuerungsarchitektur. Die 19 Missionen bleiben als getrennte Wirkungsgegenstände sichtbar; die Beteiligungsfassung wird nicht mit finaler Umsetzung oder bereits eingetretener Wirkung gleichgesetzt.</p>
        <div className="government-impact-list"><ActionPlanMetaPreview />{missions.map((mission) => <ActionPlanMissionPreview key={mission.id} mission={mission} />)}</div>
      </section>
      {cases.length ? <div className="government-impact-list">{cases.map((record) => <GovernmentImpactCase key={record.impact_case_id} record={record} compact />)}</div> : <div className="open-state"><span aria-hidden="true">!</span><div><strong>Noch keine Regierungs-Wirkungsanalyse für Production freigegeben.</strong><p>Die Fachanalysen und Government Data 1.2 durchlaufen derzeit Identitäts-, Quellen- und Publication-Gates. Offen bedeutet nicht neutral und nicht wirkungslos.</p></div></div>}
      <p><Link className="text-link" href="/regierung/methodik">Methodik und Prüflogik verstehen</Link></p>
    </div>
  );
}
