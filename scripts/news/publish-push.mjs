import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Der Feed ist nach Ereigniszeit sortiert, nicht nach Veroeffentlichungszeit.
// items[0] ist also die Meldung mit dem jUengsten Ereignis - nicht die, die wir
// gerade herausgegeben haben. Veroeffentlichen wir jetzt eine Meldung ueber ein
// Ereignis von gestern Abend, bleibt items[0] unveraendert, Oracle erkennt
// dieselbe Kennung und verwirft den Versand als Dublette. Am 17.09.2026 traf
// das 9 von 12 Auslieferungen: kein Banner, keine Zahl. Maßgeblich ist deshalb
// _woek_released_at, die echte Herausgabezeit.
export function newestRelease(items) {
  const released = (item) => Date.parse(item?._woek_released_at || 0);
  const candidates = items.filter((item) => Number.isFinite(released(item)));
  if (!candidates.length) return items[0]; // Aeltere Feeds ohne das Feld.
  return candidates.reduce((best, item) => released(item) > released(best) ? item : best);
}

export function publicationForFeed(feed) {
  const item = Array.isArray(feed?.items) && feed.items.length ? newestRelease(feed.items) : undefined;
  if (!item) return null;
  if (!item.id || !item.url) throw new Error("NEWS_PUSH_FEED_INVALID");
  const modified = item._woek_released_at || item.date_modified || item.date_published;
  if (!Number.isFinite(Date.parse(modified))) throw new Error("NEWS_PUSH_DATE_INVALID");
  // Import reports can overtake queued releases. Image/app revisions must not
  // change this stable identity, which Oracle deduplicates durably.
  return { publicationId: `${item.id}@${modified}`, title: item.title || "Neue Wirkungsnachricht", url: item.url, publishedAt: modified };
}

export async function publishDeployedNews({ feed, token = process.env.WOEK_NEWS_PUSH_ADMIN_TOKEN,
  apiUrl = process.env.WOEK_NEWS_PUSH_API_URL || "https://130.162.217.58.sslip.io/api/news-push/publish",
  fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
const payload = publicationForFeed(feed);
if (!payload) return { skipped: true };
if (!token) throw new Error("NEWS_PUSH_ADMIN_TOKEN_MISSING");

let lastError;
for (let attempt = 1; attempt <= 3; attempt += 1) {
  try {
    const response = await fetchImpl(apiUrl, {
      method: "POST",
      signal: AbortSignal.timeout(60_000),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-WOEK-Client-ID": "wirkungsticker-release-v1",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) throw new Error(`NEWS_PUSH_HTTP_${response.status}`);
    if (Number(result.failed) > 0) throw new Error(`NEWS_PUSH_DELIVERIES_PENDING_${result.failed}`);
    return result;
  } catch (error) {
    lastError = error;
    if (attempt < 3) await sleep(attempt * 2000);
  }
}
throw lastError;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // The workflow invokes this only AFTER successful Pages deployment.
  const result = await publishDeployedNews({ feed: JSON.parse(fs.readFileSync("wirkungsticker/feed.json", "utf8")) });
  console.log(result.skipped ? "Empty deployed ticker; push skipped." : `News push accepted: delivered=${result.delivered}, failed=${result.failed}, removed=${result.removed}, duplicate=${result.duplicate}.`);
}
