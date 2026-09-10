import { createHash } from 'node:crypto';
import { sourceDue } from '../newsroom.mjs';

const signature = source => createHash('sha256').update(JSON.stringify(source)).digest('hex');

// Cache the source package, never merely a seen-ID/checkpoint: if a worker is
// interrupted before enqueue, the next run can still reconstruct every find.
// This is private Oracle metadata and never a second publication queue.
export async function fetchDiscoverySource({ store, source, now, fetchSource }) {
  if (!store) return fetchSource(null);
  const binding = signature(source), key = `source-package:${source.source_id}`;
  const stored = await store.observation(key);
  const cached = stored?.version === 1 && stored.binding === binding && Array.isArray(stored.result?.items) ? stored : null;
  if (cached && !sourceDue(source, { last_attempt: cached.checked_at }, now)) {
    return { ...structuredClone(cached.result), cache_hit: true, checked_at: cached.checked_at, fetchAttempts: 0 };
  }
  const result = await fetchSource(cached?.result || null);
  const { body: _rawBody, ...fetched } = result.fetched;
  const packageResult = { ...result, fetched, checked_at: now, cache_hit: false,
    items: fetched.not_modified && cached ? cached.result.items : result.items };
  await store.observe(key, { version: 1, binding, checked_at: now, result: packageResult });
  return packageResult;
}
