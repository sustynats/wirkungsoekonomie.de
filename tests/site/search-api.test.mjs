import test from "node:test";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { createSearchClient } from "../../assets/js/search-api.js";

test("suggest and search expose the P1.3 interface with non-empty dynamic facets", async () => {
  const originalFetch = globalThis.fetch;
  const core = [
    { title: "Wirkung verstehen", url: "/verstehen/wirkung/", description: "Wirkung ist eine Zustandsveränderung.", body: "Outcome und Wirkung", aliases: ["Impact"], raum: "Verstehen", typ: "Seite", thema: ["Wirkung"], rolle: [], priority: 70 },
    { title: "Wirkungsrechner", url: "/werkzeuge/rechner/", description: "Wirkung nachvollziehbar rechnen.", body: "Rechner", aliases: [], raum: "Werkzeuge", typ: "Werkzeug", thema: ["Wirkung"], rolle: ["Unternehmen"], priority: 60 },
  ];
  const archives = [
    { title: "Archivpapier Wirkung", url: "/bibliothek/wirkung/", description: "Historische Herleitung.", body: "Wirkung", aliases: [], raum: "Bibliothek", typ: "Publikation", thema: ["Wirkung"], rolle: [], priority: 30 },
  ];
  const suggestions = core.map((entry) => ({ title: entry.title, url: entry.url, type: entry.typ, raum: entry.raum, snippet: entry.description, aliases: entry.aliases }));
  const part = (prefix, entries) => ({ entries: entries.length, version: "0123456789abcdef", json: `${prefix}-0123456789abcdef.json`, gzip: `${prefix}-0123456789abcdef.json.gz` });
  const manifest = {
    schemaVersion: 2,
    version: "abcdef0123456789",
    entries: 3,
    coverage: { searchable: 3 },
    core: part("search-core", core),
    archives: [{ ...part("search-archive-bibliothek", archives), area: "bibliothek" }],
    suggestions: part("search-suggestions", suggestions),
  };
  try {
    globalThis.fetch = async (url) => {
      const value = String(url);
      if (value.endsWith("browser-index-manifest.json")) return new Response(JSON.stringify(manifest));
      if (value.includes("search-core")) return new Response(gzipSync(JSON.stringify(core)));
      if (value.includes("search-archive")) return new Response(gzipSync(JSON.stringify(archives)));
      if (value.includes("search-suggestions")) return new Response(gzipSync(JSON.stringify(suggestions)));
      if (value.endsWith("search-dictionary.json")) return new Response(JSON.stringify({ terms: [], typos: {} }));
      if (value.endsWith("search-associations.json")) return new Response(JSON.stringify({}));
      throw new Error(`Unexpected search request: ${value}`);
    };
    const client = createSearchClient({ baseUrl: "https://api-test.example/search/" });
    const proposed = await client.suggest("wirk", { limit: 5 });
    assert.equal(proposed.length, 2);
    assert.deepEqual(Object.keys(proposed[0]), ["title", "url", "type", "raum", "snippet"]);

    const all = await client.search("Wirkung", { page: 1 });
    assert.equal(all.total, 3);
    assert.equal(all.results.length, 3);
    assert.deepEqual(all.groups.map((group) => group.value).sort(), ["Publikation", "Seite", "Werkzeug"]);
    assert.ok(all.facets.raum.every((item) => item.count > 0));
    assert.ok(all.facets.typ.every((item) => item.count > 0));
    assert.ok(all.facets.thema.every((item) => item.count > 0));
    assert.deepEqual(all.facets.rolle, [{ value: "Unternehmen", count: 1 }]);

    const tools = await client.search("Wirkung", { raum: "Werkzeuge", typ: "Werkzeug" });
    assert.equal(tools.total, 1);
    assert.equal(tools.results[0].url, "/werkzeuge/rechner/");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
