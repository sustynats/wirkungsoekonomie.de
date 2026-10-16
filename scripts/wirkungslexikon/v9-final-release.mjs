// This one-off intake records the direct, named human approval for one exact archive.
// It does not manufacture a signature or attest to individual source checks.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {ROOT,CONTENT,read,atomic,sha,validate} from './model.mjs';
import {V9,loadStore,digest,snapshot,event} from './v9-store.mjs';
import {buildV9} from './v9-build.mjs';
const input=path.join(ROOT,'../v9-redaktion-abschluss-eingang-20261016');
const archive='/Users/hagen/Dropbox/WOEK/Wirkungslexikon/WOEK_Wirkungslexikon_V9_REDAKTION_ABSCHLUSS_2026-10-16.zip';
const archiveHash='a0d7f812580c380c78958b9ac5e094ed2e34e6c26ce037ec5afa88cb51af6315';
assert.equal(sha(fs.readFileSync(archive)),archiveHash,'Wrong approved archive');
const store=loadStore(),original=read(path.join(store.source,'01_DATEN/MASTER_V8_REDAKTIONSUEBERGABE_180.json'));
const patch=read(path.join(input,'02_REDAKTION/CODEX_KARTENPATCH_63_NACH_SLUG.json'));
assert.equal(sha(fs.readFileSync(path.join(store.source,'01_DATEN/MASTER_V8_REDAKTIONSUEBERGABE_180.json'))),patch.base_sha256);
const merged=read(path.join(input,'02_REDAKTION/MASTER_V8_63_KORRIGIERT_NICHT_FREIGEGEBEN.json'));
const expected=structuredClone(original);assert.equal(patch.updates.length,63);assert.equal(new Set(patch.updates.map(p=>p.slug)).size,63);
for(const p of patch.updates){const e=expected.entries.find(e=>e.slug===p.slug);assert(e);assert.deepEqual(Object.keys(p.field_values).sort(),p.changed_top_level_keys.slice().sort());Object.assign(e,p.field_values);}
// The approved full master additionally separates adoption/publication dates on 57 AfD programme references.
let supplementalDates=0;for(const e of expected.entries){const target=merged.entries.find(x=>x.slug===e.slug);if(digest(e)!==digest(target)){assert.equal(e.quellen[0].id,'afd25');assert.equal(e.quellen[0].date,'2025');assert.equal(target.quellen[0].date,null);assert.equal(target.quellen[0].adopted_on,'2025-01-12');assert.equal(target.quellen[0].publication_date_status,'PDF_PUBLIKATIONSDATUM_NICHT_FESTGESTELLT');Object.assign(e.quellen[0],{date:null,adopted_on:'2025-01-12',publication_date_status:'PDF_PUBLIKATIONSDATUM_NICHT_FESTGESTELLT'});supplementalDates++;}}
assert.equal(supplementalDates,57);assert.deepEqual(expected.entries,merged.entries,'Unexplained final-master conflict');
assert.equal(merged.entries.length,180);
const receiptFile=path.join(V9,'FINAL_HUMAN_APPROVAL.json');
if(!fs.existsSync(receiptFile)){
 for(const before of original.entries){const o=store.objects[before.id];assert.equal(o.slug,before.slug);assert.equal(o.draftHash,digest(before),'Concurrent draft edit: '+before.id);const after=merged.entries.find(e=>e.id===before.id);assert.equal(after.slug,before.slug);assert.equal(after.pruefstatus,before.pruefstatus);o.draftHash=snapshot(after);}
 event(store,{action:'final_63_patch_intake',role:'technical-import',subject:'Codex',archiveSha256:archiveHash,changedCards:63,sourceRegisterSha256:digest(merged.quellenregister),approvalsCreated:0});
 const receipt={id:'natalie-weber-v9-final-20261016',person:'Natalie Weber',channel:'direct_user_message',identityBasis:'Name von der Nutzerin im selben Gespräch ausdrücklich bestätigt',statement:'noch einmal eine Überarbeitung. Ablage: /WOEK/Wirkungslexikon/WOEK_Wirkungslexikon_V9_REDAKTION_ABSCHLUSS_2026-10-16.zip Hiermit gebe ich alle Inhalte fachlich frei zur Veröffentlichung',recordedAt:new Date().toISOString(),archiveSha256:archiveHash,scope:'Alle Inhalte des benannten Abschlussarchivs und seines unveränderten Referenzpakets; Live-Veröffentlichung direkt beauftragt.',limitations:'Dokumentierte fachliche und Veröffentlichungsfreigabe. Keine Behauptung zusätzlicher Einzelquellenprüfungen, keiner kryptographischen Signatur und keiner empirischen Wirkungsvalidierung.',objects:Object.values(store.objects).map(o=>({id:o.id,type:o.type,revision:o.draftHash}))};
 atomic(receiptFile,receipt);
 for(const o of Object.values(store.objects)){o.frozenHash=o.draftHash;o.approvedHash=o.draftHash;o.approvalReceipt=receipt.id;o.state='menschlich_freigegeben';}
 event(store,{action:'direct_human_publication_approval',subject:'Natalie Weber',role:'publisher',receiptSha256:digest(receipt),objects:receipt.objects,archiveSha256:archiveHash});
}
const receipt=read(receiptFile);assert.equal(receipt.archiveSha256,archiveHash);for(const o of receipt.objects)assert.equal(store.objects[o.id].draftHash,o.revision,'Approval stale');
const protocol=read(path.join(input,'02_REDAKTION/PRUEFPROTOKOLL_63.json')),bySlug=Object.fromEntries(protocol.map(x=>[x.slug,x]));
const originalKeys=Object.keys(read(path.join(store.source,'01_DATEN/V3_ORIGINAL_MASTER_UNVERAENDERT.json')).entries[0]);
const extraKeys=['lemma_kurz','originalwortlaut','original_textstelle_als_beleg','lemma_zitat_status','kategorien_begruendung','psychologischer_mechanismus_standardisiert','thema_normalisiert','alternative_verwendung','wirkungspotenzial_belegart','evidenztrennung','langzeitbeobachtung','ziel_absicht_beleglage','langfristiges_potenzial','analystische_sicherheit'];
const corpora={},confirmedNarrativeLinks={},history={};
const entries=merged.entries.map(e=>{
 const p=bySlug[e.slug];const lemma=p?.quellen_rolle==='REDAKTIONELLES_LEMMA_KEIN_ORIGINALZITAT'||!e.originalwortlaut||/kein.*(?:originalzitat|sprecherzitat)/i.test(e.lemma_zitat_status||'');
 const projected=Object.fromEntries([...new Set([...originalKeys,...extraKeys])].filter(k=>Object.hasOwn(e,k)).map(k=>[k,e[k]]));
 const source=e.quellen.find(q=>q.id===e.originalnachweis.quelle_id);assert(source,'No original source: '+e.id);
 const secondary=/journalist|sekundär|medienbericht|pressebericht/i.test(source.role)&&!/Primärveröffentlichung/.test(source.role);
 projected.pruefstatus='freigegeben';projected.version='9.0';projected.geprueft_am='2026-10-16';
 projected.publication={approval:receipt.id,sourceRevision:store.objects[e.id].draftHash,quoteClass:p?.quellen_rolle||(lemma?'REDAKTIONELLES_LEMMA_KEIN_ORIGINALZITAT':'QUELLENAUSZUG'),quoteDisplay:!lemma,sourceKind:secondary?'secondary':'primary'};
 projected.zitierstatus=lemma?'Redaktionelles Lemma - kein Sprecherzitat':secondary?'Wörtlicher Quellenauszug; Quellenrolle beachten':'Belegter Quellenauszug; siehe Originalfundstelle';
 projected.redaktioneller_vorbehalt='Fachlich und zur Veröffentlichung freigegeben durch Natalie Weber, 16.10.2026. Quellenbehauptungen bleiben attribuiert; Wirkungspotenziale sind keine empirisch nachgewiesenen Einzelfallwirkungen.';
 if(e.slug.startsWith('offen-')){const afd=/\bAfD\b/.test(e.akteur);corpora[e.id]={key:afd?'afd-aussagen':'belegte-begriffsverwendung',short:afd?'AfD · dokumentierte Aussage':e.akteur,area:afd?'afd':'umdeutungen'};projected.korpus=afd?'AfD - dokumentierte öffentliche Aussage':'Belegte Begriffsverwendung - unterschiedliche Urheber';}
 if(e.korpus.includes('Policy Paper'))corpora[e.id]={key:'ifr-papier',short:'Sellner/IFR · Originalpapier Sachsen-Anhalt',area:'ifr',sekundaer:false};
 confirmedNarrativeLinks[e.id]=e.narrativeinordnung_v7?.narrativ_ids||[];
 history[e.slug]=[{date:'2026-10-15',version:'3.0',actor:'Datenübernahme',reason:'Original-ID, Slug und historischer Prüfstatus unverändert archiviert.'},{date:'2026-10-16',version:'9.0 · '+store.objects[e.id].draftHash.slice(0,12),actor:'Natalie Weber',reason:'Redaktionelle Abschlussfassung und direkte fachliche Veröffentlichungsfreigabe.'}];
 return projected;
});
const data={...read(path.join(store.source,'01_DATEN/V3_ORIGINAL_MASTER_UNVERAENDERT.json')),entries,quellenregister:merged.quellenregister,stand:'2026-10-16',releaseVersion:'V9'};
const policy=read(path.join(CONTENT,'publication-policy.json'));policy.lexikon={...policy.lexikon,released:true,person:'Natalie Weber',status:'V9_DIRECT_HUMAN_APPROVAL',version:'V9',approvalReceipt:receipt.id,archiveSha256:archiveHash,dataSha256:digest(data)};policy.notes='Direkte neue Freigabe der Abschlussfassung durch Natalie Weber am 16.10.2026; Originale und frühere Sperren bleiben privat versioniert. Keine automatische Freigabe späterer Änderungen.';atomic(path.join(CONTENT,'publication-policy.json'),policy);validate(data);
const publicReceipt={...receipt};delete publicReceipt.identityBasis;publicReceipt.statement='Hiermit gebe ich alle Inhalte fachlich frei zur Veröffentlichung';atomic(path.join(CONTENT,'approval-v9.json'),publicReceipt);
const release={data,history,config:{publicationCorpora:corpora,confirmedNarrativeLinks},receipt:publicReceipt};
const result=buildV9({mode:'public',release});
atomic(path.join(V9,'FINAL_IMPORT_REPORT.json'),{status:'PASS',originalV3Unchanged:true,originalV8Hash:patch.base_sha256,archiveSha256:archiveHash,supplementalProgrammeDates:57,patches:patch.updates.map(p=>({slug:p.slug,fields:p.changed_top_level_keys})),quoteClasses:protocol.reduce((a,p)=>(a[p.quellen_rolle]=(a[p.quellen_rolle]||0)+1,a),{}),cards:180,families:20,dossiers:21,objects:receipt.objects,approval:publicReceipt,result});
console.log(JSON.stringify(result,null,2));
