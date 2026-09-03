self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith("woek-news-"))
      .map((key) => caches.delete(key)));
    await self.registration.unregister();
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    windows.forEach((client) => client.navigate(client.url));
  })());
});
