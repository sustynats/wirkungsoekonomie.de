import { bridgePath, hash } from './contract.mjs';
import { waitingForReview, observeOutput, outputJobId } from './status.mjs';
import { updateProcessorHealth } from './processor.mjs';

const terminal = new Set(['acknowledged', 'quarantined', 'archive_failed']);

// Same monitoring pass for local providers and the authenticated remote owner.
export async function runBridgeMonitor({ store, transport, maxPending = 48 }, now) {
  const folders = {};
  for (const name of ['00_INBOX', '10_CLAIMED', '20_OUTPUT_READY', '90_ERRORS']) folders[name] = await transport.list(name);
  const jobs = await store.all(), open = jobs.filter(j => !terminal.has(j.status));
  const report = { correction_pending: jobs.filter(j => ['correction_pending','correction_prepared'].includes(j.status)).length, at: now, dropbox_reachable: true, inbox: folders['00_INBOX'].filter(e => /\.(?:input|repair-\d+)\.json$/.test(e.name)).length, claimed: folders['10_CLAIMED'].length,
    output_ready: folders['20_OUTPUT_READY'].filter(e => e.name.endsWith('.output.json')).length,
    errors: jobs.filter(j => ['quarantined','archive_failed'].includes(j.status)).length, oldest_open_minutes: Math.max(0, ...open.map(j => (Date.parse(now) - Date.parse(j.created_at)) / 60000)), alerts: [] };
  const discovery = await store.observation('discovery');
  report.discovery_last_success = discovery?.at || null;
  report.last_chatgpt_expected_start = new Date(Math.floor(Date.parse(now)/3600000)*3600000).toISOString();
  report.oldest_claim = null;
  if (!discovery || Date.parse(now) - Date.parse(discovery.at) > 7200000) report.alerts.push('DISCOVERY_OVERDUE');
  if (report.inbox > maxPending) report.alerts.push('QUEUE_CAPACITY_EXCEEDED');
  const claims = new Map();
  for (const entry of folders['10_CLAIMED']) {
    const match = /^(.*)\.(input|repair-(\d+))\.json$/.exec(entry.name);
    if (!match) continue;
    const generation = Number(match[3] || 0);
    if (!claims.has(match[1]) || claims.get(match[1]).generation < generation) claims.set(match[1], { name: entry.name, generation });
  }
  for (const [id, entry] of claims) {
    const job = jobs.find(j => j.input.job_id === id);
    if (!job || terminal.has(job.status) || job.ack || await waitingForReview(store, job)
      || folders['20_OUTPUT_READY'].some(e => e.name === `${id}.output.json`)) continue;
    const key = `claim:${id}`, previous = await store.observation(key);
    // Only an explicitly new repair generation starts a new observation;
    // age alone can never release or reset an existing claim.
    const observed = previous && (!previous.name || previous.name === entry.name)
      ? { ...previous, name: entry.name } : { at: now, name: entry.name };
    await store.observe(key, observed);
    if (!report.oldest_claim || observed.at < report.oldest_claim.at) report.oldest_claim = { job_id: id, at: observed.at };
    if (Date.parse(now) - Date.parse(observed.at) > 7200000) report.alerts.push(`STALE_CLAIM:${id}`);
    // Never reset a claim from age alone; a slow worker could still own it.
  }
  report.oldest_claim_minutes = report.oldest_claim ? Math.max(0, (Date.parse(now) - Date.parse(report.oldest_claim.at)) / 60000) : 0;
  report.review_pending = open.filter(j => j.publication_gate?.status === 'needs_second_pass').length;
  report.review_required = open.filter(j => ['needs_review','blocked'].includes(j.publication_gate?.status)).length;
  if (report.review_required) report.alerts.push('EDITORIAL_REVIEW_REQUIRED');
  if (report.errors) report.alerts.push('QUARANTINED_JOBS');
  for (const entry of folders['20_OUTPUT_READY'].filter(e => e.name.endsWith('.output.json'))) {
    const id = outputJobId(entry.name);
    if (!id) { report.alerts.push(`UNKNOWN_OUTPUT:${entry.name}`); continue; }
    const job = await store.get(id);
    if (!job) { report.alerts.push(`UNKNOWN_OUTPUT:${entry.name}`); continue; }
    if (job.status === 'correction_prepared') continue;
    const observed = await observeOutput(store, job, now);
    if (!job.ack && !terminal.has(job.status) && !await waitingForReview(store, job)
      && Date.parse(now) - Date.parse(observed.at) >= 600000) report.alerts.push(`OUTPUT_OVERDUE:${id}`);
  }
  Object.assign(report, await store.observation('completion-metrics') || { completed: 0, average_queue_minutes: null, last_publication_at: null });
  try {
    report.processor_health = await updateProcessorHealth(store, transport, now);
    report.alerts.push(...report.processor_health.alerts);
  } catch {
    // Discovery and import survive a monitoring failure; never report healthy.
    report.alerts.push('PROCESSOR_HEALTH_UNAVAILABLE');
  }
  await store.observe('monitor', report);
  await transport.writeAtomic(bridgePath('95_LOGS', `${now.replace(/[^0-9TZ]/g, '')}.${hash(report).slice(0,12)}.server.json`), report);
  return report;
}
