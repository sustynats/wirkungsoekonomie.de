import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { formatReferenceFramework } from "../../scripts/news/reference-frameworks.mjs";
import { storyPage } from "../../scripts/news/build.mjs";

test("all 17 numbered goals use the existing website catalogue", () => {
  const catalogue = JSON.parse(fs.readFileSync(new URL("../../assets/data/sdg-reference.json", import.meta.url)));
  const goals = catalogue.filter((goal) => goal.type === "sdg" && goal.isOfficialUNGoal);
  assert.equal(goals.length, 17);
  for (const goal of goals) {
    assert.equal(formatReferenceFramework(`SDG ${goal.number}`), goal.title.replace(" - ", " – "));
  }
});

test("explicit and shorthand SDG lists expand without losing qualifications", () => {
  assert.equal(formatReferenceFramework("Agenda 2030/SDG 7, SDG 9, SDG 16"),
    "Agenda 2030/SDG 7 – Bezahlbare und saubere Energie, SDG 9 – Industrie, Innovation und Infrastruktur, SDG 16 – Frieden, Gerechtigkeit und starke Institutionen");
  assert.equal(formatReferenceFramework("SDGs 7, 9 und 13; DNS nur soweit sachlich anwendbar."),
    "SDG 7 – Bezahlbare und saubere Energie, SDG 9 – Industrie, Innovation und Infrastruktur und SDG 13 – Klimaschutz; DNS nur soweit sachlich anwendbar.");
});

test("named references are idempotent; target IDs, SDG+ and unnumbered frameworks stay intact", () => {
  const rendered = formatReferenceFramework("SDG 1, 7 und 16");
  assert.equal(formatReferenceFramework(rendered), rendered);
  assert.equal(formatReferenceFramework("SDG 7 - Bezahlbare und saubere Energie"), "SDG 7 - Bezahlbare und saubere Energie");
  for (const text of ["Agenda 2030/SDG und DNS allgemein", "SDG+ 1", "SDG 18", "SDG 170", "SDG 7.1", "SDG 16.a", "SDG 7x", "2026, 2030", "DNS, soweit sachlich anwendbar"]) {
    assert.equal(formatReferenceFramework(text), text);
  }
});

test("the public source section formats and escapes references without mutating analysis", () => {
  const story = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url))).stories
    .find((item) => item.published && item.listed !== false && item.analysis);
  story.analysis.reference_frameworks = ["SDG 7", "DNS <untrusted>"];
  const before = structuredClone(story);
  const html = storyPage(story);
  assert.match(html, /SDG 7 – Bezahlbare und saubere Energie · DNS &lt;untrusted&gt;/);
  assert.deepEqual(story, before, "display labels cannot alter evidence, versions or publication dates");
});
