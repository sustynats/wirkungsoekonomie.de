import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const audioRoot = path.join(root, "assets", "audio");
const explanationsPath = path.join(root, "assets", "data", "audio-explanations.json");
const metadataPath = path.join(root, "assets", "data", "audio-metadata.json");
const audioIndexPath = path.join(root, "audio", "index.html");

function readPreviousMetadata() {
  if (!fs.existsSync(metadataPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(metadataPath, "utf8")).items || {};
  } catch (error) {
    return {};
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".mp3") ? [full] : [];
  });
}

function publicPath(file) {
  return `/${path.relative(root, file).split(path.sep).join("/")}`;
}

function slugTitle(slug) {
  return slug
    .replace(/-/g, " ")
    .replace(/\bwoek\b/g, "WÖk")
    .replace(/\bwstg\b/gi, "WStG")
    .replace(/\bsdg\b/gi, "SDG")
    .replace(/\bt sroi\b/gi, "T-SROI")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function durationSeconds(file, previousMetadata) {
  const pub = publicPath(file);
  const result = spawnSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    file,
  ], { encoding: "utf8" });
  if (result.status === 0) {
    return Math.max(0, Math.round(Number(result.stdout.trim())));
  }
  const previous = previousMetadata[pub]?.duration_seconds;
  if (Number.isFinite(previous)) {
    return previous;
  }
  console.warn(`audio metadata: keine Laufzeit fuer ${pub}; ffprobe nicht verfuegbar und kein gespeicherter Wert vorhanden.`);
  return null;
}

function durationLabel(seconds) {
  if (!Number.isFinite(seconds)) return "wird vom Player geladen";
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateAudioIndex(metadata) {
  if (!fs.existsSync(audioIndexPath)) return;
  let html = fs.readFileSync(audioIndexPath, "utf8");

  html = html.replace(
    /<p class="card-text">Sprecherin: Natalie Weber\. Dauer: [^<]+<\/p>/g,
    '<p class="card-text">Audio-Erklärung mit Sprecherin Natalie Weber.</p>',
  );

  html = html.replace(/(\s*)<p class="audio-player-meta">[\s\S]*?<\/p>\s*<p class="audio-player-actions">[\s\S]*?<\/p>/g, "");

  html = html.replace(/(<audio[\s\S]*?<\/audio>)/g, (match) => {
    const source = match.match(/<source\s+src="([^"]+)"/i)?.[1];
    if (!source) return match;
    const resolved = new URL(source, "https://wirkungsoekonomie.de/audio/").pathname;
    const item = metadata[resolved];
    if (!item) return match;
    return `${match}
              <p class="audio-player-meta"><span>Sprecherin: ${item.speaker_name}</span><span>Dauer: ${item.duration_label}</span></p>
              <p class="audio-player-actions"><a class="text-link" href="${source}" download>MP3 herunterladen</a></p>`;
  });

  fs.writeFileSync(audioIndexPath, html);
}

const files = walk(audioRoot).sort();
const metadata = {};
const previousMetadata = readPreviousMetadata();

for (const file of files) {
  const seconds = durationSeconds(file, previousMetadata);
  const pub = publicPath(file);
  const slug = path.basename(file, ".mp3");
  metadata[pub] = {
    title: slugTitle(slug),
    speaker_name: "Natalie Weber",
    duration_seconds: seconds,
    duration_label: durationLabel(seconds),
    audio_file: pub,
  };
}

if (fs.existsSync(explanationsPath)) {
  const data = JSON.parse(fs.readFileSync(explanationsPath, "utf8"));
  for (const item of data.items || []) {
    const meta = metadata[item.audio_file];
    if (!meta) continue;
    meta.title = item.title || meta.title;
    meta.url = item.url;
    item.duration_seconds = meta.duration_seconds;
    item.duration_label = meta.duration_label;
    delete item.duration_estimate;
  }
  fs.writeFileSync(explanationsPath, `${JSON.stringify(data, null, 2)}\n`);
}

fs.mkdirSync(path.dirname(metadataPath), { recursive: true });
fs.writeFileSync(metadataPath, `${JSON.stringify({
  version: new Date().toISOString().slice(0, 10),
  generated_from: "assets/audio/**/*.mp3",
  items: metadata,
}, null, 2)}\n`);

updateAudioIndex(metadata);

console.log(`audio metadata: ${Object.keys(metadata).length} MP3-Dateien aktualisiert`);
