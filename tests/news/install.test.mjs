import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function page({ standalone = false, ios = false, ipad = false, blocked = false, store = new Map(), framed = false } = {}) {
  const node = () => ({ hidden: true, textContent: "", disabled: false, events: new Map(), addEventListener(name, fn) { this.events.set(name, fn); } });
  const promo = node(), buttons = [node(), node()], copies = [node(), node()], actions = [node(), node()], dismiss = [node()];
  const events = new Map(), media = { matches: standalone, addEventListener(name, fn) { this.change = fn; } };
  const nodes = { "[data-news-install-button]": buttons, "[data-news-install-copy]": copies, "[data-news-install-actions]": actions, "[data-news-install-dismiss]": dismiss };
  const window = { matchMedia: () => media, addEventListener: (name, fn) => events.set(name, fn), localStorage: {
    getItem: (key) => { if (blocked) throw Error("blocked"); return store.get(key); },
    setItem: (key, value) => { if (blocked) throw Error("blocked"); store.set(key, value); },
  } };
  window.self = window; window.top = framed ? {} : window;
  vm.runInNewContext(fs.readFileSync("assets/js/news-install.js", "utf8"), {
    window, Date, navigator: { userAgent: ios ? "iPhone" : "Browser", platform: ipad ? "MacIntel" : "", maxTouchPoints: ipad ? 5 : 0 },
    document: { querySelector: () => promo, querySelectorAll: (selector) => nodes[selector] || [] },
  });
  return { promo, buttons, copies, actions, dismiss, events, store, media };
}

test("install offer is prominent but hidden in installed app, frames and after dismissal", () => {
  assert.equal(page().promo.hidden, false);
  assert.equal(page({ standalone: true }).promo.hidden, true);
  assert.equal(page({ framed: true }).promo.hidden, true);
  const p = page(); p.dismiss[0].events.get("click")();
  assert.equal(p.promo.hidden, true);
  assert.equal(page({ store: p.store }).promo.hidden, true);
  assert.equal(p.actions[1].hidden, false, "manual install remains available below");
  p.store.set("woek_ticker_install_dismissed_at", String(Date.now() - 31 * 86400000));
  assert.equal(page({ store: p.store }).promo.hidden, false);
});

test("iPhone and desktop-mode iPad show actionable instructions without permission prompt", async () => {
  for (const options of [{ ios: true }, { ipad: true }]) {
    const p = page(options);
    await p.buttons[0].events.get("click")();
    assert.match(p.copies[0].textContent, /Safari.*Teilen.*Home-Bildschirm.*Hinzufügen/);
    assert.equal(p.copies[0].textContent, p.copies[1].textContent);
  }
});

test("browser install is triggered only by a click and consumed once", async () => {
  const p = page(); let prompts = 0;
  p.events.get("beforeinstallprompt")({ preventDefault() {}, prompt: async () => { prompts++; }, userChoice: Promise.resolve({ outcome: "accepted" }) });
  assert.equal(prompts, 0);
  assert.equal(p.buttons[0].textContent, "Web-App installieren");
  await p.buttons[0].events.get("click")();
  await p.buttons[1].events.get("click")();
  assert.equal(prompts, 1);
  p.events.get("appinstalled")();
  assert.equal(p.promo.hidden, true);
  assert.equal(page({ store: p.store }).promo.hidden, true);
});

test("blocked storage and rejected install do not break the offer", async () => {
  const p = page({ blocked: true });
  assert.equal(p.promo.hidden, false);
  p.events.get("beforeinstallprompt")({ preventDefault() {}, prompt: async () => { throw Error("failed"); } });
  await p.buttons[0].events.get("click")();
  assert.match(p.copies[0].textContent, /konnte nicht/);
  assert.equal(p.buttons[0].disabled, false);
  p.dismiss[0].events.get("click")(); assert.equal(p.promo.hidden, true);
});
