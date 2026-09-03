import fs from "node:fs";
import path from "node:path";

/*
 * The v0.2 Health & Care PDFs are preserved source documents. Their generated
 * online readers retain the original wording, so they need an explicit route
 * to the corrected v0.3 two-balance logic and must not outrank it in search.
 */
const ROOT = process.cwd();
const MARKER = "data-gesundheit-zwei-bilanzen-einordnung";
const HISTORICAL_READER_PREFIXES = [
  "bibliothek/eintraege/download-or-document-assets-downloads-woek-gesundheit-pflege-einzeldossier-set-v0-2-pdf/lesen/",
  "bibliothek/eintraege/download-or-document-assets-downloads-woek-gesundheit-pflege-einzeldossier-set-v0-2-2-pdf/lesen/"
];
const HISTORICAL_DETAIL_PATHS = new Set([
  "bibliothek/eintraege/download-or-document-assets-downloads-woek-gesundheit-pflege-einzeldossier-set-v0-2-pdf/index.html",
  "bibliothek/eintraege/download-or-document-assets-downloads-woek-gesundheit-pflege-einzeldossier-set-v0-2-2-pdf/index.html"
]);

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
  return relative ? relative + "/" : "";
}

function notice(base) {
  const online = base + "wirkungsfelder/gesundheit-pflege/dossiers/";
  const pdf = base + "assets/downloads/woek_gesundheit_pflege_einzeldossier_set_v0_3.pdf";
  const source = base + "quellenarchiv/wok-q-1024/";
  return '\n        <aside class="reference-term-notice" ' + MARKER + '>\n' +
    '          <strong>Fachliche Einordnung</strong>\n' +
    '          <p>Diese Lesefassung dokumentiert die historische Quellenfassung v0.2. Ihre Mischrechnung aus Geldwerten und Lebensqualität, Autonomie, Teilhabe oder Resilienz ist keine aktuelle Rechenlogik. Die <a href="' + online + '">Korrekturfassung v0.3</a> führt zwei getrennte Darstellungen: einen diskontierten Saldo in EUR und ein nichtmonetäres Wirkungsprofil mit Einheit, Vergleichsfall, Attribution und Unsicherheit. Eine positive Geldbilanz ist kein Freifahrtschein; rote Linien und schwere Verschlechterungen blockieren positive Netto-Wirkung. <a href="' + pdf + '">PDF v0.3</a> · <a href="' + source + '">Quellenarchiv WÖK-Q-1024</a>.</p>\n' +
    '        </aside>';
}

function insertNotice(html, block) {
  const articleStart = html.indexOf("<article");
  const leadStart = articleStart >= 0 ? html.indexOf('<p class="lead">', articleStart) : -1;
  if (leadStart >= 0) return html.slice(0, leadStart) + block + "\n" + html.slice(leadStart);
  const headerEnd = articleStart >= 0 ? html.indexOf("</header>", articleStart) : -1;
  if (headerEnd >= 0) return html.slice(0, headerEnd + "</header>".length) + block + "\n" + html.slice(headerEnd + "</header>".length);
  const readerBody = html.indexOf('class="reader-body"');
  if (readerBody >= 0) {
    const openEnd = html.indexOf(">", readerBody);
    if (openEnd >= 0) return html.slice(0, openEnd + 1) + block + "\n" + html.slice(openEnd + 1);
  }
  return null;
}

function markNoindex(html) {
  const robots = /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/iu;
  if (robots.test(html)) {
    return html.replace(robots, (tag) => /\bcontent=["'][^"']*["']/iu.test(tag)
      ? tag.replace(/\bcontent=["'][^"']*["']/iu, 'content="noindex,follow"')
      : tag.replace(/\/?\s*>$/u, ' content="noindex,follow">'));
  }
  return html.replace(/<head(\s[^>]*)?>/iu, (head) => head + '\n    <meta name="robots" content="noindex,follow">');
}

function isNoindex(html) {
  return /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*["'])[^>]*>/iu.test(html);
}

const checkOnly = process.argv.includes("--check");
const files = walk(path.join(ROOT, "bibliothek"));
const targets = files.filter((file) => {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  return HISTORICAL_DETAIL_PATHS.has(rel) || HISTORICAL_READER_PREFIXES.some((prefix) => rel.startsWith(prefix));
});
const unresolved = [];
const changed = [];

for (const file of targets) {
  const before = fs.readFileSync(file, "utf8");
  const hasNotice = before.includes(MARKER) && before.includes("quellenarchiv/wok-q-1024/");
  const hasNoindex = isNoindex(before);
  if (checkOnly) {
    if (!hasNotice || !hasNoindex) unresolved.push(path.relative(ROOT, file));
    continue;
  }
  let next = markNoindex(before);
  if (!next.includes(MARKER)) next = insertNotice(next, notice(baseFor(file))) || next;
  if (!next.includes(MARKER) || !isNoindex(next)) {
    unresolved.push(path.relative(ROOT, file));
    continue;
  }
  if (next !== before) {
    fs.writeFileSync(file, next);
    changed.push(path.relative(ROOT, file));
  }
}

if (!targets.length || unresolved.length) {
  console.error("Gesundheit-v0.2-Einordnung unvollständig: " + (unresolved.length || "keine Zielseiten") + ".\n" + unresolved.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Gesundheit-v0.2-Einordnung " + (checkOnly ? "geprüft" : "ergänzt") + ": " + (checkOnly ? targets.length : changed.length) + " Seite(n).");
}
