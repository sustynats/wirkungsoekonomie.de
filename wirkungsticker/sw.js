const CACHE_NAME = "woek-wirkungsticker-shell-20260903-9";
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
  "/assets/js/news-share.js",
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
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith("/wirkungsticker/")) return;
  if (url.pathname === "/wirkungsticker/feed.json") {
    event.respondWith(networkFirst(request));
    return;
  }
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) || (await cache.match("/wirkungsticker/offline.html"));
  }
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
