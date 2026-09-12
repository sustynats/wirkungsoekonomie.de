import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {EditorialApproval,editorialPreviewHash} from '../../scripts/news/bridge/editorial-approval.mjs';
import {editorialRevisionBaseHash,reviseEditorial,applyApprovedEditorialRevisions,assertFinalPersonalSection,EDITORIAL_REVISION_FILE} from '../../scripts/news/editorial-approved-revisions.mjs';
import {importApprovedEditorials} from '../../scripts/news/bridge/personal-publication.mjs';
import {editorialAnalysisPage} from '../../scripts/news/build.mjs';
import {loadManualEditorials} from '../../scripts/news/manual-editorial.mjs';
import {importEditorialPreviews} from '../../scripts/news/bridge/intake-processing.mjs';
import {BridgeStore} from '../../scripts/news/bridge/store.mjs';
const root=path.resolve('.'),owner='1206956406805102593';
const original=JSON.parse(fs.readFileSync('data/news/editorial-analyses.json')).analyses.find(a=>a.status==='published'&&a.author_perspective?.paragraphs?.length);
function input(base=structuredClone(original),body){
 const target={analysis_id:base.analysis_id,slug:base.slug,base_hash:editorialRevisionBaseHash(base)};
 const manual=base.format==='book_and_impact',patch=manual?{body_markdown:body}:{author_perspective:structuredClone(base.author_perspective)};
 const preview={format:manual?'book_review':'opinion_analysis',title:base.title,markdown:body||'## Kontext\n\nDie vorhandenen Fakten, Quellen und Visualisierungen bleiben erhalten. Diese Vorschau ändert nur die Anordnung der bereits vorhandenen persönlichen Schlussfolgerung.\n\n## Meine Einordnung\n\n'+patch.author_perspective.paragraphs.join('\n\n'),
  sources:[{url:'https://wirkungsoekonomie.de/wirkungsticker/analyse/'+base.slug+'/',title:base.title,publisher:'Wirkungsökonomie'}],
  checks:{source_binding:true,editorial_validation:true,personal_experiences_invented:false},editorial_revision:{base,target,patch}};
 const job={input:{job_id:'wt_20260910T000000Z_aaaaaaaaaaaaaaaaaaaaaaaa',contract_path:'/98_CONFIG/editorial-request-contract-3.json'},intake:{owner,revision_target:target}};
 return {job,preview};
}
const setup=()=>new EditorialApproval(new DatabaseSync(':memory:'),{now:()=> '2026-09-10T22:00:00Z'});
test('an existing article revision requires a new exact approval and retains its URL and original',()=>{
 const {job,preview}=input(),before=JSON.stringify(original),s=setup();const r=s.stage(job,preview);
 assert.equal(s.claimPublications().length,0);assert.equal(r.approval,null);
 const html=s.preview(owner,job.input.job_id).html;
 assert.ok(html.indexOf('id="beobachtungspunkte"')<html.indexOf('id="meine-einordnung"'));
 assert.equal(JSON.stringify(original),before);
 s.decide(owner,job.input.job_id,{action:'APPROVE',preview_hash:r.preview_hash});
 const [e]=s.claimPublications();assert.equal(e.format,'approved_editorial_revision');assert.equal(e.slug,original.slug);assert.equal(e.analysis_id,original.analysis_id);
 assert.ok(s.markPublished(e.content_hash,'https://wirkungsoekonomie.de/wirkungsticker/analyse/'+e.slug+'/'));s.db.close();
});
test('a model cannot smuggle a revision target, and changed patches invalidate the approval hash',()=>{
 const {job,preview}=input(),s=setup();assert.throws(()=>s.stage({...job,intake:{owner}},preview),/UNTRUSTED/);
 const changed=structuredClone(preview);changed.editorial_revision.patch.author_perspective.paragraphs[0]+=' Geändert.';
 assert.notEqual(editorialPreviewHash(preview),editorialPreviewHash(changed));
 assert.throws(()=>s.stage(job,changed),/REVISION_INVALID/);
 changed.editorial_revision.target.base_hash='0'.repeat(64);assert.throws(()=>s.stage(job,changed));s.db.close();
});
test('approved import stores a versioned overlay, is idempotent, preserves canonical texts and rejects stale bases',async t=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'woek-editorial-revision-'));t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));fs.mkdirSync(path.join(temp,'data/news'),{recursive:true});
 const file=path.join(temp,'data/news/editorial-analyses.json');fs.writeFileSync(file,JSON.stringify({analyses:[original]}));const bytes=fs.readFileSync(file,'utf8');
 const s=setup(),{job,preview}=input(),r=s.stage(job,preview);s.decide(owner,job.input.job_id,{action:'APPROVE',preview_hash:r.preview_hash});const editions=s.claimPublications();
 const store={editorialClaim:async()=>editions,editorialFailure:async()=>assert.fail('valid approved revision failed')};
 assert.equal((await importApprovedEditorials(store,temp)).changed,true);assert.equal((await importApprovedEditorials(store,temp)).changed,false);
 assert.equal(fs.readFileSync(file,'utf8'),bytes);
 const [updated]=applyApprovedEditorialRevisions([original],temp);assert.equal(updated.slug,original.slug);assert.equal(updated.author_perspective_position,'last');assert.equal(updated.versions.at(-1).content_hash,editions[0].content_hash);
 assert.match(editorialAnalysisPage(updated),new RegExp('data-editorial-content-hash="'+editions[0].content_hash+'"'));
 assert.throws(()=>applyApprovedEditorialRevisions([{...original,subtitle:original.subtitle+' Changed.'}],temp),/BASE_CHANGED/);
 assert.equal(JSON.parse(fs.readFileSync(path.join(temp,EDITORIAL_REVISION_FILE))).editions.length,1);s.db.close();
});
test('book revision preserves both current covers, portrait, footnotes and every original sentence',()=>{
 const base=loadManualEditorials(root).find(a=>a.self_authored_work);
 const title='## Was ich mir von diesem Buch wünsche';assert.ok(base.body_markdown.includes(title));
 const body=base.body_markdown.replace(title,'## Meine Einordnung\n\n### Was ich mir von diesem Buch wünsche');
 const {job,preview}=input(base,body),s=setup();s.stage(job,preview);const page=s.preview(owner,job.input.job_id);
 assert.equal(page.html_document,true);assert.match(page.html,/>Meine Einordnung</);
 for(const book of base.book.volumes)assert.ok(page.html.includes(book.cover));
 assert.ok(page.html.includes(base.author.image));assert.equal(loadManualEditorials(root).find(a=>a.self_authored_work).body_markdown,base.body_markdown);
 const revised=reviseEditorial(base,preview.editorial_revision);assert.equal(revised.body_markdown.replace('## Meine Einordnung\n\n### Was ich mir von diesem Buch wünsche',title),base.body_markdown);s.db.close();
});
test('new contract requires Meine Einordnung last, metadata may follow, historical previews remain compatible',()=>{
 assert.doesNotThrow(()=>assertFinalPersonalSection('## Kontext\n\nEin Befund.\n\n## Meine Einordnung\n\nDie persönliche Gewichtung.\n\n## Quellen\n\nEine Quelle.'));
 assert.throws(()=>assertFinalPersonalSection('## Meine Einordnung\n\nUrteil.\n\n## Analyse\n\nEin späterer Hauptabschnitt.'),/FINAL_PERSPECTIVE_REQUIRED/);
 const s=setup(),{job,preview}=input();delete preview.editorial_revision;preview.markdown='## Ein älterer Entwurf\n\n'+('Dieser Testtext hat eine ältere Struktur und wird nicht automatisch nachträglich umgeschrieben. ').repeat(2);
 assert.throws(()=>s.stage(job,preview),/FINAL_PERSPECTIVE_REQUIRED/);delete job.input.contract_path;assert.doesNotThrow(()=>s.stage(job,preview));s.db.close();
});

test('contract 4 retains the personal closing-section gate',()=>{
 const s=setup(),{job,preview}=input();job.input.contract_path='/98_CONFIG/editorial-request-contract-4.json';
 delete preview.editorial_revision;
 preview.markdown='## Meine Einordnung\n\nEin Urteil.\n\n## Späterer Hauptabschnitt\n\n'+('Ein synthetischer nachträglicher Haupttext. ').repeat(5);
 assert.throws(()=>s.stage(job,preview),/FINAL_PERSPECTIVE_REQUIRED/);s.db.close();
});
test('ordinary Dropbox import binds an existing revision to server data and stages without publication',async t=>{
 const s=setup(),{job,preview}=input();
 Object.assign(job.input,{job_type:'editorial_request',input_hash:'1'.repeat(64),created_at:'2026-09-10T21:00:00Z',request:{kind:preview.format,links:preview.sources.map(v=>v.url)}});
 Object.assign(job,{candidate:{story_id:'wt-aaaaaaaaaaaaaaaa'},status:'queued',attempts:{}});
 Object.assign(job.intake,{revision_base:structuredClone(preview.editorial_revision.base),revision_story:{}});
 const forged=structuredClone(preview);forged.editorial_revision.base.title='Nicht vertrauenswürdiger Ersatz';forged.editorial_revision.target.slug='anderes-ziel';
 const output={schema_version:'1.0',job_id:job.input.job_id,input_hash:job.input.input_hash,processed_at:'2026-09-10T21:01:00Z',preview:forged};
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'editorial-revision-import-'));
 const store=new BridgeStore(path.join(dir,'queue.sqlite'),{lane:'import'});store.put(job);
 t.after(()=>{store.close();fs.rmSync(dir,{recursive:true,force:true});});
 const transport={list:async()=>[{name:job.input.job_id+'.output.json'}],read:async()=>JSON.stringify(output)};
 const result=await importEditorialPreviews({store,transport,approval:s,now:()=> '2026-09-10T22:00:00Z'});
 assert.deepEqual(result,{staged:1,failed:[]});assert.equal(store.get(job.input.job_id).accepted.staged,true);
 const staged=s.get(job.input.job_id);assert.equal(staged.preview.editorial_revision.target.slug,original.slug);assert.equal(staged.preview.editorial_revision.base.title,original.title);
 assert.equal(s.claimPublications().length,0);assert.equal((await importEditorialPreviews({store,transport,approval:s})).staged,0);s.db.close();
});
