import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { feedDate, mixedFeedItems, assertChronologicalFeedHtml } from "../../scripts/news/feed-order.mjs";

test("recent analyses and news share chronological order across page boundaries without rewriting dates", () => {
  const stories = Array.from({ length: 50 }, (_, i) => ({ story_id: `news-${i}`, last_updated: new Date(Date.UTC(2026, 8, 11, 12, i)).toISOString() }));
  const analyses = [{ analysis_id: "recent", updated_at: "2026-09-11T13:00:00Z" }, { analysis_id: "between", updated_at: "2026-09-11T12:29:30Z" }, { analysis_id: "old", updated_at: "2026-09-10T12:00:00Z" }];
  const before = JSON.stringify({ stories, analyses });
  const ordered = mixedFeedItems(stories, analyses);
  assert.equal(ordered[0].value.analysis_id, "recent");
  assert.equal(ordered[21].value.analysis_id, "between");
  assert.equal(ordered.at(-1).value.analysis_id, "old");
  assert.equal(ordered.length, 53);
  assert.equal(ordered[1].value.story_id, "news-49");
  assert.equal(JSON.stringify({ stories, analyses }), before);
});

test("equal and missing timestamps use stable content identities, not source-array order", () => {
  const stories = [{ story_id: "b", last_updated: "bad" }, { story_id: "a" }];
  const analyses = [{ analysis_id: "b", story_id: "same", published_at: "2026-09-11T10:00:00Z" }, { analysis_id: "a", story_id: "same", updated_at: "2026-09-11T12:00:00+02:00" }];
  assert.deepEqual(mixedFeedItems(stories, analyses), mixedFeedItems([...stories].reverse(), [...analyses].reverse()));
  assert.equal(mixedFeedItems(stories, analyses)[0].value.analysis_id, "a");
  assert.equal(mixedFeedItems(stories, [])[0].value.story_id, "a");
});

test("only public editorial publication/update dates define freshness, not ingestion or build time", () => {
  assert.equal(feedDate({ updated_at: "invalid", published_at: "2026-09-11T08:00:00Z" }, "analysis"), "2026-09-11T08:00:00.000Z");
  assert.equal(feedDate({ last_updated: "2026-09-10T08:00:00Z", updated_at: "2026-09-12T18:00:00Z", first_seen: "2026-09-12T18:00:00Z" }), "2026-09-10T08:00:00.000Z");
  assert.equal(feedDate({ updated_at: "2026-09-10T08:00:00Z", published_at: "2026-09-11T08:00:00Z" }, "analysis"), "2026-09-11T08:00:00.000Z");
  assert.equal(feedDate({ first_seen: "2026-09-11T08:00:00Z" }), "");
});

test("the public HTML gate rejects interspersed newer cards including across pagination boundaries", () => {
  const card = date => `<article class="news-card" data-news-card data-news-updated-at="${date}"></article>`;
  assert.doesNotThrow(() => assertChronologicalFeedHtml(card("2026-09-11") + card("2026-09-10") + card("")));
  assert.throws(() => assertChronologicalFeedHtml(card("2026-09-10").repeat(20) + card("2026-09-11")), /NEWS_FEED_NOT_CHRONOLOGICAL/);
  assert.throws(() => assertChronologicalFeedHtml(card("") + card("2026-09-11")), /NEWS_FEED_NOT_CHRONOLOGICAL/);
});

test("the generated news route is chronological and paginates real news", () => {
  const html = fs.readFileSync(new URL("../../wirkungsticker/news/index.html", import.meta.url), "utf8");
  assert.match(html, /data-ticker-app="news"/);
  assert.match(html, /data-app-grid/);
  assertChronologicalFeedHtml(html);
});
