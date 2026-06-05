import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const MASTER_JSON = path.join(ROOT, "content/wirkungsradar/debattenkarten-master.json");
const MASTER_DOCX =
  process.env.WOEK_DEBATTENKARTEN_MASTER_DOCX ||
  "/Users/hagen/Library/Mobile Documents/com~apple~CloudDocs/Wirkungsradar_Debattenkarten_Langfassung.docx";
const PUBLIC_BASE = "https://wirkungsoekonomie.de";
const DATA_STAND = "2026-06-05";
const CSS_VERSION = "20260605-master-debattenkarten";
const ACADEMY_NARRATIVE_URL = "https://akademie.wirkungsoekonomie.de/narrativ-einreichen/";

const knownSlugByTitle = new Map(Object.entries({
  "Migration kostet nur?": "migration-kostet-nur",
  "Deutschland nur 2 Prozent?": "deutschland-nur-zwei-prozent",
  "Windräder zerstören Natur?": "windraeder-voegel-wald-beton-rueckbau",
  "Fusion löst das Energieproblem?": "fusion-loest-das-energieproblem",
  "Schulden machen oder sparen?": "schulden-machen-oder-sparen",
  "E-Autos schlimmer als Verbrenner?": "e-autos-schlimmer-als-verbrenner",
  "E-Fuels retten den Verbrenner?": "e-fuels-retten-den-verbrenner",
  "Wasserstoff für alles?": "wasserstoff-fuer-alles",
  "Arbeit lohnt sich nicht mehr?": "arbeit-lohnt-sich-nicht-mehr",
  "CO2-Preis oder fossile Systemkosten?": "co2-preis-oder-fossile-systemkosten",
  "CO₂-Preis oder fossile Systemkosten?": "co2-preis-oder-fossile-systemkosten",
  "Kernenergie wieder in Deutschland?": "kernenergie-wieder-in-deutschland",
  "Radwege in Peru - verschenktes Geld oder verkürzte Empörung?": "radwege-in-peru",
  "Ukraine-Unterstützung und Steuergeld?": "ukraine-unterstuetzung-steuergeld",
  "Ausländer plündern den Sozialstaat?": "auslaender-pluendern-sozialstaat",
  "Die haben nie eingezahlt?": "nie-eingezahlt",
  "Sozialtourismus?": "sozialtourismus-frame",
  "Sozialschmarotzer?": "sozialschmarotzer-frame",
  "Integration ist gescheitert?": "integration-ist-gescheitert",
  "Fachkräftemangel ohne Zuwanderung lösen?": "fachkraeftemangel-ohne-zuwanderung",
  "Kriminalität und Migration?": "kriminalitaet-und-migration",
  "Bürgergeld macht faul?": "buergergeld-macht-faul",
  "Rente ist unbezahlbar?": "rente-unbezahlbar",
  "Deutschland zahlt für die ganze EU?": "eu-undemokratisch-deutschland-zahlt-alles",
  "NGOs kassieren Steuergeld?": "ngos-kassieren-steuergeld",
  "Der Staat verschwendet unser Geld?": "steuerverschwendung-buerokratie",
  "Entwicklungshilfe: Warum nicht zuerst Deutschland?": "entwicklungshilfe-warum-nicht-zuerst-deutschland",
  "Klimafinanzierung: Zahlen wir für andere?": "klimafinanzierung-wir-zahlen-fuer-andere",
  "Warum Geld für China und Indien?": "entwicklungshilfe-china-indien",
  "Geld für Kultur und Gender statt echte Probleme?": "kultur-gender-luxusprojekte",
  "Gender-Ideologie?": "gender-ideologie",
  "Queere Sichtbarkeit bedroht Kinder?": "queere-sichtbarkeit-bedroht-kinder",
  "Feminismus zerstört Familie?": "feminismus-zerstoert-familie",
  "E-Lkw funktionieren nicht?": "e-lkw-funktionieren-nicht",
  "Laden dauert viel zu lange?": "laden-dauert-viel-zu-lange",
  "Wohnungsnot wegen Migration?": "wohnungsnot-wegen-migration",
  "15-Minuten-Stadt oder Klimakäfig?": "15-minuten-stadt-oder-klimakaefig",
  "Parkplätze sind Freiheit?": "parkplaetze-sind-freiheit",
  "ÖRR oder Staatsfunk?": "oerr-oder-staatsfunk",
  "Verfassungsschutz oder Regierungsschutz?": "verfassungsschutz-oder-regierungsschutz",
  "Faktenchecker sind Zensur?": "faktenchecker-sind-zensur",
  "KI nimmt uns alle Jobs?": "ki-nimmt-uns-alle-jobs",
  "KI macht Kinder dumm?": "ki-macht-kinder-dumm",
  "Datenschutz verhindert Innovation?": "datenschutz-verhindert-innovation",
  "Prävention ist zu teuer?": "praevention-ist-zu-teuer",
  "Pflege ist unbezahlbar?": "pflege-ist-unbezahlbar",
  "Mehr Krankenhäuser bedeuten bessere Versorgung?": "mehr-krankenhaeuser-bessere-versorgung",
  "Die Bauern werden geopfert?": "die-bauern-werden-geopfert",
  "Bio kann die Welt nicht ernähren?": "bio-kann-die-welt-nicht-ernaehren",
  "Fleischverzicht ist Ideologie?": "fleischverzicht-ist-ideologie",
  "Waffenlieferungen verlängern den Krieg?": "waffenlieferungen-verlaengern-den-krieg",
  "NATO hat Russland provoziert?": "nato-hat-russland-provoziert",
  "Resilienz ist Autarkie?": "resilienz-ist-autarkie",
  "Wirkungsökonomie bewertet Menschen?": "woek-bewertet-menschen",
  "Wirkungsteuer macht alles teurer?": "wirkungsteuer-macht-alles-teurer",
  "Altparteien?": "altparteien",
  "Angst vor AfD-Wahlsieg?": "angst-vor-afd-wahlsieg",
  "Diktatur der Altparteien?": "diktatur-der-altparteien",
  "Remigration / Remigrationslotsen?": "remigration-remigrationslotsen",
  "Kehrtwende um 180 Grad?": "kehrtwende-180-grad",
  "Planwirtschaftliche Energiewende?": "planwirtschaftliche-energiewende",
  "Klimadiktatur / Klimaextremismus / Klimapropaganda?": "klimaschutz-ist-oekodiktatur",
  "Zensurbehörden / betreute Meinung / ÖRR-Frame?": "das-ist-zensur",
  "Batterien sind nicht recyclebar?": "batterien-sind-nicht-recyclebar",
  "CO2 ist nur ein Spurengas?": "co2-ist-nur-ein-spurengas",
  "CO₂ ist nur ein Spurengas?": "co2-ist-nur-ein-spurengas",
  "Das ist alles gesteuert?": "das-ist-alles-gesteuert",
  "Sind die Reichen schuld?": "sind-die-reichen-schuld",
  "Die da oben machen sowieso, was sie wollen?": "die-da-oben",
  "Die Wissenschaft ist gekauft?": "die-wissenschaft-ist-gekauft",
  "Die Energiewende ist gescheitert?": "energiewende-gescheitert",
  "Heizgesetz oder Heizhammer?": "heizgesetz-heizhammer-narrativ",
  "Kernenergie wäre die einfache Lösung?": "kernenergie-einfache-loesung",
  "Klima hat sich schon immer verändert?": "klima-hat-sich-schon-immer-veraendert",
  "Klimaschutz deindustrialisiert Deutschland?": "klimaschutz-deindustrialisiert-deutschland",
  "Klimaschutz ist Ökodiktatur?": "klimaschutz-ist-oekodiktatur",
  "Werden Leistungsträger ausgepresst?": "leistungstraeger-ausgepresst",
  "Mainstreammedien lügen alle?": "mainstreammedien-luegen-alle",
  "Man darf ja nichts mehr sagen?": "man-darf-ja-nichts-mehr-sagen",
  "Man wird doch wohl fragen dürfen?": "man-wird-doch-wohl-fragen-duerfen",
  "SDGs sind Weltregierung?": "sdgs-weltregierung",
  "Windräder zerstören die Natur?": "windraeder-zerstoeren-natur",
  "Wirkungsökonomie ist Planwirtschaft?": "wirkungsoekonomie-planwirtschaft",
  "Wirkungsökonomie ist Social Credit?": "wirkungsoekonomie-social-credit",
  "Wärmepumpe ist unbezahlbar? (redaktionelle Ergänzung)": "waermepumpe-ist-unbezahlbar",
  "Solarstrom ist unzuverlässig? (redaktionelle Ergänzung)": "solarstrom-ist-unzuverlaessig",
  "Verbrennerverbot nimmt Freiheit? (redaktionelle Ergänzung)": "verbrennerverbot-nimmt-freiheit",
  "Tempolimit bringt nichts? (redaktionelle Ergänzung)": "tempolimit-bringt-nichts",
  "Klimaschutz ist zu teuer? (redaktionelle Ergänzung)": "klimaschutz-ist-zu-teuer",
  "Bürokratieabbau statt Wirkung? (redaktionelle Ergänzung)": "buerokratieabbau-statt-wirkung",
  "Deutschland schafft sich ab? (redaktionelle Ergänzung)": "deutschland-schafft-sich-ab",
}));

const clusterLabels = {
  migration: "Migration",
  climate_energy: "Klima & Energie",
  finance_state: "Staat, Geld & Verantwortung",
  mobility: "Mobilität",
  work_social: "Arbeit & Sozialstaat",
  security: "Ausland & Sicherheit",
  gender_culture: "Kultur, Familie & Geschlecht",
  democracy_media: "Demokratie & Öffentlichkeit",
  tech_ai: "Digitalisierung & KI",
  health_care: "Gesundheit & Pflege",
  agri_food: "Landwirtschaft & Ernährung",
  woek: "Wirkungsökonomie",
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(value) {
  return esc(value).replace(/'/g, "&#039;");
}

function slugify(value) {
  return String(value ?? "")
    .replace(/\(redaktionelle Ergänzung\)/gi, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/co2/g, "co2")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\u000b/g, "\n")
    .replace(/\u000c/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\bCO2\b/g, "CO₂")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function paragraphize(value) {
  const parts = cleanText(value).split(/\n{2,}|\n(?=\S)/).map((part) => part.trim()).filter(Boolean);
  return parts.map((part) => `<p>${esc(part)}</p>`).join("");
}

function list(items) {
  const rows = (items || []).filter(Boolean);
  if (!rows.length) return "";
  return `<ul class="check-list">${rows.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function extractDocxText(file) {
  const xml = execFileSync("unzip", ["-p", file, "word/document.xml"], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/\r/g, "\n");
}

function parseRegister(text) {
  const start = text.indexOf("Kartenregister");
  const end = text.search(/\n1\. Migration kostet nur\?/);
  if (start < 0 || end < 0) return [];
  const lines = text.slice(start, end).split("\n").map((line) => line.trim()).filter(Boolean);
  const rows = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\d+$/.test(lines[i])) continue;
    const number = Number(lines[i]);
    const title = lines[i + 1];
    const cluster = lines[i + 2];
    if (title && cluster && !/^\d+$/.test(title)) rows.push({ number, title, cluster });
  }
  return rows;
}

function valueBetween(body, label, nextLabels) {
  const start = body.indexOf(label);
  if (start < 0) return "";
  const after = start + label.length;
  const next = nextLabels
    .map((nextLabel) => body.indexOf(nextLabel, after))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  return cleanText(body.slice(after, next ?? undefined));
}

function parseObjections(value) {
  const text = cleanText(value);
  if (!text) return [];
  return text
    .split(/\n(?=Einwand: )|(?=Einwand: )/g)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^Einwand:\s*(.+?)(?:\.\s+|\?\s+)([\s\S]*)$/);
      if (!match) return { objection: entry, answer: "" };
      return { objection: match[1].trim(), answer: match[2].trim() };
    });
}

function parseModeration(value) {
  const text = cleanText(value);
  const hints = {};
  for (const line of text.split("\n").map((item) => item.trim()).filter(Boolean)) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) hints[match[1].trim()] = match[2].trim();
  }
  return hints;
}

function parseCardsFromText(rawText) {
  const text = cleanText(rawText);
  const register = parseRegister(text);
  if (register.length < 80) throw new Error(`Kartenregister unvollständig: ${register.length} Einträge gefunden.`);
  const start = text.search(/\n1\. Migration kostet nur\?/);
  if (start < 0) throw new Error("Masterquelle enthält keinen erkennbaren Start der Debattenkarten.");
  const cardText = text.slice(start).trim();
  const matches = register.map((row) => {
    const needle = `${row.number}. ${row.title}`;
    const index = cardText.indexOf(needle);
    if (index < 0) throw new Error(`Karte aus Register nicht im Dokument gefunden: ${needle}`);
    return {
      number: row.number,
      title: row.title,
      cluster: row.cluster,
      index,
      headerLength: needle.length,
    };
  }).sort((a, b) => a.index - b.index);
  const cards = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];
    const number = Number(match.number);
    const title = match.title.trim();
    const sectionStart = match.index + match.headerLength;
    const sectionEnd = next ? next.index : cardText.length;
    const body = cleanText(cardText.slice(sectionStart, sectionEnd));
    const meta = match;
    const shortJudgement = valueBetween(body, "Kurzurteil:", ["Was an diesem Satz verfängt:", "Wahrer Kern:"]);
    const hook = valueBetween(body, "Was an diesem Satz verfängt:", ["Wahrer Kern:"]);
    const trueCore = valueBetween(body, "Wahrer Kern:", ["Falscher Sprung:"]);
    const falseJump = valueBetween(body, "Falscher Sprung:", ["Bessere Frage:"]);
    const betterQuestion = valueBetween(body, "Bessere Frage:", ["Systemischer Hebel:"]);
    const lever = valueBetween(body, "Systemischer Hebel:", ["Wirkpfad und systemische Einordnung"]);
    const pathBlock = valueBetween(body, "Wirkpfad und systemische Einordnung", ["Antworttexte"]);
    const order1 = valueBetween(pathBlock, "1. Ordnung:", ["2. Ordnung:"]);
    const order2 = valueBetween(pathBlock, "2. Ordnung:", ["3. Ordnung:"]);
    const order3 = valueBetween(pathBlock, "3. Ordnung:", ["Mensch, Planet, Demokratie:"]);
    const mpd = valueBetween(pathBlock, "Mensch, Planet, Demokratie:", []);
    const answersBlock = valueBetween(body, "Antworttexte", ["Einwände und Antwortlinien"]);
    const answer10 = valueBetween(answersBlock, "10 Sekunden:", ["30 Sekunden:"]);
    const answer30 = valueBetween(answersBlock, "30 Sekunden:", ["120 Sekunden:"]);
    const answer120 = valueBetween(answersBlock, "120 Sekunden:", []);
    const objectionsBlock = valueBetween(body, "Einwände und Antwortlinien", ["Moderations- und Quellenhinweise"]);
    const moderationBlock = valueBetween(body, "Moderations- und Quellenhinweise", []);
    const moderation = parseModeration(moderationBlock);
    const rawTitle = meta.title || title;
    const slug = knownSlugByTitle.get(rawTitle) || knownSlugByTitle.get(title) || slugify(title);
    const card = {
      number,
      title: rawTitle.replace(/\s+\(redaktionelle Ergänzung\)$/i, "").trim(),
      originalTitle: rawTitle,
      slug,
      cluster: meta.cluster || "unclustered",
      category: clusterLabels[meta.cluster] || meta.cluster || "Debatten-Kompass",
      editorialStatus: /redaktionelle Ergänzung/.test(rawTitle) ? "redaktionelle Ergänzung aus Masterquelle" : "aus Masterquelle integriert",
      shortJudgement,
      hook,
      trueCore,
      falseJump,
      betterQuestion,
      systemLever: lever,
      effectPath: {
        order1,
        order2,
        order3,
        mpd,
      },
      answers: {
        seconds10: answer10,
        seconds30: answer30,
        seconds120: answer120,
      },
      objections: parseObjections(objectionsBlock),
      moderation,
      sourceHints: moderation.Prüfhinweise || "",
      masterSource: {
        document: "Wirkungsradar_Debattenkarten_Langfassung.docx",
        stand: DATA_STAND,
      },
    };
    applyEditorialOverlays(card);
    cards.push(card);
  }
  return { stand: DATA_STAND, source: "Wirkungsradar_Debattenkarten_Langfassung.docx", cards };
}

function applyEditorialOverlays(card) {
  if (card.slug !== "radwege-in-peru") return;
  const financingCore = " Konkret wichtig: Die bekannte 315-Mio.-Erzählung vermischt Projektvolumen, Kredit, Zuschuss und verschiedene Mobilitätsbausteine. Ein Kredit ist kein Geschenk; er wird zurückgezahlt. Ein Zuschuss ist anders zu bewerten als ein rückzahlbarer Förderkredit. In den geprüften Darstellungen müssen Radwege, Bus- und Metro-Anbindung, Sicherheit, Klimaanpassung und städtische Erreichbarkeit getrennt werden.";
  const germanyCore = " Für Deutschland ist das nicht nur Wohltätigkeit: Stabilere Städte, weniger Emissionen, weniger Krisen- und Importfolgen sowie mögliche Aufträge für deutsche und europäische Unternehmen sind eigene Wirkungsinteressen.";
  card.trueCore = `${card.trueCore}${financingCore}${germanyCore}`;
  card.falseJump = `${card.falseJump} Falsch ist insbesondere, aus einem zusammengeschnittenen 315-Mio.-Bild so zu tun, als sei jeder Euro ein verlorener deutscher Zuschuss für einen einzelnen Radweg. Zahlen wie 155 Mio oder 33 Mio müssen immer nach Finanzierungsart, Zweck, Rückzahlung, Projektträger und Wirkung gelesen werden.`;
  card.answers.seconds10 = "Ja, internationale Projekte müssen geprüft werden. Aber beim Peru-Beispiel werden Kredit, Zuschuss und Projektzweck oft vermischt. Ein Kredit wird zurückgezahlt; entscheidend ist, welche Wirkung entstehen soll: sichere Wege, Metro-Anbindung, weniger Stau, weniger Emissionen und stabile Partner.";
  card.answers.seconds30 = "Der berechtigte Kern ist: Auslandsausgaben brauchen Transparenz und Wirkungskontrolle. Der falsche Sprung ist, aus der 315-Mio.-Erzählung ein Geschenkbild zu machen. Man muss trennen: Was ist Zuschuss, was ist Kredit, was wird zurückgezahlt, was betrifft Radwege, was betrifft Metro, Busse und sichere Mobilität? Wirkung entsteht, wenn Menschen besser zur Schule, Arbeit und Versorgung kommen und wenn deutsche oder europäische Unternehmen sowie Deutschland insgesamt von stabileren Partnern, geringeren Krisenkosten und Klimawirkung profitieren.";
  card.answers.seconds120 = "Bei Radwegen in Peru ist die bessere Antwort nicht: Ausland gut oder Ausland schlecht. Die bessere Antwort ist Bilanzgrenze. Erstens: Finanzierungsart klären. Ein Kredit ist kein Geschenk, sondern wird zurückgezahlt; ein Zuschuss muss separat begründet werden. Zweitens: Projektzweck klären. Es geht nicht nur um ein Symbolbild Fahrradweg, sondern um städtische Mobilität, Sicherheit, Bus- und Metro-Anbindung, weniger Stau, Luftqualität und Teilhabe. Drittens: Eigeninteresse klären. Deutschland hat ein Interesse an stabilen Partnerländern, weniger Klima- und Krisenfolgen, verlässlicher Kooperation und an Projekten, bei denen deutsche und europäische Unternehmen Know-how, Technik oder Dienstleistungen liefern können. Viertens: Zahlen sauber halten. 315-Mio., 155 Mio und 33 Mio dürfen nicht als ein und dieselbe Zahlung erzählt werden; sie müssen nach Kredit, Zuschuss, Rückzahlung, Empfänger, Zweck und Wirkung getrennt geprüft werden. Wirkungsökonomisch ist ein solches Projekt nur dann gut, wenn es nachweisbar Sicherheit, Erreichbarkeit, Klimaresilienz, lokale Wertschöpfung und demokratische Transparenz verbessert. Genau diese Prüfung ist seriöser als Empörung über ein einzelnes Projektbild.";
  card.effectPath.mpd = `${card.effectPath.mpd} Mensch: sichere Wege, Metro-Erreichbarkeit, weniger Unfall- und Luftbelastung. Planet: weniger lokale Emissionen und bessere Klimaanpassung, wenn der Verkehrsverbund tatsächlich wirkt. Demokratie: bessere Rechenschaft, wenn Kredit, Zuschuss, Rückzahlung, Ausschreibung, deutsche Unternehmensbezüge und Projektwirkung offen getrennt werden.`;
  card.systemLever = `${card.systemLever} Finanzierungsart offenlegen: Kredit, Zuschuss, Rückzahlung, Zweck, beteiligte Unternehmen und messbare Wirkung getrennt prüfen.`;
  card.sourceHints = `${card.sourceHints}, BMZ/KfW Projektinformationen, Kredit- und Zuschussstruktur, Ausschreibungen, Metro- und Mobilitätsplanung, Wirkungsindikatoren zu Sicherheit, Luftqualität und Erreichbarkeit`;
}

function readMasterData() {
  if (fs.existsSync(MASTER_DOCX)) {
    const parsed = parseCardsFromText(extractDocxText(MASTER_DOCX));
    fs.mkdirSync(path.dirname(MASTER_JSON), { recursive: true });
    fs.writeFileSync(MASTER_JSON, `${JSON.stringify(parsed, null, 2)}\n`);
    return parsed;
  }
  if (!fs.existsSync(MASTER_JSON)) {
    throw new Error(`Keine Masterquelle gefunden: ${MASTER_DOCX} oder ${MASTER_JSON}`);
  }
  return JSON.parse(fs.readFileSync(MASTER_JSON, "utf8"));
}

function write(file, html) {
  const full = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${html.trim()}\n`);
}

function shell({ title, description, canonical, base, main, searchType = "Debattenkarte" }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} | Debatten-Kompass</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_section" content="Debatten-Kompass">
    <meta name="search_type" content="${esc(searchType)}">
    <link rel="canonical" href="${esc(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude></nav>
    </header>
    <main id="inhalt" data-pagefind-body>${main}</main>
    <footer class="footer" data-search-exclude>
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">Debatten-Kompass</p>
          <h2>Werkzeug statt Kartenfriedhof.</h2>
          <p>Diese Debattenkarte folgt der redaktionellen Masterquelle vom ${DATA_STAND}: wahrer Kern, falscher Sprung, Wirkpfad, Antwort und Prüfhinweise.</p>
          <p><a class="text-link" href="${base}wirkungsradar/methode/">Methode</a> · <a class="text-link" href="${base}wirkungsradar/debattenkarten/">Alle Debattenkarten</a> · <a class="text-link" href="${base}mitmachen.html">Kontakt und Mitmachen</a></p>
        </div>
        <a class="btn btn-primary" href="${base}wirkungsradar/">Debatten-Kompass öffnen</a>
      </div>
    </footer>
    <script src="${base}assets/js/main.js?v=${CSS_VERSION}"></script>
  </body>
</html>`;
}

function radarNav(base = "") {
  const links = [
    ["Antwort finden", `${base}wirkungsradar/`],
    ["Antwortkarten", `${base}wirkungsradar/live/`],
    ["Debattenkarten", `${base}wirkungsradar/debattenkarten/`],
    ["Narrative", `${base}wirkungsradar/narrative/`],
    ["Antwort-Playbooks", `${base}wirkungsradar/antwort-playbooks/`],
    ["Narrativ einreichen", ACADEMY_NARRATIVE_URL],
    ["Methode", `${base}wirkungsradar/methode/`],
  ];
  return `<nav class="topic-subnav radar-sprint-nav" aria-label="Debatten-Kompass Navigation" data-search-exclude>${links.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</nav>`;
}

function renderToc() {
  const links = [
    ["#behauptung", "Behauptung"],
    ["#sofortantwort", "Sofortantwort"],
    ["#faktenkern", "Faktenkern"],
    ["#frameanalyse", "Frameanalyse"],
    ["#folgencheck", "Folgencheck"],
    ["#wirkpfad", "Wirkpfad"],
    ["#kritische-fragen", "Kritische Fragen"],
    ["#loesung", "Besserer Frame"],
    ["#faktenlage", "Prüfhinweise"],
  ];
  return `<section class="section debate-toc-section" id="inhaltsverzeichnis" data-debate-toc data-search-exclude><div><article class="card debate-toc-card"><p class="card-kicker">Inhaltsverzeichnis</p><nav class="dossier-tab-nav v3-radar-nav" aria-label="Seitenbereiche">${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}</nav></article></div></section>`;
}

function answerAccordion(card) {
  const rows = [
    ["10 Sekunden", "Pointierte Antwort", card.answers.seconds10],
    ["30 Sekunden", "Faktenkern und Framekorrektur", card.answers.seconds30],
    ["2 Minuten", "Systemische Antwort", card.answers.seconds120],
  ];
  return `<section class="section section-soft v3-layer v3-layer-answer debate-immediate-answer" id="sofortantwort" data-debate-immediate-answer><span id="reaktion" class="sr-only">Reaktion</span><div><div class="section-header"><p class="hero-kicker">Sofortantwort</p><h2>Was antworte ich?</h2><p>Wenn du gerade in der Debatte bist. Die Sekunden sind Kommunikationsstufen, keine Stoppuhr.</p><p><a class="btn btn-secondary" href="#folgencheck">Mehr verstehen</a></p></div><div class="radar-answer-accordion host-answer-tabs">${rows.map(([label, purpose, text], index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(label)}</span><span class="radar-answer-label">${esc(purpose)}</span></summary>${paragraphize(text)}<button class="copy-chip" type="button" data-copy-text='${attr(text)}'>Antwort kopieren</button></details>`).join("")}</div></div></section>`;
}

function renderCardPage(card, mode = "live") {
  const base = mode === "live" ? "../../../" : "../../../";
  const canonicalPath = `/wirkungsradar/${mode}/${card.slug}/`;
  const main = `
    <section class="hero radar-page-hero theme-hero">
      <div class="radar-hero-copy">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}wirkungsradar/">Debatten-Kompass</a> / ${esc(card.category)}</nav>
        <p class="hero-kicker">Debattenkarte · ${esc(card.category)}</p>
        <h1 class="hero-title">${esc(card.title)}</h1>
        <p class="hero-subtitle">${esc(card.shortJudgement)}</p>
        <p class="radar-status-line"><span>${esc(card.editorialStatus)}</span><span>Masterquelle: ${esc(card.masterSource.document)}</span><span>Datenstand: ${DATA_STAND}</span></p>
      </div>
    </section>
    ${radarNav(base)}
    ${renderToc()}
    <span id="host-cockpit" class="sr-only">Debattenhilfe</span>
    <section class="section debate-claim-section" id="behauptung"><div><article class="v2-cockpit-shell"><div class="v2-cockpit-head"><p class="hero-kicker">Was wird behauptet?</p><h2>${esc(card.title)}</h2><p class="v2-claim-line">${esc(card.hook)}</p></div><div class="card-grid two"><article class="card"><p class="card-kicker">Kurzurteil</p><h3>${esc(card.shortJudgement)}</h3></article><article class="card"><p class="card-kicker">Bessere Frage</p><h3>${esc(card.betterQuestion)}</h3></article></div></article></div></section>
    <span id="relevanz" class="sr-only">Warum relevant?</span>
    ${answerAccordion(card)}
    <section class="section" id="faktenkern"><div><div class="section-header"><p class="hero-kicker">Faktenkern</p><h2>Was stimmt, was fehlt?</h2></div><div class="card-grid two"><article class="card"><p class="card-kicker">Wahrer Kern</p>${paragraphize(card.trueCore)}</article><article class="card"><p class="card-kicker">Falscher Sprung</p>${paragraphize(card.falseJump)}</article></div></div></section>
    <section class="section section-soft" id="frameanalyse"><div><div class="section-header"><p class="hero-kicker">Frameanalyse</p><h2>Welche Geschichte wird erzählt?</h2></div><article class="card">${paragraphize(card.hook)}<p><strong>Systemischer Hebel:</strong> ${esc(card.systemLever)}</p></article></div></section>
    <section class="section section-soft v3-layer v3-layer-consequences debate-consequence-main" id="folgencheck" data-v3-consequence-check><div><div class="section-header"><p class="hero-kicker">Folgencheck</p><h2>Was dieses Narrativ bewirken kann.</h2><p>Wirkungspotenzial wird nicht automatisch als eingetretene Wirkung gelesen. Entscheidend ist der konkrete Wirkpfad.</p></div><div class="card-grid three v3-consequence-orders"><article class="card v3-order-card"><p class="v2-badge">Wirkung 1. Ordnung</p><h3>Wahrnehmung</h3>${paragraphize(card.effectPath.order1)}<p><strong>Narrativ:</strong> ${esc(card.title)}</p><p><strong>Wirkmechanismus:</strong> ${esc(card.falseJump)}</p><p><strong>Wirkungspfad:</strong> Aufmerksamkeit verschiebt sich vom vollständigen Wirkungsraum auf den verkürzten Frame.</p><p><strong>Begründung:</strong> Diese Wirkung ist aus dem Mastertext abgeleitet, nicht aus einer generischen Karte.</p></article><article class="card v3-order-card"><p class="v2-badge">Wirkung 2. Ordnung</p><h3>Entscheidung</h3>${paragraphize(card.effectPath.order2)}<p><strong>Narrativ:</strong> ${esc(card.title)}</p><p><strong>Wirkmechanismus:</strong> ${esc(card.hook)}</p><p><strong>Wirkungspfad:</strong> Der Frame macht bestimmte politische Antworten plausibler und andere unsichtbarer.</p><p><strong>Begründung:</strong> Der zweite Schritt beschreibt Anschlussentscheidungen und Nebenwirkungen.</p></article><article class="card v3-order-card"><p class="v2-badge">Wirkung 3. Ordnung</p><h3>Systempfad</h3>${paragraphize(card.effectPath.order3)}<p><strong>Narrativ:</strong> ${esc(card.title)}</p><p><strong>Wirkmechanismus:</strong> Wiederholung stabilisiert die verkürzte Deutung.</p><p><strong>Wirkungspfad:</strong> Öffentlicher Diskurs, Investitionen, Regeln und Vertrauen folgen dem falschen Problemzuschnitt.</p><p><strong>Begründung:</strong> Der Langfristpfad zeigt, was passiert, wenn der Frame Lernfähigkeit ersetzt.</p></article></div></div></section>
    <section class="section" id="wirkpfad"><span id="loesungspfad" class="sr-only">Lösungspfad</span><span id="host-antworten" class="sr-only">Antwortblock</span><div><div class="section-header"><p class="hero-kicker">Wirkpfad</p><h2>Mensch, Planet und Demokratie.</h2></div><article class="card">${paragraphize(card.effectPath.mpd)}<p><strong>Wirkungsökonomische Einordnung:</strong> Die Karte prüft, ob die Aussage Wahrnehmung, Entscheidung und Rückkopplung so verändert, dass positive Netto-Wirkung für Mensch, Planet und Demokratie wahrscheinlicher oder unwahrscheinlicher wird.</p></article></div></section>
    <section class="section section-soft" id="kritische-fragen"><span id="einwaende" class="sr-only">Einwände</span><div><div class="section-header"><p class="hero-kicker">Einwände und Antwortlinien</p><h2>Was berechtigt kritisch gefragt werden darf.</h2></div><div class="card-grid two">${card.objections.length ? card.objections.map((item) => `<article class="card"><p class="card-kicker">Einwand</p><h3>${esc(item.objection)}</h3>${paragraphize(item.answer)}</article>`).join("") : `<article class="card"><p>Konkrete Einwände werden redaktionell weiter ergänzt. Die bessere Prüfspur steht im Faktenkern, Wirkpfad und in den Prüfhinweisen.</p></article>`}</div></div></section>
    <section class="section" id="loesung"><div><div class="section-header"><p class="hero-kicker">Besserer Frame</p><h2>Was macht den Zustand besser?</h2></div><article class="card"><p><strong>Bessere Frage:</strong> ${esc(card.betterQuestion)}</p><p><strong>Systemischer Hebel:</strong> ${esc(card.systemLever)}</p>${card.moderation["Konkreten Hebel anbieten"] ? `<p><strong>Konkreter Hebel:</strong> ${esc(card.moderation["Konkreten Hebel anbieten"])}</p>` : ""}${card.moderation["Zum Schluss nicht demütigen. Eine gute Antwort lässt dem Gegenüber eine Brücke zurück in eine sachliche Position."] ? "" : "<p>Zum Schluss nicht demütigen. Eine gute Antwort lässt dem Gegenüber eine Brücke zurück in eine sachliche Position.</p>"}</article></div></section>
    <section class="section section-soft" id="faktenlage"><div><div class="section-header"><p class="hero-kicker">Faktenlage</p><h2>Was redaktionell geprüft werden muss.</h2></div><article class="card"><p>Die Masterquelle nennt Prüfhinweise. Daraus werden keine erfundenen Quellenbelege gemacht; konkrete Links und Primärquellen bleiben redaktionell zu prüfen.</p><div id="quellen">${card.sourceHints ? list(card.sourceHints.split(/,\s*/)) : "<p>Quellenprüfung offen.</p>"}</div></article></div></section>
    <section class="section" id="narrativ-einreichen" data-community-submission-block><div><article class="card"><p class="card-kicker">Fehlt ein Narrativ?</p><h2>Hast du eine Aussage gesehen, die geprüft werden sollte?</h2><p>Reiche sie über die Akademie-App ein. Dort kann die Redaktion die Aussage prüfen, clustern und in den Debatten-Kompass übernehmen.</p><p><a class="btn btn-primary" href="${ACADEMY_NARRATIVE_URL}">Narrativ einreichen</a></p></article></div></section>
  `;
  return shell({
    title: card.title,
    description: card.shortJudgement || card.trueCore,
    canonical: `${PUBLIC_BASE}${canonicalPath}`,
    base,
    main,
  });
}

function renderIndex(cards, mode = "live") {
  const base = mode === "live" ? "../../" : "../../";
  const clusters = [...new Set(cards.map((card) => card.category))].sort((a, b) => a.localeCompare(b, "de"));
  const cardHtml = cards.map((card) => `<article class="card radar-sprint-card" data-radar-card data-topic="${attr(card.category)}" data-search="${attr([card.title, card.shortJudgement, card.trueCore, card.falseJump, card.betterQuestion, card.systemLever, card.category].join(" "))}"><div class="radar-card-badges"><span>${esc(card.category)}</span><span>${esc(card.editorialStatus)}</span></div><h3 class="card-title">${esc(card.title)}</h3><p class="radar-card-judgement">${esc(card.shortJudgement)}</p><p class="card-text"><strong>10 Sekunden:</strong> ${esc(card.answers.seconds10)}</p><div class="radar-card-actions"><a class="btn btn-primary" href="${mode === "live" ? "" : "../live/"}${card.slug}/">Antwort öffnen</a><button class="copy-chip" type="button" data-copy-text='${attr(card.answers.seconds10)}'>Kurzantwort kopieren</button></div></article>`).join("");
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / Debatten-Kompass</nav><p class="hero-kicker">Debatten-Kompass</p><h1 class="hero-title">Welche Aussage willst du beantworten?</h1><p class="hero-subtitle">${cards.length} Debattenkarten aus der redaktionellen Masterquelle vom ${DATA_STAND}. Übersicht kompakt, Langfassung auf der Detailseite.</p></div></section>${radarNav(base)}<section class="section radar-live-controls radar-answer-first" data-radar-live-filter><div><label class="radar-search-field"><span>Direkt zur passenden Antwort</span><input type="search" placeholder="z. B. Migration kostet nur, Gender-Ideologie, CO₂ ist nur ein Spurengas..." data-live-query autofocus></label><div class="filter-chip-row" aria-label="Themenfilter"><button type="button" data-live-filter="all" aria-pressed="true">Alle Themen</button>${clusters.map((cluster) => `<button type="button" data-live-filter="${attr(cluster)}">${esc(cluster)}</button>`).join("")}</div><p class="radar-search-status" data-live-count>${cards.length} Karten gefunden</p></div></section><section class="section" id="debattenkarten"><div><div class="section-header"><p class="hero-kicker">Antworten</p><h2>Masterquelle statt Kurzfloskeln.</h2><p>Jede Karte enthält Faktenkern, falschen Sprung, Wirkpfad, Antwortstufen, Einwände und Prüfhinweise.</p></div><div class="card-grid three" data-live-grid>${cardHtml}</div></div></section>`;
  return shell({
    title: "Debattenkarten",
    description: `${cards.length} Debattenkarten aus der redaktionellen Masterquelle.`,
    canonical: `${PUBLIC_BASE}/wirkungsradar/${mode}/`,
    base,
    main,
    searchType: "Debattenkarten-Index",
  });
}

function renderReport(cards, routeStateBeforeWrite) {
  const existingLive = cards.filter((card) => routeStateBeforeWrite.get(card.slug));
  const newCards = cards.filter((card) => !routeStateBeforeWrite.get(card.slug));
  const byCluster = Object.entries(cards.reduce((acc, card) => {
    acc[card.category] = (acc[card.category] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => a[0].localeCompare(b[0], "de"));
  return `# Debattenkarten Masterintegration\n\nStand: ${DATA_STAND}\n\n## Ergebnis\n\n- Masterkarten im Dokument: ${cards.length}\n- Bestehende Live-Routen überschrieben/aktualisiert: ${existingLive.length}\n- Neue Live-Routen aus Masterquelle angelegt: ${newCards.length}\n- Quelle: \`Wirkungsradar_Debattenkarten_Langfassung.docx\`\n\n## Cluster\n\n${byCluster.map(([cluster, count]) => `- ${cluster}: ${count}`).join("\n")}\n\n## Neue Routen\n\n${newCards.map((card) => `- /wirkungsradar/live/${card.slug}/ — ${card.title}`).join("\n") || "- Keine"}\n\n## Redaktionell offen\n\n- Prüfhinweise sind übernommen, aber nicht als harte Quellenbelege ausgegeben.\n- Konkrete Primärquellen müssen je Karte weiter verlinkt werden.\n- Karten aus der Masterquelle überschreiben kürzere oder floskelhaftere Online-Texte.\n`;
}

function isTracked(filePath) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", filePath], { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function walkHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkHtml(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

function normalizeLegacyPublicLabels() {
  let changed = 0;
  for (const file of walkHtml(path.join(ROOT, "wirkungsradar"))) {
    const before = fs.readFileSync(file, "utf8");
    const after = before
      .replace(/Host-Cockpit/g, "Debattenhilfe")
      .replace(/Wirkungsradar-Live/g, "Debatten-Kompass")
      .replace(/Live-Karten/g, "Antwortkarten")
      .replace(/v3 Antwortformat/g, "Antwortformat")
      .replace(/Gute Rückfrage/g, "Kritische Frage")
      .replace(/Gute Rueckfrage/g, "Kritische Frage");
    if (after !== before) {
      fs.writeFileSync(file, after);
      changed += 1;
    }
  }
  return changed;
}

const master = readMasterData();
if (!Array.isArray(master.cards) || master.cards.length < 80) {
  throw new Error(`Masterquelle unvollständig: ${master.cards?.length ?? 0} Karten gefunden.`);
}

const routeStateBeforeWrite = new Map(master.cards.map((card) => [
  card.slug,
  isTracked(`wirkungsradar/live/${card.slug}/index.html`),
]));

for (const card of master.cards) {
  write(`wirkungsradar/live/${card.slug}/index.html`, renderCardPage(card, "live"));
  write(`wirkungsradar/detail/${card.slug}/index.html`, renderCardPage(card, "detail"));
}

write("wirkungsradar/live/index.html", renderIndex(master.cards, "live"));
write("wirkungsradar/debattenkarten/index.html", renderIndex(master.cards, "debattenkarten"));
write("reports/debattenkarten-masterintegration.md", renderReport(master.cards, routeStateBeforeWrite));

const normalizedLegacyFiles = normalizeLegacyPublicLabels();

console.log(`Debattenkarten-Masterintegration OK: ${master.cards.length} Karten gerendert, ${normalizedLegacyFiles} Radar-Dateien normalisiert.`);
