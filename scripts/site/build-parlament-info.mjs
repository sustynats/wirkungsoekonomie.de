import fs from "node:fs";
import path from "node:path";
import {renderInstituteProjects} from "../lib/institut-projects.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "parlament");
const OUT_FILE = path.join(OUT_DIR, "index.html");
const HOME_FILE = path.join(ROOT, "index.html");
const BASE = "../";
const PORTAL_URL = "https://parlament.wirkungsoekonomie.de/";

const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const headerTemplate = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");
const headerUtilityLabels = new Set(["Suche", "WÖk-KI", "Mein Wirkungsraum"]);

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function navMatch(item) {
  return (item.match || []).join("|");
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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://wirkungsoekonomie.de/parlament/#webpage",
      url: "https://wirkungsoekonomie.de/parlament/",
      name: "Wirkungsportal Parlament - politische Entscheidungen nach ihrer Wirkung verstehen",
      description: "Die Informationsseite erklärt Zweck, Aufbau, Modelle, Quellen und Prüfverfahren des Wirkungsportals Parlament.",
      inLanguage: "de",
      isPartOf: { "@id": "https://wirkungsoekonomie.de/#website" },
      about: { "@id": "https://parlament.wirkungsoekonomie.de/#portal" }
    },
    {
      "@type": "WebApplication",
      "@id": "https://parlament.wirkungsoekonomie.de/#portal",
      name: "Wirkungsportal Parlament",
      url: PORTAL_URL,
      applicationCategory: "GovernmentApplication",
      operatingSystem: "Web",
      description: "Öffentliches Informationsportal für nachvollziehbare Wirkungsanalysen politischer Entscheidungen in Bund, Ländern und Europäischer Union.",
      publisher: { "@id": "https://wirkungsoekonomie.de/#organization" }
    }
  ]
};

const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Wirkungsportal Parlament - politische Wirkung nachvollziehen</title>
    <meta name="description" content="Was verändert eine politische Entscheidung, für wen und wie belastbar wissen wir das? Das Wirkungsportal Parlament macht Wirkungswege, Risiken, Evidenz und Reality Checks nachvollziehbar.">
    <meta name="search_title" content="Wirkungsportal Parlament - politische Wirkung nachvollziehen">
    <meta name="search_description" content="Zweck, Modelle, Quellen und Prüfverfahren des Wirkungsportals Parlament verständlich erklärt.">
    <meta name="search_section" content="Wirkungsportal Parlament">
    <meta name="search_type" content="Erklärseite">
    <link rel="canonical" href="https://wirkungsoekonomie.de/parlament/">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:title" content="Wirkungsportal Parlament - politische Wirkung nachvollziehen">
    <meta property="og:description" content="Politische Entscheidungen nicht nur nach Verfahren betrachten, sondern nach ihren möglichen und beobachtbaren Folgen für Mensch, Planet und Demokratie.">
    <meta property="og:url" content="https://wirkungsoekonomie.de/parlament/">
    <link rel="stylesheet" href="../assets/css/style.css">
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
  </head>
  <body class="parlament-info-page">
${renderHeader(BASE)}
    <main>
      <section class="hero compact-hero">
        <nav class="breadcrumb" aria-label="Brotkrumen"><a href="../index.html">Start</a> / Wirkungsportal Parlament</nav>
        <p class="hero-kicker">Politische Entscheidungen nach ihrer Wirkung verstehen</p>
        <h1>Was verändert Politik wirklich?</h1>
        <p class="hero-subtitle">Das Wirkungsportal Parlament zeigt nicht nur, was angekündigt, beraten oder beschlossen wurde. Es untersucht, welche Zustände eine Maßnahme verändern kann, wer davon betroffen ist, welche Risiken bestehen und was sich nach der Umsetzung tatsächlich beobachten lässt.</p>
        <p class="hero-subtitle">Quelle, politischer Lebenslauf, Wirkungspotenzial, Evidenz und spätere Beobachtung bleiben getrennt sichtbar. So muss eine Bewertung nicht einfach geglaubt werden. Sie kann geprüft werden.</p>
        <p>Ein Projekt des Wirkungsinstituts: <a href="../institut/projekte/wirkungsportal-parlament/">Vom Projektauftrag zum Livegang: Chronik, Konzept und Aufgaben</a>.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${PORTAL_URL}">Wirkungsportal öffnen</a>
          <a class="btn btn-secondary" href="${PORTAL_URL}wirkungsfaelle">Wirkungsfälle ansehen</a>
          <a class="btn btn-secondary" href="${PORTAL_URL}methodik">Methodik nachvollziehen</a>
        </div>
      </section>

      <section class="section" aria-labelledby="parlament-warum-title">
        <div class="section-header">
          <p class="hero-kicker">Warum es das Portal gibt</p>
          <h2 id="parlament-warum-title">Ein Beschluss ist noch keine Wirkung</h2>
          <p>Politische Berichterstattung endet oft beim Verfahren: Ein Entwurf wurde eingebracht, ein Ausschuss hat beraten, eine Mehrheit hat zugestimmt. Für den Alltag beginnt die entscheidende Frage aber erst dort: Was könnte sich durch die Maßnahme verändern?</p>
          <p>Das Portal verbindet deshalb den amtlichen politischen Sachverhalt mit einer eigenständigen Wirkungsanalyse. Vor der Umsetzung zeigt es begründete Wirkungspotenziale und Risiken. Später prüft ein Reality Check, welche Veränderungen beobachtet werden können und wie belastbar eine Zurechnung ist.</p>
        </div>
        <div class="principle-callout">
          <h3>Der Maßstab bleibt Wirkung.</h3>
          <p>Nicht die Zahl der Versprechen, Meldungen oder Gesetze steht im Mittelpunkt, sondern der konkrete Wirkungsgegenstand: Welcher Zustand kann sich für wen, über welchen Mechanismus und unter welchen Bedingungen verändern?</p>
        </div>
      </section>

      <section class="section" aria-labelledby="parlament-funktion-title">
        <div class="section-header">
          <p class="hero-kicker">So funktioniert es</p>
          <h2 id="parlament-funktion-title">Vom Originaldokument zum Reality Check</h2>
          <p>Jeder Schritt bleibt nachvollziehbar. Ein neuer Verfahrensschritt erzeugt nicht automatisch eine neue Wirkungsbewertung.</p>
        </div>
        <div class="impact-process" aria-label="Prozess einer politischen Wirkungsanalyse">
          <article class="impact-process__step"><span class="impact-process__index">1</span><h3>Amtliche Quelle</h3><p>Programm, Entwurf, Drucksache, Abstimmung, Rechtsakt oder Umsetzungsbericht werden mit ihrem Datenstand gesichert.</p></article>
          <article class="impact-process__step"><span class="impact-process__index">2</span><h3>Wirkungsgegenstand</h3><p>Zusammengehörige Prozessschritte werden einem stabilen WÖkImpactCase zugeordnet. Unsichere Identitäten bleiben offen.</p></article>
          <article class="impact-process__step"><span class="impact-process__index">3</span><h3>Wirkpfade</h3><p>Auslöser, Mechanismus, mögliche Zustandsveränderung, Betroffene, Bedingungen und Nebenwirkungen werden hergeleitet.</p></article>
          <article class="impact-process__step"><span class="impact-process__index">4</span><h3>Einordnung</h3><p>Richtung, Evidenz, Mensch-Planet-Demokratie, SDGs, SDG+, Recht und Schutzgrenzen werden getrennt geprüft.</p></article>
          <article class="impact-process__step"><span class="impact-process__index">5</span><h3>Politischer Lebenslauf</h3><p>Beratung, Änderung, Beschluss, Inkrafttreten und Umsetzung werden angehängt, ohne Potenzial als Wirkung auszugeben.</p></article>
          <article class="impact-process__step"><span class="impact-process__index">6</span><h3>Reality Check</h3><p>Sobald Daten vorliegen, wird geprüft, was beobachtet wurde und wie weit eine Veränderung der Maßnahme zugerechnet werden kann.</p></article>
        </div>
      </section>

      <section class="section" aria-labelledby="parlament-ebenen-title">
        <div class="section-header">
          <p class="hero-kicker">Vier getrennte Ebenen</p>
          <h2 id="parlament-ebenen-title">Damit aus einer Behauptung keine scheinbare Gewissheit wird</h2>
        </div>
        <div class="card-grid four">
          <article class="card"><p class="card-kicker">1 · Sachverhalt</p><h3 class="card-title">Was ist amtlich dokumentiert?</h3><p class="card-text">Gegenstand, Fassung, Datum, Status, Zuständigkeit, Abstimmung und Rechtsstand werden aus Primärquellen ermittelt.</p></article>
          <article class="card"><p class="card-kicker">2 · Wirkungsanalyse</p><h3 class="card-title">Was könnte sich verändern?</h3><p class="card-text">Die Analyse beschreibt Wirkungspotenziale, Risiken, Mechanismen, Wirkungsempfänger, Verteilung und Systemfolgen.</p></article>
          <article class="card"><p class="card-kicker">3 · Evidenz</p><h3 class="card-title">Wie sicher ist die Aussage?</h3><p class="card-text">Fakt, Mechanismusbeleg, Modellannahme, Datenlücke und spätere Beobachtung erhalten getrennte Evidenz- und Datenstati.</p></article>
          <article class="card"><p class="card-kicker">4 · Bewertung</p><h3 class="card-title">Woran wird eingeordnet?</h3><p class="card-text">Mensch, Planet, Demokratie, SDGs, WÖk-eigene SDG+-Erweiterungen, Recht und nicht kompensierbare Schutzgrenzen bleiben sichtbar.</p></article>
        </div>
      </section>

      <section class="section" aria-labelledby="parlament-modelle-title">
        <div class="section-header">
          <p class="hero-kicker">Die Modelle hinter dem Portal</p>
          <h2 id="parlament-modelle-title">Keine magische Gesamtformel</h2>
          <p>Nicht jede politische Wirkungsfrage lässt sich sofort in eine Zahl übersetzen. Vor einer Entscheidung wird zuerst ein plausibler Wirkpfad modelliert. Quantitative Wirkungsmessung beginnt erst, wenn geeignete Baselines, Vergleichsmöglichkeiten und Zustandsdaten vorliegen.</p>
        </div>
        <div class="definition-card-grid">
          <article class="definition-card"><h3>WÖkImpactCase</h3><p>Er bündelt den kausal zusammenhängenden Wirkungsgegenstand. Entwurf, Parlamentsvorgang, Rechtsakt und Umsetzung können Teile desselben Falls sein.</p></article>
          <article class="definition-card"><h3>Ex ante</h3><p>Vor der beobachtbaren Wirkung werden Mechanismus, Richtung, Potenzial, Risiko, Bedingungen, Evidenz und Datenbedarf ausgewiesen. Ex ante bedeutet nicht automatisch offen.</p></article>
          <article class="definition-card"><h3>Wirkungsrichtung</h3><p>Positiv, negativ, neutral, ambivalent und offen sind fachliche Kategorien. Sie werden nicht durch einfaches Zählen zu einem Parteiscore verrechnet.</p></article>
          <article class="definition-card"><h3>Evidenz</h3><p>Die Sicherheit einer Einordnung ist eine eigene Achse. Ein negatives Potenzial mit geringer Evidenz ist etwas anderes als eine offene Wirkungsrichtung.</p></article>
          <article class="definition-card"><h3>Nichtkompensation</h3><p>Schwere Verletzungen materieller Schutzgrenzen dürfen nicht durch Vorteile an anderer Stelle weggemittelt werden.</p></article>
          <article class="definition-card"><h3>Reality Check</h3><p>Beobachtung, Zurechnung und Kausalität werden getrennt. Ein Gesetz in Kraft ist noch kein Wirkungsnachweis.</p></article>
        </div>
        <div class="hero-actions">
          <a class="btn btn-secondary" href="${PORTAL_URL}methodik">Vollständige Methodik öffnen</a>
          <a class="btn btn-secondary" href="../werkzeuge/woek-id-register/">WÖk-Register ansehen</a>
        </div>
      </section>

      <section class="section" aria-labelledby="parlament-raeume-title">
        <div class="section-header">
          <p class="hero-kicker">Eine gemeinsame politische Wirkungsarchitektur</p>
          <h2 id="parlament-raeume-title">Bund, Länder und Europäische Union zusammen denken</h2>
          <p>Politische Wirkung hält sich nicht an Portalgrenzen. Eine EU-Regel kann ein Bundesgesetz auslösen und im Land oder in der Kommune umgesetzt werden. Das Portal verbindet diese Ebenen, ohne ihre Zuständigkeiten zu vermischen.</p>
        </div>
        <div class="card-grid four">
          <article class="card"><h3 class="card-title">Bundesregierung</h3><p class="card-text">Regierungshandeln, Ressortentscheidungen, Programme, Finanzierung, Umsetzung und spätere Beobachtung.</p><a class="text-link" href="${PORTAL_URL}regierung">Regierungsarbeit öffnen</a></article>
          <article class="card"><h3 class="card-title">Bundestag</h3><p class="card-text">Anstehende und entschiedene Vorgänge, fachliche Wirkungsakten sowie amtlich dokumentierte Abstimmungen.</p><a class="text-link" href="${PORTAL_URL}entscheidungen">Bundestag öffnen</a></article>
          <article class="card"><h3 class="card-title">Bundesländer</h3><p class="card-text">Wahlprogramme, Mandatsdokumente und Regierungsarbeit. Landtage erscheinen dort, wo sie zum Lebenslauf eines Wirkungsfalls gehören.</p><a class="text-link" href="${PORTAL_URL}laender">Länder öffnen</a></article>
          <article class="card"><h3 class="card-title">Europäische Union</h3><p class="card-text">Kommission als Exekutivkern, Parlament und Rat im Gesetzgebungsweg sowie Umsetzung und Wirkung in den Mitgliedstaaten.</p><a class="text-link" href="${PORTAL_URL}eu">EU öffnen</a></article>
        </div>
      </section>

      <section class="section" aria-labelledby="parlament-qualitaet-title">
        <div class="section-header">
          <p class="hero-kicker">Prüfbarkeit statt Blackbox</p>
          <h2 id="parlament-qualitaet-title">Woher die Informationen kommen und wer was verantwortet</h2>
        </div>
        <div class="myth-reality-grid">
          <article class="myth-reality-card"><div class="card"><p class="card-kicker">Amtliche Fakten</p><h3 class="card-title">Technisch erfasst und rückverfolgbar</h3><p class="card-text">Code, Datenadapter und Prüfregeln sichern Quellen, Versionen, Identitäten und Lebenszyklen. Unklare Verknüpfungen werden nicht automatisch zusammengeführt.</p></div></article>
          <article class="myth-reality-card"><div class="card"><p class="card-kicker">Fachliche Bewertung</p><h3 class="card-title">Vom Institut geprüft und freigegeben</h3><p class="card-text">Wirkpfade, Richtung, Evidenz, Schutzgrenzen und Reality Checks stammen aus fachlich verantworteten WÖkImpactCases. Ohne Freigabe erfolgt keine Veröffentlichung als Wirkungsanalyse.</p></div></article>
        </div>
        <div class="principle-callout">
          <h3>Offen bleibt offen.</h3>
          <p>Fehlende Daten werden weder zu null noch zu neutral. Ein technischer Fehler, eine unsichere Identität oder eine ungeklärte Quelle blockiert den betroffenen Datensatz. Sauber geprüfte Fälle können getrennt freigegeben werden.</p>
        </div>
      </section>

      <section class="section" aria-labelledby="parlament-kein-ranking-title">
        <div class="section-header">
          <p class="hero-kicker">Was das Portal nicht ist</p>
          <h2 id="parlament-kein-ranking-title">Keine Rangliste von Menschen oder Parteien</h2>
          <p>Das Portal bewertet Wirkungsgegenstände und ihre möglichen oder beobachteten Folgen. Es erstellt keine Gesamtnote für Abgeordnete, Ministerinnen und Minister, Parteien, Regierungen oder Staaten.</p>
          <p>Eine amtlich dokumentierte Stimme zeigt, wie eine Person in einem konkreten Fall abgestimmt hat. Sie ist keine Bewertung des Menschen. Auch eine Umsetzungsquote ist keine Wirkungskennzahl.</p>
        </div>
      </section>

      <section class="section" aria-labelledby="parlament-einstieg-title">
        <div class="community-cta">
          <p class="hero-kicker">Jetzt selbst prüfen</p>
          <h2 id="parlament-einstieg-title">Von der politischen Meldung zur nachvollziehbaren Wirkungsfrage</h2>
          <p>Beginnen Sie mit einem Wirkungsfall, folgen Sie dem politischen Lebenslauf und öffnen Sie bei jeder Einordnung Quellen, Wirkpfade, Evidenz und offene Fragen.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${PORTAL_URL}">Wirkungsportal öffnen</a>
            <a class="btn btn-secondary" href="${PORTAL_URL}wirkungsfaelle">Alle Wirkungsfälle</a>
            <a class="btn btn-secondary" href="${PORTAL_URL}transparenz">Transparenz ansehen</a>
          </div>
        </div>
      </section>
    </main>
${renderFooter(BASE)}
    <script src="../assets/js/main.js" defer></script>
  </body>
</html>
`;

const homeTeaser = `      <!-- parlament-info:start -->
      ${renderInstituteProjects({base:""})}
      <section class="section" aria-labelledby="parlament-info-home-title">
        <div class="card">
          <p class="hero-kicker">Wirkungsportal Parlament</p>
          <h2 id="parlament-info-home-title">Politische Entscheidungen nach ihrer Wirkung verstehen</h2>
          <p>Was könnte sich durch ein Gesetz, Programm oder Regierungsvorhaben für Mensch, Planet und Demokratie verändern? Das Portal verbindet amtliche Fakten mit nachvollziehbaren Wirkpfaden, Evidenz, Schutzgrenzen und späteren Reality Checks.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="parlament/">So funktioniert das Portal</a>
            <a class="btn btn-secondary" href="${PORTAL_URL}">Portal öffnen</a>
          </div>
        </div>
      </section>
      <!-- parlament-info:end -->

`;

function updateHome() {
  let home = fs.readFileSync(HOME_FILE, "utf8");
  home = home.replace(/\s*<!-- parlament-info:start -->[\s\S]*?<!-- parlament-info:end -->\s*/g, "\n\n      ");
  const anchor = home.includes("<!-- home-parliament-slot -->") ? "<!-- home-parliament-slot -->" : '<section class="section next-step-block" id="journey" aria-labelledby="journey-title">';
  if (!home.includes(anchor)) throw new Error("Homepage anchor for Parliament teaser not found");
  home = home.replace(anchor, `${homeTeaser}${anchor}`);
  fs.writeFileSync(HOME_FILE, home);
}

function updateSitemap() {
  const sitemapFile = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapFile)) return;
  let sitemap = fs.readFileSync(sitemapFile, "utf8");
  const loc = "https://wirkungsoekonomie.de/parlament/";
  if (sitemap.includes(`<loc>${loc}</loc>`)) return;
  sitemap = sitemap.replace("</urlset>", `  <url><loc>${loc}</loc><lastmod>2026-08-18</lastmod></url>\n</urlset>`);
  fs.writeFileSync(sitemapFile, sitemap);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html);
updateHome();
updateSitemap();
console.log(`Built ${path.relative(ROOT, OUT_FILE)} and linked it from the homepage`);
