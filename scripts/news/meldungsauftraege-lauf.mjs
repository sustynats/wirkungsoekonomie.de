// Natalies Meldungsauftraege im Ticker-Lauf (Direktbetrieb).
//
// Aus einem Auftrag der Art "Meldung" macht der Redaktionstisch nach geprüfter
// Recherche einen Meldungsauftrag mit fertigem Kandidaten (intake-news.mjs).
// Bis 15.09.2026 analysierte ihn der Oracle-Prozessor; seit dem Direktbetrieb
// ist der abgeschaltet, und jeder Meldungsauftrag blieb in der Warteschlange
// liegen - Wunstorf am 18.09. ebenso wie zwei zurückgegebene Meldungen seit dem
// 12.09. Jetzt holt der Ticker-Lauf sie ab (meldungsauftraege.mjs holen),
// analysiert sie mit demselben einen Aufruf und demselben Gate wie jede Meldung,
// VOR allen anderen (Natalie am 17.09.: ihre eigenen Aufträge vor jedem Limit),
// und gibt das Ergebnis an den Redaktionstisch zurück (abgeben). Veröffentlicht
// wird nichts: die fertige Meldung erscheint in Natalies Freigabeliste.
//
// Dieses Modul ist der Teil, den run.mjs braucht - ohne Bridge, ohne Netz.
import fs from 'node:fs';
import path from 'node:path';

// Diese Gründe heißen: nicht analysiert, kein bezahlter Aufruf verbraucht. Der
// Auftrag bleibt in der Warteschlange und kommt im nächsten Lauf wieder dran.
export const WIEDERHOLBAR = new Set(['AI_BUDGET_BLOCKED', 'AI_RUN_TIME_LIMIT', 'AI_DISABLED', 'AI_HOURLY_CALL_LIMIT',
  'AI_PROVIDER_UNAVAILABLE', 'AI_BUDGET_OR_BATCH_LIMIT', 'AUFTRAG_NICHT_BEARBEITET']);

const kennung = (wert) => (/^[A-Z][A-Z_0-9:]{2,79}$/.test(String(wert || '')) ? String(wert) : 'UNBEKANNT');

export function ladeAuftraege(datei) {
  if (!datei || !fs.existsSync(datei)) return [];
  const inhalt = JSON.parse(fs.readFileSync(datei, 'utf8'));
  return (inhalt?.auftraege || [])
    .filter((auftrag) => auftrag?.job_id && auftrag.input_hash && auftrag.candidate?.story_id
      && Array.isArray(auftrag.candidate.sources) && auftrag.candidate.sources.length)
    .map((auftrag) => {
      const { existing_story: _nie, ...candidate } = structuredClone(auftrag.candidate);
      return { ...candidate, manual_order: { job_id: auftrag.job_id, input_hash: auftrag.input_hash } };
    });
}

// Die Aufträge gehen vor und nehmen die ersten Plätze ein; die Gesamtzahl der
// Aufrufe bleibt, wo sie war - außer es sind mehr Aufträge als Plätze, dann
// laufen trotzdem alle (vor jedem Limit). Das Geld begrenzt weiterhin die
// Schleife selbst. Eine reguläre Meldung zum selben Ereignis wartet diesen Lauf ab.
export function auftraegeVorziehen(selected, deferred, auftraege) {
  if (!auftraege.length) return { selected, deferred };
  const ids = new Set(auftraege.map((auftrag) => auftrag.story_id));
  const regulaer = selected.filter((candidate) => !ids.has(candidate.story_id));
  const platz = Math.max(0, selected.length - auftraege.length);
  return {
    selected: [...auftraege, ...regulaer.slice(0, platz)],
    deferred: [...regulaer.slice(platz), ...deferred.filter((candidate) => !ids.has(candidate.story_id))],
  };
}

// Nach der Analyseschleife: was die Schleife für einen Auftrag in den
// öffentlichen Bestand geschrieben hat, wird zurückgenommen und als Ergebnis
// für den Redaktionstisch gesammelt. Ein Auftrag erscheint nie direkt im Ticker.
export function auftragsErgebnisse(auftraege, { byId, vorher, changedStoryIds, report }) {
  const ergebnisse = [];
  for (const auftrag of auftraege) {
    const id = auftrag.story_id, danach = byId.get(id);
    if (vorher.has(id)) byId.set(id, vorher.get(id)); else byId.delete(id);
    changedStoryIds.delete(id);
    const neu = danach !== undefined && danach !== vorher.get(id);
    const bestanden = neu && danach.published === true && danach.analysis
      && danach.impact_semantic_review?.status === 'ready' && !danach.pending_reason;
    const basis = { job_id: auftrag.manual_order.job_id, input_hash: auftrag.manual_order.input_hash };
    if (bestanden) {
      report.published_stories = Math.max(0, Number(report.published_stories || 0) - 1);
      ergebnisse.push({ ...basis, status: 'bestanden', record: danach });
      continue;
    }
    const grund = neu ? kennung(danach.pending_reason) : 'AUFTRAG_NICHT_BEARBEITET';
    ergebnisse.push({ ...basis, status: WIEDERHOLBAR.has(grund) ? 'offen' : 'gescheitert', grund,
      fehler: (neu ? danach.quality_errors || [] : []).map(kennung).slice(0, 12) });
  }
  return ergebnisse;
}

export function zusammenfassung(ergebnisse) {
  const zahl = (status) => ergebnisse.filter((ergebnis) => ergebnis.status === status).length;
  return { analysiert: ergebnisse.length, bestanden: zahl('bestanden'), gescheitert: zahl('gescheitert'), offen: zahl('offen'),
    gruende: [...new Set(ergebnisse.filter((ergebnis) => ergebnis.grund).map((ergebnis) => ergebnis.grund))] };
}

export function schreibeErgebnisse(datei, ergebnisse, now) {
  if (!datei) return;
  fs.mkdirSync(path.dirname(datei), { recursive: true });
  fs.writeFileSync(datei, `${JSON.stringify({ at: now, ergebnisse })}\n`);
}
