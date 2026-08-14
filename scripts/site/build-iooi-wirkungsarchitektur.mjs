import fs from "node:fs";
import path from "node:path";

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

const schema = {
  "@context": "https://schema.org",
  "@type": ["Article", "LearningResource"],
  headline: "IOOI und Wirkungsökonomie: Vom Wirkpfad zur Steuerungsarchitektur",
  description: "IOOI beschreibt Input, Output, Outcome und Impact. Die Wirkungsökonomie ergänzt Referenzrahmen, Netto-Wirkung, Wirkungsgrenzen, Transformationswirkung und Rückkopplung.",
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
    <title>IOOI erklärt: Input, Output, Outcome, Impact – und was die Wirkungsökonomie ergänzt</title>
    <meta name="description" content="IOOI beschreibt den Weg von Ressourcen zu Wirkung. Die Wirkungsökonomie ergänzt Referenzrahmen, Netto-Wirkung, Wirkungsgrenzen, Transformationswirkung und Rückkopplung in reale Entscheidungen.">
    <meta name="search_title" content="IOOI und Wirkungsökonomie">
    <meta name="search_description" content="Input, Output, Outcome und Impact als Wirkpfad – ergänzt um Bewertung, Schutzregeln und Rückkopplung.">
    <meta name="search_section" content="Verstehen">
    <meta name="search_type" content="Methodenerklärung">
    <link rel="canonical" href="https://wirkungsoekonomie.de/verstehen/iooi-und-wirkungsoekonomie/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="IOOI erklärt: Input, Output, Outcome, Impact – und was die Wirkungsökonomie ergänzt">
    <meta property="og:description" content="IOOI beschreibt den Weg von Ressourcen zu Wirkung. Die Wirkungsökonomie ergänzt Referenzrahmen, Netto-Wirkung, Wirkungsgrenzen, Transformationswirkung und Rückkopplung.">
    <meta property="og:url" content="https://wirkungsoekonomie.de/verstehen/iooi-und-wirkungsoekonomie/">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="IOOI und Wirkungsökonomie">
    <meta name="twitter:description" content="Vom Wirkpfad zur Steuerungsarchitektur.">
    <link rel="icon" href="${BASE}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${BASE}assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body>
${renderHeader(BASE)}
    <main data-search-content>
      <section class="hero compact-hero" data-no-glossary>
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${BASE}index.html">Start</a><span aria-hidden="true">/</span><a href="${BASE}verstehen/">Verstehen</a><span aria-hidden="true">/</span><span>IOOI und Wirkungsökonomie</span></nav>
        <p class="hero-kicker">Methodenarchitektur</p>
        <h1>IOOI und Wirkungsökonomie: Vom Wirkpfad zur Steuerungsarchitektur</h1>
        <p class="hero-subtitle">IOOI erklärt, wie aus Ressourcen Leistungen, Veränderungen und breitere Wirkungen entstehen können. Die Wirkungsökonomie verbindet diesen Pfad mit einem transparenten Maßstab, Schutzregeln und Konsequenzen für die nächste Entscheidung.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#wirkungsrad">Wirkungsrad verstehen</a>
          <a class="btn btn-secondary" href="#iooi">IOOI erklären</a>
          <a class="hero-secondary-link" href="${BASE}begriffe/iooi/">IOOI im Glossar</a>
        </div>
      </section>

      <section class="section section-soft" aria-labelledby="kurzformel-title">
        <div class="section-header compact">
          <p class="hero-kicker">Die Kurzformel</p>
          <h2 id="kurzformel-title">Wirkung ist zuerst eine Zustandsveränderung.</h2>
          <p><strong>Wirkung ist die tatsächliche Veränderung von Zuständen. Sie kann positiv, negativ oder neutral sein.</strong> Die Wirkungsökonomie bewertet Wirkung am Referenzrahmen der SDGs, der Agenda 2030 und SDG+ und richtet Wirtschaft, Politik, Kapital, Medien und Entscheidungen auf positive Netto-Wirkung für Mensch, Planet und Demokratie aus.</p>
          <p><strong>Nicht alles, was wirkt, ist erwünscht.</strong> Deshalb reicht es nicht, Wirkung zu messen. Man muss auch offenlegen, woran man sie misst.</p>
        </div>
      </section>

      <section class="section" id="wirkungsrad" aria-labelledby="wirkungsrad-title">
        <div class="section-header">
          <p class="hero-kicker">Lernende Gesamtarchitektur</p>
          <h2 id="wirkungsrad-title">Das WÖk-Wirkungsrad: ermitteln, bewerten, rückkoppeln</h2>
          <p>Die Treppe erklärt einen Pfad. Das Wirkungsrad erklärt ein lernendes System: Eine Entscheidung verändert den Systemzustand, der wieder zur Ausgangslage der nächsten Entscheidung wird.</p>
        </div>
        <figure class="woek-visual-figure">
          <picture>
            <source media="(max-width: 760px)" srcset="${BASE}assets/visuals/model/woek_wirkungskreislauf_iooi_mobile.svg" type="image/svg+xml">
            <img class="woek-visual" src="${BASE}assets/visuals/model/woek_wirkungskreislauf_iooi.svg" alt="WÖk-Wirkungskreislauf: Vorwirkung mit Auslöser, Wirkungspotenzial und Wirkmechanismus; IOOI-Wirkpfad; Wirkungsermittlung und Folgen; Bewertung am Referenzrahmen; Schutz, Rückkopplung und Lernen." loading="lazy" decoding="async">
          </picture>
          <figcaption>Die Grafik fasst die Architektur zusammen. Die folgenden Abschnitte sind ihre vollständige Textalternative.</figcaption>
        </figure>
        <div class="card-grid three" aria-label="Drei Kernphasen der Wirkungsökonomie">
          <article class="card"><p class="card-kicker">1. Wirkung ermitteln</p><h3 class="card-title">Was verändert sich tatsächlich?</h3><p class="card-text">Vorwirkung, IOOI, Wirkungsempfänger, Raum, Reichweite, Dauer, Zurechnung, Nebenfolgen und Datenqualität machen den Wirkpfad prüfbar.</p></article>
          <article class="card"><p class="card-kicker">2. Wirkung bewerten</p><h3 class="card-title">Gemessen woran?</h3><p class="card-text">Agenda 2030, SDGs und SDG+ geben die Richtung an. Fachstandards, Recht und wissenschaftliche Schwellen können sie konkretisieren.</p></article>
          <article class="card"><p class="card-kicker">3. Wirkung rückkoppeln</p><h3 class="card-title">Was folgt für die nächste Entscheidung?</h3><p class="card-text">Bewertete Wirkung verändert Preise, Steuern, Kapital, Förderung, Beschaffung, Management, Haushalt und Regulierung.</p></article>
        </div>
      </section>

      <section class="section section-muted" aria-labelledby="vorwirkung-title">
        <div class="section-header">
          <p class="hero-kicker">Vor der Wirkung beginnen</p>
          <h2 id="vorwirkung-title">Plausible Wirkung ist noch kein Wirkungsnachweis.</h2>
          <p>Die Wirkungsökonomie beginnt nicht erst dort, wo Wirkung eingetreten ist. Sie trennt sorgfältig den Raum möglicher Wirkung von der späteren Feststellung tatsächlicher Veränderung.</p>
        </div>
        <div class="card-grid five">
          <article class="card"><h3 class="card-title">Auslöser</h3><p class="card-text">Handlung, Unterlassen, Produkt, Gesetz, Preis, Narrativ, Technologie, Kapitalfluss oder Ereignis.</p></article>
          <article class="card"><h3 class="card-title">Wirkstoff</h3><p class="card-text">Didaktische Analogie für einen Auslöser mit Wirkungspotenzial, nicht Wirkung selbst.</p></article>
          <article class="card"><h3 class="card-title">Wirkungspotenzial</h3><p class="card-text">Möglichkeit, dass positive, negative, neutrale oder ambivalente Wirkung entsteht.</p></article>
          <article class="card"><h3 class="card-title">Wirkungsrisiko</h3><p class="card-text">Möglichkeit negativer, unerwünschter oder systemisch destabilisierender Wirkung.</p></article>
          <article class="card"><h3 class="card-title">Wirkmechanismus</h3><p class="card-text">Plausible Erklärung, wie eine Veränderung entstehen kann. Noch kein Kausalbeweis.</p></article>
        </div>
        <p class="notice"><strong>Für Medien, Sprache und Politik gilt besondere Vorsicht:</strong> Ohne empirischen Nachweis sprechen wir von Wirkungspotenzial, Wirkungsrisiko, Wirkmechanismus, Resonanzraum oder Wirkpfad – nicht von gesicherter Wirkung.</p>
      </section>

      <section class="section" id="iooi" aria-labelledby="iooi-title">
        <div class="section-header">
          <p class="hero-kicker">IOOI-Wirkpfad</p>
          <h2 id="iooi-title">Input → Output → Outcome → Impact</h2>
          <p><strong>IOOI steht für Input, Output, Outcome und Impact.</strong> Es beschreibt den Weg von eingesetzten Ressourcen über erbrachte Leistungen zu eingetretenen Veränderungen und höherstufigen Wirkungen. Aktivität gehört logisch zwischen Input und Output, ist aber kein Buchstabe im Akronym.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th scope="col">Stufe</th><th scope="col">Frage</th><th scope="col">Beispiele</th><th scope="col">Klare Abgrenzung</th></tr></thead>
            <tbody>
              <tr><th scope="row"><a href="${BASE}begriffe/input/">Input</a></th><td>Welche Ressourcen werden eingesetzt?</td><td>Geld, Zeit, Personal, Material, Energie, Infrastruktur, Wissen, Daten, natürliche Ressourcen.</td><td>Ressourceneinsatz, noch keine Wirkung.</td></tr>
              <tr><th scope="row"><a href="${BASE}begriffe/aktivitaet/">Aktivität</a></th><td>Was wird tatsächlich getan?</td><td>Projekt, Produktion, Dienstleistung, Gesetz, Kommunikation, Investition, Förderung oder Beschaffung.</td><td>Handlung zwischen Input und Output.</td></tr>
              <tr><th scope="row"><a href="${BASE}begriffe/output/">Output</a></th><td>Welche direkte Leistung entsteht?</td><td>Produkte, Beratungen, Kurse, Infrastruktur, Reichweite, Teilnehmende, bereitgestellte Dienste.</td><td>Output ist noch nicht automatisch Wirkung.</td></tr>
              <tr><th scope="row"><a href="${BASE}begriffe/outcome/">Outcome</a></th><td>Was verändert sich bei Betroffenen oder in Systemen?</td><td>Wissen, Fähigkeiten, Verhalten, Gesundheit, Lebenslage, Zugang, Sicherheit, Vertrauen, Ressourcenverbrauch.</td><td>Outcome ist bereits eine Wirkungsebene.</td></tr>
              <tr><th scope="row"><a href="${BASE}begriffe/impact/">Impact</a></th><td>Welche breiteren oder längerfristigen Wirkungen entstehen?</td><td>Gesellschaftliche, ökologische, institutionelle oder Marktveränderungen.</td><td>Nicht automatisch positiv; fachfeldabhängig genauer definieren.</td></tr>
            </tbody>
          </table>
        </div>
        <p class="notice"><strong>IOOI braucht ein Ziel.</strong> Es enthält keinen eigenen verbindlichen normativen Referenzrahmen. Anwenderinnen und Anwender müssen offenlegen, welche Outcomes und Impacts sie anstreben und woran sie diese bewerten.</p>
      </section>

      <section class="section section-soft" aria-labelledby="verstehen-title">
        <div class="section-header">
          <p class="hero-kicker">Wirkung verstehen</p>
          <h2 id="verstehen-title">Vom Wirkpfad zur belastbaren Analyse</h2>
          <p>IOOI lässt sich durch etablierte Evaluations- und Impact-Management-Fragen vertiefen. Sie klären, was tatsächlich entstanden ist – für wen, wo, wie stark, wie lange und wodurch.</p>
        </div>
        <div class="card-grid three">
          <article class="card"><h3 class="card-title">Wer und wo?</h3><p class="card-text">Wirkungsempfänger, unsichtbare Betroffene, Generationen, Ökosysteme, Institutionen, Wirkungsraum und Lieferkette sichtbar machen.</p></article>
          <article class="card"><h3 class="card-title">Wie viel und wie lange?</h3><p class="card-text">Reichweite, Intensität, Dauer und Wirkungsordnungen prüfen. Eine große Reichweite ist nicht automatisch eine starke Veränderung.</p></article>
          <article class="card"><h3 class="card-title">Wodurch und mit welcher Sicherheit?</h3><p class="card-text">Baseline, Counterfactual, Attribution, Kontribution, Datenqualität, Unsicherheit und Wirkungsrisiko offenlegen.</p></article>
          <article class="card"><h3 class="card-title">Was wirkt daneben?</h3><p class="card-text">Nebenwirkung, Wechselwirkung, Displacement und Rebound erfassen. Positive Teilwirkungen können erhebliche Schäden nicht unsichtbar machen.</p></article>
          <article class="card"><h3 class="card-title">Was verändert sich weiter?</h3><p class="card-text">Rückkopplungen, Lernprozesse, Systemfolgen, Lock-ins und Spillover machen aus einer linearen Kette ein Wirkungsnetz.</p></article>
          <article class="card"><h3 class="card-title">Was bleibt offen?</h3><p class="card-text">Modellwerte, Proxies, Schätzungen und Evidenzlücken sichtbar halten. Zurechnung ohne Scheingenauigkeit ist besser als falsche Präzision.</p></article>
        </div>
      </section>

      <section class="section" aria-labelledby="bewertung-title">
        <div class="section-header">
          <p class="hero-kicker">Wirkung bewerten</p>
          <h2 id="bewertung-title">Wirkung braucht einen Maßstab.</h2>
          <p>Eine Desinformationskampagne kann wirksam sein. Ein suchtverstärkendes Geschäftsmodell kann wirksam sein. Ein fossiles Produkt kann wirtschaftlich erfolgreich sein. Wirksamkeit allein beantwortet deshalb nicht, ob eine Entwicklung gesellschaftlich erwünscht ist.</p>
        </div>
        <div class="impact-process" aria-label="Ablauf der Wirkungsbewertung">
          <article class="impact-process__step"><span class="impact-process__index">1</span><h3>Was verändert sich?</h3><p>Wirkungsermittlung: Daten, Wirkpfad und Evidenz.</p></article>
          <article class="impact-process__step"><span class="impact-process__index">2</span><h3>Gemessen woran?</h3><p><a href="${BASE}begriffe/referenzrahmen/">Referenzrahmen</a>: Agenda 2030, SDGs, SDG+ und passende Fachreferenzen.</p></article>
          <article class="impact-process__step"><span class="impact-process__index">3</span><h3>Wie ist sie einzuordnen?</h3><p>Positiv, neutral oder negativ – transparent begründet.</p></article>
          <article class="impact-process__step"><span class="impact-process__index">4</span><h3>Was bleibt unter allen Folgen?</h3><p>Netto-Wirkung unter Berücksichtigung von Risiken, Verlagerungen und Nebenfolgen.</p></article>
          <article class="impact-process__step"><span class="impact-process__index">5</span><h3>Gibt es Grenzen?</h3><p>Wirkungsgrenzen und Nichtkompensation schützen vor Schönrechnung.</p></article>
          <article class="impact-process__step"><span class="impact-process__index">6</span><h3>Was folgt?</h3><p>Transformationsprüfung und Rückkopplung in die nächste Entscheidung.</p></article>
        </div>
        <p>Die SDGs sind ein außergewöhnlich breit international vereinbarter Zielrahmen. <a href="${BASE}begriffe/sdg-plus/">SDG+</a> ist die transparente WÖk-Erweiterung für systemische Voraussetzungen wie Demokratie, Rechtsstaatlichkeit, Informationsqualität, digitale Selbstbestimmung, institutionelles Vertrauen und Resilienz. Fachstandards wie ESRS, GRI, ISO, ILO, gesetzliche Grenzwerte und wissenschaftliche Schwellen liefern Daten, Messgrößen und operative Konkretisierung; sie sind nicht automatisch der normative Oberrahmen.</p>
      </section>

      <section class="section section-muted" aria-labelledby="schutz-title">
        <div class="section-header">
          <p class="hero-kicker">Netto-Wirkung und Schutz</p>
          <h2 id="schutz-title">Zusammenführen, ohne schwere Schäden wegzurechnen</h2>
          <p><a href="${BASE}begriffe/netto-wirkung/">Netto-Wirkung</a> ist keine einfache Addition. Sie führt positive und negative Wirkungen unter Berücksichtigung von Grenzen, Unsicherheit, Nebenfolgen und Nichtkompensation zusammen.</p>
        </div>
        <div class="card-grid three">
          <article class="card"><h3 class="card-title">Wirkungsgrenzen</h3><p class="card-text">Menschenwürde, Kinder- und Zwangsarbeit, schwere Gesundheitsgefahren, irreversible ökologische Schäden, Biodiversitätskipprisiken und Rechtsstaatsabbau sind nicht beliebig verrechenbar.</p></article>
          <article class="card"><h3 class="card-title">Reverse Merit Order</h3><p class="card-text">Ein schweres Defizit in einem zentralen Wirkungsfeld darf nicht durch gute Werte an anderer Stelle unsichtbar gemacht werden.</p></article>
          <article class="card"><h3 class="card-title">Transformationswirkung</h3><p class="card-text">Sie prüft, ob Regeln, Standards, Anreize, Märkte, Institutionen oder Handlungspfade dauerhaft verändert werden.</p></article>
        </div>
      </section>

      <section class="section" aria-labelledby="vergleich-title">
        <div class="section-header"><p class="hero-kicker">Faire Einordnung</p><h2 id="vergleich-title">IOOI / Wirkungstreppe und Wirkungsökonomie</h2><p>Die Ansätze erfüllen unterschiedliche Aufgaben. Die WÖk beansprucht nicht, IOOI, Theory of Change oder Impact Management zu ersetzen.</p></div>
        <div class="table-wrap"><table>
          <thead><tr><th scope="col">Frage</th><th scope="col">IOOI / Wirkungstreppe</th><th scope="col">Wirkungsökonomie</th></tr></thead>
          <tbody>
            <tr><th scope="row">Hauptzweck</th><td>Wirkpfad strukturieren.</td><td>Wirkung ermitteln, bewerten und rückkoppeln.</td></tr>
            <tr><th scope="row">Input, Output, Outcome, Impact</th><td>Ja.</td><td>Ja, als Teil der Wirkungsermittlung.</td></tr>
            <tr><th scope="row">Baseline, Attribution, Kontribution</th><td>Je nach Anwendung ergänzbar.</td><td>Explizite Evidenzfragen.</td></tr>
            <tr><th scope="row">Negative und unbeabsichtigte Wirkung</th><td>Integrierbar.</td><td>Systematisch mitzuerfassen.</td></tr>
            <tr><th scope="row">Normativer Rahmen</th><td>Vom jeweiligen Anwender festzulegen.</td><td>Agenda 2030, SDGs, SDG+ sowie offen ausgewiesene ergänzende Referenzen.</td></tr>
            <tr><th scope="row">Netto-Wirkung und Schutz</th><td>Kein Kernbestandteil des Akronyms.</td><td>Wirkungsgrenzen, Nichtkompensation und Reverse Merit Order als Schutzlogik.</td></tr>
            <tr><th scope="row">Rückkopplung</th><td>Projektlernen und Management sind möglich.</td><td>Bewertung wird systematisch in Preise, Steuern, Kapital, Förderung, Beschaffung, Haushalt, Management und Regulierung zurückgeführt.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="section section-soft" aria-labelledby="beispiele-title">
        <div class="section-header"><p class="hero-kicker">Drei Anwendungsbilder</p><h2 id="beispiele-title">Vom Projekt, Produkt und Narrativ zur Steuerungsfrage</h2></div>
        <div class="card-grid three">
          <article class="card"><p class="card-kicker">Bildungsprojekt</p><h3 class="card-title">Nicht nur Kurse zählen</h3><p class="card-text"><strong>IOOI:</strong> Budget, Team und Lernplattform ermöglichen Kurse und Teilnahmen. Kompetenz- und Teilhabeveränderungen sind Outcome; langfristige Bildungs- und Arbeitsmarktfolgen können Impact sein.</p><p class="card-text"><strong>WÖk:</strong> Wer wurde erreicht, was wäre ohnehin passiert, wie dauerhaft ist der Effekt und welche Bedeutung hat er für SDG 4, SDG 8 und SDG 10? Daraus folgen Budget-, Skalierungs- und Bildungspolitikentscheidungen.</p></article>
          <article class="card"><p class="card-kicker">Produkt: Apfel</p><h3 class="card-title">Ein Kilogramm ist kein Wirkungsurteil</h3><p class="card-text"><strong>IOOI:</strong> Wasser, Fläche, Arbeit, Energie und Material führen zu einem verkaufsfähigen Produkt. Nutzung und Produktion haben Folgen für Einkommen, Ernährung, Ressourcen und Gesundheit.</p><p class="card-text"><strong>WÖk:</strong> Scorecard, WÖk-IDs, Benchmarks und Schutzregeln prüfen Lieferkette, Wasserstress, Biodiversität, Klima und Arbeitsbedingungen. Die Bewertung kann Preis- und Beschaffungsentscheidungen verändern.</p></article>
          <article class="card"><p class="card-kicker">Desinformation</p><h3 class="card-title">Reichweite ist nicht positive Wirkung</h3><p class="card-text"><strong>Vorwirkung und IOOI:</strong> Budget, Inhalte, Bots und Plattformmechaniken erzeugen Views, Shares und Kommentare. Ob sich Überzeugungen oder Vertrauen verändern, ist eine eigene Evidenzfrage.</p><p class="card-text"><strong>WÖk:</strong> Plausible demokratische Wirkungsrisiken werden am Referenzrahmen geprüft. Erst bei belegter Veränderung wird von eingetretener Wirkung gesprochen; daraus können Transparenz-, Medien- und Plattformregeln folgen.</p></article>
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
