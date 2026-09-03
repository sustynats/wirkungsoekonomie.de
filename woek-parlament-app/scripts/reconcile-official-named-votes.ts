import { readFileSync } from "node:fs";
import path from "node:path";

import { reconcileOfficialNamedVotes } from "@/lib/bundestag/named-vote-reconciliation";

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
    // A protected scheduled job supplies its environment directly.
  }
}

function argument(name: string, fallback: string) {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
}

async function main() {
  loadLocalEnvironment();
  console.log(JSON.stringify(await reconcileOfficialNamedVotes({
    startDate: argument("start", "2025-05-06"),
    endDate: argument("end", new Date().toISOString().slice(0, 10)),
    maximumVotes: Number(argument("maximum", "100"))
  }), null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not reconcile official named votes.");
  process.exit(1);
});
