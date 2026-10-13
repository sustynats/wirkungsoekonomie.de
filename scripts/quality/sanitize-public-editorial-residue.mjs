import fs from "node:fs";
import path from "node:path";
import {stripAiTrackingParameters} from "../lib/public-editorial-cleanup.mjs";
import {isFrozenPublicationSource} from "../lib/public-typography.mjs";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const excludedDirectories = new Set([
  ".git",
  ".github",
  "_internal",
  "_site",
  "docs",
  "node_modules",
  "reports",
  "scripts",
  "tmp",
]);
const eligibleExtensions = new Set([".htm", ".html", ".inc", ".json", ".md", ".svg"]);
const aiTrackingPattern = /([?&](?:amp;)*)(?:utm_source|utm_medium|utm_campaign)=(?:chatgpt|openai|claude|anthropic|gemini|copilot)(?:\.com)?(?=(?:&(?:amp;)?|["')\s<>]|$))/gi;
const implementationHeadingPattern = /^(?:\d+\.\s*)?(?:Website- und (?:Portal|Tool|Bereich)integration|Online- und Tool-Umsetzung|Tool- und (?:Website|Online)bezug|Buchanker und Website-Zuordnung)$/iu;
const residualPatterns = [
  /Auszug aus der umfangreichen Korrekturfassung\.?/i,
  /ergänzende\s+ergänzende/i,
  /Öffentliche PDF-Fassung aus dem WÖk-Produktionsprozess\.?(?:\s*(?:Markdown-|Onlinefassung-)?Quellen werden nicht als öffentlicher Download angeboten\.?)?/i,
  /KI-generierte(?: redaktionelle)? Titelillustration/iu,
  /KI-generiertes Symbolbild/iu,
  /Redaktioneller Hinweis/iu,
  /Für die öffentliche Website bereinigt/iu,
  /Originalmanuskript erhalten; interner ausstehender Freigabevermerk aus der öffentlichen Darstellung entfernt\.?/iu,
  /Diese Fassung wurde von Natalie Weber zur Veröffentlichung freigegeben\. Sie wird nicht automatisch veröffentlicht\.?/iu,
  /KI-Werkzeuge können Recherche und Ausarbeitung unterstützen\. Sie ersetzen nicht die redaktionelle Verantwortung der Autorin\.?/iu,
  /Die Beiträge werden nicht automatisiert erzeugt\.?/iu,
  /Für die Website sollte/iu,
  /Auf \/verstehen\/sdgs-sdgplus\/ eine interaktive Matrix mit 17 SDGs und 169 Targets einbauen\.?/iu,
  /Website- und (?:Portal|Tool|Bereich)integration|Online- und Tool-Umsetzung|Tool- und (?:Website|Online)bezug|Buchanker und Website-Zuordnung/iu,
  aiTrackingPattern,
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) return [];
      return walk(path.join(directory, entry.name));
    }
    if (!entry.isFile() || !eligibleExtensions.has(path.extname(entry.name).toLowerCase())) return [];
    if (isFrozenPublicationSource(path.relative(root, path.join(directory, entry.name)))) return [];
    return [path.join(directory, entry.name)];
  });
}

function visibleText(value = "") {
  return String(value)
    .replace(/<[^>]+>/gu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/\s*#\s*$/u, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function stripImplementationSections(content) {
  let result = String(content);
  const markdownHeadings = [...result.matchAll(/^(#{1,6})\s+([^\n]+)$/gmu)]
    .map((match) => ({ start: match.index, end: match.index + match[0].length, level: match[1].length, text: visibleText(match[2]) }));
  const markdownRanges = [];
  markdownHeadings.forEach((heading, index) => {
    if (!implementationHeadingPattern.test(heading.text)) return;
    const next = markdownHeadings.slice(index + 1).find((candidate) => candidate.level <= heading.level);
    markdownRanges.push([heading.start, next?.start ?? result.length]);
  });
  for (const [start, end] of markdownRanges.sort((a, b) => b[0] - a[0])) result = result.slice(0, start) + result.slice(end);

  const headings = [...result.matchAll(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/giu)]
    .map((match) => ({ start: match.index, end: match.index + match[0].length, level: Number(match[1]), text: visibleText(match[0]) }));
  const ranges = [];
  headings.forEach((heading, index) => {
    if (!implementationHeadingPattern.test(heading.text)) return;
    const next = headings.slice(index + 1).find((candidate) => candidate.level <= heading.level);
    const structural = result.slice(heading.end).search(/<\/(?:div|section|article)>|<nav\b/iu);
    const structuralStart = structural >= 0 ? heading.end + structural : Number.POSITIVE_INFINITY;
    const boundary = Math.min(next?.start ?? Number.POSITIVE_INFINITY, structuralStart);
    ranges.push([heading.start, Number.isFinite(boundary) ? boundary : heading.end]);
  });
  for (const [start, end] of ranges.sort((a, b) => b[0] - a[0])) result = result.slice(0, start) + result.slice(end);
  result = result
    .replace(/<li\b[^>]*>[\s\S]*?<\/li>/giu, (block) => implementationHeadingPattern.test(visibleText(block)) ? "" : block)
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/giu, (block) => implementationHeadingPattern.test(visibleText(block)) ? "" : block)
    .replace(/Website- und (?:Portal|Tool|Bereich)integration|Online- und Tool-Umsetzung|Tool- und (?:Website|Online)bezug|Buchanker und Website-Zuordnung/giu, "Anwendung");
  return result;
}

function sanitize(content) {
  return stripImplementationSections(stripAiTrackingParameters(content
    .replace(/Auszug aus der umfangreichen Korrekturfassung\.?/gi, "Fachliche Vertiefung")
    .replace(/(?:<p>\s*)?Öffentliche PDF-Fassung aus dem WÖk-Produktionsprozess\.?(?:\s*(?:Markdown-|Onlinefassung-)?Quellen werden nicht als öffentlicher Download angeboten\.?)?(?:\s*<\/p>)?/gi, "")
    .replace(/KI-generierte(?: redaktionelle)? Titelillustration/giu, "Titelillustration")
    .replace(/KI-generiertes Symbolbild/giu, "Symbolbild")
    .replace(/Redaktioneller Hinweis/giu, "Einordnung")
    .replace(/Für die öffentliche Website bereinigt/giu, "Öffentliche Fassung")
    .replace(/Originalmanuskript erhalten; interner ausstehender Freigabevermerk aus der öffentlichen Darstellung entfernt\.?/giu, "")
    .replace(/(?:<p\b[^>]*>\s*)?Diese Fassung wurde von Natalie Weber zur Veröffentlichung freigegeben\. Sie wird nicht automatisch veröffentlicht\.?(?:\s*<\/p>)?/giu, "")
    .replace(/(?:<details>\s*<summary>Zur Arbeitsweise<\/summary>\s*<p>)?KI-Werkzeuge können Recherche und Ausarbeitung unterstützen\. Sie ersetzen nicht die redaktionelle Verantwortung der Autorin\.?(?:<\/p>\s*<\/details>)?/giu, "")
    .replace(/Die Beiträge werden nicht automatisiert erzeugt\.?/giu, "")
    .replace(/<p\b[^>]*>\s*Für die Website sollte[\s\S]*?<\/p>/giu, "")
    .replace(/<p\b[^>]*>\s*[•]\s*Auf \/verstehen\/sdgs-sdgplus\/[\s\S]*?<\/p>\s*(?:<p\b[^>]*>\s*[•][\s\S]*?<\/p>\s*){0,3}/giu, "")
    .replace(/ergänzende\s+ergänzende/gi, "ergänzende")));
}

const affected = [];
for (const file of walk(root)) {
  const content = fs.readFileSync(file, "utf8");
  if (!residualPatterns.some((pattern) => pattern.test(content))) continue;
  affected.push(path.relative(root, file));
  if (!checkOnly) fs.writeFileSync(file, sanitize(content), "utf8");
}

if (checkOnly && affected.length) {
  console.error(`Öffentliche Redaktionsreste gefunden:\n${affected.join("\n")}`);
  process.exit(1);
}

console.log(
  checkOnly
    ? "Öffentliche Redaktionsreste: keine gefunden."
    : `Öffentliche Redaktionsreste bereinigt: ${affected.length} Datei(en).`,
);
