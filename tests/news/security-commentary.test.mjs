import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { prepareEditorialReview } from "../../scripts/news/publish-editorial-review.mjs";
import { editorialAnalysisPage } from "../../scripts/news/build.mjs";
import { editorialVisualErrors, renderSystemicVisual } from "../../scripts/news/systemic-analysis.mjs";
import { relatedEditorialAnalyses, renderEditorialParagraphs } from "../../scripts/news/editorial-presentation.mjs";
import { editorialTitleInput, createEditorialTitleAssets } from "../../scripts/news/title-image/editorial.mjs";
import { renderTitleImage } from "../../scripts/news/title-image/index.mjs";
import { publicTitleImage } from "../../scripts/news/title-image/pipeline.mjs";

const packet = JSON.parse(fs.readFileSync(new URL("../../content/news/reviews/2026-09-09-sachsen-anhalt-sicherheitsrisiko.json", import.meta.url)));
const story = { story_id: packet.story_id, slug: "origin", title: "Wahlergebnis", published: true, listed: true, source_integrity: { status: "verified" }, last_updated: packet.research_checked_at, sources: [], claims: [], analysis: {} };
const prepared = () => prepareEditorialReview(structuredClone(packet), story, null, packet.research_checked_at).record;
const text = id => prepared().sections.find(s => s.id === id).paragraphs.join(" ");

test("complete commissioned security analysis retains its tables, examples and author perspective", () => {
  const record = prepared();
  assert.equal(record.author.name, "Natalie Weber");
  assert.equal(record.editorial_genre, "commentary");
  assert.equal(record.sections.length, 15);
  assert.ok(record.sections.flatMap(s => s.paragraphs).join(" ").split(/\s+/).length >= 1950);
  assert.equal(record.source_snapshot.length, 24);
  assert.equal(record.reading_time_minutes, 13);
  assert.equal(record.author_perspective.paragraphs.length, 4);
  assert.match(record.author_perspective.paragraphs.at(-1), /Wer die Einrichtungen schwächt, die beides schützen, macht das Land verwundbarer/);
  assert.match(text("geheimdienste"), /vereinfachten Beispiel/);
  assert.match(text("schulen"), /Bus nicht mehr bezahlt/);
  assert.match(text("justiz"), /arbeitsfähige Geschäftsstelle/);
  const tables = record.sections.filter(s => s.visual?.type === "reference_table");
  assert.deepEqual(tables.map(s => [s.visual.columns.length, s.visual.items.length]), [[3, 4], [2, 3]]);
  assert.equal(prepareEditorialReview(packet, story, record, packet.research_checked_at).changed, false);
});

test("sensitive claims retain their legal, temporal and empirical limits", () => {
  assert.match(text("lage"), /Regierungsbildung ist zum Recherchezeitpunkt offen/);
  assert.match(text("geheimdienste"), /Informationssperre.*öffentlich nicht belegt/);
  assert.match(text("geheimdienste"), /bereits erfolgter Informationsabfluss wird damit nicht behauptet/);
  assert.match(text("geheimdienste"), /Gesetzliche Informationspflichten bleiben bestehen/);
  assert.match(text("verfassungsschutz"), /nicht sämtlicher Beschwerdemöglichkeiten/);
  assert.match(text("buergerwacht"), /Parteimiliz würde, ist damit nicht belegt/);
  assert.match(text("kultur-medien"), /25\. Juni 2026 lehnte der Landtag den Antrag ab/);
  assert.match(text("kultur-medien"), /keine geltende Förderregel/);
  assert.match(text("kultur-medien"), /Zustimmung des Landtags/);
  assert.match(text("teilhabe"), /nicht gleichbedeutend mit der Abschaffung sämtlicher kommunaler Stellen/);
  assert.match(text("schulen"), /halbjährliche zentrale Prüfungen/);
  assert.match(text("wirtschaft-energie"), /2,2 Milliarden Euro jährlich/);
  assert.match(text("wirtschaft-energie"), /Programmkalkulation, kein bereits festgestelltes Haushaltsdefizit/);
  assert.match(text("justiz"), /kein Nachweis bereits erfolgter Abwanderung/);
  assert.equal(prepared().claim_ledger.filter(c => c.type === "observed_impact").length, 0);
});

test("direction is negative risk, distinct from open occurrence and unquantified magnitude", () => {
  const record = prepared();
  for (const item of Object.values(record.subject_dimensions)) {
    assert.equal(item.direction, "negative"); assert.equal(item.likelihood, "open"); assert.equal(item.magnitude, "open");
  }
  assert.equal(record.assessment_context, "risk");
  assert.deepEqual(editorialVisualErrors(record), []);
  assert.match(text("mpd"), /SDG\+ ist eine WÖk-eigene Erweiterung/);
});

test("reference tables preserve accessible columns and escape all text", () => {
  const record = prepared();
  const visual = record.sections.find(s => s.id === "beobachtung").visual;
  visual.items[0].cells[1] = '<script>alert("x")</script>';
  const html = renderSystemicVisual(visual, new Map());
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.equal((html.match(/scope="row"/g) || []).length, 4);
  assert.equal((html.match(/scope="col"/g) || []).length, 3);
  assert.equal((html.match(/news-evidence-table__label/g) || []).length, 12);
  visual.items[0].cells.pop();
  assert.equal(renderSystemicVisual(visual, new Map()), "");
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_REFERENCE_TABLE_INVALID"));
  visual.items = [null];
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_REFERENCE_TABLE_INVALID"));
});

test("paragraph citations resolve beside claims and cannot point outside their source snapshot", () => {
  const record = prepared(); const section = record.sections.find(s => s.id === "kultur-medien");
  const html = renderEditorialParagraphs(section, new Map(record.source_snapshot.map(s => [s.source_id, s])));
  assert.match(html, /news-inline-citation/);
  assert.match(html, /kulturfoerderung-erst-nach-staatsbekenntnis/);
  assert.doesNotMatch(html, /undefined|\[\^/);
  section.paragraph_refs[0].source_ids = ["invented"];
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_PARAGRAPH_REFERENCE_INVALID"));
  section.paragraph_refs = [null];
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_PARAGRAPH_REFERENCE_INVALID"));
  section.callout_indices = [1000];
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_CALLOUT_INDEX_INVALID"));
});

test("explicit related links are bidirectional without rewriting the previous analysis", () => {
  const record = prepared();
  const existing = {slug:packet.related_analysis_slugs[0],status:"published",title:"Wenn aus Programm Staatsmacht wird",updated_at:"2026-09-07T12:00:00Z"};
  const before = JSON.stringify(existing);
  const other = {...existing,slug:"unrelated"};
  assert.deepEqual(relatedEditorialAnalyses(existing, [record, existing, other]), [record]);
  assert.deepEqual(relatedEditorialAnalyses(record, [record, existing, other]), [existing]);
  assert.deepEqual(relatedEditorialAnalyses(existing, [{...record,status:"draft"}]), []);
  assert.equal(JSON.stringify(existing), before);
  const html = editorialAnalysisPage(record, story, { relatedAnalyses: [existing] });
  assert.match(html, /news-editorial-related/);
  assert.doesNotMatch(html, /Visuelle Einordnung der Ursprungsgeschichte/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]),match[1]);
  const broken=prepared(); broken.related_analysis_slugs=['../escape'];
  assert.ok(editorialVisualErrors(broken).includes('EDITORIAL_ANALYSIS_RELATION_INVALID'));
});

test("own share cards use the reviewed subject, risk labels and immutable existing release storage", async () => {
  const input = editorialTitleInput(packet);
  assert.equal(input.dimensions.planet.relevance, "hoch");
  assert.equal(input.source, "Natalie Weber");
  assert.equal(input.date, null);
  const rendered = renderTitleImage(input, {size:"og",fonts:"none"});
  assert.deepEqual(rendered.warnings, []);
  assert.equal(rendered.layout.truncated, false);
  assert.match(rendered.svg, /TRAGWEITE &amp; RICHTUNG/);
  assert.equal((rendered.svg.match(/\? offen/g)||[]).length,3);
  assert.doesNotMatch(rendered.svg, /Ausgangsmeldung|KI-generiertes/);
  let uploaded=0;
  const result=await createEditorialTitleAssets(packet,{outDir:'/tmp/mock-card',raster:async()=>({}),publish:async files=>{uploaded=files.length;}});
  assert.equal(uploaded,2); assert.equal(result.provider_calls,0);
  assert.ok(publicTitleImage(result.title_image).og.url);
  const html=editorialAnalysisPage({...prepared(),title_image:result.title_image},story);
  assert.match(html, /property="og:image" content="https:\/\/wirkungsoekonomie\.de\/assets\/img\/news-share\/[a-f0-9]{24}\.jpg"/);
  assert.ok(html.includes(`property="og:title" content="${prepared().title}"`));
  assert.throws(()=>editorialTitleInput({...packet,assessment_context:'observed'}),/REVIEW_REQUIRED/);
});
