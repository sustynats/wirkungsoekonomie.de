import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadManualEditorials, manualEdition, EDITORIAL_AUTHOR } from "../../scripts/news/manual-editorial.mjs";
import { renderEditorialMarkdown } from "../../scripts/news/editorial-markdown.mjs";
import { isManualEditorial, assertAutomatable } from "../../scripts/news/manual-policy.mjs";
import { editorialAnalysisPage } from "../../scripts/news/build.mjs";
import { buildEditorialAnalysisPrompt, sanitizeEditorialAnalysis } from "../../scripts/news/editorial-analysis.mjs";
import { buildAnalysisPrompt, callWoekAi } from "../../scripts/news/lib.mjs";
import { runEditorialAnalyses } from "../../scripts/news/run-editorial-analyses.mjs";
import { normalizePublicationTypography, isFrozenPublicationSource } from "../../scripts/lib/public-typography.mjs";
import { normalizePublicPunctuation } from "../../scripts/quality/public-punctuation.mjs";
import { checkManualPages } from "../../scripts/news/check-manual-pages.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "content/news/manual");
const manifest = JSON.parse(fs.readFileSync(path.join(directory, "editions.json")));
const editions = loadManualEditorials(root).filter(a => !a.self_authored_work);
const source = fs.readFileSync(path.join(directory, manifest.entries[0].source_file), "utf8");

test("all three complete signed manuscripts load, with one fixed original portrait", () => {
  assert.deepEqual(editions.map(a => a.slug), ["deutschland-2033-justus-bender", "werte-maja-goepel", "kurzschluss-claudia-kemfert"]);
  for (const a of editions) {
    assert.equal(a.author, EDITORIAL_AUTHOR);
    assert.equal(a.manual_only, true);
    assert.ok(a.body_markdown.split(/\s+/).length > 2000);
    assert.ok(a.rendered.sections.length >= 13);
    assert.notEqual(a.author.image, a.book.cover);
  }
  assert.equal(editions[1].subtype, "Grundlagenbuch");
  assert.equal(EDITORIAL_AUTHOR.nickname, "Nats");
  assert.match(EDITORIAL_AUTHOR.image_alt, /eigenen Buch Die neue Ordnung des Wohlstands/);
});

test("changed text, missing manual authority and traversing cover fail closed", () => {
  assert.throws(() => manualEdition(manifest.entries[0], source + " "), /HASH_MISMATCH/);
  assert.throws(() => manualEdition({ ...manifest.entries[0], manual_only: false }, source), /AUTHORITY_REQUIRED/);
  assert.throws(() => manualEdition({ ...manifest.entries[0], book_cover: { ...manifest.entries[0].book_cover, file: "../x.jpg" } }, source), /OFFICIAL_COVER_REQUIRED/);
});

test("the Markdown subset preserves prose and punctuation, handles tables, and rejects executable input", () => {
  const result = renderEditorialMarkdown("## Prüfen\n\nA – B. **Wichtig.**\n\n| Ziel | Risiko |\n| --- | --- |\n| Lernen | Verlust |");
  assert.match(result.html, /A – B\. <strong>Wichtig\.<\/strong>/);
  assert.match(result.html, /scope="col"/);
  assert.match(result.html, /tabindex="0"/);
  assert.doesNotMatch(result.html, /news-manual-table--wide/);
  const wide = renderEditorialMarkdown("| Ziel | Maßnahme | Risiko |\n| --- | --- | --- |\n| Lernen | Fördern | Verlust |");
  assert.match(wide.html, /news-manual-table--wide/);
  const css = fs.readFileSync(path.join(root, "assets/css/news.css"), "utf8");
  assert.match(css, /\.news-editorial-article--book \.news-manual-table--wide \.data-table\s*\{\s*min-width: 40rem !important;/);
  assert.throws(() => renderEditorialMarkdown('<script>alert(1)</script>'), /UNSUPPORTED_BLOCK/);
  assert.throws(() => renderEditorialMarkdown('[x](javascript:alert)'), /UNSAFE_LINK/);
  assert.throws(() => renderEditorialMarkdown('![x](https://example.org/x.jpg)'), /UNSUPPORTED_BLOCK/);
});

for (const a of editions) test(a.slug + ": shared page, SEO and signed text survive typography and full text gate", t => {
  const relatedAnalyses = editions.filter(b => a.manual_related_slugs.includes(b.slug));
  const html = editorialAnalysisPage(a, undefined, { relatedAnalyses });
  assert.match(html, /Buch &amp; Wirkung/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"@type":"Book"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /name="twitter:card"/);
  assert.ok(html.includes(a.book.cover));
  assert.ok(html.includes(a.author.image));
  assert.doesNotMatch(html, /\/undefined\/|Visuelle Einordnung der Ursprungsgeschichte|Relevanz für Mensch, Planet und Demokratie/);
  assert.equal(normalizePublicationTypography(html), html);
  assert.equal(normalizePublicPunctuation(html, ".html"), html);
  // Full text gate uses an isolated output; no generated source files touched.
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "woek-book-render-"));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const page = path.join(temp, "wirkungsticker/analyse", a.slug, "index.html");
  fs.mkdirSync(path.dirname(page), { recursive: true }); fs.writeFileSync(page, html);
  for (const asset of [a.author.image, a.book.cover]) {
    const file = path.join(temp, asset); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.copyFileSync(path.join(root, asset), file);
  }
  const check = { ...a, manual_related_slugs: relatedAnalyses.map(b => b.slug) };
  assert.equal(checkManualPages(temp, [check]), 1);
  fs.writeFileSync(page, html.replace(a.rendered.sections[0].blocks[0], "<p>gekürzt</p>"));
  assert.throws(() => checkManualPages(temp, [check]), /PUBLISHED_TEXT_CHANGED/);
});

test("manual inputs and model outputs cannot cross news or editorial generation boundaries", async () => {
  for (const item of [{ manual_only: true }, { manualOnly: true }, { format: "book_and_impact" }, { format: "Buch & Wirkung" }]) {
    assert.equal(isManualEditorial(item), true);
    assert.throws(() => assertAutomatable(item), /AUTOMATION_FORBIDDEN/);
    assert.throws(() => buildAnalysisPrompt([item]), /AUTOMATION_FORBIDDEN/);
    assert.throws(() => buildEditorialAnalysisPrompt(item, {}), /AUTOMATION_FORBIDDEN/);
    assert.throws(() => sanitizeEditorialAnalysis(item, {}), /AUTOMATION_FORBIDDEN/);
    await assert.rejects(callWoekAi([item], { prompt: "custom prompt", apiUrl: "https://invalid.example" }), /AUTOMATION_FORBIDDEN/);
  }
  assert.throws(() => buildAnalysisPrompt([{ existing_story: editions[0] }]), /AUTOMATION_FORBIDDEN/);
  assert.doesNotThrow(() => assertAutomatable({ format: "analysis" }));
  assert.ok(isFrozenPublicationSource("content/news/manual/example.md"));
  assert.equal(normalizePublicationTypography("Unverbindlicher – Text"), "Unverbindlicher - Text");
});

test("autopilot skips manual records without a model call or changing manuscripts", async t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "woek-book-autopilot-"));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  fs.mkdirSync(path.join(temp, "data/news"), { recursive: true });
  fs.cpSync(directory, path.join(temp, "content/news/manual"), { recursive: true });
  const before = manifest.entries.map(r => fs.readFileSync(path.join(temp, "content/news/manual", r.source_file), "utf8"));
  const manual = { ...editions[0], story_id: "wt-manual", published: true, analysis: {} };
  fs.writeFileSync(path.join(temp, "data/news/stories.json"), JSON.stringify({ stories: [manual] }));
  const result = await runEditorialAnalyses({ root: temp, execute: true, registry: { sources: [] }, build: () => {},
    callAiImpl: () => assert.fail("Manual format reached model"), now: "2026-09-09T20:30:00Z" });
  assert.equal(result.scanned_stories, 0);
  assert.deepEqual(manifest.entries.map(r => fs.readFileSync(path.join(temp, "content/news/manual", r.source_file), "utf8")), before);
});
