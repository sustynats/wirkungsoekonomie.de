import test from 'node:test';
import assert from 'node:assert/strict';
import { bridgeSession } from '../../scripts/news/bridge/remote.mjs';
const env={WOEK_NEWS_BRIDGE_URL:'https://130.162.217.58.sslip.io/api/news-bridge',WOEK_NEWS_BRIDGE_TOKEN:'private-test-token',GITHUB_RUN_ID:'12345'};
test('a truncated successful response gets one idempotent reread',async()=>{
  let calls=0;const s=bridgeSession(env,{fetchImpl:async()=>++calls===1?new Response('{"ok":'):Response.json({ok:true,result:{completed:2}})});
  assert.deepEqual(await s.store.observation('completion-metrics'),{completed:2});assert.equal(calls,2);
});
test('persistent invalid reads fail with safe diagnostics after two attempts',async()=>{
  let calls=0;const s=bridgeSession(env,{fetchImpl:async()=>{calls++;return new Response('not-json');}});
  await assert.rejects(()=>s.store.observation('completion-metrics'),e=>e.message==='BRIDGE_REMOTE_INVALID_RESPONSE'&&e.http_status===200&&e.operation==='store.observation'&&e.response_bytes===8&&!JSON.stringify(e).includes('private-test-token'));
  assert.equal(calls,2);
});
test('an uncertain write is never replayed',async()=>{
  let calls=0;const s=bridgeSession(env,{fetchImpl:async()=>{calls++;return new Response('not-json');}});
  await assert.rejects(()=>s.store.put({input:{job_id:'test'}}),/BRIDGE_REMOTE_INVALID_RESPONSE/);assert.equal(calls,1);
});
test('unauthorized or forbidden responses and valid application errors are not retried',async()=>{
  for(const status of [401,403,409]){let calls=0;const s=bridgeSession(env,{fetchImpl:async()=>{calls++;return new Response('access denied',{status});}});await assert.rejects(()=>s.monitor(),/BRIDGE_REMOTE_INVALID_RESPONSE/);assert.equal(calls,1);}
  let calls=0;const s=bridgeSession(env,{fetchImpl:async()=>{calls++;return Response.json({ok:false,error:'BRIDGE_RUN_LOCKED'},{status:409});}});
  await assert.rejects(()=>s.store.acquire(),/BRIDGE_RUN_LOCKED/);assert.equal(calls,1);
});
