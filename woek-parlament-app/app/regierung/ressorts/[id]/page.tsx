import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GovernmentActionCard } from "@/app/components/government/GovernmentActionCard";
import { actionTypeLabels, actionsForInstitution, coverageLabels, getGovernmentPublicData, institutionById } from "@/lib/government/public-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; return { title: institutionById(id)?.official_name ?? "Ressort" };
}

export default async function MinistryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const institution = institutionById(id); if (!institution) notFound();
  const actions = actionsForInstitution(institution);
  const { assignments } = getGovernmentPublicData();
  const holders = assignments.filter((row) => row.institution_id === id).sort((a, b) => b.valid_from.localeCompare(a.valid_from));
  const typeCounts = Object.entries(actions.reduce<Record<string, number>>((acc, action) => { acc[action.action_type] = (acc[action.action_type] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]);
  return <section className="section shell government-list-page">
    <p className="eyebrow">Institutionelle Wirkungsakte</p><h1>{institution.official_name}</h1>
    <p className="lead">Die Seite ordnet Regierungshandlungen institutionell ein. Sie bewertet weder das Ministerium noch aktuelle oder frühere Amtsträger als Personen.</p>
    <div className="government-institution-facts"><div><h2>Amtszuordnung</h2>{holders.length ? <ul>{holders.map((holder) => <li key={holder.assignment_id}><strong>{holder.office_holder_name}</strong><span>{holder.role_label} · {holder.valid_from} bis {holder.valid_to ?? "heute"}</span></li>)}</ul> : <p>Für diese Institution wird keine personenbezogene Amtszuordnung benötigt oder öffentlich ausgewiesen.</p>}</div><div><h2>Datenabdeckung</h2><p>{coverageLabels[institution.coverage_scope_status] ?? institution.coverage_scope_status}</p><p><a href={institution.official_site}>Amtliche Institution öffnen <span aria-hidden="true">↗</span></a></p></div><div><h2>Faktenakten nach Art</h2><ul>{typeCounts.slice(0, 6).map(([type, count]) => <li key={type}><strong>{count}</strong><span>{actionTypeLabels[type] ?? "Sonstiger Regierungsakt"}</span></li>)}</ul></div></div>
    <div className="section-heading"><h2>Veröffentlichungsfähige Regierungsakte</h2><span>{actions.length.toLocaleString("de-DE")} Akten</span></div>
    {actions.length ? <div className="government-action-grid">{actions.slice(0, 120).map((action) => <GovernmentActionCard key={action.government_action_id} action={action} />)}</div> : <div className="open-state"><span aria-hidden="true">?</span><p>Im aktuellen Public Store ist noch keine faktisch freigegebene Regierungsakte eindeutig dieser Institution zugeordnet. Das ist keine Aussage über tatsächliche Aktivität.</p></div>}
  </section>;
}
