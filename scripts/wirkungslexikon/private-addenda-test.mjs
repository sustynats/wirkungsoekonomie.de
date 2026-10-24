import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {ROOT,read,sha} from './model.mjs';import {V9,loadStore,digest} from './v9-store.mjs';
import {supplementIndex,supplementValue,supplementPresentation,saveSupplement,validateSupplement,supplementBase} from './narrative-supplement.mjs';
import {researchIndex,researchValue,researchPresentation,saveResearch,validateResearch,schemas} from './research-register.mjs';
import {methodIndex,methodValue,saveMethod} from './methodology-drafts.mjs';
const principal={role:'editor',subject:'isolated-test-editor'},main=loadStore(),mainHash=digest(main),storeHash=sha(fs.readFileSync(path.join(V9,'store.json')));
const fixture=()=>{const base=fs.mkdtempSync(path.join(os.tmpdir(),'wl-private-addenda-'));fs.copyFileSync(path.join(V9,'store.json'),path.join(base,'store.json'));for(const d of ['editorial_narrative_candidates','research_candidates','methodology-drafts'])fs.cpSync(path.join(V9,d),path.join(base,d),{recursive:true});return base;};
test('Growing private registers validate; exact V3 and canonical 221 remain unchanged',()=>{
 const s=supplementIndex(),r=researchIndex(),m=methodIndex();assert.equal(Object.keys(s.objects).length,21);assert(Object.keys(r.objects).length>=143);assert.equal(Object.keys(m.objects).length,2);
 for(const o of Object.values(s.objects)){validateSupplement(o.type,supplementValue(o),main);assert.equal(o.publicHash,null);assert.equal(o.reviewer,null);}
 for(const o of Object.values(r.objects)){validateResearch(o.type,researchValue(o),r,main);assert.equal(o.is_public,false);assert.equal(o.review_state,'SOURCE_NEEDED');assert.equal(o.verified_by,null);assert.equal(o.publicHash,null);}
 const candidates=Object.values(r.objects).filter(o=>o.type==='candidate').map(o=>researchValue(o));assert.equal(candidates.filter(e=>e.belegmodus==='DIREKT_VERWENDET').length,7);assert.equal(candidates.filter(e=>e.belegmodus==='META_ERWAEHNT').length,47);assert(candidates.filter(e=>e.belegmodus==='ANALYTISCHES_LEMMA').length>=19);assert.equal(candidates.filter(e=>e.identischer_vorarbeitskandidat.length).length,1);
 assert.equal(sha(fs.readFileSync(path.join(main.source,'01_DATEN/V3_ORIGINAL_MASTER_UNVERAENDERT.json'))),'33a5f10db91b74d6eb799a0696c0cf4d14086b4683c2d2a69a94ae88111623ae');assert.equal(Object.keys(main.objects).length,221);
});
test('Unknown references, quote upgrades and artificial human attestations fail closed',()=>{
 const r=researchIndex(),o=Object.values(r.objects).find(o=>o.type==='candidate'&&researchValue(o).belegmodus==='META_ERWAEHNT'),e=researchValue(o);
 for(const patch of [{quellen_ids:['UNKNOWN']},{narrativfamilien_v9:['not-a-family']},{hat_originalwortlaut_zitat:true},{approved:true},{review_state:'APPROVED'},{verified_by:'invented'},{extra:{menschliche_freigabe:'yes'}}])assert.throws(()=>validateResearch('candidate',{...e,...patch},r,main));
 const s=Object.values(supplementIndex().objects).find(o=>o.type==='chain'),chain=supplementValue(s);assert.throws(()=>validateSupplement('chain',{...chain,knoten:[{...chain.knoten[0],approved:true}]},main),/HUMAN_REVIEW/);
 assert.throws(()=>validateSupplement('chain',{...chain,relationen:[{...chain.relationen[0],nach:'UNKNOWN'}]},main),/UNKNOWN_EDGE/);
 assert.equal(Object.keys(schemas).length,4);
});
test('Editors save independent, revision-checked drafts; published scientific objects are never mutated',()=>{
 const base=fixture();try{
  const ro=Object.values(researchIndex(base).objects).find(o=>o.type==='candidate'),e=researchValue(ro,base),args={id:ro.id,entry:{...e,qa_offen:e.qa_offen+' Testnotiz.'},expectedHash:ro.draftHash,reason:'Isolierte redaktionelle Testrevision.'};
  const result=saveResearch(args,principal,base);assert.notEqual(result.revision,ro.draftHash);assert.equal(result.approved,false);assert.throws(()=>saveResearch(args,principal,base),/REVISION_CONFLICT/);assert.throws(()=>saveResearch({...args,expectedHash:result.revision},{role:'viewer',subject:'test'},base),/EDITOR_REQUIRED/);
  const so=Object.values(supplementIndex(base).objects).find(o=>o.type==='candidate'),sv=supplementValue(so,base);const sr=saveSupplement({id:so.id,entry:{...sv,offene_fragen:'Isolierte Testfrage.'},expectedHash:so.draftHash,reason:'Isolierter Test der Nachtragsrevision.'},principal,base);assert.equal(sr.approved,false);assert.equal(supplementIndex(base).objects[so.id].publicHash,null);
  const mo=Object.values(methodIndex(base).objects)[0],mv=methodValue(mo,base);const mr=saveMethod({id:mo.id,entry:{...mv,markdown:mv.markdown+'\n\nTestrevision.'},expectedHash:mo.draftHash,reason:'Isolierter Methodiktest ohne Freigabe.'},principal,base);assert.equal(mr.approved,false);assert.throws(()=>saveMethod({id:mo.id,entry:{...mv,status:'APPROVED'},expectedHash:mr.revision,reason:'Kein automatischer Freigabestatus.'},principal,base),/INVALID_METHOD_DRAFT/);
  assert.equal(digest(loadStore(base)),mainHash);assert.equal(sha(fs.readFileSync(path.join(V9,'store.json'))),storeHash);
 }finally{fs.rmSync(base,{recursive:true,force:true});}
});
test('Private presentation preserves source roles, uncertainties and escaping',()=>{
 const r=researchPresentation(),s=supplementPresentation();assert.equal(r.extraPages.length,Object.keys(researchIndex().objects).length+1);assert.equal(s.extraPages.length,22);
 assert(r.extraPages[0].html.includes('DIREKT_VERWENDET'));assert(r.extraPages[0].html.includes('ANALYTISCHES_LEMMA'));assert(s.extraPages.some(p=>p.html.includes('keine durchgängige kausale Wirkungskette')));
 const base=fixture();try{const o=Object.values(researchIndex(base).objects).find(o=>o.type==='candidate'),e=researchValue(o,base);saveResearch({id:o.id,entry:{...e,lemma:'<script>window.bad=true</script>'},expectedHash:o.draftHash,reason:'Isolierter Test von HTML-Escaping.'},principal,base);const html=researchPresentation(base).extraPages.map(p=>p.html).join('');assert(!html.includes('<script>window.bad'));assert(html.includes('&lt;script&gt;'));}finally{fs.rmSync(base,{recursive:true,force:true});}
});
test('Public output contains none of the new private IDs, raw source records or methodological drafts',()=>{
 const pub=path.join(ROOT,'outputs/wirkungslexikon/public/wirkungslexikon'),ids=[...Object.keys(supplementIndex().objects),...Object.keys(researchIndex().objects),...Object.keys(methodIndex().objects)];
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const file of walk(pub).filter(f=>/\.(html|json|xml|mjs|js|txt)$/.test(f))){if(file.endsWith('/.generated.json'))continue;const text=fs.readFileSync(file,'utf8');for(const id of ids.filter(id=>!/^Q\d+$/.test(id)))assert(!text.includes(id),file+': '+id);assert(!text.includes('jessicas.diary0'));assert(!text.includes('WOEK-RECHERCHE-20261016-'));}
 assert(!fs.existsSync(path.join(pub,'redaktion/breitrecherche')));assert(!fs.existsSync(path.join(pub,'redaktion/methodik')));const runtime=read(path.join(pub,'runtime.json'));assert.equal(runtime.data.entries.length,180);
});
