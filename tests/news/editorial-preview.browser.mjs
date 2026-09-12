// Local-only API fixture: no Discord session or production endpoint is used.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';

const root=fileURLToPath(new URL('../../',import.meta.url));
const run=promisify(execFile),session='woek-editorial-preview-test';
const cli=async(...args)=>(await run('agent-browser',['--session',session,...args],{timeout:30000})).stdout.trim();
const evaluate=async code=>{
 const value=JSON.parse(await cli('eval',code,'--json'));
 const result=value.data?.result ?? value.result;
 return typeof result==='string'?JSON.parse(result):result;
};
const fixture=`
localStorage.setItem('woek_community_auth','LOCAL_TEST_ONLY');
const nativeFetch=window.fetch;
window.previewMode='error';window.apiCalls=0;
const request={job_id:'wt_20260911T183100Z_8c537e227d530014ebd9cb48',kind:'watched',title:'Testsendung',brief:'Testauftrag',created_at:'2026-09-11T18:31:00Z',status:'quarantined',ack_status:'staged',preview_available:true};
window.fetch=async(url,options)=>{
 if(!String(url).startsWith('https://130.162.217.58.sslip.io/api/admin/news-editorial'))return nativeFetch(url,options);
 window.apiCalls++;
 if(String(url).endsWith('/requests'))return Response.json({requests:[request]});
 if(String(url).endsWith('/reviews'))return Response.json({reviews:[]});
 if(String(url).endsWith('/preview')){
  if(window.previewMode==='error')return Response.json({error:'Die Vorschau konnte nicht geladen werden.'},{status:503});
  if(window.previewMode==='delayed')await new Promise(resolve=>window.resolvePreview=resolve);
  return Response.json({text:'Erster Absatz.\\n\\nZweiter Absatz. <img src=x onerror=window.unsafe=true>'});
 }
 throw Error('Unexpected fixture endpoint');
};
const interval=window.setInterval;
window.setInterval=(fn,ms)=>ms===60000?(window.refreshFixture=fn,1):interval(fn,ms);
`;
const server=http.createServer(async(req,res)=>{
 try{
  let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(name.endsWith('/'))name+='index.html';
  const file=path.resolve(root,'.'+name);if(!file.startsWith(root))throw Error('path');
  let body=await fs.readFile(file);
  if(name==='/admin/redaktion/index.html')body=Buffer.from(body.toString().replace('<script src="./redaktion.js"',`<script>${fixture}</script><script src="./redaktion.js"`));
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
  res.end(body);
 }catch{res.statusCode=404;res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 await cli('set','viewport','390','844');
 await cli('open',`http://127.0.0.1:${server.address().port}/admin/redaktion/`);
 try{await cli('wait','#workspace:not([hidden])');}catch(e){console.log(await cli('errors'));console.log(await cli('snapshot','-i'));throw e;}
 await cli('click','#tab-list');
 assert.match(await cli('get','text','#request-list'),/Bearbeitung blockiert/);
 assert.doesNotMatch(await cli('get','text','#request-list'),/Privater Entwurf bereit/);
 await cli('click','[data-preview-job]');
 await cli('wait','#request-preview [role="alert"]');
 assert.equal(await evaluate(`JSON.stringify({shown:!document.getElementById('request-preview').hidden,focus:document.activeElement.tagName})`).then(x=>x.shown),true);
 await cli('eval',`window.previewMode='ready'`);
 await cli('click','#request-preview .secondary');
 await cli('wait','.private-preview-text');
 const text=await evaluate(`JSON.stringify({text:document.querySelector('.private-preview-text').textContent,whiteSpace:getComputedStyle(document.querySelector('.private-preview-text')).whiteSpace,unsafe:Boolean(window.unsafe),overflow:document.documentElement.scrollWidth>innerWidth})`);
 assert.match(text.text,/Erster Absatz\.\n\nZweiter/);assert.equal(text.whiteSpace,'pre-wrap');assert.equal(text.unsafe,false);assert.equal(text.overflow,false);
 await cli('eval','window.refreshFixture()');
 await cli('wait','.private-preview-text');
 assert.equal(await evaluate(`JSON.stringify(document.getElementById('request-preview').hidden)`),false);
 await cli('screenshot','/tmp/woek-editorial-preview-mobile.png');
 await cli('click','#request-preview .text-button');
 await cli('eval',`window.previewMode='delayed'`);
 await cli('click','[data-preview-job]');
 await cli('wait','#request-preview[aria-busy="true"]');
 await cli('click','#tab-new');
 await cli('eval','window.resolvePreview()');
 assert.equal(await evaluate(`JSON.stringify(document.getElementById('request-preview').hidden)`),true);
 console.log('PASS: truthful status, visible error/retry, readable safe text, poll persistence, stale response ignored, mobile layout.');
}finally{await cli('close').catch(()=>{});server.close();}
