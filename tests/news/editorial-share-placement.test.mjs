import test from 'node:test';
import assert from 'node:assert/strict';
import {editorialAnalysisPage} from '../../scripts/news/build.mjs';
import {loadPersonalEditorials} from '../../scripts/news/personal-editorial.mjs';
import {loadManualEditorials} from '../../scripts/news/manual-editorial.mjs';

function assertReaderShares(article) {
  const before = JSON.stringify(article);
  const html = editorialAnalysisPage(article);
  const hero = html.match(/<header class="hero news-editorial-hero">[\s\S]*?<\/header>/)?.[0];
  assert.ok(hero, article.slug);
  assert.match(hero, /data-news-share-button/, `${article.slug}: share immediately at the article header`);
  assert.match(hero, /data-wirkungsraum-save-url=/, `${article.slug}: bookmark remains available`);
  const shares = [...html.matchAll(/<button[^>]*data-news-share-button[^>]*>/g)].map(match => match[0]);
  assert.equal(shares.length, 2, `${article.slug}: share at top and bottom`);
  for (const share of shares) assert.ok(share.includes(`data-share-url="https://wirkungsoekonomie.de/wirkungsticker/analyse/${article.slug}/"`));
  const feedbackIds = [...html.matchAll(/id="(news-share-status-[^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(feedbackIds).size, 2, `${article.slug}: independent accessible feedback`);
  assert.ok(feedbackIds.some(id => id.endsWith('-top')));
  assert.ok(feedbackIds.some(id => id.endsWith('-bottom')));
  assert.match(html, /<script src="[^\"]*assets\/js\/news-share.js/);
  assert.equal(JSON.stringify(article), before, 'approved content and its hash remain unchanged');
}

test('every published personal opinion, podcast and TV review has share above the article', () => {
  const articles = loadPersonalEditorials(process.cwd());
  for (const type of ['opinion_analysis', 'listened', 'watched']) assert.ok(articles.some(article => article.subtype === type));
  for (const article of articles) assertReaderShares(article);
});

test('existing book reviews retain both reader share controls', () => {
  for (const article of loadManualEditorials(process.cwd())) assertReaderShares(article);
});
