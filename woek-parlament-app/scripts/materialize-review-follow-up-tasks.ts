#!/usr/bin/env tsx

import { readFileSync } from "node:fs";
import path from "node:path";
import { materializeReviewFollowUpTasks } from "@/lib/editorial/review-follow-up-tasks";

function loadLocalEnvironment() {
  try {
    for (const line of readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const name = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      if (name && process.env[name] === undefined) process.env[name] = value;
    }
  } catch {
    // Production supplies configuration directly.
  }
}

async function main() {
  loadLocalEnvironment();
  console.log(JSON.stringify(await materializeReviewFollowUpTasks(), null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not materialise review follow-up tasks.");
  process.exit(1);
});
