import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import type { DeploymentGates } from "@/lib/government/daily-impact-ingest-core";

const gateKeys: Array<keyof DeploymentGates> = [
  "data_1_2_validation",
  "known_overmerge_regressions",
  "public_export",
  "fach_import",
  "source_vs_view",
  "semantic_ui",
  "accessibility",
  "build",
  "privacy",
  "background_automation",
];

export function getGovernmentDeploymentGates() {
  return JSON.parse(readFileSync(path.join(process.cwd(), "data/government/impact-cases/deployment-gates.json"), "utf8")) as DeploymentGates;
}

export function governmentPublicationGatesPass() {
  const gates = getGovernmentDeploymentGates();
  return gateKeys.every((key) => gates[key] === "PASS");
}
