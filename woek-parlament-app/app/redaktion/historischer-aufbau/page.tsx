import Link from "next/link";
import { redirect } from "next/navigation";
import { currentEditorialSession } from "@/lib/editorial/auth";
import { historicalBackfillDashboard } from "@/lib/editorial/workbench";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${value}T12:00:00Z`));
}

export default async function HistoricalBackfillPage() {
  const session = await currentEditorialSession();
  if (!session) redirect("/redaktion/anmelden?next=/redaktion/historischer-aufbau");
  const dashboard = await historicalBackfillDashboard();
  const counts = dashboard.counts;

  return <div className="editorial-shell container">
    <p className="breadcrumb"><Link href="/redaktion">Meine Aufgaben</Link><span aria-hidden="true">/</span><span>Historischer Aufbau</span></p>
    <header className="editorial-question-header">
      <p className="kicker">Intern · Decision Registry</p>
      <h1>Wirkungsbilanz der laufenden Regierungszeit</h1>
      <p>{dashboard.term ? <>Historischer WÖk-Backfill seit <strong>{formatDate(dashboard.term.historical_woek_backfill_start)}</strong>. Beginn der Wahlperiode: {formatDate(dashboard.term.legislative_term_start)}; Beginn der Regierungszeit: {formatDate(dashboard.term.government_term_start)}.</> : "Die Regierungszeit-Konfiguration wird nach der Migration geladen."}</p>
    </header>
    {counts ? <section className="editorial-kpis editorial-kpis--three" aria-label="Backfill-Stand">
      <article><span>Gefunden</span><strong>{counts.found}</strong><small>Entscheidungen im Register</small></article>
      <article><span>Vorsortiert</span><strong>{counts.preSorted}</strong><small>mit Materialitätsstand</small></article>
      <article><span>Voll analysiert</span><strong>{counts.fullAnalyzed}</strong><small>freigegebene Rückblicke</small></article>
      <article><span>In Berechnung</span><strong>{counts.inCalculation}</strong><small>Fälle mit offenen Rechenrecords</small></article>
      <article><span>Daten fehlen</span><strong>{counts.dataGaps}</strong><small>sichtbar statt geschätzt</small></article>
      <article><span>Tasks offen</span><strong>{counts.openTasks}</strong><small>betroffene Fälle</small></article>
      <article><span>Nicht materiell</span><strong>{counts.notMaterial}</strong><small>mit begründeter Auswahlentscheidung</small></article>
      <article><span>Freigabereif</span><strong>{counts.readyForPublication}</strong><small>für Veröffentlichung</small></article>
      <article><span>Veröffentlicht</span><strong>{counts.published}</strong><small>vollständig nachvollziehbar</small></article>
    </section> : <section className="editorial-empty"><h2>Backfill noch nicht initialisiert</h2><p>Nach der Produktionsmigration erzeugt der Bootstrap-Import das Register ab dem 6. Mai 2025. Er veröffentlicht keine Fälle.</p></section>}
    <section className="editorial-empty"><h2>Arbeitsregel</h2><p>Alle Entscheidungen werden nach demselben Wirkungsrelevanzstandard erfasst. Einbringung, Partei, Regierungs- oder Oppositionsstatus sind keine Auswahlparameter. Die Kennzahlen sind Registerstände, keine Regierungsbewertung.</p></section>
  </div>;
}
