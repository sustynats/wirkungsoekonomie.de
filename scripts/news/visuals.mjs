// Visuelle Anker des Wirkungstickers.
//
// Zwei Ebenen:
// 1. Deterministische Ableitungen aus dem bestehenden Analyse-Schema: Themen-Icon,
//    Dimensionsmeter, Verfahrensstand, Wirkpfad, Materialität. Sie brauchen keinen
//    zusätzlichen KI-Aufruf und gelten für jede veröffentlichte Akte.
// 2. Optionale, quellengebundene KI-Visuals unter `analysis.visuals` (Kennzahlen,
//    Betroffenengruppen, Termine, Tendenz je Dimension, ein Balkendiagramm). Sie
//    laufen vor Veröffentlichung und beim Build durch `sanitizeVisuals()`.
//
// Grundsatz: Visuals blockieren nie eine Veröffentlichung. Unbelegte Zahlen, Termine
// oder ungültige Einträge fallen still weg und werden als `dropped` gemeldet.

export const RELEVANCE_LEVELS = { offen: 0, gering: 1, mittel: 2, hoch: 3, "sehr hoch": 4 };
export const STATUS_TRACK = ["angekündigt", "Entwurf", "beschlossen", "in Kraft", "laufende Umsetzung", "erste Daten", "evaluiert"];
const STATUS_SHORT = { "angekündigt": "Angekündigt", Entwurf: "Entwurf", beschlossen: "Beschlossen", "in Kraft": "In Kraft", "laufende Umsetzung": "Umsetzung", "erste Daten": "Erste Daten", evaluiert: "Evaluiert" };

export const TOPIC_ICONS = {
  Politik: "politik", Wirtschaft: "wirtschaft", Klima: "klima", Energie: "energie", Arbeit: "arbeit", Soziales: "soziales",
  Gesundheit: "gesundheit", Digitalisierung: "digitalisierung", KI: "ki", Europa: "europa", Geopolitik: "geopolitik",
  Finanzen: "finanzen", Bildung: "bildung", Demokratie: "demokratie",
};

export const DIMENSIONS = {
  human: { label: "Mensch", icon: "mensch" },
  planet: { label: "Planet", icon: "planet" },
  democracy: { label: "Demokratie", icon: "demokratie" },
};

export const AFFECTED_GROUPS = {
  haushalte: { label: "Haushalte", icon: "haushalte" },
  unternehmen: { label: "Unternehmen", icon: "unternehmen" },
  beschaeftigte: { label: "Beschäftigte", icon: "beschaeftigte" },
  kommunen: { label: "Kommunen", icon: "kommunen" },
  staat: { label: "Staat und Verwaltung", icon: "politik" },
  patientinnen: { label: "Patient:innen", icon: "patientinnen" },
  verbraucherinnen: { label: "Verbraucher:innen", icon: "verbraucherinnen" },
  kinder_jugend: { label: "Kinder und Jugendliche", icon: "kinder" },
  aeltere: { label: "Ältere Menschen", icon: "aeltere" },
  investoren: { label: "Investor:innen", icon: "investoren" },
  natur: { label: "Natur und Ökosysteme", icon: "klima" },
  europa: { label: "EU und Mitgliedstaaten", icon: "europa" },
};

export const TENDENCIES = {
  chance: { label: "Potenzial überwiegt", icon: "tendenz-chance" },
  risiko: { label: "Risiko überwiegt", icon: "tendenz-risiko" },
  gemischt: { label: "Potenzial und Risiko", icon: "tendenz-gemischt" },
  offen: { label: "Tendenz offen", icon: "offen" },
};

export const MATERIALITY_FACTORS = {
  affected_scope: "Betroffenenkreis", intensity: "Intensität", duration: "Dauer", reversibility: "Reversibilität",
  systemic_relevance: "Systemrelevanz", cascades: "Kaskaden", distribution: "Verteilung", resilience: "Resilienz",
  democratic_correctability: "Korrekturfähigkeit", resonance: "Resonanz",
};

export const NEWS_VALUES = {
  binding_decision: "Verbindliche Entscheidung", implementation: "Umsetzung", new_evidence: "Neue Evidenz",
  material_update: "Materielle Aktualisierung", substantive_commitment: "Substanzielle Zusage", context_only: "Nur Kontext",
};

export const EVIDENCE_BASIS = {
  primary_source_direct: "Primärquelle direkt", primary_source_with_caveats: "Primärquelle mit Vorbehalten", insufficient: "unzureichend",
};

export const ANALYSIS_TYPES = {
  ex_ante: { label: "Ex ante", note: "Einschätzung vor messbarer Wirkung" },
  monitoring: { label: "Monitoring", note: "laufende Beobachtung mit ersten Daten" },
  ex_post: { label: "Ex post", note: "Einordnung mit vorliegender Evidenz" },
};

export const VISUALS_LIMITS = { keyFigures: 3, affectedGroups: 4, timeline: 4, chartPoints: 8, chartMinPoints: 3, label: 60, context: 140, title: 80, unit: 24, value: 32 };

// Schema-Ausschnitt für den Prompt der WÖk-KI. Codex bindet ihn in buildAnalysisPrompt() ein.
export const VISUALS_SCHEMA = {
  key_figures: [{
    label: "Kennzahl, höchstens 60 Zeichen",
    value: "Zahl exakt wie im Claim oder Quelltext, Schreibweise unverändert, z. B. 35,2 oder zehn",
    unit: "Einheit wie in der Quelle, z. B. Mrd. EUR",
    context: "höchstens 140 Zeichen: was die Zahl bedeutet",
    claim_id: "claim_id aus dem Claim-Ledger",
  }],
  affected_groups: ["haushalte|unternehmen|beschaeftigte|kommunen|staat|patientinnen|verbraucherinnen|kinder_jugend|aeltere|investoren|natur|europa"],
  timeline: [{ date: "YYYY, YYYY-MM oder YYYY-MM-DD, nur wenn der zugehörige Claim den Termin nennt", label: "Ereignisbezeichnung mit Worten aus dem Claim, höchstens 80 Zeichen", claim_id: "claim_id aus dem Claim-Ledger" }],
  tendency: { human: "chance|risiko|gemischt|offen", planet: "chance|risiko|gemischt|offen", democracy: "chance|risiko|gemischt|offen" },
  chart: { type: "bar", title: "höchstens 80 Zeichen", measure: "dieselbe konkret benannte Messgröße für alle Punkte", unit: "konkrete gemeinsame Einheit samt Größenordnung", points: [{ label: "Kategorie oder Zeitpunkt wörtlich im Beleg", value: 0, claim_id: "claim_id aus dem Claim-Ledger", evidence_quote: "kurzer wörtlicher Belegausschnitt mit Messgröße, Kategorie, Zahl und Einheit, höchstens 240 Zeichen" }] },
};

export const VISUALS_PROMPT_RULES = [
  "Ergänze optional ein Objekt visuals für visuelle Anker. Jedes Element ist freiwillig: Liefere es nur, wenn die gelieferten Claims oder Quelltexte es unmittelbar tragen; sonst lasse den Schlüssel weg oder setze null. Visuals sind Darstellung, kein zusätzlicher Wirkungsbeleg.",
  "key_figures (höchstens 3): nur Zahlen, die wörtlich im Claim oder Quelltext stehen, Schreibweise unverändert (Zahlwort bleibt Zahlwort); keine Umrechnung, Summe, Schätzung oder Ableitung. chart (nur type bar, 3 bis 8 Punkte): nur wenn die Quelle mindestens drei vergleichbare Zahlen derselben Einheit nennt. timeline (höchstens 4): nur Termine oder Fristen, die die Quelle nennt. affected_groups (höchstens 4) ausschließlich aus der festen Liste. tendency je Dimension als analytische Tendenz: chance = Wirkungspotenzial überwiegt, risiko = Wirkungsrisiko überwiegt, gemischt, offen; ex ante nie als eingetretene Wirkung.",
  "Für jeden Diagrammpunkt sind claim_id und evidence_quote Pflicht. Der kurze unveränderte Ausschnitt muss im zugehörigen Claim oder dessen konkretem Quellenauszug stehen und genau diesen Punkt tragen: dieselbe Messgröße (measure), Kategorie (label) sowie Zahl unmittelbar mit Einheit. Keine Währungen, Mengen oder Größenordnungen vermischen; keine Jahreszahl als Messwert. Generische Einheiten wie 'Einheit' reichen nicht. Wenn dieser Nachweis fehlt, chart weglassen. Keine zusätzlichen Quellenaufrufe nur für ein Diagramm.",
];

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Spiegelt die Zahlen-Erkennung des Qualitätsgates in lib.mjs (bewusst identisch gehalten).
export function numberTokens(value) {
  return new Set((String(value).match(/\b\d+(?:[.,]\d+)?(?:\s?%|\s?(?:Millionen|Milliarden|Euro|EUR|USD))?\b/gi) || [])
    .map((token) => token.match(/\d+(?:[.,]\d+)?/)?.[0].replace(".", ","))
    .filter(Boolean));
}

function cleanText(value, maxLength) {
  const text = String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? text.slice(0, maxLength).trim() : text;
}

function numbersSupported(text, allowed) {
  for (const token of numberTokens(text)) if (!allowed.has(token)) return false;
  return true;
}

const MONTHS = ["januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember"];

export function storySourceText(story = {}) {
  return [
    ...(story.sources || []).map((source) => `${source.title || ""} ${source.summary || ""}`),
    ...(story.claims || []).map((claim) => claim.claim || ""),
    story.source_summary || "",
  ].join(" ");
}

function normalizedEvidence(value) {
  return String(value || "").normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();
}

function comparableUnits(value) {
  return normalizedEvidence(value)
    .replace(/\b(?:mrd\.?|milliarden?)\b\.?/g, "milliarden")
    .replace(/\b(?:mio\.?|millionen?)\b\.?/g, "millionen")
    .replace(/\b(?:eur|euro)\b|€/g, "euro")
    .replace(/\bprozent\b|%/g, "prozent");
}

function escapedPattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function boundVisualClaims(story, claimId) {
  const sourceIds = new Set((story.sources || []).map(source => source.source_id));
  const sourceUrls = new Set((story.sources || []).map(source => source.url));
  return (story.claims || []).filter(claim => (!claimId || claim.claim_id === claimId)
    && claim.claim_id && (sourceIds.has(claim.source_id) || (claim.evidence || []).some(e => sourceUrls.has(e.url) || sourceIds.has(e.source_id))));
}

function amountInClaim(claim, value, unit) {
  const text = comparableUnits(claim.claim);
  const amount = escapedPattern(comparableUnits(value));
  const normalizedUnit = comparableUnits(unit);
  const suffix = normalizedUnit ? `\\s*${escapedPattern(normalizedUnit)}` : "";
  return new RegExp(`(?<![\\p{L}\\p{N}.,+−-])${amount}${suffix}(?![\\p{L}\\p{N}/²³])`, "u").test(text);
}

function dateInClaim(claim, date, label) {
  const text = normalizedEvidence(claim.claim);
  const [year, month, day] = date.split("-");
  if (day && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) return false;
  if (month && (!Number(month) || Number(month) > 12)) return false;
  const datePatterns = [date];
  if (month) {
    datePatterns.push(day ? `${day}.${month}.${year}` : `${month}.${year}`);
    datePatterns.push(`${day ? `${Number(day)}. ` : ""}${MONTHS[Number(month) - 1]} ${year}`);
  }
  if (!datePatterns.some(pattern => text.includes(pattern))) return false;
  const words = normalizedEvidence(label).match(/[\p{L}]{4,}/gu) || [];
  return words.length > 0 && words.some(word => text.includes(word));
}

// Fail closed for the optional chart, not for the article. A number found elsewhere
// in the story is insufficient: every point needs its own category/measure/unit proof.
function chartPointProof(raw, chart, story, allLabels) {
  const claim = (story.claims || []).find((item) => item.claim_id === raw?.claim_id);
  const quote = cleanText(raw?.evidence_quote, 240);
  const label = cleanText(raw?.label, 40);
  const value = raw?.value;
  if (!claim || !quote || !label || typeof value !== "number" || !Number.isFinite(value)) return null;
  const sourceIds = new Set((story.sources || []).map((item) => item.source_id));
  const sourceUrls = new Set((story.sources || []).map((item) => item.url));
  const evidence = (claim.evidence || []).filter((item) => sourceUrls.has(item.url) || sourceIds.has(item.source_id));
  if (!sourceIds.has(claim.source_id) && !evidence.length) return null;
  const texts = [claim.claim, ...evidence.map((item) => item.excerpt)].map(normalizedEvidence);
  const exactQuote = normalizedEvidence(quote);
  if (!texts.some((text) => text.includes(exactQuote))) return null;
  const hasPhrase = (phrase) => new RegExp(`(?<![\\p{L}\\p{N}])${escapedPattern(normalizedEvidence(phrase))}(?![\\p{L}\\p{N}])`, "u").test(exactQuote);
  if (!hasPhrase(label) || !hasPhrase(chart.measure)) return null;
  // A whole paragraph containing all categories cannot establish which value belongs
  // to which one. Request separate, unambiguous excerpts instead of guessing.
  if (allLabels.some((other) => other !== label && hasPhrase(other))) return null;
  const amount = escapedPattern(String(value)).replace(/\\\./g, "[.,]");
  const unit = escapedPattern(comparableUnits(chart.unit));
  const amountPattern = new RegExp(`(?<![\\d.,+−-])${amount}\\s*${unit}(?![\\p{L}\\p{N}/²³])`, "u");
  if (!amountPattern.test(comparableUnits(quote))) return null;
  return { label, value, claim_id: claim.claim_id, evidence_quote: quote };
}

export function sanitizeVisuals(input, story = {}) {
  const dropped = [];
  if (input === undefined || input === null) return { visuals: null, dropped };
  if (typeof input !== "object" || Array.isArray(input)) return { visuals: null, dropped: ["VISUALS_NOT_OBJECT"] };

  const sourceText = storySourceText(story);
  const lowerSource = sourceText.toLowerCase();
  const allowed = numberTokens(sourceText);
  const claimIds = new Set((story.claims || []).map((claim) => claim.claim_id));
  const output = {};

  const figures = [];
  for (const [index, raw] of (Array.isArray(input.key_figures) ? input.key_figures : []).entries()) {
    if (figures.length >= VISUALS_LIMITS.keyFigures) { dropped.push(`KEY_FIGURE_LIMIT:${index}`); continue; }
    const label = cleanText(raw?.label, VISUALS_LIMITS.label);
    const value = cleanText(raw?.value, VISUALS_LIMITS.value);
    const unit = cleanText(raw?.unit, VISUALS_LIMITS.unit);
    const context = cleanText(raw?.context, VISUALS_LIMITS.context);
    if (!label || !value) { dropped.push(`KEY_FIGURE_INCOMPLETE:${index}`); continue; }
    // Claim IDs may change when a newsroom check versions the ledger. Rebind a
    // stale reference only if exactly one current, source-bound claim proves it.
    const currentClaimId = (story.claims || []).some(claim => claim.claim_id === raw?.claim_id) ? raw.claim_id : undefined;
    const matchingClaims = boundVisualClaims(story, currentClaimId).filter(claim => amountInClaim(claim, value, unit));
    const supported = matchingClaims.length === 1;
    if (!supported || !numbersSupported(`${label} ${context} ${unit}`, allowed)) { dropped.push(`KEY_FIGURE_UNSUPPORTED:${value}`); continue; }
    const figure = { label, value, unit, context };
    figure.claim_id = matchingClaims[0].claim_id;
    figures.push(figure);
  }
  if (figures.length) output.key_figures = figures;

  const groups = [];
  for (const raw of Array.isArray(input.affected_groups) ? input.affected_groups : []) {
    const key = String(raw || "").trim().toLowerCase();
    if (!AFFECTED_GROUPS[key]) { dropped.push(`AFFECTED_GROUP_INVALID:${key || "leer"}`); continue; }
    if (groups.includes(key) || groups.length >= VISUALS_LIMITS.affectedGroups) continue;
    groups.push(key);
  }
  if (groups.length) output.affected_groups = groups;

  const timeline = [];
  for (const [index, raw] of (Array.isArray(input.timeline) ? input.timeline : []).entries()) {
    if (timeline.length >= VISUALS_LIMITS.timeline) { dropped.push(`TIMELINE_LIMIT:${index}`); continue; }
    const date = cleanText(raw?.date, 10);
    const label = cleanText(raw?.label, 80);
    const match = date.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
    if (!match || !label) { dropped.push(`TIMELINE_INVALID:${index}`); continue; }
    let matchingClaims = [];
    try { matchingClaims = boundVisualClaims(story, raw?.claim_id).filter(claim => dateInClaim(claim, date, label)); } catch { /* invalid calendar date */ }
    if (matchingClaims.length !== 1 || !numbersSupported(label, allowed)) { dropped.push(`TIMELINE_UNSUPPORTED:${date}`); continue; }
    timeline.push({ date, label, claim_id: matchingClaims[0].claim_id });
  }
  if (timeline.length) output.timeline = timeline.sort((a, b) => a.date.localeCompare(b.date));

  if (input.tendency && typeof input.tendency === "object" && !Array.isArray(input.tendency)) {
    const tendency = {};
    for (const key of Object.keys(DIMENSIONS)) {
      const value = String(input.tendency[key] || "").trim().toLowerCase();
      tendency[key] = TENDENCIES[value] ? value : "offen";
      if (value && !TENDENCIES[value]) dropped.push(`TENDENCY_INVALID:${key}`);
    }
    if (Object.values(tendency).some((value) => value !== "offen")) output.tendency = tendency;
  }

  const chart = input.chart;
  if (chart && typeof chart === "object" && !Array.isArray(chart)) {
    const title = cleanText(chart.title, VISUALS_LIMITS.title);
    const unit = cleanText(chart.unit, VISUALS_LIMITS.unit);
    const measure = cleanText(chart.measure, VISUALS_LIMITS.label);
    const points = [];
    const rawPoints = Array.isArray(chart.points) ? chart.points : [];
    const labels = rawPoints.map((point) => cleanText(point?.label, 40));
    for (const raw of rawPoints) {
      if (points.length >= VISUALS_LIMITS.chartPoints) break;
      const point = chartPointProof(raw, { measure, unit }, story, labels);
      if (!point) { dropped.push(`CHART_POINT_UNSUPPORTED:${raw?.value}`); continue; }
      points.push(point);
    }
    if (String(chart.type || "bar") !== "bar" || !title || !measure || !unit || /^(?:einheit(?:en)?|wert(?:e)?|anzahl|index|punkte?)$/i.test(unit)
      || points.length < VISUALS_LIMITS.chartMinPoints || points.length !== rawPoints.length
      || new Set(labels.map(normalizedEvidence)).size !== labels.length || !numbersSupported(`${title} ${unit}`, allowed)) {
      dropped.push("CHART_INVALID");
    } else {
      output.chart = { type: "bar", title, measure, unit, points };
    }
  }

  return { visuals: Object.keys(output).length ? output : null, dropped };
}

// ---------------------------------------------------------------------------
// Icons: ein Sprite pro Seite, Verwendung über <use href="#wt-i-…">.
// ---------------------------------------------------------------------------

const ICON_PATHS = {
  meldung: '<path d="M4 5h13v14H4z"/><path d="M17 8h3v9a2 2 0 0 1-2 2"/><path d="M7 9h7M7 12h7M7 15h4"/>',
  politik: '<path d="M3 21h18M5 21v-11M9 21v-11M15 21v-11M19 21v-11M3 10l9-6 9 6z"/>',
  wirtschaft: '<path d="M4 20h16"/><path d="M7 20v-8M12 20V6M17 20v-10"/>',
  klima: '<path d="M5 19c0-8 5-13 14-13-1 9-6 13-14 13z"/><path d="M5 19c3-4 6-7 10-9"/>',
  energie: '<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>',
  arbeit: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>',
  soziales: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5A5 5 0 0 1 21 20"/>',
  gesundheit: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/><path d="M7 11h2.5l1.5-2 2 4 1.5-2H17"/>',
  digitalisierung: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  ki: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  europa: '<circle cx="12" cy="12" r="9"/><g fill="currentColor" stroke="none"><circle cx="12" cy="6.5" r="1.1"/><circle cx="16.8" cy="9.2" r="1.1"/><circle cx="16.8" cy="14.8" r="1.1"/><circle cx="12" cy="17.5" r="1.1"/><circle cx="7.2" cy="14.8" r="1.1"/><circle cx="7.2" cy="9.2" r="1.1"/></g>',
  geopolitik: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  finanzen: '<circle cx="12" cy="12" r="9"/><path d="M15 8.5a4 4 0 1 0 0 7M7.5 10.5h6M7.5 13.5h6"/>',
  bildung: '<path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/>',
  mensch: '<circle cx="12" cy="7" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/>',
  planet: '<circle cx="12" cy="12" r="9"/><path d="M8 15c0-4 3-7 8-7-1 5-4 7-8 7z"/>',
  demokratie: '<path d="M12 3v18M4 21h16M6 7h12"/><path d="M6 7l-3 6h6zM18 7l-3 6h6z"/>',
  haushalte: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  unternehmen: '<rect x="4" y="3" width="16" height="18"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/>',
  beschaeftigte: '<circle cx="12" cy="6" r="3"/><rect x="5" y="12" width="14" height="9" rx="2"/><path d="M5 16h14"/>',
  kommunen: '<path d="M4 21h16M6 21V11h12v10M12 4l7 5H5z"/><path d="M10 21v-4h4v4"/>',
  patientinnen: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
  verbraucherinnen: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  kinder: '<circle cx="12" cy="6" r="2.5"/><path d="M8 20a4 4 0 0 1 8 0"/><path d="M12 9v6M9 12h6"/>',
  aeltere: '<circle cx="11" cy="6" r="2.5"/><path d="M7 21v-6a4 4 0 0 1 8 0v6M18 11v10"/>',
  investoren: '<path d="M4 19h16M5 15l4-4 3 3 7-7"/><path d="M15 7h4v4"/>',
  "tendenz-chance": '<path d="M6 18L18 6M9 6h9v9"/>',
  "tendenz-risiko": '<path d="M6 6l12 12M18 9v9H9"/>',
  "tendenz-gemischt": '<path d="M4 16l5-5 4 4 7-7"/><path d="M4 8l5 5 4-4 7 7"/>',
  offen: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',
  extern: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6H5V6h6"/>',
  quelle: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="M5 12l4 4L19 6"/>',
  pfeil: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  aktualisieren: '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>',
  app: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  glocke: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  suche: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  mechanismus: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  risiko: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  wahrheit: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  systemisch: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 7v4M12 11l-6 5M12 11l6 5"/>',
  transformation: '<path d="M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  resilienz: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v8"/>',
  beobachten: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  version: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  kalender: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  zahl: '<path d="M9 3l-2 18M17 3l-2 18M4 9h17M3 15h17"/>',
  folgen: '<path d="M3 12h4l3-6 4 12 3-6h4"/>',
};

export function iconMarkup(name) {
  return ICON_PATHS[name] || ICON_PATHS.meldung;
}

export function renderIconSprite() {
  const symbols = Object.entries(ICON_PATHS)
    .map(([name, path]) => `<symbol id="wt-i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${path}</symbol>`)
    .join("");
  return `<svg class="wt-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
}

export function renderIcon(name, className = "") {
  const key = ICON_PATHS[name] ? name : "meldung";
  return `<svg class="wt-icon${className ? ` ${className}` : ""}" aria-hidden="true" focusable="false"><use href="#wt-i-${key}"/></svg>`;
}

export function topicIcon(topics = []) {
  for (const topic of Array.isArray(topics) ? topics : [topics]) if (TOPIC_ICONS[topic]) return TOPIC_ICONS[topic];
  return "meldung";
}

export function relevanceLevel(value) {
  return RELEVANCE_LEVELS[String(value || "").trim()] ?? 0;
}

function meter(level, label, { className = "" } = {}) {
  const segments = Array.from({ length: 4 }, (_, index) => `<i${index < level ? ' class="is-filled"' : ""}></i>`).join("");
  return `<span class="wt-meter${className ? ` ${className}` : ""}${level === 0 ? " wt-meter--open" : ""}" data-level="${level}" role="img" aria-label="${escapeHtml(label)}">${segments}</span>`;
}

export function renderMaterialityMeter(importance) {
  const level = relevanceLevel(importance);
  return `${meter(level, `Materialität: ${importance || "offen"}`)}<span class="wt-meter__label">${escapeHtml(importance || "offen")}</span>`;
}

export function renderStatusChip(status) {
  const onTrack = STATUS_TRACK.includes(status);
  return `<span class="wt-chip wt-chip--status${onTrack ? "" : " wt-chip--open"}">${renderIcon(onTrack ? "check" : "uhr")}<span>${escapeHtml(status || "offen")}</span></span>`;
}

export function renderAnalysisTypeChip(analysisType, { note = true } = {}) {
  const type = ANALYSIS_TYPES[analysisType] || ANALYSIS_TYPES.monitoring;
  return `<span class="wt-chip wt-chip--type" title="${escapeHtml(type.note)}"><span>${escapeHtml(type.label)}</span>${note ? `<span class="wt-chip__note">${escapeHtml(type.note)}</span>` : ""}</span>`;
}

export function renderStatusTrack(status) {
  const current = STATUS_TRACK.indexOf(status);
  if (current === -1) {
    return `<div class="wt-track wt-track--open"><span class="wt-track__chip">${renderIcon("uhr")}<span>${escapeHtml(status || "offen")}</span></span><span class="wt-track__hint">kein fester Verfahrensstand, Beobachtung läuft</span></div>`;
  }
  const steps = STATUS_TRACK.map((step, index) => {
    const state = index < current ? "is-done" : index === current ? "is-current" : "is-next";
    return `<li class="wt-track__step ${state}"${index === current ? ' aria-current="step"' : ""}><span class="wt-track__dot"></span><span class="wt-track__label">${escapeHtml(STATUS_SHORT[step] || step)}</span></li>`;
  }).join("");
  return `<div class="wt-track"><ol class="wt-track__steps" aria-label="Verfahrensstand: ${escapeHtml(status)}">${steps}</ol></div>`;
}

export function renderTendency(value) {
  const tendency = TENDENCIES[value];
  if (!tendency || value === "offen") return "";
  return `<span class="wt-tendency wt-tendency--${escapeHtml(value)}" title="analytische Tendenz, kein Wirkungsnachweis">${renderIcon(tendency.icon)}<span>${escapeHtml(tendency.label)}</span></span>`;
}

export function renderDimensionMeters(analysis = {}, { compact = false, tendency = null } = {}) {
  const items = Object.entries(DIMENSIONS).map(([key, meta]) => {
    const value = analysis[key] || { relevance: "offen", rationale: "Noch nicht belastbar eingeordnet." };
    const level = relevanceLevel(value.relevance);
    const label = value.relevance || "offen";
    return `<div class="wt-dim wt-dim--${key}" data-level="${level}">
      <div class="wt-dim__head">${renderIcon(meta.icon)}<strong>${meta.label}</strong><span class="wt-dim__level">${escapeHtml(label)}</span>${tendency ? renderTendency(tendency[key]) : ""}</div>
      ${meter(level, `Relevanz für ${meta.label}: ${label}`, { className: "wt-dim__track" })}
      <p class="wt-dim__note${compact ? " sr-only" : ""}">${escapeHtml(value.rationale || "")}</p>
    </div>`;
  }).join("");
  return `<div class="wt-dims${compact ? " wt-dims--compact" : ""}">${items}</div>`;
}

export function renderImpactPath(analysis = {}, prose = (items) => (items || []).map(escapeHtml).join(" ")) {
  const steps = [
    { key: "mechanisms", badge: `${renderIcon("mechanismus")}<span>Wirkmechanismus</span>`, className: "wt-path__step--mechanism", title: "Wie die Maßnahme überhaupt wirken kann" },
    { key: "first_order", badge: "<b>1</b><span>Erste Ordnung – unmittelbar</span>", order: 1, title: "Erste Ordnung" },
    { key: "second_order", badge: "<b>2</b><span>Zweite Ordnung – nachgelagert</span>", order: 2, title: "Zweite Ordnung" },
    { key: "third_order", badge: "<b>3</b><span>Dritte Ordnung – systemisch</span>", order: 3, title: "Dritte Ordnung" },
  ].map((step) => `<li class="wt-path__step${step.className ? ` ${step.className}` : ""}"${step.order ? ` data-order="${step.order}"` : ""}><span class="wt-path__badge" title="${escapeHtml(step.title)}">${step.badge}</span><p>${prose(analysis[step.key])}</p></li>`).join("");
  return `<div class="wt-path"><ol class="wt-path__steps">${steps}</ol><p class="wt-path__legend">${renderIcon("folgen")}<span>Von links nach rechts wächst der Abstand zum gesicherten Sachverhalt: Die Fläche wird blasser, die Unsicherheit größer.</span></p></div>`;
}

export function renderGate(analysis = {}) {
  const gate = analysis.publication_gate;
  if (!gate || typeof gate !== "object") return "";
  const factors = (Array.isArray(gate.materiality_factors) ? gate.materiality_factors : [])
    .map((factor) => MATERIALITY_FACTORS[factor]).filter(Boolean);
  if (gate.exceptional_factor && gate.exceptional_factor !== "none" && MATERIALITY_FACTORS[gate.exceptional_factor]) {
    factors.push(`${MATERIALITY_FACTORS[gate.exceptional_factor]} (außergewöhnlich)`);
  }
  const chips = factors.map((factor) => `<span class="wt-factor">${escapeHtml(factor)}</span>`).join("");
  const newsValue = NEWS_VALUES[gate.news_value];
  return `${newsValue ? `<span class="wt-glance__note">${escapeHtml(newsValue)}</span>` : ""}${chips ? `<span class="wt-factors">${chips}</span>` : ""}`;
}

export function renderAtAGlance(story, { formatDate = (value) => String(value || "") } = {}) {
  const analysis = story.analysis || {};
  const type = ANALYSIS_TYPES[analysis.analysis_type] || ANALYSIS_TYPES.monitoring;
  const primaryCount = (story.sources || []).filter((source) => source.primary_source).length;
  const claimCount = (story.claims || []).length;
  const evidenceBasis = EVIDENCE_BASIS[analysis.publication_gate?.evidence_basis];
  const versionNote = Number(story.current_version || 1) > 1
    ? `Version ${story.current_version}, zuletzt ${formatDate(story.last_updated)}`
    : `Erstanalyse ${formatDate(story.last_updated)}`;
  return `<section class="wt-glance" aria-label="Auf einen Blick">
    <div class="wt-glance__item wt-glance__item--status"><span class="wt-glance__label">Verfahrensstand</span>${renderStatusTrack(analysis.status)}</div>
    <div class="wt-glance__item"><span class="wt-glance__label">Analyseart</span><strong class="wt-glance__value">${escapeHtml(type.label)}</strong><span class="wt-glance__note">${escapeHtml(type.note)}</span><span class="wt-glance__note">${escapeHtml(versionNote)}</span></div>
    <div class="wt-glance__item"><span class="wt-glance__label">Evidenzbasis</span><strong class="wt-glance__value">${primaryCount} ${primaryCount === 1 ? "Primärquelle" : "Primärquellen"}</strong><span class="wt-glance__note">${claimCount} ${claimCount === 1 ? "quellengebundener Claim" : "quellengebundene Claims"}${evidenceBasis ? ` · ${escapeHtml(evidenceBasis)}` : ""}</span></div>
    <div class="wt-glance__item"><span class="wt-glance__label">Materialität</span><span class="wt-glance__meter">${renderMaterialityMeter(analysis.importance)}</span>${renderGate(analysis)}</div>
  </section>`;
}

export function renderKeyFigures(visuals, story = {}) {
  const figures = visuals?.key_figures || [];
  if (!figures.length) return "";
  const publisherById = new Map((story.claims || []).map((claim) => [claim.claim_id,
    [...new Set((story.sources || []).filter(source => source.source_id === claim.source_id
      || (claim.evidence || []).some(evidence => evidence.url === source.url)).map(source => source.publisher))].join(", ")
  ]));
  const tiles = figures.map((figure) => {
    const publisher = publisherById.get(figure.claim_id);
    return `<div class="wt-figure"><span class="wt-figure__value">${escapeHtml(figure.value)}${figure.unit ? ` <small>${escapeHtml(figure.unit)}</small>` : ""}</span><span class="wt-figure__label">${escapeHtml(figure.label)}</span>${figure.context ? `<span class="wt-figure__context">${escapeHtml(figure.context)}</span>` : ""}${publisher ? `<span class="wt-figure__source">${renderIcon("quelle")}laut ${escapeHtml(publisher)}</span>` : ""}</div>`;
  }).join("");
  return `<div class="wt-figures" role="group" aria-label="Zahlen aus der Quelle">${tiles}</div>`;
}

export function renderAffectedGroups(visuals) {
  const groups = (visuals?.affected_groups || []).map((key) => AFFECTED_GROUPS[key]).filter(Boolean);
  if (!groups.length) return "";
  return `<div class="wt-groups"><span class="wt-groups__label">Möglicherweise betroffen</span>${groups.map((group) => `<span class="wt-group">${renderIcon(group.icon)}<span>${escapeHtml(group.label)}</span></span>`).join("")}</div>`;
}

export function renderTimeline(visuals) {
  const entries = visuals?.timeline || [];
  if (!entries.length) return "";
  const items = entries.map((entry) => {
    const [year, month, day] = entry.date.split("-");
    const display = day ? `${day}.${month}.${year}` : month ? `${MONTHS[Number(month) - 1]?.replace(/^./, (c) => c.toUpperCase()) || month} ${year}` : year;
    return `<li class="wt-timeline__item"><time datetime="${escapeHtml(entry.date)}">${escapeHtml(display)}</time><span>${escapeHtml(entry.label)}</span></li>`;
  }).join("");
  return `<div class="wt-timeline-wrap"><span class="wt-groups__label">${renderIcon("kalender")}Termine laut Quelle</span><ol class="wt-timeline">${items}</ol></div>`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(value);
}

export function renderChart(visuals) {
  const chart = visuals?.chart;
  if (!chart || !Array.isArray(chart.points) || chart.points.length < VISUALS_LIMITS.chartMinPoints) return "";
  const values = chart.points.map((point) => point.value);
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const width = 640;
  const labelWidth = 150;
  const rowHeight = 36;
  const plotWidth = width - labelWidth - 84;
  const zeroX = labelWidth + ((0 - min) / span) * plotWidth;
  const height = chart.points.length * rowHeight + 12;
  const bars = chart.points.map((point, index) => {
    const y = index * rowHeight + 8;
    const x = labelWidth + ((Math.min(point.value, 0) - min) / span) * plotWidth;
    const barWidth = Math.max(2, (Math.abs(point.value) / span) * plotWidth);
    const valueLabel = `${formatNumber(point.value)}${chart.unit ? ` ${chart.unit}` : ""}`;
    const textX = point.value < 0 ? x - 6 : x + barWidth + 6;
    return `<g class="wt-chart__row"><title>${escapeHtml(`${point.label}: ${valueLabel}`)}</title><text class="wt-chart__label" x="${labelWidth - 10}" y="${y + 18}" text-anchor="end">${escapeHtml(point.label)}</text><rect class="wt-chart__bar" x="${x.toFixed(1)}" y="${y}" width="${barWidth.toFixed(1)}" height="22" rx="3"/><text class="wt-chart__value" x="${textX.toFixed(1)}" y="${y + 16}" text-anchor="${point.value < 0 ? "end" : "start"}">${escapeHtml(valueLabel)}</text></g>`;
  }).join("");
  const rows = chart.points.map((point) => `<tr><th scope="row">${escapeHtml(point.label)}</th><td>${escapeHtml(formatNumber(point.value))}${chart.unit ? ` ${escapeHtml(chart.unit)}` : ""}</td></tr>`).join("");
  return `<figure class="wt-chart"><figcaption><span class="wt-groups__label">${renderIcon("wirtschaft")}Zahlen aus der Quelle</span><strong>${escapeHtml(chart.title)}</strong></figcaption>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}" class="wt-chart__svg"><line class="wt-chart__axis" x1="${zeroX.toFixed(1)}" y1="4" x2="${zeroX.toFixed(1)}" y2="${height - 4}"/>${bars}</svg>
    <details class="wt-chart__table"><summary>Als Tabelle anzeigen</summary><table><thead><tr><th scope="col">Kategorie</th><th scope="col">Wert</th></tr></thead><tbody>${rows}</tbody></table></details></figure>`;
}

export function publisherInitials(publisher = "") {
  const words = String(publisher).replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean);
  const initials = words.length >= 2 ? `${words[0][0]}${words[1][0]}` : String(publisher).slice(0, 2);
  return initials.toUpperCase();
}
