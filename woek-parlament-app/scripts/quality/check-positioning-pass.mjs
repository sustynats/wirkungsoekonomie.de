import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");

const checks = [
  {
    file: "app/page.tsx",
    required: [
      "title: portalUsp.lead",
      "lead: portalUsp.context",
      "WÖk-Systemcheck",
      "Was verändert sich? Was wäre ohne die Entscheidung geschehen?"
    ]
  },
  {
    file: "app/[section]/page.tsx",
    required: [
      "Was WÖk zusätzlich verbindet",
      "GFA, Nachhaltigkeitsprüfung, eNAP, DNS-Indikatoren und Destatis-Monitoring",
      "portalUsp.pathFormula",
      "portalUsp.causalEffect",
      "Zustandsveränderung feststellen",
      "SDG+ ist keine UN-Kategorie.",
      "Was die WÖk nicht behauptet",
      "Was die WÖk zusätzlich leistet"
    ]
  },
  {
    file: "lib/content/portal-usp.ts",
    required: [
      "Folgen prüfen reicht nicht. Entscheidend ist, welche Zustandsveränderung eine Entscheidung auslöst - und ob eine realistische Alternative voraussichtlich wirksamer wäre.",
      "Deutschland prüft Gesetzesfolgen und Nachhaltigkeitswirkungen bereits heute.",
      "A -> M -> ΔZ -> R",
      "ΔW = Z_beobachtet - Z_gegenfaktisch"
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
