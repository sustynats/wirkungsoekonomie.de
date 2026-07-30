import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const sourcePath = process.env.JOURNAL_SOURCE_PATH || process.argv[2] || "Systemresilienz_statt_Nachhaltigkeit_Artikelpaket_SDGplus.docx";
const slug = "systemresilienz-statt-nachhaltigkeit";
const title = "Nachhaltigkeit ist Systemresilienz";
const subtitle = "Die SDGs als globales Risiko- und Resilienzregister";
const deck = "Ein wirkungsökonomischer Beitrag zur Neuausrichtung von Nachhaltigkeitsmanagement als Risiko-, Rückkopplungs-, Regenerations- und Lernarchitektur.";
const date = "2026-06-09";
const dateLabel = "9. Juni 2026";
const modifiedDate = "2026-07-30";
const modifiedDateLabel = "30. Juli 2026";
const readingTime = "24 Min.";
const category = "SDG+ & Systemresilienz";
const image = "/assets/img/blog/2026-05-23-was-ist-nachhaltigkeit-wirklich.png";
const imageAlt = "Illustration zu Nachhaltigkeit, Systemresilienz, SDGs und Wirkung.";
const articlePath = path.join(root, "blog", slug, "index.html");
const blogIndexPath = path.join(root, "assets", "data", "blog-index.json");
const registryPath = path.join(root, "assets", "data", "term-registry.json");
const journalIndexPath = path.join(root, "journal", "index.html");
const sourceDocument = `blog/${slug}/`;

const sourceMap = new Map([
  ["1", { label: "Holling, C. S. (1973): Resilience and Stability of Ecological Systems. Annual Review of Ecology and Systematics, 4, 1-23.", url: "https://doi.org/10.1146/annurev.es.04.110173.000245" }],
  ["2", { label: "Carpenter, S. R.; Walker, B.; Anderies, J. M.; Abel, N. (2001): From Metaphor to Measurement: Resilience of What to What? Ecosystems, 4, 765-781.", url: "https://doi.org/10.1007/s10021-001-0045-9" }],
  ["3", { label: "Walker, B.; Holling, C. S.; Carpenter, S. R.; Kinzig, A. (2004): Resilience, Adaptability and Transformability in Social-Ecological Systems. Ecology and Society, 9(2), Article 5.", url: "https://www.ecologyandsociety.org/vol9/iss2/art5/" }],
  ["4", { label: "Folke, C. (2006): Resilience: The Emergence of a Perspective for Social-Ecological Systems Analyses. Global Environmental Change, 16(3), 253-267.", url: "https://doi.org/10.1016/j.gloenvcha.2006.04.002" }],
  ["5", { label: "IPCC (2022): Climate Change 2022 - Impacts, Adaptation and Vulnerability. Annex II: Glossary.", url: "https://www.ipcc.ch/report/ar6/wg2/chapter/annex-ii/" }],
  ["6", { label: "United Nations (2015): Transforming our world: the 2030 Agenda for Sustainable Development.", url: "https://sdgs.un.org/2030agenda" }],
  ["7", { label: "UNDRR (2015): Sendai Framework for Disaster Risk Reduction 2015-2030.", url: "https://www.undrr.org/publication/sendai-framework-disaster-risk-reduction-2015-2030" }],
  ["8", { label: "International Organization for Standardization (2018): ISO 31000:2018 Risk management - Guidelines.", url: "https://www.iso.org/standard/65694.html" }],
  ["9", { label: "Weber, Natalie (2026): Die neue Ordnung des Wohlstands. Kapitel zu Wirkungsrisiko, Wirkungsresilienz, Resilienzstaat und Nachhaltigkeit als Systemarchitektur.", url: "/assets/pdf/die-neue-ordnung-des-wohlstands.pdf" }],
]);

const termLinks = [
  ["Risiko- und Resilienzregister", "../../begriffe/risiko-und-resilienzregister/"],
  ["Systemische Risikointelligenz", "../../begriffe/systemische-risikointelligenz/"],
  ["systemische Risikointelligenz", "../../begriffe/systemische-risikointelligenz/"],
  ["Systemresilienz", "../../begriffe/systemresilienz/"],
  ["Wirkungsresilienz", "../../begriffe/wirkungsresilienz/"],
  ["Resilienz", "../../begriffe/resilienz/"],
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
  const start = paras.findIndex((paragraph) => paragraph.startsWith("JOURNAL") && paragraph.includes("SYSTEMRESILIENZ"));
  const sourceIndex = paras.indexOf("Quellen und wissenschaftliche Bezugslinien");
  if (start < 0 || sourceIndex < 0 || sourceIndex <= start) {
    throw new Error("Publikationsfertige Journalfassung oder Quellenabschnitt im DOCX nicht gefunden.");
  }
  const raw = paras.slice(start, sourceIndex);
  const docTitle = raw[1] || title;
  const docSubtitle = raw[2] || subtitle;
  const docDeck = raw[3] || deck;
  const author = raw[4] || "Von Natalie Weber - Begründerin der Wirkungsökonomie";
  const coreIndex = raw.indexOf("Kernthese");
  const abstractIndex = raw.indexOf("Abstract");
  const bodyStart = raw.indexOf("Einleitung: Warum „Nachhaltigkeit“ allein operativ nicht genügt");
  if (coreIndex < 0 || abstractIndex < 0 || bodyStart < 0) {
    throw new Error("Kernthese, Abstract oder Einleitung im DOCX nicht gefunden.");
  }
  const coreThesis = raw[coreIndex + 1] || "";
  const abstract = raw.slice(abstractIndex + 1, bodyStart);
  const body = raw
    .slice(bodyStart)
    .map(cleanEditorialLanguage)
    .filter(Boolean);
  return { docTitle, docSubtitle, docDeck, author, coreThesis, abstract, body };
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

function tableHtml(headers, rows) {
  return `<div class="table-wrap">
            <table class="data-table">
              <thead><tr>${headers.map((header) => `<th>${esc(header)}</th>`).join("")}</tr></thead>
              <tbody>
${rows.map((row) => `                <tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("\n")}
              </tbody>
            </table>
          </div>`;
}

function bodyHtml(parts) {
  const html = [];
  const paragraphs = parts.body;
  const h2 = new Set([
    "Einleitung: Warum „Nachhaltigkeit“ allein operativ nicht genügt",
    "Von der Rückkehr zum Gleichgewicht zur sozial-ökologischen Resilienz",
    "Das Kugel-Becken-Modell",
    "Die vier Resilienzattribute - auf Nachhaltigkeit übertragen",
    "Was die vier Punkte allein nicht deutlich genug zeigen: Rückstellung und Regeneration",
    "Die wirkungsökonomische Herleitung: Warum Nachhaltigkeit Systemresilienz ist",
    "Warum ein faschistisches System damit nicht nachhaltig ist",
    "Die SDGs als globales Risiko- und Resilienzregister",
    "SDG+ als Systemqualität und Korrekturfähigkeit",
    "Vom Eigenrisiko zum erzeugten Wirkungsrisiko",
    "Wie Systemresilienz praktisch sichtbar wird",
    "Konsequenzen für Unternehmen und Management",
    "Ein operationales Resilienzraster",
    "Schluss: Der präzisere operative Begriff",
  ]);
  const h3 = new Set([
    "1. Latitude: Wie groß ist der tragfähige Spielraum?",
    "2. Resistance: Wie leicht lässt sich der Zustand verschieben?",
    "3. Precariousness: Wie nahe steht die Kugel bereits am Rand?",
    "4. Panarchy: Welche Ebenen verändern Becken, Rand und Kugel?",
    "Energie: Pumpspeicher als Rückstell- und Dämpfungsmechanismus",
    "Produkte und Lieferketten",
    "Städte und Gesundheit",
    "Demokratie und Öffentlichkeit",
  ]);
  const callouts = new Set([
    "Wissenschaftlich entscheidend",
    "Zentrale Definition",
    "Prägnante Abgrenzung",
    "Kurzformel",
    "Schlussformel",
  ]);
  const tableSpecs = [
    { headers: ["Element im Bild", "Systemische Bedeutung", "Übertragung auf Nachhaltigkeit"], rows: 8 },
    { headers: ["Wirkungsraum", "Beispiele für Rückstell-, Regenerations- und Korrekturmechanismen"], rows: 5 },
    { headers: ["Logischer Schritt", "Bedeutung"], rows: 8 },
    { headers: ["SDG", "Resilienz-Lesart"], rows: 17 },
    { headers: ["SDG+-Feld", "Beitrag zur Systemresilienz"], rows: 9 },
  ];

  for (let i = 0; i < paragraphs.length; i += 1) {
    const paragraph = paragraphs[i];
    const table = tableSpecs.find((spec) => spec.headers.every((header, index) => paragraphs[i + index] === header));
    if (table) {
      const cellsStart = i + table.headers.length;
      const cellsCount = table.headers.length * table.rows;
      const cells = paragraphs.slice(cellsStart, cellsStart + cellsCount);
      if (cells.length !== cellsCount) throw new Error(`Unvollständige Tabelle: ${table.headers.join(" / ")}`);
      const rows = Array.from({ length: table.rows }, (_, rowIndex) => cells.slice(rowIndex * table.headers.length, (rowIndex + 1) * table.headers.length));
      html.push(tableHtml(table.headers, rows));
      i = cellsStart + cellsCount - 1;
      continue;
    }
    if (paragraph === "Ein operationales Resilienzraster") {
      html.push(`<h2>${inline(paragraph)}</h2>`);
      const intro = paragraphs[i + 1] || "";
      const questions = paragraphs.slice(i + 2, i + 10);
      const questionIndex = i + 10;
      if (intro) html.push(`<p>${inline(intro)}</p>`);
      html.push(`<ol>${questions.map((question) => `<li>${inline(question)}</li>`).join("")}</ol>`);
      i = questionIndex - 1;
      continue;
    }
    if (h2.has(paragraph)) {
      html.push(`<h2>${inline(paragraph)}</h2>`);
      continue;
    }
    if (h3.has(paragraph)) {
      html.push(`<h3>${inline(paragraph.replace(/^\d+\.\s+/, ""))}</h3>`);
      continue;
    }
    if (callouts.has(paragraph)) {
      const text = paragraphs[i + 1] || "";
      html.push(`<div class="callout"><p><strong>${inline(paragraph)}:</strong> ${inline(text)}</p></div>`);
      i += 1;
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
  const tags = ["Systemresilienz", "Wirkungsresilienz", "Resilienz", "SDGs", "SDG+", "Risiko- und Resilienzregister", "Wirkungsrisiko", "Rückkopplung", "Wirkungsökonomie"];
  const body = `
    <main id="inhalt" data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../blog.html">Journal</a> / ${esc(title)}</nav>
          <p class="hero-kicker">Journal · ${esc(category)} · ${esc(dateLabel)} · ${esc(readingTime)}</p>
          <h1 class="hero-title">${esc(parts.docTitle || title)}</h1>
          <p class="hero-subtitle">${esc(parts.docSubtitle || subtitle)}</p>
          <p class="meta">${esc(parts.docDeck || deck)}</p>
          <p class="meta">${esc(parts.author || "Von Natalie Weber - Begründerin der Wirkungsökonomie")}</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="../..${image}" width="1672" height="941" alt="${esc(imageAlt)}" decoding="async" fetchpriority="high">
          <figcaption>Nachhaltigkeit wird als langfristige Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie präzise und steuerbar.</figcaption>
        </figure>
      </article>

      <section class="article-page">
        <div class="article-body">
          <div class="callout">
            <p><strong>Kernthese:</strong> ${inline(parts.coreThesis)}</p>
          </div>

          <section class="term-summary-card">
            <p class="section-eyebrow">Abstract</p>
${parts.abstract.map((paragraph) => `            <p>${inline(paragraph)}</p>`).join("\n")}
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
            <p>Quellenstand der inhaltlich aktualisierten Fassung: ${esc(modifiedDateLabel)}. Das ursprüngliche Veröffentlichungsdatum bleibt der ${esc(dateLabel)}.</p>
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
    <meta name="description" content="${esc(subtitle)}. Nachhaltigkeit wird als langfristige Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie präzise und steuerbar.">
    <meta name="search_title" content="${esc(title)}">
    <meta name="search_description" content="Nachhaltigkeit als langfristige Wirkungsresilienz: Die SDGs und SDG+ als globales Risiko- und Resilienzregister für Mensch, Planet und Demokratie.">
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
    <meta property="article:modified_time" content="${modifiedDate}T00:00:00+02:00">
    <meta property="article:section" content="${esc(category)}">
    ${tags.map((tag) => `<meta property="article:tag" content="${esc(tag)}">`).join("\n    ")}
    <link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: `${subtitle}. Nachhaltigkeit wird als langfristige Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie präzise und steuerbar.`,
      url: `https://wirkungsoekonomie.de/blog/${slug}/`,
      image: `https://wirkungsoekonomie.de${image}`,
      inLanguage: "de",
      datePublished: `${date}T00:00:00+02:00`,
      dateModified: `${modifiedDate}T00:00:00+02:00`,
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
            <p class="card-text">Warum Nachhaltigkeit als langfristige Wirkungsresilienz von Mensch, Planet und Demokratie präziser und steuerbar wird.</p>
            <div class="portal-card-actions"><a class="text-link" href="../blog/${slug}/">Artikel lesen</a></div>
          </article>
`;
  const next = current.replace(/(<div class="card-grid three">\n)/, `$1${card}`);
  fs.writeFileSync(journalIndexPath, next);
}

function upsertBlogIndex() {
  const entries = JSON.parse(fs.readFileSync(blogIndexPath, "utf8"));
  const entry = entries.find((item) => item.url === `/blog/${slug}/index.html`);
  if (!entry) throw new Error(`Blog-Index-Eintrag für ${slug} nicht gefunden.`);
  entry.title = title;
  entry.readingTime = readingTime;
  entry.excerpt = "Nachhaltigkeit ist die langfristige Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie.";
  entry.tags = ["Systemresilienz", "Wirkungsresilienz", "SDGs", "SDG+", "Risiko- und Resilienzregister", "Wirkungsrisiko", "Rückkopplung", "Wirkungsökonomie"];
  fs.writeFileSync(blogIndexPath, `${JSON.stringify(entries, null, 2)}\n`);
}

fs.mkdirSync(path.dirname(articlePath), { recursive: true });
fs.writeFileSync(articlePath, articleHtml());
upsertBlogIndex();
upsertJournalIndex();
console.log(`Published journal article: blog/${slug}/index.html`);
