import { readFileSync } from "node:fs";
import path from "node:path";
import { checkCandidateAvailability } from "@/lib/editorial/evidence-availability";

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
  const maximum = Number(process.argv.find((argument) => argument.startsWith("--maximum="))?.slice("--maximum=".length) ?? 30);
  console.log(JSON.stringify(await checkCandidateAvailability(maximum), null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not check candidate availability.");
  process.exit(1);
});
