import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "assets/data/content-registry.json");
const PUBLIC_OUT = path.join(ROOT, "public/data/content-registry.json");
const AUDIT_OUT = path.join(ROOT, "docs/page-type-audit.md");
const TOOL_REGISTRY = path.join(ROOT, "assets/data/tool-registry.json");

const SCAN_ROOTS = [
  "index.html",
  "verstehen.html",
  "wirkungsoekonomie.html",
  "modell.html",
  "kompass.html",
  "glossar.html",
  "akademie.html",
  "suche.html",
  "downloads.html",
  "fachbibliothek",
  "begriffe",
  "wirkungsfelder",
  "werkzeuge",
  "erleben",
  "anwendungen",
  "downloads",
  "portale",
  "werkstatt",
  "dokumente",
  "referenz",
  "blog.html",
  "blog",
  "impressum.html",
  "datenschutz.html",
];

const PAGE_TYPES = new Set([
  "landing",
  "verstehen",
  "wirkungsfeld",
  "begriff",
  "detailkonzept",
  "dossier",
  "tool",
  "methode",
  "akademie",
  "kompass",
  "suche",
  "download-bibliothek",
  "journal",
  "person",
  "legal",
]);

function walk(entry, files = []) {
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  if (stat.isFile() && entry.endsWith(".html")) files.push(entry);
  if (!stat.isDirectory()) return files;
  for (const child of fs.readdirSync(full, { withFileTypes: true })) {
    if (child.name === ".git" || child.name === "node_modules") continue;
    walk(path.join(entry, child.name), files);
  }
  return files;
}

function routeFor(rel) {
  if (rel === "index.html") return "/";
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function htmlText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function clean(value = "") {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function firstMatch(text, regex, fallback = "") {
  return text.match(regex)?.[1]?.trim() || fallback;
}

function idFor(route) {
  const slug = route === "/" ? "start" : route.replace(/^\/|\/$/g, "").replace(/[^a-z0-9äöüß]+/gi, "-").toLowerCase();
  const suffix = crypto.createHash("sha1").update(route).digest("hex").slice(0, 6);
  return `${slug || "seite"}-${suffix}`;
}

function pageTypeFor(rel) {
  if (rel === "index.html") return "landing";
  if (rel === "suche.html") return "suche";
  if (rel === "akademie.html" || rel.startsWith("akademie/")) return "akademie";
  if (rel === "kompass.html" || rel.startsWith("kompass/")) return "kompass";
  if (rel === "impressum.html" || rel === "datenschutz.html") return "legal";
  if (rel === "blog.html" || rel.startsWith("blog/")) return "journal";
  if (rel.startsWith("begriffe/")) return "begriff";
  if (rel === "verstehen.html" || rel === "wirkungsoekonomie.html" || rel === "modell.html" || rel === "glossar.html" || rel.startsWith("verstehen/")) return "verstehen";
  if (rel === "downloads.html" || rel.startsWith("downloads/") || rel.startsWith("fachbibliothek/")) return "download-bibliothek";
  if (rel.startsWith("anwendungen/") || rel.startsWith("erleben/")) return "tool";
  if (rel.startsWith("werkzeuge/")) {
    if (/\/dossiers?\//.test(rel) || /\/dossier\//.test(rel)) return "dossier";
    if (/\/detailkonzepte?\//.test(rel) || /\/methodenpapiere\//.test(rel)) return "detailkonzept";
    return "methode";
  }
  if (rel.startsWith("wirkungsfelder/")) {
    if (/\/dossiers?\//.test(rel) || /\/dossier\//.test(rel) || /\/gesamtdossier\//.test(rel)) return "dossier";
    if (/\/detailkonzepte?\//.test(rel) || /\/konzept/.test(rel)) return "detailkonzept";
    const parts = rel.split("/");
    return parts.length === 3 && parts[2] === "index.html" ? "wirkungsfeld" : "detailkonzept";
  }
  if (rel.startsWith("portale/")) {
    if (/\/downloads\//.test(rel)) return "download-bibliothek";
    if (/\/gesamtdossier\//.test(rel) || /\/dossiers?\//.test(rel)) return "dossier";
    if (/\/konzeptpapier\//.test(rel) || /\/detailkonzepte?\//.test(rel)) return "detailkonzept";
    const parts = rel.split("/");
    return parts.length === 3 && parts[2] === "index.html" ? "wirkungsfeld" : "detailkonzept";
  }
  if (rel.startsWith("referenz/") || rel.startsWith("dokumente/") || rel.startsWith("werkstatt/")) return "dossier";
  return "landing";
}

function statusFor(rel, route, type, text, toolByRoute) {
  const tool = toolByRoute.get(route);
  if (tool?.status === "interactive") return "interactive";
  if (tool?.status === "method") return "method";
  if (/draft|hidden/i.test(firstMatch(text, /<meta name=["']robots["'] content=["']([^"']+)/i))) return "hidden";
  if (/Archiv|historische Dokumente/i.test(text) && (rel.startsWith("werkstatt/") || rel.startsWith("downloads/"))) return "archive";
  if (type === "methode") return "method";
  return "published";
}

function termsFrom(text) {
  const known = [
    "Wirkung",
    "Wirkungspotenzial",
    "positive Netto-Wirkung",
    "SDG+",
    "WÖk-ID",
    "Scorecard",
    "NWI",
    "Reverse Merit Order",
    "T-SROI",
    "Wirkungssteuer",
    "Wirkungsrat",
    "Wirkungseinkommen",
    "Wirkungsfonds",
    "Wirkungshaushalt",
    "Wirkungsdatenraum",
    "Medienwirkung",
    "Wirkungskompetenz",
  ];
  return known.filter((term) => new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(text));
}

function topicsFrom(rel, text) {
  const parts = rel.split("/").filter(Boolean).slice(0, 3).map((part) => part.replace(/-/g, " "));
  const sdgs = Array.from(new Set(Array.from(text.matchAll(/\bSDG\s*\+?|\bSDG\s*\d{1,2}/gi)).map((item) => item[0].replace(/\s+/g, " ").trim()))).slice(0, 10);
  return [...parts, ...sdgs].filter(Boolean);
}

const tools = fs.existsSync(TOOL_REGISTRY) ? JSON.parse(fs.readFileSync(TOOL_REGISTRY, "utf8")) : [];
const toolByRoute = new Map(tools.map((tool) => [String(tool.route || "").replace(/#.*$/, ""), tool]));
const files = [...new Set(SCAN_ROOTS.flatMap((root) => walk(root)))].sort();
const entries = [];
const findings = [];
const counts = new Map();

for (const rel of files) {
  const route = routeFor(rel);
  const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const text = htmlText(html);
  const title = firstMatch(html, /<meta name=["']search_title["'] content=["']([^"']+)/i)
    || clean(firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i))
    || clean(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i))
    || rel;
  const description = firstMatch(html, /<meta name=["']description["'] content=["']([^"']+)/i, text.slice(0, 220));
  const pageType = pageTypeFor(rel);
  const status = statusFor(rel, route, pageType, html, toolByRoute);
  const entry = {
    id: idFor(route),
    title,
    url: route,
    pageType,
    audience: [],
    topics: topicsFrom(rel, text),
    terms: termsFrom(text),
    relatedTerms: termsFrom(text).slice(0, 8),
    relatedTools: tools.filter((tool) => text.includes(tool.title)).map((tool) => tool.id).slice(0, 8),
    relatedFields: [],
    downloads: Array.from(html.matchAll(/href=["']([^"']+\.(pdf|docx|zip))["']/gi)).map((match) => match[1]).slice(0, 20),
    status,
    isSearchable: !["hidden", "draft"].includes(status),
    isPublicLanding: ["landing", "wirkungsfeld", "akademie", "kompass", "suche", "download-bibliothek"].includes(pageType),
    canonicalPurpose: purposeFor(pageType),
    description,
    sourceFile: rel,
  };
  if (!PAGE_TYPES.has(pageType)) findings.push({ route, issue: `Unbekannter pageType: ${pageType}` });
  counts.set(pageType, (counts.get(pageType) || 0) + 1);
  entries.push(entry);
}

function purposeFor(pageType) {
  return {
    landing: "orientierung",
    verstehen: "erklaerung",
    wirkungsfeld: "wirkungsfeld-landing",
    begriff: "begriffserklaerung",
    detailkonzept: "fachkonzept",
    dossier: "langfassung-und-dokumentation",
    tool: "interaktion-oder-demo",
    methode: "methodik",
    akademie: "lernen",
    kompass: "routing",
    suche: "navigation",
    "download-bibliothek": "material-finden",
    journal: "journal",
    person: "person",
    legal: "rechtliches",
  }[pageType] || "seite";
}

const registry = {
  generatedAt: new Date().toISOString(),
  pageTypes: Array.from(PAGE_TYPES).sort(),
  statusValues: ["published", "method", "interactive", "archive", "hidden", "draft"],
  entries,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.mkdirSync(path.dirname(PUBLIC_OUT), { recursive: true });
fs.mkdirSync(path.dirname(AUDIT_OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(registry, null, 2)}\n`);
fs.writeFileSync(PUBLIC_OUT, `${JSON.stringify(registry, null, 2)}\n`);

const lines = [
  "# Page-Type-Audit",
  "",
  `Stand: ${registry.generatedAt}`,
  "",
  "## Zusammenfassung",
  "",
  `- Öffentliche HTML-Seiten in Registry: ${entries.length}`,
  `- Seiten ohne gültigen pageType: ${findings.length}`,
  "",
  "## PageTypes",
  "",
  ...Array.from(counts.entries()).sort().map(([type, count]) => `- ${type}: ${count}`),
  "",
  "## Befunde",
  "",
  findings.length
    ? findings.map((finding) => `- ${finding.route}: ${finding.issue}`).join("\n")
    : "Keine pageType-P0-Befunde.",
  "",
];
fs.writeFileSync(AUDIT_OUT, `${lines.join("\n")}\n`);
console.log(`Content registry: ${entries.length} pages -> assets/data/content-registry.json`);
console.log(`Page type audit: ${findings.length} findings -> docs/page-type-audit.md`);
if (findings.length) process.exitCode = 1;
