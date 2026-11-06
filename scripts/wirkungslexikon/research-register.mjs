import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT,read,sha} from './model.mjs';
import {V9,loadStore,digest,snapshot,event} from './v9-store.mjs';
import {schemaCheck,escape,structured} from './v9-review.mjs';
import {supplementIndex,supplementValue} from './narrative-supplement.mjs';
import {inventoryCounts,normalizeInventoryTerm} from './inventory.mjs';
import {V11_FIELD,validateV11} from './v11-content.mjs';

export const researchBase=(base=V9)=>path.join(base,'research_candidates');
export const researchIndex=(base=V9)=>fs.existsSync(path.join(researchBase(base),'store.json'))?read(path.join(researchBase(base),'store.json')):null;
export const researchValue=(o,base=V9)=>{const value=read(path.join(researchBase(base),'snapshots',o.draftHash+'.json'));if(digest(value)!==o.draftHash)throw Error('RESEARCH_SNAPSHOT_MISMATCH');return value;};
const strings=names=>Object.fromEntries(names.map(k=>[k,{type:'string',minLength:1}]));
export const schemas={
 candidate:{type:'object',required:['kandidaten_id','lemma','quellen_ids','belegmodus','narrativfamilien_v9','qa_offen','freigabestatus','hat_originalwortlaut_zitat','ursprungsbeleg_vollgeprueft','tatsaechliche_wirkung_nachgewiesen'],properties:{...strings(['kandidaten_id','lemma','qa_offen']),quellen_ids:{type:'array',minItems:1,items:{type:'string'}},belegmodus:{enum:['DIREKT_VERWENDET','META_ERWAEHNT','ANALYTISCHES_LEMMA']},narrativfamilien_v9:{type:'array',minItems:1,items:{type:'string'}},freigabestatus:{const:'NICHT_FREIGEGEBEN'},ursprungsbeleg_vollgeprueft:{const:false},tatsaechliche_wirkung_nachgewiesen:{const:false},politische_entscheidung_durch_sprache_kausal_nachgewiesen:{const:false},nicht_automatisch_neue_karte:{const:true},hat_originalwortlaut_zitat:{type:'boolean'}}},
 watch:{type:'object',required:['lemma','themenfeld','recherchefrage','status','freigabe'],properties:{...strings(['lemma','themenfeld','recherchefrage']),status:{const:'QUELLE_ORIGINALFEHLT_KEINE_VERWENDUNG_BESTAETIGT'},freigabe:{const:false}}},
 source:{type:'object',required:['id','titel','url','herausgeber','datum','rolle','fundstelle','grenze'],properties:strings(['id','titel','url','herausgeber','datum','rolle','fundstelle','grenze'])},
 chain:{type:'object',required:['id','titel','stationen','quellen_ids','gegenpfad'],properties:{...strings(['id','titel','gegenpfad']),stationen:{type:'array',minItems:1,items:{type:'object',required:['stufe','inhalt'],properties:strings(['stufe','inhalt'])}},quellen_ids:{type:'array',minItems:1,items:{type:'string'}}}}
};
export function validateResearch(type,value,index,main){
 if(!schemas[type])throw Error('UNKNOWN_RESEARCH_TYPE');
 const sourcePending=type==='candidate'&&value.recherchevorschlag_ohne_quelle===true;
 const schema=sourcePending?{...schemas.candidate,properties:{...schemas.candidate.properties,quellen_ids:{type:'array',items:{type:'string'}}}}:schemas[type];
 schemaCheck(value,schema);
 if(sourcePending&&(value.belegmodus!=='ANALYTISCHES_LEMMA'||value.hat_originalwortlaut_zitat!==false||value.quellenrolle_geprueft!==false||value.quellen_ids.length||value.originalquelle_status!=='ORIGINALQUELLE_FEHLT'))throw Error('UNVERIFIED_PROPOSAL_MUST_NOT_CLAIM_SOURCE');
 const walk=v=>{if(!v||typeof v!=='object')return;for(const[k,x]of Object.entries(v)){if(['is_public','approved','published','reviewed_by','verified_by','verified_at','publicHash','humanReview','menschliche_freigabe'].includes(k)&&x!==false&&x!==null)throw Error('HUMAN_REVIEW_REQUIRED');if(k==='review_state'&&x!=='SOURCE_NEEDED')throw Error('HUMAN_REVIEW_REQUIRED');walk(x);}};walk(value);
 if(type==='candidate'){
  for(const name of ['themenfeld','nachgewiesene_verwendung','bedeutungsverschiebung_oder_rahmung','mechanismus_arbeitshypothese','wirkungspotenzial_bedingt','wirkungsstatus','attribution','dokumentierte_strategische_absicht','redaktionelle_praezisierung','politische_entscheidungs_vorwirkung_hypothese','qa_offen','review_empfohlen','prioritaet_zur_weiteren_recherche','datenherkunft'])if(typeof value[name]!=='string'||!value[name].trim())throw Error('RESEARCH_FIELD_REQUIRED:'+name);
  for(const name of ['identische_lemma_im_v3','identischer_vorarbeitskandidat','quellenrollen'])if(!Array.isArray(value[name]))throw Error('RESEARCH_ARRAY_REQUIRED:'+name);
  if(value.status!=='RECHERCHEVORSCHLAG_KEINE_KARTENFREIGABE'||typeof value.quellenrolle_geprueft!=='boolean')throw Error('INVALID_RESEARCH_STATE');
  if(value.belegmodus!=='DIREKT_VERWENDET'&&value.hat_originalwortlaut_zitat)throw Error('META_IS_NOT_ORIGINAL_QUOTE');
  const familyIds=new Set(Object.values(main.objects).filter(o=>o.type==='narrativfamilie').map(o=>o.id));
  if(value.narrativfamilien_v9.some(id=>!familyIds.has(id)))throw Error('UNKNOWN_FAMILY_REFERENCE');
  const cards=new Set(Object.values(main.objects).filter(o=>o.type==='wirkungskarte').flatMap(o=>[o.id,o.slug]));
  if((value.identische_lemma_im_v3||[]).some(id=>!cards.has(typeof id==='string'?id:id.id)))throw Error('UNKNOWN_V3_REFERENCE');
 }
 if(type==='candidate'||type==='chain')for(const id of value.quellen_ids)if(!index.objects[id]||index.objects[id].type!=='source')throw Error('UNKNOWN_RESEARCH_SOURCE');
 if(type==='source'&&!/^https?:\/\/\S+$/.test(value.url))throw Error('INVALID_SOURCE_URL');
 if(value[V11_FIELD])validateV11(value[V11_FIELD],new Set(Object.values(index.objects).filter(o=>o.type==='source').map(o=>o.id)));
 return value;
}
export function importResearch(source,{base=V9,archive}={}){
 const hash=sha(fs.readFileSync(archive)),prior=researchIndex(base);if(prior){if(prior.archiveSha256!==hash)throw Error('NEW_VERSION_IMPORT_REQUIRED');return prior;}
 const manifest=read(path.join(source,'05_QA/SHA256_MANIFEST.json'));
 for(const row of manifest.dateien){const file=path.resolve(source,row.datei);if(!file.startsWith(path.resolve(source)+path.sep)||fs.statSync(file).size!==row.bytes||sha(fs.readFileSync(file))!==row.sha256)throw Error('RESEARCH_INPUT_HASH_MISMATCH');}
 const data=read(path.join(source,'01_DATEN/ERWEITERUNGSKANDIDATEN_NICHT_IMPORTIEREN.json')),sources=read(path.join(source,'02_QUELLEN/QUELLENREGISTER.json')).quellen,previous=read(path.join(source,'01_DATEN/VORARBEIT_17_UNVERAENDERT.json')),watch=read(path.join(source,'01_DATEN/RECHERCHE_WATCHLISTE_NICHT_IMPORTIEREN.json')),chains=read(path.join(source,'01_DATEN/NARRATIVKETTEN_VORSCHLAG.json')),reference=read(path.join(source,'01_DATEN/MASTER_V3_HASH_UND_FAMILIEN_REFERENZ.json')),main=loadStore(base);
 const count={candidate:data.kandidaten.length,source:sources.length,watch:watch.length,chain:chains.length,previous:previous.kandidaten.length};
 if(JSON.stringify(count)!==JSON.stringify({candidate:73,source:43,watch:23,chain:4,previous:17}))throw Error('RESEARCH_COUNTS_MISMATCH');
 if(data.kernbestand.originalmaster_sha256!==main.v3Sha256||reference.original_v3_sha256!==main.v3Sha256)throw Error('V3_REFERENCE_MISMATCH');
 const mainFamilies=Object.values(main.objects).filter(o=>o.type==='narrativfamilie').map(o=>o.id).sort();if(digest(mainFamilies)!==digest(reference.familien.map(f=>f.id).sort()))throw Error('CANONICAL_FAMILY_MISMATCH');
 const supplement=supplementIndex(base),oldCandidates=Object.values(supplement?.objects||{}).filter(o=>o.type==='candidate');
 if(oldCandidates.length!==17||digest(previous.kandidaten)!==digest(oldCandidates.map(o=>supplementValue(o,base))))throw Error('PREVIOUS_17_MISMATCH');
 const index={version:1,source:path.resolve(source),archive:path.resolve(archive),archiveSha256:hash,objects:{},events:[],approvalEnabled:false,counts:count,referenceV3:main.v3Sha256,previous17:oldCandidates.map(o=>({id:o.id,revision:o.draftHash})),canonical221:digest(main.objects)};
 const add=(type,id,value)=>{if(index.objects[id])throw Error('DUPLICATE_RESEARCH_ID');index.objects[id]={id,type,title:value.lemma||value.titel,draftHash:snapshot(value,researchBase(base)),is_public:false,review_state:'SOURCE_NEEDED',verified_by:null,verified_at:null,publicHash:null,history:[],sourceClaimsOnly:true};};
 for(const q of sources)add('source',q.id,q);
 for(const e of data.kandidaten)add('candidate',e.kandidaten_id,e);
 // The input watchlist has no IDs; stable positional references preserve its source order.
 watch.forEach((e,i)=>add('watch','WATCH-20261016-'+String(i+1).padStart(3,'0'),e));
 for(const e of chains)add('chain',e.id,e);
 for(const o of Object.values(index.objects))validateResearch(o.type,researchValue(o,base),index,main);
 if(data.kandidaten.filter(e=>e.belegmodus==='DIREKT_VERWENDET').length!==7||data.kandidaten.filter(e=>e.identischer_vorarbeitskandidat.length).length!==1)throw Error('RESEARCH_ROLE_OR_DUPLICATE_MISMATCH');
 event(index,{action:'private_research_import',subject:'technical-import',role:'importer',counts:count,approvalsCreated:0,sourceReviewCreated:0},researchBase(base));return index;
}
export function saveResearch({id,entry,expectedHash,reason},principal,base=V9){
 if(principal.role!=='editor'||!principal.subject)throw Error('EDITOR_REQUIRED');if(typeof reason!=='string'||reason.trim().length<10||reason.length>2000)throw Error('REASON_REQUIRED');
 const index=researchIndex(base),o=index?.objects[id];if(!o)throw Error('UNKNOWN_RESEARCH_OBJECT');if(expectedHash!==o.draftHash)throw Error('REVISION_CONFLICT');
 const before=researchValue(o,base),key={candidate:'kandidaten_id',source:'id',chain:'id',watch:'lemma'}[o.type];if(entry[key]!==before[key])throw Error('IMMUTABLE_RESEARCH_ID');validateResearch(o.type,entry,index,loadStore(base));
 o.draftHash=snapshot(entry,researchBase(base));o.title=entry.lemma||entry.titel;o.review_state='SOURCE_NEEDED';o.is_public=false;o.publicHash=null;o.verified_by=null;o.verified_at=null;o.history.push({at:new Date().toISOString(),subject:principal.subject,reason,revision:o.draftHash});
 event(index,{action:'research_draft_saved',object:id,subject:principal.subject,role:principal.role,revision:o.draftHash,reason,approvalsCreated:0},researchBase(base));return {id,entry,revision:o.draftHash,approved:false};
}
export function addResearch({id,type,entry,reason},principal,base=V9,options={}){
 if(principal.role!=='editor'||!principal.subject)throw Error('EDITOR_REQUIRED');
 if(!/^[A-Z0-9][A-Z0-9_-]{2,119}$/.test(id||'')||!['candidate','watch','source','chain'].includes(type))throw Error('INVALID_RESEARCH_ID_OR_TYPE');
 if(typeof reason!=='string'||reason.trim().length<10||reason.length>2000)throw Error('REASON_REQUIRED');
 const index=researchIndex(base),main=loadStore(base);if(!index)throw Error('RESEARCH_REGISTER_REQUIRED');
 if(index.objects[id])throw Error('DUPLICATE_RESEARCH_ID');
 if(type==='candidate'&&entry.kandidaten_id!==id||['source','chain'].includes(type)&&entry.id!==id)throw Error('IMMUTABLE_RESEARCH_ID');
 if(type==='candidate'||type==='watch'){
  const term=normalizeInventoryTerm(entry.lemma);
  for(const o of Object.values(main.objects).filter(o=>o.type==='wirkungskarte')){const card=read(path.join(base,'snapshots',o.draftHash+'.json'));if([card.begriff,card.lemma_kurz].some(v=>v&&normalizeInventoryTerm(v)===term))return {created:false,existingCard:o.id,slug:o.slug};}
  const prior=Object.values(supplementIndex(base)?.objects||{}).filter(o=>o.type==='candidate').map(o=>({o,v:supplementValue(o,base)}));
  const fresh=Object.values(index.objects).filter(o=>['candidate','watch'].includes(o.type)).map(o=>({o,v:researchValue(o,base)}));
  const match=[...prior,...fresh].find(({v})=>normalizeInventoryTerm(v.lemma)===term);if(match)return {created:false,existingResearch:match.o.id};
 }
 validateResearch(type,entry,index,main);
 index.objects[id]={id,type,title:entry.lemma||entry.titel,draftHash:snapshot(entry,researchBase(base)),is_public:false,review_state:'SOURCE_NEEDED',verified_by:null,verified_at:null,publicHash:null,history:[],sourceClaimsOnly:true};
 event(index,{action:'research_item_added',object:id,type,subject:principal.subject,role:principal.role,reason,approvalsCreated:0},researchBase(base));
 const counts=type==='source'||options.deferInventory?null:inventoryCounts({base,file:options.inventoryFile});return {created:true,id,approved:false,counts};
}
export function promoteResearchWatch({id,entry,expectedHash,reason},principal,base=V9,options={}){
 if(principal.role!=='editor'||!principal.subject)throw Error('EDITOR_REQUIRED');
 if(typeof reason!=='string'||reason.trim().length<10)throw Error('REASON_REQUIRED');
 const index=researchIndex(base),o=index?.objects[id];if(!o||o.type!=='watch'||o.draftHash!==expectedHash)throw Error('WATCH_REVISION_CONFLICT');
 if(entry.kandidaten_id!==id)throw Error('IMMUTABLE_RESEARCH_ID');validateResearch('candidate',entry,index,loadStore(base));
 const previous=o.draftHash;o.type='candidate';o.draftHash=snapshot(entry,researchBase(base));o.title=entry.lemma;o.is_public=false;o.publicHash=null;o.review_state='SOURCE_NEEDED';
 o.history.push({at:new Date().toISOString(),subject:principal.subject,reason,previousType:'watch',previousRevision:previous,revision:o.draftHash});
 event(index,{action:'watch_recorded_as_analysis_candidate',object:id,subject:principal.subject,role:principal.role,reason,revision:o.draftHash,previousRevision:previous,approvalsCreated:0},researchBase(base));
 return {id,created:true,counts:inventoryCounts({base,file:options.inventoryFile})};
}
const route=o=>'/wirkungslexikon/redaktion/breitrecherche/'+o.id.toLowerCase()+'/';
export function researchPresentation(base=V9){
 const index=researchIndex(base);if(!index)return {extraPages:[],familyLinks:{}};
 const objects=Object.values(index.objects),guard='<p class="wl-guard">Private Recherche · SOURCE_NEEDED · keine menschliche Quellenbestätigung und keine Publikationsfreigabe. Lieferangaben sind keine neuen Lexikonkarten.</p>',wrap=h=>'<div class="wl-container wl-container--narrow wl-section-space">'+h+'</div>';
 const link=o=>`<a href="${route(o)}">${escape(o.id+' · '+o.title)}</a>`;
 const list=items=>'<ul>'+items.map(o=>{const e=researchValue(o,base);return `<li data-research-item data-source-mode="${escape(e.belegmodus||o.type)}">${link(o)} · ${escape(e.belegmodus||o.type)}<p>${escape(e.wirkungspotenzial_bedingt||e.recherchefrage||e.grenze||'Bedingte Verkettung; kein Kausalnachweis.')}</p></li>`;}).join('')+'</ul>';
 const extraPages=[{rel:'redaktion/breitrecherche/',title:'Privates Rechercheregister',html:wrap(`<h1>Breitrecherche: ${objects.filter(o=>o.type==='candidate').length} Kandidaten</h1>${guard}<p>${objects.filter(o=>o.type==='candidate').length} Kandidaten, ${objects.filter(o=>o.type==='watch').length} unbestätigte Suchthemen, ${objects.filter(o=>o.type==='source').length} Quellen und ${objects.filter(o=>o.type==='chain').length} bedingte Wirkpfade. Kandidaten und Suchthemen sind verschiedene Prüfstände; nur Kandidaten gehen in die aggregierte Bestandsanzeige ein. Alle Prüfzustände starten bei SOURCE_NEEDED.</p><label for="research-search">Privates Register durchsuchen</label><input class="wl-input" id="research-search" type="search"><label for="research-mode">Quellen- und Gegenstandsrolle</label><select class="wl-input" id="research-mode"><option value="">Alle Rollen</option>${['DIREKT_VERWENDET','META_ERWAEHNT','ANALYTISCHES_LEMMA','watch','source','chain'].map(v=>`<option>${v}</option>`).join('')}</select><p id="research-count" role="status">${objects.length} private Objekte</p>${list(objects)}<h2>17 unveränderte Vorarbeiten</h2><p>Nur Referenzen auf das vorhandene Nachtragsregister. „Hitler war ein Linker“ ist eine Überschneidung; kein zusätzlicher freigegebener Eintrag.</p><ul>${index.previous17.map(o=>`<li><a href="/wirkungslexikon/redaktion/narrativketten/${escape(o.id.toLowerCase())}/">${escape(o.id)}</a></li>`).join('')}</ul><h2>Methodik der Lieferung</h2><pre class="wl-codebox">${escape(fs.readFileSync(path.join(index.source,'03_METHODIK/RECHERCHEMETHODIK_UND_EVIDENZTRENNUNG.md'),'utf8'))}</pre><p><a href="/wirkungslexikon/redaktion/">Hauptredaktion</a></p>`)}],familyLinks={};
 for(const o of objects){const e=researchValue(o,base),refs=(e.quellen_ids||[]).map(id=>index.objects[id]);
  if(o.type==='candidate')for(const id of e.narrativfamilien_v9)(familyLinks[id]||=[]).push({title:o.title,url:route(o)});
  const roles=o.type==='candidate'?{dokumentierte_originalverwendung:e.belegmodus==='DIREKT_VERWENDET'?e.nachgewiesene_verwendung:null,metasprachliche_erwaehnung:e.belegmodus==='META_ERWAEHNT'?e.nachgewiesene_verwendung:null,analytisches_lemma:e.belegmodus==='ANALYTISCHES_LEMMA'?e.lemma:null}:{};
  const questions=o.type==='candidate'?`<h2>Prüfpfad mit offenen Stufen</h2>${structured({belegter_ausdruck:e.nachgewiesene_verwendung,umdeutung_oder_rahmung:e.bedeutungsverschiebung_oder_rahmung,kanal_und_akteursrolle:null,mechanismus_hypothese:e.mechanismus_arbeitshypothese,denkbare_zustandsaenderung:e.wirkungspotenzial_bedingt,mpd_referenz:'Betroffene, Raum, Zeitraum und Schutzgrenzen im Fachreview konkretisieren; keine Personenbewertung.',unabhaengiger_wirkungsnachweis:null,politischer_entscheidungsbezug_als_hypothese:e.politische_entscheidungs_vorwirkung_hypothese})}`:'';
  extraPages.push({rel:'redaktion/breitrecherche/'+o.id.toLowerCase()+'/',title:o.title+' · privater Rechercheentwurf',html:wrap(`<p><a href="/wirkungslexikon/redaktion/breitrecherche/">Privates Forschungsregister</a></p><h1>${escape(o.title)}</h1>${guard}${Object.keys(roles).length?'<h2>Drei getrennte Wortlautrollen</h2>'+structured(roles):''}${questions}<h2>Quellen und ihre Grenzen</h2><ul>${refs.map(q=>'<li>'+link(q)+' · '+escape(researchValue(q,base).rolle)+'</li>').join('')}</ul><p>Verifikationsperson und Prüfzeitpunkt: offen. Ein vorhandener Link bestätigt weder Wortlaut noch Kontext. Gegenposition und Originalquelle getrennt lesen; keine Absichts- oder Netzwerkzuschreibung aus dem Themenbezug.</p><h2>Vollständiger gelieferter Entwurf</h2>${structured(e)}<h2>Versionsverlauf</h2>${structured(o.history.length?o.history:index.events)}<p class="wl-small">Revision: ${escape(o.draftHash)} · öffentlich: nein.</p><details><summary>Rechercheentwurf bearbeiten</summary><form id="wl-supplement-editor" class="wl-stack" data-endpoint="/api/wirkungslexikon/breitrecherche" data-supplement-id="${escape(o.id)}" data-revision="${o.draftHash}"><label for="supplement-json">Vollständiger Entwurf als JSON</label><textarea id="supplement-json" class="wl-codebox" rows="24" required>${escape(JSON.stringify(e,null,2))}</textarea><label for="supplement-reason">Änderungsgrund</label><input class="wl-input" id="supplement-reason" required minlength="10" maxlength="2000"><button class="wl-btn" type="submit">Privaten Entwurf speichern</button><p id="supplement-result" role="status"></p></form></details>`)});
 }
 return {extraPages,familyLinks};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),v=k=>args[args.indexOf(k)+1];
 if(args[0]==='add'){const request=read(path.resolve(v('--file')));console.log(JSON.stringify(addResearch(request,{role:'editor',subject:process.env.WL_EDITOR_SUBJECT||'local-editor'})));process.exit(0);}
 if(args[0]!=='import')throw Error('Use import --source ... --archive ... OR add --file <private-request.json>');
 const index=importResearch(path.resolve(v('--source')),{archive:path.resolve(v('--archive'))});console.log(JSON.stringify({objects:Object.keys(index.objects).length,counts:index.counts,archiveSha256:index.archiveSha256,approvalsCreated:0}));
}
