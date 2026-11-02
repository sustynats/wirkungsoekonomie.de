// Temporary, read-only GitHub Actions diagnostic. No provider calls or writes.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {reportFromRunLog} from './recover-failed-usage.mjs';
const gh=args=>execFileSync('gh',args,{encoding:'utf8',maxBuffer:24*1024*1024,timeout:20000});
const sha=x=>createHash('sha256').update(x).digest('hex');
const runId=41418607343, repo='repos/sustynats/wirkungsoekonomie.de';
const jobs=JSON.parse(gh(['api',`${repo}/actions/runs/${runId}/jobs?per_page=100`]));
if(jobs.total_count!==1||jobs.jobs.length!==1)throw Error('EXPECTED_ONE_NATIVE_JOB');
const native=jobs.jobs[0].steps.find(s=>/^Import, analyze(?: \(one call per story\))? and build$/.test(s.name||''));
if(!native||native.conclusion!=='success')throw Error('EXPECTED_SUCCESSFUL_NATIVE_STEP');
const log=gh(['run','view',String(runId),'--repo','sustynats/wirkungsoekonomie.de','--log']);
try {const report=reportFromRunLog(log,{nativeStep:native});console.log(JSON.stringify({diagnostic:'report_parsed',run_id:runId,log_sha256:sha(log),log_bytes:Buffer.byteLength(log),report_run_id:report?.run_id,provider_called:false}));}
catch(error) {
 const match=String(error.message).match(/position (\d+)/),position=match?Number(match[1]):null;
 const start=Date.parse(native.started_at),end=Date.parse(native.completed_at),step=/\t(Import, analyze(?: \(one call per story\))? and build|UNKNOWN STEP)\t/;
 const rows=log.split('\n').flatMap(line=>{const m=line.match(step);if(!m)return[];const rest=line.slice(m.index+m[0].length),i=rest.indexOf(' '),timestamp=rest.slice(0,i),at=Date.parse(timestamp),payload=rest.slice(i+1);return[{step:m[1],timestamp,at,payload,inside:m[1]!=='UNKNOWN STEP'||Number.isFinite(at)&&at>=start&&at<end+1000}];});
 const nativeRows=rows.filter(r=>r.inside), index=nativeRows.findIndex(r=>r.payload.trim()==='{');if(index<0||position===null)throw Error('DIAGNOSTIC_REPORT_START_OR_POSITION_MISSING');
 const body=nativeRows.slice(index).map(r=>r.payload).join('\n'),lineAt=body.slice(0,position).split('\n').length,lines=body.split('\n');
 const around=lines.slice(Math.max(0,lineAt-4),lineAt+3).map((line,i)=>({line:Math.max(0,lineAt-4)+i+1,length:line.length,sha256:sha(line),shape:line.slice(0,180).replace(/[^\s{}\[\],:"*\\]/gu,'x')}));
 const missingHash='3a9e0ff51f8f8836039af567385a4f68f5946602b3ee72233eb5160a132b5a20';
 const target=rows.filter(r=>sha(r.payload)===missingHash).map(({step,timestamp,inside})=>({step,timestamp,inside}));
 console.log(JSON.stringify({diagnostic:'report_parse_failed',run_id:runId,error_name:error.name,error_message:error.message,log_sha256:sha(log),log_bytes:Buffer.byteLength(log),native_lines:nativeRows.length,body_length:body.length,line_at_error:lineAt,around,expected_missing_line_occurrences:target,provider_called:false}));
}
