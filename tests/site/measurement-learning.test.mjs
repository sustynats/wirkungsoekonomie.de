import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {calculateDifference,parseShare,formatLearningNumber} from '../../assets/js/measurement-learning.js';
import {worksheet,worksheetMarkdown} from '../../scripts/site/build-measurement-explainer.mjs';
import {isPublicLearningDownload,protectPublicLearningDownloadLinks} from '../../scripts/lib/public-learning-downloads.mjs';
import {PAGE_QUESTIONS,selectContextualQuestions} from '../../assets/js/contextual-questions.js';
import {applyReferenceLinks} from '../../scripts/wirkungslexikon/reference-links.mjs';
import {createSearchClient} from '../../assets/js/search-api.js';
const read=file=>fs.readFileSync(file,'utf8');
const data=JSON.parse(read('content/site/wirkung-messen.json'));
const page='verstehen/wirkung-messen/index.html';
test('the delivered P1.3 search finds the explanation on its first result page for all five requested questions',async()=>{
 const originalFetch=globalThis.fetch;
 try {
  globalThis.fetch=async input=>{
   const url=new URL(input);assert.equal(url.origin,'https://measurement-search.example');
   const name=url.pathname.split('/').at(-1);assert.match(name,/^[a-z0-9.-]+$/i);
   return new Response(fs.readFileSync(path.join('_site/assets/search',name)));
  };
  const client=createSearchClient({baseUrl:'https://measurement-search.example/'});
  for(const query of data.searchAliases){const response=await client.search(query,{page:1});assert.ok(response.results.some(entry=>entry.url===data.route),query);}
 } finally {globalThis.fetch=originalFetch;}
});
for (const [label,input,expected] of [
 ['additional reduction',[14,10,14,13],{observed:4,comparison:1,additional:3}],
 ['same development',[14,10,14,10],{observed:4,comparison:4,additional:0}],
 ['adverse development',[14,16,14,13],{observed:-2,comparison:1,additional:-3}],
 ['shares above 100',[140,100,140,130],{observed:40,comparison:10,additional:30}],
]) test(label,()=>assert.deepEqual(calculateDifference(input),{valid:true,...expected}));
test('missing, nonnumeric, negative, nonfinite and overflowing values have no result',()=>{
 for (const value of ['', ' ', 'no', '-1', '-0.1', null, undefined, NaN, Infinity, {}, '-1e-999', '1e-999', '14abc', '1,2,3']) {
  const result=calculateDifference([14,value,14,13]);assert.equal(result.valid,false,String(value));assert.ok(result.error);assert.equal(result.additional,undefined);
 }
 assert.equal(calculateDifference([1e308,0,0,1e308]).valid,false);
 assert.equal(calculateDifference([14,10]).valid,false);
 assert.equal(parseShare('10,5'),10.5);assert.equal(parseShare('0'),0);
 assert.notEqual(formatLearningNumber(1e-8),'0');assert.notEqual(formatLearningNumber(-1e-8),'-0');
});
test('no calculation produces proof, approval or a tariff',()=>{
 for (const input of [[14,10,14,13],[14,10,14,10],[14,16,14,13]]) assert.deepEqual(Object.keys(calculateDifference(input)).sort(),['additional','comparison','observed','valid']);
 const js=read('assets/js/measurement-learning.js');assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|WebSocket/);
 assert.match(js,/Schutzbedingungen sind weiterhin gesondert/);
});
test('filled and blank downloads exactly match the source and preserve null',()=>{
 for (const [name,blank] of [['kii-mobilitaetskosten-lernbeispiel',false],['kii-arbeitsvorlage',true]]) {
  const sheet=worksheet(data,blank),base='assets/downloads/wirkung-messen/'+name;
  assert.deepEqual(JSON.parse(read(base+'.json')),sheet);assert.equal(read(base+'.md'),worksheetMarkdown(sheet));
  assert.equal(sheet.registerEntry,false);assert.equal(sheet.fields.length,19);
  if(blank) assert.ok(sheet.fields.every(f=>f.value===null));
  else {assert.equal(sheet.fields.find(f=>f.key==='target').value.value,null);assert.equal(sheet.fields.find(f=>f.key==='baseline').value.value,14);assert.equal(sheet.fields.find(f=>f.key==='counterfactual').value.value,13);assert.equal(sheet.fields.find(f=>f.key==='masterItem').value.id,null);}
 }
});
test('page remains a complete worked example without JavaScript, with one TOC and unique IDs',()=>{
 const html=read(page);assert.equal([...html.matchAll(/class="toc-card"/g)].length,1);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 assert.match(html,/14 - 10 = 4 Prozentpunkte/);assert.match(html,/4 - 1 = 3 Prozentpunkte/);
 assert.match(html,/Lernrechnung\. Kein Kausalnachweis und kein Gesamturteil\./);
 assert.match(html,/data-measurement-calculator hidden/);assert.match(html,/role="alert"/);assert.match(html,/aria-live="polite"/);
 assert.equal([...html.matchAll(/data-learning-input /g)].length,4);
 assert.match(html,/rel="canonical" href="https:\/\/wirkungsoekonomie.de\/verstehen\/wirkung-messen\/"/);
 assert.match(html,/property="og:url" content="https:\/\/wirkungsoekonomie.de\/verstehen\/wirkung-messen\/"/);
 assert.doesNotMatch(html,/\{\{|hreflang=/);
});
test('all new-page internal routes, downloads and fragment targets exist',()=>{
 const html=read(page),urls=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).filter(u=>u.startsWith('/')||u.startsWith('#'));
 for(const href of urls) {
  const url=new URL(href,'https://wirkungsoekonomie.de/verstehen/wirkung-messen/');
  if(url.pathname.startsWith('//')) continue;
  let target=decodeURIComponent(url.pathname).slice(1)+(url.pathname.endsWith('/')?'index.html':'');
  if(!fs.existsSync(target) && target.startsWith('wirkungslexikon/')) target='_site/'+target;
  assert.ok(fs.existsSync(target),'missing '+href);
  if(url.hash && target.endsWith('.html')) assert.ok(new RegExp('\\bid=["\']'+decodeURIComponent(url.hash.slice(1))+'["\']').test(read(target)),'missing fragment '+href);
 }
});
test('seven cards each specify method, unit, data, timing, comparison, uncertainty and limit',()=>{
 assert.equal(data.indicators.length,7);
 for(const item of data.indicators) for(const key of ['question','method','unit','dataNeed','observationTime','comparison','uncertainty','limit']) assert.ok(item[key]?.length,item.id+':'+key);
 assert.ok(data.indicators.some(i=>i.dimension==='Demokratie'&&i.limit.includes('Zustimmung')));
});
test('related reading is reversible and idempotent without changing historical text',()=>{
 const blocks=JSON.parse(read('content/site/related-reading.json')).blocks;
 for(const rel of new Set(blocks.flatMap(b=>b.paths))) {
  if(!fs.existsSync(rel)) continue;
  const html=read(rel),result=applyReferenceLinks(html,rel,blocks);assert.equal(applyReferenceLinks(result.html,rel,blocks).html,result.html);
  let restored=result.html;for(const edit of [...result.edits].reverse()) restored=restored.replace(edit.after,edit.before);assert.equal(restored,html);
 }
});
test('repeated generation preserves page and all four downloads byte for byte',()=>{
 const paths=[page,...fs.readdirSync('assets/downloads/wirkung-messen').map(f=>'assets/downloads/wirkung-messen/'+f)];
 const original=paths.map(read);
 try {execFileSync(process.execPath,['scripts/site/build-measurement-explainer.mjs']);const once=paths.map(read);execFileSync(process.execPath,['scripts/site/build-measurement-explainer.mjs']);assert.deepEqual(paths.map(read),once);} finally {paths.forEach((file,i)=>fs.writeFileSync(file,original[i]));}
});
test('authored content uses ASCII hyphens and the professional FAQ source',()=>{
 for(const file of ['content/site/wirkung-messen.inc','content/site/wirkung-messen.json']) assert.doesNotMatch(read(file),/[\u2010-\u2015\u2212]|\bKPII\b/);
 const faq=JSON.parse(read('content/site/core-questions.json'));for(const id of data.faqIds) assert.equal(faq.filter(f=>f.id===id).length,1);
});

test('authored FAQ disables the additional automatic jump list through existing configuration',()=>{assert.deepEqual(PAGE_QUESTIONS['/verstehen/wirkung-messen/'],[]);assert.deepEqual(selectContextualQuestions({path:'/verstehen/wirkung-messen/',override:[]}),[]);});

test('download permission is confined to four generated worksheets',()=>{for(const name of ['kii-arbeitsvorlage','kii-mobilitaetskosten-lernbeispiel'])for(const ext of ['json','md'])assert.equal(isPublicLearningDownload('/assets/downloads/wirkung-messen/'+name+'.'+ext),true);for(const file of ['/assets/downloads/wirkung-messen/private.json','/assets/downloads/wirkung-messen/../private.json','https://evil.example/assets/downloads/wirkung-messen/kii-arbeitsvorlage.json','/assets/downloads/wirkung-messen/kii-arbeitsvorlage.json.bak','/private/assets/downloads/wirkung-messen/kii-arbeitsvorlage.json'])assert.equal(isPublicLearningDownload(file),false);});

test('all eight existing glossary terms retain the measurement-method link after deduplication',()=>{const terms=JSON.parse(read('public/data/glossary.terms.json')).terms;for(const item of JSON.parse(read('content/glossary/imports/wirkung-messen-links.json')).terms){const term=terms.find(t=>t.termId===item.termId);assert.ok(term.relatedMethods.some(link=>link?.href==='/verstehen/wirkung-messen/'),item.termId);for(const prefix of ['', '_site/']){const methods=read(prefix+'begriffe/'+term.slug+'/index.html').match(/<h3>Methoden &amp; Werkzeuge<\/h3>[\s\S]*?<\/section>/)?.[0];assert.match(methods || '',/href="\/verstehen\/wirkung-messen\/"/,prefix+item.termId);}}});

test('public format normalization preserves approved worksheets and still rejects unknown source files',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'woek-worksheet-policy-'));
 const normalizer=path.resolve('scripts/quality/sanitize-public-library-formats.mjs'),gate=path.resolve('scripts/quality/check-public-library-formats.mjs');
 const html='<html><main>'+['kii-arbeitsvorlage','kii-mobilitaetskosten-lernbeispiel'].flatMap(name=>['json','md'].map(ext=>`<a href="/assets/downloads/wirkung-messen/${name}.${ext}" download>${ext==='md'?'Markdown':'JSON'}</a>`)).join('')+'</main></html>';
 try {
  fs.writeFileSync(path.join(temp,'index.html'),html);
  assert.equal(spawnSync(process.execPath,[normalizer],{cwd:temp}).status,0);
  assert.equal(fs.readFileSync(path.join(temp,'index.html'),'utf8'),html);
  assert.equal(spawnSync(process.execPath,[gate],{cwd:temp}).status,0);
  fs.appendFileSync(path.join(temp,'index.html'),'<a href="/assets/downloads/private.md">Arbeitsdatei</a>');
  assert.equal(spawnSync(process.execPath,[normalizer],{cwd:temp}).status,1);
  assert.equal(spawnSync(process.execPath,[gate],{cwd:temp}).status,1);
 } finally {fs.rmSync(temp,{recursive:true,force:true});}
});

test('final public artifact retains the page, four exact worksheets and each contextual reference once',()=>{
 const html=read('_site/'+page);
 for(const rel of ['assets/js/measurement-learning.js','assets/css/measurement-learning.css']) assert.equal(read('_site/'+rel),read(rel),rel+' differs from the tested source');
 for(const name of fs.readdirSync('assets/downloads/wirkung-messen')) {
  const rel='assets/downloads/wirkung-messen/'+name;
  assert.ok(html.includes('href="/'+rel+'"'),rel+' link removed');
  assert.equal(read('_site/'+rel),read(rel),rel+' changed during publication');
 }
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 assert.equal([...html.matchAll(/class="toc-card"/g)].length,1);
 const blocks=JSON.parse(read('content/site/related-reading.json')).blocks;
 for(const block of blocks)for(const rel of block.paths){const host=read('_site/'+rel);assert.equal([...host.matchAll(new RegExp('\\bid="'+block.id+'"','g'))].length,1,rel+': '+block.id);assert.equal(applyReferenceLinks(host,rel,blocks).html,host,rel+' final reference projection');}
});

test('artifact link protection preserves exactly public worksheets, not private or misleading attributes',()=>{
 const allowed='<a href="/assets/downloads/wirkung-messen/kii-arbeitsvorlage.md" download>Markdown</a>';
 const privateLink='<a href="/assets/downloads/private.md">Intern</a>';
 const misleading='<a href="/assets/downloads/private.md" data-href="/assets/downloads/wirkung-messen/kii-arbeitsvorlage.md">Intern</a>';
 const duplicate='<a href="/assets/downloads/wirkung-messen/kii-arbeitsvorlage.md" href="/assets/downloads/private.md">Intern</a>';
 const input=allowed+privateLink+misleading+duplicate,p=protectPublicLearningDownloadLinks(input);
 assert.ok(!p.content.includes(allowed));assert.ok(p.content.includes(privateLink));assert.ok(p.content.includes(misleading));assert.ok(p.content.includes(duplicate));assert.equal(p.restore(p.content),input);
});
