// Temporary CI diagnostic: only GitHub read operations, no provider requests.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {reportFromRunLog} from './recover-failed-usage.mjs';
import {documentedZeroPaidAttempt,runInterruptedPaidPreflight} from './retained-failed-paid-work.mjs';
const gh = args => execFileSync('gh',args,{encoding:'utf8',maxBuffer:24*1024*1024,timeout:20000});
const id=40810169757, repo='repos/sustynats/wirkungsoekonomie.de';
let run;
for(let page=1;page<=20&&!run;page++){
  const result=JSON.parse(gh(['api',`${repo}/actions/workflows/wirkungsticker.yml/runs?per_page=100&page=${page}`]));
  run=result.workflow_runs.find(r=>r.id===id);
  if(!result.workflow_runs.length)break;
}
if(!run)throw Error('PINNED_RUN_NOT_FOUND');
const result=JSON.parse(gh(['api',`${repo}/actions/runs/${id}/jobs?per_page=100`]));
const native=result.jobs.flatMap(j=>j.steps||[]).find(s=>/^Import, analyze(?: \(one call per story\))? and build$/.test(s.name||''));
if(!native)throw Error('PINNED_NATIVE_STEP_NOT_FOUND');
const log=gh(['run','view',String(id),'--repo','sustynats/wirkungsoekonomie.de','--log']);
const report=reportFromRunLog(log,{nativeStep:native});
if(!report)throw Error('PINNED_REPORT_NOT_FOUND');
const {transport,configured_model,...archived}=report;
const sha=createHash('sha256').update(JSON.stringify(archived)).digest('hex');
let starts=0;
for(const line of log.split('\n')){
 const m=line.match(/\t(Import, analyze(?: \(one call per story\))? and build|UNKNOWN STEP)\t/);if(!m)continue;
 const payload=line.slice(m.index+m[0].length),split=payload.indexOf(' '),at=Date.parse(payload.slice(0,split));
 if(m[1]==='UNKNOWN STEP'&&(!Number.isFinite(at)||at<Date.parse(native.started_at)||at>=Date.parse(native.completed_at)+1000))continue;
 const i=payload.indexOf('{"news_import_progress":');if(i>=0){const progress=JSON.parse(payload.slice(i)).news_import_progress;if(progress.stage==='provider_request_started')starts+=(progress.story_ids||[]).length;}
}
const guard=runInterruptedPaidPreflight({write:false});
console.log(JSON.stringify({node:process.version,run:{id:run.id,run_attempt:run.run_attempt,status:run.status,conclusion:run.conclusion,created_at:run.created_at,updated_at:run.updated_at},
 native:{conclusion:native.conclusion,provider_start_ids:starts},report:{run_id:report.run_id,run_id_type:typeof report.run_id,ai_calls:report.ai_calls,has_attempts:Object.hasOwn(report,'ai_request_attempts'),normalized_sha256:sha},
 exact_documented_zero:documentedZeroPaidAttempt(run,report),guard:{status:guard.status,unresolved_run_ids:guard.unresolved_run_ids,unresolved_reasons:guard.unresolved_reasons,verification_error:guard.verification_error},provider_called:false}));
