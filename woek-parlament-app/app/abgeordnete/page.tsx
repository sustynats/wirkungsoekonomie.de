import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedMemberProfiles } from "@/lib/members/public-profiles";

export const metadata: Metadata = {
  title: "Wirkungsprofile der Abgeordneten",
  description: "Amtliche Einzelstimmen werden mit den Wirkungsprofilen der jeweils unterstützten oder abgelehnten parlamentarischen Entscheidungen verbunden."
};

export const dynamic = "force-dynamic";

function shortGroup(value: string | null) {
  if (!value) return "Fraktionslos oder Gruppe nicht ausgewiesen";
  if (/Christlich Demokratischen Union/i.test(value)) return "CDU/CSU";
  if (/Sozialdemokratischen Partei/i.test(value)) return "SPD";
  if (/Alternative für Deutschland/i.test(value)) return "AfD";
  if (/BÜNDNIS 90|DIE GRÜNEN/i.test(value)) return "BÜNDNIS 90/DIE GRÜNEN";
  if (/DIE LINKE/i.test(value)) return "DIE LINKE";
  return value.replace(/^Fraktion der /, "").replace(/^Fraktion /, "");
}

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("de-DE");
}

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string; gruppe?: string; land?: string; daten?: string }> }) {
  const profiles = await listPublishedMemberProfiles();
  const filters = await searchParams;
  const query = (filters.q ?? "").trim();
  const group = (filters.gruppe ?? "").trim();
  const state = (filters.land ?? "").trim();
  const dataStatus = (filters.daten ?? "").trim();
  const groups = [...new Set(profiles.map((profile) => shortGroup(profile.parliamentaryGroup)))].sort((a, b) => a.localeCompare(b, "de-DE"));
  const states = [...new Set(profiles.map((profile) => profile.federalState).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "de-DE"));
  const visibleProfiles = profiles.filter((profile) => {
    const haystack = normalized([profile.displayName, profile.constituency, profile.federalState, shortGroup(profile.parliamentaryGroup)].filter(Boolean).join(" "));
    return (!query || haystack.includes(normalized(query)))
      && (!group || shortGroup(profile.parliamentaryGroup) === group)
      && (!state || profile.federalState === state)
      && (!dataStatus || (dataStatus === "vorhanden" ? profile.impactProfileAvailable : !profile.impactProfileAvailable));
  });
  const impactProfiles = profiles.filter((profile) => profile.impactProfileAvailable).length;
  const currentWithoutImpact = profiles.filter((profile) => profile.currentMandate && !profile.impactProfileAvailable).length;

  return <div className="shell content-page members-page">
    <header className="page-intro member-directory-intro">
      <p className="eyebrow">Wirkungsprofile · Deutscher Bundestag</p>
      <h1>Welche Entscheidungsoptionen haben Abgeordnete unterstützt oder abgelehnt?</h1>
      <p className="lead">Die Profile führen amtlich veröffentlichte Einzelstimmen mit dem damaligen Wirkungscheck der Entscheidung zusammen. Sie zeigen Wirkungspotenziale, Wirkungsrisiken und offene Fragen der jeweils unterstützten oder abgelehnten Option – keine Bewertung des Menschen.</p>
      <div className="member-directory-facts" aria-label="Umfang und methodische Grenze">
        <div><strong>{impactProfiles}</strong><span>Profile mit amtlicher Einzelstimme</span></div>
        <div><strong>1 Abstimmung</strong><span>aktuelle Datenbasis im 28-Fälle-Set</span></div>
        <div><strong>{currentWithoutImpact}</strong><span>aktuelle Mitglieder noch ohne passende namentliche WÖk-Abstimmung</span></div>
      </div>
      <div className="profile-level-switch" aria-label="Profilart wählen"><span aria-current="page">Abgeordnete</span><Link href="/fraktionen">Fraktionen</Link></div>
    </header>

    <section className="member-directory" aria-labelledby="member-directory-title">
      <div className="section-heading">
        <div><p className="eyebrow">Abgeordnete finden</p><h2 id="member-directory-title">Profile und Abstimmungsbilanzen</h2><p>{visibleProfiles.length} von {profiles.length} Profilen werden angezeigt.</p></div>
      </div>
      <form className="member-filter member-filter--wide" action="/abgeordnete" method="get" role="search">
        <label><span>Name, Wahlkreis oder Ort</span><input type="search" name="q" defaultValue={query} placeholder="Zum Beispiel Mustermann oder Magdeburg" /></label>
        <label><span>Fraktion oder Gruppe</span><select name="gruppe" defaultValue={group}><option value="">Alle</option>{groups.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label><span>Bundesland</span><select name="land" defaultValue={state}><option value="">Alle</option>{states.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label><span>Datenstatus</span><select name="daten" defaultValue={dataStatus}><option value="">Alle</option><option value="vorhanden">Wirkungsprofil vorhanden</option><option value="offen">Noch ohne Wirkungsprofil</option></select></label>
        <div className="member-filter-actions"><button className="button button-primary" type="submit">Filtern</button>{(query || group || state || dataStatus) && <Link className="button button-secondary" href="/abgeordnete">Zurücksetzen</Link>}</div>
      </form>

      {visibleProfiles.length > 0 ? <div className="member-profile-grid member-directory-grid">
        {visibleProfiles.map((profile) => <article key={profile.slug}>
          <div className="member-card-monogram" aria-hidden="true">{profile.displayName.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(-2).join("")}</div>
          <div><p className="source-register-label">{shortGroup(profile.parliamentaryGroup)}</p><h3>{profile.displayName}</h3><p>{[profile.federalState, profile.constituency, profile.mandateType].filter(Boolean).join(" · ") || "Deutscher Bundestag"}</p><p className={`profile-data-status ${profile.impactProfileAvailable ? "profile-data-status--available" : ""}`}>{profile.impactProfileAvailable ? `${profile.documentedVotes} namentliche Entscheidung im Wirkungsprofil` : "Noch keine passende namentliche WÖk-Abstimmung"}</p></div>
          <Link className="text-link" href={`/abgeordnete/${profile.slug}`}>Wirkungsprofil öffnen <span aria-hidden="true">→</span></Link>
        </article>)}
      </div> : <div className="notice notice-neutral"><strong>Keine Profile für diese Auswahl.</strong><p>Bitte ändere den Suchbegriff oder setze die Filter zurück.</p></div>}
    </section>

    <section className="member-rules" aria-labelledby="member-rules-title">
      <div><p className="eyebrow">So ist die Bilanz geschützt</p><h2 id="member-rules-title">Einzelfälle nachvollziehen, Menschen nicht bewerten.</h2></div>
      <ol>
        <li><strong>Nur namentliche Abstimmungen.</strong><span>Bei anderen Abstimmungen wird keine individuelle Stimme hergeleitet oder geschätzt.</span></li>
        <li><strong>Keine Umkehrung einer Nein-Stimme.</strong><span>Eine abgelehnte Vorlage wird nicht rechnerisch zum Gegenteil ihrer Wirkpfade gemacht.</span></li>
        <li><strong>Enthaltung und Nichtabstimmung getrennt.</strong><span>Beides wird dokumentiert und keiner Wirkungsrichtung zugerechnet.</span></li>
        <li><strong>Jeder Eintrag bleibt prüfbar.</strong><span>Amtliche Abstimmung, Wirkungscheck, Quellen und Methodenversion sind miteinander verknüpft.</span></li>
      </ol>
    </section>

    <section className="notice"><strong>Porträts nur mit geklärtem Nutzungsrecht.</strong><p>Bis eine konkrete Bildfreigabe samt Quellenangabe geprüft ist, verwendet das Portal neutrale Monogramme. Das amtliche Profilverzeichnis und die namentlichen Stimmen stammen aus den Veröffentlichungen des Deutschen Bundestags.</p></section>
    <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
  </div>;
}
