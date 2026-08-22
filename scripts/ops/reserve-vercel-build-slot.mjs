import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const policy = JSON.parse(
  fs.readFileSync(path.join(root, "ops", "hosting-cost-policy.json"), "utf8"),
);
const baseline = JSON.parse(
  fs.readFileSync(path.join(root, "ops", "vercel-project-baseline.json"), "utf8"),
);
const ledgerPath = path.join(root, "ops", "vercel-build-ledger.jsonl");

const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, ...value] = argument.replace(/^--/, "").split("=");
    return [key, value.join("=")];
  }),
);

if (!args.project || !args.commit || !args.release) {
  console.error("VERCEL_BUILD_SLOT=FAIL");
  console.error("Usage: npm run reserve:vercel-build -- --project=<name> --commit=<sha> --release=<id>");
  process.exit(1);
}

const project = baseline.projects.find((candidate) => candidate.name === args.project);
if (!project) {
  console.error("VERCEL_BUILD_SLOT=FAIL");
  console.error(`Unknown Vercel project: ${args.project}`);
  process.exit(1);
}

const localCommit = spawnSync("git", ["rev-parse", "HEAD"], {
  cwd: root,
  encoding: "utf8",
}).stdout.trim();
if (localCommit !== args.commit) {
  console.error("VERCEL_BUILD_SLOT=FAIL");
  console.error(`Requested commit ${args.commit} does not match checked-out commit ${localCommit}.`);
  process.exit(1);
}

const liveGate = spawnSync("node", ["scripts/ops/check-vercel-release-budget.mjs"], {
  cwd: root,
  encoding: "utf8",
  stdio: "inherit",
});
if (liveGate.status !== 0) process.exit(liveGate.status ?? 1);

const teamResult = spawnSync(
  "npx",
  [
    "--yes",
    "vercel@latest",
    "api",
    `/v2/teams/${baseline.team_id}`,
    "--raw",
  ],
  { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
);
if (teamResult.status !== 0) {
  console.error("VERCEL_BUILD_SLOT=FAIL");
  console.error("The authoritative billing period could not be read; fail closed.");
  process.exit(1);
}

const team = JSON.parse(teamResult.stdout);
const periodStart = new Date(team.billing.period.start).toISOString();
const periodEnd = new Date(team.billing.period.end).toISOString();
const ledger = fs
  .readFileSync(ledgerPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const existing = ledger.find((entry) => entry.release_id === args.release);
if (existing) {
  const same = existing.project === args.project && existing.commit === args.commit;
  if (!same) {
    console.error("VERCEL_BUILD_SLOT=FAIL");
    console.error(`Release ID ${args.release} already belongs to a different project or commit.`);
    process.exit(1);
  }
  console.log("VERCEL_BUILD_SLOT=IDEMPOTENT");
  console.log(`RELEASE_ID=${args.release}`);
  process.exit(0);
}

const consumed = ledger
  .filter((entry) => entry.billing_period_start === periodStart)
  .reduce((sum, entry) => sum + (entry.slots_consumed ?? 0), 0);
const limit = policy.release.monthly_vercel_build_limit_all_projects;
if (consumed >= limit) {
  console.error("VERCEL_BUILD_SLOT=FAIL");
  console.error(`All ${limit} Vercel build slots for ${periodStart} are consumed.`);
  process.exit(1);
}

const entry = {
  event: "BUILD_SLOT_RESERVED",
  billing_period_start: periodStart,
  billing_period_end: periodEnd,
  reserved_at: new Date().toISOString(),
  release_id: args.release,
  project: args.project,
  project_id: project.id,
  commit: args.commit,
  slots_consumed: 1,
  production_mode: "PROMOTE_EXISTING_RELEASE_CANDIDATE_WITHOUT_REBUILD",
};
fs.appendFileSync(ledgerPath, `${JSON.stringify(entry)}\n`, "utf8");

console.log("VERCEL_BUILD_SLOT=RESERVED");
console.log(`RELEASE_ID=${args.release}`);
console.log(`PROJECT=${args.project}`);
console.log(`COMMIT=${args.commit}`);
console.log(`SLOTS_REMAINING=${limit - consumed - 1}`);
