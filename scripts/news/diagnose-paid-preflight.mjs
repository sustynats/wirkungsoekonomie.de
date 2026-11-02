// Temporary CI diagnostic: only GitHub read operations, no provider requests.
import {execFileSync} from 'node:child_process';
import {reportFromRunLog} from './recover-failed-usage.mjs';
import {documentedZeroPaidAttempt,zeroAttemptReportFingerprint,runInterruptedPaidPreflight} from './retained-failed-paid-work.mjs';
const gh=args=>execFileSync('gh',args,{encoding:'utf8',maxBuffer:24*1024*1024,timeout:20000});
const repo='repos/sustynats/wirkungsoekonomie.de', ids=[40810169757,41418607343],runs=new Map();
for(let page=1;page<=20&&runs.size<ids.length;page++){
 const response=JSON.parse(gh(['api',`${repo}/actions/workflows/wirkungsticker.yml/runs?per_page=100&page=${page}`]));
 for(const run of response.workflow_runs)if(ids.includes(run.id))runs.set(run.id,run);
 if(!response.workflow_runs.length)break;
}
const evidence=[];
for(const id of ids){
 const run=runs.get(id);if(!run)throw Error('PINNED_RUN_NOT_FOUND');
 const response=JSON.parse(gh(['api',`${repo}/actions/runs/${id}/jobs?per_page=100`]));
 const native=response.jobs.flatMap(j=>j.steps||[]).find(s=>/^Import, analyze(?: \(one call per story\))? and build$/.test(s.name||''));
 if(!native)throw Error('PINNED_NATIVE_STEP_NOT_FOUND');
 const log=gh(['run','view',String(id),'--repo','sustynats/wirkungsoekonomie.de','--log']);
 const report=reportFromRunLog(log,{nativeStep:native});if(!report)throw Error('PINNED_REPORT_NOT_FOUND');
 let events=0;
 for(const line of log.split('\n')){
  const m=line.match(/\t(Import, analyze(?: \(one call per story\))? and build|UNKNOWN STEP)\t/);if(!m)continue;
  const payload=line.slice(m.index+m[0].length),split=payload.indexOf(' '),at=Date.parse(payload.slice(0,split));
  if(m[1]==='UNKNOWN STEP'&&(!Number.isFinite(at)||at<Date.parse(native.started_at)||at>=Date.parse(native.completed_at)+1000))continue;
  const i=payload.indexOf('{"news_import_progress":');if(i>=0&&JSON.parse(payload.slice(i)).news_import_progress.stage==='provider_request_started')events++;
 }
 evidence.push({id,conclusion:run.conclusion,native:native.conclusion,provider_start_events:events,ai_calls:report.ai_calls,
  fingerprint:zeroAttemptReportFingerprint(report),freshness:report.freshness?.length,followups:report.followups_due?.length,
  documented_zero:documentedZeroPaidAttempt(run,report)});
}
const guard=runInterruptedPaidPreflight({write:false});
console.log(JSON.stringify({node:process.version,evidence,guard:{status:guard.status,unresolved_run_ids:guard.unresolved_run_ids,
 unresolved_reasons:guard.unresolved_reasons,verification_error:guard.verification_error},provider_called:false}));
