import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const records = readFileSync("data/government/impact-cases/public-impact-records.jsonl", "utf8")
  .trim().split("\n").map((line) => JSON.parse(line));
const meta = JSON.parse(readFileSync("data/government/impact-cases/public-impact-records-meta.json", "utf8"));
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

test("all 63 fachlich approved government ImpactCases are preserved", () => {
  assert.equal(records.length, 63);
  assert.equal(meta.impact_cases_total, 63);
  assert.equal(meta.impact_cases_published, 63);
  assert.equal(meta.impact_cases_full_schema_2_0_1, 6);
  assert.equal(meta.impact_cases_compact_source_preserved, 57);
  assert.equal(meta.fach_content_loss, 0);
  assert.equal(new Set(records.map((record) => record.impact_case_id)).size, records.length);
});

test("each public ImpactCase retains raw data, full Fachtext and release hashes", () => {
  for (const record of records) {
    assert.equal(record.publication_status, "APPROVED");
    assert.ok(record.impact_case_id);
    assert.ok(record.title);
    assert.ok(Object.values(record.impact_summary).some((value) => typeof value === "string" && value.trim().length > 0), record.impact_case_id);
    assert.ok(record.full_analysis_markdown.length > 100, record.impact_case_id);
    assert.equal(hash(record.full_analysis_markdown), record.source_release.case_markdown_sha256, record.impact_case_id);
    assert.ok(record.source_release.jsonl_sha256);
    assert.ok(record.source_release.markdown_sha256);
    assert.equal(typeof record.raw_record, "object");
  }
});

test("full-schema cases are exact projections and compact cases are not silently upgraded", () => {
  for (const record of records) {
    if (record.record_profile === "FULL_SCHEMA_2_0_1") {
      assert.equal(record.schema_validation, "PASS");
      assert.equal(record.raw_record.impact_case_id, record.impact_case_id);
      assert.equal(record.raw_record.title, record.title);
      assert.equal(record.raw_record.analysis_mode, record.analysis_mode);
      assert.equal(record.raw_record.impact_summary.public_summary, record.impact_summary.public_summary);
      assert.equal(record.raw_record.fach_review.status === "APPROVED" || record.raw_record.fach_review.status === "APPROVED_WITH_OPEN_DATA", true);
    } else {
      assert.equal(record.record_profile, "VERIFIED_FACH_RELEASE_COMPACT");
      assert.equal(record.schema_validation, "COMPACT_SOURCE_PRESERVED_NO_SCHEMA_REPAIR");
      assert.equal(record.schema_id, null);
    }
  }
});

test("direction, evidence and boundary status remain separate categorical fields", () => {
  const directions = new Set(["POSITIVE", "NEGATIVE", "NEUTRAL", "AMBIVALENT", "OPEN"]);
  const evidence = new Set(["HIGH", "MEDIUM", "LOW", "NOT_ASSESSABLE"]);
  const boundaries = new Set(["PASS", "WATCH", "BLOCK", "OPEN"]);
  for (const record of records) {
    assert.equal(directions.has(record.primary_direction), true, record.impact_case_id);
    assert.equal(evidence.has(record.evidence_level), true, record.impact_case_id);
    assert.equal(boundaries.has(record.boundary_status), true, record.impact_case_id);
    if (record.primary_direction === "OPEN") assert.notEqual(record.primary_direction, "NEUTRAL");
  }
});

test("public impact store contains no person or party score", () => {
  const payload = JSON.stringify(records);
  for (const forbidden of ["government_score", "minister_score", "person_score", "party_score"]) {
    assert.equal(payload.includes(`\"${forbidden}\"`), false, forbidden);
  }
});
