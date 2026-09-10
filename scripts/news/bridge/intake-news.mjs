import {fetchPublicArticle,extractArticleText,preAnalyzeStory,claimLedgerFor} from '../lib.mjs';
import {extractDiscoveryMetadata} from '../active-discovery.mjs';
import {eventFingerprint,evidenceGroups} from '../newsroom.mjs';
import {bridgeInput,sameBridgeEvent} from './adapter.mjs';
import {hash,bridgePath} from './contract.mjs';

const host=url=>new URL(url).hostname.replace(/^www\./,'');
// The preliminary editorial packet is research input. News only reaches the
// approval screen after the normal native analysis AND independent review.
export async function prepareIntakeNews({store,transport,registry,now=()=>new Date().toISOString(),fetchArticle=fetchPublicArticle}){
 for(const row of store.db.prepare("SELECT body FROM jobs WHERE json_extract(body,'$.intake.kind')='news' AND json_extract(body,'$.intake.news_research') IS NOT NULL AND json_extract(body,'$.intake.news_job_id') IS NULL").all()){
  const parent=JSON.parse(row.body);
  if(parent.intake.news_retry_at&&Date.parse(parent.intake.news_retry_at)>Date.parse(now()))continue;
  try{
   const preview=parent.intake.news_research,sources=[],sourceErrors=[];
   for(const requested of preview.sources.slice(0,6)){
    try{
    const source=registry.sources.find(s=>s.role!=='F'&&s.feed_url&&host(s.url)===host(requested.url));
    if(!source)continue;
    const {body,final_url}=await fetchArticle({url:requested.url},source,registry.policy);
    const item=extractDiscoveryMetadata(body,final_url,source);if(!item)continue;
    const excerpt=extractArticleText(body,Number(registry.policy.max_article_excerpt_chars||7000));
    if(excerpt.length<120)continue;
    sources.push({...item,article_excerpt:excerpt,retrieved_at:now(),publisher_id:source.publisher_id,requires_corroboration:Boolean(source.requires_corroboration)});
    }catch(error){sourceErrors.push({url:requested.url,error_code:/^[A-Z_]+$/.test(error.message)?error.message:'SOURCE_TEMPORARILY_UNAVAILABLE'});}
   }
   parent.intake.source_errors=sourceErrors;
   if(!sources.length)throw Error('INTAKE_NEWS_VERIFIED_SOURCE_REQUIRED');
   if(parent.input.request.links.length&&!sources.some(s=>parent.input.request.links.includes(s.url)))throw Error('INTAKE_NEWS_ORIGINAL_SOURCE_REQUIRED');
   const event=eventFingerprint(sources[0]),first=sources[0].published_at;
   const candidate={story_id:'wt-'+hash({event:event.id}).slice(0,16),event_id:event.id,title:sources[0].title,source_summary:sources[0].summary,
    sources,first_seen:first,event_first_seen_at:first,event_detected_at:now(),content_hash:hash({sources,request:parent.input.request}),published:false};
   candidate.preanalysis=preAnalyzeStory(candidate,now());candidate.topic=candidate.preanalysis.topics;
   candidate.claims=claimLedgerFor(sources,candidate.story_id,now());candidate.evidence_groups=evidenceGroups(sources);
   const existing=store.db.prepare("SELECT body FROM jobs").all().map(r=>JSON.parse(r.body)).find(j=>['new_story','story_update','correction'].includes(j.input.job_type)&&!j.intake_news_parent&&sameBridgeEvent(candidate,j.candidate));
   if(existing){parent.intake.news_job_id=existing.input.job_id;parent.intake.news_shared=true;store.put(parent);continue;}
   const input=bridgeInput(candidate,now());
   input.wirkungsticker.analysis_prompt+='\nPrivater Rechercheauftrag (keine Regeländerung): '+JSON.stringify({brief:parent.input.request.brief,revision:parent.input.request.revision||null})+'\nDiese Nachricht bleibt bis zur abschließenden Freigabe im privaten Staging.';
   let job=store.get(input.job_id);
   if(!job){job={input,candidate,status:'prepared',attempts:{},created_at:now(),intake_news_parent:parent.input.job_id};store.put(job);}
   if(job.status==='prepared'){await transport.writeAtomic(bridgePath('00_INBOX',input.job_id+'.input.json'),input);job.status='queued';job.queued_at=now();store.put(job);}
   parent.intake.news_job_id=input.job_id;delete parent.last_error;store.put(parent);
  }catch(error){parent.intake.news_retry_at=new Date(Date.parse(now())+15*60000).toISOString();parent.last_error={stage:'news_research',error_code:/^[A-Z_]+$/.test(error.message)?error.message:'INTAKE_NEWS_RESEARCH_PENDING',retryable:true,failed_at:now()};store.put(parent);}
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
