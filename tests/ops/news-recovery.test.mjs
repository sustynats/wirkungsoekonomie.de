import test from 'node:test';
import assert from 'node:assert/strict';
import { observeLiveNews, planRecovery, recoverDelivery, workflowChecks, workflowFailed } from '../../scripts/ops/news-recovery.mjs';

const now = '2026-09-14T04:00:00Z', head = 'a'.repeat(40);
const item = (slug, date = '2026-09-14T03:00:00Z') => ({ url: `https://wirkungsoekonomie.de/wirkungsticker/${slug}/`,
  _woek_type: 'Wirkungsakte', date_published: date });
const snapshot = () => ({ 'wirkungsticker.yml': [], 'deploy.yml': [], 'redaktionsworker.yml': [] });
const input = () => ({ head, snapshot: snapshot(), now, state: {}, pendingPublication: 1,
  bridgeMode: true, bridge: { reachable: true, poll_at: now, output_wait_minutes: 20 } });

test('first observation is a baseline, then only genuinely new URLs count', () => {
  const baseline = observeLiveNews(null, { items: [item('old')] }, now);
  assert.equal(baseline.summary.new_visible_last_hour, 0);
  const next = observeLiveNews(baseline.state, { items: [item('old'), item('new'),
    { ...item('analysis'), _woek_type: 'Meinung & Analyse' }] }, '2026-09-14T04:15:00Z');
  assert.equal(next.summary.new_visible_last_hour, 1);
  assert.equal(next.summary.current_new_visible_last_hour, 1);
  assert.equal(next.summary.last_new_at, '2026-09-14T04:15:00Z');
  const corrected = observeLiveNews(next.state, { items: [{ ...item('old'), date_modified: now }, item('new')] }, '2026-09-14T04:30:00Z');
  assert.equal(corrected.summary.new_visible_last_hour, 1);
  const rollback = observeLiveNews(corrected.state, { items: [] }, '2026-09-14T04:35:00Z');
  assert.equal(observeLiveNews(rollback.state, { items: [item('new')] }, '2026-09-14T04:40:00Z').summary.new_visible_last_hour, 1);
});

test('late delivery, unavailable feeds and old observation windows cannot masquerade as fresh news', () => {
  const base = observeLiveNews(null, { items: [] }, now);
  const late = observeLiveNews(base.state, { items: [item('late', '2026-09-10T10:00:00Z')] }, '2026-09-14T04:15:00Z');
  assert.equal(late.summary.new_visible_last_hour, 1);
  assert.equal(late.summary.current_new_visible_last_hour, 0);
  const down = observeLiveNews(late.state, null, '2026-09-14T04:30:00Z');
  assert.equal(down.summary.verified, false);
  assert.deepEqual(down.state, late.state);
  const aged = observeLiveNews(late.state, { items: [item('late')] }, '2026-09-14T05:16:00Z');
  assert.equal(aged.summary.new_visible_last_hour, 0);
});

test('recovery respects existing work, source commit and bounded durable attempts', () => {
  const d = input();
  assert.equal(planRecovery(d)[0].workflow, 'deploy.yml');
  d.snapshot['deploy.yml'] = [{ status: 'queued' }];
  assert.equal(planRecovery(d)[0].workflow, 'wirkungsticker.yml');
  d.snapshot['wirkungsticker.yml'] = [{ status: 'in_progress' }];
  assert.deepEqual(planRecovery(d), []);
  assert.deepEqual(planRecovery({ ...input(), snapshot: null }), []);
  assert.deepEqual(planRecovery({ ...input(), head: 'main' }), []);
  const action = planRecovery(input())[0];
  assert.deepEqual(planRecovery({ ...input(), pendingPublication: 1, bridgeMode: false,
    state: { recovery_attempts: [{ ...action, at: '2026-09-13T00:00:00Z' }] } }), [], 'same revision is never retried indefinitely');
  assert.deepEqual(planRecovery({ ...input(), state: { recovery_attempts: [{ key: 'other', at: '2026-09-14T03:45:00Z' }] } }), []);
  assert.deepEqual(planRecovery({ ...input(), state: { recovery_attempts: [1, 2, 3, 4].map(i => ({ key: `${i}`, at: '2026-09-14T02:00:00Z' })) } }), []);
});

test('no paid API workflow, unavailable bridge or stale poll can be recovered as an import', () => {
  for (const changes of [{ bridgeMode: false }, { bridge: { reachable: false } },
    { bridge: { reachable: true, poll_at: '2026-09-14T02:00:00Z', output_wait_minutes: 90 } }]) {
    assert.deepEqual(planRecovery({ ...input(), pendingPublication: 0, ...changes }), []);
  }
});

test('recovery reserves before dispatch, uses normal gates and never retries ambiguous side effects', async () => {
  const state = {}, calls = [], actions = planRecovery(input());
  const deps = { state, actions, refresh: async () => ({ head, runs: [] }),
    save: async () => calls.push(JSON.parse(JSON.stringify(state))),
    dispatch: async (workflow, body) => { calls.push({ workflow, body }); throw new Error('network response lost'); } };
  await recoverDelivery(deps);
  assert.equal(calls[0].recovery_attempts[0].status, 'reserved');
  assert.deepEqual(calls[1], { workflow: 'deploy.yml', body: { ref: 'main' } });
  assert.equal(state.recovery_attempts[0].status, 'dispatch_uncertain');
  await recoverDelivery(deps);
  assert.equal(calls.length, 3);
});

test('failed persistence, main movement and newly active work block dispatch', async () => {
  for (const fresh of [{ head: 'b'.repeat(40), runs: [] }, { head, runs: [{ status: 'in_progress' }] }]) {
    await recoverDelivery({ state: {}, actions: planRecovery(input()), refresh: async () => fresh,
      save: async () => assert.fail('no reservation'), dispatch: async () => assert.fail('no dispatch') });
  }
  await assert.rejects(recoverDelivery({ state: {}, actions: planRecovery(input()), refresh: async () => ({ head, runs: [] }),
    save: async () => { throw new Error('persistence down'); }, dispatch: async () => assert.fail('no dispatch') }), /persistence down/);
});

test('starting a retry cannot mark a failed workflow as repaired', () => {
  const runs = snapshot();
  runs['deploy.yml'] = [{ status: 'completed', conclusion: 'failure', created_at: '2026-09-14T03:00:00Z' },
    { status: 'in_progress', created_at: '2026-09-14T03:55:00Z' }];
  assert.equal(workflowChecks(runs, now).find(c => c.id === 'delivery-deploy.yml').ok, false);
  runs['deploy.yml'][1] = { status: 'completed', conclusion: 'success', created_at: '2026-09-14T03:55:00Z' };
  assert.equal(workflowChecks(runs, now).find(c => c.id === 'delivery-deploy.yml').ok, true);
  assert.equal(workflowChecks(null, now)[0].ok, false);
});

test('ein gescheiterter oder überfälliger Redaktionslauf bekommt genau einen erneuten Anlauf je Quellstand', async () => {
  const failed = { status: 'completed', conclusion: 'failure', created_at: '2026-09-14T03:50:00Z' };
  const fine = { status: 'completed', conclusion: 'success', created_at: '2026-09-14T03:50:00Z' };
  const base = { ...input(), pendingPublication: 0, bridgeMode: false };
  // Ein Fehlschlag im Redaktionslauf ist ein Hänger, den niemand sieht.
  const plan = planRecovery({ ...base, snapshot: { ...snapshot(), 'redaktionsworker.yml': [failed] } });
  assert.equal(plan[0].workflow, 'redaktionsworker.yml');
  // Ein erfolgreicher Lauf, ein laufender Lauf und ein junger offener Lauf nicht.
  for (const runs of [[fine], [{ status: 'in_progress', created_at: '2026-09-14T03:55:00Z' }], [{ status: 'queued', created_at: '2026-09-14T03:30:00Z' }]])
    assert.deepEqual(planRecovery({ ...base, snapshot: { ...snapshot(), 'redaktionsworker.yml': runs } }), [], JSON.stringify(runs));
  // Ein Lauf, der seit über 65 Minuten hängt, wird gemeldet, aber nicht doppelt
  // gestartet: solange etwas läuft, kommt kein zweiter Anlauf dazu.
  const hanging = { ...snapshot(), 'redaktionsworker.yml': [{ status: 'queued', created_at: '2026-09-14T02:00:00Z' }] };
  assert.equal(workflowFailed(hanging['redaktionsworker.yml'], now), true);
  assert.deepEqual(planRecovery({ ...base, snapshot: hanging }), []);
  // Genau einer je Quellstand.
  const once = planRecovery({ ...base, snapshot: { ...snapshot(), 'redaktionsworker.yml': [failed] } })[0];
  assert.deepEqual(planRecovery({ ...base, snapshot: { ...snapshot(), 'redaktionsworker.yml': [failed] },
    state: { recovery_attempts: [{ ...once, at: '2026-09-13T00:00:00Z' }] } }), []);
  // Der Bericht nennt den Lauf beim Namen.
  const checks = workflowChecks({ ...snapshot(), 'redaktionsworker.yml': [failed] }, now);
  const row = checks.find((check) => check.id === 'delivery-redaktionsworker.yml');
  assert.equal(row.name, 'Redaktionslauf');
  assert.equal(row.ok, false);
  assert.equal(row.immediate, true);
  // Und der Anlauf läuft als gewöhnlicher Lauf auf main.
  const dispatched = [];
  const state = {};
  await recoverDelivery({ state, actions: [once], save: async () => {}, refresh: async () => ({ head, runs: [failed] }), dispatch: async (workflow, options) => dispatched.push([workflow, options]) });
  assert.deepEqual(dispatched, [['redaktionsworker.yml', { ref: 'main' }]]);
  assert.equal(state.recovery_attempts[0].status, 'dispatched');
});
