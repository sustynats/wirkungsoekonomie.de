import fs from 'node:fs';
import path from 'node:path';
import {read} from './model.mjs';
import {V9,loadStore,snapshot,event,digest} from './v9-store.mjs';
import {escape,structured} from './v9-review.mjs';

export const methodBase=(base=V9)=>path.join(base,'methodology-drafts');
export const methodIndex=(base=V9)=>fs.existsSync(path.join(methodBase(base),'store.json'))?read(path.join(methodBase(base),'store.json')):{objects:{},events:[],approvalEnabled:false};
export const methodValue=(o,base=V9)=>{const value=read(path.join(methodBase(base),'snapshots',o.draftHash+'.json'));if(digest(value)!==o.draftHash)throw Error('METHOD_SNAPSHOT_MISMATCH');return value;};
export function saveMethod({id,entry,expectedHash,reason},principal,base=V9){
 if(principal.role!=='editor'||!principal.subject)throw Error('EDITOR_REQUIRED');
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||entry.id!==id||typeof entry.title!=='string'||typeof entry.markdown!=='string'||entry.markdown.length<100||entry.markdown.length>100000||!Array.isArray(entry.sourceRefs)||!Array.isArray(entry.relatedSlugs)||entry.status!=='ENTWURF')throw Error('INVALID_METHOD_DRAFT');
 if(Object.keys(entry).some(k=>!['id','title','markdown','sourceRefs','relatedSlugs','status'].includes(k)))throw Error('METHOD_APPROVAL_FORBIDDEN');
 // The existing Markdown renderer escapes HTML. Restrict link targets and quotes too.
 for(const match of entry.markdown.matchAll(/\]\(([^)\s]+)\)/g))if(!/^https:\/\//.test(match[1])||/["<>]/.test(match[1]))throw Error('INVALID_MARKDOWN_LINK');
 const cards=new Set(Object.values(loadStore(base).objects).filter(o=>o.type==='wirkungskarte').map(o=>o.slug));if(entry.relatedSlugs.some(s=>!cards.has(s)))throw Error('UNKNOWN_V3_REFERENCE');
 const index=methodIndex(base),old=index.objects[id];if((old?.draftHash||null)!==expectedHash)throw Error('REVISION_CONFLICT');if(typeof reason!=='string'||reason.trim().length<10||reason.length>2000)throw Error('REASON_REQUIRED');
 const revision=snapshot(entry,methodBase(base));index.objects[id]={id,title:entry.title,draftHash:revision,is_public:false,publicHash:null,review_state:'SOURCE_NEEDED',verified_by:null,verified_at:null,history:[...(old?.history||[]),{at:new Date().toISOString(),subject:principal.subject,reason,revision}]};
 event(index,{action:'methodology_draft_saved',object:id,subject:principal.subject,role:principal.role,revision,reason,approvalsCreated:0},methodBase(base));return {id,entry,revision,approved:false};
}
export function methodPresentation(base,render){
 const index=methodIndex(base),pages=[];
 for(const o of Object.values(index.objects)){
  const e=methodValue(o,base),file=path.join(methodBase(base),'render-'+o.draftHash+'.md');fs.writeFileSync(file,e.markdown,{mode:0o600});
  pages.push({rel:'redaktion/methodik/'+o.id+'/',title:o.title+' · redaktioneller Entwurf',html:'<div class="wl-container wl-prose wl-section-space"><p class="wl-guard">Geschützter Methodikentwurf · keine Publikationsfreigabe · menschliches Quellen- und Fachreview offen.</p>'+render(file)+'<h2>Version und redaktionelle Bearbeitung</h2><p>Revision: '+escape(o.draftHash)+' · öffentlich: nein.</p>'+structured(o.history)+`<details><summary>Neue private Revision speichern</summary><form id="wl-supplement-editor" class="wl-stack" data-endpoint="/api/wirkungslexikon/methodik-entwuerfe" data-supplement-id="${escape(o.id)}" data-revision="${o.draftHash}"><label for="supplement-json">Methodikentwurf als JSON mit Markdown</label><textarea id="supplement-json" class="wl-codebox" rows="24" required>${escape(JSON.stringify(e,null,2))}</textarea><label for="supplement-reason">Änderungsgrund</label><input id="supplement-reason" class="wl-input" required minlength="10" maxlength="2000"><button class="wl-btn" type="submit">Privaten Entwurf speichern</button><p id="supplement-result" role="status"></p></form></details><p><a href="/wirkungslexikon/redaktion/">Hauptredaktion</a></p></div>`});
 }
 return pages;
}
