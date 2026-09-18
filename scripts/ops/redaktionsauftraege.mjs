// Lesender Befund zu den eingereichten Redaktionsauftraegen.
//
// Natalie am 17.09.2026: "Ich meine dass ich eine Meinung&Analyse angestossen
// hatte vor ein paar Tagen zu Europa und Kanada. Die scheint nie live gegangen
// zu sein." Von aussen war das nicht beantwortbar: der Auftrag liegt in der
// privaten Warteschlange auf Oracle, und kein Bericht nannte je einen
// einzelnen Auftrag. Dieses Skript schliesst genau diese Luecke.
//
// Es schreibt nichts: kein put, kein observe, keine Freigabe, keine Aenderung
// an einem Auftrag. Und es gibt keinen Auftragstext aus - nur Kennung, Art,
// Zeit und Zustand. Die Laufprotokolle sind oeffentlich, die Auftraege nicht.
import { bridgeSession } from '../news/bridge/remote.mjs';
// Dieselbe Kennung wie im Worker, eine Definition (siehe observation-keys.mjs).
import { fehlerkennung } from '../news/bridge/observation-keys.mjs';
import { hash } from '../news/bridge/contract.mjs';
export { fehlerkennung };

const SKIP = new Set(['BRIDGE_RUN_LOCKED', 'BRIDGE_SLOT_ALREADY_COMPLETED', 'BRIDGE_REMOTE_CONFIG_REQUIRED', 'BRIDGE_OPERATION_BUSY']);

export function auftragsBefund(job, now) {
  const alter = (Date.parse(now) - Date.parse(job?.created_at || '')) / 3600000;
  return {
    job_id: String(job?.input?.job_id || '').slice(0, 64),
    art: String(job?.input?.request?.kind || job?.intake?.kind || job?.input?.job_type || 'unbekannt').slice(0, 40),
    erstellt: job?.created_at || null,
    stunden_alt: Number.isFinite(alter) ? Number(alter.toFixed(1)) : null,
    zustand: String(job?.status || 'unbekannt').slice(0, 40),
    angenommen: Boolean(job?.accepted),
    abgeschlossen: job?.completed_at || null,
    nachbesserungen: Number(job?.correction_count ?? job?.corrections?.length ?? 0),
    quittung: job?.ack?.status || null,
    fehler: String(job?.error || job?.publication_gate?.status || '').slice(0, 60) || null,
    // Herkunft: "mit Kommentar zurueckgegeben" erzeugt einen Kind-Auftrag, der
    // den alten Eintrag in der App vertritt. Scheitert er, bleibt der Eintrag
    // dort dauerhaft auf "zurueckgegeben" (18.09.2026).
    rueckgabe_von: String(job?.intake?.review_parent || '').slice(0, 64) || null,
    ausloeser: String(job?.intake?.trigger_type || '').slice(0, 40) || null,
    letzter_fehler: fehlerkennung(job?.last_error?.error_code),
    fehlversuche: Number(job?.attempts?.intake || 0) || 0,
  };
}

// Eine Meldung (Art news) geht nach dem Auftrag einen zweiten Weg: aus der
// Recherche wird ein eigener Meldungsauftrag, der analysiert, zweitgeprueft und
// erst dann in die Freigabeliste gestellt wird (intake-news.mjs). "Angenommen"
// heisst bei Meldungen daher nur: Recherche liegt vor. Wo sie danach steht,
// zeigt dieser Befund - wieder nur Zustaende, kein Text.
export function meldungsweg(job, meldung = null, nachrecherche = null) {
  const intake = job?.intake || {};
  const zustand = (wert) => String(wert || 'unbekannt').slice(0, 40);
  return {
    recherche: Boolean(intake.news_research),
    recherche_gestoppt: Boolean(intake.news_research_hold),
    nachrecherche: intake.news_repair_job_id ? (nachrecherche ? zustand(nachrecherche.status) : 'fehlt') : null,
    meldung: intake.news_job_id ? (meldung ? zustand(meldung.status) : 'fehlt') : null,
    meldung_quittung: meldung?.ack?.status ? zustand(meldung.ack.status) : null,
    meldung_bewertet: meldung ? Boolean(meldung.accepted?.record) : null,
    zweitpruefung: meldung ? (meldung.semantic_review?.assessment?.publication_status
      || meldung.accepted?.record?.impact_semantic_review?.status || null) : null,
    bereits_berichtet: Boolean(intake.covered_url),
    naechster_versuch: intake.news_retry_at || null,
  };
}

export async function redaktionsauftraege({ session = null, now = new Date().toISOString(), env = process.env } = {}) {
  const bridge = session || bridgeSession(env);
  const betrieb = await bridge.monitor();
  let acquired = false, auftraege = null, grund = null;
  // Eigener Spurplatz: der Zeitslot gehoert dem Ticker-Lauf, und nach dessen
  // Abschluss meldete der Befund am 18.09.2026 nur BRIDGE_SLOT_ALREADY_COMPLETED.
  try { await bridge.store.acquire(now, 'import', { manualRunId: `${env.GITHUB_RUN_ID || '0'}:${env.GITHUB_RUN_ATTEMPT || '1'}9` }); acquired = true; }
  catch (error) { if (!SKIP.has(error.message)) throw error; grund = error.message; }
  if (acquired) {
    try {
      const rows = await bridge.store.all();
      const alle = rows.filter((row) => row?.input?.job_type === 'editorial_request')
        .map((row) => auftragsBefund(row, now))
        .sort((a, b) => String(b.erstellt).localeCompare(String(a.erstellt)));
      // Interessant ist der offene Auftrag, nicht der neueste: ein
      // liegengebliebener ist per Definition alt. Die ersten 25 nach Datum
      // haetten den Fall verdeckt, den dieser Befund finden soll (der erste
      // Lauf am 17.09.2026 zeigte 25 Auftraege von heute und gestern, waehrend
      // vier offene aelter waren).
      // Offen zuerst, dann jede Ueberarbeitung (auch erledigte - nur so sieht
      // man, ob zu einer Rueckgabe je eine neue Fassung kam), dann die zehn
      // neuesten erledigten.
      const offen = alle.filter((befund) => befund.zustand !== 'accepted');
      const ueberarbeitungen = alle.filter((befund) => befund.zustand === 'accepted' && befund.rueckgabe_von);
      // Dazu jeder erledigte Auftrag der letzten 36 Stunden: am 18.09.2026
      // verdeckten zehn Hoerbesprechungen den Wunstorf-Auftrag vom Vormittag.
      const rest = alle.filter((befund, index, liste) => befund.zustand === 'accepted' && !befund.rueckgabe_von
        && (befund.stunden_alt <= 36 || liste.filter((b) => b.zustand === 'accepted' && !b.rueckgabe_von).indexOf(befund) < 10));
      auftraege = [...offen, ...ueberarbeitungen, ...rest].slice(0, 80);
      // Der entscheidende Zustand steht nicht im Auftrag, sondern im Vermerk
      // zum Versuch: provider_called ohne output_delivered heisst, der Auftrag
      // ist verbraucht und kehrt erst mit einer Vertragskorrektur zurueck.
      const nachKennung = new Map(rows.map((row) => [row?.input?.job_id, row]));
      // Archivierte Meldungsauftraege fehlen in store.all und kommen einzeln.
      const holen = async (id) => (id ? nachKennung.get(id) || await Promise.resolve(bridge.store.get?.(id)).catch(() => null) || null : null);
      for (const befund of auftraege) {
        const job = nachKennung.get(befund.job_id);
        if (job?.intake?.kind === 'news') {
          const meldung = await holen(job.intake.news_job_id);
          befund.meldungsweg = meldungsweg(job, meldung, await holen(job.intake.news_repair_job_id));
          // Derselbe Vermerk, den der Redaktionstisch beim Bereitstellen setzt
          // (intake-news.mjs, stageIntakeNews): erst dann steht die Meldung in
          // Natalies Freigabeliste. "Bewertet" allein heisst das noch nicht.
          const record = meldung?.accepted?.record;
          befund.meldungsweg.in_freigabeliste = record
            ? Boolean(await Promise.resolve(bridge.store.observation(`intake-news-staged:${job.input.job_id}:${hash(record)}`)).catch(() => null))
            : false;
        }
        const versuch = await bridge.store.observation(`github-attempt:${befund.job_id}`).catch?.(() => null);
        befund.versuch = versuch ? { zustand: String(versuch.status || '').slice(0, 40),
          bezahlter_aufruf: Boolean(versuch.provider_called), workerversion: String(versuch.version || '').slice(0, 40),
          verbraucht: Boolean(versuch.provider_called) && versuch.status !== 'output_delivered',
          grund: fehlerkennung(versuch.error) } : null;
      }
    } finally { await bridge.store.release(true).catch(() => {}); }
  }
  return { at: now, offen: betrieb?.open_count ?? null, offene_auftraege: betrieb?.open_personal_count ?? null,
    verbrauchte_auftraege: (auftraege || []).filter((befund) => befund.versuch?.verbraucht).length,
    aeltester_offener_auftrag_minuten: Math.round(betrieb?.oldest_open_minutes ?? 0),
    warteschlange_unlesbar: grund, auftraege };
}

if (process.argv[1] && process.argv[1].endsWith('redaktionsauftraege.mjs')) {
  try { console.log(JSON.stringify(await redaktionsauftraege(), null, 1)); }
  catch (error) {
    console.error(JSON.stringify({ status: 'failed', error: /^[A-Z_0-9:.-]+$/.test(error?.message || '') ? error.message : 'AUFTRAGSBEFUND_FEHLGESCHLAGEN' }));
    process.exitCode = 1;
  }
}
