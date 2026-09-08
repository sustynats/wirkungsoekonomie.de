import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("release budget cannot bypass the zero-cost plan gate after a billing reset", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "woek-release-admission-test-"));
  try {
    // A local fixture, never a provider request; usage must not even be queried.
    writeFileSync(path.join(directory, "npx"),
      `#!${process.execPath}\nif(process.argv.includes('usage')){process.exit(93)}\nconsole.log(JSON.stringify({billing:{plan:'pro',invoiceItems:{},period:{start:1,end:9999999999999}}}));\n`,
      { mode: 0o700 });
    const root = fileURLToPath(new URL("../../", import.meta.url));
    const result = spawnSync(process.execPath, ["scripts/ops/check-vercel-release-budget.mjs"], {
      cwd: root, env: { ...process.env, PATH: `${directory}${path.delimiter}${process.env.PATH}` }, encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /current plan is pro/);
    assert.match(result.stderr, /NO_NEW_VERCEL_BUILD=true/);
    assert.doesNotMatch(result.stderr, /Live Vercel usage could not be read/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
