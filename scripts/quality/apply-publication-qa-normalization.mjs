import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const TARGETS = [
  "404.html",
  "assets/downloads",
  "akademie.html",
  "anwendungen.html",
  "begriffe",
  "bibliothek",
  "blog.html",
  "blog",
  "buch.html",
  "datenschutz.html",
  "dokumente",
  "downloads",
  "downloads.html",
  "erleben.html",
  "erleben",
  "evidenz",
  "fachbibliothek",
  "fuer",
  "glossar.html",
  "index.html",
  "kompass.html",
  "mehr.html",
  "methodik",
  "mitmachen.html",
  "modell.html",
  "ordnung",
  "portale",
  "referenz",
  "referenzrahmen",
  "scanner.html",
  "scorecard-dashboard.html",
  "so-wirkt-wirkungsoekonomie",
  "suche.html",
  "tools",
  "verstehen",
  "werkstatt",
  "werkzeuge",
  "wirkungsoekonomie.html",
  "wirkungsfelder",
  "wirkungsradar",
  "wissen",
  "woek-ki",
  "woek-id-register",
  "workflow.html",
];

const SKIP_DIRS = new Set([".git", ".codex-backup", "node_modules", "outputs", "source-assets"]);

const LIGATURES = new Map([
  ["\uFB00", "ff"],
  ["\uFB01", "fi"],
  ["\uFB02", "fl"],
  ["\uFB03", "ffi"],
  ["\uFB04", "ffl"],
  ["\uFB05", "st"],
  ["\uFB06", "st"],
]);

const TEXT_REPLACEMENTS = [
  ["ProtectionNotice", "Schutzlinien"],
  ["Kanonische Online-Fassung", "Onlinefassung"],
  ["kanonische Online-Fassung", "Onlinefassung"],
  ["Kanonische Wirkungsfeldseite", "Zentrale Wirkungsfeldseite"],
  ["kanonische Wirkungsfeldseite", "zentrale Wirkungsfeldseite"],
  ["Kanonische Seitenadresse", "Zentrale Seitenadresse"],
  ["kanonische Seitenadresse", "zentrale Seitenadresse"],
  ["Kanonische", "Zentrale"],
  ["kanonische", "zentrale"],
  ["kanonisch", "zentral"],
  ["fachoeffentlich", "fachöffentlich"],
  ["Fachoeffentlich", "Fachöffentlich"],
  ["wirkungsoekonomisch", "wirkungsökonomisch"],
  ["Wirkungsoekonomisch", "Wirkungsökonomisch"],
  ["wirkungsoekonomische", "wirkungsökonomische"],
  ["Wirkungsoekonomische", "Wirkungsökonomische"],
  ["wirkungsoekonomischer", "wirkungsökonomischer"],
  ["Wirkungsoekonomischer", "Wirkungsökonomischer"],
  ["wirkungsoekonomischen", "wirkungsökonomischen"],
  ["Wirkungsoekonomischen", "Wirkungsökonomischen"],
  ["wirkungsoekonomisches", "wirkungsökonomisches"],
  ["Wirkungsoekonomisches", "Wirkungsökonomisches"],
  ["Oeffentlichkeit", "Öffentlichkeit"],
  ["oeffentlich", "öffentlich"],
  ["Oeffentlich", "Öffentlich"],
  ["Oeffentliche", "Öffentliche"],
  ["oeffentliche", "öffentliche"],
  ["Oeffentlichen", "Öffentlichen"],
  ["oeffentlichen", "öffentlichen"],
  ["oeffnen", "öffnen"],
  ["Oeffnen", "Öffnen"],
  ["oel", "öl"],
  ["Oel", "Öl"],
  ["Oelabhaengigkeit", "Ölabhängigkeit"],
  ["Oelabhaengigkeit", "Ölabhängigkeit"],
  ["oelabhaengigkeit", "ölabhängigkeit"],
  ["Prueffrage", "Prüffrage"],
  ["Prueffragen", "Prüffragen"],
  ["Pruefung", "Prüfung"],
  ["Pruefungen", "Prüfungen"],
  ["Pruefprozess", "Prüfprozess"],
  ["Pruefprozesse", "Prüfprozesse"],
  ["Pruefbarkeit", "Prüfbarkeit"],
  ["Pruefer", "Prüfer"],
  ["Pruef", "Prüf"],
  ["pruef", "prüf"],
  ["gepruef", "geprüf"],
  ["pruefen", "prüfen"],
  ["prueft", "prüft"],
  ["pruefbar", "prüfbar"],
  ["fuer", "für"],
  ["Fuer", "Für"],
  ["muessen", "müssen"],
  ["Muessen", "Müssen"],
  ["koennen", "können"],
  ["Koennen", "Können"],
  ["koennte", "könnte"],
  ["Koennte", "Könnte"],
  ["ueber", "über"],
  ["Ueber", "Über"],
  ["uebersetzt", "übersetzt"],
  ["Uebersetzt", "Übersetzt"],
  ["rueck", "rück"],
  ["Rueck", "Rück"],
  ["faehig", "fähig"],
  ["Faehig", "Fähig"],
  ["Faehigkeit", "Fähigkeit"],
  ["faehigkeit", "fähigkeit"],
  ["Datenqualitaet", "Datenqualität"],
  ["datenqualitaet", "datenqualität"],
  ["Qualitaet", "Qualität"],
  ["qualitaet", "qualität"],
  ["Begruendungspflicht", "Begründungspflicht"],
  ["Begruendung", "Begründung"],
  ["begruendung", "begründung"],
  ["unabhaengig", "unabhängig"],
  ["Unabhaengig", "Unabhängig"],
  ["Verhaeltnismaessigkeit", "Verhältnismäßigkeit"],
  ["verhaeltnismaessig", "verhältnismäßig"],
  ["Gegenmassnahme", "Gegenmaßnahme"],
  ["Gegenmassnahmen", "Gegenmaßnahmen"],
  ["Massstab", "Maßstab"],
  ["massstab", "maßstab"],
  ["ausserdem", "außerdem"],
  ["Ausserdem", "Außerdem"],
  ["äussere", "äußere"],
  ["Äussere", "Äußere"],
  ["Stoerfall", "Störfall"],
  ["stoerfall", "störfall"],
  ["unterstuetzen", "unterstützen"],
  ["Unterstuetzen", "Unterstützen"],
  ["zugaenglich", "zugänglich"],
  ["Zugaenglich", "Zugänglich"],
  ["haeufig", "häufig"],
  ["Haeufig", "Häufig"],
  ["Windraeder", "Windräder"],
  ["windraeder", "windräder"],
  ["zerstoeren", "zerstören"],
  ["Zerstoeren", "Zerstören"],
  ["loest", "löst"],
  ["Loest", "Löst"],
  ["Uebergaenge", "Übergänge"],
  ["Übergaenge", "Übergänge"],
  ["uebergaenge", "übergänge"],
  ["Übergaenge", "Übergänge"],
  ["E-Mobilitaet", "E-Mobilität"],
  ["Mobilitaet", "Mobilität"],
  ["mobilitaet", "mobilität"],
  ["laedt", "lädt"],
  ["Laedt", "Lädt"],
  ["finanziell", "finanziell"],
];

function walk(entry, files = []) {
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    const name = path.basename(full);
    if (SKIP_DIRS.has(name)) return files;
    for (const child of fs.readdirSync(full, { withFileTypes: true })) {
      walk(path.join(entry, child.name), files);
    }
    return files;
  }
  if (entry.endsWith(".html")) files.push(full);
  return files;
}

function normalizeText(value) {
  let text = value.normalize("NFKC");
  for (const [from, to] of LIGATURES) text = text.replaceAll(from, to);
  text = text.replace(/([A-Za-zÄÖÜäöüß])`([A-Za-zÄÖÜäöüß])/g, "$1ff$2");
  text = text
    .replace(/&lt;\/?(?:strong|em|sub|sup|span|br)\b[^&]*?&gt;/gi, "")
    .replace(/<\/?(?:strong|em|sub|sup|span|br)\b[^>]*>/gi, "");
  for (const [from, to] of TEXT_REPLACEMENTS) text = text.replaceAll(from, to);
  text = text.replace(/CO2e/g, "CO₂e");
  text = text.replace(/\bCO2(?=(?:\b|[-–—]))/g, "CO₂");
  return text;
}

function decodeBasicEntities(value) {
  return String(value ?? "")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function plainAttributeText(value) {
  return normalizeText(decodeBasicEntities(value)
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function normalizeBrokenDataSearchAttributes(html) {
  return html.replace(/data-search="([\s\S]*?)">\s*(<div class="method-tool-card-head")/g, (_match, raw, nextTag) => {
    return `data-search="${escapeAttribute(plainAttributeText(raw))}">\n    ${nextTag}`;
  });
}

function normalizeHtml(html) {
  const parts = normalizeBrokenDataSearchAttributes(html).split(/(<[^>]+>)/g);
  let skip = null;
  return parts.map((part) => {
    if (!part) return part;
    if (part.startsWith("<")) {
      const tag = /^<\/?\s*([a-zA-Z0-9:-]+)/.exec(part)?.[1]?.toLowerCase() || "";
      if (tag === "script" || tag === "style" || tag === "pre" || tag === "code") {
        if (/^<\s*\//.test(part)) skip = null;
        else skip = tag;
      }
      return part;
    }
    return skip ? part : normalizeText(part);
  }).join("");
}

const files = [...new Set(TARGETS.flatMap((target) => walk(target)))].sort();
const changed = [];

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = normalizeHtml(before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed.push(path.relative(ROOT, file));
  }
}

console.log(`Publication QA normalization: ${changed.length} HTML files normalized.`);
if (changed.length) {
  console.log(changed.slice(0, 40).map((file) => `- ${file}`).join("\n"));
  if (changed.length > 40) console.log(`... ${changed.length - 40} weitere Dateien`);
}
