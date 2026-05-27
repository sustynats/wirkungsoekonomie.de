import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryFile = path.join(root, "public/data/glossary.terms.json");
const glossaryFile = path.join(root, "glossar.html");
const auditFile = path.join(root, "docs/glossary-coverage-audit.md");

const registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
const html = fs.readFileSync(glossaryFile, "utf8");
const terms = registry.terms || [];

const classicStart = html.indexOf('<section class="section section-muted" id="glossar"');
const classicEnd = html.indexOf("\n    </main>", classicStart);
const specialStart = html.indexOf('<section class="section" id="daten-standards-glossar"');
const specialEnd = html.indexOf('<section class="section" id="externe-quellen-glossar"', specialStart);

if (classicStart === -1 || classicEnd === -1 || specialStart === -1 || specialEnd === -1) {
  throw new Error("Could not locate glossary sections for coverage audit.");
}

const classicHtml = html.slice(classicStart, classicEnd);
const specialHtml = html.slice(specialStart, specialEnd);

function isDataStandardsTerm(term) {
  return (
    term.showInCategoryGlossary === true ||
    Boolean(term.dataStandardsGroup) ||
    (term.categories || []).includes("daten-standards-regularien")
  );
}

function escMd(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function termLabel(term) {
  return term.canonicalLabel || term.label || term.termId;
}

function normalizeAlias(value) {
  return String(value ?? "")
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ö/g, "o")
    .replace(/ä/g, "a")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "");
}

function pageExists(term) {
  const url = term.pageUrl || `/begriffe/${term.slug}/`;
  const clean = url.replace(/^\/+/, "").replace(/\/+$/, "");
  const candidates = [
    path.join(root, clean, "index.html"),
    path.join(root, `${clean}.html`),
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

const idCounts = new Map();
for (const term of terms) {
  const id = term.termId || term.id;
  idCounts.set(id, (idCounts.get(id) || 0) + 1);
}
const duplicateIds = Array.from(idCounts.entries()).filter(([, count]) => count > 1);

const aliasMap = new Map();
for (const term of terms) {
  const values = [termLabel(term), ...(term.aliases || []), ...(term.synonyms || [])];
  for (const value of values) {
    const normalized = normalizeAlias(value);
    if (!normalized) continue;
    if (!aliasMap.has(normalized)) aliasMap.set(normalized, new Set());
    aliasMap.get(normalized).add(term.termId || term.id);
  }
}

function assertAliasGroup(expectedId, aliases) {
  const failures = [];
  for (const alias of aliases) {
    const ids = Array.from(aliasMap.get(normalizeAlias(alias)) || []);
    if (ids.length !== 1 || ids[0] !== expectedId) {
      failures.push(`${alias} -> ${ids.length ? ids.join(", ") : "nicht gefunden"}`);
    }
  }
  return failures;
}

const aliasFailures = [
  ...assertAliasGroup("eu-taxonomie", ["EU-Taxonomie", "EU Taxonomy", "EU-Taxonomy"]),
  ...assertAliasGroup("social-taxonomy", ["Social Taxonomy", "Sozialtaxonomie"]),
  ...assertAliasGroup("european-green-deal", ["Green Deal", "European Green Deal", "Europäischer Green Deal", "GreenDeal"]),
];

const rows = terms.map((term) => {
  const id = term.termId || term.id;
  const dataTerm = isDataStandardsTerm(term);
  const classicFlag = term.classicGlossary === true;
  const classicPresent = classicHtml.includes(`data-classic-term-id="${id}"`);
  const specialPresent = dataTerm ? specialHtml.includes(`data-term-id="${id}"`) : false;
  const aliases = term.aliases || term.synonyms || [];
  const aliasPresent = aliases.length > 0;
  const ownPage = pageExists(term);
  const statuses = [];
  if (duplicateIds.some(([duplicateId]) => duplicateId === id)) statuses.push("Duplikat");
  if (dataTerm && !classicFlag) statuses.push("fehlt klassisch");
  if (!classicPresent && classicFlag) statuses.push("fehlt klassisch");
  if (dataTerm && !specialPresent) statuses.push("fehlt Spezialbereich");
  if (dataTerm && !aliasPresent) statuses.push("fehlende Alias-Schreibweise");
  if (!ownPage) statuses.push("fehlende Begriffseite");
  if (!statuses.length) statuses.push("ok");
  return {
    id,
    label: termLabel(term),
    category: dataTerm ? term.dataStandardsGroup || "Daten, Standards und Regularien" : term.category || "Glossar",
    classicPresent,
    specialPresent,
    aliasPresent,
    ownPage,
    status: statuses.join(", "),
    dataTerm,
    aliases,
  };
});

const dataTerms = rows.filter((row) => row.dataTerm);
const classicTerms = rows.filter((row) => {
  const term = terms.find((candidate) => (candidate.termId || candidate.id) === row.id);
  return term?.classicGlossary === true;
});
const aliasCount = terms.reduce((sum, term) => sum + (term.aliases || term.synonyms || []).length, 0);
const duplicateCount = duplicateIds.length;
const errorRows = rows.filter((row) =>
  row.status
    .split(", ")
    .some((status) =>
      ["Duplikat", "fehlt klassisch", "fehlt Spezialbereich", "fehlende Alias-Schreibweise", "fehlende Begriffseite"].includes(status)
    )
);
const errors = [
  ...errorRows.map((row) => `${row.label}: ${row.status}`),
  ...aliasFailures.map((failure) => `Alias-Gruppe fehlerhaft: ${failure}`),
];

const md = `# Glossary Coverage Audit

Stand: ${new Date().toISOString()}

## Zusammenfassung

| Metrik | Wert |
| --- | ---: |
| Begriffe im klassischen Glossar | ${classicTerms.length} |
| Begriffe im Bereich Daten/Standards/Regularien | ${dataTerms.length} |
| Alias-Einträge | ${aliasCount} |
| Erkannte Dubletten | ${duplicateCount} |
| Korrigierte Dubletten | 0 |
| Alias-Gruppenfehler | ${aliasFailures.length} |
| Coverage-Status | ${errors.length ? "Fehler" : "ok"} |

## Pflicht-Aliasgruppen

| Gruppe | Status |
| --- | --- |
| EU-Taxonomie / EU Taxonomy / EU-Taxonomy | ${assertAliasGroup("eu-taxonomie", ["EU-Taxonomie", "EU Taxonomy", "EU-Taxonomy"]).length ? "Fehler" : "ok"} |
| Social Taxonomy / Sozialtaxonomie | ${assertAliasGroup("social-taxonomy", ["Social Taxonomy", "Sozialtaxonomie"]).length ? "Fehler" : "ok"} |
| Green Deal / European Green Deal / Europäischer Green Deal / GreenDeal | ${assertAliasGroup("european-green-deal", ["Green Deal", "European Green Deal", "Europäischer Green Deal", "GreenDeal"]).length ? "Fehler" : "ok"} |

## Begriffsabdeckung

| Begriff | Kategorie | im klassischen Glossar | im Spezialbereich | Alias vorhanden | eigene Begriffseite | Status |
| --- | --- | --- | --- | --- | --- | --- |
${rows
  .map(
    (row) =>
      `| ${escMd(row.label)} | ${escMd(row.category)} | ${row.classicPresent ? "ja" : "nein"} | ${row.specialPresent ? "ja" : row.dataTerm ? "nein" : "-"} | ${row.aliasPresent ? "ja" : "nein"} | ${row.ownPage ? "ja" : "nein"} | ${escMd(row.status)} |`
  )
  .join("\n")}
`;

fs.mkdirSync(path.dirname(auditFile), { recursive: true });
fs.writeFileSync(auditFile, md, "utf8");

if (errors.length) {
  console.error(`Glossary coverage check failed with ${errors.length} issue(s).`);
  for (const error of errors.slice(0, 25)) console.error(`- ${error}`);
  if (errors.length > 25) console.error(`- ${errors.length - 25} weitere Fehler im Audit`);
  process.exit(1);
}

console.log(`Glossary coverage check passed: ${classicTerms.length} classic terms, ${dataTerms.length} data/standards terms, ${aliasCount} aliases.`);
