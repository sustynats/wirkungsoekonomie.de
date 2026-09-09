import test from 'node:test';
import assert from 'node:assert/strict';
import { newsBudget } from '../../scripts/news/budget.mjs';

test('the explicit September exception expires without resetting usage or weakening FX reserves', () => {
  const fx = { rate_date: '2026-09-07', rate_usd_per_eur: 1.16 };
  assert.equal(newsBudget(fx, '2026-09-07T13:26:59Z').authorized_eur, 25);
  const approved = newsBudget(fx, '2026-09-07T13:27:00Z');
  assert.equal(approved.authorized_eur, 50);
  assert.equal(approved.technical_limit_usd, 37.81);
  assert.equal(newsBudget(fx, '2026-09-07T14:00:00Z', 500).authorized_eur, 50);
  assert.equal(newsBudget(fx, '2026-09-07T14:00:00Z', 20).authorized_eur, 20);
  assert.equal(newsBudget(null, '2026-09-07T14:00:00Z').technical_limit_usd, 0);
  const nextFx = { rate_date: '2026-09-30', rate_usd_per_eur: 1.16 };
  assert.equal(newsBudget(nextFx, '2026-09-30T23:59:59Z').authorized_eur, 75);
  assert.equal(newsBudget(nextFx, '2026-10-01T00:00:00Z', 500).authorized_eur, 25);
  assert.equal(newsBudget(nextFx, '2026-10-01T00:00:00Z').technical_limit_usd, 18.9);
});

test('September 9 shared-ceiling extension is bounded and does not rewrite earlier authorizations', () => {
  const fx = { rate_date: '2026-09-08', rate_usd_per_eur: 1.1614 };
  assert.equal(newsBudget(fx, '2026-09-09T04:56:59.999Z').authorized_eur, 50);
  const approved = newsBudget(fx, '2026-09-09T04:57:00.000Z');
  assert.equal(approved.authorized_eur, 75);
  assert.equal(approved.technical_limit_usd, 56.72);
  assert.equal(approved.tax_reserve_factor, 1.19);
  assert.equal(approved.fx_reserve_factor, 0.9);
  assert.equal(newsBudget(fx, '2026-09-09T05:00:00Z', 1000).authorized_eur, 75);
  assert.equal(newsBudget(fx, '2026-09-09T05:00:00Z', 50).authorized_eur, 50);
  assert.equal(newsBudget(fx, '2026-09-09T05:00:00Z', 0).technical_limit_usd, 0);
  assert.equal(newsBudget(null, '2026-09-09T05:00:00Z').technical_limit_usd, 0);
  assert.equal(newsBudget(fx, '2026-09-17T05:00:00Z').technical_limit_usd, 0);
  const octoberFx = { rate_date: '2026-09-30', rate_usd_per_eur: 1.16 };
  assert.equal(newsBudget(octoberFx, '2026-10-01T00:00:00.000Z', 75).authorized_eur, 25);
  assert.equal(newsBudget(octoberFx, '2026-10-01T00:00:00.000Z', 75).technical_limit_usd, 18.9);
});
