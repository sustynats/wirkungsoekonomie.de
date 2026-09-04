import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

test("Wirkungsticker registers real Web Push and preserves the periodic fallback", () => {
  const app = fs.readFileSync("assets/js/news-pwa.js", "utf8");
  const worker = fs.readFileSync("wirkungsticker/sw.js", "utf8");
  assert.match(app, /pushManager\.subscribe/);
  assert.match(app, /pushApiBase = .*\/api\/news-push/);
  assert.match(app, /`\$\{pushApiBase\}\/subscribe`/);
  assert.match(app, /`\$\{pushApiBase\}\/unsubscribe`/);
  assert.match(worker, /addEventListener\("push"/);
  assert.match(worker, /addEventListener\("periodicsync"/);
  assert.match(worker, /setAppBadge/);
  assert.match(worker, /clearAppBadge/);
});

test("release notifier is gated by a public change and uses an idempotent publication id", () => {
  const notifier = fs.readFileSync("scripts/news/publish-push.mjs", "utf8");
  assert.match(notifier, /report\.public_changed !== true/);
  assert.match(notifier, /publicationId: `\$\{item\.id\}@\$\{modified\}`/);
  assert.match(notifier, /WOEK_NEWS_PUSH_ADMIN_TOKEN/);
});

test("manual refresh loads image-only releases, but offline keeps the current page", async () => {
  const app=fs.readFileSync("assets/js/news-pwa.js","utf8");
  const code=app.slice(app.indexOf("  async function checkForNews("),app.indexOf("  async function markNewsAsSeen("));
  for(const offline of [false,true]) {
    let reloads=0,updates=0;
    const context={Date,cards:[{}],latestFeedTimestamp:0,autoReloadKey:"reload",newestCardTimestamp:()=>0,registrationPromise:Promise.resolve({update:async()=>{updates++;}}),refreshStatus:{textContent:""},document:{visibilityState:"visible"},window:{sessionStorage:{getItem:()=>String(Date.now()),setItem(){}},location:{reload(){reloads++;}}},fetch:async()=>{if(offline)throw new Error("offline");return {ok:true,json:async()=>({items:[]})};}};
    const result=await vm.runInNewContext(`${code}\ncheckForNews({manual:true})`,context);
    assert.equal(updates,1);assert.equal(reloads,offline?0:1);assert.equal(result,offline?null:true);
  }
});

test("ticker push job runs after a successful deploy despite skipped release-assets", () => {
  const workflow = fs.readFileSync(".github/workflows/deploy.yml", "utf8");
  const notificationJob = workflow.split("  notify-ticker:")[1];
  assert.ok(notificationJob);
  assert.match(notificationJob, /if: always\(\) && needs\.build\.outputs\.ticker_only == 'true' && needs\.deploy\.result == 'success'/);
});

function workerHarness({ offline = false } = {}) {
  let state = { enabled: true, lastKnown: "2026-09-03T18:00:00.000Z", unreadCount: 0 };
  const handlers = new Map();
  const notifications = [];
  const badges = [];
  const cache = {
    match: async () => new Response(JSON.stringify(state)),
    put: async (_key, response) => { state = await response.json(); },
  };
  const context = {
    Response, URL, Date,
    caches: { open: async () => cache },
    fetch: async () => {
      if (offline) throw new Error("offline");
      return new Response(JSON.stringify({ items: [{
        id: "story-1", url: "https://wirkungsoekonomie.de/wirkungsticker/story-1/",
        date_modified: "2026-09-03T19:00:00.000Z",
      }] }));
    },
    self: {
      addEventListener: (name, handler) => handlers.set(name, handler),
      registration: {
        showNotification: async (title, options) => notifications.push({ title, ...options }),
        getNotifications: async () => [],
      },
      navigator: {
        setAppBadge: async (count) => badges.push(count),
        clearAppBadge: async () => badges.push(0),
      },
    },
  };
  vm.runInNewContext(fs.readFileSync("wirkungsticker/sw.js", "utf8"), context);
  return {
    notifications, badges, state: () => state,
    async dispatch(name, data) {
      let pending;
      handlers.get(name)({ data, waitUntil: (promise) => { pending = promise; } });
      await pending;
    },
  };
}

test("push counts new stories once and opening the app clears the badge", async () => {
  const worker = workerHarness();
  const data = { json: () => ({ publicationId: "story-1@19", publishedAt: "2026-09-03T19:00:00.000Z" }) };
  await worker.dispatch("push", data);
  await worker.dispatch("push", data);
  assert.equal(worker.notifications.length, 1);
  assert.deepEqual(worker.badges, [1]);
  assert.equal(worker.state().unreadCount, 1);
  await worker.dispatch("message", { type: "NEWS_MARK_SEEN", latest: "2026-09-03T19:00:00.000Z" });
  assert.equal(worker.state().unreadCount, 0);
  assert.deepEqual(worker.badges, [1, 0]);
});

test("offline push fallback is idempotent and disabling suppresses future notifications", async () => {
  const worker = workerHarness({ offline: true });
  const data = { json: () => ({
    publicationId: "story-1@19", title: "Neue Meldung",
    url: "https://wirkungsoekonomie.de/wirkungsticker/story-1/",
    publishedAt: "2026-09-03T19:00:00.000Z",
  }) };
  await worker.dispatch("push", data);
  await worker.dispatch("push", data);
  assert.equal(worker.notifications.length, 1);
  assert.equal(worker.state().lastKnown, "2026-09-03T19:00:00.000Z");
  await worker.dispatch("message", { type: "NEWS_NOTIFICATIONS_DISABLE" });
  await worker.dispatch("push", { json: () => ({ publicationId: "story-2@20" }) });
  assert.equal(worker.notifications.length, 1);
  assert.equal(worker.state().enabled, false);
});
