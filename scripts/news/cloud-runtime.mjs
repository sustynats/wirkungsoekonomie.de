import { editionPlan } from './edition-plan.mjs';

// Explicit per-edition deadline, never an implicit paid replacement service.
export function cloudDeadlinePolicy({ isoDate, slot, deadlineAt, leadMinutes = 60, now, reason }) {
  const plan = editionPlan({ isoDate, slot, leadMinutes });
  const at = Date.parse(now), deadline = Date.parse(deadlineAt);
  if (!Number.isFinite(at) || !Number.isFinite(deadline)
    || deadline < Date.parse(plan.preparation_at) || deadline >= Date.parse(plan.ready_deadline_at))
    throw Error('CLOUD_DEADLINE_CONFIG_INVALID');
  const route = at < deadline ? 'hold' : 'existing_news_path';
  return { ...plan, cloud_deadline_at: deadlineAt, checked_at: now, route,
    reason, deadline_missed: at >= deadline, readiness_deadline_missed: at > Date.parse(plan.ready_deadline_at) };
}
