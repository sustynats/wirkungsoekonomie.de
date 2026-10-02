import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const origin = 'https://wirkungsoekonomie.de';
const workerSource = fs.readFileSync(new URL('../../sw.js', import.meta.url), 'utf8');
const journalSource = fs.readFileSync(new URL('../../assets/js/blog-journal.js', import.meta.url), 'utf8');
const posts = JSON.parse(fs.readFileSync(new URL('../../assets/data/blog-index.json', import.meta.url)));
const latest = posts[0];
const previous = posts.find(post => post.date < latest.date);

function worker({ offline = false, saved = true, quota = false } = {}) {
  const handlers = new Map(), requests = [], writes = [];
  const cache = {
    match: async () => saved ? Response.json([previous]) : undefined,
    put: async (_request, response) => { if (quota) throw Error('quota'); writes.push(await response.json()); },
  };
  vm.runInNewContext(workerSource, {
    URL, Response,
    self: { location: { origin }, addEventListener: (type, handler) => handlers.set(type, handler) },
    caches: { open: async () => cache },
    fetch: async (request, options) => {
      requests.push({ request, options });
      if (offline) throw Error('offline');
      return Response.json([latest]);
    },
  });
  return { requests, writes, async load(pathname) {
    let response;
    handlers.get('fetch')({ request: new Request(origin + pathname), respondWith: promise => { response = promise; } });
    return response;
  } };
}

for (const pathname of ['/assets/data/blog-index.json', '/assets/data/blog-index.json?v=old-script', '/assets/data/document-library.json', '/assets/data/podcast-index.json', '/public/data/site-updates.json']) {
  test(`online ${pathname} uses current data on the first visit, despite a saved older edition`, async () => {
    const h = worker();
    assert.equal((await (await h.load(pathname)).json())[0].url, latest.url);
    assert.equal(h.requests[0].options.cache, 'no-cache');
    assert.equal(h.writes[0][0].url, latest.url);
  });
}

test('offline index stays available as JSON; without a saved copy it fails without an HTML replacement', async () => {
  for (const saved of [true, false]) {
    const h = worker({ offline: true, saved });
    const response = await h.load('/assets/data/blog-index.json');
    assert.equal(response.status, saved ? 200 : 504);
    if (saved) assert.equal((await response.json())[0].url, previous.url);
    else assert.equal(await response.text(), '');
  }
});

test('cache quota errors cannot downgrade a successful live index', async () => {
  const h = worker({ quota: true });
  assert.equal((await (await h.load('/assets/data/blog-index.json')).json())[0].url, latest.url);
});

test('private API requests remain outside the root worker cache', async () => {
  const h = worker();
  assert.equal(await h.load('/api/private'), undefined);
  assert.equal(h.requests.length, 0);
});

async function render(index, { fail = false, publishedAt = latest.publishedAt || latest.date } = {}) {
  const home = { innerHTML: 'CURRENT STATIC FEATURE', dataset: { journalPublishedAt: publishedAt }, querySelector: () => ({}) };
  const archive = { innerHTML: 'STATIC ARCHIVE', insertAdjacentHTML: () => {} };
  const requests = [];
  vm.runInNewContext(journalSource, {
    URL, Intl, Date, Set,
    window: { location: { pathname: '/blog.html' } },
    document: {
      currentScript: { src: origin + '/assets/js/blog-journal.js?v=test' },
      querySelector: selector => ({ '[data-journal-home]': home, '[data-journal-list]': archive }[selector] || null),
      dispatchEvent: () => {},
    },
    CustomEvent: class {},
    fetch: async (_url, options) => { requests.push(options); if (fail) throw Error('offline'); return { ok: true, json: async () => index }; },
  });
  await new Promise(resolve => setImmediate(resolve));
  return { home, archive, requests };
}

test('an old worker/index cannot replace the newer static feature or archive', async () => {
  for (const index of [[previous], []]) {
    const h = await render(index);
    assert.equal(h.home.innerHTML, 'CURRENT STATIC FEATURE');
    assert.equal(h.archive.innerHTML, 'STATIC ARCHIVE');
  }
});

test('failed JSON fetch preserves the server-rendered current article', async () => {
  const h = await render([], { fail: true });
  assert.equal(h.home.innerHTML, 'CURRENT STATIC FEATURE');
});

test('fresh data updates both feature and archive in publication order, including same-day posts', async () => {
  const earlier = { ...latest, title: 'Earlier same-day post', publishedAt: latest.date + 'T00:00:00+02:00', url: '/blog/earlier.html' };
  const sameDayLatest = { ...latest, publishedAt: latest.date + 'T18:00:00+02:00' };
  const h = await render([previous, earlier, sameDayLatest], { publishedAt: sameDayLatest.publishedAt });
  assert.ok(h.home.innerHTML.indexOf(latest.url) < h.home.innerHTML.indexOf(earlier.url));
  assert.ok(h.archive.innerHTML.indexOf(latest.url) < h.archive.innerHTML.indexOf(earlier.url));
  assert.equal(h.home.dataset.journalPublishedAt, sameDayLatest.publishedAt);
  assert.equal(h.requests[0].cache, 'no-cache');
});

test('an older static overview is upgraded when the current index arrives', async () => {
  const h = await render([latest, previous], { publishedAt: previous.publishedAt || previous.date });
  assert.ok(h.home.innerHTML.includes(latest.url));
  assert.ok(h.archive.innerHTML.includes(latest.url));
});

test('the deploy artifact changes the journal script URL when its runtime changes', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'journal-cache-version-'));
  try {
    const site = path.join(fixture, '_site');
    fs.mkdirSync(path.join(site, 'assets/js'), { recursive: true });
    fs.mkdirSync(path.join(site, 'assets/css'), { recursive: true });
    fs.writeFileSync(path.join(site, 'assets/css/style.css'), 'body{}');
    fs.writeFileSync(path.join(site, 'assets/js/blog-journal.js'), journalSource);
    const html = '<script src="assets/js/blog-journal.js?v=old-script"></script>';
    fs.writeFileSync(path.join(site, 'blog.html'), html);
    const script = new URL('../../scripts/site/cachebust-css.mjs', import.meta.url);
    execFileSync(process.execPath, [fileURLToPath(script)], { cwd: fixture });
    const first = fs.readFileSync(path.join(site, 'blog.html'), 'utf8');
    assert.match(first, /blog-journal\.js\?v=[a-f0-9]{12}/);
    fs.appendFileSync(path.join(site, 'assets/js/blog-journal.js'), '\n// next runtime revision');
    execFileSync(process.execPath, [fileURLToPath(script)], { cwd: fixture });
    assert.notEqual(fs.readFileSync(path.join(site, 'blog.html'), 'utf8'), first);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
