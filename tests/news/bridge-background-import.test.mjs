import test from 'node:test';
import assert from 'node:assert/strict';
import { importBackgroundImpact } from '../../scripts/news/bridge/background-import.mjs';

test('Oracle bulk-read failure in legacy pass preserves completed current-news publication', async () => {
  const report = { published_stories: 1, public_changed: true, bridge_results: [{job_id:'current',decision:'publish',staged:false}] };
  const error = Object.assign(Error('BRIDGE_REMOTE_INVALID_RESPONSE'), { retryable:true,transient_read_failure:true,operation:'store.all',http_status:502 });
  await importBackgroundImpact(async () => { throw error; }, report, '2026-09-12T01:38:55Z');
  assert.equal(report.published_stories, 1);
  assert.equal(report.public_changed, true);
  assert.deepEqual(report.bridge_results, [{job_id:'current',decision:'publish',staged:false}]);
  assert.equal(report.operational_status, 'degraded');
  assert.equal(report.bridge_impact_deferred.status, 'retry_required');
  assert.deepEqual(report.bridge_impact_results, []);
});

test('deferral never invents a publication when no current news passed', async () => {
  const report={published_stories:0,public_changed:false};
  await importBackgroundImpact(async()=>{throw Object.assign(Error('BRIDGE_REMOTE_INVALID_RESPONSE'),{retryable:true,transient_read_failure:true});},report,'2026-09-12T01:38:55Z');
  assert.equal(report.public_changed,false);
  assert.equal(report.published_stories,0);
});

test('content gates, authorization, writes and unclassified errors remain hard failures', async () => {
  const errors=[Error('BRIDGE_PUBLICATION_GATE_FAILED'),Error('BRIDGE_UNAUTHORIZED'),Error('BRIDGE_OWNER_MISMATCH'),Object.assign(Error('BRIDGE_REMOTE_INVALID_RESPONSE'),{retryable:true,transient_read_failure:false}),Error('BRIDGE_REMOTE_INVALID_RESPONSE')];
  for(const error of errors)await assert.rejects(importBackgroundImpact(async()=>{throw error;},{},'2026-09-12T01:38:55Z'),e=>e===error);
});

test('successful legacy correction retains normal changed flag and results', async () => {
  const report={public_changed:false};const results=[{job_id:'profile',changed:true}];
  await importBackgroundImpact(async()=>results,report,'2026-09-12T01:38:55Z');
  assert.deepEqual(report.bridge_impact_results,results);
  assert.equal(report.public_changed,true);
  assert.equal(report.bridge_impact_deferred,undefined);
});
