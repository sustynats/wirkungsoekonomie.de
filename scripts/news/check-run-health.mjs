import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_REPORT = path.join(ROOT, "reports/wirkungsticker-latest-run.json");

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
  if (report?.ai_error) errors.push("AI_PROVIDER_DEGRADED");
  if (Number(report?.source_successes || 0) === 0) errors.push("NO_SOURCE_SUCCEEDED");
  if (Number(report?.source_failures || 0) > 0) errors.push("SOURCE_COVERAGE_DEGRADED");
  if (report?.status && report.status !== "ok") errors.push("RUN_STATUS_NOT_OK");

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
