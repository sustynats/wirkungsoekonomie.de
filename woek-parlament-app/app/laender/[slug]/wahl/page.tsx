import { notFound } from "next/navigation";
import ApprovedStateReview from "@/app/components/ApprovedStateReview";
import { formatElectionDate, lifecycleLabel, stateJurisdictionBySlug } from "@/lib/autopilot/registry";
import { loadApprovedStateReview, statePublicContentBySlug } from "@/lib/states/public-content";

export default async function StateElectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const state = stateJurisdictionBySlug(slug);
  if (!state) notFound();
  const electionDate = formatElectionDate(state.next_election_date);
  const approved = loadApprovedStateReview(slug);
  const content = statePublicContentBySlug(slug);
  const electionReview = approved?.meta.area === "wahl" ? approved : null;

  return <main className="shell content-page"><header className="page-intro"><p className="eyebrow">{state.name} · Wahlzyklus</p><h1>Programme, Zuständigkeiten und Wirkungspotenziale.</h1><p className="lead">Originalprogramme und Programmaussagen werden von politischer Kommunikation getrennt. Ex ante wird nur Wirkungspotenzial bzw. Wirkungsrisiko ausgewiesen; eine Wahlprogramm-Analyse ist weder Parteigesamtnote noch Wahlempfehlung.</p></header>
    <div className="notice"><strong>{lifecycleLabel(state.election_cycle_state)}</strong><p>{electionDate ? `${state.date_precision === "SEASON_ONLY" ? "Amtliches Wahlzeitfenster" : "Amtlicher Wahltermin"}: ${electionDate}.` : "Ein amtlicher Wahltermin ist im aktuellen Register noch nicht bestätigt."}</p></div>
    {content?.electionField ? <section className="section section-compact" aria-labelledby="amtliches-kandidatenfeld"><p className="eyebrow">Amtlicher Wahlstand</p><h2 id="amtliches-kandidatenfeld">{content.electionField.officialFieldLabel}</h2><p>{content.electionField.officialFieldDetail}</p><p>Stand der amtlichen Quelle: {content.electionField.sourceAsOf}. <a className="text-link" href={content.electionField.officialSourceUrl}>Amtliche Quelle öffnen →</a></p></section> : null}
    {electionReview ? <ApprovedStateReview markdown={electionReview.markdown} meta={electionReview.meta} /> : <div className="open-state"><span aria-hidden="true">i</span><div><strong>Noch keine freigegebene Wahlprogramm-Fachanalyse.</strong><p>Fehlende Programme oder Fachprüfungen bleiben sichtbar offen. Eine leere Fläche wird nicht als neutrale oder vollständige Analyse ausgegeben.</p></div></div>}
  </main>;
}
