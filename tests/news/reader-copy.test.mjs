import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { analysisReaderCopy, hasEditorialResidue, readerHtmlHasEditorialResidue } from "../../scripts/news/reader-copy.mjs";
import { validateAnalysis } from "../../scripts/news/lib.mjs";
import { shouldRetryQualityGate } from "../../scripts/news/run.mjs";
import { editorialAnalysisPage } from "../../scripts/news/build.mjs";

test("concrete findings and honest limitations are not editorial residue", () => {
  for (const text of ["Laut Polizei bleibt die Brandursache offen.", "Eine konkrete gesellschaftliche Wirkung ist hier nicht nachgewiesen.", "Korrektur: Die frühere Quellenzuordnung war falsch.", "Die Zeitung veröffentlicht einen Redaktionshinweis zum früheren Bericht.", "Oracle meldet Investitionen in Rechenzentren.", "Das Zitat ist nicht automatisch die Position des Mediums."]) assert.equal(hasEditorialResidue(text), false, text);
});

test("editorial directives are rejected without modifying text", () => {
  for (const text of ["Wahrheit zuerst: Belegtes steht vor Behauptungen.", "Das interne Claim-Ledger bindet Aussagen an Quellen.", "Redaktionshinweis: Bitte umformulieren.", "Vor Veröffentlichung noch prüfen.", "TODO: Quelle ergänzen.", "Prüfgrund: controlled_source_text"]) assert.equal(hasEditorialResidue(text), true, text);
  assert.equal(readerHtmlHasEditorialResidue('<p><strong>Wahrheit zuerst:</strong> Ein Prüfprinzip.</p>'), true);
  assert.equal(readerHtmlHasEditorialResidue('<script type="application/ld+json">{"media_trigger":true}</script><p>Die Ermittlungen laufen.</p>'), false);
});

test("internal diagnostic fields remain allowed while public fields fail the existing quality gate", () => {
  const story = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url))).stories.find(item => item.published && item.listed !== false);
  const analysis = { ...structuredClone(story.analysis), source_summary: story.source_summary, media_trigger: { reason: "TODO: intern prüfen" }, self_frame_check: { problems: ["Redaktionshinweis: Titel kürzen."] } };
  assert.equal(hasEditorialResidue(analysisReaderCopy(analysis)), false);
  analysis.detail_summary += " Redaktionshinweis: Bitte Quelle ergänzen.";
  assert.ok(validateAnalysis(analysis, story, { persisted: true, validateSourceSummaryNumbers: false }).includes("AI_PUBLIC_EDITORIAL_RESIDUE"));
  assert.equal(shouldRetryQualityGate("QUALITY_GATE_FAILED", ["AI_PUBLIC_EDITORIAL_RESIDUE"]), true);
  assert.equal(shouldRetryQualityGate("QUALITY_GATE_FAILED", ["AI_PUBLIC_EDITORIAL_RESIDUE"], 1, "2026-09-06T16:00:00Z", "2026-09-06T15:00:00Z"), false, "existing retry backoff still applies");
  assert.match(analysis.detail_summary, /Redaktionshinweis:/, "gate does not silently strip journalism");
});

test("existing WÖk analyses show evidence, attribution and method links without internal process copy", () => {
  const stories = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url))).stories;
  const analyses = JSON.parse(fs.readFileSync(new URL("../../data/news/editorial-analyses.json", import.meta.url))).analyses;
  for (const analysis of analyses.filter(item => item.status === "published")) {
    const before = structuredClone(analysis);
    const html = editorialAnalysisPage(analysis, stories.find(story => story.story_id === analysis.story_id));
    assert.equal(readerHtmlHasEditorialResidue(html), false, analysis.analysis_id);
    assert.match(html, /Aussagen und zugehörige Belege ansehen/);
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/methodik\/"/);
    assert.match(html, /news-editorial-ledger/);
    assert.deepEqual(analysis, before);
  }
});
