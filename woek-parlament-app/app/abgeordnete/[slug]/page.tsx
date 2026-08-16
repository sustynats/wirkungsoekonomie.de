import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImpactProfileMatrix, DecisionDomainMatrix } from "@/app/components/ImpactProfileMatrix";
import { getPublishedMemberProfile } from "@/lib/members/public-profiles";
import { decisionHref, factionHref } from "@/lib/members/impact-profiles";

export const dynamic = "force-dynamic";

const voteLabels = { YES: "Ja", NO: "Nein", ABSTENTION: "Enthaltung", DID_NOT_VOTE: "Nicht abgestimmt" } as const;
const relationLabels = { SUPPORTED: "Entscheidungsoption unterstützt", REJECTED: "Entscheidungsoption abgelehnt", ABSTAINED: "Enthalten", DID_NOT_VOTE: "Nicht abgestimmt" } as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const profile = await getPublishedMemberProfile((await params).slug);
  return { title: profile ? `Wirkungsprofil: ${profile.displayName}` : "Wirkungsprofil nicht gefunden", description: "Amtlich dokumentierte Einzelstimmen und das Wirkungsprofil der jeweils unterstützten oder abgelehnten Entscheidung." };
}
export default async function MemberProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const profile = await getPublishedMemberProfile((await params).slug);
  if (!profile) notFound();
  const impact = profile.impactProfile;
  const counts = impact?.summary.decision_relation_counts;

  return <div className="shell decision-page member-profile-page">
    <nav className="breadcrumb" aria-label="Brotkrumen"><Link href="/">Startseite</Link><span aria-hidden="true">/</span><Link href="/abgeordnete">Wirkungsprofile der Abgeordneten</Link><span aria-hidden="true">/</span><span>{profile.displayName}</span></nav>
    <header className="member-profile-header">
      {profile.portrait ? <figure><Image unoptimized src={profile.portrait.sourceUrl} alt={`Porträt von ${profile.displayName}`} width={240} height={240} /><figcaption>{profile.portrait.credit} · <Link href={`/abgeordnete/${profile.slug}/quelle#bildnachweis`}>Bildnachweis ansehen</Link></figcaption></figure> : <div className="member-monogram" aria-hidden="true">{profile.displayName.split(/\s+/).map((name) => name[0]).filter(Boolean).slice(-2).join("")}</div>}
      <div><p className="eyebrow">Wirkungsprofil parlamentarischer Entscheidungen</p><h1>{profile.displayName}</h1><p className="lead">{[profile.parliamentaryGroup, profile.federalState, profile.constituency, profile.mandateType].filter(Boolean).join(" · ")}</p><p>Dieses Profil bewertet nicht die Person. Es zeigt, welche amtlich dokumentierten Entscheidungsoptionen sie unterstützt, abgelehnt oder nicht mitgetragen hat und welches Wirkungsprofil diese Optionen zum damaligen Wissensstand hatten.</p><div className="member-profile-links"><Link className="text-link" href={`/abgeordnete/${profile.slug}/quelle`}>Quellen und Datenstand <span aria-hidden="true">→</span></Link>{profile.parliamentaryGroup && <Link className="text-link" href={factionHref(impact?.member.faction_at_vote ?? profile.parliamentaryGroup)}>Fraktionsprofil ansehen <span aria-hidden="true">→</span></Link>}</div></div>
    </header>

    {!impact ? <section className="notice notice-neutral profile-coverage-notice"><strong>Noch kein persönliches Wirkungsprofil verfügbar.</strong><p>Im derzeit untersuchten 28-Fälle-Set liegt für dieses aktuelle Mitglied keine exakt zuordenbare amtliche Individualstimme vor. Nicht namentliche Fraktionspositionen werden bewusst nicht auf einzelne Menschen übertragen.</p></section> : <>
      <section className="profile-coverage-notice notice notice-neutral" aria-labelledby="coverage-title"><strong id="coverage-title">Sehr geringe Datenabdeckung: eine namentliche WÖk-Abstimmung</strong><p>Die Darstellung beschreibt einen dokumentierten Einzelfall und noch kein stabiles Abstimmungsmuster. Für eine belastbare Zusammenfassung sind laut Methodik mindestens {impact.coverage.minimum_for_stable_summary} auswertbare namentliche Abstimmungen erforderlich.</p></section>

      <section className="member-summary member-summary--four" aria-label="Dokumentiertes Abstimmungsverhalten">
        <div><span>Unterstützt</span><strong>{counts?.SUPPORTED ?? 0}</strong><small>konkrete Entscheidungsoptionen</small></div>
        <div><span>Abgelehnt</span><strong>{counts?.REJECTED ?? 0}</strong><small>nicht als Gegenteil der Vorlage gerechnet</small></div>
        <div><span>Enthalten</span><strong>{counts?.ABSTAINED ?? 0}</strong><small>keiner Wirkungsrichtung zugerechnet</small></div>
        <div><span>Nicht abgestimmt</span><strong>{counts?.DID_NOT_VOTE ?? 0}</strong><small>ohne Spekulation über Gründe</small></div>
      </section>

      <section className="decision-section profile-impact-overview" aria-labelledby="impact-overview-title"><p className="eyebrow">Mensch · Planet · Demokratie</p><h2 id="impact-overview-title">Wirkungsprofil der dokumentierten Entscheidungen</h2><p className="lead">Unterstützte und abgelehnte Optionen bleiben getrennt. Ein positiver Potenzialpfad kann gleichzeitig mit einem negativen Risikopfad bestehen; beides wird sichtbar und nicht zu einer Note verrechnet.</p>
        <div className="impact-profile-matrix-grid">
          <ImpactProfileMatrix title="Unterstützte Entscheidungen" profile={impact.summary.supported_decision_impact_profile} />
          <ImpactProfileMatrix title="Abgelehnte Entscheidungen" profile={impact.summary.rejected_decision_impact_profile} />
        </div>
      </section>

      <section className="decision-section" aria-labelledby="member-decisions-title"><p className="eyebrow">Einzelfallnachweis</p><h2 id="member-decisions-title">Jeder Profilwert führt zur Entscheidung und amtlichen Quelle.</h2>
        <div className="profile-decision-list">{impact.decisions.map((decision) => <article key={`${decision.official_vote_id}-${decision.case_id}`}>
          <div className="profile-decision-heading"><div><p className="source-register-label">{new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${decision.decision_date}T12:00:00Z`))}</p><h3>{decision.decision_object}</h3></div><span className={`vote-relation vote-relation--${decision.relation.toLocaleLowerCase("en-US")}`}>{relationLabels[decision.relation]}</span></div>
          <dl className="profile-vote-facts"><div><dt>Amtliche Stimme</dt><dd>{voteLabels[decision.official_vote]}</dd></div><div><dt>Fraktion zum Zeitpunkt</dt><dd>{impact.member.faction_at_vote}</dd></div><div><dt>Datenstatus</dt><dd>amtliche namentliche Abstimmung</dd></div></dl>
          <p>{decision.interpretation}</p>
          <DecisionDomainMatrix profile={decision.decision_domain_profile} />
          {decision.non_compensable_boundaries.length > 0 && <div className="boundary-box"><strong>Nichtkompensierbare Schutzfragen</strong><ul>{decision.non_compensable_boundaries.map((boundary) => <li key={boundary}>{boundary}</li>)}</ul></div>}
          <div className="profile-decision-actions"><Link className="button button-primary" href={decisionHref(decision.case_id)}>Wirkungsakte der Entscheidung</Link><Link className="button button-secondary" href={`/abstimmungen/${encodeURIComponent(decision.official_vote_id)}`}>Amtliche Abstimmungsquelle</Link></div>
        </article>)}</div>
      </section>
    </>}

    <section className="notice"><strong>Methodische Grenze</strong><p>Nein wird nicht zum mathematischen Gegenteil des Wirkungsprofils der Vorlage. Die Seite dokumentiert die Unterstützung oder Ablehnung einer konkreten Option; Wirkungspotenzial, Wirkungsrisiko, Evidenz und Schutzgrenzen bleiben getrennt.</p></section>
  </div>;
}
