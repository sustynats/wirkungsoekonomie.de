import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { prepareEditorialReview } from "../../scripts/news/publish-editorial-review.mjs";
import { editorialAnalysisValidationErrors } from "../../scripts/news/editorial-analysis.mjs";
import { editorialLabel, isCommissionedAnalysis, commissionedReviewState, editorialVisualErrors, renderSystemicVisual } from "../../scripts/news/systemic-analysis.mjs";
import { editorialAnalysisPage, newsReaderKey, renderEditorialLinks } from "../../scripts/news/build.mjs";

const packet = JSON.parse(fs.readFileSync(new URL("../../content/news/reviews/2026-09-07-entzauberung-durch-macht.json", import.meta.url)));
const story = { story_id: packet.story_id, slug: "origin", title: "Wahlergebnis", published: true, listed: true, source_integrity: { status: "verified" }, last_updated: packet.research_checked_at, sources: [], claims: [], analysis: {} };
const prepared = () => prepareEditorialReview(structuredClone(packet), structuredClone(story), null, packet.research_checked_at).record;

test("a commissioned commentary is independent, gated and protected from automatic rewriting", () => {
  const record = prepared();
  assert.equal(record.analysis_variant, "standard");
  assert.equal(editorialLabel(record), "Meinung & Analyse");
  assert.ok(isCommissionedAnalysis(record));
  assert.equal(commissionedReviewState(record, { ...story, last_updated: "2026-09-08T00:00:00Z" }).automatic_short_form_rewrite, false);
  assert.deepEqual(editorialAnalysisValidationErrors(record, story, { candidate: true, evidence_gate: { passed: true } }), []);
  assert.ok(record.reading_time_minutes >= 10 && record.reading_time_minutes <= 15);
  assert.equal(record.author.name, "Natalie Weber");
  assert.notEqual(record.slug, "wenn-aus-programm-staatsmacht-wird-sachsen-anhalt");
  assert.throws(() => prepareEditorialReview(packet, story, { ...record, slug: "existing-special-analysis" }, packet.research_checked_at), /PREVIOUS_SCOPE_MISMATCH/);
  assert.equal(prepareEditorialReview(packet, story, record, packet.research_checked_at).changed, false);
  const revised = prepareEditorialReview({ ...packet, revision_note: "Präzisierter Standhinweis." }, story, record, packet.research_checked_at).record;
  assert.equal(revised.versions.at(-1).previous_content.editorial_genre, "commentary");
  assert.equal(revised.versions.at(-1).previous_content.lead_statement, record.lead_statement);
  assert.notEqual(revised.versions.at(-1).previous_content.sections, record.sections);
});

test("commentary cannot masquerade as an automatic or special-analysis format", () => {
  const record = prepared();
  record.editorial_mode = "automatic";
  assert.ok(editorialAnalysisValidationErrors(record, story, { candidate: true, evidence_gate: { passed: true } }).includes("EDITORIAL_GENRE_INVALID"));
  assert.throws(() => prepareEditorialReview({ ...packet, editorial_mode: "automatic" }, story), /SCOPE_INVALID/);
});

test("reported CDU tenor, official election data and rejected motion stay accurately attributed", () => {
  const record = prepared();
  const lead = record.sections.find(s => s.id === "lage").paragraphs.join(" ");
  assert.match(lead, /kein direktes Zitat von Friedrich Merz/);
  assert.match(lead, /Jan Redmann/);
  assert.match(lead, /nichtöffentlichen Sitzung/);
  assert.match(lead, /keine hier unabhängig bestätigte Aussage/);
  const facts = record.sections.find(s => s.id === "wahl").paragraphs.join(" ");
  for (const number of ["43,8", "17,2", "77,8"]) assert.ok(facts.includes(number));
  const theatre = record.sections.find(s => s.id === "theater").paragraphs.join(" ");
  assert.match(theatre, /25\. Juni lehnte der Landtag den Antrag ab/);
  assert.match(theatre, /keine geltende Förderregel/);
  assert.match(theatre, /kein Nachweis bereits eingetretener Selbstzensur/);
  assert.ok(!record.claim_ledger.some(claim => claim.type === "observed_impact"));
  assert.equal(record.source_snapshot.find(s => s.publisher_id === "bild").primary_source, false);
});

test("study limits and real counterevidence remain visible instead of promising a future election result", () => {
  const record = prepared();
  const research = record.sections.find(s => s.id === "forschung").paragraphs.join(" ");
  for (const phrase of ["32 europäischen Ländern", "1980 bis 2023", "4,5 bis 5 Prozentpunkte", "keinen gesicherten Kausaleffekt", "keine Erfolgsgarantie", "zentristisch-populistische"]) assert.ok(research.includes(phrase), phrase);
  assert.ok(record.counter_evidence.some(c => /Tromborg/.test(c.finding)));
  assert.match(record.sections.find(s => s.id === "unsicherheit").paragraphs.join(" "), /Deutschland ist nicht Ungarn/);
  assert.ok(record.author_perspective.claim_indices.every(i => record.claim_ledger[i]));
});

test("the comparison keeps lanes separate and requires evidence, conditions and safe links", () => {
  const record = prepared(); const visual = record.sections.find(s => s.id === "system").visual;
  assert.equal(visual.lanes.length, 2);
  assert.ok(visual.items.every(item => visual.lanes.some(lane => lane.id === item.lane)));
  visual.items[0].lane = "invented";
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_COMPARISON_INVALID"));
  delete visual.items;
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_COMPARISON_INVALID"));
  visual.items = [];
  visual.lanes = [null, { id: "b" }];
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_COMPARISON_INVALID"));
  const linked = record.sections.find(s => s.links?.length);
  linked.links[0].href = "//evil.example";
  assert.ok(editorialVisualErrors(record).includes("EDITORIAL_RELATED_LINK_INVALID"));
  const html = renderSystemicVisual({type:"comparison",caption:"<script>x</script>",lanes:[{id:"a",title:"<img src=x>",summary:"<script>x</script>"}],items:[{lane:"a",title:"<script>x</script>",text:"x",status:"scenario"}]},new Map());
  assert.doesNotMatch(html, /<script>|<img/);
});

test("commentary renders seven visual anchors, distinct MPD, six navigation groups and author voice", () => {
  const html = editorialAnalysisPage(prepared(), story);
  for (const marker of ["Meinung &amp; Analyse", "wirkungsökonomisch eingeordnet", "news-editorial-callout", "news-systemic-visual--comparison", "news-systemic-visual--cards", "news-systemic-visual--network", "news-systemic-visual--cascade", "Persönliche Einordnung der Autorin", "reality-check"]) assert.ok(html.includes(marker), marker);
  assert.doesNotMatch(html, /Visuelle Einordnung der Ursprungsgeschichte/);
  assert.match(html, /href="\/wirkungsticker\/analyse\/wenn-aus-programm-staatsmacht-wird-sachsen-anhalt\/"/);
  assert.equal(packet.navigation_groups.length, 6);
  assert.doesNotMatch(html, /Tragweite offen|data-magnitude=/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
  for (const section of packet.sections) for (const link of section.links || []) assert.ok(fs.existsSync(new URL(`../../${link.href.slice(1)}index.html`, import.meta.url)), link.href);
});

test("two analyses of one origin retain distinct reader identities and both origin links", () => {
  const current = prepared(); const previous = { ...current, analysis_id: "special-analysis", slug: "special-analysis", editorial_genre: undefined, analysis_variant: "systemic" };
  assert.notEqual(newsReaderKey({type:"analysis",value:current}), newsReaderKey({type:"analysis",value:previous}));
  const html = renderEditorialLinks([current, previous]);
  for (const analysis of [current,previous]) assert.ok(html.includes(`../analyse/${analysis.slug}/`));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
});
