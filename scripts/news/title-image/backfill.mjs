import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTitleImagePipeline, publicTitleImage } from "./pipeline.mjs";
import { buildNewsSite } from "../build.mjs";
import { IMAGE_CONFIG as C, chooseTitleImageMode } from "./policy.mjs";

export async function backfillTitleImages({ root = path.resolve(import.meta.dirname, "../../.."), limit = 5, dryRun = true, cardsOnly = false, renderOnly = false, editorialOnly = false, refreshEditorial = false, prepare = null, maxDurationMs = 600000, build = buildNewsSite } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("TITLE_IMAGE_LIMIT_INVALID");
  if (editorialOnly && (!renderOnly || cardsOnly)) throw new Error("TITLE_IMAGE_EDITORIAL_ONLY_REQUIRES_RENDER_ONLY");
  if (refreshEditorial && (renderOnly || cardsOnly || editorialOnly)) throw new Error("TITLE_IMAGE_REFRESH_MODE_CONFLICT");
  const file = path.join(root, "data/news/stories.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const reportFile = path.join(root, "reports/wirkungsticker-latest-run.json");
  const report = JSON.parse(fs.readFileSync(reportFile, "utf8"));
  const needsEditorialRefresh = story => chooseTitleImageMode(story).mode === "editorial" && (story.title_image?.mode !== "editorial" || ![C.prompt_version, "woek-editorial-3-concrete"].includes(story.title_image?.source_visual?.prompt_version));
  const candidates = data.stories.filter((story) => story.published && story.listed !== false && story.analysis && (refreshEditorial
    ? needsEditorialRefresh(story) || (story.title_image?.mode === "impact_card" && story.title_image.template_version !== C.template_version)
    : (!editorialOnly || story.title_image?.mode === "editorial") && (renderOnly ? story.title_image : !story.title_image?.wide || story.title_image.retry_after)));
  const worker = prepare || createTitleImagePipeline({ root, allowGeneration: !renderOnly, maxGenerations: limit });
  const results = []; let changed = 0;
  const selected = candidates.slice(0, limit);
  if (!dryRun && !renderOnly) {
    // The user-approved snapshot survives the runner and the workstation. If
    // this bounded batch stops, normal server-triggered runs finish one queued
    // bounded images at a time; no recurring paid all-history backfill is introduced.
    const queuedAt = new Date().toISOString();
    for (const story of selected) story.title_image = { ...story.title_image, retry_after: queuedAt, ...(refreshEditorial && needsEditorialRefresh(story) ? { refresh_prompt_version: C.prompt_version } : {}) };
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  }
  const deadline = Date.now() + maxDurationMs;
  for (const story of selected) {
    if (!dryRun && Date.now() >= deadline) break;
    const input = dryRun && refreshEditorial && needsEditorialRefresh(story) ? { ...story, title_image: { ...story.title_image, refresh_prompt_version: C.prompt_version } } : story;
    const result = await worker(input, { dryRun, cardsOnly });
    if (dryRun) { results.push(result); continue; }
    // An overlay-only batch must not replace a working motif with a fallback
    // after a transient download/render failure. Keep the live references.
    if (editorialOnly && (result.title_image?.mode !== "editorial" || !["og", "wide", "square"].every((key) => result.title_image[key]?.url))) {
      results.push({ ...result.report, status: "preserved", reason: "EDITORIAL_OVERLAY_NOT_READY" });
      continue;
    }
    if (JSON.stringify(publicTitleImage(story.title_image)) !== JSON.stringify(publicTitleImage(result.title_image))) changed += 1;
    story.title_image = result.title_image;
    results.push(result.report);
    if (changed) data.public_updated_at = new Date().toISOString();
    // Persist each successfully published asset reference, even if a later item
    // fails. Never rewrite news text, editorial dates, versions or source history.
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  }
  if (!dryRun) {
    report.title_images = [...(report.title_images || []), ...results];
    report.title_images_changed = (report.title_images_changed || 0) + changed;
    report.public_changed ||= changed > 0;
    fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
    build();
  }
  return { dry_run: dryRun, candidates: candidates.length, selected: results.length, changed, results };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const limit = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.slice(8) || 5);
  console.log(JSON.stringify(await backfillTitleImages({ limit, dryRun: !process.argv.includes("--execute") || process.argv.includes("--dry-run"), cardsOnly: process.argv.includes("--cards-only"), renderOnly: process.argv.includes("--render-only"), editorialOnly: process.argv.includes("--editorial-only"), refreshEditorial: process.argv.includes("--refresh-editorial") }), null, 2));
}
