import assert from 'node:assert/strict';
import test from 'node:test';
import { readIndex, validate } from '../scripts/quality/check-mv-spd-p1-p54-authority-index.mjs';

const index = readIndex();

test('P1-P54 archive is lossless and closes the finite authoritative pointer gap exactly', () => {
  const result = validate();
  assert.equal(result.gate, 'PASS_MINIMAL_ARTIFACT_AUTHORITY_INDEX_FAIL_CLOSED');
  assert.equal(result.source_records, 1226);
  assert.equal(result.generated_authorised_records, 261);
  assert.deepEqual(index.coverage.unresolved_physical_pages, []);
  assert.equal(index.unresolved_source_unit_ids.length, 0);
  assert.equal(index.coverage.authority_pointer_gap_object_ids.length, 0);
  assert.equal(index.p1_p54_transaction_complete, true);
  assert.equal(index.constraints.fach_synthesized, false);
  assert.equal(index.constraints.vercel_action_triggered, false);
});
