import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {EditorialApproval,editorialPreviewHash} from '../../scripts/news/bridge/editorial-approval.mjs';
const owner='1206956406805102593';
const job={input:{job_id:'wt_20260910T000000Z_aaaaaaaaaaaaaaaaaaaaaaaa'},intake:{owner}};
const draft=()=>({format:'listened',source_media:{show:'Testshow',episode_title:'Eine Testfolge',original_release_date:'2026-09-10',original_url:'https://example.org/episode',hosts:[],guests:[]},title:'Ein geprüfter Gedanke zur gemeinsamen Zukunft',markdown:'## Ein Gedankenentwurf\n\nDieser ausdrücklich fiktive Testtext prüft ausschließlich den Freigabeablauf. Er enthält keine persönliche Meinung oder Erfahrung der Autorin.',sources:[{url:'https://example.org/episode',title:'Originalfolge',publisher:'Test-Publisher'}],checks:{source_binding:true,editorial_validation:true,personal_experiences_invented:false}});
const setup=()=>new EditorialApproval(new DatabaseSync(':memory:'),{now:()=> '2026-09-10T15:30:00Z'});
test('a preview never grants publication and only its owner may approve the exact version',()=>{
 const s=setup(),r=s.stage(job,draft());assert.equal(s.publishable(job.input.job_id),false);
 assert.throws(()=>s.decide('111111111111111111',job.input.job_id,{action:'APPROVE',preview_hash:r.preview_hash}),/NOT_FOUND/);
 assert.throws(()=>s.decide(owner,job.input.job_id,{action:'APPROVE',preview_hash:'outdated'}),/CHANGED/);
 s.decide(owner,job.input.job_id,{action:'APPROVE',preview_hash:r.preview_hash});assert.equal(s.publishable(job.input.job_id),true);
});
test('updated text, sources or imagery revoke an earlier approval; identical delivery is idempotent',()=>{
 const s=setup(),d=draft(),r=s.stage(job,d);s.decide(owner,job.input.job_id,{action:'APPROVE',preview_hash:r.preview_hash});
 assert.equal(s.stage(job,d).status,'APPROVED_FOR_PUBLICATION');
 const changed={...d,markdown:d.markdown+' Eine neue Aussage braucht erneut die Freigabe.'};
 const fresh=s.stage(job,changed);assert.equal(fresh.status,'AWAITING_FINAL_APPROVAL');assert.equal(s.publishable(job.input.job_id),false);assert.equal(fresh.revision,2);
 assert.notEqual(editorialPreviewHash(d),editorialPreviewHash({...d,sources:[{...d.sources[0],url:'https://example.org/revision'}]}));
});
test('revision requires a comment, retains it, and blocks approval until a fresh draft arrives',()=>{
 const s=setup(),r=s.stage(job,draft());assert.throws(()=>s.decide(owner,job.input.job_id,{action:'REVISE',preview_hash:r.preview_hash}),/COMMENT_REQUIRED/);
 const next=s.decide(owner,job.input.job_id,{action:'REVISE',preview_hash:r.preview_hash,comment:'Bitte die Gegenposition fair ausführen.'});assert.equal(next.comments.length,1);assert.equal(s.publishable(job.input.job_id),false);
 assert.throws(()=>s.decide(owner,job.input.job_id,{action:'APPROVE',preview_hash:r.preview_hash}),/NOT_READY/);
 const fresh=s.stage(job,{...draft(),title:'Die überarbeitete und geprüfte neue Fassung'});assert.equal(fresh.comments[0].comment,'Bitte die Gegenposition fair ausführen.');
});
test('unknown image rights, unsafe sources and absent source/editorial checks fail closed',()=>{
 const s=setup();assert.throws(()=>s.stage(job,{...draft(),visual:{url:'https://wirkungsoekonomie.de/image.jpg',alt:'Symbolbild',credit:'Unbekannt',rights_status:'UNKNOWN',allow_website:true}}),/NOT_CLEARED/);
 assert.throws(()=>s.stage(job,{...draft(),sources:[{url:'http://127.0.0.1/private',title:'Nein',publisher:'Nein'}]}));
 assert.throws(()=>s.stage(job,{...draft(),checks:{source_binding:false}}),/CHECKS_REQUIRED/);
});
test('holds and skipped contributions do not publish and audit survives every decision',()=>{
 const s=setup(),r=s.stage(job,draft());s.decide(owner,job.input.job_id,{action:'HOLD',preview_hash:r.preview_hash});assert.equal(s.publishable(job.input.job_id),false);
 s.decide(owner,job.input.job_id,{action:'SKIP',preview_hash:r.preview_hash});assert.equal(s.get(job.input.job_id).status,'SKIPPED');assert.equal(s.db.prepare('SELECT count(*) as n FROM editorial_review_audit').get().n,3);
});

test('a manual news preview cannot bypass native analysis with model-declared checks',()=>{
 const s=setup();assert.throws(()=>s.stage(job,{...draft(),format:'news'}),/NATIVE_REVIEW_REQUIRED/);
 assert.throws(()=>s.stage(job,{...draft(),format:'news',news_record:{published:true,analysis:{}}}),/NATIVE_REVIEW_REQUIRED/);
});
