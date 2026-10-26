import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {callOpenAiDirect} from '../../scripts/news/openai-transport.mjs';
import {fetchFeed, fetchPublicArticle} from '../../scripts/news/lib.mjs';
import {providerOutcomeUncertain} from '../../scripts/news/provider-outcome.mjs';

const source = {url:'https://example.org/', feed_url:'https://example.org/feed', source_type:'official_rss',
  access:{status:'public', article:'bounded_public_text', cost_usd:0}};
const policy = {resolve_dns:false, respect_robots:false, request_timeout_ms:20};
const never = () => new Promise(() => {});
async function boundedResult(operation) {
  let timer;
  try {
    return await Promise.race([operation.then(()=>'unexpected success', error=>error),
      new Promise(resolve => {timer=setTimeout(()=>resolve('operation remained pending'),250);})]);
  } finally {clearTimeout(timer);}
}

for (const stage of ['headers','body']) test(`a stalled paid ${stage} obeys its existing timeout without a second request`,async()=>{
  let calls=0,signal;
  const result=await boundedResult(callOpenAiDirect([{story_id:'wt-offline-timeout'}],{
    apiKey:'synthetic-key',prompt:'Synthetic offline deadline test',schema:false,attempts:2,timeoutMs:20,
    retryDelayImpl:async()=>assert.fail('an uncertain timeout must not retry'),
    fetchImpl:async(_url,options)=>{calls++;signal=options.signal;
      return stage==='headers'?never():{ok:true,status:200,json:never};},
  }));
  assert.ok(result instanceof Error,String(result));
  assert.equal(result.message,'AI_REQUEST_TIMEOUT');
  assert.equal(result.requestAttempts,1);
  assert.equal(signal.aborted,true);
  assert.equal(calls,1);
  assert.equal(providerOutcomeUncertain(result,{started:true,costRecorded:false}),true);
});

test('a late paid body remains byte-for-byte available for reconciliation after its timeout',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'woek-late-body-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  let deliver,calls=0;
  const answer='Synthetic completed answer, retained without alteration.';
  const pending=callOpenAiDirect([{story_id:'wt-offline-late'}],{apiKey:'synthetic-key',prompt:'Offline',
    schema:false,attempts:1,timeoutMs:20,rawOutputDir:dir,
    fetchImpl:async()=>{calls++;return{ok:true,status:200,json:()=>new Promise(resolve=>{deliver=resolve;})};},
  });
  const result=await boundedResult(pending);
  assert.equal(result.message,'AI_REQUEST_TIMEOUT');
  assert.equal(fs.readdirSync(dir).length,0);
  deliver({model:'synthetic-model',status:'completed',usage:{input_tokens:12,output_tokens:8},
    output:[{type:'message',role:'assistant',content:[{type:'output_text',text:answer}]}]});
  await new Promise(resolve=>setImmediate(resolve));
  const files=fs.readdirSync(dir);assert.equal(files.length,1);assert.equal(calls,1);
  const raw=JSON.parse(fs.readFileSync(path.join(dir,files[0]),'utf8'));
  assert.equal(raw.answer,answer);assert.equal(raw.status,'completed');
  assert.deepEqual(raw.story_ids,['wt-offline-late']);
  assert.equal(providerOutcomeUncertain(result,{started:true,costRecorded:false}),true);
});

for(const kind of ['feed','article']) for(const stage of ['headers','body','cleanup']) test(`a stalled ${kind} ${stage} cannot keep the serial importer pending`,async()=>{
  let calls=0,signal;
  const fetchImpl=async(_url,options)=>{calls++;signal=options.signal;
    if(stage==='headers')return never();
    return {ok:true,status:200,headers:new Headers(stage==='cleanup'?{'content-length':'9999'}:{}),
      ...(stage==='cleanup'?{body:{cancel:never}}:{text:never})};};
  const result=await boundedResult(kind==='feed'
    ?fetchFeed(source,{...policy,max_feed_bytes:100},fetchImpl)
    :fetchPublicArticle({url:'https://example.org/article'},source,{...policy,max_article_bytes:100},fetchImpl));
  assert.ok(result instanceof Error,String(result));
  assert.match(result.message,/^(FEED|ARTICLE)_REQUEST_TIMEOUT$/);
  assert.equal(signal.aborted,true);
  assert.equal(calls,1);
});
