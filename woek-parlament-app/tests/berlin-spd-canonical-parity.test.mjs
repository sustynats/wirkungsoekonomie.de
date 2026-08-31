import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MATRIX_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/source-integrity/berlin-2026-spd-canonical-parity-v1.json',
);
const RETURN_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/source-integrity/berlin-2026-spd-fach-return-v1.json',
);

test('Berlin SPD canonical parity matrix is exhaustive and fail-closed', () => {
  const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
  assert.equal(matrix.artifact.sha256, '379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9');
  assert.equal(matrix.summary.source_unit_count, 766);
  assert.equal(matrix.summary.effect_atom_count, 1276);
  assert.equal(matrix.summary.total_object_count, 2042);
  assert.deepEqual(matrix.summary.relation_counts, {
    UNCHANGED_HASH_IDENTICAL: 2042,
    TEXT_CHANGED_REVIEW_REQUIRED: 0,
    REMOVED: 0,
    ADDED: 0,
    BOUNDARY_CHANGED: 0,
  });
  assert.equal(matrix.summary.fach_return_object_count, 0);
  assert.equal(
    matrix.p22_stop_resolution.relation,
    'UNCHANGED_HASH_IDENTICAL',
  );
  assert.equal(new Set(matrix.relations.map((item) => (
    `${item.object_type}:${item.old_object_id}`
  ))).size, 2042);
  assert.ok(matrix.relations.every((item) => (
    item.old_object_id === item.new_object_id
    && item.old_source_text_sha256 === item.new_source_text_sha256
    && item.relation === 'UNCHANGED_HASH_IDENTICAL'
  )));
});

test('Berlin SPD Fach return remains empty and does not claim P22 Fach', () => {
  const result = JSON.parse(fs.readFileSync(RETURN_PATH, 'utf8'));
  assert.deepEqual(result.changed_or_new_canonical_objects_requiring_fach_review, []);
  assert.deepEqual(result.removed_objects, []);
  assert.equal(result.summary.changed_or_new_fach_return_count, 0);
  assert.equal(result.summary.fach_synthesis_performed, false);
  assert.equal(result.next_unreviewed_source_order_frontier.physical_page, 22);
  assert.equal(
    result.protected_existing_fach_handoff_scope.technical_materialization_status,
    'SEPARATE_LOSSLESS_HANDOFF_MATERIALIZATION_REQUIRED',
  );
});
