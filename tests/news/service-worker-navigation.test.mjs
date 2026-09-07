import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../../wirkungsticker/sw.js", import.meta.url), "utf8");
const request = () => new Request("https://wirkungsoekonomie.de/wirkungsticker/test-article/", { headers: { accept: "text/html" } });
const pending = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const reply = (body, status = 200) => ({ status, ok: status >= 200 && status < 300, clone: () => reply(body, status), text: async () => body });

function harness({ fetch = async () => reply("fresh"), cache = {}, open } = {}) {
  const timers = new Map(), listeners = new Map(), background = [], writes = [];
  let clock = 0, nextId = 0;
  const storage = { match: async () => null, put: async (key, response) => { writes.push({ key, body: await response.text() }); }, ...cache };
  const context = vm.createContext({
    Response, URL, AbortController, fetch,
    caches: { open: open || (async () => storage) },
    self: { location: { origin: "https://wirkungsoekonomie.de" }, addEventListener: (type, listener) => listeners.set(type, listener) },
    setTimeout: (callback, milliseconds) => { const id = ++nextId; timers.set(id, { at: clock + milliseconds, callback }); return id; },
    clearTimeout: id => timers.delete(id),
  });
  vm.runInContext(source, context);
  const flush = async () => { for (let i = 0; i < 25; i++) await Promise.resolve(); };
  const event = { waitUntil: promise => background.push(promise) };
  return { context, event, writes, background, listeners, flush,
    async tick(milliseconds) {
      const end = clock + milliseconds;
      await flush();
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        clock = next[1].at; timers.delete(next[0]); next[1].callback(); await flush();
      }
      clock = end; await flush();
    },
  };
}

test("a usable network response never waits for cache writes, slow storage or quota errors", async () => {
  for (const storageFailure of ["slow-write", "quota", "slow-open", "denied-open"]) {
    const blocked = pending();
    const h = harness({
      cache: { put: () => storageFailure === "quota" ? Promise.reject(new Error("QuotaExceededError")) : blocked.promise },
      ...(storageFailure === "slow-open" ? { open: () => blocked.promise } : {}),
      ...(storageFailure === "denied-open" ? { open: () => Promise.reject(new Error("SecurityError")) } : {}),
    });
    let delivered;
    h.context.networkFirst(request(), h.event).then(response => { delivered = response; });
    await h.flush();
    assert.equal(await delivered?.text(), "fresh", storageFailure);
    assert.equal(h.background.length, 1);
    await h.tick(5000);
    await Promise.all(h.background);
  }
});

test("a stalled connection serves the saved article after a short grace period and aborts within bounds", async () => {
  let signal;
  const h = harness({ fetch: (_request, options) => { signal = options.signal; return new Promise(() => {}); }, cache: { match: async () => reply("saved article") } });
  let delivered;
  h.context.networkFirst(request(), h.event).then(response => { delivered = response; });
  await h.tick(2499); assert.equal(delivered, undefined);
  await h.tick(1); assert.equal(await delivered.text(), "saved article");
  assert.equal(signal.aborted, false);
  await h.tick(5500); assert.equal(signal.aborted, true);
  await Promise.all(h.background);
});

test("cold-start navigation cannot hang forever when both network and offline cache are unavailable", async () => {
  const h = harness({ fetch: () => new Promise(() => {}) });
  let delivered;
  h.context.networkFirst(request(), h.event).then(response => { delivered = response; });
  await h.tick(7999); assert.equal(delivered, undefined);
  await h.tick(1);
  assert.equal(delivered.status, 503);
  assert.match(await delivered.text(), /Diese Seite erneut laden/);
  assert.match(delivered.headers.get("content-type"), /text\/html/);
});

test("a late successful reply refreshes storage without delaying the already displayed saved article", async () => {
  const late = pending();
  const h = harness({ fetch: () => late.promise, cache: { match: async () => reply("saved") } });
  let delivered;
  h.context.networkFirst(request(), h.event).then(response => { delivered = response; });
  await h.tick(2500); assert.equal(await delivered.text(), "saved");
  late.resolve(reply("fresh")); await h.flush(); await Promise.all(h.background);
  assert.equal(h.writes[0].body, "fresh");
  assert.equal(await delivered.text(), "saved");
});

test("transient server failure uses the saved article; a real 404 is not disguised", async () => {
  for (const status of [503, 404]) {
    const h = harness({ fetch: async () => reply("server response", status), cache: { match: async () => reply("saved") } });
    const response = await h.context.networkFirst(request(), h.event);
    assert.equal(await response.text(), status === 503 ? "saved" : "server response");
    assert.equal(h.writes.length, 0);
  }
});

test("freshness probes never fall back to cached news and retain the existing cache namespace", async () => {
  let fetches = 0, cacheOpens = 0, response;
  const h = harness({ fetch: async () => { fetches++; throw new Error("network down"); }, open: async () => { cacheOpens++; return {}; } });
  h.listeners.get("fetch")({ request: new Request("https://wirkungsoekonomie.de/wirkungsticker/feed.json?check=123"), respondWith: promise => { response = promise; } });
  await assert.rejects(response, /network down/);
  assert.equal(fetches, 1); assert.equal(cacheOpens, 0);
  assert.match(source, /CACHE_NAME = "woek-wirkungsticker-shell-20260906-pull-refresh1"/);
});
