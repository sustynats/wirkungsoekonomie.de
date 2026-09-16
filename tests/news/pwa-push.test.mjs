import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

test("new badges distinguish a first visit, recent unseen news and historical backfill", () => {
  const app=fs.readFileSync("assets/js/news-pwa.js","utf8");
  const code=app.slice(app.indexOf("  function newestCardTimestamp("),app.indexOf("  async function initializeNotifications("));
  const now=Date.parse('2026-09-12T15:00:00Z');
  class Clock extends Date {static now(){return now;}}
  for(const stored of [null,'invalid','2026-09-08T00:00:00Z']) {
    const data=new Map(stored===null?[]:[['seen',stored]]),badges=[];
    const cards=[['2026-09-09T10:00:00Z',false],['2026-09-12T14:00:00Z',false],['2026-09-12T13:00:00Z',true]].map(([date,late])=>{
      const badge={hidden:false};return {dataset:{newsUpdatedAt:date,newsLateDelivery:String(late)},badge,querySelector:()=>badge};
    });
    const markReadButton={hidden:false};
    const context={Date:Clock,cards,lastSeenKey:'seen',markReadButton,updateAppBadge:n=>badges.push(n),window:{localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}}};
    vm.runInNewContext(`${code}\ninitializeNewsState()`,context);
    const returning=stored==='2026-09-08T00:00:00Z';
    assert.deepEqual(cards.map(c=>!c.badge.hidden),[false,returning,false]);
    assert.equal(badges.at(-1),returning?1:0);
    assert.equal(markReadButton.hidden,!returning);
    if(!returning)assert.equal(data.get('seen'),'2026-09-12T14:00:00.000Z');
  }
});

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

test("release notifier uses deployed news identity, not an overtaking import report", () => {
  const notifier = fs.readFileSync("scripts/news/publish-push.mjs", "utf8");
  assert.doesNotMatch(notifier, /report\.public_changed|wirkungsticker-latest-run\.json/);
  assert.match(notifier, /publicationId: `\$\{item\.id\}@\$\{modified\}`/);
  assert.match(notifier, /WOEK_NEWS_PUSH_ADMIN_TOKEN/);
});

test("manual refresh loads image-only releases, but offline keeps the current page", async () => {
  const app=fs.readFileSync("assets/js/news-pwa.js","utf8");
  const code=app.slice(app.indexOf("  async function checkForNews("),app.indexOf("  async function markNewsAsSeen("));
  for(const offline of [false,true]) {
    let reloads=0,updates=0;
    const context={Date,cards:[{}],latestFeedTimestamp:0,autoReloadKey:"reload",newestCardTimestamp:()=>0,registrationPromise:Promise.resolve({update:async()=>{updates++;}}),refreshStatus:{textContent:""},document:{visibilityState:"visible",querySelector:()=>null},window:{sessionStorage:{getItem:()=>String(Date.now()),setItem(){}},location:{reload(){reloads++;}}},fetch:async()=>{if(offline)throw new Error("offline");return {ok:true,json:async()=>({items:[]})};}};
    Object.assign(context, { AbortController, navigator: {}, reloadStarted: false });
    Object.assign(context.window, { setTimeout, clearTimeout });
    const result=await vm.runInNewContext(`${code}\ncheckForNews({manual:true})`,context);
    assert.equal(updates,1);assert.equal(reloads,offline?0:1);assert.equal(result,offline?null:true);
  }
});

test("archival revisions refresh automatically without inventing a news timestamp or badge", async () => {
  const app=fs.readFileSync("assets/js/news-pwa.js","utf8");
  const code=app.slice(app.indexOf("  async function checkForNews("),app.indexOf("  async function markNewsAsSeen("));
  for(const changed of [false,true]) {
    let reloads=0;const badges=[];
    const context={Date,cards:[{}],latestFeedTimestamp:0,autoReloadKey:"reload",lastSeenKey:"seen",lastNotifiedKey:"notified",newestCardTimestamp:()=>0,registrationPromise:Promise.resolve(null),refreshStatus:{textContent:""},updateAppBadge:async(count)=>badges.push(count),document:{visibilityState:"visible",querySelector:()=>({content:"files1:old"})},window:{sessionStorage:{getItem:()=>"0",setItem(){}},localStorage:{getItem:()=>"2026-09-04"},location:{reload(){reloads++;}}},fetch:async()=>({ok:true,json:async()=>({items:[],_woek_revision:changed?"files1:new":"files1:old"})})};
    Object.assign(context, { AbortController, navigator: {}, reloadStarted: false });
    Object.assign(context.window, { setTimeout, clearTimeout });
    const result=await vm.runInNewContext(`${code}\ncheckForNews()`,context);
    assert.equal(result,changed);
    assert.equal(reloads,changed?1:0);
    assert.equal(context.latestFeedTimestamp,0);
    assert.ok(badges.every(count=>count===0));
  }
});

test('a later feed refresh cannot revive old badges or invent unread news on first use',async()=>{
 const app=fs.readFileSync('assets/js/news-pwa.js','utf8');
 const code=app.slice(app.indexOf('  async function checkForNews('),app.indexOf('  async function markNewsAsSeen('));
 const now=Date.parse('2026-09-12T15:00:00Z');class Clock extends Date{static now(){return now;}}
 const feed={items:[{date_modified:'2026-09-09T12:00:00Z'},{date_modified:'2026-09-12T14:00:00Z'},{date_modified:'2026-09-12T13:00:00Z',_woek_late_delivery:true},{date_modified:'2026-09-13T14:00:00Z'},{date_modified:'invalid'},{}]};
 for(const stored of [null,'invalid','2026-09-08T00:00:00Z']){
  const data=new Map(stored===null?[]:[['seen',stored]]),badges=[],notifications=[];
  const context={Date:Clock,AbortController,navigator:{},cards:[],reloadStarted:false,latestFeedTimestamp:0,autoReloadKey:'reload',lastSeenKey:'seen',lastNotifiedKey:'notified',notificationTag:'news',newestCardTimestamp:()=>0,
   document:{visibilityState:'hidden',querySelector:()=>null},refreshStatus:{textContent:''},updateAppBadge:async n=>badges.push(n),registrationPromise:Promise.resolve({showNotification:async(...args)=>notifications.push(args)}),
   window:{setTimeout,clearTimeout,sessionStorage:{getItem:()=>null,setItem(){}},localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},location:{reload(){throw Error('Unexpected reload');}}},fetch:async()=>({ok:true,json:async()=>feed})};
  await vm.runInNewContext(`${code}\ncheckForNews()`,context);
  const returning=stored==='2026-09-08T00:00:00Z';assert.equal(badges.at(-1),returning?1:0);assert.equal(notifications.length,returning?1:0);
  if(!returning)assert.equal(data.get('seen'),'2026-09-12T14:00:00.000Z');
  await vm.runInNewContext('checkForNews()',context);assert.equal(notifications.length,returning?1:0);
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

// 16.09., Natalie: „die Zahl nimmt zu aber nicht ab, wenn ich gelesen habe"
// (Stand 60). Gesenkt hat die Zahl bisher ausschliesslich der Knopf „Als
// gelesen markieren". Wer die Liste offen vor sich hat, hat hingesehen.
test('die Liste offen vor sich zu haben senkt die Zahl am App-Symbol', async () => {
  const app = fs.readFileSync("assets/js/news-pwa.js", "utf8");
  const code = app.slice(app.indexOf("  const SEEN_DWELL_MS"), app.indexOf("  function initializeNewsState("));
  const badges = [], seen = new Map(), posted = [];
  let timer = null;
  const cards = [{ dataset: { newsUpdatedAt: '2026-09-16T18:00:00Z' }, querySelector: () => ({ hidden: false }) }];
  const context = { cards, badges, seen, posted,
    document: { visibilityState: 'visible', addEventListener: (name, cb) => { context.onVisibility = cb; } },
    window: { setTimeout: (cb) => { timer = cb; return 1; }, clearTimeout: () => { timer = null; },
      localStorage: { getItem: (k) => seen.get(k) ?? null, setItem: (k, v) => seen.set(k, v) } },
    lastSeenKey: 'seen', lastNotifiedKey: 'notified', markReadButton: { hidden: false },
    latestFeedTimestamp: Date.parse('2026-09-16T19:00:00Z'),
    registrationPromise: Promise.resolve({ active: { postMessage: (m) => posted.push(m) } }),
    updateAppBadge: async (n) => { badges.push(n); },
  };
  vm.runInNewContext(`${code}
  function newestCardTimestamp(){return cards.reduce((a,c)=>Math.max(a,Date.parse(c.dataset.newsUpdatedAt)),0);}
  async function acknowledgeVisibleNews({hideMarkers=false,includeFeed=false}={}){
    const newest=includeFeed?Math.max(newestCardTimestamp(),latestFeedTimestamp):newestCardTimestamp();
    if(newest){const v=new Date(newest).toISOString();window.localStorage.setItem(lastSeenKey,v);window.localStorage.setItem(lastNotifiedKey,v);
      const r=await registrationPromise;r?.active?.postMessage({type:'NEWS_MARK_SEEN',latest:v});}
    if(markReadButton)markReadButton.hidden=true;await updateAppBadge(0);}
  initializeSeenOnRead()`, context);

  assert.deepEqual(badges, [], 'nicht sofort: ein Durchblättern zaehlt nicht als gelesen');
  assert.ok(timer, 'die Bestaetigung wartet eine kurze Verweildauer ab');
  timer();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(badges, [0], 'danach steht die Zahl auf null');
  assert.equal(seen.get('seen'), '2026-09-16T18:00:00.000Z', 'der Lesestand reicht bis zur neuesten gerenderten Karte');
  assert.notEqual(seen.get('seen'), '2026-09-16T19:00:00.000Z', 'nicht bis zu einer Meldung, die diese Seite nie gezeigt hat');
  // Aus dem VM-Realm, deshalb Feld fuer Feld statt deepEqual (fremder Prototyp).
  assert.equal(posted.length, 1, 'der Service Worker erfaehrt es, sonst hebt er die Zahl wieder');
  assert.equal(posted[0].type, 'NEWS_MARK_SEEN');
  assert.equal(posted[0].latest, '2026-09-16T18:00:00.000Z');
});

test('ohne Karten oder im Hintergrund wird nichts als gelesen gewertet', () => {
  const app = fs.readFileSync("assets/js/news-pwa.js", "utf8");
  const code = app.slice(app.indexOf("  const SEEN_DWELL_MS"), app.indexOf("  function initializeNewsState("));
  for (const [label, cards, visibility] of [['ohne Karten', [], 'visible'], ['im Hintergrund', [{}], 'hidden']]) {
    let timer = null;
    const badges = [];
    const context = { cards, document: { visibilityState: visibility, addEventListener() {} },
      window: { setTimeout: (cb) => { timer = cb; return 1; }, clearTimeout() {} },
      updateAppBadge: async (n) => { badges.push(n); }, acknowledgeVisibleNews: async () => { badges.push('quittiert'); } };
    vm.runInNewContext(`${code}\ninitializeSeenOnRead()`, context);
    assert.equal(timer, null, `${label}: keine Bestaetigung geplant`);
    assert.deepEqual(badges, [], `${label}: die Zahl bleibt unberuehrt`);
  }
});

// Der Hintergrundlauf darf die Zahl nicht wieder heben, waehrend die Liste offen
// ist - und er schreibt den Lesestand nicht selbst.
test('der Hintergrundlauf hebt die Zahl nicht, wenn die Liste offen ist', () => {
  const app = fs.readFileSync("assets/js/news-pwa.js", "utf8");
  assert.match(app, /const watching = document\.visibilityState === "visible" && cards\.length > 0;/);
  assert.match(app, /await updateAppBadge\(watching \? 0 : updates\.length\);/);
  const check = app.slice(app.indexOf("  async function checkForNews("), app.indexOf("  async function markNewsAsSeen("));
  assert.ok(!/acknowledgeVisibleNews\(\s*\{/.test(check), 'der Hintergrundlauf schreibt keinen Lesestand mit Feed-Grenze');
});
