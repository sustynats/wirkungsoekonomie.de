import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_REPORT = path.join(ROOT, "reports/wirkungsticker-latest-run.json");

export function isolatedSourceThrottleWithRecentCoverage(report = {}) {
  // A one-source retry window is not a sample of the whole portfolio. Only
  // known throttling qualifies, with independently timestamped fresh coverage;
  // never excuse parser/access errors or infer health from not-due counts alone.
  if (report.sources_scheduled !== 1 || report.source_failures !== 1
    || report.source_successes !== 0 || !(report.sources_not_due >= 3)) return false;
  const errors = report.source_errors;
  if (!Array.isArray(errors) || errors.length !== 1
    || !/^(?:ROBOTS_UNAVAILABLE|FEED_HTTP)_429$/.test(errors[0]?.error || "")) return false;
  const at = Date.parse(report.started_at);
  if (!Number.isFinite(at) || !Array.isArray(report.source_health)) return false;
  const failed = report.source_health.find(source => source.source_id === errors[0].source_id);
  if (!failed || failed.last_error !== errors[0].error) return false;
  const publishers = new Set(report.source_health.filter(source => {
    const age = at - Date.parse(source.last_success);
    const interval = Number(source.interval_minutes);
    return source.source_id !== errors[0].source_id && source.status === "active"
      && !source.last_error && typeof source.publisher_id === "string" && source.publisher_id
      && Number.isFinite(interval) && interval > 0 && Number.isFinite(age)
      && age >= 0 && age <= Math.min(60, interval) * 60000;
  }).map(source => source.publisher_id));
  return publishers.size >= 3;
}

export function sourceCoverageDegraded(report = {}) {
  const failures = Math.max(0, Number(report.source_failures || 0));
  const successes = Math.max(0, Number(report.source_successes || 0));
  const scheduled = Math.max(0, Number(report.sources_scheduled ?? successes + failures));
  if (failures === 0) return false;
  if (successes === 0 && scheduled !== 0) return !isolatedSourceThrottleWithRecentCoverage(report);
  const attempted = Math.max(1, successes + failures);
  // A single transient 429/timeout must stay observable and retryable without
  // turning an otherwise complete run into a deployment incident. Alert on a
  // material slice of the due catalogue or on several simultaneous failures.
  return failures >= 3 || (failures >= 2 && failures / attempted >= 0.2);
}

export function reportOperationallyHealthy(report = {}) {
  if (report.ai_error || sourceCoverageDegraded(report)) return false;
  if (report.operational_status) return report.operational_status === "ok";
  if (!report.status || report.status === "ok") return true;
  if (report.status === "degraded") return Number(report.source_failures || 0) > 0
    || Boolean(report.input_holds?.length || report.source_integrity_holds?.length || report.quality_holds?.length);
  return false;
}

export function evaluateRunHealth(report, options = {}) {
  const errors = [];
  const startedAt = Date.parse(report?.started_at || 0);
  const completedAt = Date.parse(report?.completed_at || 0);
  const expectedAfter = options.expectedAfter ? Date.parse(options.expectedAfter) : null;
  const maxAgeMinutes = Math.max(1, Number(options.maxAgeMinutes || 90));
  const nowMs = new Date(options.now || Date.now()).getTime();

  if (!Number.isFinite(startedAt)) errors.push("RUN_STARTED_AT_MISSING");
  if (!Number.isFinite(completedAt) || (Number.isFinite(startedAt) && completedAt < startedAt)) errors.push("RUN_NOT_COMPLETED");
  if (expectedAfter !== null && (!Number.isFinite(expectedAfter) || !Number.isFinite(startedAt) || startedAt < expectedAfter)) errors.push("RUN_REPORT_STALE");
  if (!options.expectedAfter && Number.isFinite(startedAt) && nowMs - startedAt > maxAgeMinutes * 60 * 1000) errors.push("RUN_REPORT_STALE");
  if (report?.ai_error) errors.push(report.ai_error === 'AI_BUDGET_EXHAUSTED' ? 'AI_BUDGET_EXHAUSTED' : report.ai_error === "AI_INPUT_TOO_LARGE" ? "AI_INPUT_BLOCKED" : "AI_PROVIDER_DEGRADED");
  if (Number(report?.source_successes || 0) === 0 && report?.sources_scheduled !== 0
    && !isolatedSourceThrottleWithRecentCoverage(report)) errors.push("NO_SOURCE_SUCCEEDED");
  if (sourceCoverageDegraded(report)) errors.push("SOURCE_COVERAGE_DEGRADED");
  if (!reportOperationallyHealthy(report)) errors.push("RUN_STATUS_NOT_OK");

  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}

function argumentValue(name) {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const reportPath = path.resolve(argumentValue("report") || DEFAULT_REPORT);
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const result = evaluateRunHealth(report, {
    expectedAfter: argumentValue("started-after") || process.env.WOEK_NEWS_EXPECTED_AFTER,
    maxAgeMinutes: Number(argumentValue("max-age-minutes") || process.env.WOEK_NEWS_HEALTH_MAX_AGE_MINUTES || 90),
  });
  console.log(JSON.stringify({ ...result, report: reportPath, status: report.status || "legacy" }, null, 2));
  if (!result.ok) process.exitCode = 1;
}
