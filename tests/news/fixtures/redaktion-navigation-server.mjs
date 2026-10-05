// Optional local browser fixture. Only synthetic data; never forwards API calls.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const fixture=`
localStorage.setItem('woek_community_auth','LOCAL_TEST_ONLY');
const nativeFetch=window.fetch;
let mode='ready',release;
const review={job_id:'fixture',status:'AWAITING_FINAL_APPROVAL',title:'Lokaler Testentwurf – keine Veröffentlichung',format:'opinion_analysis',revision:1,preview_hash:'fixture'};
window.fetch=async(url,options={})=>{
 if(!String(url).startsWith('https://130.162.217.58.sslip.io/api/admin/news-editorial'))return nativeFetch(url,options);
 if(options.method&&options.method!=='GET')return Response.json({error:'Testumgebung: keine Entscheidungen oder Aufträge'},{status:403});
 if(mode==='timeout')throw new DOMException('signal timed out','TimeoutError');
 if(String(url).endsWith('/requests'))return Response.json({requests:[]});
 if(String(url).endsWith('/reviews'))return Response.json({reviews:[review]});
 if(String(url).endsWith('/reviews/fixture')){
  if(mode==='delayed')await new Promise(resolve=>release=resolve);
  if(mode==='error')return Response.json({error:'Lokaler Test: Server nicht erreichbar.'},{status:503});
  return Response.json({...review,preview:{title:review.title,format:review.format,sources:[]},html:'<h2>Vollständiger Testentwurf</h2><p>Nur synthetischer Text für die Navigationsprüfung.</p>'});
 }
 return Response.json({error:'Keine Testdaten für diesen Weg'},{status:404});
};
document.addEventListener('DOMContentLoaded',()=>{
 const box=document.createElement('aside');box.setAttribute('aria-label','Nur lokale Teststeuerung');box.style='padding:12px;background:#eee;position:relative;z-index:2';
 for(const value of ['ready','error','delayed','timeout','release']){const button=document.createElement('button');button.textContent='Test: '+value;button.onclick=()=>{if(value==='release')release?.();else mode=value;};box.append(button);}
 document.body.prepend(box);
});
`;
const server=http.createServer(async(req,res)=>{
 try{
  let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.endsWith('/'))name+='index.html';
  const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))throw Error('path');
  // Do not install a service worker for a synthetic test session.
  if(name.endsWith('/sw.js')){res.writeHead(404);res.end();return;}
  let body=await fs.readFile(file);
  if(name==='/admin/redaktion/index.html')body=Buffer.from(body.toString().replace('<script src="./redaktion.js"', '<script>'+fixture+'</script><script src="./redaktion.js"'));
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(0,'127.0.0.1',()=>console.log('LOCAL FIXTURE http://127.0.0.1:'+server.address().port+'/admin/redaktion/'));
