import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {DropboxTransport} from '../../scripts/news/bridge/dropbox.mjs';
import {BridgeStore} from '../../scripts/news/bridge/store.mjs';
import {ensureEditorialContracts} from '../../scripts/news/bridge/editorial-bootstrap.mjs';

test('a never-settling Dropbox read releases the actual owner lane without an editorial retry', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'editorial-deadline-'));
  const file = path.join(directory, 'queue.sqlite');
  const first = new BridgeStore(file, {lane:'import'}), next = new BridgeStore(file, {lane:'import'});
  t.after(() => {first.close();next.close();fs.rmSync(directory,{recursive:true,force:true});});
  for (const stalled of ['headers', 'body']) {
    let calls = 0;
    const transport = new DropboxTransport({credentials:{},requestTimeoutMs:15,fetchImpl:async () => {
      calls++;
      if (stalled === 'headers') return new Promise(() => {});
      return new Response(new ReadableStream({start(){}}));
    }});
    transport.accessToken='synthetic';transport.expiresAt=Date.now()+60000;
    first.acquire(new Date().toISOString(),'import',{manualRunId:`123:${stalled==='headers'?1:2}`});
    assert.throws(() => next.acquire(new Date().toISOString(),'import'), /BRIDGE_RUN_LOCKED/);
    try {await assert.rejects(transport.list('20_OUTPUT_READY'), e => e.message==='BRIDGE_DROPBOX_REQUEST_TIMEOUT' && e.retryable===true);}
    finally {first.release(false);}
    next.acquire(new Date().toISOString(),'import',{manualRunId:`456:${stalled==='headers'?1:2}`});next.release(true);
    assert.equal(calls,1);
  }
});

test('ambiguous Dropbox mutation times out once; OAuth has only its existing bounded retry', async () => {
  let mutations=0;
  const transport=new DropboxTransport({credentials:{},requestTimeoutMs:10,fetchImpl:async()=>{mutations++;return new Promise(()=>{});}});
  transport.accessToken='synthetic';transport.expiresAt=Date.now()+60000;
  await assert.rejects(transport.move('/Wirkungsticker/00_INBOX/example.json','/Wirkungsticker/10_CLAIMED/example.json'),/BRIDGE_PATH_INVALID/);
  await assert.rejects(transport.request('files/move_v2',{}),/BRIDGE_DROPBOX_REQUEST_TIMEOUT/);
  assert.equal(mutations,1);
  let refreshes=0;
  const auth=new DropboxTransport({credentials:{},authTimeoutMs:10,sleep:async()=>{},fetchImpl:async()=>{refreshes++;return new Promise(()=>{});}});
  await assert.rejects(auth.token(),e=>e.message==='BRIDGE_DROPBOX_AUTH_UNAVAILABLE'&&e.retryable===true);
  assert.equal(refreshes,2);
});

test('runtime bootstrap preserves existing immutable contract prose and final approval', async () => {
  const contracts=['3.0','4.0'].map(schema_version=>({schema_version,workflow:'single_final_approval',output_schema:{type:'object'},instructions:['new prose']}));
  const writes=[];
  const existing={...contracts[0],instructions:['original prose']};
  const result=await ensureEditorialContracts({metadata:async p=>p.endsWith('-3.json')?{}:null,
    read:async()=>JSON.stringify(existing),writeAtomic:async(p,v)=>writes.push([p,v])},contracts);
  assert.deepEqual(result.map(r=>r.status),['existing_immutable','installed']);
  assert.equal(writes.length,1);assert.match(writes[0][0],/-4.json$/);
  assert.deepEqual(existing.instructions,['original prose']);
  await assert.rejects(ensureEditorialContracts({metadata:async()=>({}),read:async()=>JSON.stringify({...existing,workflow:'autopublish'}),writeAtomic:async()=>assert.fail()},[contracts[0]]),/EDITORIAL_EXISTING_CONTRACT_INVALID/);
});
