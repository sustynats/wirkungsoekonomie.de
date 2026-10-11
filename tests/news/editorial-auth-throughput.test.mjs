import test from 'node:test';
import assert from 'node:assert/strict';
import { existingAdminAuthorizer } from '../../scripts/news/bridge/intake-http.mjs';
const owner='123456789012345678';
const request=()=>({headers:{authorization:'Bearer '+Buffer.from(JSON.stringify({sub:owner,exp:Date.now()+60000})).toString('base64url')+'.signature'}});
test('simultaneous list and preview requests share one CURRENT permission check',async()=>{
  let calls=0,finish;const auth=existingAdminAuthorizer({fetchImpl:async()=>{calls++;await new Promise(resolve=>finish=resolve);return new Response('{}');}});
  const req=request(),results=[auth(req),auth(req),auth(req)];
  await new Promise(resolve=>setImmediate(resolve));assert.equal(calls,1);finish();
  assert.deepEqual(await Promise.all(results),[owner,owner,owner]);
  assert.equal(await auth(req),owner);assert.equal(calls,1);
});
test('authorization stall yields bounded service-unavailable, not a false login rejection; retry is possible',async()=>{
  let calls=0;const auth=existingAdminAuthorizer({timeoutMs:15,fetchImpl:async()=>++calls===1?new Promise(()=>{}):new Response('{}')});
  const req=request();await assert.rejects(()=>auth(req),e=>e.status===503&&e.message.includes('Sitzung bleibt erhalten'));
  assert.equal(await auth(req),owner);assert.equal(calls,2);
});
test('denied privileges never become a cached grant or a transport retry',async()=>{
  let calls=0;const auth=existingAdminAuthorizer({fetchImpl:async()=>{calls++;return new Response('{}',{status:403});}}),req=request();
  assert.deepEqual(await Promise.all([auth(req),auth(req)]),[null,null]);assert.equal(calls,1);
  assert.equal(await auth(req),null);assert.equal(calls,2);
});
