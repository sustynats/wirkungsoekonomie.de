import fs from 'node:fs';
import path from 'node:path';
import {hash} from './bridge/contract.mjs';
import {renderEditorialMarkdown,renderEditorialMarkdownWithFootnotes} from './editorial-markdown.mjs';

export const EDITORIAL_REVISION_FORMAT='approved_editorial_revision';
export const EDITORIAL_REVISION_FILE='data/news/editorial-revisions.json';
const fail=()=>{throw Error('EDITORIAL_REVISION_INVALID');};
export function assertFinalPersonalSection(markdown,{footnotes=false}={}){
 const parsed=footnotes?renderEditorialMarkdownWithFootnotes(markdown):renderEditorialMarkdown(markdown);
 const content=parsed.headings.filter(h=>h.level===2&&!/^(?:Das Buch|Quellen(?: und (?:Originale|Bezugspunkte|weiterführende Einordnung))?|Literatur|Originalfolge|Redaktioneller Hinweis)$/i.test(h.title));
 if(content.at(-1)?.title!=='Meine Einordnung')throw Error('EDITORIAL_FINAL_PERSPECTIVE_REQUIRED');
 return parsed;
}
export function editorialRevisionBaseHash(base){
 return hash(base.format==='book_and_impact'
  ? {analysis_id:base.analysis_id,slug:base.slug,manuscript_sha256:base.manuscript_sha256,body_markdown:base.body_markdown}
  : base);
}
// A revision changes a named existing publication. It cannot create a second URL,
// change its identity, replace its sources or inherit an earlier final approval.
export function validateEditorialRevisionPreview(preview){
 const r=preview.editorial_revision;if(!r)return;
 const {base,target,patch}=r;
 if(preview.format==='news'||!base||!target||!patch||base.status!=='published'
  ||base.analysis_id!==target.analysis_id||base.slug!==target.slug
  ||!/^woek-(?:analysis|manual)-[a-f0-9]+$/.test(target.analysis_id||'')
  ||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(target.slug||'')
  ||target.base_hash!==editorialRevisionBaseHash(base)||preview.title!==base.title)fail();
 if(base.format==='book_and_impact'){
  if(preview.format!=='book_review'||Object.keys(patch).join(',')!=='body_markdown'
   ||patch.body_markdown!==preview.markdown||typeof patch.body_markdown!=='string')fail();
  assertFinalPersonalSection(patch.body_markdown,{footnotes:base.self_authored_work});
 }else{
  if(preview.format!=='opinion_analysis'||Object.keys(patch).join(',')!=='author_perspective')fail();
  const p=patch.author_perspective;
  if(!Array.isArray(p?.paragraphs)||!p.paragraphs.length||p.paragraphs.length>8
   ||p.paragraphs.some(t=>typeof t!=='string'||!t.trim()||t.length>4000)
   ||!Array.isArray(p.claim_indices)||p.claim_indices.some(i=>!Number.isInteger(i)||!base.claim_ledger?.[i]))fail();
  const tail=preview.markdown.split('## Meine Einordnung\n\n');
  if(tail.length!==2||tail[1].trim()!==p.paragraphs.join('\n\n').trim())fail();
 }
}
export function reviseEditorial(base,revision,{at,content_hash}={}){
 if(revision.target.base_hash!==editorialRevisionBaseHash(base))throw Error('EDITORIAL_REVISION_BASE_CHANGED');
 const value={...base,...structuredClone(revision.patch),author_perspective_position:'last'};
 if(base.format==='book_and_impact')value.rendered=base.self_authored_work
  ?renderEditorialMarkdownWithFootnotes(value.body_markdown):renderEditorialMarkdown(value.body_markdown);
 if(at)value.updated_at=at;
 if(content_hash){
  value.approved_editorial_revision={content_hash,at,base_hash:revision.target.base_hash};
  value.versions=[...(base.versions||[]),{date:at.slice(0,10),note:'Redaktionell erneut freigegebene Fassung mit abschließender persönlicher Einordnung.',content_hash}];
 }
 return value;
}
export function publicEditorialRevision(review){
 validateEditorialRevisionPreview(review.preview);
 if(!review.preview.editorial_revision||!review.approval?.at)fail();
 const {target,patch}=review.preview.editorial_revision;
 const value={format:EDITORIAL_REVISION_FORMAT,manual_only:true,analysis_id:target.analysis_id,slug:target.slug,
  target,patch,published_at:review.approval.at,revision:review.revision};
 return {...value,content_hash:hash(value)};
}
export function validateApprovedEditorialRevision(value){
 const {content_hash,...body}=value||{};
 if(value?.format!==EDITORIAL_REVISION_FORMAT||value.manual_only!==true||hash(body)!==content_hash
  ||value.analysis_id!==value.target?.analysis_id||value.slug!==value.target?.slug
  ||!Number.isFinite(Date.parse(value.published_at)))fail();
}
export function applyApprovedEditorialRevisions(records,root,{partial=false}={}){
 const file=path.join(root,EDITORIAL_REVISION_FILE);if(!fs.existsSync(file))return records;
 const catalog=JSON.parse(fs.readFileSync(file));if(catalog.schema_version!=='1.0'||!Array.isArray(catalog.editions))fail();
 const ids=new Set(records.map(r=>r.analysis_id));
 for(const edition of catalog.editions){validateApprovedEditorialRevision(edition);if(!partial&&!ids.has(edition.analysis_id))throw Error('EDITORIAL_REVISION_TARGET_MISSING');}
 return records.map(record=>{
  const editions=catalog.editions.filter(e=>e.analysis_id===record.analysis_id);
  let value=record;
  for(const edition of editions)value=reviseEditorial(value,edition,{at:edition.published_at,content_hash:edition.content_hash});
  return value;
 });
}
