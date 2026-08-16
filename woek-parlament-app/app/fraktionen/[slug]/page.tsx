import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImpactProfileMatrix, DecisionDomainMatrix } from "@/app/components/ImpactProfileMatrix";
import { decisionHref, getFactionImpactProfile } from "@/lib/members/impact-profiles";

const relationLabels = { SUPPORTED: "Entscheidungsoption unterstützt", REJECTED: "Entscheidungsoption abgelehnt", ABSTAINED: "Enthaltung", MIXED: "keine einheitliche Position" } as const;
const positionLabels = { YES: "Ja", NO: "Nein", ABSTAIN: "Enthaltung", MAJORITY_YES: "mehrheitlich Ja", MAJORITY_NO: "mehrheitlich Nein", MIXED_OR_TIED: "geteilt oder Stimmengleichheit" } as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const profile = getFactionImpactProfile((await params).slug);
  return { title: profile ? `Fraktions-Wirkungsprofil: ${profile.faction.name}` : "Fraktionsprofil nicht gefunden", description: "Dokumentierte Fraktionspositionen und die Wirkungsprofile der jeweils unterstützten oder abgelehnten Entscheidungen." };
}

export default async function FactionProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const profile = getFactionImpactProfile((await params).slug);
  if (!profile) notFound();
  const counts = profile.summary.decision_relation_counts;
  return <div className="shell decision-page faction-profile-page">
    <nav className="breadcrumb" aria-label="Brotkrumen"><Link href="/">Startseite</Link><span aria-hidden="true">/</span><Link href="/fraktionen">Wirkungsprofile der Fraktionen</Link><span aria-hidden="true">/</span><span>{profile.faction.name}</span></nav>
    <header className="page-intro faction-profile-intro"><p className="eyebrow">Wirkungsprofil parlamentarischer Entscheidungen der Fraktion</p><h1>{profile.faction.name}</h1><p className="lead">Dieses Profil bewertet nicht die Partei oder Fraktion als Ganzes. Es fasst zusammen, welche parlamentarischen Entscheidungsoptionen die Fraktion im betrachteten WÖk-Fallset unterstützt, abgelehnt oder mit Enthaltung beantwortet hat und welches Wirkungsprofil diese Optionen hatten.</p><p className="profile-scope">{profile.scope.parliament} · Datenstand {new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${profile.scope.data_as_of}T12:00:00Z`))}</p></header>

    <section className="member-summary" aria-label="Dokumentierte Fraktionspositionen"><div><span>Unterstützt</span><strong>{counts.SUPPORTED ?? 0}</strong><small>konkrete Entscheidungsoptionen</small></div><div><span>Abgelehnt</span><strong>{counts.REJECTED ?? 0}</strong><small>ohne Umkehrung des Wirkungsprofils</small></div><div><span>Enthalten</span><strong>{counts.ABSTAINED ?? 0}</strong><small>keiner Wirkungsrichtung zugerechnet</small></div></section>

    <section className="decision-section profile-impact-overview" aria-labelledby="faction-impact-title"><p className="eyebrow">Mensch · Planet · Demokratie</p><h2 id="faction-impact-title">Wirkungsprofile nach dokumentierter Position</h2><p className="lead">Die Anzahl bezieht sich auf Entscheidungen, nicht auf die Zahl einzelner Wirkpfade. Potenziale und Risiken dürfen gleichzeitig vorkommen und werden nicht zu einer Gesamtpunktzahl verrechnet.</p>
      <div className="impact-profile-matrix-grid"><ImpactProfileMatrix title="Unterstützte Entscheidungen" profile={profile.summary.supported_decision_impact_profile} /><ImpactProfileMatrix title="Abgelehnte Entscheidungen" profile={profile.summary.rejected_decision_impact_profile} /><ImpactProfileMatrix title="Enthaltungen" profile={profile.summary.abstained_decision_impact_profile} /></div>
    </section>

    <section className="decision-section" aria-labelledby="faction-decisions-title"><p className="eyebrow">Zwölf entschiedene Fälle</p><h2 id="faction-decisions-title">Von der Fraktionsposition zur vollständigen Wirkungsakte</h2><div className="profile-decision-list">{profile.decisions.map((decision) => <article key={decision.case_id}>
      <div className="profile-decision-heading"><div><p className="source-register-label">{new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${decision.decision_date}T12:00:00Z`))}</p><h3>{decision.decision_object}</h3></div><span className={`vote-relation vote-relation--${decision.relation.toLocaleLowerCase("en-US")}`}>{relationLabels[decision.relation]}</span></div>
      <dl className="profile-vote-facts"><div><dt>Dokumentierte Position</dt><dd>{positionLabels[decision.collective_position]}</dd></div><div><dt>Quellentyp</dt><dd>{decision.evidence_type === "OFFICIAL_ROLL_CALL_AGGREGATE" ? "amtliches Aggregat der namentlichen Abstimmung" : "parlamentarisch berichtete Fraktionsposition"}</dd></div><div><dt>Ergebnis</dt><dd>{decision.result === "ADOPTED" ? "angenommen" : decision.result}</dd></div></dl>
      {decision.evidence_type === "OFFICIAL_ROLL_CALL_AGGREGATE" && <p className="roll-call-composition"><strong>Innerhalb der Fraktion:</strong> {decision.yes ?? 0} Ja · {decision.no ?? 0} Nein · {decision.abstention ?? 0} Enthaltungen · {decision.did_not_vote ?? 0} nicht abgestimmt. Die Mehrheitsposition wird nicht als Einstimmigkeit dargestellt.</p>}
      <p>{decision.interpretation}</p><DecisionDomainMatrix profile={decision.decision_domain_profile} />
      {decision.non_compensable_boundaries.length > 0 && <div className="boundary-box"><strong>Nichtkompensierbare Schutzfragen</strong><ul>{decision.non_compensable_boundaries.map((boundary) => <li key={boundary}>{boundary}</li>)}</ul></div>}
      <div className="profile-decision-actions"><Link className="button button-primary" href={decisionHref(decision.case_id)}>Wirkungsakte der Entscheidung</Link></div>
    </article>)}</div></section>
    <section className="notice"><strong>Keine Personen- oder Parteienbewertung</strong><p>Nicht namentliche Fraktionsvoten werden niemals einzelnen Abgeordneten zugerechnet. Nein wird nicht in das rechnerische Gegenteil einer Vorlage übersetzt. Jeder Wert bleibt bis zur Entscheidung und Fachakte rückverfolgbar.</p></section>
  </div>;
}
