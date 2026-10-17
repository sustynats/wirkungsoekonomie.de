// One bounded migration of an already paid answer; never a provider retry.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readRepositoryJson,writeRepositoryJson} from './newsroom-store.mjs';
import {fetchArticleExcerpt,validateAnalysis,existingStoryMatch} from './lib.mjs';
import {normalizeAnalysisOutput,TRANSPORT_VERSION} from './openai-transport.mjs';
import {resolveEvidenceReferences,normalizeEvidenceExcerpts} from './newsroom.mjs';
import {normalizeEmptyDirectionPaths} from './direction-assessment.mjs';
import {loadNewsRegistry} from './registry.mjs';
import {releaseDeterministicImpact} from './impact-gate.mjs';
import {normalizeEditorialDecision,normalizeAnalysisParagraphs,sanitizeAnalysisVisuals,sanitizeAnalysisMediaImpact,
  storyEvidenceIds,publishedRecord,publicationIntegrityIssues,queueSnapshot,lifoHorizonMilliseconds} from './run.mjs';

export const RETAINED_RESPONSE=Object.freeze({
  story_id:'wt-e59c6f295497409c',run_id:'38888277070',model:'gpt-5.6-luna',
  filename:'2026-10-16T11-04-38-482Z-wt-e59c6f295497409c.json',
  answer_at:'2026-10-16T11:04:38.482Z',
  raw_sha256:'89e280f41123f4ef2897edaabeef20c7949761b69382dfd49a6ba57859563702',
  sources_sha256:'189c3d313e8b50448e348bc4b20a8470fdf9fc0afc4f972be646693e699aa1ce',
  excerpt_sha256:'763972a06d3eb32d445ef7d91e2a2a1e9a57eed29fe100e72dedcd16b3b20f68',
});
export const recoveryHash=value=>createHash('sha256').update(value).digest('hex');

export function retainedResponseNeeded(store,at,binding=RETAINED_RESPONSE,env=process.env){
  if(!Array.isArray(store?.stories))throw Error('PAID_RECOVERY_STORE_INVALID');
  const s=store.stories.find(row=>row.story_id===binding.story_id);
  if(!s||s.published||s.listed===false||s.pending_reason!=='AI_ATTEMPT_LIMIT_REACHED'
    ||JSON.stringify(s.quality_errors)!=='["AI_SUMMARY_SENTENCE_COUNT"]'
    ||recoveryHash(JSON.stringify(s.sources))!==binding.sources_sha256)return false;
  const latest=Math.max(...s.sources.map(source=>Date.parse(source.published_at||'')));
  const horizon=lifoHorizonMilliseconds(env);
  return Number.isFinite(Date.parse(at))&&Number.isFinite(latest)&&latest<=Date.parse(at)
    &&(!horizon||Date.parse(at)-latest<=horizon);
}

export async function prepareRetainedResponse({store,raw,registry,at,binding=RETAINED_RESPONSE,fetchArticle=fetchArticleExcerpt,env=process.env}){
  if(!retainedResponseNeeded(store,at,binding,env))return {changed:false,reason:'not_eligible'};
  if(!Buffer.isBuffer(raw)||recoveryHash(raw)!==binding.raw_sha256)throw Error('PAID_RECOVERY_ORIGINAL_CHANGED');
  const envelope=JSON.parse(raw),answer=JSON.parse(envelope.answer);
  if(envelope.model!==binding.model||envelope.status!=='completed'||envelope.incomplete
    ||answer.story_id!==binding.story_id||!envelope.story_ids?.includes(binding.story_id))throw Error('PAID_RECOVERY_BINDING_INVALID');
  const old=store.stories.find(s=>s.story_id===binding.story_id),source=old.sources[0];
  const published=store.stories.filter(s=>s.published&&s.listed!==false);
  if(published.some(story=>existingStoryMatch(source,{story,last_updated:story.last_updated},at)>=0.18))return {changed:false,reason:'already_covered'};
  const registered=registry.sources.find(s=>s.source_id===source.source_id);
  if(!registered?.enabled)throw Error('PAID_RECOVERY_SOURCE_NOT_ACTIVE');
  // The ordinary bounded public fetch retains robots/login/paywall gates.
  // This is a fresh check, explicitly NOT a reconstruction of the old prompt.
  const fresh=await fetchArticle(source,registered,registry.policy);
  if(recoveryHash(fresh.excerpt)!==binding.excerpt_sha256)throw Error('PAID_RECOVERY_SOURCE_CHANGED');
  const candidate={...old,sources:[{...source,article_excerpt:fresh.excerpt}],existing_story:old};
  const analysis=normalizeAnalysisOutput(structuredClone(answer),candidate),diagnostics={};
  normalizeEditorialDecision(analysis);normalizeAnalysisParagraphs(analysis);
  sanitizeAnalysisVisuals(analysis,candidate,diagnostics);sanitizeAnalysisMediaImpact(analysis,candidate,diagnostics,at);
  normalizeEmptyDirectionPaths(analysis);resolveEvidenceReferences(analysis,candidate,storyEvidenceIds(candidate),{});normalizeEvidenceExcerpts(analysis,candidate);
  const initial=validateAnalysis(analysis,candidate,{requireDirectionAssessment:true,requireImpactAssessment:true});
  if(initial.length)throw Error(`PAID_RECOVERY_QUALITY_HOLD:${initial.join(',')}`);
  const record=publishedRecord(candidate,analysis,{provider:'OpenAI Responses API',model:binding.model,mode:TRANSPORT_VERSION,method_sources:[]},at);
  const durable=validateAnalysis({source_summary:record.source_summary,...record.analysis},record,{validateSourceSummaryNumbers:false,persisted:true});
  if(durable.length)throw Error(`PAID_RECOVERY_PERSISTED_HOLD:${durable.join(',')}`);
  const release=releaseDeterministicImpact(record,{now:at,existing:old});
  if(!release.released)throw Error(`PAID_RECOVERY_IMPACT_HOLD:${release.issues.join(',')}`);
  const integrity=publicationIntegrityIssues(record,registry,published,at);
  if(integrity.errors.length)throw Error(`PAID_RECOVERY_SOURCE_HOLD:${integrity.errors.join(',')}`);
  record.source_integrity=integrity.record;record.versions.at(-1).analyzed_at=binding.answer_at;
  const receipt={story_id:binding.story_id,source_run_id:binding.run_id,raw_sha256:binding.raw_sha256,
    original_answer_at:binding.answer_at,revalidated_at:at,provider_called:false,cost_usd:0,
    source_binding_sha256:binding.sources_sha256,fresh_source_check:{url:source.url,excerpt_sha256:binding.excerpt_sha256,excerpt_chars:fresh.excerpt.length,not_original_prompt:true},
    review_job_id:release.review_job_id};
  record.paid_response_recovery={...receipt,previous_hold:{reason:old.pending_reason,quality_errors:old.quality_errors,ai_retry:old.ai_retry}};
  return {changed:true,record,receipt};
}

export function applyRetainedResponse(store,state,report,result){
  if(!result.changed)return false;
  const id=result.record.story_id,index=store.stories.findIndex(s=>s.story_id===id);
  if(index<0||store.stories[index].published)throw Error('PAID_RECOVERY_STATE_CHANGED');
  const prior=recoveryHash(JSON.stringify(store.stories.filter(s=>s.story_id!==id)));
  store.stories[index]=result.record;store.updated_at=store.public_updated_at=result.receipt.revalidated_at;
  if(recoveryHash(JSON.stringify(store.stories.filter(s=>s.story_id!==id)))!==prior)throw Error('PAID_RECOVERY_UNRELATED_CHANGE');
  state.pending_story_ids=(state.pending_story_ids||[]).filter(s=>s!==id);
  report.paid_response_recoveries=[...(report.paid_response_recoveries||[]),result.receipt];
  report.public_changed=true;report.published_stories=Number(report.published_stories||0)+1;
  report.reviews_reused=Number(report.reviews_reused||0)+1;report.queue_completed=Number(report.queue_completed||0)+1;
  report.quality_holds=(report.quality_holds||[]).filter(s=>s.story_id!==id);
  report.pending_story_count=state.pending_story_ids.length;
  report.queue=queueSnapshot(store.stories,result.receipt.revalidated_at,report.queue?.before||0,{budgetBlocked:report.budget_blocked||report.budget_stage>=3});
  report.queue_status=report.queue.status;report.editorial_status=report.queue.editorial||report.source_integrity_holds?.length?'holds':'clear';
  return true;
}

async function main(){
  const root=path.resolve(import.meta.dirname,'../..'),at=new Date().toISOString();
  const file=path.join(root,'data/news/stories.json'),store=readRepositoryJson(file);
  if(process.argv.includes('--needed')){process.stdout.write(`${retainedResponseNeeded(store,at)}\n`);return;}
  const rawDir=process.argv.find(arg=>arg.startsWith('--raw-dir='))?.slice('--raw-dir='.length);
  if(!rawDir||!process.argv.includes('--recover'))throw Error('PAID_RECOVERY_ARGUMENTS_REQUIRED');
  if(!retainedResponseNeeded(store,at)){console.log(JSON.stringify({changed:false,reason:'not_eligible',provider_called:false}));return;}
  const raw=fs.readFileSync(path.join(rawDir,RETAINED_RESPONSE.filename));
  const result=await prepareRetainedResponse({store,raw,registry:loadNewsRegistry(root),at});
  if(!result.changed){console.log(JSON.stringify(result));return;}
  const stateFile=path.join(root,'data/news/state.json'),reportFile=path.join(root,'reports/wirkungsticker-latest-run.json');
  const state=readRepositoryJson(stateFile),report=readRepositoryJson(reportFile);
  applyRetainedResponse(store,state,report,result);
  if(recoveryHash(fs.readFileSync(path.join(rawDir,RETAINED_RESPONSE.filename)))!==RETAINED_RESPONSE.raw_sha256)throw Error('PAID_RECOVERY_ORIGINAL_CHANGED');
  writeRepositoryJson(file,store);writeRepositoryJson(stateFile,state);writeRepositoryJson(reportFile,report);
  const saved=readRepositoryJson(file).stories.find(s=>s.story_id===RETAINED_RESPONSE.story_id);
  if(recoveryHash(JSON.stringify(saved))!==recoveryHash(JSON.stringify(result.record)))throw Error('PAID_RECOVERY_READBACK_FAILED');
  console.log(JSON.stringify({changed:true,...result.receipt}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
