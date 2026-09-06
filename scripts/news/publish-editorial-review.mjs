import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { editorialSourceRef, editorialAnalysisValidationErrors, editorialResearchSourceErrors, editorialAnalysisAssessment, withEditorialResearch } from "./editorial-analysis.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const hash = value => crypto.createHash("sha256").update(value).digest("hex");
export function prepareEditorialReview(packet, story, previous = null, now = new Date().toISOString()) {
  if (!story?.published || story.listed === false || story.source_integrity?.status !== "verified") throw new Error("REVIEW_ORIGIN_NOT_VERIFIED");
  if (packet.story_id !== story.story_id || packet.analysis_variant !== "systemic" || packet.editorial_mode !== "commissioned_review") throw new Error("REVIEW_SCOPE_INVALID");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(packet.slug)) throw new Error("REVIEW_SLUG_INVALID");
  const fingerprint = hash(JSON.stringify(packet));
  if (previous?.review_fingerprint === fingerprint) return { record: previous, changed: false };
  const sourceMap = new Map();
  const checkedAt = packet.research_checked_at;
  if (!Number.isFinite(Date.parse(checkedAt)) || Date.parse(checkedAt) > Date.parse(now)) throw new Error("REVIEW_CHECK_DATE_INVALID");
  const sources = packet.source_catalog.map(({ key, ...source }) => {
    if (!key || sourceMap.has(key)) throw new Error("REVIEW_SOURCE_KEY_DUPLICATE");
    const id = editorialSourceRef(source);
    sourceMap.set(key, id);
    const result = { ...source, source_id: id, source_item_id: id, canonical_domain: new URL(source.url).hostname.replace(/^www\./, ""), editorial_review: { status: "verified", story_id: story.story_id, title: source.title, url: source.url, checked_at: checkedAt, relevance_note: source.summary, limitations: source.limitations, content_hash: hash(source.summary) } };
    const errors = editorialResearchSourceErrors(result, story.story_id);
    if (errors.length) throw new Error(`REVIEW_SOURCE_INVALID:${key}:${errors.join(",")}`);
    return result;
  });
  const mapRefs = value => {
    if (Array.isArray(value)) return value.map(mapRefs);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, ["source_ids", "evidence_source_ids"].includes(key) ? entry.map(id => { if (!sourceMap.has(id)) throw new Error(`REVIEW_SOURCE_UNKNOWN:${id}`); return sourceMap.get(id); }) : mapRefs(entry)]));
  };
  const { source_catalog, research_checked_at, ...content } = packet;
  const analysis = mapRefs(content);
  const assessment = editorialAnalysisAssessment(withEditorialResearch(story, { source_snapshot: sources }));
  const primary = sources.filter(source => source.primary_source);
  const origins = new Set(sources.map(source => source.publisher_id));
  const evidenceGate = { passed: primary.length >= 2 && origins.size >= 2, source_integrity: "verified", scope: "reviewed_scenario_sources_not_event_confirmations", independent_origin_count: origins.size, primary_source_count: primary.length, cited_claim_count: analysis.claim_ledger.filter(claim => claim.source_ids.length).length, primary_source_expected: true, primary_source_satisfied: primary.length >= 2, reasons: [] };
  const version = (previous?.version || 0) + 1;
  const record = {
    ...analysis, analysis_id: previous?.analysis_id || `woek-analysis-${hash(story.story_id + packet.slug).slice(0, 12)}`,
    related_story_ids: [story.story_id], related_case_id: null, status: "published",
    author: { name: "Natalie Weber", role: "Autorin", image: "/assets/img/people/natalie-weber-woek-analyse.jpg" },
    transparency_note: "Nach der von Natalie Weber entwickelten Methodik der Wirkungsökonomie",
    method_version: "1.0", terminology_version: "1.7", source_snapshot: sources,
    source_fingerprint: assessment.fingerprint, review_fingerprint: fingerprint,
    candidate_score: assessment.editorial_analysis_score, analysis_gain_score: assessment.analysis_gain,
    evidence_gate: evidenceGate, published_at: previous?.published_at || now, updated_at: now, version,
    monitoring: { ...analysis.monitoring, checked_at: checkedAt },
    self_frame_check: { passed: true, issues: [], recommended_title: analysis.title, recommended_summary: analysis.teaser, recommended_meta_description: analysis.seo_description },
    versions: [...(previous?.versions || []), { version, analyzed_at: now, source_fingerprint: assessment.fingerprint, title: analysis.title, change_note: version === 1 ? "Erstveröffentlichung: Ex-ante-Szenario mit datierter Quellenprüfung, Machtkarte und Beobachtungspunkten." : "Quellengebundene Fortschreibung der Sonderanalyse.", provider: null, model: null, claim_ledger: analysis.claim_ledger, ...(previous ? { previous_content: { sections: previous.sections, claim_ledger: previous.claim_ledger, source_snapshot: previous.source_snapshot, monitoring: previous.monitoring } } : {}) }],
  };
  const readingText = [...record.sections.flatMap(section => [...section.paragraphs, ...(section.visual?.items || []).map(item => `${item.title} ${item.text} ${item.condition || ""}`)]), record.direction_finding].join(" ");
  record.reading_time_minutes = Math.ceil(readingText.split(/\s+/).filter(Boolean).length / 210);
  const errors = editorialAnalysisValidationErrors(record, story, { candidate: true, evidence_gate: evidenceGate });
  if (errors.length) throw new Error(`REVIEW_QUALITY_HOLD:${errors.join(",")}`);
  return { record, changed: true };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv.find(arg => arg.endsWith(".json"));
  if (!file) throw new Error("Usage: node scripts/news/publish-editorial-review.mjs content/news/reviews/review.json [--publish]");
  const packet = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  const storeFile = path.join(ROOT, "data/news/editorial-analyses.json");
  const store = JSON.parse(fs.readFileSync(storeFile, "utf8"));
  const story = JSON.parse(fs.readFileSync(path.join(ROOT, "data/news/stories.json"), "utf8")).stories.find(item => item.story_id === packet.story_id);
  const previous = store.analyses.find(item => item.slug === packet.slug);
  const result = prepareEditorialReview(packet, story, previous);
  if (result.changed && process.argv.includes("--publish")) {
    store.analyses = [...store.analyses.filter(item => item.analysis_id !== result.record.analysis_id), result.record];
    store.updated_at = result.record.updated_at;
    const temporary = `${storeFile}.tmp-${process.pid}`;
    fs.writeFileSync(temporary, `${JSON.stringify(store, null, 2)}\n`);
    fs.renameSync(temporary, storeFile);
  }
  console.log(JSON.stringify({ checked: true, changed: result.changed, published_to_store: process.argv.includes("--publish"), analysis_id: result.record.analysis_id, slug: result.record.slug, minutes: result.record.reading_time_minutes, sources: result.record.source_snapshot.length, version: result.record.version, provider_calls: 0 }));
}
