const CACHE_NAME = "woek-wirkungsticker-shell-20260911-chronological2";
// Keep the independent notification state while refreshing the app shell.
const NAVIGATION_CACHE_GRACE_MS = 2500;
const NAVIGATION_NETWORK_TIMEOUT_MS = 8000;
const CACHE_LOOKUP_TIMEOUT_MS = 1000;
const NEWS_STATE_CACHE = "woek-wirkungsticker-notification-state-v1";
const NEWS_STATE_URL = "/wirkungsticker/.notification-state";
const NEWS_NOTIFICATION_TAG = "woek-wirkungsticker-updates";
const APP_SHELL = [
  "/wirkungsticker/",
  "/wirkungsticker/offline.html",
  "/wirkungsticker/manifest.webmanifest",
  "/wirkungsticker/feed.json",
  "/assets/css/style.css",
  "/assets/css/news.css",
  "/assets/js/main.js",
  "/assets/js/news.js",
  "/assets/js/news-pwa.js",
  "/assets/js/news-install.js",
  "/assets/js/news-share.js",
  "/assets/js/news-navigation.js",
  "/assets/img/brand/favicon.svg",
  "/assets/img/brand/apple-touch-icon.png",
  "/assets/img/brand/app-icon-192.png",
  "/assets/img/brand/app-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith("woek-wirkungsticker-shell-") && key !== CACHE_NAME)
    .map((key) => caches.delete(key)))).catch(() => undefined));
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data?.type === "NEWS_NOTIFICATIONS_ENABLE") {
    event.waitUntil(writeNewsState({ enabled: true, lastKnown: event.data.latest || null, unreadCount: 0 }));
  } else if (event.data?.type === "NEWS_NOTIFICATIONS_DISABLE") {
    event.waitUntil(disableNewsNotifications());
  } else if (event.data?.type === "NEWS_MARK_SEEN") {
    event.waitUntil(updateNewsLastKnown(event.data.latest || null));
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === NEWS_NOTIFICATION_TAG) event.waitUntil(checkForNewsUpdates());
});

self.addEventListener("push", (event) => {
  let publication = {};
  try {
    publication = event.data?.json?.() || {};
  } catch {
    publication = {};
  }
  event.waitUntil(checkForNewsUpdates(publication));
});

self.addEventListener("notificationclick", (event) => {
  if (event.notification.tag !== NEWS_NOTIFICATION_TAG) return;
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/wirkungsticker/?source=notification";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windows) => {
    const existing = windows.find((client) => new URL(client.url).pathname.startsWith("/wirkungsticker/"));
    if (existing) {
      await existing.focus();
      return existing.navigate(targetUrl);
    }
    return clients.openWindow(targetUrl);
  }));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Controlled article pages also request essential assets outside the worker
  // URL scope. Do not leave their CSS/scripts hanging after HTML fell back.
  const readerAsset = url.pathname.startsWith("/assets/")
    && (APP_SHELL.includes(url.pathname) || ["style", "script", "font"].includes(request.destination));
  if (readerAsset) {
    event.respondWith(networkFirst(request, event, { asset: true }));
    return;
  }
  if (!url.pathname.startsWith("/wirkungsticker/")) return;
  if (url.pathname === "/wirkungsticker/feed.json") {
    // A freshness probe must never mistake the offline cache for a live reply.
    if (url.searchParams.has("check")) {
      event.respondWith(fetch(request, { cache: "no-store" }));
      return;
    }
    event.respondWith(networkFirst(request, event));
    return;
  }
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request, event));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});

function boundedCache(operation, milliseconds = CACHE_LOOKUP_TIMEOUT_MS) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), milliseconds);
    Promise.resolve().then(operation).then(value => { clearTimeout(timer); resolve(value); }, () => { clearTimeout(timer); resolve(null); });
  });
}

function unavailableNavigation() {
  return new Response(`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Wirkungsticker – Verbindung prüfen</title><body><main><h1>Die Seite konnte gerade nicht geladen werden.</h1><p>Die Verbindung ist unterbrochen oder dauert zu lange. Es liegt noch keine gespeicherte Fassung dieser Seite vor.</p><p><a href="">Diese Seite erneut laden</a> · <a href="/wirkungsticker/">Zum Wirkungsticker</a></p></main></body></html>`, { status: 503, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

async function networkFirst(request, event, { asset = false } = {}) {
  // Fetch immediately. Storage access and cloning/writing the complete body
  // must never delay a usable network response or discard it on quota errors.
  const cache = boundedCache(() => caches.open(CACHE_NAME));
  const cached = boundedCache(async () => (await cache)?.match(request, { ignoreSearch: true }));
  // Exact revisioned assets may render immediately. A different cached query
  // version is only a fallback after the live request stalls or fails.
  const exactCached = asset ? boundedCache(async () => (await cache)?.match(request)) : null;
  const controller = new AbortController();
  let deadlineTimer, graceTimer;
  const deadline = new Promise(resolve => {
    deadlineTimer = setTimeout(() => { controller.abort(); resolve(null); }, NAVIGATION_NETWORK_TIMEOUT_MS);
  });
  const network = Promise.race([
    Promise.resolve().then(() => fetch(request, { cache: asset ? "default" : "no-store", signal: controller.signal })).catch(() => null), deadline,
  ]).then(response => { clearTimeout(deadlineTimer); return response; });
  const store = network.then(response => {
    if (!response?.ok) return;
    const copy = response.clone();
    return boundedCache(async () => (await cache)?.put(request, copy), 5000);
  }).catch(() => undefined);
  // If cached content wins, still refresh it in the background, within bounds.
  event?.waitUntil(store);
  const liveOrFallback = network.then(async response => {
    if (response && response.status < 500) return response;
    if (asset) return (await cached) || response || new Response("", { status: 504, statusText: "Asset unavailable" });
    return (await cached) || response
      || (await boundedCache(async () => (await cache)?.match("/wirkungsticker/offline.html")))
      || unavailableNavigation();
  });
  const cachedAfterGrace = new Promise(resolve => {
    graceTimer = setTimeout(() => { void cached.then(response => { if (response) resolve(response); }); }, NAVIGATION_CACHE_GRACE_MS);
  });
  const candidates = [liveOrFallback, cachedAfterGrace];
  if (exactCached) candidates.push(exactCached.then(response => response || new Promise(() => {})));
  const response = await Promise.race(candidates);
  clearTimeout(graceTimer);
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  const update = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone()).catch(() => undefined);
    return response;
  }).catch(() => undefined);
  return cached || (await update) || new Response("", { status: 504, statusText: "Offline" });
}

async function readNewsState() {
  const cache = await caches.open(NEWS_STATE_CACHE);
  const response = await cache.match(NEWS_STATE_URL);
  return response ? response.json().catch(() => ({})) : {};
}

async function writeNewsState(state) {
  const cache = await caches.open(NEWS_STATE_CACHE);
  await cache.put(NEWS_STATE_URL, new Response(JSON.stringify(state), { headers: { "content-type": "application/json" } }));
}

async function updateNewsLastKnown(latest) {
  const state = await readNewsState();
  await writeNewsState({ ...state, lastKnown: latest, unreadCount: 0 });
  const notifications = await self.registration.getNotifications({ tag: NEWS_NOTIFICATION_TAG }).catch(() => []);
  notifications.forEach((notification) => notification.close());
  if ("clearAppBadge" in self.navigator) await self.navigator.clearAppBadge().catch(() => undefined);
}

async function disableNewsNotifications() {
  await writeNewsState({ enabled: false, lastKnown: null, unreadCount: 0 });
  const notifications = await self.registration.getNotifications({ tag: NEWS_NOTIFICATION_TAG }).catch(() => []);
  notifications.forEach((notification) => notification.close());
  if ("clearAppBadge" in self.navigator) await self.navigator.clearAppBadge().catch(() => undefined);
}

async function checkForNewsUpdates(fallbackPublication = {}) {
  const state = await readNewsState();
  if (!state.enabled) return;
  let feed;
  try {
    const response = await fetch(`/wirkungsticker/feed.json?check=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("NEWS_FEED_UNAVAILABLE");
    feed = await response.json();
  } catch {
    await showFallbackPush(state, fallbackPublication);
    return;
  }
  const previous = Date.parse(state.lastKnown || 0);
  const unreadCount = Math.max(0, Number(state.unreadCount) || 0);
  const updates = (feed.items || []).filter((item) => Date.parse(item.date_modified || item.date_published || 0) > previous);
  const latest = (feed.items || []).reduce((value, item) => Math.max(value, Date.parse(item.date_modified || item.date_published || 0)), 0);
  if (!previous) {
    await writeNewsState({ enabled: true, lastKnown: latest ? new Date(latest).toISOString() : null, unreadCount: 0 });
    return;
  }
  if (!updates.length) return;
  const totalUnread = unreadCount + updates.length;
  const targetUrl = updates.length === 1 && updates[0]?.url
    ? new URL(updates[0].url).pathname
    : "/wirkungsticker/?source=notification";
  await showNewsNotification(totalUnread, targetUrl);
  await writeNewsState({
    enabled: true,
    lastKnown: latest ? new Date(latest).toISOString() : state.lastKnown,
    unreadCount: totalUnread,
    lastPushPublicationId: fallbackPublication.publicationId || state.lastPushPublicationId || null,
  });
}

async function showFallbackPush(state, publication) {
  if (!publication?.publicationId || publication.publicationId === state.lastPushPublicationId) return;
  const totalUnread = Math.max(0, Number(state.unreadCount) || 0) + 1;
  const targetUrl = typeof publication.url === "string" && publication.url.startsWith("https://wirkungsoekonomie.de/wirkungsticker/")
    ? new URL(publication.url).pathname
    : "/wirkungsticker/?source=notification";
  await showNewsNotification(totalUnread, targetUrl, publication.title);
  const publishedAt = Date.parse(publication.publishedAt || 0);
  const previous = Date.parse(state.lastKnown || 0);
  await writeNewsState({
    ...state,
    lastKnown: Number.isFinite(publishedAt)
      ? new Date(Math.max(publishedAt, Number.isFinite(previous) ? previous : 0)).toISOString()
      : state.lastKnown,
    unreadCount: totalUnread,
    lastPushPublicationId: publication.publicationId,
  });
}

async function showNewsNotification(totalUnread, targetUrl, title = "") {
  await self.registration.showNotification("Neue Wirkungsnachricht", {
    body: title || `${totalUnread} ${totalUnread === 1 ? "ungelesene Wirkungsnachricht ist" : "ungelesene Wirkungsnachrichten sind"} verfügbar.`,
    icon: "/assets/img/brand/app-icon-192.png",
    badge: "/assets/img/brand/app-icon-192.png",
    tag: NEWS_NOTIFICATION_TAG,
    renotify: true,
    data: { url: targetUrl },
  });
  if ("setAppBadge" in self.navigator) await self.navigator.setAppBadge(totalUnread).catch(() => undefined);
}
