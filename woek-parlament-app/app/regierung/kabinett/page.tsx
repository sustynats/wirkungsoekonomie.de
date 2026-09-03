import Link from "next/link";
import { GovernmentActionCard } from "@/app/components/government/GovernmentActionCard";
import { getGovernmentPublicData } from "@/lib/government/public-data";

export default function CabinetPage() {
  const { actions, coverage } = getGovernmentPublicData();
  const cabinet = actions.filter((action) => action.action_type === "CABINET_DECISION");
  const register = coverage.sources.find((source) => source.source_id === "BREG_CABINET_ARCHIVE");
  return <section className="section shell government-list-page">
    <p className="eyebrow">Gemeinsames Regierungshandeln</p><h1>Kabinett</h1>
    <p className="lead">Kabinettssitzungen und veröffentlichte Einzelgegenstände werden als amtlicher Quellenraum gezählt. Sitzungsnummern erscheinen nur, wenn eine amtliche Quelle sie belegt.</p>
    {register && <div className="government-coverage-card"><h2>Abdeckung des Ergebnisregisters</h2><dl><div><dt>Sitzungen gefunden / verarbeitet</dt><dd>{register.found_records} / {register.processed_records}</dd></div><div><dt>Gegenstände gefunden / verarbeitet</dt><dd>{register.found_items} / {register.processed_items}</dd></div><div><dt>Unerklärte Gegenstände</dt><dd>{register.unexplained_items}</dd></div><div><dt>Status</dt><dd>Vollständig für diesen enumerierten Quellenraum</dd></div></dl><p>Die fehlenden Folgenummern 1 und 2 werden nicht erfunden: Die konstituierende Sitzung am 6. Mai und die Sitzung am 14. Mai 2025 sind über alternative amtliche Quellen belegt, jedoch ohne amtlich ausgewiesene Sitzungsnummer.</p></div>}
    <div className="section-heading"><h2>Veröffentlichte Kabinettsentscheidungen</h2><Link className="text-link" href="/regierung/transparenz">Coverage prüfen</Link></div>
    <div className="government-action-grid">{cabinet.slice(0, 120).map((action) => <GovernmentActionCard key={action.government_action_id} action={action} />)}</div>
  </section>;
}

