import { notFound } from "next/navigation";
import Link from "next/link";
import { formatElectionDate, governmentLifecycleLabel, lifecycleLabel, stateJurisdictionBySlug } from "@/lib/autopilot/registry";
import { statePublicContentBySlug } from "@/lib/states/public-content";

export default async function StateHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const state = stateJurisdictionBySlug(slug);
  if (!state) notFound();
  const date = formatElectionDate(state.next_election_date);
  const content = statePublicContentBySlug(slug);
  const reviewHref = content?.review ? `/laender/${slug}/${content.review.area}` : null;

  return <main className="shell content-page jurisdiction-hub"><header className="page-intro"><p className="eyebrow">Wirkungsportal Länder</p><h1>{state.name}</h1><p className="lead">Der Schwerpunkt liegt auf politischen Wirkungsgegenständen der Landesregierung und - vor Wahlen - auf den Wirkungspotenzialen der Programme. Landtag, Bund, EU und Kommunen werden dort getrennt angebunden, wo Zuständigkeit oder Wirkungspfad es verlangen.</p></header>
    <section className="jurisdiction-facts"><div><span>Regierungsarbeit</span><strong>{governmentLifecycleLabel(state.government_lifecycle_state)}</strong></div><div><span>Wahlzyklus</span><strong>{lifecycleLabel(state.election_cycle_state)}</strong></div><div><span>Aktiver Term</span><strong>{state.active_term_id}</strong></div><div><span>Nächste Wahl</span><strong>{date ?? "amtlicher Termin noch offen"}</strong></div><div><span>Fachstand</span><strong>{content?.review?.statusLabel ?? "Fachreview wird aufgebaut"}</strong></div></section>
    <section className="section section-compact"><p className="eyebrow">Wirkung zuerst</p><h2>Aktueller Fachstand</h2>{content?.review && reviewHref ? <div className="notice"><strong>{content.review.shortLabel}</strong><p>Freigabestand {content.review.approvedAt}. Die vollständige Fachanalyse wird auf der passenden Landesroute inline veröffentlicht - nicht nur als Kurzfassung.</p><p><Link className="text-link" href={reviewHref}>Vollständige Fachanalyse öffnen →</Link></p></div> : <div className="open-state"><span aria-hidden="true">i</span><div><strong>Fakten- und Fachstände werden getrennt aufgebaut.</strong><p>Eine leere Analysefläche wird nicht als neutrale Wirkung ausgegeben. Fachliche Richtungen erscheinen erst mit einer freigegebenen WÖk-Analyse.</p></div></div>}</section>
    {content?.mandate ? <section className="section section-compact"><p className="eyebrow">Mandatsbasis</p><h2>Koalitionsvertrag {content.mandate.period}</h2><div className="notice"><strong>„{content.mandate.title}“</strong><p>{content.mandate.partners}. Unterzeichnet am {content.mandate.signedAt}; Regierungsbeginn {content.mandate.governmentStart}. Der Vertrag ist als Mandatsbasis verifiziert. Vertragstext, Regierungshandeln und beobachtete Wirkung bleiben getrennte Ebenen.</p><p><Link className="text-link" href={`/laender/${slug}/mandat-und-praxis`}>Mandat &amp; Praxis öffnen →</Link></p></div></section> : null}
    {content?.electionField ? <section className="section section-compact"><p className="eyebrow">Amtlicher Wahlstand</p><h2>{content.electionField.officialFieldLabel}</h2><p>{content.electionField.officialFieldDetail}</p><p className="source-note">Amtlicher Stand: {content.electionField.sourceAsOf}</p></section> : null}
    <section className="jurisdiction-link-grid" aria-label="Bereiche"><Link href={`/laender/${slug}/regierung`}><strong>Regierungsarbeit</strong><span>Entscheidungen, Programme, Umsetzung und Quellen</span></Link><Link href={`/laender/${slug}/wahl`}><strong>Wahl und Programme</strong><span>Wahltermin, Originalprogramme und Kompetenzprüfung</span></Link><Link href={`/laender/${slug}/mandat-und-praxis`}><strong>Mandat &amp; Praxis</strong><span>Programm, Mandatsdokument und Handeln - ohne Wirkung damit gleichzusetzen</span></Link></section>
  </main>;
}
