import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicVoteReference } from "@/lib/members/public-votes";

export const dynamic = "force-dynamic";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${value}T12:00:00Z`));
}

const voteLabels = { YES: "Ja", NO: "Nein", ABSTENTION: "Enthaltung", DID_NOT_VOTE: "nicht abgestimmt" } as const;

export async function generateMetadata({ params }: { params: Promise<{ voteId: string }> }): Promise<Metadata> {
  const reference = await getPublicVoteReference((await params).voteId);
  return reference ? { title: reference.title, description: "Amtliche Detailquelle zu einer namentlichen Abstimmung." } : { title: "Abstimmung nicht gefunden" };
}

export default async function VoteReferencePage({ params }: { params: Promise<{ voteId: string }> }) {
  const reference = await getPublicVoteReference((await params).voteId);
  if (!reference) notFound();
  return <div className="shell content-page source-detail-page">
    <p className="breadcrumb"><Link href="/abgeordnete">Wirkungsprofile</Link><span>/</span><span>Amtliche Abstimmung</span></p>
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
    {reference.members.length > 0 && <section className="decision-section public-vote-register" aria-labelledby="vote-register-title">
      <p className="eyebrow">Amtliche Individualstimmen</p><h2 id="vote-register-title">Wie haben die Mitglieder abgestimmt?</h2><p>Die Liste übernimmt ausschließlich die amtlich veröffentlichte Stimmabgabe. Nichtabstimmung bleibt ein eigener Datenstatus und wird nicht als Ja, Nein oder Enthaltung umgedeutet.</p>
      <dl className="vote-overall-grid" aria-label="Gesamtergebnis der Individualstimmen"><div><dt>Mitglieder im Datensatz</dt><dd>{reference.members.length}</dd></div><div><dt>Ja</dt><dd>{reference.totals.YES}</dd></div><div><dt>Nein</dt><dd>{reference.totals.NO}</dd></div><div><dt>Enthaltung</dt><dd>{reference.totals.ABSTENTION}</dd></div><div><dt>Nicht abgestimmt</dt><dd>{reference.totals.DID_NOT_VOTE}</dd></div></dl>
      <details className="vote-member-register"><summary>Alle {reference.members.length} Namen und Einzelstimmen anzeigen</summary><div className="vote-faction-table" role="region" aria-label="Namentliche Einzelstimmen" tabIndex={0}><table><thead><tr><th scope="col">Mitglied</th><th scope="col">Fraktion zum Zeitpunkt</th><th scope="col">Stimme</th><th scope="col">Wirkungsprofil</th></tr></thead><tbody>{reference.members.map((member) => <tr key={member.slug}><th scope="row">{member.name}</th><td>{member.faction}</td><td>{voteLabels[member.vote]}</td><td><Link href={`/abgeordnete/${member.slug}`}>Profil öffnen</Link></td></tr>)}</tbody></table></div></details>
    </section>}
    <section className="notice"><strong>Methodische Grenze</strong><p>Die amtliche Liste dokumentiert die Stimmabgabe. Eine Wirkungsökonomie-Einordnung bezieht sich auf die zugrunde liegende Entscheidung – nicht auf den Wert einer Person.</p></section>
    <p className="page-return"><Link href="/abgeordnete">← Zu den Wirkungsprofilen</Link></p>
  </div>;
}
