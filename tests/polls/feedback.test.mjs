import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync,readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { PollStore } from '../../ops/polls/backend/store.mjs';
const seed=JSON.parse(readFileSync(new URL('../../ops/polls/backend/first-poll.json',import.meta.url)));
function fixture(t){const dir=mkdtempSync(path.join(tmpdir(),'woek-feedback-')),file=path.join(dir,'polls.sqlite'),pepper='test-only-private-feedback-'.repeat(3);let store=new PollStore({path:file,pepper});t.after(()=>{store.close();rmSync(dir,{recursive:true});});return {get store(){return store;},reopen(){store.close();store=new PollStore({path:file,pepper});return store;}};}
test('feedback is persistent, scoped to a vote and closed when disabled/paused/archived',t=>{
  const f=fixture(t),token=randomBytes(32).toString('hex');let p=f.store.create(seed);
  f.store.vote(p.slug,p.options[0].id,token);f.store.feedback(p.slug,token,{text:'Persistentes internes Feedback'});
  assert.equal(f.reopen().listFeedback(p.id).items[0].body,'Persistentes internes Feedback');
  assert.equal(f.store.view(p.slug,token).feedback_submitted,true);
  const other=f.store.create({...seed,slug:'zweite-umfrage'});
  assert.throws(()=>f.store.feedback(other.slug,token,{text:'Nicht meine Stimme'}),/nach Deiner Abstimmung/);
  p=f.store.update(p.id,{revision:p.revision,status:'paused'});
  assert.throws(()=>f.store.feedback(p.slug,token,{text:'Pause'}),/kein Feedback/);
  p=f.store.update(p.id,{revision:p.revision,status:'active',feedback_enabled:false});
  assert.throws(()=>f.store.feedback(p.slug,token,{text:'Deaktiviert'}),/kein Feedback/);
});
test('deleting votes cascades private feedback, deleting feedback does not delete a vote',t=>{
  const {store}=fixture(t),token=randomBytes(32).toString('hex');let p=store.create(seed);
  store.vote(p.slug,p.options[0].id,token);store.feedback(p.slug,token,{text:'Feedback'});
  p=store.update(p.id,{revision:p.revision,status:'paused'});
  store.deleteVotes(p.id,{revision:p.revision,confirmation:'STIMMEN LÖSCHEN'});
  assert.equal(store.listFeedback(p.id).total,0);assert.equal(store.results(p).total,0);
  assert.equal(store.db.prepare('PRAGMA foreign_key_check').all().length,0);
});
test('schema-1 migration preserves votes while adding optional feedback and metadata',t=>{
  const dir=mkdtempSync(path.join(tmpdir(),'woek-poll-migration-')),file=path.join(dir,'db.sqlite'),pepper='migration-test-pepper-'.repeat(3);
  t.after(()=>rmSync(dir,{recursive:true}));
  let store=new PollStore({path:file,pepper}),p=store.create(seed),token=randomBytes(32).toString('hex');store.vote(p.slug,p.options[0].id,token);store.close();
  const old=new DatabaseSync(file);
  old.exec('DROP TABLE poll_feedback; DROP INDEX votes_poll_identity; ALTER TABLE polls DROP COLUMN social_description; ALTER TABLE polls DROP COLUMN feedback_enabled; ALTER TABLE polls ADD COLUMN feedback_enabled INTEGER NOT NULL DEFAULT 0 CHECK(feedback_enabled=0); PRAGMA user_version=1;');old.close();
  store=new PollStore({path:file,pepper});
  try{assert.equal(store.results(store.get(p.id)).total,1);assert.equal(store.view(p.slug,token).voted,true);assert.equal(store.get(p.id).feedback_enabled,0);assert.equal(store.db.prepare('PRAGMA user_version').get().user_version,2);}finally{store.close();}
});
