import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {ROOT, atomic, read, loadModel} from './model.mjs';
import {saveEntry} from './editorial.mjs';
import {build} from './build.mjs';
const base=path.join(ROOT,'outputs/wirkungslexikon');
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
   if(u.pathname==='/api/wirkungslexikon/editorial'){
    if(req.method==='GET'){const model=loadModel();const entry=model.data.entries.find(e=>e.slug===u.searchParams.get('slug'));return json(entry?200:404,{entry,revision:model.editorial.revision,actor:access.name});}
    if(req.method==='POST'){
     if(saving)return json(409,{error:'Speicherung läuft; bitte erneut versuchen'});saving=true;
     try{const result=saveEntry(await body(),access);build();build({mode:'public'});return json(200,result);}finally{saving=false;}
    }
   }
   if(u.pathname==='/api/wirkungslexikon/reports'){
    const f=path.join(base,'private-reports.json');const reports=fs.existsSync(f)?read(f):[];
    if(req.method==='GET')return json(200,reports);
    if(req.method==='POST'){
     const last=limits.get(access.username)||0;if(Date.now()-last<5000)return json(429,{error:'Bitte kurz warten'});
     const b=await body();if(!loadModel().data.entries.some(e=>e.slug===b.slug)||typeof b.art!=='string'||!b.art.trim()||typeof b.text!=='string'||!b.text.trim()||b.text.length>10000) return json(400,{error:'Art und Beschreibung erforderlich'});
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
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Nicht gefunden');return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  if(req.method==='HEAD'){res.writeHead(200);res.end();return;}
  // Public artifact simulation remains protected by this same authentication gate.
  if(publicSimulation&&path.extname(file)==='.html'){let html=fs.readFileSync(file,'utf8');html=html.replace(/(href|src|action)="\/(?!\/)/g,'$1="/public/');res.end(html);return;}
  fs.createReadStream(file).pipe(res);
 }catch(error){json(error.message.includes('REVISION_CONFLICT')?409:400,{error:error.message});}
});
server.listen(Number(process.env.WL_PORT||8796),'127.0.0.1',()=>console.log('Geschützte Vorschau: http://127.0.0.1:'+server.address().port+'/wirkungslexikon/ · Zugangsdaten nur in outputs/wirkungslexikon/access.json'));
