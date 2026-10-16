// One-off version-bound intake. Explicit user approval is a separate input file.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {ROOT,CONTENT,read,atomic,sha} from './model.mjs';
import {EXAMPLE_FIELD,validateExample,assertExampleRelease} from './examples.mjs';
import {V9,digest,loadStore,snapshot,event} from './v9-store.mjs';
const args=process.argv.slice(2),val=k=>args[args.indexOf(k)+1];
const input=path.resolve(val('--input')),out=path.resolve(val('--out')),approval=read(path.resolve(val('--approval')));
assert.equal(approval.person,'Natalie Weber');assert.equal(approval.channel,'direct_user_message');
assert.equal(approval.archiveSha256,'2e3e75c278193d86ead6b04f941220b3901a881e0cfcd58cf2a51bf9a6598495');
const original=input+'/REFERENZ/V3_ORIGINAL_MASTER_UNVERAENDERT_NUR_HASHPRUEFUNG.json';
assert.equal(sha(fs.readFileSync(original)),'33a5f10db91b74d6eb799a0696c0cf4d14086b4683c2d2a69a94ae88111623ae');
assert.equal(sha(fs.readFileSync(input+'/REFERENZ/V10_KLARSPRACHE_BASIS_180_NUR_LESEN.json')),'7920618abb853ff150e66b372fb43173f0939ce7ec2a82a20000496d405df1ee');
const patch=read(input+'/DATEN/PATCH_180_NACH_SLUG.json'),base=read(input+'/REFERENZ/V10_KLARSPRACHE_BASIS_180_NUR_LESEN.json');
const frozen=read(CONTENT+'/publication-v9.json'),before=structuredClone(frozen),store=loadStore();
assert.equal(Object.keys(patch.patch_by_slug).length,180);assert.equal(frozen.model.data.entries.length,180);
assert(!frozen.model.data.exampleApproval,'Already integrated; refuse duplicate intake');
const report=[],scenes=new Set();
for(const e of frozen.model.data.entries){
 const p=patch.patch_by_slug[e.slug],b=base.entries.find(x=>x.slug===e.slug),o=store.objects[e.id];
 assert(p&&b&&o,'Missing predecessor '+e.slug);assert.equal(p.v3_id,e.id);assert.equal(b.v3_id,e.id);
 assert.equal(o.draftHash,e.publication.sourceRevision,'Concurrent editorial revision '+e.slug);
 const prior=read(path.join(V9,'snapshots',o.draftHash+'.json')),body=validateExample(p[EXAMPLE_FIELD]);assert(!prior[EXAMPLE_FIELD]);
 const draft={...prior,[EXAMPLE_FIELD]:body},priorHash=o.draftHash;
 const nextHash=snapshot(draft);o.draftHash=nextHash;
 // Retain old states and approval pointers until the separately recorded direct approval.
 e[EXAMPLE_FIELD]=body;scenes.add(body.didaktisches_beispiel);
 report.push({id:e.id,slug:e.slug,lemma:e.begriff,priorEditorialRevision:priorHash,editorialRevision:nextHash,publicRevision:digest(e),exampleSha256:digest(body),historicalStatus:prior.pruefstatus,sourceRevision:e.publication.sourceRevision,analyseklasse:b.redaktion_v10.analyseklasse});
 frozen.model.editorial.history[e.slug].push({date:'2026-10-16',version:'10.0 · '+digest(body).slice(0,12),actor:'Natalie Weber',reason:'180 individuelle Gedankenbeispiele ergänzt. Direkte fachliche und Veröffentlichungsfreigabe im Gespräch; Originalquellen und ältere Freigaben erhalten.'});
}
assert.equal(scenes.size,180);assert.equal(report.length,180);
for(const [i,e]of frozen.model.data.entries.entries()){const stripped={...e};delete stripped[EXAMPLE_FIELD];assert.deepEqual(stripped,before.model.data.entries[i]);}
const receipt={...approval,id:'natalie-weber-examples-v10-20261016',scope:'180 Gedankenbeispiele einschließlich der gelieferten Klartext-, Gefühls- und Betroffenen-Erklärungen; keine neuen Karten oder fremden privaten Rechercheentwürfe.',individualSourceReviewsAsserted:false,individualHumanReviewsAsserted:false,cards:report.map(({id,slug,editorialRevision,publicRevision,exampleSha256})=>({id,slug,editorialRevision,publicRevision,exampleSha256}))};
event(store,{action:'v10_examples_additive_intake',role:'technical-import',subject:'Codex',objects:report,approvalsCreated:0});
for(const item of report){const o=store.objects[item.id];o.frozenHash=o.draftHash;o.approvedHash=o.draftHash;o.approvalReceipt=receipt.id;o.state='menschlich_freigegeben';}
event(store,{action:'direct_human_examples_approval',role:'publisher',subject:'Natalie Weber',receiptSha256:digest(receipt),objects:receipt.cards});
frozen.model.data.exampleApproval=receipt.id;frozen.configExtras.examplesV10=true;
frozen.configExtras.exampleApproval={person:'Natalie Weber',date:'2026-10-16',receipt:receipt.id};
frozen.textOverrides.methodik_v9+='<section id="gedankenbeispiele"><h2>Alltagsszenen als Gedankenbeispiele</h2><p>Die 180 individuellen Alltagsszenen sind frei erfundene Erklärbeispiele. Sie zeigen mögliche Vorstellungen, Gefühlsansprachen und Betroffenenperspektiven. Sie dokumentieren keine realen Vorfälle und belegen keine tatsächlich eingetretenen Gefühle, Meinungsänderungen oder politischen Folgen. Die Quellen zur Originalverwendung stehen davon getrennt auf der jeweiligen Karte.</p><p>Die Ergänzungen wurden von Natalie Weber am 16.10.2026 fachlich und zur Veröffentlichung freigegeben. Der Änderungsverlauf bewahrt die frühere Quellenrevision. In strukturierten Daten bleiben die ursprünglichen Vorschlagsflags der Lieferung erhalten; die spätere Freigabe wird getrennt und an die konkrete Revision gebunden dokumentiert.</p></section>';
const policy=read(CONTENT+'/publication-policy.json');policy.lexikon.dataSha256=digest(frozen.model.data);policy.lexikon.payloadSha256=digest(frozen);policy.lexikon.examplesRevision='V10';policy.lexikon.examplesApproval=receipt.id;
policy.notes+=' V10-Gedankenbeispiele: direkte fachliche und Veröffentlichungsfreigabe von Natalie Weber am 16.10.2026, revisionsgebunden. Keine Behauptung zusätzlicher Einzelquellenprüfungen.';
assertExampleRelease(frozen.model.data,receipt);
atomic(CONTENT+'/approval-examples-v10.json',receipt);atomic(CONTENT+'/publication-v9.json',frozen);atomic(CONTENT+'/publication-policy.json',policy);
atomic(path.join(out,'CARD_EXAMPLE_COVERAGE_180.json'),{status:'PASS',cards:180,uniqueIds:180,uniqueSlugs:180,uniqueExamples:180,unmatchedSlugs:0,emptyFields:0,originalV3Unchanged:true,previousPublicFieldsUnchanged:true,familiesUnchanged:20,dossiersUnchanged:21,sourceReviewsPerformedByThisIntake:0,individualHumanReviewsAsserted:0,directHumanApprovalCovers:180,published:0,rows:report});
console.log(JSON.stringify({cards:180,unchangedPriorFields:true,revisionBoundDirectApproval:receipt.id,publication:'NOT_DEPLOYED'}));
