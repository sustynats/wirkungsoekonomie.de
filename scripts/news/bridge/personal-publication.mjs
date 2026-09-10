import fs from 'node:fs';
import path from 'node:path';
import {PERSONAL_FILE,validatePersonalEdition} from '../personal-editorial.mjs';
import {importApprovedNews} from './approved-news.mjs';
import {loadNewsRegistry} from '../registry.mjs';

// Called by the existing serial Git publisher while it owns the import lock.
// The Oracle service only exports frozen versions explicitly approved by owner.
export async function importApprovedEditorials(store,root){
 if(!store.editorialClaim)return {changed:false};
 const editions=await store.editorialClaim();if(!editions.length)return {changed:false};
 const file=path.join(root,PERSONAL_FILE),data=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{schema_version:'1.0',editions:[]};
 let changed=false;const failed=[];
 for(const edition of editions){
 try{
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
