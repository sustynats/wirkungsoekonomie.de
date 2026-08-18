import Link from "next/link";
import { governmentLifecycleLabel, lifecycleLabel, stateJurisdictions, stateSlug } from "@/lib/autopilot/registry";

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

      <section className="states-principles" aria-label="So arbeitet das Länderportal">
        <article><span aria-hidden="true">01</span><h2>Vor der Wahl</h2><p>Wahlprogramme werden als Quellen erschlossen. Geprüft wird ihr Wirkungspotenzial, nicht die Person oder Partei.</p></article>
        <article><span aria-hidden="true">02</span><h2>Im Verfahren</h2><p>Gesetzesvorhaben werden mit Fassung, Termin, möglichen Wirkpfaden, Risiken und veränderbaren Hebeln vorbereitet.</p></article>
        <article><span aria-hidden="true">03</span><h2>Danach</h2><p>Zusagen, Entscheidungen, Umsetzung und beobachtbare Entwicklung bleiben getrennt und nachvollziehbar verbunden.</p></article>
      </section>

      <section className="section section-compact" aria-labelledby="states-active-title">
        <div className="section-heading"><div><p className="eyebrow">Im Aufbau</p><h2 id="states-active-title">Wahlen und junge Wahlperioden</h2></div></div>
        <div className="state-card-grid">
          {stateJurisdictions.map((jurisdiction) => (
            <article className="state-card" key={jurisdiction.jurisdiction_id}>
              <p className="status-pill">{lifecycleLabel(jurisdiction.election_cycle_state)}</p>
              <h3>{jurisdiction.name}</h3>
              <p>{jurisdiction.election_cycle_state === "DORMANT" ? "Der Autopilot beobachtet amtliche Wahlquellen. Ein öffentlicher Wirkungsbestand erscheint erst nach Quellen- und Fachfreigabe." : "Wahl-, Regierungs- und Umsetzungsdaten werden als getrennte Lebenszyklusobjekte aufgebaut und fachlich zu Wirkungsgegenständen verknüpft."}</p>
              <p><strong>Regierung:</strong> {governmentLifecycleLabel(jurisdiction.government_lifecycle_state)}</p>
              {jurisdiction.next_election_date ? <p className="state-card-date"><strong>Nächster amtlicher Wahltermin</strong><span>{new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${jurisdiction.next_election_date}T12:00:00`))}</span></p> : <p className="state-card-date"><strong>Wahltermin</strong><span>im Register noch nicht amtlich bestätigt</span></p>}
              <Link className="text-link" href={`/laender/${stateSlug(jurisdiction.jurisdiction_id)}`}>Länderbereich öffnen <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
