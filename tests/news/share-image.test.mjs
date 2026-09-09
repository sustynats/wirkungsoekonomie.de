import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { articleShareCard, articleFromPage, renderShareCard, buildArticleShareImages } from "../../scripts/news/share-image.mjs";
import { storyPage, editorialAnalysisPage } from "../../scripts/news/build.mjs";
import { normalizeShareMetadata } from "../../scripts/lib/share-metadata.mjs";

const ROOT = new URL("../../", import.meta.url);
const stories = JSON.parse(fs.readFileSync(new URL("data/news/stories.json", ROOT))).stories;
const editorials = JSON.parse(fs.readFileSync(new URL("data/news/editorial-analyses.json", ROOT))).analyses;
const story = stories.find(item => item.published && item.analysis && item.listed !== false);
const analysis = editorials.find(item => item.status === "published" && stories.some(s => s.story_id === item.story_id));
const sourceStory = stories.find(s => s.story_id === analysis.story_id);
const article = { "@type": "AnalysisNewsArticle", url: "https://wirkungsoekonomie.de/wirkungsticker/test/", headline: "Neue Netze & Erneuerbare", articleSection: ["Klima", "Energie"] };
const page = data => `<head><meta property="og:image" content="${articleShareCard(data).url}"><script type="application/ld+json">${JSON.stringify(data)}</script></head>`;

test("news and opinions have their own absolute, matching raster card across all social metadata", () => {
  for (const html of [storyPage(story), editorialAnalysisPage(analysis, sourceStory)]) {
    const data = articleFromPage(html), card = articleShareCard(data);
    for (const name of ["og:image", "og:image:secure_url", "twitter:image"]) assert.ok(html.includes(`${name}" content="${card.url}"`), name);
    assert.equal(data.image, card.url);
    assert.match(html, /property="og:type" content="article"/);
    assert.match(html, /property="og:image:type" content="image\/jpeg"/);
    assert.match(html, /property="og:image:width" content="1200"/);
    assert.match(html, /property="og:image:height" content="630"/);
    assert.ok(normalizeShareMetadata(html).includes(card.url), "final brand normalization preserves the specific card");
  }
  const a = articleShareCard(articleFromPage(editorialAnalysisPage(analysis, sourceStory)));
  const s = articleShareCard(articleFromPage(storyPage(sourceStory)));
  assert.notEqual(a.url, s.url);
  assert.equal(a.input.author, "Natalie Weber");
  assert.equal(a.input.headline, analysis.title.replace(/[\u2010-\u2015\u2212]/g, "-").replace(/\s+/g, " ").trim());
});

test("updated titles change the card address, routine metadata does not", () => {
  const before = articleShareCard(article);
  assert.notEqual(before.url, articleShareCard({ ...article, headline: "Korrigierter Titel" }).url);
  assert.notEqual(before.url, articleShareCard({ ...article, url: article.url.replace("test/", "other/") }).url);
  assert.equal(before.url, articleShareCard({ ...article, dateModified: "2026-09-09T16:00Z" }).url);
  assert.equal(articleShareCard({ "@type": "WebSite" }), null);
  assert.throws(() => articleShareCard({ ...article, url: "https://evil.example/test/" }), /CANONICAL_INVALID/);
});

test("share graphics escape titles, reuse brand fonts/icons and do not invent impact assessments", () => {
  const card = articleShareCard({ ...article, headline: '<script>alert("x")</script> & Schule' });
  const rendered = renderShareCard(card);
  assert.match(rendered.svg, /&lt;script&gt;/);
  assert.doesNotMatch(rendered.svg, /<script|<foreignObject|https?:\/\/(?!www\.w3\.org)/);
  assert.match(rendered.svg, /Source Serif 4/);
  assert.match(rendered.svg, /Inter/);
  assert.doesNotMatch(rendered.svg, /Richtung offen|Gemischt|Negatives Risiko|KI-generiertes/);
  assert.equal(rendered.width, 1200);
  assert.equal(rendered.height, 630);
});

test("current article headlines fit the card without truncation", () => {
  for (const item of stories.filter(s => s.published && s.analysis && s.listed !== false)) {
    const data = { ...article, headline: item.title, articleSection: item.topic };
    assert.equal(renderShareCard(articleShareCard(data)).truncated, false, item.title);
  }
  for (const item of editorials.filter(a => a.status === "published")) {
    assert.equal(renderShareCard(articleShareCard({ ...article, headline: item.title })).truncated, false, item.title);
  }
});

test("artifact generation validates rasters, reuses existing cards and repairs a damaged cache", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-share-test-"));
  try {
    fs.mkdirSync(path.join(root, "wirkungsticker/test"), { recursive: true });
    fs.writeFileSync(path.join(root, "wirkungsticker/test/index.html"), page(article));
    // Header-only mock for the injected rasterizer; real browser output is
    // separately checked in the complete artifact and visual verification.
    const png = Buffer.alloc(40);
    png.set([255, 216, 255, 192, 0, 17, 8, 2, 118, 4, 176], 0);
    png.set([255, 217], 38);
    let calls = 0;
    const options = { chrome: null, log: () => {}, renderBatch: async (items, { onImage }) => { calls++; for (const [index] of items.entries()) await onImage(png, index); } };
    assert.deepEqual(await buildArticleShareImages(root, options), { cards: 1, rendered: 1 });
    assert.deepEqual(await buildArticleShareImages(root, options), { cards: 1, rendered: 0 });
    const output = path.join(root, new URL(articleShareCard(article).url).pathname.slice(1));
    fs.writeFileSync(output, "broken");
    assert.deepEqual(await buildArticleShareImages(root, options), { cards: 1, rendered: 1 });
    assert.equal(calls, 2);
    fs.writeFileSync(path.join(root, "wirkungsticker/test/index.html"), page(article).replace('"headline":"Neue', '"headline":"Andere'));
    await assert.rejects(buildArticleShareImages(root, options), /METADATA_MISMATCH/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
