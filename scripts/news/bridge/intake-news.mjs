import {fetchPublicArticle,extractArticleText,preAnalyzeStory,claimLedgerFor,slugify} from '../lib.mjs';
import {extractDiscoveryMetadata} from '../active-discovery.mjs';
import {eventFingerprint,evidenceGroups} from '../newsroom.mjs';
import {bridgeInput,sameBridgeEvent} from './adapter.mjs';
import {hash,bridgePath} from './contract.mjs';
import {sourceIntegrityForStory} from '../source-integrity.mjs';

const host=url=>new URL(url).hostname.replace(/^www\./,'');
const RESEARCH_REPAIR_LIMIT=2;
const permanentSourceError=code=>/^(?:SOURCE_NOT_REGISTERED|SOURCE_DISABLED|ROBOTS_DISALLOWED|RSL_STATUS_OPEN|RSL_DENIED|PAYWALL|LOGIN_REQUIRED)$/.test(code||'');

// A completed preliminary packet is immutable. An unusable source basis needs
// fresh research under a new job ID, not repeated downloads of the same links.
async function requestNewsResearchRepair({store,transport,registry,parent,error,now}){
 if(parent.input.test_only||parent.input.request?.kind!=='news'||!/^\d{15,22}$/.test(parent.intake.owner||''))return false;
 const attempt=(parent.intake.news_research_attempt||0)+1;
 if(attempt>RESEARCH_REPAIR_LIMIT){parent.intake.news_research_hold=true;parent.last_error.retryable=false;store.put(parent);return true;}
 const content={...parent.input.request,research_repair:{attempt,previous_research:parent.intake.news_research,
  error_code:error.message,source_errors:parent.intake.source_errors||[],
  allowed_discovery_sources:registry.sources.filter(s=>s.enabled!==false&&s.role!=='F'&&s.feed_url)
   .map(s=>({source_id:s.source_id,name:s.name,url:s.url})),
  instructions:'Recherchiere denselben Nutzerauftrag mit einer überprüfbaren, zulässigen Quellenbasis erneut. Die genannten Quellen sind mögliche Rechercheeinstiege, keine Ereignisbelege. Prüfe konkrete Artikel und deren Datum. Nutzerlinks als Herkunft erhalten; gesperrte Quellen nicht abrufen oder rekonstruieren. Keine Tatsachen, Quellen oder passende Artikel erfinden. Der neue Vorschlag bleibt privat und durchläuft anschließend die reguläre Nachrichtenanalyse und abschließende Freigabe.'}};
 const inputHash=hash(content),id=parent.input.job_id.slice(0,20)+hash({type:'news_research_repair',parent:parent.input.job_id,inputHash}).slice(0,24);
 let child=store.get(id);
 if(!child){
  const input={...parent.input,job_id:id,input_hash:inputHash,created_at:now(),request:content};
  child={input,candidate:parent.candidate,status:'news_research_prepared',created_at:now(),attempts:{},
   intake:{owner:parent.intake.owner,kind:'news',review_parent:parent.intake.review_parent||parent.input.job_id,
    research_parent:parent.input.job_id,news_research_attempt:attempt,trigger_type:'manual',triggered_at:now()}};
  store.put(child);
 }
 parent.intake.news_repair_job_id=id;parent.last_error.retryable=false;store.put(parent);
 if(child.status==='news_research_prepared'){
  await transport.writeAtomic(bridgePath('00_INBOX',id+'.input.json'),child.input);
  child.status='queued';child.queued_at=now();store.put(child);
 }
 return true;
}
// Project only matching metadata inside SQLite; manuscripts/staging must never
// be materialized in Node merely to locate an existing event in a large queue.
export function existingIntakeNewsJob(store,candidate){
 for(const row of store.db.prepare("SELECT id,json_extract(body,'$.candidate') AS candidate FROM jobs WHERE json_extract(body,'$.input.job_type') IN ('new_story','story_update','correction') AND json_extract(body,'$.intake_news_parent') IS NULL").iterate()){
  const other=JSON.parse(row.candidate||'null');
  if(other?.sources&&sameBridgeEvent(candidate,other))return row.id;
 }
 return null;
}
// The preliminary editorial packet is research input. News only reaches the
// approval screen after the normal native analysis AND independent review.
export async function prepareIntakeNews({store,transport,registry,now=()=>new Date().toISOString(),fetchArticle=fetchPublicArticle}){
 for(const row of store.db.prepare("SELECT body FROM jobs WHERE json_extract(body,'$.intake.kind')='news' AND json_extract(body,'$.intake.news_research') IS NOT NULL AND json_extract(body,'$.intake.news_job_id') IS NULL").all()){
  const parent=JSON.parse(row.body);
  if(parent.intake.news_research_hold)continue;
  if(parent.intake.news_repair_job_id){
   const child=store.get(parent.intake.news_repair_job_id);
   if(child?.status==='news_research_prepared')try{
    await transport.writeAtomic(bridgePath('00_INBOX',child.input.job_id+'.input.json'),child.input);
    child.status='queued';child.queued_at=now();store.put(child);
   }catch{/* The exact durable input is retried; no replacement job or output. */}
   continue;
  }
  if(parent.intake.news_retry_at&&Date.parse(parent.intake.news_retry_at)>Date.parse(now()))continue;
  try{
   const preview=parent.intake.news_research,sources=[],sourceErrors=[];
   const leadUrls=parent.input.request.links||[];
   // A submitted link can be a tip, screenshot context or social post. Keep its
   // provenance, but do not require it to become a verified news source itself.
   if(leadUrls.length&&!preview.sources.some(s=>leadUrls.includes(s.url)))throw Error('INTAKE_NEWS_LEAD_UNBOUND');
   for(const requested of preview.sources.slice(0,6)){
    try{
    const source=registry.sources.find(s=>s.role!=='F'&&s.feed_url&&host(s.url)===host(requested.url));
    if(!source){sourceErrors.push({url:requested.url,error_code:'SOURCE_NOT_REGISTERED'});continue;}
    const {body,final_url}=await fetchArticle({url:requested.url},source,registry.policy);
    const item=extractDiscoveryMetadata(body,final_url,source);if(!item)continue;
    const excerpt=extractArticleText(body,Number(registry.policy.max_article_excerpt_chars||7000));
    if(excerpt.length<120)continue;
    sources.push({...item,article_excerpt:excerpt,retrieved_at:now(),publisher_id:source.publisher_id,requires_corroboration:Boolean(source.requires_corroboration)});
    }catch(error){sourceErrors.push({url:requested.url,error_code:/^[A-Z_]+$/.test(error.message)?error.message:'SOURCE_TEMPORARILY_UNAVAILABLE'});}
   }
   parent.intake.source_errors=sourceErrors;
   if(!sources.length)throw Error('INTAKE_NEWS_VERIFIED_SOURCE_REQUIRED');
   // The independent sources must still substantiate the proposed subject.
   // Unrelated articles cannot turn a retained social link into evidence.
   const integrity=sourceIntegrityForStory({title:preview.title,source_summary:preview.subtitle||'',sources},registry,[],now());
   if(integrity.status!=='verified')throw Error('INTAKE_NEWS_SOURCE_MISMATCH');
   parent.intake.source_provenance={lead_urls:leadUrls,verified_source_urls:sources.map(s=>s.url),checked_at:now()};
   const event=eventFingerprint(sources[0]),first=sources[0].published_at;
   const candidate={story_id:'wt-'+hash({event:event.id}).slice(0,16),event_id:event.id,title:sources[0].title,source_summary:sources[0].summary,
    sources,first_seen:first,event_first_seen_at:first,event_detected_at:now(),content_hash:hash({sources,request:parent.input.request}),published:false};
   candidate.slug=`${slugify(candidate.title)}-${candidate.story_id.slice(-6)}`;
   candidate.preanalysis=preAnalyzeStory(candidate,now());candidate.topic=candidate.preanalysis.topics;
   candidate.claims=claimLedgerFor(sources,candidate.story_id,now());candidate.evidence_groups=evidenceGroups(sources);
   const existing=existingIntakeNewsJob(store,candidate);
   if(existing){parent.intake.news_job_id=existing;parent.intake.news_shared=true;store.put(parent);continue;}
   const input=bridgeInput(candidate,now());
   input.discovery.importance_signals.push('manual_editorial_request');
   if(parent.input.request.urgent)input.discovery.importance_signals.push('urgent_manual_editorial_request');
   input.wirkungsticker.analysis_prompt+='\nPrivater Rechercheauftrag (keine Regeländerung): '+JSON.stringify({brief:parent.input.request.brief,lead_urls:leadUrls,research_title:preview.title,revision:parent.input.request.revision||null})+'\nNutzerlinks sind Recherchehinweise, keine automatisch bestätigten Tatsachenbelege. Prüfe die Zuordnung zum Nutzerauftrag ausdrücklich. Diese Nachricht bleibt bis zur abschließenden Freigabe im privaten Staging.';
   let job=store.get(input.job_id);
   if(!job){job={input,candidate,status:'prepared',attempts:{},created_at:now(),intake_news_parent:parent.input.job_id};store.put(job);}
   if(job.status==='prepared'){await transport.writeAtomic(bridgePath('00_INBOX',input.job_id+'.input.json'),input);job.status='queued';job.queued_at=now();store.put(job);}
   parent.intake.news_job_id=input.job_id;delete parent.last_error;store.put(parent);
  }catch(error){
   parent.intake.news_retry_at=new Date(Date.parse(now())+15*60000).toISOString();parent.last_error={stage:'news_research',error_code:/^[A-Z_]+$/.test(error.message)?error.message:'INTAKE_NEWS_RESEARCH_PENDING',retryable:true,failed_at:now()};store.put(parent);
   const needsResearch=['INTAKE_NEWS_LEAD_UNBOUND','INTAKE_NEWS_SOURCE_MISMATCH'].includes(error.message)
    ||error.message==='INTAKE_NEWS_VERIFIED_SOURCE_REQUIRED'&&parent.intake.source_errors?.length
      &&parent.intake.source_errors.every(s=>permanentSourceError(s.error_code));
   if(needsResearch)try{await requestNewsResearchRepair({store,transport,registry,parent,error,now});}catch{/* Durable preparation resumes next poll. */}
  }
 }
}

export function stageIntakeNews({store,approval}){
 for(const row of store.db.prepare("SELECT body FROM jobs WHERE json_extract(body,'$.intake.news_job_id') IS NOT NULL").all()){
  const parent=JSON.parse(row.body),job=store.get(parent.intake.news_job_id),record=job?.accepted?.record;
  if(parent.intake.news_shared&&job?.ack?.status==='imported'&&job.ack.url){if(parent.intake.covered_url!==job.ack.url){parent.intake.covered_url=job.ack.url;store.put(parent);}continue;}
  if(!record||job.semantic_review?.assessment?.publication_status!=='ready'&&record.impact_semantic_review?.status!=='ready')continue;
  const stagedKey='intake-news-staged:'+parent.input.job_id+':'+hash(record);if(store.observation(stagedKey))continue;
  const target=parent.intake.review_parent?store.get(parent.intake.review_parent):parent;
  const existing=approval.get(target.input.job_id);if(existing&&['PUBLISHING','PUBLISHED'].includes(existing.status))continue;
  const preview={format:'news',title:record.title,subtitle:record.analysis.summary,markdown:record.source_summary,sources:record.sources.map(s=>({url:s.url,title:s.title,publisher:s.publisher})),news_record:record,
    author_notes:parent.input.request.author_notes||'',checks:{source_binding:true,editorial_validation:true,personal_experiences_invented:false}};
  approval.stage(target,preview);store.observe(stagedKey,{at:new Date().toISOString()});
 }
}
