import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const OUT_JSON = path.join(ROOT, "public/data/en-asset-text-inventory.json");
const OUT_MD = path.join(ROOT, "docs/english-asset-text-inventory.md");

const imagePattern = /\.(svg|png|jpe?g|webp|avif)$/i;
const rasterPattern = /\.(png|jpe?g|webp|avif)$/i;
const germanTextPattern = /\b(und|oder|für|Wirkung|Wirkungs|Wirkungsökonomie|Mensch|Planet|Demokratie|Beispiel|Grundlagen|Werkzeug|Suche|Merken|Lernen|Sammlung|öffent|Ökonomie|Steuer|Daten|Bewertung)\b|[äöüÄÖÜß]/;

function gitFiles(patterns) {
  return execFileSync("git", ["ls-files", ...patterns], { cwd: ROOT, encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function escMd(value = "") {
  return String(value).replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function extractSvgText(file) {
  const svg = read(file);
  const matches = [];
  const textLike = [...svg.matchAll(/<(text|title|desc|tspan)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  for (const match of textLike) {
    const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text && germanTextPattern.test(text)) matches.push(text);
  }
  const ariaMatches = [...svg.matchAll(/\b(?:aria-label|title|desc)=["']([^"']+)["']/gi)];
  for (const match of ariaMatches) {
    const text = match[1].replace(/\s+/g, " ").trim();
    if (text && germanTextPattern.test(text)) matches.push(text);
  }
  return [...new Set(matches)].slice(0, 20);
}

function htmlAssetRefs() {
  const refs = new Map();
  const htmlFiles = gitFiles(["*.html"]);
  const imageRefPattern = /<(?:img|source)\b[^>]*(?:src|srcset)=["']([^"']+)["'][^>]*>/gi;
  for (const file of htmlFiles) {
    if (file.startsWith("_site/")) continue;
    const html = read(file);
    for (const match of html.matchAll(imageRefPattern)) {
      const raw = match[1].split(/[?\s]/)[0];
      const normalized = raw.replace(/^https?:\/\/wirkungsoekonomie\.de\//, "").replace(/^\.\.\//, "").replace(/^\.\//, "").replace(/^\//, "");
      if (!imagePattern.test(normalized)) continue;
      const tag = match[0];
      const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] || "";
      const title = tag.match(/\btitle=["']([^"']*)["']/i)?.[1] || "";
      if (!refs.has(normalized)) refs.set(normalized, []);
      refs.get(normalized).push({ file, alt, title });
    }
  }
  return refs;
}

const imageFiles = gitFiles(["assets/img/**", "public/**/*.svg", "public/**/*.png", "public/**/*.jpg", "public/**/*.jpeg", "public/**/*.webp", "public/**/*.avif"])
  .filter((file) => imagePattern.test(file) && fs.existsSync(path.join(ROOT, file)));
const refs = htmlAssetRefs();

const assets = imageFiles.map((file) => {
  const usage = refs.get(file) || [];
  const altTexts = [...new Set(usage.flatMap((item) => [item.alt, item.title]).filter(Boolean))];
  const altGerman = altTexts.filter((text) => germanTextPattern.test(text));
  const svgTexts = file.endsWith(".svg") ? extractSvgText(file) : [];
  let status = "no-visible-german-text-detected";
  if (svgTexts.length) status = "svg-editable-text";
  if (rasterPattern.test(file) && (altGerman.length || usage.length)) status = "raster-review-needed";
  return {
    file,
    kind: file.endsWith(".svg") ? "svg" : "raster",
    status,
    usageCount: usage.length,
    usedBy: usage.slice(0, 12).map((item) => item.file),
    detectedSvgText: svgTexts,
    germanAltOrTitle: altGerman,
    recommendation: status === "svg-editable-text"
      ? "Translate SVG text nodes and metadata for English routes, or create an -en.svg variant if the German version must remain unchanged."
      : status === "raster-review-needed"
        ? "Check whether the bitmap contains embedded German text. If yes, create an English raster variant; alt/title text can be translated in HTML."
        : "No action detected by this static inventory.",
  };
});

const summary = {
  totalImages: assets.length,
  svgEditableText: assets.filter((asset) => asset.status === "svg-editable-text").length,
  rasterReviewNeeded: assets.filter((asset) => asset.status === "raster-review-needed").length,
  noVisibleGermanTextDetected: assets.filter((asset) => asset.status === "no-visible-german-text-detected").length,
};

const manifest = {
  schemaVersion: "2026-07-english-asset-text-inventory",
  generatedAt: new Date().toISOString().slice(0, 10),
  scope: "Static inventory for visible German text in website image assets. SVG text can usually be translated directly; raster images need manual/OCR review and English variants where embedded text exists.",
  summary,
  assets,
};

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, `${JSON.stringify(manifest, null, 2)}\n`);

const actionRows = assets
  .filter((asset) => asset.status !== "no-visible-german-text-detected")
  .slice(0, 120)
  .map((asset) => `| \`${asset.file}\` | ${asset.kind} | ${asset.status} | ${asset.usageCount} | ${escMd([...asset.detectedSvgText, ...asset.germanAltOrTitle][0] || "")} |`)
  .join("\n");

const md = `# English Asset Text Inventory

Generated by \`scripts/i18n/build-english-asset-text-inventory.mjs\`.

## Summary

- Images scanned: ${summary.totalImages}
- SVGs with editable text/metadata detected: ${summary.svgEditableText}
- Raster assets needing review: ${summary.rasterReviewNeeded}
- No visible German text detected statically: ${summary.noVisibleGermanTextDetected}

## Action List

| Asset | Kind | Status | Usage | First detected text |
| --- | --- | --- | ---: | --- |
${actionRows || "| - | - | - | - | - |"}

## Rule

SVG text can usually be translated directly or split into an English variant. PNG, JPG, WebP and AVIF files need visual/OCR review; if embedded German text exists, publish an English variant for \`/en/\` routes while keeping the German asset for the German website.
`;

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.writeFileSync(OUT_MD, md);

console.log(`English asset text inventory written: ${summary.svgEditableText} SVG, ${summary.rasterReviewNeeded} raster review items.`);
