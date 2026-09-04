import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { selectContextualQuestions } from "../../assets/js/contextual-questions.js";

const app = fs.readFileSync("assets/js/news-pwa.js", "utf8");
const offer = app.slice(app.indexOf("  function initializePushOffer()"), app.indexOf("  async function toggleNotifications()"));
const notificationKey = "woek_ticker_notifications";
const tick = () => new Promise((resolve) => setImmediate(resolve));

function harness({ standalone = true, permission = "default", store = new Map(), registration = { pushManager: {} }, hidden = false, fails = false } = {}) {
  const dialogs = [];
  const events = new Map();
  let calls = 0;
  const context = {
    standalone, canRegisterServiceWorker: true, notificationKey,
    registrationPromise: Promise.resolve(registration),
    Notification: { permission }, notificationStatus: { textContent: "Push konnte nicht aktiviert werden." },
    window: {
      Notification: {}, PushManager: {}, HTMLDialogElement: {},
      localStorage: { getItem: (key) => store.get(key), setItem: (key, value) => store.set(key, value) },
    },
    document: {
      visibilityState: hidden ? "hidden" : "visible",
      addEventListener: (name, handler) => events.set(name, handler),
      removeEventListener: (name) => events.delete(name),
      body: { append: (dialog) => dialogs.push(dialog) },
      createElement: () => {
        const handlers = new Map();
        const controls = new Map();
        return {
          open: false, removed: false,
          setAttribute() {},
          querySelector(selector) {
            if (!controls.has(selector)) controls.set(selector, {
              addEventListener(name, handler) { this[name] = handler; }, textContent: "",
            });
            return controls.get(selector);
          },
          addEventListener: (name, handler) => handlers.set(name, handler),
          showModal() { this.open = true; },
          close() { this.open = false; handlers.get("close")?.(); },
          remove() { this.removed = true; },
        };
      },
    },
    toggleNotifications: async () => {
      calls += 1;
      if (fails) throw new Error("offline");
      store.set(notificationKey, "enabled");
    },
  };
  context.window.top = context.window.self = context.window;
  vm.runInNewContext(`${offer}\ninitializePushOffer();`, context);
  return { dialogs, store, context, calls: () => calls, show: () => {
    context.document.visibilityState = "visible";
    events.get("visibilitychange")?.();
  } };
}

test("first installed-app visit offers push without requesting consent until a click", async () => {
  const page = harness();
  await tick();
  assert.equal(page.dialogs.length, 1);
  assert.equal(page.calls(), 0);
  page.dialogs[0].querySelector("[data-push-offer-accept]").click();
  assert.equal(page.calls(), 1);
  await tick();
  assert.equal(page.dialogs[0].removed, true);
});

test("dismissing or closing the offer is remembered without activating push", async () => {
  const page = harness();
  await tick();
  page.dialogs[0].querySelector("[data-push-offer-dismiss]").click();
  assert.equal(page.calls(), 0);
  assert.equal(page.dialogs[0].removed, true);
  const revisit = harness({ store: page.store });
  await tick();
  assert.equal(revisit.dialogs.length, 0);
});

test("browser visits, existing decisions and unavailable workers never show the offer", async () => {
  for (const options of [
    { standalone: false }, { permission: "denied" }, { permission: "granted" },
    { registration: null }, { registration: {} },
    { store: new Map([[notificationKey, "disabled"]]) },
    { store: new Map([[notificationKey, "enabled"]]) },
  ]) {
    const page = harness(options);
    await tick();
    assert.equal(page.dialogs.length, 0);
    assert.equal(page.calls(), 0);
  }
});

test("offer waits until the app is visible and does not return on later visibility events", async () => {
  const page = harness({ hidden: true });
  await tick();
  assert.equal(page.dialogs.length, 0);
  page.show();
  page.show();
  assert.equal(page.dialogs.length, 1);
});

test("connection errors stay visible in the dismissible offer", async () => {
  const page = harness({ fails: true });
  await tick();
  page.dialogs[0].querySelector("[data-push-offer-accept]").click();
  await tick();
  assert.equal(page.dialogs[0].open, true);
  assert.equal(page.dialogs[0].querySelector("[data-push-offer-accept]").disabled, false);
  assert.match(page.dialogs[0].querySelector("[data-push-offer-status]").textContent, /später/);
  assert.notEqual(page.store.get(notificationKey), "enabled");
});

test("generic glossary questions are absent only from Wirkungsticker routes", () => {
  for (const path of ["/wirkungsticker", "/wirkungsticker/", "/wirkungsticker/story/", "/wirkungsticker/story/index.html", "/wirkungsticker/quellen/rbb/"]) {
    const result = selectContextualQuestions({ path, title: "Energiewende und Gesundheit", override: [{ label: "Eine Frage", href: "/fragen/" }] });
    assert.equal(result.length, 0);
  }
  const glossary = selectContextualQuestions({ path: "/begriffe/energiewende/", title: "Energiewende" });
  assert.ok(glossary.length > 0);
  assert.ok(selectContextualQuestions({ path: "/news/" }).length > 0);
});
