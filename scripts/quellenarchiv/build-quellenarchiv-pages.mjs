import fs from "node:fs";
import path from "node:path";

// Quellenarchiv-Spiegel: baut statische, read-only Seiten aus dem kuratierten
// Quellenarchiv des Wirkungsinstituts. EINE Datenquelle (die öffentliche Institut-API),
// hier als Snapshot in content/quellenarchiv/sources.json eingefroren, damit der Build
// reproduzierbar/offline-fähig ist (analog content/glossary/terms.json).
//
// Hinzufügen, Bearbeiten und Diskutieren passiert ausschließlich im Institut. Diese
// Seiten sind bewusst read-only: keine Formulare, kein Schreibpfad.
//
// Optional (QUELLENARCHIV_FETCH=1): API frisch ziehen und Snapshot aktualisieren.

const API_URL = process.env.QUELLENARCHIV_API_URL || "https://institut.wirkungsoekonomie.de/api/quellen";
const SNAPSHOT_PATH = "content/quellenarchiv/sources.json";
const GLOSSARY_SOURCE_PATH = "content/quellenarchiv/glossary-source-records.json";
const EVIDENCE_SOURCE_PATH = "content/quellenarchiv/evidence-source-records.json";
const LEGAL_SOURCE_PATH = "content/quellenarchiv/legal-source-records.json";
const PUBLICATION_SUPPLEMENT_DIR = "content/quellenarchiv/publication-supplements";
const EVIDENCE_REGISTRY_PATH = "content/sources/evidence-source-registry.json";
const OUT_DIR = "quellenarchiv";
const CSS_VERSION = "20260612-mobile-table-fix";
const SITE_URL = "https://wirkungsoekonomie.de";

const navigation = JSON.parse(fs.readFileSync("assets/data/navigation.json", "utf8"));
const headerTemplate = fs.readFileSync("templates/header.html", "utf8");
const footerTemplate = fs.readFileSync("templates/footer.html", "utf8");

// ---------------------------------------------------------------------------
// Datenquelle laden (Snapshot; optional API-Refresh)
// ---------------------------------------------------------------------------
function normalizedPublicationLinks(value, context) {
  const rawLinks = Array.isArray(value) ? value : value ? [value] : [];
  const seen = new Map();
  for (const rawLink of rawLinks) {
    if (!rawLink || typeof rawLink !== "object") {
      throw new Error(`${context}: relatedPublications enthält keinen gültigen Eintrag`);
    }
    const title = String(rawLink.title || "").trim();
    const url = String(rawLink.url || "").trim();
    if (!title || !url) {
      throw new Error(`${context}: relatedPublications benötigt title und url`);
    }
    const link = { ...rawLink, title, url };
    const key = `${url.replace(/\/$/, "")}|${title}`;
    seen.set(key, { ...(seen.get(key) || {}), ...link });
  }
  return [...seen.values()];
}

function mergedPublicationLinks(...values) {
  const merged = [];
  const seen = new Map();
  for (const value of values) {
    for (const link of normalizedPublicationLinks(value, "Quellenarchiv-Publikationssupplement")) {
      const key = `${link.url.replace(/\/$/, "")}|${link.title}`;
      seen.set(key, { ...(seen.get(key) || {}), ...link });
    }
  }
  for (const link of seen.values()) merged.push(link);
  return merged;
}

function overrideEntries(value, file) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => {
      const code = String(entry?.code || "").trim();
      if (!code || !entry || typeof entry !== "object") {
        throw new Error(`Ungültiger Override in ${file}: code fehlt`);
      }
      const { code: _code, ...patch } = entry;
      return [code, patch];
    });
  }
  if (typeof value !== "object") throw new Error(`Ungültige overrides-Struktur in ${file}`);
  return Object.entries(value).map(([rawCode, patch]) => {
    const code = String(rawCode || "").trim();
    if (!code || !patch || typeof patch !== "object" || Array.isArray(patch)) {
      throw new Error(`Ungültiger Override in ${file}: ${rawCode || "code fehlt"}`);
    }
    return [code, patch];
  });
}

// Zusätzlich zu den Quellen selbst kann ein Supplement Beziehungen deklarieren.
// Unterstützte Formen:
// { "WÖK-Q-0001": [{ title, url, label }] }
// oder [{ sourceCode: "WÖK-Q-0001", publications: [{ title, url, label }] }].
function relatedPublicationEntries(value, file) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => {
      const code = String(entry?.sourceCode || entry?.source || entry?.code || "").trim();
      if (!code || !entry || typeof entry !== "object") {
        throw new Error(`Ungültiger relatedPublications-Eintrag in ${file}: Quellen-ID fehlt`);
      }
      const publications = entry.publications ?? entry.items ?? entry.relatedPublications ?? (
        entry.title || entry.url ? [{ title: entry.title, url: entry.url, label: entry.label }] : []
      );
      return [code, normalizedPublicationLinks(publications, `${file}: ${code}`)];
    });
  }
  if (typeof value !== "object") throw new Error(`Ungültige relatedPublications-Struktur in ${file}`);
  return Object.entries(value).map(([rawCode, publications]) => {
    const code = String(rawCode || "").trim();
    if (!code) throw new Error(`Ungültiger relatedPublications-Eintrag in ${file}: Quellen-ID fehlt`);
    const links = publications?.publications ?? publications?.items ?? publications?.relatedPublications ?? publications;
    return [code, normalizedPublicationLinks(links, `${file}: ${code}`)];
  });
}

function publicationSupplementPaths() {
  if (!fs.existsSync(PUBLICATION_SUPPLEMENT_DIR)) return [];
  return fs.readdirSync(PUBLICATION_SUPPLEMENT_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b, "de"))
    .map((name) => path.join(PUBLICATION_SUPPLEMENT_DIR, name));
}

function mergeSupplementalSourceRecords(data) {
  const supplementalPaths = [GLOSSARY_SOURCE_PATH, EVIDENCE_SOURCE_PATH, LEGAL_SOURCE_PATH]
    .filter((file) => fs.existsSync(file));
  const clusterLabels = new Map((data.clusters || []).map((cluster) => [cluster.key, cluster.label]));
  const byCode = new Map();
  for (const source of data.sources || []) {
    const code = String(source?.code || "").trim();
    if (!code) throw new Error("Quellenarchiv-Snapshot enthält eine Quellen-ID ohne Wert");
    if (byCode.has(code)) throw new Error(`Doppelte Quellen-ID im Snapshot: ${code}`);
    byCode.set(code, source);
  }

  // Bereits bestehende ergänzende Register behalten ihre bisherige Semantik:
  // Die Basisquelle hat bei einer gleichlautenden ID Vorrang.
  const additionalCodes = new Set();
  for (const file of supplementalPaths) {
    const extra = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const cluster of extra.clusters || []) clusterLabels.set(cluster.key, cluster.label);
    for (const source of extra.sources || []) {
      const code = String(source?.code || "").trim();
      if (!code) throw new Error(`Ergänzende Quelle ohne ID: ${file}`);
      if (additionalCodes.has(code)) {
        throw new Error(`Doppelte ergänzende Quellen-ID: ${source.code} (${file})`);
      }
      additionalCodes.add(code);
      if (!byCode.has(code)) byCode.set(code, source);
    }
  }

  // Veröffentlichungen können Quellen ergänzen oder bestehende Quellen gezielt
  // anreichern. Neue IDs gehören in sources; Änderungen an einer bestehenden ID
  // gehören in overrides. Dadurch bleiben Kollisionen sichtbar und mehrere
  // Veröffentlichungen können ihre Rückverweise verlustfrei zusammenführen.
  for (const file of publicationSupplementPaths()) {
    const supplement = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!supplement || typeof supplement !== "object" || Array.isArray(supplement)) {
      throw new Error(`Ungültiges Quellenarchiv-Publikationssupplement: ${file}`);
    }
    for (const cluster of supplement.clusters || []) clusterLabels.set(cluster.key, cluster.label);
    for (const source of supplement.sources || []) {
      const code = String(source?.code || "").trim();
      if (!code) throw new Error(`Publikationssupplement enthält eine Quelle ohne ID: ${file}`);
      if (byCode.has(code)) {
        throw new Error(`Publikationssupplement dupliziert Quellen-ID ${code} (${file}); verwende overrides.`);
      }
      byCode.set(code, {
        ...source,
        code,
        relatedPublications: mergedPublicationLinks(source.relatedPublications)
      });
    }
    for (const [code, patch] of overrideEntries(supplement.overrides, file)) {
      const current = byCode.get(code);
      if (!current) throw new Error(`Publikationssupplement überschreibt unbekannte Quellen-ID ${code} (${file})`);
      const { relatedPublications: patchLinks, ...values } = patch;
      byCode.set(code, {
        ...current,
        ...values,
        relatedPublications: mergedPublicationLinks(current.relatedPublications, patchLinks)
      });
    }
    for (const [code, links] of relatedPublicationEntries(supplement.relatedPublications, file)) {
      const current = byCode.get(code);
      if (!current) throw new Error(`Publikationssupplement verknüpft unbekannte Quellen-ID ${code} (${file})`);
      byCode.set(code, {
        ...current,
        relatedPublications: mergedPublicationLinks(current.relatedPublications, links)
      });
    }
  }

  const sources = [...byCode.values()]
    .map((source) => ({ ...source, relatedPublications: mergedPublicationLinks(source.relatedPublications) }))
    .sort((a, b) => String(a.code).localeCompare(String(b.code), "de"));
  const clusters = [...clusterLabels.entries()]
    .map(([key, label]) => ({ key, label, count: sources.filter((source) => source.cluster === key).length }))
    .filter((cluster) => cluster.count > 0);
  return { ...data, count: sources.length, sources, clusters };
}

function attachEvidenceRegistryMetadata(data) {
  if (!fs.existsSync(EVIDENCE_REGISTRY_PATH)) return data;
  const registry = JSON.parse(fs.readFileSync(EVIDENCE_REGISTRY_PATH, "utf8"));
  const registrySources = (registry.sources || []).filter((source) => source?.public_display !== false);
  const registryByArchiveCode = new Map();
  for (const source of registrySources) {
    const archiveCode = String(source.archive_code || "").trim();
    if (!archiveCode) continue;
    if (registryByArchiveCode.has(archiveCode)) {
      throw new Error(`Evidenzregister verweist mehrfach auf dieselbe Quellen-ID: ${archiveCode}`);
    }
    registryByArchiveCode.set(archiveCode, source);
  }
  return {
    ...data,
    sources: (data.sources || []).map((source) => {
      const registrySource = registryByArchiveCode.get(source.code);
      if (!registrySource) return source;
      return {
        ...source,
        evidenceRegistryId: registrySource.id,
        evidenceQuality: registrySource.source_quality || "",
        evidenceLocatorType: registrySource.catalog_url ? "katalog" : "original"
      };
    })
  };
}

async function loadData() {
  if (process.env.QUELLENARCHIV_FETCH === "1") {
    try {
      const res = await fetch(API_URL, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.sources) || !json.sources.length) throw new Error("leere Antwort");
      fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true });
      fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(json, null, 2)}\n`);
      console.log(`[quellenarchiv] Snapshot aus API aktualisiert: ${json.sources.length} Quellen`);
      return attachEvidenceRegistryMetadata(mergeSupplementalSourceRecords(json));
    } catch (err) {
      console.warn(`[quellenarchiv] API-Refresh fehlgeschlagen (${err.message}); nutze Snapshot.`);
    }
  }
  return attachEvidenceRegistryMetadata(mergeSupplementalSourceRecords(JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"))));
}

// ---------------------------------------------------------------------------
// Helfer (Chrome/Templates identisch zum Glossar-Generator)
// ---------------------------------------------------------------------------
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function navSlug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ö/g, "oe")
    .replace(/ä/g, "ae")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const headerUtilityLabels = new Set(["Suche", "WÖk-KI", "WÖk-App", "Mein Wirkungsraum"]);

function navMatch(item) {
  return (item.match || [item.href]).join("|");
}

function navLink(item, base) {
  return `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function headerUtilityNav(base) {
  return (navigation.more || [])
    .filter((item) => headerUtilityLabels.has(item.label))
    .map((item) => {
      const label = esc(item.label);
      const text = item.label === "WÖk-KI" ? "KI" : label;
      const utilityClass = item.label === "WÖk-KI" ? "woek-ki" : navSlug(item.label);
      const primary = item.label === "Mein Wirkungsraum" ? ' data-utility-primary="true"' : "";
      return `<a class="site-utility-link site-utility-link--${esc(utilityClass)}" href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}" data-utility-label="${label}"${primary}>${text}</a>`;
    })
    .join("\n    ");
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
    .replace("{{HEADER_NAV}}", navigation.header.map((item) => navLink(item, base)).join("\n    "))
    .replaceAll("{{HEADER_UTILITY_NAV}}", headerUtilityNav(base));
}

function renderFooter(base) {
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n"));
}

function pageShell(title, body, depth = "", options = {}) {
  const metaTitle = options.metaTitle || `${title} - Wirkungsökonomie`;
  const metaDescription = options.metaDescription || `${title} im Quellenarchiv der Wirkungsökonomie.`;
  const canonicalUrl = options.canonicalUrl || `${SITE_URL}/quellenarchiv/`;
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(metaTitle)}</title>
    <meta name="description" content="${esc(metaDescription)}">
    <link rel="canonical" href="${esc(canonicalUrl)}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(metaTitle)}">
    <meta property="og:description" content="${esc(metaDescription)}">
    <meta property="og:url" content="${esc(canonicalUrl)}">
    <link rel="stylesheet" href="${depth}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
${renderHeader(depth)}
    <main class="section">
${body}
    </main>
${renderFooter(depth)}
    <script src="${depth}assets/js/main.js?v=${CSS_VERSION}"></script>
  </body>
</html>
`.replace(/[ \t]+$/gm, "");
}

// ---------------------------------------------------------------------------
// Label-Maps (Codes → deutsche Labels). typeLabel/clusterLabel kommen aus der API.
// ---------------------------------------------------------------------------
const REVIEW_STATUS_LABELS = {
  ungeprueft: "ungeprüft",
  geprueft: "geprüft",
  referenziert: "bibliografisch dokumentiert",
  fuehrend: "führend",
  historisch: "historisch",
  "zu-aktualisieren": "zu aktualisieren"
};
const DATA_QUALITY_LABELS = {
  amtlich: "amtlich",
  "peer-reviewed": "peer-reviewed",
  "graue-literatur": "graue Literatur",
  "bibliografischer-nachweis": "bibliografischer Nachweis",
  standard: "Standard / Norm",
  hoch: "hoch",
  mittel: "mittel",
  niedrig: "niedrig"
};
const ORIGIN_LABELS = { intern: "WÖk-intern", extern: "extern" };

function reviewLabel(v) { return REVIEW_STATUS_LABELS[v] || v || "ungeprüft"; }
function qualityLabel(v) { return DATA_QUALITY_LABELS[v] || v || ""; }
function originLabel(v) { return ORIGIN_LABELS[v] || v || "extern"; }

function slug(code) { return navSlug(code); }

function normalizeSearch(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ö/g, "oe").replace(/ä/g, "ae").replace(/ü/g, "ue").replace(/ß/g, "ss");
}

// Autor:innen/Herausgeber in Einzelnamen zerlegen. Trennzeichen: " / ", ";",
// " & ", " und ", " and ". Bewusst NICHT reines "," (würde "Nachname, Vorname"
// zerreißen). Whitespace wird vereinheitlicht, damit Namen konsistent matchen.
function parseAuthors(author) {
  if (!author) return [];
  return String(author)
    .split(/\s*[;/]\s*|\s+(?:&|und|and)\s+/i)
    .map((a) => a.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
// Kanonische Vergleichsform (identisch zur Client-normalize()) für data-authors.
function authorKey(name) {
  return normalizeSearch(name).replace(/\s+/g, " ").trim();
}
// Verlinkte Autorzeile; jeder Name führt auf die gefilterte Übersicht (?autor=…).
// base = Pfad zur /quellenarchiv/-Übersicht (Detailseite: "../", Übersicht: "").
function authorLine(author, base) {
  const names = parseAuthors(author);
  if (!names.length) return "";
  return names
    .map((n) => `<a href="${base}?autor=${encodeURIComponent(n)}">${esc(n)}</a>`)
    .join(", ");
}

// ---------------------------------------------------------------------------
// Detailseite je Quelle
// ---------------------------------------------------------------------------
function externalLink(source) {
  const url = source.url || (source.doi ? `https://doi.org/${source.doi}` : "");
  return url;
}

function locatorType(source) {
  if (source.locatorType) return source.locatorType;
  const url = externalLink(source);
  if (/^https:\/\/search\.worldcat\.org\/search\?/i.test(url)) return "katalog";
  if (/^https:\/\/api\.openalex\.org\/works\?search=/i.test(url)) return "literatursuche";
  return "direkt";
}

function locatorNote(source) {
  if (source.locatorNote) return source.locatorNote;
  if (locatorType(source) === "katalog") {
    return "Der Link führt zu einer bibliografischen Katalogsuche mit Titel und gegebenenfalls Autor:in. Er ist ein Auffindehinweis, kein Volltext, und ersetzt keine eigene Evidenzprüfung.";
  }
  if (locatorType(source) === "literatursuche") {
    return "Der Link führt zu einer Literatursuche zum bezeichneten Themenfeld. Er ist ein Auffindehinweis und ersetzt weder eine systematische Recherche noch eine eigene Evidenzprüfung.";
  }
  if (locatorType(source) === "nachfolge") {
    return "Der Link führt zu einem Nachfolgeangebot. Er ersetzt nicht automatisch die historische Quelle, ihre Daten, ihre Methodik oder ihre Zeitreihe; diese müssen jeweils gesondert geprüft werden.";
  }
  if (locatorType(source) === "recherchehinweis") {
    return "Der Link führt ausschließlich zu einer offiziellen Rechercheoberfläche. Er ist kein verifizierter Einzelbeleg und darf nicht als solcher zitiert werden.";
  }
  return "";
}

function externalLinkLabel(source) {
  if (locatorType(source) === "katalog") return "Bibliografische Fundstelle öffnen ↗";
  if (locatorType(source) === "literatursuche") return "Literatursuche öffnen ↗";
  if (locatorType(source) === "nachfolge") return "Nachfolgeangebot öffnen ↗";
  if (locatorType(source) === "recherchehinweis") return "Offizielle Recherche öffnen ↗";
  return "Quelle öffnen ↗";
}

function detailBody(source, clusterLabels) {
  const s = slug(source.code);
  const clusterLabel = source.clusterLabel || clusterLabels[source.cluster] || source.cluster || "";
  const ext = externalLink(source);
  const externalLocator = /^https?:\/\//i.test(ext);
  const locatorAttributes = externalLocator ? ' target="_blank" rel="noopener noreferrer"' : "";
  const relatedPublications = mergedPublicationLinks(source.relatedPublications);
  const impactChips = (source.impactFields || [])
    .map((f) => `<span class="term-chip">${esc(f)}</span>`)
    .join("\n            ");
  const relatedPublicationItems = relatedPublications
    .map((publication) => `<li><a class="text-link" href="${esc(publication.url)}">${esc(publication.title)}</a>${publication.label ? ` <span class="muted">(${esc(publication.label)})</span>` : ""}</li>`)
    .join("\n            ");

  const metaRow = [
    `<span>${esc(originLabel(source.origin))}</span>`,
    source.typeLabel ? `<span>${esc(source.typeLabel)}</span>` : "",
    `<span>Prüfstatus: ${esc(reviewLabel(source.reviewStatus))}</span>`,
    source.year ? `<span>${esc(String(source.year))}</span>` : ""
  ].filter(Boolean).join("\n            ");

  const actions = [
    ext ? `<a class="btn btn-primary" href="${esc(ext)}"${locatorAttributes}>${externalLinkLabel(source)}</a>` : "",
    `<a class="btn btn-secondary" href="../">Alle Quellen</a>`,
    `<a class="btn btn-secondary" href="../../suche.html?q=${encodeURIComponent(source.title || source.code)}">Website durchsuchen</a>`
  ].filter(Boolean).join("\n            ");

  // Steckbrief (Meta-Grid) als Definitionsliste
  const facts = [
    ["Cluster", clusterLabel ? `${esc(source.cluster)} · ${esc(clusterLabel)}` : esc(source.cluster)],
    ["Quellentyp", source.typeLabel ? esc(source.typeLabel) : ""],
    ["Herkunft", esc(originLabel(source.origin))],
    ["Prüfstatus", esc(reviewLabel(source.reviewStatus))],
    ["Datenqualität", source.dataQuality ? esc(qualityLabel(source.dataQuality)) : ""],
    ["Quellenfunktion", source.sourceFunction ? esc(source.sourceFunction) : ""],
    ["Zulässige Datenfunktion", source.dataFunction ? esc(source.dataFunction) : ""],
    ["Wirkungsfelder", (source.impactFields || []).length ? esc((source.impactFields || []).join(", ")) : ""],
    ["SDG-Bezug", source.sdg ? esc(source.sdg) : ""],
    ["Jahr", source.year ? esc(String(source.year)) : ""],
    ["Autor / Institution", source.author ? esc(source.author) : ""],
    ["Domain", source.domain ? esc(source.domain) : ""],
    ["DOI", source.doi ? `<a class="text-link" href="https://doi.org/${esc(source.doi)}" target="_blank" rel="noopener noreferrer">${esc(source.doi)}</a>` : ""],
    ["Evidenzregister-ID", source.evidenceRegistryId ? esc(source.evidenceRegistryId) : ""],
    ["Quellenqualität im Evidenzregister", source.evidenceQuality ? `Stufe ${esc(source.evidenceQuality)}` : ""],
    ...(relatedPublications.length && source.citation ? [["Zitierform", esc(source.citation)]] : []),
    ["Quellen-ID", esc(source.code)]
  ].filter(([, v]) => v);

  const factRows = facts
    .map(([k, v]) => `        <div class="source-fact"><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
    .join("\n");

  const glanceItems = [
    `<li>${esc(clusterLabel)} · ${esc(source.typeLabel || "Quelle")}</li>`,
    `<li>Herkunft: ${esc(originLabel(source.origin))} · Prüfstatus: ${esc(reviewLabel(source.reviewStatus))}</li>`,
    source.summary ? `<li>${esc(source.summary)}</li>` : ""
  ].filter(Boolean).join("\n            ");

  return `      <article class="article-shell quellenarchiv-detail">
        <nav class="breadcrumb" aria-label="Brotkrumen">
          <a href="../../bibliothek/">Bibliothek</a> / <a href="../">Quellenarchiv</a> / ${esc(source.code)}
        </nav>

        <header class="term-detail-hero">
          <p class="hero-kicker">${esc(clusterLabel || "Quelle")}</p>
          <h1>${esc(source.title)}</h1>
          ${source.author ? `<p class="source-authors">${authorLine(source.author, "../")}</p>` : ""}
          <p class="lead">${esc(source.summary || "")}</p>
          <div class="term-meta-row" aria-label="Quellinformation">
            ${metaRow}
          </div>
          <div class="term-action-row">
            ${actions}
          </div>
        </header>

        <section class="term-summary-card" aria-labelledby="glance-${s}">
          <h2 id="glance-${s}">Auf einen Blick</h2>
          <ul class="clean-list">
            ${glanceItems}
          </ul>
        </section>

        <div class="term-section-grid">
          <section class="term-section-card">
            <p class="section-eyebrow">Kurzbeschreibung</p>
            <h2>Worum es geht</h2>
            <p>${esc(source.summary || "-")}</p>
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Wirkungsökonomie</p>
            <h2>Wirkungsökonomische Einordnung</h2>
            <p>${esc(source.einordnung || "-")}</p>
          </section>
        </div>

        ${impactChips ? `<section class="term-link-section" aria-labelledby="fields-${s}">
          <div>
            <p class="section-eyebrow">Wirkungsbezug</p>
            <h2 id="fields-${s}">Wirkungsfelder</h2>
          </div>
          <div class="term-chip-row">
            ${impactChips}
          </div>
        </section>` : ""}

        ${relatedPublicationItems ? `<section class="term-link-section source-related-publications" aria-labelledby="used-in-${s}">
          <div>
            <p class="section-eyebrow">Publikationsbezug</p>
            <h2 id="used-in-${s}">Verwendet in</h2>
          </div>
          <ul class="clean-list">
            ${relatedPublicationItems}
          </ul>
        </section>` : ""}

        <section class="meta-box source-steckbrief" aria-labelledby="steckbrief-${s}">
          <h2 id="steckbrief-${s}">Steckbrief</h2>
          <dl class="source-fact-grid">
${factRows}
          </dl>
          ${locatorNote(source) ? `<p class="source-provenance">${esc(locatorNote(source))}</p>` : ""}
          ${ext ? `<p><a class="text-link" href="${esc(ext)}"${locatorAttributes}>${esc(ext)}${externalLocator ? " ↗" : ""}</a></p>` : ""}
          <p class="muted source-readonly-note">Diese Detailseite ordnet die Quelle ein. Maßgeblich bleibt die verlinkte Originalquelle oder bibliografische Fundstelle.</p>
        </section>
      </article>`;
}

// ---------------------------------------------------------------------------
// Übersichtsseite mit Filter + Suche
// ---------------------------------------------------------------------------
function indexBody(sources, clusters) {
  const total = sources.length;
  const clusterChips = clusters
    .map((c) => `<button type="button" class="filter-chip" aria-pressed="false" data-filter="cluster" data-value="${esc(c.key)}">${esc(c.key)} · ${esc(c.label)} <span class="filter-chip-count">${c.count}</span></button>`)
    .join("\n          ");

  const originCounts = { intern: sources.filter((s) => s.origin === "intern").length, extern: sources.filter((s) => s.origin === "extern").length };
  const originChips = [
    `<button type="button" class="filter-chip" aria-pressed="false" data-filter="origin" data-value="extern">extern <span class="filter-chip-count">${originCounts.extern}</span></button>`,
    `<button type="button" class="filter-chip" aria-pressed="false" data-filter="origin" data-value="intern">WÖk-intern <span class="filter-chip-count">${originCounts.intern}</span></button>`
  ].join("\n          ");

  // Karten je Cluster gruppiert
  const byCluster = new Map();
  for (const c of clusters) byCluster.set(c.key, []);
  for (const s of sources) {
    if (!byCluster.has(s.cluster)) byCluster.set(s.cluster, []);
    byCluster.get(s.cluster).push(s);
  }

  const sections = clusters.map((c) => {
    const items = byCluster.get(c.key) || [];
    if (!items.length) return "";
    const cards = items.map((s) => {
      const searchText = normalizeSearch([s.title, s.code, s.summary, s.author, s.domain, (s.impactFields || []).join(" "), s.clusterLabel, s.typeLabel].join(" "));
      const authorKeys = parseAuthors(s.author).map(authorKey).join("|");
      return `<article class="info-card quellenarchiv-card" data-card
            data-origin="${esc(s.origin)}"
            data-cluster="${esc(s.cluster)}"
            data-authors="${esc(authorKeys)}"
            data-search="${esc(searchText)}">
            <p class="card-eyebrow">${esc(s.clusterLabel || c.label)} · ${esc(s.typeLabel || "Quelle")}</p>
            <h3><a href="${esc(slug(s.code))}/">${esc(s.title)}</a></h3>
            ${s.author ? `<p class="card-authors">${authorLine(s.author, "")}</p>` : ""}
            <p class="card-summary">${esc((s.summary || "").slice(0, 180))}</p>
            <p class="card-meta"><span class="badge">${esc(originLabel(s.origin))}</span> <span class="badge">${esc(reviewLabel(s.reviewStatus))}</span>${s.domain ? ` <span class="muted">${esc(s.domain)}</span>` : ""}</p>
          </article>`;
    }).join("\n          ");
    return `      <section id="cluster-${esc(c.key)}" class="content-band quellenarchiv-cluster" data-cluster-section="${esc(c.key)}">
        <h2>${esc(c.key)} · ${esc(c.label)} <span class="muted">(${items.length})</span></h2>
        <div class="card-grid">
          ${cards}
        </div>
      </section>`;
  }).filter(Boolean).join("\n");

  return `      <section class="hero compact-hero">
        <p class="hero-kicker">Bibliothek</p>
        <h1>Quellenarchiv der Wirkungsökonomie</h1>
        <p class="lead">${total} Quellen - von amtlichen Datenreihen über Normen bis zu Forschungsarbeiten. Jede Detailseite zeigt Einordnung, Herkunft, Prüfstatus und den Weg zur Originalquelle oder bibliografischen Fundstelle.</p>
      </section>

      <section class="content-band quellenarchiv-filter-panel" aria-label="Quellen filtern">
        <div class="field">
          <label for="quellen-search">Volltextsuche</label>
          <input type="search" id="quellen-search" data-search-input placeholder="Titel, Thema, Institution, Domain …" autocomplete="off">
        </div>
        <div class="filter-chip-group" aria-label="Herkunft">
          <p class="section-eyebrow">Herkunft</p>
          ${originChips}
        </div>
        <div class="filter-chip-group" aria-label="Cluster">
          <p class="section-eyebrow">Cluster</p>
          ${clusterChips}
        </div>
        <p class="quellenarchiv-count" data-count-label aria-live="polite">${total} Quellen</p>
      </section>

${sections}

      <script>
      (function () {
        var state = { origin: new Set(), cluster: new Set(), q: "", author: "" };
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var sectionsEls = Array.prototype.slice.call(document.querySelectorAll("[data-cluster-section]"));
        var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
        var input = document.querySelector("[data-search-input]");
        var countLabel = document.querySelector("[data-count-label]");
        function normalize(v) {
          return (v || "").toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "")
            .replace(/ö/g, "oe").replace(/ä/g, "ae").replace(/ü/g, "ue").replace(/ß/g, "ss");
        }
        function apply() {
          var q = normalize(state.q);
          var visible = 0;
          cards.forEach(function (card) {
            var okOrigin = !state.origin.size || state.origin.has(card.dataset.origin);
            var okCluster = !state.cluster.size || state.cluster.has(card.dataset.cluster);
            var okText = !q || (card.dataset.search || "").indexOf(q) !== -1;
            var okAuthor = !state.author || (card.dataset.authors || "").split("|").indexOf(state.author) !== -1;
            var show = okOrigin && okCluster && okText && okAuthor;
            card.hidden = !show;
            if (show) visible++;
          });
          sectionsEls.forEach(function (sec) {
            var any = sec.querySelectorAll("[data-card]:not([hidden])").length;
            sec.hidden = any === 0;
          });
          if (countLabel) countLabel.textContent = visible + (visible === 1 ? " Quelle" : " Quellen");
        }
        chips.forEach(function (chip) {
          chip.addEventListener("click", function () {
            var f = chip.dataset.filter, v = chip.dataset.value;
            if (state[f].has(v)) { state[f].delete(v); chip.classList.remove("active"); chip.setAttribute("aria-pressed", "false"); }
            else { state[f].add(v); chip.classList.add("active"); chip.setAttribute("aria-pressed", "true"); }
            apply();
          });
        });
        if (input) {
          var t;
          input.addEventListener("input", function () {
            clearTimeout(t);
            t = setTimeout(function () { state.q = input.value; apply(); }, 80);
          });
        }
        (function initAuthorFilter() {
          var raw = new URLSearchParams(window.location.search).get("autor");
          if (!raw) return;
          state.author = normalize(raw).replace(/\s+/g, " ").trim();
          var panel = document.querySelector(".quellenarchiv-filter-panel");
          if (!panel) return;
          var banner = document.createElement("p");
          banner.className = "quellenarchiv-author-filter";
          banner.setAttribute("aria-live", "polite");
          var label = document.createElement("span");
          label.textContent = "Quellen von: ";
          var name = document.createElement("strong");
          name.textContent = raw;
          var clear = document.createElement("button");
          clear.type = "button";
          clear.className = "filter-chip filter-chip--clear";
          clear.textContent = "Filter aufheben \u2715";
          clear.addEventListener("click", function () {
            state.author = "";
            banner.remove();
            history.replaceState(null, "", window.location.pathname);
            apply();
          });
          banner.appendChild(label);
          banner.appendChild(name);
          banner.appendChild(document.createTextNode(" "));
          banner.appendChild(clear);
          panel.appendChild(banner);
        })();
        apply();
      })();
      </script>`;
}

// ---------------------------------------------------------------------------
// Sitemap idempotent aktualisieren
// ---------------------------------------------------------------------------
function updateSitemap(sources) {
  const sitemapPath = "sitemap.xml";
  if (!fs.existsSync(sitemapPath)) return;
  let xml = fs.readFileSync(sitemapPath, "utf8");
  // Alte Quellenarchiv-Einträge entfernen (idempotent) - inkl. optionalem <lastmod>
  xml = xml.replace(/\s*<url><loc>https:\/\/wirkungsoekonomie\.de\/quellenarchiv\/[^<]*<\/loc>(?:<lastmod>[^<]*<\/lastmod>)?<\/url>/g, "");
  const dateStr = new Date().toISOString().slice(0, 10);
  const lines = [`  <url><loc>https://wirkungsoekonomie.de/quellenarchiv/</loc><lastmod>${dateStr}</lastmod></url>`];
  for (const s of sources) {
    lines.push(`  <url><loc>https://wirkungsoekonomie.de/quellenarchiv/${slug(s.code)}/</loc><lastmod>${dateStr}</lastmod></url>`);
  }
  xml = xml.replace("</urlset>", `${lines.join("\n")}\n</urlset>`);
  fs.writeFileSync(sitemapPath, xml);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const data = await loadData();
  const sources = data.sources || [];
  const clusters = (data.clusters || []).filter((c) => c.count > 0);
  const clusterLabels = Object.fromEntries((data.clusters || []).map((c) => [c.key, c.label]));

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Detailseiten
  let written = 0;
  for (const source of sources) {
    const dir = path.join(OUT_DIR, slug(source.code));
    fs.mkdirSync(dir, { recursive: true });
    const body = detailBody(source, clusterLabels);
    const metaDescription = (source.summary || `${source.title} im Quellenarchiv der Wirkungsökonomie.`).slice(0, 200);
    const html = pageShell(source.title, body, "../../", {
      metaTitle: `${source.title} - Quellenarchiv - Wirkungsökonomie`,
      metaDescription,
      canonicalUrl: `${SITE_URL}/quellenarchiv/${slug(source.code)}/`
    });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    written++;
  }

  // Übersicht
  const idxBody = indexBody(sources, clusters);
  const idxHtml = pageShell("Quellenarchiv", idxBody, "../", {
    metaTitle: "Quellenarchiv der Wirkungsökonomie",
    metaDescription: `${sources.length} wirkungsökonomisch eingeordnete Quellen - Datenreihen, Normen, Studien und Berichte mit Detailseiten, Herkunft und Fundstellen.`,
    canonicalUrl: `${SITE_URL}/quellenarchiv/`
  });
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), idxHtml);

  updateSitemap(sources);

  console.log(`[quellenarchiv] ${written} Detailseiten + Übersicht erzeugt (${clusters.length} Cluster).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
