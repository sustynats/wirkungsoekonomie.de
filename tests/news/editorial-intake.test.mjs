import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {once} from 'node:events';
import {BridgeStore} from '../../scripts/news/bridge/store.mjs';
import {EditorialIntake} from '../../scripts/news/bridge/intake.mjs';
import {EditorialApproval} from '../../scripts/news/bridge/editorial-approval.mjs';
import {createEditorialIntakeHandler,existingAdminAuthorizer} from '../../scripts/news/bridge/intake-http.mjs';
import {importEditorialPreviews} from '../../scripts/news/bridge/intake-processing.mjs';
import {prepareEditorialRevisions,notifyEditorialReviews} from '../../scripts/news/bridge/editorial-revisions.mjs';
import {importApprovedEditorials} from '../../scripts/news/bridge/personal-publication.mjs';
import {loadPersonalEditorials,PERSONAL_FILE} from '../../scripts/news/personal-editorial.mjs';
import {editorialAnalysisPage} from '../../scripts/news/build.mjs';
import {bridgePath} from '../../scripts/news/bridge/contract.mjs';
import {DropboxTransport} from '../../scripts/news/bridge/dropbox.mjs';
const owner='1206956406805102593',other='111111111111111111';
const now=()=>new Date().toISOString();
const preview=()=>({format:'opinion_analysis',title:'Ein ausdrücklich fiktiver Vorschautext',subtitle:'Prüfung des privaten Freigabewegs',markdown:'## Test der Freigabe\n\nDieser synthetische Text beschreibt ausschließlich den technischen Test einer Vorschau. Er ist kein wirklicher Beitrag und enthält keine persönliche Position oder Erfahrung der Autorin.\n\n## Meine Einordnung\n\nAuch dieser Schlussabschnitt ist ausschließlich eine synthetische Prüfung des Freigabewegs.',sources:[{url:'https://example.org/source',title:'Synthetische Testquelle',publisher:'Test'}],checks:{source_binding:true,editorial_validation:true,personal_experiences_invented:false}});
function setup(t){
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'editorial-intake-test-')),store=new BridgeStore(path.join(directory,'queue.sqlite'),{lane:'discovery'}),files=new Map();
 const transport={writeAtomic:async(p,v)=>{const text=JSON.stringify(v);if(files.has(p))assert.equal(files.get(p),text);else files.set(p,text);},list:async folder=>[...files.keys()].filter(p=>p.includes('/'+folder+'/')).map(p=>({name:p.split('/').at(-1)})),read:async p=>files.get(p),metadata:async p=>files.has(p)?{name:p.split('/').at(-1)}:null,move:async(a,b)=>{assert.ok(files.has(a));assert.equal(files.has(b),false);files.set(b,files.get(a));files.delete(a);}};
 const intake=new EditorialIntake({store,transport,directory:path.join(directory,'uploads')}),approval=new EditorialApproval(store.db);
 t.after(()=>{store.close();fs.rmSync(directory,{recursive:true,force:true});});return {directory,store,files,transport,intake,approval};
}
async function job(f){const d=f.intake.draft(owner,{client_id:randomUUID(),kind:'opinion_analysis',brief:'Bitte diesen synthetischen Testfall vorbereiten.',links:'https://example.org/source',author_notes:'',attachments:[],publish:true,urgent:false});const result=await f.intake.submit(owner,d.id);await f.intake.preparePending();return f.store.get(result.job_id);}
test('a legacy import receipt is not a readable manuscript and cannot mask the real text',async t=>{
 const f=setup(t),j=await job(f),receipt='Der geprüfte Entwurf wurde privat übernommen.';
 j.staging={text:receipt};f.store.put(j);
 assert.equal(f.intake.list(owner)[0].preview_available,false);
 assert.throws(()=>f.intake.preview(owner,j.input.job_id),e=>e.message==='INTAKE_PREVIEW_PENDING'&&e.status===409);
 assert.equal(f.store.get(j.input.job_id).staging.text,receipt);
 j.staging.record={source_summary:'Ein echter, kurzer Recherchetext.\n\nMit einem weiteren Absatz.'};f.store.put(j);
 assert.equal(f.intake.list(owner)[0].preview_available,true);
 assert.equal(f.intake.preview(owner,j.input.job_id).text,j.staging.record.source_summary);
 j.staging.editorial_preview=preview();f.store.put(j);
 assert.equal(f.intake.preview(owner,j.input.job_id).text,preview().markdown);
 assert.throws(()=>f.intake.preview(other,j.input.job_id),e=>e.status===404);
 assert.equal(f.approval.claimPublications().length,0);
});
test('screenshot intake uses the real atomic Dropbox writer and releases input only after intact attachments',async t=>{
 const f=setup(t),transport=new DropboxTransport({credentials:{}}),files=new Map(),moves=[];
 transport.request=async(op,args,body,binary)=>{
  if(op==='files/get_metadata'){if(!files.has(args.path))throw Error('BRIDGE_DROPBOX_NOT_FOUND');return {'.tag':'file'};}
  if(op==='files/upload'){assert.equal(files.has(args.path),false);files.set(args.path,Buffer.from(body));return {};}
  if(op==='files/download')return binary?Buffer.from(files.get(args.path)):files.get(args.path).toString('utf8');
  if(op==='files/move_v2'){assert.equal(files.has(args.to_path),false);files.set(args.to_path,files.get(args.from_path));files.delete(args.from_path);moves.push(args.to_path);return {};}
  throw Error('UNEXPECTED_OPERATION');
 };
 f.intake.transport=transport;
 const bytes=fs.readFileSync('assets/img/people/natalie-weber-woek-analyse.jpg');
 const d=f.intake.draft(owner,{client_id:randomUUID(),kind:'opinion_analysis',brief:'Synthetischer Auftrag mit eigener Bilddatei.',links:'',author_notes:'',attachments:[{name:'eigenes.jpg',type:'image/jpeg',size:bytes.length}],publish:false,urgent:false});
 f.intake.upload(owner,d.id,0,bytes,'image/jpeg');const result=await f.intake.submit(owner,d.id);await f.intake.preparePending();
 const j=f.store.get(result.job_id),asset=j.input.request.attachments[0].path;
 assert.equal(j.status,'queued');assert.deepEqual(files.get(asset),bytes);assert.equal(moves.at(-1),bridgePath('00_INBOX',j.input.job_id+'.input.json'));
 await transport.writeBinaryAtomic(asset,bytes);assert.equal(moves.length,2);
 await assert.rejects(transport.writeBinaryAtomic(asset,Buffer.from('changed bytes')),/IMMUTABLE_FILE_CONFLICT/);
 assert.deepEqual(files.get(asset),bytes);await assert.rejects(transport.writeBinaryAtomic(asset,Buffer.alloc(8*1024*1024+1)),/TOO_LARGE/);
});
test('intake, private preview, one final approval and serial publisher preserve the exact text',async t=>{
 const f=setup(t),j=await job(f);assert.equal(j.input.manual_only,true);assert.equal(j.input.request.publication_intent,'final_approval_required');
 f.files.set(bridgePath('20_OUTPUT_READY',j.input.job_id+'.output.json'),JSON.stringify({schema_version:'1.0',job_id:j.input.job_id,input_hash:j.input.input_hash,processed_at:now(),preview:preview()}));
 assert.equal((await importEditorialPreviews(f)).staged,1);const r=f.approval.get(j.input.job_id);assert.equal(r.status,'AWAITING_FINAL_APPROVAL');assert.equal(f.approval.claimPublications().length,0);
 f.approval.decide(owner,j.input.job_id,{action:'APPROVE',preview_hash:r.preview_hash});const exported=f.approval.claimPublications();assert.equal(exported.length,1);
 assert.throws(()=>f.approval.decide(owner,j.input.job_id,{action:'REVISE',preview_hash:r.preview_hash,comment:'zu spät'}),/IMMUTABLE/);
 assert.equal(JSON.stringify(exported).includes(owner),false);assert.equal(JSON.stringify(exported).includes('author_notes'),false);
 const worker={editorialClaim:async()=>exported};assert.equal((await importApprovedEditorials(worker,f.directory)).changed,true);assert.equal((await importApprovedEditorials(worker,f.directory)).changed,false);
 fs.mkdirSync(path.join(f.directory,'assets/img/people'),{recursive:true});fs.writeFileSync(path.join(f.directory,'assets/img/people/natalie-weber-woek-analyse.jpg'),'test');
 const [a]=loadPersonalEditorials(f.directory);assert.equal(a.body_markdown,preview().markdown);
 const html=editorialAnalysisPage(a);assert.match(html,/data-editorial-content-hash=/);assert.ok(html.includes(a.content_hash));assert.ok(!html.includes('undefinedassets'));
 assert.throws(()=>f.approval.markPublished(a.content_hash,'https://evil.example/'),/URL_INVALID/);
 f.approval.markPublished(a.content_hash,'https://wirkungsoekonomie.de/wirkungsticker/analyse/'+a.slug+'/');assert.equal(f.approval.get(j.input.job_id).status,'PUBLISHED');
 assert.ok(fs.existsSync(path.join(f.directory,PERSONAL_FILE)));
});
test('comments return one revision to the same bridge and require approval of the fresh version',async t=>{
 const f=setup(t),j=await job(f),r=f.approval.stage(j,preview());f.approval.decide(owner,j.input.job_id,{action:'REVISE',preview_hash:r.preview_hash,comment:'Bitte eine Gegenposition nachvollziehbar ergänzen.'});
 assert.equal(prepareEditorialRevisions(f),1);assert.equal(prepareEditorialRevisions(f),0);await f.intake.preparePending();
 const child=f.store.all().find(j=>j.intake.review_parent);assert.equal(child.input.job_type,'editorial_request');assert.equal(child.input.request.revision.comments[0].comment,'Bitte eine Gegenposition nachvollziehbar ergänzen.');
 const p={...preview(),markdown:preview().markdown+'\n\nEine ergänzte synthetische Gegenposition ist ebenfalls zu prüfen.'};
 f.files.set(bridgePath('20_OUTPUT_READY',child.input.job_id+'.output.json'),JSON.stringify({schema_version:'1.0',job_id:child.input.job_id,input_hash:child.input.input_hash,processed_at:now(),preview:p}));
 assert.equal((await importEditorialPreviews(f)).staged,1);assert.equal(f.approval.get(j.input.job_id).revision,2);assert.equal(f.approval.list(owner).length,1);assert.equal(f.approval.claimPublications().length,0);
});
test('a returned existing-publication review needs no obsolete form draft and stages a fresh approval',async t=>{
 const f=setup(t),j=await job(f);delete j.intake.draft_id;f.store.put(j);
 f.store.db.exec('DELETE FROM editorial_drafts');
 const r=f.approval.stage(j,preview());
 f.approval.decide(owner,j.input.job_id,{action:'REVISE',preview_hash:r.preview_hash,comment:'Bitte meinen mitgeteilten Entstehungsgedanken ergänzen.'});
 assert.equal(prepareEditorialRevisions(f),1);assert.equal(prepareEditorialRevisions(f),0);
 await f.intake.preparePending();
 const child=f.store.all().find(j=>j.intake.review_parent);
 assert.equal(child.status,'queued');assert.equal(child.last_error,undefined);
 assert.ok(f.files.has(bridgePath('00_INBOX',child.input.job_id+'.input.json')));
 const p={...preview(),markdown:preview().markdown+'\n\nErgänzter synthetischer Entstehungsgedanke zur erneuten Prüfung.'};
 f.files.set(bridgePath('20_OUTPUT_READY',child.input.job_id+'.output.json'),JSON.stringify({schema_version:'1.0',job_id:child.input.job_id,input_hash:child.input.input_hash,processed_at:now(),preview:p}));
 assert.equal((await importEditorialPreviews(f)).staged,1);
 const fresh=f.approval.get(j.input.job_id);
 assert.equal(fresh.status,'AWAITING_FINAL_APPROVAL');assert.equal(fresh.revision,2);assert.equal(fresh.approval,null);
 assert.equal(fresh.comments[0].comment,'Bitte meinen mitgeteilten Entstehungsgedanken ergänzen.');
 assert.equal(f.approval.list(owner).length,1);assert.equal(f.approval.claimPublications().length,0);
 assert.throws(()=>f.approval.decide(owner,j.input.job_id,{action:'APPROVE',preview_hash:r.preview_hash}),/PREVIEW_CHANGED/);
});
test('draftless intake rejects missing provenance, other owners, stale comments and missing attachments',async t=>{
 for(const corrupt of ['ordinary','owner','trace','comment','attachment'])await t.test(corrupt,async t=>{
  const f=setup(t),j=await job(f);delete j.intake.draft_id;f.store.put(j);
  const r=f.approval.stage(j,preview());f.approval.decide(owner,j.input.job_id,{action:'REVISE',preview_hash:r.preview_hash,comment:'Synthetischer Änderungswunsch.'});
  prepareEditorialRevisions(f);const child=f.store.all().find(j=>j.intake.review_parent);
  if(corrupt==='ordinary')delete child.intake.review_parent;
  if(corrupt==='owner')child.intake.owner=other;
  if(corrupt==='trace')f.store.observe('editorial-revision:'+child.input.job_id,{parent:'wrong'});
  if(corrupt==='comment')child.input.request.revision.comments[0].comment='Nicht autorisierter Austausch';
  if(corrupt==='attachment')child.input.request.attachments=[{path:'missing.jpg'}];
  f.store.put(child);await f.intake.preparePending();
  const failed=f.store.get(child.input.job_id);assert.equal(failed.last_error.error_code,'INTAKE_REVISION_SOURCE_INVALID');
  assert.equal(f.files.has(bridgePath('00_INBOX',child.input.job_id+'.input.json')),false);
  assert.equal(f.approval.claimPublications().length,0);
 });
});
test('HTTP rejects unauthenticated, wrong-owner and cross-origin decisions',async t=>{
 const f=setup(t),j=await job(f),r=f.approval.stage(j,preview());
 const handler=createEditorialIntakeHandler({...f,authorize:async req=>req.headers.authorization==='Bearer owner'?owner:req.headers.authorization==='Bearer other'?other:null});
 const server=http.createServer(async(req,res)=>{if(!await handler(req,res)){res.writeHead(404);res.end();}});server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>{handler.close();server.close();});
 const url='http://127.0.0.1:'+server.address().port+'/api/admin/news-editorial/reviews/'+j.input.job_id;
 assert.equal((await fetch(url)).status,403);assert.equal((await fetch(url,{headers:{Authorization:'Bearer other'}})).status,404);
 assert.equal((await fetch(url,{headers:{Authorization:'Bearer owner'}})).status,200);
 const headers={Authorization:'Bearer owner','Content-Type':'application/json'},body=JSON.stringify({action:'APPROVE',preview_hash:r.preview_hash});
 assert.equal((await fetch(url+'/decision',{method:'POST',headers,body})).status,403);
 assert.equal((await fetch(url+'/decision',{method:'POST',headers:{...headers,Origin:'https://evil.example'},body})).status,403);
 assert.equal(f.approval.publishable(j.input.job_id),false);
 assert.equal((await fetch(url+'/decision',{method:'POST',headers:{...headers,Origin:'https://wirkungsoekonomie.de'},body})).status,200);
});
test('signature is delegated to existing admin service, never trusted from unsigned identity',async()=>{
 const token=Buffer.from(JSON.stringify({sub:owner,exp:Date.now()+60000})).toString('base64url')+'.signature';
 const denied=existingAdminAuthorizer({fetchImpl:async()=>new Response('{}',{status:403})});assert.equal(await denied({headers:{authorization:'Bearer '+token}}),null);
 const accepted=existingAdminAuthorizer({fetchImpl:async()=>new Response('{}',{status:200})});assert.equal(await accepted({headers:{authorization:'Bearer '+token}}),owner);
});
test('malformed output does not block another preview; absent output never increments retries',async t=>{
 const f=setup(t),j=await job(f);assert.deepEqual(await importEditorialPreviews(f),{staged:0,failed:[]});assert.deepEqual(f.store.get(j.input.job_id).attempts,{});
 f.files.set(bridgePath('20_OUTPUT_READY',j.input.job_id+'.output.json'),'bad');assert.equal((await importEditorialPreviews(f)).failed.length,1);assert.equal(f.approval.list(owner).length,0);
 const repaired=f.store.get(j.input.job_id);assert.equal(repaired.status,'correction_pending');assert.equal(repaired.corrections.length,1);assert.ok(f.files.has(bridgePath('90_ERRORS',j.input.job_id+'.correction-1.output.json')));
 await importEditorialPreviews(f);assert.equal(f.store.get(j.input.job_id).corrections.length,1);
});
test('Discord notice is private and sent once per new preview',async t=>{
 const f=setup(t),j=await job(f);f.approval.stage(j,preview());let sent=0;
 const fetchImpl=async(url,request)=>{if(url.endsWith('/messages')){sent++;assert.deepEqual(JSON.parse(request.body).allowed_mentions,{parse:[]});return new Response('{}');}return new Response(JSON.stringify({id:'222222222222222222'}));};
 await notifyEditorialReviews({...f,config:{token:'synthetic',recipient:owner},fetchImpl});await notifyEditorialReviews({...f,config:{token:'synthetic',recipient:owner},fetchImpl});assert.equal(sent,1);
});

test('manual news research creates a native bridge job and never a personal article',async t=>{
 const f=setup(t),j=await job(f);j.intake.kind='news';j.input.request.kind='news';j.intake.news_research={...preview(),format:'news',title:'Synthetisch: Kommune eröffnet eine Bibliothek'};j.intake.news_research.sources.unshift({url:'https://example.org/unavailable',title:'Nicht erreichbare Zusatzquelle'});f.store.put(j);
 const {prepareIntakeNews}=await import('../../scripts/news/bridge/intake-news.mjs');
 const source={source_id:'test-news',name:'Test',url:'https://example.org',feed_url:'https://example.org/feed',role:'A',publisher_id:'test',source_type:'media_rss',primary_source:false};
 const article={headline:'Synthetisch: Kommune eröffnet eine Bibliothek',description:'Eine neue öffentliche Bibliothek bietet zusätzliche Arbeitsplätze zum Lernen. Der Fall ist vollständig synthetisch und dient ausschließlich der technischen Prüfung.',datePublished:new Date().toISOString(),'@type':'NewsArticle'};
 const fetchArticle=async({url})=>{if(url.endsWith('/unavailable'))throw Error('SOURCE_TIMEOUT');return {final_url:'https://example.org/source',body:'<script type="application/ld+json">'+JSON.stringify(article)+'</script><article><p>'+article.description+'</p></article>'};};
 await prepareIntakeNews({...f,registry:{sources:[source],policy:{}},fetchArticle});
 const parent=f.store.get(j.input.job_id),child=f.store.get(parent.intake.news_job_id);assert.equal(child.input.job_type,'new_story');assert.equal(child.intake_news_parent,j.input.job_id);assert.equal(child.input.test_only,false);
 assert.ok(child.candidate.slug.endsWith('-'+child.candidate.story_id.slice(-6)));assert.equal(child.candidate.published,false);
 assert.equal(parent.intake.source_errors[0].error_code,'SOURCE_TIMEOUT');
 const {assertSchema,inputSchema}=await import('../../scripts/news/bridge/contract.mjs');assertSchema(inputSchema,child.input);
 assert.equal(f.approval.list(owner).length,0);const count=f.store.all().length;
 await prepareIntakeNews({...f,registry:{sources:[source],policy:{}},fetchArticle});assert.equal(f.store.all().length,count);
});

test('private previews waiting for owner approval do not fill the research queue or prevent a new manual request',async t=>{
 const f=setup(t);
 for(let i=0;i<12;i++)f.store.put({input:{job_id:'wt_20260910T000000Z_'+i.toString(16).padStart(24,'0'),job_type:'editorial_request'},status:'accepted',accepted:{staged:true}});
 const created=await job(f);assert.equal(created.input.job_type,'editorial_request');assert.equal(f.approval.claimPublications().length,0);
});

test('a manual lead is provenance, while independent registered articles supply the facts',async t=>{
 const {prepareIntakeNews}=await import('../../scripts/news/bridge/intake-news.mjs');
 for(const scenario of ['social_tip','no_link','unbound_tip','unrelated_article','unavailable_article'])await t.test(scenario,async t=>{
  const f=setup(t),j=await job(f),lead='https://social.example/tip';
  j.intake.kind='news';j.input.request.kind='news';j.input.request.brief='Eine Kommune eröffnet eine Bibliothek.';
  j.input.request.links=scenario==='no_link'?[]:[lead];
  j.intake.news_research={...preview(),format:'news',title:'Eine Kommune eröffnet eine Bibliothek',subtitle:'Zusätzliche öffentliche Räume zum Lernen.',sources:[{url:'https://example.org/source',title:'Eigenständiger Nachrichtenbeleg'}]};
  if(scenario!=='unbound_tip'&&scenario!=='no_link')j.intake.news_research.sources.unshift({url:lead,title:'Nutzerhinweis'});
  f.store.put(j);
  const source={source_id:'test-news',name:'Test',url:'https://example.org',feed_url:'https://example.org/feed',role:'A',publisher_id:'test',source_type:'media_rss',primary_source:false};
  const article={'@type':'NewsArticle',headline:scenario==='unrelated_article'?'Ein Waldbrand zerstört ein Hotel in Kanada':'Eine Kommune eröffnet eine Bibliothek',description:scenario==='unrelated_article'?'Ein kanadisches Hotel wurde vollständig durch einen Waldbrand zerstört. Feuerwehrleute konnten das Feuer unter Kontrolle bringen. Die Ermittlungen zur Ursache laufen.':'Die Kommune eröffnet eine neue öffentliche Bibliothek. Sie bietet zusätzliche Lernräume und Arbeitsplätze für die Bevölkerung. Der gesamte Fall dient ausschließlich einem synthetischen Test.',datePublished:new Date().toISOString()};
  const calls=[];const fetchArticle=async({url})=>{calls.push(url);if(scenario==='unavailable_article')throw Error('SOURCE_TIMEOUT');return {final_url:url,body:'<script type="application/ld+json">'+JSON.stringify(article)+'</script><article><p>'+article.description+'</p></article>'};};
  await prepareIntakeNews({...f,registry:{sources:[source],policy:{}},fetchArticle});
  const parent=f.store.get(j.input.job_id),child=f.store.get(parent.intake.news_job_id||'');
  assert.ok(!calls.includes(lead),'an unregistered social tip must not be fetched as evidence');
  assert.equal(f.approval.list(owner).length,0,'research never skips the regular analysis and approval');
  if(['social_tip','no_link'].includes(scenario)){
   assert.equal(child.input.job_type,'new_story');assert.equal(child.intake_news_parent,j.input.job_id);
   assert.deepEqual(parent.intake.source_provenance.lead_urls,j.input.request.links);
   assert.deepEqual(parent.intake.source_provenance.verified_source_urls,['https://example.org/source']);
   assert.ok(child.input.wirkungsticker.analysis_prompt.includes(j.input.request.brief));
   const count=f.store.all().length;await prepareIntakeNews({...f,registry:{sources:[source],policy:{}},fetchArticle});assert.equal(f.store.all().length,count);
  }else{
   assert.equal(child,null);
   assert.equal(parent.last_error.error_code,{unbound_tip:'INTAKE_NEWS_LEAD_UNBOUND',unrelated_article:'INTAKE_NEWS_SOURCE_MISMATCH',unavailable_article:'INTAKE_NEWS_VERIFIED_SOURCE_REQUIRED'}[scenario]);
  }
 });
});

test('long Unicode feedback survives HTTP, storage, revision handoff and preview without truncation',async t=>{
 const {EDITORIAL_COMMENT_LIMIT}=await import('../../admin/redaktion/feedback-limits.js');
 const f=setup(t),j=await job(f),r=f.approval.stage(j,preview());
 const handler=createEditorialIntakeHandler({...f,authorize:async()=>owner});
 const server=http.createServer((req,res)=>handler(req,res));server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>{handler.close();server.close();});
 const url='http://127.0.0.1:'+server.address().port+'/api/admin/news-editorial/reviews/'+j.input.job_id+'/decision';
 const headers={'Content-Type':'application/json',Origin:'https://wirkungsoekonomie.de'};
 const overlong='ä'.repeat(EDITORIAL_COMMENT_LIMIT+1);
 const denied=await fetch(url,{method:'POST',headers,body:JSON.stringify({action:'REVISE',preview_hash:r.preview_hash,comment:overlong})});
 assert.equal(denied.status,400);assert.match((await denied.json()).error,/50.000/);
 assert.equal(f.approval.get(j.input.job_id).status,'AWAITING_FINAL_APPROVAL');assert.equal(f.approval.get(j.input.job_id).comments.length,0);
 const comment='Ü'+ '\u0001'.repeat(EDITORIAL_COMMENT_LIMIT-2)+'ß';
 const response=await fetch(url,{method:'POST',headers,body:JSON.stringify({action:'REVISE',preview_hash:r.preview_hash,comment})});
 assert.equal(response.status,200);assert.equal((await response.json()).comments.at(-1).comment,comment);
 assert.equal(f.approval.get(j.input.job_id).comments.at(-1).comment,comment);
 assert.equal(prepareEditorialRevisions(f),1);await f.intake.preparePending();
 const revision=f.store.all().find(x=>x.intake?.review_parent===j.input.job_id);
 const packet=JSON.parse(f.files.get(bridgePath('00_INBOX',revision.input.job_id+'.input.json')));
 assert.equal(packet.request.revision.comments.at(-1).comment,comment);
 assert.equal(f.approval.publishable(j.input.job_id),false);
});

test('intake previews return the saved full draft, never a successful placeholder',async t=>{
 const f=setup(t),j=await job(f),p=preview();j.staging={editorial_preview:p};f.store.put(j);
 assert.equal(f.intake.preview(owner,j.input.job_id).text,p.markdown);
 assert.equal(f.intake.list(owner)[0].preview_available,true);
 assert.throws(()=>f.intake.preview(other,j.input.job_id),/NOT_FOUND/);
 j.staging={preview_hash:'diagnostic-only'};f.store.put(j);
 assert.equal(f.intake.list(owner)[0].preview_available,false);
 assert.throws(()=>f.intake.preview(owner,j.input.job_id),/PREVIEW_PENDING/);
});

test('revision preview references are exposed only for the same owner',async t=>{
 const f=setup(t),j=await job(f),r=f.approval.stage(j,preview());
 f.approval.decide(owner,j.input.job_id,{action:'REVISE',preview_hash:r.preview_hash,comment:'Synthetische Rückgabe.'});
 prepareEditorialRevisions(f);const child=f.store.all().find(j=>j.intake.review_parent);
 assert.equal(f.intake.list(owner).find(r=>r.job_id===child.input.job_id).review_job_id,j.input.job_id);
 j.intake.owner=other;f.store.put(j);
 assert.equal(f.intake.list(owner).find(r=>r.job_id===child.input.job_id).review_job_id,child.input.job_id);
});

test('unusable manual news sources create one immutable research revision and preserve the original receipt',async t=>{
 const {prepareIntakeNews}=await import('../../scripts/news/bridge/intake-news.mjs');
 const f=setup(t),j=await job(f);
 j.input.request.kind='news';j.intake.kind='news';j.intake.news_research={...preview(),format:'news'};
 j.status='acknowledged';j.ack={status:'staged',output_hash:'a'.repeat(64)};j.accepted={staged:true,output_hash:'a'.repeat(64)};
 f.store.put(j);const original=structuredClone(j),registry={sources:[{source_id:'permitted',name:'Test',url:'https://permitted.example',feed_url:'https://permitted.example/feed',role:'A',enabled:true},{source_id:'disabled',url:'https://blocked.example',feed_url:'https://blocked.example/rss',enabled:false}],policy:{}};
 let attempts=0;const atomic=f.transport.writeAtomic;
 f.transport.writeAtomic=async(p,v)=>{if(p.endsWith('.input.json')&&++attempts===1)throw Error('BRIDGE_DROPBOX_HTTP_503');return atomic(p,v);};
 const args={...f,registry,fetchArticle:async()=>assert.fail('unregistered sources cannot be fetched')};
 await prepareIntakeNews(args);
 let parent=f.store.get(j.input.job_id),child=f.store.get(parent.intake.news_repair_job_id);
 assert.equal(child.status,'news_research_prepared');assert.notEqual(child.input.job_id,j.input.job_id);
 await prepareIntakeNews(args);await prepareIntakeNews(args);
 parent=f.store.get(j.input.job_id);child=f.store.get(parent.intake.news_repair_job_id);
 assert.equal(child.status,'queued');assert.equal(f.store.all().length,2);assert.equal(attempts,2);
 assert.deepEqual(parent.input,original.input);assert.deepEqual(parent.ack,original.ack);assert.deepEqual(parent.accepted,original.accepted);
 assert.equal(child.intake.review_parent,parent.input.job_id);assert.equal(child.intake.news_research_attempt,1);
 assert.deepEqual(child.input.request.links,original.input.request.links);assert.equal(child.input.manual_only,true);
 assert.deepEqual(child.input.request.research_repair.allowed_discovery_sources.map(s=>s.source_id),['permitted']);
 assert.equal(f.intake.list(owner).length,1);assert.match(f.intake.list(owner)[0].status_note,/nachrecherchiert/);
 assert.equal(f.approval.claimPublications().length,0);
 const output={...preview(),format:'news',sources:[...preview().sources,{url:'https://permitted.example/source',title:'Synthetisch: Kommune eröffnet Bibliothek'}]};
 f.files.set(bridgePath('20_OUTPUT_READY',child.input.job_id+'.output.json'),JSON.stringify({schema_version:'1.0',job_id:child.input.job_id,input_hash:child.input.input_hash,processed_at:now(),preview:output}));
 await importEditorialPreviews(f);
 assert.ok(f.store.get(child.input.job_id).intake.news_research);assert.equal(f.approval.list(owner).length,0);
});

test('manual source repairs have a bounded chain; temporary source failures keep their ordinary retry',async t=>{
 const {prepareIntakeNews}=await import('../../scripts/news/bridge/intake-news.mjs');
 for(const scenario of ['temporary','limit'])await t.test(scenario,async t=>{
  const f=setup(t),j=await job(f);j.input.request.kind='news';j.intake.kind='news';j.intake.news_research={...preview(),format:'news'};
  if(scenario==='limit')j.intake.news_research_attempt=2;
  f.store.put(j);
  const sources=scenario==='temporary'?[{source_id:'test',url:'https://example.org',feed_url:'https://example.org/feed',role:'A'}]:[];
  await prepareIntakeNews({...f,registry:{sources,policy:{}},fetchArticle:async()=>{throw Error('SOURCE_TIMEOUT');}});
  const result=f.store.get(j.input.job_id);assert.equal(f.store.all().length,1);assert.equal(result.intake.news_repair_job_id,undefined);
  assert.equal(Boolean(result.intake.news_research_hold),scenario==='limit');
  assert.equal(f.approval.claimPublications().length,0);
 });
});
