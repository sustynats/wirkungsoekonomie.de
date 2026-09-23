import assert from "node:assert/strict";
import test from "node:test";
import { mergeByIdPreservingPublished, parseValidRecords } from "../scripts/observatory-sync-validation.mjs";

test("observatory sync isolates invalid legacy records without publishing them", () => {
  const validate = (record) => record?.schema_version === "current";
  validate.errors = [{ keyword: "required", message: "schema_version is required" }];
  const rejected = [];

  const records = parseValidRecords([
    JSON.stringify({ schema_version: "current", id: "valid-1" }),
    JSON.stringify({ id: "legacy" }),
    "not-json",
    JSON.stringify({ schema_version: "current", id: "valid-2" }),
  ].join("\n"), validate, "APPROVED_PUBLIC_EVIDENCE_EVENTS-test.jsonl", (entry) => rejected.push(entry));

  assert.deepEqual(records.map((entry) => entry.id), ["valid-1", "valid-2"]);
  assert.equal(rejected.length, 2);
  assert.deepEqual(rejected.map((entry) => entry.line), [2, 3]);
  assert.match(rejected[0].reason, /schema mismatch/);
  assert.match(rejected[1].reason, /invalid JSON/);
});

test("observatory sync treats an invalid JSON document as an isolated rejection", () => {
  const validate = () => true;
  const rejected = [];

  const records = parseValidRecords("{broken", validate, "EVIDENCE-EVENT-test.json", (entry) => rejected.push(entry));

  assert.deepEqual(records, []);
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].line, 1);
});

test("observatory sync preserves a published record when an approved candidate conflicts", () => {
  const existing = [{ evidence_event_id: "event-1", summary: "published" }];
  const incoming = [
    { evidence_event_id: "event-1", summary: "changed without version" },
    { evidence_event_id: "event-2", summary: "new" },
  ];
  const conflicts = [];

  const merged = mergeByIdPreservingPublished(existing, incoming, "evidence_event_id", (entry) => conflicts.push(entry));

  assert.deepEqual(merged, [
    { evidence_event_id: "event-1", summary: "published" },
    { evidence_event_id: "event-2", summary: "new" },
  ]);
  assert.deepEqual(conflicts.map((entry) => entry.id), ["event-1"]);
});
