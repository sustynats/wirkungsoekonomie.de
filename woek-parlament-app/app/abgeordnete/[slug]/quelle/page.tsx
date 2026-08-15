import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedMemberProfile } from "@/lib/members/public-profiles";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const profile = await getPublishedMemberProfile((await params).slug);
  return profile ? { title: `Quellendetail: ${profile.displayName}`, description: "Amtliche und lizenzbezogene Quellenangaben zu einem Abgeordnetenprofil." } : { title: "Quelle nicht gefunden" };
}

export default async function MemberSourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const profile = await getPublishedMemberProfile((await params).slug);
  if (!profile) notFound();
  return <div className="shell content-page source-detail-page">
    <p className="breadcrumb"><Link href="/abgeordnete">Abstimmungsbilanz</Link><span>/</span><Link href={`/abgeordnete/${profile.slug}`}>{profile.displayName}</Link><span>/</span><span>Quellen</span></p>
    <header className="source-detail-header">
      <div><p className="eyebrow">Amtliche Personenangaben</p><h1>Quellen zu {profile.displayName}</h1><p className="lead">Dieses Profil verwendet nur amtlich dokumentierte Angaben und – falls ein Bild erscheint – einen gesondert geprüften Bildnachweis.</p></div>
      <a className="button button-primary" href={profile.officialMemberUrl} target="_blank" rel="noreferrer">Amtliche Bundestagsübersicht öffnen ↗</a>
    </header>
    <section className="decision-section"><h2>Amtliche Personenseite</h2><dl className="source-facts"><div><dt>Herausgebende Stelle</dt><dd>Deutscher Bundestag</dd></div><div><dt>Verwendung im Portal</dt><dd>Stammdaten des Abgeordnetenprofils</dd></div></dl></section>
    {profile.portrait && <section className="decision-section" id="bildnachweis"><h2>Bildnachweis</h2><dl className="source-facts"><div><dt>Credit</dt><dd>{profile.portrait.credit}</dd></div><div><dt>Nutzungsbedingungen</dt><dd><a href={profile.portrait.termsUrl} target="_blank" rel="noreferrer">Originalbedingungen öffnen ↗</a></dd></div></dl></section>}
    <p className="page-return"><Link href={`/abgeordnete/${profile.slug}`}>← Zum Abgeordnetenprofil</Link></p>
  </div>;
}
