// Lightweight polling: output listing and private journal only; no AI or build.
export async function outputStatus(store, transport, now) {
  const entries = await transport.list('20_OUTPUT_READY');
  const names = new Set(entries.map(e=>e.name));
  const ready = [], unknown = [];
  for (const entry of entries.filter(e => e.name.endsWith('.output.json'))) {
    const id = entry.name.slice(0,-12), job = await store.get(id);
    if (!job) { unknown.push(entry.name); continue; }
    if (['quarantined','archive_failed'].includes(job.status) || job.archived_at) continue;
    const observation = await store.observation(`output:${id}`) || { at: now };
    await store.observe(`output:${id}`, observation);
    if (names.has(`${id}.title.png`) !== names.has(`${id}.visual.json`)) continue;
    ready.push(id);
  }
  for (const job of await store.all()) {
    if (job.status === 'accepted' || job.status === 'acknowledged' && !job.archived_at) ready.push(job.input.job_id);
  }
  const result = { at: now, status: ready.length ? 'OUTPUT_READY' : 'PROCESSING_PENDING',
    ready: [...new Set(ready)], unknown_outputs: unknown,
    last_chatgpt_expected_start: new Date(Math.floor(Date.parse(now)/3600000)*3600000).toISOString() };
  await store.observe('output-poll', result);
  return result;
}
