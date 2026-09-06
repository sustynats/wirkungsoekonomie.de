import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("autonomous new pages update both committed search and taxonomy before publication", () => {
  const workflow = fs.readFileSync(new URL("../../.github/workflows/wirkungsticker.yml", import.meta.url), "utf8");
  const taxonomy = workflow.indexOf("npm run taxonomy:build");
  const commit = workflow.indexOf("git add --");
  const publish = workflow.indexOf("gh workflow run deploy.yml");
  assert.ok(taxonomy > workflow.indexOf("npm run build:search"));
  assert.ok(commit > taxonomy && publish > commit);
  assert.match(workflow.slice(commit, workflow.indexOf("\n", commit)), /content\/taxonomy\/site-map\.json/);
});

test("frequent news cannot cancel an active Pages publication", () => {
  const workflow = fs.readFileSync(new URL("../../.github/workflows/deploy.yml", import.meta.url), "utf8");
  assert.match(workflow, /concurrency:\s*\n\s+group: pages\s*\n(?:\s*#.*\n)*\s+cancel-in-progress: false/);
});

test("fast and full releases install the dependencies of shared artifact checks", () => {
  const workflow = fs.readFileSync(new URL("../../.github/workflows/deploy.yml", import.meta.url), "utf8");
  const steps = workflow.split(/\n\s{6}- name: /);
  const install = steps.find(step => step.startsWith("Install Python build dependencies\n"));
  const artifact = steps.find(step => step.startsWith("Build public deploy artifact\n"));
  assert.ok(install && artifact);
  assert.doesNotMatch(install, /\n\s+if:/, "PDF checks also run in ticker-only mode");
  for (const dependency of ["pymupdf", "pypdf", "reportlab"]) assert.ok(install.includes(dependency), dependency);
  assert.ok(workflow.indexOf(install) < workflow.indexOf(artifact));
  assert.match(artifact, /npm run build:artifact/);
  const fast = steps.find(step => step.startsWith("Build ticker and search for fast update\n"));
  assert.match(fast, /npm run news:test/);
});
