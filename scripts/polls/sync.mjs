import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePoll } from '../../ops/polls/backend/store.mjs';
import { renderPollFiles,writePollFiles } from './build.mjs';

export function sanitizeCatalog(payload,previous={polls:[],retired_slugs:[]}){
  if(payload?.ok!==true||payload.schema_version!==1||!Array.isArray(payload.polls)||payload.polls.length>10000)throw new Error('Invalid Oracle catalog; existing pages remain unchanged.');
  const polls=payload.polls.map(p=>{
    const valid=validatePoll(p);
    if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(p.id)||!Number.isSafeInteger(p.revision)||p.revision<1||![p.published_at,p.created_at,p.updated_at].every(value=>typeof value==='string'&&Number.isFinite(Date.parse(value)))||p.status==='draft')throw new Error('Invalid public poll identity.');
    if(valid.options.some((o,i)=>o.id!==p.options[i].id))throw new Error('Invalid public option identity.');
    return {...valid,id:p.id,published_at:p.published_at,created_at:p.created_at,updated_at:p.updated_at,revision:p.revision,effective_status:p.effective_status};
  });
  if(new Set(polls.map(p=>p.slug)).size!==polls.length)throw new Error('Duplicate poll slugs.');
  const current=new Set(polls.map(p=>p.slug));
  const retired_slugs=[...new Set([...(previous.retired_slugs||[]),...(previous.polls||[]).filter(p=>!current.has(p.slug)).map(p=>p.slug)])].sort();
  if(retired_slugs.some(s=>!/^\w+(?:-\w+)*$/.test(s)||current.has(s)))throw new Error('Retired slug cannot be reused.');
  return {schema_version:1,polls,retired_slugs};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const root=process.cwd(),target=path.join(root,'content/polls/public-catalog.json');
  const previous=fs.existsSync(target)?JSON.parse(fs.readFileSync(target,'utf8')):{polls:[],retired_slugs:[]};
  const url=process.env.POLLS_PUBLIC_EXPORT_URL||'https://130.162.217.58.sslip.io/api/polls/export';
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`Oracle poll export unavailable (${response.status}); keeping the last public catalog.`);
  const text=await response.text();if(text.length>12_000_000)throw new Error('Poll export exceeds safety limit.');
  const next=sanitizeCatalog(JSON.parse(text),previous),serialized=`${JSON.stringify(next,null,2)}\n`;
  const changed=!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==serialized;
  if(changed){const files=renderPollFiles(root,next);files.set('content/polls/public-catalog.json',serialized);writePollFiles(root,files);}
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`changed=${changed}\n`);
  console.log(changed?'Public survey metadata and pages updated.':'No survey publication changes.');
}
