import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { politicalDigestWindow } from "@/lib/autopilot/digest-window";

test("daily digest runs at the end of the Berlin day with a retry window", () => {
  assert.equal(politicalDigestWindow(new Date("2026-08-18T20:00:00Z")).due, true);
  assert.equal(politicalDigestWindow(new Date("2026-08-18T21:00:00Z")).due, true);
  assert.equal(politicalDigestWindow(new Date("2026-08-18T19:00:00Z")).due, false);
});

test("GitHub invokes the autopilot and separate daily digest in the cloud", () => {
  const autopilot = readFileSync("../.github/workflows/political-autopilot.yml", "utf8");
  const digest = readFileSync("../.github/workflows/political-daily-digest.yml", "utf8");
  assert.match(autopilot, /api\/cron\/political-autopilot/);
  assert.match(digest, /api\/cron\/political-daily-digest/);
  assert.match(digest, /0 20,21,22 \* \* \*/);
});
