import { EDITORIAL_DECISION_BODY_LIMIT, COMMENT_TOO_LONG_MESSAGE } from '../../../admin/redaktion/feedback-limits.js';
import { hash } from './contract.mjs';
import { INTAKE_FILE_LIMIT } from './intake.mjs';

const ORIGINS=['https://wirkungsoekonomie.de','https://www.wirkungsoekonomie.de'];
const BASE='/api/admin/news-editorial';
const MESSAGES={EDITORIAL_COMMENT_TOO_LONG:COMMENT_TOO_LONG_MESSAGE,EDITORIAL_COMMENT_REQUIRED:'Bitte schreibe dazu, was geändert werden soll.',INTAKE_QUEUE_FULL:'Die Redaktion bearbeitet gerade die maximale Zahl offener Aufträge. Bitte später erneut absenden.',INTAKE_ATTACHMENTS_PENDING:'Ein Screenshot fehlt noch. Bitte die Übertragung erneut starten.',INTAKE_ALREADY_SUBMITTED:'Dieser Auftrag wurde bereits abgesendet.',INTAKE_IDEMPOTENCY_CONFLICT:'Der bereits gespeicherte Auftrag hat einen anderen Inhalt.',BRIDGE_RUN_LOCKED:'Die Recherche ist gerade aktiv. Dein Entwurf bleibt gespeichert; bitte in Kürze erneut absenden.',INTAKE_NOT_FOUND:'Dieser Auftrag wurde nicht gefunden.',INTAKE_PREVIEW_PENDING:'Der private Entwurf ist noch nicht fertig.',INTAKE_DRAFT_LIMIT:'Es liegen bereits zu viele unvollständige Entwürfe vor. Bitte die Redaktion prüfen lassen.'};
const fail=(message,status)=>{throw Object.assign(Error(message),{status});};
export function existingAdminAuthorizer({fetchImpl=fetch}={}){
  const cache=new Map();
  return async request=>{
    const header=request.headers.authorization||'';
    if(!/^Bearer [A-Za-z0-9_.-]{30,8000}$/.test(header))return null;
    const key=hash(header),cached=cache.get(key);
    if(cached&&cached.until>Date.now())return cached.owner;
    // Delegate signature, expiry, membership and CURRENT admin permissions to
    // the existing administration service. Its response body is never exposed.
    const response=await fetchImpl('http://127.0.0.1:8787/api/admin/polls',{headers:{Authorization:header},redirect:'error',signal:AbortSignal.timeout(12000)});
    await response.body?.cancel();
    if(response.status===401||response.status===403)return null;
    if(response.status!==200)fail('Die Anmeldung kann gerade nicht geprüft werden.',503);
    let identity;try{identity=JSON.parse(Buffer.from(header.slice(7).split('.')[0],'base64url'));}catch{return null;}
    if(!/^\d{15,22}$/.test(identity.sub||'')||identity.exp<=Date.now())return null;
    if(cache.size>128)cache.clear();cache.set(key,{owner:identity.sub,until:Math.min(identity.exp,Date.now()+30000)});
    return identity.sub;
  };
}
async function readBody(request,limit,json=true){
  let size=0;const chunks=[];
  for await(const part of request){size+=part.length;if(size>limit)fail('Die Datei oder der Auftrag ist zu groß.',413);chunks.push(part);}
  const bytes=Buffer.concat(chunks);
  if(!json)return bytes;
  if(!/^application\/json(?:;|$)/i.test(request.headers['content-type']||''))fail('JSON-Daten erwartet.',415);
  try{return JSON.parse(bytes);}catch{fail('Die Auftragsdaten konnten nicht gelesen werden.',400);}
}
export function createEditorialIntakeHandler({intake,approval,authorize=existingAdminAuthorizer(),origins=ORIGINS}){
  const attempts=new Map();
  let preparing=false;
  const prepare=async()=>{if(preparing)return;preparing=true;try{await intake.preparePending();}catch(error){if(error.message!=='BRIDGE_RUN_LOCKED')console.error('INTAKE_PREPARATION_UNAVAILABLE');}finally{preparing=false;}};
  const timer=setInterval(prepare,30000);timer.unref();
  const handle=async(request,response)=>{
    const url=new URL(request.url,'http://localhost');if(!url.pathname.startsWith(BASE))return false;
    const respond=(status,data)=>{response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});response.end(JSON.stringify(data));};
    try{
      const origin=request.headers.origin;response.setHeader('Vary','Origin');
      if(origin&&!origins.includes(origin))fail('Diese Herkunft ist nicht erlaubt.',403);
      if(origin)response.setHeader('Access-Control-Allow-Origin',origin);
      response.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS');
      response.setHeader('Access-Control-Allow-Headers','Authorization,Content-Type');
      if(request.method==='OPTIONS'){response.writeHead(204);response.end();return true;}
      if(request.method!=='GET'&&!origins.includes(origin))fail('Die Herkunft des Auftrags muss bestätigt sein.',403);
      const owner=await authorize(request);if(!owner)fail('Bitte mit Deinem berechtigten WÖk-Discord-Konto anmelden.',403);
      const now=Date.now(),rate=attempts.get(owner)||{at:now,count:0};
      if(now-rate.at>60000){rate.at=now;rate.count=0;}if(++rate.count>60)fail('Bitte kurz warten und erneut versuchen.',429);
      if(attempts.size>256)attempts.clear();attempts.set(owner,rate);
      const route=url.pathname.slice(BASE.length);
      if(request.method==='GET'&&route==='/reviews'){respond(200,{reviews:approval.list(owner).map(({preview,...r})=>({...r,title:preview.title,format:preview.format}))});return true;}
      let reviewMatch=route.match(/^\/reviews\/(wt_\d{8}T\d{6}Z_[a-f0-9]{24})(?:\/(decision))?$/);
      if(reviewMatch&&request.method==='GET'&&!reviewMatch[2]){respond(200,approval.preview(owner,reviewMatch[1]));return true;}
      if(reviewMatch&&request.method==='POST'&&reviewMatch[2]){respond(200,approval.decide(owner,reviewMatch[1],await readBody(request,EDITORIAL_DECISION_BODY_LIMIT)));return true;}
      if(request.method==='GET'&&route==='/requests'){respond(200,{requests:intake.list(owner)});return true;}
      if(request.method==='POST'&&route==='/drafts'){const draft=intake.draft(owner,await readBody(request,100000));respond(201,{id:draft.id});return true;}
      let match=route.match(/^\/drafts\/([a-f0-9-]{36})\/attachments\/([0-3])$/);
      if(request.method==='PUT'&&match){intake.upload(owner,match[1],Number(match[2]),await readBody(request,INTAKE_FILE_LIMIT,false),request.headers['content-type']);respond(200,{ok:true});return true;}
      match=route.match(/^\/drafts\/([a-f0-9-]{36})\/submit$/);
      if(request.method==='POST'&&match){await readBody(request,1000);const result=await intake.submit(owner,match[1]);respond(202,result);void prepare();return true;}
      match=route.match(/^\/requests\/(wt_\d{8}T\d{6}Z_[a-f0-9]{24})\/preview$/);
      if(request.method==='GET'&&match){respond(200,intake.preview(owner,match[1]));return true;}
      fail('Diese Aktion wurde nicht gefunden.',404);
    }catch(error){const status=error.status||(error.message==='BRIDGE_RUN_LOCKED'?409:400);respond(status,{error:MESSAGES[error.message]||(error.status&&!/^INTAKE_/.test(error.message)?error.message:'Der Auftrag konnte nicht übernommen werden. Bitte Angaben und Dateien prüfen.')});}
    return true;
  };
  handle.close=()=>clearInterval(timer);return handle;
}
