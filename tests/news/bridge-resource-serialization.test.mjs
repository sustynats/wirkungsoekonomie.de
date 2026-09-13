import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflows = ['wirkungsticker', 'wirkungsticker-discovery', 'ops-discord-monitor']
  .map(name => ({ name, text: fs.readFileSync(new URL(`../../.github/workflows/${name}.yml`, import.meta.url), 'utf8') }));

test('Oracle queue readers share one job-level resource guard without cancelling another lane', () => {
  const workflowGroups = new Set();
  for (const { name, text } of workflows) {
    const outer = text.match(/^concurrency:\n((?:  [^\n]*\n)+)/m)?.[1];
    assert.ok(outer, `${name}: keep trigger coalescing independent`);
    workflowGroups.add(outer.match(/group: (.+)/)?.[1]);
    const inner = text.match(/^    concurrency:\n((?:      [^\n]*\n)+)/m)?.[1];
    assert.ok(inner, `${name}: missing shared resource guard`);
    assert.match(inner, /group: .*wirkungsticker-oracle-bridge-access/);
    assert.match(inner, /queue: max\n/, `${name}: another lane must not replace a waiting job`);
    assert.match(inner, /cancel-in-progress: false\n/, `${name}: preserve in-flight writes`);
  }
  assert.equal(workflowGroups.size, workflows.length, 'separate lane trigger coalescing bounds duplicate clock runs');
});

test('the resource guard preserves independent discovery and publication lanes', () => {
  assert.match(workflows[0].text, /WOEK_NEWS_BRIDGE_PHASE: import/);
  assert.match(workflows[1].text, /WOEK_NEWS_BRIDGE_PHASE: discovery/);
  assert.match(workflows[0].text, /WOEK_NEWS_BRIDGE_PUBLISH: \$\{\{ vars\.WOEK_NEWS_BRIDGE_PUBLISH \|\| 'false' \}\}/);
  assert.doesNotMatch(workflows[1].text, /WOEK_NEWS_BRIDGE_PUBLISH:/);
  assert.match(workflows[2].text, /Test monitor invariants/);
});

test('ignored clock triggers cannot evict an eligible pending import', () => {
  const text = workflows[0].text;
  const group = text.match(/^  group: >-\n([\s\S]+?)\n  cancel-in-progress:/m)?.[1].trim().replace(/^\$\{\{\s*|\s*\}\}$/g, '');
  const condition = text.match(/^    if: >-\n([\s\S]+?)\n    runs-on:/m)?.[1].trim();
  assert.ok(group && condition, 'exercise the deployed workflow expressions');
  const evaluate = (expression, mode, event) => Function('vars', 'github', `return (${expression});`)(
    { WIRKUNGSTICKER_PROCESSING_MODE: mode }, event);
  const events = [
    { name: 'manual', event_name: 'workflow_dispatch', event: {}, ref: 'refs/heads/main', bridge: true, api: true },
    { name: 'import clock', event_name: 'push', event: {}, ref: 'refs/heads/codex/wirkungsticker-import-clock', bridge: true, api: false },
    { name: 'discovery clock', event_name: 'push', event: {}, ref: 'refs/heads/codex/wirkungsticker-clock', bridge: false, api: true },
    { name: 'five minute schedule', event_name: 'schedule', event: { schedule: '*/5 * * * *' }, ref: 'refs/heads/main', bridge: true, api: false },
    { name: 'API schedule', event_name: 'schedule', event: { schedule: '7,22,37,52 * * * *' }, ref: 'refs/heads/main', bridge: false, api: true },
  ];
  for (const mode of ['dropbox_chatgpt_bridge', 'api', '']) {
    for (const event of events) {
      const eligible = mode === 'dropbox_chatgpt_bridge' ? event.bridge : event.api;
      const label = `${mode || 'default'} / ${event.name}`;
      assert.equal(evaluate(condition, mode, event), eligible, `${label}: preserve lane eligibility`);
      assert.equal(evaluate(group, mode, event), eligible ? 'wirkungsticker-main' : 'wirkungsticker-inactive-trigger', label);
    }
  }
  // Reproduce the incident: an import waits while discovery has the Oracle slot,
  // then an ignored clock fires. GitHub can coalesce only within the same group.
  const pending = evaluate(group, 'dropbox_chatgpt_bridge', events[1]);
  assert.notEqual(evaluate(group, 'dropbox_chatgpt_bridge', events[2]), pending);
  assert.equal(evaluate(group, 'dropbox_chatgpt_bridge', events[3]), pending);
});
