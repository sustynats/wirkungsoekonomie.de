import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MASTER_ROOT = path.join(ROOT, "content/studienskripte/v4");
const MANIFEST_PATH = path.join(MASTER_ROOT, "PUBLIC_MASTER_MANIFEST.json");
const APP_URL = "https://akademie.wirkungsoekonomie.de/";
const HISTORY_URL = "https://wirkungsoekonomie.de/akademie/curriculum-v3-2.html";
const SOURCE_ARCHIVE_URL = "https://github.com/sustynats/wirkungsoekonomie.de/tree/archive/curriculum-v3.2-20260821";

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const fail = (message) => { throw new Error(`ACADEMY_V4_MAIN_DOMAIN: ${message}`); };

if (manifest.curriculum_version !== "4.0") fail(`expected curriculum 4.0, got ${manifest.curriculum_version}`);
if (manifest.counts?.study_lectures !== 120) fail(`expected 120 study lectures, got ${manifest.counts?.study_lectures}`);
if (manifest.counts?.active_offerings !== 6) fail(`expected 6 active offerings, got ${manifest.counts?.active_offerings}`);
if (manifest.counts?.active_offering_lectures !== 58) fail(`expected 58 offering lectures, got ${manifest.counts?.active_offering_lectures}`);
if (manifest.security?.assessment_secrets_included !== false) fail("public master must not include assessment secrets");

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => `V${String(start + i).padStart(2, "0")}`);
const studyEntries = manifest.lectures.filter((entry) => entry.offering_id === "WOEK-G");
if (studyEntries.length !== 120) fail(`manifest study entry count is ${studyEntries.length}`);
const byCode = new Map(studyEntries.map((entry) => [entry.display_code, entry]));

function titleFor(entry) {
  const file = path.join(MASTER_ROOT, entry.public_path);
  const text = fs.readFileSync(file, "utf8");
  const heading = text.split(/\r?\n/).find((line) => line.startsWith("# ")) || "";
  const title = heading.replace(/^#\s+/, "").replace(new RegExp(`^${entry.display_code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[·:-]?\\s*`), "").trim();
  return title || entry.display_code;
}

const STRUCTURE = [
  { order: 1, title: "Grundverständnis", modules: [
    ["G1.1", "Was ist Wirkungsökonomie?", range(1,3)],
    ["G1.2", "Erfolg und Zukunft", range(4,6)],
    ["G1.3", "Mensch, Planet und Demokratie", range(7,9)],
    ["G1.4", "Wirkung statt bloßer Absicht", range(10,12)],
  ]},
  { order: 2, title: "Wirkungskompetenz: Problem, Ziel und Kausalität", modules: [
    ["G2.1", "Problem, Ziel, Wirkpfad und Evidenz", range(13,15)],
    ["G2.2", "Wirkungsräume lesen", range(16,18)],
    ["G2.3", "Wirkmechanismus und Resonanz", range(19,21)],
    ["G2.4", "Verantwortlich kommunizieren", range(22,24)],
  ]},
  { order: 3, title: "Referenzrahmen, Daten und Bewertung", modules: [
    ["G3.1", "Referenzrahmen: Agenda 2030, SDGs, SDG+", range(25,27)],
    ["G3.2", "Indikatoren, Register und Daten", range(28,30)],
    ["G3.3", "Bewertungsprofile, NWI und T-SROI", range(31,33)],
    ["G3.4", "Reverse Merit Order und Nichtkompensation", range(34,36)],
  ]},
  { order: 4, title: "Staatliche Nachhaltigkeits- und Folgenprüfungsarchitektur", modules: [
    ["G4.1", "Historische Entwicklung", ["GOV-01","GOV-02","GOV-03"]],
    ["G4.2", "DNS-Governance und Monitoring", ["GOV-04","GOV-05","GOV-06"]],
    ["G4.3", "GFA, Nachhaltigkeitsprüfung und digitale Gesetzgebung", ["GOV-07","GOV-08","GOV-09"]],
    ["G4.4", "Parlament, Aktionsplan und Vergleichslabor", ["GOV-10","GOV-11","GOV-12"]],
  ]},
  { order: 5, title: "Steuerung und Rückkopplung", modules: [
    ["G5.1", "Ehrliche Preise", range(37,39)],
    ["G5.2", "Wirkungssteuer", range(40,42)],
    ["G5.3", "Wirkungshaushalt und öffentliche Steuerung", range(43,45)],
    ["G5.4", "Kapital und Investitionen", range(46,48)],
  ]},
  { order: 6, title: "Wohlstand und Wirkungsökonomik", modules: [
    ["G6.1", "Was Wohlstand wirklich ist", range(49,51)],
    ["G6.2", "Einkommen und Sicherung nach Wirkung", range(52,54)],
    ["G6.3", "Makro-Steuerung", range(55,57)],
    ["G6.4", "Zielkonflikte der Wohlstandsordnung", range(58,60)],
  ]},
  { order: 7, title: "Resilienz und Systemstabilität", modules: [
    ["G7.1", "Resilienz verstehen", range(61,63)],
    ["G7.2", "Resiliente Wertschöpfung", range(64,66)],
    ["G7.3", "Resilienz messen und steuern", range(67,69)],
    ["G7.4", "Epistemische und demokratische Resilienz", range(70,72)],
  ]},
  { order: 8, title: "Anwendung in Feldern", modules: [
    ["G8.1", "Produktwirkung", range(73,75)],
    ["G8.2", "Unternehmen und Lieferketten", range(76,78)],
    ["G8.3", "Daseinsfelder", range(79,81)],
    ["G8.4", "Politik, Medien und Alltag", range(82,84)],
  ]},
  { order: 9, title: "Transformation, Institutionen und globale Ordnung", modules: [
    ["G9.1", "Institutionen und Regeln", range(85,87)],
    ["G9.2", "Daten und Technologie", range(88,90)],
    ["G9.3", "Globale Wirkungsordnung", range(91,93)],
    ["G9.4", "Systeme gestalten", range(94,96)],
  ]},
  { order: 10, title: "Praxisprojekt und Abschluss", modules: [
    ["G10.1", "Projektfrage und Problem Review", range(97,99)],
    ["G10.2", "Wirkungslogik und Daten", range(100,102)],
    ["G10.3", "Bewertung, Optionen und Reflexion", range(103,105)],
    ["G10.4", "Abschlussarbeit, Reality Check und Transfer", range(106,108)],
  ]},
];

const allCodes = STRUCTURE.flatMap((part) => part.modules.flatMap((module) => module[2]));
if (allCodes.length !== 120 || new Set(allCodes).size !== 120) fail("structure must contain exactly 120 unique lecture codes");
for (const code of allCodes) if (!byCode.has(code)) fail(`missing reviewed public-master lecture ${code}`);
for (const entry of studyEntries) if (!String(entry.review_status || "").startsWith("FACH_ENDCONTENT_REVIEWED")) fail(`${entry.display_code} is not FACH_ENDCONTENT_REVIEWED`);

const curriculum = {
  schemaVersion: "4.0",
  curriculumId: "woek-g",
  title: "Grundstudium Wirkungsökonomie (WÖk-G)",
  version: "4.0",
  stand: "2026-08-21",
  source: {
    publicMasterManifest: "content/studienskripte/v4/PUBLIC_MASTER_MANIFEST.json",
    sourceRepo: manifest.source_repo,
    sourceSha: manifest.source_sha,
    terminologyBaseline: manifest.terminology_baseline,
  },
  counts: { lectures: 120, modules: 40, studySections: 10, activeOfferings: 6, activeOfferingLectures: 58 },
  parts: STRUCTURE.map((part) => ({
    order: part.order,
    title: part.title,
    modules: part.modules.map(([id, title, codes]) => ({
      id, title,
      lectures: codes.map((code) => {
        const entry = byCode.get(code);
        return { code, lectureId: entry.lecture_id, title: titleFor(entry), status: entry.review_status, publicPath: entry.public_path };
      }),
    })),
  })),
};

const offerings = [
  ["grundlagen", "Grundlagen der Wirkungsökonomie", 7, "Einsteiger:innen und Interessierte"],
  ["wirkungsmanagement", "Wirkungsmanagement", 10, "Führung, Transformation und Nachhaltigkeit"],
  ["wirkungscontrolling", "Wirkungscontrolling / Impact Controlling", 10, "Controlling, Risiko, ESG und Steuerung"],
  ["multiplikatoren", "Multiplikator:innen", 8, "Lehre, Kommunikation und Transfer"],
  ["demokratie-buerger", "Demokratie und Bürger:innen", 11, "Demokratische Wirkungskompetenz"],
  ["demokratie-medien", "Demokratie und Medien", 12, "Medien, Öffentlichkeit und Kommunikationswirkung"],
].map(([slug, title, lectures, target]) => ({ slug, title, lectures, target }));

for (const offering of offerings) {
  const actual = manifest.counts?.offering_lectures_by_slug?.[offering.slug];
  if (actual !== offering.lectures) fail(`offering count mismatch for ${offering.slug}: ${actual}`);
}

const exams = [
  ["ZP1", "Grundlagenprüfung", 18, "auto"],
  ["ZP2", "Problem-, Ziel- und Kausalitätsprüfung", 24, "auto_scenario"],
  ["ZP3", "Referenz-, Daten- und Bewertungsprüfung", 24, "auto_scenario"],
  ["ZP4", "Prüfung staatliche Nachhaltigkeits- und Folgenarchitektur", 30, "auto_scenario"],
  ["ZP5", "Steuerungs- und Rückkopplungsprüfung", 24, "auto_scenario"],
  ["ZP6", "Wohlstandsprüfung", 21, "auto_scenario"],
  ["ZP7", "Resilienzprüfung", 21, "auto_scenario"],
  ["ZP8", "Anwendungsprüfung", 24, "auto_scenario"],
  ["ZP9", "Systemdesignprüfung", 24, "auto_scenario"],
  ["ZP10", "Projektfreigabeprüfung", 30, "auto_scenario"],
];
const finals = [
  ["AP1", "Abschlussprüfung Wissen und Methoden", "auto_scenario"],
  ["AP2", "Abschlussprüfung Fallanalyse", "mixed_auto_manual"],
  ["AP3", "Praxisprojekt Wirkungsdossier", "manual_rubric"],
  ["AP4", "Verteidigung und Transfer", "manual_rubric"],
];

function nav(prefix) {
  return `<header class="site-header" data-search-exclude>
  <a class="brand" href="${prefix}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${prefix}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
  <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
  <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude>
    <a href="${prefix}verstehen/">Verstehen</a><a href="${prefix}fuer/">Für wen?</a><a href="${prefix}wirkungsfelder/">Wirkungsfelder</a><a href="${prefix}werkzeuge/">Praxis &amp; Tools</a><a href="${prefix}oeffentlicher-wirkungsraum/">Debatte &amp; Radar</a><a href="${prefix}lernen/" aria-current="page">Lernen</a><a href="${prefix}institut/">Institut</a><a href="${prefix}bibliothek/">Bibliothek</a><a href="${prefix}mitmachen.html">Mitmachen</a>
  </nav></header>`;
}
function footer(prefix) {
  return `<footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Wirkungsökonomie</p><h2>Lernen, prüfen, anwenden.</h2><p>Curriculum v4.0 verbindet bestehende Nachhaltigkeits- und Folgenprüfungsarchitekturen mit der zusätzlichen WÖk-Wirkungs- und Rückkopplungslogik.</p></div><div><a href="${prefix}akademie.html">Akademie</a><br><a href="${prefix}akademie/curriculum-v3-2.html">Historisches Curriculum v3.2</a><br><a href="${prefix}quellenarchiv/">Quellenarchiv</a></div></div></footer><script src="${prefix}assets/js/main.js" defer></script>`;
}
function page({ title, description, canonical, prefix, body, extraHead = "" }) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Wirkungsökonomie"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><link rel="icon" href="${prefix}assets/img/brand/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}assets/css/style.css">${extraHead}</head><body class="theme-akademie">${nav(prefix)}<main data-search-content data-curriculum-version="4.0">${body}</main>${footer(prefix)}</body></html>\n`;
}
const hero = (kicker, title, subtitle, actions = "") => `<section class="hero"><div class="hero-copy"><p class="hero-kicker">${kicker}</p><h1 class="hero-title">${title}</h1><p class="hero-subtitle">${subtitle}</p>${actions ? `<div class="hero-actions">${actions}</div>` : ""}</div></section>`;
const btnApp = `<a class="btn btn-primary" href="${APP_URL}">Zur Akademie-App</a>`;
const btnStructure = `<a class="btn btn-secondary" href="studienstruktur.html">Studienstruktur v4.0</a>`;

const structureHtml = STRUCTURE.map((part) => `<details class="card academy-part-card academy-curriculum-card" ${part.order <= 4 ? "open" : ""}><summary><span>Teil ${part.order}</span><strong>${esc(part.title)}</strong><small>4 Module · 12 Vorlesungen</small></summary><div class="academy-module-grid">${part.modules.map(([id, title, codes]) => `<article><h3>${id} ${esc(title)}</h3><ol>${codes.map((code) => { const entry = byCode.get(code); return `<li data-lecture-id="${esc(entry.lecture_id)}"><strong>${esc(code)}</strong> ${esc(titleFor(entry))}</li>`; }).join("")}</ol></article>`).join("")}</div><p class="competence-note"><strong>Zwischenprüfung:</strong> ZP${part.order} nach Teil ${part.order}.</p></details>`).join("\n");

const stateArchitecture = `<section class="section section-soft"><div class="section-header"><p class="hero-kicker">Pflichtstrang in v4.0</p><h2>Deutschland beginnt nicht bei null.</h2><p>Die Lehre erkennt die bestehende staatliche Architektur ausdrücklich an: Deutsche Nachhaltigkeitsstrategie, Gesetzesfolgenabschätzung nach §§ 43-44 GGO, Nachhaltigkeitsprüfung, eNAP/eGFA/E-Gesetzgebung, DNS-Indikatoren und Monitoring sowie parlamentarische Kontrolle. WÖk ersetzt diese Verfahren nicht. Sie ergänzt sie um eine durchgängige Problem-, Ziel-, Kausal-, Options- und Reality-Check-Architektur.</p></div><div class="card-grid three"><article class="card"><h3 class="card-title">Staatliche Architektur</h3><p class="card-text">Problem- und Zielkontext, Alternativen und Gesetzesfolgen, Nachhaltigkeitsprüfung, DNS-/SDG-Bezüge, Indikatoren und spätere Überprüfung je nach Gegenstand und Verfahren.</p></article><article class="card"><h3 class="card-title">WÖk-Erweiterung</h3><p class="card-text">Problem Review → Goal Review → A→M→ΔZ→R → 1.-3. Ordnung → Verteilung/Resilienz → Gegenfaktum/Attribution → Optionsvergleich → Reality Check.</p></article><article class="card"><h3 class="card-title">Harte Trennungen</h3><p class="card-text">Zielbezug ist kein Kausalitätsnachweis. Indikator ist nicht Wirkung. Output ist nicht Outcome. Beobachtung ist nicht Attribution. Harte Schutzgrenzen sind nicht kompensierbar.</p></article></div></section>`;

const rootOverview = page({
  title: "Akademie für Wirkungsökonomie · Curriculum v4.0",
  description: "Die Akademie für Wirkungsökonomie mit Curriculum v4.0: 10 Teile, 40 Module, 120 Studienvorlesungen, staatliche Nachhaltigkeitsarchitektur und sechs aktive Weiterbildungsfamilien.",
  canonical: "https://wirkungsoekonomie.de/akademie.html", prefix: "",
  body: `${hero("Akademie für Wirkungsökonomie · Curriculum v4.0","Wirkung verstehen. Bestehende Systeme kennen. Besser entscheiden.","Das vollständig re-auditierte Curriculum v4.0 verbindet 120 Studienvorlesungen mit sechs aktiven Weiterbildungsfamilien. Neu ist ein eigener Pflichtteil zur deutschen Nachhaltigkeits- und Folgenprüfungsarchitektur - von der historischen Entwicklung bis GFA, eNAP/eGFA, DNS-Monitoring und aktuellem Wirkungsvergleich.",`<a class="btn btn-primary" href="${APP_URL}">Jetzt in die Akademie</a><a class="btn btn-secondary" href="akademie/studienstruktur.html">Curriculum ansehen</a>`)}` +
  `<section class="section"><div class="trust-box"><article><span>10</span><p>Studienteile</p></article><article><span>40</span><p>Module</p></article><article><span>120</span><p>Studienvorlesungen</p></article><article><span>6</span><p>aktive Weiterbildungsfamilien</p></article></div></section>` + stateArchitecture +
  `<section class="section"><div class="card-grid three"><article class="card"><h3 class="card-title">Grundstudium WÖk-G</h3><p class="card-text">Von Wirkungskompetenz über Daten, staatliche Prüfarchitektur und Steuerung bis zum eigenen Wirkungsdossier.</p><a class="btn btn-secondary" href="akademie/studienstruktur.html">Studienstruktur</a></article><article class="card"><h3 class="card-title">Prüfungen & Praxis</h3><p class="card-text">10 Zwischenprüfungen und vier Abschlussleistungen. Wissensfragen sind deterministisch prüfbar, Praxisdossier und Verteidigung werden manuell nach Rubric bewertet.</p><a class="btn btn-secondary" href="akademie/pruefungen.html">Prüfungslogik</a></article><article class="card"><h3 class="card-title">Weiterbildung</h3><p class="card-text">Grundlagen, Wirkungsmanagement, Wirkungscontrolling, Multiplikator:innen, Demokratie/Bürger:innen sowie Demokratie/Medien - alle auf derselben v4.0-Core-Logik.</p><a class="btn btn-secondary" href="akademie/weiterbildung.html">Angebote</a></article></div><p class="competence-note"><strong>Versionierung:</strong> v4.0 ist der führende Lehrstand. <a href="akademie/curriculum-v3-2.html">Curriculum v3.2 bleibt als historische Version nachvollziehbar.</a></p></section>`
});

const academyIndex = page({ title:"Akademie für Wirkungsökonomie · v4.0", description:"Einstieg in die Akademie für Wirkungsökonomie und das Curriculum v4.0.", canonical:"https://wirkungsoekonomie.de/akademie/", prefix:"../", body:`${hero("Akademie · v4.0","Das aktuelle Lernsystem der Wirkungsökonomie.","120 Studienvorlesungen, 10 Teile, 40 Module, 10 Zwischenprüfungen, vier Abschlussleistungen und sechs aktive Weiterbildungsfamilien.",`${btnApp}<a class="btn btn-secondary" href="studienstruktur.html">Studienstruktur</a>`)}` + stateArchitecture + `<section class="section"><div class="card-grid three"><article class="card"><h3>Studienstruktur</h3><p>Alle zehn Teile und 120 Vorlesungen.</p><a href="studienstruktur.html">Öffnen</a></article><article class="card"><h3>Lernpfad</h3><p>Problem-first lernen, prüfen und anwenden.</p><a href="lernpfad.html">Öffnen</a></article><article class="card"><h3>Weiterbildung</h3><p>Sechs aktive v4-Angebotsfamilien.</p><a href="weiterbildung.html">Öffnen</a></article></div></section>` });

const studyPage = page({ title:"Studium und Studienstruktur v4.0 | Akademie für Wirkungsökonomie", description:"Curriculum v4.0 im Detail: 10 Teile, 40 Module, 120 Vorlesungen und ein eigener Pflichtstrang zur staatlichen Nachhaltigkeits- und Folgenprüfungsarchitektur.", canonical:"https://wirkungsoekonomie.de/akademie/studienstruktur.html", prefix:"../", body:`${hero("Curriculum v4.0","10 Teile, 40 Module, 120 Vorlesungen.","Die 108 historischen Vorlesungen wurden vollständig re-auditiert und als v4-Endcontent neu gefasst. Hinzu kommen zwölf neue GOV-Vorlesungen zur staatlichen Nachhaltigkeits- und Folgenprüfungsarchitektur.",`${btnApp}<a class="btn btn-secondary" href="curriculum-v3-2.html">Historie v3.2</a>`)}` + `<section class="section"><div class="trust-box"><article><span>108</span><p>legacy-gemappte, re-auditierte Vorlesungen</p></article><article><span>12</span><p>neue GOV-Vorlesungen</p></article><article><span>10</span><p>Zwischenprüfungen</p></article><article><span>4</span><p>Abschlussleistungen</p></article></div><div class="academy-curriculum-grid">${structureHtml}</div></section>` });

const learningPath = page({ title:"Lernpfad v4.0 | Akademie für Wirkungsökonomie", description:"Der Lernpfad des Curriculum v4.0: bestehende Systeme kennen, Problem und Ziel prüfen, Wirkung analysieren, Optionen vergleichen und nach Umsetzung lernen.", canonical:"https://wirkungsoekonomie.de/akademie/lernpfad.html", prefix:"../", body:`${hero("Lernpfad v4.0","Nicht mit der Lösung anfangen.","Die zentrale Änderung von v4.0 ist methodisch: zuerst Sachstand und Problem, dann Ziel, dann Maßnahme und Wirkpfad. Bestehende staatliche Prüfungen werden als eigener Befund gelesen, nicht ignoriert.",`${btnApp}${btnStructure}`)}` + `<section class="section"><div class="module-list"><article><span>01</span><div><h3>Verstehen</h3><p>Teile 1-4: Wirkung, Problem Review, Goal Review, Referenzrahmen und die staatliche Nachhaltigkeits-/Folgenprüfungsarchitektur.</p></div></article><article><span>02</span><div><h3>Steuern</h3><p>Teile 5-7: Preise, Wirkungssteuer, öffentliche Steuerung, Wohlstand und Resilienz - mit Grenzen von Aggregation und Monetarisierung.</p></div></article><article><span>03</span><div><h3>Anwenden</h3><p>Teile 8-10: Produkte, Unternehmen, Politik, Medien, Institutionen, globale Ordnung und das eigene source-bound Wirkungsdossier.</p></div></article></div></section>` + stateArchitecture + `<section class="section section-soft"><div class="section-header"><h2>Die v4.0-Kette</h2><p><strong>Fact/Source → Problem Review → Goal Review → Actual Measure → A→M→ΔZ→R → 1.-3. Ordnung/Kaskaden → Verteilung/Resilienz → Gegenfaktum/Attribution → Omissions/Delivery/Coherence → Optionsvergleich → Reality Check → Lernschleife.</strong></p></div><p>Eine Empfehlung folgt nicht aus einem Score. Erst Problem, Ursache, reale Optionen, Schutzgrenzen, Umsetzbarkeit und Monitoring tragen eine robuste Handlungsoption.</p></section>` });

const basics = page({ title:"Grundlagen v4.0 | Akademie für Wirkungsökonomie", description:"Grundlagen des Curriculum v4.0: Wirkung, Wirkungspotenzial, Evidenz, Referenzebenen, staatliche Nachhaltigkeitsarchitektur und WÖk-Zusatznutzen.", canonical:"https://wirkungsoekonomie.de/akademie/grundlagen.html", prefix:"../", body:`${hero("Grundlagen v4.0","Wirkung ist nicht Absicht. Und WÖk beginnt nicht auf einer leeren Wiese.","Die Akademie trennt Wirkung, Wirkungspotenzial, Indikatoren, Ziele, Evidenz und Kausalität. Gleichzeitig lernt sie bestehende Institutionen und Verfahren fair kennen, bevor sie den zusätzlichen WÖk-Beitrag erklärt.",`${btnApp}${btnStructure}`)}` + stateArchitecture + `<section class="section"><div class="card-grid three"><article class="card"><h3>Wirkung</h3><p>Beobachtete oder erwartete Zustandsänderung eines relevanten Gegenstands - mit Mechanismus, Referenz und Unsicherheit.</p></article><article class="card"><h3>Wirkungspotenzial</h3><p>Ex-ante-Erwartung. Kein bereits eingetretenes Outcome und keine Attribution.</p></article><article class="card"><h3>Indikator</h3><p>Mess- oder Beobachtungsgröße. Er kann Baseline, Target, Outcome, Kontext, Boundary oder Reality-Check-Funktion haben - er ist nicht selbst die Wirkung.</p></article></div></section><section class="section section-soft"><div class="section-header"><h2>Version-sensitive Staatsarchitektur</h2><p>Die DNS 2025, §§ 43-44 GGO, eNAP/eGFA/E-Gesetzgebung, Destatis-Monitoring und die parlamentarische Nachhaltigkeitsprüfung werden aus Primärquellen gelehrt. Der Aktionsplan Nachhaltigkeit 2026 wird mit seinem jeweiligen Veröffentlichungsstand versioniert; Stand 21.08.2026 ist die Beteiligungsfassung vom 16.07.2026 nicht als Finalfassung zu behandeln.</p></div></section>` });

const examCards = exams.map(([code,title,count,mode], i) => `<article class="card"><p class="card-kicker">${code} · nach Teil ${i+1}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${count} Aufgaben · Modus: ${esc(mode)}.</p></article>`).join("");
const finalCards = finals.map(([code,title,mode]) => `<article class="card"><p class="card-kicker">${code}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">Modus: ${esc(mode)}.</p></article>`).join("");
const examsPage = page({ title:"Prüfungen v4.0 | Akademie für Wirkungsökonomie", description:"Prüfungsarchitektur v4.0: zehn Zwischenprüfungen, vier Abschlussleistungen, deterministische Wissensprüfung und manuell bewertete Praxisleistungen.", canonical:"https://wirkungsoekonomie.de/akademie/pruefungen.html", prefix:"../", body:`${hero("Prüfungen · v4.0","Prüfen, ob die Methode verstanden wurde - nicht ob jemand eine Meinung nachspricht.","v4.0 prüft staatliche und WÖk-Architektur getrennt, Kausalitätsgrenzen explizit und Praxisleistungen dort manuell, wo automatische Bewertung fachlich nicht trägt.",`${btnApp}${btnStructure}`)}` + `<section class="section"><div class="section-header"><h2>10 Zwischenprüfungen</h2></div><div class="card-grid three">${examCards}</div></section><section class="section section-soft"><div class="section-header"><h2>Vier Abschlussleistungen</h2></div><div class="card-grid two">${finalCards}</div><p class="competence-note"><strong>Privacy:</strong> Lösungsschlüssel, Correct Answers und Instructor-Rubrics sind nicht Bestandteil des öffentlichen Public-Masters. AP3 und AP4 sind manuelle Rubric-Prüfungen und werden nicht durch generative KI automatisch bestanden oder abgelehnt.</p></section><section class="section"><div class="section-header"><h2>Praxisprojekt v4.0</h2><p>Bei politischen oder öffentlichen Fällen muss das Dossier vor der WÖk-Zusatzanalyse die anwendbare staatliche Referenz- und Prüfarchitektur erfassen. Danach folgen Problem Review, Goal Review, konkrete Maßnahme, GFA/eNAP/DNS soweit anwendbar, unabhängige Kausalanalyse, Optionen, Monitoring, Reality Check und Falsifikationskriterien.</p></div></section>` });

const offeringCards = offerings.map((o) => `<article class="card"><p class="card-kicker">${o.lectures} Vorlesungen</p><h3 class="card-title">${esc(o.title)}</h3><p class="card-text">${esc(o.target)}. CurriculumVersion 4.0; gemeinsamer Core zu Wirkung, Evidenz, Referenzebenen, Nichtkompensation und Reality Check.</p></article>`).join("");
const continuingPage = page({ title:"Weiterbildung v4.0 | Akademie für Wirkungsökonomie", description:"Sechs aktive Weiterbildungsfamilien der Akademie in CurriculumVersion 4.0 mit gemeinsamer fachlicher Core-Architektur.", canonical:"https://wirkungsoekonomie.de/akademie/weiterbildung.html", prefix:"../", body:`${hero("Weiterbildung · v4.0","Sechs aktive Angebotsfamilien. Eine gemeinsame Fachlogik.","Kein Kurs darf eine alte Parallelmethodik fortschreiben. Alle aktiven Angebote nutzen die v4.0-Core-Regeln zu Wirkung, Evidenz, Referenzebenen, staatlicher Architektur, Nichtkompensation und Reality Check.",`${btnApp}<a class="btn btn-secondary" href="grundlagen.html">Gemeinsamer Core</a>`)}` + `<section class="section"><div class="card-grid three">${offeringCards}</div><p class="competence-note"><strong>Gesamtumfang:</strong> 58 fachlich reviewte Weiterbildungslektionen in sechs aktiven Familien. Historische oder nicht aktive Bestände bleiben versioniert, werden aber nicht als aktuelle v4-Lehre ausgegeben.</p></section>` });

const learnHub = page({ title:"Lernen | Wirkungsökonomie · Akademie v4.0", description:"Lernhub der Wirkungsökonomie mit Akademie v4.0, Grundstudium und sechs aktiven Weiterbildungsfamilien.", canonical:"https://wirkungsoekonomie.de/lernen/", prefix:"../", body:`${hero("Lernen · Akademie v4.0","Wirkungskompetenz vom Einstieg bis zum Wirkungsdossier.","Das aktuelle Lernsystem ist Curriculum v4.0: 10 Teile, 40 Module, 120 Studienvorlesungen und sechs aktive Weiterbildungsfamilien.",`<a class="btn btn-primary" href="${APP_URL}">Akademie öffnen</a><a class="btn btn-secondary" href="../akademie/studienstruktur.html">Curriculum ansehen</a>`)}` + `<section class="section"><div class="card-grid three"><article class="card"><h3>Grundlagen</h3><p>Wirkung, Evidenz, Problem-/Zielprüfung und Referenzebenen.</p><a href="../akademie/grundlagen.html">Grundlagen</a></article><article class="card"><h3>Studium</h3><p>10 Teile, 40 Module, 120 Vorlesungen.</p><a href="../akademie/studienstruktur.html">Studium</a></article><article class="card"><h3>Weiterbildung</h3><p>Sechs aktive v4-Angebotsfamilien.</p><a href="../akademie/weiterbildung.html">Weiterbildung</a></article></div></section>` + stateArchitecture });

const historyPage = page({ title:"Historisches Curriculum v3.2 | Akademie für Wirkungsökonomie", description:"Dokumentation der historischen Curriculum-Version v3.2 mit 9 Teilen, 36 Modulen und 108 Vorlesungen; v4.0 ist der aktuelle Lehrstand.", canonical:HISTORY_URL, prefix:"../", body:`${hero("Historische Version","Curriculum v3.2 bleibt nachvollziehbar.","v3.2 war die frühere öffentliche Studienstruktur mit 9 Teilen, 36 Modulen und 108 Vorlesungen. Sie wird nicht still überschrieben. Curriculum v4.0 ist seit dem 21.08.2026 der führende Lehrstand.",`<a class="btn btn-primary" href="studienstruktur.html">Zu v4.0</a><a class="btn btn-secondary" href="${SOURCE_ARCHIVE_URL}">Archivstand auf GitHub</a>`)}` + `<section class="section"><div class="card-grid three"><article class="card"><h3>Was erhalten bleibt</h3><p>Historische Struktur, veröffentlichte URLs, Git-Historie und die archivierte Curriculum-Branch bleiben reproduzierbar.</p></article><article class="card"><h3>Warum v4.0</h3><p>Der vollständige Reaudit hat die staatliche Nachhaltigkeits-/Folgenprüfungsarchitektur, Problem Review, Goal Review, Kausalitäts-/Attributionsregeln, Nichtkompensation und Reality Check systematisch integriert.</p></article><article class="card"><h3>Kein stilles Umschreiben</h3><p>v4.0 ist eine neue Version. Historische Publikationen und alte Lehrstände werden als solche gekennzeichnet statt rückwirkend als damaliger Stand umgedeutet.</p></article></div></section>` });

const outputs = new Map([
  ["akademie.html", rootOverview],
  ["akademie/index.html", academyIndex],
  ["akademie/studienstruktur.html", studyPage],
  ["akademie/lernpfad.html", learningPath],
  ["akademie/grundlagen.html", basics],
  ["akademie/pruefungen.html", examsPage],
  ["akademie/weiterbildung.html", continuingPage],
  ["lernen/index.html", learnHub],
  ["akademie/curriculum-v3-2.html", historyPage],
  ["public/data/woek-g-curriculum.json", `${JSON.stringify(curriculum, null, 2)}\n`],
  ["content/academy/woek-g-curriculum-v4.json", `${JSON.stringify(curriculum, null, 2)}\n`],
]);

for (const [rel, content] of outputs) {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

const summary = {
  curriculum_version: "4.0",
  study_parts: 10,
  modules: 40,
  study_lectures: 120,
  active_offerings: 6,
  active_offering_lectures: 58,
  public_master_source_sha: manifest.source_sha,
  terminology_baseline: manifest.terminology_baseline,
  historical_version: "3.2",
  generated_routes: [...outputs.keys()].filter((p) => p.endsWith(".html")),
};
fs.writeFileSync(path.join(ROOT, "content/academy/ACADEMY_V4_MAIN_DOMAIN_MANIFEST.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(`ACADEMY_V4_MAIN_DOMAIN: PASS - ${summary.study_parts}/40/${summary.study_lectures}, ${summary.active_offerings} offerings, ${summary.generated_routes.length} routes`);
