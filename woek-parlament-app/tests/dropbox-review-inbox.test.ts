import assert from "node:assert/strict";
import test from "node:test";
import { dropboxReviewInboxReady, isReviewResultZipName } from "@/lib/review/dropbox-inbox";

test("Dropbox inbox accepts only review result ZIP names", () => {
  assert.equal(isReviewResultZipName("WOEK-REVIEW-2026-0042-result.zip"), true);
  assert.equal(isReviewResultZipName("WOEK-REVIEW-2026-0042_review-results.zip"), true);
  assert.equal(isReviewResultZipName("WOEK-REVIEW-2026-0042.zip"), false);
  assert.equal(isReviewResultZipName("review-result.json"), false);
});

test("Dropbox inbox stays inactive until all authenticated connection fields exist", () => {
  const keys = ["DROPBOX_APP_KEY", "DROPBOX_APP_SECRET", "DROPBOX_REFRESH_TOKEN", "DROPBOX_REVIEW_RESULTS_PATH"] as const;
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    for (const key of keys) delete process.env[key];
    assert.equal(dropboxReviewInboxReady(), false);
    process.env.DROPBOX_APP_KEY = "app-key";
    process.env.DROPBOX_APP_SECRET = "app-secret";
    process.env.DROPBOX_REFRESH_TOKEN = "refresh-token";
    process.env.DROPBOX_REVIEW_RESULTS_PATH = "/WOEK/Review-Ergebnisse";
    assert.equal(dropboxReviewInboxReady(), true);
  } finally {
    for (const key of keys) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
