import { readFileSync } from "node:fs";
import path from "node:path";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { queueStoredEvidenceCandidates } from "@/lib/editorial/evidence-candidates";

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
  const batchCode = process.argv.find((argument) => argument.startsWith("--batch-code="))?.slice("--batch-code=".length);
  if (!batchCode || !/^WOEK-REVIEW-\d{4}-\d{4}$/.test(batchCode)) {
    throw new Error("Usage: review:queue-existing-evidence -- --batch-code=WOEK-REVIEW-YYYY-NNNN");
  }
  const batches = await supabaseRest<Array<{ id: string }>>(`parliament.review_batches?batch_code=eq.${encodeURIComponent(batchCode)}&select=id&limit=1`);
  if (!batches[0]) throw new Error("Review batch was not found.");
  console.log(JSON.stringify({ batchCode, ...(await queueStoredEvidenceCandidates(batches[0].id)) }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not queue existing evidence candidates.");
  process.exit(1);
});
