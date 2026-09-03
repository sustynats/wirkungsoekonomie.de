import fs from "node:fs";

const report = JSON.parse(fs.readFileSync("reports/wirkungsticker-latest-run.json", "utf8"));
if (report.public_changed !== true) {
  console.log("No public ticker change; push skipped.");
  process.exit(0);
}

const feed = JSON.parse(fs.readFileSync("wirkungsticker/feed.json", "utf8"));
const item = Array.isArray(feed.items) ? feed.items[0] : undefined;
if (!item?.id || !item?.url) throw new Error("NEWS_PUSH_FEED_EMPTY");

const apiUrl = process.env.WOEK_NEWS_PUSH_API_URL || "https://130.162.217.58.sslip.io/api/news-push/publish";
const token = process.env.WOEK_NEWS_PUSH_ADMIN_TOKEN;
if (!token) throw new Error("NEWS_PUSH_ADMIN_TOKEN_MISSING");

const modified = item.date_modified || item.date_published || new Date().toISOString();
const payload = {
  publicationId: `${item.id}@${modified}`,
  title: item.title || "Neue Wirkungsnachricht",
  url: item.url,
  publishedAt: modified,
};

let lastError;
for (let attempt = 1; attempt <= 3; attempt += 1) {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
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
    console.log(`News push accepted: delivered=${result.delivered}, failed=${result.failed}, removed=${result.removed}, duplicate=${result.duplicate}.`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
  }
}
throw lastError;
