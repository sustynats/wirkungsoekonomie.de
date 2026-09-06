import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { prepareEditorialReview } from "../../scripts/news/publish-editorial-review.mjs";
import { editorialLabel, systemicValidationErrors, commissionedReviewState, renderSystemicVisual } from "../../scripts/news/systemic-analysis.mjs";
import { editorialResearchSourceErrors } from "../../scripts/news/editorial-analysis.mjs";
import { editorialAnalysisPage, storyPage } from "../../scripts/news/build.mjs";
import { SYSTEMIC_ANALYSIS_RULE } from "../../scripts/news/analysis-principles.mjs";

const packet = JSON.parse(fs.readFileSync(new URL("../../content/news/reviews/2026-09-07-sachsen-anhalt-sonderanalyse.json", import.meta.url)));
const story = { story_id: packet.story_id, slug: "origin", title: "Wahlnachricht", published: true, listed: true, last_updated: "2026-09-06T20:53:00Z", source_integrity: {status:"verified"}, sources: [], claims: [], analysis: {} };
const prepared = () => prepareEditorialReview(structuredClone(packet), structuredClone(story), null, "2026-09-06T23:00:00Z").record;

test("commissioned special analysis passes gates, preserves origin and uses existing source store", () => {
  const original = structuredClone(story);
  const record = prepared();
  assert.deepEqual(story, original);
  assert.equal(record.analysis_variant, "systemic");
  assert.equal(record.author.name, "Natalie Weber");
  assert.ok(record.reading_time_minutes >= 12 && record.reading_time_minutes <= 18);
  assert.deepEqual(systemicValidationErrors(record), []);
  assert.ok(record.source_snapshot.every(source => !editorialResearchSourceErrors(source, story.story_id).length));
});

test("publication is idempotent and a revision retains previous content", () => {
  const old = prepared();
  assert.equal(prepareEditorialReview(packet, story, old, "2026-09-07T01:00:00Z").changed, false);
  const updated = structuredClone(packet); updated.teaser += " Ein neuer Stand.";
  const next = prepareEditorialReview(updated, story, old, "2026-09-07T01:00:00Z").record;
  assert.equal(next.version, 2);
  assert.equal(next.published_at, old.published_at);
  assert.deepEqual(next.versions[1].previous_content.sections, old.sections);
});

test("unknown sources, missing origin integrity and future review dates fail closed", () => {
  const bad = structuredClone(packet); bad.sections[0].source_ids = ["invented"];
  assert.throws(() => prepareEditorialReview(bad, story, null, "2026-09-07T00:00:00Z"), /SOURCE_UNKNOWN/);
  assert.throws(() => prepareEditorialReview(packet, {...story, source_integrity:{status:"open"}}), /ORIGIN_NOT_VERIFIED/);
  assert.throws(() => prepareEditorialReview(packet, story, null, "2026-01-01T00:00:00Z"), /DATE_INVALID/);
});

test("an unknown source publication date is explicit, never invented from review time", () => {
  const source = prepared().source_snapshot.find(source => !source.published_at);
  assert.equal(source.document_date_status, "not_stated");
  assert.deepEqual(editorialResearchSourceErrors(source, story.story_id), []);
  delete source.document_date_status;
  assert.ok(editorialResearchSourceErrors(source, story.story_id).includes("RESEARCH_DATE_INVALID"));
});

test("visuals need epistemic labels, sources for facts and real internal targets", () => {
  const record = prepared(); const item = record.sections.find(s=>s.visual).visual.items[0];
  item.status = "fact"; item.source_ids=[]; item.href="#missing";
  const errors=systemicValidationErrors(record);
  assert.ok(errors.includes("SYSTEMIC_VISUAL_SOURCE_REQUIRED"));
  assert.ok(errors.includes("SYSTEMIC_VISUAL_TARGET_MISSING"));
  item.href="javascript:alert(1)";
  assert.ok(systemicValidationErrors(record).includes("SYSTEMIC_VISUAL_LINK_INVALID"));
});

test("monitoring never promotes a headline into measured impact", () => {
  const record = prepared();
  assert.equal(commissionedReviewState(record, story).status, "published");
  assert.equal(commissionedReviewState(record, {...story,last_updated:"2026-09-08T00:00:00Z"}).status, "research_pending");
  assert.equal(commissionedReviewState(record, story).automatic_short_form_rewrite, false);
  const point=record.monitoring.points[0]; point.status="measured";
  assert.ok(systemicValidationErrors(record).includes("SYSTEMIC_MONITOR_EVIDENCE_REQUIRED"));
  assert.equal(commissionedReviewState({analysis_variant:"standard"},story),null);
});

test("special renderer reuses article, labels and author without changing standard variant", () => {
  const record=prepared(); const html=editorialAnalysisPage(record,story);
  for(const marker of ["WÖk-Sonderanalyse","Natalie Weber","Das Wichtigste in 90 Sekunden","reality-check","versionsverlauf","news-systemic-visual--cascade",'"@type":"Article"',"2032","Art. 20a","Gleichberechtigung","18 Min."]) assert.ok(html.includes(marker),marker);
  assert.ok(html.includes('href="../../origin/"'));
  assert.equal(editorialLabel({}),"WÖk-Analyse");
  const standard={...record,analysis_variant:"standard"};
  assert.ok(!editorialAnalysisPage(standard,story).includes('class="news-editorial-article news-editorial-article--systemic"'));
  assert.ok(!editorialAnalysisPage(standard,story).includes('id="reality-check"'));
});

test("all contents and visual anchors resolve and no duplicate IDs appear", () => {
  const html=editorialAnalysisPage(prepared(),story);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]),match[1]);
});

test("visual content is escaped and cannot inject markup", () => {
  const html=renderSystemicVisual({type:"cards",caption:"<script>alert(1)</script>",items:[{status:"scenario",title:"<img onerror=x>",text:"<script>x</script>"}]},new Map());
  assert.ok(!html.includes("<script>")); assert.ok(html.includes("&lt;script&gt;"));
});

test("subject dimensions are independent of the event and no observed outcome is invented", () => {
  const record=prepared();
  assert.equal(record.subject_dimensions.planet.relevance,"hoch");
  assert.ok(!record.claim_ledger.some(claim=>claim.type==="observed_impact"));
  assert.ok(record.claim_ledger.some(claim=>claim.type==="program_statement"));
  assert.ok(record.claim_ledger.some(claim=>claim.type==="scenario"));
  assert.match(record.direction_finding,/nicht.*kompensierbar/);
});

test("concrete consequences precede target labels in shared governance", () => {
  assert.match(SYSTEMIC_ANALYSIS_RULE,/Konkrete Folgen vor Zielnummern/);
  assert.match(SYSTEMIC_ANALYSIS_RULE,/Sicherheit von Kindern und Frauen/);
  assert.match(SYSTEMIC_ANALYSIS_RULE,/kein festgestellter Rechtsverstoß/);
});
