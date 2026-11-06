// Preparation and verification only. This module cannot publish or mint an approval.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {read,atomic,CONTENT} from './model.mjs';
import {V9,digest} from './v9-store.mjs';
import {v11Entries,v11Route} from './v11-content.mjs';

export function prepareV11Release(base=V9){
 const rows=v11Entries(base),intake=read(path.join(base,'v11-intake-receipt.json'));
 if(rows.length!==94)throw Error('V11_RELEASE_INCOMPLETE');
 const sources=read(path.join(base,'research_candidates/store.json'));
 return {schema:'WOEK_V11_RELEASE_PLAN_V1',publication:'NOT_AUTHORIZED_BY_THIS_PLAN',packageSha256:intake.packageSha256,auditSha256:intake.auditSha256,unchangedPublicPayloadSha256:digest(read(path.join(CONTENT,'publication-v9.json'))),targets:rows.map(r=>{const m=r.value.redaktionsmetadaten;return {id:m.id,origins:m.origin_ids,folder:r.folder,revision:r.object.draftHash,contentSha256:digest(r.value),type:m.zieltyp,slug:m.slug,previewPath:v11Route(r.value),proposedPublicPath:'/wirkungslexikon/'+m.slug+'/',sourceRevisions:m.quellen_ids.map(id=>({id,revision:sources.objects[id].draftHash})),openClaims:m.offene_einzelbehauptungen,limitsSha256:digest(m.offene_einzelbehauptungen),decision:null};}),approvalTemplate:{person:'Natalie Weber',channel:'direct_user_message',evidenceRef:null,decisions:[]},instructions:'Konkrete Revision je Ziel bestätigen oder Änderungen angeben. Bei den zwei begrenzten Originalabrufen entweder Original ergänzen und neu versionieren oder die ausdrücklich begrenzte Fassung unter Angabe ihres limitsSha256 bestätigen. Aufnahmeentscheidung nicht wiederholen. Danach separaten geprüften Release erzeugen; kein automatisches Merge oder Deployment.'};
}
export function assertV11Decisions(plan,receipt,base=V9){
 if(receipt?.person!=='Natalie Weber'||receipt.channel!=='direct_user_message'||typeof receipt.evidenceRef!=='string'||!receipt.evidenceRef.trim()||!Array.isArray(receipt.decisions)||!receipt.decisions.length)throw Error('V11_CONCRETE_HUMAN_DECISIONS_REQUIRED');
 const current=new Map(v11Entries(base).map(r=>[r.object.id,r]));
 const sources=read(path.join(base,'research_candidates/store.json')),seen=new Set();
 for(const decision of receipt.decisions){
  const target=plan.targets.find(t=>t.id===decision.id),row=current.get(decision.id);
  if(seen.has(decision.id)||!target||!row)throw Error('V11_DECISION_ID_INVALID');seen.add(decision.id);
  if(decision.revision!==target.revision||row.object.draftHash!==target.revision||digest(row.value)!==target.contentSha256)throw Error('V11_STALE_DECISION');
  if(decision.decision!=='accept')throw Error('V11_DECISION_NOT_ACCEPTED');
  if(target.sourceRevisions.some(q=>sources.objects[q.id]?.draftHash!==q.revision))throw Error('V11_SOURCE_CHANGED_SINCE_PLAN');
  if(target.openClaims.length&&decision.acceptedLimitsSha256!==target.limitsSha256)throw Error('V11_SOURCE_LIMITS_DECISION_REQUIRED');
 }
 return {acceptedIds:[...seen],publicationPerformed:false,approvalsWritten:0};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),get=k=>args[args.indexOf(k)+1];
 if(args.includes('--prepare')){const plan=prepareV11Release();atomic(path.join(V9,'v11-release-plan.json'),plan);console.log(JSON.stringify({targets:plan.targets.length,withoutOpenClaims:plan.targets.filter(t=>!t.openClaims.length).length,publication:'NOT_PERFORMED'}));}
 else if(args.includes('--validate-decisions'))console.log(JSON.stringify(assertV11Decisions(read(path.join(V9,'v11-release-plan.json')),read(path.resolve(get('--validate-decisions'))))));
 else throw Error('Use --prepare or --validate-decisions <private documented human decisions.json>. No publication command exists here.');
}
