import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTitleImagePipeline, publicTitleImage } from "./pipeline.mjs";
import { buildNewsSite } from "../build.mjs";

export async function backfillTitleImages({ root = path.resolve(import.meta.dirname, "../../.."), limit = 5, dryRun = true, cardsOnly = false, renderOnly = false, prepare = null, maxDurationMs = 240000, build = buildNewsSite } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("TITLE_IMAGE_LIMIT_INVALID");
  const file = path.join(root, "data/news/stories.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const reportFile = path.join(root, "reports/wirkungsticker-latest-run.json");
  const report = JSON.parse(fs.readFileSync(reportFile, "utf8"));
  const candidates = data.stories.filter((story) => story.published && story.listed !== false && story.analysis && (renderOnly ? story.title_image : !story.title_image?.wide || story.title_image.retry_after));
  const worker = prepare || createTitleImagePipeline({ root, allowGeneration: !renderOnly, maxGenerations: limit });
  const results = []; let changed = 0;
  const selected = candidates.slice(0, limit);
  if (!dryRun && !renderOnly) {
    // The user-approved snapshot survives the runner and the workstation. If
    // this bounded batch stops, normal server-triggered runs finish one queued
    // image at a time; no recurring paid all-history backfill is introduced.
    const queuedAt = new Date().toISOString();
    for (const story of selected) story.title_image = { ...story.title_image, retry_after: story.title_image?.retry_after || queuedAt };
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  }
  const deadline = Date.now() + maxDurationMs;
  for (const story of selected) {
    if (!dryRun && Date.now() >= deadline) break;
    const result = await worker(story, { dryRun, cardsOnly });
    if (dryRun) { results.push(result); continue; }
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
  console.log(JSON.stringify(await backfillTitleImages({ limit, dryRun: !process.argv.includes("--execute") || process.argv.includes("--dry-run"), cardsOnly: process.argv.includes("--cards-only"), renderOnly: process.argv.includes("--render-only") }), null, 2));
}
