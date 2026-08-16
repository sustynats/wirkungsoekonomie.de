import fs from "node:fs";
import path from "node:path";

function fail(message) {
  console.error(`FACHBASIS RELEASE CHECK FAILED: ${message}`);
  process.exitCode = 1;
}

const dossierRoot = path.resolve("public/fachakten/dossiers");
const requiredProgrammeDossiers = [
  "sachsen-anhalt-cdu", "sachsen-anhalt-spd", "sachsen-anhalt-gruene", "sachsen-anhalt-linke", "sachsen-anhalt-afd", "sachsen-anhalt-bsw",
  "bund-btw-2025-cdu-csu", "bund-btw-2025-spd", "bund-btw-2025-gruene", "bund-btw-2025-linke", "bund-btw-2025-afd", "bund-btw-2025-ssw", "bund-coalition-2025-cdu-csu-spd"
];
const dossierStylesheet = path.resolve("public/fachakten/dossiers.css");
if (!fs.existsSync(dossierStylesheet) || fs.statSync(dossierStylesheet).size < 1_000) fail("External dossier stylesheet is missing or implausibly short.");

for (const id of requiredProgrammeDossiers) {
  const file = path.join(dossierRoot, `${id}.html`);
  if (!fs.existsSync(file)) fail(`Required public programme dossier missing: ${id}`);
  if (fs.statSync(file).size < 4_000) fail(`Public programme dossier is implausibly short: ${id}`);
  const html = fs.readFileSync(file, "utf8");
  if (/<style[\s>]/i.test(html)) fail(`Public programme dossier still uses CSP-blocked inline styles: ${id}`);
  if (!html.includes('href="/fachakten/dossiers.css"')) fail(`Public programme dossier does not load the shared stylesheet: ${id}`);
  if (/\b(?:SECURITY_POLICE_JUSTICE|TAX_FISCAL_BUDGET|EDUCATION|MULTI_LEVEL|CONDITIONAL)\b/.test(html)) fail(`Public programme dossier exposes known machine labels: ${id}`);
}

const publicIndex = JSON.parse(fs.readFileSync("data/fachakten/public/index.json", "utf8"));
for (const sourceKey of ["ltw-2026-st-cdu", "ltw-2026-st-spd", "ltw-2026-st-gruene", "ltw-2026-st-linke", "ltw-2026-st-afd", "ltw-2026-st-bsw"]) {
  const summary = publicIndex.programmes?.[sourceKey];
  for (const field of ["resultHeadline", "resultTeaser", "potentialHighlights", "riskHighlights", "conditions"]) {
    if (!summary?.[field] || summary[field].length === 0) fail(`${sourceKey} is missing its public result field: ${field}`);
  }
}

const projection = JSON.parse(fs.readFileSync("data/public-working-acts.json", "utf8"));
if (!Array.isArray(projection) || projection.length !== 28) fail("Expected all 28 Release-1 working acts.");
for (const item of projection) {
  if (!item.fachakteId || !/^case-[0-9a-f-]{36}$/i.test(item.fachakteId)) fail(`${item.slug} is missing its complete fachakte link.`);
  if (!item.plainTitle || /^Wirkungsökonomische Vorprüfung/i.test(item.plainTitle)) fail(`${item.slug} has no publishable short title.`);
  if (!item.summary || /Die Entscheidung (steht noch aus|ist getroffen)\. Die Akte zeigt/i.test(item.summary)) fail(`${item.slug} still has a generic release summary.`);
  const dossier = path.join(dossierRoot, `${item.fachakteId}.html`);
  if (!fs.existsSync(dossier) || fs.statSync(dossier).size < 4_000) fail(`${item.slug} is missing its complete public dossier.`);
}

if (!process.exitCode) console.log(JSON.stringify({ status: "pass", stateProgrammeFachakten: 6, federalProgrammeFachakten: 7, decisionFachakten: 28, fullPublicDossiers: 41 }));
