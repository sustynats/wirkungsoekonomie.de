import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const baseline = JSON.parse(
  fs.readFileSync(path.join(root, "ops", "vercel-project-baseline.json"), "utf8"),
);
const failures = [];

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
  ];

  checks.push([
    current.gitProviderOptions?.createDeployments === expected.git_deployments,
    "Git deployments are enabled",
  ]);

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
