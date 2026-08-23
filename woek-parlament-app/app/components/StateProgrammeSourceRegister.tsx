import type { StateProgrammeSourceRegister as ProgrammeSourceRegister } from "@/lib/states/public-content";

function fieldScopeLabel(value: string) {
  return {
    LANDESLISTE: "Landesliste",
    BERLINWEITE_BEZIRKSLISTEN: "Bezirkslisten in ganz Berlin",
    BEZIRKSLISTEN_EINZELNE_BEZIRKE: "Bezirkslisten in einzelnen Bezirken",
  }[value] ?? value;
}

function artifactClassLabel(value: string) {
  if (value.includes("PENDING")) return "Finales Wahlprogramm ausstehend";
  if (value.includes("FINAL_ELECTION_PROGRAMME")) return "Finales Wahlprogramm";
  if (value === "PARTY_OFFICIAL_2026_ELECTION_PROGRAMME") return "Parteioffizielles Wahlprogramm 2026";
  if (value === "ELECTION_PROGRAMME_LINK") return "Wahlprogramm-Link";
  if (value === "ELECTION_MANIFEST") return "Wahlmanifest";
  if (value.includes("CAMPAIGN")) return "Wahlkampf-/Positionsquelle und Programmreferenz";
  return "Allgemeine Programmreferenz";
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(date);
}

export function StateProgrammeSourceRegister({ register }: { register: ProgrammeSourceRegister }) {
  return <section className="section section-compact" aria-labelledby="programmquellenregister">
    <p className="eyebrow">Aktuelles Programmquellenregister · Stand {formatDate(register.source_as_of)}</p>
    <h2 id="programmquellenregister">Alle {register.official_field.admitted_party_count} zugelassenen Parteien sind nach Quellentyp und Reife klassifiziert.</h2>
    <p className="lead">Quellenvollständigkeit bedeutet hier: Für jede zugelassene Partei ist sichtbar, ob ein finales Wahlprogramm, eine noch zu kanonisierende Wahlquelle oder nur allgemeines bzw. kampagnenbezogenes Material vorliegt. Sie bedeutet nicht, dass {register.official_field.admitted_party_count} finale Vollprogramme verfügbar oder fachlich vollständig analysiert sind.</p>
    <div className="jurisdiction-facts">
      <div><span>Amtliches Feld</span><strong>{register.official_field.admitted_party_count} Parteien</strong></div>
      <div><span>Final verifiziert</span><strong>{register.coverage.final_election_programme_verified_count} Wahlprogramme</strong></div>
      <div><span>Kanonisierung offen</span><strong>{register.coverage.election_source_available_canonicalization_pending_count} Wahlquellen</strong></div>
      <div><span>Kein finales Vollprogramm verifiziert</span><strong>{register.coverage.final_election_programme_not_verified_count} Parteien</strong></div>
      <div><span>Bestehender Fachstand</span><strong>{register.preserved_fach_review.materiality_theme_count} Themenreviews erhalten</strong></div>
    </div>
    <div className="notice notice-neutral"><strong>Keine Wirkung aus dem Quellenstatus ableiten.</strong><p>Ein veröffentlichtes Programm ist noch keine Wirkung; ein fehlendes finales Programm ist keine neutrale Bewertung. Wirkungsrichtung, Evidenz, Kompetenz und Schutzgrenzen erscheinen nur aus freigegebenem, quellengebundenem Fachreview.</p></div>
    <div className="source-register state-programme-register">
      {register.parties.map((party) => <article key={party.party}>
        <p className="source-register-label">{party.public_status_label}</p>
        <h3>{party.party}</h3>
        <p>{party.public_status_detail}</p>
        <p><strong>Amtlicher Listentyp:</strong> {fieldScopeLabel(party.field_scope)}</p>
        <p><strong>Quellenklasse:</strong> {artifactClassLabel(party.artifact_class)}</p>
        <ul>
          {party.source_urls.map((source) => <li key={`${party.party}-${source.url}`}><a className="text-link" href={source.url}>{source.label} →</a></li>)}
        </ul>
        <details><summary>Technischer Source-Status</summary><p><code>{party.source_status.replaceAll("_", " ")}</code></p></details>
      </article>)}
    </div>
  </section>;
}
