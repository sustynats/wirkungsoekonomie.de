// Explicit editorial intake. Reuses the production model and gates, not a bypass.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { claimLedgerFor, preAnalyzeStory, sha256, slugify, validateAnalysis } from "./lib.mjs";
import { loadNewsRegistry } from "./registry.mjs";
import { evidenceGroups, eventFingerprint } from "./newsroom.mjs";
import { sourceIntegrityForStory } from "./source-integrity.mjs";
import { publishedRecord, sanitizeAnalysisMediaImpact } from "./run.mjs";
import { sanitizeVisuals } from "./visuals.mjs";
import { mediaTriggerRecord } from "./media-impact.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// A reviewed media-only addendum must not rebuild claims, scores or event IDs.
// The source fingerprint prevents applying a review to changed material.
export function prepareReviewedMediaImpact(review, registry, stories, now) {
  if (!review.review_basis || !review.research_checked_at || !review.correction_note) throw new Error("EDITORIAL_REVIEW_PROVENANCE_REQUIRED");
  const existing = stories.find(story => story.story_id === review.story_id);
  if (!existing?.published || !existing.analysis) throw new Error("EDITORIAL_MEDIA_STORY_REQUIRED");
  const reviewId = sha256(JSON.stringify(review));
  if (existing.versions?.some(version => version.review_id === reviewId)) return { errors: [], record: existing, unchanged: true };
  if (review.expected_content_hash !== existing.content_hash) throw new Error("EDITORIAL_MEDIA_SOURCE_CHANGED");
  const record = structuredClone(existing);
  const report = {};
  record.analysis.media_impact = structuredClone(review.media_impact);
  sanitizeAnalysisMediaImpact(record.analysis, record, report, now);
  record.analysis.media_trigger = mediaTriggerRecord(record.analysis.media_trigger, record);
  const integrity = sourceIntegrityForStory(record, registry, stories, now);
  const errors = [...integrity.issues.map(issue => issue.code), ...validateAnalysis({ source_summary: record.source_summary, ...record.analysis }, record, { validateSourceSummaryNumbers: false, persisted: true })];
  if (errors.length) return { errors, candidate: { ...record, source_integrity: integrity } };
  record.source_integrity = integrity;
  record.current_version = Number(existing.current_version || 0) + 1;
  record.updated_at = record.last_updated = now;
  record.versions = [...(existing.versions || []), {
    version: record.current_version, analyzed_at: now, content_hash: record.content_hash,
    title: record.title, previous_title: existing.title, source_summary: record.source_summary,
    analysis: structuredClone(record.analysis), claims: structuredClone(record.claims),
    source_versions: record.sources.map(source => ({ source_id: source.source_id, url: source.url, content_hash: source.content_hash })),
    provider: "editorial_review", model: "source_bound_review", mode: "media_impact_editorial_review",
    review_id: reviewId, review_basis: review.review_basis, research_checked_at: review.research_checked_at,
    method_sources: review.method_sources || [], self_frame_rewrites: report.self_frame_rewrites || 0,
  }];
  record.corrections = [...(existing.corrections || []), { at: now, note: review.correction_note }];
  record.publication_history = [...(existing.publication_history || []), { version: record.current_version, published_at: now, source_count: record.sources.length, change: "media_impact_added" }];
  return { errors: [], record, unchanged: false };
}

export function prepareReviewedStory(review, registry, stories, now) {
  if (review.review_type === "media_impact") return prepareReviewedMediaImpact(review, registry, stories, now);
  if (!review.review_basis || !review.research_checked_at || !review.event_key) throw new Error("EDITORIAL_REVIEW_PROVENANCE_REQUIRED");
  const id = `wt-${sha256(review.event_key).slice(0, 16)}`;
  const existing = stories.find(story => story.story_id === id);
  const sources = review.sources.map(input => {
    const registered = registry.sources.find(source => source.source_id === input.source_id);
    if (!registered || registered.role === "F") throw new Error("EDITORIAL_SOURCE_NOT_ALLOWED");
    return { ...input, publisher: registered.name, publisher_id: registered.publisher_id, primary_source: registered.primary_source, source_type: registered.source_type, publisher_kind: registered.publisher_kind, requires_corroboration: Boolean(registered.requires_corroboration), source_topic: registered.topic, content_hash: sha256(JSON.stringify(input)) };
  });
  const candidate = { story_id: id, title: review.title, slug: existing?.slug || `${slugify(review.title)}-${id.slice(-6)}`, first_seen: existing?.first_seen || review.research_checked_at, sources, existing_story: existing, source_summary: review.analysis.source_summary, event_id: existing?.event_id || eventFingerprint(sources[0]).id, event_detected_at: review.research_checked_at, event_first_seen_at: existing?.event_first_seen_at || review.research_checked_at, content_hash: sha256(JSON.stringify(review)) };
  candidate.claims = claimLedgerFor(sources, id, now);
  candidate.preanalysis = preAnalyzeStory(candidate, now);
  candidate.topic = review.topics || candidate.preanalysis.topics;
  candidate.evidence_groups = evidenceGroups(sources);
  candidate.source_integrity = sourceIntegrityForStory(candidate, registry, stories, now);
  const analysis = { ...structuredClone(review.analysis), story_id: id };
  sanitizeAnalysisMediaImpact(analysis, candidate, {}, now);
  if (analysis.visuals) analysis.visuals = sanitizeVisuals(analysis.visuals, candidate).visuals;
  const errors = [...candidate.source_integrity.issues.map(issue => issue.code), ...validateAnalysis(analysis, candidate)];
  if (errors.length) return { errors, candidate };
  const record = publishedRecord(candidate, analysis, { provider: "editorial_review", model: "source_bound_review", mode: "editorial_review", method_sources: review.method_sources }, now);
  record.editorial_review = { research_checked_at: review.research_checked_at, basis: review.review_basis, original_event_date: review.original_event_date, exclusions: review.exclusions || [] };
  if (review.correction_note && existing && existing.content_hash !== candidate.content_hash) {
    if (typeof review.correction_note !== "string" || review.correction_note.length > 1500) throw new Error("EDITORIAL_CORRECTION_NOTE_INVALID");
    record.corrections = [...(existing.corrections || []), { at: now, note: review.correction_note }];
  }
  return { errors: [], record, unchanged: existing?.content_hash === candidate.content_hash };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const input = process.argv.find(arg => arg.startsWith("--review="))?.slice(9);
  if (!input) throw new Error("Use --review=<review.json> [--write]; default is validation only.");
  const review = JSON.parse(fs.readFileSync(path.resolve(input), "utf8"));
  const file = path.join(ROOT, "data/news/stories.json");
  const store = JSON.parse(fs.readFileSync(file, "utf8"));
  const now = new Date().toISOString();
  const result = prepareReviewedStory(review, loadNewsRegistry(ROOT), store.stories, now);
  if (result.errors.length) { console.error(JSON.stringify({ errors: result.errors, integrity: result.candidate.source_integrity.issues })); process.exitCode = 1; }
  else {
    if (process.argv.includes("--write") && !result.unchanged) {
      const index = store.stories.findIndex(story => story.story_id === result.record.story_id);
      if (index < 0) store.stories.push(result.record);
      else store.stories[index] = result.record;
      store.updated_at = now;
      fs.writeFileSync(`${file}.tmp`, `${JSON.stringify(store, null, 2)}\n`);
      fs.renameSync(`${file}.tmp`, file);
    }
    console.log(JSON.stringify({ story_id: result.record.story_id, slug: result.record.slug, unchanged: Boolean(result.unchanged), written: process.argv.includes("--write") && !result.unchanged, integrity: result.record.source_integrity.status }));
  }
}
