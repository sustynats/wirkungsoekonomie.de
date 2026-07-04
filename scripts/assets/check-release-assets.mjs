import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const releaseBase = "https://github.com/sustynats/wirkungsoekonomie.de/releases/download/";
const podcastIndexFile = path.join(root, "assets", "data", "podcast-index.json");
const publicReleaseAssetsFile = path.join(root, "assets", "data", "public-release-assets.json");
const artifactDir = path.join(root, "_site");
const maxInlineVideoBytes = 20 * 1024 * 1024;
const publicReleaseAssetRoots = [
  "assets/audio",
  "assets/video",
  "assets/pdf",
  "assets/downloads",
  "public/downloads",
  "content/governance",
  "docs",
];
const publicReleaseAssetExtensions = new Set([".docx", ".mp3", ".mp4", ".pdf", ".xlsx", ".zip"]);

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

function toPosixRelative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function readPublicReleaseAssets() {
  if (!fs.existsSync(publicReleaseAssetsFile)) return new Map();

  const manifest = JSON.parse(fs.readFileSync(publicReleaseAssetsFile, "utf8"));
  return new Map(Object.entries(manifest.assets || {}));
}

if (fs.existsSync(podcastIndexFile)) {
  const episodes = JSON.parse(fs.readFileSync(podcastIndexFile, "utf8"));
  for (const episode of episodes) {
    if (episode.status !== "published" || !episode.audio) continue;
    const audio = String(episode.audio);
    const isReleaseAudio = audio.startsWith(releaseBase);
    if (!isReleaseAudio) {
      failures.push(`${episode.id}: podcast audio must use a GitHub Release URL, got ${episode.audio}`);
    }
    if (isReleaseAudio && episode.audioStorage !== "github-release") {
      failures.push(`${episode.id}: audioStorage must be "github-release" for release-hosted podcast audio`);
    }
    if (!episode.audioRelease || !episode.audioAsset) {
      failures.push(`${episode.id}: audioRelease and audioAsset are required for podcast audio provenance`);
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
  failures.push(`${rel}: podcast audio must be stored as GitHub Release assets, not in the website deploy tree`);
}

const publicReleaseAssets = readPublicReleaseAssets();
const publicReleaseFiles = publicReleaseAssetRoots.flatMap((assetRoot) => walk(path.join(root, assetRoot)))
  .filter((file) => publicReleaseAssetExtensions.has(path.extname(file).toLowerCase()));

for (const file of publicReleaseFiles) {
  const rel = toPosixRelative(file);
  const releaseUrl = publicReleaseAssets.get(rel);
  if (!releaseUrl) {
    failures.push(`${rel}: public media/doc asset must be listed in ${path.relative(root, publicReleaseAssetsFile)}`);
  } else if (!String(releaseUrl).startsWith(releaseBase)) {
    failures.push(`${rel}: public media/doc asset must point to a GitHub Release URL`);
  }
}

if (fs.existsSync(artifactDir)) {
  for (const relative of publicReleaseAssets.keys()) {
    if (fs.existsSync(path.join(artifactDir, relative))) {
      failures.push(`${relative}: release-hosted public asset must not be present in _site`);
    }
  }
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

console.log("release-assets: media storage standard ok");
