import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { PollStore, PollAbuseStore } from '../../ops/polls/backend/store.mjs';
import { createPollHandler, clientAddress, discordAdminAuthorizer } from '../../ops/polls/backend/api.mjs';
const seed=JSON.parse(readFileSync(new URL('../../ops/polls/backend/first-poll.json',import.meta.url)));
const ORIGIN='https://wirkungsoekonomie.de';
async function fixture(t){
  const dir=mkdtempSync(join(tmpdir(),'woek-poll-http-'));
  const store=new PollStore({path:join(dir,'polls.sqlite'),pepper:'tests-only-not-production-'.repeat(3)});
  const abuse=new PollAbuseStore({path:join(dir,'abuse.sqlite'),pepper:'other-tests-only-'.repeat(3)});
  const handler=createPollHandler({store,abuse,authorize:async req=>req.headers.authorization==='Bearer test-admin',logger:{error(){}}});
  const server=createServer((req,res)=>handler(req,res));
  server.listen(0,'127.0.0.1');await once(server,'listening');
  t.after(()=>{server.closeAllConnections();server.close();store.close();abuse.close();rmSync(dir,{recursive:true});});
  const call=async(path,options={})=>{
    const response=await fetch(`http://127.0.0.1:${server.address().port}${path}`,{...options,headers:{Origin:ORIGIN,...options.headers}});
    return {status:response.status,data:response.status===204?null:await response.json(),headers:response.headers};
  };
  return {store,call};
}
test('HTTP load/vote/results: no counts leak before vote, duplicates return saved result',async t=>{
  const {store,call}=await fixture(t);const p=store.create(seed),token=randomBytes(32).toString('hex');
  assert.equal((await call(`/api/polls/${p.slug}`)).data.results,null);
  const votes={method:'POST',headers:{'Content-Type':'application/json','X-Poll-Vote-Token':token},body:JSON.stringify({option_id:p.options[0].id,count:9999})};
  const first=await call(`/api/polls/${p.slug}/vote`,votes);assert.equal(first.status,201);assert.equal(first.data.results.total,1);
  const repeated=await call(`/api/polls/${p.slug}/vote`,votes);assert.equal(repeated.status,409);assert.equal(repeated.data.code,'ALREADY_VOTED');assert.equal(repeated.data.results.total,1);
  assert.equal((await call(`/api/polls/${p.slug}/results`)).data.results,null);
  assert.equal((await call(`/api/polls/${p.slug}/results`,{headers:{'X-Poll-Vote-Token':token}})).data.results.total,1);
  const publicCatalog=(await call('/api/polls/export')).data;
  assert.equal(JSON.stringify(publicCatalog).includes('anonymous_vote_identifier'),false);
  assert.equal(JSON.stringify(publicCatalog).includes('results'),true); // visibility setting, never result counts
  assert.equal(publicCatalog.polls[0].results,undefined);
});
test('CSRF, CORS, content type, input and admin authorization',async t=>{
  const {store,call}=await fixture(t);const p=store.create(seed);
  assert.equal((await call('/api/admin/polls')).status,403);
  assert.equal((await call('/api/admin/polls',{headers:{Authorization:'Bearer forged'}})).status,403);
  assert.equal((await call('/api/admin/polls',{method:'POST',headers:{Authorization:'Bearer test-admin',Origin:'https://evil.test','Content-Type':'application/json'},body:JSON.stringify(seed)})).status,403);
  const rejected=await call(`/api/polls/${p.slug}`,{headers:{Origin:'https://evil.test'}});assert.equal(rejected.headers.get('access-control-allow-origin'),null);
  assert.equal((await call(`/api/polls/${p.slug}/vote`,{method:'POST',body:'anything'})).status,415);
  assert.equal((await call(`/api/polls/${p.slug}/vote`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})).status,400);
  const preflight=await call('/api/admin/polls',{method:'OPTIONS'});assert.equal(preflight.status,204);assert.ok(preflight.headers.get('access-control-allow-methods').includes('PATCH'));
  assert.equal(preflight.headers.get('access-control-allow-credentials'),null);
});
test('admin create, preview, edit, duplicate, delete, no public drafts',async t=>{
  const {call}=await fixture(t),headers={Authorization:'Bearer test-admin','Content-Type':'application/json'};
  const creation=await call('/api/admin/polls',{method:'POST',headers,body:JSON.stringify({...seed,status:'draft'})});
  assert.equal(creation.status,201);let p=creation.data.poll;
  assert.equal((await call(`/api/polls/${p.slug}`)).status,404);
  assert.equal((await call(`/api/admin/polls/${p.id}`,{headers})).data.poll.question,seed.question);
  p=(await call(`/api/admin/polls/${p.id}`,{method:'PATCH',headers,body:JSON.stringify({revision:p.revision,status:'active'})})).data.poll;
  assert.equal((await call(`/api/polls/${p.slug}`)).status,200);
  const copy=(await call(`/api/admin/polls/${p.id}/duplicate`,{method:'POST',headers,body:'{}'})).data.poll;
  assert.equal(copy.status,'draft');
  assert.equal((await call(`/api/admin/polls/${p.id}`,{method:'DELETE',headers,body:JSON.stringify({revision:p.revision,confirmation:p.title})})).status,200);
  assert.equal((await call(`/api/polls/${p.slug}`)).status,404);
});
test('proxy headers cannot override a direct remote address',()=>{
  assert.equal(clientAddress({socket:{remoteAddress:'192.0.2.10'},headers:{'x-real-ip':'198.51.100.20'}},true),'192.0.2.10');
  assert.equal(clientAddress({socket:{remoteAddress:'127.0.0.1'},headers:{'x-real-ip':'198.51.100.20'}},true),'198.51.100.20');
  assert.equal(clientAddress({socket:{remoteAddress:'127.0.0.1'},headers:{'x-forwarded-for':'forged'}},true),'127.0.0.1');
});
test('HTTP explicit consent and own withdrawal preserve other voters and enforce origin',async t=>{
  const {store,call}=await fixture(t),p=store.create({...seed,slug:'sensitive',consent_required:true}),token=randomBytes(32).toString('hex');
  const headers={'Content-Type':'application/json','X-Poll-Vote-Token':token};
  const route=`/api/polls/${p.slug}/vote`;
  assert.equal((await call(route,{method:'POST',headers,body:JSON.stringify({option_id:p.options[0].id})})).data.code,'CONSENT_REQUIRED');
  assert.equal((await call(route,{method:'POST',headers,body:JSON.stringify({option_id:p.options[0].id,consent_version:'sensitive-choice-v1'})})).status,201);
  const body=JSON.stringify({confirmation:'EIGENE STIMME LÖSCHEN'});
  assert.equal((await call(route,{method:'DELETE',headers:{...headers,Origin:'https://evil.test'},body})).status,403);
  assert.equal(store.results(p).total,1);
  assert.equal((await call(route,{method:'DELETE',headers,body})).status,200);
  assert.equal(store.results(p).total,0);
  assert.equal((await call(`/api/polls/${p.slug}`,{headers})).data.results,null);
});
test('optional private feedback: vote remains independent; text is admin-only, deduplicated and removable',async t=>{
  const {store,call}=await fixture(t),p=store.create(seed),token=randomBytes(32).toString('hex');
  const headers={'Content-Type':'application/json','X-Poll-Vote-Token':token};
  const comment=async text=>call(`/api/polls/${p.slug}/feedback`,{method:'POST',headers,body:JSON.stringify({text})});
  assert.equal((await comment('Noch nicht abgestimmt')).status,403);
  assert.equal((await call(`/api/polls/${p.slug}/vote`,{method:'POST',headers,body:JSON.stringify({option_id:p.options[1].id})})).status,201);
  assert.equal(store.results(p).total,1);assert.equal(store.listFeedback(p.id).total,0);
  assert.equal((await comment('   ')).status,400);
  assert.equal((await comment('a'.repeat(1501))).status,400);
  const text='<script>alert("xss")</script> Bitte die Quellen deutlicher verlinken.';
  assert.equal((await comment(text)).status,200);
  assert.equal((await comment('Unbeabsichtigter zweiter Klick')).status,200);
  assert.equal(store.listFeedback(p.id).total,1);assert.equal(store.results(p).total,1);
  for(const route of [`/api/polls/${p.slug}`,`/api/polls/${p.slug}/results`,'/api/polls/export']){
    const publicData=(await call(route,{headers})).data;assert.equal(JSON.stringify(publicData).includes('Bitte die Quellen'),false);
  }
  assert.equal((await call(`/api/admin/polls/${p.id}/feedback`)).status,403);
  const admin={Authorization:'Bearer test-admin','Content-Type':'application/json'};
  const list=(await call(`/api/admin/polls/${p.id}/feedback`,{headers:admin})).data;
  assert.equal(list.items[0].body,text);assert.equal(list.items[0].selected_option,p.options[1].label);assert.equal(list.items[0].status,'new');
  assert.equal(list.items[0].vote_id,undefined);
  const endpoint=`/api/admin/polls/${p.id}/feedback/${list.items[0].id}`;
  assert.equal((await call(endpoint,{method:'PATCH',headers:admin,body:'{"status":"read"}'})).status,200);
  assert.equal(store.listFeedback(p.id).items[0].status,'read');
  assert.equal((await call(endpoint,{method:'PATCH',headers:admin,body:'{"status":"archived"}'})).status,200);
  assert.equal((await call(endpoint,{method:'DELETE',headers:admin,body:'{"confirmation":"FEEDBACK LÖSCHEN"}'})).status,200);
  assert.equal(store.listFeedback(p.id).total,0);assert.equal(store.results(p).total,1);
});
test('feedback rate limit is separate from vote integrity and cannot create extra comments',async t=>{
  const {store,call}=await fixture(t),p=store.create(seed),token=randomBytes(32).toString('hex');store.vote(p.slug,p.options[0].id,token);
  const settings={method:'POST',headers:{'Content-Type':'application/json','X-Poll-Vote-Token':token},body:'{"text":"Interner Test"}'};
  for(let i=0;i<5;i++)assert.equal((await call(`/api/polls/${p.slug}/feedback`,settings)).status,200);
  assert.equal((await call(`/api/polls/${p.slug}/feedback`,settings)).status,429);
  assert.equal(store.results(p).total,1);assert.equal(store.listFeedback(p.id).total,1);
});
test('community membership is not admin: verify current Discord owner/permissions',async()=>{
  const original=globalThis.fetch;let roles=[],owner='different';
  globalThis.fetch=async url=>({ok:true,status:200,json:async()=>url.endsWith('/roles')?roles:url.includes('/members/')?{roles:['role-1']}:{owner_id:owner}});
  try{
    const authorize=discordAdminAuthorizer({authenticate:async()=>({sub:'123456789012345678'}),token:'test-only',guildId:'1401888415318016020'});
    assert.equal(await authorize({}),false);
    roles=[{id:'role-1',permissions:'8'}];assert.equal(await authorize({}),true);
    roles=[];owner='123456789012345678';assert.equal(await authorize({}),true);
    const denied=discordAdminAuthorizer({authenticate:async()=>undefined,token:'test-only',guildId:'1401888415318016020'});assert.equal(await denied({}),false);
  }finally{globalThis.fetch=original;}
});
