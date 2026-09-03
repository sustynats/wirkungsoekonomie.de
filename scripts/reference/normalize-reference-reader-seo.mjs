import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REFERENCE_ROOT = path.join(ROOT, "referenz");
const SITE_URL = "https://wirkungsoekonomie.de";
const WORK_TITLE = "Die neue Ordnung des Wohlstands";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textFromHtml(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s*#\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function heading(html) {
  return textFromHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu)?.[1] || "");
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, files);
    else if (entry.isFile() && entry.name === "index.html") files.push(file);
  }
  return files;
}

function routeFor(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  return `/${rel.slice(0, -"index.html".length)}`;
}

function isNoindex(html) {
  return /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*["'])[^>]*>/iu.test(html);
}

function isRedirect(html) {
  return /<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])[^>]*>/iu.test(html);
}

function routeKind(file) {
  const route = routeFor(file);
  if (route === "/referenz/") return "portal";
  if (route === "/referenz/kapitel/") return "chapter-index";
  if (/^\/referenz\/kapitel-\d+/u.test(route)) return "chapter";
  if (route === "/referenz/teile/") return "part-index";
  if (/^\/referenz\/teil-\d+/u.test(route)) return "part";
  if (route === "/referenz/volltext/") return "fulltext";
  if (route === "/referenz/quellen/") return "source-index";
  if (/^\/referenz\/quellen\//u.test(route)) return "source";
  if (route === "/referenz/glossar/") return "glossary";
  return "other";
}

function titleFor(kind, h1) {
  const label = h1 || WORK_TITLE;
  if (kind === "portal") return `${WORK_TITLE} | Online-Buch der Wirkungsökonomie`;
  if (kind === "fulltext") return `${WORK_TITLE} – vollständige Onlinefassung | Wirkungsökonomie`;
  if (kind === "chapter") return `${label} | ${WORK_TITLE}`;
  if (kind === "chapter-index") return `Kapitelübersicht | ${WORK_TITLE}`;
  if (kind === "part") return `${label} | ${WORK_TITLE}`;
  if (kind === "part-index") return `Teileübersicht | ${WORK_TITLE}`;
  if (kind === "source-index") return `Quellenregister | ${WORK_TITLE}`;
  if (kind === "source") return `${label} | Quellenregister ${WORK_TITLE}`;
  if (kind === "glossary") return `Glossarverweise | ${WORK_TITLE}`;
  return `${label} | ${WORK_TITLE}`;
}

function descriptionFor(kind, h1) {
  const label = h1 || WORK_TITLE;
  if (kind === "portal") return `Das vollständige Online-Buch „${WORK_TITLE}“: Kapitel, Begriffe, Quellen und weiterführende Materialien.`;
  if (kind === "fulltext") return `Vollständige Onlinefassung des Grundlagenwerks „${WORK_TITLE}“.`;
  if (kind === "chapter") return `${label}. Kapitel der Onlinefassung „${WORK_TITLE}“.`;
  if (kind === "chapter-index") return `Kapitelübersicht des Grundlagenwerks „${WORK_TITLE}“.`;
  if (kind === "part") return `${label}. Teilübersicht der Onlinefassung „${WORK_TITLE}“.`;
  if (kind === "part-index") return `Teileübersicht des Grundlagenwerks „${WORK_TITLE}“.`;
  if (kind === "source-index") return `Quellenregister und Fundstellen des Grundlagenwerks „${WORK_TITLE}“.`;
  if (kind === "source") return `${label}. Quellenkarte mit Fundstellen im Grundlagenwerk „${WORK_TITLE}“.`;
  if (kind === "glossary") return `Begriffsverweise aus dem Grundlagenwerk „${WORK_TITLE}“.`;
  return `${label}. Onlinefassung des Grundlagenwerks „${WORK_TITLE}“.`;
}

function setMeta(html, name, content) {
  const meta = new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, "iu");
  const replacement = `<meta name="${name}" content="${escapeHtml(content)}">`;
  return meta.test(html)
    ? html.replace(meta, replacement)
    : html.replace(/<\/head>/iu, `    ${replacement}\n  </head>`);
}

function setCanonical(html, canonical) {
  const link = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/iu;
  const replacement = `<link rel="canonical" href="${canonical}">`;
  return link.test(html)
    ? html.replace(link, replacement)
    : html.replace(/<\/head>/iu, `    ${replacement}\n  </head>`);
}

function removeTechnicalReaderText(html) {
  const technicalNote = /\b(?:codex|codex)\b|\b(?:interne[rs]?\s+)?repository(?:-|\s)*(?:anweisungen?|pfade?|strukturen?|informationen?|hinweise?)\b|\bredaktioneller\s+hinweis\b|\b(?:interne[rs]?\s+)?(?:arbeitsauftrag|prompts?|build[-\s]*(?:schritte?|notizen?)|testnotizen?|ki-anweisungen?)\b/iu;
  return html
    .replace(/Exportpfad/giu, "weiterführenden Materialien")
    .replace(/Vollständige Web-Volltextansicht der bestätigten DOCX-Fassung\./giu, "Vollständige, kapitelweise zitierbare Lesefassung des Grundlagenwerks.")
    .replace(/<(p|li|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/giu, (block, tag, inner) => technicalNote.test(textFromHtml(inner)) ? "" : block);
}

let changed = 0;
let indexedPages = 0;
let skippedNoindex = 0;
let redacted = 0;

for (const file of walk(REFERENCE_ROOT)) {
  const before = fs.readFileSync(file, "utf8");
  let html = removeTechnicalReaderText(before);
  if (html !== before) redacted += 1;
  if (isNoindex(html) || isRedirect(html)) {
    skippedNoindex += 1;
  } else {
    const kind = routeKind(file);
    const h1 = heading(html);
    const title = titleFor(kind, h1);
    const description = descriptionFor(kind, h1);
    html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/iu, `<title>${escapeHtml(title)}</title>`);
    html = setMeta(html, "description", description);
    html = setMeta(html, "search_description", description);
    html = setCanonical(html, `${SITE_URL}${routeFor(file)}`);
    indexedPages += 1;
  }
  if (html !== before) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(`Referenz-SEO normalisiert: ${changed} Seiten geändert; ${indexedPages} indexierbare Seiten mit Titel, Beschreibung und Canonical.`);
console.log(`  Noindex-/Redirect-Seiten unverändert kanonisch belassen: ${skippedNoindex}; technische Lesereste entfernt: ${redacted}.`);
