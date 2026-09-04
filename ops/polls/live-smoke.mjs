// Operator-only acceptance test. Never votes in the real first survey.
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PollStore } from './backend/store.mjs';

if (process.env.POLLS_LIVE_SMOKE !== 'confirmed') throw new Error('Explicit POLLS_LIVE_SMOKE=confirmed required.');
const store = new PollStore({ path: process.env.POLLS_DATABASE_PATH, pepper: process.env.POLLS_TOKEN_PEPPER });
const base = 'https://130.162.217.58.sslip.io';
const origin = 'https://wirkungsoekonomie.de';
const token = randomBytes(32).toString('hex');
const first = store.get('wirkungsticker-feedback', true);
const originalCount = store.results(first).total;
const template = JSON.parse(readFileSync(new URL('./backend/first-poll.json', import.meta.url)));
let poll;
async function request(path, method = 'GET', body, own = false) {
  const response = await fetch(base + path, { method, headers: { Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(own ? { 'X-Poll-Vote-Token': token } : {}) }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000) });
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  return { status: response.status, data: await response.json() };
}
try {
  poll = store.create({ ...template, title: 'Temporärer technischer Abnahmetest – wird gelöscht', slug: `abnahmetest-${randomUUID()}`, question: 'Technische Prüfung ohne echte Teilnehmerstimmen', options: [{label:'Test A'}, {label:'Test B'}] });
  const path = `/api/polls/${poll.slug}`;
  assert.equal((await request(path)).data.results, null);
  assert.equal((await request('/api/admin/polls')).status, 403);
  assert.equal((await request(path + '/feedback', 'POST', {text:'Noch ohne Stimme'}, true)).status, 403);
  const vote = await request(path + '/vote', 'POST', {option_id:poll.options[0].id}, true);
  assert.equal(vote.status, 201);
  assert.equal(vote.data.results.total, 1);
  assert.equal(vote.data.feedback_submitted, false);
  assert.equal(store.listFeedback(poll.id).total, 0);
  assert.equal((await request(path + '/vote', 'POST', {option_id:poll.options[0].id}, true)).status, 409);
  assert.equal((await request(path + '/feedback', 'POST', {text:'   '}, true)).status, 400);
  assert.equal((await request(path + '/feedback', 'POST', {text:'Technischer Test: optionales internes Feedback.'}, true)).status, 200);
  const own = (await request(path, 'GET', undefined, true)).data;
  assert.equal(own.results.total, 1);
  assert.equal(own.feedback_submitted, true);
  assert.equal((await request(path)).data.results, null);
  const feedback = store.listFeedback(poll.id).items[0];
  assert.equal(feedback.selected_option, 'Test A');
  store.updateFeedback(poll.id, feedback.id, {status:'read'});
  store.updateFeedback(poll.id, feedback.id, {status:'archived'});
  store.deleteFeedback(poll.id, feedback.id, {confirmation:'FEEDBACK LÖSCHEN'});
  assert.equal(store.listFeedback(poll.id).total, 0);
  assert.equal(store.results(poll).total, 1);
  console.log('PASS: public TLS API, CORS, private results, vote without feedback, duplicate protection, optional feedback, internal status/deletion.');
} finally {
  if (poll) {
    const current = store.get(poll.id);
    store.delete(poll.id, {revision:current.revision, confirmation:current.title});
    for (const table of ['votes','poll_options','poll_feedback']) assert.equal(store.db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE poll_id=?`).get(poll.id).n, 0);
    console.log('Temporary poll, options, vote and feedback fully deleted; only its retired URL remains reserved.');
  }
  assert.equal(store.results(first).total, originalCount);
  console.log(`First real survey unchanged: ${originalCount} votes.`);
  store.close();
}
