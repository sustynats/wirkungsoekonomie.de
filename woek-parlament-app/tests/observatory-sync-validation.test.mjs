import assert from "node:assert/strict";
import test from "node:test";
import { parseValidRecords } from "../scripts/observatory-sync-validation.mjs";

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
