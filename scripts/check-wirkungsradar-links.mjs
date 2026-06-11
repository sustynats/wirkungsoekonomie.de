import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const linkMapFile = path.join(ROOT, "assets/data/wirkungsradar-link-map.json");
const reportFile = path.join(ROOT, "reports/wirkungsradar-link-check.md");
const linkMap = JSON.parse(fs.readFileSync(linkMapFile, "utf8"));
const findings = [];

function existsInternal(href) {
  const clean = href.split("?")[0].replace(/^\/+/, "");
  if (!clean) return true;
  const candidates = [
    path.join(ROOT, clean),
    path.join(ROOT, clean, "index.html"),
    path.join(ROOT, clean.replace(/\/$/, ""), "index.html"),
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

for (const [slug, groups] of Object.entries(linkMap)) {
  for (const [group, hrefs] of Object.entries(groups)) {
    const seen = new Set();
    if (!Array.isArray(hrefs)) {
      findings.push([slug, group, "not_array", "Linkgruppe ist keine Liste"]);
      continue;
    }
    for (const href of hrefs) {
      if (seen.has(href)) findings.push([slug, group, "duplicate", href]);
      seen.add(href);
      if (/^https?:\/\//.test(href)) continue;
      if (!existsInternal(href)) findings.push([slug, group, "missing_internal_target", href]);
    }
  }
  if ((groups.glossary || []).length < 5) findings.push([slug, "glossary", "too_few", "weniger als fünf Glossarlinks"]);
  if (!(groups.narratives || []).length) findings.push([slug, "narratives", "missing", "kein Narrativlink"]);
  if ((groups.relatedDossiers || []).length < 3) findings.push([slug, "relatedDossiers", "too_few", "weniger als drei ähnliche Karten"]);
  if (!(groups.solutions || []).length) findings.push([slug, "solutions", "missing", "keine Lösung"]);
  if (!(groups.sources || []).length) findings.push([slug, "sources", "missing", "keine Quellenlinks"]);
}

const lines = [
  "# Wirkungsradar Link-Check",
  "",
  `Dossiers: ${Object.keys(linkMap).length}`,
  `Findings: ${findings.length}`,
  "",
  ...(findings.length ? findings.map(([slug, group, type, detail]) => `- ${slug} / ${group}: ${type} - ${detail}`) : ["Keine Findings."]),
  "",
];

fs.mkdirSync(path.dirname(reportFile), { recursive: true });
fs.writeFileSync(reportFile, lines.join("\n"));

if (findings.some(([, , type]) => ["missing_internal_target", "missing", "too_few"].includes(type))) {
  console.error(`Wirkungsradar link check failed with ${findings.length} findings.`);
  process.exit(1);
}

console.log(`Wirkungsradar link check OK: ${Object.keys(linkMap).length} dossiers.`);
