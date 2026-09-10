import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {sourceAccess} from '../../scripts/news/access-policy.mjs';
import { verifyImpactResearch } from '../../scripts/news/bridge/impact-research.mjs';
const now='2026-09-10T14:00:00Z';
const quote='A documented mechanism connects the proposed change to the observed system response.';
const source={source_id:'research-mechanism-test',url:'https://research.example.org/paper',title:'Public mechanism evidence',publisher:'Test publisher',source_function:'mechanism',quote,supports:'This passage supplies the mechanism for the explicitly bounded scenario.'};
function fixture(){const data=new Map();return {store:{observation:async k=>data.get(k),observe:async(k,v)=>data.set(k,v)},data};}
test('context research verifies a bounded source excerpt and reuses its cached proof',async()=>{
  const bridge=fixture();let calls=0;
  const fetchDocument=async(item,registry,policy)=>{calls++;assert.equal(policy.respect_robots,true);assert.equal(policy.allow_public_pdf,true);assert.equal(registry.access.requires_payment,false);return {body:`<article><p>${quote}</p></article>`,final_url:item.url};};
  const first=await verifyImpactResearch(bridge,[source],[],now,{fetchDocument});
  assert.equal(first[0].research_verification.status,'source_text_verified');assert.equal(first[0].source_function,'mechanism');
  assert.ok(first[0].article_excerpt.length<1200);
  await verifyImpactResearch(bridge,[source],[],now,{fetchDocument});assert.equal(calls,1);
  assert.ok([...bridge.data.values()].every(x=>!x.body && !x.full_text));
});
test('unknown excerpts, source ID collisions, unsafe URLs and access failures remain blocked',async()=>{
  const options={fetchDocument:async()=>({body:'<article>Unrelated text.</article>'})};
  await assert.rejects(verifyImpactResearch(fixture(),[source],[],now,options),/QUOTE_NOT_FOUND/);
  await assert.rejects(verifyImpactResearch(fixture(),[source],[{source_id:source.source_id}],now,options),/SOURCE_ID_CONFLICT/);
  await assert.rejects(verifyImpactResearch(fixture(),[{...source,url:'https://127.0.0.1/private'}],[],now,options),/URL/);
  await assert.rejects(verifyImpactResearch(fixture(),[source],[],now,{fetchDocument:async()=>{throw Error('ROBOTS_DISALLOW');}}),/ROBOTS_DISALLOW/);
  await assert.rejects(verifyImpactResearch(fixture(),[{...source,quote:'too short'}],[],now,options),/SCHEMA/);
});
test('research accepts extracted public PDF text without retaining the complete transcript or document',async()=>{
  const f=fixture();const result=await verifyImpactResearch(f,[source],[],now,{fetchDocument:async()=>({extracted_from:'public_pdf',body:'x'.repeat(10000)+quote+'y'.repeat(10000)})});
  assert.ok(result[0].article_excerpt.length<1600);assert.ok([...f.data.values()][0].excerpt.length<1600);
});
test('empty supplementary research requires no registry or network access',async()=>{
  assert.deepEqual(await verifyImpactResearch(fixture(),[],[],now,{root:'/nonexistent',fetchDocument:async()=>{throw Error('unexpected network');}}),[]);
});
test('research uses the same normalized registry and explicit access overrides as discovery',async()=>{
 const fetchDocument=async(item,registry)=>{
  const access=sourceAccess(registry,'article');if(!access.allowed)throw Error(access.reason);
  return {body:`<article>${quote}</article>`,final_url:item.url};
 };
 const official={...source,url:'https://www.ecb.europa.eu/mopo/intro/transmission/html/index.en.html'};
 assert.equal((await verifyImpactResearch(fixture(),[official],[],now,{fetchDocument})).length,1);
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'impact-registry-'));
 try{
  fs.mkdirSync(path.join(root,'content/news'),{recursive:true});
  fs.writeFileSync(path.join(root,'content/news/source-registry.json'),JSON.stringify({policy:{},sources:[{source_id:'research-site',name:'Publisher',url:source.url,feed_url:source.url,source_type:'official_rss',enabled:true}]}));
  fs.writeFileSync(path.join(root,'content/news/media-registry.json'),JSON.stringify({sources:[],source_overrides:{'research-site':{access:{status:'public',article:'disabled'}}}}));
  await assert.rejects(verifyImpactResearch(fixture(),[source],[],now,{root,fetchDocument}),/SOURCE_METADATA_ONLY/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
