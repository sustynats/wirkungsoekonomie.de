import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {sourceAccess,respectRobots} from '../../scripts/news/access-policy.mjs';
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
test('a disabled supplementary source names the actual research ID and never fetches it', async () => {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'impact-disabled-source-'));
 let fetched=false;
 try {
  fs.mkdirSync(path.join(root,'content/news'),{recursive:true});
  fs.writeFileSync(path.join(root,'content/news/source-registry.json'),JSON.stringify({policy:{},sources:[
   {source_id:'allowed-event',name:'Original news',url:'https://original.example.org/',feed_url:'https://original.example.org/rss',source_type:'official_rss',enabled:true},
   {source_id:'disabled-research',name:'Restricted research',url:source.url,feed_url:source.url,source_type:'official_rss',enabled:false},
  ]}));
  await assert.rejects(verifyImpactResearch(fixture(),[source],[{source_id:'allowed-event'}],now,{root,fetchDocument:async()=>{fetched=true;}}),
   {message:`SOURCE_DISABLED:${source.source_id}`});
  assert.equal(fetched,false);
 } finally { fs.rmSync(root,{recursive:true,force:true}); }
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

test('the news exchange contract exposes the exact research verification schema', async () => {
  const { outputSchema, assertSchema } = await import('../../scripts/news/bridge/contract.mjs');
  const { researchSourceSchema } = await import('../../scripts/news/bridge/impact-research.mjs');
  assert.equal(outputSchema.properties.research_sources, researchSourceSchema);
  assert.doesNotThrow(() => assertSchema(outputSchema.properties.research_sources, [source], '$.research_sources'));
  const paraphraseOnly = { source_id: source.source_id, url: source.url, function: 'mechanism', excerpt: 'A summary, not a verified original quote.' };
  assert.throws(() => assertSchema(outputSchema.properties.research_sources, [paraphraseOnly], '$.research_sources'),
    { message: 'BRIDGE_SCHEMA_INVALID:$.research_sources[0].title' });
});

test('missing or unsupported research fields point to the exact correction without a fetch', async () => {
  let fetched = false;
  const fetchDocument = async () => { fetched = true; throw Error('unexpected fetch'); };
  const noQuote = { ...source }; delete noQuote.quote;
  await assert.rejects(verifyImpactResearch(fixture(), [noQuote], [], now, { fetchDocument }),
    { message: 'BRIDGE_SCHEMA_INVALID:$.research_sources[0].quote' });
  await assert.rejects(verifyImpactResearch(fixture(), [{ ...source, excerpt: 'unsupported alias' }], [], now, { fetchDocument }),
    { message: 'BRIDGE_SCHEMA_INVALID:$.research_sources[0].excerpt' });
  assert.equal(fetched, false);
});

test('RSL, robots and HTTP refusals name the research source without retry or cached proof', async () => {
  for (const code of ['RSL_STATUS_OPEN','RSL_AI_INPUT_DISALLOWED','ROBOTS_DISALLOWED','ARTICLE_HTTP_403']) {
    const bridge=fixture(); let calls=0;
    const original=Object.assign(new Error(code),{retryable:false,http_status:403});
    await assert.rejects(verifyImpactResearch(bridge,[source],[],now,{fetchDocument:async()=>{calls++;throw original;}}), error=>{
      assert.equal(error.message,`${code}:${source.source_id}`);
      assert.equal(error.cause,original); assert.equal(error.retryable,false); assert.equal(error.http_status,403);
      return true;
    });
    assert.equal(calls,1); assert.equal(bridge.data.size,0);
  }
});

test('missing original quotes name the failed source on initial and cached-document verification', async () => {
  const bridge=fixture(), fetchDocument=async()=>({body:`<article>${quote}</article>`});
  const other={...source,quote:'This second claim is not present in the actual source document that was retrieved.'};
  await assert.rejects(verifyImpactResearch(bridge,[other],[],now,{fetchDocument}),
    {message:`IMPACT_RESEARCH_QUOTE_NOT_FOUND:${source.source_id}`});
  assert.equal(bridge.data.size,0);
  await verifyImpactResearch(bridge,[source],[],now,{fetchDocument});
  const proof=[...bridge.data.values()][0];
  await assert.rejects(verifyImpactResearch(bridge,[other],[],now,{fetchDocument}),
    {message:`IMPACT_RESEARCH_QUOTE_NOT_FOUND:${source.source_id}`});
  assert.deepEqual([...bridge.data.values()],[proof]);
});

test('publisher crawl delay preserves verified source progress and supplies a retry deadline', async () => {
  const bridge=fixture(); let fetched=0,robotsRequests=0;
  const fetchDocument=async item=>{
    await respectRobots(item.url,{},async()=>{robotsRequests++;return new Response('User-agent: *\nCrawl-delay: 120\n');},async()=>{},[]);
    fetched++; return {body:`<article>${quote}</article>`,final_url:item.url};
  };
  const first={...source,url:'https://delayed-research.example/first'};
  const second={...source,source_id:'research-second-source',url:'https://delayed-research.example/second'};
  await assert.rejects(verifyImpactResearch(bridge,[first,second],[],now,{fetchDocument}),error=>{
    assert.equal(error.message,'ROBOTS_CRAWL_DELAY_DEFERRED:research-second-source');
    assert.equal(error.retryable,true);
    assert.ok(error.retry_after_seconds>110 && error.retry_after_seconds<=120);
    return true;
  });
  assert.equal(fetched,1); assert.equal(robotsRequests,1);
  assert.equal(bridge.data.size,1); // the first verified excerpt survives
});

test('inline HTML punctuation spacing does not reject a verbatim research quote', async () => {
  const bridge=fixture(); let calls=0;
  const original='2027 wird das dritte Jahr in Folge mit Investitionen auf Rekordniveau.';
  const candidate={...source,quote:original};
  const fetchDocument=async()=>{calls++;return {body:'<article><p>2027 wird das dritte Jahr in Folge mit Investitionen auf <strong>Rekordniveau</strong>.</p></article>'};};
  const result=await verifyImpactResearch(bridge,[candidate],[],now,{fetchDocument});
  assert.equal(result[0].research_verification.status,'source_text_verified');
  assert.ok(result[0].article_excerpt.includes(original.toLowerCase()));
  await verifyImpactResearch(bridge,[candidate],[],now,{fetchDocument});
  assert.equal(calls,1);
});

test('punctuation normalization preserves words, negation and numerical claims', async () => {
  for(const [actual,claimed] of [
    ['Die Kosten betragen nach dem veröffentlichten Bericht 1 .5 Milliarden Euro.','Die Kosten betragen nach dem veröffentlichten Bericht 1.5 Milliarden Euro.'],
    ['Die Investitionen wachsen laut dem veröffentlichten Bericht nicht weiter.','Die Investitionen wachsen laut dem veröffentlichten Bericht weiter.'],
    ['Die Investitionen wachsen laut dem veröffentlichten Bericht langsamer.','Die Investitionen wachsen laut dem veröffentlichten Bericht schneller.'],
    ['Die Kosten betragen nach dem veröffentlichten Bericht 1,5 Milliarden Euro.','Die Kosten betragen nach dem veröffentlichten Bericht 15 Milliarden Euro.'],
  ]) {
    const bridge=fixture();
    await assert.rejects(verifyImpactResearch(bridge,[{...source,quote:claimed}],[],now,{fetchDocument:async()=>({body:`<article>${actual}</article>`})}),
      {message:`IMPACT_RESEARCH_QUOTE_NOT_FOUND:${source.source_id}`});
    assert.equal(bridge.data.size,0);
  }
});
