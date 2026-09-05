import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { normalizePublicPunctuation } from "../../scripts/quality/public-punctuation.mjs";
import { renderStoryVisual, renderEditorialClaimMap } from "../../scripts/news/story-visual.mjs";
import { publicTitleImage } from "../../scripts/news/title-image/pipeline.mjs";
import { editorialEvidenceGate, editorialAnalysisAssessment } from "../../scripts/news/editorial-analysis.mjs";

test("Sprachnormalisierung verändert weder ausführbaren Code noch HTML-Skripte oder URLs", () => {
  const dash = String.fromCharCode(0x2014);
  const code = `const regexp = /^[-–${dash}:(]/u;`;
  for (const ext of [".mjs", ".js", ".ts", ".json", ".css", ".yml"]) assert.equal(normalizePublicPunctuation(code, ext), code);
  const html = `<p>Text ${dash} lesbar</p><a href="/pfad${dash}x/">Link</a><script>${code}</script><pre>${code}</pre>`;
  const expected = html.replace(`Text ${dash} lesbar`, "Text - lesbar");
  assert.equal(normalizePublicPunctuation(html, ".html"), expected);
  assert.equal(normalizePublicPunctuation(expected, ".html"), expected);
  const markdown = `Text ${dash} lesen https://example.org/p${dash}x/ \`${code}\``;
  assert.equal(normalizePublicPunctuation(markdown, ".md"), markdown.replace(`Text ${dash}`, "Text -"));
});

test("Source Integrity besteht nicht bei fehlendem oder unbekanntem Status", () => {
  const story = { sources: [{ publisher: "A", primary_source: true }, { publisher: "B" }], claims: [{ source_id: "A" }] };
  for (const status of [undefined, "open", "passed", "failed", "unknown"]) {
    story.source_integrity = { status };
    assert.equal(editorialEvidenceGate(story).passed, false, status);
  }
  story.source_integrity = { status: "verified" };
  assert.equal(editorialEvidenceGate(story).passed, true);
});

test("Publikation und Wichtigkeit werden nicht als beobachtete Wirkung oder Risikobefund gezählt", () => {
  const story = { analysis: { importance: "sehr hoch", third_order: ["Noch offen. ".repeat(30)] }, claims: [{ claim: "Die Behörde hat den Bericht veröffentlicht.", source_id: "a" }] };
  const factors = editorialAnalysisAssessment(story).factors;
  assert.equal(factors.observed_impact, 0);
  assert.equal(factors.impact_risk, 0);
  assert.equal(factors.impact_potential, 0);
  assert.equal(editorialAnalysisAssessment(story).factor_status.impact_risk, "open");
  assert.equal(factors.third_order_relevance, 0);
  assert.equal(factors.editorial_priority, 8);
  story.claims[0].type = "observed_impact";
  story.claims[0].status = "open";
  assert.equal(editorialAnalysisAssessment(story).factors.observed_impact, 0);
});

test("Wirkungskarte und Symbolbild verwenden einen echten, einmaligen Titel und eine Kennzeichnung", () => {
  const stories = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url))).stories;
  for (const mode of ["impact_card", "editorial"]) {
    const story = stories.find(story => story.title_image?.mode === mode && (mode !== "editorial" || story.title_image.source_visual));
    assert.ok(story, mode);
    const before = JSON.stringify(story);
    const image = publicTitleImage(story.title_image);
    const html = renderStoryVisual(story, { detail: true, sourceLabel: "Quelle" });
    assert.equal((html.match(/<h1 /g) || []).length, 1);
    assert.equal((html.match(/<figcaption /g) || []).length, 1);
    assert.match(html, /Relevanz für/);
    assert.match(html, /Darstellung, kein Beleg/);
    assert.ok(!html.includes(story.title_image.wide.url), "kein zweites bereits beschriftetes Rasterbild");
    if (mode === "editorial") assert.ok(html.includes(image.background.url));
    assert.equal(JSON.stringify(story), before);
    const card = renderStoryVisual(story, { href: "./story/" });
    assert.match(card, /<h2 /);
    assert.match(card, /href="\.\/story\/"/);
  }
});

test("Symbolbild-Hintergründe lassen keine fremden Hosts oder Schema-Injection zu", () => {
  const source = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url))).stories.find(s => s.title_image?.mode === "editorial");
  for (const url of ["javascript:alert(1)", "https://example.org/source.png", "https://github.com/other/repo/releases/download/source.png"]) {
    const image = publicTitleImage({ ...source.title_image, source_visual: { url } });
    assert.equal(image.background, undefined);
  }
});

test("Analyse-Gegenüberstellung entsteht nur mit Erklärgewinn und verändert keine Claims", () => {
  const analysis = { claim_ledger: [{ type: "fact", claim: "Ein Standard wurde beschlossen.", source_ids: ["a"] }], source_snapshot: [{ source_id: "a", publisher: "Originalstelle", url: "https://example.org/bericht" }] };
  assert.equal(renderEditorialClaimMap(analysis), "");
  analysis.claim_ledger.push({ type: "impact_risk", claim: "Folgekosten können entstehen.", source_ids: [] });
  const before = JSON.stringify(analysis);
  const html = renderEditorialClaimMap(analysis);
  assert.match(html, /Quellenstand/);
  assert.match(html, /Mögliches Risiko/);
  assert.match(html, /kein automatischer Ursache-Wirkungs-Nachweis/);
  assert.match(html, /href="https:\/\/example.org\/bericht"/);
  assert.equal(JSON.stringify(analysis), before);
});
