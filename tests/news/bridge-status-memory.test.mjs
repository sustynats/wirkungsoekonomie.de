import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {BridgeStore} from '../../scripts/news/bridge/store.mjs';
import {monitorStatus, outputStatus} from '../../scripts/news/bridge/status.mjs';
import {IMPACT_VERSION} from '../../scripts/news/impact-assessment.mjs';
import {POTENTIAL_REVISION} from '../../scripts/news/impact-potential.mjs';

const now='2026-09-13T10:00:00Z';
const id=i=>`wt_20260913T090000Z_${String(i).padStart(24,'0')}`;
function fixture(t){
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'woek-status-memory-'));
  const file=path.join(directory,'queue.sqlite'),store=new BridgeStore(file);
  t.after(()=>{store.close();fs.rmSync(directory,{recursive:true,force:true});});
  const put=job=>store.db.prepare('INSERT INTO jobs VALUES (?,?)').run(job.input.job_id,JSON.stringify(job));
  return {store,file,put};
}
test('compact status preserves correction, review, ACK and archival decisions',async t=>{
  const {store,put}=fixture(t);
  const basic=i=>({input:{job_id:id(i)},status:'queued',created_at:'2026-09-13T09:00:00Z',candidate:{text:'private content'}});
  put({...basic(1),corrections:[{},{}]});
  put({...basic(2),publication_gate:{status:'needs_second_pass',review_job_id:id(3)}});
  put({...basic(3),input:{job_id:id(3),job_type:'impact_semantic_review',impact_version:IMPACT_VERSION,semantics_revision:POTENTIAL_REVISION}});
  put({...basic(4),status:'accepted',accepted:{record:{title:'Ready'}}});
  put({...basic(5),status:'acknowledged',ack:{status:'imported'}});
  put({...basic(6),status:'acknowledged',archived_at:now});
  put({...basic(7),status:'quarantined'});
  store.observe(`claim:${id(1)}`,{at:'2026-09-13T06:00:00Z'});
  store.observe(`output:${id(1)}`,{at:now,generation:2});
  const transport={list:async()=>[{name:`${id(1)}.output.json`},{name:`${id(2)}.output.json`}]};
  const legacy={all:()=>store.all(),get:value=>store.get(value),observation:key=>store.observation(key),observe:(key,value)=>store.observe(key,value)};
  const expectedOutput=await outputStatus(legacy,transport,now),expectedMonitor=await monitorStatus(legacy,now);
  store.all=()=>{throw Error('FULL_QUEUE_MUST_NOT_BE_LOADED');};
  assert.deepEqual(await outputStatus(store,transport,now),expectedOutput);
  assert.deepEqual(await monitorStatus(store,now),expectedMonitor);
  assert.equal(expectedMonitor.oldest_claim_minutes,0);
  assert.equal(expectedMonitor.review_pending_count,1);
  assert.equal(expectedOutput.ready.includes(id(6)),false);
  assert.equal(store.statusJobs().some(row=>row.candidate),false);
  assert.equal(store.get(id(1)).candidate.text,'private content');
});

test('status probes handle a queue larger than the process heap',t=>{
  const {store,file,put}=fixture(t);
  for(let i=0;i<240;i++)put({input:{job_id:id(i)},created_at:now,status:'queued',candidate:{source_text:'x'.repeat(320000)}});
  assert.ok(store.db.prepare('SELECT sum(length(body)) AS bytes FROM jobs').get().bytes>75_000_000);
  const script=`import {BridgeStore} from ${JSON.stringify(new URL('../../scripts/news/bridge/store.mjs',import.meta.url).href)};
    import {monitorStatus,outputStatus} from ${JSON.stringify(new URL('../../scripts/news/bridge/status.mjs',import.meta.url).href)};
    const store=new BridgeStore(process.argv[1]);
    store.all=()=>{throw Error('FULL_QUEUE_MUST_NOT_BE_LOADED');};
    for(let i=0;i<3;i++){
      const monitor=await monitorStatus(store,${JSON.stringify(now)});
      if(monitor.open_count!==240)throw Error('MISSING_JOBS');
      await outputStatus(store,{list:async()=>[]},${JSON.stringify(now)});
    }
    store.close();console.log('PASS');`;
  const result=spawnSync(process.execPath,['--max-old-space-size=48','--input-type=module','-e',script,file],{encoding:'utf8',timeout:30000});
  assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/PASS/);
});
