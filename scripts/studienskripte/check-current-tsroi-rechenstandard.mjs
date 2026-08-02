import fs from "node:fs";
import path from "node:path";

const files = [
  "content/studienskripte/woek-g-v23.md",
  "content/studienskripte/woek-g-v31.md",
  "content/studienskripte/wirkungscontrolling-wc-v7.md",
];

const required = [
  "B_{direkt,t}",
  "B_{transformativ,t}",
  "PV_N^L",
  "(1-u_t)",
  "T \\geq 1",
  "I_0",
  "Ressourcenbasis positiv",
  "Der Schaden bleibt 60 EUR",
];
const retired = [
  "T-SROI = Transformationswirkung × systemische Hebelwirkung",
  "T-SROI = (T_struktur × H_sys × F_zeit × F_resilienz × Q_daten) / I",
];
const retiredPublicPatterns = [
  /T\s*[‑–-]?\s*SROI\s*,\s*Transformationsmultiplikator(?:en)?\b/iu,
  /T\s*[‑–-]?\s*SROI-Auswertung[^<]{0,180}\bTransformationsmultiplikatoren\b/iu,
  /T\s*[‑–-]?\s*SROI\s*=\s*Transformationswirkung\s*(?:×|&times;|\*)/iu,
  /T\s*[‑–-]?\s*SROI\s*=\s*\(\s*T_?struktur\s*(?:×|&times;|\*)/iu,
];

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "tmp", "_site", ".public-artifact"].includes(entry.name)) continue;
    const current = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(current, files);
    else if (entry.isFile() && entry.name === "index.html") files.push(current);
  }
  return files;
}

function isIndexable(html) {
  return !/<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*["'])[^>]*>/iu.test(html);
}

const failures = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const needle of required) if (!text.includes(needle)) failures.push(`${file}: aktuelle Rechenstandard-Komponente fehlt: ${needle}`);
  for (const needle of retired) if (text.includes(needle)) failures.push(`${file}: überholte Multiplikatorformel gefunden: ${needle}`);
}

let checkedPublicPages = 0;
for (const file of walkHtml(process.cwd())) {
  const html = fs.readFileSync(file, "utf8");
  if (!isIndexable(html)) continue;
  checkedPublicPages += 1;
  for (const pattern of retiredPublicPatterns) {
    if (pattern.test(html)) {
      failures.push(`${path.relative(process.cwd(), file)}: überholte Multiplikatorlogik auf einer indexierbaren Seite gefunden (${pattern}).`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(`Aktueller T-SROI-Rechenstandard geprüft: ${files.length}/${files.length} Studienskripte und ${checkedPublicPages} indexierbare Seiten.`);
