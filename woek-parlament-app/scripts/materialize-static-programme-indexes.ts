import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { buildSaxonyAnhaltProgrammeIndex } from "@/lib/presentation/sachsen-anhalt-programme-index";

async function main() {
  const outputRoot = process.argv[2];
  if (!outputRoot || !path.isAbsolute(outputRoot)) throw new Error("Expected an absolute static output directory.");

  for (const programme of saxonyAnhaltElectionProgrammes) {
    const payload = await buildSaxonyAnhaltProgrammeIndex(programme.sourceKey);
    if (!payload) throw new Error(`Missing programme index for ${programme.sourceKey}`);
    const directory = path.join(outputRoot, "ebenen", "laender", "sachsen-anhalt", "wahlprogramme", programme.sourceKey);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.json"), `${JSON.stringify(payload)}\n`);
    console.log(`STATIC_PROGRAMME_INDEX=${programme.sourceKey}:${payload.total}`);
  }
}

void main();
