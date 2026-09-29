// Shared discovery metadata; the existing news builder supplies published items.
export const RSS_SITE = "https://wirkungsoekonomie.de";
export const RSS_CHANNELS = Object.freeze({
  news: Object.freeze({
    title: "Wirkungsticker - News",
    label: "News per RSS abonnieren",
    description: "Aktuelle Nachrichten aus Politik, Wirtschaft, Gesellschaft, Technik und weiteren Ressorts. Analysen und Nachbesprechungen haben einen eigenen RSS-Feed.",
    path: "/wirkungsticker/feed.xml",
    home: "/wirkungsticker/news/",
  }),
  analyses: Object.freeze({
    title: "Wirkungsticker - Analysen und Nachbesprechungen",
    label: "Analysen per RSS abonnieren",
    description: "Persönlich kuratierte Beiträge von Natalie Weber: Meinung & Analyse, Nachgehört, Nachgesehen und Buch & Wirkung.",
    path: "/wirkungsticker/analyse/feed.xml",
    home: "/wirkungsticker/analysen/",
  }),
});

const xml = value => String(value ?? "").replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char]));

export function rssDiscoveryLinks() {
  return Object.values(RSS_CHANNELS).map(channel =>
    `<link rel="alternate" type="application/rss+xml" title="${xml(channel.title)}" href="${RSS_SITE}${channel.path}">`).join("\n  ");
}

export function renderRssFeed(items, channel) {
  // An unrelated news run must not advance the analyses channel timestamp.
  const dates = items.flatMap(item => [Date.parse(item.updated_at), Date.parse(item.published_at)]).filter(Number.isFinite);
  const updated = new Date(dates.length ? Math.max(...dates) : 0).toUTCString();
  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(channel.title)}</title><link>${RSS_SITE}${channel.home}</link><description>${xml(channel.description)}</description><language>de-de</language><lastBuildDate>${updated}</lastBuildDate><atom:link href="${RSS_SITE}${channel.path}" rel="self" type="application/rss+xml"/>${items.map(item => {
    const date = [item.updated_at, item.published_at].map(value => Date.parse(value)).find(Number.isFinite);
    return `<item><title>${xml(item.title)}</title><link>${xml(item.url)}</link><guid isPermaLink="true">${xml(item.url)}</guid>${date === undefined ? "" : `<pubDate>${new Date(date).toUTCString()}</pubDate>`}<description>${xml(item.summary)}</description></item>`;
  }).join("")}</channel></rss>`;
}
