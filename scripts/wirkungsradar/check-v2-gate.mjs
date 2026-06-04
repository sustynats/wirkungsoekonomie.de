import fs from "node:fs";
import path from "node:path";
import { p0DossiersV2 } from "../../lib/wirkungsradar/p0-dossiers-v2.mjs";
import { validateDossierV3 } from "../../lib/wirkungsradar/validateDossierV3.mjs";

const ROOT = process.cwd();
const LEGACY_CANDIDATE_STATUS = "checked" + "_candidate";
const LEGACY_QUESTION_LABEL = "Gute " + "Rueckfrage";
const LEGACY_LIVE_LABEL = "Live-" + "Karten";
const LEGACY_RADAR_LIVE_LABEL = "Wirkungsradar-" + "Live";
const LEGACY_HOST_LABEL = "Host-" + "Cockpit";
const CHECK_ROOTS = ["wirkungsradar"];
const LIVE_ROOTS = ["wirkungsradar/live", "wirkungsradar/detail"];

const P0_SLUGS = [
  "migration-kostet-nur",
  "deutschland-nur-zwei-prozent",
  "windraeder-voegel-wald-beton-rueckbau",
  "fusion-loest-das-energieproblem",
  "schulden-machen-oder-sparen",
  "e-autos-schlimmer-als-verbrenner",
  "e-fuels-retten-den-verbrenner",
  "wasserstoff-fuer-alles",
  "arbeit-lohnt-sich-nicht-mehr",
  "co2-preis-oder-fossile-systemkosten",
  "kernenergie-wieder-in-deutschland",
  "radwege-in-peru",
  "ukraine-unterstuetzung-steuergeld",
];

function walk(target) {
  const full = path.join(ROOT, target);
  if (!fs.existsSync(full)) return [];
  const stat = fs.statSync(full);
  if (stat.isFile()) return [full];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(full, entry.name);
    if (entry.isDirectory()) return walk(path.relative(ROOT, next));
    if (/\.(html|mjs|json|md)$/.test(entry.name)) return [next];
    return [];
  });
}

function rel(file) {
  return path.relative(ROOT, file);
}

function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const errors = [];
const warnings = [];
const files = CHECK_ROOTS.flatMap(walk);

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (text.includes(LEGACY_CANDIDATE_STATUS)) {
    errors.push(`${rel(file)} enthaelt noch ${LEGACY_CANDIDATE_STATUS}`);
  }
  if (/Gute R(?:ü|ue)ckfrage/.test(text)) {
    errors.push(`${rel(file)} enthaelt noch "${LEGACY_QUESTION_LABEL}"`);
  }
  if (/<span class="radar-answer-time">Rückfrage<\/span>/.test(text)) {
    errors.push(`${rel(file)} nutzt noch die alte Antwortformat-Beschriftung "Rueckfrage"`);
  }
  if ([LEGACY_LIVE_LABEL, LEGACY_RADAR_LIVE_LABEL, LEGACY_HOST_LABEL].some((label) => text.includes(label))) {
    errors.push(`${rel(file)} enthaelt noch oeffentliches Altlabel aus Patch 48`);
  }
}

const liveFiles = LIVE_ROOTS.flatMap(walk).filter((file) => file.endsWith(".html"));

for (const slug of P0_SLUGS) {
  const live = path.join(ROOT, "wirkungsradar/live", slug, "index.html");
  const detail = path.join(ROOT, "wirkungsradar/detail", slug, "index.html");
  if (!fs.existsSync(live) && !fs.existsSync(detail)) {
    warnings.push(`P0-Seite fehlt im Live/Detail-Export: ${slug}`);
  }
}

const p0BySlug = new Map(p0DossiersV2.map((dossier) => [dossier.slug, dossier]));
for (const slug of P0_SLUGS) {
  const dossier = p0BySlug.get(slug);
  if (!dossier) {
    errors.push(`P0-Dossier fehlt in p0DossiersV2: ${slug}`);
    continue;
  }
  const live = path.join(ROOT, "wirkungsradar/live", slug, "index.html");
  const html = fs.existsSync(live) ? fs.readFileSync(live, "utf8") : "";
  const result = validateDossierV3(dossier, html);
  if (result.status !== "checked_v4_debattenkompass") {
    errors.push(`${slug} V4 unvollständig: ${result.errors.join("; ")}`);
  }
}

for (const file of liveFiles) {
  const relative = rel(file);
  if (/wirkungsradar\/(?:live|detail)\/index\.html$/.test(relative)) continue;
  const slug = path.basename(path.dirname(file));
  const isP0 = P0_SLUGS.includes(slug);
  const isP0Live = isP0 && relative.startsWith("wirkungsradar/live/");
  const html = fs.readFileSync(file, "utf8");
  const plain = stripHtml(html);
  const isV2Checked = html.includes("checked_v2_positive_examples") || html.includes("data-v3-facts-layer");
  const hasQuickAnswer = html.includes("Kurzantwort - 10 Sekunden");
  const hasImpactFan = html.includes("data-v2-impact-fan") || html.includes("Was wird ausgeblendet?");
  const hasFrameShift = html.includes("Frame nicht übernehmen") && html.includes("Alter Frame:") && /Besser(?: so)?:/.test(plain);
  const hasPositiveImage = html.includes("Ein gutes Bild");
  const hasBetterQuestion = html.includes("Die bessere Frage") || html.includes("Rechnung öffnen");
  const hasConsequenceStack = /Sofort[\s\S]*Danach[\s\S]*Auf Dauer/.test(plain) || html.includes("v2-consequence-stack");
  const hasTrustBlock = html.includes("Warum du dieser Einordnung vertrauen kannst") || html.includes("v2-trust-block");
  const hasV3 = html.includes("data-v3-facts-layer");
  const firstVisible = stripHtml(html.slice(0, 4500));

  if (isP0Live && isV2Checked && !hasV3) {
    const missing = [];
    if (!hasQuickAnswer) missing.push("Kurzantwort oben");
    if (!hasPositiveImage) missing.push("positives Erklaerbild");
    if (!hasBetterQuestion) missing.push("bessere Frage");
    if (!hasFrameShift) missing.push("Frame-Shift");
    if (!hasImpactFan) missing.push("Wirkungsdimensionen");
    if (!hasConsequenceStack) missing.push("Folgencheck");
    if (!hasTrustBlock) missing.push("Vertrauensmodul");
    if (/Abstract:/.test(firstVisible)) missing.push("kein Abstract im ersten Sichtbereich");
    if (missing.length) {
      errors.push(`${rel(file)} ist checked_v2_positive_examples, aber es fehlt: ${missing.join(", ")}`);
    }
  }

  if (/migration|arbeit|buergergeld|bürgergeld|sozial/i.test(rel(file))) {
    const dehumanizingTop = /\b(Kostenstelle|Last|Bedrohung|Sozialschmarotzer)\b/i.test(firstVisible);
    const explicitGuard = /Menschen sind keine Kostenstelle|Menschen nie als Last|keine Kostenstelle/i.test(firstVisible);
    if (dehumanizingTop && !explicitGuard) {
      warnings.push(`${rel(file)} hat im ersten Sichtbereich moegliches Dehumanisierungsrisiko`);
    }
  }

  if (isP0Live && hasQuickAnswer && !hasPositiveImage) {
    errors.push(`${rel(file)} hat Schnellantwort ohne "Ein gutes Bild"`);
  }
}

if (warnings.length) {
  console.log("Wirkungsradar v2 Gate Hinweise:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length) {
  console.error("Wirkungsradar v2 Gate Fehler:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Debatten-Kompass Gate OK: ${liveFiles.length} Debattenkarten/Detail-Seiten geprueft.`);
