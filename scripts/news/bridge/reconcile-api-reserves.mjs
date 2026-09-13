// An operator supplies a verified, private, all-projects provider cost export.
// This is aggregate reconciliation, NOT invented per-request billing. Original
// reservations and request counts remain immutable audit evidence.
export function reconcileApiReserves(sharedInput, newsInput, proof, now = new Date().toISOString()) {
  const { month, covered_until, observed_usd, evidence_sha256, all_projects, server_key_matched } = proof || {};
  if (!/^\d{4}-\d{2}$/.test(month || '') || !/^[a-f0-9]{64}$/.test(evidence_sha256 || '')
    || !Number.isFinite(observed_usd) || observed_usd < 0 || !all_projects || !server_key_matched
    || !covered_until?.startsWith(month) || !Number.isFinite(Date.parse(covered_until))
    || Date.parse(now) - Date.parse(covered_until) < 86400000) throw Error('BILLING_PROOF_INVALID');
  const shared = structuredClone(sharedInput), news = structuredClone(newsInput);
  const s = shared.months?.[month], n = news.months?.[month];
  const previous = shared.reconciliations || [];
  if (previous.some(e => e.evidence_sha256 === evidence_sha256)
    && news.reconciliations?.some(e => e.evidence_sha256 === evidence_sha256)) return { shared, news, duplicate: true };
  if (shared.version !== 2 || news.version !== 1 || !s || !n || !Array.isArray(shared.entries)
    || Object.values(news.batchReservations || {}).some(v => !v.settled)
    || shared.entries.some(e => e.month === month && e.basis === 'batch_reserved')
    || Date.parse(s.updatedAt) > Date.parse(covered_until)) throw Error('BILLING_UNSETTLED_ACTIVITY');
  if (previous.some(e => e.evidence_sha256 === evidence_sha256)
    || news.reconciliations?.some(e => e.evidence_sha256 === evidence_sha256)) throw Error('BILLING_RECONCILIATION_PARTIAL');
  const covered = new Set(previous.flatMap(r => r.covered_reserved_ids || []));
  const eligible = shared.entries.filter(e => e.month === month && e.feature === 'news-analysis'
    && e.basis === 'reserved_unknown' && !covered.has(e.id) && Date.parse(e.at) < Date.parse(covered_until));
  const reserve = eligible.reduce((sum, e) => sum + e.chargedCents, 0);
  const factor = 100 * 1.19 / 0.9;
  // Keep the HIGHER of (known charges without old unknown reserves) and the
  // entire observed account spend, including the existing tax/FX provision.
  const floor = Math.ceil(observed_usd * factor * 1e6) / 1e6;
  const credit = Math.max(0, Math.min(reserve, s.estimatedCents - floor));
  if (!Number.isFinite(credit) || !s.features?.['news-analysis'] || s.features['news-analysis'].estimatedCents < credit) throw Error('BILLING_LEDGER_INVALID');
  const round = x => Math.ceil(x * 1e6) / 1e6;
  const report = { ...proof, at: now, basis: 'provider_aggregate_reconciliation',
    covered_reserved_ids: eligible.map(e => e.id), shared_credit_cents: credit,
    shared_before_cents: s.estimatedCents, news_before_usd: n.chargedUsd,
    explanation: 'Account-level export bounds historical unknown reservations; no per-request zero-cost attribution.' };
  s.estimatedCents = round(s.estimatedCents - credit);
  s.features['news-analysis'].estimatedCents = round(s.features['news-analysis'].estimatedCents - credit);
  s.updatedAt = now;
  shared.entries.push({ id: 'reconcile:' + evidence_sha256, feature: 'news-analysis', month, at: now,
    chargedCents: -credit, basis: 'provider_aggregate_reconciliation', evidence_sha256 });
  // News-only spend is conservatively floored at the ENTIRE account invoice.
  // Its lower limit is unchanged; unknown attribution is never called exact.
  const newsCredit = Math.max(0, Math.min(credit / factor, n.chargedUsd - observed_usd));
  n.chargedUsd = round(n.chargedUsd - newsCredit);
  Object.assign(report, { shared_after_cents: s.estimatedCents, news_after_usd: n.chargedUsd, news_credit_usd: newsCredit });
  shared.reconciliations = [...previous, report];
  news.reconciliations = [...(news.reconciliations || []), report];
  return { shared, news, report, duplicate: false };
}
