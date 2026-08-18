import Link from "next/link";
import { formatElectionDate, governmentLifecycleLabel, lifecycleLabel, stateJurisdictions, stateSlug } from "@/lib/autopilot/registry";

export const metadata = {
  title: "Länder | Wirkungsportal Parlament",
  description: "Wirkungschecks für Landespolitik: Wahlprogramme, Entscheidungen, Monitoring und nachvollziehbare Quellen."
};

export default function StatesPage() {
  return (
    <main className="shell content-page states-page">
      <header className="page-intro">
        <p className="eyebrow">Länder</p>
        <h1>Gleicher Wirkungscheck. Eigene Zuständigkeiten.</h1>
        <p className="lead">Landespolitik wird nicht unter Bundespolitik eingeordnet. Jede Ebene erhält ihre eigenen amtlichen Quellen, Programme, Verfahren und später ihre eigene Rückkopplung – nach demselben offen gelegten Prüfstandard.</p>
      </header>

      <section className="notice" aria-labelledby="states-coverage-status">
        <strong id="states-coverage-status">Statischer Initialbestand - noch kein operativer Länder-Crawler</strong>
        <p>Alle 16 Länder sind als Jurisdiktionen registriert. Für 0 von 16 Ländern ist im aktuellen Staging bereits ein vollständig operationalisierter amtlicher Quellenadapter nachgewiesen. Wahltermine und Programme in dieser Ansicht stammen aus dem fachlich vorbereiteten Initialbestand; eine automatische Vollständigkeit wird ausdrücklich nicht behauptet.</p>
      </section>

      <section className="states-principles" aria-label="So arbeitet das Länderportal">
        <article><span aria-hidden="true">01</span><h2>Vor der Wahl</h2><p>Wahlprogramme werden als Quellen erschlossen. Geprüft wird ihr Wirkungspotenzial, nicht die Person oder Partei.</p></article>
        <article><span aria-hidden="true">02</span><h2>Im Verfahren</h2><p>Gesetzesvorhaben werden mit Fassung, Termin, möglichen Wirkpfaden, Risiken und veränderbaren Hebeln vorbereitet.</p></article>
        <article><span aria-hidden="true">03</span><h2>Danach</h2><p>Zusagen, Entscheidungen, Umsetzung und beobachtbare Entwicklung bleiben getrennt und nachvollziehbar verbunden.</p></article>
      </section>

      <section className="section section-compact" aria-labelledby="states-active-title">
        <div className="section-heading"><div><p className="eyebrow">Im Aufbau</p><h2 id="states-active-title">Wahlen und junge Wahlperioden</h2></div></div>
        <div className="state-card-grid">
          {stateJurisdictions.map((jurisdiction) => {
            const electionDate = formatElectionDate(jurisdiction.next_election_date);
            return (
            <article className="state-card" key={jurisdiction.jurisdiction_id}>
              <p className="status-pill">{lifecycleLabel(jurisdiction.election_cycle_state)}</p>
              <h3>{jurisdiction.name}</h3>
              <p>{jurisdiction.election_cycle_state === "DORMANT" ? "Für dieses Land ist ein statischer Initialstand registriert. Ein operativer amtlicher Quellenadapter ist noch nicht nachgewiesen." : "Wahl-, Regierungs- und Umsetzungsdaten sind als getrennte Lebenszyklusobjekte vorbereitet. Automatische Aktualität wird erst nach einem bestandenen Adapter-Audit ausgewiesen."}</p>
              <p><strong>Regierung:</strong> {governmentLifecycleLabel(jurisdiction.government_lifecycle_state)}</p>
              {electionDate ? <p className="state-card-date"><strong>{jurisdiction.date_precision === "SEASON_ONLY" ? "Nächstes amtliches Wahlzeitfenster" : "Nächster amtlicher Wahltermin"}</strong><span>{electionDate}</span></p> : <p className="state-card-date"><strong>Wahltermin</strong><span>im Register noch nicht amtlich bestätigt</span></p>}
              <Link className="text-link" href={`/laender/${stateSlug(jurisdiction.jurisdiction_id)}`}>Länderbereich öffnen <span aria-hidden="true">→</span></Link>
            </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
