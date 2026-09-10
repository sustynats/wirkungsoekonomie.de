import { canRequestCorrection, prepareCorrection, recoverCorrections } from './corrections.mjs';
import { bridgeInput, adaptOutput, sameBridgeEvent } from './adapter.mjs';
import { BRIDGE_ROOT, bridgePath, parsePacket, outputSchema, hash } from './contract.mjs';
import { storyPage } from '../build.mjs';

const terminal = new Set(['acknowledged', 'quarantined', 'archive_failed']);
export class DropboxChatGPTBridgeProvider {
  constructor({ store, transport, visualProvider, correctionsEnabled = false, stageOnly = true, maxJobs = 6, maxPending = 48, retentionDays = 30, adapt = adaptOutput }) {
    if (!Number.isInteger(retentionDays) || retentionDays < 30) throw new Error('BRIDGE_RETENTION_INVALID');
    Object.assign(this, { store, transport, visualProvider, correctionsEnabled, stageOnly, maxJobs, maxPending, retentionDays, adapt });
  }
  async selectCandidates(candidates) {
    const checkpoints = await this.store.observation('source-checkpoints') || {};
    const active = (await this.store.all()).filter(j => !terminal.has(j.status));
    const selected = [];
    for (const candidate of candidates) {
      if (selected.length >= Math.min(this.maxJobs, this.maxPending - active.length)) break;
      if (checkpoints[candidate.story_id] === candidate.content_hash || active.some(j => sameBridgeEvent(candidate, j.candidate)) || selected.some(c => sameBridgeEvent(candidate,c))) continue;
      selected.push(candidate);
    }
    return selected;
  }
  async enqueue(candidates, stories, now, { testOnly = false } = {}) {
    let jobs = await this.store.all();
    const results = []; let created = 0;
    const retried = new Set();
    // Retry the persisted packet even when subsequent source enrichment changed.
    for (const job of jobs.filter(j => j.status === 'prepared')) {
      retried.add(job.input.job_id);
      await this.queuePrepared(job, now, results);
    }
    for (const candidate of candidates) {
      if (created >= this.maxJobs || jobs.filter(j => !terminal.has(j.status)).length >= this.maxPending) break;
      const input = bridgeInput(candidate, now, { stories, testOnly });
      let job = await this.store.get(input.job_id);
      if (!job) {
        // Keep one active event package. Material updates are reconsidered from
        // the source queue after the preceding package reaches a terminal state.
        if (jobs.some(j => !terminal.has(j.status) && sameBridgeEvent(candidate, j.candidate))) continue;
        job = { input, candidate, status: 'prepared', attempts: {}, created_at: now };
        await this.store.put(job); jobs.push(job); created++;
      }
      if (job.status !== 'prepared' || retried.has(input.job_id)) continue;
      await this.queuePrepared(job, now, results);
    }
    await this.store.observe('discovery', { at: now, candidates: candidates.length, created });
    return results;
  }
  async queuePrepared(job, now, results) {
    try {
      await this.transport.writeAtomic(bridgePath('00_INBOX', `${job.input.job_id}.input.json`), job.input);
      job.status = 'queued'; job.queued_at = now; await this.store.put(job);
      const checkpoints = await this.store.observation('source-checkpoints') || {};
      if (!job.input.test_only) checkpoints[job.candidate.story_id] = job.candidate.content_hash;
      await this.store.observe('source-checkpoints', checkpoints);
      results.push({ job_id: job.input.job_id, story_id: job.candidate.story_id, status: 'queued' });
    } catch (error) { await this.failure(job, 'enqueue', error, now); }
  }
  async reconcile(registry, stories, now) {
    if (this.correctionsEnabled) await recoverCorrections(this);
    const entries = await this.transport.list('20_OUTPUT_READY');
    const names = new Set(entries.map(e => e.name));
    const results = [];
    for (const job of await this.store.all()) {
      if (terminal.has(job.status)) continue;
      if (job.status === 'accepted') {
        const accepted = job.accepted;
        if (!accepted.record || accepted.staged || stories.some(s => s.bridge_import?.job_id === job.input.job_id && s.bridge_import.output_hash === accepted.output_hash)) { results.push(accepted); continue; }
        // Recover only against the still-current source/analysis version.
        try {
          const output = parsePacket(await this.transport.read(bridgePath('20_OUTPUT_READY', `${job.input.job_id}.output.json`)), outputSchema);
          if (hash(output) !== accepted.output_hash) throw new Error('BRIDGE_ACCEPTED_OUTPUT_CHANGED');
          this.adapt(output, job, registry, stories, now);
          results.push(accepted);
        } catch (error) { await this.failure(job, 'import', error, now); }
        continue;
      }
      if (!names.has(`${job.input.job_id}.output.json`)) continue;
      try {
        const output = parsePacket(await this.transport.read(bridgePath('20_OUTPUT_READY', `${job.input.job_id}.output.json`)), outputSchema);
        const result = this.adapt(output, job, registry, stories, now);
        const staged = this.stageOnly || job.input.test_only;
        let visual = null;
        if (result.record && this.visualProvider) {
          visual = await this.visualProvider.receive(job, now, { output, record: result.record, staged });
          if (visual.status === 'pending') continue;
          // Missing/failed imagery follows the existing free impact-card path.
          // Existing imagery is never bought again as a bridge fallback.
        }
        const accepted = { ...result, story_id: job.candidate.story_id, input_content_hash: job.candidate.content_hash, job_id: job.input.job_id, staged, visual, output_hash: hash(output), accepted_at: now };
        job.accepted = { ...accepted, ...(visual?.file ? { visual: { ...visual, file: undefined } } : {}) };
        job.status = 'accepted'; job.accepted_at = now; delete job.last_error;
        job.output_detected_at = (await this.store.observation(`output:${job.input.job_id}`))?.at || now;
        if (staged && result.record) job.staging = { record: result.record, html: storyPage(result.record), visual_sha256: visual?.sha256 || null, ...(visual?.staging ? { image: visual.staging } : {}) };
        await this.store.put(job); // durable staging BEFORE any ACK
        results.push(accepted);
      } catch (error) { await this.failure(job, 'import', error, now); }
    }
    return results;
  }
  async finalize(stories, now, { committed = false } = {}) {
    for (const job of await this.store.all()) {
      if (job.status !== 'accepted') continue;
      const item = job.accepted;
      if (item.record && !item.staged) {
        if (!committed) continue;
        const persisted = stories.find(s => s.story_id === item.record.story_id);
        if (persisted?.bridge_import?.job_id !== job.input.job_id || persisted.bridge_import.output_hash !== item.output_hash) continue;
      }
      const ack = job.ack || { schema_version: '1.0', job_id: job.input.job_id,
        status: item.staged ? 'staged' : item.record ? 'imported' : item.decision,
        imported_at: now, publication_id: !item.staged && item.record ? item.record.story_id : null,
        url: !item.staged && item.record ? `https://wirkungsoekonomie.de/wirkungsticker/${item.record.slug}/` : null,
        output_hash: item.output_hash, test_only: job.input.test_only };
      try {
        job.ack = ack; await this.store.put(job);
        await this.transport.writeAtomic(bridgePath('30_ACK', `${job.input.job_id}.ack.json`), ack);
        job.status = 'acknowledged'; job.completed_at = now; job.output_imported_at = now;
        job.processing_latency = (Date.parse(job.accepted_at) - Date.parse(job.queued_at || job.created_at)) / 1000;
        job.import_pickup_latency = (Date.parse(now) - Date.parse(job.output_detected_at || job.accepted_at)) / 1000;
        await this.store.put(job);
      } catch (error) { await this.failure(job, 'ack', error, now); }
    }
    // Retry archival independently of import. ACK remains as completion receipt.
    for (const job of await this.store.all()) {
      if (job.status !== 'acknowledged' || job.archived_at) continue;
      const id = job.input.job_id;
      try {
      for (const correction of job.corrections || []) for (const folder of ['00_INBOX','10_CLAIMED']) await this.transport.archive(bridgePath(folder, `${id}.repair-${correction.attempt}.json`), id, job.completed_at);
      for (const [folder, suffix] of [['00_INBOX','input.json'],['10_CLAIMED','input.json'],['20_OUTPUT_READY','output.json'],['20_OUTPUT_READY','visual.json'],['20_OUTPUT_READY','title.png'],['20_OUTPUT_READY','title.webp']]) {
        await this.transport.archive(bridgePath(folder, `${id}.${suffix}`), id, job.completed_at);
      }
      await this.transport.writeAtomic(`${BRIDGE_ROOT}/40_ARCHIVE/${job.completed_at.slice(0,10).replaceAll('-','/')}/${id}/${id}.ack.json`, job.ack);
      job.archived_at = now;
      job.retain_until = new Date(Date.parse(now) + this.retentionDays * 86400000).toISOString();
      await this.store.put(job);
      } catch (error) { await this.failure(job, 'archive', error, now); }
    }
  }
  async failure(job, stage, error, now) {
    const attempt = (job.attempts[stage] || 0) + 1;
    job.attempts[stage] = attempt;
    const code = /^BRIDGE_[A-Za-z_0-9:.$\[\]-]{1,190}$/.test(error.message || '') ? error.message : 'BRIDGE_OPERATION_FAILED';
    const retryable = error.retryable === true && attempt < 3;
    job.last_error = { job_id: job.input.job_id, stage, error_code: code, message: code, retryable, failed_at: now, attempt };
    if (Array.isArray(error.issues)) job.last_error.issues = error.issues.map(issue => typeof issue === 'string' ? issue.slice(0,160) : String(issue.code || 'VALIDATION_FAILED').slice(0,160)).slice(0,50);
    if (this.correctionsEnabled && canRequestCorrection(job, stage, job.last_error)) {
      try { await prepareCorrection(this, job, job.last_error, now); return; }
      catch { /* Normal durable failure path remains available if preparation fails. */ }
    }
    if (!retryable) job.status = stage === 'archive' ? 'archive_failed' : 'quarantined';
    await this.store.put(job);
    // Keep the first canonical error immutable; later attempts get separate logs.
    const file = bridgePath('90_ERRORS', `${job.input.job_id}.error.json`);
    try {
      if (!await this.transport.metadata(file)) await this.transport.writeAtomic(file, job.last_error);
      else await this.transport.writeAtomic(bridgePath('95_LOGS', `${job.input.job_id}.${stage}.${attempt}.error.json`), job.last_error);
      if (job.status === 'quarantined') {
        for (const [folder, suffix] of [['00_INBOX','input.json'],['10_CLAIMED','input.json'],['20_OUTPUT_READY','output.json'],['20_OUTPUT_READY','visual.json'],['20_OUTPUT_READY','title.png'],['20_OUTPUT_READY','title.webp']]) {
          const name = `${job.input.job_id}.${suffix}`, from = bridgePath(folder, name), to = bridgePath('90_ERRORS', name);
          if (await this.transport.metadata(from) && !await this.transport.metadata(to)) await this.transport.move(from, to);
        }
      }
    } catch { /* Oracle journal retains the failure during a Dropbox outage. */ }
  }
  async monitor(now) {
    const folders = {};
    for (const name of ['00_INBOX', '10_CLAIMED', '20_OUTPUT_READY', '90_ERRORS']) folders[name] = await this.transport.list(name);
    const jobs = await this.store.all(), open = jobs.filter(j => !terminal.has(j.status));
    const report = { correction_pending: jobs.filter(j => ['correction_pending','correction_prepared'].includes(j.status)).length, at: now, dropbox_reachable: true, inbox: folders['00_INBOX'].filter(e => /\.(?:input|repair-\d+)\.json$/.test(e.name)).length, claimed: folders['10_CLAIMED'].length,
      output_ready: folders['20_OUTPUT_READY'].filter(e => e.name.endsWith('.output.json')).length,
      errors: jobs.filter(j => ['quarantined','archive_failed'].includes(j.status)).length, oldest_open_minutes: Math.max(0, ...open.map(j => (Date.parse(now) - Date.parse(j.created_at)) / 60000)), alerts: [] };
    const discovery = await this.store.observation('discovery');
    report.discovery_last_success = discovery?.at || null;
    report.last_chatgpt_expected_start = new Date(Math.floor(Date.parse(now)/3600000)*3600000).toISOString();
    report.oldest_claim = null;
    if (!discovery || Date.parse(now) - Date.parse(discovery.at) > 7200000) report.alerts.push('DISCOVERY_OVERDUE');
    if (report.inbox > this.maxPending || report.oldest_open_minutes > 120) report.alerts.push('QUEUE_OVERDUE');
    for (const entry of folders['10_CLAIMED']) {
      if (!entry.name.endsWith('.input.json')) continue;
      const id = entry.name.slice(0, -11), job = jobs.find(j => j.input.job_id === id);
      if (!job || job.ack || folders['20_OUTPUT_READY'].some(e => e.name === `${id}.output.json`)) continue;
      const key = `claim:${id}`, observed = await this.store.observation(key) || { at: now };
      await this.store.observe(key, observed);
      if (!report.oldest_claim || observed.at < report.oldest_claim.at) report.oldest_claim = { job_id: id, at: observed.at };
      if (Date.parse(now) - Date.parse(observed.at) > 7200000) report.alerts.push(`STALE_CLAIM:${id}`);
      // Never reset a claim from age alone; a slow worker could still own it.
    }
    if (report.errors) report.alerts.push('QUARANTINED_JOBS');
    for (const entry of folders['20_OUTPUT_READY'].filter(e => e.name.endsWith('.output.json'))) {
      const id = entry.name.slice(0,-12), job = await this.store.get(id);
      if (!job) { report.alerts.push(`UNKNOWN_OUTPUT:${entry.name}`); continue; }
      const key = `output:${id}`, observed = await this.store.observation(key) || { at: now };
      await this.store.observe(key, observed);
      if (!job.ack && Date.parse(now) - Date.parse(observed.at) > 7200000) report.alerts.push(`OUTPUT_OVERDUE:${id}`);
    }
    Object.assign(report, await this.store.observation('completion-metrics') || { completed: 0, average_queue_minutes: null, last_publication_at: null });
    await this.store.observe('monitor', report);
    await this.transport.writeAtomic(bridgePath('95_LOGS', `${now.replace(/[^0-9TZ]/g, '')}.${hash(report).slice(0,12)}.server.json`), report);
    return report;
  }
}
