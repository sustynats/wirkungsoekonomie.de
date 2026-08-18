import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("state deliveries contain the complete required handoff and write READY last", () => {
  const source = readFileSync("lib/autopilot/state-daily-delivery.ts", "utf8");
  for (const name of [
    "STATE-GOVERNMENT-DELTA.jsonl",
    "STATE-PARLIAMENT-DELTA.jsonl",
    "ELECTION-DELTA.jsonl",
    "PROGRAMME-DELTA.jsonl",
    "MANDATE-DELTA.jsonl",
    "LEGAL-ACTS.jsonl",
    "FEDERAL-COUNCIL-POSITIONS.jsonl",
    "IMPLEMENTATION-DELTA.jsonl",
    "SOURCE-MANIFEST.jsonl",
    "OPEN-DATA-ISSUES.csv",
    "INGESTION-REPORT.md",
    "MANIFEST.json",
    "READY.json",
  ]) assert.match(source, new RegExp(name.replaceAll(".", "\\.")));
  assert.ok(source.lastIndexOf("READY.json") > source.lastIndexOf("MANIFEST.json"));
  assert.match(source, /CONTENT_CHANGED_AFTER_HANDOFF/);
});

test("programme monitoring archives the original bytes and never creates an impact direction", () => {
  const source = readFileSync("lib/autopilot/state-programme-monitor.ts", "utf8");
  assert.match(source, /uploadDropboxBytes/);
  assert.match(source, /content_hash/);
  assert.match(source, /ORIGINAL_ARCHIVED_COMMITMENTS_NOT_EXTRACTED/);
  assert.match(source, /READY\.json/);
  assert.doesNotMatch(source, /impact_direction\s*:/);
  assert.doesNotMatch(source, /party_score\s*:/);
});

test("the programme registry marks missing originals without inventing a final URL", () => {
  const registry = JSON.parse(readFileSync("data/autopilot/programme-source-registry.json", "utf8"));
  const missing = registry.sources.find((entry: { programme_source_id: string }) => entry.programme_source_id === "DE-BE-2026-AFD");
  assert.equal(missing.source_url, null);
  assert.equal(missing.source_status, "SOURCE_FRAGMENT_REVIEW_REQUIRED");
});
