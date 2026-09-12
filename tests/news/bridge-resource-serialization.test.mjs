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
