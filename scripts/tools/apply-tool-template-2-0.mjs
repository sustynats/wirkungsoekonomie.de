import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const markerStart = "<!-- tool-template-2-0:start -->";
const markerEnd = "<!-- tool-template-2-0:end -->";

const targetRoots = ["werkzeuge", "erleben", "anwendungen"];
const skipFiles = new Set(["anwendungen/index.html"]);

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
  const text = `${rel} ${html}`.toLowerCase();
  if (text.includes("rechner")) return "Rechner";
  if (text.includes("scanner")) return "Scanner";
  if (text.includes("dashboard")) return "Dashboard";
  if (text.includes("register")) return "Register";
  if (text.includes("check")) return "Check";
  if (rel.startsWith("erleben/")) return "Demo";
  if (text.includes("gesetz") || text.includes("rechtsmodell")) return "Rechtsmodell";
  return "Methode";
}

function statusFor(kind, rel, html) {
  const text = `${rel} ${html}`.toLowerCase();
  if (text.includes("in vorbereitung")) return "in Vorbereitung";
  if (text.includes("arbeitsfassung") || text.includes("modellfassung")) return "Modellfassung";
  if (kind === "Demo" || kind === "Rechner" || kind === "Scanner" || kind === "Check") return "Demo / Modell";
  return "Methodik / Referenz";
}

function userQuestion(kind, title) {
  if (kind === "Rechner") return `Welche Wirkungslogik macht der ${title} als Modellrechnung sichtbar?`;
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
          <h2 id="tool-orientierung-title">Was dieses Werkzeug leistet.</h2>
          <p>${esc(description)}</p>
        </div>
        <div class="card-grid three tool-template-grid">
          <article class="card"><p class="card-kicker">Nutzerfrage</p><h3 class="card-title">Womit komme ich hierher?</h3><p class="card-text">${esc(userQuestion(kind, title))}</p></article>
          <article class="card"><p class="card-kicker">Was ist das?</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">Ein ${esc(kind.toLowerCase())} der Wirkungsökonomie: modellhaft, erklärend und als Orientierung gedacht - nicht als amtliche Bewertung.</p></article>
          <article class="card"><p class="card-kicker">Heutige Blindstelle</p><h3 class="card-title">Was bleibt sonst unsichtbar?</h3><p class="card-text">Oft werden Kosten, Output, Reichweite oder Einzelwerte betrachtet. Wirkpfad, Nebenfolgen, Datenqualität und demokratische Rückkopplung bleiben dann zu schwach sichtbar.</p></article>
          <article class="card"><p class="card-kicker">Was gibst du ein?</p><h3 class="card-title">Input</h3><p class="card-text">${esc(inputs(kind))}</p></article>
          <article class="card"><p class="card-kicker">Was bekommst du heraus?</p><h3 class="card-title">Output</h3><p class="card-text">${esc(outputs(kind))}</p></article>
          <article class="card"><p class="card-kicker">Was verändert sich dadurch?</p><h3 class="card-title">Entscheidungslogik</h3><p class="card-text">${esc(change(kind))}</p></article>
          <article class="card"><p class="card-kicker">Wirkpfad</p><h3 class="card-title">Auslöser → Wirkungspotenzial → Bewertung</h3><p class="card-text">Die Seite soll sichtbar machen, wie aus einem Auslöser eine Zustandsveränderung, eine Bewertung und eine mögliche Wirkungslenkung entsteht.</p></article>
          <article class="card"><p class="card-kicker">Folgencheck</p><h3 class="card-title">Direkt, danach, systemisch</h3><p class="card-text">Geprüft wird, welche direkten Folgen, Anschlussfolgen und systemischen Folgen für Mensch, Planet und Demokratie relevant werden.</p></article>
          <article class="card"><p class="card-kicker">Datenqualität &amp; Status</p><h3 class="card-title">Modellgrenze offenlegen</h3><p class="card-text">Demo-Werte, Annahmen, Quellenstand und Unsicherheiten müssen sichtbar bleiben. Niedrige Datenqualität erzeugt Prüfbedarf, keine Scheinsicherheit.</p></article>
          <article class="card"><p class="card-kicker">Schutzlinien</p><h3 class="card-title">Nicht amtlich. Keine Personenbewertung.</h3><p class="card-text">Keine Rechts-, Steuer-, Finanz-, Förder-, Versicherungs-, Medizin- oder Sozialberatung. Keine automatische Entscheidung und kein Social-Credit-Mechanismus.</p></article>
          <article class="card"><p class="card-kicker">Quellen &amp; Glossar</p><h3 class="card-title">Begriffe nachschlagen</h3><p class="card-text">Zentrale Begriffe und Quellen sind als Vertiefung zu lesen. Quellen belegen Fakten; Glossar erklärt die verwendete Wirkungslogik.</p></article>
          <article class="card"><p class="card-kicker">Nächster Schritt</p><h3 class="card-title">Vertiefen oder ausprobieren</h3><p class="card-text">Nutze das Ergebnis als Orientierung, öffne passende Methoden, Quellen oder Demos und prüfe vor realen Entscheidungen die Datenbasis.</p></article>
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

const files = targetRoots
  .flatMap((dir) => walk(path.join(root, dir)))
  .filter((file) => !skipFiles.has(path.relative(root, file).replaceAll(path.sep, "/")));

let changed = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes("<main")) continue;
  const next = replaceMarked(html, blockFor(file));
  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
  }
}

const report = {
  generated_at: new Date().toISOString(),
  checked_files: files.length,
  updated_files: changed,
};
fs.mkdirSync(path.join(root, "reports/2-0-traceability"), { recursive: true });
fs.writeFileSync(
  path.join(root, "reports/2-0-traceability/tool-template-2-0-application.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(`ToolTemplate2.0 applied: ${changed} files updated, ${files.length} checked.`);
