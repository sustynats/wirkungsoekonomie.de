import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../../", import.meta.url);
const script = fs.readFileSync(new URL("assets/js/news.js", root), "utf8");

function element(dataset = {}) {
  return {
    dataset, hidden: false, value: "", textContent: "", events: new Map(),
    addEventListener(name, handler) { this.events.set(name, handler); },
    setAttribute() {}, querySelector() { return null; },
    hasAttribute(name) { return name === "data-news-editorial-analysis" && this.dataset.newsEditorialAnalysis !== undefined; },
  };
}

function list() {
  // Alternate card types throughout several pages, not just in the first ten.
  const cards = Array.from({ length: 25 }, (_, index) => element({
    newsEditorialAnalysis: index % 3 === 0 ? "" : undefined,
    newsFormat: index === 0 ? "book_and_impact" : index % 3 === 0 ? "analysis" : undefined,
    topic: index % 2 === 0 ? "energie" : "bildung",
    newsSearch: index % 3 === 0 ? "Speicher Analyse" : "Schule Nachricht",
  }));
  const controls = ["all", "energie", "bildung", "analysis", "book_and_impact"].map(newsFilter => element({ newsFilter }));
  const search = element(), more = element(), moreWrap = element(), empty = element();
  const location = new URL("https://wirkungsoekonomie.de/wirkungsticker/");
  const singles = {
    "[data-news-search-input]": search, "[data-news-load-more]": more,
    "[data-news-load-more-wrap]": moreWrap, "[data-news-filter-empty]": empty,
  };
  vm.runInNewContext(script, {
    URL, Date,
    document: {
      querySelector: selector => singles[selector] || null,
      querySelectorAll: selector => selector === "[data-news-card]" ? cards
        : selector === "[data-news-filter]" ? controls : [],
    },
    window: { location, addEventListener() {}, history: { state: null, replaceState() {} } },
  });
  return {
    cards, moreWrap, empty,
    visible: () => cards.filter(card => !card.hidden),
    next: () => more.events.get("click")(),
    search(value) { search.value = value; search.events.get("input")(); },
    filter(value) { controls.find(control => control.dataset.newsFilter === value).events.get("click")(); },
  };
}

test("all ticker card variants honor hidden despite their own display rules", () => {
  const css = fs.readFileSync(new URL("assets/css/news.css", root), "utf8");
  // The browser's default [hidden] rule loses to an author's display:grid.
  // Use the same shared marker as the pagination script, with greater specificity.
  assert.ok(/\[data-news-card\]\[hidden\]\s*\{\s*display:\s*none\s*;?\s*\}/.test(css),
    "The shared hidden selector must override every card variant's display rule");
  const build = fs.readFileSync(new URL("scripts/news/build.mjs", root), "utf8");
  for (const variant of ["news-card", "news-editorial-card"]) {
    assert.ok(new RegExp(`<article class="${variant}[^>]*\\bdata-news-card\\b`).test(build),
      `${variant} must use the same data-news-card marker as the pagination script`);
  }
});

test("news and analyses share ten-card pagination without extra analysis cards", () => {
  const h = list();
  assert.deepEqual(h.visible(), h.cards.slice(0, 10));
  h.next();
  assert.deepEqual(h.visible(), h.cards.slice(0, 20));
  h.next();
  assert.equal(h.visible().length, 25);
  assert.equal(h.moreWrap.hidden, true);
});

test("search hides nonmatching analyses and an empty search result hides every card", () => {
  const h = list();
  h.search("Speicher");
  assert.equal(h.visible().length, 9);
  assert.ok(h.visible().every(card => card.dataset.newsEditorialAnalysis === ""));
  h.search("kein-treffer-fixture");
  assert.equal(h.visible().length, 0);
  assert.equal(h.empty.hidden, false);
  assert.equal(h.moreWrap.hidden, true);
  h.search("");
  assert.deepEqual(h.visible(), h.cards.slice(0, 10));
});

test("topic changes reset pagination and hide mismatched news and analyses alike", () => {
  const h = list();
  h.next();
  h.filter("energie");
  const energy = h.cards.filter(card => card.dataset.topic === "energie");
  assert.deepEqual(h.visible(), energy.slice(0, 10));
  h.next();
  assert.deepEqual(h.visible(), energy);
  h.filter("all");
  assert.deepEqual(h.visible(), h.cards.slice(0, 10));
});

test("book reviews have their own filter and remain separate from automated analyses", () => {
  const h = list();
  h.filter("book_and_impact");
  assert.deepEqual(h.visible(), [h.cards[0]]);
  h.filter("analysis");
  assert.equal(h.visible().length, 8);
  assert.ok(h.visible().every(card => card.dataset.newsFormat === "analysis"));
  h.filter("all");
  assert.deepEqual(h.visible(), h.cards.slice(0, 10));
});
