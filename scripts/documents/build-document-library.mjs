import fs from "node:fs";
import path from "node:path";

const registryPath = "assets/data/document-registry.json";
const auditPath = "docs/document-registry-audit.md";
const downloadsPath = "downloads.html";
const libraryRoot = "bibliothek";
const siteUrl = "https://wirkungsoekonomie.de";

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const publicDocuments = registry.filter((document) => document.isPublic !== false);
const currentDocuments = publicDocuments.filter((document) => document.status === "current" && !document.isArchive);
const archiveDocuments = publicDocuments.filter((document) => document.status !== "current" || document.isArchive);
const labelBySlug = new Map([
  ["sdg-plus", "SDG+"],
  ["woek-id", "WÖk-ID"],
  ["t-sroi", "T-SROI"],
  ["nwi", "NWI"],
  ["wstg", "WStG"],
  ["wirkungseinkommen", "Wirkungseinkommen"],
  ["wirkungsfonds", "Wirkungsfonds"],
  ["wirkungsrueckkopplung", "Wirkungsrückkopplung"],
  ["positive-netto-wirkung", "Positive Netto-Wirkung"],
  ["mensch-planet-demokratie", "Mensch, Planet und Demokratie"],
]);

const explicitScopeById = new Map([
  ["die-neue-ordnung-des-wohlstands", {
    key: "buch-langform",
    label: "Buch / Langform",
    description: "Umfangreiche Buchfassung für längere Lektüre und Nachschlagen.",
  }],
  ["woek-master-items-v1-2", {
    key: "register",
    label: "Register / Nachschlagewerk",
    description: "Strukturierte Referenz, nicht als klassischer Lesetext gedacht.",
  }],
  ["live-impact-rating-konzept", {
    key: "kurzpapier",
    label: "Kurzes Thesenpapier / Konzept",
    description: "Knapper Konzeptstand. Gute Orientierung, aber noch keine Langfassung.",
  }],
  ["milram-kampagnenanalyse", {
    key: "kurzbeispiel",
    label: "Kurzbeispiel / Fallnotiz",
    description: "Kurze Fallnotiz zur Veranschaulichung, keine umfassende Studie.",
  }],
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeHtml(file, html) {
  fs.writeFileSync(file, html.replace(/[ \t]+$/gm, ""), "utf8");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizePath(value) {
  if (!value) return "";
  return value.startsWith("/") ? value : `/${value}`;
}

function siteLink(value) {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  return `${siteUrl}${normalizePath(value)}`;
}

function slugToLabel(value) {
  return String(value || "")
    .replace(/^\/|\/$/g, "")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "Seite";
}

function tagList(items) {
  if (!items?.length) return "";
  return `<div class="document-tag-list">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}

function parseFileSizeMb(value) {
  const raw = String(value || "").trim().replace(",", ".");
  const number = Number.parseFloat(raw);
  if (!Number.isFinite(number)) return 0;
  if (/kb/i.test(raw)) return number / 1024;
  if (/mb/i.test(raw)) return number;
  return 0;
}

function wordCount(document) {
  if (!document.contentHtmlPath || !fs.existsSync(document.contentHtmlPath)) return 0;
  return fs
    .readFileSync(document.contentHtmlPath, "utf8")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function documentScope(document) {
  if (explicitScopeById.has(document.id)) return explicitScopeById.get(document.id);

  const words = wordCount(document);
  const fileMb = parseFileSizeMb(document.fileSize);
  const type = String(document.type || "").toLowerCase();

  if (type.includes("handout")) {
    return {
      key: "kurzpapier",
      label: "Handout / Kurzüberblick",
      description: "Kompakter Überblick für schnellen Einstieg, Unterricht oder Weitergabe.",
    };
  }

  if (type.includes("fallstudie") || type.includes("use case") || type.includes("essay")) {
    return words > 3000
      ? {
          key: "mittlere-ausarbeitung",
          label: "Mittlere Ausarbeitung",
          description: "Mehr als ein Kurzpapier, aber bewusst noch kompakt lesbar.",
        }
      : {
          key: "kurzbeispiel",
          label: "Kurzbeispiel / Fallnotiz",
          description: "Kurzes Beispiel zur Veranschaulichung, keine vollständige Langstudie.",
        };
  }

  if (type.includes("gesetz")) {
    return {
      key: fileMb >= 1.5 || words >= 5000 ? "langfassung" : "mittlere-ausarbeitung",
      label: fileMb >= 1.5 || words >= 5000 ? "Ausführlicher Entwurf" : "Kompakter Entwurf",
      description: "Fachlicher Modell- oder Gesetzesentwurf, keine amtliche Fassung.",
    };
  }

  if (words >= 12000 || fileMb >= 4) {
    return {
      key: "langfassung",
      label: "Umfangreiche Langfassung",
      description: "Ausführlich ausgearbeitet; geeignet für vertiefte Lektüre, Zitation und Facharbeit.",
    };
  }

  if (words >= 4500 || fileMb >= 1.2 || type.includes("dossier") || type.includes("whitepaper") || type.includes("working paper") || type.includes("handbuch")) {
    return {
      key: "mittlere-ausarbeitung",
      label: "Mittlere bis längere Ausarbeitung",
      description: "Mehr als ein Kurzpapier; enthält bereits Kontext, Argumentation und Anwendung.",
    };
  }

  if (words >= 1800 || fileMb >= 0.12 || type.includes("arbeitspapier") || type.includes("konzeptpapier") || type.includes("leitbild") || type.includes("methodenpapier")) {
    return {
      key: "kurzpapier",
      label: "Kurzes Thesenpapier / Konzept",
      description: "Kompakter Stand mit These, Logik und ersten Bausteinen; noch keine Langfassung.",
    };
  }

  return {
    key: "kurzpapier",
    label: "Kurzer Konzeptstand",
    description: "Kurzer öffentlicher Stand zur Orientierung; noch keine vollständige Ausarbeitung.",
  };
}

const libraryGroups = [
  {
    key: "buch",
    title: "Bücher und Grundlagenwerke",
    intro: "Lange Grundlagen, Buchfassungen und tragende Referenzen. Für zusammenhängende Lektüre und Orientierung im Gesamtmodell.",
  },
  {
    key: "ausarbeitung",
    title: "Lange Ausarbeitungen",
    intro: "Umfangreiche Arbeitspapiere, Konzepte und Dossiers werden öffentlich einheitlich als Ausarbeitungen geführt. Sie sind online lesbar und als PDF verfügbar.",
  },
  {
    key: "thesenpapier",
    title: "Thesenpapiere und kurze Konzepte",
    intro: "Kompakte Einstiege, die ein Thema öffnen, erste Annahmen zeigen oder eine spätere Ausarbeitung vorbereiten.",
  },
  {
    key: "beispiel",
    title: "Beispiele und Fallnotizen",
    intro: "Konkrete Fälle, kurze Analysen und Anwendungsskizzen. Sie zeigen, wie die Logik praktisch gelesen werden kann.",
  },
  {
    key: "methodik",
    title: "Methodik, Register und Lernmaterial",
    intro: "Methodische Grundlagen, Bewertungsbausteine, Register und Lernmaterialien für Anwendung, Akademie und Werkzeuge.",
  },
  {
    key: "recht",
    title: "Rechts- und Steuerungsentwürfe",
    intro: "Modellhafte Gesetzes-, Steuerungs- und Governance-Entwürfe. Keine amtlichen Fassungen und keine Rechtsberatung.",
  },
];

const libraryGroupOrder = new Map(libraryGroups.map((group, index) => [group.key, index]));

function publicDocumentRole(document) {
  const scope = documentScope(document);
  const type = String(document.type || "").toLowerCase();
  const categories = (document.category || []).map((item) => String(item).toLowerCase());

  if (document.id === "die-neue-ordnung-des-wohlstands" || type.includes("grundlagenwerk") || type === "buch") {
    return {
      key: "buch",
      label: "Buch / Grundlagenwerk",
      note: "Lange Referenz für zusammenhängende Lektüre.",
    };
  }

  if (type.includes("gesetz") || categories.includes("recht") || categories.includes("steuern")) {
    return {
      key: "recht",
      label: "Rechts- und Steuerungsentwurf",
      note: "Modellhafter Entwurf, keine amtliche Fassung.",
    };
  }

  if (type.includes("method") || type.includes("register") || type.includes("handbuch")) {
    return {
      key: "methodik",
      label: "Methodik / Lernmaterial",
      note: "Hilft beim Anwenden, Prüfen oder Lernen.",
    };
  }

  if (type.includes("fallstudie") || type.includes("use case") || type.includes("essay") || document.id.includes("beispiel") || document.id.includes("kampagnenanalyse")) {
    return {
      key: "beispiel",
      label: "Beispiel / Fallnotiz",
      note: "Konkrete Anwendung oder kurze Analyse.",
    };
  }

  if (scope.key === "langfassung" || scope.key === "mittlere-ausarbeitung" || type.includes("dossier") || type.includes("whitepaper") || type.includes("working paper") || type.includes("arbeitspapier") || type.includes("detailkonzept")) {
    return {
      key: scope.key === "kurzpapier" ? "thesenpapier" : "ausarbeitung",
      label: scope.key === "kurzpapier" ? "Thesenpapier / kurzes Konzept" : "Ausarbeitung",
      note: scope.key === "kurzpapier"
        ? "Kompakter Einstieg; noch keine umfassende Langfassung."
        : "Ausgearbeiteter Text, online lesbar und als PDF verfügbar.",
    };
  }

  return {
    key: "thesenpapier",
    label: "Thesenpapier / kurzes Konzept",
    note: "Kompakter Einstieg; noch keine umfassende Langfassung.",
  };
}

function publicDocumentSummary(document) {
  const role = publicDocumentRole(document);
  const replacement = role.key === "thesenpapier" ? "Dieses Thesenpapier" : "Diese Ausarbeitung";
  return String(document.summary || "")
    .replace(/^Das Dossier\b/, replacement)
    .replace(/^Ein Dossier\b/, role.key === "thesenpapier" ? "Ein Thesenpapier" : "Eine Ausarbeitung")
    .replace(/^Das Arbeitspapier\b/, replacement)
    .replace(/^Ein Arbeitspapier\b/, role.key === "thesenpapier" ? "Ein Thesenpapier" : "Eine Ausarbeitung")
    .replace(/^Das Konzeptpapier\b/, replacement)
    .replace(/^Ein Konzeptpapier\b/, role.key === "thesenpapier" ? "Ein Thesenpapier" : "Eine Ausarbeitung")
    .replace(/^Das Whitepaper\b/, replacement)
    .replace(/^Ein Whitepaper\b/, role.key === "thesenpapier" ? "Ein Thesenpapier" : "Eine Ausarbeitung");
}

function sortedDocuments(documents) {
  return [...documents].sort((a, b) => {
    const groupA = publicDocumentRole(a);
    const groupB = publicDocumentRole(b);
    const groupDelta = (libraryGroupOrder.get(groupA.key) ?? 99) - (libraryGroupOrder.get(groupB.key) ?? 99);
    if (groupDelta) return groupDelta;
    return String(a.title).localeCompare(String(b.title), "de");
  });
}

function documentScopeMarkup(document) {
  const scope = documentScope(document);
  const role = publicDocumentRole(document);
  return `<div class="document-scope-row document-scope-${escapeHtml(scope.key)}">
    <span class="document-scope-badge">${escapeHtml(role.label)}</span>
    <span class="document-scope-note">${escapeHtml(scope.label)} · ${escapeHtml(role.note)} ${escapeHtml(scope.description)}</span>
  </div>`;
}

function linkList(items, labeler = slugToLabel) {
  if (!items?.length) return `<p class="card-text">Keine direkte Verknüpfung hinterlegt.</p>`;
  return `<ul class="clean-list document-link-list">${items
    .map((item) => `<li><a class="text-link" href="${escapeHtml(item)}">${escapeHtml(labeler(item))}</a></li>`)
    .join("")}</ul>`;
}

function relationLabelFromTerm(term) {
  if (labelBySlug.has(term)) return labelBySlug.get(term);
  return String(term || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function termHref(term) {
  const route = `/begriffe/${term}/`;
  return fs.existsSync(path.join(route.replace(/^\/|\/$/g, ""), "index.html")) ? route : "/glossar.html";
}

function relatedActionLabel(url) {
  if (!url) return "Vertiefung lesen";
  if (/\/erleben\/automatisierungs-wirkungseinkommensrechner\/|\/anwendungen\/scanner\.html/.test(url)) return "Passendes Tool testen";
  if (/\/werkzeuge\//.test(url)) return "Methodik lesen";
  if (/\/erleben/.test(url)) return "Beispiele ansehen";
  return "Vertiefung lesen";
}

function relationLinks(document) {
  const terms = (document.relatedTerms || []).map((term) => ({ term, href: termHref(term) }));
  return `
    <div class="document-related-grid">
      <article class="card compact">
        <p class="card-kicker">Begriffe</p>
        ${terms.length ? `<ul class="clean-list document-link-list">${terms.map(({ term, href }) => `<li><a class="text-link" href="${escapeHtml(href)}">${escapeHtml(relationLabelFromTerm(term))}</a></li>`).join("")}</ul>` : `<p class="card-text">Keine direkte Verknüpfung hinterlegt.</p>`}
      </article>
      <article class="card compact">
        <p class="card-kicker">Wirkungsfelder</p>
        ${linkList(document.relatedFields || [])}
      </article>
      <article class="card compact">
        <p class="card-kicker">Tools und Methoden</p>
        ${linkList(document.relatedTools || [])}
      </article>
    </div>`;
}

function documentOnlineText(document) {
  if (document.contentHtmlPath && fs.existsSync(document.contentHtmlPath)) {
    return `<div class="readable-prose document-online-text">
      ${fs.readFileSync(document.contentHtmlPath, "utf8")}
    </div>`;
  }
  return `
    <p>${escapeHtml(publicDocumentSummary(document))}</p>
    <h3>Warum ist das relevant?</h3>
    <p>Das Dokument hilft, Wirkung nicht als Nebenthema zu behandeln, sondern als Grundlage für bessere Entscheidungen. Es verbindet Begriffe, Bewertungslogik und Anwendung so, dass Nutzer:innen den Zusammenhang zwischen Problem, Wirkung und möglicher Rückkopplung nachvollziehen können.</p>
    <h3>Für wen ist das Material gedacht?</h3>
    <p>${escapeHtml((document.audience || []).join(", "))}. Die Onlinefassung dient als schneller Einstieg. Die PDF-Fassung bleibt für vertiefte Lektüre, Ablage und Weitergabe verfügbar.</p>
    <h3>Wie wird es in der Wirkungsökonomie genutzt?</h3>
    <p>Die Veröffentlichung verknüpft fachliche Begriffe mit Wirkungsfeldern, Methoden und passenden Anwendungen. Dadurch bleibt das Dokument nicht nur ein Download, sondern wird Teil der öffentlichen Wissensstruktur der Wirkungsökonomie.</p>`;
}

function pageShell({ title, description, canonicalPath, main, extraHead = "" }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} - Wirkungsökonomie</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${siteLink(canonicalPath)}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${siteLink(canonicalPath)}">
    <link rel="icon" href="/assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/assets/css/style.css?v=20260526-document-library">
    ${extraHead}
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
        <a href="/erleben.html">Ausprobieren</a>
        <a href="/akademie.html">Akademie</a>
        <a href="/downloads.html">Bibliothek</a>
        <a href="/suche.html">Suche</a>
      </nav>
    </header>
    <main>
${main}
    </main>
    <footer class="site-footer">
      <p><strong>Wirkungsökonomie</strong> - Wissens- und Anwendungsraum für Wirkung auf Mensch, Planet und Demokratie.</p>
      <nav aria-label="Footer">
        <a href="/downloads.html">Bibliothek</a>
        <a href="/glossar.html">Glossar</a>
        <a href="/suche.html">Suche</a>
        <a href="/impressum.html">Impressum</a>
      </nav>
    </footer>
    <script src="/assets/js/main.js" defer></script>
  </body>
</html>
`;
}

function documentJsonLd(document) {
  return `<script type="application/ld+json">${JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: document.title,
      author: { "@type": "Person", name: "Natalie Weber" },
      about: { "@type": "Thing", name: "Wirkungsökonomie" },
      isAccessibleForFree: true,
      url: siteLink(document.onlineUrl),
      downloadUrl: document.pdfUrl ? siteLink(document.pdfUrl) : undefined,
      encodingFormat: document.pdfUrl ? "application/pdf" : "text/html",
      dateModified: document.stand,
      description: publicDocumentSummary(document),
    },
    null,
    2,
  )}</script>`;
}

function documentActions(document, primary = true) {
  if (document.docxUrl && document.allowPublicDocx !== true) {
    throw new Error(`Public DOCX download is not allowed for document ${document.id}`);
  }
  return `<div class="download-actions">
    ${primary && document.onlineUrl ? `<a class="btn btn-primary" href="${escapeHtml(document.onlineUrl)}">Onlinefassung lesen</a>` : ""}
    ${document.pdfUrl ? `<a class="btn btn-secondary" href="${escapeHtml(document.pdfUrl)}" target="_blank" rel="noopener">PDF herunterladen</a>` : ""}
    ${document.relatedTools?.[0] ? `<a class="text-link" href="${escapeHtml(document.relatedTools[0])}">${escapeHtml(relatedActionLabel(document.relatedTools[0]))}</a>` : ""}
  </div>`;
}

function documentCard(document) {
  const scope = documentScope(document);
  const role = publicDocumentRole(document);
  const summary = publicDocumentSummary(document);
  const searchText = [
    document.title,
    summary,
    document.type,
    role.label,
    role.note,
    scope.label,
    scope.description,
    ...(document.category || []),
    ...(document.relatedTerms || []),
    ...(document.audience || []),
  ].join(" ");
  return `<article class="download-card compact" data-download-card data-download-group="${escapeHtml(role.key)}" data-download-category="${escapeHtml([...(document.category || []), scope.key, role.key].join(" ").toLowerCase())}" data-download-title="${escapeHtml(document.title)}" data-download-description="${escapeHtml(searchText)}">
    <p class="card-kicker">${escapeHtml(role.label)} · ${document.isArchive ? "Archiv" : "Aktuell"}</p>
    <h3 class="card-title">${escapeHtml(document.title)}</h3>
    ${documentScopeMarkup(document)}
    <dl class="download-meta">
      <div><dt>Rolle</dt><dd>${escapeHtml(role.label)}</dd></div>
      <div><dt>Umfang</dt><dd>${escapeHtml(scope.label)}</dd></div>
      <div><dt>Stand</dt><dd>${escapeHtml(document.stand)}</dd></div>
      ${document.fileSize ? `<div><dt>Dateigröße</dt><dd>${escapeHtml(document.fileSize)}</dd></div>` : ""}
    </dl>
    <p class="card-text">${escapeHtml(summary)}</p>
    ${tagList(document.category)}
    <div class="download-related"><span>Passend dazu</span>${(document.relatedTerms || []).slice(0, 3).map((term) => `<a href="${escapeHtml(termHref(term))}">${escapeHtml(relationLabelFromTerm(term))}</a>`).join("")}${(document.relatedFields || []).slice(0, 1).map((field) => `<a href="${escapeHtml(field)}">${escapeHtml(slugToLabel(field))}</a>`).join("")}</div>
    ${document.isArchive || !document.onlineUrl ? `<p class="document-archive-badge">Archivmaterial · PDF-only</p>` : ""}
    ${documentActions(document, !document.isArchive && Boolean(document.onlineUrl))}
  </article>`;
}

function groupedDocumentSections(documents) {
  const grouped = new Map(libraryGroups.map((group) => [group.key, []]));
  for (const document of sortedDocuments(documents)) {
    const role = publicDocumentRole(document);
    if (!grouped.has(role.key)) grouped.set(role.key, []);
    grouped.get(role.key).push(document);
  }

  return libraryGroups
    .map((group) => {
      const items = grouped.get(group.key) || [];
      if (!items.length) return "";
      return `<section class="library-group" id="gruppe-${escapeHtml(group.key)}" data-library-group="${escapeHtml(group.key)}">
        <div class="library-group-header">
          <div>
            <p class="hero-kicker">${escapeHtml(items.length)} ${items.length === 1 ? "Dokument" : "Dokumente"}</p>
            <h3>${escapeHtml(group.title)}</h3>
            <p>${escapeHtml(group.intro)}</p>
          </div>
        </div>
        <div class="download-library-grid" data-download-list>${items.map(documentCard).join("\n")}</div>
      </section>`;
    })
    .filter(Boolean)
    .join("\n");
}

function buildDownloadsPage() {
  const groupCards = libraryGroups
    .map((group) => {
      const count = currentDocuments.filter((document) => publicDocumentRole(document).key === group.key).length;
      if (!count) return "";
      return `<a class="library-overview-card" href="#gruppe-${escapeHtml(group.key)}" data-download-filter="${escapeHtml(group.key)}">
        <span>${escapeHtml(count)} ${count === 1 ? "Dokument" : "Dokumente"}</span>
        <strong>${escapeHtml(group.title)}</strong>
        <em>${escapeHtml(group.intro)}</em>
      </a>`;
    })
    .filter(Boolean)
    .join("");

  const jsonLd = `<script type="application/ld+json">${JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Bibliothek der Wirkungsökonomie",
      url: siteLink("/downloads.html"),
      inLanguage: "de",
      description: "Zentrale Dokumentenbibliothek der Wirkungsökonomie mit Onlinefassungen, PDFs, Dossiers und verwandten Begriffen.",
      hasPart: publicDocuments.map((document) => ({
        "@type": "CreativeWork",
        name: document.title,
        url: siteLink(document.onlineUrl),
        downloadUrl: document.pdfUrl ? siteLink(document.pdfUrl) : undefined,
        encodingFormat: document.pdfUrl ? "application/pdf" : "text/html",
      })),
    },
    null,
    2,
  )}</script>`;

  const archiveSection = archiveDocuments.length
    ? `<details class="archive-library"><summary>Archiv und ältere Arbeitsstände</summary>
        <p class="card-text">Diese Materialien bleiben zur Nachvollziehbarkeit erhalten. Der aktuelle Begriffs- und Modellstand liegt in den Onlinefassungen, Begriffseiten und aktuellen Dossiers.</p>
        <div class="download-library-grid">${archiveDocuments.map(documentCard).join("\n")}</div>
      </details>`
    : `<section class="section section-muted"><div class="section-header"><p class="hero-kicker">Archiv</p><h2>Archiv und ältere Arbeitsstände</h2><p>Aktuell sind keine PDF-only Archivdokumente in der öffentlichen Kernbibliothek markiert. Rangpakete und Arbeitsmaterialien bleiben in den jeweiligen Downloadbereichen auffindbar.</p></div></section>`;

  const main = `
      <section class="hero">
        <div>
          <p class="hero-kicker">Bibliothek</p>
          <h1 class="hero-title">Dokumente online lesen und herunterladen.</h1>
          <p class="hero-subtitle">Diese Bibliothek bündelt die öffentlichen Materialien der Wirkungsökonomie als Wissensobjekte: mit Onlinefassung, PDF, passenden Begriffen, Wirkungsfeldern und Tools.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#dokumente">Aktuelle Dokumente ansehen</a>
            <a class="btn btn-secondary" href="/suche.html">Inhalte suchen</a>
          </div>
        </div>
      </section>

      <section class="section section-muted" aria-labelledby="reading-path-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Dokumentarten</p>
            <h2 id="reading-path-title">Was suche ich gerade?</h2>
            <p>Die Bibliothek sortiert Materialien nach öffentlicher Rolle: ob ein Text kurz einführt, ausführlich ausarbeitet, ein Beispiel zeigt oder als Methode beziehungsweise Entwurf dient.</p>
          </div>
          <div class="library-overview-grid">
            ${groupCards}
            <a class="library-overview-card" href="/verstehen/sdgs-sdgplus/">
              <span>Referenzrahmen</span>
              <strong>SDGs &amp; SDG+</strong>
              <em>Die SDGs und SDG+ erklären, worauf Wirkung bezogen wird: globaler UN-Zielrahmen plus demokratische, mediale, rechtsstaatliche und digitale WÖk-Erweiterungen.</em>
            </a>
            <a class="library-overview-card" href="/fuer/">
              <span>Perspektiven</span>
              <strong>Für wen?</strong>
              <em>Zielgruppeneinstiege für Bürger:innen, Journalismus, Unternehmen, Politik, Kommunen, Investor:innen und Akademie.</em>
            </a>
            <a class="library-overview-card" href="/erleben.html">
              <span>Interaktiv</span>
              <strong>Tools und Rechner</strong>
              <em>Rechner, Scanner und Demos stehen im Bereich Ausprobieren. Die Bibliothek verlinkt passende Tools dort, wo Dokumente dazu gehören.</em>
            </a>
          </div>
        </div>
      </section>

      <section class="section" id="dokumente">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Aktuelle Dokumente</p>
            <h2>Onlinefassungen zuerst, PDFs als Download.</h2>
            <p>Aktuelle Veröffentlichungen haben eine lesbare Onlinefassung. PDFs sind die Downloadfassung. Editierbare Arbeitsdateien werden öffentlich nicht angeboten.</p>
          </div>
          <div class="download-library-controls" aria-label="Bibliothek filtern">
            <label class="download-search" for="download-search">
              <span>Titel und Kurzbeschreibung durchsuchen</span>
              <input id="download-search" type="search" placeholder="z. B. Wirkungseinkommen, Medien, Produkte" data-download-search>
            </label>
            <div class="category-row" aria-label="Dokumentkategorien">
              <button class="pill active" type="button" data-download-filter="all">Alle Dokumente</button>
              <button class="pill" type="button" data-download-filter="buch">Bücher</button>
              <button class="pill" type="button" data-download-filter="ausarbeitung">Lange Ausarbeitungen</button>
              <button class="pill" type="button" data-download-filter="thesenpapier">Thesenpapiere</button>
              <button class="pill" type="button" data-download-filter="beispiel">Beispiele</button>
              <button class="pill" type="button" data-download-filter="methodik">Methodik</button>
              <button class="pill" type="button" data-download-filter="recht">Recht / Entwürfe</button>
              <button class="pill" type="button" data-download-filter="grundlagen">Grundlagen</button>
              <button class="pill" type="button" data-download-filter="arbeit">Arbeit</button>
              <button class="pill" type="button" data-download-filter="produkte">Produkte</button>
              <button class="pill" type="button" data-download-filter="medien">Medien</button>
              <button class="pill" type="button" data-download-filter="kommunen">Kommunen</button>
            </div>
            <p class="download-filter-status" aria-live="polite"></p>
          </div>
          ${groupedDocumentSections(currentDocuments)}
        </div>
      </section>

      ${archiveSection}
`;
  writeHtml(
    downloadsPath,
    pageShell({
      title: "Bibliothek der Wirkungsökonomie",
      description: "Zentrale Dokumentenbibliothek der Wirkungsökonomie mit Onlinefassungen, PDFs und passenden Begriffen, Wirkungsfeldern und Tools.",
      canonicalPath: "/downloads.html",
      main,
      extraHead: jsonLd,
    }),
  );
}

function buildDocumentPage(document) {
  const scope = documentScope(document);
  const role = publicDocumentRole(document);
  const keyPoints = (document.keyPoints || [])
    .map((point) => `<li>${escapeHtml(publicDocumentSummary({ ...document, summary: point }))}</li>`)
    .join("");
  const sourceLink = document.sourceOnlineUrl
    ? `<p class="card-text">Für weiterführende Kapitel und bestehende Lesefassungen siehe auch <a class="text-link" href="${escapeHtml(document.sourceOnlineUrl)}">die thematisch passende Onlinefassung</a>.</p>`
    : "";
  const main = `
      <section class="hero document-hero">
        <div>
          <p class="hero-kicker">${escapeHtml(role.label)} · ${escapeHtml(scope.label)}</p>
          <h1 class="hero-title">${escapeHtml(document.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(publicDocumentSummary(document))}</p>
          <dl class="download-meta document-hero-meta">
            <div><dt>Stand</dt><dd>${escapeHtml(document.stand)}</dd></div>
            <div><dt>Status</dt><dd>${document.isArchive ? "Archiv" : "Aktuelle Onlinefassung"}</dd></div>
            <div><dt>Umfang</dt><dd>${escapeHtml(scope.label)}</dd></div>
            <div><dt>Autorin</dt><dd>Natalie Weber</dd></div>
          </dl>
          ${tagList(document.category)}
          <div class="document-scope-box">
            <strong>Einordnung: ${escapeHtml(scope.label)}</strong>
            <p>${escapeHtml(scope.description)}</p>
          </div>
          <div class="hero-actions">
            ${document.pdfUrl ? `<a class="btn btn-primary" href="${escapeHtml(document.pdfUrl)}" target="_blank" rel="noopener">PDF herunterladen</a>` : ""}
            <a class="btn btn-secondary" href="/downloads.html">Zur Bibliothek</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="reading-layout">
          <aside class="toc-card">
            <details>
              <summary>Auf dieser Seite</summary>
              <nav aria-label="Inhaltsverzeichnis">
                <a href="#auf-einen-blick">Auf einen Blick</a>
                <a href="#online-text">Online-Text</a>
                <a href="#verknuepfungen">Verknüpfungen</a>
                <a href="#downloads">Downloads und Quellen</a>
              </nav>
            </details>
          </aside>
          <article class="reading-content">
            <section id="auf-einen-blick" class="summary-box">
              <p class="hero-kicker">Auf einen Blick</p>
              <h2>Worum geht es?</h2>
              <p><strong>Dokumentumfang:</strong> ${escapeHtml(scope.label)}. ${escapeHtml(scope.description)}</p>
              <ul class="clean-list">${keyPoints}</ul>
            </section>

            <section id="online-text">
              <p class="hero-kicker">Online-Text</p>
              <h2>${escapeHtml(document.title)} verständlich eingeordnet</h2>
              ${documentOnlineText(document)}
              ${sourceLink}
            </section>

            <section id="verknuepfungen">
              <p class="hero-kicker">Passend dazu</p>
              <h2>Begriffe, Wirkungsfelder und Tools</h2>
              ${relationLinks(document)}
            </section>

            <section id="downloads" class="material-section">
              <p class="hero-kicker">Downloads und Quellen</p>
              <h2>Material herunterladen oder weiter lesen.</h2>
              <p>Diese Onlinefassung ist der öffentliche Einstieg. Die Downloadfassung steht ergänzend zur Verfügung.</p>
              ${documentActions(document, false)}
              <p class="card-text">Referenz: Wirkungsökonomie. Autorin: Natalie Weber. Stand: ${escapeHtml(document.stand)}.</p>
            </section>
          </article>
        </div>
      </section>
`;
  const outDir = path.join(libraryRoot, document.slug);
  ensureDir(outDir);
  writeHtml(
    path.join(outDir, "index.html"),
    pageShell({
      title: document.title,
      description: publicDocumentSummary(document),
      canonicalPath: document.onlineUrl,
      main,
      extraHead: documentJsonLd(document),
    }),
  );
}

function buildLibraryIndex() {
  ensureDir(libraryRoot);
  writeHtml(
    path.join(libraryRoot, "index.html"),
    pageShell({
      title: "Bibliothek",
      description: "Zentrale Bibliothek der Wirkungsökonomie.",
      canonicalPath: "/bibliothek/",
      main: `<section class="hero"><div><p class="hero-kicker">Bibliothek</p><h1 class="hero-title">Alle Dokumente an einem Ort.</h1><p class="hero-subtitle">Die zentrale Übersicht liegt auf der Download- und Bibliotheksseite.</p><div class="hero-actions"><a class="btn btn-primary" href="/downloads.html">Zur Bibliothek</a></div></div></section>`,
    }),
  );
}

function scanPdfLinks() {
  const htmlFiles = [];
  const ignoreDirs = new Set([".git", "node_modules"]);
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ignoreDirs.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) htmlFiles.push(full);
    }
  }
  walk(".");
  const links = new Map();
  for (const file of htmlFiles) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/href=["']([^"']+\.pdf)["']/gi)) {
      const href = match[1].replace(/^https:\/\/wirkungsoekonomie\.de/, "");
      if (!links.has(href)) links.set(href, new Set());
      links.get(href).add(file.replace(/^\.\//, ""));
    }
  }
  return links;
}

function writeAudit() {
  const pdfFiles = fs
    .readdirSync("assets/pdf")
    .filter((file) => file.endsWith(".pdf"))
    .map((file) => `/assets/pdf/${file}`)
    .sort();
  const linkedPdfs = scanPdfLinks();
  const registryByPdf = new Map(publicDocuments.map((document) => [document.pdfUrl, document]));
  const missingFromRegistry = pdfFiles.filter((file) => !registryByPdf.has(file));
  const registryRows = publicDocuments
    .map((document) => {
      const pdfExists = document.pdfUrl ? fs.existsSync(document.pdfUrl.replace(/^\//, "")) : false;
      const onlineExists = document.onlineUrl ? fs.existsSync(path.join(document.onlineUrl.replace(/^\/|\/$/g, ""), "index.html")) : false;
      const linkedOnPages = document.pdfUrl && linkedPdfs.has(document.pdfUrl) ? linkedPdfs.get(document.pdfUrl).size : 0;
      const status = pdfExists && onlineExists ? "ok" : !onlineExists ? "fehlt online" : "fehlt PDF";
      const scope = documentScope(document);
      return `| ${document.id} | ${document.title} | ${scope.label} | ${pdfExists ? "ja" : "nein"} | ${onlineExists ? "ja" : "nein"} | ja | ${linkedOnPages} | ${status} |`;
    })
    .join("\n");

  const packageCount = (() => {
    let count = 0;
    function walk(dir) {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(pdf|docx|zip)$/i.test(entry.name)) count += 1;
      }
    }
    walk("assets/downloads");
    return count;
  })();

  const audit = `# Document Registry Audit

Stand: ${new Date().toISOString().slice(0, 10)}

## Zusammenfassung

- PDFs in \`assets/pdf/\`: ${pdfFiles.length}
- Dokumente in der Registry: ${publicDocuments.length}
- Aktuelle Dokumente: ${currentDocuments.length}
- Archivdokumente: ${archiveDocuments.length}
- Dokumente mit Onlinefassung: ${publicDocuments.filter((document) => Boolean(document.onlineUrl)).length}
- Aktuelle PDF-only Dokumente: ${currentDocuments.filter((document) => !document.onlineUrl).length}
- Rang- und Paketdateien in \`assets/downloads/\`: ${packageCount}

## Umfangseinordnung

| Umfang | Dokumente |
| --- | ---: |
${[...publicDocuments.reduce((acc, document) => {
  const scope = documentScope(document);
  acc.set(scope.label, (acc.get(scope.label) || 0) + 1);
  return acc;
}, new Map()).entries()].map(([label, count]) => `| ${label} | ${count} |`).join("\n")}

Die Registry bündelt die öffentlichen Kernmaterialien aus \`assets/pdf/\`. Rangpakete, ZIPs und umfangreiche Arbeitsmaterialien bleiben in den bestehenden Downloadbereichen und werden als separater Paketbestand geführt.

## Registry-Prüfung

| id | Titel | Umfang | PDF vorhanden | Onlinefassung vorhanden | Bibliothek | PDF auf Einzelseiten verlinkt | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
${registryRows}

## PDFs ohne Registry-Eintrag

${missingFromRegistry.length ? missingFromRegistry.map((file) => `- ${file}`).join("\n") : "- Keine"}

## Hinweise

- Aktuelle Bibliothekskarten nutzen \`Onlinefassung lesen\` als Primäraktion.
- PDFs bleiben als sekundäre Downloadaktion erhalten.
- Archivmaterial ist für die öffentliche Kernbibliothek derzeit nicht als PDF-only markiert.
`;
  fs.writeFileSync(auditPath, audit);
}

buildLibraryIndex();
for (const document of publicDocuments) {
  buildDocumentPage(document);
}
buildDownloadsPage();
writeAudit();

console.log(`Document library built: ${publicDocuments.length} documents, ${currentDocuments.length} current, ${archiveDocuments.length} archive.`);
