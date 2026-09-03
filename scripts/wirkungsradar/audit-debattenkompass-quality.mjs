import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const radarRoot = path.join(root, "wirkungsradar");
const jsonOut = path.join(root, "debattkompass_quality_audit.json");
const mdOut = path.join(root, "debattkompass_quality_audit.md");
const generatedAt = new Date().toISOString();

const knownReviewUrls = new Set([
  "/wirkungsradar/live/batterien-sind-nicht-recyclebar/",
  "/wirkungsradar/live/co2-ist-nur-ein-spurengas/",
  "/wirkungsradar/live/das-ist-alles-gesteuert/",
  "/wirkungsradar/live/das-ist-zensur/",
  "/wirkungsradar/live/die-da-oben/",
  "/wirkungsradar/live/die-wissenschaft-ist-gekauft/",
  "/wirkungsradar/live/energiewende-gescheitert/",
  "/wirkungsradar/live/kernenergie-einfache-loesung/",
  "/wirkungsradar/live/klima-hat-sich-schon-immer-veraendert/",
  "/wirkungsradar/live/klimaschutz-ist-oekodiktatur/",
  "/wirkungsradar/live/mainstreammedien-luegen-alle/",
  "/wirkungsradar/live/man-darf-ja-nichts-mehr-sagen/",
  "/wirkungsradar/live/man-wird-doch-wohl-fragen-duerfen/",
  "/wirkungsradar/live/sdgs-weltregierung/",
  "/wirkungsradar/live/windraeder-zerstoeren-natur/",
  "/wirkungsradar/live/wirkungsoekonomie-planwirtschaft/",
  "/wirkungsradar/live/wirkungsoekonomie-social-credit/",
  "/wirkungsradar/live/radwege-in-peru/",
  "/wirkungsradar/live/15-minuten-stadt-oder-klimakaefig/",
]);

const genericConsequencePatterns = [
  "Das Problem wirkt kleiner, als es ist",
  "Wichtige Folgen verschwinden aus der Debatte",
  "Alte Regeln, Kosten oder Abhängigkeiten verfestigen sich",
  "Alte Regeln, Kosten oder Abhaengigkeiten verfestigen sich",
  "Der Satz setzt das falsche Bild",
  "Wichtige Lösungen wirken weniger plausibel",
  "Wichtige Loesungen wirken weniger plausibel",
  "Schlechtere Pfade werden stabiler",
  "Faktenlage Lösung Wirkungspfad",
  "Faktenlage Loesung Wirkungspfad",
  "Das Problem wirkt kleiner",
  "Risiken für Teilhabe, Sicherheit, Alltag oder Vertrauen werden sichtbar gemacht",
  "Ökologische Folgekosten und bessere Alternativen dürfen nicht aus der Rechnung fallen",
  "Demokratische Entscheidung braucht klare Zuständigkeit, Quellen und Bilanzgrenzen",
  "Menschen, Alltag, Arbeit, Teilhabe, Sicherheit oder Würde dürfen nicht auf den Frame reduziert werden",
  "Ökologische Folgen, Ressourcen, Infrastruktur und Langfristwirkung müssen mitgezählt werden",
  "Fakten, Folgen, Alternativen, Unterlassungskosten und bessere Lösung",
];

const genericPsychologyPatterns = [
  "Vereinfachung",
  "Kontrollgefühl",
  "Kontrollgefuehl",
  "Status-quo-Bias",
  "Verlustaversion",
  "Reaktanz",
  "Identitätsschutz",
  "Identitaetsschutz",
  "Frame-Effekt",
  "Bestätigungsfehler",
  "Bestaetigungsfehler",
  "Kontrollbedürfnis",
  "Kontrollbeduerfnis",
  "Verfügbarkeitsheuristik",
  "Verfuegbarkeitsheuristik",
];

const placeholderPatterns = [
  "Noch nicht verknüpft",
  "Noch nicht verknuepft",
  "Prüfpunkt",
  "Pruefpunkt",
  "Quelle ergänzen",
  "Quelle ergaenzen",
  "Standardtext statt Inhalt",
  "Deep Dive öffnen",
  "Deep Dive oeffnen",
  "Nicht verknüpft",
  "Nicht verknuepft",
];

const primarySourcePatterns = [
  /(^|\.)bund\.de$/i,
  /bundesregierung\.de$/i,
  /bundestag\.de$/i,
  /destatis\.de$/i,
  /umweltbundesamt\.de$/i,
  /uba\.de$/i,
  /kfw\.de$/i,
  /bmz\.de$/i,
  /bmwk\.de$/i,
  /bmas\.de$/i,
  /bmbf\.de$/i,
  /bmi\.bund\.de$/i,
  /bpb\.de$/i,
  /arbeitsagentur\.de$/i,
  /iab\.de$/i,
  /oecd\.org$/i,
  /europa\.eu$/i,
  /ec\.europa\.eu$/i,
  /un\.org$/i,
  /unfccc\.int$/i,
  /ipcc\.ch$/i,
  /iea\.org$/i,
  /who\.int$/i,
  /rki\.de$/i,
  /adac\.de$/i,
];

function walkHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll(path.sep, "/");
    if (entry.isDirectory()) {
      if (rel === "wirkungsradar/embed" || rel.startsWith("wirkungsradar/embed/")) continue;
      files.push(...walkHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

function fileToUrl(file) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  if (rel.endsWith(".html")) return `/${rel.slice(0, -".html".length)}`;
  return `/${rel}`;
}

function decodeEntities(input) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function extractMainHtml(html) {
  const match = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return match ? match[1] : html;
}

function extractSectionHtml(mainHtml, id) {
  const re = new RegExp(`<section\\b[^>]*id=["']${id}["'][^>]*>`, "i");
  const match = re.exec(mainHtml);
  if (!match) return "";
  const start = match.index;
  const rest = mainHtml.slice(start + match[0].length);
  const next = rest.search(/<section\b/i);
  return next >= 0 ? mainHtml.slice(start, start + match[0].length + next) : mainHtml.slice(start);
}

function extractArticles(html) {
  return [...String(html || "").matchAll(/<article\b[\s\S]*?<\/article>/gi)].map((match) => match[0]);
}

function extractConsequenceCards(row, mainHtml, mainText) {
  const section = extractSectionHtml(mainHtml, "folgencheck");
  if (!section) return [];
  const claim =
    matchText(mainHtml, /<p class="v2-claim-line">[\s\S]*?<strong>([\s\S]*?)<\/strong>/i) ||
    row.title;
  const normalizedClaim = normalizeForCompare(claim);
  const claimTokens = new Set(normalizedClaim.split(/\s+/).filter((token) => token.length >= 5));
  return extractArticles(section).filter((article) => /v3-order-card/i.test(article)).map((article, index) => {
    const text = stripTags(article);
    const normalized = normalizeForCompare(text);
    const explicitPath = /Wirkungspfad|Wirkpfad|Wirkmechanismus|Narrativ:|Begründung:/i.test(text);
    const hasNarrativeReference =
      /Narrativ:/i.test(text) ||
      (claimTokens.size > 0 && [...claimTokens].some((token) => normalized.includes(token)));
    const genericHits = countMatches(text, genericConsequencePatterns);
    const generic =
      genericHits.length > 0 ||
      (/^(Wahrnehmung|Entscheidung|Systempfad|Mensch|Planet|Demokratie)$/i.test(matchText(article, /<h3\b[^>]*>([\s\S]*?)<\/h3>/i)) && !explicitPath);
    return {
      url: row.url,
      title: row.title,
      card_index: index + 1,
      card_title: matchText(article, /<(?:h3|p)\b[^>]*class=["'][^"']*(?:card-title|card-kicker|v2-badge)[^"']*["'][^>]*>([\s\S]*?)<\/(?:h3|p)>/i) || `Karte ${index + 1}`,
      narrative_reference: hasNarrativeReference ? "ja" : "nein",
      impact_path: explicitPath ? "ja" : "nein",
      generic: generic ? "ja" : "nein",
      pattern: genericHits.slice(0, 2).join("; "),
      text_sample: text.slice(0, 240),
    };
  });
}

function matchText(html, regex, fallback = "") {
  const match = html.match(regex);
  return match ? stripTags(match[1] ?? match[0]) : fallback;
}

function extractTitle(html) {
  const h1 = matchText(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title = matchText(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return cleanTitle(h1 || title || "Ohne Titel");
}

function cleanTitle(title) {
  return title
    .replace(/\s*\|\s*(Debatten-Kompass|Wirkungsradar|Wirkungsökonomie).*$/i, "")
    .replace(/\s+-\s+(Wirkungsradar Live|Wirkungsradar Detail|Wirkungsradar Narrative)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalPath(html) {
  const match = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  if (!match) return "";
  try {
    return new URL(match[1]).pathname;
  } catch {
    return match[1];
  }
}

function normalizeForCompare(value) {
  return decodeEntities(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/\b(wirkungsradar|debattenkompass|debatten-kompass|detail|live|narrativ|narrative)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return parts.at(-1) || "index";
}

function pageTypeFromUrl(url) {
  if (url === "/wirkungsradar/") return "hub";
  if (url.startsWith("/wirkungsradar/live/")) return url === "/wirkungsradar/live/" ? "live-hub" : "live";
  if (url.startsWith("/wirkungsradar/detail/")) return url === "/wirkungsradar/detail/" ? "detail-hub" : "detail";
  if (url.startsWith("/wirkungsradar/narrative/")) return url === "/wirkungsradar/narrative/" ? "narrative-hub" : "narrative";
  if (url.startsWith("/wirkungsradar/debattenkarten/")) return "debattenkarten";
  if (url.startsWith("/wirkungsradar/antwort-playbooks/")) return "antwort-playbook";
  if (url.startsWith("/wirkungsradar/host-playbook/")) return "host-playbook";
  if (url.startsWith("/wirkungsradar/themen/")) return "category";
  return "radar-page";
}

function inferCategory(mainText, searchEntry, url) {
  const tags = Array.isArray(searchEntry?.tags) ? searchEntry.tags.filter(Boolean) : [];
  const usefulTag = tags.find((tag) => !/wirkungsradar|debatten|detail|live|seite|narrativ/i.test(tag));
  if (usefulTag) return usefulTag;

  const kicker = mainText.match(/(?:Klima|Energie|Mobilität|Migration|Sozialstaat|Arbeit|Demokratie|Medien|Wirtschaft|Steuern|Gesundheit|Akademie|Psychologie)[^·.\n]{0,70}/i);
  if (kicker) return kicker[0].trim();

  if (url.includes("/narrative/")) return "Narrativbibliothek";
  if (url.includes("/live/")) return "Debattenkarte";
  if (url.includes("/detail/")) return "Detailseite";
  return "Debatten-Kompass";
}

function inferStatus(mainText, html) {
  if (/in Überarbeitung|in Ueberarbeitung|wird überarbeitet|wird ueberarbeitet/i.test(mainText)) return "in Überarbeitung";
  if (/geprüft\s*v?\d|geprueft\s*v?\d/i.test(mainText)) return "geprüft";
  if (/noindex/i.test(html)) return "noindex";
  return "online";
}

function extractLinks(html) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const href = decodeEntities(match[1]).trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    links.push(href);
  }
  return links;
}

function hostnameFromHref(href) {
  try {
    if (href.startsWith("/")) return "";
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function hasPrimarySource(links) {
  return links.some((href) => {
    const host = hostnameFromHref(href);
    return host && primarySourcePatterns.some((pattern) => pattern.test(host));
  });
}

function countMatches(text, patterns) {
  const found = [];
  for (const pattern of patterns) {
    if (text.includes(pattern)) found.push(pattern);
  }
  return found;
}

function extractCopyTexts(mainHtml) {
  const copies = [];
  for (const match of mainHtml.matchAll(/data-copy-text=(["'])([\s\S]*?)\1/g)) {
    copies.push(decodeEntities(match[2]).replace(/\s+/g, " ").trim());
  }
  return copies.filter(Boolean);
}

function repeatedSnippets(mainHtml) {
  const snippets = [];
  const seen = new Map();
  const paragraphs = [...mainHtml.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((match) => stripTags(match[2]))
    .filter((text) => text.length >= 80);
  for (const text of [...paragraphs, ...extractCopyTexts(mainHtml)]) {
    const key = normalizeForCompare(text).slice(0, 260);
    if (!key || key.length < 70) continue;
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if (seen.get(key) === 2) snippets.push(text.slice(0, 160));
  }
  return snippets;
}

function tokenizeForSimilarity(text) {
  const stop = new Set([
    "diese",
    "dieser",
    "dieses",
    "seite",
    "debatt",
    "kompass",
    "wirkungsradar",
    "wirkung",
    "quelle",
    "quellen",
    "oeffnen",
    "mehr",
    "antwort",
    "kopieren",
  ]);
  return new Set(
    normalizeForCompare(text)
      .split(/\s+/)
      .filter((token) => token.length > 4 && !stop.has(token))
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection += 1;
  }
  return intersection / (a.size + b.size - intersection);
}

function loadSearchIndex() {
  const file = path.join(root, "assets/search/search-index.json");
  if (!fs.existsSync(file)) return new Map();
  const entries = JSON.parse(fs.readFileSync(file, "utf8"));
  const byUrl = new Map();
  for (const entry of entries) {
    if (!entry?.url) continue;
    byUrl.set(entry.url, entry);
  }
  return byUrl;
}

function sourceProblemFor(row, sourceHtml, mainText) {
  const requiresSources = ["live", "detail", "narrative", "antwort-playbook", "debattenkarten"].includes(row.page_type);
  if (!requiresSources) return [];
  const findings = [];
  const sourceText = stripTags(sourceHtml);
  const sourceLinks = extractLinks(sourceHtml);

  if (!sourceHtml || sourceText.length < 80) {
    findings.push({
      code: "source_missing",
      severity: 2,
      message: "Quellenblock fehlt oder ist zu dünn.",
      pattern: "Quellenblock fehlt",
    });
    return findings;
  }

  if (/impact@wirkungsoekonomie\.org/i.test(sourceText)) {
    findings.push({
      code: "internal_mail_as_source",
      severity: 3,
      message: "Interne Kontaktadresse erscheint im Quellenkontext.",
      pattern: "impact@wirkungsoekonomie.org",
    });
  }

  if (!/Was belegt|belegt sie|Beweist:|→|->/i.test(sourceText)) {
    findings.push({
      code: "source_without_fact_mapping",
      severity: 2,
      message: "Quellen erklären nicht, welchen Fakt sie belegen.",
      pattern: "keine Quelle-zu-Fakt-Zuordnung",
    });
  }

  if (!hasPrimarySource(sourceLinks)) {
    findings.push({
      code: "no_primary_source",
      severity: 2,
      message: "Keine klare Primärquelle im Quellenblock gefunden.",
      pattern: "keine Primärquelle",
    });
  }

  if (!/Faktenlage/i.test(mainText)) {
    findings.push({
      code: "facts_before_sources_missing",
      severity: 2,
      message: "Vor den Quellen fehlt eine verständliche Faktenlage.",
      pattern: "Faktenlage fehlt",
    });
  }

  return findings;
}

function initialFindings(row, mainHtml, mainText) {
  const findings = [];
  const sourceHtml = extractSectionHtml(mainHtml, "quellen") || extractSectionHtml(mainHtml, "quellen-und-vertiefung");
  const genericConsequences = countMatches(mainText, genericConsequencePatterns);
  const placeholders = countMatches(mainText, placeholderPatterns);
  const psychHits = countMatches(mainText, genericPsychologyPatterns);
  const repeated = repeatedSnippets(mainHtml);
  const consequenceCards = extractConsequenceCards(row, mainHtml, mainText);
  const genericCards = consequenceCards.filter((card) => card.generic === "ja");
  const cardsWithoutPath = consequenceCards.filter((card) => card.impact_path === "nein");
  const cardsWithoutNarrative = consequenceCards.filter((card) => card.narrative_reference === "nein");

  if (knownReviewUrls.has(row.url)) {
    findings.push({
      code: "known_review_list",
      severity: 2,
      message: "Bekannte Startliste: Seite muss redaktionell geprüft werden.",
      pattern: "bekannte C/D-Startliste",
    });
  }

  if (genericConsequences.length) {
    findings.push({
      code: "generic_consequence",
      severity: 2,
      message: "Generische Folgeblöcke oder Standardformulierungen gefunden.",
      pattern: genericConsequences.slice(0, 3).join("; "),
    });
  }

  if (genericCards.length) {
    findings.push({
      code: "generic_effect_card",
      severity: 3,
      message: "Wirkungskarte wirkt generisch oder ohne expliziten Narrativpfad.",
      pattern: genericCards.slice(0, 3).map((card) => card.card_title).join("; "),
    });
  }

  if (cardsWithoutPath.length) {
    findings.push({
      code: "effect_card_without_path",
      severity: 2,
      message: "Wirkungskarte ohne sichtbaren Wirkmechanismus/Wirkungspfad.",
      pattern: cardsWithoutPath.slice(0, 3).map((card) => card.card_title).join("; "),
    });
  }

  if (cardsWithoutNarrative.length) {
    findings.push({
      code: "effect_card_without_narrative",
      severity: 2,
      message: "Wirkungskarte ohne klaren Bezug zur konkreten Behauptung.",
      pattern: cardsWithoutNarrative.slice(0, 3).map((card) => card.card_title).join("; "),
    });
  }

  if (placeholders.length) {
    findings.push({
      code: "placeholder",
      severity: placeholders.some((item) => /Quelle|Prüfpunkt|Pruefpunkt|Noch nicht/i.test(item)) ? 3 : 2,
      message: "Platzhalter oder unfertige Inhalte gefunden.",
      pattern: placeholders.slice(0, 3).join("; "),
    });
  }

  if (psychHits.length && !/Wie er hier wirkt|Host-Move|Wie du ihn entschärfst|Wie du ihn entschaerfst/i.test(mainText)) {
    findings.push({
      code: "generic_psychology",
      severity: 2,
      message: "Psychologie wird generisch statt fallbezogen erklärt.",
      pattern: psychHits.slice(0, 3).join("; "),
    });
  } else if (psychHits.length > 5) {
    findings.push({
      code: "psychology_overload",
      severity: 1,
      message: "Viele Psychologie-Begriffe; prüfen, ob der Abschnitt zu dominant ist.",
      pattern: psychHits.slice(0, 5).join("; "),
    });
  }

  if (repeated.length) {
    findings.push({
      code: "repeated_text",
      severity: 2,
      message: "Gleiche Antwort- oder Textbausteine mehrfach auf derselben Seite.",
      pattern: repeated[0],
    });
  }

  findings.push(...sourceProblemFor(row, sourceHtml, mainText));
  return findings;
}

function gradeFromFindings(findings) {
  const maxSeverity = findings.reduce((max, item) => Math.max(max, item.severity ?? 0), 0);
  const hasKnown = findings.some((item) => item.code === "known_review_list");
  const issueCodes = new Set(findings.map((item) => item.code));
  if (maxSeverity >= 3) return "D";
  if (hasKnown && findings.length >= 2) return "D";
  if (issueCodes.has("generic_consequence") && (issueCodes.has("source_missing") || issueCodes.has("no_primary_source"))) return "D";
  if (maxSeverity === 2 || hasKnown) return "C";
  if (maxSeverity === 1) return "B";
  return "A";
}

function priorityForGrade(grade) {
  if (grade === "D") return "P0";
  if (grade === "C") return "P1";
  if (grade === "B") return "P2";
  return "P3";
}

function actionForGrade(grade) {
  if (grade === "D") return "Komplett redaktionell neu aufbauen: Behauptung, Folgencheck, Wirkpfad, Antwortblock, Faktenlage und Quellen neu prüfen.";
  if (grade === "C") return "Template behalten, aber Folgencheck, Quellen, Wirkpfad und Antwortblock gezielt überarbeiten.";
  if (grade === "B") return "Kürzen, Quellen verbessern und Redundanzen entfernen.";
  return "Keine Überarbeitung nötig.";
}

function mainProblem(findings) {
  if (!findings.length) return "keine Auffälligkeit";
  return findings
    .slice()
    .sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0))
    .slice(0, 2)
    .map((finding) => finding.message)
    .join(" ");
}

function markDuplicates(rows) {
  const byCleanTitle = new Map();
  const bySlug = new Map();
  const byCanonical = new Map();
  const duplicateRecords = [];

  for (const row of rows) {
    const titleKey = normalizeForCompare(row.title);
    if (titleKey) {
      if (!byCleanTitle.has(titleKey)) byCleanTitle.set(titleKey, []);
      byCleanTitle.get(titleKey).push(row);
    }

    const slug = slugFromUrl(row.url);
    if (slug && slug !== "index") {
      if (!bySlug.has(slug)) bySlug.set(slug, []);
      bySlug.get(slug).push(row);
    }

    if (row.canonical_url) {
      if (!byCanonical.has(row.canonical_url)) byCanonical.set(row.canonical_url, []);
      byCanonical.get(row.canonical_url).push(row);
    }
  }

  const addDuplicate = (rowsInGroup, type, pattern) => {
    if (rowsInGroup.length < 2) return;
    const urls = rowsInGroup.map((row) => row.url).sort();
    duplicateRecords.push({ type, pattern, urls });
    for (const row of rowsInGroup) {
      row.duplicate_suspicion.push(`${type}: ${urls.filter((url) => url !== row.url).slice(0, 4).join(", ")}`);
      row.findings.push({
        code: "duplicate_suspicion",
        severity: 2,
        message: `Dublettenverdacht (${type}).`,
        pattern,
      });
    }
  };

  for (const [titleKey, grouped] of byCleanTitle) {
    const relevant = grouped.filter((row) => row.page_type !== "hub" && row.page_type !== "live-hub");
    addDuplicate(relevant, "exakte Titeldublette", titleKey);
  }

  for (const [slug, grouped] of bySlug) {
    const hasLive = grouped.some((row) => row.url.includes("/live/"));
    const hasDetail = grouped.some((row) => row.url.includes("/detail/"));
    if (hasLive && hasDetail) addDuplicate(grouped, "Struktur-Dublette live/detail", slug);
  }

  for (const [canonical, grouped] of byCanonical) {
    const uniqueUrls = new Set(grouped.map((row) => row.url));
    if (uniqueUrls.size > 1) addDuplicate(grouped, "Canonical-Dublette", canonical);
    for (const row of grouped) {
      if (row.canonical_url && row.canonical_url !== row.url) {
        row.duplicate_suspicion.push(`Canonical zeigt auf ${row.canonical_url}`);
        row.findings.push({
          code: "canonical_alias",
          severity: 2,
          message: "URL ist Alias oder konkurriert mit anderer kanonischer Zielseite.",
          pattern: row.canonical_url,
        });
      }
    }
  }

  const comparable = rows.filter((row) => ["live", "detail", "narrative"].includes(row.page_type) && row.tokens.size >= 40);
  for (let i = 0; i < comparable.length; i += 1) {
    for (let j = i + 1; j < comparable.length; j += 1) {
      const left = comparable[i];
      const right = comparable[j];
      if (left.url === right.url) continue;
      const score = jaccard(left.tokens, right.tokens);
      if (score >= 0.82) {
        const pattern = `Textähnlichkeit ${(score * 100).toFixed(0)} %`;
        duplicateRecords.push({ type: "wahrscheinliche Textdublette", pattern, urls: [left.url, right.url] });
        for (const row of [left, right]) {
          const other = row === left ? right : left;
          row.duplicate_suspicion.push(`${pattern}: ${other.url}`);
          row.findings.push({
            code: "text_similarity_duplicate",
            severity: 2,
            message: "Hohe Textähnlichkeit zu anderer Radar-Seite.",
            pattern: `${pattern} mit ${other.url}`,
          });
        }
      }
    }
  }

  return duplicateRecords;
}

function inventoryRows() {
  const searchByUrl = loadSearchIndex();
  const files = walkHtmlFiles(radarRoot).sort();
  const rows = [];

  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const mainHtml = extractMainHtml(html);
    const mainText = stripTags(mainHtml);
    const url = fileToUrl(file);
    const searchEntry = searchByUrl.get(url);
    const row = {
      url,
      title: extractTitle(html),
      slug: slugFromUrl(url),
      tags: Array.isArray(searchEntry?.tags) ? searchEntry.tags : [],
      synonyms: Array.isArray(searchEntry?.aliases) ? searchEntry.aliases : [],
      page_type: pageTypeFromUrl(url),
      category: inferCategory(mainText, searchEntry, url),
      status: inferStatus(mainText, html),
      canonical_url: canonicalPath(html),
      duplicate_suspicion: [],
      quality_grade: "A",
      priority: "P3",
      main_problem: "",
      concrete_finding: "",
      recommended_action: "",
      findings: [],
      effect_cards: [],
      tokens: tokenizeForSimilarity(mainText),
      file: path.relative(root, file).replaceAll(path.sep, "/"),
    };
    row.effect_cards = extractConsequenceCards(row, mainHtml, mainText);
    row.findings = initialFindings(row, mainHtml, mainText);
    rows.push(row);
  }

  const byUrl = new Set(rows.map((row) => row.url));
  for (const url of knownReviewUrls) {
    if (!byUrl.has(url)) {
      rows.push({
        url,
        title: "(nicht im Build gefunden)",
        slug: slugFromUrl(url),
        tags: [],
        synonyms: [],
        page_type: pageTypeFromUrl(url),
        category: "Debattenkarte",
        status: "missing",
        canonical_url: "",
        duplicate_suspicion: ["Bekannte Startlisten-URL fehlt im Build"],
        quality_grade: "D",
        priority: "P0",
        main_problem: "Bekannte Startlisten-URL fehlt im Build.",
        concrete_finding: "missing",
        recommended_action: "Route, Redirect oder kanonische Zielseite prüfen und live herstellen.",
        findings: [
          {
            code: "missing_known_url",
            severity: 3,
            message: "Bekannte Startlisten-URL fehlt im Build.",
            pattern: "missing",
          },
        ],
        effect_cards: [],
        tokens: new Set(),
        file: "",
      });
    }
  }

  const duplicates = markDuplicates(rows);
  for (const row of rows) {
    row.quality_grade = gradeFromFindings(row.findings);
    row.priority = priorityForGrade(row.quality_grade);
    row.main_problem = mainProblem(row.findings);
    row.concrete_finding = row.findings
      .slice()
      .sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0))[0]?.pattern || "keine Auffälligkeit";
    row.recommended_action = actionForGrade(row.quality_grade);
  }

  return { rows, duplicates };
}

function publicRow(row) {
  const { tokens, effect_cards, ...rest } = row;
  return {
    ...rest,
    duplicate_suspicion: row.duplicate_suspicion.join("; ") || "nein",
  };
}

function countRows(rows, predicate) {
  return rows.filter(predicate).length;
}

function makeSummary(rows, duplicates) {
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
  for (const row of rows) gradeCounts[row.quality_grade] += 1;
  return {
    generated_at: generatedAt,
    checked_pages: rows.length,
    grade_counts: gradeCounts,
    duplicate_groups: duplicates.length,
    duplicate_suspect_pages: countRows(rows, (row) => row.duplicate_suspicion.length > 0),
    source_problem_pages: countRows(rows, (row) =>
      row.findings.some((finding) => ["source_missing", "source_without_fact_mapping", "no_primary_source", "facts_before_sources_missing", "internal_mail_as_source"].includes(finding.code))
    ),
    generic_consequence_pages: countRows(rows, (row) => row.findings.some((finding) => finding.code === "generic_consequence")),
    psychology_overload_pages: countRows(rows, (row) => row.findings.some((finding) => ["generic_psychology", "psychology_overload"].includes(finding.code))),
    placeholder_pages: countRows(rows, (row) => row.findings.some((finding) => finding.code === "placeholder")),
    effect_cards_checked: rows.reduce((sum, row) => sum + row.effect_cards.length, 0),
    generic_effect_cards_remaining: rows.reduce((sum, row) => sum + row.effect_cards.filter((card) => card.generic === "ja").length, 0),
    effect_cards_without_path: rows.reduce((sum, row) => sum + row.effect_cards.filter((card) => card.impact_path === "nein").length, 0),
    effect_cards_without_narrative_reference: rows.reduce((sum, row) => sum + row.effect_cards.filter((card) => card.narrative_reference === "nein").length, 0),
  };
}

function escapeMd(value) {
  return String(value ?? "")
    .replace(/\n/g, " ")
    .replace(/\|/g, "\\|")
    .replace(/\s+/g, " ")
    .trim();
}

function mdTable(headers, rows) {
  const header = `| ${headers.map(escapeMd).join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map(escapeMd).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

function buildMarkdown(summary, rows, duplicates) {
  const sortedRows = rows
    .slice()
    .sort((a, b) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
      const gradeOrder = { D: 0, C: 1, B: 2, A: 3 };
      return (
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        gradeOrder[a.quality_grade] - gradeOrder[b.quality_grade] ||
        a.url.localeCompare(b.url)
      );
    });

  const reviewRows = sortedRows.map((row) => [
    row.priority,
    row.url,
    row.title,
    row.quality_grade,
    row.main_problem,
    row.concrete_finding,
    row.recommended_action,
  ]);

  const inventory = sortedRows.map((row) => [
    row.url,
    row.title,
    row.slug,
    row.tags.join(", "),
    row.synonyms.join(", "),
    row.page_type,
    row.category,
    row.status,
    row.canonical_url,
    row.duplicate_suspicion.join("; ") || "nein",
    row.quality_grade,
  ]);

  const duplicateRows = duplicates.slice(0, 160).map((item) => [item.type, item.pattern, item.urls.join(", ")]);
  const effectCardRows = sortedRows
    .flatMap((row) => row.effect_cards)
    .filter((card) => card.generic === "ja" || card.impact_path === "nein" || card.narrative_reference === "nein")
    .slice(0, 220)
    .map((card) => [
      card.url,
      card.title,
      card.card_title,
      card.narrative_reference,
      card.impact_path,
      card.generic,
      card.pattern || card.text_sample,
    ]);

  return [
    "# Debatten-Kompass Quality Audit",
    "",
    `Generiert: ${generatedAt}`,
    "",
    "## Zusammenfassung",
    "",
    mdTable(
      ["Kennzahl", "Wert"],
      [
        ["Geprüfte Seiten", summary.checked_pages],
        ["A-Seiten", summary.grade_counts.A],
        ["B-Seiten", summary.grade_counts.B],
        ["C-Seiten", summary.grade_counts.C],
        ["D-Seiten", summary.grade_counts.D],
        ["Dubletten-Gruppen", summary.duplicate_groups],
        ["Seiten mit Quellenproblem", summary.source_problem_pages],
        ["Seiten mit generischem Folgencheck", summary.generic_consequence_pages],
        ["Seiten mit Psychologie-Überladung", summary.psychology_overload_pages],
        ["Seiten mit Platzhalter", summary.placeholder_pages],
        ["Geprüfte Wirkungskarten", summary.effect_cards_checked],
        ["Generische Wirkungskarten verbleibend", summary.generic_effect_cards_remaining],
        ["Wirkungskarten ohne Wirkpfad", summary.effect_cards_without_path],
        ["Wirkungskarten ohne Narrativbezug", summary.effect_cards_without_narrative_reference],
      ]
    ),
    "",
    "## Überarbeitungsliste",
    "",
    mdTable(
      ["Priorität", "URL", "Titel", "Qualitätsstufe", "Hauptproblem", "konkrete Fundstelle / Textmuster", "empfohlene Maßnahme"],
      reviewRows
    ),
    "",
    "## Vollständiges URL-Inventar",
    "",
    mdTable(
      ["URL", "Titel", "Slug", "Tags", "Synonyme", "Seitentyp", "Kategorie", "Status", "canonical_url", "Duplicate-Verdacht", "Qualitätsstufe"],
      inventory
    ),
    "",
    "## Dubletten-Gruppen",
    "",
    duplicateRows.length
      ? mdTable(["Typ", "Muster", "URLs"], duplicateRows)
      : "Keine Dubletten-Gruppen erkannt.",
    "",
    "## Wirkungskarten-Audit",
    "",
    effectCardRows.length
      ? mdTable(["URL", "Titel", "Kartentitel", "Narrativbezug vorhanden?", "Wirkpfad vorhanden?", "Generisch?", "Fundstelle / Textmuster"], effectCardRows)
      : "Keine problematischen Wirkungskarten erkannt.",
    "",
  ].join("\n");
}

const { rows, duplicates } = inventoryRows();
const publicRows = rows.map(publicRow);
const summary = makeSummary(rows, duplicates);
const output = {
  generated_at: generatedAt,
  scope: [
    "/wirkungsradar/",
    "/wirkungsradar/live/",
    "/wirkungsradar/debattenkarten/",
    "/wirkungsradar/antwort-playbooks/",
    "/wirkungsradar/narrative/",
  ],
  note: "Embed-Fragmente unter /wirkungsradar/embed/ wurden ausgeschlossen, weil sie keine eigenständigen Debattenseiten sind.",
  summary,
  inventory: publicRows,
  weak_pages: publicRows.filter((row) => ["B", "C", "D"].includes(row.quality_grade)),
  effect_card_audit: rows.flatMap((row) => row.effect_cards),
  duplicates,
};

fs.writeFileSync(jsonOut, `${JSON.stringify(output, null, 2)}\n`);
fs.writeFileSync(mdOut, buildMarkdown(summary, rows, duplicates));

console.log(
  `Debatten-Kompass Quality Audit: ${summary.checked_pages} Seiten, A=${summary.grade_counts.A}, B=${summary.grade_counts.B}, C=${summary.grade_counts.C}, D=${summary.grade_counts.D}, Dubletten=${summary.duplicate_groups}`
);
