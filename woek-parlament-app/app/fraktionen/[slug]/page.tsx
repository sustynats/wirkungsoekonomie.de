import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImpactProfileMatrix, DecisionDomainMatrix } from "@/app/components/ImpactProfileMatrix";
import { ProfileDecisionAnalysis } from "@/app/components/ProfileDecisionAnalysis";
import { GlossaryBasics } from "@/app/components/GlossaryBasics";
import { decisionHref, getFactionImpactProfile, impactDirectionLabel, isImpactDimension, isImpactDirection, type FactionImpactDecision, type ImpactDimension, type ImpactDirection } from "@/lib/members/impact-profiles";
import { humanizeSystemValue } from "@/lib/presentation/labels";

const relationLabels = { SUPPORTED: "Entscheidungsoption unterstützt", REJECTED: "Entscheidungsoption abgelehnt", ABSTAINED: "Enthaltung", MIXED: "keine einheitliche Position" } as const;
const positionLabels = { YES: "Ja", NO: "Nein", ABSTAIN: "Enthaltung", MAJORITY_YES: "mehrheitlich Ja", MAJORITY_NO: "mehrheitlich Nein", MIXED_OR_TIED: "geteilt oder Stimmengleichheit" } as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const profile = getFactionImpactProfile((await params).slug);
  return { title: profile ? `Fraktions-Wirkungsprofil: ${profile.faction.name}` : "Fraktionsprofil nicht gefunden", description: "Dokumentierte Fraktionspositionen und die Wirkungsprofile der jeweils unterstützten oder abgelehnten Entscheidungen." };
}

type FactionRelation = "SUPPORTED" | "REJECTED" | "ABSTAINED";
type ProfileFilter = { relation: FactionRelation; dimension: ImpactDimension; direction: ImpactDirection };

export default async function FactionProfilePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const profile = getFactionImpactProfile(slug);
  if (!profile) notFound();
  const counts = profile.summary.decision_relation_counts;
  const activeFilter = parseFilter(query);
  const displayedDecisions = activeFilter ? profile.decisions.filter((decision) => decision.relation === activeFilter.relation && decision.decision_domain_profile[activeFilter.dimension].direction === activeFilter.direction) : profile.decisions;
  const baseHref = `/fraktionen/${slug}`;
  return <div className="shell decision-page faction-profile-page">
    <nav className="breadcrumb" aria-label="Brotkrumen"><Link href="/">Startseite</Link><span aria-hidden="true">/</span><Link href="/fraktionen">Wirkungsprofile der Fraktionen</Link><span aria-hidden="true">/</span><span>{profile.faction.name}</span></nav>
    <header className="page-intro faction-profile-intro"><p className="eyebrow">Wirkungsprofil parlamentarischer Entscheidungen der Fraktion</p><h1>{profile.faction.name}</h1><p className="lead">Dieses Profil bewertet nicht die Partei oder Fraktion als Ganzes. Es fasst zusammen, welche parlamentarischen Entscheidungsoptionen die Fraktion im betrachteten WÖk-Fallset unterstützt, abgelehnt oder mit Enthaltung beantwortet hat und welches Wirkungsprofil diese Optionen hatten.</p><p className="profile-scope">{profile.scope.parliament} · Datenstand {new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${profile.scope.data_as_of}T12:00:00Z`))}</p></header>

    <section className="member-summary" aria-label="Dokumentierte Fraktionspositionen"><div><span>Unterstützt</span><strong>{counts.SUPPORTED ?? 0}</strong><small>konkrete Entscheidungsoptionen</small></div><div><span>Abgelehnt</span><strong>{counts.REJECTED ?? 0}</strong><small>ohne Umkehrung des Wirkungsprofils</small></div><div><span>Enthalten</span><strong>{counts.ABSTAINED ?? 0}</strong><small>keiner Wirkungsrichtung zugerechnet</small></div></section>

    <section className="decision-section profile-impact-overview" aria-labelledby="faction-impact-title"><p className="eyebrow">Mensch · Planet · Demokratie</p><h2 id="faction-impact-title">Wirkungsprofile nach dokumentierter Position</h2><p className="lead">Die Anzahl bezieht sich auf Entscheidungen, nicht auf die Zahl einzelner Wirkpfade. Potenziale und Risiken dürfen gleichzeitig vorkommen und werden nicht zu einer Gesamtpunktzahl verrechnet.</p>
      <p className="matrix-interaction-hint"><strong>Zahlen sind anklickbar:</strong> Sie öffnen genau die Entscheidungen, aus denen der jeweilige Wert besteht.</p>
      <div className="impact-profile-matrix-grid"><ImpactProfileMatrix title="Unterstützte Entscheidungen" profile={profile.summary.supported_decision_impact_profile} baseHref={baseHref} relation="SUPPORTED" activeFilter={activeFilter} /><ImpactProfileMatrix title="Abgelehnte Entscheidungen" profile={profile.summary.rejected_decision_impact_profile} baseHref={baseHref} relation="REJECTED" activeFilter={activeFilter} /><ImpactProfileMatrix title="Enthaltungen" profile={profile.summary.abstained_decision_impact_profile} baseHref={baseHref} relation="ABSTAINED" activeFilter={activeFilter} /></div>
    </section>

    <section className="decision-section" id="fallauswahl" aria-labelledby="faction-decisions-title"><p className="eyebrow">{activeFilter ? "Gefilterte Einzelfälle" : "Zwölf entschiedene Fälle"}</p><h2 id="faction-decisions-title">{activeFilter ? `${displayedDecisions.length} ${displayedDecisions.length === 1 ? "Entscheidung" : "Entscheidungen"}: ${relationLabels[activeFilter.relation]} · ${activeFilter.dimension} · ${impactDirectionLabel(activeFilter.direction)}` : "Von der Fraktionsposition zur vollständigen Wirkungsakte"}</h2>{activeFilter && <div className="active-profile-filter"><p>Die Liste zeigt exakt die Fälle hinter der ausgewählten Zahl. Die Kurzbewertung erklärt die Vorlage; das Votum der Fraktion wird davon getrennt dokumentiert.</p><Link className="button button-secondary" href={`${baseHref}#faction-impact-title`}>Filter zurücksetzen</Link></div>}<div className="profile-decision-list">{displayedDecisions.map((decision) => <FactionDecisionCard key={decision.case_id} decision={decision} focusDimension={activeFilter?.dimension} />)}</div></section>
    <GlossaryBasics title="Begriffe in den Wirkungsprofilen" termKeys={["wirkungspotenzial", "wirkungsrisiko", "materieller_wirkpfad", "gegenfaktum", "evidenzgrenze", "nichtkompensation"]} />
    <section className="notice"><strong>Keine Personen- oder Parteienbewertung</strong><p>Nicht namentliche Fraktionsvoten werden niemals einzelnen Abgeordneten zugerechnet. Nein wird nicht in das rechnerische Gegenteil einer Vorlage übersetzt. Jeder Wert bleibt bis zur Entscheidung und Fachakte rückverfolgbar.</p></section>
  </div>;
}

function FactionDecisionCard({ decision, focusDimension }: { decision: FactionImpactDecision; focusDimension?: ImpactDimension }) {
  return <article>
    <div className="profile-decision-heading"><div><p className="source-register-label">{new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${decision.decision_date}T12:00:00Z`))}</p><h3>{decision.decision_object}</h3></div><span className={`vote-relation vote-relation--${decision.relation.toLocaleLowerCase("en-US")}`}>{relationLabels[decision.relation]}</span></div>
    <dl className="profile-vote-facts"><div><dt>Dokumentierte Position</dt><dd>{positionLabels[decision.collective_position]}</dd></div><div><dt>Quellentyp</dt><dd>{decision.evidence_type === "OFFICIAL_ROLL_CALL_AGGREGATE" ? "amtliches Aggregat der namentlichen Abstimmung" : "parlamentarisch berichtete Fraktionsposition"}</dd></div><div><dt>Ergebnis</dt><dd>{humanizeSystemValue(decision.result)}</dd></div></dl>
    {decision.evidence_type === "OFFICIAL_ROLL_CALL_AGGREGATE" && <p className="roll-call-composition"><strong>Innerhalb der Fraktion:</strong> {decision.yes ?? 0} Ja · {decision.no ?? 0} Nein · {decision.abstention ?? 0} Enthaltungen · {decision.did_not_vote ?? 0} nicht abgestimmt. Die Mehrheitsposition wird nicht als Einstimmigkeit dargestellt.</p>}
    <p>{decision.interpretation}</p><DecisionDomainMatrix profile={decision.decision_domain_profile} />
    <ProfileDecisionAnalysis caseId={decision.case_id} focusDimension={focusDimension} />
    <div className="profile-decision-actions"><Link className="button button-primary" href={decisionHref(decision.case_id)}>Vollständigen Wirkungscheck öffnen</Link></div>
  </article>;
}

function parseFilter(query: Record<string, string | string[] | undefined>): ProfileFilter | null {
  const relation = single(query.position);
  const dimension = single(query.dimension);
  const direction = single(query.richtung);
  if (!relation || !(["SUPPORTED", "REJECTED", "ABSTAINED"] as const).includes(relation as FactionRelation) || !isImpactDimension(dimension) || !isImpactDirection(direction)) return null;
  return { relation: relation as FactionRelation, dimension, direction };
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
