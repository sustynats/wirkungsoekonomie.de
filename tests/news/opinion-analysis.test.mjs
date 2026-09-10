import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { prepareEditorialReview } from "../../scripts/news/publish-editorial-review.mjs";
import { editorialAnalysisPage } from "../../scripts/news/build.mjs";
import { EDITORIAL_TRANSPARENCY_NOTE, editorialLabel, editorialVisualErrors, renderSystemicVisual } from "../../scripts/news/systemic-analysis.mjs";
import { AUTHOR_ANALYSIS_RULE } from "../../scripts/news/analysis-principles.mjs";
import { renderIcon } from "../../scripts/news/visuals.mjs";

const read = file => JSON.parse(fs.readFileSync(new URL(`../../${file}`, import.meta.url)));
const packet = read("content/news/reviews/2026-09-07-volkspartei-rueckkopplung.json");
const story = { story_id: packet.story_id, slug: "origin", title: "Wahlergebnis", published: true, listed: true, source_integrity: { status: "verified" }, last_updated: packet.research_checked_at, sources: [], claims: [], analysis: {} };
const prepared = () => prepareEditorialReview(structuredClone(packet), structuredClone(story), null, packet.research_checked_at).record;

test("opinion and analysis is a shared label, not a new route or fabricated historical opinion", () => {
  for (const variant of [{}, { analysis_variant: "systemic" }, { editorial_genre: "commentary" }]) assert.equal(editorialLabel(variant), "Meinung & Analyse");
  const modern = prepared();
  const legacy = { ...modern, analysis_variant: "standard", editorial_genre: undefined, editorial_mode: undefined, author_perspective: undefined, editorial_rules_version: undefined };
  for (const record of [modern, legacy]) {
    const before = JSON.stringify(record);
    const html = editorialAnalysisPage(record, story);
    assert.equal(JSON.stringify(record), before);
    assert.match(html, /Meinung &amp; Analyse/);
    assert.ok(html.includes(`https://wirkungsoekonomie.de/wirkungsticker/analyse/${record.slug}/`));
    assert.ok(html.includes(`"datePublished":"${record.published_at}"`));
    assert.equal(html.split(EDITORIAL_TRANSPARENCY_NOTE).length - 1, 1);
    assert.ok(html.indexOf("news-editorial-byline") < html.indexOf(EDITORIAL_TRANSPARENCY_NOTE));
    if (!record.author_perspective) assert.doesNotMatch(html, /id="meine-einordnung"/);
  }
  assert.match(AUTHOR_ANALYSIS_RULE, /Fakten/);
  assert.match(AUTHOR_ANALYSIS_RULE, /persönliche/);
});

test("commissioned feedback commentary passes evidence gates without changing earlier analyses", () => {
  const record = prepared();
  assert.equal(record.author.name, "Natalie Weber");
  assert.equal(record.author_perspective.origin, "commissioned_author_draft");
  assert.ok(record.reading_time_minutes >= 9 && record.reading_time_minutes <= 14);
  assert.equal(record.navigation_groups.length, 6);
  assert.ok(record.source_snapshot.filter(source => source.primary_source).length >= 2);
  const body = record.sections.flatMap(section => section.paragraphs).join(" ");
  for (const figure of ["43,8", "17,2", "19,9", "77,8", "218"]) assert.ok(body.includes(figure));
  assert.match(body, /keine Vorhersage des Wahlausgangs/);
  assert.match(body, /Rentenreform und das Volumen der Steuerreform/);
  assert.match(body, /Weniger CDU-Stimmen bedeuten daher nicht automatisch weniger Demokratie/);
  assert.doesNotMatch(body, /Schulze sagte|Geld sparen|AfD ist (jetzt )?die Volkspartei/);
  assert.equal(record.subject_dimensions.planet.direction, "open");
  assert.ok(!record.claim_ledger.some(claim => claim.type === "observed_impact"));
});

test("eight visual anchors retain directions, evidence and working internal navigation", () => {
  const record = prepared(); const html = editorialAnalysisPage(record, story);
  assert.equal(record.sections.filter(section => section.visual).length + Number(Boolean(record.lead_statement)) + Number(Boolean(record.subject_dimensions)), 8);
  for (const marker of ["news-feedback--closed", "news-feedback--broken", "Rückkopplung zum Anfang", "Rückkopplung unterbrochen", "news-systemic-visual--comparison", "wt-dims--impact", "Persönliche Einordnung der Autorin"]) assert.ok(html.includes(marker), marker);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
  for (const section of record.sections) for (const link of section.links || []) assert.ok(fs.existsSync(new URL(`../../${link.href.slice(1)}index.html`, import.meta.url)), link.href);
  assert.match(renderIcon("menschen"), /#wt-i-soziales/);
});

test("feedback requires an explicit return channel and rejects incomplete or unsafe structure", () => {
  for (const status of [undefined, "invented", '<img src=x>']) {
    const record = prepared(); const visual = record.sections.find(section => section.visual?.type === "feedback").visual;
    visual.loop_status = status;
    assert.ok(editorialVisualErrors(record).includes("EDITORIAL_FEEDBACK_INVALID"));
    assert.equal(renderSystemicVisual(visual, new Map()), "");
  }
  const record = prepared(); const visual = record.sections.find(section => section.visual?.type === "feedback").visual;
  delete visual.return_label;
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_FEEDBACK_INVALID"));
  visual.return_label = '<script>alert(1)</script>';
  const html = renderSystemicVisual(visual, new Map());
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  visual.items = null;
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_FEEDBACK_INVALID"));
});
