import fs from "node:fs";
import path from "node:path";
import { p0DossiersV2 } from "../lib/wirkungsradar/p0-dossiers-v2.mjs";
import { EDITORIAL_PRINCIPLE, p0EditorialGates } from "../lib/wirkungsradar/p0-editorial-gates.mjs";
import { validateDossierV2 } from "../lib/wirkungsradar/validateDossierV2.mjs";

const ROOT = process.cwd();
const REVIEW_DIR = path.join(ROOT, "reports", "p0-review");
const SCREENSHOT_DIR = path.join(REVIEW_DIR, "screenshots");

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value) {
  return String(value || "").split(/\s+/).filter(Boolean).length;
}

function sentenceAverage(value) {
  const sentences = String(value || "").split(/[.!?]+/).map((item) => item.trim()).filter(Boolean);
  if (!sentences.length) return 0;
  return sentences.reduce((sum, item) => sum + wordCount(item), 0) / sentences.length;
}

function firstViewportText(slug) {
  const file = path.join(ROOT, "wirkungsradar", "live", slug, "index.html");
  if (!fs.existsSync(file)) return "";
  return stripHtml(fs.readFileSync(file, "utf8").slice(0, 6500));
}

function containsAny(value, terms = []) {
  const lower = String(value || "").toLowerCase();
  return terms.filter((term) => lower.includes(String(term).toLowerCase()));
}

function removeKnownClaimText(value, dossier) {
  const known = [
    dossier.title,
    dossier.claim,
    ...(dossier.claimVariants || []),
    ...(dossier.cockpit?.positiveExample?.avoidFrameTerms || []),
  ].filter(Boolean);
  return known.reduce((text, phrase) => {
    const escaped = String(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp(escaped, "gi"), " ");
  }, String(value || ""));
}

function copyFormats(dossier) {
  const cockpit = dossier.cockpit || {};
  return {
    comment: dossier.responses?.comment?.text || cockpit.sayThisNow || "",
    live: dossier.responses?.live?.text || `${cockpit.sayThisNow || ""} ${cockpit.positiveExample?.hostLine || ""}`.trim(),
    panel: dossier.responses?.panel?.text || `${cockpit.sayThisNow || ""} ${cockpit.frameShift?.betterAnswer || ""} ${cockpit.positiveExample?.hostLine || ""}`.trim(),
    calmCounter: dossier.responses?.calmCounter?.text || `${cockpit.frameShift?.betterAnswer || ""} ${cockpit.betterQuestion || ""}`.trim(),
  };
}

function passFail(condition) {
  return condition ? "PASS" : "FAIL";
}

function reviewMarkdown(dossier) {
  const validation = validateDossierV2(dossier);
  const gate = p0EditorialGates[dossier.slug] || {};
  const firstViewport = firstViewportText(dossier.slug);
  const forbiddenScope = removeKnownClaimText(firstViewport, dossier);
  const forbiddenHits = containsAny(forbiddenScope, gate.mustAvoidFirstViewport || []);
  const formats = copyFormats(dossier);
  const positiveTitle = dossier.cockpit?.positiveExample?.title || "";
  const betterQuestion = dossier.cockpit?.betterQuestion || "";
  const avg = sentenceAverage(dossier.cockpit?.sayThisNow || "");
  const sourceLabels = (dossier.sources || []).map((source) => source.label).join(", ");
  const screenshotDesktop = `screenshots/${dossier.slug}-desktop.png`;
  const screenshotMobile = `screenshots/${dossier.slug}-mobile.png`;
  const decision = validation.errors.length || forbiddenHits.length ? "NICHT FREIGEBEN" : "FREIGEBEN";

  return [
    `# P0-Review: ${dossier.title}`,
    "",
    `Slug: \`${dossier.slug}\``,
    `Rang: ${gate.p0Rank || "-"}`,
    `Status: ${validation.status}`,
    `Entscheidung: ${decision}`,
    "",
    "## 1. 10-Sekunden-Test",
    "",
    `- ${passFail(Boolean(dossier.cockpit?.shortJudgement))}: Kurzurteil: ${dossier.cockpit?.shortJudgement || "-"}`,
    `- ${passFail(String(dossier.cockpit?.sayThisNow || "").length <= 280)}: Sag-das-jetzt <= 280 Zeichen (${String(dossier.cockpit?.sayThisNow || "").length})`,
    `- ${passFail(Boolean(positiveTitle))}: Positives Bild sichtbar: ${positiveTitle || "-"}`,
    `- ${passFail(Boolean(betterQuestion) && betterQuestion.length <= 180)}: Bessere Frage <= 180 Zeichen: ${betterQuestion || "-"}`,
    "",
    "## 2. Frame-Risiko",
    "",
    `- Risiko: ${gate.frameRisk || "-"}`,
    `- ${passFail(!forbiddenHits.length)}: Verbotene Erstblick-Treffer: ${forbiddenHits.join(", ") || "keine"}`,
    `- Prinzip: ${EDITORIAL_PRINCIPLE}`,
    "",
    "## 3. Positives Beispiel",
    "",
    `- Erwartet: ${gate.requiredPositiveImage || "-"}`,
    `- Verwendet: ${positiveTitle || "-"}`,
    `- Host-Satz: ${dossier.cockpit?.positiveExample?.hostLine || "-"}`,
    `- Was wird besser: ${(dossier.cockpit?.positiveExample?.whatGetsBetter || []).join(", ") || "-"}`,
    "",
    "## 4. Menschenschutz",
    "",
    `- ${passFail(!validation.errors.some((error) => error.startsWith("sensitiveHumanTopicGate")))}: Kein Mensch als Last/Kosten/Masse im Cockpit.`,
    `- Muss im Erstblick vermeiden: ${(gate.mustAvoidFirstViewport || []).join(", ") || "-"}`,
    "",
    "## 5. Maus-Modus",
    "",
    `- ${passFail(avg <= 16)}: Durchschnittliche Satzlaenge in Sag-das-jetzt: ${avg.toFixed(1)} Woerter`,
    `- Kommentar: ${formats.comment}`,
    `- Live: ${formats.live}`,
    `- Panel: ${formats.panel}`,
    `- Ruhig kontern: ${formats.calmCounter}`,
    "",
    "## 6. Systemik",
    "",
    `- ${passFail((dossier.impactFan?.dimensions || []).length >= 5)}: Wirkungsfaecher mit ${(dossier.impactFan?.dimensions || []).length} Dimensionen`,
    `- ${passFail((dossier.explain?.whatIsMissing || []).length >= 5)}: Was-fehlt mit ${(dossier.explain?.whatIsMissing || []).length} Punkten`,
    `- ${passFail(Boolean(dossier.consequenceStack))}: Folgen in drei Stufen vorhanden`,
    `- ${passFail(Boolean(dossier.solution?.plainLanguage))}: Loesung vorhanden`,
    "",
    "## 7. Vertrauen",
    "",
    `- Quellen vorhanden: ${sourceLabels || "-"}`,
    `- Pflichtquellen laut Gate: ${(gate.requiredTrustSources || []).join("; ") || "-"}`,
    `- Datenstand: ${dossier.trustBlock?.dataStand || "-"}`,
    `- Bilanzgrenze: ${dossier.trustBlock?.bilanzgrenze || "-"}`,
    "",
    "## 8. Entscheidung",
    "",
    `- Ergebnis: ${decision}`,
    `- Reviewer-Notiz: ${gate.finalReviewerNote || "-"}`,
    `- Validierungsfehler: ${validation.errors.join("; ") || "keine"}`,
    `- Warnungen: ${validation.warnings.join("; ") || "keine"}`,
    `- Screenshot-Pfade: \`${screenshotDesktop}\`, \`${screenshotMobile}\``,
    "",
  ].join("\n");
}

fs.mkdirSync(REVIEW_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.writeFileSync(path.join(SCREENSHOT_DIR, ".gitkeep"), "");

for (const dossier of p0DossiersV2) {
  fs.writeFileSync(path.join(REVIEW_DIR, `${dossier.slug}.md`), reviewMarkdown(dossier));
}

console.log(`Wrote ${p0DossiersV2.length} P0 review files to ${path.relative(ROOT, REVIEW_DIR)}.`);
