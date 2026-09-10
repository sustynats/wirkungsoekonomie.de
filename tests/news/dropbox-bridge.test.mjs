import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { BridgeStore } from '../../scripts/news/bridge/store.mjs';
import { bridgeInput, adaptOutput } from '../../scripts/news/bridge/adapter.mjs';
import { DropboxChatGPTBridgeProvider } from '../../scripts/news/bridge/provider.mjs';
import { ChatGPTBridgeVisualProvider, visualContext } from '../../scripts/news/bridge/visual.mjs';
import { inputSchema, outputSchema, visualSchema, assertSchema, parsePacket, safeUrl, bridgePath, hash } from '../../scripts/news/bridge/contract.mjs';
import { allowedPath, DropboxTransport } from '../../scripts/news/bridge/dropbox.mjs';
import { processingMode, visualGenerationProvider } from '../../scripts/news/processing-mode.mjs';
import { callWoekAi, sha256 } from '../../scripts/news/lib.mjs';
import { createNewsBatchClient } from '../../scripts/news/batch.mjs';
import { generateEditorialVisual } from '../../scripts/news/title-image/pipeline.mjs';
import { createHiggsfieldAdapter } from '../../scripts/news/title-image/higgsfield.mjs';
import { loadNewsRegistry } from '../../scripts/news/registry.mjs';
import { digest } from '../../scripts/news/title-image/policy.mjs';
import { outputStatus } from '../../scripts/news/bridge/status.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';

const now = '2026-09-10T06:45:00.000Z';
const later = '2026-09-10T07:30:00.000Z';
function candidate(n = 1) {
  const title=['Synthetischer Test: Wasserversorgung in Bremen', 'Synthetischer Test: Sonnensonde untersucht Magnetfelder', 'Synthetischer Test: Bibliothek eröffnet Lesesaal'][n-1];
  return { story_id: `wt-${String(n).padStart(16,'0')}`, slug: `synthetischer-test-${n}`, title,
    first_seen: now, event_id: `synthetic-event-${n}`, content_hash: hash(n), published: false, claims: [],
    preanalysis: { internal_relevance_score: 50, topics: ['Technologie'] }, topic: ['Technologie'],
    sources: [{ source_id: 'test-source', publisher: 'Test', title, url: `https://example.org/test-${n}`, summary: `${title}.`, content_hash: hash(n), published_at: now }] };
}
function output(input, status = 'hold') {
  return { schema_version: '1.0', job_id: input.job_id, input_hash: input.input_hash, processed_at: later,
    decision: { status, reason: 'Synthetic test only', merge_into: null, priority: 50 },
    story: { headline: 'Test', subheadline: '', short_summary: '', detailed_summary: '', what_happened: '', why_it_matters: '' },
    facts: { confirmed: [], uncertain: [], contradictions: [], missing_information: [] },
    fact_check: { status: 'open', summary: '', claims: [] }, consequence_check: { direct: [], second_order: [], third_order: [], time_horizon: [] },
    impact: Object.fromEntries([...['human','planet','democracy'].map(k => [k,{ direction: 'open', analysis: 'Test', evidence: 'Test' }]),['net_assessment',''],['uncertainty','Test']]),
    frame_check: { relevant: false, frames: [], resonance_risks: [], notes: '' }, sources: input.sources,
    editorial: { category: 'Technologie', tags: [], location: null, people: [], organisations: [], publishable: status === 'publish' },
    quality: { source_quality: 'Test', evidence_strength: 'Test', needs_human_review: false, warnings: [] } };
}
class MemoryDropbox {
  files = new Map(); writes = 0; outage = false;
  check() { if (this.outage) throw Object.assign(new Error('BRIDGE_DROPBOX_HTTP_503'), { retryable: true }); }
  async metadata(p) { this.check(); return this.files.has(p) ? { name: p.split('/').at(-1) } : null; }
  async read(p) { this.check(); if (!this.files.has(p)) throw new Error('BRIDGE_DROPBOX_NOT_FOUND'); return this.files.get(p); }
  async readBinary(p) { return Buffer.from(await this.read(p)); }
  async list(folder) { this.check(); return [...this.files.keys()].filter(p => p.includes(`/${folder}/`)).map(p=>({name:p.split('/').at(-1)})); }
  async writeAtomic(p,v) { this.check(); const data=JSON.stringify(v); if(this.files.has(p)){assert.equal(this.files.get(p),data);return;} this.files.set(p,data);this.writes++; }
  async move(from,to) { this.check(); assert.ok(this.files.has(from));assert.ok(!this.files.has(to));this.files.set(to,this.files.get(from));this.files.delete(from); }
  async archive(p,id,date) { this.check(); if(this.files.has(p)){this.files.set(`/archive/${date}/${id}/${p.split('/').at(-1)}`,this.files.get(p));this.files.delete(p);} }
}
function setup(t, options = {}) {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'woek-bridge-test-'));
  const store=new BridgeStore(path.join(directory,'queue.sqlite')), transport=new MemoryDropbox();
  t.after(()=>{store.close();fs.rmSync(directory,{recursive:true,force:true});});
  return {directory,store,transport,provider:new DropboxChatGPTBridgeProvider({store,transport,...options})};
}

test('three synthetic events: stable retries, multiple sources in one job, no duplicate enqueue',async t=>{
  const {store,transport,provider}=setup(t);const candidates=[1,2,3].map(candidate);
  candidates[0].sources.push({...candidates[0].sources[0],source_id:'other',url:'https://example.net/second'});
  await provider.enqueue(candidates,[],now,{testOnly:true});assert.equal(store.all().length,3);
  const first=store.all().find(j=>j.candidate.story_id===candidates[0].story_id);assert.equal(first.input.sources.length,2);assertSchema(inputSchema,first.input);
  await provider.enqueue(candidates,[],later,{testOnly:true});assert.equal(transport.writes,3);
  const changed=structuredClone(candidates[0]);changed.content_hash=hash('update');assert.notEqual(bridgeInput(changed,later).job_id,bridgeInput(candidates[0],now).job_id);
});
test('SQLite denies overlap and completed slot remains completed on repeated attempts',t=>{
  const {store,directory}=setup(t);store.acquire(now,'discovery');
  const second=new BridgeStore(path.join(directory,'queue.sqlite'));t.after(()=>second.close());
  assert.throws(()=>second.acquire(now,'discovery'),/LOCKED/);store.release(true);
  assert.throws(()=>store.acquire(now,'discovery'),/ALREADY_COMPLETED/);
  assert.throws(()=>store.acquire(now,'discovery'),/ALREADY_COMPLETED/);
  second.acquire(now,'import');second.release(true);
});
test('discovery and import run concurrently; manual work shares each lane lock and can follow a completed slot',t=>{
  const {directory}=setup(t),file=path.join(directory,'lanes.sqlite');
  const discovery=new BridgeStore(file,{lane:'discovery'}), importer=new BridgeStore(file,{lane:'import'}), other=new BridgeStore(file,{lane:'discovery'});
  t.after(()=>[discovery,importer,other].forEach(s=>s.close()));
  discovery.acquire(now,'discovery');importer.acquire(now,'import');
  assert.throws(()=>other.acquire(now,'discovery',{manualRunId:'123:1'}),/LOCKED/);
  discovery.release(true);other.acquire(now,'discovery',{manualRunId:'123:1'});other.release(true);
  assert.throws(()=>other.acquire(now,'discovery',{manualRunId:'123:1'}),/ALREADY_COMPLETED/);
  importer.release(true);importer.acquire('2026-09-10T06:50:00.000Z','import');
});
test('five-minute polling records first detection and pending never consumes retries',async t=>{
  const {provider,store,transport}=setup(t);await provider.enqueue([candidate()],[],now);const job=store.all()[0];
  for(const minute of ['07:00','07:10','07:20'])assert.equal((await outputStatus(store,transport,`2026-09-10T${minute}:00.000Z`)).status,'PROCESSING_PENDING');
  assert.deepEqual(store.get(job.input.job_id).attempts,{});
  transport.files.set(bridgePath('20_OUTPUT_READY',`${job.input.job_id}.output.json`),JSON.stringify(output(job.input)));
  assert.equal((await outputStatus(store,transport,later)).ready[0],job.input.job_id);
  await outputStatus(store,transport,'2026-09-10T07:35:00.000Z');assert.equal(store.observation(`output:${job.input.job_id}`).at,later);
  await provider.reconcile({},[candidate()],later);await provider.finalize([],'2026-09-10T07:32:00.000Z');
  assert.equal(store.get(job.input.job_id).import_pickup_latency,120);
});
test('real discovery runner queues new events without canonical writes, image work or AI',async t=>{
  const {provider}=setup(t), keys=['WIRKUNGSTICKER_PROCESSING_MODE','VISUAL_GENERATION_PROVIDER','WOEK_NEWS_BRIDGE_PHASE'];
  const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
  Object.assign(process.env,{WIRKUNGSTICKER_PROCESSING_MODE:'dropbox_chatgpt_bridge',VISUAL_GENERATION_PROVIDER:'chatgpt_bridge',WOEK_NEWS_BRIDGE_PHASE:'discovery'});
  const files=['stories','state','newsroom','usage'].map(f=>`data/news/${f}.json`), before=files.map(f=>digest(fs.readFileSync(f)));
  const source={source_id:'test',publisher_id:'publisher',name:'Test',url:'https://example.org/',feed_url:'https://example.org/rss',enabled:true,source_type:'official_rss',primary_source:true,access:{status:'public',article:'metadata_only',cost_usd:0},frequency_class:'high_frequency'};
  const rss='<rss><channel><item><title>Bund beschließt Klimagesetz zur Energieversorgung</title><link>https://example.org/a</link><description>Neue Regeln verändern Investitionen in Energie und Infrastruktur.</description><pubDate>Thu, 10 Sep 2026 06:40:00 GMT</pubDate></item></channel></rss>';
  let calls=0;
  try {
    const report=await runWirkungsticker({now,dryRun:false,bridgeProvider:provider,registry:{sources:[source],policy:{}},
      state:{source_status:{},seen_items:{},pending_story_ids:[],relevance_filter_version:'4.0'},storyStore:{stories:[]},usage:{runs:[]},
      newsroom:{source_items:{},events:{},event_sources:[],discovery_candidates:[]},budgetFx:{rate_date:'2026-09-10',rate_usd_per_eur:1.16},
      fetchFeedImpl:async()=>({body:rss,final_url:source.feed_url}),callAiImpl:async()=>{calls++;throw Error('NO_AI');},prepareTitleImage:async()=>{calls++;throw Error('NO_IMAGES');}});
    assert.equal(calls,0);assert.equal(report.ai_calls,0);assert.equal(report.source_successes,1);assert.ok(report.bridge_enqueued.length);
    assert.deepEqual(files.map(f=>digest(fs.readFileSync(f))),before);
  } finally {for(const k of keys)if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}
});
for(const decision of ['hold','reject'])test(`${decision}: durable decision and ACK without publication`,async t=>{
  const {provider,store,transport}=setup(t);await provider.enqueue([candidate()],[],now);
  const job=store.all()[0];transport.files.set(bridgePath('20_OUTPUT_READY',`${job.input.job_id}.output.json`),JSON.stringify(output(job.input,decision)));
  const results=await provider.reconcile({},[candidate()],later);assert.equal(results[0].record,null);
  await provider.finalize([],later);assert.equal(store.get(job.input.job_id).status,'acknowledged');
  const count=transport.writes;await provider.finalize([],later);assert.equal(transport.writes,count);
});
test('missing output stays queued; malformed output quarantines with no ACK',async t=>{
  const {provider,store,transport}=setup(t);await provider.enqueue([candidate()],[],now);
  assert.deepEqual(await provider.reconcile({},[],later),[]);let job=store.all()[0];assert.equal(job.status,'queued');
  transport.files.set(bridgePath('20_OUTPUT_READY',`${job.input.job_id}.output.json`),'{broken');
  assert.deepEqual(await provider.reconcile({},[],later),[]);job=store.get(job.input.job_id);assert.equal(job.status,'quarantined');assert.equal(job.last_error.error_code,'BRIDGE_JSON_INVALID');
  assert.equal((await transport.list('30_ACK')).length,0);
});
test('Dropbox outage is bounded to three attempts, preserves job ID, never falls back',async t=>{
  const {provider,store,transport}=setup(t);transport.outage=true;
  for(let i=0;i<5;i++)await provider.enqueue([candidate()],[],now);
  const job=store.all()[0];assert.equal(job.attempts.enqueue,3);assert.equal(job.status,'quarantined');assert.equal(transport.files.size,0);
});
test('stale claim is reported without moving it back or ignoring output/ACK',async t=>{
  const {provider,store,transport}=setup(t);await provider.enqueue([candidate()],[],now);const job=store.all()[0];
  const p=bridgePath('10_CLAIMED',`${job.input.job_id}.input.json`);transport.files.set(p,JSON.stringify(job.input));
  await provider.monitor(now);const report=await provider.monitor('2026-09-10T10:00:00.000Z');
  assert.ok(report.alerts.some(x=>x.startsWith('STALE_CLAIM')));assert.ok(transport.files.has(p));
});
test('binding, unsafe URLs, oversized packets and prototype keys fail closed',()=>{
  const c=candidate(),input=bridgeInput(c,now),value=output(input);
  assertSchema(outputSchema,value);assert.throws(()=>adaptOutput({...value,input_hash:hash('wrong')},{input,candidate:c},{},[c],later),/BINDING/);
  assertSchema(outputSchema,{...value,processed_at:'2026-09-10T07:30:00.123456Z'});
  assertSchema(outputSchema,{...value,processed_at:'2026-09-10T09:30:00+02:00'});
  for(const url of ['http://example.org','https://127.0.0.1/a','https://[::1]/','https://name:pass@example.org','https://example.org/?token=secret'])assert.throws(()=>safeUrl(url));
  assert.throws(()=>allowedPath('/WOEK/WIRKUNGSTICKER-CHATGPT-BRIDGE/00_INBOX/../x'));
  assert.throws(()=>parsePacket(' '.repeat(2097153),outputSchema),/TOO_LARGE/);
  assert.throws(()=>assertSchema({},JSON.parse('{"__proto__":{}}')),/UNSAFE_KEY/);
});
test('API, batch, remote visual transport and local Higgsfield all reject before network or CLI',async()=>{
  const previous={mode:process.env.WIRKUNGSTICKER_PROCESSING_MODE,visual:process.env.VISUAL_GENERATION_PROVIDER};
  process.env.WIRKUNGSTICKER_PROCESSING_MODE='dropbox_chatgpt_bridge';process.env.VISUAL_GENERATION_PROVIDER='chatgpt_bridge';
  let calls=0;const blocked=async()=>{calls++;throw Error('SHOULD_NOT_RUN');};
  try{
    await assert.rejects(callWoekAi([candidate()],{fetchImpl:blocked}),/API_PROCESSING_DISABLED/);
    await assert.rejects(generateEditorialVisual(candidate(),{fetchImpl:blocked}),/HIGGSFIELD_DISABLED/);
    await assert.rejects(createHiggsfieldAdapter({directory:'/never-created',enabled:true,run:blocked}).generate(candidate()),/HIGGSFIELD_DISABLED/);
    const client=createNewsBatchClient({state:{},usage:{runs:[]},save:blocked,fetchImpl:blocked});
    await assert.rejects(client.call(candidate(),{kind:'news',methodVersion:'test',prompt:'test'}),/API_PROCESSING_DISABLED/);
    assert.equal(calls,0);
  }finally{for(const [k,v]of [['WIRKUNGSTICKER_PROCESSING_MODE',previous.mode],['VISUAL_GENERATION_PROVIDER',previous.visual]])if(v===undefined)delete process.env[k];else process.env[k]=v;}
  assert.throws(()=>processingMode({WIRKUNGSTICKER_PROCESSING_MODE:'typo'}));
  assert.equal(visualGenerationProvider({WIRKUNGSTICKER_PROCESSING_MODE:'dropbox_chatgpt_bridge',VISUAL_GENERATION_PROVIDER:'higgsfield'}), 'higgsfield');
});
test('real native correction adapter passes existing gates, preserves version and rejects stale source',()=>{
  const review=JSON.parse(fs.readFileSync('content/news/reviews/eeg-netzpaket-richtungsbezug-2026-09-09.json'));
  const original=structuredClone(JSON.parse(fs.readFileSync('data/news/stories.json')).stories.find(s=>s.story_id===review.story_id));
  const version=original.versions.find(v=>sha256(JSON.stringify(v.analysis))===review.expected_analysis_hash);
  Object.assign(original,{analysis:version.analysis,content_hash:review.expected_content_hash,current_version:version.version});original.versions=original.versions.filter(v=>v.version<=version.version);
  delete original.pending_update;
  const c={...original,sources:review.sources,existing_story:original},created='2026-09-09T12:00:00.000Z',processed='2026-09-09T14:00:00.000Z';
  const input=bridgeInput(c,created),value=output(input,'publish');value.processed_at=processed;
  Object.assign(value.story,{headline:review.title,short_summary:review.analysis.summary,detailed_summary:review.analysis.source_summary});
  value.wirkungsticker={analysis:review.analysis,correction_note:review.correction_note};
  const registry=loadNewsRegistry(process.cwd());
  const result=adaptOutput(value,{input,candidate:c},registry,[original],processed);
  assert.equal(result.record.story_id,original.story_id);assert.ok(result.record.corrections.length);assert.deepEqual(result.record.versions.slice(0,-1),original.versions);
  const wrapped={...value,wirkungsticker:{...value.wirkungsticker,analysis:{analyses:[{...review.analysis,story_id:original.story_id}]}}};
  assert.equal(adaptOutput(wrapped,{input,candidate:c},registry,[original],processed).record.story_id,original.story_id);
  wrapped.wirkungsticker.analysis.analyses[0].story_id='wt-other';
  assert.throws(()=>adaptOutput(wrapped,{input,candidate:c},registry,[original],processed),/ANALYSIS_BINDING/);
  assert.throws(()=>adaptOutput(value,{input,candidate:c},registry,[{...original,content_hash:'changed'}],processed),/STALE_SOURCE/);
  assert.throws(()=>adaptOutput({...value,decision:{...value.decision,status:'merge',merge_into:'wt-not-a-target'}},{input,candidate:c},registry,[original],processed),/TARGET_INVALID/);
  const draft={...original,published:false,versions:[],analysis:undefined};
  const freshCandidate={...c,existing_story:draft};
  const freshInput=bridgeInput(freshCandidate,created),fresh={...value,job_id:freshInput.job_id,input_hash:freshInput.input_hash};
  assert.equal(adaptOutput(fresh,{input:freshInput,candidate:freshCandidate},registry,[draft],processed).record.published,true);
  const merge={...value,decision:{...value.decision,status:'merge',merge_into:original.story_id},wirkungsticker:{...value.wirkungsticker,merge_expected_content_hash:original.content_hash,merge_expected_analysis_hash:sha256(JSON.stringify(original.analysis))}};
  const merged=adaptOutput(merge,{input,candidate:c},registry,[original],processed);assert.equal(merged.record.story_id,original.story_id);
});

function png(width=1200,height=675){
  const chunk=(name,data)=>{
    const n=Buffer.alloc(4);n.writeUInt32BE(data.length);
    const body=Buffer.concat([Buffer.from(name),data]);let crc=0xffffffff;
    for(const byte of body){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
    const end=Buffer.alloc(4);end.writeUInt32BE((crc^0xffffffff)>>>0);
    return Buffer.concat([n,body,end]);
  };
  const h=Buffer.alloc(13);h.writeUInt32BE(width);h.writeUInt32BE(height,4);h[8]=8;h[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',deflateSync(Buffer.alloc((width*4+1)*height))),chunk('IEND',Buffer.alloc(0))]);
}
test('visual provider checks byte/version binding, dimensions, metadata and local quality without generation',async t=>{
  const {directory,transport}=setup(t);const input=bridgeInput(candidate(),now);const job={input};let checks=0;
  const provider=new ChatGPTBridgeVisualProvider({directory,transport,decode:async()=>{checks++;},quality:async()=>({status:'passed'})});
  assert.equal((await provider.receive(job,later)).status,'missing');
  const bytes=png(),visual={schema_version:'1.0',job_id:input.job_id,input_hash:input.input_hash,image_sha256:digest(bytes),generated_at:later,visual_type:'editorial_symbolic_image',concept:'Wasserrohre',visual_reasoning_short:'Test',subjects:[],symbols:[],location_context:null,caption:'Symbolbild',alt_text:'Schematische Wasserrohre',ai_generated:true,contains_real_person_depiction:false,contains_text_in_image:false,similarity_check:{checked_against_recent:true,possible_duplicate:false,notes:''},editorial_safety:{photorealistic_event_claim:false,misleading_documentary_impression:false,warnings:[]}};
  const manifest=bridgePath('20_OUTPUT_READY',`${input.job_id}.visual.json`),image=bridgePath('20_OUTPUT_READY',`${input.job_id}.title.png`);
  transport.files.set(manifest,JSON.stringify(visual));transport.files.set(image,bytes);
  assert.equal((await provider.receive(job,later)).status,'validated');assert.equal(checks,1);
  const decoderAvailable=['magick','convert'].some(command=>{try{execFileSync(command,['-version'],{stdio:'ignore'});return true;}catch{return false;}});
  if(process.env.WIRKUNGSTICKER_PROCESSING_MODE==='dropbox_chatgpt_bridge')assert.ok(decoderAvailable,'Production bridge requires a decoder');
  if(decoderAvailable){
    const decoded=new ChatGPTBridgeVisualProvider({directory,transport,quality:async()=>({status:'passed'})});
    assert.equal((await decoded.receive(job,later)).status,'validated');
    const corrupt=Buffer.from(bytes);corrupt[45]^=255;
    transport.files.set(image,corrupt);transport.files.set(manifest,JSON.stringify({...visual,image_sha256:digest(corrupt)}));
    await assert.rejects(decoded.receive(job,later));
    transport.files.set(image,bytes);transport.files.set(manifest,JSON.stringify(visual));
  }
  transport.files.set(image,png(1200,1200));await assert.rejects(provider.receive(job,later),/FORMAT_INVALID/);
  transport.files.set(image,bytes);transport.files.set(manifest,JSON.stringify({...visual,contains_text_in_image:true}));await assert.rejects(provider.receive(job,later),/SCHEMA_INVALID/);
  transport.files.set(manifest,JSON.stringify({...visual,input_hash:hash('other')}));await assert.rejects(provider.receive(job,later),/BINDING_MISMATCH/);
});
test('last 30 image references are supplied without inventing historical descriptions',()=>{
  const stories=Array.from({length:35},(_,i)=>({story_id:`wt-${i}`,title:`Title ${i}`,title_image:{generated_at:new Date(Date.parse(now)-i*60000).toISOString(),source_visual:{url:`https://example.org/${i}.png`}}}));
  const context=visualContext(candidate(),stories);assert.equal(context.recent_visual_concepts.length,30);assert.equal(context.recent_image_descriptions.length,30);
  assert.equal(context.recent_visual_concepts[0].description_verified,false);
});
test('staging record survives ACK and duplicate reconciliation; production ACK requires committed marker',async t=>{
  const record=structuredClone(JSON.parse(fs.readFileSync('data/news/stories.json')).stories.find(s=>s.published&&s.listed!==false));
  const {provider,store,transport}=setup(t,{stageOnly:true,adapt:()=>({decision:'publish',record})});
  await provider.enqueue([candidate()],[],now,{testOnly:true});const job=store.all()[0];
  transport.files.set(bridgePath('20_OUTPUT_READY',`${job.input.job_id}.output.json`),JSON.stringify(output(job.input,'publish')));
  const [accepted]=await provider.reconcile({},[candidate()],later);assert.equal(accepted.staged,true);
  await provider.finalize([],later);assert.ok(store.get(job.input.job_id).staging.html.includes(record.title.replace(/&/g,'&amp;')));
  assert.equal(store.get(job.input.job_id).ack.status,'staged');assert.equal(store.get(job.input.job_id).ack.url,null);
  assert.deepEqual(await provider.reconcile({},[],later),[]);
  assert.equal(store.observation('completion-metrics').completed,1);
  assert.ok(store.get(job.input.job_id).retain_until);
});

test('production ACK waits for matching pushed marker; failed archival stops after three attempts',async t=>{
  const record=structuredClone(JSON.parse(fs.readFileSync('data/news/stories.json')).stories.find(s=>s.published&&s.listed!==false));
  const {provider,store,transport}=setup(t,{stageOnly:false,adapt:()=>({decision:'publish',record})});
  await provider.enqueue([candidate()],[],now);const job=store.all()[0];
  transport.files.set(bridgePath('20_OUTPUT_READY',`${job.input.job_id}.output.json`),JSON.stringify(output(job.input,'publish')));
  const [accepted]=await provider.reconcile({},[candidate()],later);
  await provider.finalize([record],later,{committed:false});assert.equal(store.get(job.input.job_id).ack,undefined);
  await provider.finalize([record],later,{committed:true});assert.equal(store.get(job.input.job_id).ack,undefined);
  record.bridge_import={job_id:job.input.job_id,output_hash:accepted.output_hash};
  let attempts=0;transport.archive=async()=>{attempts++;throw Object.assign(Error('BRIDGE_DROPBOX_HTTP_503'),{retryable:true});};
  for(let i=0;i<5;i++)await provider.finalize([record],later,{committed:true});
  assert.equal(attempts,3);assert.equal(store.get(job.input.job_id).status,'archive_failed');
  assert.equal(store.get(job.input.job_id).ack.status,'imported');assert.equal(store.observation('completion-metrics').completed,1);
});

test('prepared packet retries unchanged after source content changes',async t=>{
  const {provider,store,transport}=setup(t);transport.outage=true;
  await provider.enqueue([candidate()],[],now);const before=store.all()[0];transport.outage=false;
  const changed={...candidate(),content_hash:hash('new material')};
  await provider.enqueue([changed],[],later);assert.equal(store.all().length,1);
  assert.equal(store.get(before.input.job_id).status,'queued');
  assert.deepEqual(JSON.parse(await transport.read(bridgePath('00_INBOX',`${before.input.job_id}.input.json`))),before.input);
});

import { HiggsfieldBridgeVisualProvider } from '../../scripts/news/bridge/visual-brief.mjs';
import { buildEditorialImagePrompt } from '../../scripts/news/title-image/policy.mjs';
import { createTitleImagePipeline } from '../../scripts/news/title-image/pipeline.mjs';
const brief3 = { required:true, visual_type:'editorial_symbolic_image', concept:'Ein einzelner sachlich gezeichneter Einkaufswagen.', subjects:['Einkaufswagen'], symbols:[], avoid:['Logos'], location_context:null, contains_real_person:false, documentary_impression_forbidden:true, text_in_image:false, caption:'Symbolbild', alt_text:'Gezeichneter Einkaufswagen.', editorial_notes:'' };
function bridge3Env(t){const old={...process.env};process.env.WIRKUNGSTICKER_PROCESSING_MODE='dropbox_chatgpt_bridge';process.env.VISUAL_GENERATION_PROVIDER='higgsfield';t.after(()=>{for(const k of ['WIRKUNGSTICKER_PROCESSING_MODE','VISUAL_GENERATION_PROVIDER'])if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];});}
test('bridge3 keeps text API disabled while the brief is used verbatim by the existing image prompt',async t=>{
  bridge3Env(t);let calls=0;
  await assert.rejects(callWoekAi([candidate()],{fetchImpl:async()=>{calls++;}}),/API_PROCESSING_DISABLED/);assert.equal(calls,0);
  const prompt=buildEditorialImagePrompt({...candidate(),title:'Angriff',visual_brief:brief3});
  assert.ok(prompt.includes(JSON.stringify(brief3)));assert.ok(!prompt.includes('photographic-style still life'));
});
test('bridge3 output readiness ignores a leftover PNG and consumes no missing-output retries',async t=>{
  bridge3Env(t);const {provider,store,transport}=setup(t);await provider.enqueue([candidate()],[],now);const job=store.all()[0];
  transport.files.set(bridgePath('20_OUTPUT_READY',`${job.input.job_id}.title.png`),png());
  assert.equal((await outputStatus(store,transport,later)).status,'PROCESSING_PENDING');
  transport.files.set(bridgePath('20_OUTPUT_READY',`${job.input.job_id}.output.json`),JSON.stringify({...output(job.input),visual_brief:brief3}));
  assert.deepEqual((await outputStatus(store,transport,later)).ready,[job.input.job_id]);assert.deepEqual(store.get(job.input.job_id).attempts,{});
});
test('bridge3 hold/reject never render; schema paths remain diagnostic in immutable error records',async t=>{
  bridge3Env(t);let renders=0;const {provider,store,transport}=setup(t,{visualProvider:{receive:async()=>{renders++;throw Error('must not render');}}});
  await provider.enqueue([candidate(1),candidate(2),candidate(3)],[],now);
  for(const [i,job]of store.all().entries()){
    const packet={...output(job.input,i===1?'reject':'hold'),visual_brief:brief3};if(i===2)packet.sources[0].source_id=4;
    transport.files.set(bridgePath('20_OUTPUT_READY',`${job.input.job_id}.output.json`),JSON.stringify(packet));
  }
  const result=await provider.reconcile({},[],later);assert.equal(result.length,2);assert.equal(renders,0);
  assert.match(store.all().find(j=>j.status==='quarantined').last_error.error_code,/BRIDGE_SCHEMA_INVALID:\$\.sources\[0\]\.source_id/);
});
test('bridge3 Higgsfield failure uses the real card pipeline and persists private PNG before staged ACK',async t=>{
  bridge3Env(t);let calls=0;
  const record=structuredClone(JSON.parse(fs.readFileSync('data/news/stories.json')).stories.find(s=>s.published&&s.listed!==false));delete record.title_image;
  const {directory,provider,store,transport}=setup(t,{stageOnly:false,adapt:()=>({decision:'publish',record})});
  provider.visualProvider=new HiggsfieldBridgeVisualProvider({directory,pipeline:options=>createTitleImagePipeline({...options,generate:async()=>{calls++;throw Object.assign(Error('Unavailable'),{code:'HIGGSFIELD_PROVIDER_UNAVAILABLE'});},raster:async(svg,{width,height})=>({png:png(width,height)})})});
  await provider.enqueue([candidate()],[],now,{testOnly:true});const job=store.all()[0];
  transport.files.set(bridgePath('20_OUTPUT_READY',`${job.input.job_id}.output.json`),JSON.stringify({...output(job.input,'publish'),visual_brief:brief3}));
  const [result]=await provider.reconcile({},[record],later);assert.equal(result.staged,true);assert.equal(calls,1);
  const image=store.get(job.input.job_id).staging.image;assert.equal(image.title_image.mode,'impact_card');assert.ok(image.png_base64);assert.ok(image.title_image.wide.url.startsWith('/private-staging/'));
  await provider.finalize([],later);assert.equal(store.get(job.input.job_id).ack.status,'staged');assert.equal(store.get(job.input.job_id).ack.url,null);
  await provider.reconcile({},[],later);assert.equal(calls,1);
});
test('bridge3 duplicate concept falls back without spending and required=false retains the image without generation',async t=>{
  bridge3Env(t);const {directory}=setup(t),input=bridgeInput(candidate(),now);input.visual_context.recent_visual_concepts=[{story_id:'another',description_verified:true,concept:brief3.concept}];
  const v=new HiggsfieldBridgeVisualProvider({directory});const response=await v.receive({input},later,{record:candidate(),output:{visual_brief:brief3},staged:false});assert.equal(response.status,'fallback');
  let calls=0;const p=createTitleImagePipeline({root:directory,generate:async()=>{calls++;throw Error('No');},publish:async()=>({}),raster:async(svg,{width,height})=>({png:png(width,height)})});
  await p({...candidate(),visual_brief:{...brief3,required:false}});assert.equal(calls,0);
});


test('standalone bridge CLI reaches configuration validation instead of circular top-level-await deadlock',()=>{
  const env={...process.env,WIRKUNGSTICKER_PROCESSING_MODE:'dropbox_chatgpt_bridge',VISUAL_GENERATION_PROVIDER:'higgsfield'};
  delete env.WOEK_NEWS_BRIDGE_URL;delete env.WOEK_NEWS_BRIDGE_TOKEN;delete env.GITHUB_RUN_ID;
  let failure;try{execFileSync(process.execPath,['scripts/news/run.mjs'],{env,encoding:'utf8',timeout:10000,stdio:'pipe'});}catch(error){failure=error;}
  assert.equal(failure.status,1);assert.match(failure.stderr,/BRIDGE_REMOTE_CONFIG_REQUIRED/);assert.doesNotMatch(failure.stderr,/unsettled top-level await/);
});
