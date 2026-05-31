import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const markerStart = "<!-- stage7-impact-field-bridge:start -->";
const markerEnd = "<!-- stage7-impact-field-bridge:end -->";

const clusters = [
  {
    title: "Alltag & Grundbedürfnisse",
    text: "Lebensbereiche, in denen Wirkung unmittelbar in Alltag, Teilhabe, Sicherheit, Gesundheit, Wohnen, Bildung, Arbeit und sozialer Stabilität spürbar wird.",
    fields: ["bildung", "gesundheit-pflege", "wohnen-stadt", "arbeit-einkommen", "rente-soziale-sicherung"],
  },
  {
    title: "Wirtschaft & Kapital",
    text: "Bereiche, in denen Unternehmen, Produkte, Lieferketten, Preise, Finanzierung, Risiko und Kapitalflüsse positive Netto-Wirkung wahrscheinlicher machen sollen.",
    fields: ["wirtschaft-unternehmen", "produkte-konsum", "finanzsystem-kapital"],
  },
  {
    title: "Staat & Demokratie",
    text: "Institutionelle Wirkungsräume für Recht, Haushalt, Verwaltung, demokratische Legitimation, Rechtsschutz und öffentliche Verantwortung.",
    fields: ["staat-recht-demokratie"],
  },
  {
    title: "Öffentlichkeit & Wissen",
    text: "Räume, in denen Lernen, Medienqualität, Wissenschaft, Innovation, Digitalisierung, Kultur, Identität und demokratische Resonanz entstehen.",
    fields: ["medien-oeffentlichkeit", "wissenschaft-innovation-digitalisierung", "kultur-identitaet-resonanz"],
  },
  {
    title: "Planet & Resilienz",
    text: "Ökologische Lebensgrundlagen, Energie, Ressourcen, Biodiversität, Klima und Resilienz als Grenze und Voraussetzung aller anderen Wirkungsfelder.",
    fields: ["klima-energie-ressourcen"],
  },
];

const fields = [
  {
    slug: "bildung",
    title: "Bildung",
    short: "Bildung als Wirkungsinfrastruktur: Schule, Fächer, Bewertung, Wirkungskompetenz, Fach Zukunft, Förderung und digitale Mündigkeit neu denken.",
    dimensions: ["Mensch", "Demokratie"],
    status: "Live",
    tools: [["Wirkungsportfolio", "werkzeuge/wirkungsportfolio/"], ["Scorecards", "werkzeuge/scorecards/"], ["Wirkungshaushalt", "werkzeuge/wirkungshaushalt/"]],
    demos: [["WÖk-Kompass", "kompass.html"], ["Wirkungsscanner", "anwendungen/scanner.html"]],
    docs: [["Arbeitsbibliothek Bildung", "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/"], ["Referenz Bildung", "referenz/kapitel-067-bildung/"]],
    problem: "Bildung wird oft über Abschlüsse, Noten, Zuständigkeiten und Kosten betrachtet, obwohl sie Selbstwirksamkeit, Urteilskraft, Gesundheit, Teilhabe und Demokratie prägt.",
    visible: "Sichtbar werden Lernentwicklung, Wirkungskompetenz, Schutzräume, digitale Mündigkeit, Teilhabe und langfristige gesellschaftliche Resilienz.",
    pilot: "Wirkungsschulen, kommunale Bildungsnetzwerke, Wirkungsportfolios und präventive Förderlogiken.",
  },
  {
    slug: "gesundheit-pflege",
    title: "Gesundheit & Pflege",
    short: "Vom System, das Krankheit finanziert, zu einem System, das Gesundheit, Prävention, Pflege, Resilienz und Teilhabe erzeugt.",
    dimensions: ["Mensch", "Planet", "Demokratie"],
    status: "Live",
    tools: [["Gesundheitswirkungscheck", "wirkungsfelder/gesundheit-pflege/tools/gesundheitswirkungscheck/"], ["Pflegewirkungscheck", "wirkungsfelder/gesundheit-pflege/tools/pflegewirkungscheck/"], ["Wirkungshaushalt", "werkzeuge/wirkungshaushalt/"]],
    demos: [["Erleben", "erleben/"], ["Wirkungsscanner", "anwendungen/scanner.html"]],
    docs: [["Konzept Gesundheit & Pflege", "wirkungsfelder/gesundheit-pflege/konzept/"], ["Dossier Gesundheit & Pflege", "wirkungsfelder/gesundheit-pflege/dossier/"]],
    problem: "Gesundheit und Pflege werden häufig erst im Reparaturmodus finanziert; Prävention, Würde, psychische Stabilität und Quartierswirkung bleiben unterbelichtet.",
    visible: "Sichtbar werden Präventionsnutzen, Pflegequalität, Zugang, Würde, Teilhabe, One-Health-Bezüge und vermeidbare Folgekosten.",
    pilot: "Kommunale Gesundheitsräume, Präventionsbudgets, Pflegewirkungschecks und Gesundheitsdatenräume mit Privacy-by-Design.",
  },
  {
    slug: "wohnen-stadt",
    title: "Wohnen & Stadt",
    short: "Wohnen als Wirkungsraum: Bezahlbarkeit, Sicherheit, Gesundheit, Energie, Quartier, Boden und demokratische Teilhabe.",
    dimensions: ["Mensch", "Planet", "Demokratie"],
    status: "Live",
    tools: [["Scorecards", "werkzeuge/scorecards/"], ["Wirkungshaushalt", "werkzeuge/wirkungshaushalt/"], ["Datenqualität", "werkzeuge/datenqualitaet-assurance/"]],
    demos: [["Erleben", "erleben/"], ["WÖk-Kompass", "kompass.html"]],
    docs: [["Arbeitsbibliothek Wohnen", "werkstatt/arbeitsbibliothek/wirkungsfelder/wohnen-stadt/"], ["Dossier Wohnen", "blog/dossiers/wohnen.html"]],
    problem: "Wohnraum wird oft als Rendite-, Bau- oder Kostenfrage behandelt, obwohl er Gesundheit, Sicherheit, soziale Mischung, Energie und demokratische Teilhabe beeinflusst.",
    visible: "Sichtbar werden Mietbelastung, Verdrängung, Sanierungswirkung, Quartiersqualität, Bodenlogik, Hitzerisiken und soziale Stabilität.",
    pilot: "Wohnwirkungsindex, warmmietenneutrale Sanierung, Quartiersscorecards und kommunale Wirkungshaushalte.",
  },
  {
    slug: "arbeit-einkommen",
    title: "Arbeit & Einkommen",
    short: "Leistung, Einkommen, Automatisierung und Sinn neu denken, wenn Wirkung wichtiger wird als reine Erwerbslogik.",
    dimensions: ["Mensch", "Demokratie"],
    status: "Live",
    tools: [["T-SROI", "werkzeuge/t-sroi/"], ["Wirkungsfonds", "werkzeuge/wirkungsfonds/"], ["Impact Controlling", "werkzeuge/impact-controlling/"]],
    demos: [["Automatisierungs- und Wirkungseinkommensrechner", "erleben/automatisierungs-wirkungseinkommensrechner/"], ["Wirkungsscanner", "anwendungen/scanner.html"]],
    docs: [["Arbeitsbibliothek Arbeit", "werkstatt/arbeitsbibliothek/wirkungsfelder/arbeit-einkommen/"], ["Wenn Maschinen arbeiten", "dokumente/wenn-maschinen-arbeiten/"]],
    problem: "Einkommen, soziale Sicherung und Anerkennung hängen stark an Erwerbsarbeit, während Care, Bildung, Gemeinwesen und Automatisierungsgewinne unzureichend rückgekoppelt werden.",
    visible: "Sichtbar werden Wirkleistung, Automatisierungsdividenden, Care-Beiträge, Übergangsrisiken und soziale Stabilität.",
    pilot: "Wirkungseinkommen, Weiterbildungsfonds, Automatisierungsdividenden und regionale Übergangsarbeitsmärkte.",
  },
  {
    slug: "rente-soziale-sicherung",
    title: "Rente & soziale Sicherung",
    short: "Lebensleistung, Care, Bildung, Pflege und Generationenvertrag als Wirkungsfragen statt nur Beitragsbiografie.",
    dimensions: ["Mensch", "Demokratie"],
    status: "Live",
    tools: [["Wirkungsfonds", "werkzeuge/wirkungsfonds/"], ["T-SROI", "werkzeuge/t-sroi/"], ["Wirkungshaushalt", "werkzeuge/wirkungshaushalt/"]],
    demos: [["Wirkungsrenten-Rechner", "erleben/wirkungsrenten-rechner/"], ["Erleben", "erleben/"]],
    docs: [["Arbeitsbibliothek Rente", "werkstatt/arbeitsbibliothek/wirkungsfelder/rente-soziale-sicherung/"], ["Referenz Wirkungsrente", "referenz/kapitel-058-wirkungsrente/"]],
    problem: "Soziale Sicherung bewertet Lebensleistung oft über Beitragsbiografien und übersieht Care, Prävention, Bildung, Pflege und Generationenstabilität.",
    visible: "Sichtbar werden Lebenswirkung, Würdesicherung, Generationenvertrag, Automatisierungsrisiken und Korrekturpfade.",
    pilot: "Wirkungsrente, Lebenswirkungskonto, Renten-Impact-Fonds und sozial abgesicherte Übergangsmodelle.",
  },
  {
    slug: "wirtschaft-unternehmen",
    title: "Wirtschaft & Unternehmen",
    short: "Unternehmen als Wirkungssysteme: Führung, Strategie, Lieferketten, Impact Controlling, Kultur, Risiko und Transformation.",
    dimensions: ["Mensch", "Planet", "Demokratie"],
    status: "Live",
    tools: [["Impact Controlling", "werkzeuge/impact-controlling/"], ["NWI", "werkzeuge/netto-wirkungs-index/"], ["T-SROI", "werkzeuge/t-sroi/"]],
    demos: [["WÖk-Kompass", "kompass.html"], ["Scorecard-Dashboard", "scorecard-dashboard.html"]],
    docs: [["Arbeitsbibliothek Unternehmen", "werkstatt/arbeitsbibliothek/wirkungsfelder/wirtschaft-unternehmen/"], ["Wirkungsorientierte Unternehmensführung", "wirkungsfelder/wirtschaft-unternehmen/wirkungsorientierte-unternehmensfuehrung/"]],
    problem: "Unternehmen optimieren oft auf Umsatz, Kosten, Wachstum und Risiko, während externe Wirkungen, Lieferkettenfolgen und demokratische Nebenwirkungen getrennt bleiben.",
    visible: "Sichtbar werden Produkt-, Lieferketten-, Finanzierungs-, Governance- und Kulturwirkungen im Verhältnis zu Mensch, Planet und Demokratie.",
    pilot: "Impact Controlling, Produktportfolio-Prüfung, Wirkungsboni, KMU-Pfade und Lieferketten-Scorecards.",
  },
  {
    slug: "produkte-konsum",
    title: "Produkte & Konsum",
    short: "Produkte als Wirkungsträger: ehrliche Preise, Scorecards, Produktpässe, Lieferketten und Wirkungssteuer.",
    dimensions: ["Mensch", "Planet", "Demokratie"],
    status: "Live",
    tools: [["Scorecards", "werkzeuge/scorecards/"], ["Digitale Produktpässe", "werkzeuge/digitale-produktpaesse/"], ["Reverse Merit Order", "werkzeuge/reverse-merit-order/"]],
    demos: [["Produktwirkung erleben", "erleben/"], ["Scorecard-Dashboard", "scorecard-dashboard.html"]],
    docs: [["Produktbesteuerung durch Wirkung", "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/"], ["Apfelbeispiel", "wirkungsfelder/produkte-konsum/apfelbeispiel/"]],
    problem: "Preise zeigen viele Wirkungen von Produkten nicht: Klima, Wasser, Arbeit, Gesundheit, Lieferkettenrisiken und Entsorgung bleiben oft externalisiert.",
    visible: "Sichtbar werden Produktwirkung, Datenqualität, Lieferkettenbeiträge, rote Linien, Bonus-/Maluslogik und Verbraucherinformation.",
    pilot: "Produktscorecards, digitale Produktpässe, Wirkungsumsatzsteuer, Apfel- und Textilbeispiele.",
  },
  {
    slug: "finanzsystem-kapital",
    title: "Finanzsystem & Kapital",
    short: "Kapital als Wirkungskraft statt Selbstzweck: Risiko, Rendite, Fonds, Versicherbarkeit, Investitionswirkung und Transformation.",
    dimensions: ["Mensch", "Planet", "Demokratie"],
    status: "Live",
    tools: [["T-SROI", "werkzeuge/t-sroi/"], ["Wirkungsfonds", "werkzeuge/wirkungsfonds/"], ["Wirkungsregister", "werkzeuge/wirkungsregister/"]],
    demos: [["Erleben", "erleben/"], ["WÖk-Kompass", "kompass.html"]],
    docs: [["Arbeitsbibliothek Kapital", "werkstatt/arbeitsbibliothek/wirkungsfelder/finanzsystem-kapital/"], ["T-SROI Whitepaper", "dokumente/whitepaper-t-sroi/"]],
    problem: "Kapital wird häufig nach Rendite, Risiko und Sicherheiten gelenkt, ohne Transformationswirkung, Resilienz und Schadensvermeidung ausreichend zu berücksichtigen.",
    visible: "Sichtbar werden Kapitalwirkung, Finanzierungszugang, Versicherbarkeit, Transformationsrisiken und Systemhebel.",
    pilot: "Wirkungsfonds, Portfolio-Wirkungsrating, Impact Exchange, Wirkungsaufsicht und T-SROI-Piloten.",
  },
  {
    slug: "staat-recht-demokratie",
    title: "Staat, Recht & Demokratie",
    short: "Der Staat als Wirkungsarchitektur: Recht, Steuern, Haushalt, Wirkungsrat, Demokratie, Rechtsstaatlichkeit und öffentliche Verantwortung.",
    dimensions: ["Mensch", "Planet", "Demokratie"],
    status: "Live",
    tools: [["Wirkungshaushalt", "werkzeuge/wirkungshaushalt/"], ["Wirkungsrat", "werkzeuge/wirkungsrat/"], ["Wirkungsaudit", "werkzeuge/wirkungsaudit/"]],
    demos: [["Erleben", "erleben/"], ["WÖk-Kompass", "kompass.html"]],
    docs: [["Wirkungsrat Konzept", "dokumente/wirkungsrat-konzept/"], ["Wirkungssteuergesetz", "dokumente/wstg-oktober-2025/"]],
    problem: "Staatliche Steuerung misst oft Ausgaben, Zuständigkeiten und Verfahren, aber nicht ausreichend reale Zustandsveränderungen, Nebenwirkungen und Korrekturfähigkeit.",
    visible: "Sichtbar werden öffentliche Wirkung, demokratische Legitimation, Rechtsschutz, Haushaltseffekte, Zielkonflikte und institutionelle Lernfähigkeit.",
    pilot: "Wirkungshaushalte, Wirkungsrat, öffentliche Beschaffung, Register, Audits und rechtsstaatliche Pilotklauseln.",
  },
  {
    slug: "medien-oeffentlichkeit",
    title: "Medien & Öffentlichkeit",
    short: "Öffentlichkeit als Wirkungsraum: Wahrheit, Vertrauen, Diskursqualität, Plattformlogik, Desinformation und demokratische Resonanz.",
    dimensions: ["Mensch", "Demokratie"],
    status: "Live",
    tools: [["Medienwirkungscheck", "werkzeuge/medienwirkungscheck/"], ["Scorecards", "werkzeuge/scorecards/"], ["Datenqualität", "werkzeuge/datenqualitaet-assurance/"]],
    demos: [["Medienwirkungscheck", "erleben/medienwirkungscheck/"], ["Wirkung politischer Sprache", "sdg-plus/medien-demokratie/wirkung-politischer-sprache.html"]],
    docs: [["Wirkungsräume gestalten", "wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"], ["Dossier Medien & Demokratie", "blog/dossiers/medien-demokratie.html"]],
    problem: "Reichweite, Aufmerksamkeit und Empörung können demokratische Informationsräume verzerren, ohne dass Meinungen bewertet werden dürfen.",
    visible: "Sichtbar werden Quellenklarheit, Korrekturwege, Manipulationsrisiken, Plattformlogik, Desinformation und Diskursqualität.",
    pilot: "Medienwirkungscheck, Plattformtransparenz, redaktionelle Wirkungsräume und demokratische Kommunikationsstandards.",
  },
  {
    slug: "wissenschaft-innovation-digitalisierung",
    title: "Wissenschaft, Innovation & Digitalisierung",
    short: "Wissen, Innovation, Datenräume, KI und Digitalisierung als Infrastruktur gesellschaftlicher Lernfähigkeit.",
    dimensions: ["Mensch", "Planet", "Demokratie"],
    status: "Live",
    tools: [["Wirkungsdatenräume", "werkzeuge/wirkungsdatenraeume/"], ["Datenqualität & Assurance", "werkzeuge/datenqualitaet-assurance/"], ["Wirkungsregister", "werkzeuge/wirkungsregister/"]],
    demos: [["Erleben", "erleben/"], ["Wirkungsscanner", "anwendungen/scanner.html"]],
    docs: [["Arbeitsbibliothek Wissenschaft", "werkstatt/arbeitsbibliothek/wirkungsfelder/wissenschaft-innovation-digitalisierung/"], ["Referenz Wirkungsdatenräume", "referenz/kapitel-081-wirkungsdatenraeume/"]],
    problem: "Wissen, KI und Daten beschleunigen Entscheidungen, können aber auch Intransparenz, Machtasymmetrien und blinde Automatisierung verstärken.",
    visible: "Sichtbar werden Datenqualität, Replikation, Open Science, Innovationswirkung, algorithmische Verantwortung und digitale Selbstbestimmung.",
    pilot: "Wirkungsdatenräume, offene Methodenregister, KI-Governance, Forschungsförderung nach Wirkung und digitale öffentliche Infrastruktur.",
  },
  {
    slug: "kultur-identitaet-resonanz",
    title: "Kultur, Identität & Resonanz",
    short: "Kultur als Resonanzsystem der Demokratie: Sinn, Zugehörigkeit, Identität, Teilhabe und gesellschaftlicher Zusammenhalt.",
    dimensions: ["Mensch", "Demokratie"],
    status: "Live",
    tools: [["Scorecards", "werkzeuge/scorecards/"], ["Wirkungshaushalt", "werkzeuge/wirkungshaushalt/"], ["Wirkungsregister", "werkzeuge/wirkungsregister/"]],
    demos: [["Erleben", "erleben/"], ["WÖk-Kompass", "kompass.html"]],
    docs: [["Arbeitsbibliothek Kultur", "werkstatt/arbeitsbibliothek/wirkungsfelder/kultur-identitaet-resonanz/"], ["Referenz Kultur und Teilhabe", "referenz/kapitel-072-kultur-und-teilhabe/"]],
    problem: "Kultur wird oft als freiwillige Leistung oder Identitätskonflikt behandelt, obwohl sie Zugehörigkeit, Resonanz, Teilhabe und demokratische Stabilität beeinflusst.",
    visible: "Sichtbar werden Teilhabe, Resonanzräume, Diskursfähigkeit, Zugehörigkeit, Selbstwirksamkeit und gesellschaftlicher Zusammenhalt.",
    pilot: "Kommunale Kulturwirkung, Resonanzräume, Teilhabebudgets und Wirkungsindikatoren für Zusammenhalt.",
  },
  {
    slug: "klima-energie-ressourcen",
    title: "Klima, Energie & Ressourcen",
    short: "Planetare Grenzen, Energie, Wasser, Biodiversität, Kreislaufwirtschaft und Regeneration als Grundlage jeder Wirkungsordnung.",
    dimensions: ["Mensch", "Planet", "Demokratie"],
    status: "Live",
    tools: [["Reverse Merit Order", "werkzeuge/reverse-merit-order/"], ["T-SROI", "werkzeuge/t-sroi/"], ["Wirkungsaudit", "werkzeuge/wirkungsaudit/"]],
    demos: [["Erleben", "erleben/"], ["Scorecard-Dashboard", "scorecard-dashboard.html"]],
    docs: [["Arbeitsbibliothek Klima", "werkstatt/arbeitsbibliothek/wirkungsfelder/klima-energie-ressourcen/"], ["Planet: Koexistenz statt Extraktion", "referenz/kapitel-027-planet-koexistenz-statt-extraktion/"]],
    problem: "Ökologische Schäden werden häufig als externe Kosten oder Zukunftsrisiken behandelt, obwohl sie Lebensgrundlagen und demokratische Stabilität direkt berühren.",
    visible: "Sichtbar werden planetare Grenzen, Energieabhängigkeit, Ressourcenverbrauch, Biodiversität, Klimarisiken und Resilienz.",
    pilot: "Wirkungsaudits, Ressourcenscorecards, Transformationsfonds, öffentliche Beschaffung und regionale Resilienzhaushalte.",
  },
];

const fieldBySlug = new Map(fields.map((field) => [field.slug, field]));

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fileFor(route) {
  return path.join(root, route);
}

function relativeHref(fromFile, target) {
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  const targetPath = target.endsWith("/") ? path.join(root, target, "index.html") : path.join(root, target);
  let rel = path.relative(path.dirname(fromFile), targetPath).replaceAll(path.sep, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  if (target.endsWith("/")) rel = rel.replace(/index\.html$/, "");
  return rel;
}

function linkList(fromFile, items) {
  return items
    .map(([label, target]) => `<a class="text-link" href="${relativeHref(fromFile, target)}">${esc(label)}</a>`)
    .join("");
}

function dimensionBadges(dimensions) {
  return dimensions.map((item) => `<span class="badge">${esc(item)}</span>`).join("");
}

function overviewCard(fromFile, field) {
  return `<article class="card impact-field-card">
              <p class="card-kicker">Wirkungsfeld · <span class="status-badge status-badge--live">${esc(field.status)}</span></p>
              <h3 class="card-title">${esc(field.title)}</h3>
              <p class="card-text">${esc(field.short)}</p>
              <div class="model-strip" aria-label="Betroffene MPD-Dimensionen">${dimensionBadges(field.dimensions)}</div>
              <div class="impact-field-meta"><strong>Methoden:</strong> ${linkList(fromFile, field.tools)}</div>
              <div class="impact-field-meta"><strong>Demos:</strong> ${linkList(fromFile, field.demos)}</div>
              <div class="impact-field-meta"><strong>Bibliothek:</strong> ${linkList(fromFile, field.docs)}</div>
              <div class="portal-card-actions"><a class="text-link" href="${relativeHref(fromFile, `wirkungsfelder/${field.slug}/`)}">Wirkungsfeld öffnen</a></div>
            </article>`;
}

function overviewMain(fromFile) {
  return `<main>
      <p class="print-meta">Wirkungsökonomie · Wirkungsfelder der Wirkungsökonomie · https://wirkungsoekonomie.de/wirkungsfelder/ · Druckdatum: 31.05.2026</p>
      <section class="hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Systemlandkarte</p>
            <h1 class="hero-title">Wirkungsfelder</h1>
            <p class="hero-subtitle">Fünf Cluster für Mensch, Planet und Demokratie</p>
            <p class="hero-text">Die Wirkungsfelder ordnen bestehende Seiten in verständliche Suchräume. Sie löschen keine vorhandenen Portale, sondern machen schneller sichtbar, ob ein Thema eher Alltag, Wirtschaft, Staat, Öffentlichkeit, Wissen oder planetare Resilienz betrifft.</p>
            <div class="hero-actions no-print">
              <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
              <a class="btn btn-primary" href="${relativeHref(fromFile, "werkzeuge/")}">Methoden &amp; Werkzeuge</a>
            </div>
          </div>
          <aside class="card">
            <p class="card-kicker">Orientierung</p>
            <h2 class="card-title">Kein Wirkungsfeld wurde entfernt.</h2>
            <p class="card-text">Alle bisherigen Wirkungsfeldseiten bleiben erreichbar. Die Cluster sind eine Navigationshilfe, keine fachliche Abwertung oder neue Zuständigkeit.</p>
          </aside>
        </div>
      </section>
      <section class="section" aria-labelledby="felder-cluster">
        <div class="section-header">
          <p class="hero-kicker">Cluster</p>
          <h2 id="felder-cluster">Wo liegt mein Thema?</h2>
          <p>Jede Karte zeigt Status, MPD-Dimensionen, passende Methoden, Demos und Bibliothekszugänge.</p>
        </div>
        <nav class="method-cluster-nav" aria-label="Wirkungsfeldcluster">
          ${clusters.map((cluster, index) => `<a href="#wirkungsfeld-cluster-${index + 1}"><strong>${index + 1}</strong><span>${esc(cluster.title)}</span></a>`).join("")}
        </nav>
      </section>
      ${clusters
        .map((cluster, index) => `<section class="section impact-field-cluster" id="wirkungsfeld-cluster-${index + 1}" aria-labelledby="wirkungsfeld-cluster-${index + 1}-title">
        <div class="section-header">
          <p class="hero-kicker">Cluster ${index + 1}</p>
          <h2 id="wirkungsfeld-cluster-${index + 1}-title">${esc(cluster.title)}</h2>
          <p>${esc(cluster.text)}</p>
        </div>
        <div class="card-grid three">
          ${cluster.fields.map((slug) => overviewCard(fromFile, fieldBySlug.get(slug))).join("\n")}
        </div>
      </section>`)
        .join("\n")}
      <section class="section" aria-labelledby="field-safety">
        <div class="portal-reference-block">
          <p class="hero-kicker">Schutzlinie</p>
          <h2 id="field-safety">Wirkungsfelder sind keine Personenbewertung.</h2>
          <p>Die Karten ordnen Themen, Methoden und Dokumente. Sie treffen keine automatische Entscheidung und bewerten keine Personen. Wirkung bleibt neutral und relational; positive Wirkung wird am Referenzrahmen SDGs, Agenda 2030 und SDG+ bewertet.</p>
        </div>
      </section>
    </main>`;
}

function replaceMain(html, nextMain) {
  return html.replace(/<main>[\s\S]*?<\/main>/, nextMain);
}

function bridgeSection(fromFile, field) {
  return `${markerStart}
      <section class="section impact-field-bridge" aria-labelledby="stage7-${field.slug}-title">
        <div class="section-header">
          <p class="hero-kicker">Wirkungsfeld-Navigator</p>
          <h2 id="stage7-${field.slug}-title">${esc(field.title)} querschnittlich lesen</h2>
          <p>Dieser Orientierungsblock verbindet das Wirkungsfeld mit Methoden, Demos und Bibliothek. Die bestehende Detailseite bleibt vollständig erhalten.</p>
        </div>
        <div class="card-grid five impact-field-bridge-grid">
          <article class="card">
            <p class="card-kicker">Problem</p>
            <h3 class="card-title">Was ist das Problem?</h3>
            <p class="card-text">${esc(field.problem)}</p>
          </article>
          <article class="card">
            <p class="card-kicker">Wirkung</p>
            <h3 class="card-title">Welche Wirkung wird sichtbar?</h3>
            <p class="card-text">${esc(field.visible)}</p>
            <div class="model-strip" aria-label="MPD-Dimensionen">${dimensionBadges(field.dimensions)}</div>
          </article>
          <article class="card">
            <p class="card-kicker">Methoden</p>
            <h3 class="card-title">Welche Werkzeuge passen?</h3>
            <div class="impact-field-meta">${linkList(fromFile, field.tools)}</div>
          </article>
          <article class="card">
            <p class="card-kicker">Pilotierung</p>
            <h3 class="card-title">Was kann pilotiert werden?</h3>
            <p class="card-text">${esc(field.pilot)}</p>
            <div class="impact-field-meta">${linkList(fromFile, field.demos)}</div>
          </article>
          <article class="card">
            <p class="card-kicker">Bibliothek</p>
            <h3 class="card-title">Welche Dokumente vertiefen?</h3>
            <div class="impact-field-meta">${linkList(fromFile, field.docs)}</div>
          </article>
        </div>
      </section>
${markerEnd}`;
}

function injectBridge(html, fromFile, field) {
  const cleaned = html.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}\\n?`), "");
  const mainIndex = cleaned.indexOf("<main>");
  const firstSectionEnd = cleaned.indexOf("</section>", mainIndex);
  if (mainIndex === -1 || firstSectionEnd === -1) return cleaned;
  const insertAt = firstSectionEnd + "</section>".length;
  return `${cleaned.slice(0, insertAt)}\n${bridgeSection(fromFile, field)}${cleaned.slice(insertAt)}`;
}

function writeIfChanged(file, html) {
  const before = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (before !== html) fs.writeFileSync(file, html);
}

function run() {
  const overviewFile = fileFor("wirkungsfelder/index.html");
  writeIfChanged(overviewFile, replaceMain(fs.readFileSync(overviewFile, "utf8"), overviewMain(overviewFile)));

  let updated = 0;
  for (const field of fields) {
    const file = fileFor(`wirkungsfelder/${field.slug}/index.html`);
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    const next = injectBridge(html, file, field);
    writeIfChanged(file, next);
    updated += 1;
  }

  console.log(`Applied Stage 7 impact field clusters: ${fields.length} inventory entries, ${updated} field pages updated.`);
}

run();
