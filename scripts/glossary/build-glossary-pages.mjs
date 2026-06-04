import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const navigation = JSON.parse(fs.readFileSync("assets/data/navigation.json", "utf8"));
const documentRegistryPath = "assets/data/document-registry.json";
const documentRegistry = fs.existsSync(documentRegistryPath)
  ? JSON.parse(fs.readFileSync(documentRegistryPath, "utf8"))
  : [];
const glossaryReferenceIndexPath = "public/data/glossary-reference-index.json";
const glossaryReferenceIndex = fs.existsSync(glossaryReferenceIndexPath)
  ? JSON.parse(fs.readFileSync(glossaryReferenceIndexPath, "utf8"))
  : { terms: {} };
const searchIndexPath = "assets/search/search-index.json";
const searchIndex = fs.existsSync(searchIndexPath)
  ? JSON.parse(fs.readFileSync(searchIndexPath, "utf8"))
  : [];
const headerTemplate = fs.readFileSync("templates/header.html", "utf8");
const footerTemplate = fs.readFileSync("templates/footer.html", "utf8");
const outDir = "begriffe";
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync("reports", { recursive: true });
const collator = new Intl.Collator("de", { sensitivity: "base" });
const contentReferenceWarnings = [];
const contentReferenceRecords = [];
const categoryOrder = [
  "Grundbegriff",
  "Bewertungsbegriff",
  "Messbegriff",
  "Steuerungsbegriff",
  "Architekturbegriff",
  "Schutzbegriff",
  "Datenbegriff",
  "Demokratiebegriff",
  "Psychologische und systemische Wirkmechanismen",
  "Psychologische Wirkmechanismen",
  "Systemtheorie, Kybernetik und Konstruktivismus",
  "Systemtheorie, Konstruktivismus und Kybernetik",
  "Management, Wirksamkeit und Organisation",
  "Management, Organisation und Wirksamkeit",
  "Innovation, Evolution und Unternehmertum",
  "Transformation, Innovation und wirtschaftliche Entwicklung",
  "Daoismus, Prozessdenken und Nicht-Erzwingen",
  "Klima, Lebenszyklus und ökologische Wirkung",
  "Design, Geschäftsmodelle und Wertversprechen",
  "Physik, Energie und Wirkungsmetaphern",
  "Vordenker:innen und Bezugslinien",
  "Werte, Normativität und Bewertung",
  "Kapital, Markt und Eigentum",
  "Finanzsystem, Kapital & Lieferkettenrisiken",
  "Sprache, Wirklichkeit und Kommunikation",
  "Ethik, Würde und Verantwortung",
  "Wirtschaftssysteme, Kapitalmythen und Verteilungslogiken",
  "Kreislaufwirtschaft, Circular Design und Materialkreisläufe",
  "Gesundheit & Leben",
  "Klima- und Gesundheitsbegriff",
  "Neuropsychologische Wirkmechanismen",
  "Quantenphysik, Quantenmaterialien und Zukunftstechnologien",
  "Energie, Strommarkt und Systemkosten",
  "Glossar-Publizierungsprozess",
  "Praxisbegriff",
];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function warnContentReference(type, target, detail = "") {
  contentReferenceWarnings.push({ type, target: String(target || ""), detail });
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function textFromHtml(value) {
  return decodeHtmlEntities(String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function normalizedLabel(value) {
  return textFromHtml(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—-]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedHubConcept(value) {
  return normalizedLabel(value)
    .replace(/\s*\((kurzverweis|leseschluessel|leseschlüssel|bestand|alias)\)\s*$/i, "")
    .replace(/cards$/i, "card")
    .trim();
}

function normalizeReferenceUrl(value) {
  const raw = String(value || "").trim();
  if (!raw || /^\[object Object\]$/i.test(raw)) return "";
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      return url.hostname.includes("wirkungsoekonomie.de") ? normalizeReferenceUrl(`${url.pathname}${url.hash || ""}`) : raw;
    } catch {
      return raw;
    }
  }
  const local = raw.replace(/^(\.\.\/)+/, "/").replace(/^\.\//, "/");
  const withSlash = local.startsWith("/") ? local : `/${local}`;
  return withSlash
    .replace(/\/index\.html(?=#|$)/, "/")
    .replace(/\.html(?=#|$)/, ".html")
    .replace(/\/{2,}/g, "/");
}

function slugFromReference(value) {
  const raw = String(value || "").trim();
  if (!raw || /^\[object Object\]$/i.test(raw)) return "";
  const withoutHash = raw.split("#")[0].replace(/\/$/, "");
  const file = withoutHash.split("/").filter(Boolean).pop() || raw;
  return filterToken(file.replace(/\.html$/i, ""));
}

function isSlugLike(value) {
  return /^[a-z0-9]+(-[a-z0-9]+){2,}$/.test(String(value || "").trim());
}

function humanizeSlug(value) {
  const cleaned = slugFromReference(value);
  if (!cleaned) return "";
  warnContentReference("missing-title-slug-fallback", value, "Titel aus Slug erzeugt");
  return cleaned
    .split("-")
    .filter(Boolean)
    .map((part) => part.length <= 3 ? part.toUpperCase() : `${part.charAt(0).toLocaleUpperCase("de")}${part.slice(1)}`)
    .join(" ");
}

function cleanReferenceTitle(value) {
  const title = textFromHtml(value);
  const chapter = title.match(/^Kapitel\s+(\d+)\s*[-–]\s*(.*?)\s*[-–]\s*Wirkungsökonomie\s+Online$/i);
  if (chapter) return `Kapitel ${Number(chapter[1])}: ${chapter[2].trim()}`;
  return title.replace(/\s+-\s+/g, " – ");
}

function trimDescription(value, limit = 240) {
  const text = textFromHtml(value)
    .replace(/\s+/g, " ")
    .replace(/^\s*(in diesem artikel|auf dieser seite)\s*[:.-]\s*/i, "")
    .trim();
  if (!text) return "";
  if (text.length <= limit) return text;
  const shortened = text.slice(0, limit - 1);
  return `${shortened.slice(0, Math.max(shortened.lastIndexOf(" "), 120)).trim()}…`;
}

function readingTimeFromBody(value) {
  const words = textFromHtml(value).split(/\s+/).filter(Boolean).length;
  if (!words || words < 180) return "";
  return `ca. ${Math.max(1, Math.ceil(words / 220))} Min. Lesezeit`;
}

function firstMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? textFromHtml(match[1]) : "";
}

function loadLegacyDetailTerms() {
  const sourceSlugs = new Set(data.terms.map((term) => term.slug));
  const sourceLabels = new Set(data.terms.flatMap((term) => [
    term.canonicalLabel || term.label || term.canonicalTitle,
    ...(term.aliases || []),
    ...(term.synonyms || []),
  ]).map((label) => normalizedHubConcept(label)).filter(Boolean));
  const seenLegacyLabels = new Set();
  return fs.readdirSync(outDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !sourceSlugs.has(entry.name))
    .map((entry) => {
      const indexFile = path.join(outDir, entry.name, "index.html");
      if (!fs.existsSync(indexFile)) return null;
      const html = fs.readFileSync(indexFile, "utf8");
      const canonical = firstMatch(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)
        || firstMatch(html, /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i);
      const isAliasRoute = canonical.includes("/begriffe/")
        && !canonical.endsWith(`/begriffe/${entry.name}/`)
        && /<meta\s+name=["']robots["']\s+content=["'][^"']*\bnoindex\b/i.test(html);
      if (isAliasRoute) return null;
      const h1 = firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s*[|-]\s*Glossar.*$/i, "");
      const meta = firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i)
        || firstMatch(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["'][^>]*>/i);
      const lead = firstMatch(html, /<p[^>]*class=["'][^"']*\blead\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
      const label = h1 || title || entry.name.replace(/-/g, " ");
      const labelKey = normalizedHubConcept(label);
      if (sourceLabels.has(labelKey) || seenLegacyLabels.has(labelKey)) return null;
      seenLegacyLabels.add(labelKey);
      const summary = meta || lead || "Bestehende Glossar-Detailseite aus dem Bestand.";
      return {
        id: entry.name,
        termId: entry.name,
        slug: entry.name,
        canonicalLabel: label,
        label,
        shortDefinition: summary,
        hoverDefinition: summary,
        longDefinition: summary,
        category: "Glossar-Bestand",
        type: "Bestand",
        status: "erhaltene Detailseite",
        version: "Bestand",
        sourceDocument: "Bestehende Glossar-Detailseite",
        sourceSection: "/begriffe/",
        glossaryOrderKey: label,
        relatedTerms: [],
        _legacyDetailOnly: true,
      };
    })
    .filter(Boolean)
    .sort((a, b) => collator.compare(a.glossaryOrderKey, b.glossaryOrderKey));
}

function navMatch(item) {
  return (item.match || []).join("|");
}

function navLink(item, base) {
  return `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function footerGroup(group, base) {
  return `<div class="footer-nav-group">
      <h3>${esc(group.title)}</h3>
      <div class="footer-nav-links">
${group.items.map((item) => `          ${navLink(item, base)}`).join("\n")}
      </div>
    </div>`;
}

function renderHeader(base) {
  return headerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{HEADER_NAV}}", navigation.header.map((item) => navLink(item, base)).join("\n    "));
}

function renderFooter(base) {
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n"));
}

function pageShell(title, body, depth = "", options = {}) {
  const metaTitle = options.metaTitle || `${title} - Wirkungsökonomie`;
  const metaDescription = options.metaDescription || `Begriffsreferenz der Wirkungsökonomie: ${title}.`;
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(metaTitle)}</title>
    <meta name="description" content="${esc(metaDescription)}">
    <link rel="stylesheet" href="${depth}assets/css/style.css?v=20260601-glossary-cards">
  </head>
  <body>
${renderHeader(depth)}
    <main class="section">
${body}
    </main>
${renderFooter(depth)}
    <script src="${depth}assets/js/main.js?v=20260529-glossary-hover-audit"></script>
  </body>
</html>
`.replace(/[ \t]+$/gm, "");
}

function glossaryLegacyAlias(depth = "") {
  const target = `${depth}begriffe/`;
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="https://wirkungsoekonomie.de/begriffe/">
    <title>Weiterleitung zum vollständigen Glossar - Wirkungsökonomie</title>
    <script>
      (function () {
        var hash = window.location.hash || "";
        var match = hash.match(/^#begriff-(.+)$/);
        var destination = match ? "${target}" + match[1] + "/" : "${target}";
        window.location.replace(destination);
      })();
    </script>
  </head>
  <body>
    <main aria-labelledby="redirect-title">
      <h1 id="redirect-title">Weiterleitung zum vollständigen Glossar</h1>
      <p>Das vollständige Glossar mit Begriffsdetailseiten, Hoverdefinitionen, Suche und Querverlinkungen liegt unter <a href="${target}">/begriffe/</a>.</p>
      <p>Falls du einem alten Anker gefolgt bist, öffne den passenden Begriff über die Suche im vollständigen Glossar.</p>
    </main>
  </body>
</html>
`;
}

const legacyDetailTerms = loadLegacyDetailTerms();
const indexedTerms = [...data.terms, ...legacyDetailTerms];
const groups = new Map();
for (const term of indexedTerms) {
  const letter = (term.glossaryOrderKey || term.canonicalLabel).trim()[0].toLocaleUpperCase("de");
  if (!groups.has(letter)) groups.set(letter, []);
  groups.get(letter).push(term);
}
for (const items of groups.values()) {
  items.sort((a, b) => collator.compare(a.glossaryOrderKey || a.canonicalLabel, b.glossaryOrderKey || b.canonicalLabel));
}

const nav = Array.from(groups.keys()).sort(collator.compare);
const categories = categoryOrder.filter((category) => indexedTerms.some((term) => term.category === category));
const termsBySlug = new Map(indexedTerms.map((term) => [term.slug, term]));
const contentByUrl = new Map();
const contentBySlug = new Map();
const contentByTitle = new Map();

for (const entry of searchIndex) {
  const canonicalUrl = normalizeReferenceUrl(entry.url);
  if (!canonicalUrl) continue;
  if (!contentByUrl.has(canonicalUrl)) contentByUrl.set(canonicalUrl, entry);
  const withoutHash = canonicalUrl.split("#")[0];
  if (!contentByUrl.has(withoutHash)) contentByUrl.set(withoutHash, entry);
  const slug = slugFromReference(canonicalUrl);
  if (slug && !contentBySlug.has(slug)) contentBySlug.set(slug, entry);
  const titleKey = normalizedHubConcept(entry.title);
  if (titleKey && !contentByTitle.has(titleKey)) contentByTitle.set(titleKey, entry);
}

for (const term of indexedTerms) {
  const url = `/begriffe/${term.slug}/`;
  const entry = {
    title: term.canonicalLabel || term.label || term.slug,
    description: term.shortDefinition || term.hoverDefinition || term.longDefinition,
    url,
    type: "Glossarbegriff",
    format: "Glossarbegriff",
    section: "Glossar",
    body: [term.longDefinition, term.woekDefinition, term.classification].filter(Boolean).join(" "),
  };
  contentByUrl.set(url, entry);
  contentBySlug.set(term.slug, entry);
  contentByTitle.set(normalizedHubConcept(entry.title), entry);
}

for (const document of documentRegistry) {
  const urls = [document.onlineUrl, document.pdfUrl, document.docxUrl].filter(Boolean).map(normalizeReferenceUrl);
  const primaryUrl = urls[0] || "";
  const entry = {
    title: document.title,
    description: document.summary,
    url: primaryUrl,
    type: document.type || "Dokument",
    format: document.pdfUrl ? "PDF / Dokument" : "Dokument",
    section: document.category || "Bibliothek",
    body: document.summary || "",
    stand: document.stand,
    fileSize: document.fileSize,
  };
  if (document.id) contentBySlug.set(filterToken(document.id), entry);
  for (const url of urls) {
    if (url && !contentByUrl.has(url)) contentByUrl.set(url, entry);
  }
  const titleKey = normalizedHubConcept(document.title);
  if (titleKey && !contentByTitle.has(titleKey)) contentByTitle.set(titleKey, entry);
}

const termTargetLinks = new Map([
  ["agenda-2030", "../../verstehen/sdgs-sdgplus/geschichte/"],
  ["sdg-sdgplus-referenzrahmen", "../../verstehen/sdgs-sdgplus/"],
  ["sdg-plus", "../../verstehen/sdgs-sdgplus/#sdgplus"],
  ["sdgs", "../../verstehen/sdgs-sdgplus/"],
  ["social-taxonomy", "../../bibliothek/social-taxonomy-wirkungsoekonomie/"],
  ["positive-netto-wirkung", "../../begriffe/positive-netto-wirkung/"],
  ["woek-id", "../../werkzeuge/woek-ids/"],
  ["scorecard", "../../werkzeuge/scorecards/"],
  ["reverse-merit-order", "../../werkzeuge/reverse-merit-order/"],
  ["t-sroi", "../../werkzeuge/impact-controlling/t-sroi/"],
  ["nwi", "../../werkzeuge/netto-wirkungs-index/"],
  ["wirkungsumsatzsteuer", "../../werkzeuge/wirkungsumsatzsteuer/"],
  ["wirkungssteuer", "../../werkzeuge/wirkungssteuergesetz/"],
  ["wirkungssteuergesetz", "../../werkstatt/gesetze/wirkungssteuergesetz/"],
  ["wstg", "../../werkstatt/gesetze/wirkungssteuergesetz/"],
  ["wustg", "../../werkstatt/gesetze/wirkungsumsatzsteuergesetz/"],
  ["wirkungsrat", "../../werkzeuge/wirkungsrat/"],
  ["wirkungshaushalt", "../../werkzeuge/wirkungshaushalt/"],
  ["wirkungsdatenraum", "../../werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"],
  ["digitaler-produktpass", "../../werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"],
  ["wirkungseinkommen", "../../wirkungsfelder/arbeit-einkommen/wirkungseinkommen/"],
  ["wirkungseinkommensteuer", "../../werkzeuge/wirkungseinkommensteuer/"],
  ["grunddividende", "../../wirkungsfelder/arbeit-einkommen/wirkungseinkommen/"],
  ["wirkungsbonus", "../../wirkungsfelder/arbeit-einkommen/wirkungseinkommen/"],
  ["automatisierung", "../../wirkungsfelder/arbeit-einkommen/"],
  ["maschinenleistung", "../../wirkungsfelder/arbeit-einkommen/"],
  ["automatisierungsdividende", "../../wirkungsfelder/arbeit-einkommen/"],
  ["maschinenleistungsrueckkopplung", "../../wirkungsfelder/arbeit-einkommen/"],
  ["maschinenwertschoepfungsbeitrag", "../../erleben/automatisierungs-wirkungseinkommensrechner/"],
  ["robotersteuer", "../../wirkungsfelder/arbeit-einkommen/"],
  ["roboteroekonomie", "../../wirkungsfelder/arbeit-einkommen/"],
  ["ki-und-arbeit", "../../wirkungsfelder/arbeit-einkommen/"],
  ["robotik", "../../wirkungsfelder/arbeit-einkommen/"],
  ["autonome-systeme", "../../wirkungsfelder/arbeit-einkommen/"],
  ["plattformarbeit", "../../wirkungsfelder/arbeit-einkommen/"],
  ["erwerbsarbeitslogik", "../../wirkungsfelder/arbeit-einkommen/"],
  ["automatisierungsrendite", "../../wirkungsfelder/finanzsystem-kapital/"],
  ["produktivitaetsgewinne", "../../wirkungsfelder/arbeit-einkommen/"],
  ["produktivitaetssteuer", "../../begriffe/automatisierungsdividende/"],
  ["bedingungsloses-grundeinkommen", "../../begriffe/wirkungseinkommen/"],
  ["wirkungsrente", "../../wirkungsfelder/rente-soziale-sicherung/"],
  ["wirkungsbiografie", "../../wirkungsfelder/rente-soziale-sicherung/"],
  ["lebenswirkung", "../../wirkungsfelder/rente-soziale-sicherung/"],
  ["sozialabgaben", "../../wirkungsfelder/rente-soziale-sicherung/"],
  ["sozialfinanzierung", "../../wirkungsfelder/rente-soziale-sicherung/"],
  ["rentenfinanzierung", "../../wirkungsfelder/rente-soziale-sicherung/"],
  ["beitragsluecke", "../../wirkungsfelder/rente-soziale-sicherung/"],
  ["wohnwirkung", "../../wirkungsfelder/wohnen-stadt/"],
  ["warmmietenneutralitaet", "../../wirkungsfelder/wohnen-stadt/"],
  ["wix-vi", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["wirkungsvermietung", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["stranded-assets", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["spekulationslogik", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["csrd", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"],
  ["esrs", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"],
  ["eu-taxonomie", "../../wirkungsfelder/finanzsystem-kapital/"],
  ["esg", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"],
  ["wirkungsschule", "../../wirkungsfelder/bildung/wirkungsschule/"],
  ["wirkungspaedagogik", "../../wirkungsfelder/bildung/wirkungspaedagogik/"],
  ["wirkungskompetenz", "../../wirkungsfelder/bildung/demokratie-medien-wirkungskompetenz/"],
  ["wirkungsorientiertes-hosting", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"],
  ["resonanzarchitektur", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/#16-hosts-als-resonanzarchitekt-innen"],
  ["host-wirkungsscore", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/#23-neun-wirkungsfelder-des-host-wirkungsscores"],
]);

const relatedContentTargets = new Map([
  ["faktencheck-folgencheck-v1-1", ["Faktencheck und Folgencheck - Methodenseite", "../../werkstatt/arbeitsbibliothek/whitepaper/faktencheck-folgencheck/"]],
  ["folgencheck-wirkungspolitische-sprache-v0-1", ["Folgencheck statt Faktencheck", "../../bibliothek/folgencheck-wirkungspolitische-sprache/"]],
  ["wstg-oktober-2025", ["Wirkungssteuergesetz WStG", "../../dokumente/wstg-oktober-2025/"]],
  ["technische-leitlinien-wustg", ["Technische Leitlinien WUStG", "../../dokumente/technische-leitlinien-wustg-v2/"]],
  ["technische-leitlinien-wustg-v2", ["Technische Leitlinien WUStG", "../../dokumente/technische-leitlinien-wustg-v2/"]],
  ["beispiel-apfel-wirkungssteuer-bonusregel", ["Apfelbeispiel Wirkungssteuer", "../../dokumente/beispiel-apfel-wirkungssteuer-bonusregel/"]],
  ["woek-master-items", ["WÖk Master Items final v1.2", "../../dokumente/woek-master-items-final-v1-2/"]],
  ["woek-master-items-register", ["WÖk Master Items final v1.2", "../../dokumente/woek-master-items-final-v1-2/"]],
  ["nachhaltiges-marketing-mix", ["Nachhaltiges Marketing-Mix", "../../bibliothek/nachhaltiges-marketing-mix/"]],
  ["nachhaltiger-einzelhandel", ["Nachhaltiger Einzelhandel", "../../bibliothek/nachhaltiger-einzelhandel/"]],
  ["nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen", ["Nachhaltigkeitsstrategie für mittelständische Beratungsunternehmen", "../../bibliothek/nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen/"]],
  ["nachhaltigkeitstransformation-im-handwerk", ["Nachhaltigkeitstransformation im Handwerk", "../../bibliothek/nachhaltigkeitstransformation-im-handwerk/"]],
  ["arbeitspapier-doppelte-wesentlichkeit-impact-controlling", ["Arbeitspapier Doppelte Wesentlichkeit", "../../dokumente/arbeitspapier-doppelte-wesentlichkeit-impact-controlling/"]],
  ["doppelte-wesentlichkeit-impact-controlling", ["Arbeitspapier Doppelte Wesentlichkeit", "../../dokumente/arbeitspapier-doppelte-wesentlichkeit-impact-controlling/"]],
  ["von-der-pigou-steuer-zur-wirkungsoekonomie", ["Von der Pigou-Steuer zur Wirkungsökonomie", "../../blog/linkedin/2025-12-22-von-der-pigou-steuer-zur-wirkungsokonomie.html"]],
  ["scorecard", ["Scorecards", "../../werkzeuge/scorecards/"]],
  ["scorecards", ["Scorecards", "../../werkzeuge/scorecards/"]],
  ["reverse-merit-order", ["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"]],
  ["nwi", ["Netto-Wirkungs-Index", "../../werkzeuge/netto-wirkungs-index/"]],
  ["netto-wirkungs-index", ["Netto-Wirkungs-Index", "../../werkzeuge/netto-wirkungs-index/"]],
  ["wirkungssteuer", ["Wirkungssteuer", "../../werkzeuge/wirkungssteuergesetz/"]],
  ["wirkungssteuergesetz", ["Wirkungssteuergesetz", "../../werkzeuge/wirkungssteuergesetz/"]],
  ["wirkungsumsatzsteuer", ["Wirkungsumsatzsteuer", "../../werkzeuge/wirkungsumsatzsteuer/"]],
  ["produktwirkungsrechner", ["Produktwirkungsrechner", "../../erleben/produktwirkungsrechner/"]],
  ["impact-controlling-rechner", ["Impact-Controlling-Rechner", "../../erleben/impact-controlling-rechner/"]],
  ["impact-management", ["Impact-Management", "../../begriffe/impact-management/"]],
  ["impact-controlling", ["Impact-Controlling", "../../begriffe/impact-controlling/"]],
  ["impact-marketing", ["Impact-Marketing", "../../begriffe/impact-marketing/"]],
  ["impact-materiality", ["Impact Materiality", "../../begriffe/impact-materiality/"]],
  ["financial-materiality", ["Financial Materiality", "../../begriffe/financial-materiality/"]],
  ["key-impact-indicator", ["Key Impact Indicator / KII", "../../begriffe/key-impact-indicator/"]],
  ["produkte-konsum", ["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]],
  ["staat-recht-demokratie", ["Staat, Recht & Demokratie", "../../wirkungsfelder/staat-recht-demokratie/"]],
  ["finanzsystem-kapital", ["Finanzsystem & Kapital", "../../wirkungsfelder/finanzsystem-kapital/"]],
  ["woek-id-register", ["WÖk-ID Register", "../../woek-id-register/"]],
  ["wirkungsrueckkopplung", ["Wirkungsrückkopplung", "../../begriffe/wirkungsrueckkopplung/"]],
  ["scorecards-nwi-reverse-merit-order", ["Scorecards, NWI & Reverse Merit Order", "../../akademie.html"]],
  ["wirkungscontrolling-detailkonzept-dossier-v1-0", ["Wirkungscontrolling / Impact Controlling", "../../werkzeuge/impact-controlling/dossiers/wirkungscontrolling/"]],
  ["wirkungscontrolling-detailkonzept-dossier", ["Wirkungscontrolling / Impact Controlling", "../../werkzeuge/impact-controlling/dossiers/wirkungscontrolling/"]],
]);

function termLink(slug) {
  const term = termsBySlug.get(slug);
  if (!term) return `<span class="term-chip muted">${esc(slug)}</span>`;
  return `<a class="term-chip" href="../../begriffe/${esc(term.slug)}/">${esc(term.canonicalLabel)}</a>`;
}

function listItems(values, fallback = "Keine Einträge") {
  if (!Array.isArray(values) || values.length === 0) return `<p>${esc(fallback)}</p>`;
  return `<ul class="clean-list">${values.map((value) => `<li>${esc(value)}</li>`).join("")}</ul>`;
}

function paragraphs(value) {
  return String(value || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${esc(part)}</p>`)
    .join("");
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

function filterToken(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("de")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dimensionTokens(value) {
  const raw = String(value || "").toLocaleLowerCase("de");
  const tokens = [filterToken(value)];
  if (raw.includes("mensch")) tokens.push("mensch");
  if (raw.includes("planet")) tokens.push("planet");
  if (raw.includes("demokratie")) tokens.push("demokratie");
  return Array.from(new Set(tokens.filter(Boolean)));
}

function filterValues(field) {
  const values = new Set();
  for (const term of indexedTerms) {
    for (const value of asList(term[field])) values.add(value);
  }
  return Array.from(values).sort(new Intl.Collator("de", { sensitivity: "base" }).compare);
}

function filterButtons(name, label, values) {
  if (!values.length) return "";
  return `<fieldset class="glossary-filter-group" data-filter-group="${esc(name)}">
          <legend>${esc(label)}</legend>
          <div class="filter-chip-row">
            ${values.map((value) => `<button type="button" data-filter-name="${esc(name)}" data-filter-value="${esc(filterToken(value))}" aria-pressed="false">${esc(value)}</button>`).join("")}
          </div>
        </fieldset>`;
}

function curatedFilterButtons(name, label, options) {
  if (!options.length) return "";
  return `<fieldset class="glossary-filter-group curated" data-filter-group="${esc(name)}">
          <legend>${esc(label)}</legend>
          <div class="filter-chip-row">
            ${options.map(([optionLabel, value]) => `<button type="button" data-filter-name="${esc(name)}" data-filter-value="${esc(value)}" aria-pressed="false">${esc(optionLabel)}</button>`).join("")}
          </div>
        </fieldset>`;
}

function termFilterData(term) {
  return {
    type: filterToken(term.type || term.begriffstyp || term.conceptStatus || term.concept_status || term.category),
    theme: asList(term.theme || term.themes).map(filterToken),
    dimension: asList(term.dimensions).flatMap(dimensionTokens),
    wirklogik: asList(term.wirklogik).map(filterToken),
    field: asList(term.applicationFields || term.application_fields).map(filterToken),
    source: asList(term.sourceField || term.source_field).map(filterToken),
  };
}

function dataAttrList(values) {
  return esc(asList(values).join(" "));
}

function termBadges(term) {
  const badges = unique([
    term.type || term.begriffstyp || term.conceptStatus || term.concept_status || term.category,
    ...asList(term.theme || term.themes).slice(0, 2),
    ...asList(term.dimensions).slice(0, 1),
  ]).slice(0, 5);
  return `<div class="term-card-tags">${badges.map((badge) => `<span>${esc(badge)}</span>`).join("")}</div>`;
}

function parseSource(value) {
  if (value && typeof value === "object") {
    return {
      label: value.title || value.label || "Quelle",
      url: value.url || value.href || "",
      type: value.source_type || value.sourceType || "",
      status: value.status || "",
    };
  }
  const [label, url] = String(value || "").split("|");
  return {
    label: label?.trim() || "Quelle",
    url: url?.trim() || "",
    type: "",
    status: "",
  };
}

function sourceList(term) {
  const rows = [
    ...((term.sourceLinks || term.source_links || []).map(parseSource)),
    ...((term.officialSources || []).map(parseSource)),
  ].filter((item, index, all) => item.label && all.findIndex((candidate) => `${candidate.label}|${candidate.url}` === `${item.label}|${item.url}`) === index);
  if (!rows.length) return `<p>Keine externe Quelle hinterlegt.</p>`;
  return `<ul class="clean-list">${rows.slice(0, 8).map((item) => {
    const label = item.type ? `${item.label} (${item.type})` : item.label;
    return item.url ? `<li><a class="text-link" href="${esc(item.url)}">${esc(label)}</a></li>` : `<li>${esc(label)}</li>`;
  }).join("")}</ul>`;
}

const centralTermDetails = new Map([
  ["faktencheck", ["Er verhindert, dass falsche Zahlen, manipulierte Quellen oder aus dem Kontext gerissene Aussagen als Grundlage für Entscheidungen dienen.", "Ein Faktencheck erklärt noch nicht, welche gesellschaftlichen Folgen eine richtige oder falsche Aussage auslösen kann.", "Eine Statistik wird auf Quelle, Zeitraum, Methode und Kontext geprüft, bevor sie in einer Debatte verwendet wird.", ["Richtig heißt nicht folgenlos.", "Ein Faktencheck ersetzt keine Wirkungsanalyse."], [["WÖk-Scanner", "../../anwendungen/scanner.html"], ["Medienwirkungscheck", "../../erleben/medienwirkungscheck/"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["folgencheck", ["Er macht Wirkungspotenziale sichtbar, bevor Schäden, Nebenwirkungen oder Systemfolgen vollständig eingetreten sind.", "Ein Folgencheck ist keine Zensur und keine nachträgliche Schadensbilanz.", "Vor einer Kampagne wird geprüft, welche Wirkstoffe, Wirkungspfade und Resonanzräume Polarisierung, Schutzverhalten oder Fehlanreize auslösen können.", ["Folgencheck ist ex ante.", "Er bewertet Wirkungspotenziale, nicht Menschen."], [["WÖk-Scanner", "../../anwendungen/scanner.html"], ["Medienwirkungscheck", "../../erleben/medienwirkungscheck/"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["idgs", ["Sie zeigen, welche Fähigkeiten Menschen und Organisationen brauchen, um Ziele verantwortlicher umzusetzen.", "IDGs sind kein Ersatz für SDGs oder SDG+ und kein dritter Zielkatalog der WÖk.", "Eine Akademie-Einheit kann SDG-Ziele mit Wirkungskompetenz, Reflexion, Zusammenarbeit und Urteilsfähigkeit verbinden.", ["Kompetenzen sind keine Ziele.", "IDGs ersetzen SDG+ nicht."], [["Akademie", "../../akademie.html"], ["Wirkungsschule-Check", "../../erleben/wirkungsschule-check/"]], [["Bildung", "../../wirkungsfelder/bildung/"]]]],
  ["wirkung", ["Sie macht sichtbar, ob sich Zustände tatsächlich verändern, statt nur Aktivität, Geld oder Reichweite zu zählen.", "Nicht jede Wirkung ist positiv. Der Begriff ist neutral und braucht Bewertung.", "Ein billiges Produkt kann verkauft werden und trotzdem Wasser, Gesundheit oder Arbeitsrechte belasten.", ["Wirkung ist kein Gütesiegel.", "Wirkung ersetzt keine demokratische Entscheidung."], [["Kompass", "../../kompass.html"], ["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Wirkungsfelder", "../../wirkungsfelder/"]]]],
  ["wirkungspotenzial", ["Es hilft, frühe Hinweise zu Wirkungspfaden zu erkennen, ohne eine endgültige Bewertung vorzutäuschen.", "Potenzial ist keine Faktenprüfung, keine Zertifizierung und kein fertiger Score.", "Ein Medienbeitrag kann Polarisierungspotenzial haben, ohne dass jede Reaktion vorhergesagt wird.", ["Potenzial ist nicht Ergebnis.", "Ein Prüfhinweis ist kein Urteil."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["positive-netto-wirkung", ["Sie verhindert, dass einzelne gute Effekte schwere Schäden überdecken.", "Positive Netto-Wirkung ist keine Schönrechnung und kein einfacher Durchschnitt.", "Ein klimafreundliches Produkt kann wegen schwerer Arbeitsrechtsprobleme trotzdem kritisch bleiben.", ["Netto heißt nicht, dass alles verrechnet werden darf.", "Wirkungsgrenzen bleiben wirksam."], [["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"], ["Scorecards", "../../werkzeuge/scorecards/"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["wirkungsrueckkopplung", ["Sie macht Wirkung entscheidungsrelevant, indem sie in Preise, Budgets, Kapital oder Regeln zurückgeführt wird.", "Sie ist keine zentrale Planwirtschaft und keine automatische Entscheidung.", "Eine Produktsteuer kann steigen oder sinken, wenn geprüfte Produktwirkung schlechter oder besser wird.", ["Rückkopplung ist nicht nur Strafe.", "Rechtsschutz und demokratische Kontrolle bleiben nötig."], [["Wirkungsumsatzsteuer", "../../werkzeuge/wirkungsumsatzsteuer/"], ["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungsblindheit", ["Sie erklärt, warum schädliche Folgen wirtschaftlich erfolgreich erscheinen können.", "Wirkungsblindheit ist kein Absichtsvorwurf gegen einzelne Personen.", "Ein Algorithmus optimiert Klicks und übersieht Vertrauen, Diskursqualität oder Polarisierung.", ["Blindheit heißt nicht, dass keine Wirkung existiert.", "Sie heißt: Die Wirkung fehlt im Steuerungssystem."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Digitalisierung & KI", "../../portale/digitalisierung-ki-wirkungsdatenraeume/"]]]],
  ["reverse-merit-order", ["Sie schützt vor dem Schönrechnen schwerer Schäden durch gute Werte an anderer Stelle.", "Sie ist kein einfacher Durchschnitt und keine Strafliste.", "Gute Klimawerte heben schwere Kinderrechtsverletzungen in einer Lieferkette nicht auf.", ["Nicht jede Schwäche blockiert alles.", "Entscheidend sind definierte Wirkungsgrenzen."], [["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"], ["Produktwirkung testen", "../../erleben.html#simulator"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["social-taxonomy", ["Sie macht soziale Wirkung in Märkten entscheidungsfähig: Arbeit, Grundversorgung, Teilhabe, Gemeinschaften und Demokratie werden nicht nur berichtet, sondern prüfbar eingeordnet.", "Social Taxonomy ist Stand 27. Mai 2026 kein verbindliches eigenständiges EU-Rechtsinstrument und keine Personenbewertung.", "Ein Wohnprojekt wird nach Energie, Bezahlbarkeit, Verdrängungsrisiko, Gesundheit, Beteiligung und lokaler Wirkung betrachtet.", ["Nicht mit EU-Umwelt-Taxonomie verwechseln.", "Keine Social-Credit-Logik.", "Positive soziale Beiträge ersetzen keine roten Linien."], [["Scorecards", "../../werkzeuge/scorecards/"], ["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"]], [["Finanzsystem & Kapital", "../../wirkungsfelder/finanzsystem-kapital/"], ["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"]]]],
  ["nwi", ["Er verdichtet Wirkungsdimensionen zu Orientierung, ohne Detailprüfung zu ersetzen.", "Der NWI ist kein ESG-Rating und keine amtliche Zertifizierung.", "Ein Projekt kann einen NWI als Übersicht erhalten, während kritische Einzelfelder separat sichtbar bleiben.", ["Ein Index ist keine Wahrheitstabelle.", "Datenqualität bleibt entscheidend."], [["NWI Methodik", "../../werkzeuge/netto-wirkungs-index/"], ["Impact Controlling", "../../werkzeuge/impact-controlling/"]], [["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/"]]]],
  ["t-sroi", ["Er macht vermiedene Schäden, Transformation und Stabilität als Investitionslogik diskutierbar.", "T-SROI ist keine sichere Renditeprognose und keine Anlageberatung.", "Prävention kann Folgekosten vermeiden, obwohl Kosten und Nutzen in verschiedenen Haushalten liegen.", ["Monetarisierung ist Hilfssprache.", "Unsicherheit muss sichtbar bleiben."], [["T-SROI", "../../werkzeuge/impact-controlling/t-sroi/"]], [["Gesundheit & Pflege", "../../wirkungsfelder/gesundheit-pflege/"]]]],
  ["woek-id", ["Sie macht Indikatoren nachvollziehbar, versioniert und prüfbar.", "Eine WÖk-ID ist keine Personen-ID und kein Trackinginstrument.", "Ein Wasserindikator braucht Einheit, Quelle, Zeitraum, Schwelle und Bewertungslogik.", ["Die ID bewertet nicht selbst.", "Sie macht die Datenbasis prüfbar."], [["WÖk-IDs", "../../werkzeuge/woek-ids/"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["scorecard", ["Sie zeigt starke, schwache und kritische Wirkungsfelder nebeneinander.", "Eine Scorecard ist kein Urteil über Menschen und kein endgültiges Gütesiegel.", "Eine Produktscorecard kann Klima, Wasser, Arbeit, Gesundheit und Kreislauf getrennt darstellen.", ["Der Gesamtscore darf Schwachstellen nicht verdecken.", "Scorecards brauchen Interpretation."], [["Scorecards", "../../werkzeuge/scorecards/"], ["Produktwirkung testen", "../../erleben.html#simulator"]], [["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/"]]]],
  ["wirkungseinkommen", ["Es zeigt, wie Einkommen und Teilhabe auch jenseits reiner Erwerbsarbeit gedacht werden können.", "Es ist kein fertiges Grundeinkommen und keine Finanzierungszusage.", "Automatisierte Wertschöpfung kann modellhaft in Fonds, Weiterbildung und Einkommensanteile zurückgeführt werden.", ["Das Tool erzeugt kein Geld.", "Es zeigt Rückkopplungslogik, keine amtlichen Ansprüche."], [["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungsfonds", ["Er bündelt Rückflüsse, damit Prävention, Bildung, Transformation oder Sicherung finanzierbar werden.", "Ein Wirkungsfonds ist kein Geld aus dem Nichts und kein Schattenhaushalt.", "Rückflüsse aus automatisierter Wertschöpfung können Weiterbildung und Übergangsschutz finanzieren.", ["Fonds ersetzen keine Haushaltsentscheidungen.", "Finanzierungsquellen müssen offen bleiben."], [["Wirkungsfonds", "../../werkzeuge/wirkungsfonds/"], ["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungshaushalt", ["Er zeigt, ob öffentliche Mittel Zustände verbessern oder nur ausgegeben werden.", "Ein Wirkungshaushalt ersetzt keine Parlamente und kein Haushaltsrecht.", "Vermiedene Krankheit kann als Präventionswirkung in Haushalten sichtbar werden.", ["Wirkungshaushalte brauchen Evaluation.", "Grundrechte dürfen nicht durch Kennzahlen ersetzt werden."], [["Wirkungshaushalt", "../../werkzeuge/wirkungshaushalt/"]], [["Gesundheit & Pflege", "../../wirkungsfelder/gesundheit-pflege/"]]]],
  ["wirkungsdatenraum", ["Er macht Wirkung prüfbar, ohne Datenschutz und Zweckbindung aufzugeben.", "Ein Wirkungsdatenraum ist kein ungeschützter Datenpool und kein Personen-Scoring.", "Ein Produktpass kann Klima- und Lieferkettendaten bereitstellen, ohne personenbezogene Daten offenzulegen.", ["Mehr Daten sind nicht automatisch bessere Wirkung.", "Rechte und Datenqualität sind Teil der Wirkung."], [["Digitale Produktpässe", "../../werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"]], [["Digitalisierung & KI", "../../portale/digitalisierung-ki-wirkungsdatenraeume/"]]]],
  ["wirkungsschule", ["Sie macht Schule als Wirkungsraum sichtbar: Unterricht, Raum, Beziehung, Bewertung, Förderung, Gesundheit, digitale Kultur und Demokratiepraxis wirken zusammen.", "Wirkungsschule ist keine neue Schulform, kein Ranking und kein Modell zur Bewertung einzelner Kinder, Familien oder Lehrkräfte.", "Ein Schulhof-Hitze-Projekt verbindet Messung, Beteiligung, Gesundheit, Stadtklima, Kostenvergleich und demokratische Entscheidung.", ["Keine Kinder-Scores.", "Daten verbessern Lernbedingungen, nicht Personenrankings."], [["Wirkungsschule-Check", "../../erleben/wirkungsschule-check/"], ["Wirkungsportfolio-Generator", "../../erleben/wirkungsportfolio-generator/"]], [["Bildung", "../../wirkungsfelder/bildung/"], ["Arbeitsbibliothek Bildung", "../../werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/"]]]],
  ["wirkungspaedagogik", ["Sie beschreibt Lernen als gestaltete Zustandsveränderung von Verstehen, Können, Haltung, Beziehung und Handlungsfähigkeit.", "Wirkungspädagogik ist keine Moralisierung, kein Gesinnungsunterricht und keine Projektbeliebigkeit ohne Fachlichkeit.", "Ein Fach-Zukunft-Modul verbindet fachliche Perspektiven mit einer realen Wirkungsfrage und einer reflektierten Handlung.", ["Fachlichkeit bleibt Grundlage.", "Wirkung ersetzt keine pädagogische Freiheit."], [["Fach-Zukunft-Modulgenerator", "../../erleben/fach-zukunft-generator/"], ["Wirkungsportfolio-Generator", "../../erleben/wirkungsportfolio-generator/"]], [["Bildung", "../../wirkungsfelder/bildung/"], ["Wirkungsschule", "../../wirkungsfelder/bildung/wirkungsschule/"]]]],
  ["wirkungskompetenz", ["Sie macht Menschen und Organisationen fähig, Folgen, Zielkonflikte, Nebenwirkungen, Rückkopplungen und Datenqualität zu verstehen.", "Wirkungskompetenz ist keine Ideologie, keine zentrale Wissensverwaltung und kein Personen-Score.", "Schüler:innen lernen im Schulhof-Hitze-Projekt zu unterscheiden, ob ein Projekt nur Output erzeugt oder Zustände für Lernen, Gesundheit und Teilhabe verbessert.", ["Kompetenz heißt nicht Kontrolle.", "Sie stärkt Urteilskraft, Teilhabe und Korrekturfähigkeit."], [["Akademie", "../../akademie.html"], ["Wirkungsschule-Check", "../../erleben/wirkungsschule-check/"]], [["Bildung", "../../wirkungsfelder/bildung/"]]]],
  ["wirkungsorientiertes-hosting", ["Es macht Reichweite, Gästeauswahl, Chat, Plattformpfad, Clip-Kontext und Korrektur als gestaltbaren Wirkungsraum sichtbar.", "Es ist keine Zensur, keine Gesinnungsprüfung und kein Benimmkatalog.", "Ein Host markiert eine Gesundheitsbehauptung als unbelegt, nennt Quellenstatus und ergänzt eine Korrektur nach der Sendung.", ["Bewertet werden Bedingungen, nicht Menschen.", "Korrektur ist Teil der Wirkung."], [["Medienwirkungscheck", "../../erleben/medienwirkungscheck/"], ["Wirkungsräume gestalten", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["resonanzarchitektur", ["Sie zeigt, dass ein Format durch Frage, Gäste, Redezeit, Humor, Chatregeln, Titel, Clips und Nachbereitung Resonanzen formt.", "Resonanzarchitektur ist keine Manipulationsstrategie und keine reine Reichweitenoptimierung.", "Ein Talkformat plant vorab, wann Falschbehauptungen gestoppt, welche Quellen gezeigt und wie Clips kontextualisiert werden.", ["Dramaturgie ist nicht automatisch Wirkung.", "Resonanz braucht Korrekturwege."], [["Wirkungsräume gestalten", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["host-wirkungsscore", ["Er macht Lernpunkte eines Formats sichtbar: Quellenklarheit, Tonalität, Diskursführung, Community, Schutz und Korrektur.", "Der Score ist kein Personenrating, kein Wahrheitsmonopol und keine automatische Sperrlogik.", "Eine Redaktion bewertet nach einem Stream, ob der Clip-Kontext die Gesamtbotschaft verzerrt und ob der Chat geschützt wurde.", ["Scorecards brauchen Interpretation.", "Rote Linien dürfen nicht durch Reichweite kompensiert werden."], [["Scorecards", "../../werkzeuge/scorecards/"], ["Wirkungsräume gestalten", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["wirkstoff", ["Er hilft, Auslöser wie Gesetze, Preise, Produkte, Narrative oder Algorithmen früh als mögliche Wirkungsauslöser zu untersuchen.", "Wirkstoff ist eine didaktische Analogie und kein medizinischer oder naturwissenschaftlicher Nachweis.", "Ein Rabatt, eine Schlagzeile oder ein Algorithmus kann als gesellschaftlicher Wirkstoff geprüft werden: Was kann er auslösen?", ["Wirkstoff ist nicht Wirkung.", "Ein Auslöser braucht Kontext, Pfad und Raum."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"], ["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["wirkungsraum", ["Er begrenzt die Frage, wo eine Handlung, ein Produkt oder eine Aussage Folgen entfalten kann.", "Ein Wirkungsraum ist keine Zielgruppe und kein Marktsegment.", "Eine Mietregel wirkt im Wohnraum, im kommunalen Haushalt, im Quartier und auf Vertrauen in Institutionen.", ["Räume überlappen.", "Der relevante Wirkungsraum muss begründet werden."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Wohnen & Stadt", "../../wirkungsfelder/wohnen-stadt/"], ["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["wirkungspfad", ["Er macht Annahmen nachvollziehbar: Was löst was unter welchen Bedingungen aus?", "Ein Wirkungspfad ist noch kein Kausalnachweis und kein endgültiges Urteil.", "Eine Produktinformation kann Aufmerksamkeit erzeugen, Kaufentscheidungen verändern und Lieferkettenanreize verschieben.", ["Pfad heißt nicht Beweis.", "Datenqualität und Unsicherheit gehören dazu."], [["WÖk-Scanner", "../../anwendungen/scanner.html"], ["Scorecards", "../../werkzeuge/scorecards/"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
]);

function linkedChips(items, fallback = "Keine Einträge") {
  if (!Array.isArray(items) || items.length === 0) return `<p>${esc(fallback)}</p>`;
  return `<div class="term-chip-row">${items.map(([label, href]) => `<a class="term-chip" href="${esc(href)}">${esc(label)}</a>`).join("")}</div>`;
}

const documentsById = new Map(documentRegistry.map((document) => [document.id, document]));

function relativeFromGlossary(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `../..${String(url).startsWith("/") ? url : `/${url}`}`;
}

function labelForContentType(type, url = "") {
  const raw = String(type || "").toLocaleLowerCase("de");
  const pathName = String(url || "").toLocaleLowerCase("de");
  if (raw.includes("glossar") || pathName.startsWith("/begriffe/")) return "Glossarbegriff";
  if (raw.includes("blog")) return "Journalartikel";
  if (raw.includes("journal")) return "Journalartikel";
  if (raw.includes("whitepaper")) return "Whitepaper";
  if (raw.includes("working")) return "Working Paper";
  if (raw.includes("manifest")) return "Manifest";
  if (raw.includes("leitbild")) return "Leitbild";
  if (raw.includes("gesetz")) return "Gesetzesentwurf";
  if (raw.includes("methode")) return "Methode";
  if (raw.includes("referenz") || raw.includes("book") || pathName.startsWith("/referenz/kapitel-")) return "Online-Buch-Kapitel";
  if (raw.includes("pdf") || pathName.endsWith(".pdf")) return "PDF";
  if (raw.includes("dokument") || pathName.startsWith("/dokumente/") || pathName.startsWith("/bibliothek/")) return "Dokument";
  if (pathName.startsWith("/werkzeuge/")) return "Methode";
  if (pathName.startsWith("/akademie")) return "Akademie";
  if (pathName.startsWith("/wirkungsfelder/")) return "Wirkungsfeld";
  if (raw === "page") return "Website";
  return type || "Website";
}

function chapterMetaFromUrl(url) {
  const match = String(url || "").match(/\/referenz\/kapitel-(\d+)-([^/#]+)\//i);
  if (!match) return {};
  return {
    chapterNumber: String(Number(match[1])),
    extentLabel: `Kapitel ${Number(match[1])}`,
  };
}

function scopeLabelFor(entry, url) {
  const section = textFromHtml(entry.section || entry.sourceSection || "");
  const chapter = chapterMetaFromUrl(url);
  if (chapter.chapterNumber) return "Grundlagenkapitel";
  if (section && !/^(blog|referenz|glossar)$/i.test(section)) return section;
  if (entry.stand) return `Stand ${entry.stand}`;
  return "";
}

function extentLabelFor(entry, url) {
  const chapter = chapterMetaFromUrl(url);
  if (chapter.extentLabel) return chapter.extentLabel;
  if (entry.fileSize && String(url).match(/\.(pdf|docx)$/i)) return `Datei · ${entry.fileSize}`;
  if (String(url).endsWith(".pdf")) return "PDF";
  return readingTimeFromBody(entry.body);
}

function resolveContentReference(input, options = {}) {
  const raw = typeof input === "object" && input
    ? input.url || input.href || input.pageUrl || input.onlineUrl || input.id || input.slug || input.title || input.label || ""
    : input;
  const rawText = String(raw || "").trim();
  if (!rawText || /^\[object Object\]$/i.test(rawText)) {
    warnContentReference("unresolved-reference", rawText || "[empty]", "Leerer oder technischer Verweis");
    return null;
  }
  const canonicalUrl = normalizeReferenceUrl(rawText);
  const slug = slugFromReference(rawText);
  const titleKey = normalizedHubConcept(rawText);
  const entry = contentByUrl.get(canonicalUrl)
    || contentByUrl.get(canonicalUrl.split("#")[0])
    || contentBySlug.get(slug)
    || contentByTitle.get(titleKey);
  if (!entry && relatedContentTargets.has(slug)) {
    const [title, href] = relatedContentTargets.get(slug);
    const canonicalTarget = normalizeReferenceUrl(href);
    const mappedEntry = contentByUrl.get(canonicalTarget) || contentByUrl.get(canonicalTarget.split("#")[0]);
    if (mappedEntry) return resolveContentReference(canonicalTarget, { ...options, fallbackTitle: title });
    return {
      url: canonicalTarget || href,
      canonicalUrl: canonicalTarget || href,
      title: cleanReferenceTitle(title),
      description: options.description || "Redaktionelle Glossarquelle oder interne Arbeitsgrundlage dieses Begriffs.",
      contentTypeLabel: options.contentTypeLabel || "Quelle",
      scopeLabel: options.scopeLabel || "",
      extentLabel: options.extentLabel || "",
      relevanceReason: options.relevanceReason || "",
      isFallback: true,
    };
  }
  if (!entry) {
    if (options.allowTextFallback) {
      return {
        url: "",
        canonicalUrl: rawText,
        title: cleanReferenceTitle(options.fallbackTitle || rawText),
        description: options.description || "Redaktionelle Glossarquelle oder interne Arbeitsgrundlage dieses Begriffs.",
        contentTypeLabel: options.contentTypeLabel || "Quelle",
        scopeLabel: options.scopeLabel || "",
        extentLabel: options.extentLabel || "",
        relevanceReason: options.relevanceReason || "",
        isFallback: true,
      };
    }
    const fallbackTitle = options.fallbackTitle || humanizeSlug(rawText);
    warnContentReference("unresolved-reference", rawText, fallbackTitle ? "Fallback-Karte aus Eingabe erzeugt" : "Kein Titel gefunden");
    if (!fallbackTitle) return null;
    const description = "Interner Inhaltsverweis ohne gepflegte Metadaten. Bitte Titel, Art und Kurzbeschreibung im Content-Register ergänzen.";
    return {
      url: canonicalUrl || rawText,
      canonicalUrl: canonicalUrl || rawText,
      title: fallbackTitle,
      description,
      contentTypeLabel: "Website",
      scopeLabel: "",
      extentLabel: "",
      relevanceReason: options.relevanceReason || "",
      isFallback: true,
    };
  }

  const url = normalizeReferenceUrl(entry.url || canonicalUrl || rawText);
  const title = cleanReferenceTitle(options.title || entry.title || entry.headline || entry.documentTitle || entry.sourceTitle || options.fallbackTitle) || humanizeSlug(rawText);
  if (isSlugLike(title)) warnContentReference("visible-slug-title", rawText, title);
  const description = trimDescription(entry.description || entry.summary || entry.excerpt || options.description || entry.body, 240);
  if (!description) warnContentReference("missing-description", url || rawText, title);
  const contentTypeLabel = options.contentTypeLabel || labelForContentType(entry.contentType || entry.type || entry.format, url);
  const scopeLabel = options.scopeLabel || scopeLabelFor(entry, url);
  const extentLabel = options.extentLabel || extentLabelFor(entry, url);
  const reference = {
    url: options.href ? relativeFromGlossary(normalizeReferenceUrl(options.href)) : relativeFromGlossary(url || rawText),
    canonicalUrl: url || canonicalUrl || rawText,
    title,
    description: description || "Kurzbeschreibung fehlt noch im Content-Register.",
    contentTypeLabel,
    scopeLabel,
    extentLabel,
    date: options.date || entry.date || "",
    relevanceReason: options.relevanceReason || "",
  };
  contentReferenceRecords.push({
    target: rawText,
    url: reference.canonicalUrl,
    title: reference.title,
    contentType: reference.contentTypeLabel,
    hasDescription: Boolean(description),
    warnings: contentReferenceWarnings.filter((warning) => warning.target === rawText || warning.target === reference.canonicalUrl).map((warning) => warning.type),
  });
  return reference;
}

function contentReferenceCard(reference, options = {}) {
  if (!reference) return "";
  const meta = unique([
    reference.contentTypeLabel,
    reference.scopeLabel,
    reference.extentLabel,
    reference.date,
  ]).join(" · ");
  const badge = options.badge ? `<span class="content-reference-card__badge">${esc(options.badge)}</span>` : "";
  const titleHtml = reference.url
    ? `<a class="content-reference-card__title" href="${esc(reference.url)}">${esc(reference.title)}</a>`
    : `<span class="content-reference-card__title">${esc(reference.title)}</span>`;
  return `<article class="content-reference-card">
              ${badge}
              <h4 class="content-reference-card__heading">${titleHtml}</h4>
              ${meta ? `<div class="content-reference-card__meta">${esc(meta)}</div>` : ""}
              <p class="content-reference-card__description">${esc(reference.description)}</p>
              ${reference.relevanceReason ? `<p class="content-reference-card__reason">${esc(reference.relevanceReason)}</p>` : ""}
            </article>`;
}

function contentReferenceGroup(title, references, options = {}) {
  const cards = asList(references).map((reference) => contentReferenceCard(reference, options)).filter(Boolean);
  if (!cards.length) return "";
  return `<section class="term-section-card related-documents-card">
            <h3>${esc(title)}</h3>
            <div class="related-document-list content-reference-list">${cards.join("")}</div>
          </section>`;
}

function relationChip(value) {
  const raw = typeof value === "object" && value
    ? {
        key: value.id || value.slug || value.termId || value.label || value.title || value.name || "",
        label: value.label || value.title || value.name || value.id || value.slug || value.termId || "Verwandter Inhalt",
        href: value.href || value.url || "",
      }
    : { key: value, label: value, href: "" };
  const key = String(raw.key || raw.label || "").trim();
  const normalized = filterToken(key);
  const target = relatedContentTargets.get(key) || relatedContentTargets.get(normalized);
  if (target) return `<a class="term-chip" href="${esc(target[1])}">${esc(target[0])}</a>`;
  if (raw.href) return `<a class="term-chip" href="${esc(raw.href)}">${esc(raw.label)}</a>`;
  const term = termsBySlug.get(key) || termsBySlug.get(normalized);
  if (term) return `<a class="term-chip" href="../../begriffe/${esc(term.slug)}/">${esc(term.canonicalLabel)}</a>`;
  const label = isSlugLike(raw.label || key) ? humanizeSlug(raw.label || key) : raw.label || key;
  return label ? `<span class="term-chip muted">${esc(label)}</span>` : "";
}

function relationGroup(title, values) {
  const chips = [];
  for (const value of asList(values)) {
    const chip = relationChip(value);
    if (!chips.includes(chip)) chips.push(chip);
  }
  if (!chips.length) return "";
  return `<section class="term-section-card">
            <h3>${esc(title)}</h3>
            <div class="term-chip-row">${chips.join("")}</div>
          </section>`;
}

function documentCard(value) {
  const key = typeof value === "object" && value ? value.id || value.key || value.slug || value.label || value.title : value;
  const normalized = filterToken(key);
  const document = documentsById.get(key) || documentsById.get(normalized);
  const reference = document
    ? resolveContentReference(document.onlineUrl || document.pdfUrl || document.docxUrl || document.id, {
        fallbackTitle: document.title,
        description: document.summary,
        contentTypeLabel: labelForContentType(document.type || "Dokument", document.onlineUrl || document.pdfUrl || ""),
        scopeLabel: document.category,
        extentLabel: document.fileSize && document.pdfUrl ? `PDF · ${document.fileSize}` : document.stand ? `Stand ${document.stand}` : "",
      })
    : resolveContentReference(value);
  return contentReferenceCard(reference);
}

function documentGroup(values) {
  const cards = [];
  for (const value of asList(values)) {
    const card = documentCard(value);
    if (!cards.includes(card)) cards.push(card);
  }
  if (!cards.length) return "";
  return `<section class="term-section-card related-documents-card">
            <h3>Quellen und Dokumente</h3>
            <div class="related-document-list">${cards.join("")}</div>
          </section>`;
}

function referenceHref(ref) {
  const url = ref.anchor && !String(ref.pageUrl || "").includes("#") ? `${ref.pageUrl}#${ref.anchor}` : ref.pageUrl;
  return relativeFromGlossary(url);
}

function referenceCard(ref) {
  const snippet = Array.isArray(ref.snippets) && ref.snippets[0] ? ref.snippets[0] : "";
  const reference = resolveContentReference(ref.pageUrl, {
    title: ref.pageTitle,
    description: snippet,
    href: referenceHref(ref),
    contentTypeLabel: labelForContentType(ref.contentType, ref.pageUrl),
    date: ref.date,
    relevanceReason: ref.overrideLabel || (ref.matchType ? `Bezug: ${ref.matchType}` : ""),
  });
  return contentReferenceCard(reference);
}

function referenceList(title, refs) {
  if (!Array.isArray(refs) || !refs.length) return "";
  return `<section class="term-section-card related-documents-card">
            <h3>${esc(title)}</h3>
            <div class="related-document-list content-reference-list">${refs.map(referenceCard).filter(Boolean).join("")}</div>
          </section>`;
}

function automaticReferenceGroups(term) {
  const references = glossaryReferenceIndex.terms?.[term.slug];
  if (!references) return [];
  return [
    referenceList("Begriff bestimmend", references.determining),
    referenceList("Weitere relevante Inhalte", references.related),
  ].filter(Boolean);
}

function chapterReferencesForTerm(term) {
  const manual = asList(term.relatedChapters)
    .map((chapter) => resolveContentReference(chapter, {
      contentTypeLabel: "Online-Buch-Kapitel",
      relevanceReason: "Bezug: manuell zugeordneter Kapitelverweis.",
    }))
    .filter(Boolean);
  const automatic = [
    ...(glossaryReferenceIndex.terms?.[term.slug]?.determining || []),
    ...(glossaryReferenceIndex.terms?.[term.slug]?.related || []),
  ]
    .filter((ref) => ref.contentType === "book-chapter" || String(ref.pageUrl || "").includes("/referenz/kapitel-"))
    .slice(0, 5)
    .map((ref) => resolveContentReference(ref.pageUrl, {
      title: ref.pageTitle,
      description: Array.isArray(ref.snippets) ? ref.snippets[0] : "",
      href: referenceHref(ref),
      contentTypeLabel: "Online-Buch-Kapitel",
      relevanceReason: ref.overrideLabel || "Bezug: Der Begriff wird in diesem Kapitel systematisch verwendet oder definiert.",
    }))
    .filter(Boolean);
  const seen = new Set();
  return [...manual, ...automatic].filter((reference) => {
    const key = reference.canonicalUrl || reference.url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
}

function chapterBlock(term) {
  const references = chapterReferencesForTerm(term);
  return `<section class="term-summary-card" aria-labelledby="chapters-title">
          <p class="section-eyebrow">Online-Buch</p>
          <h2 id="chapters-title">Relevante Kapitel im Online-Buch</h2>
          ${references.length
            ? `<div class="related-document-list content-reference-list">${references.map((reference) => contentReferenceCard(reference, { badge: "Kapitel" })).join("")}</div>`
            : `<p>Für diesen Begriff ist noch kein konkretes Kapitel zugeordnet.</p>`}
          <div class="term-chip-row chapter-navigator-link">
            <a class="term-chip" href="../../referenz/">Alle Kapitel im Kapitel-Navigator öffnen</a>
          </div>
        </section>`;
}

function sourceReferenceBlock(term) {
  const source = term.sourceDocument || term.source_document || "";
  const sourceSection = term.sourceSection || term.source_section || "";
  const reference = resolveContentReference(source, {
    scopeLabel: sourceSection,
    allowTextFallback: true,
    relevanceReason: "Bezug: Primärquelle oder redaktionelle Grundlage dieses Glossarbegriffs.",
  });
  if (!reference) return "";
  return `<div class="source-reference-block">
            ${contentReferenceCard(reference, { badge: "Quelle" })}
          </div>`;
}

function relatedContentBlock(term) {
  const automaticGroups = automaticReferenceGroups(term);
  const manualGroups = [
    ["Methoden & Werkzeuge", [...asList(term.relatedMethods), ...asList(term.relatedTools)]],
    ["Demos", term.relatedDemos],
    ["Wirkungsfelder", term.relatedImpactFields],
    ["Dokumente", term.relatedDocuments],
    ["Akademie", term.relatedAcademyModules],
    ["Datenregister", term.relatedDataRegisters],
  ].map(([title, values]) => title === "Dokumente" ? documentGroup(values) : relationGroup(title, values)).filter(Boolean);
  const groups = [...automaticGroups, ...manualGroups];
  if (!groups.length) return "";
  return `
        <section class="term-summary-card" aria-labelledby="related-content-title">
          <p class="section-eyebrow">Querverweise</p>
          <h2 id="related-content-title">Quellen und Vertiefungen</h2>
          <div class="term-section-grid">
            ${groups.join("")}
          </div>
        </section>
`;
}

function deepGlossarySectionsBlock(term) {
  const sections = asList(term.deepGlossarySections);
  if (!sections.length) return "";
  const packLabel = term.glossaryPack || term.glossary_pack || "Glossar";
  return `
        <section class="term-summary-card" aria-labelledby="deep-glossary-${esc(term.slug)}">
          <p class="section-eyebrow">Glossar-Pack ${esc(packLabel)}</p>
          <h2 id="deep-glossary-${esc(term.slug)}">Vertiefte Begriffsstruktur</h2>
          <div class="term-section-grid">
            ${sections.map((section) => `<section class="term-section-card">
              <h3>${esc(section.title || "Abschnitt")}</h3>
              ${paragraphs(section.body)}
              ${listItems(section.items || [])}
            </section>`).join("")}
          </div>
        </section>
`;
}

function learningBlock(term) {
  const detail = centralTermDetails.get(term.slug);
  if (!detail) return "";
  const [why, notMeaning, example, misconceptions, tools, fields] = detail;
  return `<section class="term-summary-card" aria-labelledby="learning-${esc(term.slug)}">
          <h2 id="learning-${esc(term.slug)}">Lernpfad zu ${esc(term.canonicalLabel)}</h2>
          <div class="term-section-grid">
            <section class="term-section-card"><p class="section-eyebrow">Warum wichtig?</p><h3>Was macht der Begriff sichtbar?</h3><p>${esc(why)}</p></section>
            <section class="term-section-card"><p class="section-eyebrow">Abgrenzung</p><h3>Was es nicht bedeutet</h3><p>${esc(notMeaning)}</p></section>
            <section class="term-section-card"><p class="section-eyebrow">Beispiel</p><h3>So wird es konkret</h3><p>${esc(example)}</p></section>
            <section class="term-section-card"><p class="section-eyebrow">Missverständnisse</p><h3>Worauf achten?</h3>${listItems(misconceptions)}</section>
          </div>
          <div class="term-section-grid">
            <section class="term-section-card"><h3>Passende Tools</h3>${linkedChips(tools)}</section>
            <section class="term-section-card"><h3>Passende Wirkungsfelder</h3>${linkedChips(fields)}</section>
          </div>
        </section>`;
}

function termExtraBlock(term) {
  if (term.termId !== "mensch-planet-demokratie") return "";
  return `<section class="term-summary-card" aria-labelledby="sdg-context-title">
          <h2 id="sdg-context-title">Warum nicht einfach nur SDGs sagen?</h2>
          <p>Die SDGs und die Agenda 2030 sind der globale Referenzrahmen. Sie sind fachlich wichtig und politisch anschlussfähig. In der öffentlichen Kommunikation sind sie jedoch oft zu abstrakt. Viele Menschen kennen weder die Agenda 2030 noch die Bedeutung der einzelnen SDGs.</p>
          <p>Die Wirkungsökonomie nutzt deshalb den Dreiklang Mensch, Planet und Demokratie. Er macht verständlich, was die Zielstruktur bedeutet: gutes Leben und Teilhabe für Menschen, Schutz und Regeneration des Planeten sowie starke demokratische Institutionen, Medienqualität, Rechtsstaatlichkeit und gesellschaftlichen Zusammenhalt.</p>
          <p>SDG+ ist keine UN-Kategorie. SDG+ ist eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
          <p>Mensch, Planet und Demokratie ist damit die kommunikative Übersetzung von SDGs, Agenda 2030 und SDG+.</p>
          <div class="table-wrap" role="region" aria-label="Verhältnis von Referenzrahmen, Übersetzung und Zielgröße" tabindex="0">
            <table>
              <thead>
                <tr>
                  <th>Ebene</th>
                  <th>Bezeichnung</th>
                  <th>Bedeutung</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fachlicher Referenzrahmen</td>
                  <td><a class="text-link" href="../../begriffe/sdgs/">SDGs</a>, <a class="text-link" href="../../begriffe/agenda-2030/">Agenda 2030</a> und <a class="text-link" href="../../begriffe/sdg-plus/">SDG+</a></td>
                  <td>Globale Nachhaltigkeitsziele plus transparente WÖk-Erweiterung für demokratische Voraussetzungen nachhaltiger Entwicklung.</td>
                </tr>
                <tr>
                  <td>Kommunikative Übersetzung</td>
                  <td>Mensch, Planet und Demokratie</td>
                  <td>Drei verständliche Oberbegriffe für soziale, ökologische und demokratische Wirkung.</td>
                </tr>
                <tr>
                  <td>Zielgröße der Wirkungsökonomie</td>
                  <td><a class="text-link" href="../../begriffe/positive-netto-wirkung/">Positive Netto-Wirkung</a> für Mensch, Planet und Demokratie</td>
                  <td>Handlungen, Produkte, Institutionen, Kapitalflüsse und Entscheidungen werden daran ausgerichtet, diese drei Dimensionen zu stärken.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>`;
}

function termLead(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return "Mensch, Planet und Demokratie sind die verständliche Zusammenfassung der SDGs, der Agenda 2030 und der SDG+-Erweiterung der Wirkungsökonomie. Der Dreiklang übersetzt den fachlichen Referenzrahmen in eine Sprache, die öffentlich anschlussfähig ist.";
  }
  return term.shortDefinition;
}

function termSummary(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return "Mensch, Planet und Demokratie sind die drei Oberbegriffe, unter denen die Wirkungsökonomie die SDGs, die Agenda 2030 und SDG+ zusammenfasst. Fachlich bleibt der Referenzrahmen SDGs, Agenda 2030 und SDG+. Kommunikativ wird daraus: Wirkung für Mensch, Planet und Demokratie.";
  }
  return term.hoverDefinition;
}

function termDefinitionHtml(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return `<p>Der Begriff bezeichnet die drei übergeordneten Wirkungsdimensionen der Wirkungsökonomie. Mensch steht für soziale Gerechtigkeit, Gesundheit, Bildung, Teilhabe, Würde und Sicherheit. Planet steht für Klima, Ressourcen, Wasser, Boden, Biodiversität, Energie und Regeneration. Demokratie steht für Rechtsstaatlichkeit, Medienqualität, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
            <p>Damit sind Mensch, Planet und Demokratie keine zusätzlichen UN-Ziele. Sie sind die kommunikative Ordnung, mit der die Wirkungsökonomie die SDGs, die Agenda 2030 und SDG+ verständlich zusammenführt.</p>`;
  }
  return `<p>${esc(term.longDefinition)}</p>`;
}

function termWhyHtml(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return `<p>Die SDGs und die Agenda 2030 sind fachlich zentral, aber in der Bevölkerung wenig bekannt. Für öffentliche Kommunikation braucht die Wirkungsökonomie deshalb eine einfache, klare und wiedererkennbare Sprache. Mensch, Planet und Demokratie macht sichtbar, worum es geht: nicht um abstrakte Zielnummern, sondern um Lebensqualität, ökologische Stabilität und demokratische Handlungsfähigkeit.</p>
            <p>Der Dreiklang ersetzt die SDGs nicht. Er übersetzt sie.</p>`;
  }
  return `<p>${esc(term.preferredUsage || term.usageNote || "Der Begriff hilft, Wirkung, Bewertung und Rückkopplung präzise zu unterscheiden.")}</p>`;
}

function termUsageHtml(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return `<p>Mensch, Planet und Demokratie nicht als Zusatz-Ziel neben den SDGs verwenden. Der Dreiklang ist die öffentliche Übersetzung des fachlichen Referenzrahmens und bleibt an Wirkung, Wirkungsbewertung und positive Netto-Wirkung gebunden.</p>`;
  }
  return `<p>${esc(term.usageNote)}</p>`;
}

function mythBlock(term) {
  const mythos = term.mythos || "";
  const klaerung = term.woekKlaerung || term.woek_klaerung || "";
  const blind = term.blindSpot || term.blind_spot || "";
  if (!mythos && !klaerung && !blind) return "";
  return `<section class="term-summary-card term-myth-card" aria-labelledby="term-myth-title">
          <p class="section-eyebrow">Mythos und Klärung</p>
          <h2 id="term-myth-title">Wirkungsökonomische Einordnung</h2>
          <div class="term-section-grid">
            ${mythos ? `<section class="term-section-card"><h3>Mythos</h3><p>${esc(mythos)}</p></section>` : ""}
            ${klaerung ? `<section class="term-section-card"><h3>WÖk-Klärung</h3><p>${esc(klaerung)}</p></section>` : ""}
            ${blind ? `<section class="term-section-card"><h3>Blinder Fleck</h3><p>${esc(blind)}</p></section>` : ""}
          </div>
        </section>`;
}

function detailLinks(term) {
  const links = [];
  const target = termTargetLinks.get(term.slug);
  if (target) links.push({ href: target, label: "Themenseite öffnen" });
  links.push({ href: "../../begriffe/", label: "Alle Begriffe" });
  links.push({ href: `../../suche.html?q=${encodeURIComponent(term.canonicalLabel)}`, label: "Website durchsuchen" });
  return links
    .map((link, index) => `<a class="btn ${index === 0 ? "btn-primary" : "btn-secondary"}" href="${esc(link.href)}">${esc(link.label)}</a>`)
    .join("");
}

const quickFilters = [
  ["Wirkung verstehen", { theme: "wirkung-und-wirkungslogik" }],
  ["Gesundheit & Leben", { theme: "gesundheit-leben" }],
  ["Wirtschaftssysteme vergleichen", { theme: "wirtschaftssysteme-und-gesellschaftsmodelle" }],
  ["Medienwirkung & Folgencheck", { theme: "demokratie-medien-und-oeffentlichkeit" }],
  ["Klima & Produktwirkung", { theme: "klima-energie-und-lebenszyklus" }],
  ["Management & Innovation", { theme: "management-wirksamkeit-und-organisation" }],
  ["Psychologische Wirkmechanismen", { theme: "psychologie-und-resonanz" }],
  ["Philosophie & Werte", { theme: "philosophie-ethik-und-werte" }],
];

const curatedTypeFilters = [
  ["WÖk-Kernbegriffe", "woek-kernbegriff"],
  ["WÖk-Begriffe", "woek-begriff"],
  ["Methoden", "methodenbegriff"],
  ["Anschlussbegriffe", "anschlussbegriff"],
  ["Bestand", "bestand"],
];

const curatedThemeFilters = [
  ["Wirkung", "wirkung-und-wirkungslogik"],
  ["Produkte & Lieferketten", "produkte-lieferketten-und-scorecards"],
  ["Daten & KI", "daten-digitalisierung-und-ki"],
  ["Klima & Energie", "klima-energie-und-lebenszyklus"],
  ["Wirtschaft & Kapital", "kapital-markt-und-macht"],
  ["Demokratie & Medien", "demokratie-medien-und-oeffentlichkeit"],
  ["Psychologie", "psychologie-und-resonanz"],
  ["Philosophie & Werte", "philosophie-ethik-und-werte"],
];

const indexBody = `      <section class="hero compact-hero">
        <p class="hero-kicker">WÖk-Referenzsystem</p>
        <h1>Begriffe der Wirkungsökonomie</h1>
        <p class="hero-subtitle">Der Glossar-Hub ist der Einstieg in die Begriffe. Detailseiten, Hover, Suche und Querverweise bleiben die eigentliche semantische Infrastruktur.</p>
        <p class="notice">Am schnellsten: Begriff suchen oder einen der kuratierten Einstiege wählen. Präzise Fachfilter bleiben darunter einklappbar erhalten.</p>
      </section>
      <section class="content-band glossary-filter-panel" aria-labelledby="glossary-filter-title">
        <div class="section-header compact">
          <p class="hero-kicker">Filter</p>
          <h2 id="glossary-filter-title">Glossar gezielt erschließen</h2>
          <p>Die wichtigsten Einstiege sind sichtbar. Die langen Fachfilter sind nur bei Bedarf geöffnet.</p>
        </div>
        <label class="glossary-search-field">
          <span>Freitextsuche</span>
          <input type="search" placeholder="Begriff, Alias, Synonym oder Definition suchen" data-glossary-search aria-label="Glossar durchsuchen">
        </label>
        <div class="glossary-quick-filters" aria-label="Schnellfilter">
          ${quickFilters.map(([label, params]) => `<button type="button" data-quick-filter="${esc(new URLSearchParams(params).toString())}">${esc(label)}</button>`).join("")}
        </div>
        <div class="glossary-filter-grid">
          ${curatedFilterButtons("type", "Begriffstyp", curatedTypeFilters)}
          ${curatedFilterButtons("theme", "Begriffswelt", curatedThemeFilters)}
        </div>
        <details class="glossary-advanced-filters">
          <summary>Erweiterte Fachfilter anzeigen</summary>
          <div class="glossary-filter-grid advanced">
            ${filterButtons("type", "Alle Begriffstypen", filterValues("type").concat(filterValues("begriffstyp"), filterValues("conceptStatus")).filter(Boolean).filter((value, index, all) => all.indexOf(value) === index))}
            ${filterButtons("theme", "Alle Themenwelten", filterValues("theme"))}
            ${filterButtons("dimension", "WÖk-Dimension", filterValues("dimensions"))}
            ${filterButtons("wirklogik", "Wirklogik", filterValues("wirklogik"))}
            ${filterButtons("field", "Anwendungsfeld", filterValues("applicationFields"))}
            ${filterButtons("source", "Quellenfeld", filterValues("sourceField"))}
          </div>
        </details>
        <div class="glossary-filter-actions">
          <button type="button" class="btn btn-secondary" data-glossary-reset>Filter zurücksetzen</button>
          <p class="reference-filter-status" data-glossary-filter-status role="status" aria-live="polite"></p>
        </div>
      </section>
      <nav class="az-nav" aria-label="Alphabetische Navigation">
        ${nav.map((letter) => `<a href="#${esc(letter)}">${esc(letter)}</a>`).join(" ")}
      </nav>
      ${nav.map((letter) => {
        const items = groups.get(letter);
        return `<section id="${esc(letter)}" class="content-band">
        <h2>${esc(letter)}</h2>
        <div class="card-grid">${items.map((term) => {
          const filterData = termFilterData(term);
          return `<article class="info-card glossary-result-card" data-glossary-card data-category="${esc(term.category || "")}" data-type="${esc(filterData.type)}" data-theme="${dataAttrList(filterData.theme)}" data-dimension="${dataAttrList(filterData.dimension)}" data-wirklogik="${dataAttrList(filterData.wirklogik)}" data-field="${dataAttrList(filterData.field)}" data-source="${dataAttrList(filterData.source)}" data-search="${esc([term.canonicalLabel, term.shortDefinition, term.hoverDefinition, term.longDefinition, term.woekRelation, ...(term.synonyms || [])].join(" ").toLowerCase())}">
          <h3><a href="${esc(term.slug)}/">${esc(term.canonicalLabel)}</a></h3>
          <p>${esc(term.shortDefinition)}</p>
          ${termBadges(term)}
          <p class="meta-line">${esc(term.category || "Begriff")} · ${esc(term.type || term.begriffstyp || term.status)} · Version ${esc(term.version)}</p>
        </article>`;
        }).join("")}</div>
      </section>`;
      }).join("\n")}
      <script>
        (() => {
          const search = document.querySelector("[data-glossary-search]");
          const buttons = Array.from(document.querySelectorAll("[data-filter-name]"));
          const cards = Array.from(document.querySelectorAll("[data-glossary-card]"));
          const status = document.querySelector("[data-glossary-filter-status]");
          const reset = document.querySelector("[data-glossary-reset]");
          const quickButtons = Array.from(document.querySelectorAll("[data-quick-filter]"));
          const state = { type: new Set(), theme: new Set(), dimension: new Set(), wirklogik: new Set(), field: new Set(), source: new Set(), q: "" };
          const params = new URLSearchParams(window.location.search);
          const split = (value) => (value || "").split(",").map((item) => item.trim()).filter(Boolean);
          const normalize = (value) => String(value || "")
            .trim()
            .toLocaleLowerCase("de")
            .replace(/ß/g, "ss")
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          Object.keys(state).forEach((key) => {
            if (key === "q") state.q = params.get("q") || "";
            else split(params.get(key)).forEach((value) => state[key].add(normalize(value)));
          });
          if (search instanceof HTMLInputElement) search.value = state.q;
          function hasAll(card, key) {
            const selected = state[key];
            if (!selected || !selected.size) return true;
            const values = (card.dataset[key] || "").split(" ").filter(Boolean);
            return Array.from(selected).every((value) => values.includes(value));
          }
          function updateUrl() {
            const next = new URLSearchParams();
            if (state.q) next.set("q", state.q);
            ["type", "theme", "dimension", "wirklogik", "field", "source"].forEach((key) => {
              if (state[key].size) next.set(key, Array.from(state[key]).join(","));
            });
            const url = next.toString() ? window.location.pathname + "?" + next.toString() : window.location.pathname;
            window.history.replaceState(null, "", url);
          }
          function apply() {
            const q = search instanceof HTMLInputElement ? search.value.trim().toLowerCase() : state.q;
            state.q = q;
            let visible = 0;
            cards.forEach((card) => {
              const textMatch = !q || (card.dataset.search || card.textContent || "").toLowerCase().includes(q);
              const show = textMatch && hasAll(card, "type") && hasAll(card, "theme") && hasAll(card, "dimension") && hasAll(card, "wirklogik") && hasAll(card, "field") && hasAll(card, "source");
              card.hidden = !show;
              if (show) visible += 1;
            });
            buttons.forEach((button) => {
              const key = button.dataset.filterName;
              const value = button.dataset.filterValue;
              const active = Boolean(key && value && state[key]?.has(value));
              button.classList.toggle("active", active);
              button.setAttribute("aria-pressed", String(active));
            });
            document.querySelectorAll(".content-band[id]").forEach((section) => {
              if (!section.querySelector("[data-glossary-card]")) return;
              section.hidden = !Array.from(section.querySelectorAll("[data-glossary-card]")).some((card) => !card.hidden);
            });
            if (status) status.textContent = visible + " von " + cards.length + " Begriffen sichtbar";
            updateUrl();
          }
          buttons.forEach((button) => button.addEventListener("click", () => {
            const key = button.dataset.filterName;
            const value = button.dataset.filterValue;
            if (!key || !value || !state[key]) return;
            if (state[key].has(value)) state[key].delete(value);
            else state[key].add(value);
            apply();
          }));
          quickButtons.forEach((button) => button.addEventListener("click", () => {
            Object.keys(state).forEach((key) => {
              if (key === "q") state.q = "";
              else state[key].clear();
            });
            const quick = new URLSearchParams(button.dataset.quickFilter || "");
            quick.forEach((value, key) => state[key]?.add(value));
            if (search instanceof HTMLInputElement) search.value = "";
            apply();
          }));
          reset?.addEventListener("click", () => {
            Object.keys(state).forEach((key) => {
              if (key === "q") state.q = "";
              else state[key].clear();
            });
            if (search instanceof HTMLInputElement) search.value = "";
            apply();
          });
          search?.addEventListener("input", apply);
          apply();
        })();
      </script>`;

fs.writeFileSync(path.join(outDir, "index.html"), pageShell("Begriffe", indexBody, "../"));
fs.writeFileSync("glossar.html", glossaryLegacyAlias(""));
fs.mkdirSync("glossar", { recursive: true });
fs.writeFileSync(path.join("glossar", "index.html"), glossaryLegacyAlias("../"));

function sexarbeitDetailBody(term) {
  return `      <article class="article-shell glossary-detail glossary-detail-sensitive">
        <nav class="breadcrumb"><a href="../">Begriffe</a> / ${esc(term.canonicalLabel)}</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">Sensibler Glossarbegriff</p>
          <h1>${esc(term.canonicalLabel)}</h1>
          <p class="lead">Sexarbeit bezeichnet einvernehmliche sexuelle Dienstleistungen gegen Entgelt. In der Wirkungsökonomie ist Sexarbeit kein moralischer Bewertungsbegriff, sondern ein sensibler Wirkungsraum an der Schnittstelle von Arbeit, Körper, Gesundheit, Selbstbestimmung, sozialer Infrastruktur, Rechtsschutz und Ausbeutungsrisiken.</p>
          <div class="term-meta-row" aria-label="Begriffsinformation">
            <span>Sensibler Begriff</span>
            <span>Keine Personenbewertung</span>
            <span>Keine Gleichsetzung mit Menschenhandel</span>
            <span>Auto-Linking deaktiviert</span>
          </div>
          <div class="term-action-row">${detailLinks(term)}</div>
        </header>
        <section class="term-summary-card" aria-labelledby="sexarbeit-status-title">
          <p class="section-eyebrow">Schutzstatus</p>
          <h2 id="sexarbeit-status-title">Sensible Verwendung</h2>
          <p>Diese Seite bewertet keine Personen, keine Sexualität, keine Identität und keine Lebensstile. Sie betrachtet Sexarbeit als sensiblen Wirkungsraum und fragt nach Bedingungen, Schutzmechanismen, Risiken, Selbstbestimmung, sozialer Funktion und institutioneller Verantwortung.</p>
          <p>Sie ist keine Rechtsberatung, keine Sozialberatung und keine medizinische Beratung. Rechtliche Regelungen zu Sexarbeit unterscheiden sich je nach Rechtsordnung und ändern sich. Der Deutschland-Kontext des Prostituiertenschutzgesetzes wird hier nur begrifflich eingeordnet.</p>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-definition-title">
          <p class="section-eyebrow">Definition</p>
          <h2 id="sexarbeit-definition-title">Kurzdefinition und Kernthese</h2>
          <p>Sexarbeit bezeichnet einvernehmliche sexuelle Dienstleistungen gegen Entgelt, soweit volljährige Personen selbstbestimmt handeln und keine Gewalt, Nötigung, Ausbeutung, Minderjährigkeit oder Zwangslage vorliegt.</p>
          <p>Sexarbeit kann unter bestimmten Bedingungen eine soziale Kontakt-, Nähe- und Versorgungsfunktion erfüllen. Wirkungsökonomisch wird nicht moralisch bewertet, ob Sexarbeit abstrakt gut oder schlecht ist, sondern welche Zustände, Bedürfnisse, Risiken, Schutzmechanismen und Wirkungen unter realen Bedingungen entstehen.</p>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-infrastruktur-title">
          <p class="section-eyebrow">Wirkungsökonomische Auslegung</p>
          <h2 id="sexarbeit-infrastruktur-title">Sexarbeit als ambivalente soziale Infrastruktur</h2>
          <p>Sexarbeit ist nicht automatisch soziale Infrastruktur. Sie kann aber in bestimmten Kontexten eine soziale Infrastruktur- oder Versorgungsfunktion übernehmen, wenn sie Bedürfnisse nach Nähe, Intimität, Kontakt, Anerkennung oder zwischenmenschlicher Zuwendung adressiert, die durch bestehende soziale Strukturen nicht gedeckt werden.</p>
          <p>Diese Funktion darf nicht idealisiert werden: Sexarbeit bleibt ein ambivalenter Wirkungsraum, in dem Selbstbestimmung, Prekarität, Machtasymmetrien, Gewalt-, Zwangs- und Ausbeutungsrisiken zugleich betrachtet werden müssen.</p>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-functional-title">
          <p class="section-eyebrow">Analyseperspektive</p>
          <h2 id="sexarbeit-functional-title">Funktionale Perspektive statt moralischer Verkürzung</h2>
          <p>Die Wirkungsökonomie fragt nicht zuerst, ob Sexarbeit abstrakt gut oder schlecht ist. Sie fragt, welche Funktion sie unter realen gesellschaftlichen Bedingungen erfüllt, welche Bedürfnisse sichtbar werden, welche Schutzlücken bestehen und welche Wirkungen Regulierung, Kriminalisierung, Tabuisierung, Stigma oder Entkriminalisierung erzeugen.</p>
          <p>Die Debatte ist oft polarisiert: Sexarbeit als Ausbeutung oder Sexarbeit als selbstbestimmte Erwerbsarbeit. Beide Perspektiven können reale Aspekte enthalten. Eine reine Entweder-oder-Logik greift zu kurz; nötig ist eine Zustands- und Wirkungsanalyse.</p>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-why-infra-title">
          <p class="section-eyebrow">Soziale Infrastruktur</p>
          <h2 id="sexarbeit-why-infra-title">Warum soziale Infrastruktur?</h2>
          <p>Soziale Infrastruktur umfasst nicht nur formelle Einrichtungen wie Gesundheitssystem, Pflege, Beratungsstellen oder Schutzräume. Sie umfasst auch Beziehungs-, Kontakt-, Nähe-, Beratungs-, Unterstützungs- und Resonanzräume, die Menschen Sicherheit, Zugehörigkeit, Selbstwirksamkeit und Stabilität ermöglichen.</p>
          <p>Sexarbeit kann in bestimmten Kontexten an einer Lücke dieser Infrastruktur sichtbar werden: dort, wo Einsamkeit, Isolation, Krankheit, Alter, Behinderung, soziale Ausgrenzung, biografische Brüche oder fehlende Beziehungsräume Bedürfnisse nach Nähe und Kontakt erzeugen, die anderweitig nicht aufgefangen werden.</p>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-functions-title">
          <p class="section-eyebrow">Mögliche soziale Funktionen</p>
          <h2 id="sexarbeit-functions-title">Kontextabhängig, nicht automatisch positiv</h2>
          ${listItems(["Kontakt und zwischenmenschliche Begegnung", "körperliche Nähe und Intimität", "Anerkennung und gesehen werden", "Entlastung bei Einsamkeit oder sozialer Isolation", "Zugang zu Intimität bei Krankheit, Alter, Behinderung oder biografischen Brüchen", "Stabilisierung einzelner Personen in belasteten Lebenssituationen", "punktueller Ausgleich von Bedürfnissen, die durch bestehende soziale Strukturen nicht gedeckt werden", "Sichtbarmachung gesellschaftlicher Defizite in Nähe-, Beziehungs- und Versorgungsstrukturen"])}
          <p>Diese möglichen Funktionen sind kontextabhängig und nicht automatisch positiv. Sie müssen immer zusammen mit Bedingungen, Freiwilligkeit, Sicherheit, Machtverhältnissen und Schutz betrachtet werden.</p>
        </section>
        <div class="term-section-grid">
          <section class="term-section-card">
            <p class="section-eyebrow">Warum sensibel?</p>
            <h2>Sprache mit Schutzfunktion</h2>
            <p>Der Begriff berührt Würde, Körper, Selbstbestimmung, Gewalt, Armut, Migration, Plattformlogik, Datenschutz, Gesundheit und Rechtsschutz. Unpräzise Sprache kann Stigma verstärken, Schutzbedarfe verdecken oder Ausbeutung verharmlosen.</p>
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">WÖk prüft</p>
            <h2>Was sichtbar werden muss</h2>
            ${listItems(["Selbstbestimmung und Freiwilligkeit", "reale Handlungsfreiheit", "Schutz vor Gewalt, Zwang, Menschenhandel und Ausbeutung", "Gesundheitsversorgung, Prävention, Beratung und Behandlung", "Rechtsschutz, Beschwerde- und Korrekturwege", "Wohnsicherheit, sichere Räume und Ausstiegsangebote", "Schutz vor Stigma, Diskriminierung und digitaler Erpressung", "Plattform- und Vermittlungstransparenz", "Wirkung von Regulierung, Kriminalisierung, Tabuisierung und Verdrängung", "Wirkung auf Einsamkeit, Isolation, Kontakt- und Nähebedürfnisse"])}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">WÖk prüft nicht</p>
            <h2>Keine moralische oder personenbezogene Bewertung</h2>
            ${listItems(["keine Bewertung einzelner Personen", "keine Bewertung von Sexualität, Identität, Körpern oder Lebensführung", "keine Bewertung individueller Entscheidungen", "keine automatische Entscheidung", "keine Rechts-, Sozial- oder Gesundheitsberatung", "keine Gleichsetzung mit Menschenhandel oder Zwangsprostitution"])}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Rote Linien</p>
            <h2>Nicht kompensierbar</h2>
            ${listItems(["Minderjährigkeit", "Zwang, Nötigung oder Gewalt", "Menschenhandel", "Freiheitsentzug", "systematische oder sexuelle Ausbeutung", "sexualisierte Gewalt", "Entzug von Ausweisdokumenten", "Schuld- oder Abhängigkeitsverhältnisse", "fehlender Zugang zu Hilfe", "digitale Überwachung, Erpressung oder Outing-Risiken", "organisierte Einschüchterung", "rassistische, sexistische, queerfeindliche oder transfeindliche Gewalt", "gesundheitsgefährdende Bedingungen ohne Schutzmöglichkeit", "institutionelle Schutzverweigerung"])}
          </section>
        </div>
        <section class="term-summary-card" aria-labelledby="sexarbeit-ambivalence-title">
          <p class="section-eyebrow">Ambivalenz</p>
          <h2 id="sexarbeit-ambivalence-title">Stabilisierend und riskant zugleich</h2>
          <p>Sexarbeit kann stabilisierende Funktionen erfüllen und zugleich von Prekarität, Stigma, Gewalt, ökonomischer Abhängigkeit, Aufenthaltsunsicherheit, Plattformmacht, Machtasymmetrien oder Ausbeutung geprägt sein. Diese Ambivalenz ist kein Randproblem, sondern der Kern einer realistischen Wirkungsanalyse.</p>
          <p>Die WÖk romantisiert Sexarbeit nicht, kriminalisiert sie nicht pauschal, liest nicht jede Sexarbeit als freie Entscheidung und nicht jede Sexarbeit als Zwang. Entscheidend sind die konkreten Bedingungen.</p>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-abgrenzung-title">
          <p class="section-eyebrow">Abgrenzung</p>
          <h2 id="sexarbeit-abgrenzung-title">Nicht automatisch gleichsetzen</h2>
          <div class="term-section-grid">
            <section class="term-section-card"><h3>Sexarbeit ist nicht automatisch Menschenhandel</h3><p>Menschenhandel ist eine schwere Menschenrechtsverletzung und Strafrechtsfrage. Er darf nicht als Synonym verwendet werden.</p></section>
            <section class="term-section-card"><h3>Sexarbeit ist nicht automatisch Zwangsprostitution</h3><p>Zwang, Gewalt, Drohung, Abhängigkeit oder Freiheitsentzug verändern den Wirkungsraum grundlegend.</p></section>
            <section class="term-section-card"><h3>Sexarbeit ist nicht sexuelle Ausbeutung</h3><p>Sexuelle Ausbeutung ist eine rote Linie und darf nicht unter Arbeits- oder Dienstleistungslogik normalisiert werden.</p></section>
            <section class="term-section-card"><h3>Sexarbeit ist nicht sexualisierte Gewalt</h3><p>Sexualisierte Gewalt ist keine Form von Arbeit, sondern Gewalt.</p></section>
            <section class="term-section-card"><h3>Minderjährige als rote Linie</h3><p>Bei Minderjährigkeit endet jede arbeits- oder dienstleistungsbezogene Einordnung. Schutz, Strafverfolgung und Hilfe haben Vorrang.</p></section>
            <section class="term-section-card"><h3>Soziale Funktion ist keine automatische Legitimation</h3><p>Dass eine Praxis eine gesellschaftliche Funktion erfüllt, bedeutet nicht, dass alle Bedingungen akzeptabel sind. Funktionale Analyse ersetzt nicht Schutz, Recht und Menschenwürde.</p></section>
          </div>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-regulation-title">
          <p class="section-eyebrow">Regulierung</p>
          <h2 id="sexarbeit-regulation-title">Schutz und Selbstbestimmung zugleich</h2>
          <p>Eine wirkungsökonomische Regulierung muss Schutz vor Ausbeutung und Selbstbestimmung zusammen denken. Reine Kriminalisierung kann Sexarbeit in weniger transparente und unsicherere Strukturen verdrängen. Reine Marktlogik kann Machtasymmetrien, Prekarität, Zwang und Gewalt verharmlosen.</p>
          ${listItems(["Sicherheit durch transparente und regulierte Strukturen", "Rechte statt pauschaler Defizitzuschreibungen", "differenzierte Regulierung statt pauschaler Kriminalisierung", "gesellschaftliche Ursachen wie Einsamkeit, Isolation und ökonomische Ungleichheit mitbehandeln", "wissensbasierte Politik und Forschung"])}
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-data-title">
          <p class="section-eyebrow">Daten und Forschung</p>
          <h2 id="sexarbeit-data-title">Wissensbasierte Politik statt Vorannahmen</h2>
          <p>Die empirische Grundlage zu Sexarbeit ist in vielen Bereichen begrenzt, uneinheitlich oder politisch umstritten. Eine wirkungsökonomische Betrachtung braucht Forschung, die Risiken und mögliche stabilisierende Funktionen gleichermaßen untersucht, ohne Betroffene zu gefährden oder zu stigmatisieren.</p>
          ${listItems(["keine individuellen Profile", "keine Personenklassifikation", "keine Überwachung privater Lebensführung", "keine sensiblen personenbezogenen Detaildaten", "keine automatisierte Entscheidung über Menschen", "strukturelle, aggregierte, freiwillige und schutzorientierte Daten bevorzugen"])}
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-social-credit-title">
          <p class="section-eyebrow">Schutzlinie</p>
          <h2 id="sexarbeit-social-credit-title">Keine Personenbewertung und keine Social-Credit-Logik</h2>
          <p>Diese Seite darf nicht als Grundlage für die Bewertung einzelner Personen genutzt werden. Die Wirkungsökonomie bewertet keine Sexarbeiter:innen, keine Kund:innen, keine Körper, keine Identitäten und keine Lebensstile. Sie prüft Strukturen, Bedingungen, Bedürfnisse, Risiken, Schutzmechanismen und gesellschaftliche Wirkungen.</p>
          <p>Eine wirkungsökonomische Betrachtung von Sexarbeit darf niemals zur Überwachung, Registrierung, Scoring-Logik, Risikoklassifikation oder automatisierten Entscheidung über Menschen führen. Sensible Daten dürfen nicht zweckentfremdet werden.</p>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-mpd-title">
          <p class="section-eyebrow">Referenzrahmen</p>
          <h2 id="sexarbeit-mpd-title">Mensch, Planet, Demokratie und SDG+</h2>
          <p>Der Begriff berührt vor allem Mensch und Demokratie: Würde, Gesundheit, Sicherheit, Nähe, Kontakt, Selbstbestimmung, Schutz vor Gewalt, soziale Sicherung, Wohnsicherheit, psychische Stabilität, Beratung, Rechtsschutz, institutionelles Vertrauen, digitale Selbstbestimmung und Schutz vor Stigma. Planet ist meist keine primäre Dimension, kann aber indirekt bei Infrastruktur, Mobilität, Energie, Gebäuden, Plattformökonomie oder Lieferketten relevant werden.</p>
          <p>SDG-Bezüge liegen insbesondere bei SDG 1, SDG 3, SDG 5, SDG 8, SDG 10 und SDG 16. SDG+ ergänzt transparent Menschenwürde, Rechtsstaatlichkeit, digitale Selbstbestimmung, Medienqualität, gesellschaftlichen Zusammenhalt und institutionelles Vertrauen; SDG+ ist eine transparente WÖk-Erweiterung, keine offizielle UN-Kategorie.</p>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-example-title">
          <p class="section-eyebrow">Abstraktes Beispiel</p>
          <h2 id="sexarbeit-example-title">Bedingungen unterscheiden</h2>
          <p>Zwei Situationen können äußerlich ähnlich erscheinen, aber völlig unterschiedliche Wirkungen haben. In der einen Situation handelt eine volljährige Person selbstbestimmt, hat Zugang zu Gesundheitsversorgung, Beratung, Rechtsschutz, sicheren Räumen und Ausstiegsmöglichkeiten. Eine andere Person sucht über Sexarbeit Nähe oder Kontakt, weil soziale Isolation, Krankheit, Alter oder biografische Brüche andere Beziehungsräume verschlossen haben. In einer dritten Situation bestehen Zwang, Gewalt, Schuldenabhängigkeit, Aufenthaltsunsicherheit, fehlender Gesundheitsschutz oder digitale Kontrolle. Die WÖk darf diese Situationen nicht gleichsetzen. Sie muss Bedingungen, Bedürfnisse, Risiken und Schutzmechanismen unterscheiden.</p>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-core-title">
          <p class="section-eyebrow">WÖk-Kernsatz</p>
          <h2 id="sexarbeit-core-title">Ambivalenter Wirkungsraum</h2>
          <p>Sexarbeit ist in der Wirkungsökonomie kein moralischer Prüfstein für Personen, sondern ein ambivalenter Wirkungsraum. Sie kann unter bestimmten Bedingungen eine soziale Kontakt-, Nähe- und Versorgungsfunktion erfüllen. Entscheidend ist aber, ob die Bedingungen Selbstbestimmung, Gesundheit, Schutz vor Gewalt, Schutz vor Ausbeutung, Rechtssicherheit, soziale Teilhabe, Wohnsicherheit, digitale Selbstbestimmung und Ausstiegsmöglichkeiten stärken oder ob sie Zwang, Abhängigkeit, Stigma, Menschenhandel, digitale Kontrolle und institutionelle Schutzlücken verstärken.</p>
          <p>Als soziale Infrastruktur betrachtet die Wirkungsökonomie nicht nur formelle Institutionen, sondern auch die Bedingungen, unter denen Nähe, Kontakt, Zugehörigkeit, Schutz, Beratung, Gesundheit, Rechtsschutz und reale Handlungsfreiheit entstehen. Sexarbeit kann in bestimmten Kontexten Teil dieser sozialen Versorgungsstruktur sein, aber nur, wenn Schutz, Freiwilligkeit, Rechte und Würde gesichert sind.</p>
        </section>
        <section class="term-summary-card" aria-labelledby="sexarbeit-social-infra-link-title">
          <p class="section-eyebrow">Verbindung</p>
          <h2 id="sexarbeit-social-infra-link-title">Bezug zu Sozialer Infrastruktur</h2>
          <p>Der Begriff <a class="text-link" href="../../begriffe/soziale-infrastruktur/">Soziale Infrastruktur</a> hilft, Sexarbeit nicht isoliert zu betrachten. Wenn soziale Infrastruktur Nähe, Zugehörigkeit, Gesundheit, Beratung, Schutzräume, Wohnsicherheit, Rechtsschutz und Teilhabe umfasst, dann zeigt Sexarbeit eine besonders sensible Grenzstelle dieser Infrastruktur: Sie kann Bedürfnisse sichtbar machen, die bestehende Strukturen nicht auffangen, und zugleich Risiken, die ohne Schutzarchitektur gefährlich werden.</p>
        </section>
        <section class="term-link-section" aria-labelledby="related-terms-title">
          <div>
            <p class="section-eyebrow">Verknüpfungen</p>
            <h2 id="related-terms-title">Verwandte Begriffe</h2>
          </div>
          <div class="term-chip-row">
            ${(term.relatedTerms || []).length ? term.relatedTerms.map(termLink).join("") : "<span class=\"term-chip muted\">Keine Einträge</span>"}
          </div>
        </section>${relatedContentBlock(term)}
        <section class="meta-box">
          <h2>Quellen, Status und Nutzung</h2>
          <p>Kategorie: ${esc(term.category || "Sensibler Begriff")} · Version: ${esc(term.version)}</p>
          ${sourceReferenceBlock(term)}
          <p>Rechtlicher Hinweis: Diese Seite ist eine begriffliche und wirkungsökonomische Einordnung. Sie ist keine Rechts-, Sozial-, Gesundheits-, Steuer-, Kredit-, Versicherungs-, Förder- oder Anlageberatung.</p>
          ${sourceList(term)}
        </section>
      </article>`;
}

function glossaryTermAliasPage(aliasLabel, targetSlug, targetLabel, note) {
  const label = targetLabel || targetSlug.replace(/-/g, " ");
  const explanation = note || `Dieser ältere oder alternative Begriff verweist auf die Glossar-Detailseite <a href="../${esc(targetSlug)}/">${esc(label)}</a>. Die Weiterleitung ist ein Alias und ersetzt keine eigene Bewertung.`;
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="https://wirkungsoekonomie.de/begriffe/${esc(targetSlug)}/">
    <meta http-equiv="refresh" content="0; url=../${esc(targetSlug)}/">
    <title>${esc(aliasLabel)} - Weiterleitung zum Glossarbegriff ${esc(label)}</title>
  </head>
  <body>
    <main>
      <h1>${esc(aliasLabel)}</h1>
      <p>${explanation}</p>
    </main>
  </body>
</html>
`;
}

function writeGlossaryTermAlias(aliasSlug, aliasLabel, targetSlug, targetLabel, note) {
  const dir = path.join(outDir, aliasSlug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), glossaryTermAliasPage(aliasLabel, targetSlug, targetLabel, note));
}

function sozialeInfrastrukturDetailBody(term) {
  return `      <article class="article-shell glossary-detail">
        <nav class="breadcrumb"><a href="../">Begriffe</a> / ${esc(term.canonicalLabel)}</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">WÖk-Präzisierungsbegriff / Architekturbegriff</p>
          <h1>${esc(term.canonicalLabel)}</h1>
          <p class="lead">Soziale Infrastruktur bezeichnet in der Wirkungsökonomie die Räume, Beziehungen, Dienste, Rechte, Institutionen und Schutzstrukturen, die Menschen Sicherheit, Gesundheit, Teilhabe, Selbstwirksamkeit, Zugehörigkeit und demokratische Handlungsfähigkeit ermöglichen.</p>
          <div class="term-meta-row" aria-label="Begriffsinformation">
            <span>Gesellschaft, Soziales &amp; Wirkungsarchitektur</span>
            <span>Keine Personenbewertung</span>
            <span>Exaktes Auto-Linking</span>
          </div>
          <div class="term-action-row">${detailLinks(term)}</div>
        </header>
        <section class="term-summary-card">
          <p class="section-eyebrow">Leitformel</p>
          <h2>Tragendes Netz gesellschaftlicher Handlungsfähigkeit</h2>
          <p>Soziale Infrastruktur ist das tragende Netz aus Räumen, Beziehungen, Diensten, Rechten, Institutionen und Schutzstrukturen, das Menschen ermöglicht, gesund, sicher, handlungsfähig, zugehörig und demokratisch wirksam zu leben.</p>
          <p>Eine Gesellschaft wird nicht nur durch Straßen, Stromnetze und Gebäude getragen, sondern durch Beziehungs-, Schutz-, Bildungs-, Gesundheits-, Beratungs-, Kultur-, Wohn-, Rechts- und Teilhabeinfrastrukturen. Wenn diese soziale Infrastruktur ausfällt, entstehen Ohnmacht, Einsamkeit, Ausschluss, Krankheit, Gewalt, Radikalisierung, Vertrauensverlust und demokratische Instabilität.</p>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Wirkungsökonomie</p>
          <h2>Einordnung</h2>
          <p>Soziale Infrastruktur ist kein Randthema der Sozialpolitik. Sie ist eine Grundbedingung für positive Wirkung im Alltag, verbindet Mensch und Demokratie und wirkt über Beziehungen, Zugänge, Orte, Rechte, Dienste und Institutionen. Sie macht Menschen handlungsfähig, statt sie nur zu versorgen.</p>
          <p>Sie ist messbar, aber nicht auf eine einzelne Zahl reduzierbar. In der Wirkungsökonomie ist sie Voraussetzung für positive Netto-Wirkung in Bildung, Gesundheit, Pflege, Wohnen, Migration, Arbeit, Kultur, Medien und Demokratie.</p>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Kernthese</p>
          <h2>Wirkungsnetz einer Gesellschaft</h2>
          <p>Die Wirkungsökonomie betrachtet soziale Infrastruktur als tragendes Wirkungsnetz einer Gesellschaft. Wo soziale Infrastruktur stark ist, entstehen Sicherheit, Zugehörigkeit, Gesundheit, Bildung, Pflege, Teilhabe, Vertrauen und Selbstwirksamkeit. Wo sie schwach ist, entstehen Ausschluss, Einsamkeit, Krankheit, Gewalt, Radikalisierung, Ohnmacht und Vertrauensverlust.</p>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Warum wichtig?</p>
          <h2>Unsichtbare Systemleistung sichtbar machen</h2>
          <p>Viele gesellschaftliche Leistungen bleiben im alten Kapitalmaßstab unsichtbar. Pflege, Erziehung, Nachbarschaft, Beratung, Kultur, Begegnung, Schutzräume, Prävention, Konfliktvermittlung und demokratische Alltagsarbeit erzeugen hohe Wirkleistung. Im alten System erscheinen sie oft als Kostenstelle oder private Aufgabe. In der WÖk werden sie als Systemleistung sichtbar: Prävention, Resilienz und Demokratiepflege statt spätere Reparaturkosten.</p>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Abgrenzung</p>
          <h2>Nicht verwechseln mit</h2>
          <div class="term-section-grid">
            <section class="term-section-card"><h3>Nicht nur Sozialstaat</h3><p>Soziale Infrastruktur umfasst mehr als staatliche Leistungen. Sie enthält auch Beziehungen, öffentliche Räume, zivilgesellschaftliche Strukturen, Kultur, Beratung, Selbsthilfe, digitale Zugänge und lokale Netzwerke.</p></section>
            <section class="term-section-card"><h3>Nicht nur Daseinsvorsorge</h3><p>Daseinsvorsorge meint oft Versorgung mit Grunddiensten. Soziale Infrastruktur ist breiter: Sie umfasst auch Zugehörigkeit, Schutz, Resonanz, Teilhabe, Beziehung und demokratische Handlungsfähigkeit.</p></section>
            <section class="term-section-card"><h3>Nicht nur physische Infrastruktur</h3><p>Straßen, Gebäude und Netze sind wichtig, aber soziale Infrastruktur umfasst auch Vertrauen, Rechte, Beratung, Pflege, Kultur, Bildung, Zugehörigkeit, digitale Teilhabe und Schutz vor Ausschluss.</p></section>
            <section class="term-section-card"><h3>Nicht Sozialromantik</h3><p>Ihr Ausfall erzeugt harte Kosten: Krankheit, Pflegekollaps, Bildungsdefizite, Gewalt, Obdachlosigkeit, Radikalisierung, Vertrauensverlust und demokratische Instabilität.</p></section>
            <section class="term-section-card"><h3>Nicht Personenbewertung</h3><p>Die WÖk bewertet nicht Menschen nach ihrem sozialen Verhalten. Sie prüft Strukturen, Zugänge, Schutzmechanismen und Zustandsveränderungen.</p></section>
          </div>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Bestandteile</p>
          <h2>Woraus soziale Infrastruktur besteht</h2>
          <div class="term-section-grid">
            <section class="term-section-card"><h3>Räume</h3>${listItems(["Wohnungen", "Nachbarschaften", "Schulen und Kitas", "Pflegeeinrichtungen und Gesundheitszentren", "Jugend- und Familienzentren", "Frauenhäuser und Schutzräume", "Kulturzentren, Bibliotheken, Sportvereine und Stadtteilzentren", "öffentliche Plätze und digitale öffentliche Räume"])}</section>
            <section class="term-section-card"><h3>Dienste</h3>${listItems(["Gesundheitsversorgung", "Pflege", "Beratung und Sozialarbeit", "Bildung und Kinderbetreuung", "Schuldnerberatung und Rechtshilfe", "Integrationsangebote", "psychologische Unterstützung", "Prävention, Konfliktvermittlung, Obdachlosenhilfe, Suchthilfe und Ausstiegsangebote", "Antidiskriminierungsstellen"])}</section>
            <section class="term-section-card"><h3>Beziehungen</h3>${listItems(["Familie und Freundschaft", "Nachbarschaft", "Care-Beziehungen", "zivilgesellschaftliche Netzwerke", "Ehrenamt, Vereine und Selbsthilfe", "Gemeinwesenarbeit", "demokratische Beteiligung", "Resonanzräume"])}</section>
            <section class="term-section-card"><h3>Rechte und Zugänge</h3>${listItems(["Zugang zu Bildung, Gesundheit, Wohnen und Rechtsschutz", "digitale Teilhabe", "Barrierefreiheit", "Diskriminierungsschutz", "Datenschutz", "Schutz vor Gewalt", "Beteiligungsrechte und Minderheitenschutz"])}</section>
            <section class="term-section-card"><h3>Institutionen</h3>${listItems(["Kommunen und Verwaltung", "Gerichte", "Schulen", "Gesundheitsämter", "Pflegekassen und Sozialträger", "Medien", "Kulturinstitutionen", "Zivilgesellschaft und Wissenschaft", "öffentliche Daten- und Beratungsinfrastruktur"])}</section>
          </div>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Wirkung</p>
          <h2>Was soziale Infrastruktur bewirkt</h2>
          <div class="term-section-grid">
            <section class="term-section-card"><h3>Mensch</h3>${listItems(["Sicherheit, Gesundheit und Würde", "Pflege, Bildung und Wohnsicherheit", "Teilhabe, Selbstwirksamkeit und Zugehörigkeit", "psychische Stabilität", "Schutz vor Gewalt, Armut und Ausschluss"])}</section>
            <section class="term-section-card"><h3>Demokratie</h3>${listItems(["Vertrauen und Rechtszugang", "Beteiligung und Diskursfähigkeit", "gesellschaftlicher Zusammenhalt", "Minderheitenschutz", "Resilienz gegen Radikalisierung", "Schutz vor Desinformation durch stabile Resonanzräume", "institutionelle Glaubwürdigkeit"])}</section>
            <section class="term-section-card"><h3>Planet</h3><p>Indirekt wirkt soziale Infrastruktur über gesunde Wohnräume, Mobilität, Hitzeresilienz, grüne Räume, lokale Versorgung, Energiezugang, Klimaanpassung und ökologische Quartiersgestaltung.</p></section>
          </div>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Ausfallrisiken</p>
          <h2>Negative Wirkung bei schwacher sozialer Infrastruktur</h2>
          ${listItems(["Einsamkeit", "Ohnmacht", "Gewalt", "Verwahrlosung", "Bildungsabbrüche", "psychische Belastung", "Pflegeüberlastung", "Obdachlosigkeit und Wohnungsunsicherheit", "Radikalisierung", "Vertrauensverlust", "Diskriminierung", "institutionelle Distanz", "Gesundheitskosten", "soziale Spaltung", "demokratische Destabilisierung"])}
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">WÖk-Formulierung</p>
          <h2>Unsichtbare Tragestruktur</h2>
          <p>Soziale Infrastruktur ist in der Wirkungsökonomie die unsichtbare Tragestruktur gesellschaftlicher Stabilität. Sie umfasst nicht nur Gebäude oder staatliche Leistungen, sondern auch Beziehungen, Schutzräume, Beratung, Pflege, Bildung, Kultur, Rechtsschutz, digitale Teilhabe und lokale Netzwerke. Sie entscheidet darüber, ob Menschen nicht nur versorgt, sondern wirklich handlungsfähig, sicher, zugehörig und wirksam werden.</p>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Wirkungsräume</p>
          <h2>Wo Alltag entsteht</h2>
          <p>Soziale Infrastruktur wirkt dort, wo Alltag entsteht: in Wohnungen, Schulen, Pflege, Gesundheit, Nachbarschaften, Kultur, Beratungsstellen, digitalen Räumen, Vereinen, Kommunen und öffentlichen Institutionen. Sie ist deshalb keine Zusatzleistung, sondern die Grundbedingung dafür, dass positive Netto-Wirkung für Mensch und Demokratie entstehen kann.</p>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Prüfstein</p>
          <h2>Sexarbeit als Prüfstein sozialer Infrastruktur</h2>
          <p><a class="text-link" href="../../begriffe/sexarbeit/">Sexarbeit</a> ist kein Synonym für soziale Infrastruktur. Sie kann aber ein Prüfstein dafür sein, ob soziale Infrastruktur auch dort schützt, wo Stigma, Armut, Gewalt- und Ausbeutungsrisiken, gesundheitliche Verwundbarkeit, Wohnungsunsicherheit, digitale Kontrolle oder fehlender Rechtsschutz besonders relevant sind. Wirkungsökonomisch wird nicht die Person bewertet, sondern ob Schutzräume, Beratung, Gesundheit, Rechtsschutz, Ausstiegsmöglichkeiten, Wohnsicherheit, Datenschutz und institutionelle Verantwortung funktionieren.</p>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">SDGs und SDG+</p>
          <h2>Referenzrahmen</h2>
          <p>Relevante SDGs sind SDG 1, SDG 3, SDG 4, SDG 5, SDG 8, SDG 10, SDG 11 und SDG 16. SDG+ ergänzt Demokratiequalität, Rechtsstaatlichkeit, Medienqualität, digitale Selbstbestimmung, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und Diskursfähigkeit.</p>
          <p>SDG+ ist eine transparente Erweiterung der Wirkungsökonomie, keine offizielle UN-Kategorie.</p>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Messlogik</p>
          <h2>Wie soziale Infrastruktur messbar wird</h2>
          <p>Soziale Infrastruktur darf nicht auf eine einzige Zahl reduziert werden. Sie kann aber über Wirkungsindikatoren, Sozialraumprofile, Teilhabeindikatoren, Gesundheitsindikatoren, Bildungsindikatoren, Wohnsicherheitsindikatoren, Schutzraumindikatoren, Kulturteilhabe, Pflegewirkung, digitale Teilhabe und Vertrauensindikatoren sichtbar gemacht werden.</p>
          ${listItems(["Zugang zu Gesundheitsversorgung und Pflege", "Kita- und Bildungszugang", "Wohnsicherheit, Mietbelastung und Obdachlosenhilfe", "Schutzräume und Beratungsstellen", "Barrierefreiheit und digitale Teilhabe", "Kulturzugang, Vereins- und Ehrenamtsdichte", "psychische Gesundheit und Einsamkeitsindikatoren", "soziale Mischung und Antidiskriminierungszugang", "Rechtsschutz und Vertrauen in Institutionen", "Beteiligung, Jugendperspektiven, Integrationsangebote, Care-Entlastung und Präventionswirkung"])}
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Rote Linien</p>
          <h2>Nicht kompensierbare Grenzen</h2>
          ${listItems(["fehlender Zugang zu Schutz vor Gewalt", "Obdachlosigkeit ohne Hilfestruktur", "institutionelle Diskriminierung", "systematische Ausgrenzung vulnerabler Gruppen", "fehlender Zugang zu lebensnotwendiger Gesundheitsversorgung", "fehlender Zugang zu Rechtsschutz", "Schutzräume ohne Erreichbarkeit oder Sicherheit", "digitale Ausschlüsse bei existenziellen Leistungen", "Kindeswohlgefährdung und Pflegegefährdung", "Menschenhandel, Zwang oder Ausbeutung im Schutzkontext", "Überwachung oder Scoring von Menschen unter dem Deckmantel sozialer Infrastruktur"])}
          <p>Diese roten Linien dürfen nicht durch positive Werte in anderen Bereichen kompensiert werden.</p>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Schutzbox</p>
          <h2>Keine Personenbewertung, keine Social-Credit-Logik</h2>
          <p>Soziale Infrastruktur darf nicht zur Kontrolle, Bevormundung, Personenbewertung oder Social-Credit-Logik werden. Die Wirkungsökonomie bewertet nicht Menschen, Lebensstile, Familienformen, Nachbarschaften oder private Beziehungen. Bewertet werden strukturelle Bedingungen: Zugang, Schutz, Qualität, Erreichbarkeit, Datenqualität, Wirkung, Ausfallrisiken und institutionelle Verantwortung.</p>
          <p>Soziale Infrastruktur darf nicht zu einer Scoring-Logik über Menschen werden. Sie soll Unterstützung, Teilhabe und Schutz ermöglichen - nicht Überwachung, Sanktionierung oder moralische Kontrolle.</p>
        </section>
        <section class="term-summary-card">
          <p class="section-eyebrow">Daten</p>
          <h2>Soziale Infrastruktur braucht Daten, aber keine Überwachung</h2>
          <p>Daten dürfen nur strukturelle Versorgung, Zugänge, Risiken und Wirkungen sichtbar machen. Keine individuellen Sozialprofile, keine Personenklassifikation, keine automatisierten Entscheidungen über einzelne Menschen und keine Zweckentfremdung sensibler Daten. Datenqualität und Datenschutz sind Teil der sozialen Infrastruktur.</p>
        </section>
        <section class="term-link-section" aria-labelledby="related-terms-title">
          <div>
            <p class="section-eyebrow">Verknüpfungen</p>
            <h2 id="related-terms-title">Verwandte Begriffe</h2>
          </div>
          <div class="term-chip-row">
            ${(term.relatedTerms || []).length ? term.relatedTerms.map(termLink).join("") : "<span class=\"term-chip muted\">Keine Einträge</span>"}
          </div>
        </section>${relatedContentBlock(term)}
        <section class="meta-box">
          <h2>Version und Quellen</h2>
          <p>Kategorie: ${esc(term.category || "Begriff")} · Version: ${esc(term.version)}</p>
          ${sourceReferenceBlock(term)}
          ${sourceList(term)}
        </section>
      </article>`;
}

for (const term of data.terms) {
  const dir = path.join(outDir, term.slug);
  fs.mkdirSync(dir, { recursive: true });
  const metaItems = [
    `Version ${esc(term.version)}`,
    term.conceptStatus || term.concept_status,
    term.publicationStatus || term.publication_status,
  ].filter(Boolean).map((item) => `<span>${esc(item)}</span>`).join("");
  const statusParagraph = term.conceptStatus || term.concept_status || term.publicationStatus || term.publication_status
    ? `          <p>Begriffstatus: ${esc(term.conceptStatus || term.concept_status || "nicht klassifiziert")} · Publikationsstatus: ${esc(term.publicationStatus || term.publication_status || "published")}</p>
`
    : "";
  const body = term.slug === "sexarbeit"
    ? sexarbeitDetailBody(term)
    : term.slug === "soziale-infrastruktur"
    ? sozialeInfrastrukturDetailBody(term)
    : `      <article class="article-shell glossary-detail">
        <nav class="breadcrumb"><a href="../">Begriffe</a> / ${esc(term.canonicalLabel)}</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">${esc(term.category || "Begriff")}</p>
          <h1>${esc(term.canonicalLabel)}</h1>
          <p class="lead">${esc(termLead(term))}</p>
          <div class="term-meta-row" aria-label="Begriffsinformation">
            ${metaItems}
          </div>
          <div class="term-action-row">${detailLinks(term)}</div>
        </header>
        <section class="term-summary-card" aria-labelledby="term-summary-title">
          <h2 id="term-summary-title">Auf einen Blick</h2>
          <p>${esc(termSummary(term))}</p>
        </section>
        <div class="term-section-grid">
          <section class="term-section-card">
            <p class="section-eyebrow">Definition</p>
            <h2>Was bedeutet der Begriff?</h2>
            ${termDefinitionHtml(term)}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Wirkungsökonomie</p>
            <h2>Warum ist das wichtig?</h2>
            ${termWhyHtml(term)}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Verwendung</p>
            <h2>So wird der Begriff genutzt</h2>
            ${termUsageHtml(term)}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Abgrenzung</p>
            <h2>Nicht verwechseln mit</h2>
            ${listItems(term.doNotConfuseWith)}
          </section>
        </div>
${termExtraBlock(term)}
${mythBlock(term)}
${learningBlock(term)}
${deepGlossarySectionsBlock(term)}
        <section class="term-link-section" aria-labelledby="related-terms-title">
          <div>
            <p class="section-eyebrow">Verknüpfungen</p>
            <h2 id="related-terms-title">Verwandte Begriffe</h2>
          </div>
          <div class="term-chip-row">
            ${(term.relatedTerms || []).length ? term.relatedTerms.map(termLink).join("") : "<span class=\"term-chip muted\">Keine Einträge</span>"}
          </div>
        </section>${relatedContentBlock(term)}
${chapterBlock(term)}
        <section class="meta-box">
          <h2>Version und Quellen</h2>
          <p>Kategorie: ${esc(term.category || "Begriff")} · Version: ${esc(term.version)}</p>
${statusParagraph}          ${sourceReferenceBlock(term)}
          ${sourceList(term)}
        </section>
      </article>`;
  const pageOptions = term.termId === "mensch-planet-demokratie"
    ? {
        metaTitle: "Mensch, Planet und Demokratie - verständliche Übersetzung von SDGs und SDG+",
        metaDescription: "Mensch, Planet und Demokratie sind die drei Oberbegriffe, mit denen die Wirkungsökonomie SDGs, Agenda 2030 und SDG+ öffentlich verständlich zusammenfasst.",
      }
    : {};
  if (term.metaTitle) pageOptions.metaTitle = term.metaTitle;
  if (term.metaDescription) pageOptions.metaDescription = term.metaDescription;
  fs.writeFileSync(path.join(dir, "index.html"), pageShell(term.canonicalLabel, body, "../../", pageOptions));
}

if (data.terms.some((term) => term.slug === "sexarbeit")) {
  const sexarbeitAliasNote = `Dieser ältere oder alternative Begriff verweist auf die sensible Glossar-Detailseite <a href="../sexarbeit/">Sexarbeit</a>. Die Weiterleitung ist ein Alias, keine Gleichsetzung mit Menschenhandel, Zwangsprostitution, sexueller Ausbeutung oder sexualisierter Gewalt.`;
  writeGlossaryTermAlias("prostitution", "Prostitution", "sexarbeit", "Sexarbeit", sexarbeitAliasNote);
  writeGlossaryTermAlias("sex-work", "Sex Work", "sexarbeit", "Sexarbeit", sexarbeitAliasNote);
}

if (data.terms.some((term) => term.slug === "soziale-infrastruktur")) {
  const sozialeInfrastrukturAliasNote = `Dieser ältere oder alternative Begriff verweist auf die Glossar-Detailseite <a href="../soziale-infrastruktur/">Soziale Infrastruktur</a>. Die Weiterleitung ist ein Alias für den Architekturbegriff und keine Reduktion auf eine einzelne Organisation, Leistung oder Institution.`;
  writeGlossaryTermAlias("sozialer-infrastruktur", "Sozialer Infrastruktur", "soziale-infrastruktur", "Soziale Infrastruktur", sozialeInfrastrukturAliasNote);
  writeGlossaryTermAlias("gesellschaftliche-infrastruktur", "Gesellschaftliche Infrastruktur", "soziale-infrastruktur", "Soziale Infrastruktur", sozialeInfrastrukturAliasNote);
  writeGlossaryTermAlias("zivilgesellschaftliche-infrastruktur", "Zivilgesellschaftliche Infrastruktur", "soziale-infrastruktur", "Soziale Infrastruktur", sozialeInfrastrukturAliasNote);
}

const reportLines = [
  "# Content-Reference-Report",
  "",
  `Erzeugt: ${new Date().toISOString()}`,
  `Resolved references: ${contentReferenceRecords.length}`,
  `Warnings: ${contentReferenceWarnings.length}`,
  "",
  "## Warnungen",
  "",
  ...(contentReferenceWarnings.length
    ? contentReferenceWarnings.slice(0, 500).map((warning) => `- [${warning.type}] ${warning.target}${warning.detail ? ` - ${warning.detail}` : ""}`)
    : ["Keine Warnungen."]),
  "",
  "## Aufgelöste Verweise",
  "",
  ...contentReferenceRecords.slice(0, 1000).map((record) => `- ${record.url || record.target} -> ${record.title} (${record.contentType}, Beschreibung: ${record.hasDescription ? "ja" : "nein"})`),
  "",
];
fs.writeFileSync("reports/content-reference-report.md", reportLines.join("\n"));

if (contentReferenceWarnings.length) {
  console.warn(`[content-reference] WARN ${contentReferenceWarnings.length} Hinweise, siehe reports/content-reference-report.md`);
}
console.log(`[content-reference] OK ${contentReferenceRecords.length} references resolved`);
console.log(`Wrote glossary index with ${indexedTerms.length} entries, regenerated ${data.terms.length} source-backed term pages and preserved ${legacyDetailTerms.length} legacy detail pages.`);
