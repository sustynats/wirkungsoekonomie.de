import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const site = "https://wirkungsoekonomie.de";
const cliArgs = new Map(
  process.argv.slice(2).flatMap((arg, index, args) => {
    if (!arg.startsWith("--")) return [];
    const [key, inlineValue] = arg.slice(2).split("=", 2);
    const value = inlineValue ?? args[index + 1] ?? "";
    return [[key, value]];
  })
);
const docxPath = cliArgs.get("docx") || process.env.WOEK_JOURNAL_DOCX || "";
const imageSource = cliArgs.get("image") || process.env.WOEK_JOURNAL_IMAGE || "";
const slug = "wirkstoff-narrative-rechte-frames-wirkungspotenzial";
const outputPath = path.join(root, "blog", `${slug}.html`);
const imageTarget = path.join(root, "assets", "img", "blog", "2026-07-02-wirkstoff-narrative-rechte-frames.webp");
const templatePath = path.join(root, "blog", "was-der-staat-wirklich-produziert-steuern-wirkungsoekonomie.html");

const title = "Wirkstoff Narrative";
const subtitle = "Warum das Wiederholen rechter Frames ihr Wirkungspotenzial aktiviert - selbst im Faktencheck";
const description =
  "Warum Wiederholung, Spiegeln und Faktenchecks rechte Frames erneut aktivieren können - und wie Wirkungschecks öffentliche Debatten besser rahmen.";
const category = "Medien & Öffentlichkeit";
const publishedDate = "2026-07-02";
const publishedLabel = "2. Juli 2026";
const publishedIso = "2026-07-02T12:00:00+02:00";
const readingTime = "12 Min.";
const heroImage = `../assets/img/blog/${path.basename(imageTarget)}`;
const canonical = `${site}/blog/${slug}.html`;
const imageUrl = `${site}/assets/img/blog/${path.basename(imageTarget)}`;
const imageAlt =
  "Dunkles Titelbild zu Wirkstoff Narrative: rechte Frames werden als kommunikativer Wirkstoff wiederholt, verstärkt und können Vertrauen sowie Demokratie belasten.";
const tags = [
  "Wirkstoff",
  "Narrative",
  "Framing",
  "Spiegeln",
  "Wahrheitsillusionseffekt",
  "Faktencheck",
  "Wirkungspotenzial",
  "Wirkungscheck",
  "Resonanzraum",
  "Medienwirkung",
  "Demokratie",
  "Öffentlichkeit"
];

const termLinks = [
  ["Wahrheitsillusionseffekt", "../begriffe/wahrheitsillusionseffekt/"],
  ["Illusory-Truth-Effekt", "../begriffe/wahrheitsillusionseffekt/"],
  ["Wirkungspotenzial", "../begriffe/wirkungspotenzial/"],
  ["Wirkungsökonomie", "../wirkungsoekonomie.html"],
  ["Wirkungscheck", "../werkzeuge/faktencheck/"],
  ["Faktencheck", "../begriffe/faktencheck/"],
  ["Resonanzraum", "../begriffe/resonanzraum/"],
  ["Wirkpfad", "../begriffe/wirkpfad/"],
  ["Narrative", "../begriffe/narrativ/"],
  ["Framing", "../begriffe/framing/"],
  ["Spiegeln", "../begriffe/spiegeln/"],
  ["Wirkstoff", "../begriffe/wirkstoff/"],
  ["Wirkung", "../begriffe/wirkung/"]
];

const sources = [
  {
    label: "Gordon Pennycook, Tyrone D. Cannon, David G. Rand: Prior exposure increases perceived accuracy of fake news.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6279465/"
  },
  {
    label: "Valentina Vellani u. a.: The illusory truth effect leads to the spread of misinformation.",
    url: "https://pubmed.ncbi.nlm.nih.gov/36871397/"
  },
  {
    label: "Steve Rathje, Jay J. Van Bavel, Sander van der Linden: Out-group animosity drives engagement on social media.",
    url: "https://www.pnas.org/doi/10.1073/pnas.2024292118"
  },
  {
    label: "The Debunking Handbook 2020.",
    url: "https://www.climatechangecommunication.org/wp-content/uploads/2023/09/DebunkingHandbook2020.pdf"
  },
  {
    label: "Briony Swire-Thompson, David Lazer: Public health and online misinformation.",
    url: "https://link.springer.com/article/10.1186/s41235-021-00346-6"
  }
];

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value) {
  return String(value || "")
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " und ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeXml(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function docxParagraphs(file) {
  const xml = execFileSync("unzip", ["-p", file, "word/document.xml"], { encoding: "utf8" });
  return [...xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)]
    .map(([paragraph]) => {
      const style = paragraph.match(/<w:pStyle\b[^>]*w:val="([^"]+)"/)?.[1] || "";
      const text = [...paragraph.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)]
        .map((match) => decodeXml(match[1]))
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      return { style, text };
    })
    .filter((paragraph) => paragraph.text);
}

function rewriteText(text) {
  return text
    .replace(
      "Ein wirkungsökonomischer Artikel über TikTok-Lives, AfD-Narrative, den Illusory-Truth-Effekt und die Grenzen des klassischen Faktenchecks.",
      "Ein wirkungsökonomischer Artikel über öffentliche Debatten, Social-Media-Formate, rechte Narrative, den Illusory-Truth-Effekt und die Grenzen des klassischen Faktenchecks."
    )
    .replace(
      "In politischen TikTok-Lives, Threads und Kommentarspalten entsteht gerade ein wiederkehrendes Muster:",
      "In öffentlichen Debatten, sozialen Netzwerken, Talkshows, Threads und Kommentarspalten entsteht immer wieder ein Muster:"
    )
    .replace(
      "Das Problem beginnt dort, wo die Absicht der Sprecherin nicht mehr die Wirkung des Gesagten kontrolliert.",
      "Das Problem beginnt dort, wo die Absicht der Sprechenden nicht mehr die Wirkung des Gesagten kontrolliert."
    )
    .replace("Wenn in einem Live immer wieder Begriffe", "Wenn in einer öffentlichen Debatte immer wieder Begriffe")
    .replace("Gerade in TikTok-Lives ist diese Hoffnung riskant.", "Gerade in digitalen Kurzformaten und aufgeheizten Debatten ist diese Hoffnung riskant.")
    .replace("Menschen hören nebenbei zu.", "Menschen lesen oder hören nebenbei mit.");
}

function linkTerms(html) {
  let linked = html;
  const used = new Set();
  for (const [term, href] of termLinks) {
    const key = term.toLocaleLowerCase("de-DE");
    if (used.has(key)) continue;
    const pattern = new RegExp(`(^|[^>\\p{L}\\p{N}-])(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![^<]*>|[\\p{L}\\p{N}-])`, "u");
    linked = linked.replace(pattern, (match, prefix, value) => {
      used.add(key);
      return `${prefix}<a class="text-link" href="${href}">${value}</a>`;
    });
  }
  return linked;
}

function citeRefs(html) {
  return html.replace(/\[(\d+)\]/g, '<a class="text-link" href="#quelle-$1">[$1]</a>');
}

function p(text, className = "") {
  const classAttr = className ? ` class="${className}"` : "";
  return `<p${classAttr}>${citeRefs(linkTerms(escapeHtml(text)))}</p>`;
}

function h2(text) {
  const clean = text.replace(/^\d+\.\s*/, "");
  const id = slugify(clean);
  return `<h2 id="${id}" data-section-id="${id}">${escapeHtml(clean)} <a class="cite-anchor no-print" href="#${id}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>`;
}

function h3(text) {
  return `<h3>${escapeHtml(text)}</h3>`;
}

function blockquote(text) {
  return `<blockquote>${citeRefs(linkTerms(escapeHtml(text)))}</blockquote>`;
}

function tableHtml() {
  const rows = [
    ["Startpunkt", "Welche Behauptung wurde aufgestellt?", "Welcher Wirkstoff wird aktiviert?"],
    ["Fokus", "Stimmt die Aussage?", "Welche Bilder, Emotionen und Feindbilder werden wiederholt?"],
    ["Risiko", "Falsche Zahl bleibt stehen.", "Falscher Frame bleibt stehen."],
    ["Ziel", "Die Lüge widerlegen.", "Den Wirkstoff neutralisieren und einen besseren Frame setzen."],
    ["Methode", "Mythos nennen, Daten liefern.", "Wahrheitsrahmen zuerst, Mythos knapp markieren, Wirkung erklären."]
  ];
  return `<div class="table-scroll"><table><thead><tr><th>Frage</th><th>Klassischer Faktencheck</th><th>Wirkungscheck</th></tr></thead><tbody>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${linkTerms(escapeHtml(cell))}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function buildArticleBody(paragraphs) {
  const body = [];
  let inList = false;
  const closeList = () => {
    if (inList) {
      body.push("</ul>");
      inList = false;
    }
  };

  for (let i = 0; i < paragraphs.length; i += 1) {
    const { style } = paragraphs[i];
    let text = rewriteText(paragraphs[i].text);

    if (text === title || text === subtitle) continue;
    if (/Arbeitsfassung|Social-Media-Adaption|Stand:\s*2\.\s*Juli\s*2026/i.test(text)) continue;
    if (/^Quellen und weiterführende Literatur$/i.test(text)) continue;
    if (/^\[\d+\]\s+/.test(text)) continue;

    if (text === "Frage" && paragraphs[i + 1]?.text === "Klassischer Faktencheck") {
      closeList();
      body.push(tableHtml());
      i += 17;
      continue;
    }

    if (text.startsWith("•")) {
      if (!inList) {
        body.push('<ul class="clean-list">');
        inList = true;
      }
      body.push(`<li>${citeRefs(linkTerms(escapeHtml(text.replace(/^•\s*/, ""))))}</li>`);
      continue;
    }

    closeList();
    if (style === "Lead") body.push(p(text, "lead"));
    else if (style === "QuoteBox") body.push(blockquote(text));
    else if (style === "Heading1") body.push(h2(text));
    else if (style === "Heading2") body.push(h3(text));
    else body.push(p(text));
  }
  closeList();
  return body.join("\n          ");
}

function extractShell(template) {
  const bodyStart = template.match(/<body>([\s\S]*?)<main id="inhalt" data-pagefind-body>/);
  const bodyEnd = template.match(/<\/main>([\s\S]*?)<\/body>/);
  if (!bodyStart || !bodyEnd) throw new Error("Konnte Header/Footer aus Vorlage nicht extrahieren.");
  return {
    header: bodyStart[1],
    footer: bodyEnd[1]
  };
}

function headHtml() {
  const tagMeta = tags.map((tag) => `    <meta property="article:tag" content="${escapeHtml(tag)}">`).join("\n");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    alternativeHeadline: subtitle,
    description,
    url: canonical,
    image: imageUrl,
    inLanguage: "de",
    datePublished: publishedIso,
    dateModified: publishedIso,
    author: { "@type": "Person", name: "Natalie Weber" },
    publisher: { "@type": "Organization", name: "Wirkungsökonomie", url: site },
    articleSection: category,
    keywords: tags
  };

  return `  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} - Journal der Wirkungsökonomie</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_title" content="${escapeHtml(title)}">
    <meta name="search_description" content="${escapeHtml(description)}">
    <meta name="search_section" content="Journal">
    <meta name="search_type" content="Journalartikel">
    <meta name="search_tags" content="${escapeHtml(tags.join(", "))}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}">
    <meta property="article:published_time" content="${publishedIso}">
    <meta property="article:modified_time" content="${publishedIso}">
    <meta property="article:section" content="${escapeHtml(category)}">
${tagMeta}
    <link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="${site}/feeds/journal.xml">
    <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>
  </head>`;
}

function sourcesHtml() {
  return `<section class="article-sources" id="quellen-und-weiterfuehrende-literatur">
            <h2>Quellen und weiterführende Literatur</h2>
            <ol class="source-list">
${sources.map((source, index) => `              <li id="quelle-${index + 1}">${escapeHtml(source.label)} <a class="text-link" href="${source.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.url)}</a></li>`).join("\n")}
            </ol>
          </section>`;
}

function pageHtml(articleBody) {
  const template = fs.readFileSync(templatePath, "utf8");
  const { header, footer } = extractShell(template);
  return `<!doctype html>
<html lang="de">
${headHtml()}
  <body>${header}<main id="inhalt" data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Start</a> / <a href="../blog.html">Journal</a> / ${escapeHtml(title)}</nav>
          <p class="hero-kicker">Journal · ${escapeHtml(category)} · ${publishedLabel} · ${readingTime}</p>
          <h1 class="hero-title">${escapeHtml(title)}</h1>
          <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
          <p class="meta">Von Natalie Weber</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="${heroImage}" width="1672" height="941" alt="${escapeHtml(imageAlt)}" decoding="async" fetchpriority="high">
          <figcaption>Wiederholung ist nicht neutral: Frames können als kommunikative Wirkstoffe Wirkungspotenzial aktivieren.</figcaption>
        </figure>
      </article>
      <section class="article-page">
        <div class="article-body">
          <details class="toc-card no-print" aria-label="Inhaltsverzeichnis"><summary class="card-title">Inhaltsverzeichnis anzeigen</summary><ol>
            <li><a href="#das-missverstaendnis-man-wiederholt-rechte-um-sie-zu-entlarven">Das Missverständnis</a></li>
            <li><a href="#wirkstoff-wirkungspotenzial-wirkung-die-bessere-sprache-fuer-das-problem">Wirkstoff, Wirkungspotenzial, Wirkung</a></li>
            <li><a href="#warum-der-klassische-faktencheck-oft-wirkungsoekonomisch-falsch-gebaut-ist">Grenzen des Faktenchecks</a></li>
            <li><a href="#die-forschung-wiederholung-macht-vertraut-und-vertrautheit-wirkt">Forschung zur Wiederholung</a></li>
            <li><a href="#wie-gute-gegenkommunikation-aussehen-kann">Gegenkommunikation</a></li>
            <li><a href="#quellen-und-weiterfuehrende-literatur">Quellen</a></li>
          </ol></details>
          <div class="status-note"><strong>Einordnung:</strong> Journal-Beitrag zu öffentlicher Debatte, rechten Narrativen, Wiederholung, Faktencheck und Wirkungsanalyse. Der Beitrag bewertet keine Personen, sondern kommunikative Muster und Wirkpfade. Faktenstand: ${publishedLabel}.</div>
          <div class="callout"><p><strong>Schutzlinie:</strong> „Wirkstoff“ wird hier als Analogie für kommunikative Auslöser verwendet, nicht als naturwissenschaftliche Gleichsetzung. Es geht nicht um Zensur, Sprachpolizei oder Social Credit. Es geht um Wirkungskompetenz in öffentlichen Resonanzräumen: Welche Begriffe werden wieder aktiviert, welche Bilder bleiben hängen, und wie kann Gegenrede wirken, ohne den problematischen Frame zu stärken?</p></div>
          ${articleBody}
          ${sourcesHtml()}
        </div>
      </section>
    </main>${footer}</body>
</html>
`;
}

if (!fs.existsSync(docxPath)) throw new Error(`DOCX fehlt: ${docxPath}`);
if (!fs.existsSync(imageSource)) throw new Error(`Bild fehlt: ${imageSource}`);

fs.mkdirSync(path.dirname(imageTarget), { recursive: true });
execFileSync("/opt/homebrew/bin/cwebp", ["-quiet", "-q", "84", imageSource, "-o", imageTarget], { stdio: "inherit" });

const paragraphs = docxParagraphs(docxPath);
const body = buildArticleBody(paragraphs);
fs.writeFileSync(outputPath, pageHtml(body));

console.log(`Veröffentlicht: ${path.relative(root, outputPath)}`);
console.log(`Bild: ${path.relative(root, imageTarget)}`);
