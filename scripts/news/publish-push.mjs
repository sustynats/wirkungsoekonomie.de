import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function publicationForFeed(feed) {
  const item = Array.isArray(feed?.items) ? feed.items[0] : undefined;
  if (!item) return null;
  if (!item.id || !item.url) throw new Error("NEWS_PUSH_FEED_INVALID");
  const modified = item.date_modified || item.date_published;
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
