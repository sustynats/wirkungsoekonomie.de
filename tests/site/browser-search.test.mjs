import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { buildBrowserSearchIndex, readBuiltSearchEntries } from "../../scripts/search/build-browser-search-index.mjs";
import { loadBrowserSearchIndex, loadSearchSuggestions } from "../../assets/js/search-index-loader.js";

function buildFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-search-test-"));
  const directory = path.join(root, "assets/search");
  fs.mkdirSync(directory, { recursive: true });
  fs.mkdirSync(path.join(root, "assets/data"), { recursive: true });
  fs.mkdirSync(path.join(root, "assets/js"), { recursive: true });
  fs.mkdirSync(path.join(root, "bibliothek/eintrag"), { recursive: true });
  fs.writeFileSync(path.join(root, "bibliothek/eintrag/index.html"), "<title>Fehlender Eintrag</title><main>Inhalt der ergänzten Route.</main>");
  const routes = [
    { url: "/werkzeuge/t-sroi/", file: "werkzeuge/t-sroi/index.html", area: "werkzeuge", title: "T-SROI" },
    { url: "/bibliothek/eintrag/", file: "bibliothek/eintrag/index.html", area: "bibliothek", title: "Fehlender Eintrag" },
    { url: "/wirkungsticker/meldung/", file: "wirkungsticker/meldung/index.html", area: "wirkungsticker", title: "Meldung" },
  ];
  fs.writeFileSync(path.join(root, "assets/data/public-routes.json"), JSON.stringify({ counts: { routes: routes.length }, routes }));
  fs.writeFileSync(path.join(directory, "search-index.json"), JSON.stringify([
    { id: "method", title: "T-SROI &amp;amp; Wirkung", url: "/werkzeuge/t-sroi/", description: "Kausaler Nettonutzen", body: "Belegbare Transformation", aliases: ["SROI"], priority: 20 },
    { id: "section", title: "Schutz-Gate", url: "/werkzeuge/t-sroi/#schutz", description: "Nichtkompensation", priority: 30 },
    { id: "ticker", title: "Meldung", url: "/wirkungsticker/meldung/", description: "Aktuelle Meldung", priority: 99 },
    { id: "redirect", title: "Alt", url: "/alte-route/", priority: 100 },
  ]));
  fs.writeFileSync(path.join(directory, "search-curated-entrypoints.json"), "[]");
  fs.writeFileSync(path.join(root, "assets/js/search.js"), "const CURATED_QUERY_ROUTES = {}; const RECOMMENDED_QUERY_ENTRYPOINTS = {};");
  return root;
}

test("the browser build covers the route manifest, shards archives and removes redirects", () => {
  const root = buildFixture();
  try {
    const source = fs.readFileSync(path.join(root, "assets/search/search-index.json"), "utf8");
    const first = buildBrowserSearchIndex(root);
    const second = buildBrowserSearchIndex(root);
    assert.deepEqual(first, second);
    assert.equal(first.schemaVersion, 2);
    assert.equal(first.entries, 3);
    assert.equal(first.coverage.ratio, 1);
    assert.equal(first.archives.length, 1);
    assert.equal(first.archives[0].area, "bibliothek");
    const built = readBuiltSearchEntries(root);
    assert.deepEqual(new Set(built.map((entry) => entry.url)), new Set([
      "/werkzeuge/t-sroi/",
      "/bibliothek/eintrag/",
      "/wirkungsticker/meldung/",
    ]));
    assert.equal(built.find((entry) => entry.url === "/werkzeuge/t-sroi/").title, "T-SROI & Wirkung");
    assert.equal(built.find((entry) => entry.url === "/wirkungsticker/meldung/").priority, 20);
    assert.equal(fs.readFileSync(path.join(root, "assets/search/search-index.json"), "utf8"), source);
    assert.ok(first.suggestions.bytes <= 180000);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("artifact mode removes the large source index after producing versioned shards", () => {
  const root = buildFixture();
  try {
    buildBrowserSearchIndex(root, { pruneFullIndex: true });
    assert.equal(fs.existsSync(path.join(root, "assets/search/search-index.json")), false);
    assert.equal(readBuiltSearchEntries(root).length, 3);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("source-mode browser search remains buildable before an artifact route manifest exists", () => {
  const root = buildFixture();
  try {
    fs.rmSync(path.join(root, "assets/data/public-routes.json"));
    const manifest = buildBrowserSearchIndex(root);
    assert.equal(manifest.entries, 3);
    assert.equal(manifest.coverage.routes, 3);
    assert.equal(fs.existsSync(path.join(root, "assets/search/search-index.json")), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("the shared loader fetches versioned gzip shards and never falls back to the full index", async () => {
  const originalFetch = globalThis.fetch;
  const entries = [{ title: "Kern", url: "/kern/" }];
  const archive = [{ title: "Archiv", url: "/bibliothek/archiv/" }];
  const suggestions = [{ title: "Kern", url: "/kern/", type: "Seite", raum: "Start", snippet: "" }];
  const part = (prefix, data) => ({
    entries: data.length,
    version: "0123456789abcdef",
    json: `${prefix}-0123456789abcdef.json`,
    gzip: `${prefix}-0123456789abcdef.json.gz`,
  });
  const manifest = {
    schemaVersion: 2,
    version: "abcdef0123456789",
    entries: 2,
    coverage: { searchable: 2 },
    core: part("search-core", entries),
    archives: [{ ...part("search-archive-bibliothek", archive), area: "bibliothek" }],
    suggestions: part("search-suggestions", suggestions),
  };
  const requests = [];
  try {
    globalThis.fetch = async (url) => {
      const value = String(url);
      requests.push(value);
      if (value.endsWith("browser-index-manifest.json")) return new Response(JSON.stringify(manifest));
      if (value.includes("search-core")) return new Response(gzipSync(JSON.stringify(entries)));
      if (value.includes("search-archive")) return new Response(gzipSync(JSON.stringify(archive)));
      if (value.includes("search-suggestions")) return new Response(gzipSync(JSON.stringify(suggestions)));
      throw new Error(`Unexpected search request: ${value}`);
    };
    assert.deepEqual(await loadBrowserSearchIndex("https://example.test/search/"), [...entries, ...archive]);
    assert.deepEqual(await loadSearchSuggestions("https://example.test/search/"), suggestions);
    assert.equal(requests.some((url) => url.endsWith("search-index.json")), false);
    assert.equal(requests.filter((url) => url.endsWith("browser-index-manifest.json")).length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
