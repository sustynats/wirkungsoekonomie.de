import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "reports/state-sustainability-sitewide-audit-2026-08-21.json");
const errors = [];

const requiredTerms = [
  "deutsche-nachhaltigkeitsstrategie",
  "gemeinsame-geschaeftsordnung-bundesministerien",
  "gesetzesfolgenabschaetzung",
  "nachhaltigkeitspruefung-bund",
  "enap",
  "egesetzgebung-egfa",
  "dns-indikator",
  "zielbezug-vs-wirkung",
  "ex-ante-folgenpruefung-reality-check",
  "staatliche-nachhaltigkeitsarchitektur",
  "parlamentarischer-beirat-nachhaltige-entwicklung",
  "state-gfa-enap-benchmark",
  "wirkungsblindheit",
];

const requiredSources = Array.from({ length: 9 }, (_, index) => `WÖK-Q-${9029 + index}`);

const architecturePages = new Map([
  ["index.html", ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE", "CORRECT_OVERCLAIM", "ADD_GLOSSARY_CROSSLINKS"]],
  ["modell.html", ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE", "CORRECT_OVERCLAIM"]],
  ["methodik/index.html", ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE", "ADD_GGO_GFA_REFERENCE", "ADD_ENAP_REFERENCE"]],
  ["methodik/datenbasis.html", ["ADD_DNS_REFERENCE", "ADD_GGO_GFA_REFERENCE", "ADD_ENAP_REFERENCE"]],
  ["methodik/daten-standards-regularien.html", ["ADD_DNS_REFERENCE", "ADD_GGO_GFA_REFERENCE", "ADD_ENAP_REFERENCE"]],
  ["methodik/externe-quellen.html", ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE", "ADD_SOURCE_LINKS"]],
  ["fuer/politik.html", ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE", "ADD_BENCHMARK_COMPARISON", "ADD_PORTAL_CROSSLINK"]],
  ["wirkungsfelder/staat-recht-demokratie/index.html", ["CORRECT_OVERCLAIM", "ADD_STATE_SUSTAINABILITY_ARCHITECTURE", "ADD_SOURCE_LINKS"]],
  ["wirkungswissenschaften/index.html", ["CORRECT_OVERCLAIM", "ADD_STATE_SUSTAINABILITY_ARCHITECTURE"]],
  ["verstehen/index.html", ["CORRECT_OVERCLAIM", "ADD_STATE_SUSTAINABILITY_ARCHITECTURE"]],
]);

const expectedArtifacts = [
  "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.6-staatsarchitektur.md",
  "source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.6.md",
  "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.6.pdf",
  "content/documents/online/woek-begriffsleitfaden-fuehrend.inc",
  "data/master-register/WOeK_Masterregister_v1.5_2026-08-21.xlsx",
  "assets/downloads/woek-register/v1.5/WOeK_Masterregister_v1.5_2026-08-21.xlsx",
  "assets/downloads/woek-register/v1.5/register-v1.5.csv",
  "assets/downloads/woek-register/v1.5/register-v1.5.json",
  "assets/downloads/woek-register/v1.5/manifest.json",
  "assets/downloads/woek-register/v1.4/WOeK_Masterregister_v1.4_FINAL_2026-08-16.xlsx",
  "assets/downloads/woek-register/v1.4/manifest.json",
  "bibliothek/woek-master-items-register/index.html",
  "woek-id-register/index.html",
  "woek-id-register/methodik/index.html",
  "woek-parlament-app/app/methodik/wirkindikatoren/page.tsx",
];

for (const rel of expectedArtifacts) {
  if (!fs.existsSync(path.join(root, rel))) errors.push(`Erwartetes Release-Artefakt fehlt: ${rel}`);
}

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const glossaryDocument = readJson("public/data/glossary.terms.json");
const glossaryTerms = Array.isArray(glossaryDocument) ? glossaryDocument : glossaryDocument.terms || [];
const glossaryById = new Map(glossaryTerms.map((term) => [term.termId, term]));

for (const termId of requiredTerms) {
  const term = glossaryById.get(termId);
  if (!term) {
    errors.push(`Glossarbegriff fehlt: ${termId}`);
    continue;
  }
  const detailPath = path.join(root, "begriffe", term.slug, "index.html");
  if (!fs.existsSync(detailPath)) errors.push(`Glossar-Detailseite fehlt: begriffe/${term.slug}/index.html`);
  const pageUrl = String(term.pageUrl || "");
  const expectedUrl = `/begriffe/${term.slug}/`;
  if (pageUrl !== expectedUrl) errors.push(`Glossar-URL/Slug-Divergenz für ${termId}: ${pageUrl} != ${expectedUrl}`);
  const sourceLinks = Array.isArray(term.officialSources) ? term.officialSources.join(" ") : "";
  if (!/\/quellenarchiv\/wok-q-\d{4}\//.test(sourceLinks)) {
    errors.push(`Amtliche interne Quellenroute fehlt beim Glossarbegriff: ${termId}`);
  }
}

const sourceDocuments = [
  readJson("content/quellenarchiv/sources.json"),
  readJson("content/quellenarchiv/legal-source-records.json"),
  readJson("content/quellenarchiv/evidence-source-records.json"),
];
const sourceRecords = sourceDocuments.flatMap((document) => Array.isArray(document) ? document : document.sources || []);
const sourcesByCode = new Map(sourceRecords.map((source) => [source.code, source]));

for (const code of requiredSources) {
  const source = sourcesByCode.get(code);
  if (!source) {
    errors.push(`Quellenarchiv-Eintrag fehlt: ${code}`);
    continue;
  }
  if (!String(source.url || "").startsWith("https://")) errors.push(`Amtliche Original-URL fehlt: ${code}`);
  if (!source.sourceFunction || !source.dataFunction) errors.push(`Quellen-/Datenfunktion fehlt: ${code}`);
  const slug = code.toLowerCase().replace("wök", "wok");
  const detailRel = `quellenarchiv/${slug}/index.html`;
  const detailPath = path.join(root, detailRel);
  if (!fs.existsSync(detailPath)) {
    errors.push(`Interne Quellen-Detailseite fehlt: ${detailRel}`);
  } else {
    const html = fs.readFileSync(detailPath, "utf8");
    if (!html.includes(source.url)) errors.push(`Originalquelle ist auf der Detailseite nicht verlinkt: ${code}`);
  }
}

for (const rel of architecturePages.keys()) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    errors.push(`Pflichtseite fehlt: ${rel}`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes("state-sustainability-architecture-20260821")) {
    errors.push(`Staatsarchitektur-Marker fehlt oder wurde im Build überschrieben: ${rel}`);
  }
}

const forbiddenCurrentClaims = [
  /Deutschland (?:besitzt|hat|verfügt über) (?:noch )?keine (?:institutionalisierte )?(?:Gesetzesfolgen|Nachhaltigkeits)/i,
  /staatliche(?:n|r|s)? (?:Wirkungs|Folgen|Nachhaltigkeits)prüfung (?:existiert|gibt es) nicht/i,
  /WÖk (?:ist|war) (?:die )?erste (?:Methode|Architektur|Disziplin)/i,
];
for (const rel of architecturePages.keys()) {
  if (!fs.existsSync(path.join(root, rel))) continue;
  const html = fs.readFileSync(path.join(root, rel), "utf8");
  for (const pattern of forbiddenCurrentClaims) {
    if (pattern.test(html)) errors.push(`Unzulässige Neuheits-/Abwesenheitsbehauptung auf ${rel}: ${pattern}`);
  }
}

const politics = fs.readFileSync(path.join(root, "fuer/politik.html"), "utf8");
const problemIndex = Math.max(politics.indexOf("Problem Review"), politics.indexOf("Problemprüfung"));
const goalIndex = Math.max(politics.indexOf("Goal Review"), politics.indexOf("Zielprüfung"));
if (problemIndex < 0 || goalIndex < 0 || problemIndex > goalIndex) {
  errors.push("Problem Review steht auf fuer/politik.html nicht vor Goal Review.");
}

const guideText = fs.readFileSync(
  path.join(root, "source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.6.md"),
  "utf8",
);
for (const needle of [
  "Deutsche Nachhaltigkeitsstrategie (DNS)",
  "Gemeinsame Geschäftsordnung der Bundesministerien (GGO)",
  "Gesetzesfolgenabschätzung (GFA)",
  "Nachhaltigkeitsprüfung des Bundes",
  "eNAP",
  "eGFA und E-Gesetzgebung",
  "MasterItem → StateVariable → Indicator → Observation → Analysis / Reality Check",
]) {
  if (!guideText.includes(needle)) errors.push(`Begriffsleitfaden v1.6 enthält Pflichtteil nicht: ${needle}`);
}

const registerExport = readJson("assets/downloads/woek-register/v1.5/register-v1.5.json");
const registerItems = registerExport.items || [];
if (registerExport.register_version !== "1.5") errors.push("Registerexport ist nicht Version 1.5.");
if (registerItems.length !== 621 || new Set(registerItems.map((item) => item.WOK_ID)).size !== 621) {
  errors.push("Masterregister v1.5 enthält nicht exakt 621 eindeutige WÖk-IDs.");
}
if (new Set(registerItems.map((item) => item.Ontology_Role)).size !== 1 || registerItems[0]?.Ontology_Role !== "MASTER_ITEM") {
  errors.push("Nicht alle v1.5-Einträge sind als MASTER_ITEM ausgewiesen.");
}
for (const field of ["StateVariable_Status", "Indicator_Mapping_Status"]) {
  const values = new Set(registerItems.map((item) => item[field]));
  if (values.size !== 1 || !values.has("OPEN_REVIEW_REQUIRED")) {
    errors.push(`${field} wurde nicht durchgängig offen und prüfpflichtig gehalten.`);
  }
}
if (!registerItems.every((item) => String(item.Indicator_Registry_Reference || "").includes("/methodik/wirkindikatoren"))) {
  errors.push("Verweis vom Masterregister auf das separate Wirkindikatorenregister ist unvollständig.");
}

const manifest = readJson("assets/downloads/woek-register/v1.5/manifest.json");
if (manifest.id_delta?.retained !== 621 || manifest.id_delta?.added !== 0 || manifest.id_delta?.removed !== 0 || manifest.id_delta?.renamed !== 0) {
  errors.push("v1.4→v1.5-ID-Delta ist nicht korrekt dokumentiert.");
}

const indicatorSource = fs.readFileSync(
  path.join(root, "woek-parlament-app/app/methodik/wirkindikatoren/page.tsx"),
  "utf8",
);
for (const needle of ["DNS", "Wirkindikatorenregister", "Reality Check"]) {
  if (!indicatorSource.includes(needle)) errors.push(`Parlament-Wirkindikatorenregister enthält Pflichtbezug nicht: ${needle}`);
}

const sitemap = fs.existsSync(path.join(root, "sitemap.xml")) ? fs.readFileSync(path.join(root, "sitemap.xml"), "utf8") : "";
const requiredSitemapRoutes = [
  "/begriffe/gemeinsame-geschaeftsordnung-der-bundesministerien/",
  "/quellenarchiv/wok-q-9029/",
  "/bibliothek/woek-master-items-register/",
  "/woek-id-register/",
];
for (const route of requiredSitemapRoutes) {
  if (!sitemap.includes(route)) errors.push(`Sitemap enthält Pflicht-Route nicht: ${route}`);
}

const searchIndexPath = path.join(root, "assets/search/search-index.json");
if (!fs.existsSync(searchIndexPath)) {
  errors.push("Suchindex fehlt: assets/search/search-index.json");
} else {
  const searchIndex = fs.readFileSync(searchIndexPath, "utf8");
  for (const needle of ["Gemeinsame Geschäftsordnung der Bundesministerien", "WÖk-Masterregister v1.5", "Elektronische Nachhaltigkeitsprüfung"] ) {
    if (!searchIndex.includes(needle)) errors.push(`Suchindex enthält Pflichtbegriff nicht: ${needle}`);
  }
}

const excludedDirs = new Set([
  ".git", ".github", ".next", ".vercel", "node_modules", "_site", "source-assets", "content", "docs",
  "scripts", "tools", "reports", "woek-parlament-app", "woek-akademie-app", "woek-institut-app", "outputs",
]);
const htmlFiles = [];
function walk(directory, relative = "") {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirs.has(entry.name)) continue;
    const rel = relative ? `${relative}/${entry.name}` : entry.name;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, rel);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(rel);
  }
}
walk(root);

function routeFor(rel) {
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

function classificationFor(rel) {
  if (architecturePages.has(rel)) return architecturePages.get(rel);
  if (rel === "bibliothek/woek-master-items-register/index.html") return ["REWRITE_REQUIRED", "ADD_PORTAL_CROSSLINK", "ADD_SOURCE_LINKS"];
  if (rel === "bibliothek/woek-begriffsleitfaden-fuehrend/index.html") return ["REWRITE_REQUIRED", "ADD_GLOSSARY_CROSSLINKS", "ADD_SOURCE_LINKS"];
  if (rel === "woek-id-register/index.html" || rel.startsWith("woek-id-register/") && rel.endsWith("/index.html")) return ["REWRITE_REQUIRED", "ADD_PORTAL_CROSSLINK"];
  if (/^quellenarchiv\/wok-q-90(?:29|3[0-7])\/index\.html$/.test(rel)) return ["ADD_SOURCE_LINKS"];
  if (rel.startsWith("begriffe/") && requiredTerms.some((termId) => glossaryById.get(termId)?.slug && rel === `begriffe/${glossaryById.get(termId).slug}/index.html`)) return ["ADD_GLOSSARY_CROSSLINKS", "ADD_SOURCE_LINKS"];
  if (/^(blog|journal|dokumente|veroeffentlichungen)\//.test(rel)) return ["NO_CHANGE_REQUIRED"];
  return ["NO_CHANGE_REQUIRED"];
}

const matrix = htmlFiles.sort().map((sourceFile) => ({
  sourceFile,
  route: routeFor(sourceFile),
  classifications: classificationFor(sourceFile),
}));
const classificationCounts = {};
for (const entry of matrix) {
  for (const classification of entry.classifications) {
    classificationCounts[classification] = (classificationCounts[classification] || 0) + 1;
  }
}

const report = {
  audit: "DNS/GGO/GFA/eNAP/eGFA sitewide",
  issue: 253,
  stand: "2026-08-21",
  status: errors.length ? "FAIL" : "PASS",
  scope: {
    publicHtmlFiles: matrix.length,
    glossaryTerms: glossaryTerms.length,
    requiredGlossaryTerms: requiredTerms.length,
    requiredOfficialSources: requiredSources.length,
    masterItems: registerItems.length,
  },
  gates: {
    STATE_SUSTAINABILITY_ARCHITECTURE_TAUGHT: !errors.some((error) => error.includes("Staatsarchitektur")),
    GFA_ENAP_PRIMARY_SOURCES: !errors.some((error) => error.includes("Quellen")),
    MASTERREGISTER_INDICATOR_REGISTRY_SEPARATED: !errors.some((error) => error.includes("Wirkindikatorenregister")),
    TARGET_ALIGNMENT_NOT_CAUSALITY: guideText.includes("Zielbezug ist kein Kausalitätsnachweis"),
    INDICATOR_NOT_IMPACT: guideText.includes("Indikator ist nicht Wirkung"),
    OUTPUT_NOT_OUTCOME: guideText.includes("Output ist nicht Outcome"),
    OBSERVATION_NOT_ATTRIBUTION: guideText.includes("Beobachtung ist nicht Attribution"),
    HISTORICAL_V14_PRESERVED: fs.existsSync(path.join(root, "assets/downloads/woek-register/v1.4/manifest.json")),
    MASTERITEMS_V15_621_IDS_STABLE: registerItems.length === 621 && new Set(registerItems.map((item) => item.WOK_ID)).size === 621,
  },
  classificationCounts,
  errors,
  matrix,
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (errors.length) {
  console.error(`Staatsarchitektur-Audit fehlgeschlagen (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Staatsarchitektur-Audit bestanden: ${matrix.length} öffentliche HTML-Dateien, ${requiredTerms.length} Pflichtbegriffe, ${requiredSources.length} amtliche Quellen, ${registerItems.length} MasterItems.`);
console.log(`Auditbericht: ${path.relative(root, reportPath)}`);
