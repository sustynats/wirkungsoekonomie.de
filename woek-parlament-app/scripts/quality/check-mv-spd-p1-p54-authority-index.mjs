#!/usr/bin/env node
/**
 * Validate the derived MV-SPD P1-P54 authority index from an app-only
 * Parliament deployment input. The full-checkout archive-byte and frozen
 * source-ledger checks remain in tools/build_mv_spd_p1_p54_authority_archive.mjs.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const INDEX = 'data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-spd-p1-p54-authority-index-v1.json';

const ARTIFACT_SHA256 = 'b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc';
const GAP_OBJECT_IDS = [
  'MV-SPD-2026-SU-00008-A01',
  'MV-SPD-2026-SU-00010-A01',
  'MV-SPD-2026-SU-00010-A02',
  'MV-SPD-2026-SU-00012-A01',
  'MV-SPD-2026-SU-00015-A01',
  'MV-SPD-2026-SU-00017-A01',
  'MV-SPD-2026-SU-00017-A02',
  'MV-SPD-2026-SU-00017-A03',
  'MV-SPD-2026-SU-00018-A01',
  'MV-SPD-2026-SU-00018-A02',
  'MV-SPD-2026-SU-00018-A03',
  'MV-SPD-2026-SU-00022-A01',
  'MV-SPD-2026-SU-00026-A01',
  'MV-SPD-2026-SU-00033-A01',
  'MV-SPD-2026-SU-00033-A02',
];
const sha256 = value => createHash('sha256').update(value).digest('hex');

export function readIndex() {
  return JSON.parse(fs.readFileSync(path.join(APP_ROOT, INDEX), 'utf8'));
}

export function validate() {
  const result = readIndex();
  const { descriptor_sha256: descriptorSha256, ...payload } = result;
  assert.equal(sha256(JSON.stringify(payload)), descriptorSha256, 'AUTHORITY_INDEX_DESCRIPTOR_DRIFT');
  assert.equal(result.schema_version, 'woek-mv-spd-authority-archive-1.0');
  assert.equal(result.artifact_id, 'MV-LTW-2026-SPD-REGIERUNGSPROGRAMM');
  assert.equal(result.artifact_sha256, ARTIFACT_SHA256);
  assert.equal(result.counts.source_records, 1226);
  assert.equal(result.counts.source_units, 509);
  assert.equal(result.counts.source_atoms, 456);
  assert.equal(result.counts.generated_authorised_records, 261);
  assert.equal(result.source_records.length, 1226);
  assert.equal(result.source_records.filter(row => row.source_object_kind !== 'DETERMINISTIC_AUTHORISED_EXACT_SPAN_OR_REPAIR').length, 965);
  assert.equal(result.coverage.active_terminal_review_leaf_ids.length, 377);
  assert.equal(result.coverage.zero_count_ids.length, 834);
  assert.deepEqual(result.coverage.authority_pointer_gap_object_ids, GAP_OBJECT_IDS);
  assert.equal(377 + 834 + GAP_OBJECT_IDS.length, 1226);
  assert.deepEqual(result.coverage.unresolved_physical_pages, [2, 3, 4]);
  assert.equal(result.coverage.gate, 'PASS_RECOVERABLE_SCOPE_MATERIALISED_FAIL_CLOSED_FINITE_AUTHORITY_POINTER_GAP');

  const activeRecords = result.source_records.filter(row => row.counts_as_effect_object === true);
  assert.deepEqual(activeRecords.map(row => row.object_id), result.coverage.active_terminal_review_leaf_ids);
  assert.deepEqual(result.source_records.filter(row => row.counts_as_effect_object === false).map(row => row.object_id), result.coverage.zero_count_ids);
  assert.deepEqual(result.source_records.filter(row => row.terminal_role === null).map(row => row.object_id), GAP_OBJECT_IDS);
  const activeHashes = activeRecords.map(row => row.source_text_sha256);
  assert.equal(new Set(activeHashes).size, activeHashes.length, 'DUPLICATE_ACTIVE_SOURCE_HASH');

  assert.deepEqual(result.constraints, {
    generic_delegated_rnaa_used_as_fach: false,
    fach_synthesized: false,
    dns_synthesized: false,
    recommendation_synthesized: false,
    score_synthesized: false,
    vercel_action_triggered: false,
  });
  assert.equal(result.p1_p54_transaction_complete, false);
  assert.equal(result.p56_authorised, false);
  return {
    gate: 'PASS_MINIMAL_ARTIFACT_AUTHORITY_INDEX_FAIL_CLOSED',
    descriptor_sha256: descriptorSha256,
    source_records: result.counts.source_records,
    generated_authorised_records: result.counts.generated_authorised_records,
    active_terminal_review_leaves: result.coverage.active_terminal_review_leaf_ids.length,
    zero_count_records: result.coverage.zero_count_ids.length,
    authority_pointer_gaps: GAP_OBJECT_IDS.length,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 2, 'This checker accepts no mutation flags');
  console.log(JSON.stringify(validate(), null, 2));
}
