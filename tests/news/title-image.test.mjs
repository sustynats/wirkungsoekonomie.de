import test from "node:test";
import assert from "node:assert/strict";
import { fitText, wrapText, measure } from "../../scripts/news/title-image/text.mjs";
import { renderTitleImage, renderTitleImageFromStory, storyToTitleInput, SIZES, SAFE_AREAS, categoryIcon, describeSystem } from "../../scripts/news/title-image/index.mjs";
import { renderPlaceholderMotif, placeholderDataUri } from "../../scripts/news/title-image/placeholders.mjs";

const BASE = {
  headline: "Stärkerer Schutz kritischer Infrastrukturen",
  category: ["Energie", "Gesundheit"],
  source: "Bundesregierung kompakt",
  date: "2026-09-02",
  dimensions: { human: "hoch", planet: "mittel", democracy: "mittel" },
  status: "beschlossen",
  analysisType: "ex_ante",
};

test("Textmaß und Umbruch sind deterministisch und vermeiden Worttrennungen", () => {
  assert.ok(measure("Wirkung", "serif-700", 60) > measure("Wirkung", "serif-700", 40));
  const wrapped = wrapText("Die Nachrichten, bei denen zählt, was daraus folgt.", { fontKey: "serif-700", size: 60, maxWidth: 600 });
  assert.ok(wrapped.lines.length >= 2);
  assert.equal(wrapped.broken, 0);
  const fit = fitText("KI-Sicherheitsinstitut eröffnet", { fontKey: "serif-700", sizes: [62, 54, 47, 41], maxWidth: 682, maxLines: 3 });
  assert.equal(fit.size, 54);
  assert.deepEqual(fit.lines, ["KI-Sicherheitsinstitut", "eröffnet"]);
  const truncated = fitText("Sehr ".repeat(60).trim(), { fontKey: "serif-700", sizes: [41], maxWidth: 500, maxLines: 3 });
  assert.equal(truncated.truncated, true);
  assert.equal(truncated.lines.length, 3);
  assert.match(truncated.lines[2], /…$/);
});

test("Wirkungskarte rendert Panel, Meter, Chips und Branding", () => {
  const result = renderTitleImage({ ...BASE, mode: "impact_card" }, { size: "og", fonts: "none" });
  assert.equal(result.width, 1200);
  assert.equal(result.height, 630);
  assert.equal(result.mode, "impact_card");
  assert.deepEqual(result.warnings, []);
  assert.match(result.svg, /WIRKUNG AUF/);
  assert.match(result.svg, /WIRKUNGSTICKER/);
  assert.match(result.svg, />Mensch</);
  assert.match(result.svg, />beschlossen</);
  assert.match(result.svg, />Ex ante</);
  assert.match(result.svg, /Wirkungskarte · WÖk-Einordnung/);
  assert.match(result.svg, /ENERGIE · GESUNDHEIT/);
  assert.match(result.svg, /Bundesregierung kompakt · Ausgangsmeldung 02\.09\.2026/);
  assert.doesNotMatch(result.svg, /<style>/);
  assert.equal(result.layout.lines.length, 3);
});

test("Editorial rendert Motiv, Kennzeichnung und eingebettete Fonts", () => {
  const image = placeholderDataUri("infrastruktur", { width: 1200, height: 675 });
  const result = renderTitleImage({ ...BASE, mode: "editorial", image: { src: image, focus: "right" } }, { size: "wide" });
  assert.equal(result.mode, "editorial");
  assert.equal(result.height, 675);
  assert.match(result.svg, /<image href="data:image\/svg\+xml;base64,/);
  assert.match(result.svg, /KI-generiertes Symbolbild/);
  assert.match(result.svg, /@font-face\{font-family:"Source Serif 4";font-weight:700/);
  assert.match(result.svg, /url\(data:font\/woff2;base64,/);
  assert.doesNotMatch(result.svg, /WIRKUNG AUF/);
});

test("Editorial ohne Motiv fällt auf die Wirkungskarte zurück", () => {
  const result = renderTitleImage({ ...BASE, mode: "editorial", image: null }, { size: "og", fonts: "none" });
  assert.equal(result.mode, "impact_card");
  assert.ok(result.warnings.includes("EDITORIAL_IMAGE_MISSING"));
  assert.match(result.svg, /WIRKUNG AUF/);
});

test("Fehlende Werte werden ruhig behandelt", () => {
  const noData = renderTitleImage({ mode: "impact_card", headline: "Erkennung und Behandlung von Sepsis thematisiert", category: "Gesundheit" }, { size: "og", fonts: "none" });
  assert.ok(noData.warnings.includes("IMPACT_DATA_MISSING"));
  assert.doesNotMatch(noData.svg, /WIRKUNG AUF/);
  assert.match(noData.svg, /GESUNDHEIT/);
  const open = renderTitleImage({ ...BASE, mode: "impact_card", dimensions: { human: "hoch" }, category: null, source: null, date: null, status: "laufende Entwicklung" }, { size: "square", fonts: "none" });
  assert.equal(open.width, 1080);
  assert.match(open.svg, /stroke-dasharray/);
  assert.match(open.svg, />offen</);
  assert.doesNotMatch(open.svg, /Ausgangsmeldung/);
  const unknown = renderTitleImage({ ...BASE, category: ["Kryptozoologie"] }, { size: "og", fonts: "none" });
  assert.ok(unknown.warnings.includes("CATEGORY_ICON_FALLBACK"));
  assert.equal(categoryIcon(["Infrastruktur"]), "kommunen");
  assert.equal(categoryIcon("Energie · Europa"), "energie");
});

test("Lange Überschriften werden kontrolliert gekürzt", () => {
  const result = renderTitleImage({ ...BASE, headline: "Neues Förderprogramm mit zehn Millionen Euro für Projekte in NS- und SED-Gedenkstätten – Staatsminister Weimer: „Gerade jetzt Orte der Erinnerung stärken“ und weitere Maßnahmen zur Stärkung der Erinnerungskultur" }, { size: "og", fonts: "none" });
  assert.ok(result.warnings.includes("HEADLINE_TRUNCATED"));
  assert.ok(result.layout.lines.length <= 5);
  assert.ok(result.layout.headlineSize >= 41);
});

test("Ticker-Akten werden auf Eingaben abgebildet", () => {
  const story = {
    title: "Kapazitätsmechanismus genehmigt",
    topic: ["Energie", "Europa"],
    first_seen: "2026-09-02T06:00:00.000Z",
    sources: [
      { publisher: "Bundesregierung kompakt", primary_source: false, published_at: "2026-09-03T06:00:00.000Z" },
      { publisher: "Europäische Kommission", primary_source: true, published_at: "2026-09-02T08:00:00.000Z" },
    ],
    analysis: { status: "beschlossen", analysis_type: "ex_ante", human: { relevance: "hoch" }, planet: { relevance: "mittel" }, democracy: { relevance: "offen" } },
  };
  const input = storyToTitleInput(story);
  assert.equal(input.mode, "impact_card");
  assert.equal(input.source, "Europäische Kommission");
  assert.equal(input.date, "2026-09-02T08:00:00.000Z");
  assert.deepEqual(input.dimensions, { human: "hoch", planet: "mittel", democracy: "offen" });
  const withImage = storyToTitleInput({ ...story, title_image: { mode: "editorial", src: "https://example.org/motiv.jpg" } });
  assert.equal(withImage.mode, "editorial");
  assert.equal(withImage.image.src, "https://example.org/motiv.jpg");
  const publicStory = { title: "Test", topic: ["Politik"], dimensions: { human: { relevance: "mittel" }, planet: { relevance: "gering" }, democracy: { relevance: "hoch" } }, status: "Entwurf", analysis_type: "monitoring", sources: [] };
  const rendered = renderTitleImageFromStory(publicStory, { size: "wide", fonts: "none" });
  assert.equal(rendered.mode, "impact_card");
  assert.match(rendered.svg, />Entwurf</);
});

test("Presets, Safe Areas und Platzhalter sind konsistent", () => {
  assert.deepEqual(Object.keys(SIZES), ["og", "wide", "square"]);
  for (const areas of Object.values(SAFE_AREAS)) {
    for (const key of ["brand", "text", "label", "motifFocus"]) {
      const zone = areas[key];
      assert.ok(zone.x >= 0 && zone.y >= 0 && zone.x + zone.w <= 1.0001 && zone.y + zone.h <= 1.0001, `${key} innerhalb der Fläche`);
    }
  }
  const motif = renderPlaceholderMotif("energie", { width: 1200, height: 630 });
  assert.match(motif, /^<svg /);
  assert.doesNotMatch(motif, /<text/);
  const system = describeSystem();
  assert.equal(system.entry, "scripts/news/title-image/index.mjs");
  assert.ok(system.sizes.og.startsWith("1200×630"));
});
