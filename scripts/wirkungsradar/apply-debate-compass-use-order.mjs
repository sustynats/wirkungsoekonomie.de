import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const radarDir = path.join(root, "wirkungsradar");

function files(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...files(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function stripTags(value) {
  return String(value || "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firstMatch(source, pattern) {
  const match = source.match(pattern);
  return match ? stripTags(match[1]) : "";
}

function meaningfulTokens(value) {
  const stop = new Set(["oder", "und", "der", "die", "das", "ist", "sind", "nur", "ein", "eine", "einer", "eines", "mit", "als", "für", "fuer", "von", "zur", "zum"]);
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9äöüß]+/gi, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3 && !stop.has(token));
}

function hasMeaningfulOverlap(left, right) {
  const leftTokens = new Set(meaningfulTokens(left));
  const rightTokens = meaningfulTokens(right);
  if (!leftTokens.size || !rightTokens.length) return true;
  return rightTokens.some((token) => leftTokens.has(token));
}

function compactPsychologySection(section, attrs) {
  const id = firstMatch(attrs, /\bid\s*=\s*["']([^"']+)["']/i) || "warum-der-satz-zieht";
  const articles = [...section.matchAll(/<article\b[^>]*class="[^"]*\bcard\b[^"]*"[^>]*>([\s\S]*?)<\/article>/gi)]
    .slice(0, 3)
    .map((match) => {
      const article = match[1];
      const mechanism = firstMatch(article, /<(?:p|span)\b[^>]*class="[^"]*(?:v2-badge|card-kicker)[^"]*"[^>]*>([\s\S]*?)<\/(?:p|span)>/i) || "Mechanismus";
      const title = firstMatch(article, /<h3\b[^>]*>([\s\S]*?)<\/h3>/i) || mechanism;
      const paragraphs = [...article.matchAll(/<p\b[^>]*class="[^"]*card-text[^"]*"[^>]*>([\s\S]*?)<\/p>/gi)].map((item) => stripTags(item[1]));
      const how = paragraphs.find((text) => !/Rauskommen|Host-Move|Gegenbewegung|entschärfst/i.test(text)) || paragraphs[0] || "Der Mechanismus verengt die Debatte auf ein schnelles Bild.";
      const defuse = paragraphs.find((text) => /Rauskommen|Host-Move|Gegenbewegung|entschärfst/i.test(text)) || "Wahren Kern anerkennen, Bilanzgrenze öffnen und auf den Wirkpfad zurückführen.";
      return `<article class="card debate-psychology-item"><p class="v2-badge">${mechanism}</p><h3 class="card-title">${title}</h3><p class="card-text"><strong>Wie er hier wirkt:</strong> ${how.replace(/^.*?:\s*/, "")}</p><p class="card-text"><strong>Wie du ihn entschärfst:</strong> ${defuse.replace(/^.*?:\s*/, "")}</p></article>`;
    })
    .join("");

  return `<section class="section debate-psychology-secondary" id="${id}" data-debate-psychology-secondary><div><details class="debate-psychology-accordion"><summary><span>Warum zieht dieses Narrativ?</span><span>Ergänzende Mechanik</span></summary><p class="card-text">Viele Narrative wirken nicht, weil sie wahr sind, sondern weil sie Angst, Kontrollverlust oder Zugehörigkeit ansprechen. Wer den Mechanismus erkennt, kann die Debatte auf den Wirkpfad zurückholen.</p><div class="debate-psychology-list">${articles}</div></details></div></section>`;
}

function normalizeText(html) {
  return html
    .replace(/Host-Cockpit(?: · [^<]*)?/g, "Was wurde gesagt?")
    .replace(/Psychologischer Wirkungscheck/g, "Warum zieht dieses Narrativ?")
    .replace(/Welche Effekte hier mitlaufen\.?/g, "Warum das Narrativ verfängt.")
    .replace(/Warum der Satz zieht/g, "Warum zieht dieses Narrativ?")
    .replace(/So wird die Debatte verschoben/g, "So kommt die Debatte zurück zum Wirkpfad")
    .replace(/Viele Wirkungsradar-Aussagen funktionieren nicht nur über Fakten[^<.]*(?:\.[^<.]*)?/g, "Viele Narrative wirken nicht, weil sie wahr sind, sondern weil sie Angst, Kontrollverlust oder Zugehörigkeit ansprechen.")
    .replace(/Wer sie erkennt, muss nicht in den Frame springen\.?/g, "Wer den Mechanismus erkennt, kann die Debatte auf den Wirkpfad zurückholen.");
}

function normalizePsychologyModules(html) {
  return html.replace(/<section\b([^>]*(?:id="psychologie"|id="warum-der-satz-zieht"|id="psychologischer-wirkungscheck"|data-v3-psychology-check)[^>]*)>([\s\S]*?)<\/section>/gi, (section, attrs) => {
    if (!/Psycholog|Warum zieht dieses Narrativ|Warum der Satz zieht|Reaktanz|Verlustaversion|Verfügbarkeitsheuristik|Kontrollbedürfnis|Frame-Effekt/i.test(section)) return section;
    if (/debate-psychology-accordion/.test(section)) return section;
    return compactPsychologySection(section, attrs);
  });
}

function normalizeConsequenceAnchor(html) {
  if (html.includes('id="folgencheck"')) return html;
  let next = html.replace(
    /<section\b([^>]*)id="was-passiert-danach"([^>]*)>/i,
    '<section$1id="folgencheck"$2><span id="was-passiert-danach" class="sr-only">Folgencheck</span>',
  );
  if (next !== html) return next;
  next = html.replace(
    /<section\b((?:(?!<section\b)[\s\S])*?<p class="hero-kicker">Folgen falschen Handelns<\/p>)/i,
    '<section id="folgencheck"$1',
  );
  if (next !== html) return next;
  next = html.replace(
    /<section\b([^>]*)id="folgenkarte"([^>]*)>/i,
    '<section$1id="folgencheck"$2><span id="folgenkarte" class="sr-only">Folgencheck</span>',
  );
  if (next !== html) return next;
  next = html.replace(
    /<section\b([^>]*)id="impact-fan"([^>]*)>/i,
    '<section$1id="folgencheck"$2><span id="impact-fan" class="sr-only">Folgencheck</span>',
  );
  if (next !== html) return next;
  next = html.replace(
    /<section\b([^>]*)id="wirkungspfad"([^>]*)>/i,
    '<section$1id="folgencheck"$2><span id="wirkungspfad" class="sr-only">Wirkpfad</span>',
  );
  if (next !== html) return next;
  next = html.replace(
    /<section\b([^>]*)id="wirkstoffanalyse"([^>]*)>/i,
    '<section$1id="folgencheck"$2><span id="wirkstoffanalyse" class="sr-only">Wirkstoffanalyse</span>',
  );
  if (next !== html) return next;
  for (const fallbackId of ["bilanzgrenze", "zielkonflikt-verstehen", "systemkosten-verstehen", "zeitfenster-technologie", "was-wird-ausgeblendet"]) {
    const pattern = new RegExp(`<section\\b([^>]*)id="${fallbackId}"([^>]*)>`, "i");
    next = html.replace(pattern, `<section$1id="folgencheck"$2><span id="${fallbackId}" class="sr-only">${fallbackId}</span>`);
    if (next !== html) return next;
  }
  return next;
}

function pullPsychologySections(html) {
  const sections = [];
  const pattern = /<section\b[^>]*(?:id="psychologie"|id="warum-der-satz-zieht"|id="psychologischer-wirkungscheck"|data-v3-psychology-check|data-debate-psychology-secondary)[^>]*>[\s\S]*?<\/section>/gi;
  const stripped = html.replace(pattern, (section) => {
    if (/debate-psychology-accordion|Warum zieht dieses Narrativ|Psycholog/i.test(section)) sections.push(section);
    return "";
  });
  return { stripped, sections };
}

function insertAfterSection(html, anchorId, section) {
  const start = html.indexOf(`id="${anchorId}"`);
  if (start < 0) return null;
  const openStart = html.lastIndexOf("<section", start);
  if (openStart < 0) return null;
  const close = html.indexOf("</section>", start);
  if (close < 0) return null;
  const insertAt = close + "</section>".length;
  return `${html.slice(0, insertAt)}\n${section}${html.slice(insertAt)}`;
}

function removeSectionsByIdOrData(html, idsOrData = []) {
  let next = html;
  for (const token of idsOrData) {
    const pattern = new RegExp(`\\n?\\s*<section\\b(?=[^>]*(?:id=["']${token}["']|${token}))[\\s\\S]*?<\\/section>\\s*`, "gi");
    next = next.replace(pattern, "\n");
  }
  return next;
}

function isDebatePage(file) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  return /^wirkungsradar\/(?:live|detail)\//.test(relative) && !/^wirkungsradar\/(?:live|detail)\/index\.html$/.test(relative);
}

function sectionAtId(html, id) {
  const marker = `id="${id}"`;
  const start = html.indexOf(marker);
  if (start < 0) return null;
  const openStart = html.lastIndexOf("<section", start);
  if (openStart < 0) return null;
  const close = html.indexOf("</section>", start);
  if (close < 0) return null;
  const end = close + "</section>".length;
  return {
    id,
    start: openStart,
    end,
    section: html.slice(openStart, end),
  };
}

function firstContentSectionEnd(html) {
  const mainStart = html.indexOf("<main");
  const searchStart = mainStart >= 0 ? mainStart : 0;
  const openStart = html.indexOf("<section", searchStart);
  if (openStart < 0) return -1;
  const close = html.indexOf("</section>", openStart);
  if (close < 0) return -1;
  return close + "</section>".length;
}

function normalizeImmediateAnswerSection(section, oldId) {
  let next = section;
  next = next.replace(/<section\b[^>]*>/i, '<section class="section section-soft debate-immediate-answer" id="host-antworten" data-debate-immediate-answer>');
  if (oldId && oldId !== "host-antworten") {
    next = next.replace(/(<div\b[^>]*>)/i, `$1<span id="${oldId}" class="sr-only">Sofortantwort</span>`);
  }
  next = next.replace(
    /<div class="section-header">[\s\S]*?<\/div>/i,
    '<div class="section-header"><p class="hero-kicker">Sofortantwort</p><h2>10 Sekunden, 30 Sekunden, 2 Minuten.</h2><p>Wenn du gerade in der Debatte bist.</p><p><a class="btn btn-secondary" href="#folgencheck">Mehr verstehen</a></p></div>',
  );
  return next
    .replace(/<span class="radar-answer-time">(?:Kurzantwort|Kommentar)<\/span>/, '<span class="radar-answer-time">10 Sekunden</span>')
    .replace(/<span class="radar-answer-time">(?:Längere Antwort|Live)<\/span>/, '<span class="radar-answer-time">30 Sekunden</span>')
    .replace(/<span class="radar-answer-time">(?:Vertiefung|Panel)<\/span>/, '<span class="radar-answer-time">2 Minuten</span>')
    .replace(/Debatten-Kompass: So reagierst du/g, "Sofortantwort")
    .replace(/Host-Antworten/g, "Sofortantwort")
    .replace(/Live antworten\.?/g, "Sofortantwort")
    .replace(/Antwortformate/g, "Sofortantwort")
    .replace(/So antwortest du/g, "Sofortantwort");
}

function normalizeAnswerNav(html) {
  return html
    .replace(/href="#(?:host-antworten|live-antworten|antwortformate|antwort|reaktion)">(?:Reaktion|Live antworten|Antwortformate|Antwort|Host-Antworten|Sofortantwort)<\/a>/g, 'href="#host-antworten">Sofortantwort</a>')
    .replace(/href="#host-antworten">Reaktion<\/a>/g, 'href="#host-antworten">Sofortantwort</a>');
}

function enforceImmediateAnswerPosition(html, file) {
  if (!isDebatePage(file)) return html;
  const candidates = ["host-antworten", "live-antworten", "antwortformate", "antwort"];
  const found = candidates.map((id) => sectionAtId(html, id)).find(Boolean);
  if (!found) return normalizeAnswerNav(html);

  const stripped = html.slice(0, found.start) + html.slice(found.end);
  const immediate = normalizeImmediateAnswerSection(found.section, found.id);
  const afterClaim = insertAfterSection(stripped, "host-cockpit", immediate);
  if (afterClaim) return normalizeAnswerNav(afterClaim);
  const insertAt = firstContentSectionEnd(stripped);
  if (insertAt < 0) return normalizeAnswerNav(html);
  const reordered = `${stripped.slice(0, insertAt)}\n${immediate}${stripped.slice(insertAt)}`;
  return normalizeAnswerNav(reordered);
}

function normalizeSourceAnchor(html) {
  if (html.includes('id="quellen"')) return html;
  const source = sectionAtId(html, "warum-belastbar") || sectionAtId(html, "warum-vertrauen") || sectionAtId(html, "deep-dive-quellen");
  if (!source) return html;
  const oldId = source.id;
  const normalized = source.section
    .replace(new RegExp(`\\bid=["']${oldId}["']`, "i"), 'id="quellen"')
    .replace(/(<section\b[^>]*id="quellen"[^>]*>)/i, `$1<span id="${oldId}" class="sr-only">Quellen</span>`)
    .replace(/Warum diese Einordnung belastbar ist/g, "Quellen")
    .replace(/Warum du dieser Einordnung vertrauen kannst/g, "Quellen")
    .replace(/Quellen und Grenzen anzeigen/g, "Quellen anzeigen");
  return `${html.slice(0, source.start)}${normalized}${html.slice(source.end)}`;
}

function removeDebateMethodAndDuplicates(html, file) {
  if (!isDebatePage(file)) return html;
  let next = html;
  next = removeSectionsByIdOrData(next, [
    "warum-der-radar-so-prueft",
    "narrativ-psychologie",
    "sprint4-feedback",
    "sprint4-linkhub",
    "feedback",
    "weiterdenken",
    "data-debate-toc",
  ]);
  if (next.includes('id="loesungspfad"')) {
    next = removeSectionsByIdOrData(next, ["systemische-wirkungen", "data-v3-impact-matrix"]);
  }
  if (next.includes('id="quellen"') || next.includes('id="warum-belastbar"')) {
    next = removeSectionsByIdOrData(next, ["sprint4-vertrauen", "data-sprint4-trust"]);
  }
  next = next.replace(/\n?\s*<nav class="dossier-tab-nav v3-radar-nav"[\s\S]*?<\/nav>\s*/g, "\n");
  next = next.replace(/\n?\s*<nav class="(?:topic-subnav radar-sprint-nav|radar-subnav)"[\s\S]*?<\/nav>\s*/g, "\n");
  return next;
}

function normalizeDebateAliasAnchors(html, file) {
  if (!isDebatePage(file)) return html;
  let next = html;
  if (!next.includes('id="host-cockpit"')) {
    next = next.replace(/\bid="was-wird-behauptet"/i, 'id="host-cockpit"');
  }
  if (!next.includes('id="loesungspfad"')) {
    next = next.replace(/\bid="wirkpfad"/i, 'id="loesungspfad"');
    next = next.replace(/\bid="wirkungspfad"/i, 'id="loesungspfad"');
  }
  if (!next.includes('id="faktenlage"')) {
    next = next.replace(/\bid="faktenkern"/i, 'id="faktenlage"');
  }
  return next;
}

function debateToc() {
  const items = [
    ["Frage", "#host-cockpit"],
    ["10 Sekunden", "#host-antworten"],
    ["30 Sekunden", "#host-antworten"],
    ["2 Minuten", "#host-antworten"],
    ["Folgencheck", "#folgencheck"],
    ["Wirkpfad", "#loesungspfad"],
    ["Kritische Fragen", "#kritische-fragen"],
    ["Faktenlage", "#faktenlage"],
    ["Quellen", "#quellen"],
  ];
  return `<section class="section debate-toc-section" id="inhaltsverzeichnis" data-debate-toc data-search-exclude><div><article class="card debate-toc-card"><p class="card-kicker">Inhaltsverzeichnis</p><nav class="dossier-tab-nav v3-radar-nav" aria-label="Debattenkarte Seitenbereiche">${items.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</nav></article></div></section>`;
}

function enforceTocPosition(html, file) {
  if (!isDebatePage(file)) return html;
  let next = html
    .replace(/\n?\s*<section\b[^>]*data-debate-toc[^>]*>[\s\S]*?<\/section>\s*/gi, "\n")
    .replace(/\n?\s*<nav class="dossier-tab-nav v3-radar-nav"[\s\S]*?<\/nav>\s*/g, "\n");
  const heroEnd = firstContentSectionEnd(next);
  if (heroEnd < 0) return html;
  return `${next.slice(0, heroEnd)}\n${debateToc()}\n${next.slice(heroEnd)}`;
}

function criticalQuestionsSection(html) {
  const claim = firstMatch(html, /<p class="v2-claim-line">[\s\S]*?<strong>([\s\S]*?)<\/strong>/i) || firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const label = claim ? ` zu „${claim.replace(/[„“"]/g, "")}“` : "";
  const items = [
    `Welche Zahlen, Quellen und Zeiträume belegen die Behauptung${label} wirklich?`,
    "Welche Kosten, Nutzen, Alternativen und Unterlassungskosten werden ausgeblendet?",
    "Wer wäre konkret betroffen - und wer profitiert davon, wenn dieser Frame dominiert?",
    "Welche Lösung verbessert den Zustand messbar, statt nur Schuld, Angst oder Aufschub zu erzeugen?",
  ];
  return `<section class="section v3-layer debate-critical-questions" id="kritische-fragen" data-debate-critical-questions><div><div class="section-header"><p class="hero-kicker">Kritische Fragen</p><h2>Was berechtigt kritisch gefragt werden darf.</h2></div><div class="card-grid two">${items.map((item) => `<article class="card"><p class="card-text">${item}</p></article>`).join("")}</div></div></section>`;
}

function fallbackFactsSection(html) {
  const claim = firstMatch(html, /<p class="v2-claim-line">[\s\S]*?<strong>([\s\S]*?)<\/strong>/i) || firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || "diese Aussage";
  const trueItems = [...html.matchAll(/<p class="card-kicker">Was stimmt\?<\/p>[\s\S]*?<ul class="clean-list">([\s\S]*?)<\/ul>/gi)]
    .flatMap((match) => [...match[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => stripTags(item[1])))
    .filter(Boolean);
  const missingItems = [...html.matchAll(/<p class="card-kicker">Was fehlt\?<\/p>[\s\S]*?<ul class="clean-list">([\s\S]*?)<\/ul>/gi)]
    .flatMap((match) => [...match[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => stripTags(item[1])))
    .filter(Boolean);
  const facts = [
    ["Prüfbarer Kern", trueItems[0] || `Die Aussage „${claim}“ kann einen wahren oder berechtigten Teil enthalten.`],
    ["Fehlende Bilanzgrenze", missingItems[0] || "Entscheidend ist, welche Kosten, Nutzen, Alternativen, Zeiträume und Nebenfolgen mitgezählt werden."],
    ["Grenze der Schlussfolgerung", "Ein einzelner wahrer Teil beweist nicht die verkürzte Gesamtdeutung des Narrativs."],
  ];
  return `<section class="section v3-layer v3-layer-facts" id="faktenlage" data-v3-facts-layer><div><div class="section-header"><p class="hero-kicker">Faktenlage</p><h2>Was ist konkret prüfbar?</h2><p>Die Faktenlage trennt wahren Kern, fehlende Bilanzgrenze und unzulässige Schlussfolgerung.</p></div><div class="card-grid three">${facts.map(([title, text]) => `<article class="card v3-fact-card"><p class="v2-badge">Prüfpunkt</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><p class="card-text"><strong>Beweist:</strong> Dieser Punkt gehört in die Rechnung.</p><p class="card-text"><strong>Beweist nicht:</strong> Er ersetzt keine vollständige Wirkungsprüfung.</p></article>`).join("")}</div></div></section>`;
}

function fallbackSourcesSection(html) {
  const dataStand = firstMatch(html, /Datenstand:\s*([^<]+)/i) || "2026-06-04";
  const sourceLinks = [...html.matchAll(/<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => [match[1], stripTags(match[2])])
    .filter(([, label]) => label && !/Quelle öffnen|Antwort kopieren|Bild kopieren|Frage kopieren/i.test(label))
    .slice(0, 4);
  const sources = sourceLinks.length
    ? sourceLinks.map(([href, label]) => `<a href="${esc(href)}"><strong>${esc(label)}</strong><span>Belegt einen Teil der Faktenlage; Datenstand und Bilanzgrenze prüfen.</span></a>`).join("")
    : `<article class="card source-proof-card"><p class="card-kicker">Interne WÖk-Quelle</p><h3 class="card-title"><a class="text-link" href="/wirkungsradar/quellen/">Quellenhub des Debatten-Kompasses</a></h3><p class="card-text"><strong>Belegt hier:</strong> Die Seite ist als Debatten-Kompass-Karte eingeordnet und folgt der Quellenlogik des Wirkungsradars.</p><p class="card-text"><strong>Grenze:</strong> Für externe Zahlen, Rechtsfragen oder tagesaktuelle Fakten braucht die jeweilige Karte zusätzlich konkrete Primär- oder Fachquellen.</p><p class="card-text"><strong>Datenstand / Prüfung:</strong> 2026-06-05 · strukturell geprüft</p><p><a class="text-link" href="/wirkungsradar/quellen/">Quelle öffnen</a></p></article>`;
  const body = sourceLinks.length ? `<div class="v2-source-grid">${sources}</div>` : sources;
  return `<section class="section v2-trust-block" id="quellen"><div class="card"><p class="hero-kicker">Quellen</p><h2 class="card-title">Belege, Grenzen und Datenstand.</h2><div class="v2-trust-grid"><div><strong>Datenstand</strong><span>${esc(dataStand)}</span></div><div><strong>Sicher</strong><span>Die Faktenlage muss vor der Bewertung benannt werden.</span></div><div><strong>Prüfpflichtig</strong><span>Quelle, Zeitraum, Zahlenbasis, Gegenposition und Bilanzgrenze.</span></div><div><strong>Grenze</strong><span>Quellen belegen einzelne Prüfpunkte; sie ersetzen nicht die Wirkungsabwägung.</span></div></div>${body}</div></section>`;
}

function ensureFactsAndSources(html, file) {
  if (!isDebatePage(file)) return html;
  let next = html;
  if (!next.includes('id="faktenlage"')) {
    const facts = fallbackFactsSection(next);
    next =
      insertAfterSection(next, "kritische-fragen", facts) ||
      insertAfterSection(next, "loesungspfad", facts) ||
      insertAfterSection(next, "folgencheck", facts) ||
      next;
  }
  if (!next.includes('id="quellen"')) {
    const sources = fallbackSourcesSection(next);
    next =
      insertAfterSection(next, "faktenlage", sources) ||
      insertAfterSection(next, "kritische-fragen", sources) ||
      next;
  }
  return next;
}

function fallbackWirkpfadSection(html) {
  const claim = firstMatch(html, /<p class="v2-claim-line">[\s\S]*?<strong>([\s\S]*?)<\/strong>/i) || firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || "diese Aussage";
  const betterQuestion = firstMatch(html, /Die bessere Frage[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) ||
    "Welche Entscheidung verbessert den Zustand konkret und messbar?";
  const steps = [
    ["Auslöser", `Die Aussage „${claim}“ setzt ein schnelles Bild.`],
    ["Wirkungspotenzial", "Der wahre Kern wird mit einer zu engen Schlussfolgerung verbunden."],
    ["Wirkmechanismus", "Bilanzgrenze, Zeitraum, Alternative oder Verantwortlichkeit verschwinden aus der Debatte."],
    ["Zustandsveränderung", "Die schlechtere Entscheidung wirkt plausibler, obwohl relevante Folgen fehlen."],
    ["Gegensteuerung", betterQuestion],
  ];
  return `<section class="section v3-layer v3-layer-solution" id="loesungspfad" data-v3-solution-path><div><div class="section-header"><p class="hero-kicker">Wirkpfad</p><h2>Vom Satz zurück zur Wirkung.</h2><p>Dieser Wirkpfad zeigt, wie genau diese Behauptung den Blick verschiebt - und wo die Debatte zurückgeführt werden kann.</p></div><div class="impact-path-stepper">${steps.map(([label, text]) => `<article class="impact-path-step"><p class="v2-badge">${esc(label)}</p><p>${esc(text)}</p></article>`).join("")}</div></div></section>`;
}

function ensureWirkpfadPosition(html, file) {
  if (!isDebatePage(file)) return html;
  let next = html;
  if (!next.includes('id="loesungspfad"')) {
    next = insertAfterSection(next, "folgencheck", fallbackWirkpfadSection(next)) || next;
  }
  const wirkpfad = sectionAtId(next, "loesungspfad");
  const folgen = sectionAtId(next, "folgencheck");
  if (wirkpfad && folgen && wirkpfad.start < folgen.start) {
    const without = next.slice(0, wirkpfad.start) + next.slice(wirkpfad.end);
    const freshFolgen = sectionAtId(without, "folgencheck");
    if (freshFolgen) next = `${without.slice(0, freshFolgen.end)}\n${wirkpfad.section}${without.slice(freshFolgen.end)}`;
  } else if (wirkpfad && folgen && wirkpfad.start > folgen.end) {
    const between = next.slice(folgen.end, wirkpfad.start);
    if (/id="(?:kritische-fragen|faktenlage|quellen|warum-der-satz-zieht)"/.test(between)) {
      const without = next.slice(0, wirkpfad.start) + next.slice(wirkpfad.end);
      const freshFolgen = sectionAtId(without, "folgencheck");
      if (freshFolgen) next = `${without.slice(0, freshFolgen.end)}\n${wirkpfad.section}${without.slice(freshFolgen.end)}`;
    }
  }
  return next;
}

function enforceCriticalQuestions(html, file) {
  if (!isDebatePage(file) || html.includes('id="kritische-fragen"')) return html;
  return (
    insertAfterSection(html, "loesungspfad", criticalQuestionsSection(html)) ||
    insertAfterSection(html, "folgencheck", criticalQuestionsSection(html)) ||
    insertAfterSection(html, "host-antworten", criticalQuestionsSection(html)) ||
    html
  );
}

function enforceCriticalQuestionsAfterWirkpfad(html, file) {
  if (!isDebatePage(file)) return html;
  const critical = sectionAtId(html, "kritische-fragen");
  const wirkpfad = sectionAtId(html, "loesungspfad");
  if (!critical || !wirkpfad || critical.start > wirkpfad.end) return html;
  const without = html.slice(0, critical.start) + html.slice(critical.end);
  const freshWirkpfad = sectionAtId(without, "loesungspfad");
  if (!freshWirkpfad) return html;
  return `${without.slice(0, freshWirkpfad.end)}\n${critical.section}${without.slice(freshWirkpfad.end)}`;
}

function normalizeClaimSection(html, file) {
  if (!isDebatePage(file)) return html;
  const section = sectionAtId(html, "host-cockpit");
  if (!section) return html;
  const h1 = firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const existingClaim = firstMatch(section.section, /<p class="v2-claim-line">[\s\S]*?<strong>([\s\S]*?)<\/strong>/i);
  const hasLegacyClaimContent = /Kurzantwort - 10 Sekunden|Sag das jetzt|Frame nicht übernehmen|Die bessere Frage|Implizite Botschaft|Kurzurteil|Was fehlt im Frame/i.test(section.section);
  if (!hasLegacyClaimContent && (!existingClaim || hasMeaningfulOverlap(existingClaim, h1))) return html;
  const fallbackCardTitle = firstMatch(section.section, /<h3 class="card-title">([\s\S]*?)<\/h3>/i);
  const claim = existingClaim && hasMeaningfulOverlap(existingClaim, h1)
    ? existingClaim
    : (h1 || existingClaim || fallbackCardTitle);
  const replacement = `<section class="section v2-host-cockpit debate-claim-section" id="host-cockpit" data-v2-host-cockpit><div class="v2-cockpit-shell"><div class="v2-cockpit-head"><p class="hero-kicker">Die Frage / Behauptung</p><h2>Was wird behauptet?</h2><p class="v2-claim-line">Jemand sagt: <strong>${esc(claim)}</strong></p></div></div></section>`;
  return `${html.slice(0, section.start)}${replacement}${html.slice(section.end)}`;
}

function enforceFactsBeforeSources(html, file) {
  if (!isDebatePage(file)) return html;
  const facts = sectionAtId(html, "faktenlage");
  const sources = sectionAtId(html, "quellen") || sectionAtId(html, "warum-belastbar");
  if (!facts || !sources || facts.start < sources.start) return html;
  const withoutSources = html.slice(0, sources.start) + html.slice(sources.end);
  const freshFacts = sectionAtId(withoutSources, "faktenlage");
  if (!freshFacts) return html;
  return `${withoutSources.slice(0, freshFacts.end)}\n${sources.section}${withoutSources.slice(freshFacts.end)}`;
}

function enforceFactsAfterCriticalQuestions(html, file) {
  if (!isDebatePage(file)) return html;
  const facts = sectionAtId(html, "faktenlage");
  const critical = sectionAtId(html, "kritische-fragen");
  if (!facts || !critical || facts.start > critical.end) return html;
  const withoutFacts = html.slice(0, facts.start) + html.slice(facts.end);
  const freshCritical = sectionAtId(withoutFacts, "kritische-fragen");
  if (!freshCritical) return html;
  return `${withoutFacts.slice(0, freshCritical.end)}\n${facts.section}${withoutFacts.slice(freshCritical.end)}`;
}

function enforcePsychologyPosition(html) {
  const { stripped, sections } = pullPsychologySections(html);
  if (!sections.length) return html;
  const selected = sections.find((section) => /debate-psychology-accordion/.test(section)) || sections[0];
  const normalized = selected
    .replace(/\bid="psychologischer-wirkungscheck"/i, 'id="warum-der-satz-zieht"')
    .replace(/\bid="psychologie"/i, 'id="warum-der-satz-zieht"');
  return (
    insertAfterSection(stripped, "quellen", normalized) ||
    insertAfterSection(stripped, "warum-belastbar", normalized) ||
    insertAfterSection(stripped, "sprint4-vertrauen", normalized) ||
    insertAfterSection(stripped, "deep-dive-quellen", normalized) ||
    insertAfterSection(stripped, "quellen", normalized) ||
    insertAfterSection(stripped, "faktenlage", normalized) ||
    insertAfterSection(stripped, "folgencheck", normalized) ||
    insertAfterSection(stripped, "loesungspfad", normalized) ||
    insertAfterSection(stripped, "systemische-wirkungen", normalized) ||
    `${stripped}\n${normalized}`
  );
}

let changed = 0;
for (const file of files(radarDir)) {
  const before = fs.readFileSync(file, "utf8");
  let after = normalizeText(before);
  after = removeDebateMethodAndDuplicates(after, file);
  after = normalizeDebateAliasAnchors(after, file);
  after = normalizeClaimSection(after, file);
  after = normalizePsychologyModules(after);
  after = normalizeConsequenceAnchor(after);
  after = normalizeSourceAnchor(after);
  after = enforceImmediateAnswerPosition(after, file);
  after = ensureWirkpfadPosition(after, file);
  after = enforceCriticalQuestions(after, file);
  after = enforceCriticalQuestionsAfterWirkpfad(after, file);
  after = ensureFactsAndSources(after, file);
  after = enforceFactsAfterCriticalQuestions(after, file);
  after = enforceFactsBeforeSources(after, file);
  after = enforcePsychologyPosition(after);
  after = enforceTocPosition(after, file);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}

console.log(`Debatten-Kompass Nutzenlogik normalisiert: ${changed} HTML-Dateien.`);
