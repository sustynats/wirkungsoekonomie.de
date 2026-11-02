// Temporary read-only CI diagnostic. It never calls a paid provider.
import {execFileSync} from 'node:child_process';
import {reportFromRunLog} from './recover-failed-usage.mjs';
import {documentedZeroPaidAttempt,zeroAttemptReportFingerprint,runInterruptedPaidPreflight} from './retained-failed-paid-work.mjs';
const gh=args=>execFileSync('gh',args,{encoding:'utf8',maxBuffer:24*1024*1024,timeout:30000});
const repo='repos/sustynats/wirkungsoekonomie.de',ids=[41418607343,41436498548],evidence=[];
for(const id of ids){
 const run=JSON.parse(gh(['api',`${repo}/actions/runs/${id}`]));
 const response=JSON.parse(gh(['api',`${repo}/actions/runs/${id}/jobs?per_page=100`]));
 const native=response.jobs.flatMap(j=>j.steps||[]).find(s=>/^Import, analyze(?: \(one call per story\))? and build$/.test(s.name||''));
 if(!native||native.conclusion!=='success')throw Error('PINNED_NATIVE_STEP_NOT_SUCCESSFUL');
 const log=gh(['run','view',String(id),'--repo','sustynats/wirkungsoekonomie.de','--log']);
 const report=reportFromRunLog(log,{nativeStep:native});if(!report)throw Error('PINNED_REPORT_NOT_FOUND');
 let events=0;
 for(const line of log.split('\n')){
  const m=line.match(/\t(Import, analyze(?: \(one call per story\))? and build|UNKNOWN STEP)\t/);if(!m)continue;
  const payload=line.slice(m.index+m[0].length),split=payload.indexOf(' '),at=Date.parse(payload.slice(0,split).replace(/^\uFEFF/,''));
  if(m[1]==='UNKNOWN STEP'&&(!Number.isFinite(at)||at<Date.parse(native.started_at)||at>=Date.parse(native.completed_at)+1000))continue;
  const i=payload.indexOf('{"news_import_progress":');if(i>=0&&JSON.parse(payload.slice(i)).news_import_progress.stage==='provider_request_started')events++;
 }
 const row={id,conclusion:run.conclusion,native:native.conclusion,provider_start_events:events,ai_calls:report.ai_calls,
  fingerprint:zeroAttemptReportFingerprint(report),freshness:report.freshness?.length,followups:report.followups_due?.length,
  documented_zero:documentedZeroPaidAttempt(run,report)};
 evidence.push(row);
 if(events!==0||!row.documented_zero)throw Error('PINNED_ZERO_CHECK_FAILED');
}
const guard=runInterruptedPaidPreflight({write:false});
console.log(JSON.stringify({node:process.version,evidence,guard:{status:guard.status,unresolved_run_ids:guard.unresolved_run_ids,
 unresolved_reasons:guard.unresolved_reasons,verification_error:guard.verification_error},provider_called:false}));
if(guard.status!=='checked')throw Error('FULL_GUARD_NOT_CHECKED');
