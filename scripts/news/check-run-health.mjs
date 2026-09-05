import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_REPORT = path.join(ROOT, "reports/wirkungsticker-latest-run.json");

export function sourceCoverageDegraded(report = {}) {
  const failures = Math.max(0, Number(report.source_failures || 0));
  const successes = Math.max(0, Number(report.source_successes || 0));
  const scheduled = Math.max(0, Number(report.sources_scheduled ?? successes + failures));
  if (failures === 0) return false;
  if (successes === 0 && scheduled !== 0) return true;
  const attempted = Math.max(1, successes + failures);
  // A single transient 429/timeout must stay observable and retryable without
  // turning an otherwise complete run into a deployment incident. Alert on a
  // material slice of the due catalogue or on several simultaneous failures.
  return failures >= 3 || (failures >= 2 && failures / attempted >= 0.2);
}

export function reportOperationallyHealthy(report = {}) {
  if (report.ai_error || report.input_holds?.length || sourceCoverageDegraded(report)) return false;
  if (!report.status || report.status === "ok") return true;
  return report.status === "degraded" && Number(report.source_failures || 0) > 0;
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
  if (report?.input_holds?.length) errors.push("AI_INPUT_BLOCKED");
  if (Number(report?.source_successes || 0) === 0 && report?.sources_scheduled !== 0) errors.push("NO_SOURCE_SUCCEEDED");
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
