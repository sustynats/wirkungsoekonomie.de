const CACHE_NAME = "woek-news-shell-20260903-1";
const APP_SHELL = [
  "/news/",
  "/news/offline.html",
  "/news/manifest.webmanifest",
  "/assets/css/style.css",
  "/assets/css/site-updates.css",
  "/assets/js/main.js",
  "/assets/js/site-updates.js",
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
    .filter((key) => key.startsWith("woek-news-shell-") && key !== CACHE_NAME)
    .map((key) => caches.delete(key)))).catch(() => undefined));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith("/news/")) return;
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
    return (await cache.match(request, { ignoreSearch: true })) || (await cache.match("/news/offline.html"));
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
