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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export function prepareReviewedStory(review, registry, stories, now) {
  if (!review.review_basis || !review.research_checked_at || !review.event_key) throw new Error("EDITORIAL_REVIEW_PROVENANCE_REQUIRED");
  const id = `wt-${sha256(review.event_key).slice(0, 16)}`;
  const existing = stories.find(story => story.story_id === id);
  const sources = review.sources.map(input => {
    const registered = registry.sources.find(source => source.source_id === input.source_id);
    if (!registered || registered.role === "F") throw new Error("EDITORIAL_SOURCE_NOT_ALLOWED");
    return { ...input, publisher: registered.name, publisher_id: registered.publisher_id, primary_source: registered.primary_source, source_type: registered.source_type, publisher_kind: registered.publisher_kind, requires_corroboration: Boolean(registered.requires_corroboration), source_topic: registered.topic, content_hash: sha256(JSON.stringify(input)) };
  });
  const candidate = { story_id: id, title: review.title, slug: existing?.slug || `${slugify(review.title)}-${id.slice(-6)}`, first_seen: existing?.first_seen || review.research_checked_at, sources, existing_story: existing, source_summary: review.analysis.source_summary, event_id: eventFingerprint(sources[0]).id, event_detected_at: review.research_checked_at, event_first_seen_at: review.research_checked_at, content_hash: sha256(JSON.stringify(review)) };
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
      store.stories = [...store.stories.filter(story => story.story_id !== result.record.story_id), result.record];
      store.updated_at = now;
      fs.writeFileSync(`${file}.tmp`, `${JSON.stringify(store, null, 2)}\n`);
      fs.renameSync(`${file}.tmp`, file);
    }
    console.log(JSON.stringify({ story_id: result.record.story_id, slug: result.record.slug, unchanged: Boolean(result.unchanged), written: process.argv.includes("--write") && !result.unchanged, integrity: result.record.source_integrity.status }));
  }
}
