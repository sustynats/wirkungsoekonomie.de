import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../../.github/workflows/${name}.yml`, import.meta.url), 'utf8');
const ticker = read('wirkungsticker'), discovery = read('wirkungsticker-discovery'), monitor = read('ops-discord-monitor');

// Direktbetrieb seit 15.09.2026: der Nachrichtenworkflow ist eine gerade Linie
// ohne Bridge-Phasen. Diese Invarianten schützen die Betriebsentscheidung.
test('the ticker workflow is a single serialized lane without bridge phases or clock triggers', () => {
  const outer = ticker.match(/^concurrency:\n((?:  [^\n]*\n)+)/m)?.[1];
  assert.ok(outer, 'workflow-level concurrency required');
  assert.match(outer, /group: wirkungsticker-main\n/);
  assert.match(outer, /cancel-in-progress: false\n/, 'in-flight publications must finish');
  assert.doesNotMatch(ticker, /WOEK_NEWS_BRIDGE_PHASE|dropbox_chatgpt_bridge|wirkungsticker-oracle-bridge-access|scripts\/news\/bridge\//);
  assert.doesNotMatch(ticker, /codex\/wirkungsticker(?:-import)?-clock/, 'no push-triggered clock branches');
  assert.match(ticker, /^  schedule:\n    - cron: "\*\/15 \* \* \* \*"\n/m, 'one regular cadence');
  assert.match(ticker, /if: vars\.WIRKUNGSTICKER_PROCESSING_MODE == 'api' \|\| vars\.WIRKUNGSTICKER_PROCESSING_MODE == ''/);
});

test('exactly one paid attempt per input and the key only from the repository secret', () => {
  assert.match(ticker, /OPENAI_API_KEY: \$\{\{ secrets\.WIRKUNGSTICKER \}\}/);
  assert.match(ticker, /WOEK_NEWS_MAX_PAID_ATTEMPTS_PER_INPUT: "1"/);
  assert.match(ticker, /WOEK_NEWS_AI_ATTEMPTS_PER_STORY: "1"/);
  assert.match(ticker, /WOEK_NEWS_AI_BATCH_SIZE: "1"/);
  assert.match(ticker, /WOEK_NEWS_MAX_SOURCE_AGE_HOURS: \$\{\{ vars\.WOEK_NEWS_MAX_SOURCE_AGE_HOURS \|\| '24' \}\}/, 'LIFO horizon explicit in production');
  assert.match(ticker, /node scripts\/news\/run-api\.mjs/);
  assert.doesNotMatch(ticker, /sk-[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(ticker, /news:editorial-analyses|news:media-impact:backfill/, 'no second paid lane inside the news run');
});

test('publication remains atomic: validate before commit, deploy only after a pushed commit', () => {
  const validateAt = ticker.indexOf('npm run news:validate'), commitAt = ticker.indexOf('Commit one atomic update'), deployAt = ticker.indexOf('gh workflow run deploy.yml');
  assert.ok(validateAt > 0 && commitAt > validateAt && deployAt > commitAt, 'validate → commit → deploy order');
  assert.match(ticker, /steps\.commit\.outputs\.changed == 'true'/);
  assert.match(ticker, /npm run news:health -- --started-after/);
});

test('legacy bridge lanes stay inactive unless the bridge mode is explicitly selected', () => {
  assert.match(discovery, /if: vars\.WIRKUNGSTICKER_PROCESSING_MODE == 'dropbox_chatgpt_bridge'/);
  assert.match(monitor, /Test monitor invariants/);
});
