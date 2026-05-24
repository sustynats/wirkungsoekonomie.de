import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const downloadsDir = "/Users/hagen/Downloads";

const docs = [
  {
    number: "06",
    slug: "unternehmen-als-wirkungssysteme",
    title: "Unternehmen als Wirkungssysteme",
    subtitle: "Unternehmenszweck, Geschäftsmodell, Wertschöpfung und Rückkopplung in der Wirkungsökonomie",
    source: "online_volltext_06_unternehmen_als_wirkungssysteme_detailkonzept_v1_0.md",
    docx: "06_woek_wirtschaft_unternehmen_unternehmen_als_wirkungssysteme_detailkonzept_v1_0.docx",
    pdf: "06_woek_wirtschaft_unternehmen_unternehmen_als_wirkungssysteme_detailkonzept_v1_0.pdf",
    description:
      "Echtes Detailkonzept zu Unternehmen als Wirkungssysteme: Zweck, Geschäftsmodell, Wertschöpfung, WÖk-IDs, Steuerung und Rückkopplung.",
    bookFocus: ["kapitel-042-unternehmen-als-wirkungssysteme", "kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung"],
  },
  {
    number: "07",
    slug: "wirkungsorientierte-unternehmensfuehrung",
    title: "Wirkungsorientierte Unternehmensführung",
    subtitle: "Führung, Mitarbeitendenverantwortung, Governance und Anreizsysteme wirkungsökonomisch ausrichten",
    source: "online_volltext_07_wirkungsorientierte_unternehmensfuehrung_detailkonzept_v1_0.md",
    docx: "07_woek_wirtschaft_unternehmen_wirkungsorientierte_unternehmensfuehrung_detailkonzept_v1_0.docx",
    pdf: "07_woek_wirtschaft_unternehmen_wirkungsorientierte_unternehmensfuehrung_detailkonzept_v1_0.pdf",
    description:
      "Echtes Detailkonzept zu wirkungsorientierter Unternehmensführung inklusive Mitarbeiterführung, Governance, Kultur und Anreizsystemen.",
    bookFocus: ["kapitel-043-wirkungsorientierte-unternehmensfuehrung", "kapitel-045-organisation-kultur-und-verantwortung"],
  },
  {
    number: "08",
    slug: "risikomanagement-resilienz-finanzmarkt",
    title: "Wirkungsorientiertes Risikomanagement, Resilienz und Finanzmarktanforderungen",
    subtitle: "ESG-Risiken, Finanzmarktanforderungen, Versicherbarkeit und Resilienz in eine Wirkungslogik übersetzen",
    source: "online_volltext_08_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0.md",
    docx: "08_woek_wirtschaft_unternehmen_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0.docx",
    pdf: "08_woek_wirtschaft_unternehmen_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0.pdf",
    description:
      "Echtes Detailkonzept zu Risikomanagement, Resilienz, Finanzmarktanforderungen, EBA/ESG-Anschluss und Wirkungsrisiko.",
    bookFocus: ["kapitel-047-unternehmensrisiko-und-transformation", "kapitel-044-wirkungscontrolling-im-unternehmen"],
  },
];

const sdgs = [
  ["SDG 8 Menschenwürdige Arbeit", "sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum", "Gute Arbeit, faire Wertschöpfung und tragfähige Unternehmensentwicklung."],
  ["SDG 9 Industrie, Innovation und Infrastruktur", "sdg-9-industrie-innovation-infrastruktur", "Innovation, Infrastruktur und industrielle Transformation als Wirkungsträger."],
  ["SDG 10 Weniger Ungleichheiten", "sdg-10-weniger-ungleichheiten", "Ungleichheitswirkungen in Beschäftigung, Lieferketten, Kapitalzugang und Märkten sichtbar machen."],
  ["SDG 12 Nachhaltiger Konsum und Produktion", "sdg-12-nachhaltiger-konsum-produktion", "Produktportfolios, Beschaffung und Kreisläufe an realer Wirkung ausrichten."],
  ["SDG 13 Klimaschutz", "sdg-13-klimaschutz", "Klimarisiken, Emissionen und Transformationspfade in Unternehmensentscheidungen rückkoppeln."],
  ["SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "sdg-16-frieden-gerechtigkeit-starke-institutionen", "Governance, Rechtsstaatlichkeit, Antikorruption und Vertrauen als Unternehmenswirkung."],
  ["SDG 17 Partnerschaften", "sdg-17-partnerschaften", "Branchenstandards, Lieferketten, Datenräume und Kooperationsfähigkeit stärken."],
];

const sdgPlus = [
  ["SDG+ Demokratie", "#sdgplus-demokratie", "Demokratische Stabilität, Teilhabe, Streitfähigkeit und Korrekturfähigkeit als Wirkungsbedingung."],
  ["SDG+ Medienqualität", "#sdgplus-medienqualitaet", "Quellenklarheit, öffentliche Information und Schutz vor Desinformation als Unternehmens- und Marktbedingung."],
  ["SDG+ Rechtsstaatlichkeit", "#sdgplus-rechtsstaatlichkeit", "Grundrechte, Verfahren, Rechtsschutz und Verhältnismäßigkeit als Schutz vor Willkür."],
  ["SDG+ institutionelles Vertrauen", "#sdgplus-institutionelles-vertrauen", "Vertrauen in faire, transparente und korrigierbare Institutionen."],
  ["SDG+ gesellschaftlicher Zusammenhalt", "#sdgplus-gesellschaftlicher-zusammenhalt", "Teilhabe, Fairness, Sicherheit und Zugehörigkeit in Märkten und Organisationen."],
  ["SDG+ digitale Selbstbestimmung", "#sdgplus-digitale-selbstbestimmung", "Datenrechte, digitale Souveränität und algorithmische Verantwortung."],
];

const bookAnchors = [
  ["Kapitel 42 - Unternehmen als Wirkungssysteme", "/referenz/kapitel-042-unternehmen-als-wirkungssysteme/"],
  ["Kapitel 43 - Wirkungsorientierte Unternehmensführung", "/referenz/kapitel-043-wirkungsorientierte-unternehmensfuehrung/"],
  ["Kapitel 44 - Wirkungscontrolling im Unternehmen", "/referenz/kapitel-044-wirkungscontrolling-im-unternehmen/"],
  ["Kapitel 45 - Organisation, Kultur und Verantwortung", "/referenz/kapitel-045-organisation-kultur-und-verantwortung/"],
  ["Kapitel 46 - Interne Wertschöpfung und Lieferkettensteuerung", "/referenz/kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung/"],
  ["Kapitel 47 - Unternehmensrisiko und Transformation", "/referenz/kapitel-047-unternehmensrisiko-und-transformation/"],
  ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "/referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
  ["Kapitel 32 - Benchmarks, Skalen und Scorecards", "/referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
];

const crossLinks = [
  ["Produkte & Konsum", "/wirkungsfelder/produkte-konsum/", "Produktwirkung, Wirkungsumsatzsteuer, Scorecards und Konsumentscheidungen."],
  ["Wirkungsumsatzsteuer", "/werkzeuge/wirkungsumsatzsteuer/", "Produktwirkung an Preis- und Steuerlogik rückkoppeln."],
  ["WÖk-IDs", "/werkzeuge/woek-ids/", "Indikatoren, Quellen, SDGs, SDG+ und Bewertungslogik verbinden."],
  ["Scorecards", "/werkzeuge/scorecards/", "Bewertungsraster für Unternehmen, Produkte, Risiken und Portfolios."],
  ["T-SROI", "/werkzeuge/impact-controlling/t-sroi/", "Transformationswirkung im Verhältnis zum Ressourceneinsatz bewerten."],
  ["Finanzsystem & Kapital", "/wirkungsfelder/finanzsystem-kapital/", "Kapitalwirkung, Banken, Versicherungen und Wirkungsfonds."],
  ["Arbeit & Einkommen", "/wirkungsfelder/arbeit-einkommen/", "Automatisierung, Maschinenleistung, Beschäftigung und Wirkungseinkommen."],
  ["Wissenschaft, Innovation & Digitalisierung", "/wirkungsfelder/wissenschaft-innovation-digitalisierung/", "Innovation, Datenräume, KI und digitale Infrastruktur."],
  ["Medien & Öffentlichkeit", "/wirkungsfelder/medien-oeffentlichkeit/", "Medienqualität, Plattformen, Diskurs und öffentliche Wirkung."],
  ["SDG-/SDG+-Referenzrahmen", "/verstehen/sdgs-sdgplus/", "Öffentlicher Bewertungsrahmen für positive, negative und neutrale Wirkung."],
  ["Online-Buch", "/referenz/", "Kapitel und Systemlogik der Wirkungsökonomie."],
];

const toolCards = [
  ["Unternehmens-Wirkungscheck", "/werkzeuge/unternehmens-wirkungscheck/", "Werkzeugseite vorhanden", "Erste Standortbestimmung für Zweck, Geschäftsmodell, Governance, Risiko und Wirkung."],
  ["KII-Dashboard", "", "Demo in Vorbereitung", "Kernwirkungsindikatoren statt nur klassische KPI im Management sichtbar machen."],
  ["T-SROI-Rechner", "/werkzeuge/impact-controlling/t-sroi/", "Methodenseite vorhanden", "Transformationsnutzen, Kosten, Risiken und systemische Wirkung vergleichen."],
  ["Lieferketten-Scorecard", "", "Demo in Vorbereitung", "Lieferantenentwicklung, Resilienz und negative Externalitäten strukturiert bewerten."],
  ["Produktpass-/Produktscorecard-Demo", "/werkzeuge/produktscorecards/", "Werkzeugseite vorhanden", "Produktwirkung, Datenräume und Verbraucherinformation verbinden."],
  ["Wirkungsrisiko-Check", "", "Demo in Vorbereitung", "Wirkungsrisiken in Enterprise Risk Management und Strategieprozesse integrieren."],
  ["EBA-Kreditdaten-Check", "", "Demo in Vorbereitung", "Bankfähige ESG- und Transformationsdaten für Kreditgespräche vorbereiten."],
  ["Versicherbarkeitscheck", "/wirkungsfelder/finanzsystem-kapital/versicherungen-resilienz/", "Kontextseite vorhanden", "Resilienz, Schutzlücken und Versicherbarkeit wirkungsökonomisch einordnen."],
  ["Stranded-Asset-Screener", "", "Demo in Vorbereitung", "Übergangsrisiken und Vermögenswerte mit sinkender Zukunftsfähigkeit sichtbar machen."],
  ["KMU-Wirkungsstart", "", "Demo in Vorbereitung", "Ein niederschwelliger Einstieg für kleine und mittlere Unternehmen."],
];

function htmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeMarkdown(markdown) {
  return markdown
    .replace(
      /Enthält keine internen CodeX-\/Repository-Anweisungen/g,
      "Öffentliche Webfassung ohne technische Arbeitsnotizen"
    )
    .replace(/CodeX-\/Repository-Anweisungen/g, "technische Arbeitsnotizen")
    .replace(/CodeX/g, "redaktionelle Arbeitsnotizen")
    .replace(/Codex/g, "redaktionelle Arbeitsnotizen")
    .replace(/Repository/g, "Projektarchiv");
}

function inlineMarkdown(text) {
  let out = htmlEscape(text);
  out = out.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label, href) => {
    const safeHref = htmlEscape(href);
    const external = /^https?:\/\//.test(href);
    return `<a class="text-link" href="${safeHref}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  return out;
}

function parseTable(lines) {
  const rows = lines.map((line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
  );
  const header = rows[0] ?? [];
  const body = rows.slice(2);
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${header
    .map((cell) => `<th>${inlineMarkdown(cell)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const headings = [];
  const blocks = [];
  let paragraph = [];
  let list = null;
  let table = [];

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }
  function flushList() {
    if (list) {
      blocks.push(`<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`);
      list = null;
    }
  }
  function flushTable() {
    if (table.length) {
      blocks.push(parseTable(table));
      table = [];
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    if (/^\|/.test(line)) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();

    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(line);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const depth = headingMatch[1].length;
      const text = headingMatch[2].replace(/\s+#+$/, "");
      if (depth === 1) {
        continue;
      }
      const level = Math.min(depth, 3);
      const idBase = slugify(text.replace(/^\d+\.\s*/, ""));
      let id = idBase || `abschnitt-${headings.length + 1}`;
      let suffix = 2;
      while (headings.some((heading) => heading.id === id)) {
        id = `${idBase}-${suffix}`;
        suffix += 1;
      }
      headings.push({ level, text, id });
      blocks.push(`<h${level} id="${id}">${inlineMarkdown(text)} <a class="cite-anchor no-print" href="#${id}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h${level}>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      flushParagraph();
      const type = ordered ? "ol" : "ul";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((ordered || unordered)[1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushTable();

  return { headings, html: blocks.join("\n") };
}

function sitePathExists(sitePath) {
  if (!sitePath) return false;
  const local = path.join(root, sitePath.replace(/^\//, ""), "index.html");
  return fs.existsSync(local);
}

function renderToolCards() {
  return toolCards
    .map(([title, href, status, text]) => {
      const activeHref = sitePathExists(href) ? href : "";
      return `<article class="card">
        <p class="card-kicker">${status}</p>
        <h3 class="card-title">${htmlEscape(title)}</h3>
        <p class="card-text">${htmlEscape(text)}</p>
        <div class="portal-card-actions">${activeHref ? `<a class="text-link" href="${activeHref}">Öffnen</a>` : `<span class="prototype-badge">Demo in Vorbereitung</span>`}</div>
      </article>`;
    })
    .join("\n");
}

function renderLinkCards(items) {
  return items
    .filter(([, href]) => sitePathExists(href))
    .map(
      ([title, href, text]) => `<article class="card">
        <h3 class="card-title">${htmlEscape(title)}</h3>
        <p class="card-text">${htmlEscape(text)}</p>
        <div class="portal-card-actions"><a class="text-link" href="${href}">Öffnen</a></div>
      </article>`
    )
    .join("\n");
}

function renderSdgRefs() {
  let index = 1;
  const sdgHtml = sdgs
    .map(([label, slug, text]) => {
      const id = `go5-sdg-${index++}`;
      return `<span class="sdg-ref"><a class="sdg-ref-link" href="/verstehen/sdgs-sdgplus/${slug}/" aria-label="${htmlEscape(`${label}: ${text}`)}" aria-describedby="${id}">${htmlEscape(label)}</a><button class="sdg-ref-info" type="button" aria-label="${htmlEscape(`Kurzbeschreibung zu ${label}: ${text}`)}" aria-describedby="${id}">i</button><span class="sdg-ref-popover" id="${id}" role="tooltip">${htmlEscape(text)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
    })
    .join("");
  const plusHtml = sdgPlus
    .map(([label, anchor, text]) => {
      const id = `go5-sdgplus-${index++}`;
      return `<span class="sdg-ref"><a class="sdg-ref-link" href="/verstehen/sdgs-sdgplus/${anchor}" aria-label="${htmlEscape(`${label}: ${text}`)}" aria-describedby="${id}">${htmlEscape(label)}</a><button class="sdg-ref-info" type="button" aria-label="${htmlEscape(`Kurzbeschreibung zu ${label}: ${text}`)}" aria-describedby="${id}">i</button><span class="sdg-ref-popover" id="${id}" role="tooltip">${htmlEscape(text)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
    })
    .join("");
  return `<div class="model-strip">${sdgHtml}${plusHtml}</div>`;
}

function renderToc(headings) {
  return `<nav class="toc-links" aria-label="Inhaltsverzeichnis">${headings
    .filter((heading) => heading.level <= 3)
    .map((heading) => `<a class="toc-level-${heading.level}" href="#${heading.id}">${inlineMarkdown(heading.text)}</a>`)
    .join("")}</nav>`;
}

function renderDownloads(doc) {
  const docxHref = `/assets/downloads/${doc.docx}`;
  const pdfHref = `/assets/downloads/${doc.pdf}`;
  return `<div class="card-grid two">
    <article class="card">
      <p class="card-kicker">DOCX · Detailkonzept · ${doc.number}</p>
      <h3 class="card-title">Word-Download</h3>
      <p class="card-text">Version ${doc.number} / v1.0, öffentliche Exportfassung.</p>
      <div class="portal-card-actions"><a class="text-link" href="${docxHref}">DOCX herunterladen</a></div>
    </article>
    <article class="card">
      <p class="card-kicker">PDF · Detailkonzept · ${doc.number}</p>
      <h3 class="card-title">PDF-Download</h3>
      <p class="card-text">Archiv- und Lesefassung. Online-Volltext bleibt der Hauptzugang.</p>
      <div class="portal-card-actions"><a class="text-link" href="${pdfHref}">PDF öffnen</a></div>
    </article>
  </div>`;
}

function renderPage(doc, body, toc) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${htmlEscape(doc.title)} | Wirkungsökonomie</title>
    <meta name="description" content="${htmlEscape(doc.description)}">
    <meta name="search_title" content="${htmlEscape(doc.title)}">
    <meta name="search_description" content="${htmlEscape(doc.description)}">
    <meta name="search_section" content="Wirkungsfelder">
    <meta name="search_type" content="Detailkonzept">
    <link rel="canonical" href="https://wirkungsoekonomie.de/wirkungsfelder/wirtschaft-unternehmen/${doc.slug}/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${htmlEscape(doc.title)}">
    <meta property="og:description" content="${htmlEscape(doc.description)}">
    <meta property="og:url" content="https://wirkungsoekonomie.de/wirkungsfelder/wirtschaft-unternehmen/${doc.slug}/">
    <meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="/assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/assets/css/style.css?v=20260524-go5-wirtschaft-detailkonzepte">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="/assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="/">Start</a>
        <a href="/verstehen.html">Verstehen</a>
        <a href="/wirkungsfelder/">Wirkungsfelder</a>
        <a href="/werkzeuge/">Werkzeuge</a>
        <a href="/erleben.html">Erleben</a>
        <a href="/werkstatt/">Werkstatt</a>
        <a href="/akademie.html">Akademie</a>
        <a href="/blog.html">Journal</a>
        <a href="/suche.html">Suche</a>
      </nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${htmlEscape(doc.title)} · https://wirkungsoekonomie.de/wirkungsfelder/wirtschaft-unternehmen/${doc.slug}/ · Druckdatum: 24.05.2026</p>
      <section class="hero portal-hero">
        <div class="hero-content">
          <nav class="breadcrumb"><a href="/">Start</a> / <a href="/wirkungsfelder/">Wirkungsfelder</a> / <a href="/wirkungsfelder/wirtschaft-unternehmen/">Wirtschaft &amp; Unternehmen</a></nav>
          <p class="hero-kicker">Wirtschaft &amp; Unternehmen · echtes Detailkonzept ${doc.number}</p>
          <h1>${htmlEscape(doc.title)}</h1>
          <p class="hero-subtitle">${htmlEscape(doc.subtitle)}</p>
          <p>${htmlEscape(doc.description)}</p>
          <div class="hero-actions no-print">
            <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
            <a class="btn btn-primary" href="#online-volltext">Online-Volltext lesen</a>
            <a class="btn btn-secondary" href="#downloads">Downloads</a>
          </div>
        </div>
      </section>
      <section class="section narrow">
        <aside class="card status-meta" aria-label="Dokumentstatus">
          <p class="card-kicker">Publikationsstatus</p>
          <dl>
            <div><dt>Detailkonzept</dt><dd>veröffentlicht</dd></div>
            <div><dt>Dossier</dt><dd>in Arbeit</dd></div>
            <div><dt>Tool/Demo</dt><dd>in Vorbereitung</dd></div>
            <div><dt>Autorin</dt><dd>Natalie Weber</dd></div>
            <div><dt>Version</dt><dd>v1.0</dd></div>
            <div><dt>Stand</dt><dd>24.05.2026</dd></div>
          </dl>
        </aside>
      </section>
      <section class="section" aria-labelledby="toc">
        <div class="section-header">
          <p class="hero-kicker">Online-Volltext</p>
          <h2 id="toc">Inhaltsverzeichnis <a class="cite-anchor no-print" href="#toc" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        </div>
        ${toc}
      </section>
      <section class="section" aria-labelledby="tools">
        <div class="section-header">
          <p class="hero-kicker">Kontext</p>
          <h2 id="tools">Werkzeuge in diesem Bereich <a class="cite-anchor no-print" href="#tools" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        </div>
        <div class="card-grid three">${renderToolCards()}</div>
      </section>
      <section class="section" aria-labelledby="sdg-bezug">
        <div class="portal-reference-block">
          <p class="hero-kicker">Referenzrahmen</p>
          <h2 id="sdg-bezug">SDG-/SDG+-Bezug <a class="cite-anchor no-print" href="#sdg-bezug" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
          ${renderSdgRefs()}
          <p>Wirkung ist neutral und relational. Bewertet wird sie am Referenzrahmen der SDGs, der Agenda 2030 und SDG+. SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie.</p>
        </div>
      </section>
      <section class="section" aria-labelledby="buchanker">
        <div class="section-header">
          <p class="hero-kicker">Online-Buch</p>
          <h2 id="buchanker">Anker im Online-Buch <a class="cite-anchor no-print" href="#buchanker" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        </div>
        <div class="model-strip">${bookAnchors
          .filter(([, href]) => sitePathExists(href))
          .map(([label, href]) => `<a href="${href}">${htmlEscape(label)}</a>`)
          .join("")}</div>
      </section>
      <section class="section" aria-labelledby="querverweise">
        <div class="section-header">
          <p class="hero-kicker">Vernetzung</p>
          <h2 id="querverweise">Querverlinkungen <a class="cite-anchor no-print" href="#querverweise" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        </div>
        <div class="card-grid three">${renderLinkCards(crossLinks)}</div>
      </section>
      <section class="section prose-section" aria-labelledby="online-volltext">
        <div class="section-header">
          <p class="hero-kicker">Volltext</p>
          <h2 id="online-volltext">Online lesen <a class="cite-anchor no-print" href="#online-volltext" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        </div>
        <article class="card longform-content">
          ${body}
        </article>
      </section>
      <section class="section" aria-labelledby="downloads">
        <div class="section-header">
          <p class="hero-kicker">Export</p>
          <h2 id="downloads">Downloads und Druck <a class="cite-anchor no-print" href="#downloads" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
          <p>Online-Volltext ist der Hauptzugang. Word und PDF sind ergänzende Export- und Archivfassungen.</p>
        </div>
        ${renderDownloads(doc)}
        <div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button></div>
      </section>
      <section class="section" aria-labelledby="quellenblock">
        <div class="card">
          <p class="hero-kicker">Quellen</p>
          <h2 id="quellenblock">Quellen und Referenzen <a class="cite-anchor no-print" href="#quellenblock" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
          <p>Die Detailkonzepte nennen Quellen und Datenbezüge im Online-Volltext. Externe Regulierungs- und Methodenanschlüsse werden in den verlinkten Werkzeug- und Wirkungsfeldseiten fortgeführt.</p>
          <div class="model-strip">
            <a href="https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en" target="_blank" rel="noopener noreferrer">EU CSRD <span class="sr-only">(externe Quelle)</span></a>
            <a href="https://www.efrag.org/en/sustainability-reporting" target="_blank" rel="noopener noreferrer">EFRAG ESRS <span class="sr-only">(externe Quelle)</span></a>
            <a href="https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/sustainable-finance/guidelines-management-esg-risks" target="_blank" rel="noopener noreferrer">EBA ESG Risk Guidelines <span class="sr-only">(externe Quelle)</span></a>
            <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer">UN SDGs <span class="sr-only">(externe Quelle)</span></a>
          </div>
        </div>
      </section>
    </main>
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">Wirkungsökonomie</p>
          <h2>Die neue Ordnung des Wohlstands</h2>
          <p>Wirkung sichtbar machen, bewerten und in Entscheidungen zurückführen.</p>
        </div>
        <nav class="footer-nav" aria-label="Footer Navigation">
          <div class="footer-nav-group"><h3>Wirkungsfelder</h3><div class="footer-nav-links"><a href="/wirkungsfelder/wirtschaft-unternehmen/">Wirtschaft &amp; Unternehmen</a><a href="/wirkungsfelder/produkte-konsum/">Produkte &amp; Konsum</a><a href="/wirkungsfelder/finanzsystem-kapital/">Finanzsystem &amp; Kapital</a></div></div>
          <div class="footer-nav-group"><h3>Werkzeuge</h3><div class="footer-nav-links"><a href="/werkzeuge/woek-ids/">WÖk-IDs</a><a href="/werkzeuge/scorecards/">Scorecards</a><a href="/werkzeuge/impact-controlling/t-sroi/">T-SROI</a></div></div>
          <div class="footer-nav-group"><h3>Referenz</h3><div class="footer-nav-links"><a href="/verstehen/sdgs-sdgplus/">SDG-/SDG+-Referenzrahmen</a><a href="/referenz/">Online-Buch</a><a href="/suche.html">Suche</a></div></div>
        </nav>
      </div>
    </footer>
    <script src="/assets/js/main.js?v=20260524-go5-wirtschaft-detailkonzepte" defer></script>
  </body>
</html>`;
}

fs.mkdirSync(path.join(root, "assets/downloads"), { recursive: true });
fs.mkdirSync(path.join(root, "data/wirtschaft-unternehmen"), { recursive: true });
fs.copyFileSync(path.join(downloadsDir, "go5_detailkonzepte_index_v1_0.json"), path.join(root, "data/wirtschaft-unternehmen/go5_detailkonzepte_index_v1_0.json"));
fs.copyFileSync(path.join(downloadsDir, "go5_detailkonzepte_index_v1_0.csv"), path.join(root, "data/wirtschaft-unternehmen/go5_detailkonzepte_index_v1_0.csv"));

for (const doc of docs) {
  fs.copyFileSync(path.join(downloadsDir, doc.docx), path.join(root, "assets/downloads", doc.docx));
  fs.copyFileSync(path.join(downloadsDir, doc.pdf), path.join(root, "assets/downloads", doc.pdf));

  const markdown = sanitizeMarkdown(fs.readFileSync(path.join(downloadsDir, doc.source), "utf8"));
  const { headings, html } = renderMarkdown(markdown);
  const page = renderPage(doc, html, renderToc(headings));
  const targetDir = path.join(root, "wirkungsfelder/wirtschaft-unternehmen", doc.slug);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "index.html"), page);
}

const publicPages = docs.map((doc) => path.join(root, "wirkungsfelder/wirtschaft-unternehmen", doc.slug, "index.html"));
const forbidden = [/CodeX/i, /Codex/i, /Repository/i, /Sitemap aktualisieren/i, /Dateien anlegen/i, /bitte prüfen/i, /ChatGPT/i, /interne Aufgabe/i, /Abschlussbericht/i];
for (const file of publicPages) {
  const text = fs.readFileSync(file, "utf8");
  const hit = forbidden.find((pattern) => pattern.test(text));
  if (hit) {
    throw new Error(`Öffentlicher Inhalt enthält internen Begriff (${hit}) in ${file}`);
  }
}
