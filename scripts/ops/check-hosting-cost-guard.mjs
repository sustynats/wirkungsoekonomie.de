import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const policyPath = path.join(root, "ops", "hosting-cost-policy.json");
const buildLedgerPath = path.join(root, "ops", "vercel-build-ledger.jsonl");
const vercelConfigPaths = [path.join(root, "woek-parlament-app", "vercel.json")];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const failures = [];
const policy = readJson(policyPath);
const buildLedger = fs
  .readFileSync(buildLedgerPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

if (policy.monthly_budget?.currency !== "EUR" || policy.monthly_budget?.gross_max !== 25) {
  failures.push("The Vercel gross monthly budget must remain exactly EUR 25.");
}
if (policy.monthly_budget?.increase_requires_project_owner_approval !== true) {
  failures.push("Budget increases must require explicit project-owner approval.");
}
if (policy.monthly_budget?.vercel_spend_management_additional_usd_preferred !== 0) {
  failures.push("Preferred Vercel additional spend must remain USD 0.");
}
if ((policy.monthly_budget?.vercel_spend_management_additional_usd_fallback_max ?? Infinity) > 1) {
  failures.push("The Vercel additional-spend fallback must not exceed USD 1.");
}
if (policy.monthly_budget?.vercel_spend_management_action !== "PAUSE_ALL_PROJECTS") {
  failures.push("Vercel Spend Management must pause all projects at the hard limit.");
}
if (policy.vercel?.automatic_git_deployments !== false) {
  failures.push("Automatic Vercel Git deployments must remain disabled.");
}
if (policy.vercel?.automatic_preview_deployments !== false) {
  failures.push("Automatic Vercel preview deployments must remain disabled.");
}
if (policy.vercel?.build_machine_type !== "standard") {
  failures.push("The Vercel build machine policy must remain standard.");
}
if (policy.vercel?.elastic_concurrency_enabled !== false) {
  failures.push("Elastic Vercel build concurrency must remain disabled.");
}
if ((policy.release?.monthly_vercel_build_limit_all_projects ?? Infinity) > 4) {
  failures.push("At most four Vercel builds per billing cycle are allowed across all projects.");
}
if (policy.release?.release_candidate_builds_per_change_set_max !== 1) {
  failures.push("Each change set may create at most one Vercel release-candidate build.");
}
if (policy.release?.production_must_promote_existing_release_candidate !== true) {
  failures.push("Production must promote the tested release candidate without a rebuild.");
}
if (policy.release?.direct_vercel_deploy_commands_forbidden_without_release_budget_gate !== true) {
  failures.push("Direct Vercel deploy commands must remain gated by the live release-budget check.");
}
if (buildLedger.some((entry) => !Number.isInteger(entry.slots_consumed) || entry.slots_consumed < 0)) {
  failures.push("Every Vercel build-ledger record must contain a non-negative integer slot count.");
}
if (policy.storage?.public_artifacts !== "GITHUB_RELEASES") {
  failures.push("Public immutable artifacts must remain assigned to GitHub Releases.");
}
if (policy.storage?.new_private_user_data_in_vercel_storage !== false) {
  failures.push("New private user data must not be assigned to Vercel storage.");
}

for (const configPath of vercelConfigPaths) {
  const config = readJson(configPath);
  if (config.git?.deploymentEnabled !== false) {
    failures.push(`${path.relative(root, configPath)} must set git.deploymentEnabled=false.`);
  }
}

if (failures.length > 0) {
  console.error("HOSTING_COST_GUARD=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("HOSTING_COST_GUARD=PASS");
console.log("VERCEL_GROSS_MONTHLY_BUDGET_EUR=25");
console.log("VERCEL_MONTHLY_BUILD_LIMIT_ALL_PROJECTS=4");
console.log("VERCEL_PRODUCTION_REBUILD=false");
console.log("AUTOMATIC_VERCEL_GIT_DEPLOYMENTS=false");
console.log("PUBLIC_ARTIFACT_STORE=GITHUB_RELEASES");
console.log("PRIVATE_USER_DATA_TARGET=ORACLE_OCI");
