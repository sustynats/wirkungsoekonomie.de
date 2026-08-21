import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");

const checks = [
  {
    file: "app/page.tsx",
    required: [
      "Von der politischen Absicht zur tatsächlichen Wirkung.",
      "Politik prüft Folgen bereits heute.",
      "WÖk-Systemcheck",
      "Zustandsveränderungen festgestellt und – soweit möglich – zugerechnet"
    ]
  },
  {
    file: "app/[section]/page.tsx",
    required: [
      "Die WÖk beginnt nicht dort, wo bestehende Folgenabschätzung endet",
      "CanonicalMethodExplainer",
      "SDG+ ist keine UN-Kategorie.",
      "Was die WÖk nicht behauptet",
      "Was die WÖk zusätzlich leistet"
    ]
  },
  {
    file: "app/components/CanonicalMethodExplainer.tsx",
    required: [
      "Gibt es das behauptete Problem wirklich - und was genau ist es?",
      "Wirkungsanalyse: A → M → ΔZ → R",
      "fachlich freigegebenen WÖk-Handlungsoption",
      "MasterItem",
      "StateVariable",
      "Analysis / RealityCheck",
      "Nichtkompensation"
    ]
  },
  {
    file: "app/components/DecisionReadinessGate.tsx",
    required: ["wirkungsbezogen noch nicht entscheidungsreif"]
  },
  {
    file: "app/laender/sachsen-anhalt/page.tsx",
    required: [
      "Nachhaltigkeitsstrategie Sachsen-Anhalts",
      "SDGs, SDG+, Mensch – Planet – Demokratie, Recht und Landeszielen"
    ]
  },
  {
    file: "data/jurisdictions.ts",
    required: [
      "SDG+ ist eine transparente WÖk-Erweiterung, keine offizielle UN-Kategorie.",
      "Demokratie ist zugleich Wirkungsraum, Schutzgut und Korrekturraum."
    ]
  }
];

let failed = false;
for (const check of checks) {
  const source = await readFile(path.join(projectRoot, check.file), "utf8");
  for (const text of check.required) {
    if (!source.includes(text)) {
      console.error(`Positioning pass check failed: ${check.file} is missing ${JSON.stringify(text)}.`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("Positioning pass check passed.");
