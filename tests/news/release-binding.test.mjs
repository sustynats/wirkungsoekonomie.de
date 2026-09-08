import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const workflow = name => fs.readFileSync(new URL(`../../.github/workflows/${name}.yml`, import.meta.url), "utf8");
const worker = workflow("wirkungsticker");
const deploy = workflow("deploy");
const oldCommit = "a".repeat(40);
const pushedCommit = "b".repeat(40);
function step(source, name) {
  const found = source.split(/\n {6}- name: /).find(part => part.startsWith(`${name}\n`));
  assert.ok(found, `Missing workflow step: ${name}`);
  return found;
}
function shell(source, name) {
  const lines = step(source, name).split("\n");
  const start = lines.indexOf("        run: |");
  assert.ok(start >= 0, `Missing literal shell: ${name}`);
  return lines.slice(start + 1).filter(line => line.startsWith("          ")).map(line => line.slice(10)).join("\n");
}

// Execute the ACTUAL workflow shell with local in-memory command doubles.
// No provider call, real git mutation, network access or deployment occurs.
function runStep(t, source, name, values = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "woek-release-binding-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const files = { output: path.join(dir, "output"), summary: path.join(dir, "summary"), calls: path.join(dir, "calls") };
  const doubles = `
    fake_head="$INITIAL_COMMIT"
    git() {
      case "$1" in
        config|add|commit) return 0 ;;
        diff) [[ "$TEST_CHANGED" != "true" ]] ;;
        rev-parse) printf '%s\\n' "$fake_head" ;;
        *) return 90 ;;
      esac
    }
    node() {
      [[ "$1" == "scripts/news/publish-git.mjs" ]] || return 91
      [[ "$TEST_PUSH_SUCCEEDS" == "true" ]] || return 71
      fake_head="$PUBLISHED_COMMIT"
    }
    gh() { printf '%s\\n' "$@" >> "$TEST_CALLS"; }
  `;
  const result = spawnSync("bash", ["-c", `${doubles}\n${shell(source, name)}`], {
    cwd: dir, encoding: "utf8", timeout: 5000,
    env: {
      PATH: process.env.PATH,
      GITHUB_OUTPUT: files.output, GITHUB_STEP_SUMMARY: files.summary, TEST_CALLS: files.calls,
      GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_SHA: oldCommit,
      INITIAL_COMMIT: oldCommit, PUBLISHED_COMMIT: pushedCommit,
      TEST_CHANGED: "true", TEST_PUSH_SUCCEEDS: "true", SLOT_NAME: "Fixture",
      TICKER_COMMIT: pushedCommit, TICKER_ONLY: "true", EXPECTED_COMMIT: oldCommit,
      ...values,
    },
  });
  return { ...result, ...Object.fromEntries(Object.entries(files).map(([key, file]) => [key, fs.existsSync(file) ? fs.readFileSync(file, "utf8") : ""])) };
}

test("ticker source is captured after successful rebase/rebuild/push, never before", t => {
  const result = runStep(t, worker, "Commit one atomic update");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, `commit=${pushedCommit}\nchanged=true\n`);
  assert.doesNotMatch(result.output, new RegExp(oldCommit));
});

test("failed publication and unchanged work cannot advertise a releasable commit", t => {
  const failed = runStep(t, worker, "Commit one atomic update", { TEST_PUSH_SUCCEEDS: "false" });
  assert.equal(failed.status, 71);
  assert.equal(failed.output, "");
  const unchanged = runStep(t, worker, "Commit one atomic update", { TEST_CHANGED: "false" });
  assert.equal(unchanged.status, 0);
  assert.equal(unchanged.output, "changed=false\n");
});

test("dispatch keeps main as workflow definition but binds content to the pushed commit", t => {
  const dispatch = step(worker, "Publish the committed ticker automatically");
  assert.match(dispatch, /TICKER_COMMIT: \$\{\{ steps\.commit\.outputs\.commit \}\}/);
  const result = runStep(t, worker, "Publish the committed ticker automatically");
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls.trim().split("\n"), ["workflow", "run", "deploy.yml", "--ref", "main", "-f", "ticker_only=true", "-f", `ticker_commit=${pushedCommit}`]);
});

for (const invalid of ["", "main", "release-tag", "abcdef0", "b".repeat(41), `${pushedCommit}\n`, "$(echo injected)"]) {
  test(`automatic dispatch rejects a missing or non-exact SHA: ${JSON.stringify(invalid)}`, t => {
    const result = runStep(t, worker, "Publish the committed ticker automatically", { TICKER_COMMIT: invalid });
    assert.notEqual(result.status, 0);
    assert.equal(result.calls, "");
  });
}

test("commit override is validated before checkout and only on the ticker-only dispatch", t => {
  assert.ok(deploy.indexOf("- name: Validate requested ticker commit") < deploy.indexOf("- name: Checkout\n"));
  assert.equal(runStep(t, deploy, "Validate requested ticker commit").status, 0);
  for (const values of [{ TICKER_COMMIT: "main" }, { TICKER_ONLY: "false" }, { GITHUB_EVENT_NAME: "push" }]) {
    assert.notEqual(runStep(t, deploy, "Validate requested ticker commit", values).status, 0);
  }
});

test("ordinary pushes and older/manual dispatches without overrides retain event-SHA behavior", t => {
  for (const GITHUB_EVENT_NAME of ["push", "workflow_dispatch"]) {
    assert.equal(runStep(t, deploy, "Validate requested ticker commit", { GITHUB_EVENT_NAME, TICKER_COMMIT: "", TICKER_ONLY: "false" }).status, 0);
  }
  assert.match(step(deploy, "Checkout"), /ref: \$\{\{ inputs\.ticker_commit \|\| github\.sha \}\}/);
  assert.match(step(deploy, "Verify and record release commit"), /EXPECTED_COMMIT: \$\{\{ inputs\.ticker_commit \|\| github\.sha \}\}/);
  assert.match(deploy, /build:\n\s+if: inputs\.speedtest_only != true/);
});

test("build fails closed on a stale checkout and records the exact source when matched", t => {
  const stale = runStep(t, deploy, "Verify and record release commit", { EXPECTED_COMMIT: pushedCommit });
  assert.notEqual(stale.status, 0);
  assert.equal(stale.output, "");
  const matched = runStep(t, deploy, "Verify and record release commit", { INITIAL_COMMIT: pushedCommit, EXPECTED_COMMIT: pushedCommit });
  assert.equal(matched.status, 0, matched.stderr);
  assert.equal(matched.output, `commit=${pushedCommit}\n`);
  assert.ok(matched.summary.includes(`Source commit: \`${pushedCommit}\``));
  assert.ok(matched.summary.includes(`Trigger commit: \`${oldCommit}\``));
});

test("app notification uses the verified artifact source, not a newer or stale moving ref", () => {
  assert.match(deploy, /release_commit: \$\{\{ steps\.release-source\.outputs\.commit \}\}/);
  assert.match(step(deploy, "Checkout committed ticker"), /ref: \$\{\{ needs\.build\.outputs\.release_commit \}\}/);
  assert.match(deploy, /notify-ticker:\n\s+needs: \[build, deploy\]\n\s+if: .*needs\.deploy\.result == 'success'/);
});

test("notification rejects a missing job output or mismatched checkout before sending", t => {
  const verify = step(deploy, "Verify notification source");
  assert.match(verify, /RELEASE_COMMIT: \$\{\{ needs\.build\.outputs\.release_commit \}\}/);
  assert.ok(deploy.indexOf("- name: Verify notification source") < deploy.indexOf("- name: Notify subscribed Wirkungsticker apps"));
  for (const RELEASE_COMMIT of ["", pushedCommit]) {
    assert.notEqual(runStep(t, deploy, "Verify notification source", { RELEASE_COMMIT }).status, 0);
  }
  assert.equal(runStep(t, deploy, "Verify notification source", { RELEASE_COMMIT: oldCommit }).status, 0);
});
