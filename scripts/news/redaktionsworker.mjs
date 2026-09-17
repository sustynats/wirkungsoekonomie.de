// Redaktionsworker (Direktbetrieb, seit 15.09.2026): übernimmt die Rolle der
// früheren ChatGPT-Worker für die private Redaktion (Meinung & Analyse,
// Nachgehört, Nachgesehen, Buch & Wirkung), ohne Serverzugang. Er liest offene
// Redaktionsaufträge über die vorhandene authentifizierte Oracle-Schnittstelle,
// macht je Auftrag genau einen bezahlten OpenAI-Aufruf mit dem unveränderten
// Redaktionsvertrag, prüft die Ausgabe mit den bestehenden Regeln und legt sie
// als Entwurf ab. Die Redaktionsapp holt den Entwurf ab und legt ihn Natalie
// zur Freigabe oder Rückgabe vor. Nichts wird direkt veröffentlicht.
import path from 'node:path';
import { withoutProcessNotes } from './editorial-markdown.mjs';
import { officialShowName } from './show-identity.mjs';
import { EDITORIAL_HOUR_KEY, EDITORIAL_WAITING_KEY, editorialDraftsInWindow, noteEditorialDraft, tickerStoriesInWindow, sharedHourlyRoom, configuredHourlyQuota, waitingRecord } from './stundenkontingent.mjs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bridgeSession } from './bridge/remote.mjs';
import { bridgePath, hash, JOB_ID } from './bridge/contract.mjs';
import { supplementTarget, supplementContext, supersededBySupplement, withSupplement } from './editorial-supplement.mjs';
import { prepareApiJob, validateApiOutput } from './bridge/api-processor.mjs';
import { editorialKnowledge } from './bridge/editorial-knowledge.mjs';
import { OPENAI_RESPONSES_URL, finalOutputText, decodeUsage, newsModel } from './openai-transport.mjs';
import { extractJsonObject, extractArticleText } from './lib.mjs';
import { acquireLane } from './bridge/acquire-lane.mjs';
import { isIP } from 'node:net';
import { modelRates } from './budget.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const WORKER_ACTOR = 'github_direct_worker';
export const WORKER_VERSION = 'redaktionsworker-6';
// The three steps of one worker run (candidates, episodes, drafts) each acquire the
// import lane; a shared manual run id would mark the slot completed after the first
// step (23:35 UTC: BRIDGE_SLOT_ALREADY_COMPLETED skipped the drafts). The step digit
// keeps the id in the required digits:digits form.
const SKIP = new Set(['BRIDGE_RUN_LOCKED', 'BRIDGE_SLOT_ALREADY_COMPLETED', 'BRIDGE_REMOTE_CONFIG_REQUIRED']);
const PAID_STATUS = new Set(['output_delivered', 'validation_failed', 'output_unusable']);
const isoDay = (value) => String(value).slice(0, 10);

// Natalie am 17.09.2026: „manuell von mir eingereichte Meinungen und Analyse und
// Nachrichten müssen auf jeden Fall verarbeitet werden. Also egal, was das
// Budget sagt oder die Grenze pro Stunde." Ein Auftrag, den sie selbst gestellt
// hat, traegt eine draft_id (aus der App) oder einen ausdruecklichen
// Ausloesertyp. Automatische Vorschlaege tragen beides nicht.
export const manualRequest = (row) => Boolean(row?.intake?.draft_id)
  || /^manual/.test(String(row?.intake?.trigger_type || ''));

export function selectEditorialRequests(rows, { limit = 2, excluded = new Set() } = {}) {
  return rows.filter((row) => row?.input?.job_type === 'editorial_request' && row.status === 'queued'
      && JOB_ID.test(row.input.job_id || '') && !row.ack && !row.accepted && !excluded.has(row.input.job_id))
    // Ihre eigenen Auftraege zuerst, danach nach Alter.
    .sort((a, b) => (manualRequest(b) ? 1 : 0) - (manualRequest(a) ? 1 : 0)
      || String(a.created_at || '').localeCompare(String(b.created_at || '')))
    .slice(0, Math.max(0, limit));
}

// Exactly one paid model call with the unchanged editorial contract. The
// server-bound fields (job_id, input_hash, schema_version, processed_at) are
// set by software, never trusted from the model.
// The editorial profile was written for a worker without tools and tells the
// model to HOLD whenever a linked source could not be read. The first live
// requests therefore all came back as SOURCE_VERIFICATION_REQUIRED. The GitHub
// worker gives the model a bounded hosted web search so it can actually read
// the sources named in the request; the profile sentence is swapped for the
// tool rule, everything else in the contract stays untouched.
export const NO_TOOLS_SENTENCE = 'Du hast in diesem Aufruf keine Browser-, Such-, Bild- oder Dateitools. Verwende als Tatsachenbelege nur tatsächlich mitgelieferte Textauszüge.';
export const webSearchRule = (maxSearches) => [
  `In diesem Aufruf steht ausschließlich ein begrenztes Web-Suchtool zur Verfügung (höchstens ${maxSearches} Zugriffe).`,
  'Als Tatsachenbelege gelten mitgelieferte Textauszüge (unter origin.source_excerpts liegen die tatsächlich abgerufenen Texte der verlinkten Quellen, unter origin.transcript ein offizielles Transkript) und tatsächlich über das Tool gelesene Belege; jede gelesene Quelle mit URL in sources nennen.',
  // The first run with excerpts (04:50 UTC on 16.09.) held for missing
  // mechanism sources without using the tool once. Searching is the cheaper
  // and more useful step than returning the request unanswered.
  `Fehlen Dir tragende Tatsachen oder Mechanismusbelege für die verlangte Einordnung, dann suche genau danach, bevor Du einen HOLD ausgibst. Ein HOLD wegen fehlender Belege ist nur zulässig, nachdem Du das Suchwerkzeug dafür genutzt hast und es keine belastbaren Quellen ergeben hat; nenne dann in hold.reason die durchgeführten Suchen. Ohne Suchbedarf ist kein Zugriff nötig.`,
  'Keine Bezahlschranke umgehen, keine Bilder oder Dateien erzeugen. Die Antwort ist genau ein JSON-Objekt als reiner Text: kein Markdown-Zaun, kein Kommentar davor oder danach.',
].join(' ');
export function researchInstructions(instructions, maxSearches) {
  const rule = webSearchRule(maxSearches);
  return instructions.includes(NO_TOOLS_SENTENCE) ? instructions.replace(NO_TOOLS_SENTENCE, rule) : `${rule}\n${instructions}`;
}
// OpenAI bills hosted web search per call in addition to the tokens it adds.
export const WEB_SEARCH_USD_PER_CALL = 0.01;

// The news run holds the import lane for its whole duration and both workflows
// start on the same Oracle push; instead of losing the cycle, an editorial step
// waits for the lane (at most ten minutes).
export const LANE_WAIT = { retries: 20, waitMs: 30000 };

// The linked articles are fetched once and travel as text excerpts inside the
// request packet (origin.source_excerpts). The profile accepts only supplied
// excerpts as facts; the hosted search tool did not read the links reliably
// (night of 16.09.: every draft came back SOURCE_VERIFICATION_REQUIRED).
export const EXCERPT_MAX_CHARS = 7000, EXCERPT_MAX_LINKS = 6;
const privateHost = (host) => /^(localhost|.*\.local|.*\.internal)$/i.test(host) || (isIP(host) && /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|fe80)/i.test(host));
export async function fetchLinkExcerpt(url, fetchImpl = fetch, timeoutMs = 15000) {
  let parsed; try { parsed = new URL(url); } catch { return null; }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || privateHost(parsed.hostname)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, redirect: 'follow', headers: { Accept: 'text/html, application/xhtml+xml;q=0.9, text/plain;q=0.7, text/vtt;q=0.7', 'User-Agent': 'Mozilla/5.0 (Wirkungsticker Redaktionsworker)' } });
    if (!response.ok) return { url, status: response.status, excerpt: null };
    const type = String(response.headers?.get?.('content-type') || '');
    if (!/html|xml|text\/plain|text\/vtt/i.test(type)) return { url, status: response.status, excerpt: null, content_type: type.slice(0, 60) };
    const body = await response.text();
    const excerpt = /html|xml/i.test(type) ? extractArticleText(body, EXCERPT_MAX_CHARS) : body.replace(/\s+/g, ' ').trim().slice(0, EXCERPT_MAX_CHARS);
    const title = (body.match(/<title[^>]*>([^<]{3,200})<\/title>/i) || [])[1]?.replace(/\s+/g, ' ').trim() || null;
    return { url, status: response.status, title, excerpt: excerpt.length >= 120 ? excerpt : null, chars: excerpt.length };
  } catch (error) { return { url, status: 0, excerpt: null, error: String(error?.name || error).slice(0, 40) }; }
  finally { clearTimeout(timer); }
}
export async function collectSourceExcerpts(links = [], fetchImpl = fetch) {
  const results = [];
  for (const url of [...new Set(links.filter((u) => typeof u === 'string'))].slice(0, EXCERPT_MAX_LINKS)) {
    const result = await fetchLinkExcerpt(url, fetchImpl);
    if (result) results.push(result);
  }
  return results;
}

// The hosted search tool has changed names and parameters over time; a 400
// on the first variant is retried once with the older spelling and without
// optional parameters. Nothing is generated by a rejected request, so this is
// not a paid attempt. The provider's error text is kept (sanitized) so a run
// log explains a rejection instead of only showing the status code.
export const WEB_SEARCH_VARIANTS = [
  (maxSearches) => ({ tools: [{ type: 'web_search' }], tool_choice: 'auto', max_tool_calls: maxSearches }),
  () => ({ tools: [{ type: 'web_search_preview' }], tool_choice: 'auto' }),
];
const providerDetail = (payload) => String(payload?.error?.message || payload?.error?.code || '').replace(/sk-[A-Za-z0-9_-]+/g, '***').replace(/\s+/g, ' ').slice(0, 200);

export async function draftEditorialOutput(request, { apiKey = process.env.OPENAI_API_KEY, model = newsModel(), fetchImpl = fetch, reasoningEffort = process.env.WOEK_EDITORIAL_REASONING_EFFORT || 'medium', maxOutputTokens = 48000, timeoutMs = 300000,
  webSearch = process.env.WOEK_EDITORIAL_WEB_SEARCH !== 'false', maxSearches = Math.max(1, Math.min(10, Number(process.env.WOEK_EDITORIAL_MAX_SEARCHES) || 5)) } = {}) {
  if (!apiKey) throw Object.assign(new Error('OPENAI_API_KEY_MISSING'), { providerNotCalled: true });
  const variants = webSearch ? WEB_SEARCH_VARIANTS.map((variant) => variant(maxSearches)) : [{}];
  let response, payload, variant = 0;
  for (; variant < variants.length; variant += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      response = await fetchImpl(OPENAI_RESPONSES_URL, { method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        // "Web Search cannot be used with JSON mode" (provider, 16.09.): with the
        // search tool the answer is plain text that must be a single JSON object;
        // the profile demands exactly that and the parse below tolerates a fence.
        body: JSON.stringify({ model, store: false, reasoning: { effort: reasoningEffort }, max_output_tokens: maxOutputTokens,
          instructions: webSearch ? researchInstructions(request.instructions, maxSearches) : request.instructions, input: request.prompt,
          ...(webSearch ? {} : { text: { format: { type: 'json_object' } } }),
          ...variants[variant] }) });
      payload = await response.json().catch(() => null);
    } finally { clearTimeout(timer); }
    if (response.status !== 400 || !webSearch) break;
  }
  // A rejected request (4xx) produced nothing and is not billed; only a
  // completed generation counts as the one paid attempt of a request.
  if (!response.ok) throw Object.assign(new Error(`AI_PROVIDER_ERROR:${response.status}`), { providerNotCalled: response.status >= 400 && response.status < 500, detail: providerDetail(payload) });
  const usage = decodeUsage(payload);
  const reportedModel = typeof payload?.model === 'string' && payload.model ? payload.model : model;
  const rates = modelRates(reportedModel);
  const webSearches = (payload?.output || []).filter((item) => item?.type === 'web_search_call').length;
  const cost = usage ? Number((((usage.input_tokens - (usage.cached_input_tokens || 0)) * rates.inputUsdPerMillion + (usage.cached_input_tokens || 0) * rates.cachedInputUsdPerMillion + usage.output_tokens * rates.outputUsdPerMillion) / 1e6 + webSearches * WEB_SEARCH_USD_PER_CALL).toFixed(6)) : null;
  const text = finalOutputText(payload);
  if (!text) throw Object.assign(new Error('AI_PROVIDER_OUTPUT_INVALID'), { usage, model: reportedModel, cost, incomplete: payload?.incomplete_details?.reason || null });
  let parsed;
  try { parsed = extractJsonObject(text); } catch { throw Object.assign(new Error('AI_MALFORMED_JSON'), { usage, model: reportedModel, cost }); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw Object.assign(new Error('AI_MALFORMED_JSON'), { usage, model: reportedModel, cost });
  return { output: parsed, usage, model: reportedModel, cost, answer: text, web_searches: webSearches, web_search_variant: webSearch ? Math.min(variant, variants.length - 1) : null };
}

// Claims left behind by the decommissioned ChatGPT workers (bridge era, until
// 15.09.2026) keep their request in 10_CLAIMED forever while the store row
// stays queued. Such a claim can never be delivered by its owner any more; after
// the stale window the GitHub worker adopts it instead of skipping the request
// on every run. A recent claim is still respected.
// Die Liste des Servers trägt nur Kennung und Status, nicht den Auftragstext.
// Die Bindung der Nachlieferung steht im Text, also wird sie an den vollständig
// geladenen Aufträgen der Auswahl gelesen.
export async function supersededCandidates(session, rows) {
  const loaded = [];
  for (const row of rows) {
    const job = await session.store.get(row.input.job_id).catch(() => null);
    if (job) loaded.push({ input: { job_type: 'editorial_request', job_id: row.input.job_id, request: job.input?.request } });
  }
  return supersededBySupplement(loaded);
}

export const STALE_CLAIM_HOURS = 6;
// Formales gleicht die Software an, nicht die Redaktion. Ein fertiger Entwurf
// darf nicht an einer Darstellungsregel verloren gehen (16.09.: ein Text begann
// mit einer eigenen Hauptüberschrift und wurde deshalb verworfen, obwohl Inhalt,
// Quellen und Prüfvermerke vollständig waren). Angeglichen wird ausschließlich
// Mechanisches: Überschriftenebene, bekannte Schlüsselnamen, ein aus der URL
// ablesbarer Verlagsname. Inhalt, Aussagen, Prüfvermerke und Quellen bleiben
// unangetastet; jede Angleichung wird protokolliert.
const HOST_PUBLISHER = { 'apnews.com': 'The Associated Press', 'www.theguardian.com': 'The Guardian', 'www.zdf.de': 'ZDF', 'www.tagesschau.de': 'tagesschau / ARD', 'www.abc.net.au': 'ABC News' };
export const MEDIA_ALIASES = { episode: 'episode_title', episode_name: 'episode_title', title: 'episode_title',
  published_at: 'original_release_date', release_date: 'original_release_date', date: 'original_release_date', air_date: 'original_release_date',
  url: 'original_url', page: 'original_url', original_page: 'original_url', episode_url: 'original_url', show_name: 'show' };

export function normalizeEditorialPreview(preview, { links = [], repairs = [] } = {}) {
  if (!preview || typeof preview !== 'object') return preview;
  if (typeof preview.markdown === 'string') {
    const title = String(preview.title || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const lines = preview.markdown.replace(/^\uFEFF/, '').split('\n');
    const kept = [];
    for (const line of lines) {
      const heading = /^#\s+(.*)$/.exec(line);
      if (!heading) { kept.push(line); continue; }
      const text = heading[1].replace(/\s+/g, ' ').trim();
      // Eine Hauptüberschrift, die den Titel wiederholt, ist überflüssig; jede
      // andere wird zur Abschnittsüberschrift, weil der Titel getrennt steht.
      if (text.toLowerCase() === title) { repairs.push('markdown:doppelter Titel entfernt'); continue; }
      repairs.push('markdown:Hauptüberschrift zur Abschnittsebene');
      kept.push(`## ${text}`);
    }
    const stripped = [];
    const next = withoutProcessNotes(kept.join('\n').replace(/^\n+/, '').replace(/\s+$/, ''), { removed: stripped });
    for (const note of stripped) repairs.push(`markdown:Freigabevermerk entfernt (${note.slice(0, 60)})`);
    if (next !== preview.markdown) preview.markdown = next;
    // Eine Korrekturfassung muss ihren Patch mitführen: die Ablage verlangt
    // patch.body_markdown === preview.markdown, sonst verwirft sie den Entwurf.
    const patch = preview.editorial_revision?.patch;
    if (patch && typeof patch.body_markdown === 'string' && patch.body_markdown !== preview.markdown) patch.body_markdown = preview.markdown;
  }
  for (const source of Array.isArray(preview.sources) ? preview.sources : []) {
    if (!source || typeof source !== 'object') continue;
    if (!String(source.publisher || '').trim() && /^https:\/\//.test(source.url || '')) {
      try {
        const host = new URL(source.url).hostname;
        source.publisher = HOST_PUBLISHER[host] || host.replace(/^www\./, '');
        repairs.push(`sources:publisher aus der Adresse (${source.publisher})`);
      } catch { /* ungültige Adresse bleibt für die Prüfung */ }
    }
  }
  const media = preview.source_media;
  if (media && typeof media === 'object' && ['listened', 'watched'].includes(preview.format)) {
    for (const [alias, key] of Object.entries(MEDIA_ALIASES)) {
      if (media[key] === undefined && media[alias] !== undefined) { media[key] = media[alias]; repairs.push(`source_media:${alias} als ${key} gelesen`); }
    }
    // Der Sendungsname traegt die Rechtefreigabe: steht er in der Freigabeliste,
    // wird die amtliche Schreibweise eingetragen. Sonst entscheidet ein „&"
    // statt eines „+" darueber, ob das freigegebene Logo gefunden wird.
    const official = officialShowName(media.show);
    if (official && official !== media.show) { repairs.push(`source_media:Sendungsname auf die amtliche Schreibweise (${official})`); media.show = official; }
    const date = String(media.original_release_date || '');
    if (/^\d{4}-\d{2}-\d{2}T/.test(date)) { media.original_release_date = date.slice(0, 10); repairs.push('source_media:Datum auf den Tag gekürzt'); }
    if (!/^https:\/\//.test(media.original_url || '')) {
      const page = links.find((url) => /^https:\/\//.test(url) && !/\.(mp3|mp4|m4a|aac|vtt|xml|txt|json)(\?|$)/i.test(url));
      if (page) { media.original_url = page; repairs.push('source_media:Sendungsseite aus dem Auftrag ergänzt'); }
    }
  }
  // Ein Bild ohne belegte Nutzungserlaubnis ist kein Grund, einen fertigen Text
  // zu verwerfen: der Vertrag erlaubt ausdrücklich visual null. Die Ablage
  // verlangt eine Adresse auf wirkungsoekonomie.de, Alternativtext, Nachweis,
  // gültigen Rechtestatus und die Freigabe für die Website (16.09.:
  // EDITORIAL_PREVIEW_IMAGE_NOT_CLEARED verwarf einen vollständigen Entwurf).
  if (preview.visual && !clearedVisual(preview.visual)) {
    preview.visual = null;
    repairs.push('visual:ohne belegte Freigabe entfernt');
  }
  return preview;
}

export const VISUAL_RIGHTS = ['OWN', 'CLEARED', 'LICENSED', 'CC_LICENSED', 'PERMISSION_GRANTED'];
export function clearedVisual(visual) {
  if (!visual || typeof visual !== 'object') return false;
  if (!/^https:\/\/wirkungsoekonomie\.de\//.test(visual.url || '')) return false;
  if (!String(visual.alt || '').trim() || !String(visual.credit || '').trim()) return false;
  if (!VISUAL_RIGHTS.includes(visual.rights_status)) return false;
  if (visual.allow_website !== true) return false;
  if (visual.expires_at && (!Number.isFinite(Date.parse(visual.expires_at)) || Date.parse(visual.expires_at) <= Date.now())) return false;
  return true;
}

// Die Befunde im Klartext, ohne Codes zu erklären: das Modell sieht dieselbe
// Prüfung, die die Ablage anwendet, und liefert dieselbe Fassung mit behobenen
// Punkten. Neue Aussagen sind ausdrücklich nicht erwünscht.
export function editorialRepairAddendum(issues = [], repairs = []) {
  return ['NACHLIEFERUNG: Deine Ausgabe ist angekommen, wurde von der Ablage aber abgewiesen.',
    `Befunde: ${issues.filter(Boolean).join(' | ')}.`,
    ...(repairs.length ? [`Bereits automatisch angeglichen: ${repairs.join('; ')}.`] : []),
    'Liefere dieselbe Fassung erneut als vollständiges output.json, nur mit diesen Punkten behoben.',
    'Inhalt, Aussagen, Quellen und persönliche Passagen bleiben unverändert. Keine neuen Behauptungen, keine erfundenen Quellen oder Bilder.',
    'Formatregeln: preview.markdown ohne Hauptüberschrift (#), Gliederung ab ##, keine HTML- oder Codeblöcke, keine Bilder im Text. Jede Quelle mit url (https), title und publisher. visual nur mit belegter Freigabe, sonst null.'].join('\n');
}

export async function processEditorialRequest(session, row, { knowledge, draft = draftEditorialOutput, now = () => new Date().toISOString(), rawOutputDir = process.env.WOEK_NEWS_RAW_OUTPUT_DIR, staleClaimHours = STALE_CLAIM_HOURS, fetchImpl = fetch, excerpts = process.env.WOEK_EDITORIAL_SOURCE_EXCERPTS !== 'false',
  repairPass = process.env.WOEK_EDITORIAL_REPAIR !== 'false' } = {}) {
  const id = row.input.job_id;
  const job = await session.store.get(id);
  if (!job || job.ack || job.accepted || job.status !== 'queued') return { job_id: id, status: 'already_processed' };
  const attempt = await session.store.observation(`github-attempt:${id}`);
  // Eine an unseren eigenen Formvorgaben gescheiterte Ablage ist kein
  // redaktionelles Ergebnis: Der Entwurf war da, die Ausgabe wurde verworfen
  // (16.09.: EDITORIAL_MARKDOWN_DUPLICATE_TITLE, der Vertrag nannte die Regel
  // nicht). Nach einer Vertragskorrektur, erkennbar an der höheren
  // Workerversion, darf genau ein weiterer Versuch folgen.
  // Kein Auftrag bleibt liegen: Ein Versuch, der nichts abgeliefert hat, war
  // technisch oder formal gescheitert - nicht redaktionell entschieden. Nach
  // einer Korrektur, erkennbar an der höheren Workerversion, folgt genau ein
  // weiterer Versuch je Version. Ein gelieferter Entwurf (auch ein HOLD mit
  // Begründung) ist ein Ergebnis und wird nicht wiederholt.
  // 16.09.: drei Aufträge standen auf 'attempt_exhausted, delivered: false',
  // einer davon seit dem 13.09.; Natalie hat sie nie zur Freigabe gesehen.
  const contractFixed = Boolean(attempt) && attempt.status !== 'output_delivered' && attempt.version !== WORKER_VERSION
    && attempt.retried_for_version !== WORKER_VERSION;
  if (attempt?.provider_called && !contractFixed) return { job_id: id, status: 'attempt_exhausted', delivered: attempt.status === 'output_delivered' };
  const outputPath = bridgePath('20_OUTPUT_READY', `${id}.output.json`);
  if (await session.transport.metadata(outputPath) || await session.transport.metadata(bridgePath('30_ACK', `${id}.ack.json`))) return { job_id: id, status: 'already_delivered' };
  const name = `${id}.input.json`, sourcePath = bridgePath('00_INBOX', name), claimPath = bridgePath('10_CLAIMED', name);
  const ownClaim = await session.store.observation(`github-claim:${name}`);
  const foreignClaim = await session.transport.metadata(claimPath);
  let adoptedClaim = null;
  if (foreignClaim && ownClaim?.state !== 'claimed') {
    const modified = Date.parse(foreignClaim.server_modified || foreignClaim.client_modified || '');
    const stale = Number.isFinite(modified) && Date.parse(now()) - modified >= staleClaimHours * 3600e3;
    if (!stale) return { job_id: id, status: 'claimed_elsewhere' };
    adoptedClaim = foreignClaim.server_modified || foreignClaim.client_modified;
  }
  const packet = JSON.parse(await session.transport.read(ownClaim?.state === 'claimed' || adoptedClaim ? claimPath : sourcePath));
  if (packet.job_id !== id || packet.input_hash !== job.input.input_hash || packet.job_type !== 'editorial_request') throw new Error('BRIDGE_JOB_BINDING_MISMATCH');
  // Prompt copy only: the stored packet and its input_hash stay untouched.
  // Nachlieferung: der Zusatz ist der Auftrag, der frühere Auftrag und seine
  // bisher gelieferte Fassung kommen als Material dazu. Nur die Prompt-Kopie;
  // das abgelegte Paket und sein input_hash bleiben unberührt.
  const target = supplementTarget(packet.request?.brief);
  const supplement = target ? await supplementContext(session, target,
    { paths: [bridgePath('20_OUTPUT_READY', `${target}.output.json`), bridgePath('30_ACK', `${target}.ack.json`)] }) : null;
  const supplementedPacket = withSupplement(packet, supplement);
  const sourceExcerpts = excerpts ? await collectSourceExcerpts(supplementedPacket.request?.links || [], fetchImpl) : [];
  const promptPacket = sourceExcerpts.length ? { ...supplementedPacket, origin: { ...(supplementedPacket.origin || {}), source_excerpts: sourceExcerpts } } : supplementedPacket;
  const request = prepareApiJob(promptPacket, knowledge);
  if (adoptedClaim) {
    await session.store.observe(`github-claim:${name}`, { job_id: id, actor: WORKER_ACTOR, packet_hash: hash(packet), state: 'claimed', adopted_stale_claim_from: adoptedClaim, at: now() });
  } else if (!ownClaim) {
    await session.store.observe(`github-claim:${name}`, { job_id: id, actor: WORKER_ACTOR, packet_hash: hash(packet), state: 'intent', at: now() });
    try { await session.transport.move(sourcePath, claimPath); }
    catch { return { job_id: id, status: 'claim_unknown' }; }
    await session.store.observe(`github-claim:${name}`, { job_id: id, actor: WORKER_ACTOR, packet_hash: hash(packet), state: 'claimed', at: now() });
  }
  await session.store.observe(`github-attempt:${id}`, { job_id: id, actor: WORKER_ACTOR, version: WORKER_VERSION, provider_called: true, status: 'started', at: now(), request_key: request.key, ...(contractFixed ? { retried_after_contract_fix: true, retried_for_version: WORKER_VERSION } : {}) });
  let result;
  try { result = await draft(request); }
  catch (error) {
    const status = error.providerNotCalled ? 'provider_unavailable' : 'output_unusable';
    const message = [String(error.message), error.detail].filter(Boolean).join(' · ').slice(0, 320);
    await session.store.observe(`github-attempt:${id}`, { job_id: id, actor: WORKER_ACTOR, version: WORKER_VERSION, provider_called: !error.providerNotCalled, status, error: message, usage: error.usage || null, cost_usd: error.cost ?? null, at: now(), ...(contractFixed ? { retried_after_contract_fix: true, retried_for_version: WORKER_VERSION } : {}) });
    return { job_id: id, status, error: message, cost_usd: error.cost ?? 0 };
  }
  if (rawOutputDir) {
    try { fs.mkdirSync(rawOutputDir, { recursive: true }); fs.writeFileSync(path.join(rawOutputDir, `${now().replace(/[:.]/g, '-')}-${id}.json`), JSON.stringify({ job_id: id, model: result.model, usage: result.usage, answer: result.answer }, null, 2)); } catch { /* best effort */ }
  }
  // Die Ablage prüft streng, und eine abgewiesene Ausgabe war bisher das Ende
  // des Auftrags: der Entwurf lag vor, niemand sah ihn, und erst eine Änderung
  // am Code holte ihn zurück. Wie in der Nachrichtenspur folgt jetzt genau eine
  // Nachlieferung im selben Lauf, die die Befunde im Klartext mitbekommt. Was
  // die Software selbst angleichen kann, ist vorher schon angeglichen.
  let output = { ...result.output, schema_version: '1.0', job_id: id, input_hash: packet.input_hash, processed_at: now() };
  const previewRepairs = [];
  let validated = null, lastIssues = [], repairCalls = 0, cost = result.cost || 0, usage = result.usage;
  for (let pass = 0; pass <= (repairPass ? 1 : 0); pass += 1) {
    if (output.preview) normalizeEditorialPreview(output.preview, { links: packet.request?.links || [], repairs: previewRepairs });
    try { validated = validateApiOutput(output, packet, now()); break; }
    catch (error) { lastIssues = [String(error.message), ...(error.issues || [])]; }
    if (pass >= (repairPass ? 1 : 0)) break;
    let retry;
    try { retry = await draft({ ...request, prompt: `${request.prompt}\n\n${editorialRepairAddendum(lastIssues, previewRepairs)}` }); }
    catch (error) { cost += error.cost || 0; break; }
    repairCalls += 1;
    cost = Number((cost + (retry.cost || 0)).toFixed(6));
    usage = retry.usage || usage;
    output = { ...retry.output, schema_version: '1.0', job_id: id, input_hash: packet.input_hash, processed_at: now() };
  }
  if (!validated) {
    const message = [...lastIssues, ...(previewRepairs.length ? [`angeglichen: ${previewRepairs.join('; ')}`] : []), ...(repairCalls ? ['eine Nachlieferung blieb erfolglos'] : [])].join('\n').slice(0, 2000);
    await session.store.observe(`github-attempt:${id}`, { job_id: id, actor: WORKER_ACTOR, version: WORKER_VERSION, provider_called: true, status: 'validation_failed', error: message, usage, cost_usd: cost, repair_calls: repairCalls, at: now(), ...(contractFixed ? { retried_after_contract_fix: true, retried_for_version: WORKER_VERSION } : {}) });
    return { job_id: id, status: 'validation_failed', error: message.slice(0, 200), cost_usd: cost, repair_calls: repairCalls };
  }
  const latest = await session.store.get(id);
  if (!latest || latest.ack || latest.accepted) return { job_id: id, status: 'already_processed', cost_usd: result.cost };
  if (await session.transport.metadata(outputPath)) return { job_id: id, status: 'already_delivered', cost_usd: result.cost };
  await session.transport.writeAtomic(outputPath, validated);
  if (hash(JSON.parse(await session.transport.read(outputPath))) !== hash(validated)) throw new Error('EDITORIAL_DELIVERY_READBACK_FAILED');
  await session.transport.writeAtomic(bridgePath('95_LOGS', `processor-github-${id}.json`), { actor: WORKER_ACTOR, version: WORKER_VERSION, job_id: id, request_key: request.key, output_hash: hash(validated), model: result.model, usage, web_searches: result.web_searches ?? 0, preview_repairs: previewRepairs, repair_calls: repairCalls, cost_usd: cost, delivered_at: now(), status: 'OUTPUT_DELIVERED_NOT_PUBLISHED', disposition: validated.disposition || 'preview', ...(adoptedClaim ? { adopted_stale_claim_from: adoptedClaim } : {}) });
  await session.store.observe(`github-attempt:${id}`, { job_id: id, actor: WORKER_ACTOR, version: WORKER_VERSION, provider_called: true, status: 'output_delivered', disposition: validated.disposition || 'preview', hold_code: validated.hold?.code || null, source_excerpts: sourceExcerpts.filter((e) => e.excerpt).length, usage, web_searches: result.web_searches ?? 0, cost_usd: cost, repair_calls: repairCalls, at: now(), ...(contractFixed ? { retried_after_contract_fix: true, retried_for_version: WORKER_VERSION } : {}) });
  return { job_id: id, status: 'output_delivered', disposition: validated.disposition || 'preview', cost_usd: cost, model: result.model, ...(repairCalls ? { repair_calls: repairCalls } : {}),
    ...(supplement ? { supplement_of: supplement.job_id, supplement_previous_version: Boolean(supplement.previous_version) } : {}), web_searches: result.web_searches ?? 0, source_excerpts: sourceExcerpts.filter((e) => e.excerpt).length, preview_repairs: previewRepairs, ...(validated.disposition === 'hold' ? { hold_code: validated.hold?.code || null } : {}) };
}

export async function runRedaktionsworker({ session = null, root = ROOT, knowledge = null, draft = draftEditorialOutput, now = () => new Date().toISOString(), env = process.env, laneWait = null, fetchImpl = fetch,
  maxJobsPerRun = Number(env.WOEK_EDITORIAL_MAX_JOBS_PER_RUN || 2), maxJobsPerDay = Number(env.WOEK_EDITORIAL_MAX_JOBS_PER_DAY || 10) } = {}) {
  let store, transport;
  try { ({ store, transport } = session || bridgeSession(env)); }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message, results: [] }; throw error; }
  const live = { store, transport };
  let acquired = false;
  try {
    await acquireLane(() => store.acquire(now(), 'import', { manualRunId: `${env.GITHUB_RUN_ID || '0'}:${env.GITHUB_RUN_ATTEMPT || '1'}3` }), { ...LANE_WAIT, ...(laneWait || {}) });
    acquired = true;
  } catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message, results: [] }; throw error; }
  try {
    const day = isoDay(now());
    const counter = (await store.observation(`github-editorial-day:${day}`)) || { day, paid: 0, cost_usd: 0 };
    // Der Wartestand wird zuerst vermerkt, vor jedem Abbruch: die
    // Nachrichtenspur haelt nur dann einen Platz frei, wenn sie weiss, dass hier
    // Arbeit liegt. Ein Abbruch ohne Vermerk wuerde die Reserve verfallen
    // lassen - und genau dann bleibt die Redaktionsarbeit liegen.
    const rows = await store.all();
    await store.observe(EDITORIAL_WAITING_KEY, waitingRecord(selectEditorialRequests(rows, { limit: 500 }).length, now()));
    // Ihre eigenen Auftraege laufen auch dann, wenn Tageszahl und Stundenplatz
    // erschoepft sind: sie hat sie ausdruecklich gestellt, es sind wenige, und
    // ein liegengebliebener Auftrag von ihr ist teurer als ein paar Cent.
    const eigene = selectEditorialRequests(rows, { limit: 50 }).filter(manualRequest);
    if (counter.paid >= maxJobsPerDay && !eigene.length) return { status: 'daily_limit', day, paid: counter.paid, results: [] };
    // Ein Kontingent fuer alles, was bezahlt wird (Natalie am 16.09.: die
    // Nachbesprechungen und Analysen sind Teil derselben Veroeffentlichung,
    // „dann kommt dann ein Artikel jeweils weniger"). Automatisch erzeugt wird
    // weiter beides; wartende Auftraege verfallen nicht, sie kommen im
    // naechsten Lauf dran.
    const quota = configuredHourlyQuota(env);
    let hourUsage = (await store.observation(EDITORIAL_HOUR_KEY)) || { drafts: [] };
    let tickerStories = 0;
    try { tickerStories = tickerStoriesInWindow(JSON.parse(fs.readFileSync(path.join(root, 'data/news/usage.json'), 'utf8')), now()); }
    catch { /* ohne Nutzungsdatei zaehlt nur die eigene Spur */ }
    const hourlyRoom = sharedHourlyRoom({ configured: quota, tickerStories, editorialDrafts: editorialDraftsInWindow(hourUsage, now()) });
    if (hourlyRoom <= 0 && !eigene.length) return { status: 'hourly_quota_reached', day, quota, ticker_stories_last_hour: tickerStories,
      editorial_drafts_last_hour: editorialDraftsInWindow(hourUsage, now()), results: [] };
    // Rows that turn out to be delivered, exhausted or freshly claimed elsewhere
    // cost no model call; they must not use up the paid slots of this run.
    // Das Laufbudget deckelt die automatische Spur; ihre eigenen Auftraege
    // kommen obendrauf, hoechstens so viele wie ein Lauf ohnehin schafft.
    const budget = Math.max(
      Math.min(maxJobsPerRun, maxJobsPerDay - counter.paid, hourlyRoom),
      Math.min(maxJobsPerRun, eigene.length));
    const candidates = selectEditorialRequests(rows, { limit: Math.max(budget, 0) + 20 });
    // Hat Natalie nachgeliefert, trägt die Nachlieferung den ursprünglichen
    // Auftrag mit. Ein zweiter Entwurf ohne den Zusatz wäre eine veraltete
    // Fassung und ein zweiter bezahlter Aufruf.
    const superseded = await supersededCandidates(live, candidates);
    const resolvedKnowledge = knowledge || editorialKnowledge(root);
    const results = [];
    let paid = 0;
    for (const row of candidates) {
      if (paid >= budget) break;
      if (superseded.has(row.input.job_id)) { results.push({ job_id: row.input.job_id, status: 'superseded_by_supplement' }); continue; }
      const result = await processEditorialRequest(live, row, { knowledge: resolvedKnowledge, draft, now, fetchImpl });
      results.push(result);
      if (PAID_STATUS.has(result.status)) {
        paid += 1; counter.paid += 1; counter.cost_usd = Number((counter.cost_usd + (result.cost_usd || 0)).toFixed(6));
        await store.observe(`github-editorial-day:${day}`, counter);
        // Der Vermerk macht den Platz fuer die Nachrichtenspur sichtbar.
        hourUsage = noteEditorialDraft(hourUsage, now());
        await store.observe(EDITORIAL_HOUR_KEY, hourUsage);
      }
      if (result.status === 'provider_unavailable') break;
    }
    return { status: 'ok', day, open_requests: rows.filter((row) => row?.input?.job_type === 'editorial_request' && row.status === 'queued').length, selected: results.length, superseded_by_supplement: [...superseded], paid_this_run: paid, paid_today: counter.paid, cost_today_usd: counter.cost_usd, results };
  } finally {
    if (acquired) await store.release(true).catch(() => {});
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = await runRedaktionsworker();
    console.log(JSON.stringify(report, null, 2));
    if (report.results?.some((r) => r.status === 'provider_unavailable')) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ status: 'failed', error: /^[A-Z_0-9:.-]+$/.test(error?.message || '') ? error.message : 'REDAKTIONSWORKER_FAILED' }));
    process.exitCode = 1;
  }
}
