import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Execute the actual CLI, with in-memory import/lane boundaries. No provider,
// private files, approvals or real HTTP requests are touched.
const source = fs.readFileSync(new URL('../../scripts/news/import-approved-editorials.mjs', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '').replace(/^export /gm, '').replaceAll('import.meta.url', '"file:///fixture/cli.mjs"');
async function cli({ mode = 'finalize', failure = null, failed = [], skip = null } = {}) {
  const log = [], calls = [], process = { argv: ['node', '/fixture/cli.mjs', `--${mode}`], env: {}, exitCode: 0 };
  const store = {
    acquire: async () => { calls.push('acquire'); if (skip) throw Error(skip); },
    release: async () => calls.push('release'),
    editorialFinalize: async () => { calls.push('finalize'); if (failure) throw Error(failure); return { published: 0 }; },
  };
  await vm.runInNewContext(`(async () => { ${source} })()`, {
    path, fileURLToPath, process,
    console: Object.fromEntries(['log', 'warn', 'error'].map(method => [method, value => log.push(value)])),
    bridgeSession: () => ({ store }),
    acquireLane: async action => action(),
    importApprovedEditorials: async () => { calls.push('claim'); if (failure) throw Error(failure); return { changed: false, failed }; },
  });
  return { code: process.exitCode, log, calls };
}

test('uncertain receipt fails visibly and is not repeated; held lane is released', async () => {
  const result = await cli({ failure: 'BRIDGE_REMOTE_INVALID_RESPONSE' });
  assert.equal(result.code, 1);
  assert.deepEqual(result.calls, ['acquire', 'finalize', 'release']);
  assert.ok(result.log.some(line => line.includes('"status":"failed"')));
});
test('technical claim and rejected single editions both make the CLI fail', async () => {
  assert.equal((await cli({ mode: 'claim', failure: 'BRIDGE_REMOTE_TIMEOUT' })).code, 1);
  assert.equal((await cli({ mode: 'claim', failed: [{ code: 'EDITORIAL_INVALID' }] })).code, 1);
});
test('zero published, empty claims and definite lane contention remain non-failures', async () => {
  assert.equal((await cli()).code, 0);
  assert.equal((await cli({ mode: 'claim' })).code, 0);
  const result = await cli({ skip: 'BRIDGE_RUN_LOCKED' });
  assert.equal(result.code, 0); assert.deepEqual(result.calls, ['acquire']);
});
test('unknown error text stays redacted in the actual CLI', async () => {
  const result = await cli({ failure: 'credential-private-value with spaces' });
  assert.equal(result.code, 1);
  assert.doesNotMatch(result.log.join('\n'), /credential-private-value/);
  assert.match(result.log.join('\n'), /EDITORIAL_IMPORT_FAILED/);
});
test('final workflow gate runs after delivery/raw archive and before recovery archive', () => {
  const yaml = fs.readFileSync(new URL('../../.github/workflows/wirkungsticker.yml', import.meta.url), 'utf8');
  for (const name of ["Fetch Natalie's news orders from the private editorial desk", "Hand analysed news orders to Natalie's approval list",
    'Take over editions approved in the private editorial desk', 'Acknowledge approved editions after the durable push']) {
    const step = yaml.split(`- name: ${name}`)[1].split('\n      - name:')[0];
    assert.match(step, /continue-on-error: true/);
  }
  assert.match(yaml, /Acknowledge approved editions after the durable push\s+id: approval_receipt/);
  assert.match(yaml, /Fetch Natalie's news orders from the private editorial desk\s+id: news_order_fetch/);
  assert.match(yaml, /Hand analysed news orders to Natalie's approval list\s+id: news_order_delivery/);
  const gate = yaml.indexOf('- name: Report incomplete editorial takeover or receipt');
  assert.ok(yaml.indexOf('- name: Publish the committed ticker automatically') < gate);
  assert.ok(yaml.indexOf('- name: Preserve paid model answers for gate diagnosis') < gate);
  assert.ok(gate < yaml.indexOf('- name: Preserve failed-run work and usage for recovery'));
  const step = yaml.slice(gate).split('\n      - name:')[0];
  assert.match(step, /if: always\(\).*inputs\.dry_run != true.*steps\.approved\.outcome == 'failure'.*steps\.approval_receipt\.outcome == 'failure'/);
  assert.match(step, /steps\.news_order_fetch\.outcome == 'failure'.*steps\.news_order_delivery\.outcome == 'failure'/);
  const shell = step.split('run: |\n')[1].split('\n').map(line => line.slice(10)).join('\n');
  assert.equal(spawnSync('bash', ['-c', shell], { encoding: 'utf8' }).status, 1);
});

// These commands already signal transport errors with Exit 1. Exercise the
// actual CLI to prove that the final workflow gate observes real failures,
// not a new status invented for the test. Files and journal remain in memory.
const orderSource = fs.readFileSync(new URL('../../scripts/news/meldungsauftraege.mjs', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '').replace(/^export /gm, '').replaceAll('import.meta.url', '"file:///fixture/orders.mjs"');
async function orderCli(schritt, failure) {
  const calls = [], log = [], process = { argv: ['node', '/fixture/orders.mjs', schritt], env: {
    GITHUB_RUN_ID: '42', GITHUB_RUN_ATTEMPT: '1', WOEK_NEWS_ORDER_FILE: '/fixture/input.json', WOEK_NEWS_ORDER_RESULT_FILE: '/fixture/output.json',
  }, exitCode: 0 };
  const store = {
    acquire: async () => calls.push('acquire'), release: async () => calls.push('release'),
    all: async () => { calls.push('read'); if (failure) throw Error(failure); return []; },
    get: async () => ({ status: 'queued', input: { job_id: 'fixture', input_hash: 'hash' } }),
    put: async () => { calls.push('write'); if (failure) throw Error(failure); },
  };
  await vm.runInNewContext(`(async () => { ${orderSource} })()`, {
    path, fileURLToPath, process,
    fs: { existsSync: () => schritt === 'abgeben' && !!failure,
      readFileSync: () => JSON.stringify({ ergebnisse: [{ job_id: 'fixture', input_hash: 'hash', status: 'offen' }] }),
      mkdirSync() {}, writeFileSync() { calls.push('file'); } },
    console: Object.fromEntries(['log', 'warn', 'error'].map(method => [method, value => log.push(value)])),
    bridgeSession: () => ({ store }), acquireLane: async action => action(), hash: () => 'fixture',
  });
  return { code: process.exitCode, log, calls };
}
test('actual order fetch and delivery fail visibly without repeating an uncertain operation', async () => {
  for (const schritt of ['holen', 'abgeben']) {
    const result = await orderCli(schritt, 'BRIDGE_REMOTE_INVALID_RESPONSE');
    assert.equal(result.code, 1);
    assert.deepEqual(result.calls, ['acquire', schritt === 'holen' ? 'read' : 'write', 'release']);
    assert.match(result.log.join('\n'), /"status":"failed"/);
  }
});
test('empty successful order reads and missing delivery outputs stay non-failures', async () => {
  assert.equal((await orderCli('holen')).code, 0);
  const result = await orderCli('abgeben');
  assert.equal(result.code, 0); assert.deepEqual(result.calls, []);
  assert.match(result.log.join('\n'), /nichts_abzugeben/);
});
