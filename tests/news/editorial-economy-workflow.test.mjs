import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('optional ffmpeg setup cannot consume the editorial job before source observation and archival', () => {
  const workflow = read('.github/workflows/redaktionsworker.yml');
  const step = name => workflow.split(`      - name: ${name}\n`)[1]?.split('\n      - name: ')[0];
  const setup = step('Set up ffmpeg for episode transcripts');
  assert.ok(setup, 'the optional ffmpeg setup step must exist');
  const timeout = Number(setup.match(/^        timeout-minutes: (\d+)$/m)?.[1]);
  assert.ok(timeout >= 1 && timeout <= 3, 'ffmpeg setup must stop within three minutes, not at the 25-minute job limit');
  assert.match(setup, /^        continue-on-error: true$/m);
  assert.match(setup, /if: vars\.WOEK_EDITORIAL_AUTO_EPISODES != 'false' && vars\.WOEK_EPISODE_TRANSCRIBE != 'false'/);
  assert.match(setup, /run: command -v ffmpeg >\/dev\/null \|\| \{ sudo apt-get update -qq && sudo apt-get install -y -qq ffmpeg; \}/);
  const observation = step('Propose Nachgesehen and Nachgehört requests from the followed shows');
  assert.match(observation, /if: vars\.WOEK_EDITORIAL_AUTO_EPISODES != 'false'/);
  assert.match(observation, /run: node scripts\/news\/sendungs-kandidaten\.mjs/);
  assert.ok(workflow.indexOf('run: node scripts/news/redaktionsworker.mjs') < workflow.indexOf('      - name: Set up ffmpeg'));
  assert.ok(workflow.indexOf('      - name: Set up ffmpeg') < workflow.indexOf('run: node scripts/news/sendungs-kandidaten.mjs'));
  assert.match(step('Seal paid originals for private recovery'), /if: always\(\)/);
  assert.match(step('Preserve encrypted paid model answers for diagnosis'), /if: always\(\) && steps\.sealed_raw\.outcome == 'success'/);
  assert.match(step('Report incomplete editorial processing'), /if: always\(\) && steps\.editorial_draft\.outcome == 'failure'/);
  assert.match(workflow, /concurrency:\n  group: redaktionsworker\n  cancel-in-progress: false/);
  assert.match(workflow, /^    timeout-minutes: 25$/m);
});

test('the direct news lane carries no scheduled editorial spending and no editorial request inputs', () => {
  // Direktbetrieb seit 15.09.2026: Meinung & Analyse läuft nicht mehr als
  // zweite bezahlte Lane im Nachrichtenworkflow. Explizite Aufträge gehören
  // in die private Redaktion, nicht in den Nachrichtenlauf.
  const workflow = read('.github/workflows/wirkungsticker.yml');
  assert.doesNotMatch(workflow, /Research and publish relevant WÖK analyses|news:editorial-analyses|EDITORIAL_REQUESTED_STORY_IDS|editorial_analysis_bootstrap/);
  const news = workflow.split('- name: Import, analyze (one call per story) and build')[1].split('- name: Read public ticker outcome')[0];
  assert.match(news, /node scripts\/news\/run-api\.mjs/);
  assert.doesNotMatch(news, /background-only|EDITORIAL_REQUESTED/);
});

test('full release prepares its history without weakening historical-content gates', () => {
  const deploy = read('.github/workflows/deploy.yml');
  assert.match(deploy, /bash scripts\/ops\/prepare-release-history\.sh/);
  assert.ok(deploy.indexOf('prepare-release-history.sh') < deploy.indexOf('bash scripts/ops/audit-generated-release.sh'));
  assert.match(deploy, /ref: \$\{\{ inputs\.ticker_commit \|\| github\.sha \}\}/);
});

test('release audit covers built news routes and still runs every semantic gate', () => {
  const deploy = read('.github/workflows/deploy.yml');
  assert.ok(deploy.indexOf('npm run news:validate') < deploy.indexOf('bash scripts/ops/audit-generated-release.sh'));
  assert.ok(deploy.indexOf('bash scripts/ops/audit-generated-release.sh') < deploy.indexOf('run: npm run build:artifact'));
  const script = read('scripts/ops/audit-generated-release.sh');
  assert.match(script, /set -euo pipefail/);
  for (const gate of ['audit_state_sustainability_architecture_fast', 'audit_state_sustainability_support_files', 'finalize_state_sustainability_matrix', 'check_state_sustainability_architecture', 'check_state_sustainability_wiwi_scope']) assert.match(script, new RegExp(`python3 tools/${gate}\\.py`));
  assert.doesNotMatch(script, /git (?:reset|checkout|switch|commit)|\|\| true/);
  assert.match(deploy, /state-sustainability-release-\$\{\{ steps\.release-source\.outputs\.commit \}\}/);
});

for (const failedGate of ['source', 'semantic']) test(`a ${failedGate} release failure aborts before producing a PASS receipt`, t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-release-audit-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const bin = path.join(temp, 'bin'); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'git'), '#!/bin/sh\necho 0123456789012345678901234567890123456789\n', { mode: 0o755 });
  fs.writeFileSync(path.join(bin, 'python3'), '#!/bin/sh\necho "$1" >> called\ncase "$1" in *check_state_sustainability_architecture.py) exit 42;; esac\n', { mode: 0o755 });
  fs.writeFileSync(path.join(bin, 'node'), `#!/bin/sh\necho source >> called\nexit ${failedGate === 'source' ? 41 : 0}\n`, { mode: 0o755 });
  fs.mkdirSync(path.join(temp, 'reports'));
  fs.writeFileSync(path.join(temp, 'reports/generated-release-audit.txt'), 'stale PASS');
  const result = spawnSync('bash', [path.join(root, 'scripts/ops/audit-generated-release.sh')], { cwd: temp, env: { ...process.env, PATH: `${bin}:${process.env.PATH}` }, encoding: 'utf8' });
  assert.equal(result.status, failedGate === 'source' ? 41 : 42, result.stderr);
  assert.equal(fs.existsSync(path.join(temp, 'reports/generated-release-audit.txt')), false);
  const called = fs.readFileSync(path.join(temp, 'called'), 'utf8');
  assert.match(called, /^source\n/);
  assert.doesNotMatch(called, /check_state_sustainability_wiwi_scope/);
  if (failedGate === 'source') assert.equal(called, 'source\n');
});

test('shallow detached release obtains its comparison base and never changes release HEAD', t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-release-history-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const upstream = path.join(temp, 'upstream');
  const checkout = path.join(temp, 'checkout');
  const git = (cwd, ...args) => {
    const result = spawnSync('git', args, { cwd, encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  git(temp, 'init', '-b', 'main', upstream);
  git(upstream, 'config', 'user.name', 'Test');
  git(upstream, 'config', 'user.email', 'test@example.invalid');
  git(upstream, 'commit', '--allow-empty', '-m', 'base');
  const release = git(upstream, 'rev-parse', 'HEAD');
  git(upstream, 'branch', 'release');
  git(upstream, 'commit', '--allow-empty', '-m', 'later data commit');
  git(temp, 'clone', '--quiet', '--depth=1', '--branch=release', `file://${upstream}`, checkout);
  assert.equal(spawnSync('git', ['merge-base', 'origin/main', 'HEAD'], { cwd: checkout }).status, 128);
  const result = spawnSync('bash', [path.join(root, 'scripts/ops/prepare-release-history.sh')], { cwd: checkout, encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(checkout, 'rev-parse', 'HEAD'), release);
  assert.equal(git(checkout, 'merge-base', 'origin/main', 'HEAD'), release);
});
