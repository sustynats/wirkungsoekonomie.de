import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {bridgeSession} from '../../scripts/news/bridge/remote.mjs';
import {BridgeStore} from '../../scripts/news/bridge/store.mjs';
const env={WOEK_NEWS_BRIDGE_URL:'https://130.162.217.58.sslip.io/api/news-bridge',WOEK_NEWS_BRIDGE_TOKEN:'fixture',GITHUB_RUN_ID:'12345'};

test('semantic review lookup reads only the requested parent in one remote call', async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'woek-review-index-'));
  const local=new BridgeStore(path.join(dir,'queue.sqlite'));
  t.after(()=>{local.close();fs.rmSync(dir,{recursive:true,force:true});});
  const parent='wt_20260913T120000Z_'+'a'.repeat(24);
  for(let i=0;i<120;i++){
    const job={input:{job_id:'review-'+i,job_type:'impact_semantic_review',parent_job_id:i===3?parent:'another-parent'},staging:{private_text:'retained'}};
    local.db.prepare('INSERT INTO jobs VALUES (?,?)').run(job.input.job_id,JSON.stringify(job));
  }
  local.all=()=>{throw Error('whole queue must not be loaded');};
  let calls=0;
  const remote=bridgeSession(env,{fetchImpl:async(_url,options)=>{
    calls++;const {op,args}=JSON.parse(options.body);assert.equal(op,'store.semanticReviews');
    return Response.json({ok:true,result:local.semanticReviews(...args)});
  }});
  assert.deepEqual((await remote.store.semanticReviews(parent)).map(j=>j.input.job_id),['review-3']);
  assert.equal(calls,1);
  assert.equal(local.get('review-3').staging.private_text,'retained');
  assert.throws(()=>local.semanticReviews('invalid'),/BRIDGE_PARENT_JOB_INVALID/);
});

test('only an old unsupported review lookup falls back; authentication and locks never do',async()=>{
  const jobs=[{input:{job_type:'impact_semantic_review',parent_job_id:'parent'}},{input:{job_type:'impact_semantic_review',parent_job_id:'other'}}];
  let calls=0;
  const remote=bridgeSession(env,{fetchImpl:async()=>++calls===1
    ?Response.json({ok:false,error:'BRIDGE_OPERATION_INVALID'},{status:400})
    :Response.json({ok:true,result:jobs})});
  assert.equal((await remote.store.semanticReviews('parent')).length,1);assert.equal(calls,2);
  for(const error of ['BRIDGE_UNAUTHORIZED','BRIDGE_RUN_LOCKED']){
    let count=0;const blocked=bridgeSession(env,{fetchImpl:async()=>{count++;return Response.json({ok:false,error},{status:403});}});
    await assert.rejects(()=>blocked.store.semanticReviews('parent'),new RegExp(error));assert.equal(count,1);
  }
});

test('paged remote queue returns every active job once and retains full get data', async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'woek-queue-pages-'));
  const local=new BridgeStore(path.join(dir,'queue.sqlite'));
  t.after(()=>{local.close();fs.rmSync(dir,{recursive:true,force:true});});
  for(let i=0;i<47;i++){
    const id=`job-${String(i).padStart(3,'0')}`;
    local.db.prepare('INSERT INTO jobs VALUES (?,?)').run(id,JSON.stringify({input:{job_id:id},staging:{private_text:'retained'},...(i===10?{archived_at:'2026-09-11T00:00:00Z'}:{})}));
  }
  const requests=[];
  const remote=bridgeSession(env,{fetchImpl:async(_url,options)=>{
    const {op,args}=JSON.parse(options.body);assert.equal(op,'store.all');requests.push(args[0]);
    return Response.json({ok:true,result:local.all(...args)});
  }});
  const result=await remote.store.all();
  assert.equal(result.length,46);assert.equal(new Set(result.map(x=>x.input.job_id)).size,46);
  assert.equal(requests.length,3);assert.equal(result.some(x=>x.staging),false);
  assert.equal(local.get('job-000').staging.private_text,'retained');
  assert.deepEqual(result,local.all());
  assert.throws(()=>local.all({page_size:200,after:''}),/BRIDGE_QUEUE_PAGE_INVALID/);
});

test('rolling upgrade accepts an old server queue exceeding the previous 24 MiB ceiling',async()=>{
  const jobs=[{input:{job_id:'legacy'},text:'x'.repeat(25*1024*1024)}];
  let calls=0;
  const remote=bridgeSession(env,{fetchImpl:async()=>{calls++;return Response.json({ok:true,result:jobs});}});
  const received=await remote.store.all();
  assert.equal(received[0].text.length,jobs[0].text.length);assert.equal(calls,1);
});

test('response bound remains strict for legacy queues and other operations',async()=>{
  for(const [method,megabytes] of [['all',65],['get',25]]){
    const remote=bridgeSession(env,{fetchImpl:async()=>new Response(new ReadableStream({start(controller){
      for(let i=0;i<megabytes;i++)controller.enqueue(new Uint8Array(1024*1024));controller.close();
    }}))});
    await assert.rejects(()=>remote.store[method]('job'),/BRIDGE_RESPONSE_TOO_LARGE/);
  }
});

test('a failed page never produces a partial successful queue',async()=>{
  let calls=0;
  const remote=bridgeSession(env,{fetchImpl:async()=>++calls===1
    ?Response.json({ok:true,result:{page_version:1,items:[{input:{job_id:'a'}}],next_cursor:'a'}})
    :Response.json({ok:false,error:'BRIDGE_RUN_LOCKED'},{status:409})});
  await assert.rejects(()=>remote.store.all(),/BRIDGE_RUN_LOCKED/);assert.equal(calls,2);
});

test('repeated cursors and malformed pages stop instead of looping or skipping jobs',async()=>{
  for(const page of [null, {page_version:1,items:[],next_cursor:'a'}, {page_version:1,items:[{}],next_cursor:'a'}]){
    let calls=0;const remote=bridgeSession(env,{fetchImpl:async()=>{calls++;return Response.json({ok:true,result:page});}});
    await assert.rejects(()=>remote.store.all(),/BRIDGE_QUEUE_(PAGE|CURSOR)_INVALID/);assert.ok(calls<=2);
  }
});
