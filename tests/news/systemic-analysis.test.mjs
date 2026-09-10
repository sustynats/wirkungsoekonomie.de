import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { prepareEditorialReview } from "../../scripts/news/publish-editorial-review.mjs";
import { editorialLabel, systemicValidationErrors, commissionedReviewState, renderSystemicVisual } from "../../scripts/news/systemic-analysis.mjs";
import { editorialResearchSourceErrors } from "../../scripts/news/editorial-analysis.mjs";
import { editorialAnalysisPage, storyPage } from "../../scripts/news/build.mjs";
import { SYSTEMIC_ANALYSIS_RULE } from "../../scripts/news/analysis-principles.mjs";
import { editorialJudgmentErrors, renderAuthorPerspective, sanitizeEditorialJudgment, editorialContentSnapshot } from "../../scripts/news/editorial-judgment.mjs";

const packet = JSON.parse(fs.readFileSync(new URL("../../content/news/reviews/2026-09-07-sachsen-anhalt-sonderanalyse.json", import.meta.url)));
const story = { story_id: packet.story_id, slug: "origin", title: "Wahlnachricht", published: true, listed: true, last_updated: "2026-09-06T20:53:00Z", source_integrity: {status:"verified"}, sources: [], claims: [], analysis: {} };
const reviewTime = new Date(Date.parse(packet.research_checked_at) + 1000).toISOString();
const prepared = () => prepareEditorialReview(structuredClone(packet), structuredClone(story), null, reviewTime).record;

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
  assert.equal(prepareEditorialReview(packet, story, old, reviewTime).changed, false);
  const updated = structuredClone(packet); updated.teaser += " Ein neuer Stand.";
  const next = prepareEditorialReview(updated, story, old, reviewTime).record;
  assert.equal(next.version, 2);
  assert.equal(next.published_at, old.published_at);
  assert.deepEqual(next.versions[1].previous_content.sections, old.sections);
});

test("unknown sources, missing origin integrity and future review dates fail closed", () => {
  const bad = structuredClone(packet); bad.sections[0].source_ids = ["invented"];
  assert.throws(() => prepareEditorialReview(bad, story, null, reviewTime), /SOURCE_UNKNOWN/);
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
  for(const marker of ["Meinung &amp; Analyse","Systemische Sonderanalyse","Natalie Weber","Das Wichtigste in 90 Sekunden","reality-check","versionsverlauf","news-systemic-visual--cascade",'"@type":"Article"',"2032","Art. 20a","Gleichberechtigung","18 Min."]) assert.ok(html.includes(marker),marker);
  assert.ok(html.includes('href="../../origin/"'));
  assert.equal(editorialLabel({}),"Meinung & Analyse");
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

test("revised longread separates evidence, direction, eight macro chapters and personal voice", () => {
  const record = prepared();
  const html = editorialAnalysisPage(record, story);
  assert.equal(record.navigation_groups.length, 8);
  assert.deepEqual(editorialJudgmentErrors(record), []);
  assert.ok(html.indexOf('id="lage"') < html.indexOf('id="woek-befund"'));
  assert.ok(html.indexOf('news-systemic-visual--network') < html.indexOf('aria-label="Inhaltsverzeichnis der Analyse"'));
  assert.doesNotMatch(html, /Visuelle Einordnung der Ursprungsgeschichte/);
  for (const type of ["network", "power", "cascade", "timeline", "federal"]) assert.match(html, new RegExp(`news-systemic-visual--${type}`));
  assert.match(html, /Tragweite: (?:hoch|Tragweite offen)/);
  assert.match(html, /data-magnitude="(?:4|unknown)"/);
  assert.match(html, /Persönliche Einordnung der Autorin/);
  assert.equal(renderAuthorPerspective({}), "", "Keine historische Haltung erfinden");
  const scope = record.sections.find(section => section.id === "felder");
  const scopeHtml = renderSystemicVisual(scope.visual, new Map());
  assert.doesNotMatch(scopeHtml, /Richtung: Negativ/);
  const paths = record.sections.find(section => section.id === "referenzen");
  assert.ok(paths.visual.items.every(item => item.relation === "impact_path" && item.direction === "negative" && item.condition));
  assert.match(renderSystemicVisual(paths.visual, new Map()), /Bedingung \/ Grenze:/);
});

test("future automatic revisions preserve the previous personal voice and assessments", () => {
  const record = prepared();
  const previous = editorialContentSnapshot(record);
  record.author_perspective.paragraphs[0] = "Spätere persönliche Gewichtung";
  record.subject_dimensions.human.direction = "open";
  assert.notEqual(previous.author_perspective.paragraphs[0], record.author_perspective.paragraphs[0]);
  assert.equal(previous.subject_dimensions.human.direction, "negative");
  assert.equal(editorialContentSnapshot({ sections: [] }).author_perspective, undefined);
});

test("author portraits keep a square, non-shrinking box in narrow overview cards", () => {
  const css = fs.readFileSync(new URL("../../assets/css/news.css", import.meta.url), "utf8");
  const avatar = css.match(/\.news-editorial-card__byline img\s*\{([^}]+)\}/)[1];
  for (const rule of ["width: 4.5rem", "height: 4.5rem", "min-width: 4.5rem", "flex: 0 0 4.5rem", "aspect-ratio: 1", "border-radius: 50%", "object-fit: cover"]) assert.ok(avatar.includes(rule), rule);
  assert.match(css, /\.news-editorial-card__byline span\s*\{[^}]*min-width: 0/);
});

test("direction, evidence and author gates cannot be replaced by a relevance label", () => {
  const record = prepared();
  record.subject_dimensions.human.direction = "neutral";
  record.subject_dimensions.human.evidence = "open";
  assert.ok(editorialJudgmentErrors(record).includes("EDITORIAL_OPEN_IS_NOT_NEUTRAL"));
  record.subject_dimensions.human.direction = "positive";
  assert.ok(editorialJudgmentErrors(record).includes("EDITORIAL_POSITIVE_PATH_UNGROUNDED"));
  record.subject_dimensions.human.likelihood = "observed";
  assert.ok(editorialJudgmentErrors(record).includes("EDITORIAL_OBSERVED_JUDGMENT_UNSUPPORTED"));
  record.author_perspective.claim_indices = [999];
  assert.ok(editorialJudgmentErrors(record).includes("EDITORIAL_AUTHOR_PERSPECTIVE_UNGROUNDED"));
  record.editorial_quality.false_balance_checked = false;
  assert.ok(editorialJudgmentErrors(record).includes("EDITORIAL_JOURNALISTIC_REVIEW_REQUIRED"));
  const sanitized = sanitizeEditorialJudgment({ ...record, author_perspective: { ...record.author_perspective, origin: "manually_approved", paragraphs: ["<script>alert(1)</script>"] } }, new Set());
  assert.equal(sanitized.author_perspective.origin, "generated_from_analysis");
  assert.doesNotMatch(renderAuthorPerspective(sanitized), /<script>/);
});

test("actual visual paths require direction and conditions; a scope map is no substitute", () => {
  const record = prepared();
  const path = record.sections.find(section => section.id === "kaskade").visual.items.find(item => item.relation === "impact_path");
  delete path.direction;
  assert.ok(systemicValidationErrors(record).includes("EDITORIAL_VISUAL_DIRECTION_REQUIRED"));
  for (const section of record.sections) for (const item of section.visual?.items || []) item.relation = "scope";
  assert.ok(editorialJudgmentErrors(record).includes("EDITORIAL_IMPACT_VISUAL_REQUIRED"));
});

test("official classification is attributed, current report is linked and false counterweights are absent", () => {
  const record = prepared();
  const lead = record.sections.find(section => section.id === "lage").paragraphs.join(" ");
  assert.match(lead, /[Vv]erfassungsschutz/);
  assert.match(lead, /gesichert rechtsextremistisch/);
  assert.ok(record.source_snapshot.some(source => source.url.includes("/api/media/VSB_2025_gesamtfassung_Presse-e3b0c442-1.pdf")));
  const prose = record.sections.flatMap(section => section.paragraphs).join(" ");
  assert.match(prose, /Schutzplanken sind kein Beleg dafür/);
  for (const phrase of ["mehr Effizienz und Transparenz als", "Umgekehrt kann eine", "Freiwillige Helfer können"]) assert.ok(!prose.includes(phrase));
});
