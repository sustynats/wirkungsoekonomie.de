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

const SKIP = new Set(['BRIDGE_RUN_LOCKED', 'BRIDGE_SLOT_ALREADY_COMPLETED', 'BRIDGE_REMOTE_CONFIG_REQUIRED', 'BRIDGE_OPERATION_BUSY']);

// Der Grund steht im Vermerk, aber als Freitext: "CODE · Detail", und das
// Detail kann Bruchstuecke des Entwurfs enthalten. Die Laufprotokolle sind
// oeffentlich, also geht nur die Kennung hinaus - der Teil, der die Ursache
// benennt, ohne den Text zu zeigen.
export function fehlerkennung(wert) {
  const erster = String(wert || '').split('·')[0].trim();
  if (!erster) return null;
  return /^[A-Z][A-Z_0-9]{3,79}$/.test(erster) ? erster : 'nicht als Kennung lesbar';
}

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
  };
}

export async function redaktionsauftraege({ session = null, now = new Date().toISOString(), env = process.env } = {}) {
  const bridge = session || bridgeSession(env);
  const betrieb = await bridge.monitor();
  let acquired = false, auftraege = null, grund = null;
  try { await bridge.store.acquire(now, 'import'); acquired = true; }
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
      const offen = alle.filter((befund) => befund.zustand !== 'accepted');
      auftraege = [...offen, ...alle.filter((befund) => befund.zustand === 'accepted').slice(0, 10)].slice(0, 40);
      // Der entscheidende Zustand steht nicht im Auftrag, sondern im Vermerk
      // zum Versuch: provider_called ohne output_delivered heisst, der Auftrag
      // ist verbraucht und kehrt erst mit einer Vertragskorrektur zurueck.
      for (const befund of auftraege) {
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
