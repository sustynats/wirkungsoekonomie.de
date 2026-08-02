import {
  normalizeHistoricalMethodRobots,
} from "../lib/method-version-indexability.mjs";

const checkOnly = process.argv.includes("--check");
const result = normalizeHistoricalMethodRobots(process.cwd(), { write: !checkOnly });

if (result.missingPrefixes.length || result.unresolved.length) {
  const problems = [
    ...result.missingPrefixes.map((route) => `fehlende historische Route: ${route}`),
    ...result.unresolved.map((route) => `Robots-Metadatum nicht gesetzt: ${route}`),
  ];
  throw new Error(`Historische Methoden-SEO unvollständig:\n${problems.join("\n")}`);
}

console.log(
  `Historische Methoden-SEO ${checkOnly ? "geprüft" : "normalisiert"}: ${result.files.length} Seite(n), ${result.changed.length} Robots-Metadatum/-daten angepasst.`,
);
