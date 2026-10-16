import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {isIP} from 'node:net';
import {DatabaseSync} from 'node:sqlite';
import {sendDiscord} from '../ops/discord-monitor.mjs';

export const REPORT_PATH='/api/wirkungslexikon/narrativ-melden';
const ORIGINS=['https://wirkungsoekonomie.de','https://www.wirkungsoekonomie.de'];
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const hash=v=>createHash('sha256').update(v).digest('hex');
const fail=(code,status)=>{throw Object.assign(Error(code),{status});};
const text=(value,min,max)=>{if(typeof value!=='string')fail('INVALID_FIELDS',422);const v=value.trim().normalize('NFC');if(v.length<min||v.length>max||/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(v))fail('INVALID_FIELDS',422);return v;};
export function validateReport(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||!uuid.test(input.requestId||''))fail('INVALID_FIELDS',422);
 if(input.website)fail('INVALID_FIELDS',422);
 const result={requestId:input.requestId,term:text(input.term,3,180),wording:text(input.wording,10,6000),source:text(input.source,5,1500),speaker:text(input.speaker||'',0,300),foundOn:text(input.foundOn||'',0,10),context:text(input.context||'',0,3000)};
 if(result.foundOn&&(!/^\d{4}-\d{2}-\d{2}$/.test(result.foundOn)||!Number.isFinite(Date.parse(result.foundOn))||new Date(result.foundOn).toISOString().slice(0,10)!==result.foundOn))fail('INVALID_FIELDS',422);
 return result;
}

export class NarrativeInbox {
 constructor(file,{now=()=>Date.now(),maxReports=10000}={}){
  if(file!==':memory:'){if(!path.isAbsolute(file))throw Error('PRIVATE_INBOX_PATH_REQUIRED');fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});}
  this.now=now;this.maxReports=maxReports;this.db=new DatabaseSync(file);if(file!==':memory:')fs.chmodSync(file,0o600);
  this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS narrative_reports (id TEXT PRIMARY KEY, payload_hash TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL, notified_at TEXT, attempts INTEGER NOT NULL DEFAULT 0, retry_at INTEGER NOT NULL DEFAULT 0);');
 }
 accept(input){
  const report=validateReport(input),digest=hash(JSON.stringify(report)),prior=this.db.prepare('SELECT payload_hash FROM narrative_reports WHERE id=?').get(report.requestId);
  if(prior){if(prior.payload_hash!==digest)fail('REQUEST_CONFLICT',409);return {id:report.requestId,duplicate:true};}
  if(this.db.prepare('SELECT COUNT(*) AS n FROM narrative_reports').get().n>=this.maxReports)fail('INBOX_UNAVAILABLE',503);
  const createdAt=new Date(this.now()).toISOString();
  this.db.prepare('INSERT INTO narrative_reports (id,payload_hash,body,created_at) VALUES (?,?,?,?)').run(report.requestId,digest,JSON.stringify(report),createdAt);
  return {id:report.requestId,duplicate:false};
 }
 get(id){const row=this.db.prepare('SELECT * FROM narrative_reports WHERE id=?').get(id);return row?{...row,body:JSON.parse(row.body)}:null;}
 pending(){return this.db.prepare('SELECT * FROM narrative_reports WHERE notified_at IS NULL AND retry_at<=? ORDER BY created_at LIMIT 10').all(this.now()).map(row=>({...row,body:JSON.parse(row.body)}));}
 all(){return this.db.prepare('SELECT * FROM narrative_reports ORDER BY created_at').all().map(row=>({...row,body:JSON.parse(row.body)}));}
 close(){this.db.close();}
}

export function notificationFor(row){
 const r=row.body;
 const full=['Narrativmeldung zur redaktionellen Prüfung','ID: '+row.id,'Eingang: '+row.created_at,'Status: ungeprüfter Nutzerhinweis, keine Freigabe','', 'Begriff / Narrativ:',r.term,'','Beobachteter Wortlaut:',r.wording,'','Fundstelle:',r.source,'','Genannte Person / Organisation:',r.speaker||'Nicht angegeben','','Datum der Fundstelle:',r.foundOn||'Nicht angegeben','','Kontext / Hinweis:',r.context||'Nicht angegeben'].join('\n');
 const clean=v=>v.replace(/[\r\n]+/g,' ').replace(/([*_~`|\\<>])/g,'\\$1').replace(/https?:\/\//g,'https ://');
 const short=(v,n)=>v.length>n?v.slice(0,n-1)+'…':v;
 return {id:hash('lexikon-narrativ:'+row.id).slice(0,24),content:`Neue anonyme Narrativmeldung\n${short(clean(r.term),180)}\n\nWortlaut: ${short(clean(r.wording),650)}\nFundstelle: ${short(clean(r.source),450)}\n\nUngeprüfter Hinweis. Keine automatische Veröffentlichung.\nID: ${row.id}\nDie vollständigen Angaben stehen in der beigefügten Textdatei.`,suppressEmbeds:true,attachment:{filename:'narrativ-'+row.id+'.txt',content:full}};
}

export function createNarrativeHandler({inbox,discord,origins=ORIGINS,fetchImpl=fetch,now=()=>Date.now(),limit=10,interval=3600000,peer=req=>{
 const socket=req.socket.remoteAddress||'';const forwarded=String(req.headers['x-forwarded-for']||'').split(',').at(-1).trim();return ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(socket)&&isIP(forwarded)?forwarded:socket;
}}){
 if(!discord?.token||!/^\d{15,22}$/.test(discord.recipient||''))throw Error('EXISTING_DISCORD_CONFIGURATION_REQUIRED');
 const buckets=new Map(),salt=randomBytes(32);let pendingFlush=null,closing=false;
 const rate=req=>{
  const at=now();for(const[k,v]of buckets)if(v.until<=at)buckets.delete(k);
  const key=hash(Buffer.concat([salt,Buffer.from(peer(req))])),bucket=buckets.get(key)||{n:0,until:at+interval};
  if(bucket.n>=limit)fail('TOO_MANY_REPORTS',429);if(!buckets.has(key)&&buckets.size>=10000)fail('INBOX_UNAVAILABLE',503);bucket.n++;buckets.set(key,bucket);
 };
 const flush=()=>{
  if(pendingFlush)return pendingFlush;if(closing)return Promise.resolve();
  pendingFlush=(async()=>{for(const row of inbox.pending()){
   if(closing)break;
   try{await sendDiscord(notificationFor(row),{...discord,fetchImpl});inbox.db.prepare('UPDATE narrative_reports SET notified_at=?,attempts=attempts+1 WHERE id=?').run(new Date(now()).toISOString(),row.id);}
   catch{const delay=Math.min(3600000,30000*2**Math.min(row.attempts,7));inbox.db.prepare('UPDATE narrative_reports SET attempts=attempts+1,retry_at=? WHERE id=?').run(now()+delay,row.id);}
  }})().finally(()=>{pendingFlush=null;});return pendingFlush;
 };
 const handle=async(req,res)=>{
  const url=new URL(req.url,'http://localhost');if(url.pathname!==REPORT_PATH)return false;
  const respond=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(JSON.stringify(data));};
  try{
   const origin=req.headers.origin;res.setHeader('Vary','Origin');if(!origins.includes(origin))fail('ORIGIN_NOT_ALLOWED',403);
   res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');
   if(req.method==='OPTIONS'){res.writeHead(204);res.end();return true;}
   if(req.method!=='POST')fail('METHOD_NOT_ALLOWED',405);
   if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))fail('JSON_REQUIRED',415);
   if(Number(req.headers['content-length']||0)>65536)fail('REPORT_TOO_LARGE',413);
   rate(req);const chunks=[];let size=0;for await(const part of req){size+=part.length;if(size>65536)fail('REPORT_TOO_LARGE',413);chunks.push(part);}
   let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{fail('INVALID_JSON',400);}
   const result=inbox.accept(input);respond(202,{ok:true,id:result.id});void flush();
  }catch(error){const status=error.status||503;if(status===429)res.setHeader('Retry-After',String(Math.ceil(interval/1000)));respond(status,{ok:false,error:error.status?error.message:'INBOX_UNAVAILABLE'});}
  return true;
 };
 return {handle,flush,close:async()=>{closing=true;await pendingFlush;buckets.clear();}};
}
