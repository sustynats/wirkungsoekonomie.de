import fs from "node:fs";
import path from "node:path";
import { readYamlList } from "../lib/simple-yaml.mjs";

const root = process.cwd();
const source = path.join(root, "src/data/glossary.terms.yml");
const out = path.join(root, "public/data/glossary.terms.json");
const historyOut = path.join(root, "public/data/glossary-version-history.json");

const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });
const terms = readYamlList(source, "terms").sort((a, b) =>
  collator.compare(a.glossaryOrderKey || a.canonicalLabel, b.glossaryOrderKey || b.canonicalLabel)
);

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), terms }, null, 2)}\n`);

const history = {
  generatedAt: new Date().toISOString(),
  entries: [
    {
      date: "2026-05-23",
      type: "new-term-registry",
      source,
      status: "approved",
      reason: "Phase-1A-Zentralisierung der führenden WÖk-Begriffsschicht.",
      affectedTerms: terms.map((term) => term.termId),
    },
  ],
};
fs.writeFileSync(historyOut, `${JSON.stringify(history, null, 2)}\n`);
console.log(`Wrote ${terms.length} glossary terms to ${path.relative(root, out)}.`);

