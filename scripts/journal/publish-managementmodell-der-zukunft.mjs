import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const sourcePath =
  process.env.JOURNAL_SOURCE_PATH ||
  process.argv[2] ||
  "Das Managementmodell der Zukunft.docx";
const slug = "das-managementmodell-der-zukunft";
const title = "Das Managementmodell der Zukunft";
const subtitle = "Warum wir nicht zu wenig managen - sondern mit dem falschen Kompass";
const description =
  "Warum klassische Managementmodelle wichtige Ausschnitte beherrschen, aber erst WÖMM und WÖMS Wirkung, Realisierung, Resilienz und Lernen durchgängig verbinden.";
const date = "2026-07-10";
const dateLabel = "10. Juli 2026";
const readingTime = "18 Min.";
const category = "Management & Wirkung";
const image = "/assets/img/blog/2026-07-10-das-managementmodell-der-zukunft.webp";
const imageAlt =
  "Das Managementmodell der Zukunft mit Wirkungskompass und den Wirkungsräumen Mensch, Planet, Demokratie, Unternehmen, Staat, Finanzsystem, Öffentlichkeit und Technologie.";
const articlePath = path.join(root, "blog", slug, "index.html");
const registryPath = path.join(root, "assets", "data", "term-registry.json");
const sourceDocument = `blog/${slug}/`;

const sourceMap = [
  {
    label: "World Economic Forum: Global Risks Report 2026",
    url: "https://www.weforum.org/publications/global-risks-report-2026/",
  },
  {
    label: "European Banking Authority: Guidelines on the management of ESG risks",
    url: "https://www.eba.europa.eu/publications-and-media/press-releases/eba-publishes-its-final-guidelines-management-esg-risks",
  },
  {
    label: "ECB Banking Supervision: Supervisory priorities 2026-28",
    url: "https://www.bankingsupervision.europa.eu/framework/priorities/html/ssm.supervisory_priorities202511.en.html",
  },
  {
    label: "EIOPA: Digital Operational Resilience Act (DORA)",
    url: "https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en",
  },
  {
    label: "European Commission: NIS2 Directive",
    url: "https://digital-strategy.ec.europa.eu/en/policies/nis2-directive",
  },
  {
    label: "European Commission: Digital Services Act",
    url: "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act",
  },
  {
    label: "V-Dem Institute: Democracy Report 2026",
    url: "https://www.v-dem.net/documents/75/V-Dem_Institute_Democracy_Report_2026_lowres.pdf",
  },
  {
    label: "Die Bundeswahlleiterin: Endgültiges Ergebnis der Bundestagswahl 2025",
    url: "https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/bund-99.html",
  },
  {
    label: "Wirkungsökonomisches Managementmodell WÖMM 2.0",
    url: "/bibliothek/eintraege/woemm-2-0/",
  },
  {
    label: "Wirkungsökonomisches Methodensystem WÖMS 2.0",
    url: "/bibliothek/eintraege/woems-2-0/",
  },
];

const citationReplacements = new Map([
  ["(World Economic Forum)", '<a class="source-chip" href="#quelle-1">[1]</a>'],
  ["(Europäische Bankenaufsicht)", '<a class="source-chip" href="#quelle-2">[2]</a>'],
  ["(Bankenaufsicht)", '<a class="source-chip" href="#quelle-3">[3]</a>'],
  ["(EIOPA)", '<a class="source-chip" href="#quelle-4">[4]</a> <a class="source-chip" href="#quelle-5">[5]</a>'],
  ["(Digitale Strategie der EU)", '<a class="source-chip" href="#quelle-6">[6]</a>'],
  ["(V-Dem)", '<a class="source-chip" href="#quelle-7">[7]</a>'],
  ["(Bundeswahlleiterin)", '<a class="source-chip" href="#quelle-8">[8]</a>'],
]);

const glossaryLinks = [
  ["Wirkungsökonomische Managementmodell", "wirkungsoekonomisches-managementmodell"],
  ["Wirkungsökonomisches Managementmodell", "wirkungsoekonomisches-managementmodell"],
  ["Wirkungsökonomische Methodensystem", "wirkungsoekonomisches-methodensystem"],
  ["Wirkungsökonomisches Methodensystem", "wirkungsoekonomisches-methodensystem"],
  ["Wirkungsrealisierungsarchitektur", "wirkungsrealisierungsarchitektur"],
  ["Nichtkompensationsprinzip", "nichtkompensationsprinzip"],
  ["positive Netto-Wirkung", "positive-netto-wirkung"],
  ["Wirkungskompass", "wirkungskompass"],
  ["Systemlandkarte", "systemlandkarte"],
];

const topLevelHeadings = new Set([
  "Die alten Modelle funktionieren – aber nur für einen Teil des Problems",
  "Eine ausgewogene Steuerung kann auch sehr ausgewogen in die falsche Richtung führen",
  "Auch Design Thinking sieht häufig nur den Menschen, der am Tisch sitzt",
  "Die Welt ist inzwischen stärker vernetzt als unsere Managementmodelle",
  "Die Regulierung hat den Wandel bereits begonnen",
  "Auch Öffentlichkeit und Demokratie sind Managementthemen",
  "Der politische Rechtsruck ist kein äußeres Nebengeräusch",
  "Der eigentliche Fehler liegt im Maßstab",
  "Warum Mensch, Planet und Demokratie zusammengehören",
  "Das WÖMM: ein neues Betriebssystem für Management",
  "Die neue Erfolgsformel",
  "Das WÖMS: vom Modell zum Werkzeug",
  "Wie aus Design Thinking Wirkungsdesign wird",
  "Wozu Capability Maps gebraucht werden",
  "Warum Change Management trotzdem unverzichtbar bleibt",
  "Mehr als Unternehmensmanagement",
  "Kein Social Credit, keine Technokratie, keine Planwirtschaft",
  "Was sich am Montagmorgen verändert",
  "Das Modell muss sich beweisen",
  "Die Zukunft des Managements ist Wirkung",
]);

const subHeadings = new Set([
  "1. Der Wirkungskompass",
  "2. Die Systemlandkarte",
  "3. Die Managementarchitektur",
  "4. Die Wirkungsrealisierungsarchitektur",
  "5. Das Wirkungsrad",
  "6. Das organisatorische Betriebssystem",
  "Beim Staat",
  "Bei Banken",
  "Bei Medien",
  "In Wissenschaft und Bildung",
  "In Kommunen und Sozialräumen",
]);

const methodList = new Set([
  "Probleme und Systemzusammenhänge verstehen,",
  "Zukunftsszenarien entwickeln,",
  "Betroffene und Wirkungsempfänger erkennen,",
  "Wirkmechanismen prüfen,",
  "Lösungen gestalten,",
  "Geschäftsmodelle entwickeln,",
  "Fähigkeiten und Prozesse aufbauen,",
  "Veränderungen organisieren,",
  "Adoption messen,",
  "Risiken und Resilienz prüfen,",
  "Wirkung beobachten,",
  "lernen und nachsteuern.",
]);

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
  const paragraphs = docxParagraphs(sourcePath);
  const sourceStart = paragraphs.indexOf("Interne Grundlagen");
  if (paragraphs[0] !== title || sourceStart < 0) throw new Error("Die erwartete Artikelstruktur wurde im DOCX nicht gefunden.");
  return {
    docTitle: paragraphs[0],
    docSubtitle: paragraphs[1],
    author: paragraphs[2].replace(/^Von\s+/, ""),
    body: paragraphs.slice(3, sourceStart).map((paragraph) =>
      paragraph.replaceAll("(Bancaufsicht)", "(Bankenaufsicht)")
    ),
  };
}

const linkedTerms = new Set();

function inline(value) {
  let html = esc(value);
  for (const [needle, replacement] of citationReplacements) html = html.replaceAll(esc(needle), replacement);
  for (const [label, termSlug] of glossaryLinks) {
    if (linkedTerms.has(termSlug)) continue;
    const index = html.indexOf(esc(label));
    if (index < 0) continue;
    const linked = `<a href="../../begriffe/${termSlug}/">${esc(label)}</a>`;
    html = `${html.slice(0, index)}${linked}${html.slice(index + esc(label).length)}`;
    linkedTerms.add(termSlug);
  }
  return html;
}

function bodyHtml(parts) {
  const html = [];
  let listOpen = false;
  const closeList = () => {
    if (listOpen) html.push("</ul>");
    listOpen = false;
  };

  for (const paragraph of parts.body) {
    if (topLevelHeadings.has(paragraph)) {
      closeList();
      html.push(`<h2>${inline(paragraph)}</h2>`);
      continue;
    }
    if (subHeadings.has(paragraph)) {
      closeList();
      html.push(`<h3>${inline(paragraph)}</h3>`);
      continue;
    }
    if (methodList.has(paragraph)) {
      if (!listOpen) {
        html.push('<ul class="check-list">');
        listOpen = true;
      }
      html.push(`<li>${inline(paragraph.replace(/[,.]$/, ""))}</li>`);
      continue;
    }
    closeList();
    if (
      paragraph === "Positive Netto-Wirkung × wirtschaftliche Tragfähigkeit × Resilienz × Lernfähigkeit" ||
      paragraph.includes("Wirkungsziel → Strategie → Fähigkeiten") ||
      paragraph === "Problem–Wirkungs–System–Markt-Fit" ||
      paragraph === "Positive Netto-Wirkung für Mensch, Planet und Demokratie."
    ) {
      html.push(`<blockquote><p>${inline(paragraph)}</p></blockquote>`);
      continue;
    }
    html.push(`<p>${inline(paragraph)}</p>`);
  }
  closeList();
  return html.join("\n          ");
}

function linkGlossaryTerms() {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const terms = Array.isArray(registry) ? registry : registry.terms;
  const relatedSlugs = new Set(glossaryLinks.map(([, termSlug]) => termSlug));
  for (const term of terms) {
    const termSlug = term.slug || term.termId || term.id;
    if (!relatedSlugs.has(termSlug)) continue;
    const docs = Array.isArray(term.relatedDocuments) ? term.relatedDocuments : [];
    term.relatedDocuments = [sourceDocument, ...docs.filter((document) => document !== sourceDocument)];
    term.lastUpdated = date;
  }
  fs.writeFileSync(registryPath, `${JSON.stringify(Array.isArray(registry) ? terms : { ...registry, terms }, null, 2)}\n`);
}

function articleHtml() {
  const parts = articleParts();
  const { header, footer } = headerFooter();
  const tags = ["WÖMM", "WÖMS", "Management", "Wirkungsdesign", "Resilienz", "Positive Netto-Wirkung"];
  const sources = sourceMap
    .map((source, index) => `              <li id="quelle-${index + 1}"><a href="${esc(source.url)}">${esc(source.label)}</a></li>`)
    .join("\n");
  const body = `
    <main id="inhalt" data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../blog.html">Journal</a> / ${esc(title)}</nav>
          <p class="hero-kicker">Journal · ${esc(category)} · ${esc(dateLabel)} · ${esc(readingTime)}</p>
          <h1 class="hero-title">${esc(parts.docTitle)}</h1>
          <p class="hero-subtitle">${esc(parts.docSubtitle)}</p>
          <p class="meta">Von ${esc(parts.author)} - Wirkungsökonomie</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="../..${image}" width="1672" height="941" alt="${esc(imageAlt)}" decoding="async" fetchpriority="high">
          <figcaption>Vom isolierten Kennzahlensystem zur lernenden Wirkungsarchitektur.</figcaption>
        </figure>
      </article>

      <section class="article-page">
        <div class="article-body">
          <div class="callout">
            <p><strong>Kernthese:</strong> Die etablierten Managementmethoden bleiben wertvoll. WÖMM und WÖMS geben ihnen einen gemeinsamen Kompass, erweitern ihren Systemrand und verbinden Strategie mit realisierter Wirkung.</p>
          </div>

          <section class="term-summary-card">
            <p class="section-eyebrow">Abstract</p>
            <p>Organisationen steuern immer professioneller und können dennoch systematisch in die falsche Richtung optimieren. Der Beitrag zeigt, wo klassische Managementmodelle richtungsneutral bleiben, wie WÖMM Wirkung, Tragfähigkeit, Resilienz und Lernfähigkeit ordnet und wie WÖMS diese Logik in Methoden, Canvas und Workshop-Journeys übersetzt.</p>
          </section>

          ${bodyHtml(parts)}

          <section class="term-link-section">
            <div>
              <p class="section-eyebrow">Weiterarbeiten</p>
              <h2>Begriffe und Grundlagen</h2>
            </div>
            <div class="term-chip-row">
              <a class="term-chip" href="../../begriffe/wirkungsoekonomisches-managementmodell/">WÖMM</a>
              <a class="term-chip" href="../../begriffe/wirkungsoekonomisches-methodensystem/">WÖMS</a>
              <a class="term-chip" href="../../begriffe/wirkungskompass/">Wirkungskompass</a>
              <a class="term-chip" href="../../begriffe/systemlandkarte/">Systemlandkarte</a>
              <a class="term-chip" href="../../begriffe/wirkungsrealisierungsarchitektur/">Wirkungsrealisierungsarchitektur</a>
              <a class="term-chip" href="../../begriffe/nichtkompensationsprinzip/">Nichtkompensation</a>
              <a class="term-chip" href="../../bibliothek/eintraege/woemm-2-0/">WÖMM 2.0</a>
              <a class="term-chip" href="../../bibliothek/eintraege/woems-2-0/">WÖMS 2.0</a>
            </div>
          </section>

          <section class="term-summary-card">
            <p class="section-eyebrow">Quellenstand</p>
            <h2>Quellen und Grundlagen</h2>
            <p>Quellen- und Redaktionsstand: ${esc(dateLabel)}. Die WÖMM-/WÖMS-Referenzfassungen sind eigene Grundlagenpublikationen der Wirkungsökonomie; die weiteren Links führen zu den im Beitrag genannten Primärquellen.</p>
            <ol class="source-list">
${sources}
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
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title)}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="Journal">
    <meta name="search_type" content="Journalartikel">
    <link rel="canonical" href="https://wirkungsoekonomie.de/blog/${slug}/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="https://wirkungsoekonomie.de/blog/${slug}/">
    <meta property="og:image" content="https://wirkungsoekonomie.de${image}">
    <meta property="og:image:alt" content="${esc(imageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="https://wirkungsoekonomie.de${image}">
    <meta name="twitter:image:alt" content="${esc(imageAlt)}">
    <meta property="article:published_time" content="${date}T14:00:00+02:00">
    <meta property="article:modified_time" content="${date}T14:00:00+02:00">
    <meta property="article:section" content="${esc(category)}">
    ${tags.map((tag) => `<meta property="article:tag" content="${esc(tag)}">`).join("\n    ")}
    <link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description,
      url: `https://wirkungsoekonomie.de/blog/${slug}/`,
      image: `https://wirkungsoekonomie.de${image}`,
      inLanguage: "de",
      datePublished: `${date}T14:00:00+02:00`,
      dateModified: `${date}T14:00:00+02:00`,
      author: { "@type": "Person", name: parts.author },
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

fs.mkdirSync(path.dirname(articlePath), { recursive: true });
fs.writeFileSync(articlePath, articleHtml());
linkGlossaryTerms();
console.log(`Published journal article: blog/${slug}/index.html`);
