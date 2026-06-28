const CACHE_NAME = "woek-app-shell-20260628";
const APP_SHELL = [
  "/app/",
  "/manifest.webmanifest",
  "/assets/css/style.css",
  "/assets/js/main.js",
  "/assets/js/woek-app.js",
  "/assets/img/brand/signet.svg",
  "/assets/img/brand/favicon.svg",
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
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .catch(() => undefined)
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response.ok || url.origin !== self.location.origin) {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => undefined);
        return response;
      });
    })
  );
});
