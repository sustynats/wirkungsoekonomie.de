import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { PollStore, CONSENT_VERSION } from '../../ops/polls/backend/store.mjs';
import { prepareRestore } from '../../ops/polls/backend/restore.mjs';
import { loadExperience,validateExperience } from '../../scripts/polls/visual.mjs';
import { pollPage } from '../../scripts/polls/pages.mjs';
import { minimiseSensitivePollHtml } from '../../scripts/polls/privacy.mjs';
import { zoomTransform } from '../../assets/js/poll-visual.js';
const root=path.resolve(import.meta.dirname,'../..');
const seed=JSON.parse(fs.readFileSync(path.join(root,'ops/polls/backend/city-poll.json')));
const token=()=>randomBytes(32).toString('hex');
function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'woek-visual-')),file=path.join(dir,'live.sqlite'),pepper='test-only-sensitive-poll-pepper-'.repeat(3);
 let now=Date.now(); const store=new PollStore({path:file,pepper,now:()=>now});
 t.after(()=>{store.close();fs.rmSync(dir,{recursive:true});});
 return {store,dir,file,pepper,now:()=>now,advance:ms=>{now+=ms;}};
}
test('seven scenarios use equal domains, valid sources and actual own images',()=>{
 const data=loadExperience(root,seed.slug);assert.equal(data.scenarios.length,7);assert.equal(data.domains.length,5);
 for(const image of [data.baseline,...data.scenarios.map(s=>s.image)])assert.ok(fs.statSync(path.join(root,image)).size>100000);
 const bad=structuredClone(data);delete bad.scenarios[0].topics.energie;assert.throws(()=>validateExperience(bad),/unequal/);
 const wrong=structuredClone(data);wrong.domains[0].x=101;assert.throws(()=>validateExperience(wrong),/invalid area/);
 const tracking=structuredClone(data);tracking.scenarios[0].source+='?utm_source=chatgpt.com';assert.throws(()=>validateExperience(tracking),/source/);
});
test('zoom is deterministic, centred and clamped without blank image edges',()=>{
 assert.deepEqual(zoomTransform(null),{scale:1,x:0,y:0});
 const data=loadExperience(root,seed.slug);
 for(const area of data.domains){const z=zoomTransform(area),limit=50*(z.scale-1);assert.ok(Math.abs(z.x)<=limit);assert.ok(Math.abs(z.y)<=limit);assert.deepEqual(z,zoomTransform(area));}
 assert.deepEqual(zoomTransform({x:0,y:100,zoom:3}),{scale:3,x:100,y:-100});
});
test('sensitive HTML has zoom, sources, metadata, consent and no cross-page scripts',t=>{
 const {store}=fixture(t),poll=store.create({...seed,status:'active'}),html=pollPage(root,poll);
 for(const part of ['id="vp-area"','id="vp-wipe"','id="vp-compare"','id="vp-reveal"','id="einwilligung"','poll-visual.js','summary_large_image','no-referrer'])assert.ok(html.includes(part),part);
 assert.ok(!/src="[^\"]*(?:main|newsletter)\.js/.test(html));
 assert.ok(html.includes('/wirkungsradar/newsletter/'));
 assert.ok(!html.includes('anonymous_vote_identifier'));
 const later=html.replace('</body>','<script defer src="/assets/js/main.js"></script></body>');
 assert.ok(!minimiseSensitivePollHtml(later).includes('src="/assets/js/main.js"'));
 const mismatch={...poll,options:poll.options.slice(1)};assert.throws(()=>pollPage(root,mismatch),/mapping/);
});
test('explicit consent, own withdrawal, result secrecy and zero restoration',t=>{
 const {store}=fixture(t),p=store.create({...seed,status:'active'}),a=token(),b=token();
 assert.equal(store.view(p.slug).results,null);
 for(const consent of [undefined,'old-version',true])assert.throws(()=>store.vote(p.slug,p.options[0].id,a,consent),{code:'CONSENT_REQUIRED'});
 assert.equal(store.results(p).total,0);
 store.vote(p.slug,p.options[0].id,a,CONSENT_VERSION);store.vote(p.slug,p.options[1].id,b,CONSENT_VERSION);
 assert.equal(store.results(p).total,2);
 assert.throws(()=>store.update(p.id,{revision:p.revision,consent_required:false}),{code:'VOTES_EXIST'});
 assert.throws(()=>store.withdraw(p.slug,a,{confirmation:'yes'}));
 store.withdraw(p.slug,a,{confirmation:'EIGENE STIMME LÖSCHEN'});
 assert.equal(store.view(p.slug,a).voted,false);assert.equal(store.view(p.slug,a).results,null);assert.equal(store.results(p).total,1);
 assert.equal(store.view(p.slug,b).voted,true);
 store.withdraw(p.slug,a,{confirmation:'EIGENE STIMME LÖSCHEN'});assert.equal(store.results(p).total,1);
 const row=store.db.prepare('SELECT * FROM vote_withdrawals').get();assert.deepEqual(Object.keys(row).sort(),['vote_id','withdrawn_at']);
 store.withdraw(p.slug,b,{confirmation:'EIGENE STIMME LÖSCHEN'});assert.equal(store.results(p).total,0);
});
test('retention affects sensitive votes only, restore replays withdrawals without changing backup',t=>{
 const f=fixture(t),p=f.store.create({...seed,status:'active'}),a=token(),b=token();
 f.store.vote(p.slug,p.options[0].id,a,CONSENT_VERSION);f.store.vote(p.slug,p.options[1].id,b,CONSENT_VERSION);
 const normal=f.store.create({...seed,slug:'ordinary',status:'active',consent_required:false});f.store.vote(normal.slug,normal.options[0].id,token());
 const backup=path.join(f.dir,'backup.sqlite'),output=path.join(f.dir,'restore.sqlite');f.store.backup(backup);const bytes=fs.readFileSync(backup);
 f.store.withdraw(p.slug,a,{confirmation:'EIGENE STIMME LÖSCHEN'});
 assert.equal(prepareRestore({backup,current:f.file,output,pepper:f.pepper,now:f.now}).withdrawalsApplied,1);
 assert.deepEqual(fs.readFileSync(backup),bytes);
 const restored=new PollStore({path:output,pepper:f.pepper});
 try{assert.equal(restored.results(restored.get(p.id)).total,1);assert.equal(restored.view(p.slug,a).voted,false);}finally{restored.close();}
 assert.throws(()=>prepareRestore({backup,current:f.file,output,pepper:f.pepper}),/must not exist/);
 f.advance(365*86400000);assert.equal(f.store.purgeSensitiveData(),1);
 assert.equal(f.store.results(p).total,0);assert.equal(f.store.results(normal).total,1);
});
