import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const indexPath = "assets/search/search-index.json";
const metaPath = "public/data/woek-search-meta.json";
const glossaryPath = "public/data/glossary.terms.json";
const documentRegistryPath = "assets/data/document-registry.json";
const questionRegistryPath = "assets/data/questions-registry.json";
const PAGE_BODY_LIMIT = 1600;
const SECTION_BODY_LIMIT = 900;
const FULLTEXT_BODY_LIMIT = 500;
const PUBLIC_SEARCH_REPLACEMENTS = [
  [/Bildungsportal öffnen/g, "Wirkungsfeld öffnen"],
  [/Portal öffnen/g, "Wirkungsfeld öffnen"],
  [/Portalarchitektur/g, "Systemlandkarte"],
  [/Grundstruktur vorhanden/g, "Wirkungsfeld"],
  [/Working Paper vorhanden/g, "Vertiefung"],
  [/Konzept vorhanden/g, "Vertiefung"],
  [/ausgebaut \/ erster Schwerpunkt/g, "Wirkungsfeld"],
  [/kanonische Portalstruktur/g, "Systemlandkarte"],
  [/Dossier in Vorbereitung/g, "Weiterführende Vertiefung"],
  [/Tool-Spezifikation und Rechenmodell/g, "Methodik und Annahmen"],
  [/Tool-Spezifikation:/g, "Methodik:"],
  [/Tool-Spezifikation/g, "Methodik"],
  [/Spezifikation online lesen/g, "Methodik lesen"],
  [/Spezifikation online/g, "Methodenseite"],
  [/\bInputs\b/g, "Eingaben"],
  [/\bOutputs\b/g, "Ergebnisse"],
  [/Website-Integration/g, "Einordnung auf der Website"],
  [/Nächster Entwicklungsschritt/g, "Methodik und Grenzen"],
  [/Demo in Vorbereitung/g, "Methodenseite"],
  [/Portal der Wirkungsökonomie/g, "Website der Wirkungsökonomie"],
  [/Produktportal/g, "Produktbereich"],
  [/Erklärung vorhanden/g, "Methodik"],
  [/Download wird ergänzt/g, "Arbeitsmaterial"],
  [/Toolkarte öffnen/g, "Toolkarte ansehen"],
  [/Audio verfügbar\. Transkript in Bearbeitung\./g, "Audio verfügbar."],
  [/Methodendokumentation folgt/g, "Methodik und Annahmen"],
  [/Datenquellen vorbereitet/g, "Datenquellen und Grenzen"],
  [/Version v0\.1/g, "Modellhafte Fassung"],
  [/\bv0\.1\b/g, "Modellfassung"],
  [/Toolseite öffnen/g, "Methodik lesen"],
  [/Publikationszugang/g, "Vertiefung"],
  [/Portalstruktur/g, "Übersicht"],
  [/Tool-Architektur/g, "Werkzeuglogik"],
  [/Detailkonzept \+ Dossier/g, "Vertiefung"],
  [/Einzeldossier-Set/g, "Einzeldossiers"],
  [/Dossier & Export/g, "Vertiefung"],
  [/Export & Archiv/g, "Arbeitsmaterial"],
  [/Downloads und Druck/g, "Materialien und Downloads"],
  [/Onlinefassung, Druck und Export/g, "Materialien und Downloads"],
  [/Du liest die Onlinefassung\.?/g, "Die Seite ist online lesbar."],
  [/Der Die Seite ist online lesbar\.?/g, "Die Seite ist online lesbar."],
  [/Der Du liest die Onlinefassung\.?/g, "Die Seite ist online lesbar."],
  [/Online-Volltext/g, "Onlinefassung"],
  [/Beschäftigte \/ FTE/g, "Beschäftigte, umgerechnet auf Vollzeitstellen"],
  [/Anzahl ersetzter FTE/g, "Anzahl ersetzter Vollzeitstellen"],
  [/\bFTE\b/g, "Vollzeitstellen"],
  [/Dokumentenmatrix/g, "Materialübersicht"],
  [/Export- und Archivfassungen/g, "ergänzende Downloadfassungen"],
  [/Export- und Archiv/g, "Download"],
  [/Export und Archiv/g, "Download"],
  [/Portaltext/g, "Seitentext"],
  [/kanonische Seitenadresse/gi, "Seitenadresse"],
  [/Kanonische Seite öffnen/g, "Seite öffnen"],
  [/kanonisch/gi, "öffentlich"],
  [/in Vorbereitung/g, "wird ergänzt"],
  [/Prototypen/g, "Demos"],
  [/Prototyp/g, "Modellhafte Demo"],
];

function clean(text) {
  return String(text || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function publicSearchText(text) {
  return PUBLIC_SEARCH_REPLACEMENTS.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), String(text || ""));
}

function publicSearchValue(value) {
  if (typeof value === "string") return publicSearchText(value);
  if (Array.isArray(value)) return value.map(publicSearchValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, publicSearchValue(item)]));
  }
  return value;
}

function normalizeSearchRoute(url) {
  return String(url || "").replace(/#.*$/, "").replace(/\/index\.html$/, "/");
}

function isLowValueEntry(entry) {
  const route = normalizeSearchRoute(entry.url);
  const title = String(entry.title || "");
  const section = String(entry.section || "");
  if (/\/(impressum|datenschutz|ueber|mitmachen)(\.html|\/)?$/i.test(route)) return true;
  if (/footer|navigation|kontakt/i.test(title) || /footer|navigation/i.test(section)) return true;
  if (/^\/referenz\/kapitel-\d{3}-.+#/i.test(String(entry.url || "")) && /Endnoten|Quellen/i.test(title)) return true;
  return false;
}

function normalizePriority(entry) {
  if (!isLowValueEntry(entry)) return entry;
  return {
    ...entry,
    priority: Math.min(Number(entry.priority || 0), 8),
    tags: [...(Array.isArray(entry.tags) ? entry.tags : []), "Suchindex nachrangig"],
  };
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function entryFromTerm(term) {
  const body = [
    term.canonicalLabel,
    term.shortDefinition,
    term.hoverDefinition,
    term.longDefinition,
    term.usageNote,
    ...(term.synonyms || []),
    ...(term.relatedTerms || []),
  ].join(" ");
  return {
    id: `woek-term-${term.slug}`,
    title: term.canonicalLabel,
    description: term.shortDefinition,
    url: `/begriffe/${term.slug}/`,
    section: "Begriffe",
    type: term.status === "anschlussbegriff" ? "Anschlussbegriff" : "Begriff",
    format: "Glossarbegriff",
    impactSpaces: ["Mensch", "Planet", "Demokratie"],
    standards: term.relatedTerms?.filter((item) => /sdg|csrd|esrs|taxonomie|gri|nace/i.test(item)) || [],
    instruments: term.relatedTerms || [],
    tags: [term.status, term.version, term.reviewStatus, ...(term.synonyms || [])].filter(Boolean),
    aliases: [...(term.synonyms || []), term.hoverDefinition],
    body,
    priority: term.status === "führender-begriff" ? 175 : 155,
  };
}

function entryFromDocument(document) {
  const body = [
    document.title,
    document.type,
    document.summary,
    ...(document.category || []),
    ...(document.audience || []),
    ...(document.keyPoints || []),
    ...(document.relatedTerms || []),
  ].join(" ");
  return {
    id: `woek-document-${document.id}`,
    title: document.title,
    description: document.summary,
    url: document.onlineUrl || document.pdfUrl,
    section: "Bibliothek",
    type: document.type,
    format: document.pdfUrl ? "Onlinefassung und PDF" : "Onlinefassung",
    impactSpaces: ["Mensch", "Planet", "Demokratie"],
    standards: (document.relatedTerms || []).filter((item) => /sdg|csrd|esrs|taxonomie|gri/i.test(item)),
    instruments: document.relatedTerms || [],
    tags: [document.status, ...(document.category || []), ...(document.audience || [])].filter(Boolean),
    aliases: [document.pdfUrl, document.sourceOnlineUrl].filter(Boolean),
    body,
    priority: document.isArchive ? 58 : 138,
  };
}

function entryFromQuestion(question) {
  const related = question.related || {};
  const body = [
    question.question,
    question.shortAnswer,
    question.longAnswer,
    question.whyItMatters,
    question.limits,
    question.category,
    ...(question.keywords || []),
    ...(related.terms || []).map((item) => item.label),
    ...(related.pages || []).map((item) => item.label),
    ...(related.tools || []).map((item) => item.label),
    ...(related.documents || []).map((item) => item.label),
  ].join(" ");
  return {
    id: `woek-question-${question.id}`,
    title: question.question,
    description: question.shortAnswer,
    url: `/fragen/#${question.id}`,
    section: "Fragen & Einwände",
    type: "Frage",
    format: "FAQ / Einwand",
    impactSpaces: ["Mensch", "Planet", "Demokratie"],
    standards: body.match(/SDG\+?|ESG|CSRD|Taxonomie|IDG/gi) || [],
    instruments: [...(related.terms || []), ...(related.tools || [])].map((item) => item.label),
    tags: [question.category, ...(question.keywords || [])].filter(Boolean),
    aliases: question.keywords || [],
    body,
    priority: Number(question.priority || 100) <= 12 ? 174 : 148,
  };
}

function curatedIaEntries() {
  return [
    {
      id: "woek-curated-fuer-wen",
      title: "Für wen? Zielgruppen der Wirkungsökonomie",
      description: "Einstiege für Bürger:innen, Journalismus, Unternehmen, Politik, Parteien, Verwaltung, Kommunen, Investor:innen, Wissenschaft und Akademie.",
      url: "/fuer/",
      section: "Zielgruppen",
      type: "Zielgruppen-Hub",
      format: "Orientierungsseite",
      impactSpaces: ["Mensch", "Planet", "Demokratie"],
      standards: ["SDG", "SDG+"],
      instruments: ["WÖk-Kompass", "WÖk-Scanner"],
      tags: ["Zielgruppen", "Bürger:innen", "Journalismus", "Unternehmen", "Politik", "Parteien", "Kommunen", "Investor:innen", "Akademie"],
      aliases: ["Für wen", "Bürger", "Journalisten", "Unternehmer", "Politiker", "Parteien"],
      body: "Der Zielgruppen-Hub übersetzt die Wirkungsökonomie in konkrete Perspektiven und führt zu passenden Seiten, Tools, Begriffen und Wirkungsfeldern.",
      priority: 145,
    },
    {
      id: "woek-curated-demokratische-anschlussfaehigkeit",
      title: "Demokratische Anschlussfähigkeit",
      description: "Neutraler Einstieg zu Politik, Parteien und Programmen als Vergleichs- und Übersetzungsraum der Wirkungsökonomie.",
      url: "/ordnung/demokratische-anschlussfaehigkeit.html",
      section: "Zielgruppen",
      type: "Politik und Parteien",
      format: "Orientierungsseite",
      impactSpaces: ["Demokratie"],
      standards: ["SDG 16", "SDG+", "Rechtsstaatlichkeit"],
      instruments: ["Wirkungsrat", "Wirkungshaushalt", "Wirkungsprüfung"],
      tags: ["Politik", "Parteien", "Demokratie", "Anschlussfähigkeit", "Wahlprogramme"],
      aliases: ["Parteienseiten", "Politiker:innen", "Parteiprogramme", "CDU", "SPD", "Grüne", "FDP", "Linke"],
      body: "Die Wirkungsökonomie ist kein Parteiprogramm. Sie macht politische Programme entlang gemeinsamer Wirkungsfragen vergleichbarer.",
      priority: 142,
    },
    {
      id: "woek-curated-sdg-sdgplus",
      title: "SDGs & SDG+",
      description: "Referenzrahmen für Wirkung: 17 UN-Ziele, Agenda 2030 und SDG+ als Erweiterung der Wirkungsökonomie.",
      url: "/verstehen/sdgs-sdgplus/",
      section: "SDG-/SDG+-Referenzrahmen",
      type: "Referenzrahmen",
      format: "Übersicht",
      impactSpaces: ["Mensch", "Planet", "Demokratie"],
      standards: ["SDG", "SDG+", "Agenda 2030"],
      instruments: ["WÖk-ID", "Scorecard", "Wirkungsbewertung"],
      tags: ["SDG", "SDGs", "SDG+", "Agenda 2030", "UN-Ziele", "Demokratie", "Medienqualität"],
      aliases: ["Sustainable Development Goals", "Nachhaltigkeitsziele", "SDG Plus"],
      body: "Der Referenzrahmen erklärt die offiziellen SDGs sowie SDG+ für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, Zusammenhalt und digitale Selbstbestimmung.",
      priority: 150,
    },
  ];
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(md|mdx|html)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function routeFor(file) {
  const rel = file.replace(/\\/g, "/");
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"/index.html".length)}/`;
  if (rel.endsWith(".html")) return `/${rel}`;
  if (rel.startsWith("src/content/docs/")) return `/${rel.replace(/^src\/content\/docs\//, "").replace(/\.(md|mdx)$/i, "/")}`;
  return `/${rel}`;
}

function entriesFromContent(file) {
  const text = fs.readFileSync(file, "utf8");
  const route = routeFor(file);
  const title =
    text.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ||
    clean(text.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1]) ||
    path.basename(file).replace(/\.[^.]+$/, "");
  const isTermPage = /^\/begriffe\/[^/]+\/$/.test(route);
  const isTermIndex = route === "/begriffe/";
  const documentType = isTermPage || isTermIndex
    ? "Begriffe"
    : text.match(/^documentType:\s*["']?(.+?)["']?\s*$/m)?.[1] || "Referenz";
  const status = text.match(/^status:\s*["']?(.+?)["']?\s*$/m)?.[1] || "online-reviewed";
  const version =
    text.match(/<dt>Web-Version<\/dt><dd>(.*?)<\/dd>/i)?.[1] ||
    text.match(/^webVersion:\s*["']?(.+?)["']?\s*$/m)?.[1] ||
    "2026.1";
  const liveBoost = version === "2026.2-live-reference" ? 25 : 0;
  const isReferenceChapter = /referenz\/kapitel-\d{3}-/.test(file);
  const isRegister = /woek-master-items-final-v1-2/.test(file);
  const isFulltext = route === "/referenz/volltext/";
  const bodyLimit = isFulltext ? FULLTEXT_BODY_LIMIT : PAGE_BODY_LIMIT;
  const body = clean(text).slice(0, bodyLimit);
  if (body.length < 80) return [];
  const sectionMatches = Array.from(text.matchAll(/<h([2-3])[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h\1>/gi));
  const base = {
    documentType,
    status,
    version,
    sourceFile: file,
    contentHash: hash(text),
  };
  const pageEntry = {
    id: `woek-page-${hash(file)}`,
    title,
    description: body.slice(0, 240),
    url: route,
    section: isTermPage || isTermIndex ? "Begriffe" : documentType,
    type: isTermPage ? "Begriff" : isTermIndex ? "Begriffsübersicht" : documentType,
    format: isTermPage ? "Begriffseite" : isTermIndex ? "Übersicht" : documentType,
    impactSpaces: [],
    standards: [],
    instruments: [],
    tags: [status, version, "WÖk-Referenz"],
    aliases: [],
    body,
    priority: isTermPage
      ? 132
      : isTermIndex
        ? 118
        : 70 + liveBoost + (isReferenceChapter ? 15 : 0) + (isRegister ? 20 : 0),
  };
  const entries = [pageEntry];
  if (isTermPage) {
    return entries.map((entry) => ({ entry, meta: { ...base, sectionId: "" } }));
  }
  if (isFulltext) {
    return entries.map((entry) => ({ entry, meta: { ...base, sectionId: "" } }));
  }
  for (const match of sectionMatches) {
    const sectionId = match[2];
    const sectionTitle = clean(match[3]);
    const matchStart = match.index || 0;
    const nextHeading = text.slice(matchStart + match[0].length).search(/<h[2-3]\b/i);
    const sectionHtml =
      nextHeading >= 0
        ? text.slice(matchStart, matchStart + match[0].length + nextHeading)
        : text.slice(matchStart, matchStart + 9000);
    const sectionBody = clean(sectionHtml).slice(0, SECTION_BODY_LIMIT);
    entries.push({
      ...pageEntry,
      id: `woek-section-${sectionId}`,
      title: `${title}: ${sectionTitle}`,
      description: sectionBody.slice(0, 240) || pageEntry.description,
      url: `${route}#${sectionId}`,
      body: sectionBody || pageEntry.body,
      priority: 85 + liveBoost + (isReferenceChapter ? 15 : 0) + (isRegister ? 20 : 0),
    });
  }
  return entries.map((entry) => ({ entry, meta: { ...base, sectionId: entry.id.replace(/^woek-section-/, "") } }));
}

const existing = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, "utf8")) : [];
const glossary = fs.existsSync(glossaryPath) ? JSON.parse(fs.readFileSync(glossaryPath, "utf8")).terms : [];
const documents = fs.existsSync(documentRegistryPath)
  ? JSON.parse(fs.readFileSync(documentRegistryPath, "utf8")).filter((document) => document.isPublic !== false)
  : [];
const questions = fs.existsSync(questionRegistryPath)
  ? JSON.parse(fs.readFileSync(questionRegistryPath, "utf8")).questions || []
  : [];
const generated = [];
const meta = {};

for (const entry of curatedIaEntries()) {
  generated.push(entry);
  meta[entry.url] = {
    documentType: entry.type,
    status: "published",
    sectionId: entry.id,
    searchBoost: entry.priority,
  };
}

for (const term of glossary) {
  const entry = entryFromTerm(term);
  generated.push(entry);
  meta[entry.url] = {
    documentType: "begriff",
    status: term.status,
    version: term.version,
    sectionId: `begriff-${term.slug}`,
    documentId: term.termId,
    relatedTerms: term.relatedTerms || [],
    relatedDocuments: term.relatedDocuments || [],
    sourceFile: term.sourceDocument,
    searchBoost: entry.priority,
  };
}

for (const document of documents) {
  const entry = entryFromDocument(document);
  generated.push(entry);
  meta[entry.url] = {
    documentType: "bibliothek",
    status: document.status,
    version: document.stand,
    sectionId: `document-${document.id}`,
    documentId: document.id,
    relatedTerms: document.relatedTerms || [],
    relatedDocuments: [],
    relatedFields: document.relatedFields || [],
    relatedTools: document.relatedTools || [],
    sourceFile: documentRegistryPath,
    searchBoost: entry.priority,
  };
}

for (const question of questions) {
  const entry = entryFromQuestion(question);
  generated.push(entry);
  meta[entry.url] = {
    documentType: "fragen",
    status: "published",
    version: "2026.2",
    sectionId: question.id,
    documentId: `question-${question.id}`,
    relatedTerms: (question.related?.terms || []).map((item) => item.url).filter(Boolean),
    relatedDocuments: (question.related?.documents || []).map((item) => item.url).filter(Boolean),
    sourceFile: questionRegistryPath,
    searchBoost: entry.priority,
  };
}

const glossaryUrls = new Set(glossary.map((term) => `/begriffe/${term.slug}/`));
const contentFiles = ["src/content/docs", "begriffe", "referenz", "dokumente", "instrumente", "beispiele", "quellen", "export"]
  .flatMap((dir) => walk(dir));
for (const file of contentFiles) {
  for (const { entry, meta: itemMeta } of entriesFromContent(file)) {
    if (glossaryUrls.has(entry.url)) continue;
    generated.push(entry);
    meta[entry.url] = itemMeta;
  }
}

const byUrl = new Map(existing.filter((entry) => !String(entry.id || "").startsWith("woek-")).map((entry) => [entry.url, entry]));
for (const entry of generated) byUrl.set(entry.url, entry);
const merged = Array.from(byUrl.values())
  .map(publicSearchValue)
  .map(normalizePriority)
  .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0) || String(a.title).localeCompare(String(b.title), "de"));

fs.writeFileSync(indexPath, `${JSON.stringify(merged, null, 2)}\n`);
fs.writeFileSync(metaPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), entries: meta }, null, 2)}\n`);
console.log(`Integrated ${generated.length} WÖk search entries into existing search index.`);
