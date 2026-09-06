import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const app = fs.readFileSync("assets/js/news-pwa.js", "utf8");

function node() {
  const events = new Map();
  return {
    events, dataset: {}, children: [], hidden: false, textContent: "", attributes: {},
    scrollHeight: 0, clientHeight: 0, scrollWidth: 0, clientWidth: 0,
    closest() { return null; }, matches() { return false; }, querySelector() { return null; },
    classList: { add() {} }, getClientRects() { return [1]; },
    setAttribute(key, value) { this.attributes[key] = value; },
    append(...children) { this.children.push(...children); },
    addEventListener(name, fn, options) { events.set(name, { fn, options }); },
  };
}

function harness({ offline = false, invalid = false, pending = false, overview = false, mobile = true, storageBlocked = false } = {}) {
  const reader = node();
  const body = node();
  const button = node();
  const status = node();
  const target = node(); target.parentElement = reader;
  reader.parentElement = body;
  const doc = node();
  Object.assign(doc, {
    body, documentElement: node(), createElement: node, scrollingElement: { scrollTop: 0 }, visibilityState: "visible",
    querySelector: (selector) => selector === "main[data-news-reader]" ? reader
      : selector === "[data-news-app-tools]" && overview ? node() : null,
    querySelectorAll: (selector) => selector === "[data-news-refresh-button]" ? [button]
      : selector === "[data-news-refresh-status]" ? [status] : [],
  });
  const timers = new Map();
  const store = new Map();
  let reloads = 0; let calls = 0; let timerId = 0; let resolveFetch;
  const storage = {
    getItem: (key) => { if (storageBlocked) throw new Error("storage disabled"); return store.get(key); },
    setItem: (key, value) => { if (storageBlocked) throw new Error("storage disabled"); store.set(key, value); },
  };
  const win = Object.assign(node(), {
    innerWidth: 390, scrollY: 0, visualViewport: { scale: 1 },
    matchMedia: (query) => ({ matches: mobile && query.includes("max-width") }),
    location: { protocol: "http:", hostname: "test", reload() { reloads++; } },
    setTimeout: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; },
    clearTimeout: (id) => timers.delete(id), setInterval() { return 1; },
    localStorage: storage, sessionStorage: storage,
    getComputedStyle: (element) => element.style || { visibility: "visible", overflowX: "visible", overflowY: "visible" },
    getSelection: () => "",
  });
  const context = {
    Date, Intl, AbortController, document: doc, window: win,
    navigator: { userAgent: mobile ? "iPhone" : "Desktop", maxTouchPoints: mobile ? 1 : 0 },
    fetch: async (_url, options) => {
      calls++;
      if (offline) throw new Error("offline");
      if (pending) await new Promise((resolve, reject) => {
        resolveFetch = resolve;
        options.signal.addEventListener("abort", () => reject(new Error("aborted")));
      });
      return { ok: true, json: async () => invalid ? {} : { items: [] } };
    },
  };
  win.navigator = context.navigator;
  vm.runInNewContext(app, context);
  const point = (x, y, id = 1) => ({ clientX: x, clientY: y, identifier: id });
  const emit = (name, touches, changedTouches = [], extra = {}) => {
    const event = { target, touches, changedTouches, cancelable: true, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }, ...extra };
    reader.events.get(name)?.fn(event);
    return event.defaultPrevented;
  };
  const start = (x = 150, y = 200) => emit("touchstart", [point(x, y)]);
  const move = (x = 150, y = 300, extra) => emit("touchmove", [point(x, y)], [], extra);
  const end = (x = 150, y = 300) => emit("touchend", [], [point(x, y)]);
  const pull = () => { start(); move(); end(); };
  return { reader, body, target, button, status, doc, win, timers, store, emit, point, start, move, end, pull,
    indicator: () => body.children[0], reloads: () => reloads, calls: () => calls,
    complete: async () => { resolveFetch?.(); await new Promise(setImmediate); } };
}

test("pull requires release after threshold, refreshes detail/empty list and keeps the current URL", async () => {
  for (const overview of [false, true]) {
    const h = harness({ overview });
    h.start(); assert.equal(h.move(), true);
    assert.equal(h.indicator().dataset.state, "ready");
    assert.equal(h.calls(), 0);
    h.end(); await h.complete();
    assert.equal(h.reloads(), 1); assert.equal(h.calls(), 1);
    assert.equal(h.reader.events.get("touchstart").options.passive, true);
    assert.equal(h.reader.events.get("touchmove").options.passive, false);
  }
});

test("pull and accessible refresh button share one in-flight request", async () => {
  const h = harness({ pending: true }); h.pull(); h.pull();
  h.button.events.get("click").fn();
  assert.equal(h.calls(), 1); assert.equal(h.button.disabled, true);
  assert.equal(h.indicator().dataset.state, "loading");
  await h.complete(); h.pull(); h.button.events.get("click").fn();
  assert.equal(h.calls(), 1); assert.equal(h.reloads(), 1);
});

test("short pull, reversal, horizontal or diagonal swipe, upward scroll and browser edge do not refresh", async () => {
  for (const [x, y, endX, endY] of [[150, 200, 150, 250], [150, 200, 150, 120], [150, 200, 300, 210], [150, 200, 250, 300], [4, 200, 4, 310], [386, 200, 386, 310]]) {
    const h = harness(); h.start(x, y); h.move(endX, endY); h.end(endX, endY); await h.complete();
    assert.equal(h.calls(), 0);
  }
  const h = harness(); h.start(); h.move(); h.move(150, 240); h.end(150, 240);
  assert.equal(h.calls(), 0); assert.equal(h.indicator().hidden, true);
});

test("a gesture starting below page top never becomes a refresh after reaching the top", () => {
  const h = harness(); h.win.scrollY = 120; h.start(); h.win.scrollY = 0; h.move(); h.end();
  assert.equal(h.calls(), 0);
});

test("horizontal and upward starts cannot turn into a pull later", () => {
  for (const [x, y] of [[200, 202], [150, 190]]) {
    const h = harness(); h.start(); h.move(x, y); h.move(150, 330); h.end(150, 330);
    assert.equal(h.calls(), 0);
  }
});

test("multi-touch, cancellation, lost touch identity and non-cancelable moves are left alone", () => {
  for (const cancel of [
    h => h.emit("touchmove", [h.point(150, 300), h.point(200, 300, 2)]),
    h => h.emit("touchcancel", []),
    h => h.emit("touchmove", [h.point(150, 300, 2)]),
    h => h.move(150, 300, { cancelable: false }),
  ]) {
    const h = harness(); h.start(); cancel(h); h.move(); h.end(); assert.equal(h.calls(), 0);
  }
});

test("inputs, active editing, selection, zoom, dialogs and nested scroll areas are protected", () => {
  for (const block of [
    h => { h.target.closest = () => ({}); },
    h => { h.doc.activeElement = { matches: () => true }; },
    h => { h.win.getSelection = () => "selected text"; },
    h => { h.win.visualViewport.scale = 2; },
    h => { h.doc.querySelectorAll = () => [node()]; },
    h => { h.target.scrollHeight = 1000; h.target.clientHeight = 200; h.target.style = { overflowY: "auto" }; },
    h => { h.target.scrollWidth = 1000; h.target.clientWidth = 200; h.target.style = { overflowX: "auto" }; },
  ]) { const h = harness(); block(h); h.pull(); assert.equal(h.calls(), 0); }
});

test("offline, malformed replies and timeouts retain the page and permit retry", async () => {
  for (const options of [{ offline: true }, { invalid: true }, { pending: true }]) {
    const h = harness(options); h.pull();
    if (options.pending) [...h.timers.values()].find(t => t.ms === 12000).fn();
    await new Promise(setImmediate);
    assert.equal(h.reloads(), 0); assert.equal(h.button.disabled, false);
    assert.equal(h.indicator().dataset.state, "error");
    assert.match(h.status.textContent, /letzte Stand bleibt verfügbar/);
    assert.equal([...h.timers.values()].some(t => t.ms === 12000), false);
    h.pull(); assert.equal(h.calls(), 2);
    if (options.pending) [...h.timers.values()].find(t => t.ms === 12000).fn();
    await h.complete();
  }
});

test("refresh works with blocked session storage; no private data is cleared", async () => {
  const h = harness({ storageBlocked: true }); h.pull(); await h.complete();
  assert.equal(h.reloads(), 1);
  assert.doesNotMatch(app, /localStorage\.clear|sessionStorage\.clear|caches\.delete/);
});

test("device-reported offline mode never starts a request or reload", async () => {
  const h = harness(); h.win.navigator.onLine = false; h.pull(); await h.complete();
  assert.equal(h.calls(), 0); assert.equal(h.reloads(), 0);
  assert.equal(h.indicator().dataset.state, "error");
});

test("hiding the app or leaving the page cancels an unfinished gesture", () => {
  for (const type of ["pagehide", "visibilitychange"]) {
    const h = harness(); h.start(); h.move();
    if (type === "pagehide") h.win.events.get(type).fn();
    else { h.doc.visibilityState = "hidden"; h.doc.events.get(type).fn(); h.doc.visibilityState = "visible"; }
    h.end(); assert.equal(h.calls(), 0); assert.equal(h.indicator().hidden, true);
  }
});

test("desktop still has the accessible button without a touch overlay", async () => {
  const h = harness({ mobile: false }); assert.equal(h.indicator(), undefined);
  h.button.events.get("click").fn(); await h.complete(); assert.equal(h.reloads(), 1);
});

test("worker freshness probes do not return cached data when offline", async () => {
  const handlers = new Map(); let cacheOpens = 0;
  vm.runInNewContext(fs.readFileSync("wirkungsticker/sw.js", "utf8"), {
    URL, self: { location: { origin: "https://wirkungsoekonomie.de" }, addEventListener: (name, fn) => handlers.set(name, fn) },
    fetch: async () => { throw new Error("offline"); },
    caches: { open: async () => { cacheOpens++; return { match: async () => new Response('{"items":[]}') }; } },
  });
  let reply;
  const run = url => handlers.get("fetch")({ request: new Request(url), respondWith(promise) { reply = promise; } });
  run("https://wirkungsoekonomie.de/wirkungsticker/feed.json?check=123");
  await assert.rejects(reply, /offline/); assert.equal(cacheOpens, 0);
  run("https://wirkungsoekonomie.de/wirkungsticker/feed.json");
  assert.equal((await reply).status, 200); assert.equal(cacheOpens, 1);
});

test("both detail templates provide a keyboard/tap alternative; motion preferences are respected", () => {
  const build = fs.readFileSync("scripts/news/build.mjs", "utf8");
  assert.equal((build.match(/\$\{readerRefreshControl\(\)\}/g) || []).length, 2);
  const css = fs.readFileSync("assets/css/news.css", "utf8");
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.news-pull-refresh\[hidden\] \{ display: none/);
});
