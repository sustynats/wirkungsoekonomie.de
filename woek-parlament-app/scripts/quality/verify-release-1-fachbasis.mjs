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

for (const id of requiredProgrammeDossiers) {
  const file = path.join(dossierRoot, `${id}.html`);
  if (!fs.existsSync(file)) fail(`Required public programme dossier missing: ${id}`);
  if (fs.statSync(file).size < 4_000) fail(`Public programme dossier is implausibly short: ${id}`);
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
