import fs from 'node:fs';
import path from 'node:path';
import { hash, bridgePath, parsePacket } from './contract.mjs';
import { runEditorialAnalyses, prepareAutomaticEditorialRecord } from '../run-editorial-analyses.mjs';
import { buildEditorialAnalysisPrompt, sanitizeEditorialAnalysis, editorialAnalysisValidationErrors } from '../editorial-analysis.mjs';
import { editorialAnalysisPage } from '../build.mjs';

export const EDITORIAL_JOB_TYPE='editorial_analysis';
export const editorialOutputSchema={type:'object',additionalProperties:false,required:['schema_version','job_id','input_hash','processed_at','decision'],properties:{
  schema_version:{const:'1.0'},job_id:{type:'string',pattern:'^wt_\\d{8}T\\d{6}Z_[a-f0-9]{24}$'},input_hash:{type:'string',pattern:'^[a-f0-9]{64}$'},processed_at:{type:'string',format:'date-time'},
  decision:{type:'object',additionalProperties:false,required:['status','reason'],properties:{status:{enum:['publish','hold','reject']},reason:{type:'string',minLength:1,maxLength:4000}}},
  editorial_analysis:{type:'object'},
}};
const closed=new Set(['acknowledged','quarantined','archive_failed']);
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
export async function discoverEditorialJobs(bridge,root,now,{limit=2}={}){
  const plan=await runEditorialAnalyses({root,bridgePlan:true,batchEnabled:false,limit:20,now});
  const jobs=await bridge.store.all(),created=[];
  for(const job of jobs.filter(j=>j.input.job_type===EDITORIAL_JOB_TYPE&&j.status==='prepared_editorial')){
    try{await bridge.transport.writeAtomic(bridgePath('00_INBOX',job.input.job_id+'.input.json'),job.input);job.status='queued';job.queued_at=now;await bridge.store.put(job);created.push(job.input.job_id);}
    catch(error){await bridge.failure(job,'enqueue',error,now);}
  }
  for(const {story,assessment}of plan.bridge_candidates){
    if(created.length>=limit||jobs.filter(j=>!closed.has(j.status)).length>=bridge.maxPending)break;
    const existing=plan.existing_analyses.find(a=>a.story_id===story.story_id&&a.status==='published');
    const prompt=buildEditorialAnalysisPrompt(story,assessment);
    const binding={story_id:story.story_id,source_fingerprint:assessment.fingerprint,research_fingerprint:assessment.research_fingerprint,previous_hash:existing?hash(existing):null,prompt_hash:hash(prompt)};
    const inputHash=hash(binding);
    if(jobs.some(j=>j.input.job_type===EDITORIAL_JOB_TYPE&&!closed.has(j.status)&&j.candidate.story_id===story.story_id))continue;
    if((await bridge.store.observation(`editorial-checkpoint:${story.story_id}`))?.input_hash===inputHash)continue;
    const stamp=new Date(story.first_seen||story.published_at||now).toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
    const id=`wt_${stamp}_${hash({type:EDITORIAL_JOB_TYPE,inputHash}).slice(0,24)}`;
    let job=await bridge.store.get(id);
    if(job&&closed.has(job.status))continue;
    if(!job){
      const input={schema_version:'1.0',job_id:id,job_type:EDITORIAL_JOB_TYPE,input_hash:inputHash,created_at:now,test_only:false,processing_mode:'dropbox_chatgpt_bridge',contract_path:bridgePath('98_CONFIG','editorial-analysis-contract-1.json'),binding,
        analysis_prompt:prompt,instructions:'Erstelle die eigenständige Meinung-&-Analyse-Ausgabe nach dem angegebenen Formatvertrag. Alle nativen Evidenz-, Gegenbefund-, WÖk- und Self-Frame-Gates bleiben bestehen. Keine Bildgenerierung. Entscheidung hold/reject ist möglich. Output atomar zuletzt schreiben.'};
      job={input,candidate:story,editorial_context:{assessment,existing},status:'prepared_editorial',created_at:now,attempts:{}};
      await bridge.store.put(job);jobs.push(job);
    }
    try{await bridge.transport.writeAtomic(bridgePath('00_INBOX',id+'.input.json'),job.input);job.status='queued';job.queued_at=now;await bridge.store.put(job);created.push(id);}
    catch(error){await bridge.failure(job,'enqueue',error,now);}
  }
  await bridge.store.observe('editorial-discovery',{at:now,candidates:plan.editorial_candidates,ready:plan.bridge_candidates.length,research_pending:plan.research_pending,quality_held:plan.quality_held,created});
  return created;
}
export async function importEditorialJobs(bridge,root,now){
  const storeFile=path.join(root,'data/news/editorial-analyses.json'),catalog=read(storeFile);
  const entries=new Set((await bridge.transport.list('20_OUTPUT_READY')).map(e=>e.name));
  // Plan uses the same native source enrichment and quality thresholds as the
  // existing analysis worker, without invoking a model or spending a reservation.
  const plan=await runEditorialAnalyses({root,bridgePlan:true,batchEnabled:false,limit:20,now});
  const results=[];let changed=false;
  for(const job of await bridge.store.all()){
    if(job.input.job_type!==EDITORIAL_JOB_TYPE||closed.has(job.status)||!entries.has(job.input.job_id+'.output.json'))continue;
    try{
      if(job.accepted?.editorial&&catalog.analyses.some(a=>a.bridge_import?.job_id===job.input.job_id&&a.bridge_import.output_hash===job.accepted.output_hash))continue;
      const output=parsePacket(await bridge.transport.read(bridgePath('20_OUTPUT_READY',job.input.job_id+'.output.json')),editorialOutputSchema);
      if(output.job_id!==job.input.job_id||output.input_hash!==job.input.input_hash)throw Error('BRIDGE_JOB_BINDING_MISMATCH');
      if(Date.parse(output.processed_at)<Date.parse(job.input.created_at)||Date.parse(output.processed_at)>Date.parse(now)+300000)throw Error('BRIDGE_OUTPUT_TIME_INVALID');
      const staged=bridge.stageOnly||job.input.test_only;
      let record=null;
      if(output.decision.status==='publish'){
        const current=plan.bridge_candidates.find(c=>c.story.story_id===job.candidate.story_id);
        const previous=catalog.analyses.find(a=>a.story_id===job.candidate.story_id&&a.status==='published');
        if(!current||current.assessment.fingerprint!==job.input.binding.source_fingerprint||current.assessment.research_fingerprint!==job.input.binding.research_fingerprint||(previous?hash(previous):null)!==job.input.binding.previous_hash)throw Error('BRIDGE_STALE_EDITORIAL_SOURCES');
        if(!output.editorial_analysis)throw Error('BRIDGE_PRODUCTION_ANALYSIS_REQUIRED');
        const analysis=sanitizeEditorialAnalysis(output.editorial_analysis,current.story);
        const errors=editorialAnalysisValidationErrors(analysis,current.story,current.assessment);
        if(errors.length)throw Object.assign(Error('BRIDGE_EDITORIAL_PUBLICATION_GATE_FAILED'),{issues:errors});
        record=prepareAutomaticEditorialRecord({story:current.story,assessment:current.assessment,analysis,existing:previous,now,result:{provider:'chatgpt_dropbox_bridge',model:null}});
        record.bridge_import={job_id:job.input.job_id,output_hash:hash(output),imported_at:now};
      }
      const accepted={job_id:job.input.job_id,story_id:job.candidate.story_id,decision:output.decision.status,editorial:record,record:null,staged,output_hash:hash(output),accepted_at:now};
      job.accepted=accepted;job.status='accepted';job.accepted_at=now;job.output_detected_at=(await bridge.store.observation(`output:${job.input.job_id}`))?.at||now;
      if(staged&&record)job.staging={editorial:record,html:editorialAnalysisPage(record,job.candidate)};
      await bridge.store.put(job);
      if(record&&!staged){catalog.analyses=[...catalog.analyses.filter(a=>a.analysis_id!==record.analysis_id),record];changed=true;}
      results.push({job_id:job.input.job_id,decision:output.decision.status,staged,changed:Boolean(record&&!staged)});
    }catch(error){await bridge.failure(job,'import',error,now);}
  }
  if(changed){catalog.updated_at=now;const temporary=storeFile+'.tmp-'+process.pid;fs.writeFileSync(temporary,JSON.stringify(catalog,null,2)+'\n');fs.renameSync(temporary,storeFile);}
  return results;
}
