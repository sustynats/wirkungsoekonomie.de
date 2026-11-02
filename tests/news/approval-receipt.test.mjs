import test from 'node:test';
import assert from 'node:assert/strict';
import {approvalReceipt} from '../../admin/redaktion/review-state.js';

const hash = 'a'.repeat(64);
const review = {status:'PUBLISHING', revision:1, owner:'123456789012345678', preview_hash:hash,
  approval:{by:'123456789012345678', at:'2026-11-02T08:00:00.000Z', preview_hash:hash}};

test('only a version-bound owner decision is presented as an approval receipt', () => {
  assert.deepEqual(approvalReceipt(review), {revision:1, owner:review.owner, at:review.approval.at, previewHash:hash});
  for (const changed of [
    {status:'AWAITING_FINAL_APPROVAL'}, {revision:0}, {owner:'987654321098765432'},
    {preview_hash:'b'.repeat(64)}, {approval:null},
    {approval:{...review.approval, at:'not-a-date'}},
    {approval:{...review.approval, preview_hash:'x'.repeat(64)}},
  ]) assert.equal(approvalReceipt({...review,...changed}), null);
});

test('receipt remains readable while publishing and after confirmed publication', () => {
  for (const status of ['APPROVED_FOR_PUBLICATION', 'PUBLISHING', 'PUBLISHED'])
    assert.equal(approvalReceipt({...review,status})?.previewHash, hash);
});
