import fs from "node:fs";
import path from "node:path";
import { impactArchitectureVisual } from "../lib/impact-architecture-visual.mjs";
import { ComparisonTable } from "../lib/explainer-components.mjs";
import { renderIooiPrecision } from "../lib/iooi-precision.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "verstehen", "iooi-und-wirkungsoekonomie");
const OUT_FILE = path.join(OUT_DIR, "index.html");
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const headerTemplate = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");
const BASE = "../../";
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
      const primary = item.label === "Mein Wirkungsraum" ? ' data-utility-primary="true"' : "";
      return `<a class="site-utility-link site-utility-link--${esc(slugify(item.label))}" href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}" data-utility-label="${esc(item.label)}"${primary}>${esc(item.label)}</a>`;
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

const TITLE = "IOOI, Wirkungspfad und Wirkungsökonomie - was gehört wohin?";
const DESCRIPTION = "IOOI ist eine Teilperspektive der WÖk. Die Wirkungsökonomie präzisiert Analyse und Berechnung innerhalb der Ergebniskette und verbindet sie mit Bewertung, Schutz und Steuerung.";
const schema = {
  "@context": "https://schema.org",
  "@type": ["Article", "LearningResource"],
  headline: TITLE,
  description: DESCRIPTION,
  inLanguage: "de-DE",
  learningResourceType: "Methodenerklärung",
  educationalLevel: "Einführung",
  url: "https://wirkungsoekonomie.de/verstehen/iooi-und-wirkungsoekonomie/",
  isPartOf: { "@type": "WebSite", name: "Wirkungsökonomie", url: "https://wirkungsoekonomie.de/" },
};

const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(TITLE)}</title>
    <meta name="description" content="${esc(DESCRIPTION)}">
    <meta name="search_title" content="${esc(TITLE)}">
    <meta name="search_description" content="${esc(DESCRIPTION)}">
    <meta name="search_section" content="Verstehen">
    <meta name="search_type" content="Methodenerklärung">
    <link rel="canonical" href="https://wirkungsoekonomie.de/verstehen/iooi-und-wirkungsoekonomie/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(TITLE)}">
    <meta property="og:description" content="${esc(DESCRIPTION)}">
    <meta property="og:url" content="https://wirkungsoekonomie.de/verstehen/iooi-und-wirkungsoekonomie/">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(TITLE)}">
    <meta name="twitter:description" content="${esc(DESCRIPTION)}">
    <link rel="icon" href="${BASE}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${BASE}assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body>
${renderHeader(BASE)}
    <main data-search-content>
      <section class="hero compact-hero" data-no-glossary>
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${BASE}index.html">Start</a><span aria-hidden="true">/</span><a href="${BASE}verstehen/">Verstehen</a><span aria-hidden="true">/</span><span>IOOI und Wirkungsökonomie</span></nav>
        <p class="hero-kicker">IOOI, Wirkpfad und WÖk</p>
        <h1>IOOI ist ein Ausschnitt, kein Gegenmodell.</h1>
        <p class="hero-subtitle">Eine Stadt richtet eine neue Buslinie ein. Was wird dafür gebraucht, was verändert sie - und was wissen wir wirklich darüber? An diesem Beispiel lassen sich IOOI, Wirkpfad und Wirkungsarchitektur auseinanderhalten.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#buslinie">Mit der Buslinie beginnen</a>
          <a class="btn btn-secondary" href="#iooi">IOOI erklären</a>
          <a class="hero-secondary-link" href="${BASE}begriffe/iooi/">IOOI im Glossar</a>
        </div>
      </section>

      <section class="section section-soft" id="buslinie" aria-labelledby="buslinie-title">
        <p class="hero-kicker">Ein erfundenes Beispiel, kein Wirkungsnachweis</p>
        <h2 id="buslinie-title">Stell dir eine neue Buslinie vor.</h2>
        <p>Die Stadt stellt Geld, Busse und Fahrer bereit. Das ist <strong>Input</strong>. Die Busse fahren: eine <strong>Aktivität</strong>. Die angebotenen Fahrten und bedienten Haltestellen sind <strong>Output</strong>. Nehmen wir an, mehr Menschen kommen dadurch ohne Auto zur Arbeit oder zur Schule: Das wäre <strong>Outcome</strong>. Wenn sich langfristig Verkehr, Emissionen oder Teilhabe verändern, kann das je nach verwendeter Results Chain <strong>Impact</strong> sein.</p>
        <p>Aber hat wirklich die neue Linie die Veränderung ausgelöst? Wer profitiert - und wer nicht? Wurde dafür eine andere Linie gestrichen? Wie sicher sind die Daten? Welche Nebenfolgen entstehen? Und was sollte die Stadt jetzt bei Preis, Takt oder Budget ändern?</p>
        <p><strong>IOOI ordnet die Ergebniskette. Die Wirkungsökonomie prüft auch innerhalb dieser Kette genauer, was als Veränderung, Beitrag und bewertbares Ergebnis gelten darf, und verbindet das mit dem gesamten Wirkungssystem.</strong> Eine geplante Buslinie hat zunächst Wirkungspotenzial und Wirkungsrisiken. Erst eine tatsächliche Zustandsveränderung ist Wirkung; die Zurechnung zur Buslinie bleibt eine eigene Frage.</p>
      </section>

      <section class="section" id="ebenen" aria-labelledby="ebenen-title">
        <span id="wirkungsrad"></span>
        <p class="hero-kicker">Blickwinkel und Aufgaben, keine Wirkungsstationen</p>
        <h2 id="ebenen-title">Ein Pfad, mehrere Ebenen</h2>
        <p><strong>IOOI strukturiert eine Ergebniskette innerhalb eines Wirkungspfads. Die Wirkungsökonomie baut um Wirkpfade eine vollständige Analyse-, Evidenz-, Bewertungs-, Schutz- und Steuerungsarchitektur.</strong></p>
        ${impactArchitectureVisual()}
        <div class="card-grid three" aria-label="Fünf Blickwinkel auf denselben Wirkpfad">
          <article class="card"><h3>Wirkpfad: Was geschieht oder könnte geschehen?</h3><p>Ausgangslage, Auslöser, Mechanismen und Bedingungen verbinden Handlungen mit möglichen oder beobachteten Veränderungen, Folge- und Systemwirkungen. Der neue Systemzustand wird zur nächsten Ausgangslage. Ein plausibler Pfad ist kein Kausalbeweis.</p></article>
          <article class="card"><h3>IOOI: Wie ordnen wir Ressourcen, Leistungen und Veränderungen?</h3><p>Input → [Aktivität] → Output → Outcome → Impact. Die externe, optionale Results Chain kann einen Abschnitt des Pfads strukturieren. Aktivität ist eine zusätzliche Prozessstufe, kein Buchstabe im Akronym.</p></article>
          <article class="card"><h3>Evidenz: Was ist beobachtet und zurechenbar?</h3><p>Baseline, Gegenfaktum, Datenqualität, Zusätzlichkeit, Attribution oder Contribution, Evidenzstatus und Unsicherheit werden entlang des Pfads geprüft. Beobachtung ist nicht Attribution.</p></article>
          <article class="card"><h3>Bewertung und Schutz: Welcher Maßstab, welche Grenzen?</h3><p>Feststellen und Messen sind von Bewertung zu trennen. Mensch, Planet und Demokratie, Recht, Referenzrahmen, Verteilung und Zeit bestimmen die Einordnung. Netto-Wirkung darf Wirkungsgrenzen nicht aufrechnen: Nichtkompensation und Reverse Merit Order schützen vor Schönrechnung.</p></article>
          <article class="card"><h3>Rückkopplung: Was ändern wir aufgrund dieses Wissens?</h3><p>Geprüfte Erkenntnisse können Preise, Steuern, Kapital, Versicherung, Beschaffung, Management, Recht, Politik oder Produktdesign verändern. Neue Entscheidungen verändern Bedingungen für weitere Wirkpfade und Monitoring. Reporting allein ist noch keine Rückkopplung.</p></article>
        </div>
        <h3>Ex ante: Was könnte passieren - und warum?</h3>
        <p>Wirkungspotenzial, Wirkungsrisiko, Hypothesen, Mechanismen, Bedingungen, Annahmen und Szenarien beziehen sich auf mehrere Verbindungen des Pfads. <strong>Potenzial und Risiko sind keine Stationen einer Kausalkette.</strong> Ein Wirkmechanismus erklärt eine Verbindung, statt eine weitere Zeitstation zu sein. Die WÖk setzt mit Problem- und Zielprüfung vor der Auswahl von Inputs an: früher im Prüf- und Entscheidungsprozess, nicht durch eine zusätzliche Potenzial-Station in der Kausalkette. Sie präzisiert zugleich die IOOI-Teilperspektive und geht mit Systemprüfung und Rückkopplung über deren Darstellung hinaus.</p>
        <h3>Systemprüfung quer zum Pfad</h3>
        <p>Die WÖk untersucht Wirkungen 1. Ordnung als direkte Zustandsveränderungen, 2. Ordnung als indirekte Folgen einschließlich Rebound, Spillover und Leakage sowie 3. Ordnung als Veränderungen von Regeln, Anreizen, Routinen, Standards, Märkten, Institutionen und künftigen Entscheidungen. Systemgrenze, Betroffene, Zeitverzug, Verteilung, Resilienz, Lock-ins und Schadensverlagerungen sind ausdrücklich zu prüfen. Unbelegte Kaskaden bleiben Hypothesen.</p>
        <h3>Governance um alle Ebenen</h3>
        <p>Versionierung, Audit oder Assurance, Transparenz, Rechtsschutz und Lernen halten Annahmen, Bewertungen und Entscheidungen nachvollziehbar und korrigierbar. Die WÖk ist keine Planwirtschaft, keine Sprachpolizei und kein Social-Credit-System. Sie bewertet keine Menschen.</p>
      </section>

      <section class="section" id="iooi" aria-labelledby="iooi-title">
        <div class="section-header">
          <p class="hero-kicker">Optionale Anschlussmethode</p>
          <h2 id="iooi-title">Input → [Aktivität] → Output → Outcome → Impact</h2>
          <p><strong>IOOI steht für Input, Output, Outcome und Impact.</strong> Als externe Results Chain strukturiert es den Weg von eingesetzten Ressourcen über erbrachte Leistungen zu eingetretenen Veränderungen und höherstufigen Wirkungen. Aktivität gehört logisch zwischen Input und Output, ist aber kein Buchstabe im Akronym. IOOI ist weder Grundmodell noch notwendiger Bestandteil der Wirkungsökonomie.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th scope="col">Stufe</th><th scope="col">Frage</th><th scope="col">Beispiele</th><th scope="col">Klare Abgrenzung</th></tr></thead>
            <tbody>
              <tr><th scope="row"><a href="${BASE}begriffe/input/">Input</a></th><td>Welche Ressourcen werden eingesetzt?</td><td>Geld, Zeit, Personal, Material, Energie, Infrastruktur, Wissen, Daten, natürliche Ressourcen.</td><td>Ressourceneinsatz, noch keine Wirkung.</td></tr>
              <tr><th scope="row"><a href="${BASE}begriffe/aktivitaet/">Aktivität</a></th><td>Was wird tatsächlich getan?</td><td>Projekt, Produktion, Dienstleistung, Gesetz, Kommunikation, Investition, Förderung oder Beschaffung.</td><td>Handlung zwischen Input und Output.</td></tr>
              <tr><th scope="row"><a href="${BASE}begriffe/output/">Output</a></th><td>Welche direkte Leistung entsteht?</td><td>Produkte, Beratungen, Kurse, Infrastruktur, Reichweite, Teilnehmende, bereitgestellte Dienste.</td><td>Output ist eine Leistung, noch keine WÖk-Wirkung.</td></tr>
              <tr><th scope="row"><a href="${BASE}begriffe/outcome/">Outcome</a></th><td>Was verändert sich bei Betroffenen oder in Systemen?</td><td>Wissen, Fähigkeiten, Verhalten, Gesundheit, Lebenslage, Zugang, Sicherheit, Vertrauen, Ressourcenverbrauch.</td><td>Eine tatsächliche Zustandsveränderung kann eine WÖk-Wirkung sein; Zurechnung bleibt gesondert zu prüfen.</td></tr>
              <tr><th scope="row"><a href="${BASE}begriffe/impact/">Impact</a></th><td>Welche breiteren oder längerfristigen Wirkungen entstehen?</td><td>Gesellschaftliche, ökologische, institutionelle oder Marktveränderungen.</td><td>Nicht automatisch positiv; fachfeldabhängig genauer definieren.</td></tr>
            </tbody>
          </table>
        </div>
        <p class="notice"><strong>IOOI braucht ein Ziel.</strong> Es enthält keinen eigenen verbindlichen normativen Referenzrahmen. Anwenderinnen und Anwender müssen offenlegen, welche Outcomes und Impacts sie anstreben und woran sie diese bewerten.</p>
      </section>

      <section class="section section-soft" aria-labelledby="iooi-kann-title">
        <h2 id="iooi-kann-title">Was IOOI gut kann</h2>
        <p>IOOI hilft, Projekte und Programme verständlich zu strukturieren, Ressourcen von Leistungen und Veränderungen zu unterscheiden und Indikatoren sowie Annahmen entlang einer Ergebniskette zu ordnen. Das unterstützt Planung, Monitoring und Evaluation.</p>
        <h3>Was IOOI allein nicht festlegt</h3>
        <p>Das Akronym legt weder einen bestimmten Wirkmechanismus noch eine Methode zur Prüfung von Kausalität oder Beitrag fest. Auch normativer Referenzrahmen, nicht kompensierbare Schutzgrenzen, Bildung der Netto-Wirkung, gesonderte Systemprüfung und die Rückkopplung in Entscheidungen ergeben sich nicht aus den vier Buchstaben. Sie können im jeweiligen Evaluations- oder Managementdesign ergänzt werden.</p>
        <p>Wirkung ist neutral und relational: eine tatsächliche Zustandsveränderung. Ihre Bewertung kann positiv, negativ, neutral oder ambivalent sein; bei unzureichender Evidenz bleibt sie offen. Ziel ist <strong>positive Netto-Wirkung</strong>. Globale Referenzen sind Agenda 2030 und SDGs; SDG+ ist eine WÖk-eigene Erweiterung. Für deutsche öffentliche und regulatorische Fälle ist zusätzlich die DNS relevant, soweit sachlich anwendbar. Recht, Grundrechte und Fachstandards konkretisieren die Prüfung. Ziel- oder Indikatorbezug ist kein Kausalitätsnachweis.</p>
        <p>Eine ex-ante Einordnung heißt ausdrücklich <strong>modellierte Wirkungsbewertung</strong>. Nichtkompensation schützt harte Grenzen; Reverse Merit Order macht schwerwiegende Defizite vorrangig sichtbar. Vorteile an anderer Stelle können sie nicht unsichtbar machen.</p>
      </section>
      ${renderIooiPrecision()}
      <section class="section" aria-labelledby="transformation-title">
        <h2 id="transformation-title">Impact ist nicht Transformationswirkung - aber kann sie berühren</h2>
        <p><strong>Impact ist ein externer, quellenabhängiger Begriff.</strong> Je nach Methode kann er breitere, langfristige oder systemische Veränderungen umfassen. IOOI endet deshalb nicht grundsätzlich vor System- oder Transformationswirkung. Auch die <a href="https://www.oecd.org/en/topics/sub-issues/development-co-operation-evaluation-and-effectiveness/evaluation-criteria.html">OECD-DAC-Evaluationskriterien</a> untersuchen unter Impact weiterreichende und transformative Veränderungen.</p>
        <p>Die WÖk macht <strong>Transformationswirkung ausdrücklich zu einer eigenen, evidenzpflichtigen Systemfrage</strong>: Verändern sich Regeln, Standards, Anreize, Infrastrukturen, Märkte, Machtverhältnisse oder künftige Entscheidungspfade? In welche Richtung, für wen und mit welcher Evidenz? Eine erwartete strukturelle Veränderung bleibt Transformationspotenzial.</p>
        <p>Transformation ist keine automatische Stufe nach Impact. Ihre Richtung wird gesondert bewertet. Nicht jede längerfristige Veränderung ist transformativ, und nicht jede Transformation ist positiv.</p>
      </section>
      <section class="section section-muted" aria-labelledby="vergleich-title">
        <h2 id="vergleich-title">Unterschiedliche Fragen, keine Rangliste</h2>
        <p>IOOI kann für seine konkrete Frage sehr gut geeignet sein. Die WÖk beansprucht nicht, IOOI, Theory of Change oder Impact Management zu ersetzen.</p>
        ${ComparisonTable({"caption":"IOOI und WÖk: Aufgaben und Umfang","columns":["Frage","IOOI / Results Chain","WÖk-Wirkungsarchitektur"],"rows":[["Hauptzweck","Eine Ergebniskette strukturieren.","Wirkpfade analysieren, prüfen, bewerten, absichern und in Entscheidungen zurückführen."],["Darstellungslogik","Ressourcen, Leistungen und Veränderungen; keine Kausalitätsgarantie.","Pfad oder Netz mit querliegenden Prüf- und Bewertungsebenen."],["Mechanismen / Annahmen","Können im Planungs- und Evaluationsdesign ergänzt werden.","Explizite Hypothesen über Verbindungen und Bedingungen."],["Evidenz / Zurechnung","Hängt vom Evaluationsdesign ab.","Explizite Prüfung von Baseline, Gegenfaktum, Beitrag und Unsicherheit."],["Referenzrahmen / Bewertung","Vom verwendeten Rahmen und Anwendungszweck abhängig.","Offengelegte Referenzen, Mensch-Planet-Demokratie, Recht und Kontextnormen."],["Nebenfolgen / Grenzen","Können berücksichtigt werden; das Akronym legt Schutzregeln nicht fest.","Netto-Wirkung, Nichtkompensation und Reverse Merit Order."],["System- / Transformationswirkung","Impact kann je nach Rahmen systemische Veränderungen umfassen.","Eigene evidenzpflichtige Systemfrage; Richtung gesondert bewerten."],["Rückkopplung / Steuerung","Projektlernen und Management sind möglich.","Bewertung mit wirtschaftlichen, staatlichen und gesellschaftlichen Entscheidungen verbinden."],["Governance / Versionierung","Kann im jeweiligen Verfahren geregelt werden.","Expliziter Bestandteil der Architektur: Transparenz, Audit, Rechtsschutz, Lernen."]]})}
      </section>

      <section class="section section-soft" aria-labelledby="beispiele-title">
        <div class="section-header"><p class="hero-kicker">Drei Anwendungsbilder</p><h2 id="beispiele-title">Vom Projekt, Produkt und Narrativ zur Steuerungsfrage</h2></div>
        <div class="card-grid three">
          <article class="card"><p class="card-kicker">Bildungsprojekt</p><h3 class="card-title">Nicht nur Kurse zählen</h3><p class="card-text"><strong>IOOI:</strong> Budget, Team und Lernplattform ermöglichen Kurse und Teilnahmen. Kompetenz- und Teilhabeveränderungen sind Outcome; langfristige Bildungs- und Arbeitsmarktfolgen können Impact sein.</p><p class="card-text"><strong>WÖk:</strong> Wer wurde erreicht, was wäre ohnehin passiert, wie dauerhaft ist der Effekt und welche Bedeutung hat er für SDG 4, SDG 8 und SDG 10? Daraus folgen Budget-, Skalierungs- und Bildungspolitikentscheidungen.</p></article>
          <article class="card"><p class="card-kicker">Produkt: Apfel</p><h3 class="card-title">Ein Kilogramm ist kein Wirkungsurteil</h3><p class="card-text"><strong>IOOI:</strong> Wasser, Fläche, Arbeit, Energie und Material führen zu einem verkaufsfähigen Produkt. Nutzung und Produktion haben Folgen für Einkommen, Ernährung, Ressourcen und Gesundheit.</p><p class="card-text"><strong>WÖk:</strong> Scorecard, WÖk-IDs, Benchmarks und Schutzregeln prüfen Lieferkette, Wasserstress, Biodiversität, Klima und Arbeitsbedingungen. Die Bewertung kann Preis- und Beschaffungsentscheidungen verändern.</p></article>
          <article class="card"><p class="card-kicker">Desinformation</p><h3 class="card-title">Reichweite ist nicht positive Wirkung</h3><p class="card-text"><strong>Möglicher Wirkungspfad:</strong> Budget, Inhalte, Bots und Plattformmechaniken erzeugen Views, Shares und Kommentare. Ob sich Überzeugungen oder Vertrauen verändern, ist eine eigene Evidenzfrage.</p><p class="card-text"><strong>WÖk:</strong> Plausible demokratische Wirkungsrisiken werden am Referenzrahmen geprüft. Erst bei belegter Veränderung wird von eingetretener Wirkung gesprochen; daraus können Transparenz-, Medien- und Plattformregeln folgen.</p></article>
        </div>
      </section>

      <section class="section" aria-labelledby="methodenkarte-title">
        <div class="section-header"><p class="hero-kicker">Methodenkarte</p><h2 id="methodenkarte-title">Welche Methode beantwortet welche Frage?</h2></div>
        <div class="card-grid four">
          <article class="card"><h3 class="card-title">IOOI / Results Chain</h3><p class="card-text">Wie führen Ressourcen über Leistungen zu Veränderungen und höherstufiger Wirkung?</p></article>
          <article class="card"><h3 class="card-title">Theory of Change</h3><p class="card-text">Warum und unter welchen Annahmen, Kontexten und Mechanismen sollte dieser Wirkpfad funktionieren?</p></article>
          <article class="card"><h3 class="card-title">Impact Frontiers</h3><p class="card-text">Was verändert sich, wer ist betroffen, wie viel, welchen Beitrag leistet die Organisation und welches Risiko besteht?</p></article>
          <article class="card"><h3 class="card-title">SROI / T-SROI</h3><p class="card-text">Welche gesellschaftlichen Werte sind monetarisierbar, und welche Netto- und Transformationswirkung wird zusätzlich sichtbar?</p></article>
          <article class="card"><h3 class="card-title">ESRS, GRI, CSRD</h3><p class="card-text">Welche Daten, Kennzahlen und Offenlegungen stehen für Berichterstattung und Steuerung zur Verfügung?</p></article>
          <article class="card"><h3 class="card-title">Agenda 2030 / SDGs / SDG+</h3><p class="card-text">An welchem transparenten Ziel- und Referenzrahmen wird Wirkung eingeordnet?</p></article>
          <article class="card"><h3 class="card-title">Wirkungsökonomie</h3><p class="card-text">Wie werden Wirkpfad, Evidenz, Maßstab, Bewertung, Schutzregeln, Transformation, Governance und Rückkopplung verbunden?</p></article>
          <article class="card"><h3 class="card-title">Impact-Controlling</h3><p class="card-text">Wie fließen Daten und Bewertungen in Strategie, Investitionen, CAPEX, OPEX, Produktentwicklung, Lieferkette und Beschaffung?</p></article>
        </div>
      </section>

      <section class="section section-muted" aria-labelledby="weiter-title">
        <div class="section-header"><p class="hero-kicker">Weiterlernen</p><h2 id="weiter-title">Begriffe, Praxis und Quellen</h2></div>
        <div class="card-grid three">
          <article class="card"><h3 class="card-title">Glossar</h3><p class="card-text">IOOI, Input, Output, Outcome, Impact, Wirkungstreppe, Referenzrahmen und Wirkungsbewertung sind miteinander verknüpft.</p><a class="text-link" href="${BASE}begriffe/iooi/">IOOI im Glossar</a></article>
          <article class="card"><h3 class="card-title">Unternehmen</h3><p class="card-text">Vom Projektmodell über die Evidenz zur Scorecard und Managemententscheidung.</p><a class="text-link" href="${BASE}fuer/unternehmen/impact-controlling/">Impact-Controlling ansehen</a></article>
          <article class="card"><h3 class="card-title">Akademie</h3><p class="card-text">Lernpfad zu Wirkung, Evidenz, Referenzrahmen, Nichtkompensation und Rückkopplung.</p><a class="text-link" href="${BASE}akademie.html">Akademie öffnen</a></article>
        </div>
        <p class="notice"><strong>Quellen:</strong> <a href="https://one.oecd.org/document/DCD/DAC/EV%282022%292/en/pdf">OECD DAC: Glossary of Key Terms in Evaluation and Results-Based Management</a>, <a href="https://impactfrontiers.org/norms/five-dimensions-of-impact/">Impact Frontiers: Five Dimensions of Impact</a>, <a href="https://www.phineo.org/magazin/glossar-grundbegriffe-wirkungsorientierung">PHINEO: Grundbegriffe der Wirkungsorientierung</a>, <a href="https://www.bertelsmann-stiftung.de/de/unsere-projekte/abgeschlossene-projekte/cri-corporate-responsibility-index/projektthemen/die-iooi-methode">Bertelsmann Stiftung: Die iooi-Methode</a> und <a href="https://sdgs.un.org/2030agenda">Vereinte Nationen: Agenda 2030</a>. Die WÖk-spezifische Einordnung steht im <a href="${BASE}begriffe/wirkung/">Glossar</a> und im führenden Begriffsleitfaden.</p>
      </section>
    </main>
${renderFooter(BASE)}
    <script src="${BASE}assets/js/main.js?v=20260612-mobile-table-fix"></script>
  </body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html);
console.log("Built verstehen/iooi-und-wirkungsoekonomie/index.html.");
