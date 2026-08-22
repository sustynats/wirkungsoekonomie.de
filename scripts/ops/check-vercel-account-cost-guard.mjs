import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const baseline = JSON.parse(
  fs.readFileSync(path.join(root, "ops", "vercel-project-baseline.json"), "utf8"),
);
const failures = [];

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
  failures.push("Vercel team billing state could not be read");
} else {
  const team = JSON.parse(teamResult.stdout);
  const invoiceItems = team.billing?.invoiceItems ?? {};
  if ((invoiceItems.teamSeats?.quantity ?? 0) !== baseline.expected.additional_team_seats) {
    failures.push("Vercel additional team seats are enabled");
  }
  if ((invoiceItems.analytics?.quantity ?? 0) !== 0) {
    failures.push("Paid Vercel Analytics is enabled");
  }
  if ((invoiceItems.observabilityPlus?.quantity ?? 0) !== 0) {
    failures.push("Vercel Observability Plus is enabled");
  }
}

for (const project of baseline.projects) {
  const result = spawnSync(
    "npx",
    [
      "--yes",
      "vercel@latest",
      "api",
      `/v9/projects/${project.id}?teamId=${baseline.team_id}`,
      "--raw",
    ],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );

  if (result.status !== 0) {
    failures.push(`${project.name}: Vercel project state could not be read`);
    continue;
  }

  const current = JSON.parse(result.stdout);
  const expected = baseline.expected;
  const checks = [
    [current.name === project.name, `project name is ${current.name ?? "missing"}`],
    [current.commandForIgnoringBuildStep === expected.command_for_ignoring_build_step, "ignored-build command changed"],
    [current.resourceConfig?.buildMachineType === expected.build_machine_type, "build machine is not standard"],
    [current.resourceConfig?.buildMachineSelection === expected.build_machine_selection, "build machine selection is not fixed"],
    [current.resourceConfig?.elasticConcurrencyEnabled === expected.elastic_concurrency_enabled, "elastic concurrency is enabled"],
    [current.resourceConfig?.buildQueue?.configuration === expected.build_queue, "build queue is not serial"],
    [current.features?.webAnalytics === expected.web_analytics_enabled, "Web Analytics is enabled"],
    [(current.speedInsights?.hasData ?? false) === expected.speed_insights_has_data, "Speed Insights is collecting data"],
    [current.observability == null, "project-level Observability Plus is enabled"],
  ];

  checks.push([
    current.gitProviderOptions?.createDeployments === expected.git_deployments,
    "Git deployments are enabled",
  ]);
  checks.push([
    (current.link?.deployHooks?.length ?? 0) <= project.legacy_deploy_hook_count_max,
    `deploy-hook count exceeds approved maximum ${project.legacy_deploy_hook_count_max}`,
  ]);

  if (project.legacy_deploy_hooks_must_remain_build_inert === true) {
    checks.push([
      current.commandForIgnoringBuildStep === "exit 0" &&
        current.gitProviderOptions?.createDeployments === "disabled",
      "legacy deploy hooks are not protected by the ignored-build and disabled-Git gates",
    ]);
  }

  for (const [passed, message] of checks) {
    if (!passed) failures.push(`${project.name}: ${message}`);
  }
}

if (failures.length > 0) {
  console.error("VERCEL_ACCOUNT_COST_GUARD=FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("VERCEL_ACCOUNT_COST_GUARD=PASS");
console.log(`VERCEL_PROJECTS_VERIFIED=${baseline.projects.length}`);
console.log("AUTOMATIC_VERCEL_GIT_DEPLOYMENTS=false");
console.log("VERCEL_BUILD_MACHINE=standard");
console.log("VERCEL_ELASTIC_CONCURRENCY=false");
console.log("UNAPPROVED_DEPLOY_HOOKS=0");
console.log("PAID_ANALYTICS=false");
console.log("OBSERVABILITY_PLUS=false");
console.log("ADDITIONAL_TEAM_SEATS=0");
