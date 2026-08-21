import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const policyPath = path.join(root, "ops", "hosting-cost-policy.json");
const vercelConfigPaths = [path.join(root, "woek-parlament-app", "vercel.json")];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const failures = [];
const policy = readJson(policyPath);

if (policy.monthly_budget?.currency !== "EUR" || policy.monthly_budget?.gross_max !== 25) {
  failures.push("The Vercel gross monthly budget must remain exactly EUR 25.");
}
if (policy.monthly_budget?.increase_requires_project_owner_approval !== true) {
  failures.push("Budget increases must require explicit project-owner approval.");
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
console.log("AUTOMATIC_VERCEL_GIT_DEPLOYMENTS=false");
console.log("PUBLIC_ARTIFACT_STORE=GITHUB_RELEASES");
console.log("PRIVATE_USER_DATA_TARGET=ORACLE_OCI");
