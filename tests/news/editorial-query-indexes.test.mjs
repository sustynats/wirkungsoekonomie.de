import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {BridgeStore} from '../../scripts/news/bridge/store.mjs';
test('existing journal gains lookup indexes without changing bodies or lock rules',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'editorial-indexes-')),file=path.join(dir,'queue.sqlite');
 const db=new DatabaseSync(file),body=JSON.stringify({input:{job_id:'fixture',job_type:'editorial_request'},intake:{owner:'123',kind:'news'},status:'accepted',created_at:'2026-10-05',staging:{private:'unchanged'}});
 db.exec('CREATE TABLE jobs(id TEXT PRIMARY KEY,body TEXT NOT NULL)');db.prepare('INSERT INTO jobs VALUES(?,?)').run('fixture',body);db.close();
 const store=new BridgeStore(file,{lane:'intake'});
 try{
  assert.equal(store.db.prepare('SELECT body FROM jobs').get().body,body);
  for(const [expr,index] of [["json_extract(body,'$.intake.owner')",'jobs_intake_owner_created'],["json_extract(body,'$.intake.kind')",'jobs_intake_kind'],["json_extract(body,'$.input.job_type')",'jobs_type'],["json_extract(body,'$.status')",'jobs_state']]){
   const plan=store.db.prepare(`EXPLAIN QUERY PLAN SELECT body FROM jobs WHERE ${expr}=?`).all('test');
   assert.ok(plan.some(row=>row.detail.includes(index)),index);
  }
  store.acquire('2026-10-05T06:00:00Z','test');const other=new BridgeStore(file,{lane:'intake'});
  try{assert.throws(()=>other.acquire('2026-10-05T06:00:00Z','test'),/RUN_LOCKED/);}finally{other.close();}
 }finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});
