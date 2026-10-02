import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDiscoveryMetadata } from '../../scripts/news/active-discovery.mjs';
const url = 'https://example.org/news';
const source = {source_id:'test', name:'Test', primary_source:false};
const title = '<meta property="og:title" content="Synthetische Nachricht">';
const article = (inner, identity=url) => `<article itemscope itemtype="https://schema.org/NewsArticle"><meta itemprop="mainEntityOfPage" content="${identity}">${inner}</article>`;
const published = '<meta itemprop="datePublished" content="2026-10-02T11:17:23+02:00">';
test('page-bound article microdata preserves original publication, not modification or nested media dates', () => {
  const html = title + article(`<span itemscope itemtype="https://schema.org/VideoObject"><meta itemprop="datePublished" content="2020-01-01"></span>${published}<meta itemprop="dateModified" content="2026-10-03">`);
  assert.equal(extractDiscoveryMetadata(html,url,source).published_at, '2026-10-02T09:17:23.000Z');
});
test('unbound, conflicting, unrelated and modified-only microdata remain a hold', () => {
  for (const html of [article(published,'https://example.org/other'), article(published+published), article(published)+article(published), article('<meta itemprop="dateModified" content="2026-10-02">'), `<article itemscope itemtype="https://schema.org/Article">${published}</article>`, article(`<span itemscope itemtype="https://schema.org/VideoObject">${published}</span>`), `<!-- ${article(published)} -->`]) {
    assert.equal(extractDiscoveryMetadata(title+html,url,source), null);
  }
});
test('explicit head pub_date is accepted only with matching canonical identity', () => {
  const head = (canonical, date='<meta name="pub_date" content="2026-10-02T13:00:00.425+02:00">') => `<head>${title}<link rel="canonical" href="${canonical}">${date}</head>`;
  assert.equal(extractDiscoveryMetadata(head(url),url,source).published_at,'2026-10-02T11:00:00.425Z');
  assert.equal(extractDiscoveryMetadata(head('https://example.org/other'),url,source),null);
  assert.equal(extractDiscoveryMetadata(head(url,'<meta name="date" content="2026-10-02">'),url,source),null);
  assert.equal(extractDiscoveryMetadata(title+'<meta name="pub_date" content="2026-10-02">',url,source),null);
});
