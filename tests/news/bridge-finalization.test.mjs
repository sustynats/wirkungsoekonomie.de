import test from 'node:test';
import assert from 'node:assert/strict';
import { finalizeCommittedBridge } from '../../scripts/news/bridge/finalization.mjs';

const content = { stories: [{ story_id: 'persisted-news' }], editorials: [{ analysis_id: 'approved-version' }], now: '2026-09-12T02:14:00Z', committed: true };
function setup(errors = {}) {
  const completed = [], logs = [];
  const bridge = {
    async finalize(stories, now, options) {
      assert.equal(stories, content.stories);
      assert.equal(now, content.now);
      assert.deepEqual(options, { committed: true, editorials: content.editorials });
      completed.push('news_attempted');
      if (errors.news) throw errors.news;
      completed.push('news_receipt');
    },
    store: { async editorialFinalize() {
      completed.push('editorial_attempted');
      if (errors.editorial) throw errors.editorial;
      completed.push('editorial_receipt');
      return { finalized: 1 };
    } },
    async monitor() {
      completed.push('monitor_attempted');
      if (errors.monitor) throw errors.monitor;
      return { processor_available: true };
    },
  };
  return { bridge, completed, logs, run: () => finalizeCommittedBridge(bridge, content, line => logs.push(JSON.parse(line))) };
}

test('late queue-read failure cannot prevent the approved private receipt', async () => {
  const failure = Object.assign(Error('BRIDGE_REMOTE_INVALID_RESPONSE'), { retryable: true });
  const f = setup({ monitor: failure });
  await assert.rejects(f.run, error => error === failure);
  assert.ok(f.completed.includes('news_receipt'));
  assert.ok(f.completed.includes('editorial_receipt'));
  assert.deepEqual(f.logs, [{ event: 'bridge_finalization_failed', stage: 'monitor', error_code: failure.message }]);
});

test('news receipt failure does not starve independent editorial receipts and remains a failed run', async () => {
  const failure = Error('BRIDGE_REMOTE_TIMEOUT');
  const f = setup({ news: failure });
  await assert.rejects(f.run, error => error === failure);
  assert.ok(f.completed.includes('editorial_receipt'));
  assert.ok(f.completed.includes('monitor_attempted'));
});

test('private service outage preserves public receipts and is not silently successful', async () => {
  const failure = Error('EDITORIAL_SERVICE_UNAVAILABLE');
  const f = setup({ editorial: failure });
  await assert.rejects(f.run, error => error === failure);
  assert.ok(f.completed.includes('news_receipt'));
  assert.ok(f.completed.includes('monitor_attempted'));
});

test('all independent errors remain available for diagnosis', async () => {
  const news = Error('BRIDGE_REMOTE_TIMEOUT'), monitor = Error('BRIDGE_REMOTE_INVALID_RESPONSE');
  const f = setup({ news, monitor });
  await assert.rejects(f.run, error => error instanceof AggregateError && error.errors[0] === news && error.errors[1] === monitor);
  assert.ok(f.completed.includes('editorial_receipt'));
});

test('no post-commit work is attempted before durable publication', async () => {
  const f = setup();
  await assert.rejects(() => finalizeCommittedBridge(f.bridge, { ...content, committed: false }), /BRIDGE_COMMITTED_CONTENT_REQUIRED/);
  assert.deepEqual(f.completed, []);
});

test('successful receipts and health finish without adding any publication or approval calls', async () => {
  const f = setup();
  await f.run();
  assert.deepEqual(f.completed, ['news_attempted', 'news_receipt', 'editorial_attempted', 'editorial_receipt', 'monitor_attempted']);
  assert.deepEqual(f.logs, [{ processor_available: true }]);
});
