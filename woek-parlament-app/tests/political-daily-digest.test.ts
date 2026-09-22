import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { politicalDigestWindow } from "@/lib/autopilot/digest-window";

test("daily digest runs at the end of the Berlin day with a retry window", () => {
  assert.equal(politicalDigestWindow(new Date("2026-08-18T20:00:00Z")).due, true);
  assert.equal(politicalDigestWindow(new Date("2026-08-18T21:00:00Z")).due, true);
  assert.equal(politicalDigestWindow(new Date("2026-08-18T19:00:00Z")).due, false);
});

test("GitHub executes the autopilot and separate daily digest without Vercel Functions", () => {
  const autopilot = readFileSync("../.github/workflows/political-autopilot.yml", "utf8");
  const digest = readFileSync("../.github/workflows/political-daily-digest.yml", "utf8");
  assert.match(autopilot, /npm run autopilot:run/);
  assert.match(digest, /npm run autopilot:digest/);
  assert.doesNotMatch(`${autopilot}\n${digest}`, /parlament\.wirkungsoekonomie\.de\/api\/cron/);
  assert.match(digest, /0 20,21,22 \* \* \*/);
});
