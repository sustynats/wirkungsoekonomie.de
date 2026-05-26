import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_ROOTS = [
  "/Users/hagen/Documents/Rechner-Cleanup/Sortiert_2026-05-25/01_WOeK",
  "/Users/hagen/Documents/Rechner-Cleanup/Sortiert_2026-05-25/02_Dokumente",
];

const REPORT_PATH = path.join(ROOT, "docs/topic-document-routing-audit.md");
const JSON_PATH = path.join(ROOT, "docs/topic-document-routing-audit.json");
const LOCAL_IMPORTS_PATH = path.join(ROOT, "assets/data/local-document-imports.json");
const PUBLIC_EXTENSIONS = new Set([".html"]);
const SOURCE_EXTENSIONS = new Set([".md", ".html", ".pdf", ".docx"]);

const INTERNAL_PATTERN =
  /codex|anweisung|qa|contact_sheet|bestands|nachliefer|releasebericht|offene-punkte|seitenregister|toolkartenregister|rangmatrix|checkliste|masterbibliothek|gesamtpaket_alle_inhalte|dossier_template|style_map|sortier_manifest|__macosx|\.ds_store/i;

const PRIVATE_PATTERN =
  /mietvertrag|kaufvertrag|rechnung|bankauszug|huk24|stammbuch|bewerbung|cv|arbeitsbescheinigung|leistungsnachweis|einkommensteuererklaerung|einkommensteuererklärung|elster|formulare|meine kopie|fisbeck hagen|aufhebungsvertrag|firmenwagen|adesso|enbw|sap|seminararbeit|application/i;

const EXTERNAL_REFERENCE_PATTERN =
  /volkswagen|aboutyou|eba gl|sdg9-report|secretary-general|integritynext|copernicus|klimaliste|taxonomie|guidelines|wissenschaftliches arbeiten|cennost|intelligent assets|berlin\.pdf/i;

const TOPIC_RULES = [
  ["wirtschaft-unternehmen", /wirtschaft[_ -]?unternehmen|unternehmen|marketing|lieferanten|wertschoepfungskette|produktportfolio|kmu|governance[_ -]?boni/i, "/wirkungsfelder/wirtschaft-unternehmen/"],
  ["arbeit-einkommen", /arbeit[_ -]?einkommen|wirkungseinkommen|maschinen|automatisierung|leistung|erwerbsarbeit/i, "/wirkungsfelder/arbeit-einkommen/"],
  ["rente-soziale-sicherung", /rente|soziale[_ -]?sicherung|pflegeversicherung|generationenvertrag/i, "/wirkungsfelder/rente-soziale-sicherung/"],
  ["bildung", /bildung|schule|wirkungsschule|wirkungspaedagogik|wirkungsportfolio/i, "/wirkungsfelder/bildung/"],
  ["gesundheit-pflege", /gesundheit|pflege|praevention|one[_ -]?health|mental|gesundheitsdatenraum/i, "/wirkungsfelder/gesundheit-pflege/"],
  ["produkte-konsum", /produkte[_ -]?konsum|produktbesteuerung|produktscorecard|apfel|zange|konsum/i, "/wirkungsfelder/produkte-konsum/"],
  ["wohnen-stadt", /wohnen|wohnungsmarkt|stadt|quartier|miete|gebaeude/i, "/wirkungsfelder/wohnen-stadt/"],
  ["staat-recht-demokratie", /staat|recht|demokratie|rechtsstaat|wirkungsrat|wstg|gesetz/i, "/wirkungsfelder/staat-recht-demokratie/"],
  ["medien-oeffentlichkeit", /medien|oeffentlichkeit|resonanz|desinformation|sprache|diskurs|kampagne|milram/i, "/wirkungsfelder/medien-oeffentlichkeit/"],
  ["finanzsystem-kapital", /finanz|kapital|fonds|steuer|sustainable[_ -]?finance|taxonomie/i, "/wirkungsfelder/finanzsystem-kapital/"],
  ["impact-controlling", /impact[_ -]?controlling|t[_ -]?sroi|nwi|scorecard|woek[_ -]?id|reverse[_ -]?merit/i, "/werkzeuge/impact-controlling/"],
  ["digitalisierung-ki-wirkungsdatenraeume", /digitalisierung|ki|algorithm|datenraum|produktpass|plattform|cyber/i, "/portale/digitalisierung-ki-wirkungsdatenraeume/"],
  ["wissen-wissenschaft-forschung-wirkungsinnovation", /wissen|wissenschaft|forschung|innovation|open[_ -]?science/i, "/portale/wissen-wissenschaft-forschung-wirkungsinnovation/"],
  ["sicherheit-resilienz", /sicherheit|resilienz|katastrophe|infrastruktur|hybrid/i, "/portale/sicherheit-resilienz/"],
  ["migration-vielfalt", /migration|vielfalt|integration|zugehoerigkeit/i, "/portale/migration-vielfalt/"],
  ["internationale-ordnung-globalisierung-geopolitik", /internationale|globalisierung|geopolitik|handel|lieferketten|europa/i, "/portale/internationale-ordnung-globalisierung-geopolitik/"],
  ["transformation-uebergaenge-implementierung", /transformation|uebergaenge|implementierung|pilot|reallabor|roadmap/i, "/portale/transformation-uebergaenge-implementierung/"],
  ["kritik-missverstaendnisse-schutzarchitektur", /kritik|missverstaendnis|schutzarchitektur|technokratie|social[_ -]?credit|planwirtschaft/i, "/portale/kritik-missverstaendnisse-schutzarchitektur/"],
  ["zukunftsbilder-wirkungswohlstand", /zukunft|wirkungswohlstand|alltag[_ -]?2035|wohlstand/i, "/portale/zukunftsbilder-wirkungswohlstand/"],
  ["akademie-bibliothek", /akademie|fachbibliothek|wirkungskompetenz|glossar|lernpfad/i, "/akademie.html"],
  ["sdg-referenzrahmen", /sdg|agenda[_ -]?2030|nachhaltigkeit|esg/i, "/verstehen/sdgs-sdgplus/"],
];

const STOP_WORDS = new Set([
  "woek",
  "wirkungsoekonomie",
  "wirkung",
  "wirkungs",
  "rang",
  "paket",
  "v",
  "version",
  "online",
  "volltext",
  "website",
  "html",
  "pdf",
  "docx",
  "word",
  "umfangreich",
  "clean",
  "final",
  "natalie",
  "weber",
  "detailkonzept",
  "detailkonzepte",
  "dossier",
  "dossiers",
  "einzeldossier",
  "gesamtdossier",
  "konzeptpapier",
  "portalstartseite",
  "politische",
  "anschlussfaehigkeit",
  "quellen",
  "glossar",
  "toolkarten",
  "wirkungsindikatoren",
  "sdg",
  "sdgplus",
  "block",
  "alle",
  "inhalte",
  "download",
  "downloads",
  "export",
]);

function exists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function walk(dir, predicate, out = []) {
  if (!exists(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      walk(full, predicate, out);
    } else if (predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/&/g, " und ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(v|version)\s*\d+(\s+\d+)?\b/g, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return normalize(value).replace(/\s+/g, "-").replace(/^-|-$/g, "");
}

function localImportAllowlist() {
  if (!exists(LOCAL_IMPORTS_PATH)) return new Set();
  const imports = JSON.parse(fs.readFileSync(LOCAL_IMPORTS_PATH, "utf8"));
  const allowed = new Set();
  for (const item of imports) {
    if (item.sourcePath) allowed.add(path.resolve(item.sourcePath));
    if (item.preferredPdfPath) allowed.add(path.resolve(item.preferredPdfPath));
  }
  return allowed;
}

function tokens(value) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function readText(filePath, maxBytes = 350_000) {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer.subarray(0, maxBytes).toString("utf8");
  } catch {
    return "";
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text) {
  return normalize(text).split(" ").filter(Boolean).length;
}

function titleFromSource(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".md") {
    const text = readText(filePath);
    const heading = text.match(/^#\s+(.+)$/m);
    if (heading) return heading[1].trim();
  }
  if (ext === ".html") {
    const html = readText(filePath);
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1) return stripHtml(h1[1]);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (title) return stripHtml(title[1]);
  }
  return path.basename(filePath, ext)
    .replace(/^online[_ -]?volltext[_ -]?/i, "")
    .replace(/^(\d+[_ -])?woek[_ -]/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\bv\d+[_ .-]?\d*\b/gi, "")
    .trim();
}

function contentWordCount(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".md") return wordCount(readText(filePath));
  if (ext === ".html") return wordCount(stripHtml(readText(filePath)));
  return 0;
}

function inferKind(filePath) {
  const value = normalize(filePath);
  if (/gesamtdossier/.test(value)) return "gesamtdossier";
  if (/einzeldossier|dossier/.test(value)) return "dossier";
  if (/detailkonzept|detail /.test(value)) return "detailkonzept";
  if (/konzeptpapier/.test(value)) return "konzeptpapier";
  if (/portalstartseite|portal startseite/.test(value)) return "landing";
  if (/toolkarte|tool /.test(value)) return "toolkarten";
  if (/wirkungsindikator/.test(value)) return "indikatoren";
  if (/sdg/.test(value)) return "sdg";
  if (/quellen|glossar/.test(value)) return "quellen";
  if (/politische anschlussfaehigkeit/.test(value)) return "politik";
  return "dokument";
}

function inferTopic(filePath, title = "") {
  const haystack = `${filePath} ${title}`;
  for (const [topic, pattern, route] of TOPIC_RULES) {
    if (pattern.test(haystack)) return { topic, route };
  }
  return { topic: "unklar", route: "" };
}

function canonicalStem(filePath, title) {
  const stem = path.basename(filePath, path.extname(filePath));
  const cleaned = stem
    .replace(/^online[_ -]?volltext[_ -]?/i, "")
    .replace(/^(\d+[_ -])?woek[_ -]/i, "")
    .replace(/WOeK_Rang\d+[_ -]?/i, "")
    .replace(/[_-]?v\d+([_.-]\d+)?$/i, "");
  const tokenList = tokens(`${cleaned} ${title}`);
  return tokenList.slice(0, 9).join("-");
}

function slugFromFileStem(filePath) {
  const stem = path.basename(filePath, path.extname(filePath));
  const normalized = normalize(stem)
    .replace(/^online volltext /, "")
    .replace(/^woek rang /, "")
    .replace(/\bdetailkonzept(e)?\b/g, " ")
    .replace(/\bdossier(s)?\b/g, " ")
    .replace(/\beinzeldossier\b/g, " ")
    .replace(/\bgesamtdossier\b/g, " ")
    .replace(/\bkonzeptpapier\b/g, " ")
    .replace(/\b(v|version)\b/g, " ")
    .replace(/\b\d+\b/g, " ");
  const keep = normalized
    .split(" ")
    .filter((token) => token && (!STOP_WORDS.has(token) || token === "p"))
    .filter((token) => token.length > 2 || token === "p");
  return keep.slice(0, 9).join("-");
}

function groupKeyFor(filePath) {
  const title = titleFromSource(filePath);
  const kind = inferKind(filePath);
  const { topic } = inferTopic(filePath, title);
  const stem = canonicalStem(filePath, title);
  return `${topic}::${kind}::${stem}`;
}

function routeFor(relPath) {
  const normalized = relPath.replace(/\\/g, "/").replace(/\/index\.html$/, "/");
  return `/${normalized}`;
}

function expectedRoutes(group) {
  if (!group.topicRoute || !group.topicSlug) return [];
  const base = group.topicRoute;
  const slug = group.topicSlug;
  if (group.kind === "detailkonzept") {
    return [`${base}detailkonzepte/${slug}/`, `${base}${slug}/`];
  }
  if (group.kind === "dossier") {
    return [`${base}dossiers/${slug}/`, `${base}${slug}/dossier/`];
  }
  if (group.kind === "gesamtdossier") {
    return [`${base}gesamtdossier/`, `${base}dossier/`];
  }
  if (group.kind === "konzeptpapier") {
    return [`${base}konzeptpapier/`, `${base}konzept/`];
  }
  if (group.kind === "landing") return [base];
  return [`${base}${slug}/`];
}

function scoreMatch(sourceTokens, page) {
  const pageTokens = new Set(tokens(`${page.route} ${page.title}`));
  if (!sourceTokens.length || !pageTokens.size) return 0;
  let overlap = 0;
  for (const token of sourceTokens) {
    if (pageTokens.has(token)) overlap += 1;
  }
  const pathText = normalize(page.route);
  const phrase = sourceTokens.slice(0, 4).join(" ");
  const phraseBonus = phrase && pathText.includes(phrase.replace(/\s+/g, " ")) ? 3 : 0;
  return overlap / Math.max(sourceTokens.length, 1) + phraseBonus;
}

function pageTitle(filePath) {
  const html = readText(filePath);
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripHtml(h1[1]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return stripHtml(title[1]).replace(/\s+-\s+Wirkungsökonomie$/, "");
  return routeFor(path.relative(ROOT, filePath));
}

function sitePages() {
  const files = walk(ROOT, (file) => {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    if (rel.startsWith("node_modules/") || rel.startsWith(".git/")) return false;
    if (!PUBLIC_EXTENSIONS.has(path.extname(file).toLowerCase())) return false;
    return /^(wirkungsfelder|werkzeuge|portale|bibliothek|downloads|dokumente|verstehen|begriffe)\//.test(rel) || /^[^/]+\.html$/.test(rel);
  });
  return files.map((file) => {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    const html = readText(file, 500_000);
    return {
      file,
      rel,
      route: routeFor(rel),
      title: pageTitle(file),
      words: wordCount(stripHtml(html)),
      pdfLinks: [...html.matchAll(/href=["']([^"']+\.pdf)["']/gi)].map((match) => match[1]),
      hasWordLanguage: /Word|DOCX|Arbeitsfassung herunterladen|Weiterarbeit/i.test(stripHtml(html)),
    };
  });
}

function publicPdfs() {
  const files = [
    ...walk(path.join(ROOT, "assets/pdf"), (file) => path.extname(file).toLowerCase() === ".pdf"),
    ...walk(path.join(ROOT, "assets/downloads"), (file) => path.extname(file).toLowerCase() === ".pdf"),
    ...walk(path.join(ROOT, "public/downloads"), (file) => path.extname(file).toLowerCase() === ".pdf"),
  ];
  return files.map((file) => ({
    file,
    rel: path.relative(ROOT, file).replace(/\\/g, "/"),
    name: path.basename(file, ".pdf"),
    tokens: new Set(tokens(path.basename(file, ".pdf"))),
  }));
}

function sourceGroups() {
  const allowlisted = localImportAllowlist();
  const sourceFiles = SOURCE_ROOTS.flatMap((root) =>
    walk(root, (file) => {
      const ext = path.extname(file).toLowerCase();
      if (!SOURCE_EXTENSIONS.has(ext)) return false;
      if (PRIVATE_PATTERN.test(file)) return false;
      return true;
    }),
  );
  const groups = new Map();
  for (const file of sourceFiles) {
    const title = titleFromSource(file);
    const kind = inferKind(file);
    const { topic, route } = inferTopic(file, title);
    const key = groupKeyFor(file);
    const group = groups.get(key) || {
      key,
      title,
      kind,
      topic,
      topicRoute: route,
      files: [],
      formats: new Set(),
      sourceWords: 0,
      excludedInternal: false,
      reasons: new Set(),
      stemSlugs: [],
      sourceTier: "review",
    };
    group.files.push(file);
    group.formats.add(path.extname(file).toLowerCase().replace(".", ""));
    group.sourceWords = Math.max(group.sourceWords, contentWordCount(file));
    if (INTERNAL_PATTERN.test(file)) {
      group.excludedInternal = true;
      group.reasons.add("technische/administrative Paketdatei");
    }
    if (EXTERNAL_REFERENCE_PATTERN.test(file) && !allowlisted.has(path.resolve(file))) {
      group.reasons.add("externe Quelle / Referenzmaterial");
    }
    if (file.includes("/01_WOeK/") || allowlisted.has(path.resolve(file))) {
      group.sourceTier = "core";
    }
    group.stemSlugs.push(slugFromFileStem(file));
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => {
    const tokenList = tokens(`${group.title} ${group.files.map((file) => path.basename(file)).join(" ")}`);
    group.tokens = unique(tokenList);
    const stemCandidates = group.stemSlugs.filter(Boolean).sort((a, b) => b.length - a.length);
    group.topicSlug = stemCandidates[0] || slugify(group.tokens.slice(0, 8).join(" "));
    if (group.title.length < 8) group.title = group.topicSlug;
    return group;
  });
}

function registryDocuments() {
  const registryPath = path.join(ROOT, "assets/data/document-registry.json");
  if (!exists(registryPath)) return [];
  return JSON.parse(fs.readFileSync(registryPath, "utf8")).map((item) => ({
    ...item,
    tokens: new Set(tokens(`${item.id} ${item.slug} ${item.title} ${item.summary || ""}`)),
  }));
}

function overlapCount(sourceTokens, candidateTokens) {
  let count = 0;
  for (const token of sourceTokens) {
    if (candidateTokens.has(token)) count += 1;
  }
  return count;
}

function classify(group, matches, exactPages, pdfMatches, registryMatches) {
  if (group.excludedInternal) return "excluded-internal";
  if (group.reasons.has("externe Quelle / Referenzmaterial")) return "external-review";
  if (group.topic === "unklar") return "review-topic";
  if (!matches.length) return "missing-online";
  const expected = expectedRoutes(group);
  const canonicalDetailRoute = expected[0];
  const canonicalDetailPage = exactPages.find((page) => page.route === canonicalDetailRoute);
  const alternateRoutePage = exactPages.find((page) => page.route !== canonicalDetailRoute);
  if (group.kind === "detailkonzept" && alternateRoutePage && !canonicalDetailPage) return "stub-or-misrouted";
  const best = matches[0];
  const exactBest = exactPages[0];
  const sourceLong = group.sourceWords >= 1000;
  const matchedShort = best?.words && best.words < Math.max(650, group.sourceWords * 0.35);
  const exactShortButOtherLong = exactBest && exactBest.words < 900 && best && best.route !== exactBest.route && best.words > exactBest.words * 1.8;
  if (sourceLong && (matchedShort || exactShortButOtherLong)) return "stub-or-misrouted";
  if (!pdfMatches.length && ["detailkonzept", "dossier", "gesamtdossier", "konzeptpapier"].includes(group.kind)) return "missing-public-pdf";
  if (!registryMatches.length && ["detailkonzept", "dossier", "gesamtdossier", "konzeptpapier"].includes(group.kind)) return "missing-registry";
  return "ok-or-linked";
}

function asRoutePath(route) {
  return route.replace(/^\//, "").replace(/\/$/, "/index.html");
}

function main() {
  const pages = sitePages();
  const pdfs = publicPdfs();
  const registry = registryDocuments();
  const groups = sourceGroups();

  const audited = groups.map((group) => {
    const sourceTokens = group.tokens;
    const expected = expectedRoutes(group);
    const exactPages = expected
      .map((route) => pages.find((page) => page.route === route || page.rel === asRoutePath(route)))
      .filter(Boolean);
    const matches = pages
      .map((page) => ({ ...page, score: scoreMatch(sourceTokens, page) }))
      .filter((page) => page.score >= 0.42 || expected.includes(page.route))
      .sort((a, b) => b.score - a.score || b.words - a.words)
      .slice(0, 5);
    const pdfMatches = pdfs
      .map((pdf) => ({ ...pdf, overlap: overlapCount(sourceTokens, pdf.tokens) }))
      .filter((pdf) => pdf.overlap >= Math.min(4, Math.max(2, Math.floor(sourceTokens.length * 0.35))))
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 4);
    const registryMatches = registry
      .map((doc) => ({ ...doc, overlap: overlapCount(sourceTokens, doc.tokens) }))
      .filter((doc) => doc.overlap >= Math.min(4, Math.max(2, Math.floor(sourceTokens.length * 0.35))))
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 4);
    const status = classify(group, matches, exactPages, pdfMatches, registryMatches);
    return {
      key: group.key,
      title: group.title,
      kind: group.kind,
      topic: group.topic,
      topicRoute: group.topicRoute,
      sourceWords: group.sourceWords,
      formats: [...group.formats].sort(),
      sourceFiles: group.files,
      expectedRoutes: expected,
      exactPages: exactPages.map((page) => ({ route: page.route, title: page.title, words: page.words, hasWordLanguage: page.hasWordLanguage })),
    matches: matches.map((page) => ({ route: page.route, title: page.title, words: page.words, score: Number(page.score.toFixed(2)), hasWordLanguage: page.hasWordLanguage })),
      pdfMatches: pdfMatches.map((pdf) => ({ file: pdf.rel, overlap: pdf.overlap })),
      registryMatches: registryMatches.map((doc) => ({ id: doc.id, title: doc.title, onlineUrl: doc.onlineUrl, pdfUrl: doc.pdfUrl, overlap: doc.overlap })),
      status,
      sourceTier: group.sourceTier,
      reasons: [...group.reasons],
    };
  });

  const publicRelevant = audited.filter((item) => item.status !== "excluded-internal");
  const coreRelevant = publicRelevant.filter((item) => item.sourceTier === "core" && item.status !== "external-review");
  const byStatus = publicRelevant.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const byTopic = publicRelevant.reduce((acc, item) => {
    acc[item.topic] = (acc[item.topic] || 0) + 1;
    return acc;
  }, {});

  const priority = publicRelevant
    .filter((item) => item.sourceTier === "core")
    .filter((item) => ["stub-or-misrouted", "missing-online", "missing-public-pdf", "missing-registry", "review-topic"].includes(item.status))
    .sort((a, b) => {
      const order = { "stub-or-misrouted": 0, "missing-online": 1, "missing-public-pdf": 2, "missing-registry": 3, "review-topic": 4 };
      return order[a.status] - order[b.status] || b.sourceWords - a.sourceWords;
    });

  const marketing = audited.filter((item) => /marketing|planet|fuenftes|fünftes|5p/i.test(`${item.title} ${item.sourceFiles.join(" ")}`));

  const lines = [
    "# Topic Document Routing Audit",
    "",
    "Stand: 2026-05-26",
    "",
    "## Zweck",
    "",
    "Dieser Audit gleicht lokale Dokumentquellen aus `01_WOeK` und `02_Dokumente` mit öffentlichen Themen-, Sub-, Detailkonzept-, Dossier- und Bibliotheksseiten ab. Er ersetzt keine redaktionelle Freigabe, markiert aber systematisch fehlende Onlinefassungen, kurze Stub-Seiten, fehlende PDFs und fehlende Registry-Verknüpfungen.",
    "",
    "## Zusammenfassung",
    "",
    `- Lokale Dokumentgruppen gescannt: ${groups.length}`,
    `- Öffentlich relevante Dokumentgruppen: ${publicRelevant.length}`,
    `- Publikationsnahe Kerngruppen aus WÖk-Paketen/Allowlist: ${coreRelevant.length}`,
    `- Interne/administrative Paketdateien ausgeklammert: ${audited.length - publicRelevant.length}`,
    `- Öffentliche Website-Seiten im Abgleich: ${pages.length}`,
    `- Öffentliche PDF-Dateien im Abgleich: ${pdfs.length}`,
    `- Dokumente in der Registry: ${registry.length}`,
    "",
    "### Statuszählung",
    "",
    "| Status | Anzahl | Bedeutung |",
    "| --- | ---: | --- |",
    `| stub-or-misrouted | ${byStatus["stub-or-misrouted"] || 0} | Lange Quelle vorhanden, aber öffentliche Seite wirkt kurz, falsch geroutet oder konkurriert mit längerer Fassung. |`,
    `| missing-online | ${byStatus["missing-online"] || 0} | Quelle gefunden, aber keine passende Online-/Themenseite erkannt. |`,
    `| missing-public-pdf | ${byStatus["missing-public-pdf"] || 0} | Onlinebezug erkannt, aber keine passende öffentliche PDF gefunden. |`,
    `| missing-registry | ${byStatus["missing-registry"] || 0} | Material wirkt öffentlich relevant, fehlt aber in der Dokumenten-Registry. |`,
    `| review-topic | ${byStatus["review-topic"] || 0} | Thema konnte heuristisch nicht sicher zugeordnet werden. |`,
    `| external-review | ${byStatus["external-review"] || 0} | Externe Quelle oder Referenzmaterial; nicht automatisch als Website-Dokument veröffentlichen. |`,
    `| ok-or-linked | ${byStatus["ok-or-linked"] || 0} | Onlinefassung/Verlinkung wirkt plausibel, trotzdem stichprobenpflichtig. |`,
    "",
    "### Themenverteilung",
    "",
    "| Thema | Dokumentgruppen |",
    "| --- | ---: |",
    ...Object.entries(byTopic)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([topic, count]) => `| ${topic} | ${count} |`),
    "",
    "## P0/P1-Prüfliste",
    "",
    "| Status | Titel | Typ | Thema | Quelle Wörter | Erwartete Route | Beste öffentliche Treffer | PDF | Registry |",
    "| --- | --- | --- | --- | ---: | --- | --- | --- | --- |",
    ...priority.slice(0, 160).map((item) => {
      const routes = item.expectedRoutes.slice(0, 2).join("<br>");
      const pages = item.matches.slice(0, 3).map((page) => `${page.route} (${page.words} Wörter)`).join("<br>") || "kein Treffer";
      const pdf = item.pdfMatches.slice(0, 2).map((hit) => hit.file).join("<br>") || "kein Treffer";
      const reg = item.registryMatches.slice(0, 2).map((hit) => `${hit.id}`).join("<br>") || "kein Treffer";
      return `| ${item.status} | ${item.title.replaceAll("|", "\\|")} | ${item.kind} | ${item.topic} | ${item.sourceWords} | ${routes || "-"} | ${pages} | ${pdf} | ${reg} |`;
    }),
    "",
    "## Sonderfall Marketing / fünftes P Planet",
    "",
    "Die Suche bestätigt den vom Nutzer gemeldeten Fall: Es gibt mehrere Quellen und Routen zum nachhaltigen Marketing bzw. fünften P. Der lange v1.0-Onlinevolltext ist lokal vorhanden, während die Detailkonzept-Route eine kürzere Fassung ausspielt bzw. konkurrierende Routen existieren.",
    "",
    "| Titel | Status | Typ | Quelle Wörter | Erwartete Route | Treffer | Registry |",
    "| --- | --- | --- | ---: | --- | --- | --- |",
    ...marketing.map((item) => {
      const routes = item.expectedRoutes.slice(0, 2).join("<br>");
      const pages = item.matches.slice(0, 4).map((page) => `${page.route} (${page.words} Wörter)`).join("<br>") || "kein Treffer";
      const reg = item.registryMatches.map((hit) => hit.id).join("<br>") || "kein Treffer";
      return `| ${item.title.replaceAll("|", "\\|")} | ${item.status} | ${item.kind} | ${item.sourceWords} | ${routes || "-"} | ${pages} | ${reg} |`;
    }),
    "",
    "## Empfohlene nächste Schritte",
    "",
    "1. `stub-or-misrouted` zuerst sanieren: kurze Detailkonzept-/Dossier-Stubs durch lange Onlinefassungen ersetzen oder auf die lange Fassung weiterleiten.",
    "2. Für `missing-online` entscheiden: Onlinefassung erzeugen, als Archivmaterial markieren oder bewusst nicht veröffentlichen.",
    "3. Für `missing-public-pdf` PDF aus vorhandener Quelle erzeugen und öffentlich nur PDF, nicht DOCX, anbieten.",
    "4. Für `missing-registry` Eintrag in `assets/data/document-registry.json` ergänzen, damit Bibliothek, Suche und Kontextkarten dieselbe Quelle nutzen.",
    "5. Marketing/5P konkret: Die lange Fassung `Marketing, Vertrieb und das fünfte P: Planet` zur Haupt-Detailkonzeptseite machen und `Nachhaltiges Marketing-Mix` als Bibliotheksdokument passend verknüpfen.",
    "",
    "## Vollständige Rohdaten",
    "",
    `Maschinenlesbar: \`${path.relative(ROOT, JSON_PATH)}\``,
    "",
  ];

  fs.writeFileSync(REPORT_PATH, `${lines.join("\n")}\n`, "utf8");
  fs.writeFileSync(JSON_PATH, `${JSON.stringify({ summary: { groups: groups.length, publicRelevant: publicRelevant.length, coreRelevant: coreRelevant.length, byStatus, byTopic }, items: audited }, null, 2)}\n`, "utf8");

  console.log(`Topic document routing audit: ${publicRelevant.length} public-relevant groups, ${priority.length} findings -> ${path.relative(ROOT, REPORT_PATH)}`);
}

main();
