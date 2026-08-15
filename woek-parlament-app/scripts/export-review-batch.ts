#!/usr/bin/env tsx

import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { exportReviewBatch } from "@/lib/editorial/review-export";

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

function requiredArgument(name: string) {
  const value = process.argv.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3);
  if (!value) throw new Error(`--${name}=… is required.`);
  return value;
}

async function main() {
  loadLocalEnvironment();
  const batchId = requiredArgument("batch-id");
  if (!/^[0-9a-f-]{36}$/i.test(batchId)) throw new Error("--batch-id must be a UUID.");
  const exported = await exportReviewBatch(batchId);
  const output = process.argv.find((argument) => argument.startsWith("--output="))?.slice("--output=".length)
    ?? path.resolve(process.cwd(), ".local/external-review", exported.zip.filename);
  await mkdir(path.dirname(path.resolve(output)), { recursive: true });
  await writeFile(path.resolve(output), exported.zip.bytes);
  console.log(JSON.stringify({ batch_code: exported.batchCode, output: path.resolve(output), discord_notification: exported.notification.status }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not export review batch.");
  process.exit(1);
});
