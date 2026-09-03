import { notFound } from "next/navigation";
import Link from "next/link";
import { BadenWuerttembergCoalitionReview } from "@/app/components/states/StateCoalitionReview";
import { RheinlandPfalzCoalitionReview } from "@/app/components/states/RheinlandPfalzCoalitionReview";
import { stateJurisdictionBySlug } from "@/lib/autopilot/registry";
import { statePublicContentBySlug } from "@/lib/states/public-content";

export default async function StateMandatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const state = stateJurisdictionBySlug(slug);
  if (!state) notFound();
  if (slug === "baden-wuerttemberg") return <main className="shell content-page"><BadenWuerttembergCoalitionReview /></main>;
  if (slug === "rheinland-pfalz") return <main className="shell content-page"><RheinlandPfalzCoalitionReview /></main>;
  const content = statePublicContentBySlug(slug);

  return <main className="shell content-page"><header className="page-intro"><p className="eyebrow">{state.name} · Zusatzperspektive</p><h1>Vom Wahlprogramm zur politischen Praxis.</h1><p className="lead">Diese Seite verbindet Wahlprogramm, Regierungs- oder Koalitionsvereinbarung, Regierungshandlung, Umsetzung und Reality Check. Umsetzungstreue ist dabei keine Wirkung und wird nicht als Erfolgsquote ausgegeben.</p></header>
    {content?.mandate ? <>
      <section className="jurisdiction-facts"><div><span>Dokument</span><strong>Koalitionsvertrag {content.mandate.period}</strong></div><div><span>Koalition</span><strong>{content.mandate.partners}</strong></div><div><span>Unterzeichnet</span><strong>{content.mandate.signedAt}</strong></div><div><span>Regierungsbeginn</span><strong>{content.mandate.governmentStart}</strong></div></section>
      <section className="section section-compact"><p className="eyebrow">Verifizierte Mandatsbasis</p><h2>„{content.mandate.title}“</h2><p>Der Koalitionsvertrag ist die dokumentierte gemeinsame Mandatsbasis der Landesregierung. Er beweist weder Umsetzung noch Wirkung. Jede Zusage wird deshalb einzeln mit späterem Regierungshandeln, Umsetzung, beobachtbaren Zuständen und - soweit belastbar - Attribution verknüpft.</p><div className="notice"><strong>{content.mandate.status}</strong><p>Vorgestellt {content.mandate.presentedAt}, von den Koalitionsparteien gebilligt {content.mandate.approvedAt}, unterzeichnet {content.mandate.signedAt}.</p><p><a className="text-link" href={content.mandate.sourceUrl}>Amtliche Vertragsseite öffnen →</a></p></div></section>
      {content.review?.area === "regierung" ? <p><Link className="text-link" href={`/laender/${slug}/regierung`}>Zu den bereits freigegebenen Wirkungsfällen der Regierung →</Link></p> : null}
    </> : <div className="notice"><strong>Noch keine freigegebene Mandatskette.</strong><p>Offene Beziehungen bleiben offen. Ähnliche Formulierungen werden nicht automatisch als erfülltes Versprechen zusammengeführt.</p></div>}
  </main>;
}
