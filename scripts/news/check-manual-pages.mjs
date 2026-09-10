import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadManualEditorials, EDITORIAL_AUTHOR } from "./manual-editorial.mjs";
import { escape } from "./editorial-markdown.mjs";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const plain = html => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Read-only gate on BOTH source render and final deploy artifact. Every
// manuscript block, in order and with original punctuation, must survive.
export function checkManualPages(outputRoot, editions = loadManualEditorials(sourceRoot)) {
  for (const edition of editions.filter(e => e.status === "published")) {
    const html = fs.readFileSync(path.join(outputRoot, "wirkungsticker/analyse", edition.slug, "index.html"), "utf8");
    const page = plain(html);
    let cursor = page.indexOf(escape(edition.title));
    if (cursor < 0 || !html.includes('data-manuscript-sha256="' + edition.manuscript_sha256 + '"')) throw Error("MANUAL_PAGE_IDENTITY:" + edition.slug);
    for (const section of edition.rendered.sections) for (const block of section.blocks) {
      const text = plain(block);
      if (!text) continue;
      const at = page.indexOf(text, cursor);
      if (at < 0) throw Error("MANUAL_PUBLISHED_TEXT_CHANGED:" + edition.slug + ":" + text.slice(0, 100));
      cursor = at + text.length;
    }
    if (!html.includes(EDITORIAL_AUTHOR.image) || !html.includes(edition.book.cover)
      || html.includes("/undefined/") || !html.includes('"@type":"Book"')
      || !html.includes('data-news-share-button')) throw Error("MANUAL_PAGE_INTEGRATION:" + edition.slug);
    for (const slug of edition.manual_related_slugs) {
      if (!html.includes('/wirkungsticker/analyse/' + slug + '/')) throw Error("MANUAL_RELATED_LINK_MISSING:" + edition.slug + ":" + slug);
    }
    for (const asset of [EDITORIAL_AUTHOR.image, ...(edition.book.volumes || [edition.book]).map(volume => volume.cover)]) {
      if (!fs.existsSync(path.join(outputRoot, asset))) throw Error("MANUAL_PUBLIC_ASSET_MISSING:" + asset);
      const digest = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
      if (digest(path.join(outputRoot, asset)) !== digest(path.join(sourceRoot, asset))) throw Error("MANUAL_PUBLIC_ASSET_CHANGED:" + asset);
    }
  }
  return editions.filter(e => e.status === "published").length;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log("Unveränderte manuelle Buchbesprechungen geprüft: " + checkManualPages(path.resolve(process.argv[2] || sourceRoot)));
}
