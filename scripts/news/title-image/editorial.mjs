// Deterministic, locally rendered opinion cards. No image/LLM provider call.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { renderTitleImage } from "./index.mjs";
import { rasterize } from "./rasterize.mjs";
import { createReleaseStore } from "./pipeline.mjs";

const hash = value => crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
export function editorialTitleInput(analysis) {
  if (analysis.editorial_mode !== "commissioned_review" || analysis.assessment_context !== "risk"
    || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(analysis.slug || "")
    || ["human", "planet", "democracy"].some(key => !["negative", "open"].includes(analysis.subject_dimensions?.[key]?.direction))) throw new Error("EDITORIAL_RISK_CARD_REVIEW_REQUIRED");
  return {
    mode: "impact_card", headline: analysis.title, category: "Meinung & Analyse",
    source: "Natalie Weber", date: null, label: "Wirkungskarte · Risikoszenario",
    dimensions: analysis.subject_dimensions,
    riskDirections: Object.fromEntries(["human", "planet", "democracy"].map(key => [key, analysis.subject_dimensions[key].direction])),
    status: "Umsetzung offen", analysisType: "ex_ante",
  };
}

export async function createEditorialTitleAssets(analysis, { outDir, publish = null, raster = rasterize } = {}) {
  if (!outDir) throw new Error("EDITORIAL_CARD_OUTPUT_REQUIRED");
  const input = editorialTitleInput(analysis);
  const fingerprint = hash(JSON.stringify({ template: "editorial-risk-v1", input }));
  const prefix = `wt-${hash(`analysis:${analysis.slug}`)}-${fingerprint}`;
  const tag = `wirkungsticker-media-${analysis.research_checked_at.slice(0, 7)}`;
  const files = [];
  const title_image = { mode: "impact_card", label: "Wirkungskarte · Risikoszenario", fingerprint, assessment_context: "risk" };
  for (const size of ["og", "wide"]) {
    const rendered = renderTitleImage(input, { size });
    if (rendered.layout.truncated || rendered.warnings.length) throw new Error(`EDITORIAL_CARD_LAYOUT:${rendered.warnings.join(",")}`);
    const file = path.join(outDir, `${prefix}-${size}.png`);
    await raster(rendered.svg, { width: rendered.width, height: rendered.height, outFile: file, prefer: "chrome" });
    files.push(file);
    title_image[size] = { url: `https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${tag}/${path.basename(file)}`, width: rendered.width, height: rendered.height };
  }
  if (publish) {
    const publishedUrls = await publish(files, { tag });
    for (const size of ["og", "wide"]) title_image[size].url = publishedUrls?.[path.basename(title_image[size].url)] || title_image[size].url;
  }
  return { title_image, files, uploaded: Boolean(publish), provider_calls: 0 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const packetFile = process.argv.find(arg => arg.endsWith(".json"));
  if (!packetFile) throw new Error("Usage: node scripts/news/title-image/editorial.mjs review.json [--publish]");
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "woek-editorial-card-"));
  const result = await createEditorialTitleAssets(JSON.parse(fs.readFileSync(packetFile, "utf8")), { outDir, publish: process.argv.includes("--publish") ? createReleaseStore() : null });
  console.log(JSON.stringify(result));
}
