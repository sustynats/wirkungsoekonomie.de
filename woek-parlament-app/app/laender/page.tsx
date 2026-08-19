import Link from "next/link";
import { formatElectionDate, governmentLifecycleLabel, lifecycleLabel, stateJurisdictions, stateSlug } from "@/lib/autopilot/registry";
import { statePublicContent } from "@/lib/states/public-content";

export const metadata = {
  title: "Länder | Wirkungsportal Parlament",
  description: "Wirkungschecks für Landespolitik: Wahlprogramme, Entscheidungen, Monitoring und nachvollziehbare Quellen."
};

const substantiveStateSlugs = new Set([...Object.keys(statePublicContent), "sachsen-anhalt"]);

export default function StatesPage() {
  return (
    <main className="shell content-page states-page">
      <header className="page-intro">
        <p className="eyebrow">Länder</p>
        <h1>Gleicher Wirkungscheck. Eigene Zuständigkeiten.</h1>
        <p className="lead">Landespolitik wird nicht unter Bundespolitik eingeordnet. Jede Ebene erhält ihre eigenen amtlichen Quellen, Programme, Verfahren und ihre eigene Rückkopplung - nach demselben offen gelegten Prüfstandard.</p>
      </header>

      <section className="notice" aria-labelledby="states-coverage-status">
        <strong id="states-coverage-status">Fachinhalte sind vorhanden - und werden jetzt sichtbar ausgespielt.</strong>
        <p>Alle 16 Länder sind als Jurisdiktionen registriert. In {substantiveStateSlugs.size} Ländern liegt bereits ein veröffentlichter oder freigegebener substantieller Fachstand vor: Sachsen-Anhalt, Baden-Württemberg, Rheinland-Pfalz, Berlin und Mecklenburg-Vorpommern. Für die übrigen Länder bleiben fehlende Fachstände sichtbar offen; eine automatische Vollständigkeit wird nicht behauptet.</p>
      </section>

      <section className="states-principles" aria-label="So arbeitet das Länderportal">
        <article><span aria-hidden="true">01</span><h2>Vor der Wahl</h2><p>Wahlprogramme werden als Primärquellen erschlossen. Geprüft wird ihr Wirkungspotenzial, nicht die Person oder Partei.</p></article>
        <article><span aria-hidden="true">02</span><h2>Im Regierungshandeln</h2><p>Koalitionsvertrag, Kabinettsbeschlüsse, Haushalt, Programme und Vollzug bleiben getrennte Stationen. Erst fachlich belastbare Wirkungsgegenstände werden bewertet.</p></article>
        <article><span aria-hidden="true">03</span><h2>Im Reality Check</h2><p>Zusagen, Entscheidungen, Umsetzung und beobachtbare Zustandsveränderung bleiben getrennt und nachvollziehbar verbunden.</p></article>
      </section>

      <section className="section section-compact" aria-labelledby="states-active-title">
        <div className="section-heading"><div><p className="eyebrow">Länderstand</p><h2 id="states-active-title">Wahlen, neue Regierungen und laufende Fachanalysen</h2></div></div>
        <div className="state-card-grid">
          {stateJurisdictions.map((jurisdiction) => {
            const slug = stateSlug(jurisdiction.jurisdiction_id);
            const electionDate = formatElectionDate(jurisdiction.next_election_date);
            const publicContent = statePublicContent[slug];
            const isSachsenAnhalt = slug === "sachsen-anhalt";
            const hasSubstantiveContent = substantiveStateSlugs.has(slug);
            const status = isSachsenAnhalt ? "WAHLPROGRAMM-WIRKUNGSAKTEN LIVE" : publicContent?.review?.statusLabel ?? lifecycleLabel(jurisdiction.election_cycle_state);
            const description = isSachsenAnhalt
              ? "Die freigegebenen Wahlprogramm-Wirkungsakten und Zusageregister sind im Länderbereich veröffentlicht."
              : publicContent?.review?.shortLabel
                ? `${publicContent.review.shortLabel}. Die vollständige freigegebene Fachanalyse ist im Länderbereich inline verfügbar.`
                : "Jurisdiktion und Lebenszyklus sind angelegt. Noch fehlende Fachanalysen werden nicht durch generische Wirkungstexte ersetzt.";

            return (
            <article className="state-card" key={jurisdiction.jurisdiction_id}>
              <p className="status-pill">{status}</p>
              <h3>{jurisdiction.name}</h3>
              <p>{description}</p>
              <p><strong>Regierung:</strong> {governmentLifecycleLabel(jurisdiction.government_lifecycle_state)}</p>
              {electionDate ? <p className="state-card-date"><strong>{jurisdiction.date_precision === "SEASON_ONLY" ? "Nächstes amtliches Wahlzeitfenster" : "Nächster amtlicher Wahltermin"}</strong><span>{electionDate}</span></p> : <p className="state-card-date"><strong>Wahltermin</strong><span>im Register noch nicht amtlich bestätigt</span></p>}
              <Link className="text-link" href={`/laender/${slug}`}>{hasSubstantiveContent ? "Fachstand öffnen" : "Länderbereich öffnen"} <span aria-hidden="true">→</span></Link>
            </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
