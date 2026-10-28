import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {verifyInterruptedPaidRuns, interruptedPaidWorkBlocked, INTERRUPTED_PAID_GUARD_VERSION as version} from '../../scripts/news/recover-failed-usage.mjs';

const now='2026-10-28T22:05:00Z';
const run=(id,patch={})=>({id,run_attempt:1,status:'completed',conclusion:'cancelled',
  created_at:'2026-10-28T21:59:00Z',updated_at:'2026-10-28T22:02:00Z',
  html_url:`https://github.com/sustynats/wirkungsoekonomie.de/actions/runs/${id}`,...patch});
const current=()=>run(20,{status:'in_progress',conclusion:null,created_at:'2026-10-28T22:03:00Z',updated_at:'2026-10-28T22:03:00Z'});
const report=(patch={})=>({schema_version:'1.2',run_id:'10',processing_version:'2026-09-15-direct-3',
  started_at:'2026-10-28T22:00:00Z',completed_at:'2026-10-28T22:01:00Z',ai_calls:2,ai_stories:2,
  ai_request_attempts:2,input_tokens:200,output_tokens:100,estimated_cost_usd:0.001,
  token_source:'provider_reported_usage',published_stories:2,updated_stories:0,title_images:[],...patch});
const nativeName='Import, analyze (one call per story) and build';
const jobs=()=>({total_count:1,jobs:[{conclusion:'cancelled',steps:[{name:nativeName,conclusion:'success'}]}]});
const log=(value,ids=['wt-a','wt-b'])=>[...ids.map(id=>JSON.stringify({news_import_progress:{stage:'provider_request_started',story_ids:[id]}})),
  ...JSON.stringify(value,null,2).split('\n')].map(line=>`update\t${nativeName}\t2026-10-28T22:01:01Z ${line}`).join('\n');
function harness({rows=[current(),run(10)],jobResponse=jobs(),nativeLog=log(report()),details={},fail=false}={}) {
  const calls=[];
  const gh=args=>{
    calls.push(args);
    if(fail)throw Error('untrusted secret network message');
    if(args[0]==='run')return nativeLog;
    const url=args[1];
    if(url.includes('/actions/workflows/'))return JSON.stringify({total_count:rows.length,workflow_runs:rows});
    if(url.includes('/jobs?'))return JSON.stringify({...jobResponse,jobs:jobResponse.jobs.map((job,i)=>({id:i+1,run_id:10,...job}))});
    const id=Number(url.split('/').at(-1));
    const found=details[id]||rows.find(row=>row.id===id);
    if(!found)throw Error('unexpected lookup');
    return JSON.stringify(found);
  };
  return {gh,calls};
}
const check=(usage,h,patch={})=>verifyInterruptedPaidRuns({usage,now,runId:20,runAttempt:1,gh:h.gh,...patch});
const documented=id=>[{retry_count:1,recovery:{run_id:10}}];

test('completed uncommitted spending is retained once, and missing input receipts block further paid work',()=>{
  const usage={runs:[],preserved:{marker:'unchanged'}},h=harness();
  const guard=check(usage,h);
  assert.equal(guard.status,'open');assert.deepEqual(guard.unresolved_run_ids,[10]);
  assert.equal(usage.runs.length,1);assert.equal(usage.runs[0].ai.estimated_cost_usd,0.001);
  assert.equal(usage.runs[0].counts.published_stories,0);assert.equal(usage.runs[0].recovery.publication_committed,false);
  const paid=structuredClone(usage.runs[0]);
  const held=check(usage,h);assert.equal(held.status,'open');assert.equal(usage.runs.length,1);
  const resolved=check(usage,h,{documentedAttempts:documented});
  assert.equal(resolved.status,'checked');assert.deepEqual(resolved.unresolved_run_ids,[]);
  assert.equal(usage.runs.length,1);assert.deepEqual(usage.runs[0],paid);assert.deepEqual(usage.preserved,{marker:'unchanged'});
});

test('a complete original atomic usage receipt does not charge or process the same runner again',()=>{
  const receipt={started_at:report().started_at,processing_version:report().processing_version,ai:{requests:2,estimated_cost_usd:0.001}};
  const usage={runs:[structuredClone(receipt)]};
  assert.equal(check(usage,harness()).status,'checked');assert.deepEqual(usage.runs,[receipt]);
});

test('only a proven unstarted native step or an unallocated runner establishes no paid work',()=>{
  for(const jobResponse of [{total_count:0,jobs:[]},{total_count:1,jobs:[{conclusion:'skipped',steps:[]}]},
    {total_count:1,jobs:[{conclusion:'failure',steps:[{name:nativeName,conclusion:'skipped'}]}]}]) {
    const usage={runs:[]},h=harness({jobResponse});assert.equal(check(usage,h).status,'checked');
    assert.equal(h.calls.filter(args=>args[0]==='run').length,0);assert.deepEqual(usage.runs,[]);
  }
  for(const jobResponse of [{total_count:1,jobs:[{conclusion:'failure',steps:[]}]},
    {total_count:2,jobs:[{steps:[{name:nativeName,conclusion:'skipped'}]},{steps:[]}]}]) {
    assert.equal(check({runs:[]},harness({jobResponse})).status,'open');
  }
});

test('a complete explicit zero-request report is different from a missing or interrupted report',()=>{
  const zero=report({ai_calls:0,ai_stories:0,ai_request_attempts:0,input_tokens:0,output_tokens:0,estimated_cost_usd:0,published_stories:0});
  assert.equal(check({runs:[]},harness({nativeLog:log(zero,[])})).status,'checked');
  for(const nativeLog of ['',log(zero,['wt-a']),log(report()).slice(0,140)]) {
    const usage={runs:[]};assert.equal(check(usage,harness({nativeLog})).status,'open');assert.deepEqual(usage.runs,[]);
  }
});

test('uncommitted image generation needs its own audited retained source, not a zero news-call count',()=>{
  const zero=report({ai_calls:0,ai_request_attempts:0,input_tokens:0,output_tokens:0,estimated_cost_usd:0,
    title_images:[{story_id:'wt-image',status:'generated',higgsfield_called:true,source_reused:false}]});
  assert.equal(check({runs:[]},harness({nativeLog:log(zero,[])})).status,'open');
  const documentedAttempts=()=>[{retry_count:1,recovery:{run_id:10,retained_visual_source_sha256:'a'.repeat(64)}}];
  assert.equal(check({runs:[]},harness({nativeLog:log(zero,[])}),{documentedAttempts}).status,'checked');
  for(const image of [{status:'generated',higgsfield_called:false},{status:'generated',higgsfield_called:true,source_reused:true},{status:'deferred'}]) {
    assert.equal(check({runs:[]},harness({nativeLog:log({...zero,title_images:[image]},[])})).status,'checked');
  }
});

test('a documented ID cannot cover extra unknown calls or an unbound report',()=>{
  for(const nativeLog of [log(report(),['wt-a']),log(report({run_id:'999'})),
    log(report({completed_at:'2026-10-28T22:03:00Z'})),log(report({input_tokens:-1}))]) {
    assert.equal(check({runs:[]},harness({nativeLog}),{documentedAttempts:documented}).status,'open');
  }
});

test('the moving scan window retains an older queued runner until its actual terminal outcome is verified',()=>{
  const previous={version,status:'checked',window_start:'2026-10-28T22:03:00Z',tracked_run_ids:[5],checked_runs:[],unresolved_run_ids:[]};
  const older=run(5,{created_at:'2026-10-28T21:50:00Z'}),usage={runs:[],failed_run_recovery:{interrupted_guard:previous}};
  const h=harness({rows:[current()],details:{5:older},nativeLog:log(report({run_id:'5'})),jobResponse:{...jobs(),jobs:jobs().jobs.map(job=>({...job,run_id:5}))}});
  assert.deepEqual(check(usage,h).unresolved_run_ids,[5]);assert.equal(usage.runs.length,1);
  assert.ok(h.calls.some(args=>args[1]?.endsWith('/runs/5')));
});

test('an old queued current run is allowed only when the previous persisted scan retained its identity',()=>{
  const previous={version,status:'checked',window_start:'2026-10-28T22:04:00Z',tracked_run_ids:[20],checked_runs:[],unresolved_run_ids:[]};
  assert.equal(check({runs:[],failed_run_recovery:{interrupted_guard:previous}},harness({rows:[current()]})).status,'checked');
  const guard=check({runs:[],failed_run_recovery:{interrupted_guard:{...previous,tracked_run_ids:[]}}},harness({rows:[current()]}));
  assert.equal(guard.status,'open');assert.equal(guard.verification_error,'PAID_PREFLIGHT_OLD_UNTRACKED_RUN');
});

test('read failures preserve the scan frontier and old unresolved identities without leaking error contents',()=>{
  const previous={version,status:'open',window_start:'2026-10-28T22:00:00Z',tracked_run_ids:[7],unresolved_run_ids:[5],checked_runs:[]};
  const usage={runs:[],failed_run_recovery:{legacy_marker:true,interrupted_guard:previous}};
  const guard=check(usage,harness({fail:true}));assert.equal(guard.status,'open');
  assert.equal(guard.window_start,previous.window_start);assert.deepEqual(guard.unresolved_run_ids,[5]);
  assert.ok(guard.tracked_run_ids.includes(7));assert.equal(usage.failed_run_recovery.legacy_marker,true);
  assert.equal(JSON.stringify(guard).includes('secret'),false);
});

test('reruns and missing or stale run-bound preflight receipts fail closed',()=>{
  const h=harness({rows:[{...current(),run_attempt:2}]});
  assert.equal(check({runs:[]},h,{runAttempt:2}).verification_error,'PAID_PREFLIGHT_RERUN_REQUIRES_AUDIT');
  const good={version,status:'checked',checked_for_run_id:'20',checked_for_run_attempt:1};
  assert.equal(interruptedPaidWorkBlocked(good,{requireCurrentRun:true,runId:20,runAttempt:1}),false);
  for(const guard of [null,{...good,status:'open'},{...good,version:'old'},{...good,checked_for_run_id:'19'},
    {...good,checked_for_run_attempt:2}])assert.equal(interruptedPaidWorkBlocked(guard,{requireCurrentRun:true,runId:20,runAttempt:1}),true);
});

test('the workflow checks interrupted work before the provider step, without exposing the provider key to the check',()=>{
  const yaml=fs.readFileSync(new URL('../../.github/workflows/wirkungsticker.yml',import.meta.url),'utf8');
  const preflight=yaml.indexOf('- name: Verify interrupted paid work before another provider request');
  const native=yaml.indexOf('- name: Import, analyze (one call per story) and build');
  assert.ok(preflight>yaml.indexOf('- name: Validate the existing archive encryption key')&&preflight<native);
  const step=yaml.slice(preflight,native);assert.ok(step.includes('retained-failed-paid-work.mjs --preflight'));
  assert.ok(step.includes('GH_TOKEN:'));assert.ok(!step.includes('OPENAI_API_KEY'));
});

test('untrusted ledger identities never become API paths',()=>{
  const usage={runs:[],failed_run_recovery:{interrupted_guard:{version,status:'open',window_start:now,
    tracked_run_ids:['../../user'],unresolved_run_ids:[],checked_runs:[]}}};
  const original=structuredClone(usage),h=harness();
  assert.throws(()=>check(usage,h),/LEDGER_INVALID/);assert.deepEqual(usage,original);assert.equal(h.calls.length,0);
});

test('truncated, misbound and unordered API inventories cannot establish a safe preflight',()=>{
  for(const body of [{total_count:3,workflow_runs:[]},{workflow_runs:[]},
    {total_count:2,workflow_runs:[run(10),current()]}]) {
    const guard=verifyInterruptedPaidRuns({usage:{runs:[]},now,runId:20,gh:()=>JSON.stringify(body)});
    assert.equal(guard.status,'open');assert.match(guard.verification_error,/RUN_LIST_INVALID|RUN_ORDER_INVALID/);
  }
  const h=harness({jobResponse:{total_count:1,jobs:[{id:1,run_id:999,steps:[{name:nativeName,conclusion:'skipped'}]}]}});
  assert.equal(check({runs:[]},h).unresolved_reasons[10],'PAID_PREFLIGHT_JOBS_INCOMPLETE');
});

test('provider progress in unit-test steps cannot be mistaken for another real paid input',()=>{
  const fake='update\tUnit and security tests\t2026-10-28T22:00:00Z '+JSON.stringify({news_import_progress:{stage:'provider_request_started',story_ids:['test-only']}});
  assert.equal(check({runs:[]},harness({nativeLog:fake+'\n'+log(report())}),{documentedAttempts:documented}).status,'checked');
  const h=harness({rows:[{...current(),status:'completed',conclusion:'success'}]});
  assert.equal(check({runs:[]},h).verification_error,'PAID_PREFLIGHT_CURRENT_RUN_NOT_ACTIVE');
});

test('cancelled UNKNOWN STEP lines require the independently recorded native time interval',()=>{
  const unknown=log(report({diagnostic:'escaped " quote and } brace'})).replaceAll(nativeName,'UNKNOWN STEP');
  const noise='update\tUNKNOWN STEP\t2026-10-28T21:59:30Z '+JSON.stringify({news_import_progress:{stage:'provider_request_started',story_ids:['unit-test']}});
  const jobResponse={total_count:1,jobs:[{steps:[{name:nativeName,conclusion:'success',started_at:'2026-10-28T22:00:00Z',completed_at:'2026-10-28T22:01:02Z'}]}]};
  const next='update\tUNKNOWN STEP\t2026-10-28T22:01:01.900Z {"next_step":"unrelated"}';
  jobResponse.jobs[0].steps[0].completed_at='2026-10-28T22:01:01Z';
  const h=harness({nativeLog:noise+'\n'+unknown+'\n'+next,jobResponse});
  assert.equal(check({runs:[]},h,{documentedAttempts:documented}).status,'checked');
  assert.equal(check({runs:[]},harness({nativeLog:unknown}),{documentedAttempts:documented}).status,'open');
  jobResponse.jobs[0].steps[0].completed_at='2026-10-28T22:00:59Z';
  assert.equal(check({runs:[]},harness({nativeLog:unknown,jobResponse}),{documentedAttempts:documented}).status,'open');
});

test('a short page cannot hide more recent runs, and an exhausted pagination cap cannot permit paid work',()=>{
  const partial=verifyInterruptedPaidRuns({usage:{runs:[]},now,runId:20,gh:()=>JSON.stringify({total_count:101,workflow_runs:[current()]})});
  assert.equal(partial.verification_error,'PAID_PREFLIGHT_RUN_LIST_INCOMPLETE');
  let pages=0;
  const capped=verifyInterruptedPaidRuns({usage:{runs:[]},now,runId:20,gh:()=>{
    pages++;
    return JSON.stringify({total_count:3000,workflow_runs:Array.from({length:100},(_,i)=>run(pages*100+i))});
  }});
  assert.equal(pages,20);assert.equal(capped.verification_error,'PAID_PREFLIGHT_RUN_LIST_INCOMPLETE');
});
