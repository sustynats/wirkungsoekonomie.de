import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildNewsAfterRun } from '../../scripts/news/run.mjs';

test('standalone news runs still build; only an explicit deferred build skips the first pass', () => {
  let builds = 0;
  const build = () => { builds += 1; };
  buildNewsAfterRun({}, build);
  buildNewsAfterRun({ deferSiteBuild: false }, build);
  buildNewsAfterRun({ deferSiteBuild: 'true' }, build);
  assert.equal(builds, 3);
  buildNewsAfterRun({ deferSiteBuild: true }, build);
  assert.equal(builds, 3);
});

test('the serial worker builds once after editorial imports and Lage, before all validation and atomic publication', () => {
  const yaml = fs.readFileSync(new URL('../../.github/workflows/wirkungsticker.yml', import.meta.url), 'utf8');
  const entry = fs.readFileSync(new URL('../../scripts/news/run-api.mjs', import.meta.url), 'utf8');
  assert.match(entry, /deferSiteBuild: process\.argv\.includes\("--defer-site-build"\)/);
  assert.match(yaml, /else node scripts\/news\/run-api\.mjs --defer-site-build; fi/);
  assert.equal((yaml.match(/npm run news:build/g) || []).length, 1);
  const build = yaml.indexOf('- name: Build public ticker after editorial imports and Lage');
  const validate = yaml.indexOf('- name: Build search index, taxonomy and validate output');
  const commit = yaml.indexOf('- name: Commit one atomic update');
  assert.ok(build > yaml.indexOf('- name: Take over editions approved'));
  assert.ok(build > yaml.indexOf('- name: Redaktionelle Lage schreiben'));
  assert.ok(validate > build && commit > validate);
  const buildBlock = yaml.slice(build, yaml.indexOf('\n      - name:', build + 1));
  assert.match(buildBlock, /npm run news:build/);
  assert.doesNotMatch(buildBlock, /continue-on-error/);
  for (const command of ['build:search', 'taxonomy:build', 'news:source-integrity:audit -- --strict',
    'news:source-portfolio:audit -- --strict', 'news:validate']) {
    assert.ok(yaml.slice(validate, commit).includes('npm run ' + command), command);
  }
  assert.match(yaml, /timeout-minutes: 40/);
  assert.match(yaml, /cancel-in-progress: false/);
});
