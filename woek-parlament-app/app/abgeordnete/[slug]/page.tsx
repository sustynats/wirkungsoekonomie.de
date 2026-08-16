import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImpactProfileMatrix, DecisionDomainMatrix } from "@/app/components/ImpactProfileMatrix";
import { ProfileDecisionAnalysis } from "@/app/components/ProfileDecisionAnalysis";
import { GlossaryBasics } from "@/app/components/GlossaryBasics";
import { getPublishedMemberProfile } from "@/lib/members/public-profiles";
import { decisionHref, factionHref, impactDirectionLabel, isImpactDimension, isImpactDirection, type ImpactDimension, type ImpactDirection, type MemberImpactDecision } from "@/lib/members/impact-profiles";

export const dynamic = "force-dynamic";

const voteLabels = { YES: "Ja", NO: "Nein", ABSTENTION: "Enthaltung", DID_NOT_VOTE: "Nicht abgestimmt" } as const;
const relationLabels = { SUPPORTED: "Entscheidungsoption unterstützt", REJECTED: "Entscheidungsoption abgelehnt", ABSTAINED: "Enthalten", DID_NOT_VOTE: "Nicht abgestimmt" } as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const profile = await getPublishedMemberProfile((await params).slug);
  return { title: profile ? `Wirkungsprofil: ${profile.displayName}` : "Wirkungsprofil nicht gefunden", description: "Amtlich dokumentierte Einzelstimmen und das Wirkungsprofil der jeweils unterstützten oder abgelehnten Entscheidung." };
}
type MemberRelation = "SUPPORTED" | "REJECTED";
type ProfileFilter = { relation: MemberRelation; dimension: ImpactDimension; direction: ImpactDirection };

export default async function MemberProfilePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const profile = await getPublishedMemberProfile(slug);
  if (!profile) notFound();
  const impact = profile.impactProfile;
  const counts = impact?.summary.decision_relation_counts;
  const activeFilter = parseFilter(query);
  const displayedDecisions = impact ? (activeFilter ? impact.decisions.filter((decision) => decision.relation === activeFilter.relation && decision.decision_domain_profile[activeFilter.dimension].direction === activeFilter.direction) : impact.decisions) : [];
  const baseHref = `/abgeordnete/${slug}`;

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
        <p className="matrix-interaction-hint"><strong>Zahlen sind anklickbar:</strong> Sie öffnen genau die Entscheidungen, aus denen der jeweilige Wert besteht.</p>
        <div className="impact-profile-matrix-grid">
          <ImpactProfileMatrix title="Unterstützte Entscheidungen" profile={impact.summary.supported_decision_impact_profile} baseHref={baseHref} relation="SUPPORTED" activeFilter={activeFilter} />
          <ImpactProfileMatrix title="Abgelehnte Entscheidungen" profile={impact.summary.rejected_decision_impact_profile} baseHref={baseHref} relation="REJECTED" activeFilter={activeFilter} />
        </div>
      </section>

      <section className="decision-section" id="fallauswahl" aria-labelledby="member-decisions-title"><p className="eyebrow">{activeFilter ? "Gefilterte Einzelfälle" : "Einzelfallnachweis"}</p><h2 id="member-decisions-title">{activeFilter ? `${displayedDecisions.length} ${displayedDecisions.length === 1 ? "Entscheidung" : "Entscheidungen"}: ${relationLabels[activeFilter.relation]} · ${activeFilter.dimension} · ${impactDirectionLabel(activeFilter.direction)}` : "Jeder Profilwert führt zur Entscheidung und amtlichen Quelle."}</h2>
        {activeFilter && <div className="active-profile-filter"><p>Die Liste zeigt exakt die Fälle hinter der ausgewählten Zahl. Wirkungsprofil und persönliche Stimmabgabe bleiben getrennt.</p><Link className="button button-secondary" href={`${baseHref}#impact-overview-title`}>Filter zurücksetzen</Link></div>}
        <div className="profile-decision-list">{displayedDecisions.map((decision) => <MemberDecisionCard key={`${decision.official_vote_id}-${decision.case_id}`} decision={decision} faction={impact.member.faction_at_vote} focusDimension={activeFilter?.dimension} />)}</div>
      </section>
    </>}

    <GlossaryBasics title="Begriffe in den Wirkungsprofilen" termKeys={["wirkungspotenzial", "wirkungsrisiko", "materieller_wirkpfad", "gegenfaktum", "evidenzgrenze", "nichtkompensation"]} />
    <section className="notice"><strong>Methodische Grenze</strong><p>Nein wird nicht zum mathematischen Gegenteil des Wirkungsprofils der Vorlage. Die Seite dokumentiert die Unterstützung oder Ablehnung einer konkreten Option; Wirkungspotenzial, Wirkungsrisiko, Evidenz und Schutzgrenzen bleiben getrennt.</p></section>
  </div>;
}

function MemberDecisionCard({ decision, faction, focusDimension }: { decision: MemberImpactDecision; faction: string; focusDimension?: ImpactDimension }) {
  return <article>
    <div className="profile-decision-heading"><div><p className="source-register-label">{new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${decision.decision_date}T12:00:00Z`))}</p><h3>{decision.decision_object}</h3></div><span className={`vote-relation vote-relation--${decision.relation.toLocaleLowerCase("en-US")}`}>{relationLabels[decision.relation]}</span></div>
    <dl className="profile-vote-facts"><div><dt>Amtliche Stimme</dt><dd>{voteLabels[decision.official_vote]}</dd></div><div><dt>Fraktion zum Zeitpunkt</dt><dd>{faction}</dd></div><div><dt>Datenstatus</dt><dd>amtliche namentliche Abstimmung</dd></div></dl>
    <p>{decision.interpretation}</p>
    <DecisionDomainMatrix profile={decision.decision_domain_profile} />
    <ProfileDecisionAnalysis caseId={decision.case_id} focusDimension={focusDimension} />
    <div className="profile-decision-actions"><Link className="button button-primary" href={decisionHref(decision.case_id)}>Vollständigen Wirkungscheck öffnen</Link><Link className="button button-secondary" href={`/abstimmungen/${encodeURIComponent(decision.official_vote_id)}`}>Amtliche Abstimmungsquelle</Link></div>
  </article>;
}

function parseFilter(query: Record<string, string | string[] | undefined>): ProfileFilter | null {
  const relation = single(query.position);
  const dimension = single(query.dimension);
  const direction = single(query.richtung);
  if (!relation || !(["SUPPORTED", "REJECTED"] as const).includes(relation as MemberRelation) || !isImpactDimension(dimension) || !isImpactDirection(direction)) return null;
  return { relation: relation as MemberRelation, dimension, direction };
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
