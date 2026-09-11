import fs from 'node:fs';
import path from 'node:path';
import {hash,safeUrl} from './bridge/contract.mjs';
import {escape,renderEditorialMarkdown} from './editorial-markdown.mjs';
import {renderEditorialSection} from './editorial-layout.mjs';

export const personalPortrait=kind=>['listened','watched'].includes(kind)?'/assets/img/people/nats_portrait_nachgehoert.jpg':kind==='book_review'?'/assets/img/people/natalie-weber-buch-und-wirkung.jpeg':'/assets/img/people/natalie-weber-woek-analyse.jpg';
export const PERSONAL_FORMAT='approved_editorial';
export const PERSONAL_FILE='data/news/personal-editorials.json';
export const personalLabel=kind=>({listened:'Nachgehört',watched:'Nachgesehen',book_review:'Buch & Wirkung',news:'Redaktioneller Beitrag',opinion_analysis:'Meinung & Analyse'}[kind]||'Meinung & Analyse');
export function personalContentHash(value){const {content_hash,...content}=value;return hash(content);}
export function publicPersonalEdition(review){
 if(review.preview.format==='news')throw Error('EDITORIAL_NEWS_NATIVE_PATH_REQUIRED');
 const p=review.preview,id=hash(review.job_id).slice(0,16);
 const titleSlug=p.title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,95).replace(/-$/,'');
 const content={analysis_id:`woek-personal-${id}`,slug:`${titleSlug}-${id.slice(0,6)}`,format:PERSONAL_FORMAT,subtype:p.format,manual_only:true,
  title:p.title,subtitle:p.subtitle||'',body_markdown:p.markdown,sources:p.sources.map(({url,title,publisher,source_function,date})=>({url,title,publisher,...(source_function?{source_function}:{}),...(date?{date}:{})})),visual:p.visual?Object.fromEntries(['url','alt','credit','rights_status','allow_website','expires_at'].filter(k=>p.visual[k]!==undefined).map(k=>[k,p.visual[k]])):null,source_media:p.source_media?Object.fromEntries(['show','episode_title','original_release_date','original_url','hosts','guests','duration','timestamps'].filter(k=>p.source_media[k]!==undefined).map(k=>[k,p.source_media[k]])):null,
  published_at:review.approval.at,revision:review.revision};
 return {...content,content_hash:personalContentHash(content)};
}
export function validatePersonalEdition(value){
 if(value?.format!==PERSONAL_FORMAT||value.subtype==='news'||value.manual_only!==true||value.content_hash!==personalContentHash(value)
  ||!/^woek-personal-[a-f0-9]{16}$/.test(value.analysis_id)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)
  ||!Number.isFinite(Date.parse(value.published_at))||!Array.isArray(value.sources)||!value.sources.length)throw Error('PERSONAL_PUBLICATION_INVALID');
 for(const s of value.sources)safeUrl(s.url);
 if(value.visual?.expires_at&&(!Number.isFinite(Date.parse(value.visual.expires_at))||Date.parse(value.visual.expires_at)<=Date.now()))throw Error('PERSONAL_IMAGE_RIGHTS_EXPIRED');
 renderEditorialMarkdown(value.body_markdown);
}
export function loadPersonalEditorials(root){
 const file=path.join(root,PERSONAL_FILE);if(!fs.existsSync(file))return [];
 const data=JSON.parse(fs.readFileSync(file));if(data.schema_version!=='1.0'||!Array.isArray(data.editions))throw Error('PERSONAL_CATALOG_INVALID');
 return data.editions.map(value=>{validatePersonalEdition(value);if(!fs.existsSync(path.join(root,personalPortrait(value.subtype))))throw Error('PORTRAIT_ASSET_MISSING');return {...value,status:'published',updated_at:value.published_at,
  teaser:value.subtitle,sections:[],source_snapshot:value.sources,tags:[personalLabel(value.subtype),'Meinung & Analyse'],
  transparency_note:'Persönliche Meinung und wirkungsökonomische Analyse',reading_time_minutes:Math.max(1,Math.ceil(value.body_markdown.split(/\s+/).length/210))};});
}
export function personalArticleBody(a){
 const m=a.source_media;
 const source=m?`<aside class="news-editorial-origin"><strong>Besprochen: ${escape(m.show)}</strong><p>${escape(m.episode_title)}</p><p>${escape([m.original_release_date,...(m.hosts||[]),...(m.guests||[])].filter(Boolean).join(' · '))}</p><a class="text-link" href="${escape(safeUrl(m.original_url))}" target="_blank" rel="noopener noreferrer">Original ${a.subtype==='watched'?'ansehen':'anhören'}</a></aside>`:'';
 const body=renderEditorialMarkdown(a.body_markdown).sections.map(section=>renderEditorialSection(section,{portrait:personalPortrait(a.subtype),portraitAlt:['listened','watched'].includes(a.subtype)?'Natalie Weber mit Kopfhörern und Smartphone am Tisch':'Natalie Weber'})).join('\n');
 return `${source}${a.visual?`<figure><img style="max-width:100%;height:auto" src="${escape(a.visual.url)}" alt="${escape(a.visual.alt)}"><figcaption>${escape(a.visual.credit)}</figcaption></figure>`:''}${body}<section class="news-story-section"><h2>Quellen und Originale</h2><ul>${a.sources.map(s=>`<li><a class="text-link" href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.publisher)}: ${escape(s.title)}</a></li>`).join('')}</ul></section>`;
}
