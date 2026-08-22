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
const ledger = fs
  .readFileSync(path.join(root, "ops", "vercel-build-ledger.jsonl"), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

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
  console.error("VERCEL_RELEASE_BUDGET_GATE=FAIL");
  console.error("- The authoritative Vercel billing period could not be read; fail closed.");
  process.exit(1);
}

let team;
try {
  team = JSON.parse(teamResult.stdout);
} catch {
  console.error("VERCEL_RELEASE_BUDGET_GATE=FAIL");
  console.error("- Vercel returned an unreadable team billing response; fail closed.");
  process.exit(1);
}

const billingStartMs = team.billing?.period?.start;
const billingEndMs = team.billing?.period?.end;
if (!Number.isFinite(billingStartMs) || !Number.isFinite(billingEndMs)) {
  console.error("VERCEL_RELEASE_BUDGET_GATE=FAIL");
  console.error("- The authoritative Vercel billing period is missing; fail closed.");
  process.exit(1);
}

const toDateOnly = (timestamp) => new Date(timestamp).toISOString().slice(0, 10);
const today = new Date().toISOString().slice(0, 10);
const result = spawnSync(
  "npx",
  [
    "--yes",
    "vercel@latest",
    "usage",
    "--scope",
    baseline.team_slug,
    "--from",
    toDateOnly(billingStartMs),
    "--to",
    today,
    "--json",
  ],
  { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
);

if (result.status !== 0) {
  console.error("VERCEL_RELEASE_BUDGET_GATE=FAIL");
  console.error("- Live Vercel usage could not be read; fail closed before a paid build.");
  process.exit(1);
}

let usage;
try {
  usage = JSON.parse(result.stdout);
} catch {
  console.error("VERCEL_RELEASE_BUDGET_GATE=FAIL");
  console.error("- Vercel returned an unreadable usage response; fail closed before a paid build.");
  process.exit(1);
}

const services = usage.services ?? [];
const serviceCost = (name, field) =>
  services.find((service) => service.name === name)?.[field] ?? 0;
const meteredEffectiveCost = services
  .filter((service) => service.name !== "Pro")
  .reduce((sum, service) => sum + (service.effectiveCost ?? 0), 0);
const buildCpuEffectiveCost = serviceCost("Build CPU Minutes", "effectiveCost");
const additionalBilledCost = usage.totals?.billedCost ?? 0;

const limits = policy.monthly_budget;
const failures = [];

if (meteredEffectiveCost >= limits.metered_effective_cost_before_new_build_usd_max) {
  failures.push(
    `metered effective cost USD ${meteredEffectiveCost.toFixed(2)} reached the USD ${limits.metered_effective_cost_before_new_build_usd_max.toFixed(2)} pre-build ceiling`,
  );
}
if (buildCpuEffectiveCost >= limits.build_cpu_effective_cost_before_new_build_usd_max) {
  failures.push(
    `Build CPU effective cost USD ${buildCpuEffectiveCost.toFixed(2)} reached the USD ${limits.build_cpu_effective_cost_before_new_build_usd_max.toFixed(2)} pre-build ceiling`,
  );
}
if (additionalBilledCost >= limits.additional_billed_cost_before_new_build_usd_max) {
  failures.push(
    `additional billed usage USD ${additionalBilledCost.toFixed(2)} reached the USD ${limits.additional_billed_cost_before_new_build_usd_max.toFixed(2)} pre-build ceiling`,
  );
}

const periodFrom = new Date(billingStartMs).toISOString();
const periodTo = new Date(billingEndMs).toISOString();
const slotsConsumed = ledger
  .filter((entry) => entry.billing_period_start === periodFrom)
  .reduce((sum, entry) => sum + (entry.slots_consumed ?? 0), 0);
const slotsLimit = policy.release.monthly_vercel_build_limit_all_projects;
if (slotsConsumed >= slotsLimit) {
  failures.push(`all ${slotsLimit} Vercel build slots for the billing period are consumed`);
}

if (failures.length > 0) {
  console.error("VERCEL_RELEASE_BUDGET_GATE=FAIL");
  console.error(`VERCEL_BILLING_PERIOD=${periodFrom}..${periodTo}`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("NO_NEW_VERCEL_BUILD=true");
  process.exit(1);
}

console.log("VERCEL_RELEASE_BUDGET_GATE=PASS");
console.log(`VERCEL_BILLING_PERIOD=${periodFrom}..${periodTo}`);
console.log(`METERED_EFFECTIVE_COST_USD=${meteredEffectiveCost.toFixed(4)}`);
console.log(`BUILD_CPU_EFFECTIVE_COST_USD=${buildCpuEffectiveCost.toFixed(4)}`);
console.log(`ADDITIONAL_BILLED_COST_USD=${additionalBilledCost.toFixed(4)}`);
console.log(
  `VERCEL_MONTHLY_BUILD_LIMIT_ALL_PROJECTS=${policy.release.monthly_vercel_build_limit_all_projects}`,
);
console.log(`VERCEL_BUILD_SLOTS_REMAINING=${slotsLimit - slotsConsumed}`);
