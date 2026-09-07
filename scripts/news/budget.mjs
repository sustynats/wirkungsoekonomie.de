export const NEWS_AI_BUDGET_EUR = 25;
export const NEWS_REQUEST_RESERVATION_USD = 0.25;
const ECB_FX_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

export async function refreshBudgetFx(previous, now, fetchImpl = fetch) {
  const age = Date.parse(now) - Date.parse(previous?.checked_at || "");
  if (Number.isFinite(age) && age >= 0 && age < 20 * 3600000) return previous;
  try {
    const response = await fetchImpl(ECB_FX_URL, { signal: AbortSignal.timeout(10000), redirect: "error" });
    if (!response.ok) throw new Error(`FX_HTTP_${response.status}`);
    const xml = await response.text();
    const rate = Number(xml.match(/currency=['"]USD['"]\s+rate=['"]([^'"]+)/)?.[1]);
    const date = xml.match(/time=['"]([^'"]+)/)?.[1];
    if (!date || !Number.isFinite(rate) || rate < 0.5 || rate > 2 || Math.abs(Date.parse(now) - Date.parse(date)) > 7 * 86400000) throw new Error("FX_INVALID_OR_STALE");
    return { source: ECB_FX_URL, rate_usd_per_eur: rate, rate_date: date, checked_at: now };
  } catch {
    return previous || null;
  }
}

export function newsBudget(fx, now, authorizedEur = NEWS_AI_BUDGET_EUR) {
  const age = Date.parse(now) - Date.parse(fx?.rate_date || "");
  const fresh = Number.isFinite(age) && age >= 0 && age <= 7 * 86400000 && Number.isFinite(fx?.rate_usd_per_eur) && fx.rate_usd_per_eur >= 0.5 && fx.rate_usd_per_eur <= 2;
  // User authorization is a ceiling, not a spending target. Retain 19% tax
  // reserve and 10% FX/estimation reserve. Never silently increase authorization.
  const euroLimit = Math.min(NEWS_AI_BUDGET_EUR, Math.max(0, Number(authorizedEur) || 0));
  const dollars = fresh ? Math.floor(euroLimit / 1.19 * 0.9 * Math.min(1, fx.rate_usd_per_eur) * 100) / 100 : 0;
  return { authorized_eur: euroLimit, technical_limit_usd: dollars, tax_reserve_factor: 1.19, fx_reserve_factor: 0.9, fx: fx || null, status: fresh ? "ok" : "FX_UNAVAILABLE_AI_HELD" };
}

export function modelRates(model = "gpt-5.5") {
  if (/^gpt-5\.4-mini(?:-|$)/.test(model)) return { inputUsdPerMillion: 0.75, outputUsdPerMillion: 4.5, cachedInputUsdPerMillion: 0.075 };
  return { inputUsdPerMillion: 5, outputUsdPerMillion: 30, cachedInputUsdPerMillion: 0.5 };
}

export function validReportedUsage(usage) {
  return Boolean(usage && Number.isSafeInteger(usage.input_tokens) && usage.input_tokens >= 0
    && Number.isSafeInteger(usage.output_tokens) && usage.output_tokens >= 0
    && (usage.cached_input_tokens === undefined || Number.isSafeInteger(usage.cached_input_tokens)
      && usage.cached_input_tokens >= 0 && usage.cached_input_tokens <= usage.input_tokens));
}

export function costFromUsage(result, estimated = {}) {
  const usage = result.reported_usage;
  const attempts = Number.isSafeInteger(result.request_attempts) && result.request_attempts > 0 ? result.request_attempts : 1;
  const priorReserve = (attempts - 1) * NEWS_REQUEST_RESERVATION_USD;
  if (result.cache_status === "hit") return { ...estimated, input_tokens: 0, output_tokens: 0, estimated_cost_usd: priorReserve, token_source: priorReserve ? "cache_hit_with_prior_attempt_reservations" : "provider_cache_hit" };
  if (!validReportedUsage(usage) || !/^gpt-5\.(?:4-mini|5)(?:-|$)/.test(result.model || '')) return { input_tokens: 0, output_tokens: 0, ...estimated, estimated_cost_usd: Number((priorReserve + Math.max(NEWS_REQUEST_RESERVATION_USD, Number(estimated.estimated_cost_usd) || 0)).toFixed(6)), token_source: "conservative_reservation_usage_unavailable" };
  const rates = modelRates(result.model);
  const cached = usage.cached_input_tokens ?? 0;
  return { ...estimated, input_tokens: usage.input_tokens, output_tokens: usage.output_tokens, estimated_cost_usd: Number((priorReserve + (usage.input_tokens - cached) * rates.inputUsdPerMillion / 1e6 + cached * rates.cachedInputUsdPerMillion / 1e6 + usage.output_tokens * rates.outputUsdPerMillion / 1e6).toFixed(6)), token_source: priorReserve ? "provider_usage_with_prior_attempt_reservations" : "provider_reported_usage" };
}

export function failedRequestCost(error) {
  const attempts = Number.isSafeInteger(error?.requestAttempts) && error.requestAttempts >= 0 ? error.requestAttempts : 1;
  if (attempts === 0 || error?.providerNotCalled === true && attempts === 1) return { input_tokens: 0, output_tokens: 0, estimated_cost_usd: 0, token_source: "provider_not_called" };
  return costFromUsage({ ...error?.billingEvidence, request_attempts: attempts });
}
