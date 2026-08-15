import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LIVE_ROOT = path.join(ROOT, "wirkungsradar/live");

const requiredTermsBySlug = {
  "radwege-in-peru": [
    "Zuschuss",
    "Kredit",
    "zurückgezahlt",
    "Deutschland",
    "Unternehmen",
    "315-Mio",
    "155 Mio",
    "33 Mio",
    "Metro",
    "Wirkung",
  ],
};

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return stripHtml(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionById(html, ids) {
  for (const id of ids) {
    const pattern = new RegExp(`<section[^>]+id="${id}"[\\s\\S]*?<\\/section>`, "i");
    const match = html.match(pattern);
    if (match) return match[0];
  }
  return "";
}

function answerTexts(html) {
  const section = sectionById(html, ["host-antworten", "live-antworten", "antwortformate"]);
  const answers = [];
  const itemPattern = /<details class="radar-answer-item"[\s\S]*?<\/details>/g;
  for (const item of section.matchAll(itemPattern)) {
    const label = stripHtml(item[0].match(/<span class="radar-answer-time">([\s\S]*?)<\/span>/)?.[1] ?? "");
    const text = stripHtml(item[0].match(/<p>[„"]?([\s\S]*?)[“"]?<\/p>/)?.[1] ?? "");
    if (text) answers.push({ label, text });
  }
  return answers;
}

const errors = [];

if (!fs.existsSync(LIVE_ROOT)) {
  throw new Error(`Live-Verzeichnis fehlt: ${LIVE_ROOT}`);
}

for (const entry of fs.readdirSync(LIVE_ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  const file = path.join(LIVE_ROOT, slug, "index.html");
  if (!fs.existsSync(file)) continue;

  const html = fs.readFileSync(file, "utf8");
  const answers = answerTexts(html);
  const firstThree = answers.slice(0, 3).map((item) => normalize(item.text)).filter(Boolean);
  const distinct = new Set(firstThree);

  if (firstThree.length >= 3 && distinct.size < firstThree.length) {
    errors.push(`${path.relative(ROOT, file)} hat doppelte Antworttexte in unterschiedlichen Antwortformaten.`);
  }

  for (const term of requiredTermsBySlug[slug] ?? []) {
    if (!html.includes(term)) {
      errors.push(`${path.relative(ROOT, file)} fehlt Qualitätsbegriff: ${term}`);
    }
  }
}

if (errors.length) {
  console.error("Wirkungsradar Live-Antwortqualität fehlgeschlagen:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Wirkungsradar Live-Antwortqualität ok.");
