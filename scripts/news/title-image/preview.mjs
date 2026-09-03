// Erzeugt lokale Vorschauen beider Titelbild-Modi als SVG, PNG (wenn ein
// Rasterizer verfügbar ist) und eine Galerie zum direkten Vergleich.
//
//   node scripts/news/title-image/preview.mjs [--out docs/ops/title-image-previews] [--png-out <dir>]
//
// Standard: SVG + Galerie + Report (klein, versionierbar). PNGs entstehen nur mit
// --png-out außerhalb des Repositories, z. B. --png-out ~/Downloads/wirkungsticker-titelbilder

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderTitleImage, SIZES, describeSystem } from "./index.mjs";
import { rasterize, availableRasterizers } from "./rasterize.mjs";
import { placeholderDataUri } from "./placeholders.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const outArgument = process.argv.indexOf("--out");
const OUT = path.resolve(ROOT, outArgument > -1 ? process.argv[outArgument + 1] : "docs/ops/title-image-previews");
const pngArgument = process.argv.indexOf("--png-out");
const PNG_OUT = pngArgument > -1 ? path.resolve(process.argv[pngArgument + 1].replace(/^~/, process.env.HOME || "")) : null;

const CASES = [
  {
    id: "kritis",
    note: "Referenzfall",
    headline: "Stärkerer Schutz kritischer Infrastrukturen",
    category: ["Energie", "Gesundheit"],
    source: "Bundesregierung kompakt",
    date: "2026-09-02",
    dimensions: { human: "hoch", planet: "mittel", democracy: "mittel" },
    status: "beschlossen",
    analysisType: "ex_ante",
    motif: "infrastruktur",
  },
  {
    id: "lang",
    note: "Lange Überschrift, 2–3 Zeilen",
    headline: "Kommission genehmigt deutschen Kapazitätsmechanismus von bis zu 35 Mrd. EUR zur Gewährleistung einer sicheren Stromversorgung",
    category: ["Energie", "Europa"],
    source: "Europäische Kommission – Press Corner",
    date: "2026-09-02",
    dimensions: { human: "hoch", planet: "mittel", democracy: "mittel" },
    status: "beschlossen",
    analysisType: "ex_ante",
    motif: "energie",
  },
  {
    id: "kurz",
    note: "Sehr kurze Überschrift",
    headline: "KI-Sicherheitsinstitut eröffnet",
    category: ["Digitalisierung", "KI"],
    source: "Bundesregierung kompakt",
    date: "2026-08-31",
    dimensions: { human: "hoch", planet: "offen", democracy: "hoch" },
    status: "laufende Entwicklung",
    analysisType: "ex_ante",
    motif: "finanzen",
  },
  {
    id: "sehr-lang",
    note: "Sehr lange deutsche Überschrift (Kürzung erwartet)",
    headline: "Neues Förderprogramm mit zehn Millionen Euro für Projekte in NS- und SED-Gedenkstätten – Staatsminister Weimer: „Gerade jetzt Orte der Erinnerung stärken“ und weitere Maßnahmen zur Stärkung der Erinnerungskultur",
    category: ["Demokratie", "Bildung"],
    source: "Bundesregierung kompakt",
    date: "2026-09-03",
    dimensions: { human: "mittel", planet: "gering", democracy: "hoch" },
    status: "laufende Entwicklung",
    analysisType: "ex_ante",
    motif: "gesellschaft",
  },
  {
    id: "ohne-kategorie",
    note: "Fehlende Kategorie",
    headline: "MFI-Zinsstatistik für den Euroraum: Juli 2026",
    category: null,
    source: "Deutsche Bundesbank",
    date: "2026-09-02",
    dimensions: { human: "mittel", planet: "gering", democracy: "gering" },
    status: "erste Daten",
    analysisType: "monitoring",
    motif: "finanzen",
  },
  {
    id: "ohne-quelle",
    note: "Fehlende Quelle und fehlendes Datum",
    headline: "Regionalnachweisregister soll abgewickelt werden",
    category: ["Klima", "Energie", "Wirtschaft"],
    source: null,
    date: null,
    dimensions: { human: "mittel", planet: "mittel", democracy: "mittel" },
    status: "Entwurf",
    analysisType: "ex_ante",
    motif: "energie",
  },
  {
    id: "ohne-werte",
    note: "Fehlende Wirkungswerte (Panel wird zum Symbol)",
    headline: "Erkennung und Behandlung von Sepsis thematisiert",
    category: ["Gesundheit"],
    source: "Deutscher Bundestag – heute im Bundestag",
    date: "2026-09-02",
    dimensions: null,
    status: null,
    analysisType: null,
    motif: "gesellschaft",
  },
  {
    id: "eine-dimension",
    note: "Nur eine relevante Dimension",
    headline: "Denkmal für die polnischen Opfer des Zweiten Weltkriegs: Errichtung ab 2027",
    category: ["Geopolitik", "Demokratie"],
    source: "Bundesregierung kompakt",
    date: "2026-09-01",
    dimensions: { human: "gering", planet: "gering", democracy: "sehr hoch" },
    status: "beschlossen",
    analysisType: "ex_ante",
    motif: "gesellschaft",
  },
  {
    id: "alle-hoch",
    note: "Mehrere sehr relevante Dimensionen, Rubrik unbekannt",
    headline: "Für bezahlbare Windenergie auf See",
    category: ["Infrastruktur", "Ressourcen"],
    source: "Bundesregierung kompakt",
    date: "2026-09-02",
    dimensions: { human: "hoch", planet: "sehr hoch", democracy: "mittel" },
    status: "in Kraft",
    analysisType: "monitoring",
    motif: "energie",
  },
];

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function galleryCard(entry) {
  const img = entry.png ? `<img src="${entry.png}" alt="${entry.alt}" loading="lazy">` : `<object data="${entry.svg}" type="image/svg+xml" aria-label="${entry.alt}"></object>`;
  return `<figure class="tile tile--${entry.sizeKey}"><div class="frame">${img}</div><figcaption><strong>${entry.title}</strong><span>${entry.meta}</span>${entry.warnings.length ? `<em>Hinweise: ${entry.warnings.join(", ")}</em>` : ""}</figcaption></figure>`;
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const rasterizers = PNG_OUT ? availableRasterizers() : [];
  if (PNG_OUT) fs.mkdirSync(PNG_OUT, { recursive: true });
  const fontBase = path.relative(OUT, path.join(ROOT, "assets/fonts")).split(path.sep).join("/") + "/";
  const entries = [];
  const report = { generated_at: new Date().toISOString(), rasterizers, cases: [] };

  for (const testCase of CASES) {
    const caseReport = { id: testCase.id, note: testCase.note, renders: [] };
    for (const mode of ["editorial", "impact_card"]) {
      for (const sizeKey of ["og", "wide", "square"]) {
        const image = mode === "editorial" ? { src: placeholderDataUri(testCase.motif, { width: SIZES[sizeKey].width, height: SIZES[sizeKey].height, seed: testCase.id.length * 13 + sizeKey.length }), focus: "right" } : null;
        const input = { mode, image, headline: testCase.headline, category: testCase.category, source: testCase.source, date: testCase.date, dimensions: testCase.dimensions, status: testCase.status, analysisType: testCase.analysisType };
        const embedded = renderTitleImage(input, { size: sizeKey, fonts: "embed" });
        const linked = renderTitleImage(input, { size: sizeKey, fonts: "link", fontBase });
        const base = `${testCase.id}--${mode}--${sizeKey}`;
        write(path.join(OUT, `${base}.svg`), linked.svg);
        let pngName = null;
        let rasterizer = null;
        if (rasterizers.length) {
          try {
            const result = await rasterize(embedded.svg, { width: embedded.width, height: embedded.height, outFile: path.join(PNG_OUT, `${base}.png`) });
            pngName = path.relative(OUT, path.join(PNG_OUT, `${base}.png`));
            rasterizer = result.rasterizer;
          } catch (error) {
            caseReport.renders.push({ mode, size: sizeKey, error: String(error?.message || error) });
          }
        }
        caseReport.renders.push({ mode, size: sizeKey, svg: `${base}.svg`, png: pngName, rasterizer, headlineSize: embedded.layout.headlineSize, lines: embedded.layout.lines.length, truncated: embedded.layout.truncated, warnings: embedded.warnings });
        entries.push({ caseId: testCase.id, mode, sizeKey, svg: `${base}.svg`, png: pngName, alt: testCase.headline, title: `${mode === "editorial" ? "Editorial Symbolbild" : "Wirkungskarte"} · ${SIZES[sizeKey].label}`, meta: `${embedded.width}×${embedded.height} · Headline ${embedded.layout.headlineSize}px · ${embedded.layout.lines.length} Zeile(n)${embedded.layout.truncated ? " · gekürzt" : ""}`, warnings: embedded.warnings });
      }
    }
    report.cases.push(caseReport);
  }

  // Fallback-Fall: Editorial ohne Motiv muss automatisch zur Wirkungskarte werden.
  const fallback = renderTitleImage({ mode: "editorial", image: null, headline: CASES[0].headline, category: CASES[0].category, source: CASES[0].source, date: CASES[0].date, dimensions: CASES[0].dimensions, status: CASES[0].status, analysisType: CASES[0].analysisType }, { size: "og", fonts: "link", fontBase });
  write(path.join(OUT, "fallback--editorial-ohne-motiv--og.svg"), fallback.svg);
  report.fallback = { mode: fallback.mode, warnings: fallback.warnings };

  const sections = CASES.map((testCase) => {
    const og = entries.filter((entry) => entry.caseId === testCase.id && entry.sizeKey === "og");
    const square = entries.filter((entry) => entry.caseId === testCase.id && entry.sizeKey === "square");
    const wide = entries.filter((entry) => entry.caseId === testCase.id && entry.sizeKey === "wide");
    return `<section class="case"><h2>${testCase.headline}</h2><p class="note">${testCase.note} · Rubrik: ${Array.isArray(testCase.category) ? testCase.category.join(" · ") : "–"} · Quelle: ${testCase.source || "–"} · Werte: ${testCase.dimensions ? Object.values(testCase.dimensions).join(" / ") : "–"}</p>
<div class="row row--og">${og.map(galleryCard).join("")}</div>
<details open><summary>16:9 und quadratisch</summary><div class="row row--wide">${wide.map(galleryCard).join("")}</div><div class="row row--square">${square.map(galleryCard).join("")}</div></details>
<details open><summary>Smartphone / Kartengröße (360 px breit)</summary><div class="row row--small">${wide.map(galleryCard).join("")}</div></details>
</section>`;
  }).join("\n");

  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Wirkungsticker Titelbildsystem – Vorschau</title>
<style>
body{margin:0;padding:2rem;background:#f6f1e8;color:#222;font-family:Inter,system-ui,sans-serif}
h1{font-family:"Source Serif 4",Georgia,serif;font-size:2rem;margin:0 0 .3rem}
h2{font-family:"Source Serif 4",Georgia,serif;font-size:1.25rem;margin:0 0 .3rem}
.lead,.note{color:#4a4a44;font-size:.92rem;margin:0 0 1rem}
.case{margin:0 0 2.5rem;padding:1.25rem;border:1px solid #e8e4dc;border-radius:12px;background:#fffcf5}
.row{display:grid;gap:1rem;margin:.5rem 0 1rem}
.row--og,.row--wide{grid-template-columns:repeat(auto-fit,minmax(420px,1fr))}
.row--square{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.row--small{grid-template-columns:repeat(auto-fit,360px)}
.tile{margin:0}.frame{border-radius:10px;overflow:hidden;box-shadow:0 12px 35px rgba(7,21,44,.12);background:#0b1020}
.frame img,.frame object{display:block;width:100%;height:auto}
figcaption{display:grid;gap:.15rem;margin-top:.5rem;font-size:.82rem;color:#4a4a44}
figcaption strong{color:#222}figcaption em{color:#8a3f23;font-style:normal}
details{margin:.5rem 0}summary{cursor:pointer;font-weight:700}
.meta{font-size:.85rem;color:#4a4a44}
</style></head><body>
<h1>Wirkungsticker · Titelbildsystem</h1>
<p class="lead">Zwei Modi eines Designsystems: <strong>Editorial Symbolbild</strong> (Platzhaltermotiv, später extern generiert) und <strong>Wirkungskarte</strong> (aus Analysedaten). ${PNG_OUT ? `PNG über ${rasterizers.join(", ")}` : "SVG-Vorschau mit verlinkten Markenfonts (PNG mit --png-out)"} · erzeugt ${report.generated_at}</p>
${sections}
<section class="case"><h2>Fallback: Editorial ohne Motiv</h2><p class="note">Fehlt das Motiv, rendert das System automatisch die Wirkungskarte (Modus: ${fallback.mode}, Hinweise: ${fallback.warnings.join(", ")}).</p><div class="row row--og"><figure class="tile"><div class="frame"><object data="fallback--editorial-ohne-motiv--og.svg" type="image/svg+xml"></object></div></figure></div></section>
</body></html>`;
  write(path.join(OUT, "index.html"), html);
  write(path.join(OUT, "report.json"), JSON.stringify({ ...report, system: describeSystem() }, null, 2));
  console.log(`Titelbild-Vorschauen: ${entries.length} Renderings in ${path.relative(ROOT, OUT)} (Rasterizer: ${rasterizers.join(", ") || "keiner"})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
