// Eine Korrekturfassung ohne bezahlten Aufruf.
//
// Der übliche Weg für eine überarbeitete Fassung führt über das Modell: Natalie
// bittet in der App um eine Überarbeitung, der Worker holt einen neuen Entwurf.
// Das ist richtig, solange neuer Text entstehen soll. Steht der Text aber schon
// fest - weil er aus bereits freigegebenen Fassungen derselben Folge
// zusammengesetzt ist -, wäre ein Modellaufruf bezahlte Arbeit für ein
// Ergebnis, das wir schon haben, und würde den Text zusätzlich verändern.
//
// Dieses Modul reiht deshalb einen Auftrag ein und legt die fertige Fassung als
// Ergebnis ab, genau in der Form, die die Ablage vom Worker erwartet. Alles
// Weitere bleibt unverändert: die Ablage bindet Identität, Zielversion und
// Quellenbestand selbst an die Serverdaten, die Fassung erscheint in Natalies
// Freigabeliste, und veröffentlicht wird sie ausschließlich durch ihre Freigabe.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bridgeSession } from './bridge/remote.mjs';
import { acquireLane } from './bridge/acquire-lane.mjs';
import { hash, bridgePath, JOB_ID } from './bridge/contract.mjs';
import { editorialRevisionBaseHash, assertFinalPersonalSection } from './editorial-approved-revisions.mjs';
import { loadPersonalEditorials, PERSONAL_FILE } from './personal-editorial.mjs';
import { withoutProcessNotes } from './editorial-markdown.mjs';

export const CORRECTION_ACTOR = 'github-korrekturfassung';
export const CONTRACT_PATH = bridgePath('98_CONFIG', 'editorial-request-contract-4.json');

export function publishedEdition(slug, root = '.') {
  const editions = loadPersonalEditorials(root);
  const edition = editions.find((value) => value.slug === slug || value.analysis_id === slug);
  if (!edition) throw new Error('CORRECTION_EDITION_NOT_FOUND');
  return edition;
}

// Die Kennung trägt den Zeitpunkt und einen festen Anteil aus Ziel und Text:
// derselbe Auftrag zweimal gestartet reiht sich nicht zweimal ein.
export function correctionJobId(edition, body, at) {
  const stamp = at.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z').replace(/Z$/, 'Z');
  const id = `wt_${stamp.slice(0, 15)}Z_${hash({ slug: edition.slug, body }).slice(0, 24)}`;
  if (!JOB_ID.test(id)) throw new Error('CORRECTION_JOB_ID_INVALID');
  return id;
}

// Die Grundlage ist die veröffentlichte Fassung, wie sie in der Datei steht:
// genau darauf rechnet die Ablage ihren base_hash.
export function correctionRequest(edition, { body, note, owner, at, brief = '' }) {
  const markdown = withoutProcessNotes(String(body || '').replace(/\r\n/g, '\n').replace(/\s+$/, ''));
  if (markdown.length < 400) throw new Error('CORRECTION_BODY_TOO_SHORT');
  if (markdown === edition.body_markdown) throw new Error('CORRECTION_BODY_UNCHANGED');
  const correction_note = String(note || '').trim();
  if (!correction_note || correction_note.length > 1500) throw new Error('CORRECTION_NOTE_REQUIRED');
  if (!/^\d{15,22}$/.test(owner || '')) throw new Error('CORRECTION_OWNER_REQUIRED');
  assertFinalPersonalSection(markdown);
  const target = { analysis_id: edition.analysis_id, slug: edition.slug, base_hash: editorialRevisionBaseHash(edition) };
  const links = edition.sources.map((source) => source.url).filter((url) => /^https:\/\//.test(url)).slice(0, 4);
  const content = { kind: edition.subtype, brief: brief || `Korrekturfassung von "${edition.title}". ${correction_note}`.slice(0, 2000),
    links, author_notes: '', urgent: false, publication_intent: 'final_approval_required', attachments: [] };
  const input_hash = hash(content);
  const job_id = correctionJobId(edition, markdown, at);
  const input = { schema_version: '1.0', job_type: 'editorial_request', job_id, created_at: at, input_hash,
    processing_mode: 'dropbox_chatgpt_bridge', test_only: false, manual_only: true, request: content,
    contract_path: CONTRACT_PATH, instructions: 'Der Text dieser Korrekturfassung steht fest und wird nicht neu verfasst.' };
  const job = { input, candidate: { story_id: `wt-${hash(edition.slug).slice(0, 16)}` }, status: 'queued', attempts: {}, created_at: at,
    intake: { owner, trigger_type: 'correction_version', triggered_at: at, triggered_by: CORRECTION_ACTOR,
      revision_target: target, revision_base: JSON.parse(JSON.stringify(edition)), revision_story: {} } };
  const preview = { format: edition.subtype, title: edition.title, subtitle: edition.subtitle || '', markdown,
    sources: edition.sources.map((source) => ({ ...source })), source_media: edition.source_media || null, visual: edition.visual || null,
    checks: { source_binding: true, editorial_validation: true, personal_experiences_invented: false },
    editorial_revision: { base: JSON.parse(JSON.stringify(edition)), target, patch: { body_markdown: markdown, correction_note } } };
  const output = { schema_version: '1.0', job_id, input_hash, processed_at: at, preview };
  return { job, output, target };
}

export async function stageCorrectionVersion(session, { slug, body, note, owner, root = '.', now = () => new Date().toISOString(), brief = '' }) {
  const edition = publishedEdition(slug, root);
  const at = now();
  const { job, output } = correctionRequest(edition, { body, note, owner, at, brief });
  const id = job.input.job_id;
  if (await session.store.get(id)) return { job_id: id, status: 'already_queued', slug: edition.slug };
  const outputPath = bridgePath('20_OUTPUT_READY', `${id}.output.json`);
  if (await session.transport.metadata(outputPath)) return { job_id: id, status: 'already_delivered', slug: edition.slug };
  await session.store.put(job);
  await session.transport.writeAtomic(bridgePath('00_INBOX', `${id}.input.json`), job.input);
  await session.transport.writeAtomic(outputPath, output);
  if (hash(JSON.parse(await session.transport.read(outputPath))) !== hash(output)) throw new Error('CORRECTION_DELIVERY_READBACK_FAILED');
  await session.store.observe(`github-attempt:${id}`, { job_id: id, actor: CORRECTION_ACTOR, provider_called: false,
    status: 'output_delivered', disposition: 'preview', cost_usd: 0, at });
  return { job_id: id, status: 'output_delivered', slug: edition.slug, chars: output.preview.markdown.length, cost_usd: 0 };
}

export function correctionBodyFromFile(file, root = '.') {
  const resolved = path.isAbsolute(file) ? file : path.join(root, file);
  return fs.readFileSync(resolved, 'utf8');
}

export const LANE_WAIT = { retries: 20, waitMs: 30000 };
const SKIP = new Set(['BRIDGE_NOT_CONFIGURED', 'BRIDGE_LANE_BUSY', 'BRIDGE_UNREACHABLE']);

// Ein Lauf reiht genau eine Korrekturfassung ein. Die Spur ist dieselbe wie im
// Redaktionsworker, also auch dieselbe Spurreservierung.
export async function runCorrectionVersion({ session = null, env = process.env, root = '.', now = () => new Date().toISOString(), laneWait = null } = {}) {
  const slug = env.WOEK_CORRECTION_SLUG, file = env.WOEK_CORRECTION_BODY;
  const note = env.WOEK_CORRECTION_NOTE, brief = env.WOEK_CORRECTION_BRIEF || '';
  if (!slug || !file || !note) throw new Error('CORRECTION_INPUT_INCOMPLETE');
  const body = correctionBodyFromFile(file, root);
  let store, transport;
  try { ({ store, transport } = session || bridgeSession(env)); }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  let acquired = false;
  try { await acquireLane(() => store.acquire(now(), 'import', { manualRunId: `${env.GITHUB_RUN_ID || '0'}:${env.GITHUB_RUN_ATTEMPT || '1'}4` }), { ...LANE_WAIT, ...(laneWait || {}) }); acquired = true; }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  try {
    // Wem der private Redaktionstisch gehört, steht in einem echten
    // eingereichten Auftrag - nicht in einer Konfiguration und nicht im Code.
    const rows = await store.all();
    const reference = rows.find((row) => row?.input?.job_type === 'editorial_request');
    const owner = reference ? (await store.get(reference.input.job_id))?.intake?.owner : null;
    if (!/^\d{15,22}$/.test(owner || '')) return { status: 'owner_unknown' };
    return await stageCorrectionVersion({ store, transport }, { slug, body, note, owner, root, now, brief });
  }
  finally { if (acquired) await store.release(true).catch(() => {}); }
}

export { PERSONAL_FILE };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await runCorrectionVersion(), null, 2)); }
  catch (error) { console.error(JSON.stringify({ status: 'failed', error: /^[A-Z_0-9:.-]+$/.test(error?.message || '') ? error.message : 'CORRECTION_VERSION_FAILED' })); process.exitCode = 1; }
}
