import fs from "node:fs";
import path from "node:path";
import { p0DossiersV2 } from "../lib/wirkungsradar/p0-dossiers-v2.mjs";
import { p0EditorialGates } from "../lib/wirkungsradar/p0-editorial-gates.mjs";
import { validateDossierV2 } from "../lib/wirkungsradar/validateDossierV2.mjs";

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "reports");
const jsonPath = path.join(REPORT_DIR, "wirkungsradar-v2-audit.json");
const mdPath = path.join(REPORT_DIR, "wirkungsradar-v2-audit.md");

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pageRisk(slug) {
  const file = path.join(ROOT, "wirkungsradar", "live", slug, "index.html");
  if (!fs.existsSync(file)) return "live page missing";
  const firstViewport = stripHtml(fs.readFileSync(file, "utf8").slice(0, 6500));
  const risks = [];
  if (/Abstract:/.test(firstViewport)) risks.push("abstract in first viewport");
  if (/Gute R(?:ü|ue)ckfrage/.test(firstViewport)) risks.push("old counterquestion label");
  if (/Kostenstelle|Sozialschmarotzer|Menschen als Last/i.test(firstViewport)) risks.push("dehumanization wording");
  if (!/Ein gutes Bild/.test(firstViewport)) risks.push("positive image not visible early");
  if (!/Die bessere Frage|Rechnung öffnen/.test(firstViewport)) risks.push("better question not visible early");
  return risks.join("; ") || "ok";
}

function missingFields(dossier) {
  const missing = [];
  if (!dossier.cockpit?.positiveExample?.text) missing.push("positiveExample.text");
  if (!dossier.cockpit?.betterQuestion) missing.push("betterQuestion");
  if (!dossier.impactFan?.dimensions?.length) missing.push("impactFan");
  if (!dossier.psychologyLite?.items?.length) missing.push("psychologyLite");
  if (!dossier.consequenceStack) missing.push("consequenceStack");
  if (!dossier.solution?.plainLanguage) missing.push("solution");
  if (!dossier.trustBlock) missing.push("trustBlock");
  if (!dossier.sources?.length) missing.push("sources");
  return missing;
}

fs.mkdirSync(REPORT_DIR, { recursive: true });

const report = p0DossiersV2.map((dossier) => {
  const validation = validateDossierV2(dossier);
  const missing = missingFields(dossier);
  const editorial = p0EditorialGates[dossier.slug] || {};
  return {
    slug: dossier.slug,
    p0Rank: editorial.p0Rank || null,
    oldStatus: dossier.status || "unknown",
    newStatus: validation.status,
    frameRisk: editorial.frameRisk || "",
    mustAvoidFirstViewport: editorial.mustAvoidFirstViewport || [],
    requiredPositiveImage: editorial.requiredPositiveImage || dossier.cockpit?.positiveExample?.title || "",
    requiredBetterQuestion: editorial.requiredBetterQuestion || dossier.cockpit?.betterQuestion || "",
    requiredTrustSources: editorial.requiredTrustSources || [],
    finalReviewerNote: editorial.finalReviewerNote || "",
    errors: validation.errors,
    warnings: validation.warnings,
    missingFields: missing,
    firstViewportRisk: pageRisk(dossier.slug),
    recommendedFix: validation.errors[0] || missing[0] || (pageRisk(dossier.slug) === "ok" ? "P0-v2-Struktur halten und Quellen fachlich weiter pflegen." : "Ersten Sichtbereich mit Host-Cockpit v2 ersetzen."),
  };
});

fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

const rows = [
  "# Wirkungsradar v2 Audit",
  "",
  "| Seite | alter Status | neuer Status | Hauptproblem | nächster Fix |",
  "|---|---:|---:|---|---|",
  ...report.map((item) => `| ${item.p0Rank || ""}. ${item.slug} | ${item.oldStatus} | ${item.newStatus} | ${item.errors[0] || item.firstViewportRisk || "ok"} | ${item.recommendedFix} |`),
  "",
];
fs.writeFileSync(mdPath, rows.join("\n"));
console.log(`Wrote ${path.relative(ROOT, jsonPath)} and ${path.relative(ROOT, mdPath)} (${report.length} P0 dossiers).`);
