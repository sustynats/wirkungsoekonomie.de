import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const records = readFileSync("data/government/impact-cases/public-impact-records.jsonl", "utf8")
  .trim().split("\n").map((line) => JSON.parse(line));
const reviewRecords = readFileSync("data/government/impact-cases/review-impact-records.jsonl", "utf8")
  .trim().split("\n").map((line) => JSON.parse(line));
const meta = JSON.parse(readFileSync("data/government/impact-cases/public-impact-records-meta.json", "utf8"));
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

test("all 63 fachliche government ImpactCases are preserved across public and review stores", () => {
  assert.equal(records.length, meta.impact_cases_published);
  assert.equal(reviewRecords.length, meta.impact_cases_blocked_editorial_quality);
  assert.equal(records.length + reviewRecords.length, 63);
  assert.equal(meta.impact_cases_total, 63);
  assert.equal(meta.impact_cases_published, 53);
  assert.equal(meta.impact_cases_blocked_editorial_quality, 10);
  assert.equal(meta.editorial_evidence_backfill_count, 19);
  assert.equal(meta.impact_cases_full_schema_2_0_1, 6);
  assert.equal(meta.impact_cases_compact_source_preserved, 57);
  assert.equal(meta.fach_content_loss, 0);
  assert.equal(meta.editorial_layer_status, "LEADING_PUBLIC_EDITORIAL_LAYER");
  assert.equal(meta.editorial_layer_coverage, 63);
  assert.equal(new Set([...records, ...reviewRecords].map((record) => record.impact_case_id)).size, 63);
});

test("each public ImpactCase retains raw data, full Fachtext and release hashes", () => {
  for (const record of records) {
    assert.equal(record.publication_status, "APPROVED");
    assert.equal(record.editorial_quality.status, "PASS");
    assert.ok(record.impact_core_summary.length > 50);
    assert.ok(record.editorial_summary.length > 80);
    assert.ok(record.key_finding.length > 20);
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

test("records without a case-specific public evidence projection remain lossless and fail closed", () => {
  for (const record of reviewRecords) {
    assert.equal(record.publication_status, "BLOCKED_PUBLIC_EDITORIAL_QUALITY");
    assert.equal(record.public_editorial_projection.status, "PUBLICATION_REVIEW_REQUIRED");
    assert.ok(record.public_editorial_projection.failed.length > 0);
    assert.ok(record.full_analysis_markdown.length > 100);
    assert.equal(hash(record.full_analysis_markdown), record.source_release.case_markdown_sha256);
  }
});

test("all 19 approved backfill overlays are exact, additive and public", () => {
  const overlays = records.filter((record) => record.editorial_evidence_overlay);
  assert.equal(overlays.length, 19);
  assert.ok(overlays.every((record) => record.editorial_evidence_overlay.fach_status === "APPROVED_FOR_PUBLIC_IMPORT"));
  assert.ok(overlays.every((record) => record.evidence_summary.length >= 60));
  assert.ok(overlays.every((record) => record.public_evidence_explanation.length >= 60));
});

test("full-schema cases are exact projections and compact cases are not silently upgraded", () => {
  for (const record of [...records, ...reviewRecords]) {
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
  for (const record of [...records, ...reviewRecords]) {
    assert.equal(directions.has(record.primary_direction), true, record.impact_case_id);
    assert.equal(evidence.has(record.evidence_level), true, record.impact_case_id);
    assert.equal(boundaries.has(record.boundary_status), true, record.impact_case_id);
    if (record.primary_direction === "OPEN") assert.notEqual(record.primary_direction, "NEUTRAL");
  }
});

test("public impact store contains no person or party score", () => {
  const payload = JSON.stringify([...records, ...reviewRecords]);
  for (const forbidden of ["government_score", "minister_score", "person_score", "party_score"]) {
    assert.equal(payload.includes(`\"${forbidden}\"`), false, forbidden);
  }
});
