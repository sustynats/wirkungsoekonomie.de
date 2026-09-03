import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("Wirkungsticker registers real Web Push and preserves the periodic fallback", () => {
  const app = fs.readFileSync("assets/js/news-pwa.js", "utf8");
  const worker = fs.readFileSync("wirkungsticker/sw.js", "utf8");
  assert.match(app, /pushManager\.subscribe/);
  assert.match(app, /pushApiBase = .*\/api\/news-push/);
  assert.match(app, /`\$\{pushApiBase\}\/subscribe`/);
  assert.match(app, /`\$\{pushApiBase\}\/unsubscribe`/);
  assert.match(worker, /addEventListener\("push"/);
  assert.match(worker, /addEventListener\("periodicsync"/);
  assert.match(worker, /setAppBadge/);
  assert.match(worker, /clearAppBadge/);
});

test("release notifier is gated by a public change and uses an idempotent publication id", () => {
  const notifier = fs.readFileSync("scripts/news/publish-push.mjs", "utf8");
  assert.match(notifier, /report\.public_changed !== true/);
  assert.match(notifier, /publicationId: `\$\{item\.id\}@\$\{modified\}`/);
  assert.match(notifier, /WOEK_NEWS_PUSH_ADMIN_TOKEN/);
});
