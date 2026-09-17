import fs from 'node:fs';
import path from 'node:path';
import {PERSONAL_FILE,validatePersonalEdition,loadPersonalEditorials} from '../personal-editorial.mjs';
import {importApprovedNews} from './approved-news.mjs';
import {loadNewsRegistry} from '../registry.mjs';
import {loadManualEditorials} from '../manual-editorial.mjs';
import {EDITORIAL_REVISION_FORMAT,EDITORIAL_REVISION_FILE,applyApprovedEditorialRevisions,validateApprovedEditorialRevision,validateEditorialRevisionPreview} from '../editorial-approved-revisions.mjs';
import {PARKED_KEY} from './observation-keys.mjs';
export {PARKED_KEY};

// Called by the existing serial Git publisher while it owns the import lock.
// The Oracle service only exports frozen versions explicitly approved by owner.
// Die Identitaet einer Folge: Sendung und Folgenkennung, unabhaengig von Titel
// und Adresse der Ausgabe. Ohne Sendungsangabe gibt es keine Identitaet - dann
// greift die Pruefung nicht.
export function episodeIdentity(edition){
 const show=String(edition?.source_media?.show||'').normalize('NFKC').toLocaleLowerCase('de').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const episode=String(edition?.source_media?.episode_title||'').normalize('NFKC').toLocaleLowerCase('de').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 return show&&episode?`${show}|${episode}`:null;
}

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
   const originals=[...(fs.existsSync(analysisFile)?JSON.parse(fs.readFileSync(analysisFile)).analyses:[]),...loadManualEditorials(root),...loadPersonalEditorials(root)];
   const base=applyApprovedEditorialRevisions(originals,root).find(a=>a.analysis_id===edition.analysis_id);
   if(!base)throw Error('EDITORIAL_REVISION_TARGET_MISSING');
   validateEditorialRevisionPreview({format:base.format==='book_and_impact'?'book_review':base.subtype||'opinion_analysis',title:base.title,
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
 // Eine zweite Analyse zur selben Folge ist eine Dublette, auch wenn sie einen
 // anderen Titel und eine andere Adresse hat. Natalie am 17.09.2026: sie stand
 // vor einer geparkten Fassung zu "Markus Lanz vom 15. September 2026
 // (S2026/E99)", deren Folge seit dem Vortag unter anderem Titel online war.
 // Die Veroeffentlichung scheiterte, und niemand sagte ihr warum. Der Fall
 // heisst jetzt so, wie er ist.
 if(episodeIdentity(edition)&&data.editions.some(e=>e.slug!==edition.slug&&episodeIdentity(e)===episodeIdentity(edition)))throw Error('PERSONAL_EPISODE_ALREADY_PUBLISHED');
  data.editions.push(edition);changed=true;
 }catch(error){failed.push({content_hash:edition.content_hash,code:error.message});if(store.editorialFailure)await store.editorialFailure(edition.content_hash,error.message);}
 }
 if(changed){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(data,null,2)+'\n');fs.renameSync(file+'.tmp',file);}
 // Eine geparkte Fassung stand bisher nur in der privaten Freigabeliste: der
 // Monitor pruefte 20 Punkte und meldete gruen, waehrend Natalie vor einer
 // Fassung sass, die sie nicht freigeben konnte (17.09.2026). Der Vermerk macht
 // sie von aussen sichtbar - ohne Titel und ohne Text, nur Kennung und Grund.
 if(store.observe)await store.observe(PARKED_KEY,{at:new Date().toISOString(),
  parked:failed.map(f=>({content_hash:String(f.content_hash||'').slice(0,64),code:String(f.code||'').slice(0,80)}))}).catch?.(()=>{});
 return {changed,failed};
}
