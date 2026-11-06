import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {read,atomic,sha} from './model.mjs';
import {V9,loadStore,digest} from './v9-store.mjs';
import {researchIndex,researchValue,saveResearch,addResearch} from './research-register.mjs';
import {supplementIndex,supplementValue,saveSupplement} from './narrative-supplement.mjs';
import {V11_FIELD,validateV11} from './v11-content.mjs';

const stores=['research_candidates','editorial_narrative_candidates'];
const principal={role:'editor',subject:'codex-v11-technical-integration'};
const reason='V11: versionierte Leserfassung, getrennte Quellenrollen und konkrete offene Einzelbehauptungen; keine Freigabe.';
const bytes=file=>sha(fs.readFileSync(file));
function assertManifest(source){
 const manifest=read(path.join(source,'SHA256_MANIFEST.json'));
 if(manifest.dateien.length!==9)throw Error('V11_MANIFEST_COUNT');
 for(const row of manifest.dateien){const file=path.resolve(source,row.datei);if(!file.startsWith(path.resolve(source)+path.sep)||fs.lstatSync(file).isSymbolicLink()||fs.statSync(file).size!==row.bytes||bytes(file)!==row.sha256)throw Error('V11_MANIFEST_MISMATCH:'+row.datei);}
}
export function planV11({source,audit,archive,base=V9}){
 assertManifest(source);
 const input=read(path.join(source,'KARTEN_ERGAENZUNG_94.json')),checks=read(audit),sources=read(path.join(source,'QUELLENREGISTER.json')).quellen;
 const main=loadStore(base),indexes={research_candidates:researchIndex(base),editorial_narrative_candidates:supplementIndex(base)};
 const packageHash=bytes(archive),auditHash=bytes(audit),receiptFile=path.join(base,'v11-intake-receipt.json');
 if(checks.packageSha256!==packageHash||checks.actor_type!=='assistant')throw Error('V11_AUDIT_PROVENANCE_REQUIRED');
 if(input.items.length!==94||sources.length!==87||new Set(input.items.map(x=>x.key)).size!==94||new Set(input.items.flatMap(x=>x.origin_ids)).size!==95)throw Error('V11_COUNTS_MISMATCH');
 if(input.items.filter(x=>x.zieltyp==='WORTKARTE').length!==74||input.items.filter(x=>x.zieltyp!=='WORTKARTE').length!==20)throw Error('V11_TYPES_MISMATCH');
 if(fs.existsSync(receiptFile)){
  const prior=read(receiptFile);
  if(prior.packageSha256===packageHash&&prior.auditSha256===auditHash&&prior.revisions.every(r=>indexes[r.folder].objects[r.id]?.draftHash===r.revision)&&prior.sources.every(r=>indexes.research_candidates.objects[r.id]?.draftHash===r.revision)&&prior.aliases.every(r=>indexes[r.folder].objects[r.id]?.draftHash===r.revision))return {alreadyApplied:true,receipt:prior};
  throw Error('V11_NEW_REVISION_REQUIRES_REBASE');
 }
 const allSources=[...sources,...(checks.additionalSources||[])].map(q=>({...q,...checks.sourcePatches?.[q.id]}));
 if(new Set(allSources.map(q=>q.id)).size!==allSources.length)throw Error('V11_DUPLICATE_SOURCE_ID');
 const sourceIds=new Set([...Object.values(indexes.research_candidates.objects).filter(o=>o.type==='source').map(o=>o.id),...allSources.map(q=>q.id)]);
 const sourceById=Object.fromEntries(allSources.map(q=>[q.id,q]));
 const slugs=new Set(),origins=new Set(),entries=[];
 const existingSlugs=new Set(Object.values(main.objects).map(o=>o.slug).filter(Boolean));
 for(const item of input.items){
  const object=indexes[item.target_store]?.objects[item.key];
  if(!object||object.type!=='candidate'||object.draftHash!==item.expected_draft_hash)throw Error('V11_REVISION_CONFLICT:'+item.key);
  if(item.v3_master_sha256!==main.v3Sha256)throw Error('V11_MASTER_MISMATCH');
  const original=item.target_store==='research_candidates'?researchValue(object,base):supplementValue(object,base);
  const check=checks.items[item.key];if(!check)throw Error('V11_MISSING_CASE_AUDIT:'+item.key);
  const value={...structuredClone(item.unterlagentext),...structuredClone(check.contentPatch||{})};
  const m={id:item.key,origin_ids:item.origin_ids,slug:item.proposed_slug,zieltyp:item.zieltyp,lemma:item.lemma,thema:item.thema,quellen_ids:check.sourceIds||item.quellen_ids,belegbindungen:item.belegbindungen,paket_sha256:packageHash,lieferrevision:item.expected_draft_hash,quellenpruefung:check.sourceCheck,offene_einzelbehauptungen:check.openClaims||[],aenderungen:check.changes||[],verwandte_oeffentliche_slugs:check.relatedSlugs||[],veroeffentlichungsentscheidung:null,akteur:'Codex - technische Integration und KI-gestützte Quellenprüfung',stand:checks.checkedAt};
  m.liefer_belegbindungen=m.belegbindungen;
  m.belegbindungen=m.quellen_ids.map(id=>{const q=sourceById[id];if(!q)throw Error('V11_SOURCE_BINDING_REQUIRED:'+id);return {id,rolle:q.rolle,url:q.url,herausgeber:q.herausgeber,datum:q.datum,fundstelle:q.fundstelle,beleggrenze:q.grenze};});
  value.redaktionsmetadaten=m;validateV11(value,sourceIds);
  if(slugs.has(m.slug)||existingSlugs.has(m.slug))throw Error('V11_DUPLICATE_SLUG');slugs.add(m.slug);
  for(const id of item.origin_ids){if(origins.has(id))throw Error('V11_DUPLICATE_ORIGIN');origins.add(id);}
  entries.push({item,original,entry:{...original,[V11_FIELD]:value}});
 }
 const duplicate=input.items.find(i=>i.origin_ids.length===2),aliasId=duplicate?.vorarbeiten_verknuepfung?.id,alias=indexes.editorial_narrative_candidates.objects[aliasId];
 if(!alias||alias.draftHash!==duplicate.vorarbeiten_verknuepfung.snapshot_hash)throw Error('V11_ALIAS_REVISION_CONFLICT');
 const aliasEntry={...supplementValue(alias,base),redaktioneller_alias_v11:{ziel_id:duplicate.key,ziel_store:duplicate.target_store,paket_sha256:packageHash,fruehere_revision:alias.draftHash}};
 return {entries,allSources,alias:{id:aliasId,entry:aliasEntry,expectedHash:alias.draftHash},packageHash,auditHash,originalMaster:main.v3Sha256,preconditions:Object.fromEntries(stores.map(folder=>[folder,bytes(path.join(base,folder,'store.json'))])),mainHash:bytes(path.join(base,'store.json'))};
}
export function importV11(options){
 const {base=V9,apply=false}=options,plan=planV11(options);
 if(plan.alreadyApplied)return plan.receipt;
 if(!apply)return {dryRun:true,targets:plan.entries.length,origins:plan.entries.flatMap(x=>x.item.origin_ids).length,sources:plan.allSources.length,conflicts:0,approvalsCreated:0};
 const lock=path.join(base,'.v11-import.lock');fs.mkdirSync(lock);
 const stage=fs.mkdtempSync(path.join(path.dirname(base),'v11-transaction-'));
 const backup=path.join(stage,'rollback');fs.mkdirSync(backup);
 let installed=false;
 try{
  fs.copyFileSync(path.join(base,'store.json'),path.join(stage,'store.json'));
  for(const folder of stores)fs.cpSync(path.join(base,folder),path.join(stage,folder),{recursive:true});
  const sourceRevisions=[];
  for(const source of plan.allSources){
   const existing=researchIndex(stage).objects[source.id];
   if(existing){const old=researchValue(existing,stage),entry={...old,...source};if(digest(old)!==digest(entry))saveResearch({id:source.id,entry,expectedHash:existing.draftHash,reason},principal,stage);}
   else addResearch({id:source.id,type:'source',entry:source,reason},principal,stage,{deferInventory:true});
   sourceRevisions.push({id:source.id,revision:researchIndex(stage).objects[source.id].draftHash});
  }
  const revisions=[];
  for(const {item,entry} of plan.entries){const save=item.target_store==='research_candidates'?saveResearch:saveSupplement;const result=save({id:item.key,entry,expectedHash:item.expected_draft_hash,reason},principal,stage);revisions.push({id:item.key,folder:item.target_store,revision:result.revision,slug:item.proposed_slug,type:item.zieltyp,origins:item.origin_ids});}
  const alias=saveSupplement({...plan.alias,reason},principal,stage);
  if(bytes(path.join(base,'store.json'))!==plan.mainHash||stores.some(folder=>bytes(path.join(base,folder,'store.json'))!==plan.preconditions[folder]))throw Error('V11_COMMIT_REVISION_CONFLICT');
  // The API refuses writes while the lock exists. Old immutable snapshots survive.
  for(const folder of stores){fs.renameSync(path.join(base,folder),path.join(backup,folder));try{fs.renameSync(path.join(stage,folder),path.join(base,folder));}catch(error){fs.renameSync(path.join(backup,folder),path.join(base,folder));throw error;}}
  installed=true;
  const receipt={schema:'WOEK_V11_PRIVATE_INTAKE_V1',at:new Date().toISOString(),packageSha256:plan.packageHash,auditSha256:plan.auditHash,originalMasterSha256:plan.originalMaster,mainStoreSha256:plan.mainHash,targets:94,originIds:95,wordCards:74,analyses:20,sources:sourceRevisions,revisions,aliases:[{id:alias.id,folder:'editorial_narrative_candidates',revision:alias.revision,target:plan.entries.find(r=>r.item.origin_ids.includes(alias.id)).item.key}],approvalsCreated:0,publicationsCreated:0};
  atomic(path.join(base,'v11-intake-receipt.json'),receipt);return receipt;
 }catch(error){
  for(const folder of stores)if(fs.existsSync(path.join(backup,folder))){if(fs.existsSync(path.join(base,folder)))fs.rmSync(path.join(base,folder),{recursive:true});fs.renameSync(path.join(backup,folder),path.join(base,folder));}
  if(installed)fs.rmSync(path.join(base,'v11-intake-receipt.json'),{force:true});throw error;
 }finally{fs.rmSync(stage,{recursive:true,force:true});fs.rmSync(lock,{recursive:true,force:true});}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),get=k=>args[args.indexOf(k)+1];
 if(!args.includes('--source')||!args.includes('--audit')||!args.includes('--archive'))throw Error('Usage: --source <private-package-directory> --audit <private-audit.json> --archive <original.zip> [--apply]');
 const result=importV11({source:path.resolve(get('--source')),audit:path.resolve(get('--audit')),archive:path.resolve(get('--archive')),apply:args.includes('--apply')});console.log(JSON.stringify(result.dryRun?result:{targets:result.targets,originIds:result.originIds,sources:result.sources.length,approvalsCreated:0,publicationsCreated:0}));
}
