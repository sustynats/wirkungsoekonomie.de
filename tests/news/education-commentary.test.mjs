import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { prepareEditorialReview } from "../../scripts/news/publish-editorial-review.mjs";
import { editorialVisualErrors, renderSystemicVisual } from "../../scripts/news/systemic-analysis.mjs";
import { editorialAnalysisPage, formatEditorialSourceDate } from "../../scripts/news/build.mjs";

const packet = JSON.parse(fs.readFileSync(new URL("../../content/news/reviews/2026-09-08-bildung-abschluesse-sachsen-anhalt.json", import.meta.url)));
const story = { story_id: packet.story_id, slug: "education-origin", title: "Ursprungsgeschichte", published: true, listed: true, source_integrity: { status: "verified" }, last_updated: packet.research_checked_at, sources: [], claims: [], analysis: {} };
const prepared = () => prepareEditorialReview(structuredClone(packet), structuredClone(story), null, packet.research_checked_at).record;
const words = items => items.join(" ").trim().split(/\s+/).length;

test("education commentary passes the evidence gate with a separate commissioned author perspective", () => {
  const record = prepared();
  assert.equal(record.author.name, "Natalie Weber");
  assert.equal(record.editorial_genre, "commentary");
  assert.equal(record.slug, packet.slug);
  assert.equal(record.reading_time_minutes, 9);
  const opinion = words(record.author_perspective.paragraphs);
  assert.ok(opinion >= 250 && opinion <= 350);
  const readingText = [...record.sections.flatMap(section => section.paragraphs), ...record.sections.flatMap(section => section.visual?.items?.flatMap(item => [item.title, item.text, item.condition]) || []), ...record.author_perspective.paragraphs, record.executive_finding, ...Object.values(record.subject_dimensions).map(item => item.rationale)];
  assert.ok(words(readingText) >= 1400 && words(readingText) <= 1900);
  assert.ok(record.claim_ledger.every(claim => claim.type !== "observed_impact"));
  assert.ok(record.author_perspective.claim_indices.every(index => record.claim_ledger[index]));
  assert.equal(prepareEditorialReview(packet, story, record, packet.research_checked_at).changed, false);
});

test("education differentiates recognition, learning, safeguards, real counterevidence and source interests", () => {
  const record = prepared(); const text = record.sections.flatMap(section => section.paragraphs).join(" ");
  for (const phrase of ["Persönliche Ankündigungen", "Qualifikationsphase", "halbjährliche zentrale Prüfungen", "Rückkehr zur Schule", "Gewerkschaftsperspektive", "kein Urteil", "nicht rückwirkend entwertet", "keine generelle Unterschreitung", "Regelstandards", "konkrete sinnvolle Ansätze"]) assert.ok(text.includes(phrase), phrase);
  assert.equal(record.subject_dimensions.human.direction, "negative");
  assert.equal(record.subject_dimensions.democracy.direction, "negative");
  assert.equal(record.subject_dimensions.planet.evidence, "open");
  assert.ok(record.positive_path_checks.length >= 3);
  assert.ok(record.monitoring.points.every(point => point.status === "open"));
});

test("evidence table is source-bound and rejects incomplete or malformed rows without throwing", () => {
  const record = prepared(); const section = record.sections.find(section => section.visual?.type === "evidence_table");
  assert.deepEqual(editorialVisualErrors(record), []);
  for (const mutate of [v => { v.columns = ["one"]; }, v => { v.items = {}; }, v => { v.items = [null]; }, v => { delete v.items[0].condition; }, v => { v.items[0].source_ids = []; }, v => { v.items[0].direction = "unknown"; }]) {
    const broken = structuredClone(record); const visual = broken.sections.find(s => s.id === section.id).visual;
    mutate(visual);
    assert.ok(editorialVisualErrors(broken).includes("EDITORIAL_EVIDENCE_TABLE_INVALID"));
    assert.equal(renderSystemicVisual(visual, new Map()), "");
  }
  section.visual.items[0].source_ids = ["unknown"];
  assert.ok(editorialVisualErrors(record).includes("SYSTEMIC_VISUAL_SOURCE_UNKNOWN"));
});

test("the evidence table escapes text and preserves table semantics for mobile reading cards", () => {
  const record = prepared(); const visual = record.sections.find(s => s.visual?.type === "evidence_table").visual;
  const sources = new Map(record.source_snapshot.map(source => [source.source_id, source]));
  visual.columns[0] = "<script>x</script>";
  visual.items[0].title = "<img src=x onerror=x>";
  visual.items[0].source_note = "<script>bad</script>";
  const html = renderSystemicVisual(visual, sources);
  assert.doesNotMatch(html, /<script>|<img/);
  assert.match(html, /&lt;script&gt;/);
  assert.equal((html.match(/role="columnheader"/g) || []).length, 4);
  assert.equal((html.match(/scope="row"/g) || []).length, 8);
  assert.match(html, /news-evidence-table__label" aria-hidden="true"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("new article renders its own MPD, source links, cascade and distinct author section without replacing its origin", () => {
  const html = editorialAnalysisPage(prepared(), story);
  for (const marker of ["Meinung &amp; Analyse", "news-evidence-table", "news-systemic-visual--cascade", "Persönliche Einordnung der Autorin", "meine-einordnung", "reality-check", "versionsverlauf"]) assert.ok(html.includes(marker), marker);
  assert.match(html, /href="\.\.\/\.\.\/education-origin\/"/);
  assert.match(html, /href="\/wirkungsticker\/analyse\/wenn-aus-programm-staatsmacht-wird-sachsen-anhalt\/"/);
  assert.ok(html.indexOf('id="meine-einordnung"') > html.indexOf('id="synthese"'));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
});

test("desktop column widths cannot narrow the mobile evidence-card row headers", () => {
  const css = fs.readFileSync(new URL("../../assets/css/news.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /\.news-evidence-table\s+th:nth-child/);
  assert.match(css, /\.news-evidence-table thead th:nth-child\(1\)/);
  assert.match(css, /\.news-evidence-table tbody th, \.news-evidence-table tbody td\s*\{[^}]*display: block; width: auto;/);
});

test("teacher competence connects goals with instruction without turning standards or the study into guarantees", () => {
  const record = prepared();
  const index = record.sections.findIndex(section => section.id === "system");
  const section = record.sections[index + 1];
  assert.equal(section.id, "lehrkompetenz");
  assert.equal(section.title, "Warum Unterrichten eine professionelle Qualifikation braucht");
  const text = section.paragraphs.join(" ");
  for (const phrase of ["Fachwissen", "Fachdidaktisches Wissen", "Pädagogisch-psychologisches Wissen", "Veranschaulichung, kein Studienfall", "½ + ⅓ = ⅖", "3/6 + 2/6 = 5/6", "unbekannte Aufgabe", "Kompetenzen 1-3", "7-8", "07.10.2022", "Ausbildungsanforderungen, kein Nachweis", "zehnten Klassen", "vergleicht nicht Eltern- und Schulunterricht", "Ausbildungsabschluss allein guten Unterricht verursacht"]) assert.ok(text.includes(phrase), phrase);
  assert.match(record.sections[index].paragraphs.join(" "), /kognitive und methodische Kompetenzen/);
  assert.ok(record.navigation_groups[0].section_ids.includes("lehrkompetenz"));
  assert.ok(section.source_ids.every(id => record.source_snapshot.some(source => source.source_id === id && source.primary_source)));
});

test("home education distinguishes missing design details, actual controls and individual capabilities", () => {
  const record = prepared();
  const home = record.sections.find(s => s.id === "hausunterricht").paragraphs.join(" ");
  for (const phrase of ["Abschnitt IV.26", "halbjährliche zentrale Prüfungen", "Rückkehr zur Schule bei Lernrückständen", "zwischen den Prüfungen", "Nicht geregelt heißt nicht ausdrücklich ausgeschlossen", "Kompetenzen besitzen oder erwerben", "für jedes Kind sichern"]) assert.ok(home.includes(phrase), phrase);
  const comparison = record.sections.find(s => s.id === "unsicherheit").paragraphs.join(" ");
  for (const phrase of ["Qualifikation der Unterrichtenden", "Qualität und Breite des Lernprozesses", "nachgewiesene Kompetenzen der Absolventen", "allein beweist keine fehlende Schülerkompetenz"]) assert.ok(comparison.includes(phrase), phrase);
  const visual = record.sections.find(s => s.id === "eingriffe").visual;
  assert.ok(visual.items.some(row => row.title === "Verständnis und selbstständiges Lernen" && row.direction === "negative" && row.condition.includes("Fehlen")));
  assert.ok(record.monitoring.points.some(point => point.id === "lehrkompetenz" && point.indicator.includes("getrennt prüfen")));
  const opinion = record.author_perspective.paragraphs.join(" ");
  assert.match(opinion, /nachweislich systematisch nicht erreicht, ist ein solcher Abschluss für mich nicht als gleichwertig anerkennenswert/);
  assert.match(opinion, /keine Behauptung, sämtliche heutigen Abschlüsse/);
});

test("journal publication months are preserved without inventing a day", () => {
  const source = packet.source_catalog.find(source => source.key === "baumert2010");
  assert.equal(source.source_function, "research");
  assert.equal(source.published_at, "2010-03");
  assert.equal(formatEditorialSourceDate(source), "März 2010");
  assert.equal(formatEditorialSourceDate({ published_at: "2022-10-07" }), "07.10.2022");
  assert.equal(formatEditorialSourceDate({ published_at: null }), "Publikationsdatum nicht angegeben");
  const html = editorialAnalysisPage(prepared(), story);
  assert.match(html, /Fachlicher Forschungsstand · Dokumentstand März 2010/);
  assert.doesNotMatch(html, /Dokumentstand 01\.03\.2010/);
  for (const badDate of [null, "2010-03-01", "2010-13", "2010-3"]) {
    const bad = structuredClone(packet);
    bad.source_catalog.find(source => source.key === "baumert2010").published_at = badDate;
    assert.throws(() => prepareEditorialReview(bad, story, null, packet.research_checked_at), /RESEARCH_DATE_INVALID/);
  }
});

test("editorial update keeps the original publication and complete previous content", () => {
  const earlier = structuredClone(packet);
  earlier.sections.find(section => section.id === "lehrkompetenz").paragraphs[0] = "Eine frühere Formulierung bleibt nachvollziehbar archiviert.";
  earlier.revision_note = "Erstfassung";
  const original = prepareEditorialReview(earlier, story, null, packet.research_checked_at).record;
  const saved = structuredClone(original);
  const update = prepareEditorialReview(packet, story, original, "2026-09-08T23:00:00Z");
  assert.equal(update.changed, true);
  assert.equal(update.record.version, 2);
  assert.equal(update.record.analysis_id, original.analysis_id);
  assert.equal(update.record.published_at, original.published_at);
  assert.equal(update.record.versions.length, 2);
  assert.deepEqual(update.record.versions[1].previous_content.sections, original.sections);
  assert.deepEqual(update.record.versions[1].previous_content.author_perspective, original.author_perspective);
  assert.deepEqual(original, saved);
  assert.equal(update.record.versions[1].change_note, packet.revision_note);
  assert.equal(prepareEditorialReview(packet, story, update.record, "2026-09-08T23:01:00Z").changed, false);
});
