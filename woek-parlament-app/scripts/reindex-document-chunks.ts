#!/usr/bin/env tsx

import { readFileSync } from "node:fs";
import path from "node:path";
import { persistDocumentChunks } from "@/lib/editorial/document-structure";
import { supabaseRest } from "@/lib/database/supabase-admin";

type Version = { id: string; normalized_text: string | null };

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
  const documentId = requiredArgument("document-id");
  const versions = await supabaseRest<Version[]>(
    `parliament.document_versions?document_id=eq.${encodeURIComponent(documentId)}&select=id,normalized_text&order=retrieved_at.desc&limit=1`
  );
  const version = versions[0];
  if (!version?.normalized_text) throw new Error("The official document has no stored text to re-index.");
  const chunks = await persistDocumentChunks(version.id, version.normalized_text);
  console.log(JSON.stringify({ document_id: documentId, document_version_id: version.id, chunks }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Document chunk re-indexing failed.");
  process.exit(1);
});
