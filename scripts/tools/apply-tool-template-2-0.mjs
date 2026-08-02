import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const markerStart = "<!-- tool-template-2-0:start -->";
const markerEnd = "<!-- tool-template-2-0:end -->";

const targetRoots = ["werkzeuge", "erleben", "anwendungen"];
const skipFiles = new Set(["anwendungen/index.html"]);
const args = process.argv.slice(2);
const onlyArg = args.find((arg) => arg.startsWith("--only="));
const checkOnly = args.includes("--check");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (!entry.isFile()) return [];
    if (!/\.html$/.test(entry.name)) return [];
    return [full];
  });
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripTags(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decode(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&uuml;", "ü")
    .replaceAll("&ouml;", "ö")
    .replaceAll("&auml;", "ä")
    .replaceAll("&Uuml;", "Ü")
    .replaceAll("&Ouml;", "Ö")
    .replaceAll("&Auml;", "Ä")
    .replaceAll("&szlig;", "ß");
}

function meta(html, name) {
  const pattern = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`, "i");
  return decode(html.match(pattern)?.[1] || "");
}

function titleFrom(html, rel) {
  const h1 = decode(stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ""));
  if (h1) return h1;
  const title = decode(stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ""));
  return title.replace(/\s*\|\s*Wirkungsökonomie.*$/i, "") || path.basename(path.dirname(rel));
}

function descriptionFrom(html, title) {
  return meta(html, "description") || meta(html, "search_description") || `${title} macht eine Wirkungsfrage sichtbar und ordnet sie als modellhafte Entscheidungshilfe ein.`;
}

function pageKind(rel, html) {
  const route = path.dirname(rel);
  const title = (route + " " + titleFrom(html, rel)).toLowerCase();
  const text = (route + " " + html).toLowerCase();
  const kindIn = (value) => {
    if (value.includes("rechner")) return "Rechner";
    if (value.includes("scanner")) return "Scanner";
    if (value.includes("dashboard")) return "Dashboard";
    if (value.includes("register")) return "Register";
    if (value.includes("check")) return "Check";
    if (value.includes("radar")) return "Radar";
    if (value.includes("monitor")) return "Monitor";
    if (value.includes("matrix")) return "Matrix";
    if (value.includes("index")) return "Index";
    if (value.includes("score")) return "Score";
    if (value.includes("profil")) return "Profil";
    return "";
  };
  const classified = kindIn(title) || kindIn(text);
  if (classified) return classified;
  if (rel.startsWith("erleben/")) return "Demo";
  if (title.includes("gesetz") || title.includes("rechtsmodell")) return "Rechtsmodell";
  return "Methode";
}

function kindWithArticle(kind) {
  const labels = {
    Rechner: "Ein Rechner",
    Scanner: "Ein Scanner",
    Dashboard: "Ein Dashboard",
    Register: "Ein Register",
    Check: "Ein Check",
    Radar: "Ein Radar",
    Monitor: "Ein Monitor",
    Matrix: "Eine Matrix",
    Index: "Ein Index",
    Score: "Ein Score",
    Profil: "Ein Profil",
    Demo: "Eine Demo",
    Rechtsmodell: "Ein Rechtsmodell",
    Methode: "Eine Methode",
  };
  return labels[kind] || `Ein ${kind}`;
}

function statusFor(kind, rel, html) {
  const text = `${rel} ${html}`.toLowerCase();
  if (text.includes("arbeitsfassung") || text.includes("modellfassung")) return "Modellfassung";
  if (["Demo", "Rechner", "Scanner", "Check", "Radar", "Monitor", "Matrix", "Index", "Score", "Profil"].includes(kind)) return "Modellhafte Einordnung";
  return "Methodik / Referenz";
}

function userQuestion(kind, title) {
  if (kind === "Rechner") return "Welche Berechnung oder Modellannahme soll hier nachvollziehbar geprüft werden?";
  if (kind === "Scanner") return `Welche Hinweise, Datenlücken und Wirkungspotenziale werden sichtbar?`;
  if (kind === "Check") return `Welche Frage sollte vor einer Entscheidung geprüft werden?`;
  if (kind === "Dashboard") return `Welche Werkzeuge passen zu meiner Wirkungsfrage?`;
  if (kind === "Register") return `Welche Begriffe, IDs oder Nachweise helfen bei der Einordnung?`;
  if (kind === "Rechtsmodell") return `Welche rechtliche oder institutionelle Wirkungslogik wird modellhaft beschrieben?`;
  if (kind === "Demo") return `Was kann ich hier ausprobieren, ohne daraus ein amtliches Urteil zu machen?`;
  return `Welche Methode hilft, diese Wirkungsfrage sauberer zu verstehen?`;
}

function inputs(kind) {
  if (kind === "Rechner") return "Beispielwerte, Annahmen, Regler oder Eingabefelder. Reale Daten brauchen Quellen, Zeitstand und Datenqualitätsprüfung.";
  if (kind === "Scanner") return "Text, URL-Hinweis, Produkt-, Organisations- oder Maßnahmenbeschreibung. Eingaben bleiben Demo-Material, solange keine Prüfung erfolgt.";
  if (kind === "Dashboard") return "Suchbegriff, Filter, Zielgruppe, Status, Tooltyp oder Wirkungsfeld.";
  if (kind === "Register") return "Begriff, ID, Kategorie, Quelle, Status oder Verweis.";
  return "Fragestellung, Kontext, Beispiel, vorhandene Daten und die Grenze dessen, was bereits belegt ist.";
}

function outputs(kind) {
  if (kind === "Rechner") return "Modellwerte, Richtung, Engpass, Sensitivität oder Szenario. Keine automatische Entscheidung und keine Beratung.";
  if (kind === "Scanner") return "Hinweise, Gegenfragen, Risikospuren, Datenlücken und nächste Prüfschritte.";
  if (kind === "Dashboard") return "Passende Werkzeuge, Demos, Methoden und Vertiefungen.";
  if (kind === "Register") return "Einordnung, Verweis, Status und Anschluss an Glossar, Quellen oder Methodik.";
  return "Orientierung, Wirkpfad, Zielkonflikte, Schutzlinien und passende Vertiefung.";
}

function change(kind) {
  if (kind === "Rechner") return "Zahlen werden nicht als Wahrheit behandelt, sondern mit Bedeutung, Datenqualität, Grenzen und Rückkopplung verbunden.";
  if (kind === "Scanner") return "Eine unklare Aussage wird zu einer prüfbaren Wirkungsfrage mit Quellen-, Kontext- und Folgenprüfung.";
  if (kind === "Dashboard") return "Nutzer:innen finden schneller den passenden Zugang und verwechseln Demos, Methoden und Register nicht.";
  return "Die Entscheidung wird nicht nur nach Aufwand, Preis oder Output betrachtet, sondern nach Wirkung auf Mensch, Planet und Demokratie.";
}

function blockFor(file) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  const html = fs.readFileSync(file, "utf8");
  const title = titleFrom(html, rel);
  const description = descriptionFrom(html, title);
  const kind = pageKind(rel, html);
  const status = statusFor(kind, rel, html);
  return `${markerStart}
      <section class="section tool-template-2-0" id="tool-orientierung" aria-labelledby="tool-orientierung-title">
        <div class="section-header">
          <p class="hero-kicker">Tool-Orientierung · ${esc(kind)} · ${esc(status)}</p>
          <h2 id="tool-orientierung-title">Wofür dieses Werkzeug da ist.</h2>
          <p>${esc(description)}</p>
        </div>
        <div class="card-grid two tool-template-grid">
          <article class="card"><p class="card-kicker">Nutzerfrage</p><h3 class="card-title">Womit komme ich hierher?</h3><p class="card-text">${esc(userQuestion(kind, title))}</p></article>
          <article class="card"><p class="card-kicker">Werkzeuglogik</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(kindWithArticle(kind))} macht eine Wirkungsfrage nachvollziehbarer. Die Seite zeigt Annahmen, Datenlage, Grenzen und mögliche nächste Prüfschritte; sie ist keine amtliche Bewertung.</p></article>
          <article class="card"><p class="card-kicker">Eingabe</p><h3 class="card-title">Was wird gebraucht?</h3><p class="card-text">${esc(inputs(kind))}</p></article>
          <article class="card"><p class="card-kicker">Ergebnis</p><h3 class="card-title">Was kommt heraus?</h3><p class="card-text">${esc(outputs(kind))}</p></article>
          <article class="card"><p class="card-kicker">Wirkpfad</p><h3 class="card-title">Was verändert sich dadurch?</h3><p class="card-text">${esc(change(kind))}</p></article>
          <article class="card"><p class="card-kicker">Grenzen</p><h3 class="card-title">Modell bleibt Modell.</h3><p class="card-text">Demo-Werte, Annahmen, Quellenstand und Unsicherheiten müssen sichtbar bleiben. Niedrige Datenqualität erzeugt Prüfbedarf, keine Scheinsicherheit.</p></article>
        </div>
      </section>
${markerEnd}`;
}

function replaceMarked(html, block) {
  const start = html.indexOf(markerStart);
  const end = html.indexOf(markerEnd);
  if (start >= 0 && end > start) {
    return `${html.slice(0, start)}${block}${html.slice(end + markerEnd.length)}`;
  }
  const heroEnd = html.indexOf("</section>", html.search(/<section[^>]+class=["'][^"']*hero/i));
  if (heroEnd >= 0) {
    const insertAt = heroEnd + "</section>".length;
    return `${html.slice(0, insertAt)}\n${block}${html.slice(insertAt)}`;
  }
  return html.replace("</main>", `${block}\n    </main>`);
}

function selectedFiles() {
  if (!onlyArg) {
    return targetRoots
      .flatMap((dir) => walk(path.join(root, dir)))
      .filter((file) => !skipFiles.has(path.relative(root, file).replaceAll(path.sep, "/")));
  }

  return onlyArg
    .slice("--only=".length)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((relativePath) => {
      const file = path.resolve(root, relativePath);
      const rel = path.relative(root, file).replaceAll(path.sep, "/");
      const belongsToToolTemplate = targetRoots.some((dir) => rel.startsWith(`${dir}/`));
      if (!belongsToToolTemplate || rel.startsWith("../") || !rel.endsWith(".html")) {
        throw new Error(`Ungültiges Ziel für die Toolvorlage: ${relativePath}`);
      }
      if (!fs.existsSync(file)) throw new Error(`Zieldatei nicht gefunden: ${relativePath}`);
      return file;
    });
}

const files = selectedFiles();

let changed = 0;
const stale = [];
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes("<main")) continue;
  const next = replaceMarked(html, blockFor(file));
  if (next !== html) {
    changed += 1;
    if (checkOnly) stale.push(path.relative(root, file).replaceAll(path.sep, "/"));
    else fs.writeFileSync(file, next);
  }
}

if (checkOnly && stale.length) {
  throw new Error(`ToolTemplate2.0 ist nicht synchron: ${stale.join(", ")}`);
}

const report = {
  generated_at: new Date().toISOString(),
  checked_files: files.length,
  updated_files: changed,
};
if (!checkOnly) {
  fs.mkdirSync(path.join(root, "reports/2-0-traceability"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "reports/2-0-traceability/tool-template-2-0-application.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
}

console.log(`ToolTemplate2.0 ${checkOnly ? "checked" : "applied"}: ${changed} ${checkOnly ? "differences" : "files updated"}, ${files.length} checked.`);
