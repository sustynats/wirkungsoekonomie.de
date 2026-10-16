import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {NarrativeInbox,validateReport,createNarrativeHandler,notificationFor,REPORT_PATH} from './intake.mjs';
import {sendDiscord} from '../ops/discord-monitor.mjs';
const discord={token:'test-only-bot-credential',recipient:'123456789012345678'};
const report=()=>({requestId:randomUUID(),term:'Beispielnarrativ',wording:'Dies ist eine deutlich gekennzeichnete Testmeldung.',source:'Öffentliche Testpublikation, Seite 3',foundOn:'2026-10-16',speaker:'',context:'Nur ein technischer Test.',website:''});
const mock=log=>async(url,options)=>{log.push({url,options});return new Response(JSON.stringify({id:'234567890123456789'}),{status:200,headers:{'content-type':'application/json'}});};

test('Validated reports store only the intended fields, with exact wording and genuine dates',()=>{
 const input={...report(),term:'  Prüfung  ',ip:'not stored',email:'not stored',unknown:'not stored'};
 const value=validateReport(input);assert.equal(value.term,'Prüfung');assert.equal(value.wording,input.wording);assert(!('email'in value));assert(!('ip'in value));assert(!('unknown'in value));
 for(const extra of [{term:'a'},{wording:'a'},{source:''},{foundOn:'2026-02-30'},{foundOn:'2026-99-01'},{website:'bot'},{requestId:'invalid'},{context:'a\u0000b'}])assert.throws(()=>validateReport({...input,...extra}),e=>e.status===422);
});

test('Durable receipt survives restart; retries are idempotent, changed retries conflict',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wl-inbox-')),file=path.join(dir,'reports.sqlite'),input=report();let inbox=new NarrativeInbox(file);
 try{assert.equal(inbox.accept(input).duplicate,false);inbox.close();inbox=new NarrativeInbox(file);assert.equal(inbox.accept(input).duplicate,true);assert.equal(inbox.all().length,1);assert.equal(inbox.get(input.requestId).body.wording,input.wording);assert.throws(()=>inbox.accept({...input,wording:'Geänderter Inhalt für dieselbe Übertragung.'}),e=>e.status===409);assert.equal(fs.statSync(file).mode&0o777,0o600);assert(!JSON.stringify(inbox.all()).includes('remoteAddress'));}finally{inbox.close();fs.rmSync(dir,{recursive:true,force:true});}
});

test('One private notification carries the full original as a text file, with mentions and previews disabled',async()=>{
 const inbox=new NarrativeInbox(':memory:'),input={...report(),wording:'@everyone <script>alert(1)</script>\n'+('Belegtext. '.repeat(500))};inbox.accept(input);const row=inbox.pending()[0],event=notificationFor(row),log=[];
 assert(event.content.length<1950);assert(event.attachment.content.includes(input.wording.trim()));await sendDiscord(event,{...discord,fetchImpl:mock(log)});
 assert.equal(log.length,2);const message=log[1];assert(!('content-type'in message.options.headers));assert(message.options.body instanceof FormData);
 const payload=JSON.parse(message.options.body.get('payload_json'));assert.deepEqual(payload.allowed_mentions,{parse:[]});assert.equal(payload.flags,4);assert.equal(payload.enforce_nonce,true);
 const attachment=message.options.body.get('files[0]');assert((await attachment.text()).includes(input.wording.trim()));assert.equal(attachment.name,'narrativ-'+input.requestId+'.txt');inbox.close();
});

test('Failed delivery remains queued and retries after backoff; overlapping flush calls do not duplicate',async()=>{
 let clock=100000,fail=true;const inbox=new NarrativeInbox(':memory:',{now:()=>clock}),log=[];inbox.accept(report());
 const intake=createNarrativeHandler({inbox,discord,now:()=>clock,fetchImpl:async(...args)=>{if(fail)return new Response('{}',{status:503});return mock(log)(...args);}});
 await intake.flush();assert.equal(inbox.pending().length,0);assert.equal(inbox.all()[0].notified_at,null);assert.equal(inbox.all()[0].attempts,1);
 clock+=31000;fail=false;await Promise.all([intake.flush(),intake.flush()]);assert(inbox.all()[0].notified_at);assert.equal(log.length,2);await intake.flush();assert.equal(log.length,2);await intake.close();inbox.close();
});

test('Anonymous HTTP intake, CORS boundaries, private reads, validation, duplicates and limits',async()=>{
 const inbox=new NarrativeInbox(':memory:'),log=[],intake=createNarrativeHandler({inbox,discord,origins:['https://wirkungsoekonomie.de'],limit:6,fetchImpl:mock(log)});
 const server=http.createServer(async(req,res)=>{if(!await intake.handle(req,res)){res.writeHead(404);res.end();}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 const call=(method,body,origin='https://wirkungsoekonomie.de',headers={})=>fetch(base+REPORT_PATH,{method,headers:{Origin:origin,'Content-Type':'application/json',...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 try{
  const options=await call('OPTIONS');assert.equal(options.status,204);assert.equal(options.headers.get('Access-Control-Allow-Origin'),'https://wirkungsoekonomie.de');assert.equal(options.headers.get('Access-Control-Allow-Credentials'),null);
  assert.equal((await call('POST',report(),'https://foreign.invalid')).status,403);assert.equal((await call('GET')).status,405);assert.equal((await call('POST',report(),undefined,{'Content-Type':'text/plain'})).status,415);
  assert.equal((await call('POST',{...report(),wording:'x'.repeat(70000)})).status,413);
  assert.equal((await call('POST',{...report(),wording:''})).status,422);
  const input=report(),saved=await call('POST',input);assert.equal(saved.status,202);assert.equal((await saved.json()).id,input.requestId);assert.equal(inbox.get(input.requestId).body.source,input.source);
  assert.equal((await call('POST',input)).status,202);assert.equal(inbox.all().length,1);assert.equal((await call('POST',{...input,term:'anderer Inhalt'})).status,409);
  assert.equal((await fetch(base+REPORT_PATH+'/'+input.requestId)).status,404);
  await call('POST',report());await call('POST',report());const rate=await call('POST',report());assert.equal(rate.status,429);assert(rate.headers.has('Retry-After'));
  await intake.flush();assert(inbox.all().every(r=>r.notified_at));
 }finally{await new Promise(resolve=>server.close(resolve));await intake.close();inbox.close();}
});

test('Inbox capacity rejects new reports without altering existing receipts or auto-publishing',()=>{
 const inbox=new NarrativeInbox(':memory:',{maxReports:1}),input=report();inbox.accept(input);assert.throws(()=>inbox.accept(report()),e=>e.status===503);assert.equal(inbox.all().length,1);assert.equal(inbox.get(input.requestId).notified_at,null);inbox.close();
});
