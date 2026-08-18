#!/usr/bin/env tsx

import { readFileSync } from "node:fs";
import path from "node:path";
import { prepareUpcomingDecisionReviews } from "@/lib/editorial/upcoming-preparation";

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
    // Production supplies its environment directly.
  }
}

async function main() {
  loadLocalEnvironment();
  const maximum = Number(process.argv.find((value) => value.startsWith("--maximum-cases="))?.slice("--maximum-cases=".length) ?? 15);
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 15) throw new Error("--maximum-cases must be an integer between 1 and 15.");
  const exportWhenPrivateNotificationReady = process.argv.includes("--deliver");
  console.log(JSON.stringify(await prepareUpcomingDecisionReviews({ maximumCases: maximum, exportWhenPrivateNotificationReady }), null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Upcoming-decision preparation failed.");
  process.exit(1);
});
