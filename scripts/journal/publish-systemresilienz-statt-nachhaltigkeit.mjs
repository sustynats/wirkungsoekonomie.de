import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const sourcePath = process.env.JOURNAL_SOURCE_PATH || process.argv[2] || "Systemresilienz_statt_Nachhaltigkeit_Artikelpaket_SDGplus.docx";
const slug = "systemresilienz-statt-nachhaltigkeit";
const title = "Von Nachhaltigkeit zu Systemresilienz";
const subtitle = "Warum die SDGs wirkungsökonomisch als globales Risiko- und Resilienzregister gelesen werden sollten.";
const date = "2026-06-09";
const dateLabel = "9. Juni 2026";
const readingTime = "15 Min.";
const category = "SDG+ & Systemresilienz";
const image = "/assets/img/blog/2026-05-23-was-ist-nachhaltigkeit-wirklich.png";
const imageAlt = "Illustration zu Nachhaltigkeit, Systemresilienz, SDGs und Wirkung.";
const articlePath = path.join(root, "blog", slug, "index.html");
const registryPath = path.join(root, "assets", "data", "term-registry.json");
const journalIndexPath = path.join(root, "journal", "index.html");
const sourceDocument = `blog/${slug}/`;

const sourceMap = new Map([
  ["1", { label: "United Nations: Transforming our world - 2030 Agenda for Sustainable Development", url: "https://sdgs.un.org/2030agenda" }],
  ["2", { label: "United Nations: The 17 Sustainable Development Goals", url: "https://sdgs.un.org/goals" }],
  ["3", { label: "ISO: ISO 31000:2018 Risk management - Guidelines", url: "https://www.iso.org/standard/65694.html" }],
  ["4", { label: "IPCC: Climate Change 2023 - AR6 Synthesis Report", url: "https://www.ipcc.ch/report/ar6/syr/" }],
  ["5", { label: "UNDRR: Sendai Framework for Disaster Risk Reduction 2015-2030", url: "https://www.undrr.org/publication/sendai-framework-disaster-risk-reduction-2015-2030" }],
  ["6", { label: "European Commission: Corporate sustainability reporting / CSRD and ESRS", url: "https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en" }],
  ["7", { label: "Wirkungsökonomie: SDGs und SDG+ als Risiko- und Resilienzregister", url: "/bibliothek/sdgs-sdgplus-risiko-resilienzregister-systemresilienz/" }],
  ["8", { label: "Wirkungsökonomie-Glossar: Systemresilienz", url: "/begriffe/systemresilienz/" }],
  ["9", { label: "Wirkungsökonomie-Glossar: Risiko- und Resilienzregister", url: "/begriffe/risiko-und-resilienzregister/" }],
  ["10", { label: "Wirkungsökonomie-Glossar: Systemische Risikointelligenz", url: "/begriffe/systemische-risikointelligenz/" }],
  ["11", { label: "Wirkungsökonomie: SDG-/SDG+-Referenzrahmen", url: "/verstehen/sdgs-sdgplus/" }],
]);

const termLinks = [
  ["Risiko- und Resilienzregister", "../../begriffe/risiko-und-resilienzregister/"],
  ["Systemische Risikointelligenz", "../../begriffe/systemische-risikointelligenz/"],
  ["systemische Risikointelligenz", "../../begriffe/systemische-risikointelligenz/"],
  ["Systemresilienz", "../../begriffe/systemresilienz/"],
  ["Nachhaltigkeitsmanagement", "../../begriffe/nachhaltigkeitsmanagement/"],
  ["Wirkungsrisikomanagement", "../../begriffe/wirkungsrisikomanagement/"],
  ["Resilienzarchitektur", "../../begriffe/resilienzarchitektur/"],
  ["Risikomanagement", "../../begriffe/risikomanagement/"],
  ["Wirkungsdaten", "../../begriffe/wirkungsdaten/"],
  ["SDG+", "../../begriffe/sdg-plus/"],
  ["SDGs", "../../begriffe/sdgs/"],
];
const linkedTerms = new Set();

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function extract(source, startPattern, endPattern) {
  const start = source.search(startPattern);
  if (start < 0) throw new Error(`Start pattern not found: ${startPattern}`);
  const rest = source.slice(start);
  const endMatch = rest.match(endPattern);
  if (!endMatch?.index && endMatch?.index !== 0) throw new Error(`End pattern not found: ${endPattern}`);
  return rest.slice(0, endMatch.index + endMatch[0].length);
}

function headerFooter() {
  const source = fs.readFileSync(path.join(root, "blog", "der-versoehner-und-die-wellen", "index.html"), "utf8");
  return {
    header: extract(source, /<header class="site-header"/, /<\/header>/),
    footer: extract(source, /<footer class="footer"/, /<\/footer>/),
  };
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function docxParagraphs(docxPath) {
  if (!fs.existsSync(docxPath)) throw new Error(`DOCX nicht gefunden: ${docxPath}`);
  const tmp = execFileSync("mktemp", ["-d", "/tmp/woek-docx-XXXXXX"], { encoding: "utf8" }).trim();
  try {
    execFileSync("unzip", ["-q", docxPath, "word/document.xml", "-d", tmp]);
    const xml = fs.readFileSync(path.join(tmp, "word", "document.xml"), "utf8");
    return [...xml.matchAll(/<w:p[\s\S]*?<\/w:p>/g)]
      .map((match) => match[0])
      .map((paragraph) => [...paragraph.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((text) => decodeXml(text[1])).join(""))
      .map((text) => text.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function articleParts() {
  const paras = docxParagraphs(sourcePath);
  const start = paras.indexOf("Journalartikel");
  const end = paras.indexOf("LinkedIn-Artikel");
  if (start < 0 || end < 0) throw new Error("Journalartikel oder LinkedIn-Grenze im DOCX nicht gefunden.");
  const raw = paras.slice(start + 1, end);
  const docTitle = raw[0];
  const docSubtitle = raw[1];
  const abstractIndex = raw.indexOf("Abstract");
  const abstract = abstractIndex >= 0 ? raw[abstractIndex + 1] : "";
  const sourceIndex = raw.indexOf("Literatur und Bezugsquellen");
  const body = raw
    .slice((abstractIndex >= 0 ? abstractIndex + 2 : 2), sourceIndex >= 0 ? sourceIndex : raw.length)
    .filter((paragraph) => !/^Keywords:/i.test(paragraph))
    .map(cleanEditorialLanguage)
    .filter(Boolean);
  return { docTitle, docSubtitle, abstract, body };
}

function cleanEditorialLanguage(paragraph) {
  if (
    /LinkdIn|LinkedIn|Redaktions|Artikelpaket|Arbeitsstand|Entwurf|Fassung\s+f(?:ü|ue)r\s+LinkedIn|Fassung\s+f(?:ü|ue)r\s+das\s+Journal|Journal[- ]?Fassung|Journalfassung/i.test(paragraph)
  ) {
    return "";
  }
  if (paragraph === "7. Beispiele: Armin-Maiwaldisiert") return "7. Beispiele: Wie Systemresilienz praktisch sichtbar wird";
  if (paragraph.startsWith("Armin-Maiwald-Erklärung:")) {
    return paragraph.replace(/^Armin-Maiwald-Erklärung:\s*/, "Anschaulich gesagt: ");
  }
  return paragraph
    .replaceAll("Armin-Maiwaldisiert", "anschaulich erklärt")
    .replaceAll("armin-maiwaldisiert", "anschaulich erklärt");
}

function linkTerms(html) {
  let linked = html;
  for (const [term, href] of termLinks) {
    if (linkedTerms.has(term)) continue;
    const escapedTerm = esc(term);
    const index = linked.indexOf(escapedTerm);
    if (index < 0) continue;
    linked = `${linked.slice(0, index)}<a href="${href}">${escapedTerm}</a>${linked.slice(index + escapedTerm.length)}`;
    linkedTerms.add(term);
  }
  return linked;
}

function inline(value) {
  return linkTerms(esc(value))
    .replace(/\[(\d+)\]/g, (_, id) => {
      if (!sourceMap.has(id)) return `[${id}]`;
      return `<a href="#quelle-${id}" class="source-chip">[${id}]</a>`;
    });
}

function tableHtml(headA, headB, rows) {
  return `<div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>${esc(headA)}</th><th>${esc(headB)}</th></tr></thead>
              <tbody>
${rows.map(([a, b]) => `                <tr><td>${inline(a)}</td><td>${inline(b)}</td></tr>`).join("\n")}
              </tbody>
            </table>
          </div>`;
}

function bodyHtml(parts) {
  const html = [];
  const paragraphs = parts.body;
  for (let i = 0; i < paragraphs.length; i += 1) {
    const paragraph = paragraphs[i];
    if (paragraph === "SDG" && paragraphs[i + 1] === "Systemresilienz-Lesart") {
      const rows = [];
      i += 2;
      while (i + 1 < paragraphs.length && !paragraphs[i].startsWith("Diese Tabelle")) {
        rows.push([paragraphs[i], paragraphs[i + 1]]);
        i += 2;
      }
      html.push(tableHtml("SDG", "Systemresilienz-Lesart", rows));
      if (paragraphs[i]?.startsWith("Diese Tabelle")) html.push(`<p>${inline(paragraphs[i])}</p>`);
      continue;
    }
    if (paragraph === "SDG+ Feld" && paragraphs[i + 1] === "Systemresilienz-Lesart") {
      const rows = [];
      i += 2;
      while (i + 1 < paragraphs.length && !paragraphs[i].startsWith("Anschaulich gesagt")) {
        rows.push([paragraphs[i], paragraphs[i + 1]]);
        i += 2;
      }
      html.push(tableHtml("SDG+ Feld", "Systemresilienz-Lesart", rows));
      if (paragraphs[i]?.startsWith("Anschaulich gesagt")) html.push(`<p>${inline(paragraphs[i])}</p>`);
      continue;
    }
    if (/^\d+\.\s+/.test(paragraph)) {
      html.push(`<h2>${inline(paragraph.replace(/^\d+\.\s+/, ""))}</h2>`);
      continue;
    }
    if (paragraph.startsWith("Formel:") || paragraph.startsWith("Eine präzise Formel lautet:") || paragraph.startsWith("Die zentrale Formel lautet:")) {
      html.push(`<blockquote><p>${inline(paragraph)}</p></blockquote>`);
      continue;
    }
    if (paragraph === "Kompakte SDG+-Risikoübersicht:") {
      html.push(`<h3>${inline(paragraph.replace(/:$/, ""))}</h3>`);
      continue;
    }
    html.push(`<p>${inline(paragraph)}</p>`);
  }
  return html.join("\n          ");
}

function createTerm({
  id,
  label,
  type,
  status,
  shortDefinition,
  longDefinition,
  relatedTerms,
  aliases = [],
  examples = [],
  categoryLabel = "SDG+, Risiko und Systemresilienz",
}) {
  return {
    id,
    termId: id,
    canonicalLabel: label,
    label,
    slug: id,
    status,
    type,
    version: "1.0",
    source: `Journalbeitrag: ${title}`,
    sourceDocument,
    sourceSection: category,
    shortDefinition,
    hoverDefinition: shortDefinition,
    definition: shortDefinition,
    longDefinition,
    woekRelation: "Der Begriff präzisiert, wie Nachhaltigkeit, SDGs, SDG+ und Risikosteuerung in der Wirkungsökonomie als rückgekoppelte Systemfrage gelesen werden.",
    usageNote: "Im Kontext von SDG+, Resilienz, Governance und Wirkungssteuerung verwenden; nicht als bloßes Schlagwort ohne Daten- und Entscheidungsbezug.",
    doNotConfuseWith: ["reiner Nachhaltigkeitskommunikation", "isoliertem Berichtswesen", "unverbundener Projektlogik"],
    synonyms: aliases,
    aliases,
    relatedTerms,
    relatedDocuments: [sourceDocument, "bibliothek/sdgs-sdgplus-risiko-resilienzregister-systemresilienz/", "verstehen/sdgs-sdgplus/"],
    examples,
    preferredUsage: `${label} als steuerungsrelevanten Begriff mit Bezug zu Risiko, Rückkopplung und Wirkung erklären.`,
    deprecatedUsage: [`${label} als reines Kommunikationslabel ohne operative Steuerungsfunktion verwenden.`],
    reviewStatus: "approved",
    glossaryOrderKey: label.toLocaleLowerCase("de-DE"),
    firstApprovedIn: "2026.2",
    lastUpdated: date,
    category: categoryLabel,
    categories: ["resilienz", "sdg-plus", "wirkungslogik"],
    pageUrl: `/begriffe/${id}/`,
    classicGlossary: true,
    autoLinkAllowed: true,
  };
}

function addRelatedDocument(term, documentSlug) {
  const docs = Array.isArray(term.relatedDocuments) ? term.relatedDocuments : [];
  term.relatedDocuments = [documentSlug, ...docs.filter((item) => item !== documentSlug)];
  term.lastUpdated = date;
  return term;
}

function upsertTerms() {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const terms = Array.isArray(registry) ? registry : registry.terms;
  const nextTerms = [
    createTerm({
      id: "risikomanagement",
      label: "Risikomanagement",
      type: "Kontextbegriff",
      status: "kontextbegriff",
      shortDefinition: "Risikomanagement bezeichnet die systematische Identifikation, Bewertung, Behandlung, Überwachung und Kommunikation von Risiken in Strategie, Governance und Entscheidung.",
      longDefinition: "Risikomanagement macht Risiken entscheidungsfähig. In der Wirkungsökonomie wird es erweitert: Neben Risiken, die einen Akteur treffen, müssen auch Risiken betrachtet werden, die ein Akteur für Mensch, Planet, Demokratie, Lieferketten, Ökosysteme oder künftige Generationen erzeugt.",
      relatedTerms: ["systemresilienz", "systemische-risikointelligenz", "risiko-und-resilienzregister", "wirkungsrisikomanagement"],
      aliases: ["Risk Management", "Risiko-Management"],
      examples: ["Ein Unternehmen bewertet nicht nur Lieferausfälle, sondern auch Wasserstress, Arbeitsbedingungen und demokratische Resonanzschäden als Risikoinformationen."],
    }),
    createTerm({
      id: "nachhaltigkeitsmanagement",
      label: "Nachhaltigkeitsmanagement",
      type: "Kontextbegriff",
      status: "kontextbegriff",
      shortDefinition: "Nachhaltigkeitsmanagement organisiert Ziele, Daten, Programme und Berichte zu ökologischen, sozialen und Governance-Themen.",
      longDefinition: "Nachhaltigkeitsmanagement bleibt wichtig, reicht aber wirkungsökonomisch nur dann aus, wenn es in Strategie, Risikomanagement, Controlling, Beschaffung, Produktentwicklung, Kapitalplanung und Governance zurückwirkt. Sonst entsteht Berichtswesen neben den eigentlichen Entscheidungen.",
      relatedTerms: ["systemresilienz", "wirkungsarchitektur", "wirkungsdaten", "risikomanagement", "sdg-plus"],
      aliases: ["Sustainability Management", "ESG-Management"],
      examples: ["Eine Nachhaltigkeitsabteilung wird zur Resilienz- und Wirkungsarchitektur-Einheit, wenn ihre Daten Einkaufs-, Investitions- und Produktentscheidungen verändern."],
    }),
    createTerm({
      id: "resilienzarchitektur",
      label: "Resilienzarchitektur",
      type: "WÖk-Präzisierungsbegriff",
      status: "woek-praezisierungsbegriff",
      shortDefinition: "Resilienzarchitektur beschreibt die organisatorischen, datenbezogenen und institutionellen Strukturen, mit denen ein System Risiken erkennt, Rückkopplung organisiert und zentrale Funktionen schützt.",
      longDefinition: "Resilienzarchitektur verbindet Risikoerkennung, Datenqualität, Frühwarnsignale, Governance, Verantwortlichkeiten, Redundanzen, Lernschleifen und Entscheidungsprozesse. Sie macht Systemresilienz operativ: Nicht nur Berichte werden erstellt, sondern Entscheidungen werden verändert.",
      relatedTerms: ["systemresilienz", "wirkungsarchitektur", "systemische-risikointelligenz", "risiko-und-resilienzregister", "sdg-plus"],
      aliases: ["Resilience Architecture", "Resilienz-Architektur"],
      examples: ["Eine Stadt verbindet Hitzedaten, Gesundheitsdaten, Stadtgrün, Pflegekapazitäten und Haushaltsentscheidungen zu einer Resilienzarchitektur."],
    }),
    createTerm({
      id: "wirkungsrisikomanagement",
      label: "Wirkungsrisikomanagement",
      type: "WÖk-Prägungsbegriff",
      status: "woek-praegungsbegriff",
      shortDefinition: "Wirkungsrisikomanagement erweitert klassisches Risikomanagement um die Frage, welche Risiken ein Akteur durch seine Wirkungen selbst erzeugt.",
      longDefinition: "Wirkungsrisikomanagement fragt doppelt: Welche Risiken treffen uns, und welche Risiken erzeugen wir für andere Systeme? Dadurch werden externalisierte Schäden, Rückkopplungen, Haftung, Vertrauensverlust, Versicherbarkeit, Lieferkettenbrüche und demokratische Resonanzschäden steuerbar.",
      relatedTerms: ["systemische-risikointelligenz", "systemresilienz", "risikomanagement", "positive-netto-wirkung", "wirkungsdaten"],
      aliases: ["wirkungsorientiertes Risikomanagement", "Impact Risk Management"],
      examples: ["Ein Produkt wird nicht nur auf Markt- und Haftungsrisiken geprüft, sondern auch auf Wasserstress, Emissionen, Arbeitsbedingungen und demokratische Folgewirkungen."],
    }),
  ];

  for (const term of nextTerms) {
    const index = terms.findIndex((item) => item.termId === term.termId || item.slug === term.slug);
    if (index >= 0) terms[index] = { ...terms[index], ...term };
    else terms.push(term);
  }

  for (const relatedSlug of ["systemresilienz", "risiko-und-resilienzregister", "systemische-risikointelligenz", "sdg-plus", "sdgs", "wirkungsarchitektur"]) {
    const index = terms.findIndex((item) => item.termId === relatedSlug || item.slug === relatedSlug || item.id === relatedSlug);
    if (index >= 0) terms[index] = addRelatedDocument(terms[index], sourceDocument);
  }

  fs.writeFileSync(registryPath, `${JSON.stringify(Array.isArray(registry) ? terms : { ...registry, terms }, null, 2)}\n`);
}

function articleHtml() {
  const parts = articleParts();
  const { header, footer } = headerFooter();
  const sourceItems = [...sourceMap.entries()]
    .map(([id, ref]) => `              <li id="quelle-${id}"><a href="${esc(ref.url)}">${esc(ref.label)}</a></li>`)
    .join("\n");
  const tags = ["Systemresilienz", "SDGs", "SDG+", "Risiko- und Resilienzregister", "Risikomanagement", "Nachhaltigkeitsmanagement", "Wirkungsökonomie"];
  const body = `
    <main id="inhalt" data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../blog.html">Journal</a> / ${esc(title)}</nav>
          <p class="hero-kicker">Journal · ${esc(category)} · ${esc(dateLabel)} · ${esc(readingTime)}</p>
          <h1 class="hero-title">${esc(parts.docTitle || title)}</h1>
          <p class="hero-subtitle">${esc(parts.docSubtitle || subtitle)}</p>
          <p class="meta">Von Natalie Weber - Wirkungsökonomie</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="../..${image}" width="1672" height="941" alt="${esc(imageAlt)}" decoding="async" fetchpriority="high">
          <figcaption>Nachhaltigkeit bleibt der Anschlussbegriff. Systemresilienz wird der operative Steuerungsbegriff.</figcaption>
        </figure>
      </article>

      <section class="article-page">
        <div class="article-body">
          <div class="callout">
            <p><strong>Kernthese:</strong> Die SDGs sind wirkungsökonomisch nicht nur eine Nachhaltigkeitsagenda. Sie lassen sich als globales Risiko- und Resilienzregister lesen - ergänzt um SDG+ für Demokratie, Medien, Rechtsstaatlichkeit, digitale Verantwortung und öffentliche Rechenschaft.</p>
          </div>

          <section class="term-summary-card">
            <p class="section-eyebrow">Abstract</p>
            <p>${inline(parts.abstract)}</p>
          </section>

          ${bodyHtml(parts)}

          <section class="term-link-section">
            <div>
              <p class="section-eyebrow">Glossar</p>
              <h2>Begriffe zum Beitrag</h2>
            </div>
            <div class="term-chip-row">
              <a class="term-chip" href="../../begriffe/systemresilienz/">Systemresilienz</a>
              <a class="term-chip" href="../../begriffe/risiko-und-resilienzregister/">Risiko- und Resilienzregister</a>
              <a class="term-chip" href="../../begriffe/systemische-risikointelligenz/">Systemische Risikointelligenz</a>
              <a class="term-chip" href="../../begriffe/risikomanagement/">Risikomanagement</a>
              <a class="term-chip" href="../../begriffe/nachhaltigkeitsmanagement/">Nachhaltigkeitsmanagement</a>
              <a class="term-chip" href="../../begriffe/resilienzarchitektur/">Resilienzarchitektur</a>
              <a class="term-chip" href="../../begriffe/wirkungsrisikomanagement/">Wirkungsrisikomanagement</a>
              <a class="term-chip" href="../../begriffe/sdg-plus/">SDG+</a>
              <a class="term-chip" href="../../bibliothek/sdgs-sdgplus-risiko-resilienzregister-systemresilienz/">Dossier lesen</a>
            </div>
          </section>

          <section class="term-summary-card">
            <p class="section-eyebrow">Quellenstand</p>
            <h2>Quellen und weiterführende WÖk-Kontexte</h2>
            <p>Daten- und Quellenstand der redaktionellen Fassung: ${esc(dateLabel)}.</p>
            <ol class="source-list">
${sourceItems}
            </ol>
          </section>
        </div>
      </section>
    </main>`;

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} - Journal der Wirkungsökonomie</title>
    <meta name="description" content="${esc(subtitle)}">
    <meta name="search_title" content="${esc(title)}">
    <meta name="search_description" content="Die SDGs als globales Risiko- und Resilienzregister: Warum Systemresilienz der präzisere operative Begriff für Nachhaltigkeit, SDG+ und Wirkungssteuerung ist.">
    <meta name="search_section" content="Journal">
    <meta name="search_type" content="Journalartikel">
    <link rel="canonical" href="https://wirkungsoekonomie.de/blog/${slug}/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(subtitle)}">
    <meta property="og:url" content="https://wirkungsoekonomie.de/blog/${slug}/">
    <meta property="og:image" content="https://wirkungsoekonomie.de${image}">
    <meta property="og:image:alt" content="${esc(imageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(subtitle)}">
    <meta name="twitter:image" content="https://wirkungsoekonomie.de${image}">
    <meta name="twitter:image:alt" content="${esc(imageAlt)}">
    <meta property="article:published_time" content="${date}T00:00:00+02:00">
    <meta property="article:modified_time" content="${date}T00:00:00+02:00">
    <meta property="article:section" content="${esc(category)}">
    ${tags.map((tag) => `<meta property="article:tag" content="${esc(tag)}">`).join("\n    ")}
    <link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: subtitle,
      url: `https://wirkungsoekonomie.de/blog/${slug}/`,
      image: `https://wirkungsoekonomie.de${image}`,
      inLanguage: "de",
      datePublished: `${date}T00:00:00+02:00`,
      dateModified: `${date}T00:00:00+02:00`,
      author: { "@type": "Person", name: "Natalie Weber" },
      publisher: { "@type": "Organization", name: "Wirkungsökonomie", url: "https://wirkungsoekonomie.de" },
      articleSection: category,
      keywords: tags,
    }, null, 2)}</script>
  </head>
  <body>
${header}
${body}
${footer}
    <script src="../../assets/js/main.js?v=20260612-mobile-table-fix"></script>
  </body>
</html>
`.replace(/[ \t]+$/gm, "");
}

function upsertJournalIndex() {
  if (!fs.existsSync(journalIndexPath)) return;
  let current = fs.readFileSync(journalIndexPath, "utf8");
  current = current.replace(new RegExp(`\\s*<article class="card">[\\s\\S]*?\\.\\./blog/${slug}/[\\s\\S]*?</article>`, "g"), "");
  const card = `          <article class="card">
            <p class="card-kicker">${esc(category)} · ${esc(dateLabel)}</p>
            <h3 class="card-title">${esc(title)}</h3>
            <p class="card-text">Warum die SDGs als Risiko- und Resilienzregister gelesen werden können - und weshalb SDG+ dafür Demokratie, Medien, Recht und digitale Verantwortung sichtbar machen muss.</p>
            <div class="portal-card-actions"><a class="text-link" href="../blog/${slug}/">Artikel lesen</a></div>
          </article>
`;
  const next = current.replace(/(<div class="card-grid three">\n)/, `$1${card}`);
  fs.writeFileSync(journalIndexPath, next);
}

fs.mkdirSync(path.dirname(articlePath), { recursive: true });
fs.writeFileSync(articlePath, articleHtml());
upsertTerms();
upsertJournalIndex();
console.log(`Published journal article: blog/${slug}/index.html`);
