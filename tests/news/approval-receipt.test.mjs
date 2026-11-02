import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {approvalReceipt} from '../../admin/redaktion/review-state.js';

const preview={title:'Ein Beitrag',subtitle:'',markdown:'## Meine Einordnung\nText',sources:[{url:'https://example.com',title:'Quelle'}],
  visual:null,format:'watched',author_notes:'',source_media:null,news_record:null};
const hash=createHash('sha256').update(JSON.stringify(preview)).digest('hex');
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
