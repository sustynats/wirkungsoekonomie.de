import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = [
  "fachbibliothek/index.html",
  "downloads.html",
  "bibliothek/index.html",
  "downloads",
  "portale",
].map((file) => path.join(root, file)).filter((file) => fs.existsSync(file));

const artifactPattern = /\.(?:json|md|zip|xlsx|xls|csv)\b|content_index|toolcards_|Bestands-und-Nachlieferliste|Nachlieferliste|README_Rang\d+|Import pruefen|Import prüfen|ZIP-Gesamtpaket/i;
const findings = [];

function walk(entry, out = []) {
  const stat = fs.statSync(entry);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(entry, { withFileTypes: true })) {
      if (child.name === ".git" || child.name === "node_modules") continue;
      walk(path.join(entry, child.name), out);
    }
  } else if (entry.endsWith(".html")) {
    out.push(entry);
  }
  return out;
}

for (const file of targets.flatMap((target) => walk(target))) {
  const html = fs.readFileSync(file, "utf8");
  const artifactLinks = html.match(/<a\b[^>]*href=["'][^"']+\.(?:json|md|zip|xlsx|xls|csv)(?:[#?][^"']*)?["'][^>]*>[\s\S]*?<\/a>/gi) || [];
  artifactLinks.forEach((link) => {
    const label = link.replace(/<[^>]+>/g, "").trim() || "artifact link";
    findings.push(`${path.relative(root, file)}: ${label}`);
  });
  const cards = html.match(/<article\b[\s\S]*?<\/article>/gi) || [];
  cards.forEach((card, index) => {
    if (!/library-card|download-card|document-card|publication-card/i.test(card)) return;
    if (!artifactPattern.test(card)) return;
    const title = card.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || `card ${index + 1}`;
    findings.push(`${path.relative(root, file)}: ${title}`);
  });
  const rows = html.match(/<tr\b[\s\S]*?<\/tr>/gi) || [];
  rows.forEach((row, index) => {
    if (!artifactPattern.test(row)) return;
    const title = row.match(/<th[^>]*>([\s\S]*?)<\/th>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || `row ${index + 1}`;
    findings.push(`${path.relative(root, file)}: ${title}`);
  });
}

if (findings.length) {
  console.error("Public library artifact check failed:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`Public library artifact check passed for ${targets.length} page(s).`);
