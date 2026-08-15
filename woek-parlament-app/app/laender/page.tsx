import Link from "next/link";
import { activeStateJurisdictions } from "@/lib/parliament/jurisdictions";

const statusLabel = {
  ELECTION_PREPARATION: "Wahlvorbereitung",
  MONITORING_PREPARATION: "Monitoring wird vorbereitet"
} as const;

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
          {activeStateJurisdictions.map((jurisdiction) => (
            <article className="state-card" key={jurisdiction.id}>
              <p className="status-pill">{statusLabel[jurisdiction.status as keyof typeof statusLabel]}</p>
              <h3>{jurisdiction.label}</h3>
              <p>{jurisdiction.publicSummary}</p>
              {jurisdiction.election ? <p className="state-card-date"><strong>{jurisdiction.election.label}</strong><span>{new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${jurisdiction.election.date}T12:00:00`))}</span></p> : null}
              {jurisdiction.governmentMonitoring ? <p className="state-card-date"><strong>{jurisdiction.governmentMonitoring.label}</strong><span>Monitoring ab {new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${jurisdiction.governmentMonitoring.startDate}T12:00:00`))}</span></p> : null}
              {jurisdiction.id === "sachsen-anhalt" ? <Link className="text-link" href={jurisdiction.publicPath}>Zum Wahlbereich <span aria-hidden="true">→</span></Link> : <span className="state-card-pending">Öffentliche Fallseiten folgen mit geprüften Quellen.</span>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
