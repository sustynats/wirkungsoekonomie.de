import Link from "next/link";
import { redirect } from "next/navigation";
import { createHistoricalReviewBatchAction, importHistoricalReviewResultAction } from "@/app/redaktion/actions";
import { currentEditorialSession } from "@/lib/editorial/auth";
import { listHistoricalReviewBatches } from "@/lib/editorial/historical-review-pipeline";
import { historicalBackfillDashboard } from "@/lib/editorial/workbench";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${value}T12:00:00Z`));
}

export default async function HistoricalBackfillPage() {
  const session = await currentEditorialSession();
  if (!session) redirect("/redaktion/anmelden?next=/redaktion/historischer-aufbau");
  const [dashboard, batches] = await Promise.all([historicalBackfillDashboard(), listHistoricalReviewBatches()]);
  const counts = dashboard.counts;
  const importProgress = dashboard.importProgress;

  return <div className="editorial-shell container">
    <p className="breadcrumb"><Link href="/redaktion">Meine Aufgaben</Link><span aria-hidden="true">/</span><span>Historischer Aufbau</span></p>
    <header className="editorial-question-header">
      <p className="kicker">Intern · Decision Registry</p>
      <h1>Wirkungsbilanz der laufenden Regierungszeit</h1>
      <p>{dashboard.term ? <>Historischer WÖk-Backfill seit <strong>{formatDate(dashboard.term.historical_woek_backfill_start)}</strong>. Beginn der Wahlperiode: {formatDate(dashboard.term.legislative_term_start)}; Beginn der Regierungszeit: {formatDate(dashboard.term.government_term_start)}.</> : "Die Regierungszeit-Konfiguration wird nach der Migration geladen."}</p>
    </header>
    {importProgress ? <section className="editorial-empty" aria-label="Importfortschritt">
      <h2>Importfortschritt</h2>
      <p>{importProgress.activeJobs > 0 ? "Der historische DIP-Backfill läuft fortsetzbar." : importProgress.completedJobs > 0 ? "Der historische DIP-Backfill ist für seinen festgehaltenen Zeitraum vollständig." : "Der Bootstrap-Import wurde noch nicht gestartet."}</p>
      <p><strong>{importProgress.totalPages}</strong> Seiten verarbeitet · <strong>{importProgress.totalImported}</strong> importierte Positionen · <strong>{importProgress.failedJobs}</strong> fehlgeschlagene Jobs.</p>
      {importProgress.latestJob ? <p className="muted">Letzter Zeitraum: {formatDate(importProgress.latestJob.window_from)} bis {formatDate(importProgress.latestJob.window_to)} · Stand: {importProgress.latestJob.status}.</p> : null}
    </section> : null}
    {counts ? <section className="editorial-kpis editorial-kpis--three" aria-label="Backfill-Stand">
      <article><span>Gefunden</span><strong>{counts.found}</strong><small>Entscheidungen im Register</small></article>
      <article><span>Vorsortiert</span><strong>{counts.preSorted}</strong><small>mit Materialitätsstand</small></article>
      <article><span>Review-Pakete bereit</span><strong>{counts.reviewPackageReady}</strong><small>amtlich abgegrenzt</small></article>
      <article><span>Review ausstehend</span><strong>{counts.reviewAwaiting}</strong><small>bereits exportierte Pakete</small></article>
      <article><span>Review übernommen</span><strong>{counts.reviewImported}</strong><small>als Vorschlag und Tasks</small></article>
      <article><span>Voll analysiert</span><strong>{counts.fullAnalyzed}</strong><small>freigegebene Rückblicke</small></article>
      <article><span>In Berechnung</span><strong>{counts.inCalculation}</strong><small>Fälle mit offenen Rechenrecords</small></article>
      <article><span>Daten fehlen</span><strong>{counts.dataGaps}</strong><small>sichtbar statt geschätzt</small></article>
      <article><span>Tasks offen</span><strong>{counts.openTasks}</strong><small>betroffene Fälle</small></article>
      <article><span>Nicht materiell</span><strong>{counts.notMaterial}</strong><small>mit begründeter Auswahlentscheidung</small></article>
      <article><span>Freigabereif</span><strong>{counts.readyForPublication}</strong><small>für Veröffentlichung</small></article>
      <article><span>Veröffentlicht</span><strong>{counts.published}</strong><small>vollständig nachvollziehbar</small></article>
    </section> : <section className="editorial-empty"><h2>Backfill noch nicht initialisiert</h2><p>Nach der Produktionsmigration erzeugt der Bootstrap-Import das Register ab dem 6. Mai 2025. Er veröffentlicht keine Fälle.</p></section>}
    <section className="editorial-worklist" aria-labelledby="review-pipeline-title">
      <div className="section-heading"><div><p className="kicker">Interne Übergabestrecke</p><h2 id="review-pipeline-title">Historische WÖk-Reviews</h2></div><p>Nur vollständige, amtlich referenzierte Pakete werden exportiert.</p></div>
      <div className="editorial-empty">
        <h3>1. Review-Batch erstellen</h3>
        <p>Die Auswahl folgt Materialität, Quellenvollständigkeit und Erkenntniswert – nie Partei, Einbringung oder Mehrheitsverhältnissen. Unvollständige Fälle bleiben sichtbar, aber werden nicht fachlich vorbewertet.</p>
        <form action={createHistoricalReviewBatchAction} className="editorial-form">
          <label>Fälle pro Batch (1–15)<input name="requestedSize" type="number" min="1" max="15" defaultValue="10" required /></label>
          <button className="button button--primary" type="submit">Review-Batch erstellen</button>
        </form>
      </div>
      {batches.length ? <div className="editorial-task-list" role="list">{batches.map((batch) => <article key={batch.id} className="editorial-task-card" role="listitem">
        <div className="editorial-task-card__meta"><span className="editorial-priority editorial-priority--normal">{batch.status.replaceAll("_", " ")}</span></div>
        <h3>{batch.batch_key}</h3>
        <p>{batch.case_count} Fälle · {batch.cases_ready} exportbereit · {batch.cases_imported} Review(s) in die Aufgabenstrecke überführt.</p>
        <dl><div><dt>Referenzsnapshot</dt><dd>{batch.woek_reference_snapshot}</dd></div><div><dt>Exporte</dt><dd>{batch.export_count}</dd></div></dl>
        <form action={`/api/internal/editorial/historical-review/batches/${batch.id}/export`} method="post">
          <button className="button" type="submit">ZIP für ChatGPT herunterladen</button>
        </form>
      </article>)}</div> : <div className="editorial-empty"><h3>Noch kein Review-Batch</h3><p>Der Button wird erst einen Batch erzeugen, wenn der DIP-Bestand mindestens ein amtlich abgegrenztes Detailpaket enthält.</p></div>}
      {batches.length ? <div className="editorial-empty">
        <h3>2. Strukturierte Antwort übernehmen</h3>
        <p>Es wird ausschließlich eine einzelne <code>review-result.json</code> aus einem zuvor exportierten Batch akzeptiert. Der Import prüft Case-ID, Quellenreferenzen und Referenzsnapshot; er veröffentlicht nichts.</p>
        <form action={importHistoricalReviewResultAction} className="editorial-form">
          <label>Batch<select name="batchId" defaultValue="" required><option value="" disabled>Batch wählen</option>{batches.map((batch) => <option value={batch.id} key={batch.id}>{batch.batch_key}</option>)}</select></label>
          <label>review-result.json<input name="reviewResult" type="file" accept="application/json,.json" required /></label>
          <button className="button button--primary" type="submit">Review-Ergebnis prüfen und als Vorschlag anlegen</button>
        </form>
      </div> : null}
    </section>
    <section className="editorial-empty"><h2>Arbeitsregel</h2><p>Alle Entscheidungen werden nach demselben Wirkungsrelevanzstandard erfasst. Einbringung, Partei, Regierungs- oder Oppositionsstatus sind keine Auswahlparameter. Die Kennzahlen sind Registerstände, keine Regierungsbewertung.</p></section>
  </div>;
}
