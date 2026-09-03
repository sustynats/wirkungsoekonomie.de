#!/usr/bin/env tsx

import { readFileSync } from "node:fs";
import path from "node:path";
import { historicalWoeKBackfillStart } from "@/lib/dip-backfill";
import { runHistoricalDipBackfillStep } from "@/lib/editorial/historical-backfill";

function loadLocalEnvironment() {
  const pathToEnvironment = path.resolve(process.cwd(), ".env.local");
  try {
    for (const line of readFileSync(pathToEnvironment, "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const name = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      if (name && process.env[name] === undefined) process.env[name] = value;
    }
  } catch {
    // Deployment environments provide configuration directly. Local execution
    // simply continues and the protected client reports a missing setting.
  }
}

function dateValue(value: string | undefined, fallback: string) {
  const selected = value?.trim() || fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(selected)) throw new Error("Backfill dates must use YYYY-MM-DD.");
  return selected;
}

const pagesArgument = process.argv.find((argument) => argument.startsWith("--page-budget="));
const requestedBudget = pagesArgument ? Number(pagesArgument.slice("--page-budget=".length)) : 100;
if (!Number.isInteger(requestedBudget) || requestedBudget < 1 || requestedBudget > 100) {
  throw new Error("--page-budget must be an integer between 1 and 100.");
}

async function main() {
  loadLocalEnvironment();
  const startDate = dateValue(process.env.HISTORICAL_WOEK_BACKFILL_START, historicalWoeKBackfillStart);
  const endDate = dateValue(process.env.HISTORICAL_WOEK_BACKFILL_END, new Date().toISOString().slice(0, 10));
  const result = await runHistoricalDipBackfillStep({
    startDate,
    endDate,
    pageBudget: requestedBudget
  });
  console.log(JSON.stringify({ status: "completed_step", ...result }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Historical backfill step failed.");
  process.exit(1);
});
