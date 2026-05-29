import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const DATA_PATH = path.join(ROOT, "assets/data/wirkungssteuer-examples.json");
const NAV_PATH = path.join(ROOT, "assets/data/navigation.json");
const HEADER_TEMPLATE = path.join(ROOT, "templates/header.html");
const FOOTER_TEMPLATE = path.join(ROOT, "templates/footer.html");
const OUT_DIR = path.join(ROOT, "erleben/wirkungssteuer-beispiele");
const OUT_FILE = path.join(OUT_DIR, "index.html");
const BASE = "../../";
const SITE = "https://wirkungsoekonomie.de";
const CSS_VERSION = "20260528-wirkungssteuer-beispiele";
const JS_VERSION = "20260529-glossary-hover-audit";

const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const navigation = JSON.parse(fs.readFileSync(NAV_PATH, "utf8"));
const headerTemplate = fs.readFileSync(HEADER_TEMPLATE, "utf8");
const footerTemplate = fs.readFileSync(FOOTER_TEMPLATE, "utf8");

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

function navLink(item, base) {
  return `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function footerGroup(group, base) {
  return `<div class="footer-nav-group">
      <h3>${esc(group.title)}</h3>
      <div class="footer-nav-links">
${group.items.map((item) => `          ${navLink(item, base)}`).join("\n")}
      </div>
    </div>`;
}

function renderHeader(base) {
  return headerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{HEADER_NAV}}", navigation.header.map((item) => navLink(item, base)).join("\n    "));
}

function renderFooter(base) {
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n"));
}

function assetUrl(url) {
  return `${BASE}${String(url).replace(/^\//, "")}`;
}

function scriptJson(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function money(value) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Number(value));
}

function percent(value) {
  return `${Math.round(Number(value) * 100)} %`;
}

function list(items, className = "clean-list") {
  return `<ul class="${className}">${(items || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function scoreClass(score) {
  return String(score || "").trim().startsWith("-") ? "score-negative" : "score-positive";
}

function boolText(value) {
  return value ? "möglich" : "nicht möglich";
}

const terms = new Map([
  ["wirkung", ["Wirkung", "/begriffe/wirkung/", "Tatsächliche Zustandsveränderung, nicht nur Aktivität oder Output."]],
  ["wirkungssteuer", ["Wirkungssteuer", "/begriffe/wirkungssteuer/", "Modellhafte Steuerlogik, die Produktwirkung in Preise zurückführt."]],
  ["wustg", ["WUStG", "/begriffe/wustg/", "Modellrahmen für eine wirkungsbezogene Umsatz- oder Produktsteuer."]],
  ["woek-id", ["WÖk-ID", "/begriffe/woek-id/", "Versionierter Indikator mit Einheit, Quelle, Schwelle und Bewertungslogik."]],
  ["scorecard", ["Scorecard", "/begriffe/scorecard/", "Bewertungsraster, das Wirkungsfelder getrennt sichtbar macht."]],
  ["finalscore", ["FinalScore", "/begriffe/finalscore/", "Gesamteinstufung nach definierten Mindestfeldern und Schutzregeln."]],
  ["reverse-merit-order", ["Reverse Merit Order", "/begriffe/reverse-merit-order/", "Das schwächste kritische Wirkungsfeld begrenzt die Gesamtbewertung."]],
  ["wirkungsdaten", ["Wirkungsdaten", "/begriffe/wirkungsdaten/", "Daten, die Wirkung, Datenqualität und Bewertungslogik prüfbar machen."]],
  ["digitaler-produktpass", ["Digitaler Produktpass", "/begriffe/digitaler-produktpass/", "Datenstruktur für produktbezogene Nachweise entlang der Kette."]],
  ["wirkungsregister", ["Wirkungsregister", "/begriffe/wirkungsregister/", "Registerlogik für nachvollziehbare Wirkungsklassen und Prüfstände."]],
  ["wirkungsrat", ["Wirkungsrat", "/begriffe/wirkungsrat/", "Institutionelle Kontroll- und Lerninstanz im Modell."]],
  ["wirkungsrueckkopplung", ["Wirkungsrückkopplung", "/begriffe/wirkungsrueckkopplung/", "Rückführung von Wirkung in Preise, Steuern, Kapital, Beschaffung oder Förderung."]],
  ["positive-netto-wirkung", ["positive Netto-Wirkung", "/begriffe/positive-netto-wirkung/", "Positive Wirkung, die kritische Schäden nicht überdeckt."]],
  ["wirkungsblindheit", ["Wirkungsblindheit", "/begriffe/wirkungsblindheit/", "Blindstelle heutiger Steuerung, wenn Folgen nicht entscheidungsrelevant werden."]],
  ["wirkungsfonds", ["Wirkungsfonds", "/begriffe/wirkungsfonds/", "Rückfluss- und Finanzierungslogik für Prävention, Transformation oder soziale Sicherung."]],
]);

function term(slug, fallbackLabel) {
  const entry = terms.get(slug);
  if (!entry) return esc(fallbackLabel || slug);
  const [label, href, title] = entry;
  return `<a class="term-link" href="${esc(href)}" title="${esc(title)}">${esc(fallbackLabel || label)}</a>`;
}

function termChip(slug, label, note) {
  const entry = terms.get(slug);
  if (!entry) {
    return `<span class="term-chip muted" title="${esc(note || "")}">${esc(label)}</span>`;
  }
  return `<a class="term-chip" href="${esc(entry[1])}" title="${esc(note || entry[2])}">${esc(label || entry[0])}</a>`;
}

function priceCard(example, variantKey, calcKey = "simplified") {
  const variant = example[variantKey];
  const calc = example.calculations[calcKey][variantKey];
  const tone = variantKey === "positive" ? "positive" : "negative";
  return `<article class="impact-price-card ${tone}">
      <p class="section-eyebrow">${esc(variant.label)}</p>
      <h4>${esc(variant.scoreClass)} · Steuerklasse ${esc(variant.taxClass)}</h4>
      <dl>
        <div><dt>Netto</dt><dd>${money(calc.netPrice)}</dd></div>
        <div><dt>Wirkungssteuer</dt><dd>${percent(calc.taxRate)}</dd></div>
        <div><dt>Steuerbetrag</dt><dd>${money(calc.taxAmount)}</dd></div>
        <div><dt>Endpreis</dt><dd>${money(calc.grossPrice)}</dd></div>
        <div><dt>Vorsteuerabzug</dt><dd>${esc(boolText(variant.vatDeductible))}</dd></div>
      </dl>
    </article>`;
}

function fieldRows(example) {
  const rows = [];
  const length = Math.max(example.positive.fields.length, example.negative.fields.length);
  for (let index = 0; index < length; index += 1) {
    const positive = example.positive.fields[index] || {};
    const negative = example.negative.fields[index] || {};
    rows.push([
      positive.field || negative.field || "",
      positive.indicator || negative.indicator || "",
      positive.exampleValue || "",
      negative.exampleValue || "",
      `<span class="score-pill ${scoreClass(positive.score)}">${esc(positive.score || "")}</span>`,
      `<span class="score-pill ${scoreClass(negative.score)}">${esc(negative.score || "")}</span>`,
    ]);
  }
  return rows;
}

function table(headers, rows, label) {
  return `<div class="table-wrap responsive-table" role="region" aria-label="${esc(label)}" tabindex="0">
      <table>
        <thead>
          <tr>${headers.map((header) => `<th scope="col">${esc(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell, index) => `<td data-label="${esc(headers[index])}">${cell}</td>`).join("")}</tr>`).join("\n")}
        </tbody>
      </table>
    </div>`;
}

function visualCard(example) {
  return `<article class="impact-visual-card">
      <figure>
        <button class="example-image-button" type="button" data-lightbox-image="${esc(assetUrl(example.image))}" data-lightbox-alt="${esc(example.alt)}" data-lightbox-caption="${esc(example.caption)}">
          <img src="${esc(assetUrl(example.image))}" alt="${esc(example.alt)}" loading="lazy">
        </button>
        <figcaption>${esc(example.caption)}</figcaption>
      </figure>
      <div>
        <p class="section-eyebrow">Praxisbeispiel</p>
        <h3>${esc(example.title)}</h3>
        <p>${esc(example.positive.description)} Gegenbeispiel: ${esc(example.negative.description)}</p>
        <div class="portal-card-actions">
          <a class="btn btn-primary" href="#${esc(example.slug)}">${esc(example.title)} ansehen</a>
          <a class="btn btn-secondary" href="${esc(assetUrl(example.image))}" download>Grafik herunterladen</a>
        </div>
      </div>
    </article>`;
}

function scorecardSection(example) {
  const headers = ["Feld", "Indikator", "Positive Variante", "Negative Variante", "Score positiv", "Score negativ"];
  return table(headers, fieldRows(example), `${example.title} Scorecard`);
}

function calculationSection(example) {
  const simplified = example.calculations.simplified;
  const market = example.calculations.market;
  return `<section class="impact-example-subsection" aria-labelledby="${esc(example.slug)}-rechnung">
      <h3 id="${esc(example.slug)}-rechnung">Endpreis berechnen</h3>
      <p>${esc(simplified.description)} Formel: <strong>${esc(data.meta.formula)}</strong>.</p>
      <div class="impact-price-grid">
        ${priceCard(example, "positive")}
        ${priceCard(example, "negative")}
      </div>
      <details class="impact-accordion">
        <summary>${esc(market.label)} ansehen</summary>
        <p>${esc(market.description)}</p>
        <div class="impact-price-grid">
          ${priceCard(example, "positive", "market")}
          ${priceCard(example, "negative", "market")}
        </div>
      </details>
    </section>`;
}

function appleSection(example) {
  return `<section class="section impact-example-detail" id="apfel" aria-labelledby="apfel-title">
      <div class="section-header">
        <p class="hero-kicker">Beispiel 1</p>
        <h2 id="apfel-title">Beispiel Apfel: vom Wirkungsprofil zum Endpreis</h2>
        <p>Ein Apfel ist ein einfaches Alltagsprodukt, aber seine Wirkung reicht von Landwirtschaft, Wasser und Transport bis Biodiversität, Gesundheit und Arbeitsbedingungen.</p>
      </div>
      <div class="impact-stepper">
        <article><span>1</span><h3>Produkt bestimmen</h3><p>Ein Apfel wird als ${esc(example.classification)} eingeordnet. Relevante Wirkungsfelder sind ${esc(example.relevantFields.join(", "))}.</p></article>
        <article><span>2</span><h3>Daten erfassen</h3>${list(example.dataFields)}</article>
        <article><span>3</span><h3>Scorecard bilden</h3><p>Die Daten werden je Wirkungsfeld in eine Scorecard übersetzt.</p></article>
        <article><span>4</span><h3>Reverse Merit Order anwenden</h3><p>Nicht der Durchschnitt entscheidet. Das schwächste relevante Feld begrenzt die Gesamtbewertung. So kann ein gutes Feld einen schweren Schaden nicht überdecken.</p></article>
        <article><span>5</span><h3>Steuerklasse ableiten</h3><p>${esc(example.positive.label)}: ${esc(example.positive.taxClass)}. ${esc(example.negative.label)}: ${esc(example.negative.taxClass)}.</p></article>
        <article><span>6</span><h3>Endpreis und Geldfluss erklären</h3><p>Die Steuer wird aus Netto-Preis und Wirkungssteuersatz berechnet und entlang der Kette als Rückkopplung sichtbar.</p></article>
      </div>
      <div class="variant-grid">
        <article class="variant-card positive"><p class="section-eyebrow">Positive Variante</p><h3>${esc(example.positive.label)}</h3><p>${esc(example.positive.description)}</p></article>
        <article class="variant-card negative"><p class="section-eyebrow">Negative Variante</p><h3>${esc(example.negative.label)}</h3><p>${esc(example.negative.description)}</p></article>
      </div>
      <section class="impact-example-subsection" aria-labelledby="apfel-scorecard">
        <h3 id="apfel-scorecard">Scorecard</h3>
        ${scorecardSection(example)}
      </section>
      ${calculationSection(example)}
      <section class="impact-example-subsection" aria-labelledby="apfel-geldfluss">
        <h3 id="apfel-geldfluss">Geldfluss bis zum Endpreis</h3>
        <div class="money-flow-grid">
          <article><h4>Konsument:in</h4><p>Zahlt den Endpreis an den Händler und sieht Wirkungsklasse sowie Steuerklasse am Produkt.</p></article>
          <article><h4>Händler</h4><p>Nimmt den Bruttopreis ein, führt die Wirkungssteuer ab und kann Vorsteuer nur bei positiver Vorleistung voll abziehen.</p></article>
          <article><h4>Produzent / Lieferant</h4><p>Erhält einen Marktvorteil, wenn Produktdaten und Wirkung verbessert werden.</p></article>
          <article><h4>Staat / Wirkungsregister</h4><p>Erhält Steuerdaten. Die Wirkungsklasse bleibt prüfbar; Einnahmen dienen als Rückkopplung, nicht als reine Straflogik.</p></article>
        </div>
      </section>
      <section class="impact-example-subsection" aria-labelledby="apfel-unsichtbar">
        <h3 id="apfel-unsichtbar">Was heute nicht im Apfelpreis steht</h3>
        <p>Der negative Apfel ist nicht wirklich günstiger. Er wirkt nur günstiger, weil ein Teil seiner Kosten nicht an der Kasse erscheint. Die Wirkungssteuer macht diese unsichtbaren Kosten nicht perfekt sichtbar, aber sie korrigiert den größten Fehler: Schädliche Wirkung bleibt nicht länger billig.</p>
        <div class="split-list-grid">
          <article><h4>Unsichtbare Kosten</h4>${list(example.negative.invisibleCosts)}</article>
          <article><h4>Was der positive Apfel vermeidet</h4>${list(example.positive.invisibleCostsAvoided)}<p class="impact-quote-line">Der Bio-Apfel ist nicht "teurer". Er bezahlt mehr seiner Wahrheit schon im Preis.</p></article>
        </div>
      </section>
    </section>`;
}

function tshirtSection(example) {
  const chainHeaders = ["Stufe", "positive Variante", "negative Variante", "relevante Wirkung", "Score positiv", "Score negativ"];
  const chainRows = (example.positive.chainScores || []).map((item) => [
    esc(item.stage),
    esc(item.positive),
    esc(item.negative),
    esc(item.impact),
    `<span class="score-pill ${scoreClass(item.positiveScore)}">${esc(item.positiveScore)}</span>`,
    `<span class="score-pill ${scoreClass(item.negativeScore)}">${esc(item.negativeScore)}</span>`,
  ]);
  return `<section class="section impact-example-detail" id="t-shirt" aria-labelledby="tshirt-title">
      <div class="section-header">
        <p class="hero-kicker">Beispiel 2</p>
        <h2 id="tshirt-title">Beispiel T-Shirt: Wirkung entlang der Lieferkette</h2>
        <p>Das T-Shirt zeigt, wie Rohstoff, Chemie, Arbeit, Wasser, Transport, Nutzung und Kreislauf in einer komplexeren internationalen Lieferkette zusammenhängen.</p>
      </div>
      <div class="impact-stepper">
        <article><span>1</span><h3>Lieferkette bestimmen</h3>${list(example.chain)}</article>
        <article><span>2</span><h3>Daten erfassen</h3>${list(example.dataFields)}</article>
        <article><span>3</span><h3>Scorecard je Stufe</h3><p>Jede Stufe erhält Wirkungsdaten, Datenqualitätsangaben und feldbezogene Scores.</p></article>
        <article><span>4</span><h3>Reverse Merit Order</h3><p>Ein T-Shirt mit gutem Material bleibt schädlich, wenn Kinderarbeit, gefährliche Chemikalien oder extreme Wasserbelastung auftreten.</p></article>
        <article><span>5</span><h3>Steuerklasse</h3><p>Positive Variante: ${esc(example.positive.taxClass)}. Negative Variante: ${esc(example.negative.taxClass)}.</p></article>
        <article><span>6</span><h3>Vorsteuerlogik</h3><p>Positive Vorleistungen sind im Modell voll vorsteuerfähig. Negative Vorleistungen bleiben als Kostenbelastung in der Kette hängen.</p></article>
      </div>
      <div class="variant-grid">
        <article class="variant-card positive"><p class="section-eyebrow">Positive Variante</p><h3>${esc(example.positive.label)}</h3><p>${esc(example.positive.description)}</p></article>
        <article class="variant-card negative"><p class="section-eyebrow">Negative Variante</p><h3>${esc(example.negative.label)}</h3><p>${esc(example.negative.description)}</p></article>
      </div>
      <section class="impact-example-subsection" aria-labelledby="tshirt-chain-scorecard">
        <h3 id="tshirt-chain-scorecard">Scorecard entlang der Lieferkette</h3>
        ${table(chainHeaders, chainRows, "T-Shirt Scorecard entlang der Lieferkette")}
      </section>
      <section class="impact-example-subsection" aria-labelledby="tshirt-scorecard">
        <h3 id="tshirt-scorecard">Wirkungsfelder und Datenbasis</h3>
        ${scorecardSection(example)}
      </section>
      ${calculationSection(example)}
      <section class="impact-example-subsection" aria-labelledby="tshirt-vorsteuer">
        <h3 id="tshirt-vorsteuer">Heute vs. WÖk: Geldfluss in der Kette</h3>
        <div class="comparison-columns">
          <article>
            <h4>Heute</h4>
            <ul>
              <li>Umsatzsteuer / Einfuhrumsatzsteuer ist für Unternehmen oft Durchlaufposten.</li>
              <li>Vorsteuerabzug ist grundsätzlich möglich.</li>
              <li>Negative Lieferkettenwirkung beeinflusst die Steuerlast kaum.</li>
              <li>Endpreis bildet Schäden nicht ab.</li>
            </ul>
          </article>
          <article>
            <h4>WÖk</h4>
            <ul>
              <li>Jede Vorleistung trägt einen Wirkungs-Score.</li>
              <li>Nur positive Vorleistungen sind voll vorsteuerfähig.</li>
              <li>Negative Vorleistungen bleiben als Kosten in der Kette hängen.</li>
              <li>Importierte Produkte mit negativem FinalScore werden am Importpunkt mit Wirkungssteuer belastet.</li>
              <li>Händler und Hersteller haben Anreiz, bessere Lieferanten zu wählen.</li>
            </ul>
          </article>
        </div>
        <div class="money-flow-grid">
          <article><h4>Positive Lieferkette</h4><p>Lieferant verkauft positive Vorleistung mit Score >= +1. Der Hersteller kann Vorsteuer anrechnen, die eigene Scorecard verbessert sich, der Handel verkauft mit niedrigerem Satz.</p></article>
          <article><h4>Negative Lieferkette</h4><p>Lieferant verkauft negative Vorleistung mit Score &lt; 0. Die Steuer ist nicht oder nur eingeschränkt abziehbar, bleibt in der Kette als Kostenbelastung und erhöht den Endpreis.</p></article>
        </div>
      </section>
      <section class="impact-example-subsection" aria-labelledby="tshirt-unsichtbar">
        <h3 id="tshirt-unsichtbar">Was heute nicht im T-Shirtpreis steht</h3>
        <p>Das billige T-Shirt ist nicht deshalb billig, weil es effizienter Wohlstand erzeugt. Es ist billig, weil viele Schäden aus dem Preis herausgerechnet werden. Die Marge kann steigen, während Kosten auf Beschäftigte, Ökosysteme, Kommunen, Gesundheitssysteme und künftige Generationen verschoben werden.</p>
        <div class="split-list-grid">
          <article><h4>Unsichtbare Kosten</h4>${list(example.negative.invisibleCosts)}</article>
          <article><h4>Was das faire T-Shirt vermeidet</h4>${list(example.positive.invisibleCostsAvoided)}<p class="impact-quote-line">Fast Fashion spart am Produkt - und erzeugt Kosten im System.</p></article>
        </div>
      </section>
    </section>`;
}

function economicLogicSection() {
  return `<section class="section impact-logic-section" id="rechenlogik" aria-labelledby="logic-title">
      <div class="section-header">
        <p class="hero-kicker">Ökonomische Logik</p>
        <h2 id="logic-title">Warum das schädliche Produkt heute oft billiger ist</h2>
        <p>Heute wirkt ein schädliches Produkt oft günstiger als ein verantwortliches Produkt. Das liegt nicht daran, dass es volkswirtschaftlich effizienter ist. Es liegt daran, dass ein Teil seiner Kosten nicht im Preis auftaucht.</p>
      </div>
      <div class="impact-prose">
        <p>Wenn ein Apfel mit hohem Wasserverbrauch, Pestizideinsatz und langen Transportwegen billiger angeboten wird als ein regionaler Bio-Apfel, dann ist der Preis nicht vollständig. Er enthält nicht die späteren Kosten von Wasserstress, Bodenschäden, Gesundheitsrisiken, Artenverlust oder Klimafolgen.</p>
        <p>Wenn ein T-Shirt durch Niedriglöhne, gefährliche Chemikalien, kurze Nutzungsdauer und schlechte Rücknahme billiger wird, dann spart das Unternehmen nicht wirklich Kosten. Es verschiebt sie. Andere zahlen später: Beschäftigte, Gesundheitssysteme, Kommunen, Ökosysteme, künftige Generationen und der Staat.</p>
        <p>Die ${term("wirkungsblindheit", "Wirkungsökonomie nennt das Wirkungsblindheit im Preis")}. Der Markt sieht nur den sichtbaren Preis, nicht die Folgekosten.</p>
      </div>
      <aside class="impact-definition-box">
        <h3>Was heißt externalisieren?</h3>
        <p>Externalisieren bedeutet: Ein Unternehmen verursacht Kosten, trägt sie aber nicht selbst. Die Kosten erscheinen nicht im Produktpreis, sondern später an anderer Stelle - etwa als Klimaschaden, Krankheit, Bodendegradation, Wasserknappheit, Sozialkosten, Artenverlust oder Vertrauensverlust.</p>
        <p>Ein Pestizid kann die Produktion kurzfristig billiger machen. Wenn dadurch aber Böden, Insekten, Wasserqualität oder Gesundheit geschädigt werden, entstehen reale Kosten. Sie stehen nur nicht auf der Rechnung des Produkts.</p>
        <p class="impact-quote-line">Externalisierte Kosten verschwinden nicht. Sie wechseln nur die Rechnung.</p>
      </aside>
      <section class="impact-example-subsection" aria-labelledby="avoidance-title">
        <h3 id="avoidance-title">Vermeidung ist oft billiger als Reparatur</h3>
        <p>Ein zentraler Irrtum heutiger Preise besteht darin, dass nur die direkten Produktionskosten zählen. Wenn saubere Produktion teurer ist, erscheint sie im Markt als Nachteil. Aber das vergleicht nur den heutigen Produktpreis - nicht die späteren Schäden.</p>
        <p><strong>Die entscheidende Frage lautet:</strong> Was kostet es, Schaden zu vermeiden - und was kostet es, Schaden später zu reparieren?</p>
        <div class="impact-case-grid">
          <article><h4>Landwirtschaft</h4><p>Saubere Produktion kostet mehr als billige Pestizidproduktion. Aber zerstörte Böden, Insektenverlust, Wasserbelastung und Gesundheitsfolgen kosten die Gesellschaft später oft mehr.</p></article>
          <article><h4>Arbeit</h4><p>Faire Löhne erhöhen den Produktpreis. Ausbeutung, Krankheit, Armut, Migration, Instabilität und Sozialkosten sind langfristig teurer.</p></article>
          <article><h4>Kreislauf</h4><p>Kreislauffähige Produkte sind in der Herstellung anspruchsvoller. Müll, Ressourcenverlust, Mikroplastik, Entsorgung und Neubeschaffung erzeugen hohe Folgekosten.</p></article>
          <article><h4>Klima</h4><p>Klimafreundliche Produktion braucht Investitionen. Klimaschäden, Extremwetter, Ernteausfälle, Versicherungsverluste und Infrastrukturreparaturen sind volkswirtschaftlich viel teurer.</p></article>
        </div>
        <p class="impact-quote-line">Der Schaden ist oft größer als die Kosten, ihn zu vermeiden.</p>
      </section>
      <section class="impact-example-subsection" aria-labelledby="wrong-way-title">
        <h3 id="wrong-way-title">Heute rechnet sich oft der falsche Weg</h3>
        <div class="comparison-columns">
          <article>
            <h4>Heutige Preislogik</h4>
            <ul>
              <li>Unternehmen senkt direkte Kosten</li>
              <li>Umwelt- und Sozialschäden bleiben außerhalb des Preises</li>
              <li>Produkt wirkt billig</li>
              <li>Gewinn steigt</li>
              <li>Gesellschaft zahlt später</li>
              <li>Politik muss mit Subventionen, Verboten und Reparaturprogrammen nachsteuern</li>
            </ul>
          </article>
          <article>
            <h4>Wirkungsökonomische Preislogik</h4>
            <ul>
              <li>${term("wirkung", "Wirkung")} wird sichtbar</li>
              <li>Schäden werden in Steuerklasse und Preis rückgekoppelt</li>
              <li>${term("positive-netto-wirkung", "positive Wirkung")} wird entlastet</li>
              <li>negative Wirkung verliert Preisvorteil</li>
              <li>Unternehmen haben Anreiz, sauberer zu produzieren</li>
              <li>Gesellschaft spart Reparatur-, Gesundheits-, Klima- und Folgekosten</li>
            </ul>
          </article>
        </div>
        <p>Die Wirkungsökonomie macht schädliche Produktion nicht künstlich teuer. Sie beendet den künstlichen Preisvorteil, der durch ausgelagerte Schäden entsteht.</p>
      </section>
      <section class="impact-example-subsection" aria-labelledby="profit-title">
        <h3 id="profit-title">Warum Unternehmen heute an Schäden verdienen können</h3>
        <p>Im heutigen System kann ein Unternehmen mehr Gewinn erzielen, wenn es Kosten nicht selbst trägt. Wer weniger für faire Löhne, sauberes Wasser, sichere Arbeitsbedingungen, Bodenschutz, Reparierbarkeit oder Rücknahme ausgibt, kann billiger anbieten oder höhere Margen erzielen.</p>
        <p>Das ist kein individuelles Moralproblem einzelner Unternehmen. Es ist ein systemischer Fehlanreiz. Solange Schäden nicht im Preis erscheinen, entsteht ein Wettbewerbsvorteil durch Externalisierung.</p>
        <ul>
          <li>Wer sauber produziert, trägt die Kosten selbst.</li>
          <li>Wer schädlich produziert, verschiebt einen Teil der Kosten auf andere.</li>
          <li>Dadurch kann das schädliche Produkt billiger erscheinen.</li>
          <li>Der Gewinn steigt, obwohl gesellschaftlich Wohlstand verloren geht.</li>
        </ul>
        <p class="impact-quote-line">Der Gewinn steigt, weil die Rechnung unvollständig ist.</p>
      </section>
      <section class="impact-example-subsection" aria-labelledby="prosperity-title">
        <h3 id="prosperity-title">Warum das Wohlstandsverlust ist</h3>
        <p>Ein billiges Produkt kann Wohlstand vortäuschen und gleichzeitig Wohlstand zerstören. Wenn ein T-Shirt billig ist, aber Wasser verschmutzt, Menschen krank macht, Müll erzeugt und nach kurzer Nutzung ersetzt werden muss, entsteht kein echter Wohlstandsgewinn. Es entsteht Scheinwohlstand.</p>
        <p>Echter Wohlstand bedeutet nicht nur niedriger Preis. Echter Wohlstand bedeutet gesunde Menschen, stabile Böden, sauberes Wasser, weniger Reparaturkosten, faire Arbeit, weniger Abhängigkeit, mehr Resilienz, demokratisches Vertrauen und geringere Zukunftsschäden.</p>
        <p class="impact-quote-line">Ein niedriger Preis ist kein Wohlstand, wenn er höhere Schäden auslöst.</p>
      </section>
      <section class="impact-example-subsection" aria-labelledby="saving-title">
        <h3 id="saving-title">Warum die Wirkungsökonomie langfristig spart</h3>
        <p>Die Wirkungsökonomie verteuert nicht "einfach alles". Sie verschiebt Kosten dorthin, wo sie entstehen, und entlastet dort, wo positive Netto-Wirkung erzeugt wird.</p>
        <div class="impact-case-grid">
          <article><h4>Weniger Folgekosten</h4><p>Weniger Klima-, Gesundheits-, Boden-, Wasser-, Abfall- und Entsorgungskosten.</p></article>
          <article><h4>Weniger Risiken</h4><p>Weniger Lieferkettenrisiken, soziale Instabilität und nachträgliche Krisenbürokratie.</p></article>
          <article><h4>Weniger Reparatur</h4><p>Weniger Subventionen zur Reparatur falscher Anreize, mehr Prävention.</p></article>
          <article><h4>Mehr Lernfähigkeit</h4><p>Wirkungsdaten machen Verbesserungen und Korrekturen nachvollziehbar.</p></article>
        </div>
        <p>Die WÖk ist deshalb keine reine Belastungslogik. Sie ist eine Vermeidungslogik. Sie macht Prävention ökonomisch attraktiver als Reparatur.</p>
        <p class="impact-quote-line">Die günstigste Krise ist die, die gar nicht erst entsteht.</p>
      </section>
      <section class="impact-example-subsection" aria-labelledby="complete-calculation-title">
        <h3 id="complete-calculation-title">Die vollständige Rechnung</h3>
        <div class="invisible-price-visual" aria-label="Der unsichtbare Preis">
          <article><span>1</span><h4>Sichtbarer Preis</h4><p>Material, Lohn, Transport, Marge, Steuer</p></article>
          <article><span>2</span><h4>Ausgelagerte Kosten</h4><p>Klima, Wasser, Gesundheit, Arbeit, Abfall, Biodiversität</p></article>
          <article><span>3</span><h4>Gesellschaftliche Gesamtkosten</h4><p>Sichtbarer Preis plus ausgelagerte Schäden plus Reparaturkosten</p></article>
          <article><span>WÖk</span><h4>Wirkungsbasierter Preis</h4><p>Sichtbarer Preis plus Rückkopplung negativer Wirkung minus Entlastung positiver Wirkung.</p></article>
        </div>
        <div class="formula-grid">
          <article><h4>Heute</h4><p>Sichtbarer Produktpreis = Material + Arbeit + Transport + Marge + Steuer.</p><p>Nicht sichtbar: Klima-, Gesundheits-, Wasser-, Boden-, Arten-, Sozial-, Reparatur-, Bürokratie- und Zukunftskosten.</p></article>
          <article><h4>Wirkungsökonomie</h4><p>Wirkungsbasierter Produktpreis = Material + Arbeit + Transport + Marge + Wirkungssteuer / Bonus-Malus + sichtbarer Wirkungsscore + Rückkopplung in Lieferkette.</p><p>Schädliche Produkte verlieren ihren versteckten Preisvorteil. Positive Produkte werden marktfähiger. Gesellschaftliche Folgekosten sinken.</p></article>
        </div>
      </section>
      <div class="impact-principle-grid">
        <p>Schädliche Produkte sind heute nicht wirklich günstig. Sie sind unvollständig bepreist.</p>
        <p>Externalisierte Kosten verschwinden nicht. Sie werden nur von anderen bezahlt.</p>
        <p>Die Wirkungsökonomie macht nicht Verantwortung teuer. Sie macht Verantwortung wettbewerbsfähig.</p>
        <p>Positive Produkte werden nicht durch Moral belohnt, sondern durch vermiedene Folgekosten.</p>
        <p>Der Markt soll nicht ersetzt werden. Er soll endlich bessere Preissignale bekommen.</p>
        <p>Wohlstand entsteht nicht, wenn wir Schäden billig einkaufen und teuer reparieren.</p>
      </div>
    </section>`;
}

function calculatorSection() {
  return `<section class="section section-muted" id="rechner" aria-labelledby="calculator-title">
      <div class="section-header">
        <p class="hero-kicker">Rechenkomponente</p>
        <h2 id="calculator-title">Wirkungssteuer modellhaft berechnen</h2>
        <p>Die Komponente zeigt die einfache Konsument:innenrechnung. Sie ist keine steuerliche Beratung.</p>
      </div>
      <form class="impact-tax-calculator" data-impact-tax-calculator>
        <div class="form-grid">
          <label>Produktart
            <select name="product">
              ${data.examples.map((example) => `<option value="${esc(example.id)}">${esc(example.title)}</option>`).join("")}
            </select>
          </label>
          <label>Variante
            <select name="variant">
              <option value="positive">positiv</option>
              <option value="negative">negativ</option>
            </select>
          </label>
          <label>Netto-Preis
            <input type="number" name="netPrice" min="0" step="0.01" value="2">
          </label>
          <label>Wirkungssteuersatz
            <input type="number" name="taxRate" min="0" max="100" step="1" value="5">
          </label>
          <label>Input-Score
            <input type="number" name="inputScore" min="-3" max="3" step="1" value="2">
            <small>Ab +1 gilt die Vorleistung im Modell als vorsteuerfähig. Unter 0 ist der Abzug nicht möglich.</small>
          </label>
        </div>
        <output class="calculator-result" data-calculator-result>
          <span>Steuerbetrag</span><strong data-tax-amount>0,10 €</strong>
          <span>Endpreis</span><strong data-gross-price>2,10 €</strong>
          <span>Vorsteuerabzug</span><strong data-deductible>möglich</strong>
          <small>Vereinfachte Modellrechnung, keine steuerliche Beratung.</small>
        </output>
      </form>
    </section>`;
}

function relatedQuestionsSection() {
  const questions = [
    ["Wird dadurch alles teurer?", "/fragen/#wird-alles-teurer"],
    ["Warum ist das schädliche Produkt heute oft günstiger?", "/fragen/#warum-schaedliches-produkt-guenstiger"],
    ["Was sind externalisierte Kosten?", "/fragen/#externalisierte-kosten"],
    ["Warum ist Vermeidung billiger als Reparatur?", "/fragen/#vermeidung-billiger-als-reparatur"],
    ["Wer bezahlt die Schäden heute?", "/fragen/#wer-bezahlt-schaeden-heute"],
    ["Verlieren Unternehmen dadurch Gewinn?", "/fragen/#verlieren-unternehmen-gewinn"],
    ["Ist das eine Strafe für Unternehmen?", "/fragen/#strafe-fuer-unternehmen"],
    ["Wie schützt die WÖk Konsument:innen mit wenig Geld?", "/fragen/#soziale-abfederung"],
    ["Warum soll der Staat nicht einfach Subventionen zahlen?", "/fragen/#subventionen"],
    ["Wer entscheidet die Steuerklasse?", "/fragen/#wer-entscheidet-steuerklasse"],
    ["Was passiert, wenn Daten fehlen?", "/fragen/#daten-fehlen"],
    ["Ist das Planwirtschaft?", "/fragen/#planwirtschaft"],
    ["Wie verhindert man Greenwashing?", "/fragen/#greenwashing"],
    ["Was bedeutet Reverse Merit Order?", "/fragen/#reverse-merit-order"],
    ["Was passiert mit kleinen Unternehmen?", "/fragen/#kleine-unternehmen"],
    ["Ist das eine echte Steuerberechnung?", "/fragen/#echte-steuerberechnung"],
  ];
  return `<section class="related-questions-block" aria-labelledby="related-questions-title-wirkungssteuer-beispiele">
      <div class="section-header">
        <p class="hero-kicker">Fragen & Einwände</p>
        <h2 id="related-questions-title-wirkungssteuer-beispiele">Häufige Fragen zu Wirkung im Preis</h2>
        <p>Die Beispiele sind modellhafte Rechnungen. Die ausführlichen Antworten erklären Grenzen, Schutzregeln und offene Punkte.</p>
      </div>
      <div class="related-question-list">
        ${questions.map(([label, href]) => `<a class="related-question-card" href="${esc(href)}">${esc(label)}</a>`).join("")}
      </div>
    </section>`;
}

function termsSection() {
  const chips = [
    ["wirkung", "Wirkung"],
    ["wirkungssteuer", "Wirkungssteuer"],
    ["wustg", "WUStG"],
    ["woek-id", "WÖk-ID"],
    ["scorecard", "Scorecard"],
    ["finalscore", "FinalScore"],
    ["reverse-merit-order", "Reverse Merit Order"],
    [null, "Nicht-Kompensation", "Begriffseite fehlt noch; inhaltlich auf dieser Seite erklärt."],
    [null, "Vorsteuerabzug", "Begriffseite fehlt noch; inhaltlich auf dieser Seite erklärt."],
    ["wirkungsdaten", "Wirkungsdaten"],
    ["digitaler-produktpass", "Digitaler Produktpass"],
    ["wirkungsregister", "Wirkungsregister"],
    ["wirkungsrat", "Wirkungsrat"],
    ["wirkungsrueckkopplung", "Wirkungsrückkopplung"],
    ["positive-netto-wirkung", "positive Netto-Wirkung"],
  ];
  return `<section class="section" aria-labelledby="terms-title">
      <div class="section-header">
        <p class="hero-kicker">Begriffe</p>
        <h2 id="terms-title">Begriffe direkt erklärt</h2>
        <p>Die wichtigsten Begriffe sind verlinkt. Fehlende Begriffseiten sind als Inhaltslücken dokumentiert und nicht als tote Links gesetzt.</p>
      </div>
      <div class="term-chip-row impact-term-chip-row">
        ${chips.map(([slug, label, note]) => termChip(slug, label, note)).join("")}
      </div>
      <div class="impact-definition-grid">
        <article><h3>Reverse Merit Order</h3><p>Das schwächste kritische Wirkungsfeld begrenzt die Gesamtbewertung. So kann Kinderarbeit nicht durch gute CO2-Werte kompensiert werden.</p></article>
        <article><h3>Vorsteuerabzug</h3><p>Unternehmen können gezahlte Steuer auf Vorleistungen normalerweise mit ihrer eigenen Steuer verrechnen. Im WÖk-Modell gilt das nur für positiv bewertete Vorleistungen.</p></article>
      </div>
    </section>`;
}

function furtherLinksSection() {
  const links = [
    ["Produkte & Konsum", "/wirkungsfelder/produkte-konsum/"],
    ["Begriff: Wirkungssteuer", "/begriffe/wirkungssteuer/"],
    ["Begriff: Reverse Merit Order", "/begriffe/reverse-merit-order/"],
    ["Begriff: WÖk-ID", "/begriffe/woek-id/"],
    ["Begriff: Scorecard", "/begriffe/scorecard/"],
    ["Begriff: Digitaler Produktpass", "/begriffe/digitaler-produktpass/"],
    ["Begriff: Wirkungsdaten", "/begriffe/wirkungsdaten/"],
    ["WÖk-Scanner", "/anwendungen/scanner.html"],
    ["Produktwirkung-Demo", "/erleben/produktwirkungsrechner/"],
    ["Bibliothek: Produktbesteuerung durch Wirkung", "/bibliothek/produktbesteuerung-durch-wirkung/"],
    ["Fragen: Wird dadurch alles teurer?", "/fragen/#wird-alles-teurer"],
  ];
  return `<section class="section" aria-labelledby="next-title">
      <div class="section-header">
        <p class="hero-kicker">Weiterführend</p>
        <h2 id="next-title">Von der Beispielrechnung zur Vertiefung</h2>
      </div>
      <div class="card-grid three">
        ${links.map(([title, href]) => `<article class="card"><h3 class="card-title">${esc(title)}</h3><a class="text-link" href="${esc(href)}">Öffnen</a></article>`).join("")}
      </div>
    </section>`;
}

function pageBody() {
  const apple = data.examples.find((example) => example.id === "apfel");
  const tshirt = data.examples.find((example) => example.id === "tshirt");
  return `<main class="impact-example-page" data-search-content data-no-generic-tool-explanation="true">
      <p class="print-meta">Wirkungsökonomie · Apfel & T-Shirt · ${SITE}/erleben/wirkungssteuer-beispiele/ · Druckdatum: 28.05.2026</p>
      <section class="hero impact-example-hero">
        <div>
          <p class="hero-kicker">Praxisbeispiel · Wirkungssteuer</p>
          <h1 class="hero-title">Apfel &amp; T-Shirt: Wie Wirkung in den Preis kommt</h1>
          <p class="hero-subtitle">Zwei einfache Beispiele zeigen, wie die Wirkungsökonomie Produktwirkung sichtbar macht - vom Rohstoff über die Lieferkette bis zum Endpreis.</p>
          <p>Ein Produkt ist nie nur ein Produkt. Es ist Rohstoff, Arbeit, Energie, Wasser, Transport, Nutzung, Entsorgung und Wirkung. Diese Seite zeigt an zwei Beispielen, wie aus Wirkungsdaten eine Scorecard, daraus eine Steuerklasse und daraus ein Endpreis entsteht.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#apfel">Apfelbeispiel ansehen</a>
            <a class="btn btn-secondary" href="#t-shirt">T-Shirt-Beispiel ansehen</a>
            <a class="btn btn-secondary" href="#rechenlogik">Rechenlogik verstehen</a>
          </div>
          <aside class="notice-box"><strong>Hinweis:</strong> ${esc(data.meta.modelNotice)}</aside>
        </div>
      </section>
      <nav class="impact-jump-nav" aria-label="Sprungnavigation">
        <a href="#apfel">Apfel</a>
        <a href="#t-shirt">T-Shirt</a>
        <a href="#rechenlogik">Rechenlogik</a>
        <a href="#rechner">Rechner</a>
        <a href="#related-questions-title-wirkungssteuer-beispiele">Fragen</a>
      </nav>
      <section class="section" aria-labelledby="steps-title">
        <div class="section-header">
          <p class="hero-kicker">Kurzlogik</p>
          <h2 id="steps-title">Die Rechnung in 6 Schritten</h2>
        </div>
        <div class="impact-step-grid">
          ${[
            "Produkt und Lieferkette bestimmen",
            "Relevante Wirkungsfelder zuordnen",
            "Daten erfassen",
            "Score je Feld berechnen",
            "Reverse Merit Order anwenden",
            "Steuerklasse und Endpreis ableiten",
          ].map((item, index) => `<article><span>${index + 1}</span><p>${esc(item)}</p></article>`).join("")}
        </div>
      </section>
      ${economicLogicSection()}
      <section class="section section-muted" aria-labelledby="visual-title">
        <div class="section-header">
          <p class="hero-kicker">Visualvergleich</p>
          <h2 id="visual-title">Apfel und T-Shirt im Überblick</h2>
          <p>Die Bilder sind visuelle Einstiegsgrafiken. Alle zentralen Werte, Schritte, Begriffe und Rechnungen stehen zusätzlich als HTML darunter.</p>
        </div>
        <div class="impact-visual-grid">
          ${visualCard(apple)}
          ${visualCard(tshirt)}
        </div>
      </section>
      ${appleSection(apple)}
      ${tshirtSection(tshirt)}
      <section class="section" aria-labelledby="compare-title">
        <div class="section-header">
          <p class="hero-kicker">Vergleich</p>
          <h2 id="compare-title">Warum beide Beispiele wichtig sind</h2>
        </div>
        <div class="comparison-columns">
          <article><h3>Apfel</h3><p>Ein einfaches Alltagsprodukt. Es zeigt Landwirtschaft, Wasser, Transport, Biodiversität und Gesundheit in einer gut verständlichen Preislogik.</p></article>
          <article><h3>T-Shirt</h3><p>Eine komplexere internationale Lieferkette. Rohstoff, Chemie, Arbeit, Wasser, Transport, Nutzung und Kreislauf zeigen die Vorsteuerlogik deutlicher.</p></article>
        </div>
        <p class="impact-quote-line"><a class="text-link" href="../../fuer/landwirtschaft/">Für Landwirtschaft vertiefen:</a> Boden, Wasser, Tierwohl, regionale Versorgung, Wirkungsfonds und Agrarförderung werden auf der Zielgruppenseite zusammengeführt.</p>
      </section>
      <section class="section section-muted" aria-labelledby="limits-title">
        <div class="section-header">
          <p class="hero-kicker">Grenzen</p>
          <h2 id="limits-title">Was diese Beispiele zeigen - und was nicht</h2>
        </div>
        <div class="comparison-columns">
          <article><h3>Sie zeigen</h3>${list(["Wirkungssteuerlogik", "Preisrückkopplung", "Reverse Merit Order", "Wirkung entlang der Kette", "Unterschied zwischen Reportingdaten und Steuerungsdaten"])}</article>
          <article><h3>Sie zeigen nicht</h3>${list(["geltendes Recht", "amtliche Produktprüfung", "endgültige Steuerklasse", "vollständige branchenspezifische Scorecard", "Rechts- oder Steuerberatung"])}</article>
        </div>
      </section>
      ${calculatorSection()}
      ${termsSection()}
      ${furtherLinksSection()}
      ${relatedQuestionsSection()}
      <dialog class="example-lightbox" id="example-lightbox" aria-label="Grafik in Vollbildansicht">
        <button class="example-lightbox-close" type="button" data-lightbox-close aria-label="Vollbild schließen">×</button>
        <img src="" alt="" data-lightbox-target>
        <p data-lightbox-caption></p>
      </dialog>
      <script type="application/json" id="impact-tax-data">${scriptJson(data)}</script>
    </main>`;
}

function pageScript() {
  return `<script>
(() => {
  const dataNode = document.getElementById("impact-tax-data");
  const payload = dataNode ? JSON.parse(dataNode.textContent) : { examples: [] };
  const byId = new Map(payload.examples.map((example) => [example.id, example]));
  const money = (value) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Number(value || 0));
  const form = document.querySelector("[data-impact-tax-calculator]");
  if (form) {
    const updateDefaults = () => {
      const product = byId.get(form.product.value);
      const variantKey = form.variant.value;
      if (!product) return;
      const calc = product.calculations.simplified[variantKey];
      const variant = product[variantKey];
      form.netPrice.value = calc.netPrice;
      form.taxRate.value = Math.round(calc.taxRate * 100);
      form.inputScore.value = variantKey === "positive" ? 2 : -2;
    };
    const updateResult = () => {
      const netPrice = Number(form.netPrice.value || 0);
      const taxRate = Number(form.taxRate.value || 0) / 100;
      const inputScore = Number(form.inputScore.value || 0);
      const taxAmount = netPrice * taxRate;
      const grossPrice = netPrice + taxAmount;
      form.querySelector("[data-tax-amount]").textContent = money(taxAmount);
      form.querySelector("[data-gross-price]").textContent = money(grossPrice);
      form.querySelector("[data-deductible]").textContent = inputScore >= 1 ? "möglich" : "nicht möglich";
    };
    form.product.addEventListener("change", () => { updateDefaults(); updateResult(); });
    form.variant.addEventListener("change", () => { updateDefaults(); updateResult(); });
    form.addEventListener("input", updateResult);
    updateDefaults();
    updateResult();
  }
  const dialog = document.getElementById("example-lightbox");
  const image = dialog?.querySelector("[data-lightbox-target]");
  const caption = dialog?.querySelector("[data-lightbox-caption]");
  document.querySelectorAll("[data-lightbox-image]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!dialog || !image) return;
      image.src = button.dataset.lightboxImage;
      image.alt = button.dataset.lightboxAlt || "";
      if (caption) caption.textContent = button.dataset.lightboxCaption || "";
      if (typeof dialog.showModal === "function") dialog.showModal();
    });
  });
  dialog?.querySelector("[data-lightbox-close]")?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
</script>`;
}

function renderPage() {
  const title = "Apfel & T-Shirt: Wirkungssteuer einfach erklärt";
  const description = "Zwei Beispiele zeigen Schritt für Schritt, wie die Wirkungsökonomie Produktwirkung bewertet, daraus Steuerklassen ableitet und Endpreise verändert.";
  const keywords = "Apfel, T-Shirt, Wirkungssteuer, WUStG, Wirkung im Preis, Produktwirkung, Reverse Merit Order, Vorsteuerabzug, Lieferkette, Fast Fashion, Bio-Apfel, Chile-Apfel, Endpreis, Wirkungsscore, Steuerklasse";
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="keywords" content="${esc(keywords)}">
    <link rel="canonical" href="${SITE}/erleben/wirkungssteuer-beispiele/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${SITE}/erleben/wirkungssteuer-beispiele/">
    <meta property="og:image" content="${SITE}/assets/images/examples/wirkungssteuer-apfel.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${SITE}/assets/images/examples/wirkungssteuer-apfel.png">
    <link rel="icon" href="${BASE}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${BASE}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
    ${renderHeader(BASE)}
    ${pageBody()}
    ${renderFooter(BASE)}
    <script src="${BASE}assets/js/main.js?v=20260529-glossary-hover-audit" defer></script>
    ${pageScript()}
  </body>
</html>
`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, renderPage(), "utf8");
console.log(`Generated ${path.relative(ROOT, OUT_FILE)}`);
