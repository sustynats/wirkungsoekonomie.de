// Publication planning only. No scheduler activation, model calls or release.
import { berlinInstant, lageDefinition, lageId } from './lage.mjs';

export function editionPlan({ isoDate, slot, leadMinutes = 60, reserveMinutes = 10 }) {
  const definition = lageDefinition(slot);
  if (!definition || !Number.isSafeInteger(leadMinutes) || !Number.isSafeInteger(reserveMinutes)
    || reserveMinutes < 10 || leadMinutes <= reserveMinutes) throw Error('EDITION_PLAN_INVALID');
  const publication = berlinInstant(isoDate, definition.hour);
  if (!publication) throw Error('EDITION_PLAN_INVALID');
  const at = Date.parse(publication);
  return { edition_id: lageId(isoDate, slot), slot, timezone: 'Europe/Berlin',
    publication_at: publication, preparation_at: new Date(at - leadMinutes * 60000).toISOString(),
    ready_deadline_at: new Date(at - reserveMinutes * 60000).toISOString(),
    lead_minutes: leadMinutes, reserve_minutes: reserveMinutes };
}

export function editionTiming(plan, { requestedAt, startedAt, sourceCutoffAt, readyAt, publishedAt }) {
  const parse = value => { const at = Date.parse(value); if (!Number.isFinite(at)) throw Error('EDITION_TIMING_INVALID'); return at; };
  const requested = parse(requestedAt), started = parse(startedAt), cutoff = parse(sourceCutoffAt);
  if (started < requested || cutoff < requested || cutoff > started) throw Error('EDITION_TIMING_INVALID');
  const ready = readyAt ? parse(readyAt) : null, published = publishedAt ? parse(publishedAt) : null;
  if ((ready !== null && ready < started) || (published !== null && (ready === null || published < ready)))
    throw Error('EDITION_TIMING_INVALID');
  return { edition_id: plan.edition_id, publication_at: plan.publication_at,
    requested_at: requestedAt, processing_started_at: startedAt, source_cutoff_at: sourceCutoffAt,
    ready_at: readyAt || null, published_at: publishedAt || null,
    queue_ms: started - requested, processing_ms: ready === null ? null : ready - started,
    total_to_ready_ms: ready === null ? null : ready - requested,
    ready_in_time: ready === null ? false : ready <= parse(plan.ready_deadline_at),
    published_early: published === null ? false : published < parse(plan.publication_at),
    status: published !== null ? (published < parse(plan.publication_at) ? 'early_release_error' : 'published')
      : ready !== null ? 'ready_awaiting_release' : 'incomplete' };
}
