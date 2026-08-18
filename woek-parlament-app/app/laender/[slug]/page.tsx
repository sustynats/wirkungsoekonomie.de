import { notFound } from "next/navigation";
import Link from "next/link";
import { lifecycleLabel, stateJurisdictionBySlug } from "@/lib/autopilot/registry";

export default async function StateHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const state = stateJurisdictionBySlug(slug);
  if (!state) notFound();
  const date = state.next_election_date ? new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${state.next_election_date}T12:00:00`)) : null;
  return <main className="shell content-page jurisdiction-hub"><header className="page-intro"><p className="eyebrow">Wirkungsportal Länder</p><h1>{state.name}</h1><p className="lead">Der Schwerpunkt liegt auf politischen Wirkungsgegenständen der Landesregierung. Der Landtag wird dort angebunden, wo er den Lebenslauf eines Vorhabens verändert oder entscheidet.</p></header>
    <section className="jurisdiction-facts"><div><span>Status</span><strong>{lifecycleLabel(state.lifecycle_state)}</strong></div><div><span>Aktiver Term</span><strong>{state.active_term_id}</strong></div><div><span>Nächste Wahl</span><strong>{date ?? "amtlicher Termin noch offen"}</strong></div><div><span>Quellenstatus</span><strong>{state.source_status === "ACTIVE_OFFICIAL_ADAPTERS" ? "amtlicher Adapter aktiv" : "Quellenanbindung in Prüfung"}</strong></div></section>
    <section className="section section-compact"><p className="eyebrow">Wirkung zuerst</p><h2>Aktuelle Wirkungsfälle</h2><div className="open-state"><span aria-hidden="true">i</span><div><strong>Fakten- und Fachstände werden getrennt aufgebaut.</strong><p>Eine leere Analysefläche wird nicht als neutrale Wirkung ausgegeben. Fachliche Richtungen erscheinen erst mit einer freigegebenen WÖk-Analyse.</p></div></div></section>
    <section className="jurisdiction-link-grid" aria-label="Bereiche"><Link href={`/laender/${slug}/regierung`}><strong>Regierungsarbeit</strong><span>Entscheidungen, Programme, Umsetzung und Quellen</span></Link><Link href={`/laender/${slug}/wahl`}><strong>Wahl und Programme</strong><span>Wahltermin, Originalprogramme und Kompetenzprüfung</span></Link><Link href={`/laender/${slug}/mandat-und-praxis`}><strong>Mandat &amp; Praxis</strong><span>Programm, Mandatsdokument und Handeln - ohne Wirkung damit gleichzusetzen</span></Link></section>
  </main>;
}
