import fs from "node:fs";
import path from "node:path";

const glossaryPath = "public/data/glossary.terms.json";
const overridePath = "assets/data/glossary-reference-overrides.json";
const outPath = "public/data/glossary-reference-index.json";
const reportPath = "reports/glossary-reference-report.md";
const maxStoredReferences = 16;
const maxDisplayedReferences = 8;

const contentRoots = [
  "blog",
  "referenz",
  "bibliothek",
  "dokumente",
  "werkzeuge",
  "wirkungsfelder",
  "werkstatt",
  "verstehen",
  "sdg-plus",
  "erleben",
  "anwendungen",
  "fuer",
  "portale",
  "akademie.html",
  "wirkungsoekonomie.html",
  "modell.html",
  "kompass.html",
  "downloads.html",
  "index.html",
];

const contentTypeWeights = {
  "book-chapter": 80,
  book: 70,
  method: 60,
  whitepaper: 55,
  "working-paper": 45,
  field: 35,
  academy: 30,
  blog: 25,
  journal: 25,
  page: 20,
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanHtml(html) {
  return decodeHtml(String(html || "")
    .replace(/<([a-z][\w:-]*)\b[^>]*data-search-exclude[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<([a-z][\w:-]*)\b[^>]*class=["'][^"']*(?:breadcrumb|site-nav|footer-nav|toc-card|side-nav|term-link-section|glossary-filter|search-live-suggestions|publication-matrix-wrap)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase("de")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+#\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugToken(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function asArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function walk(target, files = []) {
  if (!fs.existsSync(target)) return files;
  const stat = fs.statSync(target);
  if (stat.isFile() && /\.html$/i.test(target)) {
    files.push(target);
    return files;
  }
  if (!stat.isDirectory()) return files;
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.html$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function routeFor(file) {
  const rel = file.replace(/\\/g, "/");
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"/index.html".length)}/`;
  return `/${rel}`;
}

function canonicalRoute(url) {
  return String(url || "")
    .replace(/^https?:\/\/(?:www\.)?wirkungsoekonomie\.de/i, "")
    .replace(/#.*$/, "")
    .replace(/\/index\.html$/, "/")
    || "/";
}

function routeExists(url, pagesByRoute) {
  const route = canonicalRoute(url);
  return pagesByRoute.has(route) || fs.existsSync(route.replace(/^\//, "")) || fs.existsSync(`${route.replace(/^\//, "").replace(/\/$/, "")}/index.html`);
}

function firstMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? cleanHtml(match[1]) : "";
}

function headingsFrom(html) {
  return Array.from(html.matchAll(/<h([1-3])[^>]*(?:id=["']([^"']+)["'])?[^>]*>([\s\S]*?)<\/h\1>/gi))
    .map((match) => ({ level: Number(match[1]), anchor: match[2] || "", text: cleanHtml(match[3]) }))
    .filter((heading) => heading.text);
}

function contentTypeFor(file, title) {
  const normalizedFile = file.replace(/\\/g, "/");
  if (/^referenz\/kapitel-/i.test(normalizedFile)) return "book-chapter";
  if (/^referenz\//i.test(normalizedFile)) return "book";
  if (/^blog\//i.test(normalizedFile)) return "blog";
  if (/whitepaper|working-paper|dossier/i.test(normalizedFile)) return "whitepaper";
  if (/^werkzeuge\//i.test(normalizedFile)) return "method";
  if (/^wirkungsfelder\//i.test(normalizedFile) || /Wirkungsfeld/i.test(title)) return "field";
  if (/^akademie/i.test(normalizedFile)) return "academy";
  if (/^dokumente\//i.test(normalizedFile)) return "working-paper";
  return "page";
}

function recencyWeight(date) {
  if (!date) return 0;
  const year = Number(String(date).slice(0, 4));
  if (!year) return 0;
  return Math.max(0, Math.min(15, (year - 2024) * 5));
}

function regexFor(term) {
  const escaped = normalize(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "g");
}

function countMatches(text, token) {
  if (!token || token.length < 4) return 0;
  return Array.from(text.matchAll(regexFor(token))).length;
}

function containsTerm(text, token) {
  return countMatches(text, token) > 0;
}

function makeAliases(term) {
  const labels = unique([
    term.canonicalLabel,
    term.label,
    term.slug?.replace(/-/g, " "),
    ...asArray(term.aliases),
    ...asArray(term.synonyms),
  ]);
  const safe = [];
  for (const label of labels) {
    const normalized = normalize(label);
    if (normalized.length < 4) continue;
    if (/^(und|oder|der|die|das|ein|eine|mit|von|fuer|als|ist|impact)$/.test(normalized)) continue;
    safe.push(label);
    if (normalized === "wirkung") safe.push("Wirkungen", "tatsächliche Zustandsveränderung");
    if (normalized === "salienz") safe.push("salient", "salienter", "Salienzsteuerung");
  }
  return unique(safe).slice(0, 14);
}

function snippetFor(page, aliases) {
  const text = page.bodyText;
  const lower = text.toLocaleLowerCase("de");
  let index = -1;
  let matched = "";
  for (const alias of aliases.sort((a, b) => b.length - a.length)) {
    const next = lower.indexOf(String(alias).toLocaleLowerCase("de"));
    if (next >= 0 && (index < 0 || next < index)) {
      index = next;
      matched = alias;
    }
  }
  const sanitizeSnippet = (value) => String(value || "")
    .replace(/\bv0\.(\d+)\b/gi, "Modellfassung")
    .replace(/\s+/g, " ")
    .trim();
  if (index < 0) return sanitizeSnippet(text.slice(0, 210));
  const start = Math.max(0, index - 90);
  const end = Math.min(text.length, index + matched.length + 160);
  return sanitizeSnippet(`${start > 0 ? "..." : ""}${text.slice(start, end)}${end < text.length ? "..." : ""}`);
}

function loadPages() {
  const files = unique(contentRoots.flatMap((root) => walk(root))).filter((file) => !file.includes("/reports/"));
  const pages = [];
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    if (/<meta\s+name=["']robots["']\s+content=["'][^"']*(?:noindex|nofollow)/i.test(html)) continue;
    const route = routeFor(file);
    if (route.startsWith("/begriffe/") || route.startsWith("/reports/")) continue;
    const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s*[|-]\s*Wirkungsökonomie\s*$/i, "")
      || firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
      || path.basename(file).replace(/\.html$/i, "");
    const description = firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i)
      || firstMatch(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["'][^>]*>/i);
    const headings = headingsFrom(html);
    const h1 = headings.find((heading) => heading.level === 1)?.text || title;
    const lead = firstMatch(html, /<p[^>]*class=["'][^"']*\blead\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
    const bodyText = cleanHtml(html);
    if (bodyText.length < 120) continue;
    const date = file.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || firstMatch(html, /<time[^>]*datetime=["']([^"']+)["'][^>]*>/i);
    pages.push({
      file,
      url: route,
      canonicalUrl: canonicalRoute(firstMatch(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i) || route),
      title,
      description,
      contentType: contentTypeFor(file, title),
      date,
      headings,
      h1,
      lead,
      bodyText,
      normalized: {
        title: normalize(title),
        h1: normalize(h1),
        h2: normalize(headings.filter((h) => h.level === 2).map((h) => h.text).join(" ")),
        h3: normalize(headings.filter((h) => h.level === 3).map((h) => h.text).join(" ")),
        lead: normalize(`${description} ${lead} ${bodyText.slice(0, 900)}`),
        body: normalize(bodyText),
      },
    });
  }
  return pages;
}

function scoreMatch(term, aliases, page, overridePriority = 0) {
  const normalizedAliases = aliases.map(normalize).filter(Boolean);
  const candidateAliases = normalizedAliases.filter((alias) => page.normalized.body.includes(alias));
  if (!candidateAliases.length && !overridePriority) return null;
  let titleMatch = 0;
  let h1Match = 0;
  let h2Match = 0;
  let h3Match = 0;
  let leadMatch = 0;
  let bodyMatchCount = 0;
  const matchedAliases = [];
  for (const alias of candidateAliases) {
    const bodyCount = countMatches(page.normalized.body, alias);
    if (!bodyCount) continue;
    bodyMatchCount += bodyCount;
    matchedAliases.push(alias);
    if (containsTerm(page.normalized.title, alias)) titleMatch = 1;
    if (containsTerm(page.normalized.h1, alias)) h1Match = 1;
    if (containsTerm(page.normalized.h2, alias)) h2Match = 1;
    if (containsTerm(page.normalized.h3, alias)) h3Match = 1;
    if (containsTerm(page.normalized.lead, alias)) leadMatch = 1;
  }
  if (!bodyMatchCount && !overridePriority) return null;
  const preferredLabel = normalize(term.canonicalLabel || term.label);
  const definitionPattern = matchedAliases.some((alias) => {
    const x = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(${x}\\s+(ist|bezeichnet|bedeutet)|begriff\\s+${x}|unter\\s+${x}\\s+versteht|in\\s+der\\s+wirkungsoekonomie\\s+bedeutet\\s+${x})`, "i").test(page.normalized.body);
  }) ? 1 : 0;
  const relatedTokens = asArray(term.relatedTerms).slice(0, 12).map((item) => slugToken(item).replace(/-/g, " "));
  const relatedTermProximity = relatedTokens.filter((item) => item.length > 4 && page.normalized.body.includes(item)).length;
  const contentTypeWeight = contentTypeWeights[page.contentType] || 20;
  const cappedFrequencyScore = Math.min(bodyMatchCount, 8) * 8;
  const weakListOnlyPenalty = bodyMatchCount <= 1 && /(<li>|<\/li>)/i.test(page.bodyText.slice(0, 1200)) ? 15 : 0;
  const glossarySelfReferencePenalty = page.url === `/begriffe/${term.slug}/` ? 500 : 0;
  const score =
    titleMatch * 120
    + h1Match * 100
    + h2Match * 70
    + h3Match * 50
    + leadMatch * 60
    + definitionPattern * 120
    + Math.min(relatedTermProximity, 4) * 30
    + cappedFrequencyScore
    + contentTypeWeight
    + recencyWeight(page.date)
    + overridePriority
    - weakListOnlyPenalty
    - glossarySelfReferencePenalty;
  const reasons = [];
  if (overridePriority) reasons.push(`manual override +${overridePriority}`);
  if (titleMatch) reasons.push("title match");
  if (h1Match) reasons.push("h1 match");
  if (h2Match) reasons.push("h2 match");
  if (h3Match) reasons.push("h3 match");
  if (leadMatch) reasons.push("lead match");
  if (definitionPattern) reasons.push("definition pattern");
  if (relatedTermProximity) reasons.push(`related proximity ${relatedTermProximity}`);
  if (bodyMatchCount) reasons.push(`${bodyMatchCount} occurrence${bodyMatchCount === 1 ? "" : "s"}`);
  reasons.push(`${page.contentType} +${contentTypeWeight}`);
  let matchType = "weak";
  if (score >= 220 || definitionPattern || titleMatch || h1Match || overridePriority >= 700) matchType = "defined";
  else if (score >= 120 || h2Match || h3Match || overridePriority) matchType = "strong";
  else if (score >= 60 || bodyMatchCount > 1) matchType = "medium";
  return {
    termSlug: term.slug,
    pageUrl: page.url,
    canonicalUrl: page.canonicalUrl,
    pageTitle: page.title,
    contentType: page.contentType,
    date: page.date || "",
    anchor: page.headings.find((heading) => matchedAliases.some((alias) => containsTerm(normalize(heading.text), alias)))?.anchor || "",
    score,
    matchCount: bodyMatchCount,
    matchType,
    reasons,
    snippets: [snippetFor(page, aliases)],
  };
}

function dedupeReferences(refs) {
  const byRoute = new Map();
  for (const ref of refs) {
    const key = canonicalRoute(ref.canonicalUrl || ref.pageUrl);
    const existing = byRoute.get(key);
    if (!existing || ref.score > existing.score) byRoute.set(key, ref);
  }
  return Array.from(byRoute.values()).sort((a, b) => b.score - a.score || a.pageTitle.localeCompare(b.pageTitle, "de"));
}

const glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf8")).terms || [];
const overrides = fs.existsSync(overridePath) ? JSON.parse(fs.readFileSync(overridePath, "utf8")) : {};
const pages = loadPages();
const pagesByRoute = new Map(pages.map((page) => [canonicalRoute(page.url), page]));
const terms = {};
const warnings = [];

for (const term of glossary) {
  const aliases = makeAliases(term);
  const override = overrides[term.slug] || {};
  const excluded = new Set(asArray(override.excluded).map(canonicalRoute));
  const overrideByRoute = new Map(asArray(override.preferred).map((item) => [canonicalRoute(item.url), item]));
  for (const item of asArray(override.preferred)) {
    if (!routeExists(item.url, pagesByRoute)) warnings.push(`preferred URL not found for ${term.slug}: ${item.url}`);
  }
  const refs = [];
  for (const page of pages) {
    const route = canonicalRoute(page.url);
    if (excluded.has(route)) continue;
    const overrideItem = overrideByRoute.get(route);
    const ref = scoreMatch(term, aliases, page, Number(overrideItem?.priority || 0));
    if (!ref) continue;
    if (overrideItem?.label) ref.overrideLabel = overrideItem.label;
    if (ref.score >= 45 || overrideItem) refs.push(ref);
  }
  const ranked = dedupeReferences(refs).slice(0, maxStoredReferences);
  const determining = ranked.filter((ref) => ["defined", "strong"].includes(ref.matchType)).slice(0, 3);
  const related = ranked.filter((ref) => !determining.some((item) => item.pageUrl === ref.pageUrl)).slice(0, Math.max(0, maxDisplayedReferences - determining.length));
  if (!ranked.length) warnings.push(`term has no content references: ${term.slug}`);
  terms[term.slug] = {
    label: term.canonicalLabel || term.label,
    aliases,
    totalReferences: refs.length,
    storedReferences: ranked.length,
    determining,
    related,
    references: ranked,
  };
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), source: "build-glossary-reference-index", pages: pages.length, terms }, null, 2)}\n`);

const reportTerms = ["salienz", "wirkung", "wirkungspotenzial", "wirkungssteuer", "demokratie"].filter((slug) => terms[slug]);
const report = [
  "# Glossar-Referenzindex Report",
  "",
  `- Generated: ${new Date().toISOString()}`,
  `- Content pages scanned: ${pages.length}`,
  `- Glossary terms indexed: ${glossary.length}`,
  `- Warnings: ${warnings.length}`,
  "",
  "## Stichproben",
  "",
  ...reportTerms.flatMap((slug) => [
    `### ${terms[slug].label} (${slug})`,
    "",
    ...terms[slug].references.slice(0, 8).map((ref) => `- ${Math.round(ref.score)} · ${ref.matchType} · ${ref.pageTitle} · ${ref.pageUrl} · ${ref.reasons.join(", ")}`),
    "",
  ]),
  "## Warnungen",
  "",
  ...(warnings.slice(0, 300).map((warning) => `- ${warning}`)),
  warnings.length > 300 ? `- ... ${warnings.length - 300} weitere Warnungen` : "",
  "",
].join("\n");
fs.writeFileSync(reportPath, report);

const salienzRefs = terms.salienz?.references || [];
const salienzTarget = "/blog/linkedin/2026-02-11-warum-der-ruckhalt-fur-klimaschutz-sinkt-und-was-das-uber-unsere-demokratie-verrat.html";
if (!salienzRefs.some((ref) => canonicalRoute(ref.pageUrl) === canonicalRoute(salienzTarget))) {
  throw new Error(`[glossary-links] salienz target missing: ${salienzTarget}`);
}

console.log(`[glossary-links] indexed ${glossary.length} terms over ${pages.length} pages.`);
console.log(`[glossary-links] salienz: ${terms.salienz?.totalReferences || 0} references found, showing ${terms.salienz?.references.length || 0}.`);
console.log(`[glossary-links] wirkung: ${terms.wirkung?.totalReferences || 0} references found, showing ${terms.wirkung?.references.length || 0}.`);
for (const warning of warnings.slice(0, 20)) console.warn(`[glossary-links] WARN: ${warning}`);
