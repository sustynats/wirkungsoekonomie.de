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
