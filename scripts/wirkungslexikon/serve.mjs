import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {ROOT, atomic, read, loadModel} from './model.mjs';
import {saveEntry as saveLegacyEntry} from './editorial.mjs';
import {V9,loadStore,saveDraft} from './v9-store.mjs';
import {buildV9} from './v9-build.mjs';
import {reviewIndex,reviewValue,saveReview} from './v9-review.mjs';
import {build} from './build.mjs';
const isV9=process.env.WL_VERSION==='9';
const base=isV9?V9:path.join(ROOT,'outputs/wirkungslexikon');
const currentModel=()=>{if(!isV9)return loadModel();const store=loadStore();const v3=read(path.join(store.source,'01_DATEN/V3_ORIGINAL_MASTER_UNVERAENDERT.json'));return {data:{...v3,entries:Object.values(store.objects).filter(o=>o.type==='wirkungskarte').map(o=>read(path.join(V9,'snapshots',o.draftHash+'.json')))},editorial:{revision:store.events.length}};};
const saveEntry=(body,principal)=>{if(!isV9)return saveLegacyEntry(body,principal);const store=loadStore();if(body.revision!==store.events.length)throw Error('REVISION_CONFLICT');const old=store.objects[body.entry?.id];if(!old||(old.slug||old.id)!==body.slug)throw Error('Unbekannte Karte');const o=saveDraft(store,old.id,body.entry,{role:principal.role,subject:principal.username},body.reason,old.draftHash);return {entry:body.entry,revision:store.events.length,eventId:store.events.at(-1).hash};};
const run=promisify(execFile);
const authFile=path.join(base,'access.json');
if(!fs.existsSync(authFile))atomic(authFile,{username:'redaktion',password:crypto.randomBytes(24).toString('base64url'),name:'Lokale Redaktion',role:'editor'});
const access=read(authFile);
const equal=(a,b)=>{const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);};
const mime={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
let saving=false;const limits=new Map();
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 const auth=req.headers.authorization||'';
 const expected='Basic '+Buffer.from(access.username+':'+access.password).toString('base64');
 if(!equal(auth,expected)){res.setHeader('WWW-Authenticate','Basic realm="Wirkungslexikon Redaktion", charset="UTF-8"');res.writeHead(401);res.end('Zugang geschützt');return;}
 const u=new URL(req.url,'http://localhost');
 const json=(code,v)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(v));};
 async function body(){let raw='';for await(const c of req){raw+=c;if(raw.length>300000)throw Error('Eingabe zu groß');}return JSON.parse(raw);}
 try{
  if(u.pathname.startsWith('/api/')){
   if(req.method==='POST'){
    const origin=req.headers.origin; if(origin&&origin!==`http://${req.headers.host}`&&origin!==`https://${req.headers.host}`)return json(403,{error:'Fremde Herkunft gesperrt'});
    if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'JSON erforderlich'});
   }
   if(isV9&&u.pathname==='/api/wirkungslexikon/workflow'){if(req.method!=='GET')return json(403,{error:'OFFICIAL_ACCOUNT_NOT_CONNECTED: keine Freigabe über technische oder KI-Schnittstelle'});const store=loadStore();return json(200,{version:'V9',role:access.role,approvalEnabled:false,objects:Object.values(store.objects).map(({id,type,state,draftHash,publishedHash})=>({id,type,state,draftHash,publishedHash}))});}
   if(isV9&&u.pathname==='/api/wirkungslexikon/review'){
    const index=reviewIndex();if(!index)return json(404,{error:'Prüfpaket nicht importiert'});
    if(req.method==='GET'){const id=u.searchParams.get('id');if(!id)return json(200,{objects:Object.values(index.objects),templates:index.templates,patches:index.patches,approvalEnabled:false});const o=index.objects[id];return o?json(200,{type:o.type,id:o.id,entry:reviewValue(o),revision:o.draftHash}):json(404,{error:'Unbekanntes Prüfobjekt'});}
    if(req.method==='POST'){
     if(saving)return json(409,{error:'Speicherung läuft; bitte erneut versuchen'});saving=true;
     try{const result=saveReview(await body(),{role:access.role,subject:access.username});buildV9();return json(200,result);}finally{saving=false;}
    }
    return json(405,{error:'Methode nicht erlaubt'});
   }
   if(u.pathname==='/api/wirkungslexikon/editorial'){
    if(req.method==='GET'){const model=currentModel();const key=u.searchParams.get('slug');const o=isV9?Object.values(loadStore().objects).find(o=>o.id===key||o.slug===key):null;const entry=isV9?(o?read(path.join(V9,'snapshots',o.draftHash+'.json')):null):model.data.entries.find(e=>e.slug===key);return json(entry?200:404,{entry,revision:model.editorial.revision,actor:access.name});}
    if(req.method==='POST'){
     if(saving)return json(409,{error:'Speicherung läuft; bitte erneut versuchen'});saving=true;
     try{const result=saveEntry(await body(),access);if(isV9){buildV9();return json(200,{...result,socialImagesReady:false});}build();build({mode:'public'});let socialImagesReady=true;try{await run(process.execPath,[path.join(ROOT,'scripts/wirkungslexikon/render-social.mjs'),'--missing'],{timeout:180000});}catch{socialImagesReady=false;}return json(200,{...result,socialImagesReady});}finally{saving=false;}
    }
   }
   if(u.pathname==='/api/wirkungslexikon/reports'){
    const f=path.join(base,'private-reports.json');const reports=fs.existsSync(f)?read(f):[];
    if(req.method==='GET')return json(200,reports);
    if(req.method==='POST'){
     const last=limits.get(access.username)||0;if(Date.now()-last<5000)return json(429,{error:'Bitte kurz warten'});
     const b=await body();if(!currentModel().data.entries.some(e=>e.slug===b.slug)||typeof b.art!=='string'||!b.art.trim()||typeof b.text!=='string'||!b.text.trim()||b.text.length>10000) return json(400,{error:'Art und Beschreibung erforderlich'});
     if(b.url&&!/^https?:$/.test(new URL(b.url).protocol))return json(400,{error:'Ungültige Beleg-URL'});
     const report={id:crypto.randomUUID(),date:new Date().toISOString(),slug:b.slug,version:b.version,art:b.art.slice(0,200),text:b.text,url:b.url||'',mail:String(b.mail||'').slice(0,254)};
     reports.push(report);atomic(f,reports);limits.set(access.username,Date.now());return json(201,{id:report.id,saved:true});
    }
   }
   return json(404,{error:'Nicht gefunden'});
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const publicSimulation=u.pathname.startsWith('/public/');
  const root=path.join(base,publicSimulation?'public':'preview');
  const decoded=decodeURIComponent(publicSimulation?u.pathname.slice(7):u.pathname);
  if(decoded.split('/').some(s=>s.startsWith('.')||s==='..')||decoded.includes('\\')){res.writeHead(404);res.end();return;}
  let rel=decoded==='/'?'/wirkungslexikon/':decoded;
  let file=path.resolve(root,'.'+rel);
  if(!file.startsWith(root+path.sep)){res.writeHead(404);res.end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(isV9&&!publicSimulation&&!fs.existsSync(file)&&process.env.WL_HOST_ARTIFACT&&!rel.startsWith('/wirkungslexikon/')){
   const host=path.resolve(process.env.WL_HOST_ARTIFACT);const fallback=path.resolve(host,'.'+rel);
   if(fallback.startsWith(host+path.sep)){file=fallback;if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');}
  }
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Nicht gefunden');return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  if(req.method==='HEAD'){res.writeHead(200);res.end();return;}
  // Public artifact simulation remains protected by this same authentication gate.
  if(publicSimulation&&path.extname(file)==='.html'){let html=fs.readFileSync(file,'utf8');html=html.replace(/(href|src|action)="\/(?!\/)/g,'$1="/public/');res.end(html);return;}
  fs.createReadStream(file).pipe(res);
 }catch(error){json(error.message.includes('REVISION_CONFLICT')?409:400,{error:error.message});}
});
server.listen(Number(process.env.WL_PORT||8796),'127.0.0.1',()=>console.log('Geschützte Vorschau: http://127.0.0.1:'+server.address().port+'/wirkungslexikon/ · Zugangsdaten ausschließlich in '+authFile));
