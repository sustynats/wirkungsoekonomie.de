import test from "node:test";
import assert from "node:assert/strict";
import { normalizePublicPunctuation } from "../../scripts/quality/public-punctuation.mjs";
import { renderStoryVisual, renderEditorialClaimMap } from "../../scripts/news/story-visual.mjs";
import { publicTitleImage } from "../../scripts/news/title-image/pipeline.mjs";
import { editorialEvidenceGate, editorialAnalysisAssessment } from "../../scripts/news/editorial-analysis.mjs";
import { storyCard, storyPage } from "../../scripts/news/build.mjs";

// Rendering contracts must not depend on the order or image state of live news.
// These allowlisted URLs are synthetic fixtures; the renderer never fetches them.
const FIXTURE_ASSET = "https://github.com/sustynats/wirkungsoekonomie.de/releases/download/wirkungsticker-media-2026-09/wt-0000000000000001-0000000000000002";
function titleImageFixture(mode) {
  return {
    mode,
    wide: { url: `${FIXTURE_ASSET}-wide.png` },
    ...(mode === "editorial" ? { source_visual: { url: `${FIXTURE_ASSET}-source.png` } } : {}),
  };
}
function visualStoryFixture(title_image) {
  return {
    story_id: "wt-0000000000000001",
    slug: "release-safety-fixture",
    title: "Eine geprüfte Nachricht mit einer verständlichen Wirkungskarte",
    source_summary: "Eine Behörde hat einen Bericht veröffentlicht. Welche weiteren Folgen entstehen, bleibt offen.",
    topic: ["Politik"],
    published: true,
    current_version: 1,
    first_seen: "2026-09-07T09:00:00Z",
    published_at: "2026-09-07T09:15:00Z",
    last_updated: "2026-09-07T09:15:00Z",
    sources: [{ source_id: "fixture", publisher: "Testquelle", title: "Bericht", url: "https://example.org/bericht", published_at: "2026-09-07T09:00:00Z", primary_source: true }],
    claims: [],
    versions: [],
    analysis: {
      summary: "Die Behörde hat einen Bericht veröffentlicht; weitere Folgen sind noch nicht belegt.",
      why_relevant: "Der Bericht betrifft öffentliche Entscheidungen.",
      importance: "hoch",
      status: "laufende Entwicklung",
      analysis_type: "monitoring",
      human: { relevance: "hoch", tendency: "risiko", rationale: "Mögliche Belastungen bleiben zu prüfen." },
      planet: { relevance: "offen", tendency: "offen", rationale: "Ein Umweltwirkpfad ist offen." },
      democracy: { relevance: "mittel", tendency: "offen", rationale: "Weitere Folgen sind offen." },
    },
    title_image,
  };
}

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
  const story = { sources: [{ publisher: "A", url: "https://a.example/article", primary_source: true }, { publisher: "B", url: "https://b.example/article" }], claims: [{ source_id: "A" }] };
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
  for (const mode of ["impact_card", "editorial"]) {
    const story = visualStoryFixture(titleImageFixture(mode));
    const before = JSON.stringify(story);
    const image = publicTitleImage(story.title_image);
    assert.ok(image?.wide, "gültiges Rasterbild als Testvoraussetzung");
    const html = renderStoryVisual(story, { detail: true, sourceLabel: "Quelle" });
    assert.equal((html.match(/<h1 /g) || []).length, 1);
    assert.equal((html.match(/<figcaption /g) || []).length, 1);
    assert.doesNotMatch(html, /Tragweite für/);
    assert.match(html, /Darstellung, kein Beleg/);
    assert.ok(!html.includes(story.title_image.wide.url), "kein zweites bereits beschriftetes Rasterbild");
    if (mode === "editorial") {
      assert.ok(image.background, "gültiges Symbolbild als Testvoraussetzung");
      assert.ok(html.includes(image.background.url));
    }
    assert.equal(JSON.stringify(story), before);
    const card = renderStoryVisual(story, { href: "./story/" });
    assert.match(card, /<h2 /);
    assert.match(card, /href="\.\/story\/"/);
  }
});

test("Symbolbild-Hintergründe lassen keine fremden Hosts oder Schema-Injection zu", () => {
  for (const url of ["javascript:alert(1)", "https://example.org/source.png", "https://github.com/other/repo/releases/download/source.png"]) {
    const image = publicTitleImage({ ...titleImageFixture("editorial"), source_visual: { url } });
    assert.ok(image?.wide, "Rasterbild bleibt gültig, nur der fremde Hintergrund wird verworfen");
    assert.equal(image.background, undefined);
  }
});

for (const [name, title_image] of [
  ["fehlenden Bildmetadaten", undefined],
  ["wartender Bildverarbeitung", { retry_after: "2026-09-07T10:00:00Z" }],
  ["Wirkungskarten ohne Rasterbilder", { mode: "impact_card" }],
  ["Wirkungskarten mit ausschließlich OpenGraph-Fallback", { mode: "impact_card", source_visual: null, og: { url: "/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png" }, status: "fallback", fallback_reason: "TITLE_IMAGE_UNAVAILABLE" }],
  ["ungültigen Bildverweisen", { mode: "editorial", wide: { url: "https://untrusted.example/image.png" }, source_visual: { url: "javascript:alert(1)" } }],
]) {
  test(`Einheitliche Wirkungskarte bei ${name}, ohne Bildaufruf oder Textänderung`, () => {
    const story = visualStoryFixture(title_image);
    const before = JSON.stringify(story);
    const card = storyCard(story, 1);
    assert.match(card, /news-card--visual/);
    assert.equal((card.match(/<h2\b/g) || []).length, 1);
    assert.match(card, /news-story-visual__headline/);
    assert.match(card, /Wirkungskarte · WÖk-Einordnung/);
    assert.doesNotMatch(card, /wt-meter--unknown|data-magnitude=/);
    assert.doesNotMatch(card, /news-card__signals|KI-generiertes Symbolbild|news-story-visual__background|untrusted\.example|javascript:/);
    const detail = storyPage(story);
    assert.equal((detail.match(/<h1\b/g) || []).length, 1);
    assert.match(detail, /<h1 class="news-story-visual__headline">/);
    assert.doesNotMatch(detail, /news-story-visual__background|untrusted\.example|javascript:/);
    assert.equal(JSON.stringify(story), before);
  });
}

test("Ohne Story oder Analyse werden keine Werte für eine Wirkungskarte erfunden", () => {
  assert.equal(renderStoryVisual(null), "");
  assert.equal(renderStoryVisual({ title: "Noch ungeprüft" }), "");
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
