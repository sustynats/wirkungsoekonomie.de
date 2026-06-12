import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-rente-soziale-sicherung";
const JS_VERSION = "20260523-nachhaltigkeit";
const SRC = "docs/rente-soziale-sicherung";
const EXTRACT = `${SRC}/docx-extracts`;
const SOURCE = `${SRC}/source`;

const modulesData = JSON.parse(fs.readFileSync(path.join(ROOT, SOURCE, "rente_soziale_sicherung_modules_v0_1.json"), "utf8"));
const modules = modulesData.submodules;

const docs = {
  concept: {
    title: "Konzeptpapier Rente & soziale Sicherung",
    rel: `${EXTRACT}/woek_rente_soziale_sicherung_konzeptpapier_v0_1.md`,
    download: "assets/downloads/woek_rente_soziale_sicherung_konzeptpapier_v0_1.docx",
  },
  dossier: {
    title: "Gesamtdossier Rente & soziale Sicherung",
    rel: `${EXTRACT}/woek_rente_soziale_sicherung_gesamtdossier_v0_1.md`,
    download: "assets/downloads/woek_rente_soziale_sicherung_gesamtdossier_v0_1.docx",
  },
  detail: {
    title: "Detailkonzepte Rente & soziale Sicherung",
    rel: `${EXTRACT}/woek_rente_soziale_sicherung_detailkonzepte_umfangreich_v0_1.md`,
    download: "assets/downloads/woek_rente_soziale_sicherung_detailkonzepte_umfangreich_v0_1.docx",
  },
  singleDossier: {
    title: "Einzeldossier-Set Rente & soziale Sicherung",
    rel: `${EXTRACT}/woek_rente_soziale_sicherung_einzeldossier_set_v0_1.md`,
    download: "assets/downloads/woek_rente_soziale_sicherung_einzeldossier_set_v0_1.docx",
  },
  toolSpec: {
    title: "Tool-Spezifikation Wirkungsrenten-Rechner",
    rel: `${SOURCE}/tool_spezifikation_wirkungsrenten_rechner.md`,
    download: "assets/downloads/tool_spezifikation_wirkungsrenten_rechner.md",
  },
  toolSpecSimulator: {
    title: "Tool-Spezifikation Sozialabgaben-Entkopplungs-Simulator",
    rel: `${SOURCE}/tool_spezifikation_wirkungsrentenrechner.md`,
    download: "assets/downloads/tool_spezifikation_wirkungsrentenrechner.md",
  },
};

const tools = [
  ["Wirkungsrenten-Rechner", "Demo", "Zeigt Basisrente, klassische Anwartschaft, Lebenswirkungs-Faktor, Wirkungsdividende und Fondsanteil modellhaft.", "erleben/wirkungsrenten-rechner/"],
  ["Lebenswirkungs-Konto", "Modul", "Macht Care, Bildung, Pflege, Ehrenamt, Transformation und Gemeinwesenbeiträge sichtbar, ohne Menschen zu bewerten.", "wirkungsfelder/rente-soziale-sicherung/lebenswirkungs-konto/"],
  ["Lebenswirkungs-Faktor", "Berechnungslogik", "Begrenzter Pilotkorridor für anerkannte positive Wirkleistung, mit Würdegrenze und Korrekturverfahren.", "wirkungsfelder/rente-soziale-sicherung/lebenswirkungs-faktor/"],
  ["Renten-Impact-Fonds", "Fonds", "Verbindet Alterssicherung, Kapitalwirkung, Transformationsfinanzierung und positive Netto-Wirkung.", "wirkungsfelder/rente-soziale-sicherung/renten-impact-fonds/"],
  ["Wirkungsfonds", "Querschnitt", "Fondsarchitektur für Rente, Bildung, Gesundheit, Wohnen, Demokratie, Medien, Innovation und Regeneration.", "wirkungsfelder/finanzsystem-kapital/finanzierbarkeit-wirkungsfonds/"],
  ["Wirkungseinkommensteuer", "Steuerkonzept", "Ordnet Einkommen nach Höhe, Entstehungskontext und Wirkung ein.", "werkzeuge/wirkungseinkommensteuer/"],
  ["Maschinenwertschöpfungsbeitrag", "Rückkopplung", "Beteiligt automatisierte Wertschöpfung an sozialer Sicherung und Wirkungsfonds.", "werkzeuge/maschinenwertschoepfungsbeitrag/"],
  ["WÖk-IDs", "Datenarchitektur", "Verbinden SDGs, SDG+, Rentenwirkung, Care, Fonds, Einkommen und Sozialschutz mit nachvollziehbaren Indikatoren.", "werkzeuge/woek-ids/"],
  ["T-SROI", "Impact Controlling", "Bewertet Transformationsinvestitionen in Care, Weiterbildung, Gesundheit, Wohnen und Fondslogik.", "werkzeuge/impact-controlling/t-sroi/"],
  ["Wirkungsrat", "Institution", "Prüft Methodik, rote Linien, Evaluation und demokratische Korrektur der Wirkungslogik.", "werkzeuge/wirkungsrat/"],
];

const sdgRefs = [
  ["sdg-1", "SDG 1 Keine Armut", "Armut, Altersarmut, Grundsicherung, Würde und soziale Sicherung.", "verstehen/sdgs-sdgplus/sdg-1-keine-armut/"],
  ["sdg-3", "SDG 3 Gesundheit und Wohlergehen", "Gesundheit, Pflege, Prävention und psychosoziale Stabilität im Alter.", "verstehen/sdgs-sdgplus/sdg-3-gesundheit-wohlergehen/"],
  ["sdg-4", "SDG 4 Hochwertige Bildung", "Lebenslanges Lernen, Weiterbildung und Wirkungskompetenz über den Lebenslauf.", "verstehen/sdgs-sdgplus/sdg-4-hochwertige-bildung/"],
  ["sdg-5", "SDG 5 Geschlechtergleichstellung", "Care, Gender Pension Gap, unbezahlte Arbeit und faire Anerkennung.", "verstehen/sdgs-sdgplus/sdg-5-geschlechtergleichstellung/"],
  ["sdg-8", "SDG 8 Menschenwürdige Arbeit", "Arbeit, Automatisierung, Einkommen, Sozialschutz und Übergänge.", "verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/"],
  ["sdg-10", "SDG 10 Weniger Ungleichheiten", "Teilhabe, soziale Mobilität, Rentenlücken und regionale Ungleichheit.", "verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/"],
  ["sdg-11", "SDG 11 Nachhaltige Städte und Gemeinden", "Wohnen, Quartier, Mobilität und Versorgung im Alter.", "verstehen/sdgs-sdgplus/sdg-11-nachhaltige-staedte-gemeinden/"],
  ["sdg-16", "SDG 16 Starke Institutionen", "Rechtsschutz, Vertrauen, Korrekturverfahren und demokratische Kontrolle.", "verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/"],
  ["sdg-17", "SDG 17 Partnerschaften", "Umsetzung durch Sozialversicherung, Kommunen, Unternehmen, Fonds und Zivilgesellschaft.", "verstehen/sdgs-sdgplus/sdg-17-partnerschaften/"],
  ["sdgplus-demokratie", "SDG+ Demokratie", "Demokratische Aushandlung und Schutz vor technokratischer Letztentscheidung.", "verstehen/sdgs-sdgplus/#sdgplus-demokratie"],
  ["sdgplus-rechtsstaatlichkeit", "SDG+ Rechtsstaatlichkeit", "Rechtswege, Widerspruch, Datenschutz und Verhältnismäßigkeit.", "verstehen/sdgs-sdgplus/#sdgplus-rechtsstaatlichkeit"],
  ["sdgplus-institutionelles-vertrauen", "SDG+ institutionelles Vertrauen", "Verlässlichkeit sozialer Sicherung und nachvollziehbare Methodik.", "verstehen/sdgs-sdgplus/#sdgplus-institutionelles-vertrauen"],
  ["sdgplus-gesellschaftlicher-zusammenhalt", "SDG+ gesellschaftlicher Zusammenhalt", "Generationenvertrag ohne Generationenkampf.", "verstehen/sdgs-sdgplus/#sdgplus-gesellschaftlicher-zusammenhalt"],
  ["sdgplus-digitale-selbstbestimmung", "SDG+ digitale Selbstbestimmung", "Datensparsamkeit, Auskunft, Korrektur und Schutz vor Personen-Scoring.", "verstehen/sdgs-sdgplus/#sdgplus-digitale-selbstbestimmung"],
];

const bookAnchors = [
  ["Kapitel 56 - Arbeit, Automatisierung und Maschinenleistung", "referenz/kapitel-056-arbeit-automatisierung-und-maschinenleistung/"],
  ["Kapitel 57 - Wirkungseinkommen", "referenz/kapitel-057-wirkungseinkommen/"],
  ["Kapitel 58 - Wirkungsrente", "referenz/kapitel-058-wirkungsrente/"],
  ["Kapitel 15 - Leistung neu definieren", "referenz/kapitel-015-leistung-neu-definieren/"],
  ["Kapitel 22 - Wirkungslenkung", "referenz/kapitel-022-wirkungslenkung/"],
  ["Kapitel 23 - Wirkungsrisiko und Wirkungsresilienz", "referenz/kapitel-023-wirkungsrisiko-und-wirkungsresilienz/"],
  ["Online-Buch Hauptseite", "referenz/"],
];

const crossLinks = [
  ["Arbeit & Einkommen", "Sozialabgaben-Entkopplung, Maschinenleistung, Wirkungseinkommen und Automatisierungsdividende.", "wirkungsfelder/arbeit-einkommen/"],
  ["Finanzsystem & Kapital", "Renten-Impact-Fonds, Wirkungsfonds, Kapitalwirkung, Vermögen und Erbschaft als Querschnitt.", "wirkungsfelder/finanzsystem-kapital/finanzierbarkeit-wirkungsfonds/"],
  ["Staat, Recht & Demokratie", "WStG, WEstG, Wirkungshaushalt, Wirkungsrat, Rechtsschutz und parlamentarische Kontrolle.", "wirkungsfelder/staat-recht-demokratie/"],
  ["Wirtschaft & Unternehmen", "Automatisierung, betriebliche Vorsorge, Finanzmarktanforderungen, Weiterbildung und Mitbestimmung.", "wirkungsfelder/wirtschaft-unternehmen/"],
  ["Wohnen & Stadt", "Alter, barrierefreies Wohnen, Wohnwirkungsfonds, Vorsorgekapital und Quartierswirkung.", "wirkungsfelder/wohnen-stadt/"],
  ["Produkte & Konsum", "Wirkungsumsatzsteuer, Kaufkraftschutz, Preise und soziale Abfederung.", "wirkungsfelder/produkte-konsum/"],
];

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function routeFor(rel) {
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function baseFor(rel) {
  return "../".repeat(path.dirname(rel).split("/").filter(Boolean).length);
}

function href(base, target) {
  if (!target) return "";
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  return `${base}${target.replace(/^\/+/, "")}`;
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), "utf8") : "";
}

function write(rel, html) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${html.replace(/[ \t]+$/gm, "")}\n`, "utf8");
}

function citeAnchor(id, label = "Zitierlink zu diesem Abschnitt") {
  return `<a class="cite-anchor no-print" href="#${esc(id)}" aria-label="${esc(label)}">#</a>`;
}

function h2(id, text) {
  return `<h2 id="${esc(id)}">${esc(text)} ${citeAnchor(id)}</h2>`;
}

function page({ rel, title, description, section = "Wirkungsfelder", type = "Portal", body }) {
  const base = baseFor(rel);
  const canonical = `${SITE}${routeFor(rel)}`;
  write(rel, `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title.replace(/\s+\|.*$/, ""))}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="${esc(section)}">
    <meta name="search_type" content="${esc(type)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title.replace(/\s+\|.*$/, ""))}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260612-nav-restore">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation"><a href="${base}index.html">Start</a></nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${esc(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: ${DATE}</p>
${body(base, canonical)}
    </main>
    <script src="${base}assets/js/main.js?v=20260612-nav-restore"></script>
  </body>
</html>`);
}

function isInternalHeading(line) {
  return [
    /^\d+\.\s*Online-Umsetzung$/i,
    /^Online-Umsetzung$/i,
    /^\d+\.\s*Website- und Dossierlogik$/i,
    /^Website- und Dossierlogik$/i,
  ].some((pattern) => pattern.test(line));
}

function isRecoveryHeading(line) {
  return /^(\d+\.\s+[A-ZÄÖÜ][^.!?]{3,}|Dossier\s+\d+:|Quellen und Referenzen|Quellen und Datenbezug|Quellen)$/i.test(line);
}

function isInternalLine(line) {
  return [
    /CodeX|Codex|Repository|Build|Sitemap aktualisieren|Dateien anlegen|bitte prüfen|Toolaufruf|Prompt|ChatGPT|Python|interne Aufgabe|Abschlussbericht/i,
    /sollte online .*veröffentlicht/i,
    /soll online .*veröffentlicht/i,
    /Seite benötigt .*Druckfunktion/i,
    /^Für das Portal .* gilt: Die Online-Volltexte/i,
    /^Dieses Dokument ist als öffentliche .*online lesbar.*Dossier-Download/i,
  ].some((pattern) => pattern.test(line));
}

function cleanPublicText(text) {
  const normalized = String(text).replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  const lines = normalized.split("\n");
  const firstContent = lines.findIndex((line) => line.trim());
  if (firstContent >= 0 && lines[firstContent].trim() === "---") {
    const closing = lines.findIndex((line, index) => index > firstContent && line.trim() === "---");
    if (closing > firstContent) {
      text = [...lines.slice(0, firstContent), ...lines.slice(closing + 1)].join("\n");
    }
  }
  const cleaned = [];
  let skippingInternalSection = false;
  for (const raw of String(text).replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      if (!skippingInternalSection) cleaned.push(raw);
      continue;
    }
    if (isInternalHeading(line)) {
      skippingInternalSection = true;
      continue;
    }
    if (skippingInternalSection) {
      if (isRecoveryHeading(line) && !isInternalHeading(line)) {
        skippingInternalSection = false;
      } else {
        continue;
      }
    }
    if (isInternalLine(line)) continue;
    cleaned.push(raw.replace(/interne Referenzpunkte/g, "methodische Referenzpunkte"));
  }
  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function plainMarkdownText(value) {
  return String(value)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

function inlineHtml(value) {
  const text = String(value).replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");
  const parts = [];
  let last = 0;
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(text))) {
    parts.push(esc(text.slice(last, match.index)));
    const label = plainMarkdownText(match[1]);
    const url = match[2].trim();
    if (url && !/^javascript:/i.test(url)) {
      parts.push(`<a class="text-link" href="${esc(url)}">${esc(label)}</a>`);
    } else {
      parts.push(esc(label));
    }
    last = pattern.lastIndex;
  }
  parts.push(esc(text.slice(last)));
  return parts.join("").replace(/\*([^*]+)\*/g, "$1");
}

function markdownishToHtml(markdown) {
  const lines = cleanPublicText(markdown).replace(/\r\n/g, "\n").split("\n");
  const toc = [];
  const html = [];
  let list = [];
  let table = [];
  let paragraph = [];
  let count = 0;
  const used = new Set();
  const unique = (raw) => {
    const base = slugify(raw) || "abschnitt";
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    return id;
  };
  const flushParagraph = () => {
    if (!paragraph.length) return;
    count += 1;
    const id = unique(`absatz-${String(count).padStart(3, "0")}`);
    html.push(`<p id="${id}">${inlineHtml(paragraph.join(" "))} ${citeAnchor(id, "Zitierlink zu diesem Absatz")}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineHtml(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.map((row) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim())).filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    if (rows.length > 1) {
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap"><table class="data-table"><thead><tr>${head.map((cell) => `<th>${inlineHtml(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }
    table = [];
  };
  const heading = (level, text) => {
    flushParagraph(); flushList(); flushTable();
    const cleanText = plainMarkdownText(text);
    const id = unique(cleanText);
    toc.push({ level, text: cleanText, id });
    html.push(`<h${level} id="${id}">${esc(cleanText)} ${citeAnchor(id)}</h${level}>`);
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph(); flushList(); flushTable();
      continue;
    }
    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph(); flushList();
      table.push(line);
      continue;
    }
    const mdHeading = line.match(/^(#{1,4})\s+(.+)$/);
    if (mdHeading) {
      heading(Math.max(2, Math.min(4, mdHeading[1].length)), mdHeading[2]);
      continue;
    }
    if (/^(Dossier\s+\d+:|[0-9]+\.\s+[A-ZÄÖÜ][^.!?]{8,})/.test(line)) {
      heading(line.startsWith("Dossier") ? 2 : 3, line);
      continue;
    }
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      flushParagraph(); flushTable();
      list.push(line.replace(/^([-*]|\d+\.)\s+/, ""));
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph(); flushList(); flushTable();
  return { toc, html: html.join("\n") };
}

function sourceText(doc) {
  return read(doc.rel);
}

function sectionFor(docText, index, prefix) {
  const lines = cleanPublicText(docText).replace(/\r\n/g, "\n").split("\n");
  const startLabel = prefix === "Dossier" ? `Dossier ${index + 1}:` : `${index + 1}. ${modules[index].title}`;
  const nextLabel = prefix === "Dossier" ? `Dossier ${index + 2}:` : `${index + 2}. `;
  const start = lines.findIndex((line) => line.trim().startsWith(startLabel));
  if (start < 0) return "";
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].trim().startsWith(nextLabel)) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
}

function tocBlock(items) {
  if (!items.length) return "";
  return `<nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2>Inhaltsverzeichnis</h2><ol class="toc-links">${items.slice(0, 36).map((item) => `<li class="toc-level-${item.level}"><a href="#${esc(item.id)}">${esc(item.text)}</a></li>`).join("")}</ol></nav>`;
}

function cards(base, items) {
  return `<div class="card-grid three">${items.map(([title, kicker, text, url, label = "Öffnen"]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p>${url ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, url)}">${esc(label)}</a></div>` : ""}</article>`).join("")}</div>`;
}

function downloads(base, entries) {
  const links = entries.filter(Boolean).filter((entry) => exists(entry.href)).map((entry) => `<a class="btn btn-secondary" href="${href(base, entry.href)}">${esc(entry.label)}</a>`);
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Dossier & Export</p>${h2("downloads", "Downloads und Druck")}<p>Online-Volltext ist der Hauptzugang. Word-Dateien bleiben ergänzende Export- und Archivfassungen.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${links.join("")}</div></div></section>`;
}

function publicationAccess(base, entries) {
  const visibleEntries = entries.filter((entry) => entry.href && (entry.href.startsWith("#") || entry.href.startsWith("http") || exists(entry.href)));
  if (!visibleEntries.length) return "";
  return `<section class="section" aria-labelledby="publikationszugang"><div class="section-header"><p class="hero-kicker">Online lesen und herunterladen</p>${h2("publikationszugang", "Detailkonzepte und Dossiers")}<p>Die langen Fassungen sind direkt online lesbar und zitierfähig. Word-Dateien bleiben ergänzende Export- und Archivfassungen.</p></div><div class="card-grid three">${visibleEntries.map((entry) => `<article class="card"><p class="card-kicker">${esc(entry.kicker || "Publikation")}</p><h3 class="card-title">${esc(entry.title)}</h3><p class="card-text">${esc(entry.text)}</p><div class="portal-card-actions"><a class="text-link" href="${href(base, entry.href)}">${esc(entry.label || "Öffnen")}</a></div></article>`).join("")}</div></section>`;
}

function sdgBadge(base, [id, label, hover, url]) {
  const popover = `${id}-pension-popover`;
  return `<span class="sdg-ref" data-sdg-id="${esc(id)}"><a class="sdg-ref-link" href="${href(base, url)}" aria-label="${esc(`${label}: ${hover}`)}" aria-describedby="${popover}">${esc(label)}</a><button class="sdg-ref-info" type="button" aria-label="${esc(`Kurzbeschreibung zu ${label}: ${hover}`)}" aria-describedby="${popover}">i</button><span class="sdg-ref-popover" id="${popover}" role="tooltip">${esc(hover)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
}

function referenceBlock(base) {
  return `<section class="section" aria-labelledby="sdg-ref"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${h2("sdg-ref", "SDG-/SDG+-Bezug")}<div class="model-strip">${sdgRefs.map((item) => sdgBadge(base, item)).join("")}</div><p>Wirkung ist neutral und relational. Bewertet wird sie am Referenzrahmen der SDGs, der Agenda 2030 und SDG+. SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Rechtsstaatlichkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p><a class="text-link" href="${href(base, "verstehen/sdgs-sdgplus/")}">Referenzrahmen öffnen</a></div></section>`;
}

function politicalBlock() {
  const rows = [
    ["Aufgabe der Politik", "Würde im Alter, Finanzierungsstabilität, Lebenswirkung, Care-Anerkennung, Sozialschutz und demokratisches Vertrauen verbinden."],
    ["Politische Rahmenbedingungen", "Rentenrecht, Sozialversicherungsrecht, Steuerrecht, Datenschutz, Fondsaufsicht, WÖk-IDs, Wirkungshaushalt und Wirkungsrat kohärent verknüpfen."],
    ["Ausgestaltungsspielraum", "Umlage, Fonds, Basisrente, Bonuskorridore, Beitragssätze, Steuerzuschüsse, Pilotregionen und Kapitaldeckung bleiben politisch gestaltbar."],
    ["Zielkonflikte", "Würde und Leistungsprinzip, Datenschutz und Nachweis, Einfachheit und Präzision, Generationengerechtigkeit und Bestandsschutz müssen demokratisch abgewogen werden."],
    ["Rollenverteilung", "EU, Bund, Länder, Kommunen, Sozialversicherung, Unternehmen, Gewerkschaften, Wissenschaft, Zivilgesellschaft und Wirkungsrat tragen unterschiedliche Verantwortung."],
    ["Übergang und Schutz", "Bestandsschutz, Härtefallregeln, freiwillige Pilotphasen, KMU-Schutz, Sozialausgleich, Rechtsschutz und klare Korrekturverfahren sichern die Einführung."],
    ["Evaluation und Korrektur", "Regelmäßige Wirkungsberichte, öffentliche Konsultation, Datenqualitätsprüfung, parlamentarische Kontrolle und gerichtlicher Rechtsschutz halten das System lernfähig."],
    ["Schutz vor Technokratie", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Normative Entscheidungen bleiben demokratisch legitimiert."],
  ];
  return `<section class="section" aria-labelledby="politik"><div class="section-header"><p class="hero-kicker">Demokratische Umsetzung</p>${h2("politik", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}<p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit Rente und soziale Sicherung demokratisch, rechtsstaatlich und praktisch umgesetzt werden können.</p></div><div class="table-wrap"><table class="data-table"><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function toolGrid(base) {
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Kontext-Werkzeuge</p>${h2("tools", "Werkzeuge in diesem Bereich")}</div>${cards(base, tools)}</section>`;
}

function bookBlock(base) {
  return `<section class="section" aria-labelledby="buch"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${h2("buch", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors.map(([label, url]) => `<a href="${href(base, url)}">${esc(label)}</a>`).join("")}</div></section>`;
}

function crossLinkBlock(base) {
  return `<section class="section" aria-labelledby="vernetzung"><div class="section-header"><p class="hero-kicker">Vernetzung</p>${h2("vernetzung", "Querverlinkungen")}</div>${cards(base, crossLinks.map(([title, text, url]) => [title, "Wirkungsfeld", text, url]))}</section>`;
}

function sourceBlock(base) {
  const rows = modulesData.sources.map((source) => {
    const isUrl = /^https?:/.test(source.ref);
    const ref = isUrl ? `<a class="text-link" href="${esc(source.ref)}" target="_blank" rel="noopener noreferrer">${esc(source.name)} <span class="sr-only">(externe Quelle)</span></a>` : esc(source.ref);
    return `<tr><th scope="row">${esc(source.name)}</th><td>${ref}</td></tr>`;
  }).join("");
  return `<section class="section" aria-labelledby="quellen"><div class="card"><p class="hero-kicker">Quellen</p>${h2("quellen", "Quellen und Datenbezug")}<p>Die externen Referenzen dienen als Kontext für Demografie, Rentenversicherung, Erwerbspersonen, Altenquotient und internationale Rentenvergleiche. Modellwerte sind Arbeitsannahmen, keine Rentenauskunft, Rechtsberatung oder Steuerberatung.</p><div class="table-wrap"><table class="data-table"><tbody>${rows}</tbody></table></div></div></section>`;
}

function statusBox(status) {
  return "";
}

function explainerVideo(base) {
  return `<section class="section home-video-section" id="bereichsvideo" aria-labelledby="bereichsvideo-title">
        <div class="section-header">
          <p class="hero-kicker">Bereichsvideo</p>
          <h2 id="bereichsvideo-title">Rente als Wirkungsbiografie</h2>
          <p>Das Video zeigt, warum Rente in der Wirkungsökonomie mehr ist als Einkommen, Beitragsjahre und Einzahlungen. Sichtbar werden Care, Pflege, Bildung, Ehrenamt, Automatisierung, soziale Sicherung und die Frage, wie ein Generationenvertrag Lebensleistung fairer anerkennen kann.</p>
        </div>
        <video class="home-explainer-video" controls controlsList="nodownload" preload="metadata" playsinline poster="${href(base, "assets/video/wirkungsfeld-rente-soziale-sicherung-poster.png?v=20260611")}" aria-label="Erklärvideo zu Rente und sozialer Sicherung in der Wirkungsökonomie">
          <source src="${href(base, "assets/video/wirkungsfeld-rente-soziale-sicherung.mp4?v=20260611")}" type="video/mp4">
          Dein Browser kann dieses Video nicht direkt abspielen.
        </video>
      </section>`;
}

function portalPage() {
  const intro = markdownishToHtml(read(`${SOURCE}/website_inhalt_rente_soziale_sicherung.md`));
  page({
    rel: "wirkungsfelder/rente-soziale-sicherung/index.html",
    title: "Rente & soziale Sicherung | Wirkungsökonomie",
    description: "Wirkungsrente, Lebenswirkung, Lebenswirkungs-Konto, soziale Sicherung, Automatisierung, Wirkungsdividende und Renten-Impact-Fonds.",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a></nav><p class="hero-kicker">Wirkungsfeld</p><h1>Rente & soziale Sicherung</h1><p class="hero-subtitle">Wirkungsrente, Lebenswirkung und soziale Stabilität.</p><p>Rente ist in der Wirkungsökonomie nicht nur Finanzierungsproblem, sondern Wirkungs- und Vertrauensfrage: Welche Lebensleistung bleibt unsichtbar, welche Risiken entstehen durch Automatisierung, und wie kann soziale Sicherung positive Netto-Wirkung für Mensch, Planet und Demokratie stabilisieren?</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "erleben/wirkungsrenten-rechner/")}">Wirkungsrenten-Rechner öffnen</a></div></div>${statusBox("Portal")}</div></section>${explainerVideo(base)}${publicationAccess(base, [{ kicker: "Langfassung", title: "Detailkonzepte online lesen", text: "Umfangreiche Detailkonzepte zu allen Unterbereichen.", href: "wirkungsfelder/rente-soziale-sicherung/detailkonzepte/", label: "Online lesen" }, { kicker: "Dossier", title: "Einzeldossier-Set online lesen", text: "Einzeldossiers mit Anwendung, Annahmen, Bewertungslogik und Grenzen.", href: "wirkungsfelder/rente-soziale-sicherung/dossiers/", label: "Online lesen" }, { kicker: "Download", title: "Detailkonzepte Word", text: "Exportfassung der langen Detailkonzepte.", href: docs.detail.download, label: "Herunterladen" }, { kicker: "Download", title: "Einzeldossier-Set Word", text: "Exportfassung der Einzeldossiers.", href: docs.singleDossier.download, label: "Herunterladen" }, { kicker: "Download", title: "Tool-Spezifikation Rechner", text: "Spezifikation des Wirkungsrenten-Rechners.", href: docs.toolSpec.download, label: "Herunterladen" }, { kicker: "Download", title: "Tool-Spezifikation Simulator", text: "Spezifikation des Sozialabgaben-Entkopplungs-Simulators.", href: docs.toolSpecSimulator.download, label: "Herunterladen" }])}${tocBlock(intro.toc)}<section class="section article-section"><article class="article-body fulltext-reader">${h2("online-volltext", "Online-Volltext")} ${intro.html}</article></section><section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${h2("unterbereiche", "Online lesen")}</div>${cards(base, modules.map((m) => [m.title, "Unterbereich", m.shift, `wirkungsfelder/rente-soziale-sicherung/${m.slug}/`]))}</section><section class="section" aria-labelledby="dokumente"><div class="section-header"><p class="hero-kicker">Dokumente</p>${h2("dokumente", "Konzept, Dossier und Arbeitsbibliothek")}</div>${cards(base, [["Konzeptpapier online lesen", "Online-Volltext", "Konzeptpapier Rente & soziale Sicherung.", "wirkungsfelder/rente-soziale-sicherung/konzept/"], ["Gesamtdossier online lesen", "Online-Volltext", "Dossier mit Beispielen, Berechnungen, Datenquellen und Umsetzung.", "wirkungsfelder/rente-soziale-sicherung/dossier/"], ["Detailkonzepte online lesen", "Online-Volltext", "Umfangreiche Detailkonzepte zu allen Unterbereichen.", "wirkungsfelder/rente-soziale-sicherung/detailkonzepte/"], ["Einzeldossier-Set online lesen", "Online-Volltext", "Einzeldossiers mit Anwendung, Annahmen, Bewertungslogik und Grenzen.", "wirkungsfelder/rente-soziale-sicherung/dossiers/"], ["Arbeitsbibliothek öffnen", "Werkstatt", "Downloads, Online-Zugänge und Kontextverweise.", "werkstatt/arbeitsbibliothek/wirkungsfelder/rente-soziale-sicherung/"]])}</section>${toolGrid(base)}${crossLinkBlock(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${sourceBlock(base)}${downloads(base, [{ label: "Konzeptpapier Word", href: docs.concept.download }, { label: "Gesamtdossier Word", href: docs.dossier.download }, { label: "Detailkonzepte Word", href: docs.detail.download }, { label: "Einzeldossier-Set Word", href: docs.singleDossier.download }, { label: "Tool-Spezifikation Rechner", href: docs.toolSpec.download }, { label: "Tool-Spezifikation Simulator", href: docs.toolSpecSimulator.download }])}`,
  });
}

function modulePage(module, index) {
  const detail = markdownishToHtml(sectionFor(sourceText(docs.detail), index, "Detail"));
  const dossier = markdownishToHtml(sectionFor(sourceText(docs.singleDossier), index, "Dossier"));
  page({
    rel: `wirkungsfelder/rente-soziale-sicherung/${module.slug}/index.html`,
    title: `${module.title} | Rente & soziale Sicherung`,
    description: module.shift,
    type: "Unterbereich",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/rente-soziale-sicherung/")}">Rente & soziale Sicherung</a></nav><p class="hero-kicker">Rente & soziale Sicherung</p><h1>${esc(module.title)}</h1><p class="hero-subtitle">${esc(module.shift)}</p><p>${esc(module.problem)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#detailkonzept">Detailkonzept online lesen</a><a class="btn btn-secondary" href="#dossier">Dossier online lesen</a></div></div></section>${publicationAccess(base, [{ kicker: "Langfassung", title: "Detailkonzept online lesen", text: "Die fachliche Langfassung dieses Unterbereichs ist direkt auf dieser Seite zitierfähig eingebunden.", href: "#detailkonzept", label: "Zum Detailkonzept" }, { kicker: "Dossier", title: "Einzeldossier online lesen", text: "Anwendung, Annahmen, Bewertungslogik, politische Optionen und Grenzen.", href: "#dossier", label: "Zum Dossier" }, { kicker: "Download", title: "Detailkonzepte Word", text: "Exportfassung der langen Detailkonzepte.", href: docs.detail.download, label: "Herunterladen" }, { kicker: "Download", title: "Einzeldossier-Set Word", text: "Exportfassung der Einzeldossiers.", href: docs.singleDossier.download, label: "Herunterladen" }])}${tocBlock([...detail.toc, ...dossier.toc])}<section class="section" aria-labelledby="kurzfassung"><div class="section-header"><p class="hero-kicker">Kurzfassung</p>${h2("kurzfassung", "Kurzfassung")}</div><div class="card-grid three"><article class="card"><h3 class="card-title">Alte Logik</h3><p class="card-text">${esc(module.problem)}</p></article><article class="card"><h3 class="card-title">Perspektivwechsel</h3><p class="card-text">${esc(module.shift)}</p></article><article class="card"><h3 class="card-title">Schutzlinie</h3><p class="card-text">Bewertet werden Systeme, Regeln, Fonds, Nachweise und Wirkungsräume, nicht der Wert von Menschen. Keine automatisierte Letztentscheidung.</p></article></div></section><section class="section article-section" aria-labelledby="detailkonzept"><article class="article-body fulltext-reader"><p class="hero-kicker">Detailkonzept</p>${h2("detailkonzept", "Detailkonzept online lesen")}${detail.html}</article></section><section class="section article-section" aria-labelledby="dossier"><article class="article-body fulltext-reader"><p class="hero-kicker">Einzeldossier</p>${h2("dossier", "Dossier online lesen")}${dossier.html}</article></section>${toolGrid(base)}${crossLinkBlock(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${sourceBlock(base)}${downloads(base, [{ label: "Detailkonzepte Word", href: docs.detail.download }, { label: "Einzeldossier-Set Word", href: docs.singleDossier.download }])}`,
  });
}

function fulltextPage(key, rel, status) {
  const doc = docs[key];
  const rendered = markdownishToHtml(sourceText(doc));
  page({
    rel,
    title: `${doc.title} | Wirkungsökonomie`,
    description: `${doc.title} als öffentlicher Online-Volltext mit Zitierankern, Druckfunktion und Download.`,
    type: status,
    body: (base, canonical) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/rente-soziale-sicherung/")}">Rente & soziale Sicherung</a></nav><p class="hero-kicker">${esc(status)}</p><h1>${esc(doc.title)}</h1><p class="hero-subtitle">Online-Volltext ist der Hauptzugang. Word bleibt Export und Archiv.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#online-volltext">Online lesen</a></div></div></section><section class="section narrow"><aside class="citation-note" role="note"><p class="card-kicker">Zitierfähig</p><h2>Online lesen, gezielt zitieren</h2><p>Abschnittsanker können direkt zitiert werden.</p><p><a class="text-link" href="${canonical}">Kanonische Seitenadresse öffnen</a></p></aside></section>${publicationAccess(base, [{ kicker: "Online", title: "Diese Langfassung online lesen", text: "Der vollständige Webtext ist auf dieser Seite mit zitierfähigen Abschnittsankern verfügbar.", href: "#online-volltext", label: "Zum Volltext" }, { kicker: "Langfassung", title: "Detailkonzepte online lesen", text: "Umfangreiche Detailkonzepte zu allen Unterbereichen.", href: "wirkungsfelder/rente-soziale-sicherung/detailkonzepte/", label: "Online lesen" }, { kicker: "Dossier", title: "Einzeldossier-Set online lesen", text: "Einzeldossiers mit Anwendung, Annahmen, Bewertungslogik und Grenzen.", href: "wirkungsfelder/rente-soziale-sicherung/dossiers/", label: "Online lesen" }, { kicker: "Download", title: `${doc.title} Word`, text: "Export- und Archivfassung dieser Langfassung.", href: doc.download, label: "Herunterladen" }])}<section class="section narrow">${statusBox(status)}</section><section class="section narrow">${tocBlock(rendered.toc)}</section><section class="section article-section"><article class="article-body fulltext-reader">${h2("online-volltext", "Online-Volltext")}${rendered.html}</article></section>${toolGrid(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${sourceBlock(base)}${downloads(base, [{ label: `${doc.title} Word`, href: doc.download }])}`,
  });
}

function calculatorPage() {
  const spec = markdownishToHtml(read(`${SOURCE}/tool_spezifikation_wirkungsrenten_rechner.md`));
  page({
    rel: "erleben/wirkungsrenten-rechner/index.html",
    title: "Wirkungsrenten-Rechner | Wirkungsökonomie",
    description: "Modellhafte Demo zu Basisrente, Anwartschaft, Lebenswirkungs-Faktor, Wirkungsdividende, Fondsanteil und Automatisierungs-Entkopplung.",
    section: "Erleben",
    type: "Demo",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "erleben.html")}">Erleben</a></nav><p class="hero-kicker">Demo · Modell V0.1</p><h1>Wirkungsrenten-Rechner</h1><p class="hero-subtitle">Basisrente, klassische Anwartschaft, Lebenswirkungs-Faktor, Wirkungsdividende und Fondsanteil modellhaft zusammendenken.</p><p class="scanner-notice">Modellhafte Demonstration. Keine Rentenauskunft, keine Rechtsberatung, keine Steuerberatung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#rechenmodell">Rechenmodell ansehen</a></div></div></section><section class="section" aria-labelledby="rechenmodell"><div class="section-header"><p class="hero-kicker">Arbeitsformel</p>${h2("rechenmodell", "Rechenmodell V0.1")}</div><div class="table-wrap"><table class="data-table"><tbody><tr><th>Formel</th><td>Rente_modell = B + A + max(0, WB) + WD + F</td></tr><tr><th>B</th><td>Basisrente / Würdeebene</td></tr><tr><th>A</th><td>Klassischer Anwartschaftsanteil</td></tr><tr><th>LWF</th><td>Lebenswirkungs-Faktor, Pilotkorridor 1,00 bis 1,25</td></tr><tr><th>WB</th><td>B × (LWF - 1), keine negative Personenabsenkung unter die Würdeebene</td></tr><tr><th>WD / F</th><td>Wirkungsdividende und Fondsanteil aus Renten-Impact-Fonds</td></tr></tbody></table></div></section><section class="section" aria-labelledby="demo-module"><div class="section-header"><p class="hero-kicker">Module</p>${h2("demo-module", "Demo-Module")}</div>${cards(base, [["Alter-Rente-Vergleich", "Demo", "Vergleicht alte Logik und Wirkungslogik modellhaft.", ""], ["Lebenswirkungs-Konto", "Demo", "Zeigt Nachweisfelder für Care, Bildung, Pflege, Ehrenamt und Transformation.", "wirkungsfelder/rente-soziale-sicherung/lebenswirkungs-konto/"], ["Renten-Impact-Fonds-Szenario", "Demo", "Verbindet Fondsparameter, Wirkungserträge, Rücklagen und Ausschüttung.", "wirkungsfelder/rente-soziale-sicherung/renten-impact-fonds/"], ["Automatisierungs-Entkopplung", "Demo", "Zeigt Maschinenleistung, Sozialabgabenbasis und Rückkopplungsquote.", "wirkungsfelder/rente-soziale-sicherung/automatisierung-sozialabgaben/"]])}</section><section class="section narrow">${tocBlock(spec.toc)}</section><section class="section article-section"><article class="article-body fulltext-reader">${h2("spezifikation", "Tool-Spezifikation")}${spec.html}</article></section>${toolGrid(base)}${crossLinkBlock(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${sourceBlock(base)}${downloads(base, [{ label: "Konzeptpapier Word", href: docs.concept.download }, { label: "Tool-Spezifikation Rechner", href: docs.toolSpec.download }, { label: "Tool-Spezifikation Simulator", href: docs.toolSpecSimulator.download }])}`,
  });
}

function libraryPage() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/rente-soziale-sicherung/index.html",
    title: "Arbeitsbibliothek Rente & soziale Sicherung | Wirkungsökonomie",
    description: "Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers, Tool-Spezifikation und Downloads zum Wirkungsfeld Rente & soziale Sicherung.",
    section: "Werkstatt",
    type: "Arbeitsbibliothek",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "werkstatt/")}">Werkstatt</a></nav><p class="hero-kicker">Arbeitsbibliothek</p><h1>Rente & soziale Sicherung</h1><p class="hero-subtitle">Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers, Tool-Spezifikation und Downloads.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "wirkungsfelder/rente-soziale-sicherung/")}">Portal öffnen</a></div></div></section><section class="section" aria-labelledby="online"><div class="section-header"><p class="hero-kicker">Online lesen</p>${h2("online", "Dokumente und Unterbereiche")}</div>${cards(base, [["Konzeptpapier", "Online-Volltext", "Konzeptpapier online lesen und zitieren.", "wirkungsfelder/rente-soziale-sicherung/konzept/"], ["Gesamtdossier", "Online-Volltext", "Gesamtdossier online lesen und zitieren.", "wirkungsfelder/rente-soziale-sicherung/dossier/"], ["Detailkonzepte", "Online-Volltext", "Umfangreiche Detailkonzepte online lesen.", "wirkungsfelder/rente-soziale-sicherung/detailkonzepte/"], ["Einzeldossier-Set", "Online-Volltext", "Einzeldossiers online lesen.", "wirkungsfelder/rente-soziale-sicherung/dossiers/"], ["Wirkungsrenten-Rechner", "Erleben", "Tool-Spezifikation und Modell-Demo.", "erleben/wirkungsrenten-rechner/"], ...modules.map((m) => [m.title, "Unterbereich", m.shift, `wirkungsfelder/rente-soziale-sicherung/${m.slug}/`])])}</section>${downloads(base, [{ label: "Konzeptpapier Word", href: docs.concept.download }, { label: "Gesamtdossier Word", href: docs.dossier.download }, { label: "Detailkonzepte Word", href: docs.detail.download }, { label: "Einzeldossier-Set Word", href: docs.singleDossier.download }])}`,
  });
}

function updateSitemap() {
  const sitemap = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemap)) return;
  let xml = fs.readFileSync(sitemap, "utf8");
  const urls = [
    "wirkungsfelder/rente-soziale-sicherung/",
    "wirkungsfelder/rente-soziale-sicherung/konzept/",
    "wirkungsfelder/rente-soziale-sicherung/dossier/",
    "wirkungsfelder/rente-soziale-sicherung/detailkonzepte/",
    "wirkungsfelder/rente-soziale-sicherung/dossiers/",
    ...modules.map((module) => `wirkungsfelder/rente-soziale-sicherung/${module.slug}/`),
    "erleben/wirkungsrenten-rechner/",
    "werkstatt/arbeitsbibliothek/wirkungsfelder/rente-soziale-sicherung/",
  ];
  const additions = urls.filter((url) => !xml.includes(`${SITE}/${url}`)).map((url) => `  <url>\n    <loc>${SITE}/${url}</loc>\n    <lastmod>${DATE}</lastmod>\n  </url>`).join("\n");
  if (additions) fs.writeFileSync(sitemap, xml.replace("</urlset>", `${additions}\n</urlset>`), "utf8");
}

function run() {
  portalPage();
  modules.forEach(modulePage);
  fulltextPage("concept", "wirkungsfelder/rente-soziale-sicherung/konzept/index.html", "Konzeptpapier / Online-Volltext");
  fulltextPage("dossier", "wirkungsfelder/rente-soziale-sicherung/dossier/index.html", "Gesamtdossier / Online-Volltext");
  fulltextPage("detail", "wirkungsfelder/rente-soziale-sicherung/detailkonzepte/index.html", "Detailkonzepte / Online-Volltext");
  fulltextPage("singleDossier", "wirkungsfelder/rente-soziale-sicherung/dossiers/index.html", "Einzeldossier-Set / Online-Volltext");
  calculatorPage();
  libraryPage();
  updateSitemap();
  console.log("Pension and social security portal generated.");
}

run();
