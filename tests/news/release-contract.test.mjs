import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("ticker release tests include the monitor dependency contract before public builds", () => {
  const root = new URL("../../", import.meta.url);
  const pkg = JSON.parse(fs.readFileSync(new URL("package.json", root), "utf8"));
  assert.match(pkg.scripts["news:test"], /node --test\b/);
  assert.ok(pkg.scripts["news:test"].includes("tests/news/*.test.mjs"));
  assert.ok(pkg.scripts["news:test"].includes("tests/ops/discord-monitor.test.mjs"),
    "A green ticker release must also verify the runtime monitor's sparse checkout");
  const workflow = fs.readFileSync(new URL(".github/workflows/deploy.yml", root), "utf8");
  const fastRelease = workflow.split("- name: Build ticker and search for fast update")[1]
    ?.split("- name: Build public deploy artifact")[0];
  assert.ok(fastRelease, "Fast ticker release path is missing");
  assert.ok(fastRelease.indexOf("npm run news:test") >= 0);
  assert.ok(fastRelease.indexOf("npm run news:test") < fastRelease.indexOf("npm run news:build"));
});
