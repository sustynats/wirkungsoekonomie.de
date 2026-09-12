import { currentEvidence, latestEvidenceTime } from '../discovery-admission.mjs';
import { slugify } from '../lib.mjs';
import { retainPotentialHistory } from '../impact-potential.mjs';
import { ensureSemanticReview, importSemanticReviews } from './semantic-review.mjs';
import { migrateImpactAssessment, impactClaimLedger, withMagnitudeCalculations } from '../impact-assessment.mjs';
import { canRequestCorrection, prepareCorrection, recoverCorrections } from './corrections.mjs';
import { bridgeInput, adaptOutput, validateOutputBinding, sameBridgeEvent } from './adapter.mjs';
import { BRIDGE_ROOT, bridgePath, parsePacket, outputSchema, hash } from './contract.mjs';
import { storyPage } from '../build.mjs';
import { waitingForReview, observeOutput } from './status.mjs';
import { protectedCurrentCandidate, updateProcessorHealth } from './processor.mjs';

const newsJob = job => ['new_story','story_update','correction'].includes(job.input.job_type);
const terminal = new Set(['acknowledged', 'quarantined', 'archive_failed']);
const retryDue = (job, stage, now) => job.last_error?.stage !== stage || !(Date.parse(job.retry_at) > Date.parse(now));
export class DropboxChatGPTBridgeProvider {
  constructor({ store, transport, visualProvider, editorialEnabled = false, correctionsEnabled = false, stageOnly = true, maxJobs = 6, maxPending = 48, retentionDays = 30, adapt = adaptOutput, semanticReview = ensureSemanticReview }) {
    if (!Number.isInteger(retentionDays) || retentionDays < 30) throw new Error('BRIDGE_RETENTION_INVALID');
    Object.assign(this, { store, transport, visualProvider, editorialEnabled, correctionsEnabled, stageOnly, maxJobs, maxPending, retentionDays, adapt, semanticReview });
  }
  async selectCandidates(candidates, now = new Date().toISOString()) {
    const checkpoints = await this.store.observation('source-checkpoints') || {};
    const active = (await this.store.all()).filter(j => !terminal.has(j.status));
    const activeRequests = active.filter(j => j.input.job_type !== 'impact_semantic_review');
    const selected = [];
    const urgent = c => Number(c.urgent === true || c.preanalysis?.event_score?.priority === 'TOP');
    for (const candidate of [...candidates].sort((a,b) => urgent(b)-urgent(a)
      || Number(currentEvidence(b,now,1))-Number(currentEvidence(a,now,1))
      || latestEvidenceTime(b,now)-latestEvidenceTime(a,now))) {
      if (selected.length >= this.maxJobs) break;
      if (activeRequests.length + selected.length >= this.maxPending && !protectedCurrentCandidate(candidate, now)) continue;
      if (checkpoints[candidate.story_id] === candidate.content_hash || active.some(j => newsJob(j) && sameBridgeEvent(candidate, j.candidate)) || selected.some(c => sameBridgeEvent(candidate,c))) continue;
      selected.push(candidate);
    }
    return selected;
  }
  async enqueue(candidates, stories, now, { testOnly = false } = {}) {
    let jobs = await this.store.all();
    const results = []; let created = 0;
    const retried = new Set();
    // Retry the persisted packet even when subsequent source enrichment changed.
    for (const job of jobs.filter(j => newsJob(j) && j.status === 'prepared')) {
      retried.add(job.input.job_id);
      await this.queuePrepared(job, now, results);
    }
    for (const candidate of candidates) {
      if (created >= this.maxJobs) break;
      if (jobs.filter(j => !terminal.has(j.status) && j.input.job_type !== 'impact_semantic_review').length >= this.maxPending && !protectedCurrentCandidate(candidate, now)) continue;
      const input = bridgeInput(candidate, now, { stories, testOnly });
      let job = await this.store.get(input.job_id);
      if (!job) {
        // Keep one active event package. Material updates are reconsidered from
        // the source queue after the preceding package reaches a terminal state.
        if (jobs.some(j => newsJob(j) && !terminal.has(j.status) && sameBridgeEvent(candidate, j.candidate))) continue;
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
    if (!retryDue(job, 'enqueue', now)) return;
    try {
      await this.transport.writeAtomic(bridgePath('00_INBOX', `${job.input.job_id}.input.json`), job.input);
      job.status = 'queued'; job.queued_at = now; delete job.last_error; delete job.retry_at; await this.store.put(job);
      const checkpoints = await this.store.observation('source-checkpoints') || {};
      if (!job.input.test_only) checkpoints[job.candidate.story_id] = job.candidate.content_hash;
      await this.store.observe('source-checkpoints', checkpoints);
      results.push({ job_id: job.input.job_id, story_id: job.candidate.story_id, status: 'queued' });
    } catch (error) { await this.failure(job, 'enqueue', error, now); }
  }
  async reconcile(registry, stories, now) {
    await importSemanticReviews(this, now);
    if (this.correctionsEnabled) await recoverCorrections(this, now);
    const entries = await this.transport.list('20_OUTPUT_READY');
    const names = new Set(entries.map(e => e.name));
    const results = [];
    for (const job of await this.store.all()) {
      if (!newsJob(job) || terminal.has(job.status)) continue;
      if (!retryDue(job, 'import', now)) continue;
      // Legacy private candidates predate public-page metadata. Derive only the
      // stable route; immutable input, source hashes and approval remain intact.
      if (job.intake_news_parent && !job.candidate.slug) job.candidate = { ...job.candidate,
        slug: `${slugify(job.candidate.title)}-${job.candidate.story_id.slice(-6)}` };
      const jobStories = (job.input.test_only || job.intake_news_parent) && !stories.some(s => s.story_id === job.candidate.story_id)
        ? [...stories, job.candidate] : stories;
      if (job.status === 'accepted') {
        const accepted = job.accepted;
        if (!accepted.record || accepted.staged || stories.some(s => s.bridge_import?.job_id === job.input.job_id && s.bridge_import.output_hash === accepted.output_hash)) { results.push(accepted); continue; }
        // Recover only against the still-current source/analysis version.
        try {
          const output = parsePacket(await this.transport.read(bridgePath('20_OUTPUT_READY', `${job.input.job_id}.output.json`)), outputSchema);
          if (hash(output) !== accepted.output_hash) throw new Error('BRIDGE_ACCEPTED_OUTPUT_CHANGED');
          const recovered = structuredClone(output);
          if (job.semantic_review?.output_hash === hash(output) && recovered.wirkungsticker?.analysis) {
            const raw = recovered.wirkungsticker.analysis;
            (Array.isArray(raw.analyses) ? raw.analyses[0] : raw).impact_assessment = job.semantic_review.assessment;
          }
          this.adapt(recovered, job, registry, jobStories, now);
          results.push(accepted);
        } catch (error) { await this.failure(job, 'import', error, now); }
        continue;
      }
      if (!names.has(`${job.input.job_id}.output.json`)) continue;
      try {
        const output = parsePacket(await this.transport.read(bridgePath('20_OUTPUT_READY', `${job.input.job_id}.output.json`)), outputSchema);
        if (this.adapt === adaptOutput) validateOutputBinding(output, job, jobStories, now);
        let validatedOutput = output;
        if (['publish','merge'].includes(output.decision.status)) {
          const raw = output.wirkungsticker?.analysis;
          const analysis = Array.isArray(raw?.analyses) ? raw.analyses[0] : raw;
          const record = { ...job.candidate, title: output.story.headline, source_summary: output.story.detailed_summary, analysis };
          const proposed = analysis?.impact_assessment || migrateImpactAssessment(analysis || {}, { title: record.title });
          const gate = await this.semanticReview(this, job, output, record, proposed, now);
          if (gate.status !== 'ready') continue;
          if (job.semantic_review) job.semantic_review.verified_context_sources = gate.record?.impact_sources || [];
          await this.store.put(job);
          validatedOutput = structuredClone(output);
          const approved = validatedOutput.wirkungsticker?.analysis;
          if (approved) (Array.isArray(approved.analyses) ? approved.analyses[0] : approved).impact_assessment = gate.assessment;
        }
        const result = this.adapt(validatedOutput, job, registry, jobStories, now);
        if (result.record?.impact_assessment) {
          result.record.impact_assessment = withMagnitudeCalculations(result.record.impact_assessment);
          retainPotentialHistory(result.record, result.record.impact_assessment, {at:now, jobId:job.input.job_id});
          result.record.impact_assessment.publication_status = 'ready';
          result.record.impact_claims = impactClaimLedger(result.record.impact_assessment, [...result.record.sources,...(result.record.impact_sources || [])], now);
        }
        if (result.record?.bridge_import) result.record.bridge_import.output_hash = hash(output);
        if (result.record && job.semantic_review) result.record.impact_semantic_review = { review_job_id: job.semantic_review.review_job_id, reviewed_at: job.semantic_review.reviewed_at, status: 'ready' };
        const staged = this.stageOnly || job.input.test_only || Boolean(job.intake_news_parent);
        let visual = null;
        if (result.record && this.visualProvider) {
          visual = await this.visualProvider.receive(job, now, { output, record: result.record, staged });
          if (visual.status === 'pending') continue;
          // Missing/failed imagery follows the existing free impact-card path.
          // Existing imagery is never bought again as a bridge fallback.
        }
        const accepted = { ...result, story_id: job.candidate.story_id, input_content_hash: job.candidate.content_hash, job_id: job.input.job_id, staged, visual, output_hash: hash(output), accepted_at: now };
        job.accepted = { ...accepted, ...(visual?.file ? { visual: { ...visual, file: undefined } } : {}) };
        job.status = 'accepted'; job.accepted_at = now; delete job.last_error; delete job.retry_at;
        job.output_detected_at = (await this.store.observation(`output:${job.input.job_id}`))?.at || now;
        if (staged && result.record) job.staging = { record: result.record, html: storyPage(result.record), visual_sha256: visual?.sha256 || null, ...(visual?.staging ? { image: visual.staging } : {}) };
        await this.store.put(job); // durable staging BEFORE any ACK
        results.push(accepted);
      } catch (error) { await this.failure(job, 'import', error, now); }
    }
    return results;
  }
  async finalize(stories, now, { committed = false, editorials = [] } = {}) {
    // ACK/archive work must not monopolize the same lock needed to pick up news.
    // Resume durably on the next ordinary importer run; waiting is not an error.
    const limit=Math.min(12,Math.max(1,this.maxJobs)),deadline=Date.now()+90000;
    let ackAttempts=0,archiveAttempts=0;
    const jobs=(await this.store.all()).sort((a,b)=>Date.parse(b.accepted_at||b.created_at)-Date.parse(a.accepted_at||a.created_at));
    for (const job of jobs) {
      if(ackAttempts>=limit||Date.now()>=deadline)break;
      if (job.status !== 'accepted') continue;
      if (!retryDue(job, 'ack', now)) continue;
      const item = job.accepted;
      const article = item.record || item.editorial;
      if (article && !item.staged) {
        if (!committed) continue;
        const persisted = item.editorial ? editorials.find(s => s.analysis_id === article.analysis_id) : stories.find(s => s.story_id === article.story_id);
        const receipt = item.impact ? persisted?.impact_import : persisted?.bridge_import;
        if (receipt?.job_id !== job.input.job_id || receipt.output_hash !== item.output_hash) continue;
      }
      const ack = job.ack || { schema_version: '1.0', job_id: job.input.job_id,
        status: item.staged ? 'staged' : article ? 'imported' : item.decision,
        imported_at: now, publication_id: !item.staged && article ? article.analysis_id || article.story_id : null,
        url: !item.staged && article ? `https://wirkungsoekonomie.de/wirkungsticker/${item.editorial ? 'analyse/' : ''}${article.slug}/` : null,
        output_hash: item.output_hash, test_only: job.input.test_only };
      try {
        ackAttempts++;
        job.ack = ack; await this.store.put(job);
        await this.transport.writeAtomic(bridgePath('30_ACK', `${job.input.job_id}.ack.json`), ack);
        job.status = 'acknowledged'; job.completed_at = now; job.output_imported_at = now;
        delete job.last_error; delete job.retry_at;
        job.processing_latency = (Date.parse(job.accepted_at) - Date.parse(job.queued_at || job.created_at)) / 1000;
        job.import_pickup_latency = (Date.parse(now) - Date.parse(job.output_detected_at || job.accepted_at)) / 1000;
        await this.store.put(job);
      } catch (error) { await this.failure(job, 'ack', error, now); }
    }
    // Retry archival independently of import. ACK remains as completion receipt.
    for (const job of await this.store.all()) {
      if(archiveAttempts>=Math.min(4,limit)||Date.now()>=deadline)break;
      if (job.status !== 'acknowledged' || job.archived_at) continue;
      if (!retryDue(job, 'archive', now)) continue;
      const id = job.input.job_id;
      try {
      archiveAttempts++;
      for (const correction of job.corrections || []) for (const folder of ['00_INBOX','10_CLAIMED']) await this.transport.archive(bridgePath(folder, `${id}.repair-${correction.attempt}.json`), id, job.completed_at);
      for (const [folder, suffix] of [['00_INBOX','input.json'],['10_CLAIMED','input.json'],['20_OUTPUT_READY','output.json'],['20_OUTPUT_READY','visual.json'],['20_OUTPUT_READY','title.png'],['20_OUTPUT_READY','title.webp']]) {
        await this.transport.archive(bridgePath(folder, `${id}.${suffix}`), id, job.completed_at);
      }
      await this.transport.writeAtomic(`${BRIDGE_ROOT}/40_ARCHIVE/${job.completed_at.slice(0,10).replaceAll('-','/')}/${id}/${id}.ack.json`, job.ack);
      job.archived_at = now;
      delete job.last_error; delete job.retry_at;
      job.retain_until = new Date(Date.parse(now) + this.retentionDays * 86400000).toISOString();
      await this.store.put(job);
      } catch (error) { await this.failure(job, 'archive', error, now); }
    }
  }
  async failure(job, stage, error, now) {
    const attempt = (job.attempts[stage] || 0) + 1;
    job.attempts[stage] = attempt;
    const code = /^BRIDGE_[A-Za-z_0-9:.$\[\]-]{1,190}$/.test(error.message || '') ? error.message : 'BRIDGE_OPERATION_FAILED';
    // A temporary Dropbox refusal is not an invalid editorial package. Keep
    // the same durable job, with one bounded attempt per due server cycle.
    const infrastructure = error.retryable === true && (/^(?:BRIDGE_DROPBOX_HTTP_(?:429|5\d\d)|BRIDGE_REMOTE_TIMEOUT|BRIDGE_RESEARCH_UNAVAILABLE|BRIDGE_CARD_RENDER_PENDING)$/.test(code)
      || code === 'BRIDGE_REMOTE_INVALID_RESPONSE' && error.transient_read_failure === true);
    const retryable = error.retryable === true && (infrastructure || attempt < 3);
    job.last_error = { job_id: job.input.job_id, stage, error_code: code, message: code, retryable, failed_at: now, attempt };
    if (infrastructure) {
      const requested = Number(error.retry_after_seconds);
      // A publisher's explicit crawl window is a scheduling condition, not a
      // repeatedly failing service. Earlier repairs must not turn a two-minute
      // source wait into an hour. Longer publisher deadlines remain binding.
      const crawlWait = code === 'BRIDGE_RESEARCH_UNAVAILABLE' && Number.isFinite(requested) && requested > 0
        && error.issues?.some(issue => typeof issue === 'string' && /^ROBOTS_CRAWL_DELAY_DEFERRED:research-[a-z0-9-]+$/.test(issue));
      const backoff = crawlWait ? 300 : Math.min(3600, 300 * 2 ** Math.min(attempt - 1, 4));
      if (Number.isFinite(requested) && requested > 0) job.last_error.retry_after_seconds = requested;
      job.retry_at = new Date(Date.parse(now) + Math.max(backoff, Number.isFinite(requested) ? requested : 0) * 1000).toISOString();
    }
    if (Array.isArray(error.issues)) job.last_error.issues = error.issues.map(issue => typeof issue === 'string' ? issue.slice(0,160) : String(issue.code || 'VALIDATION_FAILED').slice(0,160)).slice(0,50);
    if (this.correctionsEnabled && canRequestCorrection(job, stage, job.last_error)) {
      try { await prepareCorrection(this, job, job.last_error, now); return; }
      catch { /* Normal durable failure path remains available if preparation fails. */ }
    }
    if (!retryable) job.status = stage === 'archive' ? 'archive_failed' : 'quarantined';
    await this.store.put(job);
    if (infrastructure) return; // Do not issue extra Dropbox writes during its refusal window.
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
    if (report.inbox > this.maxPending) report.alerts.push('QUEUE_CAPACITY_EXCEEDED');
    const claims = new Map();
    for (const entry of folders['10_CLAIMED']) {
      const match = /^(.*)\.(input|repair-(\d+))\.json$/.exec(entry.name);
      if (!match) continue;
      const generation = Number(match[3] || 0);
      if (!claims.has(match[1]) || claims.get(match[1]).generation < generation) claims.set(match[1], { name: entry.name, generation });
    }
    for (const [id, entry] of claims) {
      const job = jobs.find(j => j.input.job_id === id);
      if (!job || terminal.has(job.status) || job.ack || await waitingForReview(this.store, job)
        || folders['20_OUTPUT_READY'].some(e => e.name === `${id}.output.json`)) continue;
      const key = `claim:${id}`, previous = await this.store.observation(key);
      // Only an explicitly new repair generation starts a new observation;
      // age alone can never release or reset an existing claim.
      const observed = previous && (!previous.name || previous.name === entry.name)
        ? { ...previous, name: entry.name } : { at: now, name: entry.name };
      await this.store.observe(key, observed);
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
      const id = entry.name.slice(0,-12), job = await this.store.get(id);
      if (!job) { report.alerts.push(`UNKNOWN_OUTPUT:${entry.name}`); continue; }
      if (job.status === 'correction_prepared') continue;
      const observed = await observeOutput(this.store, job, now);
      if (!job.ack && !terminal.has(job.status) && !await waitingForReview(this.store, job)
        && Date.parse(now) - Date.parse(observed.at) >= 600000) report.alerts.push(`OUTPUT_OVERDUE:${id}`);
    }
    Object.assign(report, await this.store.observation('completion-metrics') || { completed: 0, average_queue_minutes: null, last_publication_at: null });
    try {
      report.processor_health = await updateProcessorHealth(this.store, this.transport, now);
      report.alerts.push(...report.processor_health.alerts);
    } catch {
      // Discovery and import survive a monitoring failure; never report healthy.
      report.alerts.push('PROCESSOR_HEALTH_UNAVAILABLE');
    }
    await this.store.observe('monitor', report);
    await this.transport.writeAtomic(bridgePath('95_LOGS', `${now.replace(/[^0-9TZ]/g, '')}.${hash(report).slice(0,12)}.server.json`), report);
    return report;
  }
}
