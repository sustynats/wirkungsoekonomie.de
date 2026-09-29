import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {RSS_CHANNELS, RSS_SITE, renderRssFeed, rssDiscoveryLinks} from "../../scripts/news/rss-channels.mjs";
import {tickerRssFeeds, combinedFeedItems, indexPage} from "../../scripts/news/build.mjs";
import {buildAppPages} from "../../scripts/news/app-pages.mjs";

const date = "2026-09-29T06:00:00.000Z";
const story = {story_id:"news-1", slug:"news-1", published:true, title:"Eine Nachricht", published_at:date, analysis:{summary:"News-Kurzfassung"}};
const analysis = (id, format, subtype) => ({
  analysis_id:id, slug:id, format, subtype, status:"published", title:id, teaser:"Persönliche Einordnung",
  published_at:date, updated_at:date, manual_only:true, final_approval_required:true,
});
const analyses = [
  analysis("meinung", "approved_editorial", "opinion"),
  analysis("nachgehoert", "approved_editorial", "listened"),
  analysis("nachgesehen", "approved_editorial", "watched"),
  analysis("buch", "book_and_impact", "book_review"),
  analysis("bisherige-analyse", "editorial_analysis", ""),
];
const guids = xml => [...xml.matchAll(/<guid[^>]*>(.*?)<\/guid>/g)].map(match=>match[1]);

test("two RSS channels separate public news from every editorial format without changing content", () => {
  const input = JSON.stringify({story, analyses});
  const feeds = tickerRssFeeds([story], analyses);
  assert.deepEqual(guids(feeds.news), [RSS_SITE + "/wirkungsticker/news-1/"]);
  assert.equal(guids(feeds.analyses).length, analyses.length);
  assert.equal(new Set([...guids(feeds.news), ...guids(feeds.analyses)]).size, analyses.length + 1);
  for (const entry of analyses) assert.ok(guids(feeds.analyses).includes(RSS_SITE + "/wirkungsticker/analyse/" + entry.slug + "/"));
  assert.match(feeds.analyses, /Nachgehört: nachgehoert/);
  assert.match(feeds.analyses, /Nachgesehen: nachgesehen/);
  assert.match(feeds.analyses, /Buch &amp; Wirkung: buch/);
  assert.equal(JSON.stringify({story, analyses}), input);
  assert.equal(combinedFeedItems([story], analyses).length, analyses.length + 1, "JSON/Atom consumers retain combined items");
});

test("draft, approved-but-unpublished and withdrawn records never enter RSS", () => {
  const states = ["draft", "redaktioneller_entwurf", "approved", "rejected", "retired", undefined];
  const feeds = tickerRssFeeds(
    [story, ...[false,undefined].map((published,i)=>({...story,published,slug:"private-news-"+i})), {...story,listed:false,slug:"private-retired"}],
    [...analyses, ...states.map((status,i)=>({...analyses[0],status,slug:"private-analysis-"+i}))]
  );
  assert.doesNotMatch(feeds.news + feeds.analyses, /private-/);
  assert.equal(guids(feeds.news).length, 1);
  assert.equal(guids(feeds.analyses).length, analyses.length);
});

test("RSS identities and channel dates are stable across unrelated news updates", () => {
  const before = tickerRssFeeds([story], analyses);
  const after = tickerRssFeeds([{...story,published_at:"2026-09-30T19:00:00Z"}], analyses);
  assert.equal(before.analyses, after.analyses);
  assert.deepEqual(guids(before.news), guids(after.news));
  assert.match(before.analyses, /<lastBuildDate>Tue, 29 Sep 2026 06:00:00 GMT<\/lastBuildDate>/);
});

test("RSS XML escapes text and URLs and handles an empty channel or missing dates", () => {
  for (const channel of Object.values(RSS_CHANNELS)) {
    const empty = renderRssFeed([], channel);
    assert.match(empty, /Thu, 01 Jan 1970 00:00:00 GMT/);
    assert.ok(empty.includes('href="' + RSS_SITE + channel.path + '" rel="self"'));
    const xml = renderRssFeed([{title:'A & <B> "C"',summary:"x & y",url:"https://example.org/?a=1&b=2"}],channel);
    assert.match(xml, /A &amp; &lt;B&gt; &quot;C&quot;/);
    assert.match(xml, /a=1&amp;b=2/);
    assert.doesNotMatch(xml, /Invalid Date|<pubDate>/);
  }
});

test("RSS uses existing chronological selection and preserves correction GUIDs", () => {
  const older = {...analyses[0], slug:"older", published_at:"2026-09-28T06:00:00Z", updated_at:"2026-09-30T06:00:00Z"};
  const xml = tickerRssFeeds([], [older, analyses[1]]).analyses;
  assert.deepEqual(guids(xml), [RSS_SITE+"/wirkungsticker/analyse/nachgehoert/", RSS_SITE+"/wirkungsticker/analyse/older/"]);
  assert.match(xml, /<lastBuildDate>Wed, 30 Sep 2026 06:00:00 GMT/);
});

test("both RSS subscriptions are autodiscoverable and visibly linked in existing app routes", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-rss-test-"));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const pages = new Map();
  buildAppPages({
    root, stories:[], analyses:[], storiesById:new Map(), storyCard:()=>"",editorialCard:()=>"",
    pageShell:({body})=>body,write:(file,body)=>pages.set(path.relative(root,file),body),updatedAt:date,
  });
  for (const [mode,channel] of [["news",RSS_CHANNELS.news],["analysen",RSS_CHANNELS.analyses]]) {
    const html = pages.get("wirkungsticker/"+mode+"/index.html");
    assert.ok(html.includes('href="'+channel.path+'">'+channel.label+"</a>"));
    assert.ok(pages.get("wirkungsticker/mehr/index.html").includes(channel.path));
  }
  const shell = indexPage([], date);
  assert.equal((rssDiscoveryLinks().match(/application\/rss\+xml/g)||[]).length, 2);
  for (const channel of Object.values(RSS_CHANNELS)) assert.ok(shell.includes('href="'+RSS_SITE+channel.path+'"'));
});
