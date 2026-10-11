import { hash } from './contract.mjs';

// Only the worker's own checkpoint under its exclusive import lane. Never
// replay model calls, file moves, approval decisions or unknown writes.
export async function writeAttemptCheckpoint(store, key, value, previous = null) {
  if (!/^github-attempt:wt_\d{8}T\d{6}Z_[a-f0-9]{24}$/.test(key)) throw Error('EDITORIAL_CHECKPOINT_KEY_INVALID');
  const expected = structuredClone(value), priorHash = hash(previous ?? null);
  const same = actual => hash(actual ?? null) === hash(expected);
  const transient = error => error.message === 'BRIDGE_REMOTE_TIMEOUT'
    || error.message === 'BRIDGE_REMOTE_INVALID_RESPONSE' && (error.http_status === 200 || error.http_status >= 500);
  try { await store.observe(key, expected); return; }
  catch (error) {
    if (!transient(error)) throw error;
    const actual = await store.observation(key);
    if (same(actual)) return; // Committed; only the HTTP acknowledgement failed.
    if (hash(actual ?? null) !== priorHash) throw Error('EDITORIAL_CHECKPOINT_CONCURRENT_CHANGE');
    // An authoritative read proves the unchanged old record. At most one
    // identical journal update, never a second provider request.
    try { await store.observe(key, expected); }
    catch (retryError) {
      if (!transient(retryError) || !same(await store.observation(key))) throw retryError;
    }
  }
}
