import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileApiReserves } from '../../scripts/news/bridge/reconcile-api-reserves.mjs';
const shared = () => ({ version: 2, months: { '2026-09': { totalRequests: 50, estimatedCents: 7494, updatedAt: '2026-09-10T00:00:00Z', features: { 'news-analysis': { estimatedCents: 6707, requests: 40 } } } }, entries: [{ id: 'kept', month: '2026-09', at: '2026-09-09T00:00:00Z', feature: 'news-analysis', basis: 'reserved_unknown', chargedCents: 1952 }] });
const news = () => ({ version: 1, months: { '2026-09': { requests: 40, chargedUsd: 50.73 } }, batchReservations: {} });
const proof = { month: '2026-09', covered_until: '2026-09-12T00:00:00Z', observed_usd: 39.50771295, evidence_sha256: 'a'.repeat(64), all_projects: true, server_key_matched: true };
const now = '2026-09-13T09:00:00Z';
test('aggregate reconciliation retains source entries, counts, conservative floor and auditable correction', () => {
  const original = shared(), result = reconcileApiReserves(original, news(), proof, now);
  assert.deepEqual(result.shared.entries[0], original.entries[0]);
  assert.equal(original.entries.length, 1);
  assert.equal(result.shared.months['2026-09'].totalRequests, 50);
  assert.equal(result.news.months['2026-09'].requests, 40);
  assert.ok(result.shared.months['2026-09'].estimatedCents >= proof.observed_usd * 100 * 1.19 / .9);
  assert.ok(result.news.months['2026-09'].chargedUsd >= proof.observed_usd);
  assert.equal(result.shared.entries[1].basis, 'provider_aggregate_reconciliation');
});
test('no reconciliation while provider/batch work could remain outside the settled export', () => {
  const active = shared(); active.months['2026-09'].updatedAt = '2026-09-13T08:00:00Z';
  assert.throws(() => reconcileApiReserves(active, news(), proof, now), /UNSETTLED/);
  const batch = news(); batch.batchReservations.pending = { settled: false };
  assert.throws(() => reconcileApiReserves(shared(), batch, proof, now), /UNSETTLED/);
  for (const bad of [{ ...proof, all_projects: false }, { ...proof, server_key_matched: false }, { ...proof, observed_usd: -1 }])
    assert.throws(() => reconcileApiReserves(shared(), news(), bad, now), /PROOF_INVALID/);
});
test('no release below measured costs, no double credit and no automatic budget increase', () => {
  const high = reconcileApiReserves(shared(), news(), { ...proof, observed_usd: 80 }, now);
  assert.equal(high.report.shared_credit_cents, 0);
  const first = reconcileApiReserves(shared(), news(), proof, now);
  // Idempotency checks precede new admission; later observed activity is not a
  // license to apply the same negative adjustment again.
  const second = reconcileApiReserves(first.shared, first.news, proof, now);
  assert.equal(second.duplicate, true); assert.equal(second.shared.entries.length, 2);
  assert.equal(first.shared.monthlyBudgetCents, undefined);
});
