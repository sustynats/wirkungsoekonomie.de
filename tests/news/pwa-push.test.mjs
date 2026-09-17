import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

// 17.09.2026: Zahl und Banner haengen an der Herausgabezeit, nicht an der
// Ereigniszeit. Vorher war eine Meldung, die wir mehr als eine Stunde nach dem
// Ereignis herausgaben, ein "Nachtrag" und wurde von Zahl und Banner
// ausgeschlossen. Bei der tatsaechlichen Laufzeit der Produktion traf das fast
// jede Meldung: Natalies App-Symbol stand auf Null, obwohl stuendlich
// Meldungen live gingen. Die Chronologie der Liste bleibt die Ereigniszeit.
test("new badges distinguish a first visit, recent unseen news and historical backfill", () => {
  const app=fs.readFileSync("assets/js/news-pwa.js","utf8");
  const code=app.slice(app.indexOf("  function newestCardTimestamp("),app.indexOf("  async function initializeNotifications("));
  const now=Date.parse('2026-09-12T15:00:00Z');
  class Clock extends Date {static now(){return now;}}
  for(const stored of [null,'invalid','2026-09-08T00:00:00Z']) {
    const data=new Map(stored===null?[]:[['seen',stored]]),badges=[];
    // [Ereigniszeit, Herausgabezeit, Nachtrag]
    const cards=[
      ['2026-09-09T10:00:00Z','2026-09-09T10:30:00Z',false], // laengst herausgegeben
      ['2026-09-12T14:00:00Z','2026-09-12T14:05:00Z',false], // frisch
      ['2026-09-10T13:00:00Z','2026-09-12T13:30:00Z',true],  // Nachtrag: jetzt herausgegeben
    ].map(([date,released,late])=>{
      const badge={hidden:false};
      return {dataset:{newsUpdatedAt:date,newsReleasedAt:released,newsLateDelivery:String(late)},badge,querySelector:()=>badge};
    });
    const markReadButton={hidden:false};
    const context={Date:Clock,cards,lastSeenKey:'seen',markReadButton,updateAppBadge:n=>badges.push(n),window:{localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}}};
    vm.runInNewContext(`${code}\ninitializeNewsState()`,context);
    const returning=stored==='2026-09-08T00:00:00Z';
    // Der Nachtrag zaehlt jetzt mit: er ist gerade herausgegeben worden.
    assert.deepEqual(cards.map(c=>!c.badge.hidden),[false,returning,returning]);
    assert.equal(badges.at(-1),returning?2:0);
    assert.equal(markReadButton.hidden,!returning);
    if(!returning)assert.equal(data.get('seen'),'2026-09-12T14:05:00.000Z');
  }
});

// Ohne data-news-released-at (aeltere, noch zwischengespeicherte Seite) gilt
// weiter die Ereigniszeit: die App darf daran nicht verstummen.
test('ohne Herausgabezeit auf der Karte gilt die Ereigniszeit weiter', () => {
  const app=fs.readFileSync("assets/js/news-pwa.js","utf8");
  const code=app.slice(app.indexOf("  function newestCardTimestamp("),app.indexOf("  async function initializeNotifications("));
  const now=Date.parse('2026-09-12T15:00:00Z');
  class Clock extends Date {static now(){return now;}}
  const data=new Map([['seen','2026-09-08T00:00:00Z']]),badges=[];
  const cards=[['2026-09-12T14:00:00Z'],['2026-09-09T10:00:00Z']].map(([date])=>{
    const badge={hidden:false};return {dataset:{newsUpdatedAt:date},badge,querySelector:()=>badge};
  });
  vm.runInNewContext(`${code}\ninitializeNewsState()`,{Date:Clock,cards,lastSeenKey:'seen',markReadButton:{hidden:false},
    updateAppBadge:n=>badges.push(n),window:{localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}}});
  assert.equal(badges.at(-1),1);
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
 // Ereigniszeit ordnet, Herausgabezeit zaehlt. Der Nachtrag (Ereignis vom
 // 10.09., heute herausgegeben) ist neu; die Meldung von uebermorgen ist es nicht.
 const feed={items:[
  {date_modified:'2026-09-09T12:00:00Z',_woek_released_at:'2026-09-09T12:30:00Z'},
  {date_modified:'2026-09-12T14:00:00Z',_woek_released_at:'2026-09-12T14:00:00Z'},
  {date_modified:'2026-09-10T13:00:00Z',_woek_released_at:'2026-09-12T13:00:00Z',_woek_late_delivery:true},
  {date_modified:'2026-09-13T14:00:00Z',_woek_released_at:'2026-09-13T14:00:00Z'},
  {date_modified:'invalid'},{}]};
 for(const stored of [null,'invalid','2026-09-08T00:00:00Z']){
  const data=new Map(stored===null?[]:[['seen',stored]]),badges=[],notifications=[];
  const context={Date:Clock,AbortController,navigator:{},cards:[],reloadStarted:false,latestFeedTimestamp:0,autoReloadKey:'reload',lastSeenKey:'seen',lastNotifiedKey:'notified',notificationTag:'news',newestCardTimestamp:()=>0,
   document:{visibilityState:'hidden',querySelector:()=>null},refreshStatus:{textContent:''},updateAppBadge:async n=>badges.push(n),registrationPromise:Promise.resolve({showNotification:async(...args)=>notifications.push(args)}),
   window:{setTimeout,clearTimeout,sessionStorage:{getItem:()=>null,setItem(){}},localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},location:{reload(){throw Error('Unexpected reload');}}},fetch:async()=>({ok:true,json:async()=>feed})};
  await vm.runInNewContext(`${code}\ncheckForNews()`,context);
  const returning=stored==='2026-09-08T00:00:00Z';assert.equal(badges.at(-1),returning?2:0);assert.equal(notifications.length,returning?1:0);
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

function workerHarness({ offline = false, initialState = null } = {}) {
  let state = initialState || { enabled: true, lastKnown: "2026-09-03T18:00:00.000Z", unreadCount: 0 };
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

// 17.09.2026: Die Bestaetigung "gesehen beim Lesen" ist zurueckgenommen. Sie
// hatte bei Natalie Banner und Zahl vollstaendig verstummen lassen - vorher
// kamen beide trotz stummgeschalteter Glocke. Dieser Test haelt den
// wiederhergestellten Zustand fest, damit derselbe Eingriff nicht
// unbeabsichtigt zurueckkommt: der Lesestand wird ausschliesslich auf
// ausdrueckliche Handlung geschrieben, nie auf einem Zeitgeber.
test('der Lesestand wird nur auf ausdrueckliche Handlung geschrieben', () => {
  const app = fs.readFileSync("assets/js/news-pwa.js", "utf8");
  assert.ok(!app.includes('initializeSeenOnRead'), 'keine Bestaetigung beim blossen Ansehen');
  assert.ok(!app.includes('SEEN_DWELL_MS'), 'kein Zeitgeber, der den Lesestand vorrueckt');
  // acknowledgeVisibleNews darf nur aus dem Knopf und der Aktualisierung kommen.
  const aufrufe = [...app.matchAll(/acknowledgeVisibleNews\(/g)].length;
  assert.equal(aufrufe, 3, 'Definition, Knopf und Aktualisierung - kein vierter Aufruf');
  // Der Push-Weg bleibt unberuehrt: die Zahl kommt aus dem Hintergrundlauf.
  assert.match(app, /await updateAppBadge\(updates\.length\);/, 'der Hintergrundlauf setzt die Zahl wieder selbst');
  assert.ok(!app.includes('const watching'), 'und unterdrueckt sie nicht bei offener Liste');
});

// 17.09.2026: Der Feed ist nach Ereigniszeit sortiert. items[0] ist damit die
// Meldung mit dem jUengsten Ereignis, nicht die zuletzt herausgegebene. Von
// zwoelf Auslieferungen an diesem Morgen verwarf Oracle neun als Dublette,
// weil sich items[0] nicht geaendert hatte - Natalie bekam nichts.
test('die Push-Kennung kommt von der zuletzt herausgegebenen Meldung', async () => {
  const { publicationForFeed, newestRelease } = await import('../../scripts/news/publish-push.mjs');
  const aeltestesEreignisZuletztHerausgegeben = {
    id: 'https://wirkungsoekonomie.de/wirkungsticker/fed-leitzins/',
    url: 'https://wirkungsoekonomie.de/wirkungsticker/fed-leitzins/',
    title: 'US-Notenbank Fed erhöht Leitzins',
    date_published: '2026-09-16T18:02:17Z', date_modified: '2026-09-16T18:02:17Z',
    _woek_released_at: '2026-09-17T09:15:50Z',
  };
  const juengstesEreignis = {
    id: 'https://wirkungsoekonomie.de/wirkungsticker/explosionen-frankfurt/',
    url: 'https://wirkungsoekonomie.de/wirkungsticker/explosionen-frankfurt/',
    title: 'Erneute Explosionen in Frankfurt',
    date_published: '2026-09-17T08:10:15Z', date_modified: '2026-09-17T08:10:15Z',
    _woek_released_at: '2026-09-17T09:09:49Z',
  };
  // Feed-Reihenfolge: nach Ereigniszeit, also das jUengste Ereignis vorn.
  const feed = { items: [juengstesEreignis, aeltestesEreignisZuletztHerausgegeben] };
  assert.equal(newestRelease(feed.items), aeltestesEreignisZuletztHerausgegeben);
  const publication = publicationForFeed(feed);
  assert.equal(publication.publicationId, `${aeltestesEreignisZuletztHerausgegeben.id}@2026-09-17T09:15:50Z`);
  assert.equal(publication.url, aeltestesEreignisZuletztHerausgegeben.url);
  // Die Kennung muss sich unterscheiden, sonst verwirft Oracle den Versand.
  assert.notEqual(publication.publicationId, `${juengstesEreignis.id}@${juengstesEreignis.date_modified}`);
  // Aeltere Feeds ohne das Feld behalten das bisherige Verhalten.
  const alt = { items: [{ id: 'a', url: 'https://wirkungsoekonomie.de/wirkungsticker/a/', date_modified: '2026-09-17T08:10:15Z' }] };
  assert.equal(publicationForFeed(alt).publicationId, 'a@2026-09-17T08:10:15Z');
  assert.equal(publicationForFeed({ items: [] }), null);
});

// Der Feed muss die Herausgabezeit tatsaechlich mitliefern, sonst faellt die
// ganze Kette stillschweigend auf die Ereigniszeit zurueck.
test('der Feed-Bauer liefert die Herausgabezeit mit', () => {
  const build = fs.readFileSync('scripts/news/build.mjs', 'utf8');
  assert.match(build, /_woek_released_at: item\.released_at/);
  assert.equal([...build.matchAll(/_woek_released_at: item\.released_at/g)].length, 2, 'beide JSON-Feeds');
  assert.match(build, /released_at: story\.published_at/);
  assert.match(build, /data-news-released-at="\$\{escapeHtml\(story\.published_at \|\| ""\)\}"/);
});

// 17.09.2026, Natalie: „wir muessen schauen, dass die Push-Nachrichten kommen,
// die irgendwie aktuell nicht funktionieren." Der Worker behandelte den Push nur
// als Auslöser und entschied dann anhand seines eigenen Lesestands, ob er etwas
// anzeigt. Lag dieser Stand vorn - aus welchem Grund auch immer -, blieb es
// still, obwohl der Server gerade eine neue Veroeffentlichung gemeldet hatte.
// Der Server entdoppelt selbst ueber die Kennung; er wird nicht ueberstimmt.
test('ein Versand des Servers wird angezeigt, auch wenn der eigene Lesestand vorn liegt', async () => {
  const worker = workerHarness({ initialState: { enabled: true,
    lastKnown: "2026-09-03T18:00:00.000Z",
    lastReleased: "2026-09-30T00:00:00.000Z", // vorn: die eigene Rechnung findet nichts
    unreadCount: 0 } });
  const data = { json: () => ({ publicationId: "story-1@2026-09-03T19:00:00.000Z",
    title: "Neue Wirkungsnachricht",
    url: "https://wirkungsoekonomie.de/wirkungsticker/story-1/",
    publishedAt: "2026-09-03T19:00:00.000Z" }) };
  await worker.dispatch("push", data);
  assert.equal(worker.notifications.length, 1, 'der Versand des Servers wird angezeigt');
  assert.deepEqual(worker.badges, [1]);
  // Derselbe Versand zweimal zeigt nichts erneut.
  await worker.dispatch("push", data);
  assert.equal(worker.notifications.length, 1);
  assert.equal(worker.state().lastPushPublicationId, "story-1@2026-09-03T19:00:00.000Z");
});

// Ohne Kennung (periodicsync, kein Versand) bleibt es bei der eigenen Rechnung:
// ein Hintergrundlauf darf nicht aus dem Nichts eine Meldung erfinden.
test('ein Hintergrundlauf ohne Versand erfindet keine Benachrichtigung', async () => {
  const worker = workerHarness({ initialState: { enabled: true,
    lastKnown: "2026-09-03T18:00:00.000Z", lastReleased: "2026-09-30T00:00:00.000Z", unreadCount: 0 } });
  await worker.dispatch("push", { json: () => ({}) });
  assert.equal(worker.notifications.length, 0);
});
