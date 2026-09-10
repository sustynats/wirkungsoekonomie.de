import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {withRequestDeadline} from '../../scripts/news/request-deadline.mjs';
test('an otherwise idle worker rejects a stalled operation instead of exiting with unsettled await 13',()=>{
 const moduleUrl=new URL('../../scripts/news/request-deadline.mjs',import.meta.url).href;
 const code=`import {withRequestDeadline} from ${JSON.stringify(moduleUrl)};try{await withRequestDeadline(()=>new Promise(()=>{}),{timeoutMs:25,code:'TEST_TIMEOUT'});process.exitCode=1;}catch(e){if(e.message!=='TEST_TIMEOUT'||!e.retryable)throw e;console.log('bounded');}`;
 assert.equal(execFileSync(process.execPath,['--input-type=module','-e',code],{encoding:'utf8',timeout:3000}).trim(),'bounded');
});
test('deadline also bounds cleanup that ignores abort and marks the signal aborted',async()=>{
 let signal;
 await assert.rejects(withRequestDeadline(s=>{signal=s;return new Promise(()=>{});},{timeoutMs:15,code:'BODY_CLEANUP_TIMEOUT'}),/BODY_CLEANUP_TIMEOUT/);
 assert.equal(signal.aborted,true);
});
test('successful requests and explicit failures settle unchanged and clear their timers',async()=>{
 assert.equal(await withRequestDeadline(async()=>42,{timeoutMs:10000,code:'TIMEOUT'}),42);
 const failure=Error('SOURCE_DISABLED');
 await assert.rejects(withRequestDeadline(async()=>{throw failure;},{timeoutMs:10000,code:'TIMEOUT'}),error=>error===failure);
});
