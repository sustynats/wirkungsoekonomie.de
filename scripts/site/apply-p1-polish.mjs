import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skipDirs = new Set([".git", "node_modules", "tmp", ".cache", "dist", "build", "_site"]);
const report = {
  generated_at: new Date().toISOString(),
  checked_files: 0,
  changed_files: 0,
  replacements: {},
  targeted: [],
};

function count(key, amount = 1) {
  report.replacements[key] = (report.replacements[key] || 0) + amount;
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

function normalizeLabels(html) {
  let next = html;
  next = replaceCounted(next, /Methodenlandkarte/g, "Methoden & Werkzeuge", "methodenlandkarte");
  next = replaceCounted(next, /Dokumentenregistry/g, "Dokumentenbibliothek", "dokumentenregistry");
  next = replaceCounted(next, /RSS &amp; Updates|Updates &amp; RSS/g, "Neu auf der Website", "updates_rss_html");
  next = replaceCounted(next, /RSS & Updates|Updates & RSS/g, "Neu auf der Website", "updates_rss_text");
  next = replaceCounted(next, /Website 2\.0\s*·\s*/g, "", "website_20_prefix");
  next = replaceCounted(next, /\s*·\s*Website 2\.0/g, "", "website_20_suffix");
  next = replaceCounted(next, /Website 2\.0/g, "", "website_20_plain");
  next = replaceCounted(next, /ergänzende ergänzende/g, "ergänzende", "double_ergaenzende");
  next = replaceCounted(
    next,
    /Dieser Orientierungsblock verbindet das Wirkungsfeld mit Methoden, Demos und Bibliothek\. Die bestehende Detailseite bleibt vollständig erhalten\./g,
    "",
    "wirkungsfeld_meta_note",
  );
  return next;
}

function normalizeUtilityBlocks(html) {
  let next = html;
  next = replaceCounted(
    next,
    /\s*<!-- p1-bibliothek-journal:start -->[\s\S]*?<!-- p1-bibliothek-journal:end -->\s*/g,
    "\n",
    "legacy_library_journal_block",
  );
  next = replaceCounted(
    next,
    /\s*<a\b[^>]*href=["'][^"']+\.mp3(?:\?[^"']*)?["'][^>]*>\s*MP3 herunterladen\s*<\/a>\s*/gi,
    "\n",
    "mp3_download_links",
  );
  next = replaceCounted(
    next,
    /\s*<button\b[^>]*onclick=["']window\.print\(\)["'][^>]*>\s*Seite drucken\s*<\/button>\s*/gi,
    "\n",
    "print_buttons",
  );
  next = replaceCounted(
    next,
    /\s*<a\b[^>]*href=["']#print["'][^>]*>\s*Seite drucken\s*<\/a>\s*/gi,
    "\n",
    "print_links",
  );
  return next;
}

function insertBeforeMainEnd(html, block) {
  if (!html.includes("</main>")) return html;
  return html.replace("</main>", `${block}\n    </main>`);
}

function addJournalismBridge(html, rel) {
  if (rel !== "fuer/journalismus.html" || html.includes("p1-journalismus-debattenkarten:start")) return html;
  report.targeted.push("fuer/journalismus.html: Debattenkarten-Brücke ergänzt");
  const block = `
      <!-- p1-journalismus-debattenkarten:start -->
      <section class="section" id="debattenkarten-journalismus">
        <div class="section-header">
          <p class="hero-kicker">Öffentlicher Wirkungsraum</p>
          <h2>Debattenkarten für journalistische Arbeit.</h2>
          <p>Wenn eine Aussage im Raum steht, braucht Journalismus nicht nur Fakten, sondern auch Frameklärung, Folgencheck und eine bessere Frage. Die Debattenkarten liefern dafür kurze Antwortformate, Wirkpfade und Quellen.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="../wirkungsradar/debattenkarten/">Debattenkarten öffnen</a>
            <a class="btn btn-secondary" href="../oeffentlicher-wirkungsraum/">Öffentlichen Wirkungsraum verstehen</a>
          </div>
        </div>
      </section>
      <!-- p1-journalismus-debattenkarten:end -->`;
  return insertBeforeMainEnd(html, block);
}

function addLibraryJournalBlock(html, rel) {
  if (
    rel !== "bibliothek/index.html" ||
    html.includes('id="journal"') ||
    html.includes("p1-bibliothek-journal:start")
  ) {
    return html;
  }
  let items = [];
  try {
    const blogIndex = JSON.parse(fs.readFileSync(path.join(root, "assets/data/blog-index.json"), "utf8"));
    items = (Array.isArray(blogIndex) ? blogIndex : blogIndex.items || []).slice(0, 2);
  } catch {
    items = [];
  }
  const cards = items
    .map((item) => `
          <article class="card">
            <p class="card-kicker">Journal · ${item.date || ""}</p>
            <h3 class="card-title">${item.title || "Journalartikel"}</h3>
            <p>${item.description || item.summary || ""}</p>
            <a href="../${String(item.url || "blog.html").replace(/^\//, "")}">Artikel lesen</a>
          </article>`)
    .join("");
  report.targeted.push("bibliothek/index.html: Journalblock ergänzt");
  const block = `
      <!-- p1-bibliothek-journal:start -->
      <section class="section" id="journal-in-der-bibliothek">
        <div class="section-header">
          <p class="hero-kicker">Journal</p>
          <h2>Aktuelle Einordnungen aus dem Journal.</h2>
          <p>Das Journal gehört zur Bibliothek: Es übersetzt neue Debatten, Dossiers und Beobachtungen in lesbare Einordnungen und verweist auf passende Begriffe, Werkzeuge und Veröffentlichungen.</p>
        </div>
        <div class="card-grid two">${cards}</div>
        <p><a class="btn btn-primary" href="../blog.html">Alle Journalartikel öffnen</a></p>
      </section>
      <!-- p1-bibliothek-journal:end -->`;
  return insertBeforeMainEnd(html, block);
}

const debattenkartenByField = new Map([
  ["wirkungsfelder/klima-energie-ressourcen/index.html", ["Klima & Energie", "Klima, Energie und Ressourcen", "Klima"]],
  ["wirkungsfelder/medien-oeffentlichkeit/index.html", ["Medien & Öffentlichkeit", "Medien, Demokratie und öffentliche Wirkung", "Medien"]],
  ["wirkungsfelder/staat-recht-demokratie/index.html", ["Staat, Recht & Demokratie", "Demokratie, Regeln und öffentliche Verantwortung", "Demokratie"]],
  ["wirkungsfelder/wirtschaft-unternehmen/index.html", ["Wirtschaft & Unternehmen", "Unternehmen, Preise und Verantwortung", "Wirtschaft"]],
]);

function addImpactFieldDebateLinks(html, rel) {
  if (!debattenkartenByField.has(rel) || html.includes("p1-passende-debattenkarten:start")) return html;
  const [kicker, title, query] = debattenkartenByField.get(rel);
  report.targeted.push(`${rel}: thematische Debattenkarten ergänzt`);
  const block = `
      <!-- p1-passende-debattenkarten:start -->
      <section class="section" id="passende-debattenkarten">
        <div class="section-header">
          <p class="hero-kicker">${kicker}</p>
          <h2>Passende Debattenkarten.</h2>
          <p>Zu diesem Wirkungsfeld gibt es konkrete Aussagen im Öffentlichen Wirkungsraum. Dort findest du Kurzantworten, Folgencheck, Wirkpfad und Quellen zu ${title}.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="../../wirkungsradar/debattenkarten/?q=${encodeURIComponent(query)}">Debattenkarten filtern</a>
            <a class="btn btn-secondary" href="../../oeffentlicher-wirkungsraum/">Öffentlichen Wirkungsraum öffnen</a>
          </div>
        </div>
      </section>
      <!-- p1-passende-debattenkarten:end -->`;
  return insertBeforeMainEnd(html, block);
}

function fixVerstehenButtons(html, rel) {
  if (rel !== "verstehen/index.html" && rel !== "verstehen.html") return html;
  let next = html;
  next = replaceCounted(
    next,
    /<a class="btn btn-primary" href="wirkungsoekonomie\.html">Mehr erfahren<\/a>/g,
    '<a class="btn btn-primary" href="wirkungsoekonomie.html">Grundidee öffnen</a>',
    "verstehen_primary_button",
  );
  next = replaceCounted(
    next,
    /<a class="btn btn-secondary" href="kompass\.html">Mehr erfahren<\/a>/g,
    '<a class="btn btn-secondary" href="kompass.html">Kompass öffnen</a>',
    "verstehen_secondary_button",
  );
  return next;
}

function fixHomepageLabels(html, rel) {
  if (rel !== "index.html") return html;
  let next = html;
  next = replaceCounted(next, /<a href="verstehen\/">Mehr erfahren<\/a>/g, '<a href="verstehen/">Verstehen öffnen</a>', "home_verstehen_cta");
  next = replaceCounted(next, /<a href="wirkungsfelder\/">Mehr erfahren<\/a>/g, '<a href="wirkungsfelder/">Wirkungsfelder öffnen</a>', "home_fields_cta");
  next = replaceCounted(next, /<a href="wirkungssteuerung\/">Mehr erfahren<\/a>/g, '<a href="wirkungssteuerung/">Wirkungssteuerung öffnen</a>', "home_steuerung_cta");
  return next;
}

function applyTargeted(html, rel) {
  let next = html;
  next = fixVerstehenButtons(next, rel);
  next = fixHomepageLabels(next, rel);
  next = addJournalismBridge(next, rel);
  next = addLibraryJournalBlock(next, rel);
  next = addImpactFieldDebateLinks(next, rel);
  return next;
}

const files = walk(root);
for (const file of files) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  report.checked_files += 1;
  const html = fs.readFileSync(file, "utf8");
  let next = html;
  next = normalizeLabels(next);
  next = normalizeUtilityBlocks(next);
  next = applyTargeted(next, rel);
  if (next !== html) {
    fs.writeFileSync(file, next);
    report.changed_files += 1;
  }
}

fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(path.join(root, "reports/p1-polish-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P1 polish applied: ${report.changed_files}/${report.checked_files} HTML files changed.`);
