import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "institut");
const OUT_FILE = path.join(OUT_DIR, "index.html");
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const headerTemplate = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");
const BASE = "../";
const INSTITUT_URL = "https://institut.wirkungsoekonomie.de/";
const AKTUELLE_ARBEITEN_URL = "https://institut.wirkungsoekonomie.de/aktuelle-arbeiten";
const MITWIRKEN_URL = "https://institut.wirkungsoekonomie.de/mitwirken";
const ARBEITSWEISE_URL = "https://institut.wirkungsoekonomie.de/arbeitsweise";
const ZIELBILD_URL = "https://institut.wirkungsoekonomie.de/zielbild";
const STAKEHOLDER_URL = "https://institut.wirkungsoekonomie.de/stakeholder";
const METHODIK_URL = "https://institut.wirkungsoekonomie.de/methodik";
const WIRKUNGSMODELL_URL = "https://institut.wirkungsoekonomie.de/wirkungsmodell";
const WIRKUNGSGESELLSCHAFT_URL = "https://institut.wirkungsoekonomie.de/wirkungsgesellschaft";
const UNABHAENGIGKEIT_URL = "https://institut.wirkungsoekonomie.de/unabhaengigkeit";
const FAQ_URL = "https://institut.wirkungsoekonomie.de/faq";
const headerUtilityLabels = new Set(["Suche", "WÖk-KI", "Mein Wirkungsraum"]);

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function navMatch(item) {
  return (item.match || []).join("|");
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function navLink(item, base) {
  return `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function headerUtilityNav(base) {
  return (navigation.more || [])
    .filter((item) => headerUtilityLabels.has(item.label))
    .map((item) => {
      const label = esc(item.label);
      const primary = item.label === "Mein Wirkungsraum" ? ' data-utility-primary="true"' : "";
      return `<a class="site-utility-link site-utility-link--${esc(slugify(item.label))}" href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}" data-utility-label="${label}"${primary}>${label}</a>`;
    })
    .join("\n    ");
}

function footerGroup(group, base) {
  const links = group.items.map((item) => `          ${navLink(item, base)}`).join("\n");
  return `<div class="footer-nav-group">
      <h3>${esc(group.title)}</h3>
      <div class="footer-nav-links">
${links}
      </div>
    </div>`;
}

function renderHeader(base) {
  return headerTemplate
    .replaceAll("{{BASE}}", base)
    .replaceAll("{{HEADER_UTILITY_NAV}}", headerUtilityNav(base))
    .replace("{{HEADER_NAV}}", navigation.header.map((item) => navLink(item, base)).join("\n    "));
}

function renderFooter(base) {
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n"));
}

const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Wirkungsinstitut - vom Wissen zur Wirkung</title>
    <meta name="description" content="Brückenseite zum Wirkungsinstitut: Think Tank und Forschungsraum der Wirkungsökonomie für Wirkungsforschung, Wirkungswissen und Rückkopplung.">
    <link rel="canonical" href="https://wirkungsoekonomie.de/institut/">
    <link rel="stylesheet" href="../assets/css/style.css">
  </head>
  <body>
${renderHeader(BASE)}
    <main>
      <section class="hero compact-hero">
        <nav class="breadcrumb"><a href="../index.html">Start</a> / Wirkungsinstitut</nav>
        <p class="hero-kicker">Think Tank und Forschungsraum der Wirkungsökonomie</p>
        <h1>Vom Wissen zur Wirkung.</h1>
        <p class="hero-subtitle">Das Wirkungsinstitut untersucht, wie Wissen wirksam wird: in Entscheidungen, Preisen, Kapitalflüssen, politischen Programmen, Medienverantwortung und gesellschaftlicher Rückkopplung.</p>
        <p class="hero-subtitle">Diese Seite ist die Brücke von wirkungsoekonomie.de zum Institut. Die laufenden Arbeiten, Methoden, Veröffentlichungen und Mitwirkungswege liegen auf der Institutsplattform.</p>
        <div class="hero-actions">
          <a class="btn btn-secondary" href="${INSTITUT_URL}">Institut öffnen</a>
          <a class="btn btn-secondary" href="${AKTUELLE_ARBEITEN_URL}">Aktuelle Arbeiten ansehen</a>
          <a class="btn btn-primary" href="${WIRKUNGSGESELLSCHAFT_URL}">Wirkungsgesellschaft verstehen</a>
        </div>
      </section>

      <section class="section home-video-section" id="institut-video" aria-labelledby="institut-video-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Kurz erklärt</p>
            <h2 id="institut-video-title">Das Wirkungsinstitut in sechs Minuten</h2>
            <p>Vom Wissen zur Wirkung: Wie das Institut Wirkungswissen erzeugt, Rückkopplung ermöglicht und Entscheidungen verändert — für Mensch, Planet und Demokratie.</p>
          </div>
          <video class="home-explainer-video" controls controlsList="nodownload" preload="metadata" playsinline poster="../assets/video/institut-poster.png?v=20260704" aria-label="Erklärvideo zum Wirkungsinstitut">
            <source src="../assets/video/institut.mp4?v=20260704" type="video/mp4">
            Dein Browser kann dieses Video nicht direkt abspielen.
          </video>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-warum-title">
        <div class="section-header">
          <p class="hero-kicker">Warum ein Institut?</p>
          <h2 id="institut-warum-title">Warum es das Wirkungsinstitut braucht</h2>
          <p>Viele gesellschaftliche Debatten bleiben an der Oberfläche. Sie drehen sich um Kosten, Ideologie, Zuständigkeiten, Parteipositionen oder kurzfristige Zustimmung.</p>
          <p>Die Wirkungsökonomie stellt eine andere Frage: <strong>Welche Zustände verändern sich wirklich?</strong></p>
          <p>Ein Faktencheck kann prüfen, ob eine Aussage stimmt. Ein Wirkungscheck geht weiter: Er fragt, welches Wirkungspotenzial eine Aussage, Entscheidung oder Entwicklung erzeugt.</p>
          <p>Denn Wirkung entsteht nicht erst, wenn ein Schaden sichtbar ist. Sie beginnt oft dort, wo Erwartungen, Investitionen, Narrative, Märkte, politische Entscheidungen oder gesellschaftliche Resonanzräume verändert werden.</p>
          <p>Das Wirkungsinstitut ist der Ort, an dem solche Wirkungen gesammelt, diskutiert, geprüft, verdichtet und veröffentlicht werden.</p>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-ziel-title">
        <div class="section-header">
          <p class="hero-kicker">Zielbild</p>
          <h2 id="institut-ziel-title">Wirkungswissen erzeugen. Rückkopplung ermöglichen. Entscheidungen verändern.</h2>
          <p>Das Wirkungsinstitut entwickelt Wirkungswissen: Wissen, das nicht bei Analyse stehen bleibt, sondern Wirkung sichtbar, prüfbar und entscheidungsrelevant macht.</p>
          <p>Es übersetzt die Wirkungsökonomie in konkrete Analysen, Methoden, Wirkungschecks, Policy Briefs und Dossiers - und fragt, welche Rückkopplung daraus entstehen muss.</p>
          <p>Ziel ist ein öffentlicher Denk- und Arbeitsraum, der bessere Entscheidungen ermöglicht - für Mensch, Planet und Demokratie.</p>
        </div>
        <div class="hero-actions">
          <a class="btn btn-secondary" href="${WIRKUNGSGESELLSCHAFT_URL}">Wirkungsgesellschaft lesen</a>
          <a class="btn btn-secondary" href="${ZIELBILD_URL}">Zielbild lesen</a>
          <a class="btn btn-secondary" href="${WIRKUNGSMODELL_URL}">Wirkungsmodell ansehen</a>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-output-title">
        <div class="section-header">
          <p class="hero-kicker">Was dort entsteht</p>
          <h2 id="institut-output-title">Was im Wirkungsinstitut entsteht</h2>
        </div>
        <div class="card-grid three">
          <article class="card">
            <h3 class="card-title">Wirkungschecks</h3>
            <p class="card-text">Kurze Analysen zu aktuellen Fragen. Sie prüfen Wirkpfade, Wirkungspotenziale, Risiken, Nebenwirkungen und mögliche Systemfolgen.</p>
          </article>
          <article class="card">
            <h3 class="card-title">Policy Briefs</h3>
            <p class="card-text">Kompakte Papiere für Politik, Verwaltung, Medien und Öffentlichkeit. Sie verbinden Problemanalyse, Wirkungslogik und Handlungsempfehlungen.</p>
          </article>
          <article class="card">
            <h3 class="card-title">Methodenpapiere</h3>
            <p class="card-text">Begriffe, Bewertungslogiken und Instrumente der Wirkungsökonomie. Zum Beispiel Wirkung, Wirkungspotenzial, Netto-Wirkung, T-SROI oder Reverse Merit Order.</p>
          </article>
          <article class="card">
            <h3 class="card-title">Dossiers</h3>
            <p class="card-text">Tiefere Analysen zu großen Systemfragen. Zum Beispiel Rente, Wohnen, Lieferketten, Erbschaftsteuer, Medienwirkung oder KI und Arbeit.</p>
          </article>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-methodik-title">
        <div class="section-header">
          <p class="hero-kicker">Methodenfamilie</p>
          <h2 id="institut-methodik-title">Nicht nur Wirkungsanalyse</h2>
          <p>Das Institut entwickelt eine Methodenfamilie der Wirkungsökonomie: Wirkungsanalyse, Wirkungspotenzial-Analyse, Wirkungsrisiko-Analyse, Wirkungsbewertung, Wirkungsarchitektur, Wirkungslenkung, Impact-Controlling, Transformationsanalyse, Narrativ- und Resonanzraumanalyse sowie Policy- und Maßnahmenprüfung.</p>
          <p>Gemeinsam ist allen Methoden: Wirkung, Wirkungspotenzial und Wirkungsrisiko werden getrennt; Reichweite ist nicht Wirkung; Reporting ist nicht Rückkopplung; Nichtkompensation und Reverse Merit Order schützen vor Schönrechnen.</p>
        </div>
        <div class="hero-actions">
          <a class="btn btn-secondary" href="${METHODIK_URL}">Methoden kennenlernen</a>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-wirkungsgesellschaft-title">
        <div class="section-header">
          <p class="hero-kicker">Wirkungsgesellschaft</p>
          <h2 id="institut-wirkungsgesellschaft-title">Von der Wissensgesellschaft zur Wirkungsgesellschaft</h2>
          <p>Die Wissensgesellschaft hat Daten, Studien und Berichte hervorgebracht. Die nächste Aufgabe ist die Wirkungsgesellschaft: Wissen muss in Entscheidungen, Preise, Kapitalflüsse, politische Programme, Medienverantwortung und Systemrückkopplung übersetzt werden.</p>
          <p>Das Problem ist nicht nur der Mangel an Wissen. Das Problem ist die fehlende Rückkopplung von Wissen in Wirkung.</p>
        </div>
        <div class="hero-actions">
          <a class="btn btn-secondary" href="${WIRKUNGSGESELLSCHAFT_URL}">Wirkungsgesellschaft verstehen</a>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-stakeholder-title">
        <div class="section-header">
          <p class="hero-kicker">Für wen?</p>
          <h2 id="institut-stakeholder-title">Für alle, die Wirkung verstehen und gestalten wollen</h2>
          <p>Das Wirkungsinstitut richtet sich an Bürger:innen, Wissenschaft, Politik, Verwaltung, Unternehmen, Medien, Zivilgesellschaft, Bildung, Kommunen und Finanzmarktakteure.</p>
          <p>Der gemeinsame Nenner ist nicht Zugehörigkeit, Titel oder Status, sondern die Frage: <strong>Was bewirkt unser Handeln - und wie können wir es besser machen?</strong></p>
        </div>
        <div class="card-grid three">
          <article class="card">
            <h3 class="card-title">Orientierung</h3>
            <p class="card-text">Für Bürger:innen, Medien, Bildung und Öffentlichkeit: komplexe Debatten nach Wirkpfaden, Nebenwirkungen und Rückkopplungen einordnen.</p>
          </article>
          <article class="card">
            <h3 class="card-title">Entscheidungsgrundlagen</h3>
            <p class="card-text">Für Politik, Verwaltung, Kommunen, Unternehmen und Kapital: Entscheidungen nicht nur nach Kosten, Interessen oder Rendite bewerten.</p>
          </article>
          <article class="card">
            <h3 class="card-title">Wirkungswissen</h3>
            <p class="card-text">Für Wissenschaft, Fachleute und Zivilgesellschaft: Quellen, Praxisfälle, Gegenargumente und Reviews in rückkopplungsfähige Wirkungsbeiträge übersetzen.</p>
          </article>
        </div>
        <div class="hero-actions">
          <a class="btn btn-secondary" href="${STAKEHOLDER_URL}">Stakeholder ansehen</a>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-prozess-title">
        <div class="section-header">
          <p class="hero-kicker">Wie gearbeitet wird</p>
          <h2 id="institut-prozess-title">Von der Frage zur Rückkopplung</h2>
          <p>Das Wirkungsinstitut ist keine Plattform für Wissensgenerierung. Es ist eine Plattform für Wirkungsforschung und Rückkopplung.</p>
          <p>Der Arbeitsprozess folgt einer klaren Kette: <strong>Frage → Recherche → Diskussion → Methodenauswahl → Analyse → Entwurf → Review → Veröffentlichung → Rückkopplung</strong></p>
          <p>Dafür nutzt das Institut eigene Arbeitsbereiche wie Wirkungsboard, Diskursforum, Projektwerkstatt, Dokumentenwerkstatt, Quellenarchiv und Veröffentlichungen.</p>
          <p>Discord kann als angeschlossener Kommunikationsraum dienen. Die Plattform bleibt jedoch der zentrale Ort für Wirkungswissen, Struktur, Veröffentlichung und Rückkopplung.</p>
        </div>
        <div class="hero-actions">
          <a class="btn btn-secondary" href="${ARBEITSWEISE_URL}">Arbeitsweise des Instituts ansehen</a>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-einordnung-title">
        <div class="section-header">
          <p class="hero-kicker">Einordnung</p>
          <h2 id="institut-einordnung-title">Institut, Akademie und Plattform</h2>
          <p>Das Wirkungsinstitut ist Teil der Wirkungsökonomie-Plattform.</p>
          <p>Die Bereiche ergänzen sich:</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bereich</th>
                <th>Aufgabe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Wirkungsökonomie.de</td>
                <td>Grundlagen, Begriffe, Modelle, öffentliche Orientierung</td>
              </tr>
              <tr>
                <td>Akademie</td>
                <td>Lernen, Kurse, Wirkungskompetenz</td>
              </tr>
              <tr>
                <td>Wirkungsinstitut</td>
                <td>Forschung, Wirkungschecks, Policy Briefs, Dossiers, Methodenentwicklung</td>
              </tr>
              <tr>
                <td>WÖk-App / Tools</td>
                <td>Anwendung, Prüfungen und interaktive Werkzeuge</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="section-header compact">
          <p><strong>Die Akademie vermittelt Wirkungskompetenz. Das Institut entwickelt Wirkungswissen. Die Plattform macht beides zugänglich.</strong></p>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-unabhaengigkeit-title">
        <div class="section-header">
          <p class="hero-kicker">Unabhängigkeit</p>
          <h2 id="institut-unabhaengigkeit-title">Unabhängig und nicht drittfinanziert</h2>
          <p>Das Wirkungsinstitut ist kein Verein, keine Partei und kein Lobbyinstrument.</p>
          <p>Es ist ein unabhängiges, nicht drittfinanziertes Wirkungsforschungsprojekt von Natalie Weber und wird nicht von Unternehmen, Parteien, Verbänden oder Lobbyorganisationen finanziert oder gesteuert.</p>
          <p>Der Maßstab ist Wirkung - nicht Auftrag, Parteizugehörigkeit oder Einzelinteresse.</p>
        </div>
        <div class="hero-actions">
          <a class="btn btn-secondary" href="${UNABHAENGIGKEIT_URL}">Mehr zur Unabhängigkeit</a>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-mitwirken-title">
        <div class="section-header">
          <p class="hero-kicker">Mitwirken</p>
          <h2 id="institut-mitwirken-title">Mitwirken statt Mitglied werden</h2>
          <p>Das Wirkungsinstitut ist offen für Menschen, die Wirkung verstehen, prüfen oder sichtbar machen wollen.</p>
          <p>Man kann Themen vorschlagen, Quellen einreichen, Praxisfälle schildern, Gegenargumente formulieren, Entwürfe kommentieren, fachlich reviewen oder Gastbeiträge schreiben.</p>
          <p>Es gibt keine Mitgliedschaft und keine Vereinsstruktur. Beteiligung erfolgt inhaltlich und projektbezogen.</p>
        </div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${MITWIRKEN_URL}">Mitwirken im Institut</a>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-cta-title">
        <div class="section-header compact">
          <p class="hero-kicker">Vom Wissen zur Wirkung</p>
          <h2 id="institut-cta-title">Die Zukunft entsteht nicht durch mehr Wissen allein.</h2>
          <p>Sie entsteht, wenn Wissen Wirkung entfaltet: von Information zu Orientierung, von Analyse zu Entscheidung, von Wissen zu Wirkung.</p>
          <p><strong>Für Mensch, Planet und Demokratie.</strong></p>
        </div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${INSTITUT_URL}">Institut öffnen</a>
          <a class="btn btn-secondary" href="${AKTUELLE_ARBEITEN_URL}">Aktuelle Arbeiten ansehen</a>
          <a class="btn btn-secondary" href="${FAQ_URL}">Häufige Fragen</a>
        </div>
      </section>
    </main>
${renderFooter(BASE)}
    <script src="../assets/js/main.js"></script>
  </body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html);
console.log("Built institut/index.html.");
