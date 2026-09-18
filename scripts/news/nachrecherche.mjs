// Nachrecherche einer zurückgegebenen Fassung.
//
// Natalie am 18.09.2026 zu zwei angehaltenen Überarbeitungen: „Da muss man
// einfach nochmal recherchieren" und „auch hier nochmal recherchieren. Da findet
// sich was und dann live". Beide waren am selben Punkt stehen geblieben: der
// Worker konnte Belege nicht lesen (Reuters 401, Screenshots als JPEG) und hielt
// die Überarbeitung an, statt selbst zu suchen.
//
// Eine Nachlieferung wäre hier der falsche Weg: sie trägt Natalies Kommentare
// aus der Rückgabe nicht mit, und bei einer Korrekturfassung eines
// veröffentlichten Beitrags entstünde ein zweiter Artikel. Deshalb wird die
// Überarbeitung selbst erneut eingereiht - mit allem, was sie hatte
// (Kommentare, bisherige Fassung, bei Korrekturfassungen Ziel und Grundlage),
// dazu frei lesbare Quellen und der Auftrag zur Nachrecherche. Das Ergebnis
// landet in derselben Freigabe-Karte; veröffentlicht wird nur durch Natalie.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bridgeSession } from './bridge/remote.mjs';
import { acquireLane } from './bridge/acquire-lane.mjs';
import { bridgePath, hash, JOB_ID } from './bridge/contract.mjs';

export const RESEARCH_ACTOR = 'github-nachrecherche';
export const LANE_WAIT = { retries: 20, waitMs: 30000 };
export const RESEARCH_NOTE = 'Nachrecherche: Belege, die bisher nicht lesbar waren, selbst prüfen - zuerst die mitgelieferten frei lesbaren Quellen, dann eigene Suche. Nicht lesbare Belege durch gleichwertige, frei lesbare ersetzen oder die Aussage an ihnen bestätigen; nur Unbelegbares abschwächen oder streichen. Der Beitrag spricht nie über seine Entstehung.';
const SKIP = new Set(['BRIDGE_NOT_CONFIGURED', 'BRIDGE_LANE_BUSY', 'BRIDGE_UNREACHABLE']);

// Die jüngste Überarbeitung trägt die Rückgabe (Kommentare, bisherige Fassung).
// Gibt es noch keine, ist der ursprüngliche Auftrag die Grundlage. Eine frühere
// Nachrecherche ist nie Grundlage: so ergibt derselbe Anstoß dieselbe Kennung.
export function grundlage(rows, reviewId) {
  const kinder = rows.filter((row) => row?.input?.job_type === 'editorial_request' && row.intake?.review_parent === reviewId
    && !row.intake?.research_parent && !row.intake?.manual_research)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return kinder[0] || rows.find((row) => row?.input?.job_id === reviewId) || null;
}

export function nachrechercheJob(reviewId, base, { links = [], hinweis = '', at }) {
  if (!JOB_ID.test(reviewId || '')) throw new Error('NACHRECHERCHE_ZIEL_UNGUELTIG');
  if (!base?.input?.request) throw new Error('NACHRECHERCHE_GRUNDLAGE_FEHLT');
  const neu = [...new Set(links.map((url) => String(url || '').trim()).filter((url) => /^https:\/\//.test(url)))];
  if (!neu.length) throw new Error('NACHRECHERCHE_LINKS_FEHLEN');
  const alt = (base.input.request.links || []).filter((url) => !neu.includes(url));
  // Die neuen Quellen zuerst: der Worker liest die ersten sechs als Auszug. Eine
  // bisherige bleibt dabei, denn die Ablage verlangt, dass die Fassung an einen
  // Auftragslink gebunden bleibt (EDITORIAL_PREVIEW_EVENT_UNBOUND).
  const request = { ...base.input.request, links: [...neu.slice(0, alt.length ? 5 : 6), ...alt].slice(0, 6),
    brief: `${String(base.input.request.brief || '').trim()}\n\n${RESEARCH_NOTE}${hinweis ? ` ${String(hinweis).trim()}` : ''}`.slice(0, 2000) };
  const input_hash = hash(request);
  const job_id = `${reviewId.slice(0, 20)}${hash({ type: 'nachrecherche', review: reviewId, input_hash }).slice(0, 24)}`;
  if (!JOB_ID.test(job_id)) throw new Error('NACHRECHERCHE_KENNUNG_UNGUELTIG');
  const input = { ...base.input, job_id, created_at: at, input_hash, request };
  // trigger_type bleibt, wie er war: eine Korrekturfassung bleibt als solche
  // erkennbar (einordnung.mjs sperrt damit Doppelfassungen). Den Vorrang vor
  // automatischen Vorschlägen trägt manual_research (redaktionsworker.mjs).
  // Der Stand der alten Überarbeitung (Halt, Recherchezustand) gehört nicht
  // zum neuen Auftrag - sonst stünde er in der App sofort wieder als angehalten.
  const { editorial_hold: _halt, news_research: _r, news_research_hold: _rh, news_job_id: _n, news_repair_job_id: _nr, news_retry_at: _nt,
    source_errors: _se, news_source_checked_at: _sc, source_provenance: _sp, news_shared: _ns, covered_url: _cu, research_parent: _rp, ...uebernommen } = base.intake || {};
  const intake = { ...uebernommen, review_parent: reviewId, manual_research: true, triggered_at: at, triggered_by: RESEARCH_ACTOR };
  return { input, candidate: base.candidate, status: 'queued', created_at: at, queued_at: at, attempts: {}, intake };
}

export async function nachrecherche({ session = null, env = process.env, now = () => new Date().toISOString(), laneWait = null } = {}) {
  const reviewId = String(env.WOEK_RESEARCH_REVIEW || '').trim();
  const links = String(env.WOEK_RESEARCH_LINKS || '').split(/[\s,]+/).filter(Boolean);
  const hinweis = String(env.WOEK_RESEARCH_NOTE || '').replace(/\s+/g, ' ').trim().slice(0, 600);
  let store, transport;
  try { ({ store, transport } = session || bridgeSession(env)); }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  let acquired = false;
  try { await acquireLane(() => store.acquire(now(), 'import', { manualRunId: `${env.GITHUB_RUN_ID || '0'}:${env.GITHUB_RUN_ATTEMPT || '1'}4` }), { ...LANE_WAIT, ...(laneWait || {}) }); acquired = true; }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  try {
    const rows = await store.all();
    const base = grundlage(rows, reviewId);
    if (!base) throw new Error('NACHRECHERCHE_GRUNDLAGE_FEHLT');
    const vollstaendig = await store.get(base.input.job_id);
    const job = nachrechercheJob(reviewId, vollstaendig || base, { links, hinweis, at: now() });
    if (await store.get(job.input.job_id)) return { status: 'already_queued', job_id: job.input.job_id };
    // Erst das Paket, dann der Eintrag: der Worker liest das Paket aus dem Postfach.
    const inbox = bridgePath('00_INBOX', `${job.input.job_id}.input.json`);
    await transport.writeAtomic(inbox, job.input);
    if (hash(JSON.parse(await transport.read(inbox))) !== hash(job.input)) throw new Error('NACHRECHERCHE_PAKET_NICHT_LESBAR');
    await store.put(job);
    return { status: 'queued', job_id: job.input.job_id, grundlage: base.input.job_id, links: job.input.request.links.length,
      korrekturfassung: Boolean(job.intake.revision_target) };
  } finally { if (acquired) await store.release(true).catch(() => {}); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await nachrecherche())); }
  catch (error) {
    console.error(JSON.stringify({ status: 'failed', error: /^[A-Z_0-9:.-]+$/.test(error?.message || '') ? error.message : 'NACHRECHERCHE_FEHLGESCHLAGEN' }));
    process.exitCode = 1;
  }
}
