import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {BridgeStore} from '../../scripts/news/bridge/store.mjs';
import {EditorialApproval} from '../../scripts/news/bridge/editorial-approval.mjs';
import {notifyEditorialReviews} from '../../scripts/news/bridge/editorial-revisions.mjs';

const owner='1206956406805102593',other='111111111111111111';
test('the recurring intake-news lookup scans only linked jobs and preserves every stored body',t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'editorial-polling-test-'));
 const store=new BridgeStore(path.join(directory,'queue.sqlite'));
 t.after(()=>{store.close();fs.rmSync(directory,{recursive:true,force:true});});
 const insert=store.db.prepare('INSERT INTO jobs VALUES(?,?)');
 for(let i=0;i<30;i++)insert.run('history-'+i,JSON.stringify({status:'acknowledged',staging:{text:'Synthetischer Alttext. '.repeat(10000)}}));
 for(const id of ['linked-pending','linked-published'])insert.run(id,JSON.stringify({status:id==='linked-pending'?'pending':'acknowledged',intake:{news_job_id:'synthetic-child-'+id}}));
 insert.run('unlinked',JSON.stringify({intake:{news_job_id:null}}));
 const before=store.db.prepare('SELECT id,body FROM jobs ORDER BY id').all();
 const query="SELECT body FROM jobs WHERE json_extract(body,'$.intake.news_job_id') IS NOT NULL";
 const plan=store.db.prepare('EXPLAIN QUERY PLAN '+query).all();
 assert.ok(plan.some(r=>r.detail.includes('jobs_intake_news_link')));
 assert.deepEqual(store.db.prepare(query).all().map(r=>JSON.parse(r.body).intake.news_job_id).sort(),
  ['synthetic-child-linked-pending','synthetic-child-linked-published']);
 assert.deepEqual(store.db.prepare('SELECT id,body FROM jobs ORDER BY id').all(),before);
});
function fixture(t){
 const db=new DatabaseSync(':memory:'),approval=new EditorialApproval(db);t.after(()=>db.close());
 const insert=db.prepare('INSERT INTO editorial_reviews VALUES(?,?,?)');
 const add=(id,status,actor=owner)=>{
  const row={job_id:id,owner:actor,status,updated_at:'2026-10-11T19:00:00Z',preview_hash:'hash-'+id,
   preview:{title:'Synthetische Vorschau '+id,markdown:'Privater synthetischer Testtext. '.repeat(10000)},
   approval:null,publication:{edition:{test_only:true}}};
  insert.run(id,actor,JSON.stringify(row));return row;
 };
 for(let i=0;i<30;i++)add('history-'+i,'PUBLISHED');
 return {db,approval,add};
}

test('notification projection is owner-scoped, indexed and leaves large immutable history untouched',t=>{
 const {db,approval,add}=fixture(t);
 const ready=add('ready','AWAITING_FINAL_APPROVAL');add('other-ready','AWAITING_FINAL_APPROVAL',other);
 for(const state of ['HOLD','SKIPPED','REVISION_REQUESTED','NEEDS_REVIEW','APPROVED_FOR_PUBLICATION','PUBLISHING'])add(state,state);
 const before=db.prepare('SELECT body FROM editorial_reviews ORDER BY job_id').all();
 approval.list=()=>{throw Error('FULL_HISTORY_MUST_NOT_BE_LOADED');};
 approval.get=()=>{throw Error('FULL_PREVIEW_MUST_NOT_BE_LOADED');};
 assert.deepEqual(approval.notificationCandidates(owner).map(r=>({...r})),[
  {job_id:ready.job_id,preview_hash:ready.preview_hash,title:ready.preview.title}]);
 assert.deepEqual(approval.notificationCandidates('222222222222222222'),[]);
 assert.throws(()=>approval.notificationCandidates('bad'),/OWNER_REQUIRED/);
 const plan=db.prepare("EXPLAIN QUERY PLAN SELECT job_id FROM editorial_reviews WHERE json_extract(body,'$.status')='AWAITING_FINAL_APPROVAL' AND owner=?").all(owner);
 assert.ok(plan.some(r=>r.detail.includes('editorial_reviews_state')));
 assert.deepEqual(db.prepare('SELECT body FROM editorial_reviews ORDER BY job_id').all(),before);
});

test('internal pending count uses an index without loading previews or changing publication gates',t=>{
 const {db,approval,add}=fixture(t);add('approved','APPROVED_FOR_PUBLICATION');add('publishing','PUBLISHING');
 add('unapproved','AWAITING_FINAL_APPROVAL');add('hold','HOLD');
 const before=db.prepare('SELECT body FROM editorial_reviews ORDER BY job_id').all();
 const expected=approval.pendingPublication().length;
 approval.pendingPublication=()=>{throw Error('FULL_PUBLICATIONS_MUST_NOT_BE_LOADED');};
 assert.equal(approval.pendingPublicationCount(),expected);assert.equal(expected,2);
 const plan=db.prepare("EXPLAIN QUERY PLAN SELECT count(*) FROM editorial_reviews WHERE json_extract(body,'$.status') IN ('APPROVED_FOR_PUBLICATION','PUBLISHING')").all();
 assert.ok(plan.some(r=>r.detail.includes('editorial_reviews_state')));
 assert.deepEqual(db.prepare('SELECT body FROM editorial_reviews ORDER BY job_id').all(),before);
 const server=fs.readFileSync(new URL('../../scripts/news/bridge/editorial-server.mjs',import.meta.url),'utf8');
 assert.match(server,/pending:approval\.pendingPublicationCount\(\)/);
 assert.doesNotMatch(server,/pending:approval\.pendingPublication\(\)\.length/);
});

test('Discord sends the same private once-per-hash notice from metadata, never archived bodies',async t=>{
 const {approval,add}=fixture(t);const ready=add('ready','AWAITING_FINAL_APPROVAL');
 add('other-ready','AWAITING_FINAL_APPROVAL',other);add('hold','HOLD');
 approval.list=()=>{throw Error('FULL_HISTORY_MUST_NOT_BE_LOADED');};
 const observations=new Map(),store={observation:key=>observations.get(key),observe:(key,value)=>observations.set(key,value)};
 let sent=0;const fetchImpl=async(url,request)=>{
  if(url.endsWith('/messages')){sent++;const body=JSON.parse(request.body);
   assert.deepEqual(body.allowed_mentions,{parse:[]});assert.ok(body.content.includes(ready.preview.title));
   assert.ok(!body.content.includes(ready.preview.markdown));return new Response('{}');}
  return new Response(JSON.stringify({id:'222222222222222222'}));
 };
 const config={token:'synthetic',recipient:owner};
 await notifyEditorialReviews({approval,store,config,fetchImpl});
 await notifyEditorialReviews({approval,store,config,fetchImpl});
 assert.equal(sent,1);assert.equal(observations.size,1);
 assert.ok(observations.get('editorial-notified:ready:hash-ready').sent_at);
 assert.equal(approval.pendingPublicationCount(),0);
});

test('metadata notifications preserve provider failure backoff and never approve a draft',async t=>{
 const {approval,add}=fixture(t);add('ready','AWAITING_FINAL_APPROVAL');
 const observations=new Map(),store={observation:key=>observations.get(key),observe:(key,value)=>observations.set(key,value)};
 let calls=0;const fetchImpl=async()=>{calls++;throw Error('SYNTHETIC_DISCORD_FAILURE');};
 const config={token:'synthetic',recipient:owner};
 await notifyEditorialReviews({approval,store,config,fetchImpl});await notifyEditorialReviews({approval,store,config,fetchImpl});
 assert.equal(calls,1);const notice=observations.get('editorial-notified:ready:hash-ready');
 assert.equal(notice.status,'NOTIFICATION_PENDING');assert.ok(Date.parse(notice.retry_after)>Date.now());
 assert.equal(approval.pendingPublicationCount(),0);
 assert.equal(approval.get('ready').status,'AWAITING_FINAL_APPROVAL');
});
