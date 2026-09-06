// Account for paid work in a failed runner whose atomic publish never reached
// main. Recover only the machine report, never accept unpublished article text.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

export function reportFromRunLog(log) {
  const lines = String(log).split('\n').filter(line => line.includes('\tImport, analyze and build\t'))
    .map(line => line.replace(/^.*?\tImport, analyze and build\t\S+ /, ''));
  const start = lines.findIndex(line => line.trim() === '{');
  if (start < 0) return null; // Failed before a completed analysis report.
  const body = lines.slice(start).join('\n');
  const report = JSON.parse(body.slice(0, body.lastIndexOf('}') + 1));
  if (report.schema_version !== '1.2' || !Number.isFinite(Date.parse(report.started_at))
      || !Number.isFinite(Date.parse(report.completed_at))) throw Error('RECOVERY_REPORT_INVALID');
  for (const key of ['ai_calls', 'input_tokens', 'output_tokens', 'estimated_cost_usd']) {
    if (!Number.isFinite(report[key]) || report[key] < 0) throw Error(`RECOVERY_USAGE_INVALID:${key}`);
  }
  return report;
}

export function recoverUsageReport(usage, report, workflow, now) {
  const runId = `news-run-${createHash('sha256').update(report.started_at).digest('hex').slice(0,12)}`;
  if ((usage.runs || []).some(run => run.run_id === runId || run.started_at === report.started_at)) return false;
  const started = Date.parse(report.started_at);
  if (workflow.conclusion !== 'failure' || started < Date.parse(workflow.created_at)
      || started > Date.parse(workflow.updated_at)) throw Error('RECOVERY_RUN_BINDING_INVALID');
  (usage.runs ||= []).push({
    run_id: runId, started_at: report.started_at, completed_at: report.completed_at,
    berlin_slot: report.berlin_slot,
    processing_version: report.processing_version || 'legacy',
    counts: { ai_requests: report.ai_calls, ai_stories: report.ai_stories || 0, published_stories: 0, updated_stories: 0 },
    ai: { requests: report.ai_calls, input_tokens: report.input_tokens, output_tokens: report.output_tokens,
      estimated_cost_usd: report.estimated_cost_usd, token_source: report.token_source },
    recovery: { recovered_at: now, github_run_id: workflow.id, url: workflow.html_url,
      publication_committed: false, report_published_stories: report.published_stories || 0,
      report_updated_stories: report.updated_stories || 0 },
  });
  return true;
}

export function recoverFailedUsage({ root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), now = new Date().toISOString(), write = true, gh = args => execFileSync('gh', args, { encoding:'utf8', maxBuffer:24*1024*1024 }) } = {}) {
  const file = path.join(root, 'data/news/usage.json');
  const usage = JSON.parse(fs.readFileSync(file, 'utf8'));
  const registry = usage.failed_run_recovery || { checked_run_ids: [] };
  const checked = new Set(registry.checked_run_ids || []);
  const { workflow_runs: runs } = JSON.parse(gh(['api', 'repos/sustynats/wirkungsoekonomie.de/actions/workflows/wirkungsticker.yml/runs?status=failure&per_page=30']));
  let recovered = 0;
  const unresolved = [];
  for (const run of runs) {
    if (checked.has(run.id) || !run.created_at.startsWith(now.slice(0,7))) continue;
    try {
      const report = reportFromRunLog(gh(['run','view',String(run.id),'--repo','sustynats/wirkungsoekonomie.de','--log']));
      if (report && recoverUsageReport(usage, report, run, now)) recovered++;
      checked.add(run.id);
    } catch { unresolved.push(run.id); }
  }
  usage.failed_run_recovery = { checked_at:now, checked_run_ids:[...checked].slice(-200), unresolved_run_ids:unresolved, status:unresolved.length ? 'open' : 'checked' };
  if (write) fs.writeFileSync(file, `${JSON.stringify(usage,null,2)}\n`);
  return { recovered_runs:recovered, checked_runs:checked.size, unresolved_run_ids:unresolved, recovered_cost_usd:usage.runs.filter(run => run.recovery?.recovered_at === now).reduce((sum,run)=>sum+run.ai.estimated_cost_usd,0) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(recoverFailedUsage({write:!process.argv.includes('--dry-run')})));
