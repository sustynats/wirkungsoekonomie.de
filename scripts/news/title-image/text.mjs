// Textmaß und Zeilenumbruch für das Titelbildsystem.
//
// Die Glyphenbreiten stammen aus font-metrics.json (gemessen mit measure-fonts.html
// über die im Repository liegenden Markenfonts). Damit ist der Umbruch ohne
// Browser und ohne npm-Abhängigkeit reproduzierbar. Kerning wird über die
// gemessenen Paare angenähert, eine kleine Sicherheitsreserve deckt den Rest ab.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const METRICS = JSON.parse(fs.readFileSync(path.join(HERE, "font-metrics.json"), "utf8"));
const SAFETY = 1.03;

export const FONTS = {
  "serif-600": { family: "Source Serif 4", weight: 600, fallback: "Georgia, 'Times New Roman', serif" },
  "serif-700": { family: "Source Serif 4", weight: 700, fallback: "Georgia, 'Times New Roman', serif" },
  "sans-400": { family: "Inter", weight: 400, fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  "sans-500": { family: "Inter", weight: 500, fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  "sans-600": { family: "Inter", weight: 600, fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  "sans-700": { family: "Inter", weight: 700, fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
};

function glyphWidth(font, char) {
  if (font.widths[char] !== undefined) return font.widths[char];
  const base = char.normalize("NFD")[0];
  if (base && font.widths[base] !== undefined) return font.widths[base];
  return font.widths.n;
}

export function measure(text, fontKey, size, { letterSpacing = 0 } = {}) {
  const font = METRICS.fonts[fontKey] || METRICS.fonts["sans-500"];
  let width = 0;
  let previous = "";
  for (const char of String(text)) {
    width += glyphWidth(font, char);
    const pair = font.pairs[previous + char];
    if (pair) width += pair;
    previous = char;
  }
  const characters = [...String(text)].length;
  return width * size * SAFETY + Math.max(0, characters - 1) * letterSpacing;
}

export function wrapText(text, { fontKey, size, maxWidth, maxLines = Infinity, letterSpacing = 0 }) {
  const fits = (value) => measure(value, fontKey, size, { letterSpacing }) <= maxWidth;
  const words = String(text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines = [];
  let current = "";
  let broken = 0;
  for (let word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (fits(candidate)) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = "";
    while (!fits(word)) {
      let cut = -1;
      for (let index = word.length - 1; index > 0; index -= 1) {
        if ("-–/".includes(word[index - 1]) && fits(word.slice(0, index))) { cut = index; break; }
      }
      if (cut > 0) {
        broken += 1;
        lines.push(word.slice(0, cut));
        word = word.slice(cut);
        continue;
      }
      for (let index = word.length - 1; index > 1; index -= 1) {
        if (fits(`${word.slice(0, index)}-`)) { cut = index; break; }
      }
      if (cut <= 0) break;
      broken += 1;
      lines.push(`${word.slice(0, cut)}-`);
      word = word.slice(cut);
    }
    current = word;
  }
  if (current) lines.push(current);
  const overflow = lines.length > maxLines;
  return { lines: overflow ? lines.slice(0, maxLines) : lines, overflow, broken, remaining: overflow ? lines.slice(maxLines).join(" ") : "" };
}

// Wählt die größte Schriftgröße, bei der der Text in maxLines passt. Reicht die
// kleinste Größe nicht, wird auf maxLines gekürzt und mit Auslassungszeichen beendet.
export function fitText(text, { fontKey, sizes, maxWidth, maxLines, letterSpacing = 0 }) {
  // Erst die größte Schriftgröße ohne erzwungene Worttrennung, dann ohne Überlauf.
  const attempts = sizes.map((size) => ({ size, result: wrapText(text, { fontKey, size, maxWidth, maxLines, letterSpacing }) }));
  const clean = attempts.find(({ result }) => !result.overflow && result.broken === 0);
  if (clean) return { size: clean.size, lines: clean.result.lines, truncated: false };
  const fitting = attempts.find(({ result }) => !result.overflow);
  if (fitting) return { size: fitting.size, lines: fitting.result.lines, truncated: false };
  const size = sizes[sizes.length - 1];
  const full = wrapText(text, { fontKey, size, maxWidth, letterSpacing });
  const lines = full.lines.slice(0, maxLines);
  let last = `${lines[maxLines - 1]} ${full.lines.slice(maxLines).join(" ")}`.trim();
  while (last && measure(`${last} …`, fontKey, size, { letterSpacing }) > maxWidth) last = last.replace(/\s*\S+$/, "");
  lines[maxLines - 1] = `${(last || lines[maxLines - 1]).replace(/[\s,;:–-]+$/, "")} …`;
  return { size, lines, truncated: true };
}

export function metricsInfo() {
  return Object.fromEntries(Object.entries(METRICS.fonts).map(([key, font]) => [key, { family: font.family, weight: font.weight, loaded: font.loaded, glyphs: Object.keys(font.widths).length }]));
}
