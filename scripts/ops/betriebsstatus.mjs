// Der Betriebsstatus für Natalies Redaktions-App.
//
// Natalie am 16.09.2026: „Ich dachte, du hast ein permanentes Monitoring
// aufgesetzt bei jedem Schritt." Aufgesetzt war es - nur unsichtbar. Der Monitor
// meldet sich bei einem neuen Vorfall und einmal täglich; „alles läuft" stand
// nirgends, sie musste fragen. Deshalb legt der Monitor seinen Befund in die
// Ablage, die Redaktions-API gibt ihn an ihr Konto heraus, und die App zeigt ihn
// neben den Freigaben.
//
// In den Befund gehört, was eine Betriebsfrage beantwortet: welche Prüfung rot
// ist, seit wann, was die Selbstheilung versucht hat, wie viel Budget und
// welcher Durchsatz. Keine redaktionellen Inhalte, keine Entwürfe, keine
// Kennungen von Personen - die Ablage ist privat, aber der Befund ist eine
// Betriebsauskunft und kein Archiv.
export const OPS_STATUS_KEY = 'ops-status';
export const OPS_STATUS_MAX_CHECKS = 40;

const text = (value, limit = 240) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, limit);
const number = (value) => (Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : null);

export function operationalStatus({ checks = [], incidents = {}, recovery = [], summary = {}, delivery = {}, report = {}, at }) {
  const list = checks.slice(0, OPS_STATUS_MAX_CHECKS).map((check) => ({
    id: text(check.id, 60), name: text(check.name, 80), ok: check.ok === true,
    kind: check.kind === 'editorial' ? 'editorial' : 'operational',
    immediate: Boolean(check.immediate),
    ...(check.ok === true ? {} : { reason: text(check.reason), since: text(incidents?.[check.id]?.firstSeen || '', 30) || null }),
  }));
  return {
    checked_at: text(at, 30),
    checked: list.length,
    healthy: list.filter((check) => check.ok).length,
    failing: list.filter((check) => !check.ok),
    checks: list,
    // Was die Selbstheilung in diesem Lauf versucht hat - leer ist die gute Nachricht.
    recovery: (Array.isArray(recovery) ? recovery : []).slice(0, 10)
      .map((attempt) => ({ workflow: text(attempt.workflow, 80), status: text(attempt.status, 40), at: text(attempt.at, 30) })),
    budget: {
      month_usd: number(summary.usdMonth), today_usd: number(summary.usdToday),
      limit_usd: number(report.monthly_budget_usd), remaining_usd: number(report.ai_budget_pacing?.remaining_usd),
      paused: report.ai_budget_pacing?.paused === true,
    },
    throughput: {
      hourly_quota: number(report.ai_hourly_limit_configured), stories_last_hour: number(report.ai_stories_in_last_hour),
      editorial_drafts_last_hour: number(report.editorial_drafts_in_last_hour), room_left: number(report.shared_hourly_room ?? report.ai_hourly_limit),
      published_last_run: number(report.published_stories), repair_calls_last_run: number(report.ai_repair_calls),
    },
    delivery: { verified: delivery.verified === true, visible_news: number(delivery.visible_news), last_new_at: text(delivery.last_new_at || '', 30) || null },
  };
}

// Ein Befund, der stehen bleibt, ist keine Auskunft: was älter ist als zwei
// Prüfzyklen, gilt als veraltet und wird in der App als solches gezeigt.
export function statusIsStale(status, now, maxAgeMinutes = 45) {
  const checked = Date.parse(status?.checked_at || '');
  const at = Date.parse(now);
  if (!Number.isFinite(checked) || !Number.isFinite(at)) return true;
  return at - checked > Math.max(1, Number(maxAgeMinutes) || 45) * 60000;
}
