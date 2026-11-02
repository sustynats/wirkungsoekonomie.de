import test from 'node:test';
import assert from 'node:assert/strict';
import {approvalReceipt} from '../../admin/redaktion/review-state.js';
import {editorialPreviewHash} from '../../scripts/news/bridge/editorial-approval.mjs';

const preview={title:'Ein Beitrag',markdown:'## Meine Einordnung\nText',sources:[{url:'https://example.com',title:'Quelle'}],format:'watched'};
const hash=editorialPreviewHash(preview);
const review={status:'PUBLISHING',revision:1,owner:'123456789012345678',preview,preview_hash:hash,
  approval:{by:'123456789012345678',at:'2026-11-02T08:00:00.000Z',preview_hash:hash}};

test('only an exact version-bound owner decision is presented as an approval receipt',async()=>{
  assert.deepEqual(await approvalReceipt(review),{revision:1,owner:review.owner,at:review.approval.at,previewHash:hash});
  for(const changed of [
    {status:'AWAITING_FINAL_APPROVAL'},{revision:0},{owner:'987654321098765432'},
    {preview_hash:'b'.repeat(64)},{preview:{...preview,markdown:'changed'}},{approval:null},
    {approval:{...review.approval,at:'not-a-date'}},
    {approval:{...review.approval,preview_hash:'x'.repeat(64)}},
  ]) assert.equal(await approvalReceipt({...review,...changed}),null);
});

test('receipt remains readable while publishing and after confirmed publication',async()=>{
  for(const status of ['APPROVED_FOR_PUBLICATION','PUBLISHING','PUBLISHED'])
    assert.equal((await approvalReceipt({...review,status}))?.previewHash,hash);
});

test('browser check matches the server contract for revision targets',async()=>{
  const revised={...preview,editorial_revision:{target:'published-1',patch:{subtitle:'neu'}}};
  const revisionHash=editorialPreviewHash(revised);
  const r={...review,preview:revised,preview_hash:revisionHash,approval:{...review.approval,preview_hash:revisionHash}};
  assert.equal((await approvalReceipt(r))?.previewHash,revisionHash);
  assert.equal(await approvalReceipt({...r,preview:{...revised,editorial_revision:{...revised.editorial_revision,target:'other'}}}),null);
});
