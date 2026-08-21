import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const glossaryPath = path.join(root, "public/data/glossary.terms.json");
const baseArchivePath = path.join(root, "content/quellenarchiv/sources.json");
const legalArchivePath = path.join(root, "content/quellenarchiv/legal-source-records.json");
const errors = [];

// Rechtsbegriffe dürfen nicht allein durch eine modellinterne WÖk-Quelle
// belegt werden. Jede Zuordnung verlangt eine konkrete amtliche Primärquelle
// und deren öffentliche Detailseite im Quellenarchiv.
const requiredCoverage = [
  {
    termId: "ai-act",
    archiveCode: "WÖK-Q-0191",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    host: "eur-lex.europa.eu",
  },
  {
    termId: "anti-slapp-richtlinie",
    archiveCode: "WÖK-Q-1027",
    url: "https://eur-lex.europa.eu/eli/dir/2024/1069/oj/eng",
    host: "eur-lex.europa.eu",
  },
  {
    termId: "art-2-euv-werte-der-europaeischen-union",
    archiveCode: "WÖK-Q-1025",
    url: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:12016M002",
    host: "eur-lex.europa.eu",
  },
  {
    termId: "art-3-euv-nachhaltige-entwicklung-europas",
    archiveCode: "WÖK-Q-0993",
    url: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:12016M003",
    host: "eur-lex.europa.eu",
  },
  {
    termId: "art-11-aeuv-umweltintegrationsprinzip",
    archiveCode: "WÖK-Q-0994",
    url: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:12016E011",
    host: "eur-lex.europa.eu",
  },
  {
    termId: "art-37-eu-grundrechtecharta-umweltschutz",
    archiveCode: "WÖK-Q-0306",
    url: "https://eur-lex.europa.eu/legal-content/DE/ALL/?uri=CELEX:12016P037",
    host: "eur-lex.europa.eu",
  },
  {
    termId: "art-191-aeuv-vorsorge-praeventions-und-verursacherprinzip",
    archiveCode: "WÖK-Q-1026",
    url: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:12016E191",
    host: "eur-lex.europa.eu",
  },
  {
    termId: "artikel-20a-grundgesetz",
    archiveCode: "WÖK-Q-1028",
    url: "https://www.gesetze-im-internet.de/gg/art_20a.html",
    host: "www.gesetze-im-internet.de",
  },
  {
    termId: "dora",
    archiveCode: "WÖK-Q-0199",
    url: "https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng",
    host: "eur-lex.europa.eu",
  },
  {
    termId: "deutsche-nachhaltigkeitsstrategie",
    archiveCode: "WÖK-Q-9032",
    url: "https://www.bundesregierung.de/breg-de/aktuelles/deutsche-nachhaltigkeitsstrategie-2025-2332540",
    host: "www.bundesregierung.de",
  },
  {
    termId: "gemeinsame-geschaeftsordnung-bundesministerien",
    archiveCode: "WÖK-Q-9029",
    url: "https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm",
    host: "www.verwaltungsvorschriften-im-internet.de",
  },
  {
    termId: "gesetzesfolgenabschaetzung",
    archiveCode: "WÖK-Q-9029",
    url: "https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm",
    host: "www.verwaltungsvorschriften-im-internet.de",
  },
  {
    termId: "nachhaltigkeitspruefung-bund",
    archiveCode: "WÖK-Q-9030",
    url: "https://www.bmj.de/DE/ministerium/nachhaltigkeit/gesetzgebung/gesetzgebung_artikel.html",
    host: "www.bmj.de",
  },
  {
    termId: "enap",
    archiveCode: "WÖK-Q-9034",
    url: "https://plattform.egesetzgebung.bund.de/cockpit/#/egfa",
    host: "plattform.egesetzgebung.bund.de",
  },
  {
    termId: "egesetzgebung-egfa",
    archiveCode: "WÖK-Q-9034",
    url: "https://plattform.egesetzgebung.bund.de/cockpit/#/egfa",
    host: "plattform.egesetzgebung.bund.de",
  },
  {
    termId: "dns-indikator",
    archiveCode: "WÖK-Q-9033",
    url: "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html",
    host: "www.destatis.de",
  },
  {
    termId: "zielbezug-vs-wirkung",
    archiveCode: "WÖK-Q-9031",
    url: "https://www.bundesregierung.de/breg-de/schwerpunkte/wirksam-regieren/steuerung-nachhaltigkeitsstrategie-419776",
    host: "www.bundesregierung.de",
  },
  {
    termId: "ex-ante-folgenpruefung-reality-check",
    archiveCode: "WÖK-Q-9029",
    url: "https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm",
    host: "www.verwaltungsvorschriften-im-internet.de",
  },
  {
    termId: "staatliche-nachhaltigkeitsarchitektur",
    archiveCode: "WÖK-Q-9031",
    url: "https://www.bundesregierung.de/breg-de/schwerpunkte/wirksam-regieren/steuerung-nachhaltigkeitsstrategie-419776",
    host: "www.bundesregierung.de",
  },
  {
    termId: "parlamentarischer-beirat-nachhaltige-entwicklung",
    archiveCode: "WÖK-Q-9036",
    url: "https://www.bundestag.de/ausschuesse/weitere_gremien/pbnez",
    host: "www.bundestag.de",
  },
  {
    termId: "state-assessment-benchmark",
    archiveCode: "WÖK-Q-9048",
    url: "https://www.gesetze-im-internet.de/bho/__7.html",
    host: "www.gesetze-im-internet.de",
  },
  {
    termId: "state-gfa-enap-benchmark",
    archiveCode: "WÖK-Q-9029",
    url: "https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm",
    host: "www.verwaltungsvorschriften-im-internet.de",
  },
  {
    termId: "wirkungsblindheit",
    archiveCode: "WÖK-Q-9029",
    url: "https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm",
    host: "www.verwaltungsvorschriften-im-internet.de",
  },
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function asSources(data) {
  return Array.isArray(data) ? data : data?.sources || [];
}

function archiveSlug(code) {
  return String(code || "")
    .toLocaleLowerCase("de")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sourceUrl(value) {
  if (value && typeof value === "object") return String(value.url || value.href || value.pageUrl || "").trim();
  const raw = String(value || "").trim();
  return raw.includes("|") ? raw.slice(raw.lastIndexOf("|") + 1).trim() : raw;
}

function sourceUrls(term) {
  return [term?.officialSources, term?.curatedSources, term?.sourceLinks]
    .flatMap((field) => Array.isArray(field) ? field : field ? [field] : [])
    .map(sourceUrl)
    .filter(Boolean);
}

function containsArchiveRoute(html, route) {
  const escaped = String(route).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|["'])[^"']*${escaped}(?:["'#?]|$)`, "i").test(html);
}

for (const file of [glossaryPath, baseArchivePath, legalArchivePath]) {
  if (!fs.existsSync(file)) errors.push(`Erforderliche Datei fehlt: ${path.relative(root, file)}`);
}

if (!errors.length) {
  const glossary = readJson(glossaryPath);
  const terms = Array.isArray(glossary.terms) ? glossary.terms : [];
  const legalSources = [
    ...asSources(readJson(baseArchivePath)),
    ...asSources(readJson(legalArchivePath)),
  ];
  const sourceByCode = new Map(legalSources.map((source) => [String(source.code || "").trim(), source]));
  const termById = new Map(terms.map((term) => [String(term.termId || term.id || "").trim(), term]));

  for (const requirement of requiredCoverage) {
    const term = termById.get(requirement.termId);
    const route = `/quellenarchiv/${archiveSlug(requirement.archiveCode)}/`;
    const source = sourceByCode.get(requirement.archiveCode);

    if (!term) {
      errors.push(`${requirement.termId}: Glossarbegriff fehlt`);
      continue;
    }
    if (!sourceUrls(term).includes(route)) {
      errors.push(`${requirement.termId}: amtliche Rechtsquelle fehlt oder führt nicht über ${route}`);
    }
    if (!source) {
      errors.push(`${requirement.termId}: Quellenarchiv-Datensatz ${requirement.archiveCode} fehlt`);
      continue;
    }
    if (source.url !== requirement.url) {
      errors.push(`${requirement.termId}: amtlicher Locator weicht von der festgelegten Primärquelle ab (${source.url || "fehlt"})`);
    }
    if (String(source.origin) !== "extern" || String(source.dataQuality) !== "amtlich") {
      errors.push(`${requirement.termId}: ${requirement.archiveCode} ist nicht als externe amtliche Quelle klassifiziert`);
    }
    try {
      if (new URL(String(source.url || "")).hostname !== requirement.host) {
        errors.push(`${requirement.termId}: ${requirement.archiveCode} verweist nicht auf ${requirement.host}`);
      }
    } catch {
      errors.push(`${requirement.termId}: ${requirement.archiveCode} enthält keine gültige amtliche URL`);
    }

    const termPage = path.join(root, "begriffe", term.slug, "index.html");
    if (!fs.existsSync(termPage)) {
      errors.push(`${requirement.termId}: Glossar-Detailseite fehlt`);
    } else if (!containsArchiveRoute(fs.readFileSync(termPage, "utf8"), route)) {
      errors.push(`${requirement.termId}: Quellenarchiv-Route ist auf der Glossar-Detailseite nicht sichtbar (${route})`);
    }

    const sourcePage = path.join(root, "quellenarchiv", archiveSlug(requirement.archiveCode), "index.html");
    if (!fs.existsSync(sourcePage)) {
      errors.push(`${requirement.termId}: Quellenarchiv-Detailseite fehlt (${route})`);
    } else {
      const html = fs.readFileSync(sourcePage, "utf8");
      const escapedUrl = requirement.url.replace(/&/g, "&amp;");
      if (!html.includes(`href="${requirement.url}"`) && !html.includes(`href="${escapedUrl}"`)) {
        errors.push(`${requirement.termId}: amtlicher Locator fehlt auf der Quellenarchiv-Detailseite`);
      }
    }
  }
}

if (errors.length) {
  console.error(`Amtliche Rechtsquellen im Glossar fehlen oder sind unvollständig (${errors.length} Befunde):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Amtliche Rechtsquellen im Glossar gesichert: ${requiredCoverage.length} Begriffe mit amtlichen Primärquellen und Quellenarchiv-Detailseiten geprüft.`);
