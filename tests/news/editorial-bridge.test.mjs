import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BridgeStore } from '../../scripts/news/bridge/store.mjs';
import { DropboxChatGPTBridgeProvider } from '../../scripts/news/bridge/provider.mjs';
import { discoverEditorialJobs, importEditorialJobs } from '../../scripts/news/bridge/editorial.mjs';
import { bridgePath } from '../../scripts/news/bridge/contract.mjs';
import { highStory, validEditorial, registryFor } from './fixtures/editorial-bridge.mjs';
const now='2026-09-10T08:00:00.000Z',later='2026-09-10T08:30:00.000Z';
function fixture(t,{stageOnly=false}={}){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'woek-editorial-bridge-'));
  fs.mkdirSync(path.join(root,'data/news'),{recursive:true});fs.mkdirSync(path.join(root,'content/news'),{recursive:true});
  const story=highStory();
  fs.writeFileSync(path.join(root,'data/news/stories.json'),JSON.stringify({stories:[story]}));
  fs.writeFileSync(path.join(root,'data/news/editorial-analyses.json'),JSON.stringify({schema_version:'1.0',analyses:[],candidates:[]}));
  fs.writeFileSync(path.join(root,'content/news/source-registry.json'),JSON.stringify(registryFor([story])));
  const store=new BridgeStore(path.join(root,'queue.sqlite')),files=new Map();
  const transport={outage:false,async writeAtomic(p,v){if(this.outage)throw Object.assign(Error('BRIDGE_DROPBOX_HTTP_503'),{retryable:true});const data=JSON.stringify(v);if(files.has(p))assert.equal(files.get(p),data);files.set(p,data);},async list(folder){return [...files.keys()].filter(p=>p.includes('/'+folder+'/')).map(p=>({name:p.split('/').at(-1)}));},async read(p){return files.get(p);},async archive(p){files.delete(p);},async move(a,b){files.set(b,files.get(a));files.delete(a);}};
  const bridge=new DropboxChatGPTBridgeProvider({store,transport,stageOnly});
  const load=()=>JSON.parse(fs.readFileSync(path.join(root,'data/news/editorial-analyses.json')));
  const putOutput=(job,changes={})=>files.set(bridgePath('20_OUTPUT_READY',job.input.job_id+'.output.json'),JSON.stringify({schema_version:'1.0',job_id:job.input.job_id,input_hash:job.input.input_hash,processed_at:later,decision:{status:'publish',reason:'Quellengebundene zusätzliche systemische Einordnung.'},editorial_analysis:validEditorial(job.candidate),...changes}));
  t.after(()=>{store.close();fs.rmSync(root,{recursive:true,force:true});});
  return {root,story,store,files,transport,bridge,load,putOutput};
}
test('native editorial plan queues once, imports through native gates and ACK waits for canonical commit',async t=>{
  const f=fixture(t);const ids=await discoverEditorialJobs(f.bridge,f.root,now);assert.equal(ids.length,1);
  assert.deepEqual(await discoverEditorialJobs(f.bridge,f.root,now),[]);
  const job=f.store.get(ids[0]);f.putOutput(job);
  const results=await importEditorialJobs(f.bridge,f.root,later);assert.equal(results[0]?.changed,true,JSON.stringify(f.store.get(ids[0]).last_error));
  assert.equal(f.load().analyses.length,1);await f.bridge.finalize([],later);assert.equal(f.store.get(ids[0]).status,'accepted');
  assert.equal((await importEditorialJobs(f.bridge,f.root,later)).length,0);assert.equal(f.load().analyses[0].version,1);
  await f.bridge.finalize([],later,{committed:true,editorials:f.load().analyses});assert.equal(f.store.get(ids[0]).ack.status,'imported');
  assert.match(f.store.get(ids[0]).ack.url,/\/wirkungsticker\/analyse\//);
  assert.deepEqual(await discoverEditorialJobs(f.bridge,f.root,later),[]);
});
test('private editorial staging never writes public catalog and gets staged ACK',async t=>{
  const f=fixture(t,{stageOnly:true});const [id]=await discoverEditorialJobs(f.bridge,f.root,now);f.putOutput(f.store.get(id));
  await importEditorialJobs(f.bridge,f.root,later);assert.equal(f.load().analyses.length,0);assert.ok(f.store.get(id).staging?.html);
  await f.bridge.finalize([],later);assert.equal(f.store.get(id).ack.status,'staged');assert.equal(f.store.get(id).ack.url,null);
});
test('editorial enqueue outage retries immutable input; pending output consumes no attempt',async t=>{
  const f=fixture(t);f.transport.outage=true;await discoverEditorialJobs(f.bridge,f.root,now);const [job]=f.store.all();assert.equal(job.status,'prepared_editorial');
  f.transport.outage=false;assert.deepEqual(await discoverEditorialJobs(f.bridge,f.root,later),[job.input.job_id]);
  await importEditorialJobs(f.bridge,f.root,later);assert.equal(f.store.get(job.input.job_id).attempts.import,undefined);
});
test('editorial binding and full quality gates reject malformed outputs without public writes',async t=>{
  for(const mode of ['hash','quality','stale']){
    const f=fixture(t);const [id]=await discoverEditorialJobs(f.bridge,f.root,now),job=f.store.get(id);
    f.putOutput(job,mode==='hash'?{input_hash:'0'.repeat(64)}:mode==='quality'?{editorial_analysis:{title:'Ungeprüft'}}:{});
    if(mode==='stale'){f.story.sources[0].summary+=' Geänderter Quellenstand.';fs.writeFileSync(path.join(f.root,'data/news/stories.json'),JSON.stringify({stories:[f.story]}));}
    await importEditorialJobs(f.bridge,f.root,later);assert.equal(f.load().analyses.length,0);assert.equal(f.store.get(id).status,'quarantined',mode);
  }
});
test('editorial hold and reject never request imagery or create public content',async t=>{
  const f=fixture(t);const [id]=await discoverEditorialJobs(f.bridge,f.root,now);f.putOutput(f.store.get(id),{decision:{status:'hold',reason:'Weitere Quellen erforderlich.'},editorial_analysis:undefined});
  await importEditorialJobs(f.bridge,f.root,later);await f.bridge.finalize([],later);assert.equal(f.store.get(id).ack.status,'hold');assert.equal(f.load().analyses.length,0);
});
