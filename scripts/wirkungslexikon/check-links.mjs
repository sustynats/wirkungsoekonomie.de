import fs from 'node:fs';
import path from 'node:path';
import {ROOT,loadModel} from './model.mjs';
const {data}=loadModel();const all=new Map();
for(const e of data.entries)for(const q of [...e.quellen,...e.wissenschaftliche_quellen]){if(!all.has(q.url))all.set(q.url,{url:q.url,title:q.title,roles:new Set(),cards:new Set()});const x=all.get(q.url);x.roles.add(q.role);x.cards.add(e.slug);}
const queue=[...all.values()],results=[];
async function worker(){while(queue.length){const q=queue.shift();let response;let error=null;const start=Date.now();try{response=await fetch(q.url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(15000),headers:{'User-Agent':'WOeK-Wirkungslexikon-Linkcheck/1.0'}});if([403,405].includes(response.status))response=await fetch(q.url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(15000),headers:{'Range':'bytes=0-2047','User-Agent':'Mozilla/5.0 (compatible; WOeK-Linkcheck/1.0)'}});await response.body?.cancel();}catch(e){error=e.cause?.code||e.message;}
results.push({url:q.url,title:q.title,roles:[...q.roles],cards:[...q.cards],httpStatus:response?.status||null,finalUrl:response?.url||null,status:error?'UNVERIFIED_NETWORK':response.ok?'REACHABLE':response.status===403||response.status===429?'UNVERIFIED_ACCESS_RESTRICTED':'RECHECK_REQUIRED',error,durationMs:Date.now()-start,checkedAt:new Date().toISOString()});}}
await Promise.all(Array.from({length:8},worker));results.sort((a,b)=>a.url.localeCompare(b.url));
fs.writeFileSync(path.join(ROOT,'outputs/wirkungslexikon/source-links.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results.reduce((m,r)=>(m[r.status]=(m[r.status]||0)+1,m),{})));console.log('Unique sources: '+results.length);
