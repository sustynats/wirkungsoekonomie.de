import fs from "node:fs";
import path from "node:path";
import { readYamlList } from "../lib/simple-yaml.mjs";

const root = process.cwd();
const source = path.join(root, "src/data/glossary.terms.yml");
const out = path.join(root, "public/data/glossary.terms.json");
const historyOut = path.join(root, "public/data/glossary-version-history.json");
const hoverOut = path.join(root, "assets/js/glossaryTerms.js");

const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });
const terms = readYamlList(source, "terms").sort((a, b) =>
  collator.compare(a.glossaryOrderKey || a.canonicalLabel, b.glossaryOrderKey || b.canonicalLabel)
);

function categoryFor(term) {
  const section = String(term.sourceSection || "").toLowerCase();
  const id = String(term.termId || "").toLowerCase();
  if (section.includes("governance") || ["wirkungsrat", "wirkungswahrheit", "social-credit"].includes(id)) return "Schutzbegriff";
  if (section.includes("daten") || ["woek-id", "digitaler-produktpass", "wirkungsdaten", "wirkungsdatenraum", "nace", "esrs", "gri", "csrd"].includes(id)) return "Datenbegriff";
  if (section.includes("instrument") || ["nwi", "t-sroi", "finalscore", "scorecard", "benchmark"].includes(id)) return "Messbegriff";
  if (["wirkungssteuer", "wirkungssteuergesetz", "wirkungsumsatzsteuer", "wirkungslenkung", "wirkungshaushalt"].includes(id)) return "Steuerungsbegriff";
  if (["wirkungsarchitektur", "wirkungsnetz", "wirkungsraum", "resonanzraum"].includes(id)) return "Architekturbegriff";
  if (["sdg-plus", "mensch-planet-demokratie", "demokratie"].includes(id)) return "Demokratiebegriff";
  if (["positive-netto-wirkung", "netto-wirkung", "positive-wirkung", "negative-wirkung", "neutrale-wirkung", "reverse-merit-order", "nichtkompensationsprinzip", "wirkungsgrenze", "folgencheck"].includes(id)) return "Bewertungsbegriff";
  if (["wirkungseinkommen", "wirkungsrente", "wirkungspunkte", "faktencheck"].includes(id)) return "Praxisbegriff";
  return "Grundbegriff";
}

const enrichedTerms = terms.map((term) => ({
  category: categoryFor(term),
  ...term,
}));

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), terms: enrichedTerms }, null, 2)}\n`);

const allowedContexts = ["home", "page", "reference", "blog", "academy", "method", "glossary"];
const hoverTerms = enrichedTerms.map((term, index) => ({
  key: term.termId,
  label: term.canonicalLabel,
  aliases: term.synonyms || [],
  definition: term.hoverDefinition || term.shortDefinition,
  url: `/begriffe/${term.slug}/`,
  priority: index + 1,
  allowedContexts,
}));
fs.mkdirSync(path.dirname(hoverOut), { recursive: true });
fs.writeFileSync(
  hoverOut,
  `window.WIRKUNG_GLOSSARY_TERMS = ${JSON.stringify(hoverTerms, null, 2)};\n`
);

const history = {
  generatedAt: new Date().toISOString(),
  entries: [
    {
      date: "2026-05-23",
      type: "new-term-registry",
      source,
      status: "approved",
      reason: "Phase-1A-Zentralisierung der führenden WÖk-Begriffsschicht.",
      affectedTerms: enrichedTerms.map((term) => term.termId),
    },
  ],
};
fs.writeFileSync(historyOut, `${JSON.stringify(history, null, 2)}\n`);
console.log(`Wrote ${enrichedTerms.length} glossary terms to ${path.relative(root, out)} and hover terms to ${path.relative(root, hoverOut)}.`);
