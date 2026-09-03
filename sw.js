const CACHE_NAME = "woek-app-shell-20260903-wirkungsticker";
const NEWS_STATE_CACHE = "woek-news-notification-state-v1";
const NEWS_STATE_URL = "/news/.notification-state";
const NEWS_NOTIFICATION_TAG = "woek-news-updates";
const APP_SHELL = [
  "/app/",
  "/news/",
  "/offline.html",
  "/manifest.webmanifest",
  "/news/manifest.webmanifest",
  "/news/feed.json",
  "/assets/css/style.css",
  "/assets/css/news.css",
  "/assets/js/main.js",
  "/assets/js/news.js",
  "/assets/js/news-pwa.js",
  "/assets/js/woek-community-auth-v2.js",
  "/assets/js/woek-app.js",
  "/assets/img/brand/signet.svg",
  "/assets/img/brand/favicon.svg",
  "/assets/img/brand/apple-touch-icon.png",
  "/assets/img/brand/app-icon-192.png",
  "/assets/img/brand/app-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys
        .filter((key) => ![CACHE_NAME, NEWS_STATE_CACHE].includes(key) && !key.startsWith("woek-news-shell-"))
        .map((key) => caches.delete(key))))
      .catch(() => undefined)
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data?.type === "NEWS_NOTIFICATIONS_ENABLE") {
    event.waitUntil(writeNewsState({ enabled: true, lastKnown: event.data.latest || null }));
  } else if (event.data?.type === "NEWS_NOTIFICATIONS_DISABLE") {
    event.waitUntil(disableNewsNotifications());
  } else if (event.data?.type === "NEWS_MARK_SEEN") {
    event.waitUntil(updateNewsLastKnown(event.data.latest || null));
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === NEWS_NOTIFICATION_TAG) event.waitUntil(checkForNewsUpdates());
});

self.addEventListener("notificationclick", (event) => {
  if (event.notification.tag !== NEWS_NOTIFICATION_TAG) return;
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/news/wirkungsticker/?source=notification";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windows) => {
    const existing = windows.find((client) => new URL(client.url).pathname.startsWith("/news/"));
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

  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request, "/offline.html"));
    return;
  }

  if (url.pathname === "/news/feed.json") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) ?? (fallbackUrl ? await cache.match(fallbackUrl) : undefined) ?? new Response("", { status: 504, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: !isVersionedAsset(request) });
  const update = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone()).catch(() => undefined);
      }
      return response;
    })
    .catch(() => undefined);

  return cached ?? (await update) ?? new Response("", { status: 504, statusText: "Offline" });
}

function isVersionedAsset(request) {
  const url = new URL(request.url);
  return url.searchParams.has("v") && /\.(?:css|js)$/i.test(url.pathname);
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
  await writeNewsState({ ...state, lastKnown: latest });
}

async function disableNewsNotifications() {
  await writeNewsState({ enabled: false, lastKnown: null });
  const notifications = await self.registration.getNotifications({ tag: NEWS_NOTIFICATION_TAG }).catch(() => []);
  notifications.forEach((notification) => notification.close());
  if ("clearAppBadge" in self.navigator) await self.navigator.clearAppBadge().catch(() => undefined);
}

async function checkForNewsUpdates() {
  const state = await readNewsState();
  if (!state.enabled) return;
  const response = await fetch(`/news/feed.json?check=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) return;
  const feed = await response.json();
  const previous = Date.parse(state.lastKnown || 0);
  const updates = (feed.items || []).filter((item) => Date.parse(item.date_modified || item.date_published || 0) > previous);
  const latest = (feed.items || []).reduce((value, item) => Math.max(value, Date.parse(item.date_modified || item.date_published || 0)), 0);
  if (!previous) {
    await writeNewsState({ enabled: true, lastKnown: latest ? new Date(latest).toISOString() : null });
    return;
  }
  if (!updates.length) return;
  await self.registration.showNotification("Neue Wirkungsnachrichten", {
    body: `${updates.length} ${updates.length === 1 ? "neue Wirkungsnachricht ist" : "neue Wirkungsnachrichten sind"} verfügbar.`,
    icon: "/assets/img/brand/app-icon-192.png",
    badge: "/assets/img/brand/app-icon-192.png",
    tag: NEWS_NOTIFICATION_TAG,
    data: { url: "/news/wirkungsticker/?source=notification" },
  });
  if ("setAppBadge" in self.navigator) await self.navigator.setAppBadge(updates.length).catch(() => undefined);
  await writeNewsState({ enabled: true, lastKnown: latest ? new Date(latest).toISOString() : state.lastKnown });
}
