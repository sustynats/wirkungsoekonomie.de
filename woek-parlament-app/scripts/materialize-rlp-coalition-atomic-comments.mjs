#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const registerPath = path.resolve("data/states/rheinland-pfalz-coalition-commitments.json");
const commentIds = [5366781245, 5366795615, 5366803520, 5366840731, 5366868371, 5366889498, 5366912185, 5366922503, 5366940846, 5366948776, 5366958336, 5366968374, 5367159013, 5367172120];
const expectedRanges = new Map([
  [5366781245, ["RLP-KV26-C03-001", "RLP-KV26-C03-107", 107]],
  [5366795615, ["RLP-KV26-C03-108", "RLP-KV26-C03-185", 78]],
  [5366803520, ["RLP-KV26-C03-186", "RLP-KV26-C03-263", 78]],
  [5366840731, ["RLP-KV26-C04-001", "RLP-KV26-C04-070", 70]],
  [5366868371, ["RLP-KV26-C04-071", "RLP-KV26-C04-135", 65]],
  [5366889498, ["RLP-KV26-C05-001", "RLP-KV26-C05-103", 103]],
  [5366912185, ["RLP-KV26-C05-104", "RLP-KV26-C05-198", 95]],
  [5366922503, ["RLP-KV26-C05-199", "RLP-KV26-C05-246", 48]],
  [5366940846, ["RLP-KV26-C06-001", "RLP-KV26-C06-067", 67]],
  [5366948776, ["RLP-KV26-C06-068", "RLP-KV26-C06-088", 21]],
  [5366958336, ["RLP-KV26-C07-001", "RLP-KV26-C07-037", 37]],
  [5366968374, ["RLP-KV26-C07-038", "RLP-KV26-C07-086", 49]],
  [5367159013, ["RLP-KV26-C08-001", "RLP-KV26-C08-103", 103]],
  [5367172120, ["RLP-KV26-C09-001", "RLP-KV26-C09-031", 31]],
]);
const recordPattern = /^-\s+`(RLP-KV26-C(\d{2})-(\d{3}))`\s+\|\s+`([^`]+)`\s+\|\s+`([^`]+)`\s+\|\s+(.+)$/gm;

function fetchComment(commentId) {
  return execFileSync(
    "gh",
    ["api", `repos/sustynats/wirkungsoekonomie.de/issues/comments/${commentId}`, "--jq", ".body"],
    { encoding: "utf8" },
  );
}

function parseComment(commentId) {
  const records = [...fetchComment(commentId).matchAll(recordPattern)].map((match) => ({
    commitment_id: match[1],
    chapter: Number(match[2]),
    commitment_text: match[6].trim(),
    source_locator: match[4].trim(),
    source_classification: match[5].trim(),
    fach_comment_id: commentId,
    atomic_count: true,
  }));
  const expected = expectedRanges.get(commentId);
  if (!expected || records.length !== expected[2] || records[0]?.commitment_id !== expected[0] || records.at(-1)?.commitment_id !== expected[1]) {
    throw new Error(`Fachcomment ${commentId} ist unvollständig oder strukturell verändert.`);
  }
  return records;
}

const register = JSON.parse(readFileSync(registerPath, "utf8"));
const importedRecords = commentIds.flatMap(parseComment);
const mergedRecords = new Map(register.records.map((record) => [record.commitment_id, record]));
for (const record of importedRecords) {
  const previous = mergedRecords.get(record.commitment_id);
  if (previous && JSON.stringify(previous) !== JSON.stringify(record)) {
    throw new Error(`Widersprüchlicher bestehender Record: ${record.commitment_id}`);
  }
  mergedRecords.set(record.commitment_id, record);
}

register.publication_status = "FULL_ATOMIC_SOURCE_TRANSFER_CURRENT_FACH";
register.source_url = "https://www.spd-rlp.de/wp-content/uploads/sites/1649/2026/04/KoaV_2026-2031.pdf";
register.provenance_status = "PARTY_STATE_ORGANIZATION_PRIMARY_PDF_AVAILABLE";
register.signed_final_byte_identity = "NOT_CRYPTOGRAPHICALLY_PROVEN";
register.coverage_scope = "ALL_9_CHAPTERS_HIGH_MATERIALITY_REVIEWED_ALL_9_CHAPTERS_SOURCE_BOUND_ATOMIC_COMMITMENT_COVERAGE_1254";
register.declared_source_record_count = 1254;
register.source_record_count = 1254;
register.atomic_commitment_count = 1254;
register.handoff_record_gap_count = 0;
register.missing_declared_record_ids = [];
register.chapter_counts = [
  { chapter: 1, source_records: 151, atomic_commitments: 151, declared_atomic_commitments: 151, transfer_gap: 0 },
  { chapter: 2, source_records: 151, atomic_commitments: 151, declared_atomic_commitments: 151, transfer_gap: 0 },
  { chapter: 3, source_records: 263, atomic_commitments: 263, declared_atomic_commitments: 263, transfer_gap: 0 },
  { chapter: 4, source_records: 135, atomic_commitments: 135, declared_atomic_commitments: 135, transfer_gap: 0 },
  { chapter: 5, source_records: 246, atomic_commitments: 246, declared_atomic_commitments: 246, transfer_gap: 0 },
  { chapter: 6, source_records: 88, atomic_commitments: 88, declared_atomic_commitments: 88, transfer_gap: 0 },
  { chapter: 7, source_records: 86, atomic_commitments: 86, declared_atomic_commitments: 86, transfer_gap: 0 },
  { chapter: 8, source_records: 103, atomic_commitments: 103, declared_atomic_commitments: 103, transfer_gap: 0 },
  { chapter: 9, source_records: 31, atomic_commitments: 31, declared_atomic_commitments: 31, transfer_gap: 0 },
];
register.fach_comment_ids = [...new Set([...register.fach_comment_ids, 5366747072, ...commentIds, 5367546256])];
register.records = [...mergedRecords.values()].sort((left, right) => left.commitment_id.localeCompare(right.commitment_id));

if (register.records.length !== 1254 || new Set(register.records.map((record) => record.commitment_id)).size !== 1254) {
  throw new Error(`Erwartet 1254 eindeutige Records, erhalten ${register.records.length}.`);
}

writeFileSync(registerPath, `${JSON.stringify(register, null, 2)}\n`);
console.log(JSON.stringify({ status: "PASS", records: register.records.length, comments: commentIds }, null, 2));
