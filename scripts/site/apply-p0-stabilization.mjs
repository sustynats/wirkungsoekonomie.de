import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = {
  generated_at: new Date().toISOString(),
  checked_files: 0,
  changed_files: 0,
  replacements: {},
};

const skipDirs = new Set([
  ".git",
  "node_modules",
  "tmp",
  ".cache",
  "dist",
  "build",
  "_site",
]);

function count(name, amount = 1) {
  report.replacements[name] = (report.replacements[name] || 0) + amount;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".well-known") continue;
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function replaceCounted(html, pattern, replacement, key) {
  const matches = html.match(pattern);
  if (matches?.length) count(key, matches.length);
  return html.replace(pattern, replacement);
}

function removeMaiwaldBlock(html, rel) {
  if (rel.startsWith("verstehen/")) return html;
  const pattern = /\n?\s*<section\b[^>]*class=["'][^"']*\bmaiwald-explainer\b[^"']*["'][^>]*>[\s\S]*?<\/section>\s*/gi;
  const matches = html.match(pattern);
  if (matches?.length) count("removed_maiwald_explainer", matches.length);
  return html.replace(pattern, "\n");
}

function normalizeAudio(html) {
  let next = html;
  next = replaceCounted(next, /(\s(?:src|href)=["'])assets\/audio\//g, "$1/assets/audio/", "root_audio_paths");
  next = replaceCounted(next, /(\s(?:src|href)=['"])assets\/audio\//g, "$1/assets/audio/", "root_audio_paths_single");
  next = replaceCounted(
    next,
    /\s*<a\b[^>]*href=["'][^"']+\.mp3(?:\?[^"']*)?["'][^>]*>\s*MP3 herunterladen\s*<\/a>\s*/gi,
    "\n",
    "removed_mp3_download_links",
  );
  return next;
}

function normalizePublicLabels(html) {
  let next = html;
  next = replaceCounted(next, /Methodenlandkarte/g, "Methoden & Werkzeuge", "footer_methodenlandkarte_label");
  next = replaceCounted(next, /Dokumentenregistry/g, "Dokumentenbibliothek", "footer_documentenregistry_label");
  next = replaceCounted(next, /RSS &amp; Updates|Updates &amp; RSS/g, "Neu auf der Website", "footer_updates_label");
  next = replaceCounted(next, /RSS & Updates|Updates & RSS/g, "Neu auf der Website", "footer_updates_label_raw");
  next = replaceCounted(next, /Website 2\.0\s*·\s*/g, "", "removed_website_20_prefix");
  next = replaceCounted(next, /\s*·\s*Website 2\.0/g, "", "removed_website_20_suffix");
  next = replaceCounted(next, /Website 2\.0/g, "", "removed_website_20");
  next = replaceCounted(next, /Orientierung 2\.1/g, "Grundlogik", "renamed_orientation_21");
  next = replaceCounted(next, /ergänzende ergänzende/g, "ergänzende", "fixed_double_ergaenzende");
  next = replaceCounted(
    next,
    /Dieser Orientierungsblock verbindet das Wirkungsfeld mit Methoden, Demos und Bibliothek\. Die bestehende Detailseite bleibt vollständig erhalten\./g,
    "",
    "removed_wirkungsfeld_meta_note",
  );
  return next;
}

function normalizeToolLanguage(html) {
  const replacements = [
    [/Ein rechner der Wirkungsökonomie/g, "Ein Rechner der Wirkungsökonomie"],
    [/Ein scanner der Wirkungsökonomie/g, "Ein Scanner der Wirkungsökonomie"],
    [/Ein dashboard der Wirkungsökonomie/g, "Ein Dashboard der Wirkungsökonomie"],
    [/Ein register der Wirkungsökonomie/g, "Ein Register der Wirkungsökonomie"],
    [/Ein check der Wirkungsökonomie/g, "Ein Check der Wirkungsökonomie"],
    [/Ein rechtsmodell der Wirkungsökonomie/g, "Ein Rechtsmodell der Wirkungsökonomie"],
    [/Ein methode der Wirkungsökonomie/g, "Eine Methode der Wirkungsökonomie"],
    [/Ein demo der Wirkungsökonomie/g, "Eine Demo der Wirkungsökonomie"],
  ];
  let next = html;
  for (const [pattern, replacement] of replacements) {
    next = replaceCounted(next, pattern, replacement, "normalized_tool_language");
  }
  return next;
}

function hardenDashboard(html, rel) {
  if (rel !== "werkzeuge/dashboard/index.html") return html;
  let next = html;
  next = replaceCounted(
    next,
    /<link rel="canonical" href="https:\/\/wirkungsoekonomie\.de\/werkzeuge\/">/g,
    '<link rel="canonical" href="https://wirkungsoekonomie.de/werkzeuge/dashboard/">',
    "fixed_dashboard_canonical",
  );

  if (!next.includes("p0-dashboard-fallback:start")) {
    const fallback = `
        <!-- p0-dashboard-fallback:start -->
        <div class="card-grid three" data-dashboard-fallback>
          <article class="card"><p class="card-kicker">Methode</p><h3 class="card-title">T-SROI</h3><p>Transformationswirkung und gesellschaftlichen Nutzen einordnen.</p><a href="../t-sroi/">T-SROI öffnen</a></article>
          <article class="card"><p class="card-kicker">Index</p><h3 class="card-title">Netto-Wirkungs-Index</h3><p>Wirkung nicht nur zählen, sondern nach Zielkonflikten bewerten.</p><a href="../nwi/">NWI öffnen</a></article>
          <article class="card"><p class="card-kicker">Steuerung</p><h3 class="card-title">Impact Controlling</h3><p>Wirkungsdaten in Entscheidung, Budget und Lernen zurückführen.</p><a href="../impact-controlling/">Impact Controlling öffnen</a></article>
          <article class="card"><p class="card-kicker">Prinzip</p><h3 class="card-title">Reverse Merit Order</h3><p>Schwere Schäden zuerst ausschließen, bevor Nutzen gegengerechnet wird.</p><a href="../reverse-merit-order/">Prinzip öffnen</a></article>
          <article class="card"><p class="card-kicker">Qualität</p><h3 class="card-title">Datenqualität &amp; Assurance</h3><p>Quellenstand, Prüfbarkeit und Unsicherheit sichtbar machen.</p><a href="../datenqualitaet/">Datenqualität öffnen</a></article>
          <article class="card"><p class="card-kicker">Debatte</p><h3 class="card-title">Debattenkarten</h3><p>Konkrete Aussagen prüfen und Antwortbausteine finden.</p><a href="../../wirkungsradar/debattenkarten/">Debattenkarten öffnen</a></article>
        </div>
        <!-- p0-dashboard-fallback:end -->`;
    next = next.replace(
      /(<p id="tool-example-count"[^>]*>Beispiele werden geladen\.<\/p>)/,
      `$1\n${fallback}`,
    );
    if (next !== html) count("added_dashboard_fallback");
  }
  return next;
}

const files = walk(root);
for (const file of files) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  report.checked_files += 1;
  const html = fs.readFileSync(file, "utf8");
  let next = html;
  next = normalizeAudio(next);
  next = normalizePublicLabels(next);
  next = normalizeToolLanguage(next);
  next = removeMaiwaldBlock(next, rel);
  next = hardenDashboard(next, rel);
  if (next !== html) {
    fs.writeFileSync(file, next);
    report.changed_files += 1;
  }
}

fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(path.join(root, "reports/p0-stabilization.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P0 stabilization applied: ${report.changed_files}/${report.checked_files} HTML files changed.`);
