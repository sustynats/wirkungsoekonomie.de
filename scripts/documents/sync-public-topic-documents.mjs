import fs from "node:fs";
import path from "node:path";

const registryPath = "assets/data/document-registry.json";
const glossaryPath = "public/data/glossary.terms.json";
const reportPath = "docs/document-topic-sync-audit.md";

const fieldLabels = new Map([
  ["arbeit-einkommen", "Arbeit & Einkommen"],
  ["bildung", "Bildung"],
  ["finanzsystem-kapital", "Finanzsystem & Kapital"],
  ["gesundheit-pflege", "Gesundheit & Pflege"],
  ["produkte-konsum", "Produkte & Konsum"],
  ["staat-recht-demokratie", "Staat, Recht & Demokratie"],
  ["wirtschaft-unternehmen", "Wirtschaft & Unternehmen"],
  ["wohnen-stadt", "Wohnen & Stadt"],
]);

const portalLabels = new Map([
  ["digitalisierung-ki-wirkungsdatenraeume", "Digitalisierung, KI & Wirkungsdatenräume"],
  ["internationale-ordnung-globalisierung-geopolitik", "Internationale Ordnung & Geopolitik"],
  ["kritik-missverstaendnisse-schutzarchitektur", "Kritik, Missverständnisse & Schutzarchitektur"],
  ["migration-vielfalt", "Migration & Vielfalt"],
  ["sicherheit-resilienz", "Sicherheit & Resilienz"],
  ["transformation-uebergaenge-implementierung", "Transformation & Umsetzung"],
  ["wissen-wissenschaft-forschung-wirkungsinnovation", "Wissen, Wissenschaft & Innovation"],
  ["zukunftsbilder-wirkungswohlstand", "Zukunftsbilder & Wirkungswohlstand"],
]);

const fieldTools = new Map([
  ["arbeit-einkommen", ["/erleben/automatisierungs-wirkungseinkommensrechner/"]],
  ["wirtschaft-unternehmen", ["/werkzeuge/impact-controlling/"]],
  ["produkte-konsum", ["/erleben.html#simulator", "/werkzeuge/scorecards/"]],
  ["finanzsystem-kapital", ["/werkzeuge/wirkungsfonds/"]],
  ["staat-recht-demokratie", ["/werkzeuge/wirkungsrat/", "/werkzeuge/wirkungshaushalt/"]],
  ["bildung", ["/erleben/wirkungsschule-check/"]],
  ["gesundheit-pflege", ["/werkzeuge/impact-controlling/"]],
  ["wohnen-stadt", ["/werkzeuge/impact-controlling/"]],
]);

const inferredTerms = [
  [/wirkungseinkommen/i, ["wirkungseinkommen", "wirkungsfonds", "wirkungsrueckkopplung"]],
  [/wirkungsfonds|dividende/i, ["wirkungsfonds", "wirkungsrueckkopplung", "wirkungseinkommen"]],
  [/maschinen|automatisierung|roboter/i, ["maschinenwertschoepfungsbeitrag", "wirkungseinkommen", "wirkungsrueckkopplung"]],
  [/sozialabgaben|entkopp/i, ["wirkungseinkommen", "wirkungsfonds", "wirkungsrueckkopplung"]],
  [/impact|controlling|kii/i, ["scorecard", "nwi", "t-sroi", "woek-id"]],
  [/scorecard/i, ["scorecard", "woek-id", "nwi"]],
  [/reverse[-_ ]?merit/i, ["reverse-merit-order", "positive-netto-wirkung"]],
  [/t[-_ ]?sroi/i, ["t-sroi", "wirkungsbewertung"]],
  [/\bnwi\b|netto[-_ ]?wirkungs[-_ ]?index/i, ["nwi", "positive-netto-wirkung"]],
  [/marketing|fuenftes|fünftes|planet/i, ["positive-netto-wirkung", "wirkungsbewertung", "scorecard", "sdgs"]],
  [/lieferkette|wertschoepfungskette|wertschöpfungskette/i, ["wirkungsbewertung", "woek-id", "scorecard"]],
  [/produkt|konsum|umsatzsteuer|apfel/i, ["wirkungsumsatzsteuer", "scorecard", "reverse-merit-order"]],
  [/steuer|gesetz|recht/i, ["wirkungssteuer", "wirkungsrat", "wirkungshaushalt"]],
  [/daten|produktpass|datenraum/i, ["wirkungsdatenraum", "woek-id"]],
  [/bildung|schule|kompetenz/i, ["wirkungskompetenz", "wirkungspotenzial"]],
  [/wohnen|miete|quartier|stadt/i, ["wohnwirkung", "wirkungshaushalt"]],
];

function exists(file) {
  return fs.existsSync(file);
}

function escMd(value) {
  return String(value ?? "").replaceAll("|", "\\|");
}

function normalizeSlug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tokens(value) {
  return normalizeSlug(value)
    .split("-")
    .filter((token) => token.length > 2)
    .filter((token) => !["woek", "wirkungsfelder", "wirtschaft", "unternehmen", "detailkonzept", "detailkonzepte", "dossier", "dossiers", "einzeldossier", "assets", "downloads", "index", "html", "pdf", "und"].includes(token));
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function routeFromFile(file) {
  return `/${file.replace(/\/index\.html$/, "/")}`;
}

function routeDir(route) {
  return route.replace(/\/$/, "");
}

function resolveHref(file, href) {
  if (!href || /^https?:\/\//.test(href)) return href || "";
  if (href.startsWith("/")) return href;
  const dir = path.posix.dirname(routeFromFile(file));
  return path.posix.normalize(path.posix.join(dir, href)).replace(/^([^/])/, "/$1");
}

function walk(dir, out = []) {
  if (!exists(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === "index.html") out.push(full);
  }
  return out;
}

function walkPdfFiles(dir, out = []) {
  if (!exists(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPdfFiles(full, out);
      continue;
    }
    if (entry.name.toLowerCase().endsWith(".pdf")) {
      out.push(`/${full.replace(/\\/g, "/")}`);
    }
  }
  return out;
}

function isTopicDocumentPage(file) {
  if (/\/(detailkonzepte|dossiers)\/[^/]+\/index\.html$/.test(file)) return true;
  if (/^wirkungsfelder\/arbeit-einkommen\/[^/]+\/(?:dossier\/)?index\.html$/.test(file)) return true;
  if (/^portale\/[^/]+\/(?:konzeptpapier|konzept|gesamtdossier|dossier)\/index\.html$/.test(file)) return true;
  if (
    /^portale\/[^/]+\/[^/]+\/index\.html$/.test(file) &&
    !/\/(?:downloads|quellen|quellen-glossar|toolkarten|sdg-sdgplus|buchanker|buchanker-querverlinkungen)\//.test(file) &&
    !/\/(?:toolkarten|wirkungsindikatoren)(?:-|\/)/.test(file)
  ) return true;
  if (/^verstehen\/sdgs-sdgplus\/(?:detailkonzepte|dossiers)\/[^/]+\/index\.html$/.test(file)) return true;
  return false;
}

function pageType(file, pdfHref) {
  const haystack = `${file} ${pdfHref}`;
  if (/\/dossiers\/|\/dossier\//.test(file)) return "Dossier";
  if (/\/gesamtdossier\//.test(file)) return "Dossier";
  if (/\/konzeptpapier\/|\/konzept\//.test(file)) return "Konzeptpapier";
  if (/einzeldossier|gesamtdossier|dossier/i.test(haystack) && !/detailkonzept/i.test(path.basename(pdfHref || ""))) {
    return "Dossier";
  }
  return "Detailkonzept";
}

function pageTitle(html, type) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = stripHtml(h1?.[1] || "").replace(/\s+\|\s+Wirkungsökonomie$/, "");
  if (!title) return type;
  return title
    .replace(/^Detailkonzept:\s*/i, "")
    .replace(/^Detailkonzept\s+/i, "")
    .replace(/^Dossier:\s*/i, "")
    .replace(/^(Kurz-)?Dossier\s+/i, "")
    .replace(/^Zum Detailkonzept\s*/i, "")
    .replace(/:\s*(Detailkonzept|Dossier)\s*$/i, "")
    .trim();
}

function pageSummary(html, title, type) {
  const lead = html.match(/<p[^>]*class=["'][^"']*(?:lead|hero-subtitle|card-text)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  const plain = stripHtml(lead?.[1] || "");
  if (plain && plain.length >= 60 && !/Du liest die Onlinefassung/i.test(plain)) return plain.slice(0, 420);
  if (type === "Dossier") {
    return `Dieses Dossier ergänzt ${title} um Praxisfrage, Annahmen, Bewertungsweg, Grenzen und weiterführende Materialien.`;
  }
  return `Dieses Detailkonzept erklärt die fachliche Logik zu ${title}, ordnet alte Logik und WÖk-Perspektive ein und verweist auf passende Vertiefungen.`;
}

function pdfLinks(file, html) {
  return [...html.matchAll(/href=["']([^"']+\.pdf(?:[#?][^"']*)?)["']/gi)]
    .map((match) => resolveHref(file, match[1]).replace(/[#?].*$/, ""))
    .filter((href) => href.startsWith("/assets/downloads/") || href.startsWith("/assets/pdf/"))
    .filter((href, index, list) => list.indexOf(href) === index);
}

function publicPdfCandidates() {
  const out = [];
  for (const root of ["assets/downloads", "assets/pdf"]) {
    walkPdfFiles(root, out);
  }
  return out;
}

const allPdfCandidates = publicPdfCandidates();

function pdfTypeMatches(type, href) {
  if (type === "Dossier") return /dossier|einzeldossier|gesamtdossier/i.test(href) && !/detailkonzept/i.test(path.basename(href));
  return /detailkonzept|detail[_-]|konzept|methodenpapier|whitepaper|working-paper/i.test(href) && !/einzeldossier|gesamtdossier/i.test(href);
}

function scorePdf({ file, title, type, links }, pdf) {
  if (!pdfTypeMatches(type, pdf)) return -10;
  const explicitLink = links.includes(pdf);
  const haystack = `${file} ${title}`;
  const sourceTokens = new Set(tokens(haystack));
  const pdfTokens = new Set(tokens(path.basename(pdf, ".pdf")));
  let score = 0;
  for (const token of sourceTokens) {
    if (pdfTokens.has(token)) score += 1;
  }
  if (explicitLink) score += 2;
  const pageSlug = file
    .replace(/^.*\/(detailkonzepte|dossiers)\//, "")
    .replace(/^wirkungsfelder\/arbeit-einkommen\//, "")
    .replace(/\/(?:dossier\/)?index\.html$/, "");
  const pageTokens = tokens(pageSlug);
  const pageOverlap = pageTokens.filter((token) => pdfTokens.has(token)).length;
  if (!explicitLink && /^portale\//.test(file)) {
    const portalSlug = file.split("/")[1] || "";
    const portalOverlap = tokens(portalSlug).filter((token) => pdfTokens.has(token)).length;
    if (!portalOverlap) return -10;
  }
  if (!explicitLink && /\/dossiers\//.test(file) && pageTokens.length >= 2 && pageOverlap < 2) {
    return -10;
  }
  score += pageOverlap * 2;
  if (/v1_0|_v1_0|_v0_2/.test(pdf)) score += 0.4;
  return score;
}

function choosePdf(file, links, title, type) {
  const pool = [...new Set([...links, ...allPdfCandidates])].filter((href) => exists(href.replace(/^\//, "")));
  const scored = pool
    .map((href) => ({ href, score: scorePdf({ file, title, type, links }, href) }))
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score || a.href.localeCompare(b.href));
  return scored[0]?.href || "";
}

function fileSizeLabel(publicPath) {
  const local = publicPath.replace(/^\//, "");
  if (!exists(local)) return "";
  const mb = fs.statSync(local).size / (1024 * 1024);
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

function fieldFromFile(file) {
  const match = file.match(/^wirkungsfelder\/([^/]+)\//);
  if (!match) {
    const portalMatch = file.match(/^portale\/([^/]+)\//);
    if (portalMatch) {
      const slug = portalMatch[1];
      return {
        slug,
        label: portalLabels.get(slug) || slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
        route: `/portale/${slug}/`,
      };
    }
    if (file.startsWith("verstehen/sdgs-sdgplus/")) {
      return { slug: "sdg-referenzrahmen", label: "SDGs & SDG+", route: "/verstehen/sdgs-sdgplus/" };
    }
    return { slug: "werkzeuge", label: "Werkzeuge", route: "/werkzeuge/" };
  }
  const slug = match[1];
  return {
    slug,
    label: fieldLabels.get(slug) || slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
    route: `/wirkungsfelder/${slug}/`,
  };
}

function extractTerms(html, title, file) {
  const terms = new Set();
  for (const match of html.matchAll(/href=["'][^"']*\/begriffe\/([^/"'#?]+)\/?[^"']*["']/gi)) {
    terms.add(match[1]);
  }
  const haystack = `${title} ${file}`;
  for (const [pattern, slugs] of inferredTerms) {
    if (pattern.test(haystack)) slugs.forEach((slug) => terms.add(slug));
  }
  return [...terms].filter(Boolean).slice(0, 8);
}

function keyPoints(type, title) {
  if (type === "Dossier") {
    return [
      `Das Dossier macht ${title} als Anwendung und Bewertungsweg nachvollziehbar.`,
      "Es bündelt Praxisfrage, Annahmen, Grenzen und passende Anschlüsse.",
      "Die PDF-Fassung ist die Downloadfassung; die Seite selbst bleibt online lesbar.",
    ];
  }
  return [
    `Das Detailkonzept ordnet ${title} fachlich und wirkungsökonomisch ein.`,
    "Es erklärt alte Logik, WÖk-Perspektive, Schutzgrenzen und politische Anschlussfähigkeit.",
    "Die PDF-Fassung ist die Downloadfassung; die Seite selbst bleibt online lesbar.",
  ];
}

function makeEntry(file, html) {
  const route = routeFromFile(file);
  const links = pdfLinks(file, html);
  const provisionalType = pageType(file, links[0] || file);
  const title = pageTitle(html, provisionalType);
  const pdf = choosePdf(file, links, title, provisionalType);
  if (!pdf || !exists(pdf.replace(/^\//, ""))) return null;
  const type = pageType(file, pdf);
  const field = fieldFromFile(file);
  const topicSlug = normalizeSlug(routeDir(route));
  return {
    id: `topic-${topicSlug}`,
    slug: `${normalizeSlug(type)}-${topicSlug}`.slice(0, 120),
    title: `${title} - ${type}`,
    type,
    category: [field.label, type, "Wirkungsökonomie"],
    status: "current",
    stand: "2026",
    summary: pageSummary(html, title, type),
    audience: ["Praxis", "Politik", "Wissenschaft", "Akademie"],
    keyPoints: keyPoints(type, title),
    onlineUrl: route,
    sourceOnlineUrl: null,
    pdfUrl: pdf,
    docxUrl: null,
    fileSize: fileSizeLabel(pdf),
    relatedTerms: extractTerms(html, title, file),
    relatedFields: field.route.startsWith("/wirkungsfelder/") ? [field.route] : [],
    relatedTools: fieldTools.get(field.slug) || [],
    relatedPages: [route],
    isArchive: false,
    isPublic: true,
    sourceFormat: "internal",
    publicFormats: ["online", "pdf"],
    allowPublicDocx: false,
    generatedFromPublicPage: true,
  };
}

function sortRegistry(registry) {
  return registry.sort((a, b) => {
    const generatedDelta = Number(Boolean(a.generatedFromPublicPage)) - Number(Boolean(b.generatedFromPublicPage));
    if (generatedDelta) return generatedDelta;
    return String(a.title || a.id).localeCompare(String(b.title || b.id), "de");
  });
}

const registry = exists(registryPath) ? JSON.parse(fs.readFileSync(registryPath, "utf8")) : [];
const glossary = exists(glossaryPath) ? JSON.parse(fs.readFileSync(glossaryPath, "utf8")) : { terms: [] };
const knownTermSlugs = new Set((glossary.terms || []).map((term) => term.slug));
const byId = new Map(registry.map((item) => [item.id, item]));
const byOnlineUrl = new Map(registry.filter((item) => item.onlineUrl).map((item) => [item.onlineUrl, item]));
const byPdfUrl = new Map(registry.filter((item) => item.pdfUrl).map((item) => [item.pdfUrl, item]));
const scanned = walk("wirkungsfelder")
  .concat(walk("werkzeuge"))
  .concat(walk("portale"))
  .concat(walk("verstehen/sdgs-sdgplus"))
  .filter(isTopicDocumentPage);
const added = [];
const updated = [];
const skipped = [];
const currentGeneratedIds = new Set();

for (const file of scanned) {
  const html = fs.readFileSync(file, "utf8");
  const entry = makeEntry(file, html);
  if (!entry) {
    skipped.push({ file, reason: "keine passende öffentliche PDF" });
    continue;
  }
  currentGeneratedIds.add(entry.id);
  entry.relatedTerms = entry.relatedTerms.filter((slug) => knownTermSlugs.has(slug));
  const existing = byId.get(entry.id) || byOnlineUrl.get(entry.onlineUrl) || byPdfUrl.get(entry.pdfUrl);
  if (existing && !existing.generatedFromPublicPage) {
    skipped.push({ file, reason: `bereits manuell in Registry: ${existing.id}` });
    continue;
  }
  if (existing) {
    Object.assign(existing, entry);
    updated.push(entry);
    continue;
  }
  registry.push(entry);
  byId.set(entry.id, entry);
  byOnlineUrl.set(entry.onlineUrl, entry);
  byPdfUrl.set(entry.pdfUrl, entry);
  added.push(entry);
}

const staleGenerated = registry.filter((item) => item.generatedFromPublicPage && !currentGeneratedIds.has(item.id));
for (const stale of staleGenerated) {
  const index = registry.indexOf(stale);
  if (index >= 0) registry.splice(index, 1);
}

fs.writeFileSync(registryPath, `${JSON.stringify(sortRegistry(registry), null, 2)}\n`, "utf8");

const byType = [...registry].reduce((acc, item) => {
  const key = item.type || "Dokument";
  acc.set(key, (acc.get(key) || 0) + 1);
  return acc;
}, new Map());

const report = [
  "# Document Topic Sync Audit",
  "",
  `Stand: ${new Date().toISOString().slice(0, 10)}`,
  "",
  "## Zweck",
  "",
  "Dieser Sync hebt vorhandene öffentliche Detailkonzept- und Dossierseiten mit passenden PDF-Downloadfassungen in die zentrale Dokumenten-Registry. Dadurch können Bibliothek, Suche und Begriffseiten dieselben Dokumente anzeigen.",
  "",
  "## Ergebnis",
  "",
  `- Gesannte öffentliche Themen-/Subseiten: ${scanned.length}`,
  `- Neue Registry-Einträge: ${added.length}`,
  `- Aktualisierte generierte Registry-Einträge: ${updated.length}`,
  `- Entfernte veraltete generierte Registry-Einträge: ${staleGenerated.length}`,
  `- Übersprungene Seiten: ${skipped.length}`,
  `- Registry-Einträge gesamt: ${registry.length}`,
  "",
  "## Dokumenttypen in der Registry",
  "",
  "| Typ | Anzahl |",
  "| --- | ---: |",
  ...[...byType.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([type, count]) => `| ${escMd(type)} | ${count} |`),
  "",
  "## Neue / aktualisierte Themendokumente",
  "",
  "| Aktion | Titel | Typ | Onlinefassung | PDF | Begriffe |",
  "| --- | --- | --- | --- | --- | --- |",
  ...added.map((item) => `| neu | ${escMd(item.title)} | ${escMd(item.type)} | ${item.onlineUrl} | ${item.pdfUrl} | ${item.relatedTerms.join(", ") || "-"} |`),
  ...updated.map((item) => `| aktualisiert | ${escMd(item.title)} | ${escMd(item.type)} | ${item.onlineUrl} | ${item.pdfUrl} | ${item.relatedTerms.join(", ") || "-"} |`),
  "",
  "## Übersprungen",
  "",
  skipped.length ? skipped.map((item) => `- \`${item.file}\`: ${item.reason}`).join("\n") : "- Keine",
  "",
].join("\n");

fs.writeFileSync(reportPath, report, "utf8");
console.log(`Synced topic documents: ${added.length} added, ${updated.length} updated, ${skipped.length} skipped.`);
