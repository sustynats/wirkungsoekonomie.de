import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skipDirs = new Set([".git", "node_modules", "tmp", ".cache", "dist", "build", "_site"]);
const report = {
  generated_at: new Date().toISOString(),
  changed_files: 0,
  updates_search: false,
  homepage_intro_rebuilt: false,
  fixed_broken_links: 0,
  tool_pages_noindexed: [],
  tool_pages_language_hardened: [],
  search_entries_removed: 0,
  search_tags_cleaned: 0,
  search_routes_canonicalized: 0,
  search_duplicates_removed: 0,
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".well-known") continue;
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function writeIfChanged(file, before, after) {
  if (before === after) return false;
  fs.writeFileSync(file, after);
  report.changed_files += 1;
  return true;
}

function ensureNoindex(html) {
  if (/<meta\s+name=["']robots["']/i.test(html)) {
    return html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,follow">');
  }
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/(<link\s+rel=["']canonical["'][^>]*>)/i, '$1\n    <meta name="robots" content="noindex,follow">');
  }
  return html.replace("</head>", '    <meta name="robots" content="noindex,follow">\n  </head>');
}

function routeFor(file) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"/index.html".length)}/`;
  if (rel.endsWith(".html")) return `/${rel}`;
  return `/${rel}`;
}

function htmlFileForRoute(route) {
  const cleanRoute = String(route || "").replace(/#.*$/, "").replace(/\/index\.html$/, "/");
  if (!cleanRoute.startsWith("/")) return null;
  if (cleanRoute.endsWith("/")) return path.join(root, cleanRoute.slice(1), "index.html");
  return path.join(root, cleanRoute.slice(1));
}

function canonicalSearchRoute(route) {
  const cleanRoute = String(route || "").replace(/#.*$/, "").replace(/\/index\.html$/, "/");
  const liveRoute = cleanRoute.replace(/^\/wirkungsradar\/detail\//, "/wirkungsradar/live/");
  if (liveRoute !== cleanRoute && fs.existsSync(htmlFileForRoute(liveRoute))) return liveRoute;
  return cleanRoute;
}

function rebuildHomepageIntro() {
  const file = path.join(root, "index.html");
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  const replacement = `      <section class="section" id="in-5-minuten" aria-labelledby="in-5-minuten-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">In 5 Minuten verstehen</p>
            <h2 id="in-5-minuten-title">Der schnellste Einstieg in die Wirkungsökonomie.</h2>
            <p>Fünf Schritte reichen für die Grundidee: Was sehen wir heute nicht, was bedeutet Wirkung, wie wird sie bewertet, wie wird sie zurückgekoppelt und wo kannst du weitergehen?</p>
          </div>
          <div class="card-grid step-path" aria-label="5-Minuten-Pfad">
            <article class="card">
              <p class="card-kicker">01 · Problem</p>
              <h3 class="card-title">Wir messen oft das Falsche.</h3>
              <p class="card-text">Umsatz, Wachstum, Klicks oder Stimmen können steigen, obwohl Vertrauen sinkt, Natur zerstört wird oder demokratische Räume enger werden. Das nennt die Wirkungsökonomie Wirkungsblindheit.</p>
              <a class="text-link" href="verstehen/">Grundidee verstehen</a>
            </article>
            <article class="card">
              <p class="card-kicker">02 · Maßstab</p>
              <h3 class="card-title">Wirkung ist Zustandsveränderung.</h3>
              <p class="card-text">Entscheidend ist nicht, ob etwas gut gemeint ist, sondern was sich tatsächlich verändert: für Menschen, für planetare Lebensgrundlagen und für demokratische Handlungsfähigkeit.</p>
              <a class="text-link" href="begriffe/wirkung/">Begriff öffnen</a>
            </article>
            <article class="card">
              <p class="card-kicker">03 · Bewertung</p>
              <h3 class="card-title">Netto-Wirkung statt Einzelvorteil.</h3>
              <p class="card-text">Ein Produkt, Gesetz oder Geschäftsmodell kann an einer Stelle nützen und an anderer Stelle schaden. Bewertet wird deshalb die Netto-Wirkung im Referenzrahmen Mensch, Planet und Demokratie.</p>
              <a class="text-link" href="modell.html">Modell ansehen</a>
            </article>
            <article class="card">
              <p class="card-kicker">04 · Rückkopplung</p>
              <h3 class="card-title">Bewertung muss Entscheidungen verändern.</h3>
              <p class="card-text">Wirkung bleibt folgenlos, wenn sie nur berichtet wird. Sie muss in Preise, Investitionen, Beschaffung, Förderung, Regeln und Lernschleifen zurückwirken.</p>
              <a class="text-link" href="wirkungssteuerung/">Wirkungssteuerung öffnen</a>
            </article>
            <article class="card">
              <p class="card-kicker">05 · Anwendung</p>
              <h3 class="card-title">Erst ausprobieren, dann vertiefen.</h3>
              <p class="card-text">Demos, Wirkungsfelder, Debattenkarten und die Bibliothek zeigen, wie aus der Grundidee konkrete Arbeit wird.</p>
              <a class="text-link" href="erleben.html">Demos ansehen</a>
            </article>
          </div>
        </div>
      </section>`;

  after = after.replace(/\s*<section class="section" id="in-5-minuten"[\s\S]*?<section class="section next-step-block"/, `\n${replacement}\n\n      <section class="section next-step-block"`);
  after = after.replace(
    /<blockquote>„Gewinn ist nicht das Problem\. Das Problem ist, dass sich schädliche Wirkung noch rechnet - und positive Netto-Wirkung oft nicht\.“<\/blockquote>/,
    '<p class="lead-statement"><strong>Gewinn ist nicht das Problem.</strong> Das Problem ist, dass sich schädliche Wirkung noch rechnet - und positive Netto-Wirkung oft nicht.</p>',
  );
  if (writeIfChanged(file, before, after)) report.homepage_intro_rebuilt = true;
}

function ensureUpdatesSearch() {
  const file = path.join(root, "updates/index.html");
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  if (!after.includes("data-updates-search")) {
    const block = `      <section class="section section-compact" id="updates-suche" aria-labelledby="updates-suche-title">
        <div class="search-panel">
          <p class="hero-kicker">Updates suchen</p>
          <h2 id="updates-suche-title">Neue Inhalte filtern.</h2>
          <label class="document-search-field" for="updates-search-input">Suche
            <input id="updates-search-input" type="search" data-updates-search placeholder="Titel, Bereich oder Thema">
          </label>
          <div class="filter-row" data-updates-filter aria-label="Update-Filter">
            <button class="filter-chip is-active" type="button" data-updates-type="all">Alle</button>
            <button class="filter-chip" type="button" data-updates-type="journal">Journal</button>
            <button class="filter-chip" type="button" data-updates-type="wirkungsraum">Öffentlicher Wirkungsraum</button>
            <button class="filter-chip" type="button" data-updates-type="bibliothek">Bibliothek</button>
            <button class="filter-chip" type="button" data-updates-type="changelog">Changelog</button>
          </div>
        </div>
      </section>`;
    after = after.replace(/(\s*<section class="section" id="journal")/, `\n${block}\n$1`);
    report.updates_search = true;
  }
  if (!after.includes("data-updates-controller")) {
    const script = `    <script data-updates-controller>
      (() => {
        const input = document.querySelector("[data-updates-search]");
        if (!input) return;
        const buttons = Array.from(document.querySelectorAll("[data-updates-type]"));
        const cards = Array.from(document.querySelectorAll("main article.card"));
        let activeType = "all";
        const typeFor = (card) => {
          const id = card.closest("section")?.id || "";
          if (id.includes("journal")) return "journal";
          if (id.includes("bereiche")) return "wirkungsraum";
          if (id.includes("kanal")) return "bibliothek";
          if (id.includes("changelog")) return "changelog";
          return "all";
        };
        const apply = () => {
          const query = input.value.trim().toLocaleLowerCase("de");
          cards.forEach((card) => {
            const text = card.textContent.toLocaleLowerCase("de");
            const matchesQuery = !query || text.includes(query);
            const matchesType = activeType === "all" || typeFor(card) === activeType;
            card.hidden = !(matchesQuery && matchesType);
          });
        };
        buttons.forEach((button) => {
          button.addEventListener("click", () => {
            activeType = button.dataset.updatesType || "all";
            buttons.forEach((item) => item.classList.toggle("is-active", item === button));
            apply();
          });
        });
        input.addEventListener("input", apply);
      })();
    </script>`;
    after = after.replace("</body>", `${script}\n  </body>`);
  }
  writeIfChanged(file, before, after);
}

function hardenToolPages() {
  const toolRoot = path.join(root, "werkzeuge");
  if (!fs.existsSync(toolRoot)) return;
  for (const file of walk(toolRoot)) {
    const before = fs.readFileSync(file, "utf8");
    const wasThin =
      before.includes("Diese Seite ist als Platzhalter vorbereitet") ||
      before.includes("Noch nicht verknüpft") ||
      before.includes("Coming soon") ||
      /<title>[^<]+\|\s*In Vorbereitung<\/title>/i.test(before);
    let after = before;
    after = after.replace(
      /Diese Seite ist als Platzhalter vorbereitet, damit die Methoden & Werkzeuge vollständig bleibt\. Sie behauptet noch keine fertige Methodik und ersetzt keine fachliche, rechtliche, steuerliche, finanzielle oder amtliche Prüfung\./g,
      "Diese Orientierungsseite beschreibt den aktuellen Arbeitsstand des Werkzeugs. Sie zeigt, welche Nutzerfrage, welche Eingaben und welche Wirkungslogik geprüft werden sollen; sie ersetzt keine fachliche, rechtliche, steuerliche, finanzielle oder amtliche Prüfung.",
    );
    after = after.replace(/Platzhalter/g, "Arbeitsstand");
    after = after.replace(/Coming soon/g, "In Vorbereitung");
    after = after.replace(/Noch nicht verknüpft/g, "Verknüpfung in Vorbereitung");
    if (wasThin) {
      after = ensureNoindex(after);
      const route = routeFor(file);
      if (!report.tool_pages_noindexed.includes(route)) report.tool_pages_noindexed.push(route);
    }
    if (after !== before) {
      report.tool_pages_language_hardened.push(routeFor(file));
      writeIfChanged(file, before, after);
    }
  }
}

function fixBrokenPublicDocumentLinks() {
  const file = path.join(root, "begriffe/sexarbeit/index.html");
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(
    /href="\/Sexarbeit als soziale Infrastruktur\.docx; Führender Begriffsleitfaden; Die neue Ordnung des Wohlstands; OHCHR; UNAIDS; BMBFSFJ \/ Prostituiertenschutzgesetz"/g,
    'href="https://www.bmfsfj.de/bmfsfj/themen/gleichstellung/frauen-vor-gewalt-schuetzen/prostituiertenschutzgesetz"',
  );
  if (after !== before) report.fixed_broken_links += 1;
  writeIfChanged(file, before, after);
}

function cleanupSearchIndex() {
  const indexFile = path.join(root, "assets/search/search-index.json");
  if (!fs.existsSync(indexFile)) return;
  const noindexRoutes = new Set();
  for (const file of walk(root)) {
    const html = fs.readFileSync(file, "utf8");
    if (/<meta\s+name=["']robots["'][^>]*noindex/i.test(html)) noindexRoutes.add(routeFor(file));
  }
  const beforeText = fs.readFileSync(indexFile, "utf8");
  const before = JSON.parse(beforeText);
  const after = [];
  const seen = new Set();
  for (const entry of before) {
    const rawRoute = String(entry.url || "").replace(/#.*$/, "").replace(/\/index\.html$/, "/");
    const route = canonicalSearchRoute(rawRoute);
    if (noindexRoutes.has(route)) {
      report.search_entries_removed += 1;
      continue;
    }
    const canonicalEntry = route !== rawRoute ? { ...entry, url: route } : { ...entry };
    if (route !== rawRoute) report.search_routes_canonicalized += 1;
    if (Array.isArray(entry.tags)) {
      const tags = entry.tags.filter((tag) => !/^detail$/i.test(String(tag || "").trim()));
      if (tags.length !== entry.tags.length) {
        report.search_tags_cleaned += entry.tags.length - tags.length;
        canonicalEntry.tags = tags;
      }
    }
    const key = `${route}::${String(canonicalEntry.title || "").trim().toLocaleLowerCase("de")}`;
    if (seen.has(key)) {
      report.search_duplicates_removed += 1;
      continue;
    }
    seen.add(key);
    after.push(canonicalEntry);
  }
  const afterText = `${JSON.stringify(after, null, 2)}\n`;
  if (afterText !== beforeText) fs.writeFileSync(indexFile, afterText);
}

rebuildHomepageIntro();
ensureUpdatesSearch();
hardenToolPages();
fixBrokenPublicDocumentLinks();
cleanupSearchIndex();

fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(path.join(root, "reports/final-2-0-consolidation-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `2.0 final consolidation: ${report.changed_files} files changed, ${report.tool_pages_noindexed.length} tool pages noindexed, ${report.search_entries_removed} search entries removed.`,
);
