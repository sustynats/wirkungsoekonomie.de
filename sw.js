const CACHE_NAME = "woek-app-shell-20260628-community-auth";
const APP_SHELL = [
  "/app/",
  "/offline.html",
  "/manifest.webmanifest",
  "/assets/css/style.css",
  "/assets/js/main.js",
  "/assets/js/woek-community-auth-v2.js",
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

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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
    return (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match(fallbackUrl));
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
