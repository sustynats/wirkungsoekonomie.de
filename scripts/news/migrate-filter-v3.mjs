import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { claimLedgerFor, sha256 } from "./lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STORIES_FILE = path.join(ROOT, "data/news/stories.json");
const CANONICAL_ID = "wt-4b5d0962d323432a";
const DUPLICATE_ID = "wt-52d036419dd386a9";

function storyContentHash(story) {
  return sha256(story.sources.map((source) => `${source.url}:${source.content_hash}`).sort().join("\n"));
}

const data = JSON.parse(fs.readFileSync(STORIES_FILE, "utf8"));
const canonical = data.stories.find((story) => story.story_id === CANONICAL_ID);
const duplicate = data.stories.find((story) => story.story_id === DUPLICATE_ID);
if (!canonical || !duplicate) throw new Error("FILTER_V3_MIGRATION_STORIES_MISSING");

if (duplicate.retirement?.reason_code !== "MERGED_INTO_LIVING_FILE") {
  const migratedAt = new Date().toISOString();
  canonical.sources = [...new Map([...canonical.sources, ...duplicate.sources].map((source) => [source.url, source])).values()];
  canonical.claims = claimLedgerFor(canonical.sources, canonical.story_id, migratedAt);
  canonical.content_hash = storyContentHash(canonical);

  duplicate.listed = false;
  duplicate.analysis_status = "mit fortgeführter Wirkungsakte zusammengeführt";
  duplicate.relevance_filter_version = "3.0";
  duplicate.retired_at = migratedAt;
  duplicate.retirement = {
    at: migratedAt,
    filter_version: "3.0",
    reason_code: "MERGED_INTO_LIVING_FILE",
    canonical_story_ids: [canonical.story_id],
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: "Die Meldung beschreibt denselben deutschen Kapazitätsmechanismus wie die fortgeführte Wirkungsakte. Beide Primärquellen werden dort gemeinsam ausgewertet.",
  };

  fs.writeFileSync(STORIES_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Zusammengeführt: ${DUPLICATE_ID} -> ${CANONICAL_ID}`);
} else {
  console.log("Filter-v3-Datenmigration war bereits angewendet.");
}
