import test from 'node:test';
import assert from 'node:assert/strict';
import { writeAttemptCheckpoint } from '../../scripts/news/bridge/attempt-checkpoint.mjs';
const key='github-attempt:wt_20261011T050000Z_'+'a'.repeat(24);
const failed=()=>Object.assign(Error('BRIDGE_REMOTE_INVALID_RESPONSE'),{http_status:502});
const value={provider_called:true,status:'started'};
test('committed checkpoint with lost acknowledgement is read back without a second write',async()=>{
  let calls=0,current=null;const store={observe:async(_key,v)=>{calls++;current=v;throw failed();},observation:async()=>current};
  await writeAttemptCheckpoint(store,key,value);assert.equal(calls,1);
});
test('confirmed unchanged journal allows one identical checkpoint write',async()=>{
  let calls=0,current=null;const store={observe:async(_key,v)=>{if(++calls===1)throw failed();current=v;},observation:async()=>current};
  await writeAttemptCheckpoint(store,key,value);assert.equal(calls,2);assert.deepEqual(current,value);
});
test('provider rejection does not leave a false exhausted attempt',async()=>{
  let calls=0,current=value;const rejected={provider_called:false,status:'provider_unavailable'};
  const store={observe:async(_key,v)=>{if(++calls===1)throw failed();current=v;},observation:async()=>current};
  await writeAttemptCheckpoint(store,key,rejected,value);assert.deepEqual(current,rejected);assert.equal(calls,2);
});
test('uncertain or changed readback never permits a second write',async()=>{
  for(const read of [async()=>{throw failed();},async()=>({status:'output_delivered',provider_called:true})]){
    let calls=0;await assert.rejects(()=>writeAttemptCheckpoint({observe:async()=>{calls++;throw failed();},observation:read},key,value));assert.equal(calls,1);
  }
});
test('authentication failures and non-checkpoint mutations are not retried',async()=>{
  let calls=0;await assert.rejects(()=>writeAttemptCheckpoint({observe:async()=>{calls++;throw Error('BRIDGE_UNAUTHORIZED');},observation:async()=>assert.fail()},key,value),/BRIDGE_UNAUTHORIZED/);assert.equal(calls,1);
  await assert.rejects(()=>writeAttemptCheckpoint({},'editorial-approval',value),/CHECKPOINT_KEY_INVALID/);
});
