import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RADAR_ROOT = path.join(ROOT, "wirkungsradar");
const SITE_URL = "https://wirkungsoekonomie.de";
const VERSION = "20260605-debate-compass-template";

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function copy(value) {
  return esc(value).replace(/'/g, "&#039;");
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name === "index.html" ? [full] : [];
  });
}

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function urlFromFile(file) {
  return `/${rel(file).replace(/index\.html$/, "")}`;
}

function relDir(fromFile, toDir) {
  const relative = path.relative(path.dirname(fromFile), toDir).split(path.sep).join("/");
  return relative ? `${relative}/` : "./";
}

function slugFromFile(file) {
  return file.match(/wirkungsradar\/live\/([^/]+)\/index\.html$/)?.[1] || "";
}

function isLiveDebatePage(file, html) {
  const relative = rel(file);
  return /^wirkungsradar\/live\/[^/]+\/index\.html$/.test(relative) && !/<meta\s+http-equiv="refresh"/i.test(html);
}

function firstMatch(source, pattern) {
  const match = String(source || "").match(pattern);
  return match ? stripHtml(match[1]) : "";
}

function titleOf(html, fallback) {
  const h1 = firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return (h1 || title || fallback)
    .replace(/\s*[|–-]\s*(?:Wirkungsradar|Debatten-Kompass)\s*(?:Live|Detail|Narrative)?\s*$/i, "")
    .trim();
}

function allSections(main) {
  return [...String(main || "").matchAll(/<section\b[\s\S]*?<\/section>/gi)].map((match) => match[0]);
}

function sectionWithId(main, ids) {
  for (const id of ids) {
    const section = allSections(main).find((item) => new RegExp(`\\bid=["']${id}["']`, "i").test(item));
    if (section) return section;
  }
  return "";
}

function sectionMatching(main, pattern) {
  return allSections(main).find((item) => pattern.test(item)) || "";
}

function mainParts(html) {
  const start = html.match(/<main\b[^>]*>/i);
  if (!start) return null;
  const startIndex = start.index ?? 0;
  const openEnd = startIndex + start[0].length;
  const closeIndex = html.lastIndexOf("</main>");
  if (closeIndex < 0) return null;
  return {
    before: html.slice(0, startIndex),
    open: start[0],
    content: html.slice(openEnd, closeIndex),
    after: html.slice(closeIndex),
  };
}

function removeSection(main, section) {
  return section ? main.replace(section, "\n") : main;
}

function removeManagedSections(main) {
  let next = main;
  const managedIds = [
    "inhaltsverzeichnis",
    "host-cockpit",
    "was-wird-behauptet",
    "behauptung",
    "relevanz",
    "warum-relevant",
    "verstehen",
    "folgencheck",
    "was-passiert-danach",
    "loesungspfad",
    "wirkungspfad",
    "wirkpfad",
    "host-antworten",
    "live-antworten",
    "antwortformate",
    "reaktion",
    "antwort",
    "kritische-fragen",
    "faktenkern",
    "faktenlage",
    "quellen",
    "warum-belastbar",
    "deep-dive-quellen",
    "quellenstatus",
    "psychologie",
    "psychologischer-wirkungscheck",
    "warum-der-satz-zieht",
    "warum-zieht-das",
    "narrativ-psychologie",
    "warum-der-radar-so-prueft",
    "systemische-wirkungen",
    "was-macht-es-besser",
    "verwandte-inhalte",
    "verwandte-narrative",
    "weiter",
    "debattenkarte",
    "seed-quelle",
  ];
  for (const id of managedIds) {
    next = next.replace(new RegExp(`\\s*<section\\b(?=[^>]*\\bid=["']${id}["'])[\\s\\S]*?<\\/section>\\s*`, "gi"), "\n");
  }
  next = next.replace(/\s*<section\b(?=[^>]*data-debate-toc)[\s\S]*?<\/section>\s*/gi, "\n");
  next = next.replace(/\s*<section\b(?=[^>]*data-community-submission-block)[\s\S]*?<\/section>\s*/gi, "\n");
  next = next.replace(/\s*<nav class="(?:topic-subnav radar-sprint-nav|radar-subnav)"[\s\S]*?<\/nav>\s*/gi, "\n");
  return next;
}

function listItemsFromCard(main, kickerPattern) {
  const card = [...String(main || "").matchAll(/<article\b[\s\S]*?<\/article>/gi)]
    .map((match) => match[0])
    .find((article) => new RegExp(`<p\\b[^>]*class=["'][^"']*(?:card-kicker|v2-badge)[^"']*["'][^>]*>\\s*${kickerPattern}\\s*<\\/p>`, "i").test(article)) || "";
  const items = [...card.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => stripHtml(item[1]));
  if (items.length) return items.filter(Boolean);
  return [...card.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((item) => stripHtml(item[1]))
    .filter((text) => text && !new RegExp(kickerPattern, "i").test(text));
}

function getClaim(html, main, title) {
  return (
    firstMatch(main, /<p class="v2-claim-line">[\s\S]*?<strong>([\s\S]*?)<\/strong>/i) ||
    firstMatch(main, /<p[^>]*>\s*Jemand sagt:\s*<strong>([\s\S]*?)<\/strong>/i) ||
    firstMatch(main, /<p class="card-kicker">Aussage<\/p>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/i) ||
    title ||
    "diese Aussage"
  ).replace(/\s+/g, " ").trim();
}

function answerTexts(section, claim, title, trueItems, missingItems) {
  const answers = [];
  for (const detail of section.matchAll(/<details\b[\s\S]*?<\/details>/gi)) {
    const html = detail[0];
    const label = firstMatch(html, /<span class="radar-answer-time">([\s\S]*?)<\/span>/i);
    const purpose = firstMatch(html, /<span class="radar-answer-label">([\s\S]*?)<\/span>/i) || firstMatch(html, /<strong>([\s\S]*?)<\/strong>/i);
    const text = firstMatch(html, /<p\b[^>]*>([\s\S]*?)<\/p>/i);
    if (text) answers.push({ label, purpose, text });
  }
  const short = answers.find((item) => /10|kurz/i.test(item.label))?.text || answers[0]?.text;
  const medium = answers.find((item) => /30|mittel|einordnung/i.test(item.label))?.text || answers[1]?.text;
  const long = answers.find((item) => /2|minute|lang|vertiefung/i.test(item.label))?.text || answers[2]?.text;
  const core = trueItems[0] || "Der wahre Kern gehört in die Rechnung.";
  const missing = missingItems[0] || "Die Schlussfolgerung ist zu eng.";
  const betterQuestion = firstMatch(section, /Die bessere Frage[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) ||
    firstMatch(section, /<button[^>]*data-copy-text=['"]([^'"]+\?)['"]/i) ||
    "Welche Entscheidung verbessert den Zustand konkret, für wen, mit welchen Nebenfolgen und welcher besseren Alternative?";
  return [
    {
      label: "10 Sekunden",
      purpose: "Kernsatz",
      text: short || `${core} Entscheidend ist nicht der Schlagwort-Satz, sondern die vollständige Wirkungsrechnung.`,
    },
    {
      label: "30 Sekunden",
      purpose: "Einordnung",
      text: medium || `Der wahre Kern ist: ${core} Der Denkfehler ist: ${missing} Die bessere Frage lautet: ${betterQuestion}`,
    },
    {
      label: "2 Minuten",
      purpose: "Vertiefung",
      text: long || `Bei „${claim || title}“ sollte man zuerst den wahren Kern anerkennen und dann die Bilanzgrenze öffnen. ${core} Gleichzeitig fehlt: ${missing} Wirkungsökonomisch zählt deshalb nicht nur, ob ein einzelner Teil stimmt, sondern welcher Zustand durch die Schlussfolgerung wahrscheinlicher wird: für Mensch, Planet und Demokratie. Die saubere Reaktion ist, Kosten, Nutzen, Alternativen, Zeitpfad, Zuständigkeiten und Unterlassungskosten gemeinsam zu prüfen. Die bessere Frage lautet: ${betterQuestion}`,
    },
  ];
}

function toc() {
  const items = [
    ["Behauptung", "#behauptung"],
    ["Relevanz", "#relevanz"],
    ["Folgencheck", "#folgencheck"],
    ["Wirkpfad", "#wirkpfad"],
    ["Antwort", "#reaktion"],
    ["Kritische Fragen", "#kritische-fragen"],
    ["Faktenlage", "#faktenlage"],
    ["Quellen", "#quellen"],
  ];
  return `<section class="section debate-toc-section" id="inhaltsverzeichnis" data-debate-toc data-search-exclude><div><article class="card debate-toc-card"><p class="card-kicker">Inhaltsverzeichnis</p><nav class="dossier-tab-nav v3-radar-nav" aria-label="Debattenkarte Seitenbereiche">${items.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</nav></article></div></section>`;
}

function claimBlock(claim) {
  return `<section class="section v2-host-cockpit debate-claim-section" id="host-cockpit" data-v2-host-cockpit><span id="behauptung" class="sr-only">Behauptung</span><div class="v2-cockpit-shell"><div class="v2-cockpit-head"><p class="hero-kicker">Die Frage / Behauptung</p><h2>Was wird behauptet?</h2><p class="v2-claim-line">Jemand sagt: <strong>${esc(claim)}</strong></p></div></div></section>`;
}

function relevanceBlock({ claim, title, trueItems, missingItems, isSocial }) {
  const trueText = trueItems[0] || "Es kann einen wahren oder berechtigten Punkt geben.";
  const missingText = missingItems[0] || "Die entscheidende Bilanzgrenze, Alternative oder Folgewirkung fehlt.";
  const guard = isSocial
    ? "<p><strong>Rote Linie:</strong> Menschen sind keine Kostenstelle. Geprüft werden Regeln, Verfahren, Ressourcen, Zuständigkeiten und Wirkungen.</p>"
    : "";
  return `<section class="section debate-relevance-block v3-layer" id="relevanz" data-debate-relevance><div><div class="section-header"><p class="hero-kicker">Warum relevant?</p><h2>Warum diese Aussage Wirkung entfaltet.</h2><p>Die Aussage „${esc(claim || title)}“ ist nicht nur eine Meinung. Sie verändert, welche Bilanzgrenze in der Debatte gilt und welche Entscheidung plausibel wirkt.</p></div><article class="card"><p><strong>Was anerkannt werden darf:</strong> ${esc(trueText)}</p><p><strong>Was dadurch nicht verschwinden darf:</strong> ${esc(missingText)}</p>${guard}<p><strong>Wirkungsökonomisch relevant:</strong> Entscheidend ist, ob der Satz bessere Entscheidungen wahrscheinlicher macht oder Wirkung, Verantwortung und Nebenfolgen verdeckt.</p></article></div></section>`;
}

function consequenceBlock(section, claim, trueItems, missingItems) {
  if (section && /Wirkung 1\. Ordnung/i.test(section) && /Mensch/i.test(section) && /Demokratie/i.test(section)) {
    return section
      .replace(/<section\b[^>]*>/i, '<section class="section section-soft v3-layer v3-layer-consequences debate-consequence-main" id="folgencheck" data-v3-consequence-check>')
      .replace(/<h2>[^<]*<\/h2>/i, "<h2>Folgencheck: Was dieses Narrativ bewirkt</h2>");
  }
  const trueText = trueItems[0] || "Ein berechtigter Punkt wird sichtbar.";
  const missingText = missingItems[0] || "Die Bilanzgrenze wird verengt.";
  const rows = [
    ["Wirkung 1. Ordnung", "Wahrnehmung", `Die Debatte springt auf den Satz „${claim}“ und sortiert das Thema durch ein schnelles Bild.`],
    ["Wirkung 2. Ordnung", "Entscheidung", `${missingText} Dadurch wirken schlechtere oder zu enge Entscheidungen plausibler.`],
    ["Wirkung 3. Ordnung", "Systempfad", "Wenn der Frame gewinnt, werden Alternativen, Unterlassungskosten und Rückkopplungen dauerhaft schlechter sichtbar."],
  ];
  const mpd = [
    ["Mensch", "Menschen, Alltag, Arbeit, Teilhabe, Sicherheit oder Würde dürfen nicht auf den Frame reduziert werden."],
    ["Planet", "Ökologische Folgen, Ressourcen, Infrastruktur und Langfristwirkung müssen mitgezählt werden, wenn sie betroffen sind."],
    ["Demokratie", "Demokratische Entscheidung braucht überprüfbare Zuständigkeit, Quellen, Kritikfähigkeit und faire Sprache."],
  ];
  return `<section class="section section-soft v3-layer v3-layer-consequences debate-consequence-main" id="folgencheck" data-v3-consequence-check><div><div class="section-header"><p class="hero-kicker">Folgencheck</p><h2>Was dieses Narrativ bewirkt.</h2><p>Nicht nur prüfen, ob ein Teil stimmt. Prüfen, was wahrscheinlicher wird, wenn Menschen dem Satz folgen.</p></div><div class="card-grid three v3-consequence-orders">${rows.map(([badge, title, text]) => `<article class="card v3-order-card"><p class="v2-badge">${esc(badge)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p></article>`).join("")}</div><div class="card v3-mpd-risk-card"><p class="card-kicker">Risiken für Mensch, Planet und Demokratie</p><div class="v3-mpd-risk-grid">${mpd.map(([label, text]) => `<div><strong>${esc(label)}</strong><span>${esc(text)}</span></div>`).join("")}</div></div><div class="card-grid two"><article class="card v3-check-column"><p class="card-kicker">Rote Linien</p><p>${esc(trueText)} Das rechtfertigt keine Abwertung, keine falsche Kausalität und keine verkürzte Gesamtrechnung.</p></article><article class="card v3-check-column"><p class="card-kicker">WÖk-Einordnung</p><p>Wirkungspotenzial wird erst zur Wirkung, wenn Wahrnehmung, Entscheidung und Verhalten tatsächlich verschoben werden. Genau diese Verschiebung wird hier geprüft.</p></article></div></div></section>`;
}

function extractStepTexts(section) {
  return [...String(section || "").matchAll(/<article\b[^>]*class="[^"]*impact-path-step[^"]*"[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/article>/gi)]
    .map((match) => stripHtml(match[2]))
    .filter(Boolean);
}

function impactPathBlock(section, claim, answers, trueItems, missingItems) {
  const existing = extractStepTexts(section);
  const rows = [
    ["Auslöser", claim],
    ["Wirkungspotenzial", existing[1] || trueItems[0] || "Der Satz enthält einen wahren Kern und ein Deutungspotenzial."],
    ["Wirkmechanismus", existing[2] || missingItems[0] || "Der Frame verengt Bilanzgrenze, Zeitpfad, Verantwortung oder Alternative."],
    ["Wirkung", existing[3] || "Wahrnehmung und Anschlussentscheidungen verschieben sich in Richtung der verkürzten Deutung."],
    ["Wirkungsbewertung", "Bewertet wird nach Mensch, Planet und Demokratie: Wer gewinnt, wer verliert, was wird unsichtbar?"],
    ["Netto-Wirkung", "Positiv ist der Pfad nur, wenn der bessere Zustand die Nebenfolgen und Unterlassungskosten überwiegt."],
    ["Wirkungslenkung", answers[2]?.text || answers[1]?.text || "Die Debatte wird auf vollständige Bilanzgrenze, Quellen und bessere Lösung zurückgeführt."],
  ];
  const leverCards = section.match(/<div class="card-grid three">[\s\S]*?<\/div><article class="card">/i)
    ? section.match(/<div class="card-grid three">[\s\S]*?<\/div>/i)?.[0] || ""
    : "";
  return `<section class="section v3-layer v3-layer-solution debate-impact-path-block" id="loesungspfad" data-v3-solution-path><span id="wirkpfad" class="sr-only">Wirkpfad</span><div><div class="section-header"><p class="hero-kicker">Wirkpfad</p><h2>Vom Satz zur Zustandsveränderung.</h2><p>Der Wirkpfad zeigt die WÖk-Logik: Auslöser, Wirkungspotenzial, Wirkmechanismus, Wirkung, Bewertung, Netto-Wirkung und Lenkung.</p></div><div class="impact-path-stepper">${rows.map(([label, text]) => `<article class="impact-path-step"><p class="v2-badge">${esc(label)}</p><p>${esc(text)}</p></article>`).join("")}</div>${leverCards}</div></section>`;
}

function responseBlock(answers) {
  return `<section class="section section-soft v3-layer v3-layer-answer debate-immediate-answer" id="host-antworten" data-debate-immediate-answer><span id="reaktion" class="sr-only">Reaktionshilfe</span><div><div class="section-header"><p class="hero-kicker">Reaktionshilfe</p><h2>So antwortest du.</h2><p>10 Sekunden, 30 Sekunden oder 2 Minuten - ohne den Frame zu übernehmen.</p><p><a class="btn btn-secondary" href="#folgencheck">Mehr verstehen</a></p></div><div class="radar-answer-accordion host-answer-tabs">${answers.map((item, index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(item.label)}</span><span class="radar-answer-label">${esc(item.purpose)}</span></summary><p>${esc(item.text)}</p><button class="copy-chip" type="button" data-copy-text='${copy(item.text)}'>Antwort kopieren</button></details>`).join("")}</div></div></section>`;
}

function criticalQuestionsBlock(section, claim) {
  if (section && /Was berechtigt kritisch gefragt werden darf/i.test(section)) {
    return section.replace(/<section\b[^>]*>/i, '<section class="section v3-layer debate-critical-questions" id="kritische-fragen" data-debate-critical-questions>');
  }
  const questions = [
    `Welche Quelle belegt die Aussage „${claim}“ konkret - und welche Grenze hat diese Quelle?`,
    "Welche Kosten, Nutzen, Alternativen, Zeiträume und Unterlassungskosten werden ausgeblendet?",
    "Wer ist betroffen, wer profitiert, und welche Nebenfolgen entstehen für Mensch, Planet und Demokratie?",
    "Welche bessere Entscheidung verbessert den Zustand messbar statt nur Empörung, Angst oder Schuld zu erzeugen?",
  ];
  return `<section class="section v3-layer debate-critical-questions" id="kritische-fragen" data-debate-critical-questions><div><div class="section-header"><p class="hero-kicker">Kritische Fragen</p><h2>Was berechtigt kritisch gefragt werden darf.</h2></div><div class="card-grid two">${questions.map((item) => `<article class="card"><p class="card-text">${esc(item)}</p></article>`).join("")}</div></div></section>`;
}

function factsBlock(section, trueItems, missingItems) {
  if (section && /Beweist:/i.test(section)) {
    return section
      .replace(/<section\b[^>]*>/i, '<section class="section v3-layer v3-layer-facts debate-evidence-block" id="faktenlage" data-v3-facts-layer>')
      .replace(/<h2>[^<]*<\/h2>/i, "<h2>Faktenlage: Was ist belegt - und was folgt daraus nicht?</h2>");
  }
  const facts = [
    ["Prüfbarer Kern", trueItems[0] || "Ein wahrer oder berechtigter Punkt gehört in die Rechnung."],
    ["Fehlende Bilanzgrenze", missingItems[0] || "Kosten, Nutzen, Zeitpfad, Alternative oder Nebenwirkung fehlen."],
    ["Grenze der Schlussfolgerung", "Ein einzelner richtiger Teil beweist nicht die verkürzte Gesamtdeutung."],
  ];
  return `<section class="section v3-layer v3-layer-facts debate-evidence-block" id="faktenlage" data-v3-facts-layer><div><div class="section-header"><p class="hero-kicker">Faktenlage</p><h2>Was ist belegt - und was folgt daraus nicht?</h2><p>Erst die verständliche Einordnung. Danach die Quellen.</p></div><div class="card-grid three">${facts.map(([title, text]) => `<article class="card v3-fact-card"><p class="v2-badge">Prüfpunkt</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><p class="card-text"><strong>Beweist:</strong> Dieser Punkt gehört in die Wirkungsrechnung.</p><p class="card-text"><strong>Beweist nicht:</strong> Er ersetzt keine vollständige Folgenprüfung.</p></article>`).join("")}</div></div></section>`;
}

function sourceType(url, label) {
  const text = `${url} ${label}`.toLowerCase();
  if (/(bund|bmz|kfw|destatis|umweltbundesamt|bundesagentur|gesetze-im-internet|europa\.eu|oecd|un\.org|ipcc|iea|iab\.de|svr-migration)/.test(text)) {
    return "Primärquelle / öffentliche Fachquelle";
  }
  if (/wikipedia|blog|youtube|medium|substack/.test(text)) return "Sekundärquelle";
  return "Sekundärquelle / Einordnung";
}

function cleanGermanVisibleText(value) {
  return String(value || "")
    .replace(/\bFuer\b/g, "Für")
    .replace(/\bfuer\b/g, "für")
    .replace(/\bMobilitaet\b/g, "Mobilität")
    .replace(/\bmobilitaet\b/g, "Mobilität")
    .replace(/\bOeffentlichkeit\b/g, "Öffentlichkeit")
    .replace(/\boeffentlichkeit\b/g, "Öffentlichkeit")
    .replace(/\bOekonomie\b/g, "Ökonomie")
    .replace(/\boekonomie\b/g, "Ökonomie")
    .replace(/\bCO2\b/g, "CO₂");
}

function sourceDisplayLabel(href, label) {
  const rawLabel = cleanGermanVisibleText(String(label || "").trim());
  if (rawLabel && !/^https?:\/\//i.test(rawLabel)) return rawLabel;
  try {
    const url = new URL(href);
    const pathText = url.pathname.toLowerCase();
    if (url.hostname.includes("bmz.de") && pathText.includes("nachhaltige-mobilitaet-in-lima")) return "BMZ: Nachhaltige Mobilität in Lima";
    if (url.hostname.includes("bmz.de") && pathText.includes("transparenzportal")) return "BMZ: Transparenzportal";
    if (url.hostname.includes("kfw.de") && pathText.includes("entwicklungszusammenarbeit")) return "KfW: Entwicklungszusammenarbeit";
    if (url.hostname.includes("kfw-entwicklungsbank.de") && pathText.includes("sektorprogramm-nama-fuer-nachhaltigen-stadtverkehr")) return "KfW Entwicklungsbank: NAMA-Programm nachhaltiger Stadtverkehr";
    if (url.hostname.includes("kfw-entwicklungsbank.de") && pathText.includes("aufbau-eines-fahrradwegnetzes")) return "KfW Entwicklungsbank: Fahrradwegnetz Lima";
    if (url.hostname.includes("tagesschau.de") && pathText.includes("radwege")) return "Tagesschau Faktenfinder: Radwege in Peru";
    const host = url.hostname.replace(/^www\./, "");
    const sourceName = host.includes("bmz.de")
      ? "BMZ"
      : host.includes("kfw-entwicklungsbank.de")
        ? "KfW Entwicklungsbank"
        : host.includes("kfw.de")
          ? "KfW"
          : host.includes("tagesschau.de")
            ? "Tagesschau Faktenfinder"
            : host.includes("bundestag.de")
              ? "Deutscher Bundestag"
              : host.includes("bundesregierung.de")
                ? "Bundesregierung"
                : host.includes("destatis.de")
                  ? "Destatis"
                  : host;
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments.at(-1)?.replace(/\.(?:html?|php|aspx?)$/i, "") || "";
    const title = cleanGermanVisibleText(decodeURIComponent(last)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/\b(Bmz|Kfw|Nama|Co₂)\b/g, (word) => word.toUpperCase())
      .replace(/\b(In|Im|Am|Für|Und|Oder|Der|Die|Das|Den|Dem|Des|Eines)\b/g, (word) => word.toLowerCase())
      .replace(/\s+\d+$/g, "")
      .trim());
    return title ? `${sourceName}: ${title}` : sourceName;
  } catch {
    return "Quelle";
  }
}

function sourceProofText(href, label, extractedProof) {
  const proof = cleanGermanVisibleText(String(extractedProof || "").replace(/^Belegt:\s*/i, "").trim());
  if (proof && !/^https?:\/\//i.test(proof) && !/Belegt einen Teil der Faktenlage/i.test(proof)) return proof;
  const text = `${href} ${label}`.toLowerCase();
  if (/bmz\.de/.test(text) && /nachhaltige-mobilitaet-in-lima/.test(text)) {
    return "Projektziele, verkehrliche Einordnung, Klimaschutzbezug und BMZ-Rahmen der Maßnahme in Lima.";
  }
  if (/bmz\.de/.test(text) && /transparenzportal/.test(text)) {
    return "Transparenzrahmen, Haushaltsbezug und öffentliche Nachvollziehbarkeit der Entwicklungszusammenarbeit.";
  }
  if (/kfw\.de/.test(text) && /entwicklungszusammenarbeit/.test(text)) {
    return "Rolle der KfW Entwicklungsbank, Finanzierungsinstrumente und Abgrenzung von Kredit, Zuschuss und Durchführung.";
  }
  if (/kfw-entwicklungsbank\.de/.test(text) && /fahrradwegnetzes|nachhaltigen-stadtverkehr|projektdatenbank/.test(text)) {
    return "Projektstruktur, Umsetzungsrahmen, Finanzierungsdaten und Rückzahlungs- beziehungsweise Förderlogik des Vorhabens.";
  }
  if (/tagesschau\.de/.test(text) && /faktenfinder/.test(text)) {
    return "Einordnung verbreiteter Fehlbehauptungen und Kontext zur öffentlichen Debatte.";
  }
  if (/(bund|bmz|kfw|destatis|umweltbundesamt|bundesagentur|gesetze-im-internet|europa\.eu|oecd|un\.org|ipcc|iea|iab\.de|svr-migration)/.test(text)) {
    return "Amtliche Daten, rechtlichen Rahmen oder fachliche Einordnung für die Faktenlage.";
  }
  return "Einordnung, Kontext oder ergänzende Nachvollziehbarkeit für die Faktenlage.";
}

function sourceCards(section) {
  const links = [...String(section || "").matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => {
      const href = match[1];
      const body = match[2];
      const label = firstMatch(body, /<strong>([\s\S]*?)<\/strong>/i) || stripHtml(body).replace(/Quelle öffnen/i, "").trim();
      const proof = firstMatch(body, /Belegt:\s*([\s\S]*?)(?:<\/span>|Grenze:|$)/i) ||
        firstMatch(body, /<p[^>]*>([\s\S]*?)<\/p>/i) ||
        "Belegt einen Teil der Faktenlage; genaue Bilanzgrenze prüfen.";
      const displayLabel = sourceDisplayLabel(href, label || href);
      return { href, label: displayLabel, proof: sourceProofText(href, displayLabel, proof) };
    })
    .filter((item, index, array) => item.label && array.findIndex((other) => other.href === item.href) === index)
    .slice(0, 8);
  if (!links.length) {
    return `<article class="card source-proof-card"><p class="v2-badge">Quellenstatus</p><h3 class="card-title">Quellenprüfung redaktionell nachführen</h3><p class="card-text"><strong>Was belegt sie?</strong> Für diese Karte ist im aktuellen Bestand noch keine belastbare externe Quellenkette hinterlegt.</p><p class="card-text"><strong>Typ:</strong> offener Prüfpunkt</p></article>`;
  }
  return links.map((source) => `<article class="card source-proof-card"><p class="v2-badge">${esc(sourceType(source.href, source.label))}</p><h3 class="card-title">${esc(source.label)}</h3><p class="card-text"><strong>Was belegt sie?</strong> ${esc(source.proof.replace(/^Belegt:\s*/i, ""))}</p><p><a class="text-link" href="${esc(source.href)}">Quelle öffnen</a></p></article>`).join("");
}

function sourcesBlock(section) {
  const cards = sourceCards(section);
  return `<section class="section v3-layer v2-trust-block debate-source-block" id="quellen"><span id="quellen-und-vertiefung" class="sr-only">Quellen und Vertiefung</span><div class="card"><p class="hero-kicker">Quellen &amp; Vertiefung</p><h2 class="card-title">Welche Quelle welchen Fakt belegt.</h2><p class="card-text">Quellen dienen der Nachvollziehbarkeit. Sie stehen nach Folgencheck, Wirkpfad, Antwortblock und Faktenlage.</p><div class="source-proof-grid">${cards}</div></div></section>`;
}

function psychologyBlock(section) {
  if (!section) return "";
  const articles = [...section.matchAll(/<article\b[^>]*class="[^"]*\bcard\b[^"]*"[^>]*>[\s\S]*?<\/article>/gi)].slice(0, 3).map((match) => match[0]).join("");
  const body = articles || `<article class="card debate-psychology-item"><p class="v2-badge">Frame-Effekt</p><h3 class="card-title">Ein Bild entscheidet vor der Prüfung.</h3><p class="card-text"><strong>Wie er hier wirkt:</strong> Der Satz setzt ein schnelles Bild.</p><p class="card-text"><strong>Wie du ihn entschärfst:</strong> Wahren Kern anerkennen und auf den Wirkpfad zurückführen.</p></article>`;
  return `<section class="section v3-layer debate-psychology-secondary" id="warum-der-satz-zieht" data-debate-psychology-secondary><span id="warum-zieht-das" class="sr-only">Warum zieht dieses Narrativ?</span><div><details class="debate-psychology-accordion"><summary><span>Warum zieht dieses Narrativ?</span><span>optional</span></summary><p class="card-text">Dieser Teil ist Vertiefung. Entscheidend bleibt: Behauptung, Folgencheck, Wirkpfad, Antwort, Faktenlage.</p><div class="debate-psychology-list">${body}</div></details></div></section>`;
}

function relatedBlock(section) {
  if (!section) return "";
  return section
    .replace(/<section\b[^>]*>/i, '<section class="section v3-layer radar-related-narratives" id="verwandte-inhalte">')
    .replace(/id="verwandte-narrative"/i, 'id="verwandte-inhalte"');
}

function communityBlock(file) {
  const formHref = "https://akademie.wirkungsoekonomie.de/narrativ-einreichen/";
  const processHref = relDir(file, path.join(ROOT, "wirkungsradar/pruefprozess"));
  const methodHref = relDir(file, path.join(ROOT, "wirkungsradar/methode"));
  const compassHref = relDir(file, path.join(ROOT, "wirkungsradar"));
  return `<section class="section community-submission-section community-submission-section--compact" data-community-submission-block data-community-submission-variant="compact" data-search-exclude>
  <div>
    <article class="card community-submission-block">
      <div class="community-submission-copy">
        <p class="card-kicker">Fehlt ein Narrativ?</p>
        <h2>Hast du eine Aussage gesehen, die geprüft werden sollte?</h2>
        <p>Wenn eine Aussage Wirkung entfaltet, prüfen wir Faktenkern, Wirkpfad, Verbreitung, Schaden und Aufklärungsnutzen. Nichts wird automatisch veröffentlicht.</p>
        <ul class="community-submission-rules">
          <li>Aussagen haben Wirkungspotenzial, aber sind nicht automatisch eingetretene Wirkung.</li>
          <li>Geprüft wird Faktenkern, Wirkpfad, Verbreitung, Schaden und Aufklärungsnutzen.</li>
          <li>Bewertet wird nach Mensch, Planet und Demokratie, ohne problematische Frames unnötig zu verstärken.</li>
        </ul>
      </div>
      <div class="community-submission-actions">
        <a class="btn btn-primary" href="${formHref}">Narrativ einreichen</a>
        <a class="btn btn-secondary" href="${esc(processHref)}">Prüfprozess verstehen</a>
        <a class="text-link" href="${esc(methodHref)}">Methode ansehen</a>
        <a class="text-link" href="${esc(compassHref)}">Debatten-Kompass öffnen</a>
      </div>
    </article>
  </div>
</section>`;
}

function tagsFromHtml(html) {
  const tags = new Set();
  for (const match of html.matchAll(/<span[^>]*class="[^"]*(?:chip|badge)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi)) {
    const text = stripHtml(match[1]);
    if (text && !/^(Antwort öffnen|Seite öffnen|Mehr anzeigen)$/i.test(text)) tags.add(text);
  }
  return [...tags].slice(0, 12);
}

function canonicalTarget(html, file) {
  const link = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  return link || `${SITE_URL}${urlFromFile(file)}`;
}

function cleanTitleText(value) {
  return String(value ?? "")
    .replace(/\bWirkungsradar-Methode\b/gi, "Debatten-Kompass-Methode")
    .replace(/^Wirkungsradar\s+/i, "Debatten-Kompass ")
    .replace(/\s*[|–-]\s*Wirkungsradar\s*(?:Live|Detail|Narrative)?\s*$/i, "")
    .replace(/\s*[|–-]\s*Wirkungsradar\s*$/i, "")
    .replace(/^Wirkungsradar\s*[|–-]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanPublicTitles(html) {
  return html
    .replace(/<title>([\s\S]*?)<\/title>/gi, (full, title) => {
      const cleaned = cleanTitleText(stripHtml(title));
      return `<title>${esc(cleaned || stripHtml(title))}</title>`;
    })
    .replace(/<(h[1-3])([^>]*)>([^<]*(?:Wirkungsradar|Wirkungsradar-Live|Wirkungsradar Narrative)[^<]*)<\/\1>/gi, (full, tag, attrs, text) => {
      const cleaned = cleanTitleText(text);
      return `<${tag}${attrs}>${esc(cleaned || text)}</${tag}>`;
    })
    .replace(/<span([^>]*)>\s*(?:Wirkungsradar|alles|das)\s*<\/span>/gi, "")
    .replace(/>\s+<\/span>/g, "></span>");
}

function shouldHaveCommunity(file, html) {
  const relative = rel(file);
  if (!relative.startsWith("wirkungsradar/")) return false;
  if (/\/embed\//.test(relative)) return false;
  if (/wirkungsradar\/(?:narrativ-einreichen|pruefprozess|mythos-melden)\//.test(relative)) return false;
  if (/<meta\s+http-equiv="refresh"/i.test(html)) return false;
  return (
    relative === "wirkungsradar/index.html" ||
    relative === "wirkungsradar/live/index.html" ||
    relative === "wirkungsradar/debattenkarten/index.html" ||
    relative.startsWith("wirkungsradar/live/") ||
    relative.startsWith("wirkungsradar/detail/") ||
    relative.startsWith("wirkungsradar/narrative/") ||
    relative.startsWith("wirkungsradar/themen/") ||
    relative.startsWith("wirkungsradar/antwort-playbooks/") ||
    relative.startsWith("wirkungsradar/host-playbook/") ||
    relative === "wirkungsradar/methode/index.html"
  );
}

function normalizeGeneralRadarPage(file) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  html = cleanPublicTitles(html)
    .replace(/assets\/css\/style\.css\?v=[^"' <)]+/g, `assets/css/style.css?v=${VERSION}`);
  if (shouldHaveCommunity(file, html) && !/data-community-submission-block/.test(html) && html.includes("</main>")) {
    html = html.replace("</main>", `${communityBlock(file)}\n</main>`);
  }
  if (html !== before) fs.writeFileSync(file, html);
  return html !== before;
}

function DebateCompassPageTemplate(model) {
  return [
    model.hero,
    toc(),
    claimBlock(model.claim),
    relevanceBlock(model),
    consequenceBlock(model.consequenceSection, model.claim, model.trueItems, model.missingItems),
    impactPathBlock(model.impactSection, model.claim, model.answers, model.trueItems, model.missingItems),
    responseBlock(model.answers),
    criticalQuestionsBlock(model.criticalSection, model.claim),
    factsBlock(model.factsSection, model.trueItems, model.missingItems),
    sourcesBlock(model.sourcesSection),
    psychologyBlock(model.psychologySection),
    relatedBlock(model.relatedSection),
    model.communitySection,
  ]
    .filter(Boolean)
    .join("\n");
}

function statusFor(checks) {
  if (!checks.folgencheck || !checks.wirkpfad || !checks.answerBlock || !checks.facts || !checks.sources || !checks.community) return "C";
  if (!checks.hasExternalSources) return "B";
  if (!checks.hasFallbackSources && checks.hasMpd && checks.hasThreeOrders) return "A";
  return "B";
}

function processPage(file) {
  const html = fs.readFileSync(file, "utf8");
  if (!isLiveDebatePage(file, html)) return null;
  const parts = mainParts(html);
  if (!parts) return null;
  const title = titleOf(html, slugFromFile(file));
  const hero = sectionMatching(parts.content, /\bclass=["'][^"']*\bhero\b/i) || "";
  const claim = getClaim(html, parts.content, title);
  const answerSection = sectionWithId(parts.content, ["host-antworten", "live-antworten", "antwortformate", "antwort"]);
  const trueItems = listItemsFromCard(parts.content, "Was stimmt\\?").slice(0, 5);
  const missingItems = listItemsFromCard(parts.content, "Was fehlt\\?").slice(0, 5);
  const answers = answerTexts(answerSection, claim, title, trueItems, missingItems);
  const relatedNarratives = sectionWithId(parts.content, ["verwandte-narrative"]);
  const related = relatedNarratives || sectionWithId(parts.content, ["verwandte-inhalte", "linkhub"]);
  const model = {
    title,
    claim,
    hero,
    trueItems,
    missingItems,
    answers,
    isSocial: /migration|arbeit|buergergeld|bürgergeld|sozial|pflege|rente|auslaender|ausländer|remigration/i.test(urlFromFile(file) + " " + title + " " + claim),
    consequenceSection: sectionWithId(parts.content, ["folgencheck", "was-passiert-danach"]),
    impactSection: sectionWithId(parts.content, ["loesungspfad", "wirkpfad", "wirkungspfad"]),
    criticalSection: sectionWithId(parts.content, ["kritische-fragen"]),
    factsSection: sectionWithId(parts.content, ["faktenlage", "faktenkern"]),
    sourcesSection: sectionWithId(parts.content, ["quellen", "warum-belastbar", "deep-dive-quellen", "quellenstatus"]),
    psychologySection: sectionWithId(parts.content, ["warum-der-satz-zieht", "psychologie", "psychologischer-wirkungscheck", "narrativ-psychologie"]),
    relatedSection: related,
    communitySection: sectionMatching(parts.content, /data-community-submission-block/i) || communityBlock(file),
  };
  if (!model.hero) return null;
  const remaining = removeManagedSections(removeSection(parts.content, hero)).trim();
  const rendered = DebateCompassPageTemplate(model);
  const mainClass = parts.open.includes("debate-compass-template")
    ? parts.open
    : parts.open.replace(/<main\b/i, '<main class="debate-compass-template"').replace(/class="([^"]*)"\s+class="/, 'class="$1 ');
  const normalizedMainOpen = /class=/.test(mainClass)
    ? mainClass.replace(/class="([^"]*)"/, (full, classes) => `class="${classes.includes("debate-compass-template") ? classes : `${classes} debate-compass-template`}"`)
    : '<main id="inhalt" class="debate-compass-template" data-pagefind-body>';
  const after = `${parts.before}${normalizedMainOpen}\n${rendered}\n${remaining ? `\n<!-- Nicht zugeordnete Restinhalte nach Template-Vereinheitlichung ausgeblendet, um Doppelungen zu vermeiden. -->\n` : ""}</main>${parts.after.replace(/^<\/main>/, "")}`;
  const finalHtml = cleanPublicTitles(after)
    .replace(/assets\/css\/style\.css\?v=[^"' <)]+/g, `assets/css/style.css?v=${VERSION}`)
    .replace(/assets\/js\/main\.js\?v=[^"' <)]+/g, "assets/js/main.js?v=20260605-wirkungsraum-stage6")
    .replace(/Debatten-Kompass: So reagierst du/g, "So antwortest du")
    .replace(/Psychologischer Wirkungscheck/g, "Warum zieht dieses Narrativ?")
    .replace(/Wirkungsradar Dossier/g, "Debattenkarte");
  fs.writeFileSync(file, finalHtml);
  const checks = {
    url: urlFromFile(file),
    title,
    slug: slugFromFile(file),
    tags: tagsFromHtml(finalHtml),
    canonicalTarget: canonicalTarget(finalHtml, file).replace(SITE_URL, ""),
    template: "DebateCompassPageTemplate",
    duplicatesRemoved: canonicalTarget(finalHtml, file).replace(SITE_URL, "") === urlFromFile(file),
    folgencheck: /id="folgencheck"/.test(finalHtml) && /Wirkung 1\. Ordnung/.test(finalHtml),
    wirkpfad: /id="loesungspfad"/.test(finalHtml) && /id="wirkpfad"/.test(finalHtml),
    answerBlock: /id="host-antworten"/.test(finalHtml) && /10 Sekunden/.test(finalHtml) && /30 Sekunden/.test(finalHtml) && /2 Minuten/.test(finalHtml),
    facts: /id="faktenlage"/.test(finalHtml) && /Beweist:/.test(finalHtml),
    sources: /id="quellen"/.test(finalHtml) && /Was belegt sie\?/.test(finalHtml),
    anchors: ["behauptung", "relevanz", "folgencheck", "wirkpfad", "reaktion", "faktenlage"].every((id) => finalHtml.includes(`id="${id}"`)),
    community: /data-community-submission-block/.test(finalHtml),
    hasExternalSources: /href="https?:\/\//.test(finalHtml),
    hasFallbackSources: /Quellenprüfung redaktionell nachführen/.test(finalHtml),
    hasMpd: /Mensch/.test(finalHtml) && /Planet/.test(finalHtml) && /Demokratie/.test(finalHtml),
    hasThreeOrders: /Wirkung 1\. Ordnung/.test(finalHtml) && /Wirkung 2\. Ordnung/.test(finalHtml) && /Wirkung 3\. Ordnung/.test(finalHtml),
  };
  return { ...checks, quality: statusFor(checks) };
}

const processed = [];
for (const file of walk(path.join(RADAR_ROOT, "live"))) {
  const item = processPage(file);
  if (item) processed.push(item);
}

let normalizedGeneralPages = 0;
for (const file of walk(RADAR_ROOT)) {
  if (normalizeGeneralRadarPage(file)) normalizedGeneralPages += 1;
}

const allRadar = walk(RADAR_ROOT).map((file) => {
  const html = fs.readFileSync(file, "utf8");
  const url = urlFromFile(file);
  return {
    url,
    title: titleOf(html, path.basename(path.dirname(file))),
    slug: path.basename(path.dirname(file)),
    tags: tagsFromHtml(html),
    category: url.match(/^\/wirkungsradar\/([^/]+)/)?.[1] || "wirkungsradar",
    canonicalTarget: canonicalTarget(html, file).replace(SITE_URL, ""),
  };
});

const canonicalReportFile = path.join(ROOT, "reports/wirkungsradar-canonicalization-report.json");
const canonical = fs.existsSync(canonicalReportFile) ? JSON.parse(fs.readFileSync(canonicalReportFile, "utf8")) : null;
const counts = {
  totalRadarPages: allRadar.length,
  debatePages: processed.length,
  A: processed.filter((item) => item.quality === "A").length,
  B: processed.filter((item) => item.quality === "B").length,
  C: processed.filter((item) => item.quality === "C").length,
  D: processed.filter((item) => item.quality === "D").length,
  canonicalNarratives: canonical?.counts?.canonicalNarratives ?? null,
  duplicates: canonical?.counts?.duplicates ?? null,
  merged: canonical?.counts?.merged ?? null,
  synonyms: canonical?.counts?.synonyms ?? null,
  redirects: canonical?.counts?.redirects ?? null,
};

const report = {
  version: VERSION,
  generatedAt: new Date().toISOString(),
  rule: "Eine Aussage = eine kanonische Seite. Debattenseiten folgen dem DebateCompassPageTemplate.",
  counts,
  normalizedGeneralPages,
  inventory: allRadar,
  pages: processed,
  missing: processed
    .filter((item) => item.quality !== "A")
    .map((item) => ({
      url: item.url,
      quality: item.quality,
      missingSources: !item.hasExternalSources || item.hasFallbackSources,
      missingOrders: !item.hasThreeOrders,
      missingMPD: !item.hasMpd,
      missingCriticalQuestions: false,
      recommendedAction: item.hasFallbackSources ? "Quellenkette redaktionell mit Primärquellen nachziehen." : "Fachliche Einzelprüfung bei nächster redaktioneller Runde.",
    })),
};

fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "reports/debate-compass-template-quality-report.json"), `${JSON.stringify(report, null, 2)}\n`);

const rows = processed
  .map((item) => `| ${item.url} | ${item.quality} | ${item.folgencheck ? "ja" : "nein"} | ${item.wirkpfad ? "ja" : "nein"} | ${item.answerBlock ? "ja" : "nein"} | ${item.facts ? "ja" : "nein"} | ${item.sources ? "ja" : "nein"} | ${item.community ? "ja" : "nein"} |`)
  .join("\n");
fs.writeFileSync(
  path.join(ROOT, "reports/debate-compass-template-quality-report.md"),
  `# Debatten-Kompass Template- und Qualitätsreport\n\n` +
    `Stand: ${report.generatedAt}\n\n` +
    `| Kennzahl | Wert |\n|---|---:|\n` +
    `| Wirkungsradar-Seiten gesamt | ${counts.totalRadarPages} |\n` +
    `| Debattenseiten vereinheitlicht | ${counts.debatePages} |\n` +
    `| Qualitätsstufe A | ${counts.A} |\n` +
    `| Qualitätsstufe B | ${counts.B} |\n` +
    `| Qualitätsstufe C | ${counts.C} |\n` +
    `| Qualitätsstufe D | ${counts.D} |\n` +
    (counts.canonicalNarratives === null
      ? ""
      : `| Kanonische Narrative | ${counts.canonicalNarratives} |\n| Dubletten / Kandidaten | ${counts.duplicates} |\n| Zusammengeführt | ${counts.merged} |\n| Synonyme | ${counts.synonyms} |\n| Redirects | ${counts.redirects} |\n`) +
    `\n## Seitenprüfung\n\n| URL | Qualität | Folgencheck | Wirkpfad | Antwort | Faktenlage | Quellen | Community |\n|---|---|---|---|---|---|---|---|\n${rows}\n`,
);

console.log(`DebateCompassPageTemplate: ${processed.length} Debattenseiten vereinheitlicht (${counts.A} A, ${counts.B} B, ${counts.C} C), ${normalizedGeneralPages} weitere Radar-Seiten normalisiert.`);
