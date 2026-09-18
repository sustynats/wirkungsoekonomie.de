// Holen und Abgeben der Meldungsauftraege rund um den Ticker-Lauf.
//
//   node scripts/news/meldungsauftraege.mjs holen    (vor der Analyse)
//   node scripts/news/meldungsauftraege.mjs abgeben  (nach der Analyse)
//
// Warum es das gibt, steht in meldungsauftraege-lauf.mjs. Die Datei zwischen
// beiden Schritten liegt im Runner-Temp, nie im Repository: sie traegt Quellen-
// auszuege und die fertige, noch nicht freigegebene Meldung. Die Laufprotokolle
// sind oeffentlich, daher gibt dieses Skript nur Kennungen, Zahlen und Codes aus.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bridgeSession } from './bridge/remote.mjs';
import { acquireLane } from './bridge/acquire-lane.mjs';
import { hash } from './bridge/contract.mjs';

// Der Ticker-Lauf wartet hoechstens eine Minute auf die Spur, dann ohne Auftraege weiter.
export const LANE_WAIT = { retries: 6, waitMs: 10000 };
const SKIP = new Set(['BRIDGE_NOT_CONFIGURED', 'BRIDGE_LANE_BUSY', 'BRIDGE_UNREACHABLE', 'BRIDGE_REMOTE_CONFIG_REQUIRED']);
const NEWS_TYPES = new Set(['new_story', 'story_update', 'correction']);
// Ein Auftrag ist eine Meldung von heute. Aelter als 36 Stunden wird er nicht
// mehr als Neuigkeit analysiert, sondern bleibt stehen und wird gezaehlt.
export const MAX_ALTER_STUNDEN = 36;
export const JE_LAUF = 3;
// Dreimal nicht drangekommen (Budget, Zeit, Anbieter): dann sichtbar blockiert
// statt endlos wartend.
export const MAX_VERSUCHE = 3;

const stundenAlt = (job, now) => (Date.parse(now) - Date.parse(job?.queued_at || job?.created_at || '')) / 3600000;

export function wartendeMeldungsauftraege(rows, now) {
  const wartend = rows.filter((job) => NEWS_TYPES.has(job?.input?.job_type) && job.intake_news_parent
    && job.status === 'queued' && !job.input.test_only && job.candidate?.story_id);
  const frisch = wartend.filter((job) => stundenAlt(job, now) <= MAX_ALTER_STUNDEN)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return { frisch, zu_alt: wartend.length - frisch.length };
}

async function spur(store, env, suffix, laneWait) {
  await acquireLane(() => store.acquire(new Date().toISOString(), 'import',
    { manualRunId: `${env.GITHUB_RUN_ID || '0'}:${env.GITHUB_RUN_ATTEMPT || '1'}${suffix}` }), { ...LANE_WAIT, ...(laneWait || {}) });
}

export async function holen({ session = null, env = process.env, datei = env.WOEK_NEWS_ORDER_FILE, now = new Date().toISOString(), laneWait = null } = {}) {
  if (!datei) throw Error('MELDUNGSAUFTRAG_DATEI_FEHLT');
  let store;
  try { ({ store } = session || bridgeSession(env)); }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  try { await spur(store, env, '7', laneWait); }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  try {
    const { frisch, zu_alt } = wartendeMeldungsauftraege(await store.all(), now);
    const auftraege = frisch.slice(0, JE_LAUF).map((job) => ({ job_id: job.input.job_id, input_hash: job.input.input_hash, candidate: job.candidate }));
    fs.mkdirSync(path.dirname(datei), { recursive: true });
    fs.writeFileSync(datei, `${JSON.stringify({ at: now, auftraege })}\n`);
    return { status: 'ok', geholt: auftraege.length, weitere: Math.max(0, frisch.length - auftraege.length), zu_alt,
      auftraege: auftraege.map((auftrag) => auftrag.job_id) };
  } finally { await store.release(true).catch(() => {}); }
}

// Dieselbe Vorschau, die der Redaktionstisch daraus baut (intake-news.mjs,
// stageIntakeNews). Scheitert sie, soll das hier sichtbar werden - nicht auf
// dem Tisch, wo eine ungueltige Vorschau jede weitere Bereitstellung aufhielte.
export function freigabeVorschau(record) {
  return { format: 'news', title: record.title, subtitle: record.analysis?.summary, markdown: record.source_summary,
    sources: (record.sources || []).map((source) => ({ url: source.url, title: source.title, publisher: source.publisher })),
    news_record: record, author_notes: '', checks: { source_binding: true, editorial_validation: true, personal_experiences_invented: false } };
}

async function vorschauFehler(record) {
  const { validateEditorialPreview } = await import('./bridge/editorial-approval.mjs');
  try { validateEditorialPreview(freigabeVorschau(record)); return null; }
  catch (error) { return /^[A-Z_]+$/.test(error.message) ? error.message : 'EDITORIAL_PREVIEW_INVALID'; }
}

export async function abgeben({ session = null, env = process.env, datei = env.WOEK_NEWS_ORDER_RESULT_FILE, now = new Date().toISOString(), laneWait = null, pruefeVorschau = vorschauFehler } = {}) {
  if (!datei || !fs.existsSync(datei)) return { status: 'nichts_abzugeben' };
  const { ergebnisse = [] } = JSON.parse(fs.readFileSync(datei, 'utf8'));
  if (!ergebnisse.length) return { status: 'nichts_abzugeben' };
  let store;
  try { ({ store } = session || bridgeSession(env)); }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  try { await spur(store, env, '8', laneWait); }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  const bericht = [];
  try {
    for (const ergebnis of ergebnisse) {
      const job = await store.get(ergebnis.job_id);
      // Nur der Stand, der analysiert wurde, bekommt das Ergebnis.
      if (!job || job.status !== 'queued' || job.input?.input_hash !== ergebnis.input_hash) {
        bericht.push({ job_id: ergebnis.job_id, status: 'uebersprungen', grund: 'AUFTRAG_VERAENDERT' });
        continue;
      }
      let status = ergebnis.status, grund = ergebnis.grund || null;
      if (status === 'bestanden') {
        const fehler = await pruefeVorschau(ergebnis.record);
        if (fehler) { status = 'gescheitert'; grund = fehler; }
      }
      if (status === 'bestanden') {
        job.accepted = { job_id: job.input.job_id, story_id: ergebnis.record.story_id, decision: 'publish', record: ergebnis.record,
          staged: false, output_hash: hash(ergebnis.record), accepted_at: now, transport: 'direct-single-call' };
        job.status = 'accepted'; job.accepted_at = now; delete job.last_error;
      } else if (status === 'offen') {
        const versuche = Number(job.attempts?.direct || 0) + 1;
        job.attempts = { ...(job.attempts || {}), direct: versuche };
        job.last_error = { stage: 'direct_news', error_code: grund, retryable: versuche < MAX_VERSUCHE, failed_at: now };
        if (versuche >= MAX_VERSUCHE) status = 'gescheitert';
      }
      if (status === 'gescheitert') {
        job.status = 'quarantined';
        job.last_error = { stage: 'direct_news', error_code: grund, retryable: false, failed_at: now, issues: ergebnis.fehler || [] };
      }
      await store.put(job);
      bericht.push({ job_id: ergebnis.job_id, status, grund });
    }
  } finally { await store.release(true).catch(() => {}); }
  return { status: 'ok', bericht };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const schritt = process.argv[2];
  try {
    if (!['holen', 'abgeben'].includes(schritt)) throw Error('MELDUNGSAUFTRAG_SCHRITT_UNBEKANNT');
    console.log(JSON.stringify(schritt === 'holen' ? await holen() : await abgeben()));
  } catch (error) {
    console.error(JSON.stringify({ status: 'failed', schritt, error: /^[A-Z_0-9:.-]+$/.test(error?.message || '') ? error.message : 'MELDUNGSAUFTRAG_FEHLGESCHLAGEN' }));
    process.exitCode = 1;
  }
}
