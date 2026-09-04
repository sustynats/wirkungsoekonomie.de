import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const script = fs.readFileSync("assets/js/news-navigation.js", "utf8");
const key = "woek:wirkungsticker:navigation:v1";
const origin = "https://wirkungsoekonomie.de";

function page({ path = "/wirkungsticker/a/", pending = null, state = null, navigationType = "navigate", next = true, detail = true, locked = false } = {}) {
  const events = new Map();
  const docEvents = new Map();
  const windowEvents = new Map();
  const store = new Map(pending ? [[key, JSON.stringify(pending)]] : []);
  const assigned = [];
  let backs = 0;
  const main = { dataset: { newsReader: detail ? "detail" : "list" }, contains: () => true, addEventListener: (name, handler) => events.set(name, handler) };
  const target = { closest: () => null, parentElement: main, scrollWidth: 100, clientWidth: 100 };
  const location = { origin, pathname: path, href: `${origin}${path}`, search: "", assign: (value) => assigned.push(value) };
  const history = { state, length: 3, back: () => { backs++; }, replaceState(value) { this.state = value; } };
  const button = { hidden: true, addEventListener() {} };
  const context = {
    URL, Date, document: {
      querySelector: (selector) => selector.startsWith("main") ? main : selector.includes("return-to-list") ? { href: `${origin}/wirkungsticker/#story-a` }
        : selector.includes("--next") ? (next ? { href: `${origin}/wirkungsticker/b/` } : null) : null,
      querySelectorAll: (selector) => selector.startsWith("dialog") ? [] : [button],
      addEventListener: (name, handler) => docEvents.set(name, handler),
      getElementById: () => ({ scrollIntoView() {} }),
    },
    window: { location, history, innerWidth: 390, visualViewport: { scale: 1 }, getSelection: () => "", getComputedStyle: () => ({ overflowX: "visible" }),
      performance: { getEntriesByType: () => [{ type: navigationType }] },
      sessionStorage: { getItem: (name) => { if (locked) throw Error("blocked"); return store.get(name); }, setItem: (name, value) => store.set(name, value), removeItem: (name) => store.delete(name) },
      addEventListener: (name, handler) => windowEvents.set(name, handler),
    },
  };
  vm.runInNewContext(script, context);
  function swipe({ startX = 280, startY = 250, endX = 100, endY = 254, element = target, touches = 1, cancel = false, moves = [] } = {}) {
    let prevented = false;
    const point = (x, y) => ({ identifier: 1, clientX: x, clientY: y });
    const event = (points, changed = points) => ({ target: element, touches: points, changedTouches: changed, cancelable: true, preventDefault: () => { prevented = true; } });
    events.get("touchstart")?.(event(Array(touches).fill(point(startX, startY))));
    moves.forEach(([x, y]) => events.get("touchmove")?.(event([point(x, y)])));
    events.get("touchmove")?.(event([point(endX, endY)]));
    if (cancel) events.get("touchcancel")?.();
    events.get("touchend")?.(event([], [point(endX, endY)]));
    return prevented;
  }
  return { swipe, assigned, backs: () => backs, history, store, target, context, docEvents, windowEvents };
}

test("left advances; right follows overview → article A → article B in actual history", () => {
  const list = page({ path: "/wirkungsticker/", detail: false });
  const link = { href: `${origin}/wirkungsticker/a/`, hasAttribute: () => false };
  list.docEvents.get("click")({ button: 0, target: { closest: () => link } });
  const first = page({ pending: JSON.parse(list.store.get(key)) });
  first.swipe();
  assert.deepEqual(first.assigned, [`${origin}/wirkungsticker/b/`]);
  const second = page({ path: "/wirkungsticker/b/", pending: JSON.parse(first.store.get(key)) });
  assert.equal(second.history.state.newsReader.back, `${origin}/wirkungsticker/a/`);
  second.swipe({ startX: 100, endX: 280 });
  assert.equal(second.backs(), 1);
  first.windowEvents.get("pageshow")();
  first.swipe({ startX: 100, endX: 280 });
  assert.equal(first.backs(), 1);
  assert.equal(first.history.state.newsReader.back, `${origin}/wirkungsticker/`);
});

test("deep links, stale referrals and blocked storage go to the overview, never an unrelated history entry", () => {
  for (const options of [{}, { locked: true }, { pending: { from: "https://other.example/", to: `${origin}/wirkungsticker/a/`, at: Date.now() } }, { pending: { from: `${origin}/wirkungsticker/`, to: `${origin}/wirkungsticker/a/`, at: Date.now() - 120000 } }]) {
    const p = page(options);
    p.swipe({ startX: 100, endX: 280 });
    assert.equal(p.backs(), 0);
    assert.match(p.assigned[0], /wirkungsticker\/#story-a$/);
  }
});

test("reload keeps reader history and unrelated history state; stale pending cannot replace it", () => {
  const p = page({ navigationType: "reload", state: { other: 1, newsReader: { back: `${origin}/wirkungsticker/` } } });
  p.swipe({ startX: 100, endX: 280 });
  assert.equal(p.backs(), 1);
  assert.equal(p.history.state.other, 1);
});

test("vertical, diagonal, small, multi-touch, cancelled and native edge gestures do not navigate", () => {
  for (const gesture of [
    { endX: 280, endY: 440 }, { endX: 100, endY: 420 }, { endX: 240 },
    { touches: 2 }, { cancel: true }, { startX: 10, endX: 260 }, { startX: 382 },
    { moves: [[278, 300]] },
  ]) {
    const p = page();
    p.swipe(gesture);
    assert.equal(p.assigned.length, 0, JSON.stringify(gesture));
    assert.equal(p.backs(), 0);
  }
  const p = page();
  assert.equal(p.swipe({ endX: 280, endY: 440 }), false, "vertical scrolling remains passive");
});

test("buttons, horizontal scrollers, open dialogs and zoom retain their touch interaction", () => {
  for (const configure of [
    (p) => { p.target.closest = () => ({}); },
    (p) => { p.target.scrollWidth = 300; p.context.window.getComputedStyle = () => ({ overflowX: "auto" }); },
    (p) => { p.context.document.querySelectorAll = () => [{ getClientRects: () => [{}] }]; },
    (p) => { p.context.window.visualViewport.scale = 2; },
    (p) => { p.context.window.getSelection = () => "selected text"; },
  ]) {
    const p = page();
    configure(p);
    p.swipe();
    assert.equal(p.assigned.length, 0);
  }
});

test("hidden modal shells do not disable news gestures", () => {
  const p = page();
  p.context.document.querySelectorAll = () => [{ getClientRects: () => [] }];
  p.swipe();
  assert.equal(p.assigned.length, 1);
});

test("last article does not loop; one swipe navigates once", () => {
  const last = page({ next: false });
  last.swipe();
  assert.equal(last.assigned.length, 0);
  const p = page();
  p.swipe(); p.swipe();
  assert.equal(p.assigned.length, 1);
});

test("section anchors replace their entry so right swipe returns to the preceding page", () => {
  const p = page({ state: { other: 1, newsReader: { back: `${origin}/wirkungsticker/` } } });
  let prevented = false;
  p.docEvents.get("click")({ button: 0, preventDefault: () => { prevented = true; }, target: { closest: () => ({ href: `${origin}/wirkungsticker/a/#analyse`, hasAttribute: () => false }) } });
  assert.equal(prevented, true);
  assert.equal(p.history.state.other, 1);
  p.swipe({ startX: 100, endX: 280 });
  assert.equal(p.backs(), 1);
});

test("save controls reuse the existing store and update all instances", () => {
  const main = fs.readFileSync("assets/js/main.js", "utf8");
  const code = main.slice(main.indexOf("  const saveControls = new Map();"), main.indexOf("  function renderCollectionPanel("));
  const saved = new Map();
  const item = { id: "wirkungsticker/a/", url: "/wirkungsticker/a/", title: "A" };
  const context = { document: { querySelectorAll: () => [], addEventListener() {} }, window: { addEventListener() {} },
    savedPathSet: () => new Set([...saved.values()].map((s) => s.url)),
    itemSavedByPath: (s) => saved.has(s.id), saveItem: (s) => saved.set(s.id, s), removeItemByPath: (s) => saved.delete(s.id),
    buttonLabel: (button, value) => { button.saved = value; },
  };
  vm.runInNewContext(code, context);
  const button = () => ({ hidden: true, addEventListener(name, handler) { this[name] = handler; } });
  const a = button(), b = button();
  context.bindSaveButton(a, () => item); context.bindSaveButton(b, () => item);
  a.click();
  assert.equal(saved.size, 1); assert.equal(a.saved, true); assert.equal(b.saved, true);
  b.click();
  assert.equal(saved.size, 0); assert.equal(a.saved, false); assert.equal(b.saved, false);
  assert.equal(a.hidden, false);
});

test("generator includes reusable save controls and reader hooks; list preserves entry state", () => {
  const build = fs.readFileSync("scripts/news/build.mjs", "utf8");
  assert.match(build, /data-news-reader="detail"/);
  assert.match(build, /data-news-reader="list"/);
  assert.match(build, /data-wirkungsraum-save-url/);
  assert.match(build, /mein-wirkungsraum\/#gemerkte-inhalte/);
  const list = fs.readFileSync("assets/js/news.js", "utf8");
  assert.match(list, /back_forward/);
  assert.doesNotMatch(list, /replaceState\(\{\}/);
});
