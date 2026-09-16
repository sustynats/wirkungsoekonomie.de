import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { EditorialApproval } from '../../scripts/news/bridge/editorial-approval.mjs';
import { BridgeStore } from '../../scripts/news/bridge/store.mjs';
import { importEditorialPreviews } from '../../scripts/news/bridge/intake-processing.mjs';
import { bridgePath } from '../../scripts/news/bridge/contract.mjs';
import { correctionRequest, publishedEdition, stageCorrectionVersion } from '../../scripts/news/korrekturfassung.mjs';

const owner = '1206956406805102593';
const at = '2026-09-16T17:10:00.000Z';
const edition = () => publishedEdition('was-meinen-wir-wenn-wir-den-westen-sagen-23442a', '.');
// Eine echte Änderung an der veröffentlichten Fassung: ein zusätzlicher Absatz
// in der persönlichen Schlusssektion, sonst wortgleich.
function changed(base) {
  const lines = base.body_markdown.split('\n');
  const index = lines.findIndex((line) => /^## Meine Einordnung/.test(line));
  return [...lines.slice(0, index + 2), 'Ein zusätzlicher Absatz für den Test, der die Schlusssektion erweitert und sonst nichts verändert.', '', ...lines.slice(index + 2)].join('\n');
}

test('eine Korrekturfassung entsteht ohne bezahlten Aufruf und nennt Ziel, Grundlage und Grund', () => {
  const base = edition();
  const { job, output, target } = correctionRequest(base, { body: changed(base), note: 'Ein Absatz in der Einordnung ergänzt.', owner, at });
  assert.match(job.input.job_id, /^wt_\d{8}T\d{6}Z_[a-f0-9]{24}$/);
  assert.equal(job.intake.owner, owner);
  assert.deepEqual(job.intake.revision_target, target);
  assert.equal(target.slug, base.slug);
  assert.equal(job.intake.revision_base.content_hash, base.content_hash, 'die Grundlage ist die veröffentlichte Fassung');
  assert.equal(output.preview.format, job.input.request.kind, 'die Ablage vergleicht Form und Auftragsart');
  assert.ok(job.input.request.links.some((url) => output.preview.sources.some((s) => s.url === url)), 'der Auftrag ist an seine Quellen gebunden');
  assert.equal(output.preview.editorial_revision.patch.body_markdown, output.preview.markdown);
  assert.equal(output.preview.editorial_revision.patch.correction_note, 'Ein Absatz in der Einordnung ergänzt.');
  assert.deepEqual(Object.keys(output.preview.editorial_revision.patch).sort(), ['body_markdown', 'correction_note']);
  // Derselbe Text zum selben Ziel ergibt dieselbe Kennung: kein zweiter Auftrag.
  assert.equal(correctionRequest(base, { body: changed(base), note: 'Anderer Grund, gleicher Text.', owner, at }).job.input.job_id, job.input.job_id);
});

test('unvollständige oder unveränderte Vorgaben werden abgewiesen', () => {
  const base = edition();
  const ok = { body: changed(base), note: 'Grund.', owner, at };
  assert.throws(() => correctionRequest(base, { ...ok, body: base.body_markdown }), /CORRECTION_BODY_UNCHANGED/);
  assert.throws(() => correctionRequest(base, { ...ok, body: 'Zu kurz.' }), /CORRECTION_BODY_TOO_SHORT/);
  assert.throws(() => correctionRequest(base, { ...ok, note: '' }), /CORRECTION_NOTE_REQUIRED/);
  assert.throws(() => correctionRequest(base, { ...ok, note: 'x'.repeat(1501) }), /CORRECTION_NOTE_REQUIRED/);
  assert.throws(() => correctionRequest(base, { ...ok, owner: 'natalie' }), /CORRECTION_OWNER_REQUIRED/);
  // Die persönliche Schlusssektion bleibt Pflicht.
  assert.throws(() => correctionRequest(base, { ...ok, body: base.body_markdown.replace('## Meine Einordnung', '## Anderer Abschluss') }), /FINAL_PERSPECTIVE_REQUIRED/);
  assert.throws(() => publishedEdition('gibt-es-nicht', '.'), /CORRECTION_EDITION_NOT_FOUND/);
});

test('die abgelegte Fassung wird von der Ablage übernommen und wartet auf Natalies Freigabe', async (t) => {
  const base = edition();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'korrekturfassung-'));
  const store = new BridgeStore(path.join(dir, 'queue.sqlite'), { lane: 'import' });
  const approval = new EditorialApproval(new DatabaseSync(':memory:'), { now: () => at });
  const files = new Map();
  const transport = {
    list: async () => [...files.keys()].filter((p) => p.includes('20_OUTPUT_READY')).map((p) => ({ name: p.split('/').at(-1) })),
    metadata: async (p) => (files.has(p) ? { name: p.split('/').at(-1) } : null),
    read: async (p) => { if (!files.has(p)) throw Error('NOT_FOUND'); return files.get(p); },
    writeAtomic: async (p, value) => { files.set(p, JSON.stringify(value)); },
  };
  t.after(() => { store.close(); approval.db.close(); fs.rmSync(dir, { recursive: true, force: true }); });

  const staged = await stageCorrectionVersion({ store, transport }, { slug: base.slug, body: changed(base), note: 'Ein Absatz in der Einordnung ergänzt.', owner, root: '.', now: () => at });
  assert.equal(staged.status, 'output_delivered');
  assert.equal(staged.cost_usd, 0, 'kein bezahlter Aufruf');
  assert.ok(files.has(bridgePath('20_OUTPUT_READY', `${staged.job_id}.output.json`)));

  const result = await importEditorialPreviews({ store, transport, approval, now: () => '2026-09-16T17:12:00.000Z' });
  assert.deepEqual(result, { staged: 1, failed: [] }, 'die Ablage nimmt die Fassung an');
  const review = approval.get(staged.job_id);
  assert.equal(review.status, 'AWAITING_FINAL_APPROVAL', 'sie wartet auf die Freigabe und ist nicht veröffentlicht');
  assert.equal(review.owner, owner);
  assert.equal(review.preview.editorial_revision.target.slug, base.slug);
  assert.equal(review.preview.editorial_revision.base.title, base.title, 'Identität und Grundlage kommen vom Server');
  assert.equal(approval.claimPublications().length, 0, 'ohne Freigabe wird nichts veröffentlicht');

  // Zweiter Lauf: nichts wird doppelt eingereiht oder doppelt übernommen.
  assert.equal((await stageCorrectionVersion({ store, transport }, { slug: base.slug, body: changed(base), note: 'Ein Absatz in der Einordnung ergänzt.', owner, root: '.', now: () => at })).status, 'already_queued');
  assert.equal((await importEditorialPreviews({ store, transport, approval, now: () => '2026-09-16T17:13:00.000Z' })).staged, 0);
});

// Wem der private Redaktionstisch gehört, steht in einem echten eingereichten
// Auftrag. Ohne einen solchen Auftrag wird nichts eingereiht - eine erfundene
// Kennung würde eine Fassung in eine fremde Freigabeliste legen.
test('der Lauf nimmt die Kennung aus der Ablage und bricht ohne sie ab', async () => {
  const { runCorrectionVersion } = await import('../../scripts/news/korrekturfassung.mjs');
  const base = edition();
  const body = changed(base);
  const file = path.join(os.tmpdir(), `korrekturfassung-${Date.now()}.md`);
  fs.writeFileSync(file, body);
  const env = { WOEK_CORRECTION_SLUG: base.slug, WOEK_CORRECTION_BODY: file, WOEK_CORRECTION_NOTE: 'Ein Absatz ergänzt.' };
  const files = new Map();
  const session = (rows, jobs) => ({
    store: { acquire: async () => true, release: async () => true, all: async () => rows, get: async (id) => jobs?.[id] || null,
      put: async (job) => { jobs[job.input.job_id] = job; }, observe: async () => true },
    transport: { metadata: async (p) => (files.has(p) ? {} : null), read: async (p) => files.get(p),
      writeAtomic: async (p, value) => { files.set(p, JSON.stringify(value)); } },
  });
  assert.deepEqual(await runCorrectionVersion({ session: session([], {}), env, root: '.' }), { status: 'owner_unknown' });
  const reference = { input: { job_id: 'wt_20260915T200000Z_' + 'a'.repeat(24), job_type: 'editorial_request' } };
  const jobs = { [reference.input.job_id]: { ...reference, intake: { owner } } };
  const result = await runCorrectionVersion({ session: session([reference], jobs), env, root: '.', now: () => at });
  assert.equal(result.status, 'output_delivered');
  assert.equal(result.slug, base.slug);
  assert.equal(result.cost_usd, 0);
  await assert.rejects(runCorrectionVersion({ session: session([reference], jobs), env: { ...env, WOEK_CORRECTION_NOTE: '' }, root: '.' }), /CORRECTION_INPUT_INCOMPLETE/);
  fs.rmSync(file, { force: true });
});
