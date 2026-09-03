import fs from "node:fs";

const registry = JSON.parse(fs.readFileSync("assets/data/library-version-registry.json", "utf8"));
const documents = registry.documents || [];

function isDossierPublication(value = "") {
  const source = String(value).toLowerCase();
  if (/detailkonzept/.test(source)) return false;
  return (
    /(?:^|\/)dossier(?:s)?\/(?:index\.html|[^/]+\/index\.html)$/.test(source) ||
    /(?:^|\/)gesamtdossier\/index\.html$/.test(source) ||
    /(?:^|\/)[^/]*dossier[^/]*\.pdf$/.test(source)
  );
}

const candidates = documents.filter((doc) => isDossierPublication(doc.urls?.sourcePath || doc.urls?.primary));
const protectedTypes = new Set(["Beispiel", "Grundlagenwerk", "Methodik", "Gesetzesentwurf"]);
const misclassified = candidates.filter((doc) => !protectedTypes.has(doc.type) && doc.type !== "Dossier");
if (candidates.length < 100 || misclassified.length) {
  console.error(`Dossier-Klassifizierung fehlgeschlagen: ${candidates.length} Kandidaten, ${misclassified.length} falsch zugeordnet.`);
  process.exit(1);
}

console.log(`Dossier-Klassifizierung bestanden: ${candidates.length} Veröffentlichungsfassungen als Dossier erkannt.`);
