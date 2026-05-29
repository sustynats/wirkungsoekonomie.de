import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ABSTRACT_DATA = path.join(ROOT, "assets/data/publication-abstracts.json");
const REGISTRY_DATA = path.join(ROOT, "assets/data/document-registry.json");
const START = "<!-- publication-abstract:start -->";
const END = "<!-- publication-abstract:end -->";
const DOWNLOAD_RE = /\.(pdf|docx?|md|zip)(?:[?#][^"'<\s]*)?$/i;
const DOWNLOAD_HREF_RE = /href=["'][^"']+\.(?:pdf|docx?|md|zip)(?:[?#][^"']*)?["']/i;

const entities = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
  nbsp: " ",
  auml: "ä",
  Auml: "Ä",
  ouml: "ö",
  Ouml: "Ö",
  uuml: "ü",
  Uuml: "Ü",
  szlig: "ß",
};

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const abstractItems = readJson(ABSTRACT_DATA, { items: [] }).items || [];
const registryItems = readJson(REGISTRY_DATA, []);

function decodeEntities(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => entities[name] ?? match);
}

function stripTags(value) {
  return decodeEntities(String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return decodeEntities(value)
    .toLowerCase()
    .replace(/&/g, " und ")
    .replace(/ö/g, "oe")
    .replace(/ä/g, "ae")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function relFromAbs(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, "/");
}

function listHtmlFiles(dir) {
  const skip = new Set([".git", "node_modules", ".next", "dist", "outputs", ".cache"]);
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".github") continue;
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

function removeGeneratedBlocks(html) {
  return html.replace(new RegExp(`\\s*${escapeRegExp(START)}[\\s\\S]*?${escapeRegExp(END)}`, "g"), "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function attrValue(block, name) {
  const match = block.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function firstMatchText(block, re) {
  const match = block.match(re);
  return match ? stripTags(match[1]) : "";
}

function extractTitle(block, pageTitle = "") {
  return firstMatchText(block, /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i)
    || attrValue(block, "data-download-title")
    || pageTitle
    || "Publikation";
}

function extractKicker(block) {
  return firstMatchText(block, /<p[^>]*class=["'][^"']*(?:card-kicker|hero-kicker|meta-line)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
}

function extractDescription(block) {
  return firstMatchText(block, /<p[^>]*class=["'][^"']*card-text[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)
    || attrValue(block, "data-download-description")
    || "";
}

function pageTitle(html) {
  return firstMatchText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
    || firstMatchText(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s+\|\s+Wirkungsökonomie.*$/i, "")
    || "Publikation";
}

function linkItems(block) {
  const items = [];
  for (const match of block.matchAll(/<a\b([^>]*?)>([\s\S]*?)<\/a>/gi)) {
    const hrefMatch = match[1].match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const href = decodeEntities(hrefMatch[1]);
    if (!DOWNLOAD_RE.test(href.split("/").pop() || href)) continue;
    items.push({ href, label: stripTags(match[2]) || labelFromHref(href) });
  }
  return dedupeLinks(items);
}

function dedupeLinks(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalize(`${item.href} ${item.label}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function labelFromHref(href) {
  const file = decodeURIComponent(href.split("/").pop() || href)
    .replace(/\.(pdf|docx?|md|zip)$/i, "")
    .replace(/^woek[_-]/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+v\d+(?: \d+)*$/i, "")
    .trim();
  return file.replace(/\b\w/g, (m) => m.toUpperCase()) || "Publikation";
}

function titleForLink(link, fallbackTitle) {
  const genericLabel = /^(pdf|word|docx|download|herunterladen|seite drucken|originaldatei|datei herunterladen)$/i;
  const label = link.label.replace(/\s+(herunterladen|download|öffnen)$/i, "").trim();
  if (!label || genericLabel.test(label)) return fallbackTitle;
  return label;
}

function contextNeedle(context) {
  return normalize([
    context.title,
    context.pageTitle,
    context.kicker,
    context.description,
    ...(context.hrefs || []),
  ].filter(Boolean).join(" "));
}

function registryAbstract(context) {
  const needle = contextNeedle(context);
  const item = registryItems.find((entry) => {
    const candidates = [
      entry.title,
      entry.id,
      entry.pdfUrl,
      entry.docxUrl,
      entry.onlineUrl,
    ].map(normalize).filter(Boolean);
    return candidates.some((candidate) => candidate && (needle.includes(candidate) || candidate.includes(normalize(context.title))));
  });
  if (!item?.summary) return null;
  return {
    summary: item.summary,
    keyPoints: [
      item.type ? `${item.type} im Bereich ${item.category || "Wirkungsökonomie"}.` : "Einordnung in die Wirkungsökonomie.",
      item.onlineUrl ? "Onlinefassung ist der bevorzugte Lesezugang." : "Download ist ergänzendes Arbeitsmaterial.",
      "Keine amtliche Bewertung; die Fassung dient Orientierung, Diskussion und fachlicher Einordnung.",
    ],
  };
}

function authoredAbstract(context) {
  const needle = contextNeedle(context);
  const titleNorm = normalize(context.title);
  const item = abstractItems.find((entry) => {
    const matches = entry.matches || [];
    return matches.some((match) => {
      const normalized = normalize(match);
      return normalized && (needle.includes(normalized) || normalized.includes(titleNorm) || titleNorm.includes(normalized));
    });
  });
  return item ? { summary: item.summary, keyPoints: item.keyPoints || [] } : null;
}

function genericType(context) {
  const haystack = contextNeedle(context);
  if (/gesetz|wstg|westg/.test(haystack)) return "Gesetzes- und Steuerlogik";
  if (/dossier/.test(haystack)) return "Dossier";
  if (/detailkonzept|detailkonzepte/.test(haystack)) return "Detailkonzept";
  if (/konzeptpapier|konzept/.test(haystack)) return "Konzeptpapier";
  if (/whitepaper|working paper|paper/.test(haystack)) return "Paper";
  if (/leitbild/.test(haystack)) return "Leitbild";
  if (/handbuch/.test(haystack)) return "Handbuch";
  if (/methodik|leitlinie/.test(haystack)) return "Methodik";
  return "Publikation";
}

function usefulDescription(description) {
  const value = (description || "").trim();
  if (!value) return "";
  if (/^(Webfassung mit Originaldatei|Vollständige Onlinefassung mit Downloads|Online lesbare öffentliche Fassung|Der vollständige Text steht auf dieser Seite)/i.test(value)) return "";
  if (/^(PDF|Word|DOCX|Download|Dateien herunterladen)$/i.test(value)) return "";
  return value;
}

function genericSummary(context) {
  const description = usefulDescription(context.description);
  if (description) return description;
  const type = genericType(context);
  const title = context.title || context.pageTitle || "diese Veröffentlichung";
  if (type === "Dossier") {
    return `${title} bündelt Hintergrund, Praxisfragen, Bewertungslogik und Grenzen als vertiefende Arbeitsfassung.`;
  }
  if (type === "Detailkonzept") {
    return `${title} vertieft einen Wirkungsbereich mit Begriffen, Methodik, Datenbezug und Umsetzungspfaden.`;
  }
  if (type === "Konzeptpapier") {
    return `${title} erklärt die Grundlogik des Themenfelds und führt zentrale Annahmen, Instrumente und Anschlussfragen zusammen.`;
  }
  if (type === "Gesetzes- und Steuerlogik") {
    return `${title} skizziert rechtliche oder steuerliche Umsetzungsmöglichkeiten der Wirkungsökonomie als Arbeits- und Diskussionsfassung.`;
  }
  return `${title} ordnet ein Thema der Wirkungsökonomie ein und macht zentrale Annahmen, Anwendungsmöglichkeiten und Grenzen sichtbar.`;
}

function genericKeyPoints(context) {
  const haystack = contextNeedle(context);
  const points = [];
  if (/bildung|schule|kompetenz/.test(haystack)) {
    points.push("Fokus auf Lernbedingungen, Wirkungskompetenz und Schutz vor Personenbewertung.");
  } else if (/gesundheit|pflege/.test(haystack)) {
    points.push("Gesundheit und Pflege werden als präventive, soziale und systemische Wirkung betrachtet.");
  } else if (/arbeit|einkommen|automatisierung|maschine|ki/.test(haystack)) {
    points.push("Automatisierung, Einkommen und soziale Sicherung werden wirkungsbezogen rückgekoppelt.");
  } else if (/produkt|konsum|steuer|umsatzsteuer/.test(haystack)) {
    points.push("Produktdaten, Lieferketten und Nutzung werden in Preis- und Steuerlogik übersetzt.");
  } else if (/medien|öffentlichkeit|hosting|faktencheck|folgencheck/.test(haystack)) {
    points.push("Öffentliche Wirkung wird über Transparenz, Quellenklarheit und Wirkungsräume eingeordnet.");
  } else if (/wirtschaft|unternehmen|lieferkette|controlling|sroi/.test(haystack)) {
    points.push("Unternehmenswirkung wird mit Daten, Steuerung, Kapital und Governance verbunden.");
  } else if (/finanz|kapital|fonds/.test(haystack)) {
    points.push("Kapitalflüsse werden mit Risiko, Resilienz und positiver Netto-Wirkung verbunden.");
  } else {
    points.push("Das Dokument macht Problem, Bewertungslogik und Anwendungsbezug sichtbar.");
  }
  points.push("Onlinefassung und Download ergänzen sich: Lesen, zitieren, exportieren.");
  points.push("Die Inhalte sind modellhafte Arbeits- oder Lesefassungen, keine amtliche Bewertung.");
  return points;
}

function abstractFor(context) {
  const authored = authoredAbstract(context);
  const registry = registryAbstract(context);
  const selected = authored || registry || {};
  return {
    summary: selected.summary || genericSummary(context),
    keyPoints: (selected.keyPoints?.length ? selected.keyPoints : genericKeyPoints(context)).slice(0, 3),
  };
}

function renderAbstract(abstract, mode = "card") {
  const className = mode === "inline" ? "publication-abstract inline" : "publication-abstract overview";
  return `\n${START}\n<div class="${className}" data-publication-abstract>\n  <p class="publication-abstract-label">Abstract</p>\n  <p><strong>Zusammenfassung:</strong> ${escapeHtml(abstract.summary)}</p>\n  <div class="publication-keypoints"><span>Kernaussagen</span><ul>${abstract.keyPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul></div>\n</div>\n${END}`;
}

function renderDownloadList(items, pageTitleValue) {
  if (!items.length) return "";
  const rendered = items.map((item) => {
    const title = titleForLink(item, pageTitleValue);
    const abstract = abstractFor({
      title,
      pageTitle: pageTitleValue,
      kicker: "Download",
      description: "",
      hrefs: [item.href, item.label],
    });
    return `<li><strong>${escapeHtml(title)}</strong><span><b>Zusammenfassung:</b> ${escapeHtml(abstract.summary)}</span><span><b>Kernaussagen:</b> ${abstract.keyPoints.map(escapeHtml).join(" · ")}</span></li>`;
  }).join("");
  return `\n${START}\n<div class="publication-download-list" data-publication-abstract>\n  <p class="publication-abstract-label">Abstracts zu den Dateien</p>\n  <ul>${rendered}</ul>\n</div>\n${END}`;
}

function insertAfterDescription(block, context, mode = "card") {
  if (block.includes("data-publication-abstract")) return block;
  const abstract = renderAbstract(abstractFor(context), mode);
  if (/<p[^>]*class=["'][^"']*card-text[^"']*["'][^>]*>[\s\S]*?<\/p>/i.test(block)) {
    return block.replace(/(<p[^>]*class=["'][^"']*card-text[^"']*["'][^>]*>[\s\S]*?<\/p>)/i, `$1${abstract}`);
  }
  if (/<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>\s*<p>(?!\s*<a\b)[\s\S]*?<\/p>/i.test(block)) {
    return block.replace(/(<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>\s*<p>(?!\s*<a\b)[\s\S]*?<\/p>)/i, `$1${abstract}`);
  }
  if (/<dl[^>]*class=["'][^"']*download-meta[^"']*["'][^>]*>[\s\S]*?<\/dl>/i.test(block)) {
    return block.replace(/(<dl[^>]*class=["'][^"']*download-meta[^"']*["'][^>]*>[\s\S]*?<\/dl>)/i, `$1${abstract}`);
  }
  if (/<p>Webfassung mit Originaldatei\.<\/p>/i.test(block)) {
    return block.replace(/(<p>Webfassung mit Originaldatei\.<\/p>)/i, `$1${abstract}`);
  }
  if (/<div[^>]*class=["'][^"']*(?:download-actions|download-related|portal-card-actions)[^"']*["']/i.test(block)) {
    return block.replace(/(<div[^>]*class=["'][^"']*(?:download-actions|download-related|portal-card-actions)[^"']*["'])/i, `${abstract}\n$1`);
  }
  return block.replace(/<\/(article|div)>$/i, `${abstract}</$1>`);
}

function processDownloadCards(html, pageTitleValue) {
  const cardRe = /<(article|div)\b[^>]*class=["'][^"']*(?:download-card|download-hero-card)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi;
  return html.replace(cardRe, (block) => {
    const hasDownload = DOWNLOAD_HREF_RE.test(block) || /data-download-card/i.test(block) || /download-hero-card/i.test(block);
    if (!hasDownload) return block;
    const context = {
      title: extractTitle(block, pageTitleValue),
      pageTitle: pageTitleValue,
      kicker: extractKicker(block),
      description: extractDescription(block),
      hrefs: linkItems(block).map((item) => item.href),
    };
    return insertAfterDescription(block, context);
  });
}

function processInfoCards(html, pageTitleValue) {
  return html.replace(/<article\b[^>]*class=["'][^"']*info-card[^"']*["'][^>]*>[\s\S]*?<\/article>/gi, (block) => {
    if (!DOWNLOAD_HREF_RE.test(block)) return block;
    const context = {
      title: extractTitle(block, pageTitleValue),
      pageTitle: pageTitleValue,
      kicker: extractKicker(block),
      description: extractDescription(block),
      hrefs: linkItems(block).map((item) => item.href),
    };
    return insertAfterDescription(block, context);
  });
}

function processOverviewCards(html, pageTitleValue) {
  return html.replace(/<(article|div)\b[^>]*class=["'][^"']*\bcard\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    if (!DOWNLOAD_HREF_RE.test(block)) return block;
    if (/download-card|download-hero-card|info-card/i.test(block)) return block;
    const context = {
      title: extractTitle(block, pageTitleValue),
      pageTitle: pageTitleValue,
      kicker: extractKicker(block),
      description: extractDescription(block) || firstMatchText(block, /<p>([\s\S]*?)<\/p>/i),
      hrefs: linkItems(block).map((item) => item.href),
    };
    return insertAfterDescription(block, context);
  });
}

function processPublicationSections(html, pageTitleValue) {
  const sectionRe = /<section\b[^>]*(?:id=["'](?:publikationszugang|vertiefung-arbeitsmaterial)["']|aria-labelledby=["'](?:publikationszugang|vertiefung-arbeitsmaterial-title)["'])[^>]*>[\s\S]*?<\/section>/gi;
  return html.replace(sectionRe, (section) => {
    return section.replace(/<article\b[^>]*class=["'][^"']*\bcard\b[^"']*["'][^>]*>[\s\S]*?<\/article>/gi, (block) => {
      if (!/<h[1-4]/i.test(block)) return block;
      const context = {
        title: extractTitle(block, pageTitleValue),
        pageTitle: pageTitleValue,
        kicker: extractKicker(block),
        description: extractDescription(block),
        hrefs: linkItems(block).map((item) => item.href),
      };
      return insertAfterDescription(block, context);
    });
  });
}

function processDownloadSections(html, pageTitleValue) {
  const sectionRe = /<section\b[^>]*(?:id=["']downloads["']|aria-labelledby=["']downloads["'])[^>]*>[\s\S]*?<\/section>/gi;
  return html.replace(sectionRe, (section) => {
    if (!DOWNLOAD_HREF_RE.test(section) || section.includes("publication-download-list")) return section;
    if (/<th[^>]*>Kurzbeschreibung<\/th>/i.test(section)) return section;
    const items = linkItems(section);
    if (!items.length) return section;
    const list = renderDownloadList(items, pageTitleValue);
    if (/<div[^>]*class=["'][^"']*portal-card-actions[^"']*["']/i.test(section)) {
      return section.replace(/(<div[^>]*class=["'][^"']*portal-card-actions[^"']*["'])/i, `${list}\n$1`);
    }
    return section.replace(/<\/section>$/i, `${list}</section>`);
  });
}

function processDownloadTables(html, pageTitleValue) {
  return html.replace(/<table\b[^>]*class=["'][^"']*data-table[^"']*["'][^>]*>[\s\S]*?<\/table>/gi, (table) => {
    if (!/<th[^>]*>Kurzbeschreibung<\/th>/i.test(table) || !DOWNLOAD_HREF_RE.test(table)) return table;
    return table.replace(/<tr>([\s\S]*?)<\/tr>/gi, (row, body) => {
      if (!DOWNLOAD_HREF_RE.test(row) || row.includes("data-publication-abstract")) return row;
      const title = firstMatchText(row, /<th[^>]*scope=["']row["'][^>]*>([\s\S]*?)<\/th>/i) || pageTitleValue;
      const cells = [...body.matchAll(/<td\b[^>]*>[\s\S]*?<\/td>/gi)].map((match) => match[0]);
      if (cells.length < 3) return row;
      const descCell = cells[1].includes("<a ") ? cells[0] : cells[1];
      const descText = stripTags(descCell);
      const abstract = renderAbstract(abstractFor({
        title,
        pageTitle: pageTitleValue,
        kicker: firstMatchText(row, /<td\b[^>]*>([\s\S]*?)<\/td>/i),
        description: descText,
        hrefs: linkItems(row).map((item) => item.href),
      }), "inline");
      const updatedCell = descCell.replace(/<\/td>$/i, `${abstract}</td>`);
      return row.replace(descCell, updatedCell);
    });
  });
}

function isPublicationOverview(rel) {
  if (rel === "downloads.html" || rel === "downloads/index.html" || rel === "dokumente/index.html" || rel === "buch.html") return true;
  if (/^downloads\/[^/]+\/index\.html$/.test(rel)) return true;
  if (/^portale\/[^/]+\/index\.html$/.test(rel)) return true;
  if (/^portale\/[^/]+\/downloads\/index\.html$/.test(rel)) return true;
  if (/^wirkungsfelder\/[^/]+\/index\.html$/.test(rel)) return true;
  if (/^werkzeuge\/[^/]+\/index\.html$/.test(rel)) return true;
  if (/^werkstatt\/dossiers\/[^/]+\/index\.html$/.test(rel)) return true;
  if (rel === "werkstatt/arbeitsbibliothek/index.html") return true;
  if (/^werkstatt\/arbeitsbibliothek\/(?:whitepaper|historische-dokumente)\/index\.html$/.test(rel)) return true;
  return false;
}

function shouldProcess(html, rel) {
  if (/(^|\/)(impressum|datenschutz)\.html$/.test(rel)) return false;
  if (!isPublicationOverview(rel)) return false;
  return /(download-card|download-hero-card|info-card|publikationszugang|vertiefung-arbeitsmaterial|Downloadbereich|href=["'][^"']+\.(?:pdf|docx?|md|zip))/i.test(html);
}

let changed = 0;
let abstractCount = 0;

for (const file of listHtmlFiles(ROOT)) {
  const rel = relFromAbs(file);
  let html = fs.readFileSync(file, "utf8");
  const original = html;
  html = removeGeneratedBlocks(html);
  if (shouldProcess(html, rel)) {
    const title = pageTitle(html);
    if (rel === "downloads.html" || rel === "buch.html") {
      html = processDownloadCards(html, title);
    }
    if (rel === "downloads/index.html") {
      html = processOverviewCards(html, title);
    }
    if (rel === "dokumente/index.html") {
      html = processInfoCards(html, title);
    }
    html = processPublicationSections(html, title);
    html = processDownloadTables(html, title);
    if (/\/downloads\/index\.html$|^downloads\/[^/]+\/index\.html$/.test(rel)) {
      html = processDownloadSections(html, title);
    }
  }
  if (html !== original) {
    fs.writeFileSync(file, html, "utf8");
    changed += 1;
  }
  abstractCount += (html.match(/data-publication-abstract/g) || []).length;
}

console.log(`Publication abstracts applied to ${changed} files (${abstractCount} visible abstract blocks).`);
