import { notFound } from "next/navigation";
import ApprovedStateReview from "@/app/components/ApprovedStateReview";
import { stateJurisdictionBySlug } from "@/lib/autopilot/registry";
import { loadApprovedStateReview, statePublicContentBySlug } from "@/lib/states/public-content";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

export default async function StateGovernmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const state = stateJurisdictionBySlug(slug);
  if (!state) notFound();
  const approved = loadApprovedStateReview(slug);
  const content = statePublicContentBySlug(slug);
  const governmentReview = approved?.meta.area === "regierung" ? approved : null;

  return <main className="shell content-page"><header className="page-intro"><p className="eyebrow">{state.name} · Landesregierung</p><h1>Regierungshandeln und mögliche Zustandsveränderungen.</h1><p className="lead">Ministerratsbeschlüsse, Ressorthandeln, Programme, Förderung, Haushalt, Vollzug und Evaluation werden als getrennte amtliche Stationen erfasst. Wirkungspotenzial, beobachtete Veränderung und Zurechnung werden nicht miteinander verwechselt.</p></header>
    {content?.mandate ? <section className="section section-compact" aria-labelledby="mandatsbasis"><p className="eyebrow">Mandatsbasis</p><h2 id="mandatsbasis">Koalitionsvertrag {content.mandate.period}</h2><div className="notice"><strong>„{content.mandate.title}“</strong><p>{content.mandate.partners}. Vorgestellt {content.mandate.presentedAt}, parteilich gebilligt {content.mandate.approvedAt}, unterzeichnet {content.mandate.signedAt}, Regierungsbeginn {content.mandate.governmentStart}.</p><p>{content.mandate.status}</p><p><a className="text-link" href={sourceDetailHrefForUrl(content.mandate.sourceUrl)}>Quellenakte zum Koalitionsvertrag öffnen →</a></p></div></section> : null}
    {governmentReview ? <ApprovedStateReview markdown={governmentReview.markdown} meta={governmentReview.meta} /> : <div className="open-state"><span aria-hidden="true">!</span><div><strong>Quellenanbindung: {state.source_status}</strong><p>Solange kein freigegebener Fachstand für das Regierungshandeln dieses Landes vorliegt, wird keine Wirkungslage konstruiert und keine Vollständigkeit behauptet.</p></div></div>}
  </main>;
}
