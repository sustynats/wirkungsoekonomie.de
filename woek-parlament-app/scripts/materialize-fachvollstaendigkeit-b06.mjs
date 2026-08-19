#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const canonicalRoot = "/WOEK";
const localRoot = process.env.WOEK_CANONICAL_DROPBOX_LOCAL_ROOT;
if (!localRoot) {
  throw new Error("WOEK_CANONICAL_DROPBOX_LOCAL_ROOT must point to the locally synced canonical /WOEK root.");
}

const problemGoalSources = [
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-PROBLEM-GOAL-REVIEW-2026-08-19-B01.jsonl", 3, "518bfd722e7c2d6f240f45dcd845cc90d4157ee5163c72eac82a44575207cb29"],
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-0-OF-4-20260819T1241CEST.jsonl", 4, "9e167889e53996ee7a3a99c85529b7d688a4d76bbfa83d62767a38dcb38f0e3c"],
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-1-OF-4-20260819T1238CEST.jsonl", 17, "d64b968606b5d5bb9a0befa3eb11de0fc213ac5258a3acde376b77d635c39fdb"],
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-2-OF-4-20260819T1227CEST.jsonl", 10, "6a74083ccf08f48fda6ab03e1b5188f9cccbb8f4d661abf61a186a155f435e49"],
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-2-OF-4-20260819T1242CEST.jsonl", 6, "2c52b7c9e8618c298ad99f0046108ddf1d6c46cbb8829ec7aa5999ca8072c325"],
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-3-OF-4-20260819T123140CEST.jsonl", 9, "2bcadf3730933b936b4edc63d77581aa4f7968ead65a1b7896302d2273ee8d4b"],
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-0-OF-4-20260819T1322CEST.jsonl", 7, "d972c3910b8da1ebcd3dc989ac9a4932a8a0f593a1b8505783c08089bf6e85f1"],
  ["/WOEK/WOEK-EU-DAILY/FACHREVIEW/FACHVOLLSTAENDIGKEIT-SHARD-1-OF-4-20260819T1334CEST.jsonl", 3, "ee3fa04e6b4a9d3afdcf561138ffa2ad5c6af40941bb826914ee0243c6dfbadd"],
  ["/WOEK/WOEK-EU-DAILY/FACHREVIEW/FACHVOLLSTAENDIGKEIT-SHARD-2-OF-4-20260819T1328CEST.jsonl", 5, "b9cb5d49887a56a180636c61979ec36dd77a89f54880917feadca221d28722a9"],
  ["/WOEK/WOEK-PARLAMENT-DAILY/FACHREVIEW/FACHVOLLSTAENDIGKEIT-SHARD-2-OF-4-20260819T1345CEST.jsonl", 4, "ebd3a901f24eb32917ac25df5b61ba0cbd361a4cb9293eaebcb781156897895a"],
  ["/WOEK/WOEK-EU-DAILY/FACHREVIEW/FACHVOLLSTAENDIGKEIT-SHARD-0-OF-4-20260819T1427CEST.jsonl", 5, "7ef4668ebcfae589bc4e9a43956004dc6fb350ee0cc64531722d6ad55e9f53c9"],
  ["/WOEK/WOEK-PARLAMENT-DAILY/FACHREVIEW/FACHVOLLSTAENDIGKEIT-SHARD-1-OF-4-20260819T1423CEST.jsonl", 3, "357af127701f677254f5b706414bf7d5207b8ce7306649d002c9d9eb52f2777a"],
  ["/WOEK/WOEK-PARLAMENT-DAILY/FACHREVIEW/FACHVOLLSTAENDIGKEIT-SHARD-0-OF-4-20260819T1500CEST.jsonl", 6, "7ccb3589a284af08820ebf0ebd35c6edf423a3f54e72d4378f8116babd003512", "96deb2629fee05847e700e967c7a25bd26b62af5048bdcb669b181a65416cb26"],
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-0-OF-4-20260819T1427CEST.jsonl", 7, "36d6e6865b54955837b886a905446491eb7507f80e0ac37ff42c3a5cf91c36c5"],
  ["/WOEK/WOEK-EU-DAILY/FACHREVIEW/FACHVOLLSTAENDIGKEIT-SHARD-3-OF-4-20260819T1359CEST.jsonl", 8, "7f8f0a041673ceb326ad51ba9c14066021b5213dac785271d1da22300a0c2733", "c2b3f5dee3eb0f717955cf79abd10dd0fd0427808c30dcba01b77aef38d89245"],
  ["/WOEK/WOEK-PARLAMENT-DAILY/FACHREVIEW/FACHVOLLSTAENDIGKEIT-SHARD-3-OF-4-20260819T1630CEST.jsonl", 2, "541b8c1b61a273c2b49fc6afa9c262b258fc72d0a3aa657e52ad6d2e6f5cf031", "8d40c5ff93024b1269c06f23a3914c583ea116ddde70cc24727019678fef9c3d"],
];

const commonTargetSources = [
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/COMMON-TARGETS-REVIEW-20260819T1229CEST.jsonl", 3, "f46a6abfec8f73f6a88edf74f32b6abd41df992a076f20473b0265f43bf0fc57"],
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/COMMON-TARGETS-REVIEW-20260819T1252CEST.jsonl", 4, "5f94f6c83d061194b916a05dec7957a81746dcb6683c57dcf04cc562f65781cf"],
  ["/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/COMMON-TARGETS-REVIEW-20260819T1432CEST.jsonl", 2, "00dc34c956a037e9ce930086063981a1e9de93944ba97f06a0ab2b3125750790"],
];

function localPath(canonicalPath) {
  if (!canonicalPath.startsWith(`${canonicalRoot}/`)) throw new Error(`Non-canonical source path: ${canonicalPath}`);
  return path.join(localRoot, canonicalPath.slice(canonicalRoot.length + 1));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function dropboxContentHash(bytes) {
  const blockHashes = [];
  for (let offset = 0; offset < bytes.length; offset += 4 * 1024 * 1024) {
    blockHashes.push(createHash("sha256").update(bytes.subarray(offset, offset + 4 * 1024 * 1024)).digest());
  }
  return createHash("sha256").update(Buffer.concat(blockHashes)).digest("hex");
}

function readSource([source, expectedCount, expectedSha256, expectedDropboxContentHash], expandReviewDetail = false) {
  const bytes = readFileSync(localPath(source));
  const actualSha256 = sha256(bytes);
  if (actualSha256 !== expectedSha256) throw new Error(`${source}: SHA-256 mismatch (${actualSha256})`);
  if (expectedDropboxContentHash && dropboxContentHash(bytes) !== expectedDropboxContentHash) {
    throw new Error(`${source}: Dropbox content hash mismatch`);
  }
  const sourceRecords = bytes.toString("utf8").split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch (error) { throw new Error(`${source}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`); }
  });
  if (sourceRecords.length !== expectedCount) throw new Error(`${source}: expected ${expectedCount} records, got ${sourceRecords.length}`);
  const detailArtifacts = [];
  const records = sourceRecords.map((record) => {
    if (!expandReviewDetail || (record.problem_review && record.goal_review)) return record;
    if (typeof record.detail_artifact !== "string") throw new Error(`${source}: ${record.impact_case_id ?? "unknown"} has no review detail`);
    const detailBytes = readFileSync(localPath(record.detail_artifact));
    const detail = JSON.parse(detailBytes.toString("utf8"));
    if (detail.impact_case_id !== record.impact_case_id) throw new Error(`${record.detail_artifact}: impact_case_id mismatch`);
    if (record.recommendation_untouched !== true || record.common_targets_untouched !== true) throw new Error(`${record.detail_artifact}: fach guard mismatch`);
    detailArtifacts.push({ path: record.detail_artifact, sha256: sha256(detailBytes), impact_case_id: detail.impact_case_id });
    return detail;
  });
  return {
    source,
    expected_sha256: expectedSha256,
    expected_dropbox_content_hash: expectedDropboxContentHash,
    source_records: sourceRecords.length,
    detail_artifacts: detailArtifacts,
    records,
  };
}

const problemInputs = problemGoalSources.map((source) => readSource(source, true));
const commonTargetInputs = commonTargetSources.map((source) => readSource(source));
const problemRecords = problemInputs.flatMap((entry) => entry.records);
const commonTargetRecords = commonTargetInputs.flatMap((entry) => entry.records);

const problemIds = new Set(problemRecords.map((record) => record.impact_case_id));
const commonTargetImpactIds = new Set(commonTargetRecords.map((record) => record.impact_case_id));
const recommendationIds = new Set(commonTargetRecords.map((record) => record.recommendation_id));
if (problemRecords.length !== 99 || problemIds.size !== 99) throw new Error(`Problem/Goal identity gate failed: ${problemRecords.length}/${problemIds.size}`);
if (commonTargetRecords.length !== 9 || commonTargetImpactIds.size !== 9 || recommendationIds.size !== 9) throw new Error("Common-Targets identity gate failed");
if (!problemRecords.every((record) => ["APPROVED", "APPROVED_WITH_OPEN_DATA", "REVIEWED_NOT_ASSESSABLE"].includes(record.fach_status ?? record.review_status))) throw new Error("Unapproved Problem/Goal record");
if (!commonTargetRecords.every((record) => ["APPROVED", "APPROVED_WITH_OPEN_DATA"].includes(record.fach_status))) throw new Error("Unapproved Common-Targets record");
if (!commonTargetRecords.every((record) => record.machine_mapping_public_allowed === false)) throw new Error("Machine mapping gate failed");

const problemNotAssessable = problemRecords.filter((record) => (record.fach_status ?? record.review_status) === "REVIEWED_NOT_ASSESSABLE").length;
const goalNotAssessable = problemRecords.filter((record) => record.goal_review?.review_disposition === "REVIEWED_NOT_ASSESSABLE" || record.goal_review?.goal_adequacy_status === "NO_ROBUST_GOAL_JUDGMENT").length;
if (problemNotAssessable !== 4 || goalNotAssessable !== 16) throw new Error(`Review disposition gate failed: problem=${problemNotAssessable}, goal=${goalNotAssessable}`);

const outputDir = path.join(process.cwd(), "data", "method");
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, "public-decision-reviews.jsonl"), `${problemRecords.map((record) => JSON.stringify(record)).join("\n")}\n`);
writeFileSync(path.join(outputDir, "public-common-target-reviews.jsonl"), `${commonTargetRecords.map((record) => JSON.stringify(record)).join("\n")}\n`);

const manifest = {
  schema_version: "woek-fachvollstaendigkeit-public-materialization-1.0",
  merge_id: "FACHVOLLSTAENDIGKEIT-MERGE-20260819T1700CEST",
  generated_at: "2026-08-19T17:00:00+02:00",
  canonical_root: canonicalRoot,
  problem_goal: {
    records: problemRecords.length,
    unique_impact_case_ids: problemIds.size,
    problem_review_approved: 95,
    problem_review_not_assessable: problemNotAssessable,
    goal_review_approved: 83,
    goal_review_not_assessable: goalNotAssessable,
    sources: problemInputs.map(({ source, expected_sha256, expected_dropbox_content_hash, source_records, detail_artifacts, records }) => ({
      source,
      sha256: expected_sha256,
      ...(expected_dropbox_content_hash ? { dropbox_content_hash: expected_dropbox_content_hash } : {}),
      source_records,
      records: records.length,
      detail_artifacts,
    })),
  },
  common_targets: {
    records: commonTargetRecords.length,
    unique_impact_case_ids: commonTargetImpactIds.size,
    unique_recommendation_ids: recommendationIds.size,
    sources: commonTargetInputs.map(({ source, expected_sha256, records }) => ({ source, sha256: expected_sha256, records: records.length })),
  },
  gates: {
    no_fach_rewrite: true,
    no_recommendation_mutation: true,
    no_machine_mapping: true,
    open_is_not_neutral: true,
    budget_2027_non_aggregable: true,
  },
};
writeFileSync(path.join(outputDir, "fachvollstaendigkeit-b06-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: "PASS", problem_goal_records: 99, common_target_records: 9, manifest: "data/method/fachvollstaendigkeit-b06-manifest.json" }, null, 2));
