import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { isDeepStrictEqual } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const exec = promisify(execFile);

const GENERATED_PATHS = ["news", "wirkungsticker", "sitemap.xml", "assets/search/search-index.json", "public/data/woek-search-meta.json", "content/taxonomy/site-map.json", "umfragen", "admin/umfragen", "reports/wirkungsticker-source-integrity.json", "reports/wirkungsticker-source-portfolio.json", "data/wirkungsticker/source-audit-2026-09-05.json"];
const STORY_STORE = "data/news/stories.json";

// Merge whole story records, never prose, evidence, versions or source arrays.
// Two different changes to the same record remain a real conflict, even when
// one timestamp is newer. A newer editor must not silently lose their work.
export function mergeDisjointStoryStores(base, upstream, worker) {
  const index = store => {
    if (!store || !Array.isArray(store.stories) || typeof store.schema_version !== "string" || !Number.isFinite(Date.parse(store.updated_at))) throw new Error("STORY_STORE_INVALID");
    const rows = new Map();
    for (const story of store.stories) {
      if (!story || typeof story.story_id !== "string" || !story.story_id || rows.has(story.story_id)) throw new Error("STORY_IDENTITIES_INVALID");
      rows.set(story.story_id, story);
    }
    return rows;
  };
  const b = index(base), u = index(upstream), w = index(worker);
  if (base.schema_version !== upstream.schema_version || base.schema_version !== worker.schema_version) throw new Error("STORY_SCHEMA_CONFLICT");
  const mergeValue = (old, left, right) => {
    if (isDeepStrictEqual(left, right)) return left;
    if (isDeepStrictEqual(left, old)) return right;
    if (isDeepStrictEqual(right, old)) return left;
    throw new Error("STORY_RECORD_OVERLAP");
  };
  const merged = {};
  for (const key of new Set([...Object.keys(base), ...Object.keys(upstream), ...Object.keys(worker)])) {
    if (key === "stories" || key === "updated_at") continue;
    const value = mergeValue(base[key], upstream[key], worker[key]);
    if (value !== undefined) merged[key] = value;
  }
  merged.updated_at = [upstream.updated_at, worker.updated_at].sort((a, b) => Date.parse(b) - Date.parse(a))[0];
  merged.stories = [];
  for (const id of new Set([...u.keys(), ...w.keys(), ...b.keys()])) {
    const record = mergeValue(b.get(id), u.get(id), w.get(id));
    if (record !== undefined) merged.stories.push(record);
  }
  return merged;
}
export function regeneratablePublicationPath(file) {
  if (file.includes("..") || file.startsWith("/")) return false;
  return GENERATED_PATHS.filter(base => base.includes(".")).includes(file)
    || /^news\/feed\.(?:xml|atom|json)$/.test(file)
    || /^wirkungsticker\/(?:feed\.(?:xml|atom|json)|data\/stories\.json|(?:[a-z0-9-]+\/)*index\.html|(?:analyse\/|lage\/)?\.generated-[a-z-]+\.json)$/.test(file)
    || /^(?:admin\/)?umfragen\/(?:[a-z0-9-]+\/)*index\.html$/.test(file);
}
const stdout = result => typeof result === "string" ? result : result?.stdout || "";
async function git(args) {
  return exec("git", args, { maxBuffer: 64 * 1024 * 1024, env: { ...process.env, GIT_EDITOR: "true" } });
}
async function rebuildPublication() {
  // No collection, image generation or paid analysis. Re-render the retained
  // canonical data with the newly integrated generators before publication.
  for (const script of ["news:test", "news:build", "polls:build", "build:search", "taxonomy:build", "news:source-integrity:audit", "news:source-portfolio:audit", "news:validate"]) {
    const result = await exec("npm", ["run", script, ...(script.endsWith(":audit") ? ["--", "--strict"] : [])], { maxBuffer: 16 * 1024 * 1024 });
    if (result.stdout) process.stdout.write(result.stdout);
  }
}

export async function publishGitUpdate({ run = git, rebuild = rebuildPublication, writeStoryStore = store => fs.writeFileSync(STORY_STORE, `${JSON.stringify(store, null, 2)}\n`), sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  let regenerated = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const before = stdout(await run(["rev-parse", "HEAD"])).trim();
    let recovered = false;
    try {
      await run(["pull", "--rebase", "origin", "main"]);
    } catch (error) {
      const conflicts = stdout(await run(["diff", "--name-only", "--diff-filter=U", "-z"])).split("\0").filter(Boolean);
      if (!conflicts.length) throw error;
      let combinedStories;
      if (conflicts.includes(STORY_STORE)) {
        try {
          // In a rebase: stage 1 = common base, 2 = upstream, 3 = worker.
          const versions = await Promise.all([1, 2, 3].map(async stage => JSON.parse(stdout(await run(["show", `:${stage}:${STORY_STORE}`])))));
          combinedStories = mergeDisjointStoryStores(...versions);
        } catch { /* Malformed or overlapping records stay blocked. */ }
      }
      if (!conflicts.every(file => regeneratablePublicationPath(file) || (file === STORY_STORE && combinedStories))) {
        // Restore our own pre-rebase state; canonical data, source code and
        // history are never resolved by choosing a side or force-pushing.
        await run(["rebase", "--abort"]);
        throw new Error(`PUBLISH_CANONICAL_CONFLICT:${conflicts.join(",")}`, { cause: error });
      }
      try {
        if (combinedStories) {
          await writeStoryStore(combinedStories);
          await run(["add", "--", STORY_STORE]);
        }
        const generatedConflicts = conflicts.filter(regeneratablePublicationPath);
        if (generatedConflicts.length) await run(["restore", "--source=HEAD", "--staged", "--worktree", "--", ...generatedConflicts]);
        await run(["-c", "core.editor=true", "rebase", "--continue"]);
      }
      catch (failure) { await run(["rebase", "--abort"]); throw failure; }
      recovered = true;
    }
    if (recovered || stdout(await run(["rev-parse", "HEAD"])).trim() !== before) {
      await rebuild();
      const generated = [...new Set(stdout(await run(["ls-files", "--modified", "--deleted", "--others", "--exclude-standard", "-z"])).split("\0").filter(regeneratablePublicationPath))];
      if (generated.length) await run(["add", "--", ...generated]);
      const changed = stdout(await run(["diff", "--cached", "--name-only", "-z"])).split("\0").filter(Boolean);
      if (changed.some(file => !regeneratablePublicationPath(file))) throw new Error("PUBLISH_UNEXPECTED_STAGED_CHANGE");
      if (changed.length) await run(["commit", "-m", "[wirkungsticker] Ansichten nach parallelem Release neu erzeugen"]);
      regenerated = true;
    }
    try {
      await run(["push", "origin", "HEAD:main"]);
      return { attempts: attempt, regenerated };
    } catch (error) {
      if (attempt === 3) throw error;
      // A parallel release may advance main during the expensive object upload.
      // Re-read and integrate it before a bounded idempotent push retry.
      await sleep(attempt * 2000);
    }
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await publishGitUpdate();
