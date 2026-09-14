import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { buildReviewLineage } from '../../scripts/news/bridge/build-review-lineage.mjs';
import { API_EDITORIAL_PROTOCOL } from '../../scripts/news/bridge/api-service.mjs';

const id = digit=>'wt_20260913T080000Z_'+digit.repeat(24);
test('legacy lineage audit includes archived/unknown paid reviews, rejects missing or changed inputs, and writes nothing',async t=>{
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'review-lineage-'));
 t.after(()=>fs.rm(directory,{recursive:true,force:true}));
 const database=path.join(directory,'queue.sqlite'),db=new DatabaseSync(database);
 db.exec('CREATE TABLE jobs(id TEXT PRIMARY KEY, body TEXT NOT NULL)');
 const records=[];
 for(let i=1;i<=6;i++) {
  const digit=String(i),record={protocol:API_EDITORIAL_PROTOCOL,key:digit.repeat(64),job_id:id(digit),input_hash:'b'.repeat(64),kind:'review',provider_called:true,status:i===2?'started':'completed'};
  if(i===5)record.provider_called=false;
  if(i===6)Object.assign(record,{status:'failed',http_status:400,provider_response:JSON.stringify({error:{type:'invalid_request_error',message:'Web Search cannot be used with JSON mode.'}})});
  records.push(record);
  await fs.writeFile(path.join(directory,record.key+'.json'),JSON.stringify(record));
  if(i<=3)db.prepare('INSERT INTO jobs VALUES (?,?)').run(record.job_id,JSON.stringify({archived_at:'2026-09-14T00:00:00Z',
   input:{job_id:record.job_id,input_hash:i===3?'c'.repeat(64):record.input_hash,job_type:'impact_semantic_review',parent_job_id:id('a')}}));
 }
 db.close();
 const before=await fs.readFile(database),raw=await Promise.all(records.map(r=>fs.readFile(path.join(directory,r.key+'.json'),'utf8')));
 const result=await buildReviewLineage(directory,database);
 assert.equal(Object.keys(result.bindings).length,2);
 assert.deepEqual(result.bindings[records[1].key],{job_id:id('2'),input_hash:'b'.repeat(64),parent_job_id:id('a')});
 assert.deepEqual(result.unresolved.map(r=>r.job_id),[id('3'),id('4')]);
 assert.deepEqual(await fs.readFile(database),before);
 assert.deepEqual(await Promise.all(records.map(r=>fs.readFile(path.join(directory,r.key+'.json'),'utf8'))),raw);
 assert.equal((await fs.readdir(directory)).includes('review-lineage.json'),false);
});
