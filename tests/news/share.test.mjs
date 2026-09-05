import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const script = fs.readFileSync(new URL("../../assets/js/news-share.js", import.meta.url), "utf8");
function shareHarness({ native = true, cancel = false, clipboard = true, legacy = true } = {}) {
  const shared = [], copied = [];
  const buttons = ["first", "second"].map((slug) => {
    const status = { textContent: "" };
    return { status, closest: () => ({ querySelector: () => status }),
      getAttribute: (key) => ({ "data-share-url": `https://wirkungsoekonomie.de/wirkungsticker/${slug}/`, "data-share-title": slug, "data-share-text": `Summary ${slug}` })[key],
      addEventListener(name, handler) { this[name] = handler; } };
  });
  let field;
  vm.runInNewContext(script, {
    document: { title: "Overview", querySelectorAll: () => buttons,
      body: { appendChild() {} }, createElement: () => (field = { style: {}, setAttribute() {}, select() {}, remove() {} }),
      execCommand: () => { if (legacy) copied.push(field.value); return legacy; } },
    window: { location: { href: "https://wirkungsoekonomie.de/wirkungsticker/" } },
    navigator: {
      ...(native ? { share: async (payload) => { if (cancel) throw { name: "AbortError" }; shared.push(payload); } } : {}),
      clipboard: { writeText: async (text) => { if (!clipboard) throw Error("blocked"); copied.push(text); } },
    },
  });
  return { buttons, shared, copied };
}

test("overview sharing sends the selected article, not the list, with isolated feedback", async () => {
  const h = shareHarness();
  await h.buttons[1].click();
  assert.equal(h.shared[0].url, "https://wirkungsoekonomie.de/wirkungsticker/second/");
  assert.equal(h.shared[0].title, "second");
  assert.equal(h.buttons[0].status.textContent, "");
  assert.equal(h.buttons[1].status.textContent, "Nachricht geteilt.");
});

test("native cancellation is not an error and never copies secretly", async () => {
  const h = shareHarness({ cancel: true });
  await h.buttons[0].click();
  assert.equal(h.copied.length, 0);
  assert.equal(h.buttons[0].status.textContent, "");
});

test("clipboard and legacy fallback both copy the exact article URL", async () => {
  for (const clipboard of [true, false]) {
    const h = shareHarness({ native: false, clipboard });
    await h.buttons[0].click();
    assert.deepEqual(h.copied, ["https://wirkungsoekonomie.de/wirkungsticker/first/"]);
  }
});

test("when copying is blocked the correct article address remains available", async () => {
  const h = shareHarness({ native: false, clipboard: false, legacy: false });
  await h.buttons[0].click();
  assert.match(h.buttons[0].status.textContent, /Nachrichtenlink: https:\/\/wirkungsoekonomie\.de\/wirkungsticker\/first\//);
  assert.doesNotMatch(h.buttons[0].status.textContent, /Browserzeile/);
});

test("generated cards provide paired controls, unique status IDs and the share script", () => {
  const html = fs.readFileSync(new URL("../../wirkungsticker/index.html", import.meta.url), "utf8");
  const cards = html.match(/class="news-(?:editorial-)?card__actions"/g) || [];
  const shareIds = [...html.matchAll(/id="(news-share-status-[^"]+-card)"/g)].map((match) => match[1]);
  assert.ok(cards.length >= 10);
  assert.equal(shareIds.length, cards.length);
  assert.equal(new Set(shareIds).size, shareIds.length);
  assert.match(html, /assets\/js\/news-share\.js\?v=20260904-actions1/);
});
