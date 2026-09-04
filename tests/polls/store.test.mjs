import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { Worker } from 'node:worker_threads';
import { PollStore, PollAbuseStore, validatePoll, percentages, safeUrl } from '../../ops/polls/backend/store.mjs';

const seed = JSON.parse(readFileSync(new URL('../../ops/polls/backend/first-poll.json', import.meta.url)));
const token = () => randomBytes(32).toString('hex');
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'woek-poll-test-'));
  let now = Date.parse('2026-09-04T10:00:00Z');
  const config = { path: join(dir, 'polls.sqlite'), pepper: 'test-only-pepper-'.repeat(3), now: () => now };
  const store = new PollStore(config);
  t.after(() => { try { store.close(); } catch {} rmSync(dir, { recursive: true }); });
  return { store, dir, config, setNow: n => { now = Date.parse(n); } };
}
test('valid poll, zero votes, own vote visibility, duplicate and persistence', t => {
  const {store, config} = fixture(t);
  const p = store.create(seed), voter = token();
  assert.equal(store.view(p.slug).results, null);
  assert.equal(store.results(p).total, 0);
  assert.deepEqual(store.results(p).options.map(o=>o.percentage), [0,0,0,0]);
  const result = store.vote(p.slug, p.options[0].id, voter);
  assert.equal(result.results.total, 1);
  assert.equal(result.results.options[0].percentage, 100);
  assert.throws(() => store.vote(p.slug, p.options[1].id, voter), { code: 'ALREADY_VOTED' });
  assert.equal(store.view(p.slug).results, null);
  assert.equal(store.view(p.slug, voter).selected_option, p.options[0].id);
  const raw = store.db.prepare('SELECT * FROM votes').get();
  assert.notEqual(raw.anonymous_vote_identifier, voter);
  assert.deepEqual(Object.keys(raw).sort(), ['id','poll_id','option_id','anonymous_vote_identifier','created_at'].sort());
  store.close();
  const reopened = new PollStore(config);
  assert.equal(reopened.view(p.slug, voter).results.total, 1);
  reopened.close();
});
test('invalid option and invalid token never write votes', t => {
  const {store} = fixture(t); const p = store.create(seed);
  assert.throws(() => store.vote(p.slug, 'bad', token()), { code: 'INVALID_OPTION' });
  assert.throws(() => store.vote(p.slug, p.options[0].id, 'bad'));
  assert.equal(store.results(p).total, 0);
});
test('start, exact end, paused and manually ended states', t => {
  const {store, setNow} = fixture(t);
  let p = store.create({ ...seed, starts_at:'2026-09-04T11:00:00Z', ends_at:'2026-09-04T12:00:00Z', status:'scheduled' });
  assert.equal(store.get(p.id).effective_status, 'scheduled');
  assert.throws(() => store.vote(p.slug,p.options[0].id,token()), { code:'NOT_ACTIVE' });
  setNow('2026-09-04T11:00:00Z');
  assert.equal(store.vote(p.slug,p.options[0].id,token()).results.total,1);
  p = store.update(p.id, {revision:p.revision,status:'paused'});
  assert.throws(() => store.vote(p.slug,p.options[0].id,token()), { code:'NOT_ACTIVE' });
  p = store.update(p.id, {revision:p.revision,status:'active'});
  setNow('2026-09-04T12:00:00Z');
  assert.equal(store.get(p.id).effective_status,'ended');
  assert.throws(() => store.vote(p.slug,p.options[0].id,token()), { code:'NOT_ACTIVE' });
  p = store.update(p.id, {revision:p.revision,status:'ended'});
  assert.equal(store.get(p.id).effective_status,'ended');
});
test('visibility is enforced for all modes, drafts are private, archive closes votes', t => {
  const {store} = fixture(t);
  for (const visibility of ['always','after_vote','after_end']) {
    let p = store.create({...seed,slug:`test-${visibility.replace('_','-')}`,results_visibility:visibility});
    assert.equal(Boolean(store.view(p.slug).results),visibility==='always');
    const voter=token(); store.vote(p.slug,p.options[0].id,voter);
    assert.equal(Boolean(store.view(p.slug,voter).results),visibility!=='after_end');
    p=store.update(p.id,{revision:p.revision,status:'archived'});
    assert.equal(Boolean(store.view(p.slug).results),visibility!=='after_vote');
    assert.throws(()=>store.vote(p.slug,p.options[0].id,token()),{code:'NOT_ACTIVE'});
  }
  const draft=store.create({...seed,slug:'draft',status:'draft'});
  assert.throws(()=>store.view(draft.slug),{status:404});
  assert.equal(store.list().some(p=>p.slug==='draft'),false);
});
test('percentage calculation sums to 100 with one decimal, zero remains zero', () => {
  assert.deepEqual(percentages([0,0]),[0,0]);
  assert.deepEqual(percentages([1,1,1]),[33.4,33.3,33.3]);
  assert.deepEqual(percentages([48,31,15,6]),[48,31,15,6]);
  assert.deepEqual(percentages([1,2]),[33.3,66.7]);
});
test('validation, safe links, reserved slugs and option bounds', () => {
  for (const value of [{slug:'../x'},{slug:'vorschau'},{options:[{label:'one'}]},{options:Array(9).fill({label:'same'})},{status:'wrong'},{title:'x'.repeat(181)},{starts_at:'2026-09-04'},{ends_at:'2026-09-01T00:00:00Z',starts_at:'2026-09-02T00:00:00Z'}]) assert.throws(()=>validatePoll({...seed,...value}));
  for (const link of ['javascript:alert(1)','//evil.test','https://user:pass@test.test','/\\evil.test']) assert.throws(()=>safeUrl(link));
  assert.throws(()=>safeUrl('https://tracker.test/a.png',true));
  assert.equal(safeUrl('/news/?utm_source=chatgpt.com'),'/news/');
});
test('frozen voted options, stable published slug, optimistic edits, duplication', t => {
  const {store}=fixture(t); let p=store.create(seed);
  store.vote(p.slug,p.options[0].id,token());
  assert.throws(()=>store.update(p.id,{revision:p.revision,question:'Changed?'}),{code:'VOTES_EXIST'});
  assert.throws(()=>store.update(p.id,{revision:p.revision,options:[{label:'A'},{label:'B'}]}),{code:'VOTES_EXIST'});
  assert.throws(()=>store.update(p.id,{revision:p.revision,slug:'new-slug'}));
  p=store.update(p.id,{revision:p.revision,options:[...p.options].reverse()});
  assert.equal(store.results(p).total,1);
  assert.throws(()=>store.update(p.id,{revision:1,intro:'Late edit'}),{code:'REVISION_CONFLICT'});
  const copy=store.duplicate(p.id);
  assert.equal(copy.status,'draft'); assert.equal(store.results(copy).total,0);
  assert.equal(copy.published_at,null);
});
test('per-poll voter identifiers are unlinkable, delete cascade and retirement', t => {
  const {store}=fixture(t); let p=store.create(seed); const voter=token();
  const other=store.create({...seed,slug:'other'});
  assert.notEqual(store.tokenHash(p.id,voter),store.tokenHash(other.id,voter));
  store.vote(p.slug,p.options[0].id,voter);
  assert.throws(()=>store.deleteVotes(p.id,{revision:p.revision,confirmation:'STIMMEN LÖSCHEN'}));
  p=store.update(p.id,{revision:p.revision,status:'paused'});
  assert.equal(store.deleteVotes(p.id,{revision:p.revision,confirmation:'STIMMEN LÖSCHEN'}).deleted_votes,1);
  p=store.get(p.id);
  assert.throws(()=>store.delete(p.id,{revision:p.revision,confirmation:'wrong'}));
  store.delete(p.id,{revision:p.revision,confirmation:p.title});
  assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM votes').get().n,0);
  assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM poll_options WHERE poll_id=?').get(p.id).n,0);
  assert.throws(()=>store.create(seed),{code:'SLUG_CONFLICT'});
});
test('separate peppered abuse data expires and never stores plaintext IP', t => {
  const {dir,setNow,config}=fixture(t);
  const abuse=new PollAbuseStore({...config,path:join(dir,'abuse.sqlite')}); t.after(()=>abuse.close());
  abuse.consume('192.0.2.1','vote',1,60000);
  assert.throws(()=>abuse.consume('192.0.2.1','vote',1,60000),{status:429});
  assert.equal(JSON.stringify(abuse.db.prepare('SELECT * FROM windows').all()).includes('192.0.2.1'),false);
  setNow('2026-09-04T10:02:00Z'); abuse.purge();
  assert.equal(abuse.db.prepare('SELECT COUNT(*) AS n FROM windows').get().n,0);
});
test('concurrent processes: exactly one vote for the same identifier', async t => {
  const {store,config}=fixture(t); const p=store.create(seed), voter=token();
  const moduleUrl=new URL('../../ops/polls/backend/store.mjs',import.meta.url).href;
  const work=()=>new Promise((resolve,reject)=>{
    const worker=new Worker(`const {parentPort,workerData}=require('node:worker_threads'); (async()=>{ const {PollStore}=await import(workerData.moduleUrl); const s=new PollStore({...workerData.config,now:()=>Date.parse('2026-09-04T10:00:00Z')}); try {s.vote(workerData.slug,workerData.option,workerData.token); parentPort.postMessage('ok');} catch(e){parentPort.postMessage(e.code);} finally{s.close();} })().catch(e=>{throw e});`,{eval:true,workerData:{moduleUrl,config:{path:config.path,pepper:config.pepper},slug:p.slug,option:p.options[0].id,token:voter}});
    worker.on('message',resolve);worker.on('error',reject);
  });
  const results=await Promise.all(Array.from({length:6},work));
  assert.equal(results.filter(x=>x==='ok').length,1);
  assert.equal(results.filter(x=>x==='ALREADY_VOTED').length,5);
  assert.equal(store.results(p).total,1);
});
