import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function runClock(t, { recentReport = true, recentDispatch = false, failPush = false,
  lockName = null, lockAgeSeconds = 0, lockHeld = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "woek-clock-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const state = path.join(dir, "last-dispatch"), log = path.join(dir, "git.log"), repo = path.join(dir, "repo");
  fs.mkdirSync(repo);
  if (lockName) {
    const lockPath = path.join(repo, lockName);
    fs.writeFileSync(lockPath, "");
    const lockDate = new Date(Date.now() - lockAgeSeconds * 1000);
    fs.utimesSync(lockPath, lockDate, lockDate);
  }
  if (recentDispatch) fs.writeFileSync(state, String(Math.floor(Date.now() / 1000)));
  for (const [name, code] of Object.entries({
    flock: 'process.exit(0);', // These tests exercise dispatch selection, not Linux flock.
    fuser: 'process.exit(process.env.TEST_LOCK_HELD === "true" ? 0 : 1);',
    curl: 'console.log(JSON.stringify({started_at: new Date(Date.now() - (process.env.TEST_RECENT === "true" ? 0 : 3600000)).toISOString()}));',
    git: 'const a=process.argv.slice(2);fs.appendFileSync(process.env.TEST_LOG,JSON.stringify(a)+"\\n");if(a.includes("rev-parse")||a.includes("commit-tree"))console.log("mock-commit");if(a.includes("push")&&process.env.TEST_FAIL_PUSH==="true")process.exit(1);',
  })) {
    const target = path.join(dir, name);
    fs.writeFileSync(target, `#!${process.execPath}\nconst fs=require("node:fs");\n${code}\n`, { mode: 0o700 });
  }
  const result = spawnSync("bash", [fileURLToPath(new URL("../../scripts/ops/wirkungsticker-clock.sh", import.meta.url))], {
    encoding: "utf8",
    env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, WOEK_CLOCK_REPO: repo, WOEK_CLOCK_STATE: state,
      WOEK_CLOCK_FORCE: "false", WOEK_CLOCK_STALE_LOCK_SECONDS: "60", TEST_LOG: log,
      TEST_RECENT: String(recentReport), TEST_FAIL_PUSH: String(failPush), TEST_LOCK_HELD: String(lockHeld) },
  });
  const commands = fs.existsSync(log) ? fs.readFileSync(log, "utf8").trim().split("\n").map(JSON.parse) : [];
  const archiveDir = `${repo}.stale-locks`;
  return { ...result, pushes: commands.filter((args) => args.includes("push")), stateWritten: fs.existsSync(state),
    lockExists: Boolean(lockName && fs.existsSync(path.join(repo, lockName))),
    archivedLocks: fs.existsSync(archiveDir) ? fs.readdirSync(archiveDir) : [] };
}

test("fresh news still triggers monitor-only branch, without another importer", (t) => {
  const result = runClock(t);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.pushes.length, 1);
  assert.equal(result.pushes[0].at(-1), "mock-commit:refs/heads/codex/ops-monitor-clock");
  assert.equal(result.stateWritten, true);
  const monitor = fs.readFileSync(new URL("../../.github/workflows/ops-discord-monitor.yml", import.meta.url), "utf8");
  assert.match(monitor, /branches: \[codex\/wirkungsticker-clock, codex\/ops-monitor-clock\]/);
});

test("stale news triggers the existing combined importer and monitor clock", (t) => {
  const result = runClock(t, { recentReport: false });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.pushes[0].at(-1), "mock-commit:refs/heads/codex/wirkungsticker-clock");
});

test("a recent actual clock dispatch remains deduplicated", (t) => {
  const result = runClock(t, { recentDispatch: true });
  assert.equal(result.status, 0);
  assert.deepEqual(result.pushes, []);
});

test("failed remote push never records a successful dispatch", (t) => {
  const result = runClock(t, { failPush: true });
  assert.notEqual(result.status, 0);
  assert.equal(result.stateWritten, false);
});

test("a stale unheld shallow lock is archived before dispatch", (t) => {
  const result = runClock(t, { recentReport: false, lockName: "shallow.lock", lockAgeSeconds: 120 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.lockExists, false);
  assert.equal(result.archivedLocks.length, 1);
  assert.match(result.archivedLocks[0], /^shallow\.lock\./);
  assert.equal(result.pushes.length, 1);
});

test("a fresh or held Git lock is never recovered", (t) => {
  const fresh = runClock(t, { recentReport: false, lockName: "shallow.lock", lockAgeSeconds: 5 });
  assert.equal(fresh.status, 75);
  assert.equal(fresh.lockExists, true);
  assert.deepEqual(fresh.pushes, []);

  const held = runClock(t, { recentReport: false, lockName: "gc.log.lock", lockAgeSeconds: 120, lockHeld: true });
  assert.equal(held.status, 75);
  assert.equal(held.lockExists, true);
  assert.deepEqual(held.pushes, []);
});
