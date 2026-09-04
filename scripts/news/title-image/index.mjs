// WÖk-Titelbildsystem für den Wirkungsticker.
//
// Ein Rendering-Kern, zwei Darstellungsmodi:
//   editorial   – extern generiertes Symbolbild im WÖk-Rahmen (Branding, Rubrik,
//                 Überschrift, Kennzeichnung „KI-generiertes Symbolbild“)
//   impact_card – Wirkungskarte aus strukturierten Analysedaten (Rubrik,
//                 Überschrift, Dimensionsmeter, Verfahrensstand, Quelle)
//
// Ausgabe ist immer SVG mit eingebetteten Markenfonts (deterministisch, ohne
// npm-Abhängigkeit). PNG entsteht über rasterize.mjs. Fehlt im Editorial-Modus das
// Motiv, fällt der Renderer automatisch auf die Wirkungskarte zurück und meldet
// das als Warnung – eine Veröffentlichung wird dadurch nie blockiert.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { measure, fitText, FONTS } from "./text.mjs";
import { DIMENSIONS, STATUS_TRACK, ANALYSIS_TYPES, RELEVANCE_LEVELS, TOPIC_ICONS, iconMarkup } from "../visuals.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const FONT_DIR = path.join(ROOT, "assets/fonts");
const SIGNET_FILE = path.join(ROOT, "assets/img/brand/signet.svg");

export const MODES = ["editorial", "impact_card"];

export const SIZES = {
  og: { width: 1200, height: 630, layout: "landscape", label: "OpenGraph, LinkedIn, X (1,91:1)" },
  wide: { width: 1200, height: 675, layout: "landscape", label: "Website, 16:9" },
  square: { width: 1080, height: 1080, layout: "square", label: "Social, quadratisch (1:1)" },
};

// Farben aus assets/css/style.css und dem Ticker-Hero (news.css).
export const PALETTE = {
  navy: "#0B1020",
  navyDeep: "#07152C",
  teal: "#102D3A",
  greenDeep: "#174F43",
  green: "#2F7D5C",
  gold: "#C89B3C",
  goldLight: "#FFD27B",
  ivory: "#F6F1E8",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.74)",
  textSoft: "rgba(255,255,255,0.88)",
  dimHuman: "#B9C7EA",
  dimPlanet: "#63C08F",
  dimDemocracy: "#E1B65C",
  statusGreen: "#7ED4A6",
};

// Sichere Zonen als Anteile der Bildfläche (x, y, w, h in 0–1). Sie gelten für
// beide Modi; für den Editorial-Modus sind sie zugleich die Vorgabe an die
// Bildgenerierung: Wichtige Motivinhalte gehören in motifFocus, nichts Wichtiges
// in text, brand und label.
export const SAFE_AREAS = {
  landscape: {
    brand: { x: 0, y: 0, w: 0.55, h: 0.16 },
    text: { x: 0, y: 0.46, w: 0.64, h: 0.54 },
    label: { x: 0.64, y: 0.88, w: 0.36, h: 0.12 },
    motifFocus: { x: 0.42, y: 0.1, w: 0.54, h: 0.72 },
    avoid: ["linkes unteres Drittel (Text)", "linker oberer Streifen (Branding)", "rechte untere Ecke (Kennzeichnung)"],
  },
  square: {
    brand: { x: 0, y: 0, w: 0.7, h: 0.1 },
    text: { x: 0, y: 0.58, w: 1, h: 0.42 },
    label: { x: 0.55, y: 0.93, w: 0.45, h: 0.07 },
    motifFocus: { x: 0.08, y: 0.12, w: 0.84, h: 0.42 },
    avoid: ["untere 42 % (Text)", "oberer Streifen (Branding)", "rechte untere Ecke (Kennzeichnung)"],
  },
};

// Rubriken sind bewusst offen: bekannte Begriffe bekommen ein Icon, alle anderen
// das neutrale Meldungs-Icon. Die Beschriftung übernimmt den gelieferten Text.
export const CATEGORY_ICONS = {
  ...TOPIC_ICONS,
  Gesellschaft: "soziales", Infrastruktur: "kommunen", Technologie: "digitalisierung", Ressourcen: "klima",
  Sicherheit: "geopolitik", Verkehr: "kommunen", Mobilität: "kommunen", Wohnen: "haushalte", Steuern: "finanzen",
  Haushalt: "finanzen", Umwelt: "klima", Verwaltung: "politik", Recht: "demokratie", Kultur: "bildung",
};

const FONT_FILES = {
  "Source Serif 4": { 600: "source-serif-4-600.woff2", 700: "source-serif-4-700.woff2" },
  Inter: { 400: "inter-400.woff2", 500: "inter-500.woff2", 600: "inter-600.woff2", 700: "inter-700.woff2" },
};

const fontBase64Cache = new Map();

function fontBase64(file) {
  if (!fontBase64Cache.has(file)) fontBase64Cache.set(file, fs.readFileSync(path.join(FONT_DIR, file)).toString("base64"));
  return fontBase64Cache.get(file);
}

export function fontFaceStyle(mode = "embed", fontBase = "") {
  if (mode === "none") return "";
  const faces = [];
  for (const [family, weights] of Object.entries(FONT_FILES)) {
    for (const [weight, file] of Object.entries(weights)) {
      const src = mode === "embed" ? `url(data:font/woff2;base64,${fontBase64(file)})` : `url(${fontBase}${file})`;
      faces.push(`@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;font-display:block;src:${src} format("woff2");}`);
    }
  }
  return `<style>${faces.join("")}</style>`;
}

function escape(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fontAttrs(key) {
  const font = FONTS[key];
  return `font-family="${escape(`${font.family}, ${font.fallback}`)}" font-weight="${font.weight}"`;
}

let signetCache = null;
function signet(x, y, size) {
  if (!signetCache) {
    const raw = fs.readFileSync(SIGNET_FILE, "utf8");
    signetCache = raw.replace(/<\?xml[^>]*>/, "").replace(/<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")
      .replace(/<title[\s\S]*?<\/title>/, "").replace(/<desc[\s\S]*?<\/desc>/, "");
  }
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 120 120">${signetCache}</svg>`;
}

function icon(name, x, y, size, color, strokeWidth = 1.75) {
  return `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" viewBox="0 0 24 24" fill="none" stroke="${color}" color="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${iconMarkup(name)}</svg>`;
}

export function categoryIcon(category) {
  const tokens = (Array.isArray(category) ? category : String(category || "").split(/[·,/|]/)).map((token) => String(token).trim()).filter(Boolean);
  for (const token of tokens) {
    const match = Object.keys(CATEGORY_ICONS).find((key) => key.toLowerCase() === token.toLowerCase());
    if (match) return CATEGORY_ICONS[match];
  }
  return "meldung";
}

function categoryLabel(category) {
  const tokens = (Array.isArray(category) ? category : String(category || "").split(/[·,/|]/)).map((token) => String(token).trim()).filter(Boolean);
  return tokens.slice(0, 3).join(" · ");
}

function formatDate(value) {
  if (!value) return "";
  const parsed = /^\d{2}\.\d{2}\.\d{4}$/.test(String(value)) ? null : new Date(value);
  if (!parsed || Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium" }).format(parsed);
}

function levelOf(value) {
  if (value === null || value === undefined || value === "") return null;
  return RELEVANCE_LEVELS[String(value).trim()] ?? null;
}

function textLine(text, x, y, fontKey, size, fill, { anchor = "start", letterSpacing = 0, opacity = 1 } = {}) {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" ${fontAttrs(fontKey)} font-size="${size.toFixed(1)}" fill="${fill}"${anchor !== "start" ? ` text-anchor="${anchor}"` : ""}${letterSpacing ? ` letter-spacing="${letterSpacing.toFixed(2)}"` : ""}${opacity !== 1 ? ` opacity="${opacity}"` : ""}>${escape(text)}</text>`;
}

function truncateLine(text, fontKey, size, maxWidth) {
  let value = String(text || "").trim();
  if (measure(value, fontKey, size) <= maxWidth) return value;
  while (value && measure(`${value} …`, fontKey, size) > maxWidth) value = value.replace(/\s*\S+$/, "");
  return `${value.replace(/[\s,;:–-]+$/, "")} …`;
}

// --- gemeinsame Bausteine ------------------------------------------------------

function brandRow(u, P, W) {
  const size = 46 * u;
  const y = P - 6 * u;
  const baseline = y + size / 2 + 6 * u;
  const wordmark = "WIRKUNGSÖKONOMIE";
  const spacing = 2.2 * u;
  const textX = P + size + 16 * u;
  const wordmarkWidth = measure(wordmark, "sans-600", 15 * u, { letterSpacing: spacing });
  const dividerX = textX + wordmarkWidth + 14 * u;
  return [
    signet(P, y, size),
    textLine(wordmark, textX, baseline, "sans-600", 15 * u, PALETTE.textSoft, { letterSpacing: spacing }),
    `<rect x="${dividerX.toFixed(1)}" y="${(baseline - 13 * u).toFixed(1)}" width="${(1.5 * u).toFixed(1)}" height="${(16 * u).toFixed(1)}" fill="${PALETTE.white}" opacity="0.35"/>`,
    textLine("WIRKUNGSTICKER", dividerX + 14 * u, baseline, "sans-700", 15 * u, PALETTE.gold, { letterSpacing: spacing }),
  ].join("");
}

function labelPill(text, iconName, u, rightX, baselineY) {
  const size = 13 * u;
  const paddingX = 12 * u;
  const iconSize = 15 * u;
  const width = measure(text, "sans-600", size) + paddingX * 2 + iconSize + 7 * u;
  const height = 30 * u;
  const x = rightX - width;
  const y = baselineY - 20 * u;
  return `<g><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${width.toFixed(1)}" height="${height.toFixed(1)}" rx="${(height / 2).toFixed(1)}" fill="${PALETTE.navyDeep}" fill-opacity="0.55" stroke="${PALETTE.white}" stroke-opacity="0.28"/>${icon(iconName, x + paddingX, y + (height - iconSize) / 2, iconSize, PALETTE.gold)}${textLine(text, x + paddingX + iconSize + 7 * u, y + height / 2 + size * 0.36, "sans-600", size, PALETTE.textSoft)}</g>`;
}

function footerRow(u, P, W, H, { source, date, label, labelIcon, maxWidthFraction }) {
  const baseline = H - P + 4 * u;
  const parts = [];
  const sourceText = [source, date ? `Ausgangsmeldung ${date}` : ""].filter(Boolean).join(" · ");
  if (sourceText) {
    const maxWidth = W * maxWidthFraction - P;
    parts.push(icon("quelle", P, baseline - 14 * u, 17 * u, PALETTE.textMuted));
    parts.push(textLine(truncateLine(sourceText, "sans-500", 16 * u, maxWidth - 24 * u), P + 24 * u, baseline, "sans-500", 16 * u, PALETTE.textMuted));
  }
  if (label) parts.push(labelPill(label, labelIcon, u, W - P, baseline));
  return parts.join("");
}

function headlineBlock(u, { headline, category, x, bottom, maxWidth, sizes, maxLines, minLinesAtMinSize }) {
  const warnings = [];
  const iconName = categoryIcon(category);
  if (category && iconName === "meldung") warnings.push("CATEGORY_ICON_FALLBACK");
  let fit = fitText(headline, { fontKey: "serif-700", sizes, maxWidth, maxLines });
  if (fit.truncated && minLinesAtMinSize > maxLines) {
    fit = fitText(headline, { fontKey: "serif-700", sizes: [sizes[sizes.length - 1]], maxWidth, maxLines: minLinesAtMinSize });
  }
  if (fit.truncated) warnings.push("HEADLINE_TRUNCATED");
  const lineHeight = fit.size * 1.12;
  const headlineHeight = fit.lines.length * lineHeight;
  const label = categoryLabel(category);
  const kickerSize = 15 * u;
  const kickerHeight = label ? kickerSize + 22 * u : 0;
  const top = bottom - headlineHeight - kickerHeight;
  const parts = [];
  parts.push(`<rect x="${(x - 22 * u).toFixed(1)}" y="${(top - 4 * u).toFixed(1)}" width="${(5 * u).toFixed(1)}" height="${(headlineHeight + kickerHeight + 4 * u).toFixed(1)}" rx="${(2.5 * u).toFixed(1)}" fill="${PALETTE.gold}"/>`);
  if (label) {
    parts.push(icon(iconName, x, top - 2 * u, 20 * u, PALETTE.gold));
    parts.push(textLine(truncateLine(label.toUpperCase(), "sans-700", kickerSize, maxWidth - 30 * u), x + 28 * u, top + kickerSize * 0.9, "sans-700", kickerSize, PALETTE.gold, { letterSpacing: 2.4 * u }));
  }
  fit.lines.forEach((line, index) => {
    parts.push(textLine(line, x, top + kickerHeight + lineHeight * index + fit.size * 0.86, "serif-700", fit.size, PALETTE.white));
  });
  return { markup: parts.join(""), top, height: headlineHeight + kickerHeight, size: fit.size, lines: fit.lines, truncated: fit.truncated, warnings };
}

function meter(x, y, width, height, level, color, u) {
  const gap = 5 * u;
  const segment = (width - gap * 3) / 4;
  const parts = [];
  for (let index = 0; index < 4; index += 1) {
    const sx = x + index * (segment + gap);
    if (level === null) {
      parts.push(`<rect x="${sx.toFixed(1)}" y="${y.toFixed(1)}" width="${segment.toFixed(1)}" height="${height.toFixed(1)}" rx="${(3 * u).toFixed(1)}" fill="none" stroke="${color}" stroke-opacity="0.55" stroke-dasharray="${(4 * u).toFixed(1)} ${(4 * u).toFixed(1)}"/>`);
    } else {
      parts.push(`<rect x="${sx.toFixed(1)}" y="${y.toFixed(1)}" width="${segment.toFixed(1)}" height="${height.toFixed(1)}" rx="${(3 * u).toFixed(1)}" fill="${color}" fill-opacity="${index < level ? 1 : 0.22}"/>`);
    }
  }
  return parts.join("");
}

function chip(text, iconName, iconColor, x, y, u) {
  const size = 14 * u;
  const height = 32 * u;
  const paddingX = 12 * u;
  const iconSize = 15 * u;
  const width = measure(text, "sans-600", size) + paddingX * 2 + iconSize + 7 * u;
  return { width, markup: `<g><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${width.toFixed(1)}" height="${height.toFixed(1)}" rx="${(height / 2).toFixed(1)}" fill="${PALETTE.white}" fill-opacity="0.07" stroke="${PALETTE.white}" stroke-opacity="0.26"/>${icon(iconName, x + paddingX, y + (height - iconSize) / 2, iconSize, iconColor)}${textLine(text, x + paddingX + iconSize + 7 * u, y + height / 2 + size * 0.36, "sans-600", size, PALETTE.textSoft)}</g>` };
}

const DIMENSION_COLORS = { human: PALETTE.dimHuman, planet: PALETTE.dimPlanet, democracy: PALETTE.dimDemocracy };

function impactPanel(u, { x, y, width, height, dimensions, status, analysisType, horizontal = false }) {
  const pad = 26 * u;
  const parts = [];
  parts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${width.toFixed(1)}" height="${height.toFixed(1)}" rx="${(18 * u).toFixed(1)}" fill="${PALETTE.white}" fill-opacity="0.07" stroke="${PALETTE.white}" stroke-opacity="0.16"/>`);
  parts.push(textLine("WIRKUNG AUF", x + pad, y + pad + 11 * u, "sans-700", 12.5 * u, PALETTE.gold, { letterSpacing: 2 * u }));
  const rowsTop = y + pad + 34 * u;
  const keys = Object.keys(DIMENSIONS);
  const innerWidth = width - pad * 2;
  const columnGap = 22 * u;
  const columnWidth = horizontal ? (innerWidth - columnGap * (keys.length - 1)) / keys.length : innerWidth;
  const rowHeight = horizontal ? 0 : 92 * u;
  keys.forEach((key, index) => {
    const meta = DIMENSIONS[key];
    const color = DIMENSION_COLORS[key];
    const level = levelOf(dimensions?.[key]);
    const levelText = level === null ? "offen" : String(dimensions[key]);
    const rx = x + pad + (horizontal ? index * (columnWidth + columnGap) : 0);
    const ry = rowsTop + (horizontal ? 0 : index * rowHeight);
    parts.push(icon(meta.icon, rx, ry, 22 * u, color));
    parts.push(textLine(meta.label, rx + 32 * u, ry + 17 * u, "sans-600", 20 * u, PALETTE.white));
    parts.push(textLine(levelText, rx + columnWidth, ry + 17 * u, "sans-500", 15 * u, PALETTE.textMuted, { anchor: "end" }));
    parts.push(meter(rx, ry + 36 * u, columnWidth, 13 * u, level, color, u));
  });
  const chipsY = horizontal ? rowsTop + 74 * u : rowsTop + keys.length * rowHeight - 12 * u;
  let chipX = x + pad;
  const onTrack = STATUS_TRACK.includes(status);
  if (status) {
    const statusChip = chip(status, onTrack ? "check" : "uhr", onTrack ? PALETTE.statusGreen : PALETTE.gold, chipX, chipsY, u);
    parts.push(statusChip.markup);
    chipX += statusChip.width + 10 * u;
  }
  const type = ANALYSIS_TYPES[analysisType];
  if (type) {
    const typeChip = chip(type.label, "beobachten", PALETTE.textMuted, chipX, chipsY, u);
    if (chipX + typeChip.width <= x + width - pad) parts.push(typeChip.markup);
  }
  return parts.join("");
}

function watermark(u, iconName, x, y, size) {
  return icon(iconName, x, y, size, PALETTE.gold, 0.9).replace('fill="none"', 'fill="none" opacity="0.35"');
}

// --- Ground ---------------------------------------------------------------------

function ground(W, H, { withImage = false }) {
  return `<defs>
<linearGradient id="wt-ground" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${PALETTE.navyDeep}"/><stop offset="0.62" stop-color="${PALETTE.teal}"/><stop offset="1" stop-color="${PALETTE.greenDeep}"/></linearGradient>
<radialGradient id="wt-accent" cx="0.88" cy="0.12" r="0.5"><stop offset="0" stop-color="${PALETTE.gold}" stop-opacity="0.22"/><stop offset="1" stop-color="${PALETTE.gold}" stop-opacity="0"/></radialGradient>
<linearGradient id="wt-shade" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${PALETTE.navyDeep}" stop-opacity="0.96"/><stop offset="0.42" stop-color="${PALETTE.navyDeep}" stop-opacity="0.62"/><stop offset="0.74" stop-color="${PALETTE.navyDeep}" stop-opacity="0.06"/><stop offset="1" stop-color="${PALETTE.navyDeep}" stop-opacity="0"/></linearGradient>
<linearGradient id="wt-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PALETTE.navyDeep}" stop-opacity="0.62"/><stop offset="1" stop-color="${PALETTE.navyDeep}" stop-opacity="0"/></linearGradient>
<linearGradient id="wt-bottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PALETTE.navyDeep}" stop-opacity="0"/><stop offset="1" stop-color="${PALETTE.navyDeep}" stop-opacity="0.82"/></linearGradient>
<clipPath id="wt-frame"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<rect width="${W}" height="${H}" fill="url(#wt-ground)"/>${withImage ? "" : `<rect width="${W}" height="${H}" fill="url(#wt-accent)"/>`}`;
}

// --- Layouts --------------------------------------------------------------------

function renderLandscape(input, W, H, u, P, mode) {
  const parts = [];
  const warnings = [];
  const areas = SAFE_AREAS.landscape;
  parts.push(ground(W, H, { withImage: mode === "editorial" }));
  if (mode === "editorial") {
    const align = input.image.focus === "center" ? "xMidYMid" : input.image.focus === "left" ? "xMinYMid" : "xMaxYMid";
    parts.push(`<image href="${escape(input.image.src)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="${align} slice" clip-path="url(#wt-frame)"/>`);
    parts.push(`<rect width="${W}" height="${H}" fill="url(#wt-shade)"/>`);
    parts.push(`<rect width="${W}" height="${(H * 0.26).toFixed(1)}" fill="url(#wt-top)"/>`);
    parts.push(`<rect y="${(H * 0.55).toFixed(1)}" width="${W}" height="${(H * 0.45).toFixed(1)}" fill="url(#wt-bottom)"/>`);
  }
  parts.push(brandRow(u, P, W));

  const textX = P + 22 * u;
  const textWidth = (mode === "editorial" ? areas.text.w * W : 0.57 * W) - textX - 8 * u;
  const footerBaseline = H - P + 4 * u;
  const block = headlineBlock(u, {
    headline: input.headline, category: input.category, x: textX, bottom: footerBaseline - 44 * u, maxWidth: textWidth,
    sizes: [62 * u, 54 * u, 47 * u, 41 * u], maxLines: 3, minLinesAtMinSize: 5,
  });
  warnings.push(...block.warnings);
  const brandBottom = P + 48 * u;
  if (block.top < brandBottom + 24 * u) warnings.push("HEADLINE_NEAR_BRAND");

  if (mode === "impact_card") {
    const panelX = 0.6 * W;
    const panelWidth = W - panelX - P;
    const panelTop = P + 58 * u;
    const panelBottom = footerBaseline - 40 * u;
    const hasDimensions = input.dimensions && Object.values(input.dimensions).some((value) => levelOf(value) !== null);
    if (hasDimensions || input.status) {
      parts.push(impactPanel(u, { x: panelX, y: panelTop, width: panelWidth, height: panelBottom - panelTop, dimensions: input.dimensions || {}, status: input.status, analysisType: input.analysisType }));
    } else {
      warnings.push("IMPACT_DATA_MISSING");
      parts.push(watermark(u, categoryIcon(input.category), panelX + panelWidth * 0.2, panelTop + (panelBottom - panelTop - panelWidth * 0.6) / 2, panelWidth * 0.6));
    }
  }
  if (input.headlineVisible !== false) parts.push(block.markup);
  else parts.push(watermark(u, categoryIcon(input.category), textX, H * 0.42, 130 * u));
  parts.push(footerRow(u, P, W, H, {
    source: input.source, date: input.date,
    label: input.label, labelIcon: mode === "editorial" ? "ki" : "folgen", maxWidthFraction: 0.6,
  }));
  return { parts, warnings, block };
}

function renderSquare(input, W, H, u, P, mode) {
  const parts = [];
  const warnings = [];
  parts.push(ground(W, H, { withImage: mode === "editorial" }));
  const splitY = H * 0.58;
  if (mode === "editorial") {
    parts.push(`<image href="${escape(input.image.src)}" x="0" y="0" width="${W}" height="${(splitY + H * 0.12).toFixed(1)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#wt-frame)"/>`);
    parts.push(`<rect width="${W}" height="${(H * 0.2).toFixed(1)}" fill="url(#wt-top)"/>`);
    parts.push(`<rect y="${(H * 0.3).toFixed(1)}" width="${W}" height="${(H * 0.42).toFixed(1)}" fill="url(#wt-bottom)"/>`);
    parts.push(`<rect y="${(H * 0.7).toFixed(1)}" width="${W}" height="${(H * 0.3).toFixed(1)}" fill="${PALETTE.navyDeep}" fill-opacity="0.82"/>`);
  }
  parts.push(brandRow(u, P, W));
  const textX = P + 22 * u;
  const textWidth = W - textX - P;
  const footerBaseline = H - P + 4 * u;
  const block = headlineBlock(u, {
    headline: input.headline, category: input.category, x: textX, bottom: footerBaseline - 44 * u, maxWidth: textWidth,
    sizes: [58 * u, 50 * u, 44 * u, 38 * u], maxLines: 3, minLinesAtMinSize: 4,
  });
  warnings.push(...block.warnings);
  if (mode === "impact_card") {
    const gapTop = P + 62 * u;
    const gapBottom = block.top - 34 * u;
    const hasDimensions = input.dimensions && Object.values(input.dimensions).some((value) => levelOf(value) !== null);
    if (hasDimensions || input.status) {
      // Kompaktes Panel, mittig im freien Raum zwischen Branding und Textblock.
      const panelHeight = Math.min(gapBottom - gapTop, 196 * u);
      const panelTop = gapTop + Math.max(0, (gapBottom - gapTop - panelHeight) / 2);
      parts.push(impactPanel(u, { x: P, y: panelTop, width: W - P * 2, height: panelHeight, dimensions: input.dimensions || {}, status: input.status, analysisType: input.analysisType, horizontal: true }));
    } else {
      warnings.push("IMPACT_DATA_MISSING");
      const size = Math.min(gapBottom - gapTop, 260 * u);
      parts.push(watermark(u, categoryIcon(input.category), W / 2 - size / 2, gapTop + (gapBottom - gapTop - size) / 2, size));
    }
  }
  parts.push(block.markup);
  parts.push(footerRow(u, P, W, H, {
    source: input.source, date: input.date,
    label: input.label, labelIcon: mode === "editorial" ? "ki" : "folgen", maxWidthFraction: 0.58,
  }));
  return { parts, warnings, block };
}

// --- Entry Points ---------------------------------------------------------------

export function normalizeInput(input = {}) {
  const warnings = [];
  let mode = MODES.includes(input.mode) ? input.mode : "impact_card";
  if (input.mode && !MODES.includes(input.mode)) warnings.push("MODE_INVALID");
  const image = typeof input.image === "string" ? { src: input.image } : (input.image && typeof input.image === "object" ? { ...input.image } : null);
  if (mode === "editorial" && !image?.src) {
    warnings.push("EDITORIAL_IMAGE_MISSING");
    mode = "impact_card";
  }
  const dimensions = input.dimensions && typeof input.dimensions === "object"
    ? Object.fromEntries(Object.keys(DIMENSIONS).map((key) => {
      const raw = input.dimensions[key];
      const value = raw && typeof raw === "object" ? raw.relevance : raw;
      return [key, levelOf(value) === null ? null : String(value).trim()];
    }))
    : null;
  const label = input.label !== undefined ? input.label : (mode === "editorial" ? "KI-generiertes Symbolbild" : "Wirkungskarte · WÖk-Einordnung");
  return {
    warnings,
    mode,
    image,
    headline: String(input.headline || "Wirkungsticker").replace(/\s+/g, " ").trim(),
    category: input.category ?? null,
    source: input.source ? String(input.source).trim() : null,
    date: formatDate(input.date),
    dimensions,
    status: input.status ? String(input.status).trim() : null,
    analysisType: input.analysisType || input.analysis_type || null,
    label: label ? String(label) : null,
  };
}

export function renderTitleImage(rawInput = {}, options = {}) {
  const input = normalizeInput(rawInput);
  input.headlineVisible = options.headlineVisible !== false;
  const sizeKey = typeof options.size === "string" && SIZES[options.size] ? options.size : "og";
  const size = typeof options.size === "object" && options.size?.width ? { ...options.size, layout: options.size.width === options.size.height ? "square" : "landscape" } : SIZES[sizeKey];
  const W = size.width;
  const H = size.height;
  const u = W / 1200;
  const P = 56 * u;
  const layout = size.layout === "square" ? renderSquare : renderLandscape;
  const { parts, warnings, block } = layout(input, W, H, u, P, input.mode);
  const fonts = fontFaceStyle(options.fonts || "embed", options.fontBase || "");
  const title = escape(input.headline);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">${fonts}${parts.join("")}</svg>`;
  return {
    svg,
    width: W,
    height: H,
    mode: input.mode,
    size: typeof options.size === "object" ? "custom" : sizeKey,
    layout: { headlineSize: Math.round(block.size * 10) / 10, lines: block.lines, truncated: block.truncated, safeAreas: SAFE_AREAS[size.layout] },
    warnings: [...input.warnings, ...warnings],
  };
}

// Abbildung einer Ticker-Akte (interner Datensatz aus data/news/stories.json oder
// öffentlicher Datensatz aus wirkungsticker/data/stories.json) auf die Eingaben.
export function storyToTitleInput(story = {}, overrides = {}) {
  const analysis = story.analysis || {};
  const rawDimensions = story.dimensions || { human: analysis.human, planet: analysis.planet, democracy: analysis.democracy };
  const dimensions = Object.fromEntries(Object.keys(DIMENSIONS).map((key) => [key, rawDimensions?.[key]?.relevance ?? rawDimensions?.[key] ?? null]));
  const sources = Array.isArray(story.sources) ? story.sources : [];
  const primary = sources.find((source) => source.primary_source) || sources[0] || null;
  const earliest = sources.map((source) => Date.parse(source.published_at || "")).filter(Number.isFinite).sort((a, b) => a - b)[0];
  const titleImage = story.title_image || {};
  return {
    mode: overrides.mode || titleImage.mode || (overrides.image || titleImage.src ? "editorial" : "impact_card"),
    image: overrides.image || (titleImage.src ? { src: titleImage.src, focus: titleImage.focus } : null),
    headline: story.title,
    category: story.topic,
    source: primary?.publisher || null,
    date: earliest ? new Date(earliest).toISOString() : story.first_seen || null,
    dimensions: Object.values(dimensions).some(Boolean) ? dimensions : null,
    status: story.status || analysis.status || null,
    analysisType: story.analysis_type || analysis.analysis_type || null,
    ...overrides,
  };
}

export function renderTitleImageFromStory(story, options = {}) {
  const { mode, image, ...renderOptions } = options;
  return renderTitleImage(storyToTitleInput(story, { ...(mode ? { mode } : {}), ...(image ? { image } : {}) }), renderOptions);
}

export function describeSystem() {
  return {
    entry: "scripts/news/title-image/index.mjs",
    functions: ["renderTitleImage(input, { size, fonts, fontBase })", "renderTitleImageFromStory(story, { mode, image, size, fonts })", "storyToTitleInput(story, overrides)"],
    modes: MODES,
    sizes: Object.fromEntries(Object.entries(SIZES).map(([key, value]) => [key, `${value.width}×${value.height} (${value.label})`])),
    safeAreas: SAFE_AREAS,
    fonts: Object.fromEntries(Object.entries(FONT_FILES).map(([family, weights]) => [family, Object.values(weights)])),
    palette: PALETTE,
  };
}
