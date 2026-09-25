import { readRepositoryJson, writeRepositoryJson } from './newsroom-store.mjs';
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { duplicateGroups, mergeLivingFiles, isMerged } from "./living-files.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const file = path.join(root, "data/news/stories.json");
const data = readRepositoryJson(file, "utf8");
const groups = duplicateGroups(data.stories);
console.log(JSON.stringify({ mode: process.argv.includes("--apply") ? "apply" : "review-only", groups }, null, 2));
if (process.argv.includes("--apply") && groups.length) {
  const now = new Date().toISOString();
  const changes = mergeLivingFiles(data.stories, groups, now);
  if (changes.length) {
    data.public_updated_at = now;
    writeRepositoryJson(file, data);
    const stateFile = path.join(root, "data/news/state.json");
    const state = readRepositoryJson(stateFile, "utf8");
    state.pending_story_ids = data.stories.filter((story) => !isMerged(story) && ((!story.published && story.listed !== false) || story.pending_update)).map((story) => story.story_id);
    fs.writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`);
  }
}
