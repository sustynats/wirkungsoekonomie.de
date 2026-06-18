import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const releaseBase = "https://github.com/sustynats/wirkungsoekonomie.de/releases/download/";
const podcastIndexFile = path.join(root, "assets", "data", "podcast-index.json");
const maxInlineVideoBytes = 20 * 1024 * 1024;

const failures = [];
const warnings = [];

function statIfExists(file) {
  try {
    return fs.statSync(file);
  } catch {
    return null;
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() ? [full] : [];
  });
}

if (fs.existsSync(podcastIndexFile)) {
  const episodes = JSON.parse(fs.readFileSync(podcastIndexFile, "utf8"));
  for (const episode of episodes) {
    if (episode.status !== "published" || !episode.audio) continue;
    if (!String(episode.audio).startsWith(releaseBase)) {
      failures.push(`${episode.id}: podcast audio must use a GitHub Release URL, got ${episode.audio}`);
    }
    if (episode.audioStorage !== "github-release") {
      failures.push(`${episode.id}: audioStorage must be "github-release" for published podcast audio`);
    }
    if (!episode.audioRelease || !episode.audioAsset) {
      failures.push(`${episode.id}: audioRelease and audioAsset are required for release-hosted podcast audio`);
    }
    if (!episode.audioBytes || !episode.durationSeconds) {
      failures.push(`${episode.id}: audioBytes and durationSeconds are required for podcast RSS enclosures`);
    }
  }
}

const localPodcastAudio = walk(path.join(root, "assets", "audio", "podcast"))
  .filter((file) => /\.(mp3|m4a|wav)$/i.test(file));
for (const file of localPodcastAudio) {
  const rel = path.relative(root, file);
  failures.push(`${rel}: podcast audio belongs in GitHub Releases, not in the website deploy tree`);
}

const videos = walk(path.join(root, "assets", "video"))
  .filter((file) => /\.mp4$/i.test(file));
for (const file of videos) {
  const stat = statIfExists(file);
  if (stat && stat.size > maxInlineVideoBytes) {
    const rel = path.relative(root, file);
    failures.push(`${rel}: ${Math.round(stat.size / 1024 / 1024)} MB exceeds the ${Math.round(maxInlineVideoBytes / 1024 / 1024)} MB inline-video limit; publish via GitHub Releases`);
  }
}

if (warnings.length) {
  console.warn(warnings.map((warning) => `release-assets warning: ${warning}`).join("\n"));
}

if (failures.length) {
  console.error(failures.map((failure) => `release-assets error: ${failure}`).join("\n"));
  process.exit(1);
}

console.log("release-assets: GitHub Release media standard ok");
