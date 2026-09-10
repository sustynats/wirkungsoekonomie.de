import test from 'node:test';
import assert from 'node:assert/strict';
import {runAdminAction} from '../../scripts/news/bridge/admin-actions.mjs';

test('manual collision links the running job without another writer or failure',async()=>{
  let calls=0;
  const result=await runAdminAction('SERVER_CYCLE_NOW',{gh:async()=>{calls++;return JSON.stringify([{status:'in_progress',url:'https://example.org/run'}]);},watch:()=>assert.fail('no duplicate writer'),log:()=>{}});
  assert.equal(result.status,'RUN_ALREADY_ACTIVE');assert.equal(calls,1);
});
test('manual cycle completes discovery before import and retains actual worker failures',async()=>{
  const events=[];let request;
  const deps={log:()=>{},gh:async args=>{
    if(args[0]==='workflow'){request=args.at(-1).slice('request_id='.length);events.push(args[2]);return '';}
    return args.at(-1).includes('status')?'[]':JSON.stringify([{databaseId:events.length,displayTitle:request,url:'https://example.org/run'}]);
  },watch:async id=>{events.push(`finished:${id}`);}};
  assert.equal((await runAdminAction('SERVER_CYCLE_NOW',deps)).status,'COMPLETED');
  assert.deepEqual(events,['wirkungsticker-discovery.yml','finished:1','wirkungsticker.yml','finished:3']);
  await assert.rejects(runAdminAction('IMPORT_NOW',{...deps,watch:async()=>{throw Error('worker failed');}}),/worker failed/);
});
