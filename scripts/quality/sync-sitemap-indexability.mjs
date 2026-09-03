import {
  synchronizeSitemapIndexability,
} from "../lib/method-version-indexability.mjs";

const checkOnly = process.argv.includes("--check");
const result = synchronizeSitemapIndexability({
  siteRoot: process.cwd(),
  excludedRoutes: ["/tools/"],
  write: !checkOnly,
});

if (checkOnly && result.changed) {
  throw new Error(
    `Sitemap ist nicht indexierbar synchronisiert: ${result.removedNoindex.length} noindex-, ${result.removedDuplicates.length} Duplikat- und ${result.removedExcluded.length} ausgeschlossene Einträge; ${result.added.length} aktuelle Einträge fehlen.`,
  );
}

console.log(
  `Sitemap-Indexierbarkeit ${checkOnly ? "geprüft" : "synchronisiert"}: ${result.removedNoindex.length} noindex entfernt, ${result.removedDuplicates.length} Duplikate entfernt, ${result.removedExcluded.length} ausgeschlossene Routen entfernt, ${result.added.length} aktuelle Routen ergänzt.`,
);
