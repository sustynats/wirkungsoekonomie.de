import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { politicalDigestWindow } from "@/lib/autopilot/digest-window";

test("daily digest runs at the end of the Berlin day with a retry window", () => {
  assert.equal(politicalDigestWindow(new Date("2026-08-18T20:00:00Z")).due, true);
  assert.equal(politicalDigestWindow(new Date("2026-08-18T21:00:00Z")).due, true);
  assert.equal(politicalDigestWindow(new Date("2026-08-18T19:00:00Z")).due, false);
});

test("Vercel invokes both the autopilot and separate daily digest", () => {
  const config = JSON.parse(readFileSync("vercel.json", "utf8")) as { crons: Array<{ path: string; schedule: string }> };
  assert.equal(config.crons.some((entry) => entry.path === "/api/cron/political-autopilot"), true);
  assert.equal(config.crons.some((entry) => entry.path === "/api/cron/political-daily-digest" && entry.schedule === "0 20,21,22 * * *"), true);
});
