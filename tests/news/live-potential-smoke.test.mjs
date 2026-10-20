import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { completePotential, renderedPotentialErrors, readExpectedManifest, livePotentialCheck } from '../../scripts/news/live-potential-smoke.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ticker-live-smoke-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const relative = 'wirkungsticker/data/app/manifest.json.gz';
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const committed = { revision: 'old-committed', feeds: {}, lookup: {} };
  fs.writeFileSync(file, gzipSync(JSON.stringify(committed)));
  return { root, relative, file, committed, archive: path.join(root, 'artifact.tar') };
}

test('release checks require the deployed artifact and never silently use committed projections', t => {
  const f = fixture(t);
  assert.deepEqual(readExpectedManifest({ root: f.root, sourceCommit: '', artifactTar: '' }), f.committed);
  assert.throws(() => readExpectedManifest({ root: f.root, sourceCommit: 'exact-release', artifactTar: '' }), /DEPLOYED_ARTIFACT_REQUIRED/);
});

test('exact deployment artifact wins over an older committed manifest without changing it', t => {
  const f = fixture(t);
  const deployed = { revision: 'rebuilt-release', feeds: {}, lookup: { '/new-approved-article/': { id: 'new' } } };
  fs.writeFileSync(f.file, gzipSync(JSON.stringify(deployed)));
  execFileSync('tar', ['-cf', f.archive, '-C', f.root, `./${f.relative}`]);
  fs.writeFileSync(f.file, gzipSync(JSON.stringify(f.committed)));
  assert.deepEqual(readExpectedManifest({ root: f.root, sourceCommit: 'exact-release', artifactTar: f.archive }), deployed);
  assert.deepEqual(readExpectedManifest({ root: f.root, sourceCommit: '', artifactTar: '' }), f.committed);
});

test('a missing or duplicated artifact manifest fails closed', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.root, 'other.txt'), 'not a manifest');
  execFileSync('tar', ['-cf', f.archive, '-C', f.root, 'other.txt']);
  const read = () => readExpectedManifest({ sourceCommit: 'exact-release', artifactTar: f.archive });
  assert.throws(read, /DEPLOYED_APP_MANIFEST_AMBIGUOUS_OR_MISSING/);
  execFileSync('tar', ['-cf', f.archive, '-C', f.root, f.relative, `./${f.relative}`]);
  assert.throws(read, /DEPLOYED_APP_MANIFEST_AMBIGUOUS_OR_MISSING/);
});

test('a malformed artifact manifest cannot fall back to an otherwise valid committed one', t => {
  const f = fixture(t);
  fs.writeFileSync(f.file, gzipSync(JSON.stringify({ revision: 'incomplete' })));
  execFileSync('tar', ['-cf', f.archive, '-C', f.root, f.relative]);
  fs.writeFileSync(f.file, gzipSync(JSON.stringify(f.committed)));
  assert.throws(() => readExpectedManifest({ root: f.root, sourceCommit: 'exact-release', artifactTar: f.archive }), /DEPLOYED_APP_MANIFEST_INVALID/);
});

test('workflow downloads the exact triggering deployment artifact before checking live content', () => {
  const workflow = fs.readFileSync(new URL('../../.github/workflows/ticker-live-potential-smoke.yml', import.meta.url), 'utf8');
  assert.match(workflow, /actions: read/);
  assert.match(workflow, /ref: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(workflow, /name: github-pages\s+run-id: \$\{\{ github\.event\.workflow_run\.id \}\}/);
  assert.match(workflow, /WOEK_LIVE_EXPECTED_ARTIFACT_TAR: \$\{\{ runner\.temp \}\}\/ticker-deployed-pages\/artifact\.tar/);
  assert.ok(workflow.indexOf('actions/download-artifact@v4') < workflow.indexOf('run: node scripts/news/live-potential-smoke.mjs'));
});

const record = () => ({
  story_id: 'story-1',
  slug: 'story-1',
  published: true,
  listed: true,
  impact_semantic_review: { status: 'ready', review_job_id: 'review-1' },
  impact_assessment: {
    version: '2.1',
    publication_status: 'ready',
    dimensions: Object.fromEntries(['human','planet','democracy'].map(key => [key, {
      path_status: 'modelled', magnitude: 2, primary_paths: [{label:`${key} path`}],
    }])),
  },
});

function surfaces({ liveRevision = 'deployed', feedRevision = liveRevision, html = '<i data-magnitude="1"></i>'.repeat(3) } = {}) {
  const expectedManifest = { revision: 'deployed', feeds: { 'news-alle': { pages: 1 } }, lookup: { '/wirkungsticker/story-1/': { id: 'item-1' } } };
  return {
    store: { stories: [record()] }, expectedManifest,
    fetchText: async () => html,
    fetchJson: async url => {
      const pathname = new URL(url).pathname;
      if (pathname.endsWith('/manifest.json.gz')) return { ...expectedManifest, revision: liveRevision };
      if (pathname.endsWith('/news-alle-0.json.gz')) return { revision: feedRevision, items: [{ url: '/wirkungsticker/story-1/', html }] };
      if (pathname.endsWith('/item-1.json.gz')) return { html };
      throw new Error(`UNEXPECTED_FETCH:${pathname}`);
    },
  };
}

test('the artifact-bound check still verifies article, news feed and bookmark potential surfaces', async () => {
  assert.deepEqual(await livePotentialCheck(surfaces()), {
    ok: true, stage: 'complete', errors: [], reviewed_profiles: 1, visible_cards: 1, manifest_revision: 'deployed',
  });
});

test('a different live revision or mixed-revision feed still fails', async () => {
  assert.deepEqual(await livePotentialCheck(surfaces({ liveRevision: 'different' })), {
    ok: false, stage: 'propagation', errors: ['MANIFEST_REVISION:different!=deployed'],
  });
  assert.deepEqual(await livePotentialCheck(surfaces({ feedRevision: 'old' })), {
    ok: false, stage: 'feed', errors: ['FEED_REVISION_MISMATCH:0'],
  });
});

test('historical null profiles cannot pass on any of the three live surfaces', async () => {
  const result = await livePotentialCheck(surfaces({ html: '<i data-path-status="insufficient_basis" data-magnitude="open"></i>' }));
  assert.equal(result.ok, false);
  for (const surface of ['article', 'news-feed', 'bookmark-item']) {
    assert.ok(result.errors.includes(`story-1:${surface}:NUMERIC_POTENTIAL_BARS_MISSING`));
    assert.ok(result.errors.includes(`story-1:${surface}:HISTORICAL_NULL_PROFILE_RENDERED`));
    assert.ok(result.errors.includes(`story-1:${surface}:OPEN_MAGNITUDE_RENDERED`));
  }
});

test('completePotential requires modelled numeric MPD paths', () => {
  const good = record();
  assert.equal(completePotential(good), true);
  const blank = record();
  Object.assign(blank.impact_assessment.dimensions.planet, {path_status:'insufficient_basis',magnitude:null,primary_paths:[]});
  assert.equal(completePotential(blank), false);
});

test('renderedPotentialErrors rejects dashed/open historical profiles and accepts three numeric bars', () => {
  const good = '<span data-magnitude="2"></span><span data-magnitude="3"></span><span data-magnitude="1"></span>';
  assert.deepEqual(renderedPotentialErrors(good), []);
  const blank = '<div data-path-status="insufficient_basis"><span data-magnitude="open"></span></div>';
  const errors = renderedPotentialErrors(blank, 'card');
  assert.ok(errors.includes('card:NUMERIC_POTENTIAL_BARS_MISSING'));
  assert.ok(errors.includes('card:HISTORICAL_NULL_PROFILE_RENDERED'));
  assert.ok(errors.includes('card:OPEN_MAGNITUDE_RENDERED'));
});
