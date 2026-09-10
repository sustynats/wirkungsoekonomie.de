import { visualGenerationProvider } from '../processing-mode.mjs';
export async function waitingForReview(store, job) {
  const gate = job.publication_gate;
  if (['needs_review','blocked'].includes(gate?.status)) return true;
  if (gate?.status !== 'needs_second_pass' || !gate.review_job_id) return false;
  const review = await store.get(gate.review_job_id);
  return ['queued','correction_pending','accepted'].includes(review?.status);
}
export async function observeOutput(store, job, now) {
  const key = `output:${job.input.job_id}`, previous = await store.observation(key);
  const generation = job.corrections?.length || 0;
  if (previous && Number(previous.generation || 0) === generation) return previous;
  if (previous) await store.observe(`${key}:generation-${Number(previous.generation || 0)}`, previous);
  const value = { at: now, generation };
  await store.observe(key, value);
  return value;
}
// Lightweight polling: output listing and private journal only; no AI or build.
export async function outputStatus(store, transport, now) {
  let entries;
  try { entries = await transport.list('20_OUTPUT_READY'); await store.observe('poll-error', null); }
  catch (error) {
    const previous = await store.observation('poll-error');
    await store.observe('poll-error', { at: now, consecutive_failures: (previous?.consecutive_failures || 0) + 1 });
    throw error;
  }
  const names = new Set(entries.map(e=>e.name));
  const ready = [], unknown = [];
  for (const entry of entries.filter(e => e.name.endsWith('.output.json'))) {
    const id = entry.name.slice(0,-12), job = await store.get(id);
    if (!job) { unknown.push(entry.name); continue; }
    if (['quarantined','archive_failed','correction_prepared'].includes(job.status) || job.archived_at) continue;
    await observeOutput(store, job, now);
    if (await waitingForReview(store, job)) continue;
    if (visualGenerationProvider() === 'chatgpt_bridge' && names.has(`${id}.title.png`) !== names.has(`${id}.visual.json`)) continue;
    ready.push(id);
  }
  for (const job of await store.all()) {
    if (job.status === 'correction_prepared' || job.status === 'accepted' || job.status === 'acknowledged' && !job.archived_at) ready.push(job.input.job_id);
  }
  const result = { at: now, status: ready.length ? 'OUTPUT_READY' : 'PROCESSING_PENDING',
    ready: [...new Set(ready)], unknown_outputs: unknown,
    last_chatgpt_expected_start: new Date(Math.floor(Date.parse(now)/3600000)*3600000).toISOString() };
  await store.observe('output-poll', result);
  return result;
}

export async function monitorStatus(store, now) {
  const jobs=await store.all(), open=jobs.filter(j=>!['acknowledged','quarantined','archive_failed'].includes(j.status));
  const poll=await store.observation('output-poll'), detected=[];
  const claims=[];
  for(const job of open){const claim=await store.observation(`claim:${job.input.job_id}`);const output=await store.observation(`output:${job.input.job_id}`);const outputExists=output?.at && Number(output.generation||0)===(job.corrections?.length||0);if(claim?.at && !outputExists && !job.accepted && !await waitingForReview(store,job))claims.push({job_id:job.input.job_id,at:claim.at});}
  for(const id of poll?.ready||[]){const job=await store.get(id);if(job&&!job.ack&&!await waitingForReview(store,job)){const at=(await store.observation(`output:${id}`))?.at;if(at)detected.push(at);}}
  return { reachable:true, checked_at:now, poll_at:poll?.at||null, status:poll?.status||'PROCESSING_PENDING',
    open_count:open.length,
    discovery:await store.observation('discovery-report'),
    discovery_last_success:(await store.observation('discovery'))?.at||null,
    poll_error:await store.observation('poll-error'),
    oldest_open_minutes:Math.max(0,...open.map(j=>(Date.parse(now)-Date.parse(j.created_at))/60000)),
    oldest_claim:claims.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))[0]||null,
    oldest_claim_minutes:Math.max(0,...claims.map(c=>(Date.parse(now)-Date.parse(c.at))/60000)),
    review_pending_count:open.filter(j=>j.publication_gate?.status==='needs_second_pass').length,
    review_required_count:open.filter(j=>['needs_review','blocked'].includes(j.publication_gate?.status)).length,
    output_wait_minutes:Math.max(0,...detected.map(at=>(Date.parse(now)-Date.parse(at))/60000)),
    errors:jobs.filter(j=>['quarantined','archive_failed'].includes(j.status)).length,
    metrics:await store.observation('completion-metrics') };
}
