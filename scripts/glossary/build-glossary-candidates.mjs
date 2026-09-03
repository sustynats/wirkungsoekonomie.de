import fs from "node:fs";
import path from "node:path";
import { readYamlList } from "../lib/simple-yaml.mjs";

const root = process.cwd();
const source = path.join(root, "src/data/glossary.candidates.yml");
const out = path.join(root, "public/data/glossary-candidates.json");
const candidates = readYamlList(source, "candidates");

fs.writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), candidates }, null, 2)}\n`);
console.log(`Wrote ${candidates.length} glossary candidates.`);

