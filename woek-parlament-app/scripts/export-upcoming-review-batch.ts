#!/usr/bin/env tsx

import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createReviewBatch } from "@/lib/editorial/review-batches";
import { exportReviewBatch } from "@/lib/editorial/review-export";
import { supabaseRest } from "@/lib/database/supabase-admin";

type CaseRow = { id: string; title: string; current_stage: string | null };

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

function argument(name: string) {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main() {
  loadLocalEnvironment();
  const externalCaseId = argument("external-case-id");
  if (!externalCaseId || !/^[A-Za-z0-9._-]+$/.test(externalCaseId)) {
    throw new Error("--external-case-id=<amtliche DIP-Vorgangs-ID> is required.");
  }
  const rows = await supabaseRest<CaseRow[]>(
    `parliament.cases?select=id,title,current_stage&external_case_id=eq.${encodeURIComponent(externalCaseId)}&limit=1`
  );
  const caseRow = rows[0];
  if (!caseRow) throw new Error("The requested official parliamentary case is not in the protected import.");

  const created = await createReviewBatch({
    caseIds: [caseRow.id],
    reviewType: "FULL_REVIEW",
    reviewContext: "EX_ANTE",
    createdBy: "SYSTEM_UPCOMING_PREPARATION"
  });
  const exported = await exportReviewBatch(created.id);
  const output = argument("output") ?? path.resolve(process.cwd(), ".local/external-review/upcoming", exported.zip.filename);
  await mkdir(path.dirname(path.resolve(output)), { recursive: true });
  await writeFile(path.resolve(output), exported.zip.bytes);
  console.log(JSON.stringify({
    batch_code: exported.batchCode,
    case_id: caseRow.id,
    title: caseRow.title,
    parliamentary_status: caseRow.current_stage,
    output: path.resolve(output),
    discord_notification: exported.notification.status
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not export upcoming review batch.");
  process.exit(1);
});
