import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REPORT_JSON = path.join(ROOT, "reports/website-2.0-content-inventory.json");
const REPORT_MD = path.join(ROOT, "reports/website-2.0-content-inventory.md");

function walk(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, predicate);
    return entry.isFile() && predicate(full) ? [full] : [];
  });
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function htmlTitle(file) {
  const html = fs.readFileSync(file, "utf8");
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g, " ").trim() || "";
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

const htmlFiles = walk(ROOT, (file) => file.endsWith(".html") && !file.includes("/node_modules/"));
const audioFiles = walk(path.join(ROOT, "assets"), (file) => /\.(mp3|wav|m4a|ogg)$/i.test(file));
const debateLive = walk(path.join(ROOT, "wirkungsradar/live"), (file) => file.endsWith("/index.html"));
const debateDetail = walk(path.join(ROOT, "wirkungsradar/detail"), (file) => file.endsWith("/index.html"));
const debateIndex = exists("wirkungsradar/live/index.html");
const partyHub = exists("ordnung/anschlussfaehigkeit/index.html");
const partyPages = [
  "ordnung/anschlussfaehigkeit/cdu-csu.html",
  "ordnung/anschlussfaehigkeit/spd.html",
  "ordnung/anschlussfaehigkeit/gruene.html",
  "ordnung/anschlussfaehigkeit/fdp.html",
  "ordnung/anschlussfaehigkeit/linke.html",
  "ordnung/anschlussfaehigkeit/fallstudie-energiepolitik.html",
].filter(exists);

const samples = [
  "wirkungsradar/live/migration-kostet-nur/index.html",
  "wirkungsradar/live/gender-ideologie/index.html",
  "wirkungsradar/live/15-minuten-stadt-oder-klimakaefig/index.html",
  "mein-wirkungsraum/index.html",
  "ordnung/anschlussfaehigkeit/index.html",
].filter(exists);

const report = {
  generated_at: new Date().toISOString(),
  website_version_target: "2.0",
  counts: {
    html_pages: htmlFiles.length,
    debate_live_pages: debateLive.length,
    debate_detail_pages: debateDetail.length,
    audio_files: audioFiles.length,
    party_pages: partyPages.length,
  },
  route_checks: {
    "wirkungsradar/live/index.html": debateIndex,
    "ordnung/anschlussfaehigkeit/index.html": partyHub,
  },
  party_pages: partyPages,
  sample_pages: samples.map((file) => ({
    path: file,
    title: htmlTitle(path.join(ROOT, file)),
  })),
  preservation_notes: [
    "Debattenkarten wurden über Generator und kanonische Slugs aktualisiert.",
    "Merken/Mein-Wirkungsraum-Funktionen bleiben über bestehende Assets und Seitenskripte erhalten.",
    "Audiodateien wurden nicht entfernt; der Bericht zählt vorhandene Audioassets.",
    "Parteien-/Anschlussfähigkeitsseiten erhalten einen eigenen Hub.",
  ],
};

fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  REPORT_MD,
  `# Website 2.0 Content Inventory\n\nStand: ${report.generated_at}\n\n## Zählung\n\n- HTML-Seiten: ${report.counts.html_pages}\n- Debatten-Live-Seiten: ${report.counts.debate_live_pages}\n- Debatten-Detailseiten: ${report.counts.debate_detail_pages}\n- Audio-Dateien in assets/: ${report.counts.audio_files}\n- Anschlussfähigkeitsseiten: ${report.counts.party_pages}\n\n## Routenchecks\n\n${Object.entries(report.route_checks).map(([route, ok]) => `- ${route}: ${ok ? "OK" : "FEHLT"}`).join("\n")}\n\n## Anschlussfähigkeit\n\n${partyPages.map((file) => `- ${file}`).join("\n")}\n\n## Stichproben\n\n${report.sample_pages.map((page) => `- ${page.path}: ${page.title}`).join("\n")}\n\n## Erhaltungshinweise\n\n${report.preservation_notes.map((note) => `- ${note}`).join("\n")}\n`,
);

console.log(`Website 2.0 inventory written: ${rel(REPORT_JSON)}, ${rel(REPORT_MD)}`);
