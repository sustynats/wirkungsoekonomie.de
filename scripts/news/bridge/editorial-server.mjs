import http from 'node:http';
import {loadNewsRegistry} from '../registry.mjs';
import {prepareIntakeNews,stageIntakeNews} from './intake-news.mjs';
import {prepareEditorialRevisions,notifyEditorialReviews} from './editorial-revisions.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {randomInt} from 'node:crypto';
import {BridgeStore} from './store.mjs';
import {DropboxTransport,loadDropboxCredentials} from './dropbox.mjs';
import {bridgePath} from './contract.mjs';
import {EditorialIntake} from './intake.mjs';
import {EditorialApproval} from './editorial-approval.mjs';
import {createEditorialIntakeHandler,existingAdminAuthorizer} from './intake-http.mjs';
import {EDITORIAL_REQUEST_CONTRACT,importEditorialPreviews} from './intake-processing.mjs';

const directory=process.env.WOEK_NEWS_BRIDGE_DIRECTORY,owner=process.env.WOEK_EDITORIAL_OWNER_DISCORD_ID;
if(!path.isAbsolute(directory||'')||!/^\d{15,22}$/.test(owner||''))throw Error('EDITORIAL_PRIVATE_CONFIGURATION_REQUIRED');
const db=path.join(directory,'queue.sqlite');
const store=new BridgeStore(db,{lane:'discovery'}),importStore=new BridgeStore(db,{lane:'import'});
const transport=new DropboxTransport({credentials:loadDropboxCredentials(path.join(directory,'dropbox.json'),process.cwd())});
const approval=new EditorialApproval(store.db),intake=new EditorialIntake({store,transport,directory:path.join(directory,'editorial-uploads')});
const admin=existingAdminAuthorizer();
const handler=createEditorialIntakeHandler({intake,approval,authorize:async req=>(await admin(req))===owner?owner:null});
await transport.writeAtomic(bridgePath('98_CONFIG','editorial-request-contract-2.json'),EDITORIAL_REQUEST_CONTRACT);
const notificationFile=path.join(directory,'editorial-discord.json');
const notificationConfig=fs.existsSync(notificationFile)?JSON.parse(fs.readFileSync(notificationFile)):null;
const registry=loadNewsRegistry(process.cwd());
let polling=false;
async function poll(){
 if(polling)return;polling=true;
 try{
  let imported=false,importAcquired=false;
  try{importStore.acquire(new Date().toISOString(),'import',{manualRunId:`${Date.now()}:${randomInt(100000)}`});importAcquired=true;
   const result=await importEditorialPreviews({store:importStore,transport,approval});
   if(result.failed?.length)console.error(JSON.stringify({event:'EDITORIAL_CORRECTION_REQUESTED',jobs:result.failed}));
   stageIntakeNews({store:importStore,approval});imported=true;
  }catch(e){if(e.message!=='BRIDGE_RUN_LOCKED')console.error(JSON.stringify({event:'EDITORIAL_IMPORT_PENDING',code:/^[A-Z_]+$/.test(e.message)?e.message:'EDITORIAL_IMPORT_FAILED'}));}
  finally{if(importAcquired)importStore.release(imported);}
  let prepared=false,discoveryAcquired=false;
  try{store.acquire(new Date().toISOString(),'discovery',{manualRunId:`${Date.now()}:${randomInt(100000)}`});discoveryAcquired=true;
   prepareEditorialRevisions({store,approval});await prepareIntakeNews({store,transport,registry});prepared=true;
  }catch(e){if(e.message!=='BRIDGE_RUN_LOCKED')console.error('EDITORIAL_RESEARCH_PENDING');}finally{if(discoveryAcquired)store.release(prepared);}
  await notifyEditorialReviews({approval,store,config:notificationConfig});
 }finally{polling=false;}
}
const timer=setInterval(poll,30000);timer.unref();
const server=http.createServer(async(req,res)=>{
 if(req.url.startsWith('/internal/')){
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  if(req.headers.origin||!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))return send(403,{});
  try{
   if(req.url==='/internal/status'&&req.method==='GET')return send(200,{pending:approval.pendingPublication().length});
   if(req.method!=='POST'||req.headers['content-type']!=='application/json')return send(400,{});
   if(req.url==='/internal/failure'){
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)return send(413,{});}
    const [contentHash,code]=JSON.parse(raw);return send(200,approval.publicationFailed(contentHash,code));
   }
   if(req.url==='/internal/claim')return send(200,approval.claimPublications());
   if(req.url==='/internal/finalize'){
    let published=0;
    for(const r of approval.pendingPublication().filter(r=>r.status==='PUBLISHING')){
     const e=r.publication.edition,url='https://wirkungsoekonomie.de/wirkungsticker/'+(e.format==='approved_news'?e.record.slug:'analyse/'+e.slug)+'/';
     const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(10000)});
     if(!response.ok){await response.body?.cancel();continue;}
     if((await response.text()).includes(e.format==='approved_news'?'data-editorial-approval-hash="'+e.approval_hash+'"':'data-editorial-content-hash="'+e.content_hash+'"')){approval.markPublished(e.content_hash,url);published++;}
    }return send(200,{published});
   }return send(404,{});
  }catch{return send(503,{error:'EDITORIAL_INTERNAL_PENDING'});}
 }
 if(await handler(req,res))return;res.writeHead(404,{'Cache-Control':'no-store'});res.end();
});
server.requestTimeout=120000;
server.listen(8788,'127.0.0.1');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{clearInterval(timer);handler.close();server.close(()=>{store.close();importStore.close();process.exit(0);});});
