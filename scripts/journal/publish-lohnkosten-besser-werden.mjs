import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const sourcePath = process.env.JOURNAL_SOURCE_PATH || process.argv[2] || "/Users/hagen/Downloads/Nicht_billiger_werden_besser_werden_Lohnkosten_Artikel_clean.docx";
const slug = "nicht-billiger-werden-besser-werden";
const title = "Nicht billiger werden. Besser werden.";
const subtitle = "Warum Deutschland keine Niedriglohnstrategie braucht - und weshalb hohe Löhne erst dann zum Problem werden, wenn Produktivität, Innovation, Infrastruktur und Systemqualität nicht mehr mithalten.";
const date = "2026-06-09";
const dateLabel = "9. Juni 2026";
const readingTime = "16 Min.";
const category = "Arbeit & Einkommen";
const image = "/assets/img/blog/2026-06-09-nicht-billiger-werden-besser-werden.webp";
const imageAlt = "Illustration zu Lohnkosten, Produktivität, Innovation und Infrastruktur mit Kompass zwischen billiger werden und besser werden.";
const articlePath = path.join(root, "blog", slug, "index.html");
const registryPath = path.join(root, "assets", "data", "term-registry.json");
const journalIndexPath = path.join(root, "journal", "index.html");

const headings = new Set([
  "Die halbe Rechnung: Was eine Arbeitsstunde kostet",
  "Die ganze Rechnung heißt Lohnstückkosten",
  "Produktivität ist kein Charakterzug der Beschäftigten",
  "Löhne sind nicht nur Kosten. Löhne sind Einkommen.",
  "Löhne finanzieren soziale Sicherheit",
  "Was soll das für eine Wettbewerbsfähigkeit sein?",
  "Nach unten konkurrieren ist einfach. Nach oben konkurrieren ist schwer.",
  "Was Aufwärtswettbewerb praktisch heißt",
  "Die Wirkungsökonomie liest Löhne als Systemsignal",
  "Hohe Löhne sind ein Ausweis von Erfolg - wenn das System sie trägt",
  "Die politische Aufgabe",
  "Schluss: Die bessere Richtung",
]);

const sourceMap = new Map([
  ["1", { label: "Destatis: Eine Arbeitsstunde kostete im Jahr 2025 durchschnittlich 45,00 Euro", url: "https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_148_624.html" }],
  ["2", { label: "OECD: Unit labour costs", url: "https://www.oecd.org/en/data/indicators/unit-labour-costs.html" }],
  ["3", { label: "OECD: GDP per hour worked / labour productivity", url: "https://www.oecd.org/en/data/indicators/gdp-per-hour-worked.html" }],
  ["4", { label: "Institut der deutschen Wirtschaft: Lohnstückkosten im internationalen Vergleich", url: "https://www.iwkoeln.de/studien/christoph-schroeder-kostenwettbewerbsfaehigkeit-der-deutschen-industrie-in-zeiten-grosser-verunsicherung.html" }],
  ["5", { label: "BMAS: Sozialversicherung", url: "https://www.bmas.bund.de/DE/Soziales/Sozialversicherung/sozialversicherung-art.html" }],
  ["6", { label: "BMAS: Finanzierung der gesetzlichen Rentenversicherung", url: "https://www.bmas.de/DE/Soziales/Rente-und-Altersvorsorge/Gesetzliche-Rentenversicherung/Finanzierung-Gesetzliche-Rentenversicherung/finanzierung-der-gesetzlichen-rentenversicherung.html" }],
  ["7", { label: "Europäische Kommission: Kompass für Wettbewerbsfähigkeit", url: "https://commission.europa.eu/topics/eu-competitiveness/competitiveness-compass_de" }],
  ["8", { label: "Wirkungsökonomie: Startseite / Grundidee", url: "https://wirkungsoekonomie.de/" }],
  ["9", { label: "Wirkungsökonomie: Arbeit & Einkommen", url: "https://wirkungsoekonomie.de/wirkungsfelder/arbeit-einkommen/" }],
  ["10", { label: "Wirkungsökonomie: Positive Wirkung", url: "https://wirkungsoekonomie.de/begriffe/positive-wirkung/" }],
  ["11", { label: "Wirkungsökonomie: Wirkungsdaten", url: "https://wirkungsoekonomie.de/begriffe/wirkungsdaten/" }],
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

function articleParagraphs() {
  const paras = docxParagraphs(sourcePath);
  const start = paras.indexOf("Nicht billiger werden. Besser werden.");
  const end = paras.indexOf("LINKEDIN-FASSUNG");
  if (start < 0 || end < 0) throw new Error("Langfassung im DOCX nicht gefunden.");
  return paras
    .slice(start + 1, end)
    .map(cleanEditorialLanguage)
    .filter(Boolean);
}

function cleanEditorialLanguage(paragraph) {
  if (
    /LinkdIn|LinkedIn[- ]?Fassung|LinkedIn[- ]?Artikel|Fassung\s+f(?:ü|ue)r\s+LinkedIn|Fassung\s+f(?:ü|ue)r\s+das\s+Journal|Journal[- ]?Fassung|Journalfassung|Artikelpaket|Redaktionsanweisung/i.test(paragraph)
  ) {
    return "";
  }
  if (paragraph.startsWith("Armin-Maiwald-Erklärung:")) {
    return paragraph.replace(/^Armin-Maiwald-Erklärung:\s*/, "Anschaulich gesagt: ");
  }
  return paragraph
    .replaceAll("Armin-Maiwaldisiert", "anschaulich erklärt")
    .replaceAll("armin-maiwaldisiert", "anschaulich erklärt");
}

function inline(value) {
  return esc(value)
    .replace(/\[(\d+)\]/g, (_, id) => {
      if (!sourceMap.has(id)) return `[${id}]`;
      return `<a href="#quelle-${id}" class="source-chip">[${id}]</a>`;
    });
}

function bodyHtml() {
  const html = [];
  let openList = false;
  const closeList = () => {
    if (openList) {
      html.push("</ol>");
      openList = false;
    }
  };

  for (const paragraph of articleParagraphs()) {
    const normalized = paragraph.replace(" – ", " - ");
    if (headings.has(normalized)) {
      closeList();
      html.push(`<h2>${inline(paragraph)}</h2>`);
      continue;
    }
    const listItem = paragraph.match(/^(\d+)\.\s+(.+)$/);
    if (listItem) {
      if (!openList) {
        html.push('<ol class="impact-list">');
        openList = true;
      }
      html.push(`  <li>${inline(listItem[2])}</li>`);
      continue;
    }
    closeList();
    if (/^„.+“$/.test(paragraph)) {
      html.push(`<blockquote><p>${inline(paragraph.slice(1, -1))}</p></blockquote>`);
    } else {
      html.push(`<p>${inline(paragraph)}</p>`);
    }
  }
  closeList();
  return html.join("\n          ");
}

function upsertTerms() {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const terms = Array.isArray(registry) ? registry : registry.terms;
  const sourceDocument = `blog/${slug}/`;
  const nextTerms = [
    {
      id: "aufwaertswettbewerb",
      termId: "aufwaertswettbewerb",
      canonicalLabel: "Aufwärtswettbewerb",
      label: "Aufwärtswettbewerb",
      slug: "aufwaertswettbewerb",
      status: "woek-praegungsbegriff",
      type: "WÖk-Prägungsbegriff",
      version: "1.0",
      source: `Journalbeitrag: ${title}`,
      sourceDocument,
      sourceSection: "Arbeit & Einkommen",
      shortDefinition: "Aufwärtswettbewerb bezeichnet eine Wettbewerbsstrategie, die nicht über niedrigere Löhne und Standards gewinnt, sondern über höhere Produktivität, bessere Systeme, Innovation, Infrastruktur und positive Netto-Wirkung.",
      hoverDefinition: "Aufwärtswettbewerb heißt: nicht billiger werden, sondern Arbeitsstunden, Systeme und Wertschöpfung wirksamer machen.",
      definition: "Aufwärtswettbewerb bezeichnet eine Wettbewerbsstrategie, die nicht über niedrigere Löhne und Standards gewinnt, sondern über höhere Produktivität, bessere Systeme, Innovation, Infrastruktur und positive Netto-Wirkung.",
      longDefinition: "In der Wirkungsökonomie ist Aufwärtswettbewerb die Alternative zum Wettlauf nach unten. Eine Volkswirtschaft verteidigt Wohlstand nicht durch Lohnsenkung, Standardabbau oder Risikoauslagerung, sondern durch Qualifikation, Kapitalstock, Digitalisierung, Infrastruktur, Energie- und Ressourceneffizienz, Forschung, gute Verwaltung und tragfähige soziale Sicherung.",
      woekRelation: "Der Begriff verbindet Wettbewerbsfähigkeit mit Wirkungslogik: Entscheidend ist nicht nur, was Arbeit kostet, sondern was sie im Zusammenspiel mit Systembedingungen für Mensch, Planet und Demokratie bewirkt.",
      usageNote: "Nicht als Schönfärbung hoher Kosten verwenden. Der Begriff verlangt reale Produktivität, tragfähige Wertschöpfung und reduzierte Reibungsverluste.",
      doNotConfuseWith: ["Niedriglohnstrategie", "Standortmarketing", "bloße Produktivitätserzählung"],
      synonyms: ["Wettbewerb nach oben", "High-road strategy", "wertschöpfungsorientierter Wettbewerb"],
      aliases: ["Wettbewerb nach oben", "Aufwaertswettbewerb", "High-road strategy"],
      relatedTerms: ["positive-netto-wirkung", "wirkungsdaten", "wirksame-arbeit", "automatisierung", "maschinenleistung", "wirkungseinkommen"],
      relatedDocuments: [sourceDocument, "wirkungsfelder/arbeit-einkommen/", "referenz/kapitel-056-arbeit-automatisierung-und-maschinenleistung/"],
      examples: ["Investitionen in Weiterbildung und Automatisierung erhöhen Wertschöpfung pro Stunde statt Löhne zu drücken.", "Schnellere Genehmigungen, bessere Netze und gute Energieversorgung senken Reibung, ohne Einkommen zu senken."],
      preferredUsage: "Aufwärtswettbewerb als strategische Alternative zur Niedriglohnlogik beschreiben.",
      deprecatedUsage: ["Aufwärtswettbewerb als bloßen Appell ohne Produktivitäts- und Investitionsbasis verwenden."],
      reviewStatus: "approved",
      glossaryOrderKey: "aufwärtswettbewerb",
      firstApprovedIn: "2026.2",
      lastUpdated: date,
      category: "Arbeit, Einkommen und Wertschöpfung",
      categories: ["arbeit-einkommen", "wirtschaft", "wirkungslogik"],
      pageUrl: "/begriffe/aufwaertswettbewerb/",
      classicGlossary: true,
      autoLinkAllowed: true,
    },
    {
      id: "lohnstueckkosten",
      termId: "lohnstueckkosten",
      canonicalLabel: "Lohnstückkosten",
      label: "Lohnstückkosten",
      slug: "lohnstueckkosten",
      status: "kontextbegriff",
      type: "Kontextbegriff",
      version: "1.0",
      source: `Journalbeitrag: ${title}`,
      sourceDocument,
      sourceSection: "Arbeit & Einkommen",
      shortDefinition: "Lohnstückkosten messen Arbeitskosten im Verhältnis zur erzeugten Leistung und zeigen damit, ob hohe Löhne durch Produktivität und Wertschöpfung getragen werden.",
      hoverDefinition: "Lohnstückkosten verbinden Arbeitskosten mit Output: Nicht der Lohn allein zählt, sondern Kosten je erzeugter Leistung.",
      definition: "Lohnstückkosten messen Arbeitskosten im Verhältnis zur erzeugten Leistung und zeigen damit, ob hohe Löhne durch Produktivität und Wertschöpfung getragen werden.",
      longDefinition: "Lohnstückkosten sind eine ökonomische Kennzahl für die durchschnittlichen Arbeitskosten je Einheit Output. Wirkungsökonomisch helfen sie, die Debatte von der reinen Kostenfrage zu lösen: Eine Arbeitsstunde kann teuer sein und trotzdem wettbewerbsfähig, wenn sie durch gute Systeme, Qualifikation, Kapitalstock, Infrastruktur und Innovation hohe Wertschöpfung erzeugt.",
      woekRelation: "Der Begriff macht sichtbar, dass Lohnkosten nur eine Eingangszahl sind. Wettbewerbsfähigkeit entscheidet sich auch an der erzeugten Wirkung und Wertschöpfung je Stunde.",
      usageNote: "Nicht mit Stundenlöhnen oder Arbeitskosten je Stunde verwechseln. Lohnstückkosten setzen Kosten ins Verhältnis zur Produktivität.",
      doNotConfuseWith: ["Arbeitskosten je Stunde", "Bruttolohn", "Lohnnebenkosten"],
      synonyms: ["unit labour costs", "Arbeitskosten je Outputeinheit"],
      aliases: ["Unit labour costs", "Lohnstueckkosten", "Arbeitskosten je Outputeinheit"],
      relatedTerms: ["aufwaertswettbewerb", "systemqualitaet", "positive-netto-wirkung", "wirkungsdaten"],
      relatedDocuments: [sourceDocument, "wirkungsfelder/arbeit-einkommen/"],
      examples: ["Steigen Löhne schneller als Produktivität und Wertschöpfung, können Lohnstückkosten steigen.", "Hohe Arbeitskosten je Stunde sind tragfähiger, wenn Infrastruktur und Innovation die Leistung pro Stunde erhöhen."],
      preferredUsage: "Lohnstückkosten als Verhältnisgröße von Arbeitskosten und Output erklären.",
      deprecatedUsage: ["Lohnstückkosten als pauschales Argument für Lohnsenkung verwenden."],
      reviewStatus: "approved",
      glossaryOrderKey: "lohnstückkosten",
      firstApprovedIn: "2026.2",
      lastUpdated: date,
      category: "Arbeit, Einkommen und Wertschöpfung",
      categories: ["arbeit-einkommen", "wirtschaft", "indikatoren"],
      pageUrl: "/begriffe/lohnstueckkosten/",
      classicGlossary: true,
      autoLinkAllowed: true,
    },
    {
      id: "systemqualitaet",
      termId: "systemqualitaet",
      canonicalLabel: "Systemqualität",
      label: "Systemqualität",
      slug: "systemqualitaet",
      status: "woek-praezisierungsbegriff",
      type: "WÖk-Präzisierungsbegriff",
      version: "1.0",
      source: `Journalbeitrag: ${title}`,
      sourceDocument,
      sourceSection: "Arbeit & Einkommen",
      shortDefinition: "Systemqualität beschreibt die Qualität der Bedingungen, die Menschen, Organisationen und Regionen produktiv, innovativ, resilient und wirkungsfähig machen.",
      hoverDefinition: "Systemqualität ist die Qualität von Werkzeugen, Infrastruktur, Regeln, Daten, Energie, Vertrauen und Organisation, die Leistung möglich macht.",
      definition: "Systemqualität beschreibt die Qualität der Bedingungen, die Menschen, Organisationen und Regionen produktiv, innovativ, resilient und wirkungsfähig machen.",
      longDefinition: "Systemqualität umfasst die materiellen, institutionellen und kulturellen Voraussetzungen von Leistung: Bildung, Maschinen, Software, Daten, Energie, Infrastruktur, Verwaltung, Finanzierung, Führung, Forschung, Kooperation und Vertrauen. Sie verhindert, dass Produktivität fälschlich nur als Charakterzug einzelner Beschäftigter gelesen wird.",
      woekRelation: "Der Begriff übersetzt Produktivität in Wirkungsbedingungen. Menschen leisten mehr, wenn Systeme Können, Zeit und Verantwortung nicht durch Reibung, schlechte Infrastruktur oder falsche Anreize entwerten.",
      usageNote: "Systemqualität ersetzt keine Effizienzprüfung, erweitert sie aber um die Frage, welche Bedingungen Leistung und Wirkung ermöglichen oder blockieren.",
      doNotConfuseWith: ["individuelle Leistungsbereitschaft", "Standortimage", "bloße Prozessoptimierung"],
      synonyms: ["Qualität der Systembedingungen", "Produktivitätsumfeld", "institutionelle Leistungsfähigkeit"],
      aliases: ["Systemqualitaet", "Qualität der Systembedingungen", "Produktivitätsumfeld"],
      relatedTerms: ["aufwaertswettbewerb", "lohnstueckkosten", "wirkungsdaten", "automatisierung", "maschinenleistung"],
      relatedDocuments: [sourceDocument, "referenz/kapitel-056-arbeit-automatisierung-und-maschinenleistung/", "wirkungsfelder/arbeit-einkommen/"],
      examples: ["Eine Fachkraft mit schlechten digitalen Werkzeugen ist nicht das Produktivitätsproblem; das System bremst sie.", "Marode Netze, langsame Genehmigungen und Energieunsicherheit senken Systemqualität."],
      preferredUsage: "Systemqualität nutzen, wenn Produktivität von Infrastruktur, Organisation und Institutionen abhängt.",
      deprecatedUsage: ["Systemqualität als Ausrede gegen individuelle Verantwortung verwenden."],
      reviewStatus: "approved",
      glossaryOrderKey: "systemqualität",
      firstApprovedIn: "2026.2",
      lastUpdated: date,
      category: "Systeme, Steuerung und Resilienz",
      categories: ["wirkungslogik", "arbeit-einkommen", "wirtschaft"],
      pageUrl: "/begriffe/systemqualitaet/",
      classicGlossary: true,
      autoLinkAllowed: true,
    },
  ];

  for (const term of nextTerms) {
    const index = terms.findIndex((item) => item.termId === term.termId || item.slug === term.slug);
    if (index >= 0) terms[index] = { ...terms[index], ...term };
    else terms.push(term);
  }

  fs.writeFileSync(registryPath, `${JSON.stringify(Array.isArray(registry) ? terms : { ...registry, terms }, null, 2)}\n`);
}

function articleHtml() {
  const { header, footer } = headerFooter();
  const sourceItems = [...sourceMap.entries()]
    .map(([id, ref]) => `              <li id="quelle-${id}"><a href="${esc(ref.url)}">${esc(ref.label)}</a></li>`)
    .join("\n");
  const tags = ["Lohnkosten", "Lohnstückkosten", "Produktivität", "Aufwärtswettbewerb", "Systemqualität", "Arbeit & Einkommen", "Sozialversicherung", "Wettbewerbsfähigkeit", "Wirkungsökonomie"];
  const body = `
    <main id="inhalt" data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../blog.html">Journal</a> / ${esc(title)}</nav>
          <p class="hero-kicker">Journal · ${esc(category)} · ${esc(dateLabel)} · ${esc(readingTime)}</p>
          <h1 class="hero-title">${esc(title)}</h1>
          <p class="hero-subtitle">${esc(subtitle)}</p>
          <p class="meta">Von Natalie Weber - Wirkungsökonomie</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="../..${image}" width="2752" height="1536" alt="${esc(imageAlt)}" decoding="async" fetchpriority="high">
          <figcaption>Der Wettbewerb, den Deutschland gewinnen muss, ist kein Wettlauf um billigere Menschen. Es ist der Wettbewerb um bessere Systeme.</figcaption>
        </figure>
      </article>

      <section class="article-page">
        <div class="article-body">
          <div class="callout">
            <p><strong>Kernthese:</strong> Hohe Löhne sind kein Makel. Sie sind ein Anspruch. Ein Hochlohnland muss ein Hochproduktivitäts-, Hochinnovations- und Hochwirkungsland sein.</p>
          </div>

          ${bodyHtml()}

          <section class="term-link-section">
            <div>
              <p class="section-eyebrow">Glossar</p>
              <h2>Begriffe zum Beitrag</h2>
            </div>
            <div class="term-chip-row">
              <a class="term-chip" href="../../begriffe/aufwaertswettbewerb/">Aufwärtswettbewerb</a>
              <a class="term-chip" href="../../begriffe/lohnstueckkosten/">Lohnstückkosten</a>
              <a class="term-chip" href="../../begriffe/systemqualitaet/">Systemqualität</a>
              <a class="term-chip" href="../../begriffe/positive-netto-wirkung/">Positive Netto-Wirkung</a>
              <a class="term-chip" href="../../begriffe/wirkungsdaten/">Wirkungsdaten</a>
              <a class="term-chip" href="../../wirkungsfelder/arbeit-einkommen/">Arbeit &amp; Einkommen</a>
              <a class="term-chip" href="../../wirkungsfelder/arbeit-einkommen/automatisierung-maschinenleistung/">Automatisierung &amp; Maschinenleistung</a>
            </div>
          </section>

          <section class="term-summary-card">
            <p class="section-eyebrow">Quellenstand</p>
            <h2>Daten-, Methodik- und WÖk-Quellen</h2>
            <p>Datenstand der redaktionellen Fassung: ${esc(dateLabel)}.</p>
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
    <meta name="search_description" content="Warum Deutschland keine Niedriglohnstrategie braucht: Hohe Löhne werden tragfähig, wenn Produktivität, Innovation, Infrastruktur und Systemqualität mithalten.">
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
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-shell-audio-fix">
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
    <script src="../../assets/js/main.js?v=20260612-shell-audio-fix"></script>
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
            <p class="card-text">Warum hohe Löhne kein Problem sind, solange Produktivität, Innovation, Infrastruktur und Systemqualität mithalten.</p>
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
