import fs from "node:fs";
import path from "node:path";

/*
 * Kennzeichnet nur die frühere multiplikative T-SROI-Formel. Das Dokument,
 * in dem sie steht, bleibt les- und zitierbar; die Rechenregel wird jedoch
 * nicht mehr als aktuelle Methode missverstanden. Der Schritt läuft nach den
 * Seitengeneratoren, damit auch aus PDF erzeugte Onlinefassungen erfasst sind.
 */
const ROOT = process.cwd();
const SITE_ROOTS = ["bibliothek", "referenz", "werkzeuge", "dokumente", "begriffe", "wirkungsfelder", "fuer"];
const MARKER = "data-tsroi-rechenstandard-einordnung";
const FORCED_NOTICE_PATHS = new Set([
  "dokumente/whitepaper-t-sroi/index.html",
  "dokumente/wp-wohnungsmarkt/index.html",
  "bibliothek/eintraege/download-or-document-assets-pdf-working-paper-wohnungsmarkt-pdf/lesen/index.html",
  "bibliothek/eintraege/download-or-document-assets-pdf-working-paper-wohnungsmarkt-pdf/lesen/01-teil-ii-das-prinzip-wirkung-statt-kapital-wok/index.html",
  "bibliothek/eintraege/download-or-document-assets-downloads-impact-controlling-einfach-erklaert-pdf/lesen/17-slide-18/index.html",
  "bibliothek/eintraege/download-or-document-assets-downloads-wirkungscontrolling-detailkonzept-dossier-v1-0-pdf/lesen/12-zu-steuerungsdaten/index.html",
  "bibliothek/eintraege/download-or-document-assets-downloads-wirkungscontrolling-detailkonzept-dossier-v1-0-pdf/lesen/17-teil-vii-beispielrechnungen-und-konkrete/index.html"
]);
const HISTORICAL_T_SROI_READER_PREFIXES = [
  "bibliothek/eintraege/download-or-document-assets-downloads-23-woek-impact-controlling-t-sroi-transformationsmessung-m-2/lesen/"
];

// Die aktuelle Rechnung enthält keine freien Transformations-, Resilienz- oder
// Datenqualitätsfaktoren. Diese Muster erfassen die drei historischen
// Schreibweisen (Wortform, T_struktur und typografische Folienform), ohne bloße
// begriffliche Erwähnungen zu markieren.
const LEGACY_T_SROI_FORMULA = /T[\s\u2011\u2013\u2014-]*SROI\s*=\s*[\s\S]{0,700}?(?:Transformationsmultiplikator|Transformations[\s,;:–-]+Zeit|Datenqualit(?:ä|a)tsvertrauen|T_?struktur|F_?resilienz|Q_?(?:daten|0)|M[ₜt][ᵣr][ₐa][ₙn][ₛs])/iu;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute, files);
    else if (entry.isFile() && entry.name === "index.html") files.push(absolute);
  }
  return files;
}

function baseFor(file) {
  const relative = path.relative(path.dirname(file), ROOT).split(path.sep).join("/");
  return relative ? `${relative}/` : "";
}

function notice(base, historicalReader = false) {
  const online = `${base}werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/`;
  const pdf = `${base}assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_1.pdf`;
  const source = `${base}quellenarchiv/wok-q-1024/`;
  const introduction = historicalReader
    ? "Diese vollständige Lesefassung dokumentiert den historischen Rechenstand v1.0. Ihre Multiplikatorlogik ist keine aktuelle T-SROI-Rechnung."
    : "Die nachfolgende Multiplikatorformel ist eine historische Darstellungsform.";
  return `\n        <aside class="reference-term-notice" ${MARKER}>\n          <strong>Fachliche Einordnung</strong>\n          <p>${introduction} Für eine T-SROI-Berechnung gilt ausschließlich der <a href="${online}">aktuelle T-SROI-Rechenstandard</a> (<a href="${pdf}">PDF</a>; <a href="${source}">Quellenarchiv WÖK-Q-1024</a>): direkte und separat belegte transformative Nutzenströme werden kausal begrenzt, Schäden innerhalb der Bilanzgrenze separat abgezogen und der Netto-Nutzen wird durch diskontierte Ressourcen geteilt. Datenqualität ist Schutz- und Prüfbedingung, kein Aufschlagsfaktor. Bei roten Linien, negativem Kernprofil oder unzureichender Evidenz lautet das Ergebnis „blockiert / nicht bewertbar“.</p>\n        </aside>`;
}

function insertNotice(html, block) {
  const articleStart = html.indexOf("<article");
  const leadStart = articleStart >= 0 ? html.indexOf('<p class="lead">', articleStart) : -1;
  if (leadStart >= 0) return `${html.slice(0, leadStart)}${block}\n${html.slice(leadStart)}`;
  const headerEnd = articleStart >= 0 ? html.indexOf("</header>", articleStart) : -1;
  if (headerEnd >= 0) return `${html.slice(0, headerEnd + "</header>".length)}${block}\n${html.slice(headerEnd + "</header>".length)}`;

  const readerBody = html.indexOf('class="reader-body"');
  if (readerBody >= 0) {
    const openEnd = html.indexOf(">", readerBody);
    if (openEnd >= 0) return `${html.slice(0, openEnd + 1)}${block}\n${html.slice(openEnd + 1)}`;
  }

  const mainOpen = html.indexOf("<main");
  if (mainOpen >= 0) {
    const openEnd = html.indexOf(">", mainOpen);
    if (openEnd >= 0) return `${html.slice(0, openEnd + 1)}${block}\n${html.slice(openEnd + 1)}`;
  }
  return null;
}

function markHistoricalNoindex(html) {
  const robots = /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/iu;
  if (robots.test(html)) {
    return html.replace(robots, (tag) => {
      if (/\bcontent=["'][^"']*["']/iu.test(tag)) {
        return tag.replace(/\bcontent=["'][^"']*["']/iu, 'content="noindex,follow"');
      }
      return tag.replace(/\/?\s*>$/u, ' content="noindex,follow">');
    });
  }
  return html.replace(/<head(\s[^>]*)?>/iu, (head) => `${head}\n    <meta name="robots" content="noindex,follow">`);
}

function isNoindex(html) {
  return /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*["'])[^>]*>/iu.test(html);
}

function removeWhitepaperImportScaffolding(html) {
  if (!html.includes('id="whitepaper-t-sroi-s0001"')) return html;
  return html
    .replace(
      /<p class="lead">[\s\S]*?<\/p>\s*<p><a class="button" href="\.\.\/\.\.\/bibliothek\/whitepaper-t-sroi\/">Herunterladen<\/a><\/p>/u,
      `<p class="lead">Historische Onlinefassung des Whitepapers. Sie bleibt als Quellenfassung lesbar.</p>\n        <p><a class="button" href="../../werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/">Aktuellen T-SROI-Rechenstandard lesen</a> <a class="text-link" href="../../public/downloads/originals/Whitepaper-T-SROI.pdf">Historische PDF-Fassung öffnen</a></p>`
    )
    .replace(/\s*<section class="meta-box">[\s\S]*?<\/section>\s*<section class="callout">[\s\S]*?<\/section>/u, "");
}

const checkOnly = process.argv.includes("--check");
const files = SITE_ROOTS.flatMap((root) => walk(path.join(ROOT, root)));
const covered = [];
const changed = [];
const unresolved = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  const before = fs.readFileSync(file, "utf8");
  let html = rel === "dokumente/whitepaper-t-sroi/index.html" ? removeWhitepaperImportScaffolding(before) : before;
  const historicalReader = HISTORICAL_T_SROI_READER_PREFIXES.some((prefix) => rel.startsWith(prefix));
  const needsNotice = LEGACY_T_SROI_FORMULA.test(html) || FORCED_NOTICE_PATHS.has(rel) || historicalReader;
  if (!needsNotice) continue;
  const hadNoindex = isNoindex(html);
  if (!checkOnly) html = markHistoricalNoindex(html);
  if (html.includes(MARKER)) {
    const hasCurrentSource = html.includes("quellenarchiv/wok-q-1024/");
    if (hasCurrentSource && (checkOnly ? hadNoindex : isNoindex(html))) {
      covered.push(rel);
      if (!checkOnly && html !== before) {
        fs.writeFileSync(file, html);
        changed.push(rel);
      }
      continue;
    }
    if (checkOnly) {
      unresolved.push(rel);
      continue;
    }
    const refreshed = html.replace(
      /<aside class="reference-term-notice"[^>]*data-tsroi-rechenstandard-einordnung[^>]*>[\s\S]*?<\/aside>/u,
      notice(baseFor(file), historicalReader).trim()
    );
    if (refreshed === html) {
      unresolved.push(rel);
      continue;
    }
    fs.writeFileSync(file, refreshed);
    changed.push(rel);
    continue;
  }
  const updated = insertNotice(html, notice(baseFor(file), historicalReader));
  if (!updated) {
    unresolved.push(rel);
    continue;
  }
  if (!checkOnly) {
    fs.writeFileSync(file, updated);
    changed.push(rel);
  } else {
    unresolved.push(rel);
  }
}

if (unresolved.length) {
  console.error(`T-SROI-Einordnung fehlt auf ${unresolved.length} Seite(n):\n${unresolved.join("\n")}`);
  process.exitCode = 1;
} else {
  const label = checkOnly ? "geprüft" : "ergänzt";
  console.log(`T-SROI-Rechenstandard-Einordnung ${label}: ${checkOnly ? covered.length : changed.length} Seite(n).`);
  if (!checkOnly && changed.length) console.log(changed.join("\n"));
}
