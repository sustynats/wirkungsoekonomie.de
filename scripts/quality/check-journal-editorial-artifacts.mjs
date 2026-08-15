import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const blockedPatterns = [
  { label: "Armin-Maiwald", pattern: /\bArmin[- ]?Maiwald\b/i },
  { label: "Maiwaldisiert", pattern: /Maiwaldisiert/i },
  { label: "LinkdIn", pattern: /\bLinkdIn\b/i },
  { label: "LinkedIn-Fassung", pattern: /LinkedIn[- ]?Fassung/i },
  { label: "LINKEDIN-FASSUNG", pattern: /LINKEDIN-FASSUNG/ },
  { label: "LinkedIn-Artikel", pattern: /LinkedIn[- ]?Artikel/i },
  { label: "Journal-Fassung", pattern: /Journal[- ]?Fassung/i },
  { label: "Journalfassung", pattern: /Journalfassung/i },
  { label: "Fassung fuer LinkedIn", pattern: /Fassung\s+f(?:ü|ue)r\s+LinkedIn/i },
  { label: "Fassung fuer das Journal", pattern: /Fassung\s+f(?:ü|ue)r\s+das\s+Journal/i },
  { label: "Artikelpaket", pattern: /Artikelpaket/i },
  { label: "Redaktionsanweisung", pattern: /Redaktionsanweisung/i },
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(root, fullPath);
    if (relative === path.join("blog", "linkedin")) return [];
    if (relative === path.join("blog", "linkedin-artikel.html")) return [];
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function findingsForText(label, text) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const blocked of blockedPatterns) {
      if (blocked.pattern.test(line)) {
        findings.push(`${label}:${index + 1}: ${blocked.label}: ${line.trim().slice(0, 180)}`);
      }
    }
  }
  return findings;
}

function publicBlogIndexFindings() {
  const blogIndexPath = path.join(root, "assets", "data", "blog-index.json");
  if (!fs.existsSync(blogIndexPath)) return [];
  const entries = JSON.parse(fs.readFileSync(blogIndexPath, "utf8"));
  return entries.flatMap((entry) => {
    const url = String(entry.url ?? "");
    if (url.startsWith("/blog/linkedin/") || url === "/blog/linkedin-artikel.html") return [];
    return findingsForText(`assets/data/blog-index.json:${url || entry.slug || "entry"}`, JSON.stringify(entry));
  });
}

const htmlFindings = walk(path.join(root, "blog")).flatMap((filePath) =>
  findingsForText(path.relative(root, filePath), fs.readFileSync(filePath, "utf8"))
);
const findings = [...htmlFindings, ...publicBlogIndexFindings()];

if (findings.length) {
  console.error("Journal-Redaktionsartefakte gefunden:\n" + findings.join("\n"));
  process.exit(1);
}

console.log("Journal-Redaktionsartefakt-Check ok.");
