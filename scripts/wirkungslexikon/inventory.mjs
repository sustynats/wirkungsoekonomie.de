// The public ledger contains opaque keys and totals, never private candidate text.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {ROOT,CONTENT,read,atomic,sha} from './model.mjs';
export const normalizeInventoryTerm=s=>String(s).normalize('NFKC').toLocaleLowerCase('de').replaceAll('ß','ss').replace(/[„“”"'’‘«»]/g,'').replace(/[‐‑–—-]/g,' ').replace(/\s+/g,' ').trim();
const digest=value=>sha(JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v));
const defaultBase=()=>path.resolve(process.env.WL_V9_BASE||path.join(ROOT,'outputs/wirkungslexikon/v9'));
function values(base,folder){const p=path.join(base,folder,'store.json');if(!fs.existsSync(p))return null;const index=read(p);return {index,objects:Object.values(index.objects).map(o=>{const v=read(path.join(base,folder,'snapshots',o.draftHash+'.json'));if(digest(v)!==o.draftHash)throw Error('INVENTORY_SNAPSHOT_MISMATCH');return {o,v};})};}
export function collectPrivateInventory(base=defaultBase()){
 const mainFile=path.join(base,'store.json'),fresh=values(base,'research_candidates'),prior=values(base,'editorial_narrative_candidates');
 if(!fs.existsSync(mainFile)||!fresh||!prior)return null;
 const main=read(mainFile),cards=Object.values(main.objects).filter(o=>o.type==='wirkungskarte').map(o=>{const v=read(path.join(base,'snapshots',o.draftHash+'.json'));if(digest(v)!==o.draftHash)throw Error('INVENTORY_CARD_SNAPSHOT_MISMATCH');return {o,v};});
 const archive=fresh.index.archive;if(!archive||!fs.existsSync(archive))throw Error('INVENTORY_SOURCE_ARCHIVE_REQUIRED');
 const archiveSha256=sha(fs.readFileSync(archive));if(archiveSha256!==fresh.index.archiveSha256)throw Error('INVENTORY_SOURCE_HASH_MISMATCH');
 const keyFile=path.join(base,'inventory-key.json');if(!fs.existsSync(keyFile))atomic(keyFile,{key:crypto.randomBytes(32).toString('base64url')});
 const secret=read(keyFile).key;if(typeof secret!=='string'||secret.length<40)throw Error('INVENTORY_KEY_REQUIRED');
 const token=id=>crypto.createHmac('sha256',secret).update(id).digest('hex');
 const cardNames=new Map(cards.flatMap(({o,v})=>[v.begriff,v.lemma_kurz].filter(Boolean).map(n=>[normalizeInventoryTerm(n),'card:'+o.id])));
 const allCandidates=[...fresh.objects,...prior.objects].filter(x=>x.o.type==='candidate');
 const candidatesById=new Map(allCandidates.map(x=>[x.o.id,x]));
 const candidateKey=({o,v},trail=new Set())=>{
  if(trail.has(o.id))throw Error('INVENTORY_ALIAS_CYCLE');const next=new Set(trail).add(o.id);
  const explicit=v.identischer_vorarbeitskandidat||[];
  if(explicit.length){if(explicit.length!==1||!candidatesById.has(explicit[0]))throw Error('INVENTORY_ALIAS_TARGET');return candidateKey(candidatesById.get(explicit[0]),next);}
  const existing=(v.identische_lemma_im_v3||[]).map(x=>typeof x==='string'?x:x.id);
  if(existing.length){if(existing.length!==1||!main.objects[existing[0]]||main.objects[existing[0]].type!=='wirkungskarte')throw Error('INVENTORY_CARD_ALIAS_TARGET');return 'card:'+existing[0];}
  return cardNames.get(normalizeInventoryTerm(v.lemma))||'candidate:'+normalizeInventoryTerm(v.lemma);
 };
 const ledger={originalCards:cards.map(({o})=>token('card:'+o.id)),newCandidates:fresh.objects.filter(x=>x.o.type==='candidate').map(x=>token(candidateKey(x))),priorCandidates:prior.objects.filter(x=>x.o.type==='candidate').map(x=>token(candidateKey(x)))};
 const excluded={watchlist:fresh.objects.filter(x=>x.o.type==='watch').length,narrativeFamilies:Object.values(main.objects).filter(o=>o.type==='narrativfamilie').length,programmeDossiers:Object.values(main.objects).filter(o=>o.type==='programm_narrativ_dossier').length};
 const asOf=[...fresh.index.events,...prior.index.events].map(e=>e.date?.slice(0,10)).filter(Boolean).sort().at(-1)||'2026-10-16';
 return {version:2,algorithm:'opaque-concept-union-v1',asOf,source:path.basename(archive),sourceSha256:archiveSha256,privateRegistrySha256:digest([fresh.index.objects,prior.index.objects]),ledger,excluded,semantics:'Erfasste Begriffe und Analyseansätze sind die Vereinigung von Karten- und Kandidatenidentitäten. Suchansätze, Quellen, Ketten, Narrativfamilien und Dossiers zählen nicht mit. Keine Kandidatenfreigabe; keine Kandidatentexte im öffentlichen Register.'};
}
export function deriveInventory(ledger){
 if(ledger?.version!==2||ledger.algorithm!=='opaque-concept-union-v1'||!/^[a-f0-9]{64}$/.test(ledger.sourceSha256||''))throw Error('INVENTORY_LEDGER_INVALID');
 for(const key of ['originalCards','newCandidates','priorCandidates'])if(!Array.isArray(ledger.ledger?.[key])||ledger.ledger[key].some(v=>!/^[a-f0-9]{64}$/.test(v)))throw Error('INVENTORY_KEYS_INVALID');
 for(const n of Object.values(ledger.excluded||{}))if(!Number.isSafeInteger(n)||n<0)throw Error('INVENTORY_EXCLUSION_INVALID');
 const original=new Set(ledger.ledger.originalCards),fresh=new Set(ledger.ledger.newCandidates),prior=new Set(ledger.ledger.priorCandidates),candidates=new Set([...fresh,...prior].filter(k=>!original.has(k)));
 if(original.size!==ledger.ledger.originalCards.length)throw Error('INVENTORY_DUPLICATE_CARD_ID');
 return {asOf:ledger.asOf,originalCards:original.size,newCandidates:ledger.ledger.newCandidates.length,priorCandidates:ledger.ledger.priorCandidates.length,overlap:[...fresh].filter(k=>prior.has(k)).length,uniqueCandidates:candidates.size,totalDistinct:new Set([...original,...candidates]).size,watchlistExcluded:ledger.excluded.watchlist,narrativeFamiliesExcluded:ledger.excluded.narrativeFamilies,programmeDossiersExcluded:ledger.excluded.programmeDossiers};
}
export function inventoryCounts({base=defaultBase(),file=path.join(CONTENT,'bestandszahlen.json'),sync=true}={}){
 const live=sync?collectPrivateInventory(base):null;
 if(live){const derived=deriveInventory(live),next={...live,...derived};if(!fs.existsSync(file)||digest(read(file))!==digest(next))atomic(file,next);return derived;}
 const recorded=read(file),derived=deriveInventory(recorded);
 for(const [key,n]of Object.entries(derived))if(recorded[key]!==n)throw Error('INVENTORY_AGGREGATE_MISMATCH:'+key);
 return derived;
}
