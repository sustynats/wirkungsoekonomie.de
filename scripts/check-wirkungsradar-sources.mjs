import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const registryFile = path.join(ROOT, "assets/data/wirkungsradar-source-registry.json");
const packsFile = path.join(ROOT, "assets/data/wirkungsradar-source-packs.json");
const reportFile = path.join(ROOT, "reports/wirkungsradar-source-check.md");

const sources = JSON.parse(fs.readFileSync(registryFile, "utf8"));
const packs = JSON.parse(fs.readFileSync(packsFile, "utf8"));
const byId = new Map(sources.map((source) => [source.id, source]));
const findings = [];

for (const source of sources) {
  for (const field of ["label", "url", "lastAccessed", "reliabilityTier"]) {
    if (!source[field]) findings.push([source.id, "source_incomplete", `${field} fehlt`]);
  }
  if (!Array.isArray(source.useFor) || !source.useFor.length) findings.push([source.id, "source_incomplete", "useFor fehlt"]);
  if (!Array.isArray(source.limitations) || !source.limitations.length) findings.push([source.id, "source_without_limit", "limitations fehlt"]);
  if (!/^https?:\/\//.test(source.url)) findings.push([source.id, "bad_external_url", source.url]);
}

for (const [slug, pack] of Object.entries(packs)) {
  if (!pack) {
    findings.push([slug, "missing_pack", "Source-Pack fehlt"]);
    continue;
  }
  const required = pack.requiredSources || [];
  if (required.length < 3) findings.push([slug, "missing_sources", "weniger als drei Pflichtquellen"]);
  if (!pack.dataStand) findings.push([slug, "missing_data_stand", "dataStand fehlt"]);
  if (!pack.nextReviewDate) findings.push([slug, "missing_next_review", "nextReviewDate fehlt"]);
  if (!pack.counterposition) findings.push([slug, "missing_counterposition", "Gegenposition fehlt"]);
  if (!pack.accountingBoundary) findings.push([slug, "missing_accounting_boundary", "Bilanzgrenze fehlt"]);
  const tiers = required.map((id) => byId.get(id)?.reliabilityTier).filter(Boolean);
  if (!tiers.includes("A")) findings.push([slug, "missing_a_source", "keine A-Quelle"]);
  if (!tiers.includes("B") && !tiers.includes("A")) findings.push([slug, "missing_b_or_a_source", "keine A/B-Quelle"]);
  for (const id of required) {
    if (!byId.has(id)) findings.push([slug, "unknown_source", id]);
  }
  const dOnly = required.length && required.every((id) => byId.get(id)?.reliabilityTier === "D");
  if (dOnly) findings.push([slug, "d_sources_alone", "D-Quellen stützen allein"]);
  const cWithoutAB = required.some((id) => byId.get(id)?.reliabilityTier === "C") && !tiers.some((tier) => tier === "A" || tier === "B");
  if (cWithoutAB) findings.push([slug, "c_without_ab", "C-Quelle ohne A/B-Begleitung"]);
}

const lines = [
  "# Wirkungsradar Source-Check",
  "",
  `Quellen: ${sources.length}`,
  `Source-Packs: ${Object.keys(packs).length}`,
  `Findings: ${findings.length}`,
  "",
  ...(findings.length ? findings.map(([target, type, detail]) => `- ${target}: ${type} - ${detail}`) : ["Keine Findings."]),
  "",
];

fs.mkdirSync(path.dirname(reportFile), { recursive: true });
fs.writeFileSync(reportFile, lines.join("\n"));

if (findings.some(([, type]) => ["missing_pack", "missing_sources", "missing_a_source", "unknown_source", "d_sources_alone"].includes(type))) {
  console.error(`Wirkungsradar source check failed with ${findings.length} findings.`);
  process.exit(1);
}

console.log(`Wirkungsradar source check OK: ${sources.length} sources, ${Object.keys(packs).length} packs.`);
