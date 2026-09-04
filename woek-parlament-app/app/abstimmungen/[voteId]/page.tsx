import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicVoteReference } from "@/lib/members/public-votes";

export const dynamic = "force-dynamic";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${value}T12:00:00Z`));
}

export async function generateMetadata({ params }: { params: Promise<{ voteId: string }> }): Promise<Metadata> {
  const reference = await getPublicVoteReference((await params).voteId);
  return reference ? { title: reference.title, description: "Amtliche Detailquelle zu einer namentlichen Abstimmung." } : { title: "Abstimmung nicht gefunden" };
}

export default async function VoteReferencePage({ params }: { params: Promise<{ voteId: string }> }) {
  const reference = await getPublicVoteReference((await params).voteId);
  if (!reference) notFound();
  return <div className="shell content-page source-detail-page">
    <p className="record-context"><Link href="/abgeordnete">Abstimmungsbilanz</Link><span>/</span><span>Amtliche Abstimmung</span></p>
    <header className="source-detail-header">
      <div><p className="eyebrow">Amtliche Primärquelle</p><h1>{reference.title}</h1><p className="lead">Diese Seite ordnet die amtliche Quelle einer namentlichen Abstimmung ein. Individuelle Stimmen werden ausschließlich aus der veröffentlichten amtlichen Liste übernommen.</p></div>
      <a className="button button-primary" href={reference.sourceUrl} target="_blank" rel="noreferrer">Originalquelle öffnen ↗</a>
    </header>
    <section className="decision-section">
      <h2>Quellensteckbrief</h2>
      <dl className="source-facts">
        <div><dt>Herausgebende Stelle</dt><dd>Deutscher Bundestag</dd></div>
        <div><dt>Abstimmung</dt><dd>namentlich</dd></div>
        <div><dt>Datum</dt><dd>{dateLabel(reference.voteDate)}</dd></div>
        <div><dt>Amtliche Kennung</dt><dd>{reference.externalVoteId}</dd></div>
      </dl>
    </section>
    <section className="notice"><strong>Methodische Grenze</strong><p>Die amtliche Liste dokumentiert die Stimmabgabe. Eine Wirkungsökonomie-Einordnung bezieht sich auf die zugrunde liegende Entscheidung – nicht auf den Wert einer Person.</p></section>
    <p className="page-return"><Link href="/abgeordnete">← Zur Abstimmungsbilanz</Link></p>
  </div>;
}
