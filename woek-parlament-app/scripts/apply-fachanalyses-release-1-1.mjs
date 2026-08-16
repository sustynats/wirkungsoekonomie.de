import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const gegRoot = resolve(".local/fachbasis-source-release-1.1/02_parlament_28_and_votes/fachanalysen/geg");
const sourceJsonPath = resolve(gegRoot, "gebaeudeenergiegesetz-medienwirkung.json");
const publicJsonPath = resolve("data/public-fachanalysen.json");

const publicLabels = new Map([
  ["IMPACT POTENTIAL WITH DOCUMENTED MEDIA FRAME", "Wirkungspotenzial mit dokumentiertem Medienframe"],
  ["IMPACT POTENTIAL WITH DOCUMENTED FRAME", "Wirkungspotenzial mit dokumentiertem Frame"],
  ["DOCUMENTED COMPLEXITY AND LIMITED KNOWLEDGE", "Komplexität dokumentiert · Wissensstand begrenzt"],
  ["POLICY DESIGN AND MODELLED PATH", "Politikdesign · modellierter Wirkpfad"],
  ["OFFICIAL OBJECTIVE AND MODELLED POTENTIAL", "Amtliches Ziel · modelliertes Wirkungspotenzial"],
  ["EX ANTE CAUSAL HYPOTHESIS WITH MODEL INPUTS", "Ex-ante-Wirkungshypothese · modellgestützt"],
  ["EX ANTE DESIGN POTENTIAL", "Ex-ante-Designpotenzial"],
  ["MECHANISM PARTLY TESTED EFFECT LIMITED IN ONE STUDY", "Mechanismus teilweise untersucht · Wirkung nur begrenzt belegt"],
  ["FRAME EXISTENCE SUPPORTED CAUSAL BEHAVIOUR UNRESOLVED", "Frame belegt · Verhaltenswirkung kausal offen"],
  ["NOT CAUSALLY ATTRIBUTED", "nicht kausal zugerechnet"],
  ["PARTIAL MECHANISM SUPPORTED NO BEHAVIOURAL ATTRIBUTION", "Teilmechanismus gestützt · keine Verhaltenszurechnung"],
  ["UNRESOLVED", "offen"]
]);

function normalizeReferenceFields(values) {
  return [...new Set(values.map((value) => {
    if (value === "SDG+ Diskurskultur") return "SDG+ Diskursfähigkeit";
    if (value === "SDG+ Resilienz") return "Systemdimension: Wirkungsresilienz";
    if (value === "SDG+ Transparenz/Open Data") return "Kontextbezug: Transparenz und offene Daten";
    return value;
  }))];
}

function updateMarkdown(path) {
  const input = readFileSync(path, "utf8");
  const output = input
    .replace(
      "Output ist nicht automatisch Wirkung – Wirkung beginnt erst bei belastbar beobachtbaren Zustandsveränderungen.",
      "Output ist noch keine Wirkung. Wirkung bezeichnet erst eine tatsächlich beobachtete Zustandsveränderung; ihre Zurechnung zur Maßnahme wird davon getrennt geprüft."
    )
    .replaceAll("SDG+ Diskurskultur", "SDG+ Diskursfähigkeit")
    .replaceAll("SDG+ Resilienz", "Systemdimension Wirkungsresilienz")
    .replaceAll("SDG+ Transparenz/Open Data", "Kontextbezug Transparenz und offene Daten");
  writeFileSync(path, output);
}

const source = JSON.parse(readFileSync(sourceJsonPath, "utf8"));
source.normative_mapping.sdg_sdgplus = normalizeReferenceFields(source.normative_mapping.sdg_sdgplus ?? []);
writeFileSync(sourceJsonPath, `${JSON.stringify(source, null, 2)}\n`);

for (const file of ["FACHANALYSE_GEBAEUDEENERGIEGESETZ.md", "GEG-VOLLSTAENDIGE-PUBLIKATIONSQUELLE.md"]) {
  updateMarkdown(resolve(gegRoot, file));
}

const publicAnalyses = JSON.parse(readFileSync(publicJsonPath, "utf8"));
const geg = publicAnalyses.find((analysis) => analysis.slug === "gebaeudeenergiegesetz-medienwirkung");
if (!geg) throw new Error("Öffentliche GEG-Fachanalyse fehlt.");
geg.referenceStatus = source.normative_mapping.reference_status;
geg.referenceStatusLabel = "Vorgeschlagener Prüfbezug – Referenzabgleich ausstehend";
geg.referenceFields.sdgAndPlus = normalizeReferenceFields(geg.referenceFields.sdgAndPlus ?? []);
for (const collection of [geg.mediaPatterns ?? [], geg.impactPaths ?? []]) {
  for (const item of collection) {
    item.evidenceStatus = publicLabels.get(item.evidenceStatus) ?? item.evidenceStatus;
    if (item.causalStatus) item.causalStatus = publicLabels.get(item.causalStatus) ?? item.causalStatus;
  }
}
writeFileSync(publicJsonPath, `${JSON.stringify(publicAnalyses, null, 2)}\n`);

console.log(JSON.stringify({
  status: "updated",
  reference_status: geg.referenceStatus,
  sources: geg.sources.length,
  reference_fields: geg.referenceFields.sdgAndPlus.length
}));
