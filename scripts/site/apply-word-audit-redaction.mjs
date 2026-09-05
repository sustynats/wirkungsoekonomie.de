import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIO_FALLBACK = "Dein Browser kann diese Audiodatei nicht direkt abspielen.";

function filePath(rel) {
  return path.join(ROOT, rel);
}

function exists(rel) {
  return fs.existsSync(filePath(rel));
}

function read(rel) {
  return fs.readFileSync(filePath(rel), "utf8");
}

function write(rel, html) {
  fs.writeFileSync(filePath(rel), html);
}

function writeIfChanged(rel, next) {
  const before = read(rel);
  if (before === next) return false;
  write(rel, next);
  return true;
}

function walk(entry, files = []) {
  const full = filePath(entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) {
      if (child.name === ".git" || child.name === "node_modules") continue;
      walk(path.join(entry, child.name), files);
    }
  } else if (entry.endsWith(".html")) {
    files.push(entry);
  }
  return files;
}

function replaceMain(html, inner) {
  return html.replace(/<main([^>]*)>[\s\S]*?<\/main>/i, `<main$1>\n${inner.trim()}\n    </main>`);
}

function insertAfterHero(html, marker, block) {
  if (html.includes(marker)) return html;
  const heroStart = html.search(/<section\b[^>]*class=["'][^"']*hero/i);
  if (heroStart < 0) return html;
  const heroEnd = html.indexOf("</section>", heroStart);
  if (heroEnd < 0) return html;
  const insertAt = heroEnd + "</section>".length;
  return `${html.slice(0, insertAt)}\n${marker}\n${block.trim()}\n<!-- /word-audit-2-0 -->${html.slice(insertAt)}`;
}

function insertBeforeMainEnd(html, marker, block) {
  if (html.includes(marker)) return html;
  return html.replace(/<\/main>/i, `${marker}\n${block.trim()}\n<!-- /word-audit-2-0 -->\n    </main>`);
}

function mitmachenMain(base = "") {
  const p = base;
  return `
      <section class="hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Mitmachen</p>
            <h1 class="hero-title">Wirkungsökonomie weiterdenken.</h1>
            <p class="hero-subtitle">Die Wirkungsökonomie ist ein offenes Modell. Sie soll gelesen, geprüft, diskutiert, kritisiert und praktisch erprobt werden.</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="${p}akademie.html">Akademie öffnen</a>
              <a class="btn btn-secondary" href="${p}pilot-starten/">Pilotpfade ansehen</a>
              <a class="btn btn-secondary" href="mailto:impact@wirkungsoekonomie.org">Kontakt aufnehmen</a>
            </div>
          </div>
          <aside class="card">
            <p class="card-kicker">Leitgedanke</p>
            <h2 class="card-title">Eine neue Ordnung entsteht nicht allein.</h2>
            <p class="card-text">Wirkung wird gesellschaftlich wirksam, wenn Menschen sie verstehen, anwenden, prüfen und weitertragen.</p>
          </aside>
        </div>
      </section>

      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Einstiege</p>
          <h2>Wie du konkret einsteigen kannst</h2>
          <p>Mitmachen heißt hier nicht Zustimmung. Mitmachen heißt: Fragen stellen, Annahmen prüfen, Quellen verbessern, Werkzeuge testen und Pilotierungen vorbereiten.</p>
        </div>
        <div class="card-grid two">
          <article class="card">
            <p class="card-kicker">Lernen</p>
            <h3 class="card-title">Akademie starten</h3>
            <p class="card-text">Erschließe die Wirkungsökonomie Schritt für Schritt: Problem, Maßstab, Daten, Bewertung, Rückkopplung und Anwendung.</p>
            <a class="text-link" href="${p}akademie.html">Zur Akademie</a>
          </article>
          <article class="card">
            <p class="card-kicker">Prüfen</p>
            <h3 class="card-title">Quellen und Begriffe verbessern</h3>
            <p class="card-text">Hinweise auf fehlende Quellen, unklare Begriffe, Datenlücken oder missverständliche Formulierungen helfen, das Modell belastbarer zu machen.</p>
            <a class="text-link" href="${p}bibliothek/">Bibliothek öffnen</a>
          </article>
          <article class="card">
            <p class="card-kicker">Anwenden</p>
            <h3 class="card-title">Ein Wirkungsbeispiel entwickeln</h3>
            <p class="card-text">Übertrage die Wirkungslogik auf ein Produkt, eine Organisation, ein politisches Feld, ein Medium oder eine konkrete Entscheidung.</p>
            <a class="text-link" href="${p}werkzeuge/">Werkzeuge ansehen</a>
          </article>
          <article class="card">
            <p class="card-kicker">Pilotieren</p>
            <h3 class="card-title">Pilotpfad vorbereiten</h3>
            <p class="card-text">Wähle einen konkreten Anwendungsraum und prüfe modellhaft, welche Daten, Methoden und Schutzlinien nötig sind.</p>
            <a class="text-link" href="${p}pilot-starten/">Pilotpfade ansehen</a>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="community-cta">
          <p class="hero-kicker">Austausch</p>
          <h2>Diskussion, Kritik und Kooperation sind Teil des Modells.</h2>
          <p>Die Wirkungsökonomie soll nicht als fertige Behauptung im Raum stehen. Sie braucht Gegenfragen, Anwendungserfahrungen, methodische Kritik und Partner:innen, die Wirkung praktisch prüfen wollen.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="https://discord.gg/AtJpB3ErPZ" target="_blank" rel="noopener noreferrer">Discord öffnen</a>
            <a class="btn btn-secondary" href="mailto:impact@wirkungsoekonomie.org">E-Mail schreiben</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="download-card">
          <div>
            <p class="card-kicker">Kontakt</p>
            <h2 class="card-title">Kontakt</h2>
            <p class="card-text">Für Rückfragen, Hinweise, Kooperationen oder Vortragsanfragen kann die Kontaktadresse genutzt werden.</p>
            <p class="card-text"><a class="text-link" href="mailto:impact@wirkungsoekonomie.org">impact@wirkungsoekonomie.org</a></p>
          </div>
          <a class="btn btn-primary" href="mailto:impact@wirkungsoekonomie.org">E-Mail schreiben</a>
        </div>
      </section>`;
}

function publicImpactRoomGuardrail() {
  return `
  <section class="section section-soft" id="schutzlinie">
    <div>
      <article class="card important-card">
        <p class="card-kicker">Schutzlinie</p>
        <h2>Aussagen analysieren, nicht Menschen etikettieren.</h2>
        <p>Der Öffentliche Wirkungsraum bewertet keine Personen, Gruppen oder private Meinungen. Er hilft, öffentliche Aussagen, Narrative und Resonanzräume als Wirkungsfragen zu prüfen.</p>
        <p>Eine Wirkungsanalyse fragt: Welche Aufmerksamkeit entsteht? Welche Emotionen werden aktiviert? Welche Deutung setzt sich fest? Welche Folgen kann das für Vertrauen, Demokratie und Handlungsfähigkeit haben? Sie unterstellt keine Absicht und ersetzt keinen Faktencheck.</p>
      </article>
    </div>
  </section>`;
}

function woekKiTransparency() {
  return `
      <section class="section section-soft" id="quellenbindung">
        <div class="section-header">
          <p class="hero-kicker">Transparenz</p>
          <h2>Die WÖk-KI antwortet quellengebunden.</h2>
          <p>Die Beta nutzt den öffentlichen Wissensbestand der Website, Bibliothek, Glossare, Dossiers und Journaltexte als Kontext. Wenn keine passende Quelle gefunden wird, soll die Antwort das offen sagen, statt Wissen vorzutäuschen.</p>
        </div>
        <aside class="protection-notice" role="note" aria-label="Transparenz der WÖk-KI">
          <p class="card-kicker">Grenzen</p>
          <h3 class="card-title">Quellenkontext ist kein Training.</h3>
          <ul class="protection-notice-list">
            <li>Neue Website-Inhalte werden über Suche und Quellenindex verfügbar gemacht.</li>
            <li>Die KI wird dadurch nicht dauerhaft trainiert, sondern erhält abrufbaren Kontext.</li>
            <li>Antworten bleiben Beta-Ausgaben und müssen bei wichtigen Entscheidungen fachlich geprüft werden.</li>
          </ul>
        </aside>
      </section>`;
}

function verstehenSequence() {
  return `
      <section class="section section-soft" id="wirkungslogik">
        <div class="section-header">
          <p class="hero-kicker">Mini-Beispiel</p>
          <h2>Der Apfel ist nicht nur ein Apfel.</h2>
          <p>Ein Preis zeigt, was du bezahlst. Eine Wirkungsfrage zeigt, was mitbezahlt wird: Wasser, Boden, Transport, Arbeit, Gesundheit, regionale Versorgung und Vertrauen.</p>
        </div>
        <div class="card-grid two">
          <article class="card">
            <p class="card-kicker">Alte Lesart</p>
            <h3 class="card-title">Was kostet das?</h3>
            <p class="card-text">Der Markt sieht vor allem Preis, Menge und Nachfrage. Folgen für Mensch, Planet und Demokratie bleiben oft außerhalb der Entscheidung.</p>
          </article>
          <article class="card">
            <p class="card-kicker">Wirkungslesart</p>
            <h3 class="card-title">Was bewirkt das?</h3>
            <p class="card-text">Die Wirkungsökonomie prüft den Wirkpfad: Welche Zustände verändern sich, welche Schäden entstehen, welche positive Netto-Wirkung wird möglich?</p>
          </article>
        </div>
      </section>`;
}

function learningGuardrail() {
  return `
      <section class="section section-soft" id="lernlogik">
        <div class="section-header">
          <p class="hero-kicker">Lernlogik</p>
          <h2>Lernen heißt: Wirkung prüfbar machen.</h2>
          <p>Die Lernbereiche verbinden Grundlagen, Begriffe, Beispiele, Werkzeuge und persönliche Merkliste. Ziel ist nicht Auswendiglernen, sondern die Fähigkeit, Wirkpfade, Datenqualität, Zielkonflikte und Schutzlinien sauber zu unterscheiden.</p>
        </div>
      </section>`;
}

function bibliographyAccessGuide() {
  return `
      <section class="section section-soft" id="start-hier">
        <div class="section-header">
          <p class="hero-kicker">Start hier</p>
          <h2>Erst Orientierung, dann Vollregister.</h2>
          <p>Die Bibliothek unterscheidet zwischen Einstieg, führenden Referenzen, Arbeits- und Archivmaterial sowie dem vollständigen Register. So bleibt sichtbar, ob ein Text eine Einführung, ein Dossier, ein Konzeptpapier, ein Glossarbegriff, eine Quelle oder ein Arbeitsstand ist.</p>
        </div>
        <div class="document-chip-row">
          <a class="chip" href="#journal">Aktuelle Einordnungen</a>
          <a class="chip" href="#anschluss-finden">Anschluss finden</a>
          <a class="chip" href="#fuehrende-referenzen">Führende Referenzen</a>
          <a class="chip" href="#vollregister">Vollregister</a>
        </div>
      </section>`;
}

function updateMetaDescription(html, content) {
  return html
    .replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${content}">`)
    .replace(/<meta name="search_description" content="[^"]*">/i, `<meta name="search_description" content="${content}">`);
}

function normalizeInternalPublicationLanguage(html) {
  return html
    .replace(
      /Jedes Portal erhält: Portalübersicht, Konzeptpapier, Gesamtdossier, Detailkonzepte zu allen Unterbereichen, Einzeldossiers zu allen Unterbereichen, Online-HTML\/Volltext, Download\/Export, Tool-Spezifikation, Codex-Anweisung und politische\./g,
      "Jedes Portal bündelt Übersicht, Konzeptpapier, Dossier, Detailtexte, Onlinefassung, Downloads, methodische Einordnung und politische Anschlussfragen.",
    )
    .replace(/Tool-Spezifikation/g, "Methodenbeschreibung")
    .replace(/Codex-Anweisung/g, "redaktionelle Arbeitsnotiz")
    .replace(/CodeX-Anweisung/g, "redaktionelle Arbeitsnotiz")
    .replace(/[ \t]+\n/g, "\n");
}

let touched = 0;

for (const rel of walk(".")) {
  if (rel.includes("node_modules/") || rel.includes(".git/")) continue;
  const before = read(rel);
  const after = normalizeInternalPublicationLanguage(before.replaceAll(AUDIO_FALLBACK, ""));
  if (after !== before) {
    write(rel, after);
    touched += 1;
  }
}

if (exists("mitmachen.html")) {
  const before = read("mitmachen.html");
  const next = replaceMain(before, mitmachenMain(""));
  if (writeIfChanged("mitmachen.html", next)) touched += 1;
}

if (exists("mitmachen/index.html")) {
  const before = read("mitmachen/index.html");
  const next = replaceMain(before, mitmachenMain("../"));
  if (writeIfChanged("mitmachen/index.html", next)) touched += 1;
}

if (exists("oeffentlicher-wirkungsraum/index.html")) {
  const rel = "oeffentlicher-wirkungsraum/index.html";
  let html = read(rel);
  html = updateMetaDescription(
    html,
    "Der Öffentliche Wirkungsraum erklärt, wie Aussagen, Narrative, Aufmerksamkeit und Resonanz wirken - mit Schutzlinie gegen Personenbewertung und politischer Etikettierung.",
  );
  html = insertBeforeMainEnd(
    html,
    "<!-- word-audit-2-0:start:public-impact-room-guardrail -->",
    publicImpactRoomGuardrail(),
  );
  if (writeIfChanged(rel, html)) touched += 1;
}

if (exists("woek-ki/index.html")) {
  const rel = "woek-ki/index.html";
  let html = read(rel);
  html = insertAfterHero(html, "<!-- word-audit-2-0:start:woek-ki-transparency -->", woekKiTransparency());
  if (writeIfChanged(rel, html)) touched += 1;
}

if (exists("verstehen/index.html")) {
  const rel = "verstehen/index.html";
  let html = read(rel);
  // The newer SDG explainer already contains the apple example.
  if (!html.includes("sdg-resilience-verstehen")) html = insertAfterHero(html, "<!-- word-audit-2-0:start:verstehen-sequence -->", verstehenSequence());
  if (writeIfChanged(rel, html)) touched += 1;
}

if (exists("lernen/index.html")) {
  const rel = "lernen/index.html";
  let html = read(rel);
  html = insertAfterHero(html, "<!-- word-audit-2-0:start:learning-guardrail -->", learningGuardrail());
  if (writeIfChanged(rel, html)) touched += 1;
}

if (exists("bibliothek/index.html")) {
  const rel = "bibliothek/index.html";
  let html = read(rel);
  html = insertAfterHero(html, "<!-- word-audit-2-0:start:bibliothek-access-guide -->", bibliographyAccessGuide());
  html = html.replace(
    /<section class="section section-muted">\s*<div class="section-header">\s*<p class="hero-kicker">Führende Referenzen<\/p>/,
    '<section class="section section-muted" id="fuehrende-referenzen">\n        <div class="section-header">\n          <p class="hero-kicker">Führende Referenzen</p>',
  );
  html = html.replace(
    /<section class="section">\s*<div class="section-header">\s*<p class="hero-kicker">Vollregister<\/p>/,
    '<section class="section" id="vollregister">\n        <div class="section-header">\n          <p class="hero-kicker">Vollregister</p>',
  );
  if (writeIfChanged(rel, html)) touched += 1;
}

if (exists("fuer/index.html")) {
  const rel = "fuer/index.html";
  let html = read(rel);
  html = html
    .replace(
      /<link rel="canonical" href="https:\/\/wirkungsoekonomie\.de\/fuer\/index\.html">/i,
      '<link rel="canonical" href="https://wirkungsoekonomie.de/fuer/">',
    )
    .replaceAll(
      "Was bedeutet die Wirkungsökonomie für mich?",
      "Was bedeutet Wirkungsökonomie aus deiner Perspektive?",
    )
    .replace(
      "Die Wirkungsökonomie hat für jede Gruppe eine andere Einstiegsfrage - aber denselben Maßstab: Welche Wirkung entsteht auf Mensch, Planet und Demokratie?",
      "Die Wirkungsökonomie beginnt nicht bei einem abstrakten System, sondern bei konkreten Rollen: Bürger:innen, Unternehmen, Kommunen, Kapital, Wissenschaft, Medien und Zivilgesellschaft. Der Maßstab bleibt derselbe: Welche Wirkung entsteht auf Mensch, Planet und Demokratie?",
    );
  if (writeIfChanged(rel, html)) touched += 1;
}

console.log(`Word audit redaction applied to ${touched} files.`);
