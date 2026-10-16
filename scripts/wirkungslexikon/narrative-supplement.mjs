import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT,read,atomic,sha} from './model.mjs';
import {V9,loadStore,snapshot,digest,event} from './v9-store.mjs';
import {schemaCheck,structured,escape} from './v9-review.mjs';
import {V11_FIELD,validateV11} from './v11-content.mjs';

export const supplementBase=base=>path.join(base||V9,'editorial_narrative_candidates');
export const supplementIndex=(base=V9)=>fs.existsSync(path.join(supplementBase(base),'store.json'))?read(path.join(supplementBase(base),'store.json')):null;
export const supplementValue=(o,base=V9)=>{const value=read(path.join(supplementBase(base),'snapshots',o.draftHash+'.json'));if(digest(value)!==o.draftHash)throw Error('SUPPLEMENT_SNAPSHOT_MISMATCH');return value;};
const idOf=(type,e)=>type==='candidate'?e.kandidaten_id:e.id;
const guarded=['approved','published','publicHash','reviewed_by','menschliche_freigabe','humanReview'];
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
export function validateSupplement(type,value,main){
 if(!plain(value)||guarded.some(k=>value[k]!=null&&value[k]!==false))throw Error('HUMAN_REVIEW_REQUIRED');
 const guard=v=>{if(!v||typeof v!=='object')return;for(const[k,x]of Object.entries(v)){if([...guarded,'persoenliche_freigabe','menschliche_pruefung','is_public','verified_by','verified_at'].includes(k)&&x!==null&&x!==false)throw Error('HUMAN_REVIEW_REQUIRED');guard(x);}};guard(value);
 const cards=new Set(Object.values(main.objects).filter(o=>o.type==='wirkungskarte').map(o=>o.slug));
 const families=new Set(Object.values(main.objects).filter(o=>o.type==='narrativfamilie').map(o=>o.id));
 const refs=type==='candidate'?value.bestehende_v3_bezugsslugs:value.v3_bezuege;
 if(!Array.isArray(refs)||refs.some(s=>!cards.has(s)))throw Error('UNKNOWN_V3_REFERENCE');
 if(!/^[A-Z0-9][A-Z0-9_-]{2,119}$/.test(idOf(type,value)||''))throw Error('INVALID_SUPPLEMENT_ID');
 if(type==='candidate'){
  for(const k of ['lemma','gegenstand','quellenstatus','quelle_wortlaut_typ','wirkungsraum','mechanismus_hypothese','bedingtes_wirkungspotenzial','kausale_zurechnung','redaktionsstatus'])if(typeof value[k]!=='string'||!value[k].trim())throw Error('CANDIDATE_FIELD_REQUIRED:'+k);
  if(typeof value.offene_fragen!=='string')throw Error('CANDIDATE_FIELD_REQUIRED:offene_fragen');
  if(value.persoenliche_freigabe!==false||!Array.isArray(value.quellen))throw Error('HUMAN_REVIEW_REQUIRED');
  for(const q of value.quellen)if(q.url&&!/^https?:\/\/[^\s]+$/.test(q.url)||typeof q.rolle!=='string')throw Error('INVALID_CANDIDATE_SOURCE');
 }else if(type==='chain'){
  if(typeof value.titel!=='string'||!Array.isArray(value.familien)||value.familien.some(id=>!families.has(id)))throw Error('UNKNOWN_FAMILY_REFERENCE');
  schemaCheck(value,{type:'object',required:['id','titel','familien','v3_bezuege','knoten','relationen'],properties:{knoten:{type:'array',minItems:1,items:{type:'object',required:['id','bezeichnung','art','quelle','evidenz']}},relationen:{type:'array',items:{type:'object',required:['von','nach','typ','status','quelle','unsicherheit']}}}});
  const ids=value.knoten.map(n=>n.id);if(new Set(ids).size!==ids.length)throw Error('DUPLICATE_NODE');
  for(const n of value.knoten)if(typeof n.id!=='string'||typeof n.art!=='string'||typeof n.evidenz!=='string')throw Error('NODE_ROLE_REQUIRED');
  for(const r of value.relationen){
   if(!ids.includes(r.von)||!ids.includes(r.nach))throw Error('UNKNOWN_EDGE_NODE');
   if(typeof r.typ!=='string'||typeof r.status!=='string'||typeof r.unsicherheit!=='string'||!r.unsicherheit.trim())throw Error('EDGE_QUALIFICATION_REQUIRED');
   if(r.typ==='DOKUMENTIERTE_UEBERNAHME'&&!r.quelle)throw Error('ADOPTION_SOURCE_REQUIRED');
  }
 }else throw Error('UNKNOWN_SUPPLEMENT_TYPE');
 return value;
}

export function importSupplement(source,{base=V9,archive,referenceArchive}={}){
 const directory=supplementBase(base),prior=supplementIndex(base),archiveHash=sha(fs.readFileSync(archive));
 if(prior){if(prior.archiveSha256!==archiveHash)throw Error('NEW_VERSION_IMPORT_REQUIRED');return prior;}
 const manifest=read(path.join(source,'05_QA/SHA256_MANIFEST.json')),files=[],resolved=[];
 for(const row of manifest.files){let file=path.join(source,row.path),external=false;
  if(!fs.existsSync(file)&&row.path.startsWith('06_REFERENZ/')&&referenceArchive){file=referenceArchive;external=true;}
  if(!fs.existsSync(file)||fs.statSync(file).size!==row.size||sha(fs.readFileSync(file))!==row.sha256)throw Error('INPUT_MANIFEST_MISMATCH:'+row.path);
  files.push(row);if(external)resolved.push({missingInArchive:row.path,resolvedFrom:path.resolve(file),sha256:row.sha256});
 }
 const main=loadStore(base),candidates=read(path.join(source,'01_DATEN/NARRATIVKANDIDATEN_QUELLEN_WIRKUNGSPOTENZIAL.json')),chains=read(path.join(source,'01_DATEN/NARRATIVKETTEN_V1.json'));
 if(candidates.v3_master_sha256!==main.v3Sha256||chains.v3_sha256!==main.v3Sha256)throw Error('V3_REFERENCE_MISMATCH');
 schemaCheck(chains,read(path.join(source,'01_DATEN/NARRATIVKETTEN_SCHEMA_V1.json')));
 if(candidates.kandidaten.length!==17||chains.ketten.length!==4)throw Error('SUPPLEMENT_COUNT_MISMATCH');
 const index={version:1,source:path.resolve(source),archive:path.resolve(archive),archiveSha256:archiveHash,sourceManifest:files,externallyResolvedReferences:resolved,objects:{},events:[],approvalEnabled:false};
 for(const [type,entries] of [['candidate',candidates.kandidaten],['chain',chains.ketten]])for(const value of entries){
  validateSupplement(type,value,main);const id=idOf(type,value);if(index.objects[id])throw Error('DUPLICATE_SUPPLEMENT_ID');
  index.objects[id]={id,type,title:value.lemma||value.titel,draftHash:snapshot(value,directory),publicHash:null,status:'ENTWURF',reviewer:null,reviewedAt:null,history:[]};
 }
 event(index,{action:'narrative_supplement_imported',subject:'technical-import',role:'importer',objects:21,approvalsCreated:0,originalMasterChanged:false},directory);
 return index;
}

export function saveSupplement({id,entry,expectedHash,reason},principal,base=V9){
 if(principal.role!=='editor'||!principal.subject)throw Error('EDITOR_REQUIRED');
 if(typeof reason!=='string'||reason.trim().length<10||reason.length>2000)throw Error('REASON_REQUIRED');
 const index=supplementIndex(base),o=index?.objects[id];if(!o)throw Error('UNKNOWN_SUPPLEMENT');
 if(expectedHash!==o.draftHash)throw Error('REVISION_CONFLICT');if(idOf(o.type,entry)!==id)throw Error('IMMUTABLE_SUPPLEMENT_ID');
 validateSupplement(o.type,entry,loadStore(base));
 if(entry[V11_FIELD]){const sources=read(path.join(base,'research_candidates/store.json'));validateV11(entry[V11_FIELD],new Set(Object.values(sources.objects).filter(o=>o.type==='source').map(o=>o.id)));}
 const revision=snapshot(entry,supplementBase(base));
 o.draftHash=revision;o.title=entry.lemma||entry.titel;o.status='ENTWURF';o.reviewer=null;o.reviewedAt=null;o.publicHash=null;
 o.history.push({at:new Date().toISOString(),subject:principal.subject,reason,revision});
 event(index,{action:'narrative_supplement_draft_saved',object:id,subject:principal.subject,role:principal.role,reason,revision,approvalsCreated:0},supplementBase(base));
 return {id,entry,revision,approved:false};
}

const route=o=>'/wirkungslexikon/redaktion/narrativketten/'+o.id.toLowerCase()+'/';
export function supplementPresentation(base=V9){
 const index=supplementIndex(base);if(!index)return {extraPages:[],familyLinks:{}};
 const objects=Object.values(index.objects),chains=objects.filter(o=>o.type==='chain'),candidates=objects.filter(o=>o.type==='candidate');
 const guard='<p class="wl-guard">Geschützter Rechercheentwurf · keine Publikationsfreigabe. Belegstatus laut Lieferung; menschliche Quellen- und Fachprüfung offen. Die 180 Karten bleiben unverändert.</p>';
 const wrap=h=>`<div class="wl-container wl-container--narrow wl-section-space">${h}</div>`;
 const refs=slugs=>`<ul>${slugs.map(s=>`<li><a href="/wirkungslexikon/${escape(s)}/">${escape(s)}</a></li>`).join('')}</ul>`;
 const edit=o=>`<details><summary>Entwurf bearbeiten und neue Version speichern</summary><form id="wl-supplement-editor" class="wl-stack" data-supplement-id="${escape(o.id)}" data-revision="${escape(o.draftHash)}"><label for="supplement-json">Vollständiger JSON-Entwurf</label><textarea class="wl-codebox" id="supplement-json" rows="24" spellcheck="false" required>${escape(JSON.stringify(supplementValue(o,base),null,2))}</textarea><label for="supplement-reason">Änderungsgrund</label><input class="wl-input" id="supplement-reason" required minlength="10" maxlength="2000"><button class="wl-btn" type="submit">Neuen Entwurf speichern</button><p id="supplement-result" role="status"></p></form></details>`;
 const versions=o=>`<p class="wl-small">Entwurfsrevision: <code>${escape(o.draftHash)}</code> · Status: ${escape(o.status)} · Reviewperson: noch offen · Öffentliche Revision: keine.</p><h2>Änderungsverlauf</h2>${structured(o.history.length?o.history:index.events)}${edit(o)}`;
 const list=items=>`<ul class="wl-stack">${items.map(o=>{const e=supplementValue(o,base);return `<li><a href="${route(o)}">${escape(o.title)}</a>${o.type==='candidate'?`<p><strong>Wirkungspotenzial:</strong> ${escape(e.bedingtes_wirkungspotenzial)}</p>`:`<p>${escape(e.fokus)}</p>`}</li>`;}).join('')}</ul>`;
 const editorIndex=wrap(`<h1>Narrativketten und Recherchekandidaten</h1>${guard}<p>17 Kandidaten, vier Ketten, 20 Knoten und 18 bedingt eingeordnete Relationen. Kein neuer öffentlicher Lexikoneintrag und keine automatische Ursachenzurechnung.</p><h2>Vier Narrativketten</h2>${list(chains)}<h2>17 separate Kandidaten</h2>${list(candidates)}<h2>Inhalts- und Freigabegrenzen</h2><p>Verwendung, mediale Überschrift, Bildmotiv, politische Forderung und Assoziationshypothese bleiben verschiedene Gegenstände. Eine ähnliche Rahmung ist kein Übernahme- oder Koordinationsnachweis. Eine Quelle belegt nicht automatisch den Wahrheitsgehalt einer dort geäußerten Behauptung.</p><p>Im Paket fehlt das als eingebettet bezeichnete V9-Referenzarchiv. Die identische bereits vorhandene Referenz wurde separat anhand des gelieferten Hashs geprüft; kein Inhalt wurde ergänzt oder erfunden.</p><p><a href="/wirkungslexikon/redaktion/">Zur Hauptredaktion</a></p>`);
 const extraPages=[{rel:'redaktion/narrativketten/',title:'Geschützte Prüfung der Narrativketten',html:editorIndex}];
 const familyLinks={};
 for(const o of objects){const e=supplementValue(o,base);let html=`<p><a href="/wirkungslexikon/redaktion/narrativketten/">Alle Kandidaten und Ketten</a></p><h1>${escape(o.title)}</h1>${guard}`;
  if(o.type==='candidate')html+=`<h2>Untersuchungsgegenstand und Wortlauttyp</h2><p>${escape(e.gegenstand)} · ${escape(e.quelle_wortlaut_typ)}</p><p>Gelieferter Quellenstatus: ${escape(e.quellenstatus)}.</p><h2>Mechanismus als Hypothese</h2><p>${escape(e.mechanismus_hypothese)}</p><h2>Bedingtes Wirkungspotenzial</h2><p>${escape(e.bedingtes_wirkungspotenzial)}</p><h2>Beobachtete Veränderung und Zurechnung</h2>${structured({beobachtete_wirkung:e.beobachtete_wirkung,kausale_zurechnung:e.kausale_zurechnung})}<h2>Quellen und ihre getrennten Rollen</h2>${structured(e.quellen)}<h2>Offene Fragen</h2><p>${escape(e.offene_fragen)}</p><h2>Bezug zu vorhandenen Karten</h2>${refs(e.bestehende_v3_bezugsslugs)}`;
  else{
   for(const family of e.familien)(familyLinks[family]||=[]).push({title:o.title,url:route(o)});
   html+=`<p>${escape(e.fokus)}</p><h2>Mehrere bestehende Narrativfamilien</h2><ul>${e.familien.map(f=>`<li><a href="/wirkungslexikon/narrative/${escape(f)}/">${escape(f)}</a></li>`).join('')}</ul><h2>Stationen mit Rollen und Belegstatus</h2>${e.knoten.map(n=>`<section class="wl-stack"><h3>${escape(n.id+' · '+n.bezeichnung)}</h3>${structured(n)}<p class="wl-small">${n.akteur?'Akteursangabe laut Entwurf.':'Akteur nicht als eigenes Knotenfeld geliefert; getrennte Quellenprüfung offen.'}</p></section>`).join('')}<h2>Verbindungen und ihre Grenzen</h2><p>Die folgenden Beziehungen sind keine durchgängige kausale Wirkungskette. Jede Beziehung führt ihren eigenen Typ, Status, Beleg und ihre Unsicherheit.</p>${e.relationen.map(r=>`<section class="wl-stack"><h3>${escape(r.von+' / '+r.nach)}</h3>${structured(r)}</section>`).join('')}<h2>Vorhandene Karten</h2>${refs(e.v3_bezuege)}`;
  }
  html+=`<h2>Vollständige strukturierte Angaben</h2>${structured(e)}${versions(o)}`;
  extraPages.push({rel:'redaktion/narrativketten/'+o.id.toLowerCase()+'/',title:o.title+' · Entwurf',html:wrap(html)});
 }
 return {extraPages,familyLinks};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),v=k=>args[args.indexOf(k)+1];
 if(args[0]!=='import')throw Error('Usage: narrative-supplement.mjs import --source ... --archive ... --reference ...');
 const index=importSupplement(path.resolve(v('--source')),{archive:path.resolve(v('--archive')),referenceArchive:path.resolve(v('--reference'))});
 console.log(JSON.stringify({objects:Object.keys(index.objects).length,archiveSha256:index.archiveSha256,approvalEnabled:false}));
}
