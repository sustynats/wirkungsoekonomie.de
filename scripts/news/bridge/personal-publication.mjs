import fs from 'node:fs';
import path from 'node:path';
import {PERSONAL_FILE,validatePersonalEdition} from '../personal-editorial.mjs';
import {importApprovedNews} from './approved-news.mjs';
import {loadNewsRegistry} from '../registry.mjs';
import {loadManualEditorials} from '../manual-editorial.mjs';
import {EDITORIAL_REVISION_FORMAT,EDITORIAL_REVISION_FILE,applyApprovedEditorialRevisions,validateApprovedEditorialRevision,validateEditorialRevisionPreview} from '../editorial-approved-revisions.mjs';

// Called by the existing serial Git publisher while it owns the import lock.
// The Oracle service only exports frozen versions explicitly approved by owner.
export async function importApprovedEditorials(store,root){
 if(!store.editorialClaim)return {changed:false};
 const editions=await store.editorialClaim();if(!editions.length)return {changed:false};
 const file=path.join(root,PERSONAL_FILE),data=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{schema_version:'1.0',editions:[]};
 let changed=false;const failed=[];
 for(const edition of editions){
 try{
  if(edition.format===EDITORIAL_REVISION_FORMAT){
   validateApprovedEditorialRevision(edition);
   const revisionFile=path.join(root,EDITORIAL_REVISION_FILE),revisions=fs.existsSync(revisionFile)?JSON.parse(fs.readFileSync(revisionFile)):{schema_version:'1.0',editions:[]};
   if(revisions.editions.some(e=>e.content_hash===edition.content_hash))continue;
   const analysisFile=path.join(root,'data/news/editorial-analyses.json');
   const originals=[...(fs.existsSync(analysisFile)?JSON.parse(fs.readFileSync(analysisFile)).analyses:[]),...loadManualEditorials(root)];
   const base=applyApprovedEditorialRevisions(originals,root).find(a=>a.analysis_id===edition.analysis_id);
   if(!base)throw Error('EDITORIAL_REVISION_TARGET_MISSING');
   validateEditorialRevisionPreview({format:base.format==='book_and_impact'?'book_review':'opinion_analysis',title:base.title,
    markdown:edition.patch.body_markdown||'## Meine Einordnung\n\n'+edition.patch.author_perspective?.paragraphs.join('\n\n'),
    editorial_revision:{base,target:edition.target,patch:edition.patch}});
   revisions.editions.push(edition);
   fs.mkdirSync(path.dirname(revisionFile),{recursive:true});fs.writeFileSync(revisionFile+'.tmp',JSON.stringify(revisions,null,2)+'\n');fs.renameSync(revisionFile+'.tmp',revisionFile);changed=true;continue;
  }
  if(edition.format==='approved_news'){
   const file=path.join(root,'data/news/stories.json'),catalog=JSON.parse(fs.readFileSync(file));
   const result=importApprovedNews(edition,catalog.stories,loadNewsRegistry(root),new Date().toISOString());
   if(result.changed){catalog.stories=result.stories;catalog.public_updated_at=new Date().toISOString();fs.writeFileSync(file+'.tmp',JSON.stringify(catalog,null,2)+'\n');fs.renameSync(file+'.tmp',file);changed=true;}continue;
  }
  validatePersonalEdition(edition);
  const previous=data.editions.find(e=>e.analysis_id===edition.analysis_id);
  if(previous){if(previous.content_hash!==edition.content_hash)throw Error('PERSONAL_PUBLISHED_EDITION_CHANGED');continue;}
  if(data.editions.some(e=>e.slug===edition.slug))throw Error('PERSONAL_SLUG_COLLISION');
  data.editions.push(edition);changed=true;
 }catch(error){failed.push({content_hash:edition.content_hash,code:error.message});if(store.editorialFailure)await store.editorialFailure(edition.content_hash,error.message);}
 }
 if(changed){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(data,null,2)+'\n');fs.renameSync(file+'.tmp',file);}
 return {changed,failed};
}
