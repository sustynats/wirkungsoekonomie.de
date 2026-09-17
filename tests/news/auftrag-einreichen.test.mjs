import test from 'node:test';
import assert from 'node:assert/strict';
import { orderRequest, submitOrder, KINDS, ORDER_ACTOR } from '../../scripts/news/auftrag-einreichen.mjs';
import { manualRequest, selectEditorialRequests } from '../../scripts/news/redaktionsworker.mjs';
import { JOB_ID } from '../../scripts/news/bridge/contract.mjs';

const owner = '1206956406805102593';
const at = '2026-09-17T08:30:00.000Z';
const brief = 'Meta haftet für Betrugsanzeigen: Das Landgericht Frankfurt hat Meta verpflichtet, Fake-Anzeigen mit dem Namen Finanzfluss und dem Gesicht von Thomas Kehl vor der Veröffentlichung zu filtern.';
const links = ['https://www.turi2.de/aktuell/gericht-meta-haftet-fuer-betrugsanzeigen-und-muss-diese-kuenftig-proaktiv-filtern/'];

// Natalie am 17.09.2026: „Ich habe aber nur diesen Link und deshalb gebe ich das
// über diesen Weg in Auftrag."
test('ein Auftrag aus dem Gespraech landet in derselben Warteschlange wie einer aus der App', () => {
  const { job, fingerprint } = orderRequest({ kind: 'opinion_analysis', brief, links, owner, at });
  assert.ok(JOB_ID.test(job.input.job_id));
  assert.equal(job.input.job_type, 'editorial_request');
  assert.equal(job.status, 'queued');
  assert.equal(job.intake.owner, owner);
  assert.equal(job.intake.kind, 'opinion_analysis');
  assert.equal(job.intake.trigger_type, 'manual_order');
  assert.equal(job.intake.triggered_by, ORDER_ACTOR);
  assert.equal(job.input.request.publication_intent, 'final_approval_required', 'die Freigabe bleibt bei ihr');
  assert.deepEqual(job.input.request.links, links);
  assert.equal(job.candidate.sources.length, 1, 'der Auftrag ist an seine Quelle gebunden');
  // Derselbe Auftrag zweimal ergibt dieselbe Kennung: kein zweiter Entwurf.
  assert.equal(orderRequest({ kind: 'opinion_analysis', brief, links, owner, at }).fingerprint, fingerprint);
  assert.notEqual(orderRequest({ kind: 'news', brief, links, owner, at }).fingerprint, fingerprint, 'Nachricht und Analyse sind zwei Auftraege');
});

// Natalie: „manuell von mir eingereichte Meinungen und Analyse und Nachrichten
// müssen auf jeden Fall verarbeitet werden. Also egal, was das Budget sagt oder
// die Grenze pro Stunde."
test('ihre eigenen Auftraege kommen vor den automatischen Vorschlaegen', () => {
  const eigener = orderRequest({ kind: 'news', brief, links, owner, at }).job;
  const ausDerApp = { input: { job_type: 'editorial_request', job_id: `wt_20260917T070000Z_${'c'.repeat(24)}` }, status: 'queued', created_at: '2026-09-17T07:00:00Z', intake: { draft_id: 'abc' } };
  const automatisch = { input: { job_type: 'editorial_request', job_id: `wt_20260917T060000Z_${'a'.repeat(24)}` }, status: 'queued', created_at: '2026-09-17T06:00:00Z', intake: { trigger_type: 'automatic_candidate', draft_id: null } };
  assert.equal(manualRequest(eigener), true, 'aus dem Gespraech');
  assert.equal(manualRequest(ausDerApp), true, 'aus der App');
  assert.equal(manualRequest(automatisch), false, 'ein Vorschlag ist nicht ihr Auftrag');
  const reihe = selectEditorialRequests([automatisch, eigener, ausDerApp], { limit: 3 });
  assert.deepEqual(reihe.map(manualRequest), [true, true, false], 'ihre beiden zuerst, der Vorschlag zuletzt');
  // Unter den eigenen gilt das Alter.
  assert.equal(reihe[0].input.job_id, ausDerApp.input.job_id, 'der aeltere eigene zuerst');
});

test('unbrauchbare Auftraege werden abgewiesen', () => {
  const ok = { kind: 'opinion_analysis', brief, links, owner, at };
  assert.throws(() => orderRequest({ ...ok, kind: 'kolumne' }), /ORDER_KIND_INVALID/);
  assert.throws(() => orderRequest({ ...ok, brief: 'Zu kurz.' }), /ORDER_BRIEF_TOO_SHORT/);
  assert.throws(() => orderRequest({ ...ok, links: [] }), /ORDER_LINK_REQUIRED/);
  assert.throws(() => orderRequest({ ...ok, links: ['http://unsicher.example/x'] }), /ORDER_LINK_REQUIRED/, 'nur https');
  assert.throws(() => orderRequest({ ...ok, owner: 'natalie' }), /ORDER_OWNER_REQUIRED/);
  assert.deepEqual(KINDS, ['news', 'opinion_analysis', 'book_review', 'listened', 'watched']);
  // Doppelte Quellen werden zusammengefasst, die Zahl ist begrenzt.
  const viele = orderRequest({ ...ok, links: [...links, ...links, 'https://www.handelsblatt.com/x'] });
  assert.equal(viele.job.input.request.links.length, 2);
});

test('ohne Kennung des Redaktionstisches wird nichts eingereiht', async () => {
  const session = (rows) => ({
    store: { acquire: async () => true, release: async () => true, all: async () => rows,
      get: async () => null, put: async () => { throw new Error('darf nicht schreiben'); }, observe: async () => true },
    transport: {},
  });
  assert.deepEqual(await submitOrder({ session: session([]), env: {}, kind: 'news', brief, links }), { status: 'owner_unknown' });
});

test('derselbe Auftrag wird nicht zweimal eingereiht', async () => {
  const reference = { input: { job_id: `wt_20260915T200000Z_${'a'.repeat(24)}`, job_type: 'editorial_request' } };
  const { fingerprint } = orderRequest({ kind: 'news', brief, links, owner, at });
  const bekannt = { input: { job_id: `wt_20260917T010000Z_${'d'.repeat(24)}`, job_type: 'editorial_request' }, intake: { fingerprint } };
  let geschrieben = 0;
  const session = {
    store: { acquire: async () => true, release: async () => true, all: async () => [reference, bekannt],
      get: async (id) => (id === reference.input.job_id ? { ...reference, intake: { owner } } : null),
      put: async () => { geschrieben += 1; }, observe: async () => true },
    transport: {},
  };
  const ergebnis = await submitOrder({ session, env: {}, now: () => at, kind: 'news', brief, links });
  assert.equal(ergebnis.status, 'already_known');
  assert.equal(ergebnis.job_id, bekannt.input.job_id);
  assert.equal(geschrieben, 0, 'kein zweiter Auftrag');
});
