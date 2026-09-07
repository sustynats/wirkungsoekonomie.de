import test from "node:test";
import assert from "node:assert/strict";
import { isolatedSourceThrottleWithRecentCoverage, sourceCoverageDegraded, evaluateRunHealth, reportOperationallyHealthy } from "../../scripts/news/check-run-health.mjs";

const now = "2026-09-07T00:36:19Z";
const fixture = () => ({
  started_at: now, completed_at: "2026-09-07T00:37:00Z",
  status: "ok", operational_status: "ok",
  source_successes: 0, source_failures: 1, sources_scheduled: 1, sources_not_due: 48,
  source_errors: [{ source_id: "retry-source", error: "ROBOTS_UNAVAILABLE_429" }],
  source_health: [
    { source_id: "retry-source", publisher_id: "retry-publisher", status: "governance_hold", last_error: "ROBOTS_UNAVAILABLE_429", last_success: "2026-09-05T12:00:00Z", interval_minutes: 15 },
    ...["one", "two", "three"].map(id => ({ source_id: id, publisher_id: id, status: "active", last_error: null, last_success: "2026-09-07T00:21:45Z", interval_minutes: 15 })),
  ],
});

test("one throttled due source does not turn recently verified portfolio coverage into an outage", () => {
  const report = fixture(), before = structuredClone(report);
  assert.equal(isolatedSourceThrottleWithRecentCoverage(report), true);
  assert.equal(sourceCoverageDegraded(report), false);
  assert.deepEqual(evaluateRunHealth(report, { now: "2026-09-07T00:38:00Z" }), { ok: true, errors: [] });
  assert.deepEqual(report, before, "source error, zero successes and governance hold remain unchanged");
});

test("not-due counts alone, stale, future, missing or contradictory timestamps do not establish coverage", () => {
  for (const patch of [
    { source_health: [] }, { sources_not_due: 0 }, { started_at: "invalid" },
    ...["2026-09-07T00:00:00Z", "2026-09-07T00:37:00Z", null, "invalid"].map(last_success => ({ source_health: fixture().source_health.map(s => ({ ...s, last_success })) })),
  ]) assert.equal(isolatedSourceThrottleWithRecentCoverage({ ...fixture(), ...patch }), false);
});

test("healthy evidence needs three distinct recent publishers and valid cadence", () => {
  for (const patch of [{ publisher_id: "same" }, { publisher_id: null }, { status: "stale_content" }, { last_error: "FEED_HTTP_503" }, { interval_minutes: null }]) {
    const r = fixture(); r.source_health = r.source_health.map((s, i) => i ? { ...s, ...patch } : s);
    assert.equal(isolatedSourceThrottleWithRecentCoverage(r), false);
  }
  const r = fixture(); r.source_health.pop();
  assert.equal(isolatedSourceThrottleWithRecentCoverage(r), false);
});

test("parser failures, access denial and broad outages are never excused by fresh history", () => {
  for (const code of ["SOURCE_PARSER_DRIFT_OR_EMPTY_FEED", "ROBOTS_UNAVAILABLE_403", "ROBOTS_DISALLOWED", "FEED_HTTP_503"]) {
    const r = fixture(); r.source_errors[0].error = code; r.source_health[0].last_error = code;
    assert.equal(sourceCoverageDegraded(r), true);
    assert.ok(evaluateRunHealth(r, { now }).errors.includes("NO_SOURCE_SUCCEEDED"));
  }
  assert.equal(sourceCoverageDegraded({ ...fixture(), source_failures: 3, sources_scheduled: 3 }), true);
  assert.equal(sourceCoverageDegraded({ ...fixture(), source_successes: 8, source_failures: 3, sources_scheduled: 11 }), true);
  const unmatched = fixture(); unmatched.source_errors[0].source_id = "unknown";
  assert.equal(sourceCoverageDegraded(unmatched), true);
});

test("old explicit degraded status and provider or budget errors are not overwritten", () => {
  assert.equal(reportOperationallyHealthy({ ...fixture(), operational_status: "degraded" }), false);
  for (const ai_error of ["AI_PROVIDER_ERROR:503", "AI_BUDGET_EXHAUSTED"])
    assert.equal(evaluateRunHealth({ ...fixture(), ai_error }, { now }).ok, false);
});
