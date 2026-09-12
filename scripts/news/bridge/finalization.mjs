// Called only after the workflow has durably pushed the canonical content.
// Independent receipts must still be attempted if another receipt or health
// read fails. Each recipient retains its own approval/live-version checks.
export async function finalizeCommittedBridge(bridge, { stories, editorials, now, committed }, log = console.log) {
  if (committed !== true) throw Error('BRIDGE_COMMITTED_CONTENT_REQUIRED');
  const failures = [];
  async function attempt(stage, action) {
    try { return await action(); }
    catch (error) {
      failures.push(error);
      const code = /^[A-Z_0-9:.-]{3,100}$/.test(error?.message || '') ? error.message : 'BRIDGE_OPERATION_FAILED';
      log(JSON.stringify({ event: 'bridge_finalization_failed', stage, error_code: code }));
    }
  }
  await attempt('news_receipts', () => bridge.finalize(stories, now, { committed: true, editorials }));
  if (bridge.store.editorialFinalize) {
    await attempt('editorial_receipts', () => bridge.store.editorialFinalize());
  }
  await attempt('monitor', async () => log(JSON.stringify(await bridge.monitor(now))));
  // Completing an independent receipt must never conceal an infrastructure
  // failure or turn the run/processor health green.
  if (failures.length === 1) throw failures[0];
  if (failures.length > 1) throw new AggregateError(failures, 'BRIDGE_FINALIZATION_INCOMPLETE');
}
