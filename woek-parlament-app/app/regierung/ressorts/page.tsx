import Link from "next/link";
import { actionsForInstitution, getGovernmentPublicData } from "@/lib/government/public-data";

export default function MinistriesPage() {
  const { institutions } = getGovernmentPublicData();
  const ministries = institutions.filter((row) => row.institution_type === "FEDERAL_MINISTRY");
  const central = institutions.filter((row) => ["FEDERAL_CHANCELLERY", "CABINET_COMMITTEE"].includes(row.institution_type));
  return <section className="section shell government-list-page">
    <p className="eyebrow">Eigenständiges Exekutivhandeln</p><h1>Ressorts und zentrale Institutionen</h1>
    <p className="lead">Die Übersicht ist kein Ministerranking. Sie zeigt Institutionen, zeitliche Amtszuordnungen, veröffentlichungsfähige Regierungsakte und den jeweiligen Datenabdeckungsstatus. Die Zahl gefundener Quellen ist keine Leistungskennzahl.</p>
    <h2>Bundesministerien</h2>
    <div className="government-ministry-grid">{ministries.map((institution) => { const count = actionsForInstitution(institution).length; return <article key={institution.institution_id}><p className="institution-code">{institution.institution_id}</p><h3><Link href={`/regierung/ressorts/${institution.institution_id}`}>{institution.official_name}</Link></h3><p><strong>{count.toLocaleString("de-DE")}</strong> veröffentlichungsfähige Faktenakten im definierten Quellenraum.</p><Link className="text-link" href={`/regierung/ressorts/${institution.institution_id}`}>Institution ansehen</Link></article>; })}</div>
    <h2 className="government-section-title">Bundeskanzleramt und zentrales Exekutivgremium</h2>
    <div className="government-ministry-grid">{central.map((institution) => <article key={institution.institution_id}><p className="institution-code">{institution.institution_id}</p><h3><Link href={`/regierung/ressorts/${institution.institution_id}`}>{institution.official_name}</Link></h3><p>{institution.institution_type === "CABINET_COMMITTEE" ? "Als Kabinettsausschuss geführt, nicht als Bundesministerium." : "Als eigenständige Exekutivinstitution geführt, nicht als Bundesministerium."}</p><Link className="text-link" href={`/regierung/ressorts/${institution.institution_id}`}>Institution ansehen</Link></article>)}</div>
  </section>;
}

