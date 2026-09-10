import { hash, safeUrl, JOB_ID } from './contract.mjs';
import {publicPersonalEdition} from '../personal-editorial.mjs';
import { renderEditorialMarkdown } from '../editorial-markdown.mjs';
import {validateApprovedNews,publicNewsEdition} from './approved-news.mjs';
import {storyPage} from '../build.mjs';

const fail=(code,status=400)=>{throw Object.assign(Error(code),{status});};
const actor=id=>/^\d{15,22}$/.test(id||'');
export function editorialPreviewHash(preview){
  return hash({title:preview.title,subtitle:preview.subtitle||'',markdown:preview.markdown,
    sources:preview.sources,visual:preview.visual||null,format:preview.format,author_notes:preview.author_notes||'',source_media:preview.source_media||null,news_record:preview.news_record||null});
}
export function validateEditorialPreview(value){
  if(!value||!['news','opinion_analysis','book_review','listened','watched'].includes(value.format)
    ||typeof value.title!=='string'||value.title.length<5||value.title.length>250
    ||typeof value.markdown!=='string'||value.markdown.length<100||value.markdown.length>100000
    ||!Array.isArray(value.sources)||!value.sources.length||value.sources.length>40)fail('EDITORIAL_PREVIEW_INVALID');
  for(const s of value.sources){safeUrl(s.url);if(!s.title||!s.publisher)fail('EDITORIAL_PREVIEW_SOURCE_INVALID');}
  if(value.format==='news'){validateApprovedNews(value.news_record);if(value.title!==value.news_record.title||value.markdown!==value.news_record.source_summary)fail('EDITORIAL_NEWS_PREVIEW_CHANGED');}
  if(['listened','watched'].includes(value.format)){const m=value.source_media;if(!m?.show||!m.episode_title||!m.original_release_date)fail('EDITORIAL_ORIGINAL_REQUIRED');safeUrl(m.original_url);}
  if(value.visual){
    const v=value.visual;
    if(!/^https:\/\/wirkungsoekonomie\.de\//.test(v.url||'')||!v.alt||!v.credit
      ||!['OWN','CLEARED','LICENSED','CC_LICENSED','PERMISSION_GRANTED'].includes(v.rights_status)
      ||v.allow_website!==true||v.expires_at&&(!Number.isFinite(Date.parse(v.expires_at))||Date.parse(v.expires_at)<=Date.now()))fail('EDITORIAL_PREVIEW_IMAGE_NOT_CLEARED');
  }
  if(value.checks?.source_binding!==true||value.checks?.editorial_validation!==true
    ||value.checks?.personal_experiences_invented!==false)fail('EDITORIAL_PREVIEW_CHECKS_REQUIRED');
  renderEditorialMarkdown(value.markdown);
}

// Final approvals have their own rows in the SAME private bridge database.
// Routine store.put snapshots cannot overwrite a concurrent editorial decision.
export class EditorialApproval {
  constructor(db,{now=()=>new Date().toISOString()}={}){
    this.db=db;this.now=now;
    db.exec('CREATE TABLE IF NOT EXISTS editorial_reviews(job_id TEXT PRIMARY KEY,owner TEXT NOT NULL,body TEXT NOT NULL); CREATE TABLE IF NOT EXISTS editorial_review_audit(id INTEGER PRIMARY KEY,job_id TEXT NOT NULL,at TEXT NOT NULL,body TEXT NOT NULL)');
  }
  get(id){const r=this.db.prepare('SELECT body FROM editorial_reviews WHERE job_id=?').get(id);return r?JSON.parse(r.body):null;}
  owned(owner,id){const r=this.get(id);if(!actor(owner)||!r||r.owner!==owner)fail('EDITORIAL_REVIEW_NOT_FOUND',404);return r;}
  list(owner){if(!actor(owner))fail('EDITORIAL_OWNER_REQUIRED',403);return this.db.prepare('SELECT body FROM editorial_reviews WHERE owner=? ORDER BY json_extract(body,\'$.updated_at\') DESC').all(owner).map(r=>JSON.parse(r.body));}
  save(record,event){this.db.prepare('INSERT INTO editorial_reviews VALUES(?,?,?) ON CONFLICT(job_id) DO UPDATE SET body=excluded.body').run(record.job_id,record.owner,JSON.stringify(record));this.db.prepare('INSERT INTO editorial_review_audit(job_id,at,body) VALUES(?,?,?)').run(record.job_id,this.now(),JSON.stringify(event));}
  // Worker-only: never expose this method through the browser API.
  stage(job,preview){
    if(!JOB_ID.test(job?.input?.job_id||'')||!actor(job.intake?.owner))fail('EDITORIAL_JOB_OWNER_REQUIRED');
    validateEditorialPreview(preview);
    this.db.exec('BEGIN IMMEDIATE');
    try{
      const id=job.input.job_id,old=this.get(id),preview_hash=editorialPreviewHash(preview);
      if(['PUBLISHING','PUBLISHED'].includes(old?.status))fail('EDITORIAL_PUBLISHED_EDITION_IMMUTABLE',409);
      if(old?.preview_hash===preview_hash){this.db.exec('COMMIT');return old;}
      const next={job_id:id,owner:job.intake.owner,manual_only:true,preview:structuredClone(preview),preview_hash,
        status:'AWAITING_FINAL_APPROVAL',approval:null,revision:(old?.revision||0)+1,
        comments:old?.comments||[],created_at:old?.created_at||this.now(),updated_at:this.now()};
      this.save(next,{action:'PREVIEW_STAGED',revision:next.revision,preview_hash,previous:old||null});this.db.exec('COMMIT');return next;
    }catch(e){this.db.exec('ROLLBACK');throw e;}
  }
  decide(owner,id,{action,preview_hash,comment=''}){
    if(!['APPROVE','REVISE','HOLD','SKIP'].includes(action))fail('EDITORIAL_ACTION_INVALID');
    this.db.exec('BEGIN IMMEDIATE');
    try{
      const r=this.owned(owner,id);
      if(['PUBLISHING','PUBLISHED'].includes(r.status))fail('EDITORIAL_PUBLISHED_EDITION_IMMUTABLE',409);
      if(preview_hash!==r.preview_hash||editorialPreviewHash(r.preview)!==r.preview_hash)fail('EDITORIAL_PREVIEW_CHANGED',409);
      if(action==='APPROVE'&&r.status==='APPROVED_FOR_PUBLICATION'){this.db.exec('COMMIT');return r;}
      if(!['AWAITING_FINAL_APPROVAL','HOLD','APPROVED_FOR_PUBLICATION','NEEDS_REVIEW'].includes(r.status)||r.status==='NEEDS_REVIEW'&&action==='APPROVE')fail('EDITORIAL_REVIEW_NOT_READY',409);
      if(typeof comment!=='string'||comment.length>10000||action==='REVISE'&&!comment.trim())fail('EDITORIAL_COMMENT_REQUIRED');
      const next={...r,status:{APPROVE:'APPROVED_FOR_PUBLICATION',REVISE:'REVISION_REQUESTED',HOLD:'HOLD',SKIP:'SKIPPED'}[action],updated_at:this.now(),approval:null};
      if(action==='APPROVE'){validateEditorialPreview(r.preview);next.approval={by:owner,at:this.now(),preview_hash};}
      if(comment.trim())next.comments=[...r.comments,{by:owner,at:this.now(),preview_hash,comment:comment.trim()}];
      this.save(next,{action,by:owner,preview_hash,comment:comment.trim()});this.db.exec('COMMIT');return next;
    }catch(e){this.db.exec('ROLLBACK');throw e;}
  }
  pendingPublication(){return this.db.prepare("SELECT body FROM editorial_reviews WHERE json_extract(body,'$.status') IN ('APPROVED_FOR_PUBLICATION','PUBLISHING')").all().map(r=>JSON.parse(r.body));}
  claimPublications(){
    this.db.exec('BEGIN IMMEDIATE');
    try{const snapshots=[];for(const r of this.pendingPublication()){
      if(r.status==='PUBLISHING'){validateEditorialPreview(r.preview);snapshots.push(r.publication.edition);continue;}
      if(!this.publishable(r.job_id))continue;
      const edition=r.preview.format==='news'?publicNewsEdition(r):publicPersonalEdition(r);r.publication={edition,started_at:this.now()};r.status='PUBLISHING';r.updated_at=this.now();
      this.save(r,{action:'PUBLICATION_STARTED',content_hash:edition.content_hash});snapshots.push(edition);
    }this.db.exec('COMMIT');return snapshots;}catch(e){this.db.exec('ROLLBACK');throw e;}
  }
  markPublished(content_hash,url){
    const r=this.pendingPublication().find(r=>r.publication?.edition.content_hash===content_hash);if(!r)return false;
    const e=r.publication.edition,expected='https://wirkungsoekonomie.de/wirkungsticker/'+(e.format==='approved_news'?e.record.slug:'analyse/'+e.slug)+'/';
    if(url!==expected)fail('EDITORIAL_PUBLICATION_URL_INVALID');
    r.status='PUBLISHED';r.publication.url=url;r.publication.published_at=this.now();r.updated_at=this.now();this.save(r,{action:'PUBLICATION_VERIFIED',content_hash,url});return true;
  }
  publicationFailed(content_hash,code){
    const r=this.pendingPublication().find(r=>r.publication?.edition.content_hash===content_hash);if(!r)return false;
    r.status='NEEDS_REVIEW';r.approval=null;r.publication.error=/^[A-Z_]+$/.test(code||'')?code:'EDITORIAL_PUBLICATION_REVIEW_REQUIRED';r.updated_at=this.now();
    this.save(r,{action:'PUBLICATION_REVIEW_REQUIRED',code:r.publication.error});return true;
  }
  publishable(id){const r=this.get(id);if(!r||r.manual_only!==true||r.status!=='APPROVED_FOR_PUBLICATION'||r.approval?.preview_hash!==editorialPreviewHash(r.preview)||r.preview_hash!==r.approval.preview_hash)return false;try{validateEditorialPreview(r.preview);return true;}catch{return false;}}
  preview(owner,id){const r=this.owned(owner,id);return {...r,html_document:r.preview.format==='news',html:r.preview.format==='news'?storyPage(r.preview.news_record,{privateImpactPreview:true}).replace('<head>','<head><base href="https://wirkungsoekonomie.de/wirkungsticker/'+r.preview.news_record.slug+'/">'):renderEditorialMarkdown(r.preview.markdown).html};}
}
