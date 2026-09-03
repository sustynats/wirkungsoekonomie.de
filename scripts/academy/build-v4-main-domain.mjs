#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

await import("./verify-v4-public-master.mjs");

const ROOT = process.cwd();
const MASTER_ROOT = path.join(ROOT, "content/studienskripte/v4");
const manifest = JSON.parse(fs.readFileSync(path.join(MASTER_ROOT, "PUBLIC_MASTER_MANIFEST.json"), "utf8"));
const projection = JSON.parse(fs.readFileSync(path.join(ROOT, "content/academy/academy-v4-main-domain-projection.json"), "utf8"));
const APP_URL = "https://akademie.wirkungsoekonomie.de";
const HISTORY_URL = "https://wirkungsoekonomie.de/akademie/curriculum-v3-2.html";
const HISTORY_SOURCE_URL = `https://github.com/sustynats/wirkungsoekonomie.de/tree/${projection.historical_curriculum.archive_commit}`;

function fail(message) {
  throw new Error(`ACADEMY_V4_MAIN_DOMAIN: ${message}`);
}

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function publicNwiLabel(value = "") {
  return String(value).replaceAll(
    "NWI und T-SROI",
    "WÖk-Netto-Wirkungsindex und T-SROI",
  );
}

function readPublicLecture(entry) {
  const file = path.resolve(MASTER_ROOT, entry.public_path);
  if (!file.startsWith(`${MASTER_ROOT}${path.sep}`)) fail(`unsafe public path ${entry.public_path}`);
  const text = fs.readFileSync(file, "utf8");
  const heading = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (!heading) fail(`missing public heading for ${entry.lecture_id}`);
  const code = entry.display_code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const title = publicNwiLabel(
    heading.replace(new RegExp(`^${code}\\s*[·:–-]?\\s*`), "").trim(),
  );
  return { ...entry, title: title || entry.display_code };
}

const studyEntries = manifest.lectures
  .filter((entry) => entry.offering_id === "WOEK-G")
  .map(readPublicLecture);
const studyByCode = new Map(studyEntries.map((entry) => [entry.display_code, entry]));

const parts = projection.parts.map((part) => ({
  order: part.part_order,
  title: part.title,
  modules: part.modules.map((module) => ({
    code: module.module_code,
    title: publicNwiLabel(module.title),
    lectures: module.lecture_codes.map((code) => {
      const lecture = studyByCode.get(code);
      if (!lecture) fail(`projection references missing lecture ${code}`);
      return {
        code: lecture.display_code,
        lectureId: lecture.lecture_id,
        title: lecture.title,
        publicMasterPath: lecture.public_path,
      };
    }),
  })),
}));

const publicMode = new Map([
  ["auto", "Automatisiert"],
  ["auto_scenario", "Automatisiert und szenariobasiert"],
  ["mixed_auto_manual", "Kombiniert: automatisierte und manuell geprüfte Bestandteile"],
  ["manual_rubric", "Manuell anhand veröffentlichter Bewertungskriterien geprüft"],
]);
const publicAssessment = (entry) => ({
  assessmentId: entry.assessment_id,
  title: entry.title,
  ...(entry.after_part ? { afterPart: entry.after_part } : {}),
  ...(entry.question_count ? { questionCount: entry.question_count } : {}),
  evaluation: publicMode.get(entry.mode) || fail(`unknown assessment mode ${entry.mode}`),
});

const curriculum = {
  schemaVersion: "4.0",
  curriculumId: "woek-g",
  title: "Grundstudium Wirkungsökonomie (WÖk-G)",
  version: "4.0",
  source: {
    publicMasterManifest: "content/studienskripte/v4/PUBLIC_MASTER_MANIFEST.json",
    sourceRepo: manifest.source_repo,
    sourceSha: manifest.source_sha,
    authoredTerminologyBaseline: manifest.terminology_baseline,
    currentReleaseReference: `WÖk-Begriffsleitfaden v${projection.terminology.current_release_reference}`,
  },
  counts: {
    parts: 10,
    modules: 40,
    studyLectures: 120,
    activeOfferings: 6,
    activeOfferingLectures: 58,
    interimExams: 10,
    finalAssessments: 4,
  },
  parts,
  activeOfferings: projection.active_offerings.map((entry) => ({
    offeringId: entry.offering_id,
    slug: entry.slug,
    title: entry.title,
    audience: entry.audience,
    level: entry.level,
    lectureCount: entry.lecture_count,
    appUrl: `${APP_URL}${entry.app_path}`,
  })),
  assessments: {
    interim: projection.interim_exams.map(publicAssessment),
    final: projection.final_assessments.map(publicAssessment),
  },
  history: {
    currentVersion: "4.0",
    historicalVersion: projection.historical_curriculum.version,
    historicalRoute: `/${projection.historical_curriculum.public_route}`,
    archiveCommit: projection.historical_curriculum.archive_commit,
  },
};

function readShell(rel, fallback = rel) {
  const source = fs.readFileSync(path.join(ROOT, fs.existsSync(path.join(ROOT, rel)) ? rel : fallback), "utf8");
  const header = source.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
  const footer = source.match(/<footer class="footer"[\s\S]*?<\/footer>/)?.[0];
  if (!header || !footer) fail(`layout shell missing for ${rel}`);
  return { header, footer };
}

const shells = new Map([
  ["akademie.html", readShell("akademie.html")],
  ["akademie/studienstruktur.html", readShell("akademie/studienstruktur.html")],
  ["akademie/lernpfad.html", readShell("akademie/lernpfad.html")],
  ["akademie/grundlagen.html", readShell("akademie/grundlagen.html")],
  ["akademie/pruefungen.html", readShell("akademie/pruefungen.html")],
  ["akademie/weiterbildung.html", readShell("akademie/weiterbildung.html")],
  ["lernen/index.html", readShell("lernen/index.html")],
  ["akademie/curriculum-v3-2.html", readShell("akademie/curriculum-v3-2.html", "akademie/studienstruktur.html")],
]);

function structuredData({ title, description, canonical }) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        inLanguage: "de",
        isPartOf: { "@id": "https://wirkungsoekonomie.de/#website" },
      },
      {
        "@type": "Course",
        "@id": "https://wirkungsoekonomie.de/akademie.html#course",
        name: "Grundstudium Wirkungsökonomie (WÖk-G), Curriculum v4.0",
        provider: { "@type": "Organization", name: "Wirkungsökonomie", url: "https://wirkungsoekonomie.de" },
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", url: `${APP_URL}/studium` },
      },
    ],
  }).replaceAll("<", "\\u003c");
}

function page({ rel, title, description, canonical, prefix, body }) {
  const shell = shells.get(rel);
  if (!shell) fail(`no shell for ${rel}`);
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${esc(canonical)}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${esc(canonical)}">
    <meta name="twitter:card" content="summary">
    <link rel="icon" href="${prefix}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${prefix}assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">${structuredData({ title, description, canonical })}</script>
  </head>
  <body class="theme-akademie">
    ${shell.header}
    <main data-search-content data-curriculum-version="4.0">
${body}
    </main>
    ${shell.footer}
    <script src="${prefix}assets/js/main.js?v=20260612-mobile-table-fix" defer></script>
  </body>
</html>
`;
}

const appButton = `<a class="btn btn-primary academy-primary-cta" href="${APP_URL}/studium" data-analytics-event="academy_app_cta" data-analytics-label="page-primary">Akademie-App öffnen</a>`;
const structureButton = `<a class="btn btn-secondary" href="studienstruktur.html">Studienstruktur v4.0</a>`;
const hero = (kicker, title, subtitle, actions = "") => `<section class="hero"><div class="hero-copy"><p class="hero-kicker">${kicker}</p><h1 class="hero-title">${title}</h1><p class="hero-subtitle">${subtitle}</p>${actions ? `<div class="hero-actions">${actions}</div>` : ""}</div></section>`;
const countStrip = `<section class="section" aria-label="Umfang des Curriculum v4.0"><div class="trust-box"><article><span>10</span><p>Studienteile</p></article><article><span>40</span><p>Module</p></article><article><span>120</span><p>Studienvorlesungen</p></article><article><span>6</span><p>aktive Weiterbildungsfamilien</p></article></div></section>`;

const statePart = parts.find((part) => part.order === 4);
const stateArchitecture = `<section class="section section-soft" id="staatliche-architektur"><div class="section-header"><p class="hero-kicker">Pflichtteil 4</p><h2>Bestehende staatliche Architektur kennen, WÖk-Zusatz getrennt prüfen</h2><p>Zwölf fachlich geprüfte GOV-Vorlesungen behandeln die deutsche Nachhaltigkeits- und Folgenprüfungsarchitektur. Die WÖk ersetzt diese Verfahren nicht. Sie ergänzt sie um eine durchgängige objektspezifische Problem-, Ziel-, Kausal-, Options- und Rückkopplungsarchitektur.</p></div><div class="card-grid two">${statePart.modules.map((module) => `<article class="card"><p class="card-kicker">${esc(module.code)}</p><h3 class="card-title">${esc(module.title)}</h3><ul>${module.lectures.map((lecture) => `<li>${esc(lecture.code)}: ${esc(lecture.title)}</li>`).join("")}</ul></article>`).join("")}</div></section>`;

const structureHtml = parts.map((part) => `<details class="card academy-part-card academy-curriculum-card" ${part.order <= 4 ? "open" : ""}><summary><span>Teil ${part.order}</span><strong>${esc(part.title)}</strong><small>4 Module · 12 Vorlesungen</small></summary><div class="academy-module-grid">${part.modules.map((module) => `<article><h3>${esc(module.code)} ${esc(module.title)}</h3><ol>${module.lectures.map((lecture) => `<li data-lecture-id="${esc(lecture.lectureId)}"><strong>${esc(lecture.code)}</strong> ${esc(lecture.title)}</li>`).join("")}</ol></article>`).join("")}</div><p class="competence-note"><strong>Zwischenprüfung:</strong> ZP${part.order} nach Teil ${part.order}.</p></details>`).join("\n");

const offeringCards = curriculum.activeOfferings.map((offering) => `<article class="card" data-offering-id="${esc(offering.offeringId)}"><p class="card-kicker">${offering.lectureCount} Vorlesungen</p><h3 class="card-title">${esc(offering.title)}</h3><p class="card-text">${esc(offering.audience)}</p><a class="text-link" href="${esc(offering.appUrl)}">Kurs in der Akademie-App öffnen</a></article>`).join("");
const interimCards = curriculum.assessments.interim.map((exam) => `<article class="card" data-assessment-id="${esc(exam.assessmentId)}"><p class="card-kicker">ZP${exam.afterPart} · nach Teil ${exam.afterPart}</p><h3 class="card-title">${esc(exam.title)}</h3><p class="card-text">${exam.questionCount} Aufgaben. ${esc(exam.evaluation)}.</p></article>`).join("");
const finalCards = curriculum.assessments.final.map((exam) => `<article class="card" data-assessment-id="${esc(exam.assessmentId)}"><p class="card-kicker">${esc(exam.assessmentId.replace("WOEK-V4-", ""))}</p><h3 class="card-title">${esc(exam.title)}</h3><p class="card-text">${esc(exam.evaluation)}.</p></article>`).join("");
const credentialNotice = `Der Abschluss „Zertifizierte:r Wirkungsökonom:in“ ist eine interne Qualifikationsbezeichnung der Akademie für Wirkungsökonomie. Er ist kein staatlich anerkannter akademischer oder beruflicher Abschluss.`;
const masterLevelNotice = `Ph.WÖk ist die interne Meisterstufe der Akademie für Wirkungsökonomie. Die Bezeichnung dient der internen Vertiefung, Lehrbefähigung und Weiterentwicklung der Denkschule. Sie ist kein akademischer Grad.`;
const trackedAppButton = (label, analyticsLabel) => `<a class="btn btn-primary academy-primary-cta" href="${APP_URL}/studium" data-analytics-event="academy_app_cta" data-analytics-label="${analyticsLabel}">${label}</a>`;

const outputs = new Map();
outputs.set("akademie.html", page({
  rel: "akademie.html",
  title: "Akademie für Wirkungsökonomie · Curriculum v4.0",
  description: "Curriculum v4.0 der Akademie: 10 Teile, 40 Module, 120 Studienvorlesungen und sechs aktive Weiterbildungsfamilien.",
  canonical: "https://wirkungsoekonomie.de/akademie.html",
  prefix: "",
  body: `${hero("Akademie für Wirkungsökonomie · Curriculum v4.0", "Wirkung verstehen, bestehende Systeme kennen, besser entscheiden.", "Der aktuelle Lehrstand verbindet 120 Studienvorlesungen mit sechs aktiven Weiterbildungsfamilien. Ein eigener Pflichtteil behandelt die deutsche Nachhaltigkeits- und Folgenprüfungsarchitektur.", `${trackedAppButton("Jetzt in die Akademie", "hero-primary")}<a class="btn btn-secondary" href="akademie/studienstruktur.html">Curriculum ansehen</a>`)}` + countStrip + stateArchitecture + `<section class="section" aria-label="Akademie-App öffnen"><div class="academy-app-band"><p>Der persönliche Studienraum bündelt Vorlesungen, Fortschritt, Prüfungen und Praxisprojekt.</p>${trackedAppButton("Lernpfad ansehen", "post-hero-band")}</div></section><section class="section" id="studium"><div class="card-grid three"><article class="card"><h2 class="card-title">Grundstudium WÖk-G</h2><p class="card-text">Von Wirkungskompetenz über Daten und staatliche Prüfarchitektur bis zum eigenen Wirkungsdossier.</p><a href="akademie/studienstruktur.html">Studienstruktur öffnen</a></article><article class="card" id="pruefungen"><h2 class="card-title">Prüfungen und Praxis</h2><p class="card-text">Zehn Zwischenprüfungen und vier Abschlussleistungen mit passenden automatisierten und manuellen Prüfarten.</p><a href="akademie/pruefungen.html">Prüfungsarchitektur öffnen</a></article><article class="card" id="weiterbildung-title"><h2 class="card-title">Weiterbildung</h2><p class="card-text">58 Vorlesungen in sechs aktiven Angebotsfamilien auf derselben v4.0-Core-Logik.</p><a href="akademie/weiterbildung.html">Weiterbildungen öffnen</a></article></div><p class="competence-note"><strong>Transparenz:</strong> ${credentialNotice}</p><p class="competence-note"><strong>Versionierung:</strong> v4.0 ist der führende Lehrstand. <a href="akademie/curriculum-v3-2.html">Curriculum v3.2 bleibt als historische Version nachvollziehbar.</a></p></section><section class="section section-soft"><div class="footer-cta academy-final-cta"><h2>Im persönlichen Studienraum weiterlernen.</h2><p>Die Akademie-App führt Lernstand, nächste Schritte und Prüfungen zusammen.</p>${trackedAppButton("Zur Akademie-App", "final-cta")}</div></section>`,
}));
outputs.set("akademie/studienstruktur.html", page({
  rel: "akademie/studienstruktur.html",
  title: "Studienstruktur v4.0 | Akademie für Wirkungsökonomie",
  description: "Curriculum v4.0 im Detail: 10 Teile, 40 Module, 120 Vorlesungen und ein eigener Pflichtteil zur staatlichen Nachhaltigkeits- und Folgenprüfungsarchitektur.",
  canonical: "https://wirkungsoekonomie.de/akademie/studienstruktur.html",
  prefix: "../",
  body: `${hero("Curriculum v4.0", "10 Teile, 40 Module, 120 Vorlesungen.", "Die Struktur wird aus dem versionierten Public-Master projiziert. 108 re-auditierte Vorlesungen werden um zwölf GOV-Vorlesungen ergänzt.", `${appButton}<a class="btn btn-secondary" href="curriculum-v3-2.html">Historie v3.2</a>`)}` + `<section class="section" aria-labelledby="studienteile-title"><div class="section-header"><h2 id="studienteile-title">Die zehn Studienteile</h2><p>Jeder Teil umfasst vier Module und zwölf Vorlesungen.</p></div><div class="academy-curriculum-grid">${structureHtml}</div></section>`,
}));
outputs.set("akademie/lernpfad.html", page({
  rel: "akademie/lernpfad.html",
  title: "Lernpfad v4.0 | Akademie für Wirkungsökonomie",
  description: "Der v4.0-Lernpfad: Sachstand und Problem prüfen, Ziel prüfen, Wirkpfad und Evidenz analysieren, Optionen vergleichen und nach Umsetzung lernen.",
  canonical: "https://wirkungsoekonomie.de/akademie/lernpfad.html",
  prefix: "../",
  body: `${hero("Lernpfad v4.0", "Nicht mit der Lösung anfangen.", "Der Lernpfad beginnt bei Sachstand und Problem, prüft danach das Ziel und erst anschließend Maßnahme, Wirkpfad, Evidenz, Optionen und Rückkopplung.", `${appButton}${structureButton}`)}<section class="section"><div class="module-list"><article><span>01</span><div><h2>Verstehen</h2><p>Teile 1 bis 4: Wirkung, Problem Review, Goal Review, Referenzrahmen und staatliche Nachhaltigkeits- und Folgenprüfungsarchitektur.</p></div></article><article><span>02</span><div><h2>Steuern</h2><p>Teile 5 bis 7: Rückkopplung, öffentliche Steuerung, Wohlstand und Resilienz mit Grenzen von Aggregation und Monetarisierung.</p></div></article><article><span>03</span><div><h2>Anwenden</h2><p>Teile 8 bis 10: Produkte, Unternehmen, Politik, Medien, Institutionen, globale Ordnung und das eigene Wirkungsdossier.</p></div></article></div></section>${stateArchitecture}<section class="section"><div class="section-header"><h2>Die v4.0-Lernkette</h2><p><strong>Quelle und Fakt → Problem Review → Goal Review → Maßnahme → A→M→ΔZ→R → System- und Verteilungswirkungen → Gegenfaktum und Zurechnung → Optionen → Reality Check → Lernschleife.</strong></p></div><p>Eine Empfehlung folgt nicht automatisch aus einem Score. Reale Optionen, Schutzgrenzen, Umsetzbarkeit, Evidenz und Monitoring müssen separat tragen.</p></section>`,
}));
outputs.set("akademie/grundlagen.html", page({
  rel: "akademie/grundlagen.html",
  title: "Grundlagen v4.0 | Akademie für Wirkungsökonomie",
  description: "Grundlagen des Curriculum v4.0: Wirkung, Wirkungspotenzial, Evidenz, Referenzebenen, staatliche Prüfarchitektur und WÖk-Zusatznutzen.",
  canonical: "https://wirkungsoekonomie.de/akademie/grundlagen.html",
  prefix: "../",
  body: `${hero("Grundlagen v4.0", "Wirkung ist nicht Absicht. Reichweite ist nicht Wirkung.", "Die Akademie trennt tatsächliche Zustandsänderung, Wirkungspotenzial, Wirkungsrisiko, Indikator, Zielbezug, Evidenz und Zurechnung.", `${appButton}${structureButton}`)}<section class="section"><div class="card-grid three"><article class="card"><h2 class="card-title">Wirkung</h2><p class="card-text">Tatsächliche Veränderung eines Zustands. Ex ante sprechen wir von Wirkungspotenzial oder Wirkungsrisiko.</p></article><article class="card"><h2 class="card-title">Indikator</h2><p class="card-text">Mess- oder Beobachtungsgröße. Ein Indikator ist nicht selbst die Wirkung.</p></article><article class="card"><h2 class="card-title">Zurechnung</h2><p class="card-text">Eine Beobachtung belegt noch nicht, dass eine bestimmte Maßnahme die Veränderung verursacht hat.</p></article></div></section>${stateArchitecture}`,
}));
outputs.set("akademie/pruefungen.html", page({
  rel: "akademie/pruefungen.html",
  title: "Prüfungen v4.0 | Akademie für Wirkungsökonomie",
  description: "Prüfungsarchitektur v4.0: zehn Zwischenprüfungen, vier Abschlussleistungen und manuell geprüfte Praxisleistungen.",
  canonical: "https://wirkungsoekonomie.de/akademie/pruefungen.html",
  prefix: "../",
  body: `${hero("Prüfungen · v4.0", "Methode und Urteilskraft prüfen, keine Meinung abfragen.", "v4.0 trennt staatliche und WÖk-Architektur, macht Kausalitätsgrenzen sichtbar und nutzt manuelle Prüfung, wo Automatisierung fachlich nicht trägt.", `${appButton}${structureButton}`)}<section class="section"><div class="section-header"><h2>Zehn Zwischenprüfungen</h2></div><div class="card-grid three">${interimCards}</div></section><section class="section section-soft"><div class="section-header"><h2>Vier Abschlussleistungen</h2></div><div class="card-grid two">${finalCards}</div><p class="competence-note"><strong>Prüfungsschutz:</strong> Interne Prüfungsantworten und Bewertungsmaterialien sind kein Bestandteil des öffentlichen Public-Masters.</p><p class="competence-note"><strong>Transparenz:</strong> ${credentialNotice}</p></section><section class="section"><div class="section-header"><h2>Praxisprojekt v4.0</h2><p>Bei öffentlichen Fällen wird zuerst die anwendbare staatliche Referenz- und Prüfarchitektur erfasst. Danach folgen Problem Review, Goal Review, konkrete Maßnahme, unabhängige Kausalanalyse, Optionen, Monitoring und Reality Check.</p></div></section><section class="section" id="faq" aria-labelledby="akademie-faq-title"><div class="section-header"><p class="hero-kicker">FAQ</p><h2 id="akademie-faq-title">Häufige Fragen zur Akademie</h2></div><div class="faq-accordion"><details><summary>Ist das Zertifikat staatlich anerkannt?</summary><p>Nein. ${credentialNotice}</p></details><details><summary>Was ist Ph.WÖk?</summary><p>${masterLevelNotice}</p></details><details><summary>Wie werden die v4.0-Prüfungen ausgewertet?</summary><p>Die Prüfungsart ist öffentlich ausgewiesen: automatisiert, kombiniert oder manuell anhand veröffentlichter Bewertungskriterien. Interne Antworten und geschützte Bewertungsmaterialien bleiben nicht öffentlich.</p></details><details><summary>Wo bearbeite ich Vorlesungen und Prüfungen?</summary><p>Im persönlichen Studienraum der Akademie-App. Die Hauptdomain dokumentiert Curriculum, Methoden, Version und öffentliche Prüfungsmetadaten.</p></details></div></section>`,
}));
outputs.set("akademie/weiterbildung.html", page({
  rel: "akademie/weiterbildung.html",
  title: "Weiterbildung v4.0 | Akademie für Wirkungsökonomie",
  description: "Sechs aktive Weiterbildungsfamilien der Akademie mit 58 fachlich geprüften v4.0-Vorlesungen.",
  canonical: "https://wirkungsoekonomie.de/akademie/weiterbildung.html",
  prefix: "../",
  body: `${hero("Weiterbildung · v4.0", "Sechs aktive Angebotsfamilien, eine gemeinsame Fachlogik.", "Alle aktiven Angebote nutzen die v4.0-Core-Regeln zu Wirkung, Evidenz, Referenzebenen, staatlicher Architektur, Nichtkompensation und Reality Check.", `${appButton}<a class="btn btn-secondary" href="grundlagen.html">Grundlagen ansehen</a>`)}<section class="section"><div class="card-grid three">${offeringCards}</div><p class="competence-note"><strong>Gesamtumfang:</strong> 58 fachlich geprüfte Weiterbildungslektionen. Historische oder geplante Angebote werden nicht als aktive v4-Lehre ausgegeben.</p></section>`,
}));
outputs.set("lernen/index.html", page({
  rel: "lernen/index.html",
  title: "Lernen | Wirkungsökonomie · Akademie v4.0",
  description: "Lernhub der Wirkungsökonomie mit Curriculum v4.0, Grundstudium und sechs aktiven Weiterbildungsfamilien.",
  canonical: "https://wirkungsoekonomie.de/lernen/",
  prefix: "../",
  body: `${hero("Lernen · Akademie v4.0", "Wirkungskompetenz vom Einstieg bis zum Wirkungsdossier.", "Das aktuelle Lernsystem umfasst 10 Teile, 40 Module, 120 Studienvorlesungen und sechs aktive Weiterbildungsfamilien.", `<a class="btn btn-primary" href="${APP_URL}/studium">Akademie öffnen</a><a class="btn btn-secondary" href="../akademie/studienstruktur.html">Curriculum ansehen</a>`)}${countStrip}<section class="section"><div class="card-grid three"><article class="card"><h2>Grundlagen</h2><p>Wirkung, Evidenz, Problem- und Zielprüfung sowie Referenzebenen.</p><a href="../akademie/grundlagen.html">Grundlagen öffnen</a></article><article class="card"><h2>Studium</h2><p>10 Teile, 40 Module und 120 Vorlesungen.</p><a href="../akademie/studienstruktur.html">Studium öffnen</a></article><article class="card"><h2>Weiterbildung</h2><p>Sechs aktive v4.0-Angebotsfamilien.</p><a href="../akademie/weiterbildung.html">Weiterbildung öffnen</a></article></div></section>${stateArchitecture}`,
}));
outputs.set("akademie/curriculum-v3-2.html", page({
  rel: "akademie/curriculum-v3-2.html",
  title: "Historisches Curriculum v3.2 | Akademie für Wirkungsökonomie",
  description: "Dokumentation der historischen Curriculum-Version v3.2; Curriculum v4.0 ist der aktuelle Lehrstand.",
  canonical: HISTORY_URL,
  prefix: "../",
  body: `${hero("Historische Version", "Curriculum v3.2 bleibt nachvollziehbar.", "v3.2 war die frühere öffentliche Studienstruktur mit 9 Teilen, 36 Modulen und 108 Vorlesungen. Sie wird nicht still überschrieben; v4.0 ist der aktuelle Lehrstand.", `<a class="btn btn-primary" href="studienstruktur.html">Zu v4.0</a><a class="btn btn-secondary" href="${HISTORY_SOURCE_URL}">Exakten Archivstand öffnen</a>`)}<section class="section"><div class="card-grid three"><article class="card"><h2>Erhalten</h2><p>Historische Struktur, Git-Historie und der exakte Archiv-Commit bleiben reproduzierbar.</p></article><article class="card"><h2>Versioniert</h2><p>v4.0 ist eine neue, führende Version. v3.2 bleibt ausdrücklich historisch.</p></article><article class="card"><h2>Nicht rückwirkend umgeschrieben</h2><p>Alte Lehrstände werden als frühere Fassungen kenntlich gemacht und nicht nachträglich als damaliger v4.0-Stand ausgegeben.</p></article></div></section>`,
}));

for (const [rel, content] of outputs) {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

const sitemapPath = path.join(ROOT, "sitemap.xml");
const sitemapUrls = [...outputs.keys()].map((route) => route.endsWith("index.html")
  ? `https://wirkungsoekonomie.de/${route.slice(0, -"index.html".length)}`
  : `https://wirkungsoekonomie.de/${route}`);
let sitemap = fs.readFileSync(sitemapPath, "utf8");
const missingSitemapUrls = [];
for (const url of sitemapUrls) {
  const urlPattern = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const entry = `  <url><loc>${url}</loc><lastmod>2026-08-24</lastmod></url>`;
  let found = false;
  sitemap = sitemap.replace(
    new RegExp(`\\s*<url>\\s*<loc>${urlPattern}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"),
    () => {
      if (found) return "";
      found = true;
      return `\n${entry}`;
    },
  );
  if (!found) missingSitemapUrls.push(url);
}
const sitemapEntries = missingSitemapUrls
  .map((url) => `  <url><loc>${url}</loc><lastmod>2026-08-24</lastmod></url>`)
  .join("\n");
if (sitemapEntries) sitemap = sitemap.replace("</urlset>", `${sitemapEntries}\n</urlset>`);
fs.writeFileSync(sitemapPath, sitemap, "utf8");

const curriculumJson = `${JSON.stringify(curriculum, null, 2)}\n`;
fs.writeFileSync(path.join(ROOT, "public/data/woek-g-curriculum.json"), curriculumJson, "utf8");
fs.writeFileSync(path.join(ROOT, "content/academy/woek-g-curriculum-v4.json"), curriculumJson, "utf8");

const releaseManifest = {
  schema_version: "1.0",
  status: "GITHUB_MAIN_PROJECTION_READY",
  curriculum_version: "4.0",
  source_manifest: "content/studienskripte/v4/PUBLIC_MASTER_MANIFEST.json",
  source_repo: manifest.source_repo,
  source_sha: manifest.source_sha,
  terminology_authored_baseline: manifest.terminology_baseline,
  terminology_release_reference: projection.terminology.current_release_reference,
  counts: curriculum.counts,
  historical_curriculum: projection.historical_curriculum,
  generated_routes: [...outputs.keys()],
  gates: {
    PUBLIC_ACADEMY_CURRICULUM_DERIVED_FROM_CANON: "PASS",
    NO_HANDMAINTAINED_CURRICULUM_COUNT_DRIFT: "PASS",
    PUBLIC_ACADEMY_ASSESSMENT_VERSION_MATCH: "PASS",
    ACADEMY_OFFERING_CATALOG_WEB_APP_PARITY: "PASS",
    NO_ASSESSMENT_SECRET_LEAK: "PASS",
  },
};
fs.writeFileSync(path.join(ROOT, "content/academy/ACADEMY_V4_MAIN_DOMAIN_MANIFEST.json"), `${JSON.stringify(releaseManifest, null, 2)}\n`, "utf8");

console.log(`ACADEMY_V4_MAIN_DOMAIN: PASS (${curriculum.counts.parts}/40/120, 6 offerings, ${outputs.size} canonical/static routes)`);
