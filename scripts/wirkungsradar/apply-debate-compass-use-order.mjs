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

function firstMatch(source, pattern) {
  const match = source.match(pattern);
  return match ? stripTags(match[1]) : "";
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
    '<div class="section-header"><p class="hero-kicker">💬 Sofortantwort</p><h2>10 Sekunden, 30 Sekunden, 2 Minuten.</h2><p>Wenn du gerade in der Debatte bist.</p><p><a class="btn btn-secondary" href="#folgencheck">Mehr verstehen</a></p></div>',
  );
  return next
    .replace(/<span class="radar-answer-time">(?:Kurzantwort|Kommentar)<\/span>/, '<span class="radar-answer-time">10 Sekunden</span>')
    .replace(/<span class="radar-answer-time">(?:Längere Antwort|Live)<\/span>/, '<span class="radar-answer-time">30 Sekunden</span>')
    .replace(/<span class="radar-answer-time">(?:Vertiefung|Panel)<\/span>/, '<span class="radar-answer-time">2 Minuten</span>')
    .replace(/Debatten-Kompass: So reagierst du/g, "💬 Sofortantwort")
    .replace(/Host-Antworten/g, "Sofortantwort")
    .replace(/Live antworten\.?/g, "Sofortantwort")
    .replace(/Antwortformate/g, "Sofortantwort")
    .replace(/So antwortest du/g, "💬 Sofortantwort");
}

function normalizeAnswerNav(html) {
  return html
    .replace(/href="#(?:host-antworten|live-antworten|antwortformate|antwort|reaktion)">(?:Reaktion|Live antworten|Antwortformate|Antwort|Host-Antworten|Sofortantwort)<\/a>/g, 'href="#host-antworten">Sofortantwort</a>')
    .replace(/href="#host-antworten">Reaktion<\/a>/g, 'href="#host-antworten">Sofortantwort</a>');
}

function enforceImmediateAnswerPosition(html, file) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  if (!/^wirkungsradar\/(?:live|detail)\//.test(relative)) return html;
  if (/^wirkungsradar\/(?:live|detail)\/index\.html$/.test(relative)) return html;
  const candidates = ["host-antworten", "live-antworten", "antwortformate", "antwort"];
  const found = candidates.map((id) => sectionAtId(html, id)).find(Boolean);
  if (!found) return normalizeAnswerNav(html);

  const stripped = html.slice(0, found.start) + html.slice(found.end);
  const insertAt = firstContentSectionEnd(stripped);
  if (insertAt < 0) return normalizeAnswerNav(html);
  const immediate = normalizeImmediateAnswerSection(found.section, found.id);
  const reordered = `${stripped.slice(0, insertAt)}\n${immediate}${stripped.slice(insertAt)}`;
  return normalizeAnswerNav(reordered);
}

function enforcePsychologyPosition(html) {
  const { stripped, sections } = pullPsychologySections(html);
  if (!sections.length) return html;
  const selected = sections.find((section) => /debate-psychology-accordion/.test(section)) || sections[0];
  const normalized = selected
    .replace(/\bid="psychologischer-wirkungscheck"/i, 'id="warum-der-satz-zieht"')
    .replace(/\bid="psychologie"/i, 'id="warum-der-satz-zieht"');
  return (
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
  after = normalizePsychologyModules(after);
  after = normalizeConsequenceAnchor(after);
  after = enforceImmediateAnswerPosition(after, file);
  after = enforcePsychologyPosition(after);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}

console.log(`Debatten-Kompass Nutzenlogik normalisiert: ${changed} HTML-Dateien.`);
