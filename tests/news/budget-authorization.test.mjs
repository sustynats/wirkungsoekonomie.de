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
  assert.equal(newsBudget(nextFx, '2026-09-30T23:59:59Z').authorized_eur, 50);
  assert.equal(newsBudget(nextFx, '2026-10-01T00:00:00Z', 500).authorized_eur, 25);
  assert.equal(newsBudget(nextFx, '2026-10-01T00:00:00Z').technical_limit_usd, 18.9);
});
