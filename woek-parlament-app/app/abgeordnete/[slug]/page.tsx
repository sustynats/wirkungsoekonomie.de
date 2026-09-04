import type { Metadata } from "next";
/* eslint-disable @next/next/no-img-element -- Amtliche Bildquellen werden ohne Bildoptimierungs-Proxy direkt mit ihrem Bildnachweis ausgeliefert. */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedMemberProfile } from "@/lib/members/public-profiles";
import { materialityLabel } from "@/lib/presentation/labels";

export const dynamic = "force-dynamic";

const voteLabels: Record<string, string> = { YES: "Ja", NO: "Nein", ABSTENTION: "Enthaltung", DID_NOT_VOTE: "Nicht abgestimmt", NO_SCORE: "Nicht auswertbar" };
const agreementLabels: Record<string, string> = { ALIGNED: "entspricht der ex-ante Einordnung", NOT_ALIGNED: "weicht von der ex-ante Einordnung ab", ABSTAINED: "Enthaltung", DID_NOT_VOTE: "nicht abgestimmt", NOT_SCORABLE: "nicht auswertbar" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublishedMemberProfile(slug);
  return { title: profile ? `Abstimmungen im Wirkungscheck: ${profile.displayName}` : "Abstimmungen im Wirkungscheck" };
}

export default async function MemberProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getPublishedMemberProfile(slug);
  if (!profile) notFound();
  return <div className="shell decision-page member-profile-page">
    <p className="record-context"><Link href="/">Startseite</Link><span>/</span><Link href="/abgeordnete">Abstimmungen im Wirkungscheck</Link><span>/</span><span>{profile.displayName}</span></p>
    <header className="member-profile-header">
      {profile.portrait ? <figure><img src={profile.portrait.sourceUrl} alt={`Porträt von ${profile.displayName}`} /><figcaption>{profile.portrait.credit} · <Link href={`/abgeordnete/${profile.slug}/quelle#bildnachweis`}>Bildnachweis ansehen</Link></figcaption></figure> : <div className="member-monogram" aria-hidden="true">{profile.displayName.split(/\s+/).map((name) => name[0]).slice(0, 2).join("")}</div>}
      <div><p className="eyebrow">Amtlich dokumentierte namentliche Abstimmungen</p><h1>{profile.displayName}</h1><p className="lead">{[profile.parliamentaryGroup, profile.federalState, profile.constituency, profile.mandateType].filter(Boolean).join(" · ")}</p><Link className="text-link" href={`/abgeordnete/${profile.slug}/quelle`}>Quellendetail ansehen <span aria-hidden="true">→</span></Link></div>
    </header>
    <section className="member-summary" aria-label="Zusammenfassung einzelner namentlicher Abstimmungen">
      <div><span>Eindeutig zuordenbare Einzelfälle</span><strong>{profile.summary.scorable}</strong><small>nur namentliche Stimmen mit dokumentierter ex-ante Option</small></div>
      <div><span>Dokumentierte Stimmen</span><strong>{profile.votes.length}</strong><small>{profile.summary.aligned} entsprechend · {profile.summary.notAligned} abweichend</small></div>
      <div><span>Getrennt ausgewiesen</span><strong>{profile.summary.abstained + profile.summary.didNotVote}</strong><small>{profile.summary.abstained} Enthaltungen · {profile.summary.didNotVote} nicht abgestimmt</small></div>
    </section>
    <section className="decision-section" aria-labelledby="votes-title"><p className="eyebrow">Einzelne amtliche Abstimmungen</p><h2 id="votes-title">Jeder Wert führt zurück zur Entscheidung.</h2>
      {profile.votes.length === 0 ? <p>Es sind noch keine freigegebenen auswertbaren Abstimmungen vorhanden.</p> : <div className="member-vote-list">{profile.votes.map((vote) => <article key={vote.officialVoteId}><div><p className="source-register-label">{new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(`${vote.voteDate}T00:00:00`))} · {vote.materiality ? materialityLabel(vote.materiality) : "Materialität in Prüfung"}</p><h3><Link href={`/abstimmungen/${encodeURIComponent(vote.officialVoteId)}`}>{vote.title}</Link></h3><Link className="text-link" href={`/abstimmungen/${encodeURIComponent(vote.officialVoteId)}`}>Abstimmungsquelle ansehen →</Link></div><dl><div><dt>Stimme</dt><dd>{voteLabels[vote.actualVote]}</dd></div><div><dt>WÖk ex ante</dt><dd>{voteLabels[vote.preferredVote]}</dd></div><div><dt>Abgleich</dt><dd>{agreementLabels[vote.agreementStatus]}</dd></div></dl></article>)}</div>}
    </section>
    <section className="notice"><strong>Methodische Grenze</strong><p>Diese Seite bewertet keine Person. Sie dokumentiert ausschließlich einzelne amtliche Stimmen und den Bezug zu einer transparenten ex-ante Einordnung. Eine spätere Wirkungsbeobachtung bleibt davon getrennt.</p></section>
  </div>;
}
