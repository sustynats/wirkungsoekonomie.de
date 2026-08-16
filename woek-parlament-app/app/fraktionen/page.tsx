import type { Metadata } from "next";
import Link from "next/link";
import { listFactionImpactProfiles } from "@/lib/members/impact-profiles";

export const metadata: Metadata = {
  title: "Wirkungsprofile der Fraktionen",
  description: "Dokumentierte Fraktionspositionen zu zwölf entschiedenen Fällen und die Wirkungsprofile der unterstützten oder abgelehnten Optionen."
};

export default function FactionsPage() {
  const factions = listFactionImpactProfiles();
  return <div className="shell content-page faction-directory-page">
    <header className="page-intro member-directory-intro">
      <p className="eyebrow">Wirkungsprofile · Deutscher Bundestag</p>
      <h1>Welche Entscheidungsoptionen haben die Fraktionen unterstützt oder abgelehnt?</h1>
      <p className="lead">Die Fraktionsprofile verbinden dokumentierte parlamentarische Positionen mit dem Wirkungsprofil der jeweiligen Entscheidung. Sie bewerten weder eine Partei noch ihre Mitglieder und erzeugen keinen Gesamtwert.</p>
      <div className="member-directory-facts" aria-label="Datenumfang"><div><strong>5</strong><span>Fraktionen im untersuchten Fallset</span></div><div><strong>12</strong><span>entschiedene Fälle je Fraktionsprofil</span></div><div><strong>60</strong><span>nachvollziehbare Fraktions-Fallbeziehungen</span></div></div>
      <div className="profile-level-switch" aria-label="Profilart wählen"><Link href="/abgeordnete">Abgeordnete</Link><span aria-current="page">Fraktionen</span></div>
    </header>

    <section className="faction-directory" aria-labelledby="factions-title"><div className="section-heading"><div><p className="eyebrow">Fraktionen im 28-Fälle-Set</p><h2 id="factions-title">Unterstützt, abgelehnt oder enthalten – ohne Ranking.</h2></div></div>
      <div className="faction-profile-grid">{factions.map(({ slug, profile }) => {
        const counts = profile.summary.decision_relation_counts;
        return <article key={slug}><p className="source-register-label">{profile.scope.parliament}</p><h3>{profile.faction.name}</h3><dl><div><dt>Unterstützt</dt><dd>{counts.SUPPORTED ?? 0}</dd></div><div><dt>Abgelehnt</dt><dd>{counts.REJECTED ?? 0}</dd></div><div><dt>Enthalten</dt><dd>{counts.ABSTAINED ?? 0}</dd></div></dl><p>Das Profil zeigt Mensch, Planet und Demokratie getrennt und führt jeden Wert auf die zugrunde liegende Entscheidung zurück.</p><Link className="text-link" href={`/fraktionen/${slug}`}>Fraktionsprofil öffnen <span aria-hidden="true">→</span></Link></article>;
      })}</div>
    </section>

    <section className="member-rules"><div><p className="eyebrow">Methodische Grenze</p><h2>Fraktionsverhalten ist keine Individualstimme.</h2></div><ol><li><strong>Dokumentierte Positionen.</strong><span>Nicht namentliche Voten gehen nur in das Fraktionsprofil ein.</span></li><li><strong>Abweichungen bleiben sichtbar.</strong><span>Bei namentlichen Abstimmungen bedeutet eine Mehrheitsposition niemals Einstimmigkeit.</span></li><li><strong>Keine Umkehrrechnung.</strong><span>Eine abgelehnte Vorlage wird nicht zum Gegenteil ihrer Wirkpfade.</span></li><li><strong>Kein Score.</strong><span>Potenziale, Risiken, offene Fragen und Schutzgrenzen werden nicht zu einer Rangliste verrechnet.</span></li></ol></section>
    <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
  </div>;
}
