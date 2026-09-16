// The private preview poll briefly owns the import lane too. Wait for its
// normal release instead of losing an entire scheduled publication cycle.
// Only a definite lock conflict is retried; uncertain writes remain errors.
export async function acquireLane(acquire, { wait = ms => new Promise(resolve => setTimeout(resolve, ms)), retries = 3, waitMs = 5000 } = {}) {
  for (let retry = 0; ; retry++) {
    try { await acquire(); return retry; }
    catch (error) {
      if (error.message !== 'BRIDGE_RUN_LOCKED' || retry === retries) throw error;
      await wait(waitMs);
    }
  }
}
