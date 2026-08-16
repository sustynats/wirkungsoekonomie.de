#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const failures = [];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function isTautologicalRationale(value) {
  const normalized = String(value ?? "").toLocaleLowerCase("de-DE");
  return /positiv(?:es)?\s+wirkungspotenzial.{0,35}positiv(?:es)?\s+wirkungspotenzial/.test(normalized)
    || /negativ(?:es)?\s+wirkungsrisiko.{0,35}negativ(?:es)?\s+wirkungsrisiko/.test(normalized);
}

function hasDetailedPathSupport(path, allPaths, idKey = "id") {
  const hypothesis = String(path.hypothesis ?? "").trim();
  const parentId = String(path[idKey] ?? "").includes("-R") ? String(path[idKey]).split("-R")[0] : null;
  const parent = parentId ? allPaths.find((candidate) => candidate[idKey] === parentId || candidate[idKey] === `${parentId}-P`) : null;
  const supportingDetails = [
    path.lever,
    ...(path.affectedGroups ?? path.affected_groups ?? []),
    ...(path.normative_target_areas ?? []),
    ...(path.prerequisites ?? []),
    ...(path.risks ?? path.risks_and_side_effects ?? []),
    path.changeLever ?? path.change_lever_for_positive_net_impact,
    path.evidenceBoundary ?? path.evidence_boundary,
  ].filter((value) => typeof value === "string" && value.trim().length > 0).join(" ");
  return hypothesis.length >= 60 || String(parent?.hypothesis ?? "").trim().length >= 60 || supportingDetails.length >= 100;
}

function walk(value, visit, key = "", trail = []) {
  visit(value, key, trail);
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, visit, String(index), [...trail, key].filter(Boolean)));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([childKey, child]) => walk(child, visit, childKey, [...trail, key].filter(Boolean)));
  }
}

const integration = readJson("data/fachakten/release-1.1-integration-report.json");
assert(integration.publisher === "Institut für Wirkungsökonomie", "Integrationsbericht hat falschen Herausgeber.");
assert(integration.summary?.cases === 28, "Integrationsbericht enthält nicht 28 Fälle.");
assert(integration.summary?.changed_paths === 59, "Erwartet werden 59 korrigierte Wirkpfade.");
assert(integration.summary?.split_paths === 47, "Erwartet werden 47 gesplittete Wirkpfade.");
assert(integration.summary?.lost_fields === 0, "Bei der 1.1-Integration gingen Fachfelder verloren.");

const workingActs = readJson("data/public-working-acts.json");
assert(workingActs.length === 28, "Der öffentliche Entscheidungsbestand enthält nicht 28 Fälle.");
assert(workingActs.every((entry) => entry.fachakteId), "Mindestens ein Fall hat keine erreichbare vollständige Fachakte.");
const allowedDirections = new Set(["POSITIVE_POTENTIAL", "NEGATIVE_RISK", "NEUTRAL", "AMBIVALENT", "OPEN", "NOT_APPLICABLE"]);

for (const act of workingActs) {
  walk(act, (value, key, trail) => {
    if (key.toLowerCase().includes("direction") && value === "EVIDENCE_OPEN") {
      failures.push(`${act.slug}: EVIDENCE_OPEN wird weiterhin als Wirkungsrichtung verwendet (${[...trail, key].join(".")}).`);
    }
  });
  const fullRecord = path.join(ROOT, "public/fachakten/dossiers", `${act.fachakteId}.html`);
  assert(fs.existsSync(fullRecord), `${act.slug}: vollständige Fachakte fehlt (${act.fachakteId}).`);
  const publicImpactPaths = act.publicWorkingAct?.reviewDetail?.impactPaths ?? [];
  for (const impactPath of publicImpactPaths) {
    assert(allowedDirections.has(impactPath.direction), `${act.slug}/${impactPath.id}: Wirkungspotenzial ohne zulässige Richtung.`);
    assert(hasDetailedPathSupport(impactPath, publicImpactPaths), `${act.slug}/${impactPath.id}: Richtung besitzt weder eine ausformulierte Begründung noch ausreichende fallbezogene Stützinformationen.`);
    assert(!isTautologicalRationale(impactPath.hypothesis), `${act.slug}/${impactPath.id}: tautologische Richtungsbegründung.`);
    assert(
      (typeof impactPath.evidenceBoundary === "string" && impactPath.evidenceBoundary.trim().length >= 20)
        || (typeof impactPath.evidenceStatus === "string" && impactPath.evidenceStatus.trim().length > 0),
      `${act.slug}/${impactPath.id}: weder Evidenzgrenze noch auswertbarer Evidenzstatus vorhanden.`,
    );
  }
}

const demwig = workingActs.find((entry) => entry.fachakteId === "case-c315ec77-da20-4ff4-9ab0-8321030b085c");
assert(Boolean(demwig), "DemWiG-Fall fehlt im öffentlichen Bestand.");
if (demwig) {
  const mappingText = JSON.stringify(demwig.publicWorkingAct?.normativeMapping ?? {});
  assert(!mappingText.includes("SDG_04"), "DemWiG enthält weiterhin das falsche Mapping SDG 4.");
  assert(!mappingText.includes("SDG_14"), "DemWiG enthält weiterhin das falsche Mapping SDG 14.");
}

const productionIntegrity = readJson("public/fachakten/production-integrity-report.json");
assert(productionIntegrity.result === "PASS", "Fachakten-Produktionsintegrität ist nicht PASS.");
assert(productionIntegrity.cases === 28, "Produktionsintegritätsbericht enthält nicht 28 Fälle.");
assert(productionIntegrity.missing_paths?.length === 0, "Mindestens ein fachlicher Quellpfad fehlt in einer Vollakte.");
assert(productionIntegrity.fallback_overwrites?.length === 0, "Ein Fallback überschreibt fachliche Quelldaten.");

const integrityDir = path.join(ROOT, "public/fachakten/integrity");
const integrityFiles = fs.readdirSync(integrityDir).filter((file) => file.endsWith(".json"));
assert(integrityFiles.length === 28, "Es liegen nicht 28 fallbezogene Integritätsberichte vor.");
for (const file of integrityFiles) {
  const report = readJson(path.join("public/fachakten/integrity", file));
  assert(report.result === "PASS", `${file}: Integritätsstatus ist nicht PASS.`);
  assert(report.missing_paths?.length === 0, `${file}: Fachpfade fehlen.`);
  assert(report.fallback_overwrites?.length === 0, `${file}: Fallback-Überschreibung erkannt.`);
}

const fachanalysen = readJson("data/public-fachanalysen.json");
const geg = fachanalysen.find((entry) => entry.slug === "gebaeudeenergiegesetz-medienwirkung");
assert(Boolean(geg), "GEG-Fachanalyse fehlt.");
if (geg) {
  assert(geg.referenceStatus === "PROPOSED_PENDING_REFERENCE_RECONCILIATION", "GEG-Referenzstatus wurde nicht bewahrt.");
  assert(geg.sources?.length === 20, "GEG-Fachanalyse enthält nicht 20 eingeordnete Quellen.");
  const references = JSON.stringify(geg.referenceFields ?? {});
  assert(references.includes("SDG+ Diskursfähigkeit"), "GEG verwendet nicht die bereinigte SDG+-Bezeichnung Diskursfähigkeit.");
  assert(references.includes("Systemdimension: Wirkungsresilienz"), "GEG weist Wirkungsresilienz nicht als Systemdimension aus.");
  assert(!references.includes("SDG+ Diskurskultur"), "GEG enthält weiterhin die veraltete Bezeichnung Diskurskultur.");
  assert((geg.timeline ?? []).every((entry) => allowedDirections.has(entry.direction)), "GEG-Zeitachse enthält Wirkungspotenzial ohne explizite Richtung.");
  assert((geg.impactPaths ?? []).every((entry) => allowedDirections.has(entry.direction)), "GEG-Wirkpfad enthält Wirkungspotenzial ohne explizite Richtung.");
  assert((geg.timeline ?? []).every((entry) => String(entry.potential ?? "").trim().length >= 50 && String(entry.evidenceBoundary ?? "").trim().length >= 100), "GEG-Zeitachse enthält keine ausreichend begründete Richtung oder Evidenzgrenze.");
  assert((geg.impactPaths ?? []).every((entry) => String(entry.hypothesis ?? "").trim().length >= 60 && String(entry.evidenceBoundary ?? "").trim().length >= 100), "GEG-Wirkpfad enthält keine ausreichend begründete Richtung oder Evidenzgrenze.");
}

const decisionImpactProfiles = readJson("data/wirkungsprofile/decision-impact-profiles.json");
for (const profile of decisionImpactProfiles) {
  const profilePaths = profile.corrected_impact_paths ?? [];
  for (const impactPath of profilePaths) {
    assert(allowedDirections.has(impactPath.direction), `${profile.case_id}/${impactPath.path_id}: Wirkungsprofil ohne zulässige Richtung.`);
    assert(hasDetailedPathSupport(impactPath, profilePaths, "path_id"), `${profile.case_id}/${impactPath.path_id}: Wirkungsprofil ohne hinreichend ausformulierte Begründung oder fallbezogene Stützinformationen.`);
    assert(!isTautologicalRationale(impactPath.hypothesis), `${profile.case_id}/${impactPath.path_id}: tautologische Richtungsbegründung.`);
  }
}

const programmeIndex = readJson("data/fachakten/public/index.json").programmes;
const programmeDossiers = [
  ...["afd", "bsw", "cdu", "gruene", "linke", "spd"].map((slug) => [`ltw-2026-st-${slug}`, `sachsen-anhalt-${slug}`]),
  ...["afd", "cdu-csu", "gruene", "linke", "spd", "ssw"].map((slug) => [`btw-2025-${slug}`, `bund-btw-2025-${slug}`]),
  ["coalition-2025-cdu-csu-spd", "bund-coalition-2025-cdu-csu-spd"],
];
for (const [programmeKey, dossierName] of programmeDossiers) {
  const dossierPath = path.join(ROOT, "public/fachakten/dossiers", `${dossierName}.html`);
  assert(
    fs.existsSync(dossierPath),
    `Vollständige Fachakte für ${programmeKey} fehlt.`,
  );
  if (fs.existsSync(dossierPath)) {
    const dossier = fs.readFileSync(dossierPath, "utf8");
    const expected = programmeIndex[programmeKey]?.commitments ?? 0;
    const programmeRecords = (dossier.match(/class="commitment-analysis"/g) ?? []).length;
    const directionalCallouts = (dossier.match(/class="commitment-direction /g) ?? []).length;
    assert(programmeRecords === expected, `${programmeKey}: ${programmeRecords} statt ${expected} Programmpunkte in der Vollakte.`);
    assert(directionalCallouts === expected, `${programmeKey}: Nicht jeder Programmpunkt besitzt eine richtungsbezogene Kurzeinordnung.`);
  }
}

const dossierDir = path.join(ROOT, "public/fachakten/dossiers");
const dossierFiles = fs.readdirSync(dossierDir).filter((file) => file.endsWith(".html"));
const forbiddenPublicArtifacts = [
  /\bdistributional effects\b/i,
  /\bimplementation dependencies\b/i,
  /\baffected mpd dimensions\b/i,
  /\bnormative target areas\b/i,
  /\bsource ids?\b/i,
  /\bdata gap\b/i,
  /\bcandidate only\b/i,
  /\bproposed pending reference reconciliation\b/i,
  /\bnot robustly quantifiable\b/i,
  /\bcommunicative pre effect\b/i,
  /\bnon compensation gate\b/i,
  /\bactual effect boundary\b/i,
  /\boriginal implementation level\b/i,
  /\bGEG-SRC-\d+\b/i,
  /\bpromulgated law\b/i,
  /\bimplementation start\b/i,
  /\bdirection confidence\b/i,
  /\bnot rated\b/i,
  /\bmodeled ex ante direction\b/i,
  /\bnot materially assessable\b/i,
  /\bnot decision ready\b/i,
  /\bprogramme commitment key\b/i,
  /\badditional layers\b/i,
  /\bquality assurance\b/i,
  /\bsource ids?\b/i,
  /<strong>(?:measure|reason|indicator|reference|reviewed at|topic):/i,
  /Diese Publikationsquelle erhält/i,
  /vollständige JSON-Inhalte/i,
  /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
];
for (const file of dossierFiles) {
  const html = fs.readFileSync(path.join(dossierDir, file), "utf8");
  const visibleText = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|quot|#039|lt|gt);/g, " ")
    .replace(/\s+/g, " ");
  for (const pattern of forbiddenPublicArtifacts) {
    assert(!pattern.test(visibleText), `${file}: öffentliches technisches Artefakt gefunden (${pattern}).`);
  }
}

const publicPdf = path.join(ROOT, "public/downloads/fachanalysen/wirkungsoekonomische-analyse-sondervermoegen-infrastruktur-klimaneutralitaet.pdf");
assert(fs.existsSync(publicPdf), "Bereinigte SVIK-Fachanalyse als PDF fehlt.");

if (failures.length) {
  console.error(`Release-1.1-Prüfung fehlgeschlagen (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Release-1.1-Prüfung PASS: 28 Fälle, Vollakten, Korrekturen, GEG und SVIK vollständig.");
