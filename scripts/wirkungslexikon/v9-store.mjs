import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {ROOT,read,atomic,sha,validate} from './model.mjs';
import {validateExample,EXAMPLE_FIELD} from './examples.mjs';
export const V9=path.resolve(process.env.WL_V9_BASE||path.join(ROOT,'outputs/wirkungslexikon/v9'));
export const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
export const digest=v=>sha(canonical(v));
export const states=['arbeitsentwurf','quellenpruefung_offen','redaktionell_in_pruefung','zur_freigabe_vorgelegt','menschlich_freigegeben','veroeffentlicht','korrigiert_oder_zurueckgezogen'];
export function loadStore(base=V9){return read(path.join(base,'store.json'));}
export function snapshot(value,base=V9){const h=digest(value),file=path.join(base,'snapshots',h+'.json');if(fs.existsSync(file)){if(digest(read(file))!==h)throw Error('Snapshot manipuliert');}else atomic(file,value);return h;}
export function event(store,detail,base=V9){const item={sequence:store.events.length+1,date:new Date().toISOString(),previous:store.events.at(-1)?.hash||null,...detail};item.hash=digest(item);atomic(path.join(base,'events',String(item.sequence).padStart(6,'0')+'-'+item.hash+'.json'),item);store.events.push(item);atomic(path.join(base,'store.json'),store);return item;}
export function saveDraft(store,id,payload,{role,subject},reason,expected,base=V9){
 if(role!=='editor'||!subject)throw Error('EDITOR_REQUIRED');const o=store.objects[id];if(!o||expected!==o.draftHash)throw Error('REVISION_CONFLICT');
 if(reason?.trim().length<10)throw Error('REASON_REQUIRED');if(payload.id!==id||o.slug&&(payload.slug!==o.slug))throw Error('IMMUTABLE_ID_SLUG');
 if(payload.freigabe||payload.menschliche_freigabe||payload.pruefstatus==='freigegeben'||payload.reviewed_by||payload.approved_revision)throw Error('AGENT_APPROVAL_FORBIDDEN');
 if(o.type==='wirkungskarte'){validateExtensions(payload);const reference=store.source;const original=read(path.join(reference,'01_DATEN/V3_ORIGINAL_MASTER_UNVERAENDERT.json'));validate({...original,entries:[payload]},{allowSubset:true});}
 const prior=read(path.join(base,'snapshots',o.draftHash+'.json'));if(o.type==='wirkungskarte'&&payload.pruefstatus!==prior.pruefstatus)throw Error('HISTORICAL_STATUS_IMMUTABLE');
 o.draftHash=snapshot(payload,base);o.state='arbeitsentwurf';o.frozenHash=null;o.attestations=[];o.verifiedNarrativeLinks={}; // Published revision intentionally remains available.
 event(store,{action:'draft_saved',object:id,subject,role,reason,revision:o.draftHash},base);return o;
}
function verifyAttestation(a,trust){
 if(!trust?.enabled||!trust.issuer||!trust.subjects)throw Error('OFFICIAL_ACCOUNT_NOT_CONNECTED');
 if(!a?.payload||!a.signature)throw Error('SIGNED_HUMAN_ATTESTATION_REQUIRED');
 const p=a.payload,account=trust.subjects[p.subject];
 if(p.issuer!==trust.issuer||!account||account.name!==p.person||!account.roles.includes(p.role)||p.actor_type!=='human')throw Error('UNTRUSTED_IDENTITY_OR_ROLE');
 if(!/^\d{4}-\d\d-\d\dT/.test(p.at)||!Number.isFinite(Date.parse(p.at))||Date.parse(p.at)>Date.now()+60000)throw Error('INVALID_DATE');
 if(!crypto.verify(null,Buffer.from(canonical(p)),trust.publicKey,Buffer.from(a.signature,'base64url')))throw Error('INVALID_SIGNATURE');return p;
}
export function applyAttestation(store,a,trust,base=V9){const p=verifyAttestation(a,trust),o=store.objects[p.object];
 if(!o||p.revision!==o.draftHash||p.revision!==digest(read(path.join(base,'snapshots',p.revision+'.json'))))throw Error('STALE_REVISION');
 const actions={source_verified:'source_reviewer',expert_reviewed:'reviewer',approve:'publisher',publish:'publisher',withdraw:'publisher',narrative_verified:'reviewer'};
 if(actions[p.action]!==p.role||p.decision!=='accept')throw Error('ROLE_OR_DECISION_DENIED');
 const requiredChecks=p.action==='source_verified'?['wording','context','actor','locator','date','sourceVersion']:p.action==='expert_reviewed'?['categories','potential','counterinterpretations','attribution']:[];
 if(requiredChecks.some(k=>p.checks?.[k]!==true))throw Error('REVIEW_SCOPE_INCOMPLETE');
 if(p.action==='approve'){
  if(!o.frozenHash||o.frozenHash!==p.revision||!o.attestations.some(x=>x.action==='source_verified'&&x.revision===p.revision)||!o.attestations.some(x=>x.action==='expert_reviewed'&&x.revision===p.revision))throw Error('REVIEWS_REQUIRED');
  const value=read(path.join(base,'snapshots',p.revision+'.json'));
  if(o.type==='wirkungskarte'&&(!value.originalnachweis?.quelle_id||!value.originalnachweis?.text||!value.quellen?.length))throw Error('ORIGINAL_SOURCE_REQUIRED');
  if(p.person!=='Natalie Weber')throw Error('NATALIE_PUBLISHER_REQUIRED');o.approvedHash=p.revision;o.state='menschlich_freigegeben';
 }else if(p.action==='publish'){if(o.approvedHash!==p.revision||o.state!=='menschlich_freigegeben')throw Error('APPROVAL_REQUIRED');o.publishedHash=p.revision;o.state='veroeffentlicht';}
 else if(p.action==='withdraw'){o.publishedHash=null;o.state='korrigiert_oder_zurueckgezogen';}
 else if(p.action==='narrative_verified'){const value=read(path.join(base,'snapshots',p.revision+'.json'));if(!Array.isArray(p.links)||!p.links.length||p.links.some(n=>!value.narrativeinordnung_v7?.narrativ_ids?.includes(n)))throw Error('NARRATIVE_LINK_SCOPE_REQUIRED');o.verifiedNarrativeLinks=Object.fromEntries(p.links.map(n=>[n,p.revision]));}
 else if(p.action==='source_verified')o.state='redaktionell_in_pruefung';
 else if(p.action==='expert_reviewed'){if(!o.attestations.some(x=>x.action==='source_verified'&&x.revision===p.revision))throw Error('SOURCE_REVIEW_REQUIRED');o.frozenHash=p.revision;o.state='zur_freigabe_vorgelegt';}
 (o.attestations||=[]).push(p);event(store,{action:p.action,object:p.object,subject:p.subject,role:p.role,revision:p.revision,attestation:a},base);return o;
}
export function publicObjects(store,base=V9){return Object.values(store.objects).filter(o=>o.publishedHash).map(o=>({type:o.type,revision:o.publishedHash,content:read(path.join(base,'snapshots',o.publishedHash+'.json'))}));}
export function validateExtensions(e){
 if(e[EXAMPLE_FIELD])validateExample(e[EXAMPLE_FIELD]);
 for(const k of ['lemma_kurz','originalwortlaut','original_textstelle_als_beleg','akteur_normalisiert','psychologischer_mechanismus_standardisiert'])if(e[k]!=null&&typeof e[k]!=='string')throw Error('INVALID_EXTENSION_TYPE:'+k);
 for(const q of [...e.quellen,...e.wissenschaftliche_quellen])for(const k of ['id','title','url','role','locator','author','date'])if(q[k]!=null&&typeof q[k]!=='string')throw Error('INVALID_SOURCE_TYPE:'+k);
 const n=e.narrativeinordnung_v7;if(!n||!Array.isArray(n.narrativ_ids)||n.narrativ_ids.some(id=>typeof id!=='string')||n.menschliche_pruefung!==null||n.automatische_veroeffentlichung!==false)throw Error('UNCONFIRMED_NARRATIVE_TYPE');
 if(e.evidenzstufe_bestaetigt!=null&&!['A','B','C','D','E','F'].includes(e.evidenzstufe_bestaetigt))throw Error('INVALID_EVIDENCE_LEVEL');
 if(!Array.isArray(e.kategorien_begruendung)||e.kategorien_begruendung.some(x=>typeof x.kategorie!=='string'||typeof x.begruendung!=='string'))throw Error('INVALID_CATEGORY_REASON');return e;
}
export function importV9(source,base=V9){
 if(fs.existsSync(path.join(base,'store.json')))throw Error('EXISTING_V9_STORE: Import überschreibt keine redaktionelle Arbeit');
 const original=path.join(source,'01_DATEN/V3_ORIGINAL_MASTER_UNVERAENDERT.json'),v3=read(original),v8=read(path.join(source,'01_DATEN/MASTER_V8_REDAKTIONSUEBERGABE_180.json'));
 if(sha(fs.readFileSync(original))!=='33a5f10db91b74d6eb799a0696c0cf4d14086b4683c2d2a69a94ae88111623ae')throw Error('V3_HASH_MISMATCH');
 validate(v3);validate({...v8,version:'3.0'});if(v3.entries.length!==180||v8.entries.length!==180)throw Error('COUNT_MISMATCH');
 const families=read(path.join(source,'01_DATEN/NARRATIV-FAMILIEN_20.json')),dossiers=read(path.join(source,'01_DATEN/SACHSEN_ANHALT_REGIERUNGSPROGRAMM_NARRATIVDOSSIER.json'));
 if(families.length!==20||new Set(families.map(f=>f.id)).size!==20||dossiers.narrative.length!==21||new Set(dossiers.narrative.map(d=>d.id)).size!==21)throw Error('NARRATIVE_COUNT');
 const familyIds=new Set(families.map(f=>f.id));const byId=new Map(v3.entries.map(e=>[e.id,e]));const patches=[];const objects={};
 const add=(type,id,slug,payload)=>{if(objects[id])throw Error('DUPLICATE_OBJECT');objects[id]={type,id,slug,draftHash:snapshot(payload,base),state:'quellenpruefung_offen',frozenHash:null,approvedHash:null,publishedHash:null,attestations:[]};};
 for(const e of v8.entries){validateExtensions(e);const old=byId.get(e.id);if(!old||old.slug!==e.slug||old.pruefstatus!==e.pruefstatus||e.freigabe)throw Error('IDENTITY_STATUS_CHANGE');
  for(const n of e.narrativeinordnung_v7?.narrativ_ids||[])if(!familyIds.has(n))throw Error('UNKNOWN_NARRATIVE:'+n);
  for(const k of ['akteur','korpus','pruefstatus'])if(typeof e[k]!=='string')throw Error('INVALID_ACTOR_STATUS');
  add('wirkungskarte',e.id,e.slug,e);patches.push({id:e.id,slug:e.slug,before:old,after:e,beforeSha256:digest(old),afterSha256:digest(e),historicalStatusPreserved:true,approved:false});
 }
 for(const f of families)add('narrativfamilie',f.id,null,f);
 for(const d of dossiers.narrative){if(d.menschliche_freigabe!==null)throw Error('UNEXPECTED_DOSSIER_APPROVAL');for(const slug of d.verwandte_v3_slugs||[])if(!v3.entries.some(e=>e.slug===slug))throw Error('UNKNOWN_RELATED_CARD:'+slug);add('programm_narrativ_dossier',d.id,null,d);}
 const proposed=read(path.join(source,'02_QUELLENPRUEFUNG_48/C_JSON_AENDERUNGSVORSCHLAEGE_48.json'));
 if(proposed.vorschlaege.length!==48||new Set(proposed.vorschlaege.map(x=>x.id)).size!==48)throw Error('PATCH48_COUNT');
 for(const x of proposed.vorschlaege)if(!byId.has(x.id)||byId.get(x.id).slug!==x.slug)throw Error('UNKNOWN_PATCH48');
 const store={version:'V9',source:path.resolve(source),v3Sha256:sha(fs.readFileSync(original)),v8Sha256:sha(fs.readFileSync(path.join(source,'01_DATEN/MASTER_V8_REDAKTIONSUEBERGABE_180.json'))),objects,events:[],sourceManifest:read(path.join(source,'06_QA/MANIFEST_V9_SHA256.json'))};
 atomic(path.join(base,'REDAKTIONELLE_PATCHES_VORHER_NACHHER.json'),{version:'V9',origin:store.v3Sha256,appliedToOriginal:false,patches});
 atomic(path.join(base,'PATCHES_48_UNVERAENDERT.json'),proposed);
 atomic(path.join(base,'identity-trust.example.json'),{enabled:false,issuer:null,publicKey:null,subjects:{},reason:'Vorhandenes offizielles Redaktionskonto noch nicht identitätsgebunden angebunden. Keine Fake-Freigabe.'});
 event(store,{action:'import_proposals',subject:'technical-import',role:'importer',cards:180,families:20,dossiers:21,approvalsCreated:0},base);return store;
}
