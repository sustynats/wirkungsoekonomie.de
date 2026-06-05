import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-27";
const CSS_VERSION = "20260524-medien-oeffentlichkeit";
const JS_VERSION = "20260523-nachhaltigkeit";
const SRC = "docs/medien-oeffentlichkeit";
const SOURCE = `${SRC}/source`;
const EXTRACT = `${SRC}/docx-extracts`;

const portalData = JSON.parse(fs.readFileSync(path.join(ROOT, SOURCE, "medien_oeffentlichkeit_portal_matrix_v0_1.json"), "utf8"));
const mwix = JSON.parse(fs.readFileSync(path.join(ROOT, SOURCE, "mwix_working_model_v0_1.json"), "utf8"));
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const headerTemplate = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");

const modules = [
  ["oeffentlichkeit-als-wirkungsraum", "Öffentlichkeit als Wirkungsraum"],
  ["journalismus-wirkung-statt-klicks", "Journalismus: Wirkung statt Klicks"],
  ["medienqualitaet-sdgplus", "Medienqualität und redaktionelle Verantwortung"],
  ["plattformen-social-media", "Plattformen, Algorithmen und Reichweitenlogik"],
  ["creator-hosts", "Creator:innen, Hosts und Influencer-Verantwortung"],
  ["sprache-diskurskultur", "Sprache, Framing und Diskurskultur"],
  ["desinformation-deepfakes", "Desinformation, Fake News, Deepfakes und hybride Einflussnahme"],
  ["politische-kommunikation-wahlwerbung", "Politische Kommunikation, Wahlwerbung und Microtargeting"],
  ["digitale-oeffentliche-infrastruktur", "Öffentlich-rechtliche digitale Infrastruktur und Agentur für Digitale Öffentlichkeit"],
  ["medienwirkungsindex-mwix", "Medienwirkungsindex, WÖk-IDs und Scorecards"],
  ["digitale-selbstbestimmung-datenschutz-jugendschutz", "Digitale Selbstbestimmung, Datenschutz und Jugendschutz"],
  ["politische-anschlussfaehigkeit", "Politische Anschlussfähigkeit und Umsetzungsoptionen"],
].map(([slug, title], index) => ({
  slug,
  title,
  index,
  summary: portalData.subtopics[index]?.summary || "",
  bullets: portalData.subtopics[index]?.bullets || [],
}));

const aliases = [
  ["plattformen-algorithmen", "plattformen-social-media", "Plattformen, Algorithmen und Reichweitenlogik"],
  ["creator-hosts-influencer", "creator-hosts", "Creator:innen, Hosts und Influencer-Verantwortung"],
  ["sprache-framing-diskurskultur", "sprache-diskurskultur", "Sprache, Framing und Diskurskultur"],
  ["desinformation-deepfakes-hybride-einflussnahme", "desinformation-deepfakes", "Desinformation, Deepfakes und hybride Einflussnahme"],
  ["medienwirkungsindex", "medienwirkungsindex-mwix", "Medienwirkungsindex MWIX"],
  ["plattformen-social-media", "plattformen-social-media", "Plattformen und Social Media"],
];

const docs = {
  concept: {
    title: "Konzeptpapier Medien, Social Media & Journalismus",
    rel: `${EXTRACT}/woek_medien_oeffentlichkeit_konzeptpapier_v0_1.md`,
    download: "assets/downloads/woek_medien_oeffentlichkeit_konzeptpapier_v0_1.docx",
  },
  dossier: {
    title: "Gesamtdossier Medien, Social Media & Journalismus",
    rel: `${EXTRACT}/woek_medien_oeffentlichkeit_gesamtdossier_v0_1.md`,
    download: "assets/downloads/woek_medien_oeffentlichkeit_gesamtdossier_v0_1.docx",
  },
  detail: {
    title: "Detailkonzepte Medien, Social Media & Journalismus",
    rel: `${EXTRACT}/woek_medien_oeffentlichkeit_detailkonzepte_umfangreich_v0_1.md`,
    download: "assets/downloads/woek_medien_oeffentlichkeit_detailkonzepte_umfangreich_v0_1.docx",
  },
  singleDossier: {
    title: "Einzeldossiers Medien, Social Media & Journalismus",
    rel: `${EXTRACT}/woek_medien_oeffentlichkeit_einzeldossier_set_v0_1.md`,
    download: "assets/downloads/woek_medien_oeffentlichkeit_einzeldossier_set_v0_1.docx",
  },
  hostingDossier: {
    title: "Wirkungsräume gestalten",
    description: "Dossier für wirkungsorientiertes Hosting, Medienwirkung und digitale Verantwortung: Resonanzarchitektur, Host-Wirkungsscore, Community-Regeln, Quellenklarheit und Korrekturwege.",
    rel: `${EXTRACT}/woek_medien_oeffentlichkeit_wirkungsraeume_gestalten_hosting_v1_0.md`,
    download: "assets/downloads/woek_medien_oeffentlichkeit_wirkungsraeume_gestalten_hosting_v1_0.docx",
    relatedTerms: [
      ["Wirkungsorientiertes Hosting", "begriffe/wirkungsorientiertes-hosting/"],
      ["Resonanzarchitektur", "begriffe/resonanzarchitektur/"],
      ["Host-Wirkungsscore", "begriffe/host-wirkungsscore/"],
      ["Wirkungsraum", "begriffe/wirkungsraum/"],
      ["Wirkungskompetenz", "begriffe/wirkungskompetenz/"],
    ],
  },
  toolSuite: {
    title: "Methodik Medienwirkungs-Tool-Suite",
    rel: `${SOURCE}/tool_spezifikation_medienwirkungs_tool_suite.md`,
    download: "assets/downloads/tool_spezifikation_medienwirkungs_tool_suite.md",
  },
  toolCheck: {
    title: "Methodik Medienwirkungscheck",
    rel: `${SOURCE}/tool_spezifikation_medienwirkungscheck.md`,
    download: "assets/downloads/tool_spezifikation_medienwirkungscheck.md",
  },
};

const tools = [
  ["Medienwirkungscheck", "Tool", "Prüft Quellenklarheit, Kontext, Korrekturpfade, Manipulationstransparenz, Reichweitenverantwortung und Diskursqualität.", "werkzeuge/medienwirkungscheck/"],
  ["Wirkungsorientiertes Hosting", "Dossier", "Gestaltet öffentliche Wirkungsräume mit Wirkungsbriefing, Host-Verantwortung, Community-Regeln, Quellenklarheit und Korrekturpfaden.", "wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"],
  ["Host-Wirkungsscore", "Scorecard", "Reflexionsraster für Quellenklarheit, Framing, Diskursführung, Community-Architektur, Transparenz, Schutz und Korrekturfähigkeit.", "wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/#23-neun-wirkungsfelder-des-host-wirkungsscores"],
  ["Medienwirkungscheck-Demo", "Erleben", "Modellhafte MWIX-Demo mit Gewichtung, roter Linie und Schutz-Hinweis. Keine amtliche Einstufung.", "erleben/medienwirkungscheck/"],
  ["Sprach- und Framing-Analyse", "Methode", "Macht Frames, Entmenschlichung, Angstsignale, Vertrauenssprache und Lösungsorientierung sichtbar.", "werkzeuge/sprach-und-framing-analyse/"],
  ["Plattform-Wirkungscheck", "Methode", "Prüft Empfehlungslogik, Werbetransparenz, Datenzugang, Kinder- und Jugendschutz sowie Nutzerwahl.", "werkzeuge/plattform-wirkungscheck/"],
  ["Desinformations-Risikocheck", "Methode", "Bewertet Täuschungsgrad, Koordination, Reichweite, Zeitkritik und Schaden für demokratische Korrekturfähigkeit.", "werkzeuge/desinformations-risikocheck/"],
  ["Quellenklarheits-Check", "Modul", "Hilft Bürger:innen, Bildung, Redaktionen und Creator:innen, Autorenschaft, Belege und Finanzierung offenzulegen.", "werkzeuge/medienwirkungscheck/#quellenklarheit"],
  ["Creator-Responsibility-Score", "Modul", "Strukturiert Kennzeichnung von Werbung, Sponsoring, KI-Einsatz, Quellen und Fehlerkorrekturen.", "werkzeuge/medienwirkungscheck/#creator-responsibility"],
  ["Diskursqualitäts-Monitor", "Monitoring", "Aggregierter Ansatz für Debattenklima, Themenvielfalt, Korrekturwege und demokratische Resilienz.", "werkzeuge/medienwirkungscheck/#diskursqualitaet"],
  ["Wirkung politischer Sprache", "Bestehende Demo", "Bestehende Erleben-Seite zu Sprachwirkung, Frames und demokratischer Resonanz.", "sdg-plus/medien-demokratie/wirkung-politischer-sprache.html"],
  ["WÖk-IDs", "Datenarchitektur", "Verbinden SDG+, Medienqualität, Diskursfähigkeit, Quellenklarheit und digitale Selbstbestimmung mit Indikatoren.", "werkzeuge/woek-ids/"],
  ["Scorecards", "Bewertungsraster", "Übersetzen Medien- und Plattformwirkung in prüfbare Dimensionen von -3 bis +3.", "werkzeuge/scorecards/"],
  ["Wirkungsrat", "Institution", "Sichert Methodik, Korrektur, Grundrechtskonformität und demokratische Kontrolle der Wirkungslogik.", "werkzeuge/wirkungsrat/"],
];

const sdgRefs = [
  ["sdg-4", "SDG 4 Hochwertige Bildung", "Medienkompetenz, digitale Mündigkeit, Quellenprüfung und Wirkungskompetenz.", "verstehen/sdgs-sdgplus/sdg-4-hochwertige-bildung/"],
  ["sdg-5", "SDG 5 Geschlechtergleichstellung", "Schutz vor digitaler Gewalt, ungleicher Sichtbarkeit und diskriminierenden Resonanzräumen.", "verstehen/sdgs-sdgplus/sdg-5-geschlechtergleichstellung/"],
  ["sdg-8", "SDG 8 Menschenwürdige Arbeit", "Arbeitsbedingungen im Journalismus, in Redaktionen, Plattformarbeit und Creator-Ökonomie.", "verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/"],
  ["sdg-9", "SDG 9 Industrie, Innovation und Infrastruktur", "Digitale Infrastruktur, Plattformarchitektur, Medieninnovation und Informationsräume.", "verstehen/sdgs-sdgplus/sdg-9-industrie-innovation-infrastruktur/"],
  ["sdg-10", "SDG 10 Weniger Ungleichheiten", "Zugang zu Information, Sichtbarkeit marginalisierter Perspektiven und Schutz vor Ausschluss.", "verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/"],
  ["sdg-16", "SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "Medienfreiheit, Rechtsstaatlichkeit, Vertrauen, Zugang zu Information und starke Institutionen.", "verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/"],
  ["sdg-17", "SDG 17 Partnerschaften", "Zusammenarbeit zwischen Medien, Plattformen, Wissenschaft, Zivilgesellschaft, Bildung und Staat.", "verstehen/sdgs-sdgplus/sdg-17-partnerschaften/"],
  ["sdgplus-medienqualitaet", "SDG+ Medienqualität", "Qualität öffentlicher Information, Quellenklarheit, Fehlerkorrektur und journalistische Verantwortung.", "verstehen/sdgs-sdgplus/#sdgplus-medienqualitaet"],
  ["sdgplus-demokratie", "SDG+ Demokratie", "Demokratische Teilhabe, faire Sichtbarkeit, Korrekturfähigkeit und Schutz vor Manipulation.", "verstehen/sdgs-sdgplus/#sdgplus-demokratie"],
  ["sdgplus-diskursfaehigkeit", "SDG+ Diskursfähigkeit", "Die Fähigkeit einer Gesellschaft, Konflikte faktenbasiert, respektvoll und demokratisch zu bearbeiten.", "verstehen/sdgs-sdgplus/#sdgplus-diskursfaehigkeit"],
  ["sdgplus-rechtsstaatlichkeit", "SDG+ Rechtsstaatlichkeit", "Grundrechte, Pressefreiheit, Beschwerdewege, Rechtsschutz und Verhältnismäßigkeit.", "verstehen/sdgs-sdgplus/#sdgplus-rechtsstaatlichkeit"],
  ["sdgplus-institutionelles-vertrauen", "SDG+ institutionelles Vertrauen", "Vertrauen in Verfahren, Datenqualität, Transparenz, Institutionen und öffentliche Korrekturmechanismen.", "verstehen/sdgs-sdgplus/#sdgplus-institutionelles-vertrauen"],
  ["sdgplus-gesellschaftlicher-zusammenhalt", "SDG+ gesellschaftlicher Zusammenhalt", "Zugehörigkeit, faire Teilhabe, Schutz vor Spaltung und gemeinsame Handlungsfähigkeit.", "verstehen/sdgs-sdgplus/#sdgplus-gesellschaftlicher-zusammenhalt"],
  ["sdgplus-digitale-selbstbestimmung", "SDG+ digitale Selbstbestimmung", "Datenschutz, Profiling-Grenzen, algorithmische Fairness und souveräne Nutzung digitaler Räume.", "verstehen/sdgs-sdgplus/#sdgplus-digitale-selbstbestimmung"],
];

const bookAnchors = [
  ["Teil 12 - Medien, Kommunikation und Öffentlichkeit", "referenz/teil-12-medien-kommunikation-und-oeffentlichkeit/"],
  ["Kapitel 74 - Öffentlichkeit als Wirkungsraum", "referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/"],
  ["Kapitel 75 - Plattformlogik und Algorithmen", "referenz/kapitel-075-plattformlogik-und-algorithmen/"],
  ["Kapitel 76 - Framing, Sprache und Tonalität", "referenz/kapitel-076-framing-sprache-und-tonalitaet/"],
  ["Kapitel 77 - Desinformation und hybride Kriegsführung", "referenz/kapitel-077-desinformation-und-hybride-kriegsfuehrung/"],
  ["Kapitel 79 - Diskurskultur", "referenz/kapitel-079-diskurskultur/"],
  ["Online-Buch Hauptseite", "referenz/"],
];

const crossLinks = [
  ["SDG-/SDG+-Referenzrahmen", "Medienqualität, Demokratie, Diskursfähigkeit und digitale Selbstbestimmung als Referenzrahmen.", "verstehen/sdgs-sdgplus/"],
  ["Staat, Recht & Demokratie", "DSA, EMFA, AI Act, Wahlwerbung, Medienstaatsvertrag, Wirkungsrat und Rechtsschutz.", "wirkungsfelder/staat-recht-demokratie/"],
  ["Bildung", "Medienkompetenz, digitale Mündigkeit, Wirkungskompetenz und Fach Zukunft.", "wirkungsfelder/bildung/"],
  ["Wissenschaft, Innovation & Digitalisierung", "KI-Kennzeichnung, Datenräume, algorithmische Verantwortung und Forschungzugang.", "wirkungsfelder/wissenschaft-innovation-digitalisierung/"],
  ["Wirtschaft & Unternehmen", "Plattformunternehmen, Werbung, Creator Economy, Marketing und Reputationsrisiken.", "wirkungsfelder/wirtschaft-unternehmen/"],
  ["Finanzsystem & Kapital", "Medienpluralismus, Eigentumskonzentration, Plattformmacht und mögliche Demokratie-/Medienfonds.", "wirkungsfelder/finanzsystem-kapital/"],
];

const legalBoxes = [
  ["Digital Services Act (DSA)", "Regelt Online-Vermittlungsdienste, systemische Risiken, Transparenz, Werbung, Datenzugang und besondere Pflichten sehr großer Plattformen und Suchmaschinen.", "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act"],
  ["DSA VLOPs/VLOSEs", "Sehr große Online-Plattformen und Suchmaschinen mit mehr als 45 Millionen Nutzer:innen in der EU unterliegen verschärften DSA-Pflichten.", "https://digital-strategy.ec.europa.eu/en/policies/dsa-vlops"],
  ["European Media Freedom Act (EMFA)", "Schützt Medienfreiheit, Medienpluralismus, redaktionelle Unabhängigkeit und transparente Medienmärkte in der EU.", "https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/new-push-european-democracy/protecting-democracy/european-media-freedom-act_en"],
  ["AI Act", "Regelt KI-Risiken und Transparenzpflichten, unter anderem bei bestimmten KI-generierten Inhalten und Deepfakes.", "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"],
  ["Politische Werbetransparenz", "Setzt EU-Standards zu Transparenz, Targeting und Rechenschaftspflichten politischer Werbung.", "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/democracy-eu-citizenship-anti-corruption/democracy-and-electoral-rights/transparency-and-targeting-political-advertising_en"],
  ["European Digital Media Observatory (EDMO)", "Europäisches Netzwerk für Desinformationsanalyse, Faktenprüfung, Forschung und Medienkompetenz.", "https://digital-strategy.ec.europa.eu/en/policies/european-digital-media-observatory"],
  ["Media Pluralism Monitor", "Wissenschaftliches Monitoring zu Risiken für Medienpluralismus und Medienfreiheit in Europa.", "https://cmpf.eui.eu/projects-cmpf/media-pluralism-monitor/"],
  ["Audiovisual Media Services Directive (AVMSD)", "EU-Rahmen für audiovisuelle Mediendienste und Video-Sharing-Plattformen.", "https://digital-strategy.ec.europa.eu/en/policies/audiovisual-and-media-services"],
  ["Council of Europe Safety of Journalists Platform", "Dokumentiert ernsthafte Bedrohungen für Journalist:innen und Medienfreiheit in Europa.", "https://fom.coe.int/"],
];

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function navMatch(item) {
  return (item.match || []).join("|");
}

function navLink(item, base) {
  return `<a href="${href(base, item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function routeFor(rel) {
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function baseFor(rel) {
  return "../".repeat(path.dirname(rel).split("/").filter(Boolean).length);
}

function href(base, target) {
  if (!target) return "";
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  return `${base}${target.replace(/^\/+/, "")}`;
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), "utf8") : "";
}

function write(rel, html) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${html.replace(/[ \t]+$/gm, "")}\n`, "utf8");
}

function citeAnchor(id, label = "Zitierlink zu diesem Abschnitt") {
  return `<a class="cite-anchor no-print" href="#${esc(id)}" aria-label="${esc(label)}">#</a>`;
}

function h2(id, text) {
  return `<h2 id="${esc(id)}">${esc(text)} ${citeAnchor(id)}</h2>`;
}

function cleanPublicText(text) {
  const lines = String(text).replace(/\r\n/g, "\n").replace(/^\uFEFF/, "").split("\n");
  const cleaned = [];
  let skipping = false;
  for (const raw of lines) {
    let line = raw.trim();
    if (!line) {
      if (!skipping) cleaned.push(raw);
      continue;
    }
    if (/^(Online-Umsetzung|Website- und Dossierlogik|\d+\.\s*Online-Umsetzung)$/i.test(line)) {
      skipping = true;
      continue;
    }
    if (skipping) {
      if (/^(Quellen|Dossier\s+\d+:|\d+\.\s+[A-ZÄÖÜ])/.test(line)) {
        skipping = false;
      } else {
        continue;
      }
    }
    if (/CodeX|Codex|Repository|Build|Sitemap aktualisieren|Dateien anlegen|bitte prüfen|Toolaufruf|Prompt|ChatGPT|Python|interne Aufgabe|Abschlussbericht/i.test(line)) {
      if (!/Ad-Repository/i.test(line)) continue;
    }
    if (/Alle Dokumente sollen zusätzlich als Online-Volltext lesbar sein/i.test(line)) continue;
    line = line
      .replace(/kein Wahrheitsministerium/g, "keine zentrale Wahrheitsinstanz")
      .replace(/kein Zensurwerkzeug/g, "keine Grundlage für automatisierte Sperrentscheidungen")
      .replace(/keine Zensurarchitektur/g, "keine Architektur für automatisierte Sperrentscheidungen")
      .replace(/Inhaltszensur/g, "automatisierte Sperrentscheidungen")
      .replace(/Zensurangst/g, "Grundrechtsrisiken")
      .replace(/Tool-Spezifikation/g, "Methodik")
      .replace(/Einzeldossier-Set/g, "Einzeldossiers")
      .replace(/\bv0\.1\b/gi, "Modellfassung")
      .replace(/\bOutputs\b/g, "Ergebnisse")
      .replace(/\bOutput\b/g, "Ergebnis")
      .replace(/keine automatisierte Sperrentscheidungen/g, "keine automatisierten Sperrentscheidungen")
      .replace(/automatisierten automatisierte Sperrentscheidungen/g, "automatisierten Sperrentscheidungen")
      .replace(/Dieses Einzeldossier konkretisiert den Unterbereich für die Website, die Arbeitsbibliothek und mögliche Tools\. /g, "Dieses Einzeldossier konkretisiert den Unterbereich. ");
    cleaned.push(line);
  }
  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function plainMarkdownText(value) {
  return String(value)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

function inlineHtml(value) {
  const text = String(value).replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");
  const parts = [];
  let last = 0;
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(text))) {
    parts.push(esc(text.slice(last, match.index)));
    const label = plainMarkdownText(match[1]);
    const url = match[2].trim();
    if (url && !/^javascript:/i.test(url)) {
      const external = /^https?:/.test(url);
      parts.push(`<a class="text-link" href="${esc(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(label)}</a>`);
    } else {
      parts.push(esc(label));
    }
    last = pattern.lastIndex;
  }
  parts.push(esc(text.slice(last)));
  return parts.join("");
}

function markdownishToHtml(markdown) {
  const lines = cleanPublicText(markdown).split("\n");
  const toc = [];
  const html = [];
  let list = [];
  let table = [];
  let paragraph = [];
  let count = 0;
  const used = new Set();
  const unique = (raw) => {
    const base = slugify(raw) || "abschnitt";
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    return id;
  };
  const flushParagraph = () => {
    if (!paragraph.length) return;
    count += 1;
    const id = unique(`absatz-${String(count).padStart(3, "0")}`);
    html.push(`<p id="${id}">${inlineHtml(paragraph.join(" "))} ${citeAnchor(id, "Zitierlink zu diesem Absatz")}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineHtml(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .map((row) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
      .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    if (rows.length > 1) {
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap"><table class="data-table"><thead><tr>${head.map((cell) => `<th>${inlineHtml(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }
    table = [];
  };
  const heading = (level, text) => {
    flushParagraph();
    flushList();
    flushTable();
    const cleanText = plainMarkdownText(text);
    const id = unique(cleanText);
    toc.push({ level, text: cleanText, id });
    html.push(`<h${level} id="${id}">${esc(cleanText)} ${citeAnchor(id)}</h${level}>`);
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    if (/^WIRKUNGSÖKONOMIE/.test(line)) continue;
    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    const mdHeading = line.match(/^(#{1,4})\s+(.+)$/);
    if (mdHeading) {
      heading(Math.max(2, Math.min(4, mdHeading[1].length)), mdHeading[2]);
      continue;
    }
    if (/^(Inhaltsübersicht|Kurzfassung|Zweck|Tools|MWI-Formel|Rote Linien|Datenquellen|Nicht-Zweck)$/.test(line) || /^(Dossier\s+\d+:|[0-9]+\.\s+[A-ZÄÖÜ])/.test(line)) {
      heading(line.startsWith("Dossier") || /^[0-9]+\.\s+/.test(line) ? 2 : 3, line);
      continue;
    }
    if (/^(Alte Logik|Wirkungsökonomischer Perspektivwechsel|Kernindikatoren|Schnittstellen zu anderen Portalen|Politische Umsetzungsoptionen|Beispielhafte Anwendungsfälle|Modellhafte Berechnungslogik|Wirkungsökonomische Einordnung|Politische Anschlussfähigkeit|Schutzgrenzen)$/i.test(line)) {
      heading(3, line);
      continue;
    }
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      flushParagraph();
      flushTable();
      list.push(line.replace(/^([-*]|\d+\.)\s+/, ""));
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  flushTable();
  return { toc, html: html.join("\n") };
}

function sectionFor(docText, module, kind) {
  const lines = cleanPublicText(docText).split("\n");
  const startLabel = kind === "dossier" ? `Dossier ${module.index + 1}:` : `${module.index + 1}. ${module.title}`;
  const nextLabel = kind === "dossier" ? `Dossier ${module.index + 2}:` : `${module.index + 2}. `;
  const start = lines.findIndex((line, index) => index > 25 && line.trim().startsWith(startLabel));
  if (start < 0) return "";
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].trim().startsWith(nextLabel)) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
}

function page({ rel, title, description, section = "Wirkungsfelder", type = "Portal", body }) {
  const base = baseFor(rel);
  const canonical = `${SITE}${routeFor(rel)}`;
  write(rel, `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title.replace(/\s+\|.*$/, ""))}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="${esc(section)}">
    <meta name="search_type" content="${esc(type)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title.replace(/\s+\|.*$/, ""))}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260605-wirkungsraum-stage9">
  </head>
  <body>
${renderHeader(base)}
    <main>
      <p class="print-meta">Wirkungsökonomie · ${esc(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: ${DATE}</p>
${body(base, canonical)}
    </main>
${renderFooter(base)}
    <script src="${base}assets/js/main.js?v=20260605-wirkungsraum-stage9"></script>
  </body>
</html>`);
}

function tocBlock(items) {
  if (!items.length) return "";
  return `<nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol class="toc-links">${items.slice(0, 48).map((item) => `<li class="toc-level-${item.level}"><a href="#${esc(item.id)}">${esc(item.text)}</a></li>`).join("")}</ol></nav>`;
}

function cards(base, items) {
  return `<div class="card-grid three">${items.map(([title, kicker, text, url, label = "Öffnen", extra = ""]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text || "")}</p><div class="portal-card-actions">${url ? `<a class="text-link" href="${href(base, url)}">${esc(label)}</a>` : `<span class="badge">in Vorbereitung</span>`}${extra}</div></article>`).join("")}</div>`;
}

function downloads(base, entries) {
  const links = entries.filter(Boolean).filter((entry) => exists(entry.href)).map((entry) => `<a class="btn btn-secondary" href="${href(base, entry.href)}">${esc(entry.label)}</a>`);
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Dossier & Export</p>${h2("downloads", "Downloads und Druck")}<p>Online-Volltext ist der Hauptzugang. Word- und Markdown-Dateien bleiben ergänzende Export- und Archivfassungen.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${links.join("")}</div></div></section>`;
}

function publicationAccess(base, mode = "portal") {
  const online = [
    ["Konzeptpapier", "Online-Volltext", "Das Konzeptpapier online lesen, zitieren und zusätzlich herunterladen.", "wirkungsfelder/medien-oeffentlichkeit/konzept/"],
    ["Gesamtdossier", "Online-Volltext", "Das Gesamtdossier mit Modelllogik, Datenquellen und Umsetzungspfaden online lesen.", "wirkungsfelder/medien-oeffentlichkeit/dossier/"],
    ["Wirkungsräume gestalten", "Dossier / Arbeitsfassung", "Wirkungsorientiertes Hosting als Praxis für Medienwirkung, Host-Verantwortung, Resonanzarchitektur und digitale Verantwortung.", "wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"],
    ["Detailkonzepte", "Online-Volltext", "Die langen Detailkonzepte zu allen Unterbereichen online lesen.", "wirkungsfelder/medien-oeffentlichkeit/detailkonzepte/"],
    ["Einzeldossiers", "Online-Volltext", "Einzeldossiers mit Praxisfrage, Bewertungslogik, Annahmen, Toolbezug und Grenzen.", "wirkungsfelder/medien-oeffentlichkeit/dossiers/"],
  ];
  const downloadLinks = [
    ["Konzeptpapier herunterladen", docs.concept.download],
    ["Gesamtdossier herunterladen", docs.dossier.download],
    ["Wirkungsräume gestalten herunterladen", docs.hostingDossier.download],
    ["Detailkonzepte herunterladen", docs.detail.download],
    ["Einzeldossiers herunterladen", docs.singleDossier.download],
  ];
  return `<section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="section-header"><p class="hero-kicker">Publikationszugang</p>${h2("publikationszugang-title", mode === "subpage" ? "Detailkonzept und Dossier online lesen" : "Online lesen und herunterladen")}<p>Alle zentralen Dokumente sind online lesbar und gezielt über Abschnittsanker zitierbar. Downloads bleiben Export und Archiv, nicht der Hauptzugang.</p></div>${cards(base, online.map((item) => [...item, "Online lesen"]))}<div class="download-card compact no-print"><div><p class="card-kicker">Downloads</p><h3 class="card-title">Word-Export und Archiv</h3><p class="card-text">Die bereitgestellten Word-Dateien bleiben als Exportfassungen verfügbar.</p></div><div class="portal-card-actions">${downloadLinks.map(([label, file]) => exists(file) ? `<a class="btn btn-secondary" href="${href(base, file)}">${esc(label)}</a>` : "").join("")}</div></div></section>`;
}

function relatedTermBlock(base, doc) {
  if (!doc.relatedTerms?.length) return "";
  return `<section class="section" aria-labelledby="glossarbezug"><div class="section-header"><p class="hero-kicker">Glossarbezug</p>${h2("glossarbezug", "Zentrale Begriffe")}<p>Die Veröffentlichung ist in den zentralen Begriffen verankert und kann von dort aus wiedergefunden werden.</p></div><div class="model-strip">${doc.relatedTerms.map(([label, url]) => `<a href="${href(base, url)}">${esc(label)}</a>`).join("")}</div></section>`;
}

function optionalStatusSection(status) {
  const content = statusBox(status);
  return content ? `<section class="section narrow">${content}</section>` : "";
}

function sdgBadge(base, [id, label, text, url], index) {
  const popover = `sdg-media-popover-${index}-${slugify(id)}`;
  return `<span class="sdg-ref" data-sdg-id="${esc(id)}"><a class="sdg-ref-link" href="${href(base, url)}" aria-label="${esc(`${label}: ${text}`)}" aria-describedby="${popover}">${esc(label)}</a><button class="sdg-ref-info" type="button" aria-label="${esc(`Kurzbeschreibung zu ${label}: ${text}`)}" aria-describedby="${popover}">i</button><span class="sdg-ref-popover" id="${popover}" role="tooltip">${esc(text)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
}

function referenceBlock(base) {
  return `<section class="section" aria-labelledby="sdg-ref"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${h2("sdg-ref", "SDG-/SDG+-Bezug")}<div class="model-strip">${sdgRefs.map((item, index) => sdgBadge(base, item, index)).join("")}</div><p>Wirkung ist neutral und relational. Medien- und Öffentlichkeitswirkung kann positiv, negativ oder neutral sein. Bewertet wird sie am Referenzrahmen der SDGs, der Agenda 2030 und SDG+. SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p><a class="text-link" href="${href(base, "verstehen/sdgs-sdgplus/")}">Alle SDGs und SDG+ im Referenzrahmen ansehen</a></div></section>`;
}

function politicalBlock() {
  const rows = [
    ["Aufgabe der Politik", "Demokratische Öffentlichkeit schützen: Medienfreiheit, Quellenklarheit, Plattformverantwortung, Diskursfähigkeit, digitale Selbstbestimmung und Schutz vor Manipulation."],
    ["Politische Rahmenbedingungen", "DSA, EMFA, AI Act, politische Werbetransparenz, AVMSD, Datenschutz, Wettbewerbsrecht, Medienstaatsverträge, Medienförderung und unabhängige Aufsicht wirkungsbezogen verbinden."],
    ["Ausgestaltungsspielraum", "Parteien können unterschiedliche Wege wählen: freie Märkte, öffentlich-rechtliche Digitalräume, Plattformaufsicht, Medienförderung, Jugendschutz, Datenschutz, nationale oder europäische Zuständigkeiten."],
    ["Zielkonflikte", "Meinungsfreiheit, Manipulationsschutz, Innovationsfreiheit, Plattformmacht, Datenschutz, Forschung, Moderation, Reichweite, Qualität, Medienfinanzierung und Unabhängigkeit müssen demokratisch abgewogen werden."],
    ["Rollenverteilung", "EU, Bund, Länder, Medienaufsicht, Gerichte, Plattformen, Redaktionen, Creator:innen, Wissenschaft, Bildung, Zivilgesellschaft und Nutzer:innen tragen unterschiedliche Verantwortung."],
    ["Übergang und Schutz", "Schutz kleiner Medien und Creator:innen, transparente Verfahren, Beschwerdewege, Forschungzugang, Grundrechtsschutz, Datenschutz und Schutz vor automatisierten Sperrentscheidungen."],
    ["Evaluation und Korrektur", "Medienwirkungsberichte, MWIX, DSA-Transparenzberichte, Pluralismusmonitoring, Desinformationsberichte, öffentliche Konsultationen und Wirkungsrat halten das System lernfähig."],
    ["Parteipolitische Anschlussfähigkeit", "Freiheitsorientierte, demokratieschützende, bildungsorientierte und medienpolitische Ansätze können verschiedene Instrumente wählen, solange demokratische Korrekturfähigkeit geschützt bleibt."],
    ["Schutz vor Technokratie", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Bewertet werden Infrastruktur, Transparenz, Korrekturwege und Manipulationsrisiken, nicht Gesinnungen."],
  ];
  return `<section class="section" aria-labelledby="politik"><div class="section-header"><p class="hero-kicker">Demokratische Umsetzung</p>${h2("politik", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}<p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit Medien, Social Media, Journalismus und digitale Öffentlichkeit demokratisch, rechtsstaatlich und praktisch umgesetzt werden können.</p></div><div class="table-wrap"><table class="data-table"><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function toolGrid(base) {
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Kontext-Werkzeuge</p>${h2("tools", "Werkzeuge in diesem Bereich")}<p>Die Werkzeuge sind nicht-amtliche Reflexionshilfen. Sie bewerten keine Personen und treffen keine automatisierten Sperrentscheidungen.</p></div>${cards(base, tools)}</section>`;
}

function bookBlock(base) {
  return `<section class="section" aria-labelledby="buch"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${h2("buch", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors.map(([label, url]) => `<a href="${href(base, url)}">${esc(label)}</a>`).join("")}</div></section>`;
}

function crossLinkBlock(base) {
  return `<section class="section" aria-labelledby="vernetzung"><div class="section-header"><p class="hero-kicker">Vernetzung</p>${h2("vernetzung", "Verwandte Wirkungsfelder und Werkzeuge")}</div>${cards(base, crossLinks.map(([title, text, url]) => [title, "Querverlinkung", text, url]))}</section>`;
}

function legalBlock(base) {
  return `<section class="section" aria-labelledby="rechtsanschluss"><div class="section-header"><p class="hero-kicker">Rechtsanschluss</p>${h2("rechtsanschluss", "Bestehende Rechts- und Regulierungsanschlüsse")}<p>Die Wirkungsökonomie ersetzt diese Rechtsrahmen nicht. Sie übersetzt sie in eine Rückkopplungslogik für Medienqualität, Plattformverantwortung, Quellenklarheit und demokratische Resilienz.</p></div>${cards(base, legalBoxes.map(([title, text, url]) => [title, "Externe Quelle", text, url, "Quelle öffnen"]))}</section>`;
}

function sourceBlock() {
  return `<section class="section" aria-labelledby="quellen"><div class="card"><p class="hero-kicker">Quellen</p>${h2("quellen", "Quellen und externe Referenzen")}<p>Externe Quellen öffnen in einem neuen Tab. Sie dienen als Rechts-, Monitoring- und Methodenanschlüsse; die wirkungsökonomische Einordnung bleibt eigenständig.</p><div class="table-wrap"><table class="data-table"><tbody>${legalBoxes.map(([title, text, url]) => `<tr><th scope="row">${esc(title)}</th><td>${esc(text)}<br><a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Externe Quelle öffnen</a></td></tr>`).join("")}</tbody></table></div></div></section>`;
}

function mwixBlock() {
  const weights = Object.entries(mwix.weights || {}).map(([key, value]) => [key.replaceAll("_", " "), `${Math.round(Number(value) * 100)} %`]);
  const rows = weights.length ? weights : [
    ["Quellenklarheit", "18 %"],
    ["Faktenintegrität", "16 %"],
    ["Kontextqualität", "14 %"],
    ["Pluralität", "12 %"],
    ["Diskursverträglichkeit", "12 %"],
    ["Korrekturfähigkeit", "10 %"],
    ["KI-/Manipulationstransparenz", "8 %"],
    ["Reichweitenverantwortung", "6 %"],
    ["Zugänglichkeit", "4 %"],
  ];
  return `<section class="section" aria-labelledby="mwix"><div class="section-header"><p class="hero-kicker">Bewertungslogik</p>${h2("mwix", "Medienwirkungsindex MWIX")}<p>Der MWIX ist ein Arbeitsmodell von -3 bis +3. Er bewertet öffentliche Wirkungsbedingungen, nicht Meinungen. Rote Linien begrenzen den Score, wenn schwere Manipulationsrisiken auftreten.</p></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Dimension</th><th>Gewichtung Modellfassung</th></tr></thead><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div><div class="card-grid three">${(mwix.redLines || ["nicht gekennzeichneter Deepfake mit öffentlichem Schadenspotenzial", "koordinierte Desinformation", "verdeckte politische Finanzierung", "entmenschlichende Gewaltaufrufe", "manipulatives Microtargeting vulnerabler Gruppen", "systematische algorithmische Verstärkung gefährlicher Falschinformation"]).map((text) => `<article class="card"><p class="card-kicker">Rote Linie</p><p class="card-text">${esc(text)}</p></article>`).join("")}</div></section>`;
}

function statusBox(status) {
  return "";
}

function portalPage() {
  const intro = markdownishToHtml(read(`${SOURCE}/website_inhalt_medien_oeffentlichkeit.md`));
  page({
    rel: "wirkungsfelder/medien-oeffentlichkeit/index.html",
    title: "Medien, Social Media & Journalismus | Wirkungsökonomie",
    description: "Öffentlichkeit als Wirkungsraum: Medienqualität, Plattformlogik, Sprache, Desinformation, Creator-Verantwortung und demokratische Diskursfähigkeit.",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a></nav><p class="hero-kicker">Wirkungsfeld</p><h1>Medien, Social Media & Journalismus</h1><p class="hero-subtitle">Öffentlichkeit als Wirkungsraum: Wahrheit, Vertrauen, Diskursqualität, Plattformlogik, Desinformation und demokratische Resonanz.</p><p>Die Wirkungsökonomie bewertet nicht Meinungen. Sie macht Infrastrukturbedingungen öffentlicher Kommunikation sichtbar: Quellenklarheit, Transparenz, Korrekturwege, Pluralität, Manipulationsschutz, algorithmische Verantwortung und Reichweitenlogik.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "erleben/medienwirkungscheck/")}">Medienwirkungscheck öffnen</a><a class="btn btn-secondary" href="#publikationszugang">Online lesen</a></div></div>${statusBox("Portal")}</div></section>${publicationAccess(base)}${tocBlock(intro.toc)}<section class="section article-section" aria-labelledby="online-volltext"><article class="article-body fulltext-reader"><p class="hero-kicker">Bereichstext</p>${h2("online-volltext", "Onlinefassung")} ${intro.html}</article></section><section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${h2("unterbereiche", "Zentrale Unterbereiche online lesen")}<p>Jeder Unterbereich besitzt eine Online-Seite mit Detailkonzept, Einzeldossier, Download, SDG-/SDG+-Block, Buchankern, Quellen und Werkzeugbezug.</p></div>${cards(base, modules.map((m) => [m.title, "Detailkonzept und Dossier", m.summary, `wirkungsfelder/medien-oeffentlichkeit/${m.slug}/`, "Online lesen"]))}</section>${toolGrid(base)}${mwixBlock()}${legalBlock(base)}${crossLinkBlock(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${sourceBlock()}${downloads(base, [{ label: "Konzeptpapier Word", href: docs.concept.download }, { label: "Gesamtdossier Word", href: docs.dossier.download }, { label: "Wirkungsräume gestalten Word", href: docs.hostingDossier.download }, { label: "Detailkonzepte Word", href: docs.detail.download }, { label: "Einzeldossiers Word", href: docs.singleDossier.download }, { label: "Tool-Suite Markdown", href: docs.toolSuite.download }, { label: "Medienwirkungscheck Markdown", href: docs.toolCheck.download }])}`,
  });
}

function modulePage(module) {
  const detail = markdownishToHtml(sectionFor(read(docs.detail.rel), module, "detail"));
  const dossier = markdownishToHtml(sectionFor(read(docs.singleDossier.rel), module, "dossier"));
  page({
    rel: `wirkungsfelder/medien-oeffentlichkeit/${module.slug}/index.html`,
    title: `${module.title} | Medien & Öffentlichkeit`,
    description: module.summary,
    type: "Unterbereich",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/medien-oeffentlichkeit/")}">Medien & Öffentlichkeit</a></nav><p class="hero-kicker">Medien, Social Media & Journalismus</p><h1>${esc(module.title)}</h1><p class="hero-subtitle">${esc(module.summary)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#detailkonzept">Detailkonzept online lesen</a><a class="btn btn-secondary" href="#dossier">Dossier online lesen</a></div></div></section><section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="download-card"><div><p class="card-kicker">Online lesen, gezielt zitieren</p>${h2("publikationszugang-title", "Detailkonzept und Dossier")}<p class="card-text">Diese Unterseite enthält Detailkonzept und Einzeldossier vollständig online. Downloads bleiben ergänzende Exportfassungen.</p></div><div class="portal-card-actions no-print"><a class="btn btn-primary" href="#detailkonzept">Detailkonzept online lesen</a><a class="btn btn-secondary" href="#dossier">Dossier online lesen</a><a class="btn btn-secondary" href="${href(base, docs.detail.download)}">Detailkonzepte herunterladen</a><a class="btn btn-secondary" href="${href(base, docs.singleDossier.download)}">Einzeldossiers herunterladen</a></div></div></section>${tocBlock([...detail.toc, ...dossier.toc])}<section class="section" aria-labelledby="kurzfassung"><div class="section-header"><p class="hero-kicker">Kurzfassung</p>${h2("kurzfassung", "Kurzfassung und Wirkungspfad")}</div><div class="card-grid three"><article class="card"><h3 class="card-title">Problem</h3><p class="card-text">${esc(module.summary)}</p></article><article class="card"><h3 class="card-title">Wirkungsökonomischer Maßstab</h3><p class="card-text">Entscheidend ist, ob Wahrheit, Vertrauen, Diskursfähigkeit, Teilhabe und digitale Selbstbestimmung gestärkt oder geschwächt werden.</p></article><article class="card"><h3 class="card-title">Schutzlinie</h3><p class="card-text">Bewertet werden Strukturen, Transparenz, Reichweitenlogik und Korrekturwege, nicht Personen oder politische Meinungen.</p></article></div></section><section class="section article-section" aria-labelledby="detailkonzept"><article class="article-body fulltext-reader"><p class="hero-kicker">Detailkonzept</p>${h2("detailkonzept", "Detailkonzept online lesen")}${detail.html}</article></section><section class="section article-section" aria-labelledby="dossier"><article class="article-body fulltext-reader"><p class="hero-kicker">Einzeldossier</p>${h2("dossier", "Dossier online lesen")}${dossier.html}</article></section>${toolGrid(base)}${legalBlock(base)}${crossLinkBlock(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${sourceBlock()}${downloads(base, [{ label: "Detailkonzepte Word", href: docs.detail.download }, { label: "Einzeldossiers Word", href: docs.singleDossier.download }])}`,
  });
}

function fulltextPage(key, rel, status) {
  const doc = docs[key];
  const rendered = markdownishToHtml(read(doc.rel));
  page({
    rel,
    title: `${doc.title} | Wirkungsökonomie`,
    description: doc.description || `${doc.title} als öffentlicher Online-Volltext mit Zitierankern, Druckfunktion und Download.`,
    type: status,
    body: (base, canonical) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/medien-oeffentlichkeit/")}">Medien & Öffentlichkeit</a></nav><p class="hero-kicker">${esc(status)}</p><h1>${esc(doc.title)}</h1><p class="hero-subtitle">${esc(doc.description || "Online-Volltext ist der Hauptzugang. Downloads bleiben Export und Archiv.")}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#volltext">Online lesen</a><a class="btn btn-secondary" href="${href(base, doc.download)}">Word herunterladen</a></div></div></section><section class="section narrow"><aside class="citation-note" role="note"><p class="card-kicker">Zitierfähig</p><h2>Online lesen, gezielt zitieren</h2><p>Abschnittsanker können direkt zitiert werden.</p><p><a class="text-link" href="${canonical}">Seitenadresse öffnen</a></p></aside></section>${publicationAccess(base)}${relatedTermBlock(base, doc)}${optionalStatusSection(status)}<section class="section narrow">${tocBlock(rendered.toc)}</section><section class="section article-section" aria-labelledby="volltext"><article class="article-body fulltext-reader"><p class="hero-kicker">Online-Volltext</p>${h2("volltext", `${doc.title} online lesen`)}${rendered.html}</article></section>${toolGrid(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${sourceBlock()}${downloads(base, [{ label: `${doc.title} herunterladen`, href: doc.download }])}`,
  });
}

function toolPage(rel, title, subtitle, activeTools = []) {
  const suite = markdownishToHtml(read(docs.toolSuite.rel));
  const check = markdownishToHtml(read(docs.toolCheck.rel));
  page({
    rel,
    title: `${title} | Wirkungsökonomie`,
    description: subtitle,
    section: "Werkzeuge",
    type: "Werkzeug",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "werkzeuge/")}">Werkzeuge</a></nav><p class="hero-kicker">Werkzeug · Medien & Öffentlichkeit</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(subtitle)}</p><p>Das Werkzeug ist eine nicht-amtliche Reflexions- und Steuerungshilfe. Es bewertet öffentliche Wirkungsbedingungen, nicht Menschen und nicht Gesinnungen.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "erleben/medienwirkungscheck/")}">Demo öffnen</a></div></div></section>${tocBlock([...suite.toc, ...check.toc])}<section class="section" aria-labelledby="module"><div class="section-header"><p class="hero-kicker">Module</p>${h2("module", "Module und Anwendung")}</div>${cards(base, (activeTools.length ? activeTools : tools.slice(0, 7)).map(([name, kicker, text, url]) => [name, kicker, text, url]))}</section>${mwixBlock()}<section class="section article-section" aria-labelledby="spezifikation"><article class="article-body fulltext-reader"><p class="hero-kicker">Methodik</p>${h2("spezifikation", "Medienwirkungs-Tool-Suite")}${suite.html}${h2("spezifikation-medienwirkungscheck", "Medienwirkungscheck")}${check.html}</article></section>${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${sourceBlock()}${downloads(base, [{ label: "Tool-Suite Markdown", href: docs.toolSuite.download }, { label: "Medienwirkungscheck Markdown", href: docs.toolCheck.download }])}`,
  });
}

function demoPage() {
  page({
    rel: "erleben/medienwirkungscheck/index.html",
    title: "Medienwirkungscheck | Demo",
    description: "Modellhafte Demo zum Medienwirkungsindex MWIX: Quellenklarheit, Faktenintegrität, Kontext, Pluralität, Diskursverträglichkeit und Korrekturfähigkeit.",
    section: "Erleben",
    type: "Demo",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "erleben.html")}">Erleben</a></nav><p class="hero-kicker">Demo · Modellfassung</p><h1>Medienwirkungscheck</h1><p class="hero-subtitle">Öffentliche Wirkungsbedingungen modellhaft sichtbar machen.</p><p class="scanner-notice">Modellhafte Demonstration. Keine amtliche Einstufung, keine Rechtsberatung, keine Personenbewertung und keine automatisierte Sperrentscheidung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#demo">Demo nutzen</a></div></div></section><nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol class="toc-links"><li><a href="#demo-title">MWIX-Schnellcheck</a></li><li><a href="#mwix">Medienwirkungsindex MWIX</a></li><li><a href="#tools">Werkzeuge</a></li><li><a href="#politik">Politische Anschlussfähigkeit</a></li></ol></nav><section class="section" id="demo" aria-labelledby="demo-title"><div class="section-header"><p class="hero-kicker">Rechner</p>${h2("demo-title", "MWIX-Schnellcheck")}</div><div class="card"><form id="mwix-form" class="calculator-form"><label>Quellenklarheit <input name="q" type="range" min="-3" max="3" value="1"></label><label>Faktenintegrität <input name="f" type="range" min="-3" max="3" value="1"></label><label>Kontextqualität <input name="k" type="range" min="-3" max="3" value="1"></label><label>Diskursverträglichkeit <input name="d" type="range" min="-3" max="3" value="1"></label><label>Korrekturfähigkeit <input name="c" type="range" min="-3" max="3" value="1"></label><label><input name="redline" type="checkbox"> Rote Linie berührt</label></form><output id="mwix-output" class="result-box" aria-live="polite">MWIX: +1.0 · modellhafte Einordnung</output></div><script>
const form = document.getElementById('mwix-form');
const out = document.getElementById('mwix-output');
function updateMwix() {
  const data = new FormData(form);
  const vals = ['q','f','k','d','c'].map((key) => Number(data.get(key) || 0));
  let score = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (data.get('redline')) score = Math.min(score, -2);
  const rounded = Math.round(score * 10) / 10;
  out.textContent = 'MWIX: ' + (rounded > 0 ? '+' : '') + rounded + ' · modellhafte Einordnung';
}
form.addEventListener('input', updateMwix);
updateMwix();
</script></section>${mwixBlock()}${toolGrid(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${downloads(base, [{ label: "Tool-Suite Markdown", href: docs.toolSuite.download }, { label: "Medienwirkungscheck Markdown", href: docs.toolCheck.download }])}`,
  });
}

function libraryPage() {
  page({
    rel: "werkstatt/dossiers/medien-oeffentlichkeit/index.html",
    title: "Dossiers Medien & Öffentlichkeit | Wirkungsökonomie",
    description: "Arbeitsbibliothek und Dossierhub zu Medien, Social Media, Journalismus, Plattformlogik, Sprache, Desinformation und MWIX.",
    section: "Werkstatt",
    type: "Dossier",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "werkstatt/")}">Werkstatt</a></nav><p class="hero-kicker">Werkstatt · Dossiers</p><h1>Medien & Öffentlichkeit</h1><p class="hero-subtitle">Konzeptpapier, Gesamtdossier, Wirkungsräume gestalten, Detailkonzepte, Einzeldossiers, Methodik und Online-Zugänge.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "wirkungsfelder/medien-oeffentlichkeit/")}">Wirkungsfeld öffnen</a></div></div></section>${publicationAccess(base)}<section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${h2("unterbereiche", "Detailkonzepte und Einzeldossiers")}</div>${cards(base, modules.map((m) => [m.title, "Online lesen", m.summary, `wirkungsfelder/medien-oeffentlichkeit/${m.slug}/`, "Öffnen"]))}</section>${toolGrid(base)}${downloads(base, [{ label: "Konzeptpapier Word", href: docs.concept.download }, { label: "Gesamtdossier Word", href: docs.dossier.download }, { label: "Wirkungsräume gestalten Word", href: docs.hostingDossier.download }, { label: "Detailkonzepte Word", href: docs.detail.download }, { label: "Einzeldossiers Word", href: docs.singleDossier.download }, { label: "Tool-Suite Markdown", href: docs.toolSuite.download }, { label: "Medienwirkungscheck Markdown", href: docs.toolCheck.download }])}`,
  });
}

function aliasPage(alias, target, title) {
  page({
    rel: `wirkungsfelder/medien-oeffentlichkeit/${alias}/index.html`,
    title: `${title} | Medien & Öffentlichkeit`,
    description: `Weiterführung zur Hauptseite ${title}.`,
    type: "Alias",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/medien-oeffentlichkeit/")}">Medien & Öffentlichkeit</a></nav><p class="hero-kicker">Weiterleitung</p><h1>${esc(title)}</h1><p class="hero-subtitle">Diese Adresse bleibt erreichbar. Die Hauptfassung liegt auf der verknüpften Seite.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, `wirkungsfelder/medien-oeffentlichkeit/${target}/`)}">Hauptseite öffnen</a></div></div></section><nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol class="toc-links"><li><a href="#alias-ziel">Hauptseite</a></li></ol></nav><section class="section" aria-labelledby="alias-ziel"><div class="download-card"><div><p class="card-kicker">Adresse erhalten</p>${h2("alias-ziel", "Hauptseite öffnen")}<p class="card-text">Diese Seite dient als Brücke, damit ältere oder alternative URLs erreichbar bleiben.</p></div><a class="btn btn-primary" href="${href(base, `wirkungsfelder/medien-oeffentlichkeit/${target}/`)}">Onlinefassung öffnen</a></div></section>`,
  });
}

function updateSitemap() {
  const sitemap = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemap)) return;
  let xml = fs.readFileSync(sitemap, "utf8");
  const urls = [
    "wirkungsfelder/medien-oeffentlichkeit/",
    "wirkungsfelder/medien-oeffentlichkeit/konzept/",
    "wirkungsfelder/medien-oeffentlichkeit/dossier/",
    "wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/",
    "wirkungsfelder/medien-oeffentlichkeit/detailkonzepte/",
    "wirkungsfelder/medien-oeffentlichkeit/dossiers/",
    ...modules.map((m) => `wirkungsfelder/medien-oeffentlichkeit/${m.slug}/`),
    ...aliases.map(([alias]) => `wirkungsfelder/medien-oeffentlichkeit/${alias}/`),
    "werkzeuge/medienwirkungscheck/",
    "werkzeuge/sprach-und-framing-analyse/",
    "werkzeuge/plattform-wirkungscheck/",
    "werkzeuge/desinformations-risikocheck/",
    "erleben/medienwirkungscheck/",
    "werkstatt/dossiers/medien-oeffentlichkeit/",
  ];
  const additions = urls
    .filter((url) => !xml.includes(`${SITE}/${url}`))
    .map((url) => `  <url>\n    <loc>${SITE}/${url}</loc>\n    <lastmod>${DATE}</lastmod>\n  </url>`)
    .join("\n");
  if (additions) {
    fs.writeFileSync(sitemap, xml.replace("</urlset>", `${additions}\n</urlset>`), "utf8");
  }
}

function run() {
  portalPage();
  fulltextPage("concept", "wirkungsfelder/medien-oeffentlichkeit/konzept/index.html", "Konzeptpapier / Online-Volltext");
  fulltextPage("dossier", "wirkungsfelder/medien-oeffentlichkeit/dossier/index.html", "Gesamtdossier / Online-Volltext");
  fulltextPage("hostingDossier", "wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/index.html", "Dossier / Online-Volltext");
  fulltextPage("detail", "wirkungsfelder/medien-oeffentlichkeit/detailkonzepte/index.html", "Detailkonzepte / Online-Volltext");
  fulltextPage("singleDossier", "wirkungsfelder/medien-oeffentlichkeit/dossiers/index.html", "Einzeldossiers / Online-Volltext");
  modules.forEach(modulePage);
  aliases.forEach(([alias, target, title]) => {
    if (alias !== target) aliasPage(alias, target, title);
  });
  toolPage("werkzeuge/medienwirkungscheck/index.html", "Medienwirkungscheck", "Öffentliche Wirkungsbedingungen modellhaft prüfen: Quellenklarheit, Kontext, Korrekturwege, Manipulationstransparenz und Reichweitenverantwortung.");
  toolPage("werkzeuge/sprach-und-framing-analyse/index.html", "Sprach- und Framing-Analyse", "Sprache, Frames, Tonalität und Diskurswirkung sichtbar machen, ohne Meinungen zu bewerten.", tools.filter(([name]) => /Sprache|Diskurs|Quellen/.test(name)));
  toolPage("werkzeuge/plattform-wirkungscheck/index.html", "Plattform-Wirkungscheck", "Empfehlungslogik, Datenzugang, Werbetransparenz, Jugend- und Grundrechtsschutz prüfen.", tools.filter(([name]) => /Plattform|Quellen|Diskurs/.test(name)));
  toolPage("werkzeuge/desinformations-risikocheck/index.html", "Desinformations-Risikocheck", "Täuschung, Koordination, KI-Einsatz, Reichweite, Zeitkritik und demokratisches Schadenspotenzial strukturieren.", tools.filter(([name]) => /Desinformation|Quellen|Plattform/.test(name)));
  demoPage();
  libraryPage();
  updateSitemap();
  console.log("Media public sphere portal generated.");
}

run();
