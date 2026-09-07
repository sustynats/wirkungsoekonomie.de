import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  budgetStage,
  buildAnalysisPrompt,
  callWoekAi,
  claimLedgerFor,
  clusterItems,
  anchoredSources,
  existingStoryMatch,
  estimateUsage,
  fetchArticleExcerpt,
  fetchFeed,
  monthlyUsage,
  parseFeed,
  preAnalyzeStory,
  scheduledSlot,
  sha256,
  slugify,
  storySimilarity,
  validateAnalysis,
} from "./lib.mjs";
import { buildNewsSite } from "./build.mjs";
import { sanitizeVisuals } from "./visuals.mjs";
import { loadNewsRegistry, normalizeNewsRegistry, registryErrors } from "./registry.mjs";
import { sourceAccess } from "./access-policy.mjs";
import { annotateSourceItem, sourceDue, eventFingerprint, eventCompatibility, evidenceGroups, freshnessFor, sourceHealth, coverageReport, dueFollowups, discoveryCandidates, persistClaimEvidence, nextDeepeningCheckpoint, normalizeEvidenceExcerpts, resolveEvidenceReferences } from "./newsroom.mjs";
import { duplicateGroups, mergeLivingFiles, isMerged, subjectConflict, livingFileMatch } from "./living-files.mjs";
import { refreshBudgetFx, newsBudget, modelRates, costFromUsage, NEWS_REQUEST_RESERVATION_USD } from "./budget.mjs";
import { datedSource } from "./source-adapters.mjs";
import { createTitleImagePipeline, publicTitleImage } from "./title-image/pipeline.mjs";
import { IMAGE_CONFIG } from "./title-image/policy.mjs";
import { articleSourceOrder, canReuseReview, reviewCheckpoint, sourceReviewFingerprint } from "./evidence-packets.mjs";
import { numberTokens, numericEvidenceReceipt } from "./numeric-evidence.mjs";
import { MEDIA_ANALYSIS_VERSION, applySelfFrameRewrites, detectMediaImpactTrigger, effectiveMediaImpactTrigger, estimateMediaUsage, mediaTriggerRecord, sanitizeMediaImpact } from "./media-impact.mjs";
import { reconcileKnownSourceAliases, reconcileSourceIdentity, sourceIntegrityForStory, sourceIntegrityRecord } from "./source-integrity.mjs";
import { bumpCandidateFunnel, bumpSourceFunnel, createSourceFunnel, finalizeSourceFunnel } from "./source-funnel.mjs";
import { isolatedSourceThrottleWithRecentCoverage, sourceCoverageDegraded } from "./check-run-health.mjs";
import { operatingCostSummary } from "./operating-cost.mjs";
import { regionalCoverage } from "./regional-coverage.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const RELEVANCE_FILTER_VERSION = "4.0";
const RELEVANCE_BACKFILL_DAYS = 7;
const AI_PROCESSING_VERSION = "2026-09-06-throughput-3";
const OUTPUT_FORMAT_ERRORS = new Set(["AI_MALFORMED_JSON", "AI_SCHEMA_ANALYSES_REQUIRED", "AI_RESPONSE_TOO_LARGE"]);
const CAPACITY_HOLD_REASONS = new Set(["AI_BUDGET_OR_BATCH_LIMIT", "AI_HOURLY_CALL_LIMIT", "AI_BUDGET_BLOCKED", "AI_RUN_TIME_LIMIT", "AI_DISABLED"]);
const TECHNICAL_HOLD_REASONS = new Set(["AI_PROVIDER_UNAVAILABLE", "AI_OUTPUT_INVALID", "AI_INPUT_TOO_LARGE"]);
const RETRYABLE_QUALITY_ERRORS = [
  /^AI_ANALYSIS_MISSING$/,
  /^AI_REQUIRED_STRING:/,
  /^AI_STATUS_INVALID$/,
  /^AI_STATUS_(?:CONTRADICTS_IN_FORCE|DRAFT_NOT_FINAL|FUTURE_NOT_IN_FORCE)$/,
  /^AI_ANALYSIS_TYPE_INVALID$/,
  /^AI_IMPORTANCE_INVALID$/,
  /^AI_DIMENSION_INVALID:/,
  /^AI_ARRAY_REQUIRED:/,
  /^AI_UNCERTAINTY_REQUIRED$/,
  /^AI_WATCH_NEXT_REQUIRED$/,
  /^AI_SUMMARY_SENTENCE_COUNT$/,
  /^AI_SOURCE_SUMMARY_(?:LENGTH|PARAGRAPHS|NOT_NEUTRAL)$/,
  /^AI_SOURCE_SUMMARY_UNSUPPORTED_NUMBER:/,
  /^AI_EXCESSIVE_SOURCE_SUMMARY_COPY$/,
  /^AI_EX_ANTE_CAUSAL_OVERCLAIM$/,
  /^CLAIM_INDEPENDENCE_NOT_ESTABLISHED$/,
  /^(?:NEWS_STATUS_REQUIRED|EVENT_CLAIMS_REQUIRED|EVENT_CLAIM_INVALID|FOLLOWUPS_ARRAY_REQUIRED|FOLLOWUP_INVALID|FOLLOWUP_DATE_INVALID)$/,
  /^(?:CLAIM_EVIDENCE_REQUIRED|CLAIM_EVIDENCE_NOT_IN_SOURCE|CLAIM_NUMBER_NOT_IN_EVIDENCE)$/,
  /^(?:CLAIM_PRIMARY_SOURCE_MISSING|CONFIRMED_STATUS_OVERCLAIM|FOLLOWUP_DATE_UNSUPPORTED)$/,
  /^AI_DETAIL_SUMMARY_(?:INVALID|LENGTH)$/,
  /^AI_UNSUPPORTED_NUMBER:/,
  /^AI_UNSUPPORTED_FRAMEWORK_NUMBER:/,
  /^AI_PUBLICATION_GATE_REQUIRED$/,
  /^AI_PUBLIC_EDITORIAL_RESIDUE$/,
  /^AI_PUBLICATION_RECOMMENDATION_INVALID$/,
  /^AI_PUBLICATION_DECISION_UNRECORDED$/,
  /^AI_PUBLICATION_GATE_(?:NEWS_VALUE|FACTORS|EXCEPTION|EVIDENCE|DUPLICATE)_INVALID$/,
  /^AI_PUBLICATION_GATE_RATIONALE_REQUIRED$/,
  /^MEDIA_(?:IMPACT|SPEAKER|FRAMING|FRAME|HISTORY|EVIDENCE|COMPARISON|SELF_FRAME|INTENT|OUTLET|EFFECT|EPISTEMIC|ATTRIBUTION|POLITICAL|DISCOURSE|OBSERVED|PUBLIC|FACT_FIRST)/,
];
const EDITORIAL_REJECTION_ERRORS = new Set([
  "AI_PUBLICATION_NOT_RECOMMENDED",
  "AI_MATERIALITY_TOO_LOW",
  "AI_NEWS_VALUE_CONTEXT_ONLY",
  "AI_MATERIALITY_GATE_FAILED",
  "AI_EVIDENCE_INSUFFICIENT",
  "AI_DUPLICATE_WITHOUT_UPDATE",
]);
const RETRY_COMPANION_ERRORS = new Set([
  ...EDITORIAL_REJECTION_ERRORS,
]);
const files = {
  registry: path.join(ROOT, "content/news/source-registry.json"),
  state: path.join(ROOT, "data/news/state.json"),
  stories: path.join(ROOT, "data/news/stories.json"),
  usage: path.join(ROOT, "data/news/usage.json"),
  report: path.join(ROOT, "reports/wirkungsticker-latest-run.json"),
  newsroom: path.join(ROOT, "data/news/newsroom.json"),
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function mapLimit(values, limit, mapper) {
  const results = Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = { status: "fulfilled", value: await mapper(values[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

function sourcePublicRecord(item) {
  return {
    source_id: item.source_id,
    publisher: item.publisher,
    url: item.url,
    title: item.title,
    summary: item.summary,
    source_type: item.source_type,
    published_at: item.published_at,
    date_status: item.date_status,
    retrieved_at: item.retrieved_at,
    primary_source: item.primary_source,
    source_priority: item.source_priority,
    source_topic: item.source_topic,
    content_hash: item.content_hash,
    source_item_id: item.source_item_id,
    publisher_id: item.publisher_id,
    publisher_kind: item.publisher_kind,
    source_role: item.source_role,
    language: item.language,
    geography: item.geography,
    research_lane: item.research_lane,
    requires_corroboration: item.requires_corroboration,
    source_published_at: item.source_published_at || item.published_at,
    ingested_at: item.ingested_at,
    agency_origin: item.agency_origin,
    agency_origin_confidence: item.agency_origin_confidence,
    provenance: item.provenance,
    research_metadata: item.research_metadata,
    collection_source_id: item.collection_source_id,
    collection_publisher_id: item.collection_publisher_id,
  };
}

function mergeSources(existing = [], incoming = []) {
  const byUrl = new Map(existing.map((source) => [source.url, source]));
  for (const source of incoming) byUrl.set(source.url, { ...byUrl.get(source.url), ...sourcePublicRecord(source) });
  return [...byUrl.values()].sort((a, b) => Number(b.primary_source) - Number(a.primary_source) || Number(b.source_priority) - Number(a.source_priority));
}

function storyContentHash(story) {
  return sha256(story.sources.map((source) => `${source.url}:${source.content_hash}`).sort().join("\n"));
}

function storyComparisonText(story) {
  return [
    story.title,
    story.analysis?.summary,
    ...(story.sources || []).flatMap((source) => [source.title, source.summary]),
  ].filter(Boolean).join(" ");
}

function attachRelatedTickerHistory(candidates, stories) {
  const publishedHistory = (stories || [])
    .filter((story) => story.published && story.retirement?.reason_code !== "MERGED_INTO_LIVING_FILE");
  return candidates.map((candidate) => {
    const candidateText = storyComparisonText(candidate);
    const relatedTickerHistory = publishedHistory
      .filter((story) => story.story_id !== candidate.story_id)
      .map((story) => ({ story, similarity: storySimilarity(candidateText, storyComparisonText(story)) }))
      .filter(({ similarity }) => similarity >= 0.1)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(({ story }) => ({
        story_id: story.story_id,
        title: story.title,
        summary: story.analysis?.summary || "",
        source_published_at: (story.sources || [])
          .map((source) => source.published_at)
          .filter(Boolean)
          .sort()[0] || story.first_seen,
        source_urls: (story.sources || []).map((source) => source.url).slice(0, 3),
      }));
    return { ...candidate, related_ticker_history: relatedTickerHistory };
  });
}

function createCandidate(cluster, now, reassessment = false, fresh = false) {
  const existing = cluster.existing_story;
  const sources = mergeSources(existing?.pending_update?.sources || existing?.review_checkpoint?.sources || existing?.sources, cluster.sources);
  const candidate = {
    story_id: cluster.story_id,
    slug: existing?.slug || `${slugify(cluster.title)}-${cluster.story_id.slice(-6)}`,
    title: cluster.title,
    first_seen: existing?.first_seen || cluster.first_seen || now,
    last_updated: cluster.last_updated || now,
    sources,
    existing_story: existing || null,
    reassessment,
    fresh,
    event_first_seen_at: existing?.event_first_seen_at || now,
    event_detected_at: existing?.event_detected_at || now,
    event_id: existing?.event_id || eventFingerprint(sources[0] || {}).id,
    evidence_groups: evidenceGroups(sources),
  };
  candidate.claims = claimLedgerFor(sources, candidate.story_id, now);
  candidate.preanalysis = preAnalyzeStory(candidate, now);
  candidate.topic = candidate.preanalysis.topics;
  candidate.content_hash = storyContentHash(candidate);
  candidate.media_trigger = detectMediaImpactTrigger(candidate);
  return candidate;
}

export function repartitionOversizedSourceQueues(stories, now) {
  const changes = [], requeued = new Map();
  for (const story of stories) {
    if (isMerged(story) || story.listed === false) continue;
    const pending = story.pending_update || story;
    const sources = pending.sources || [];
    const reason = pending.reason || pending.pending_reason;
    const queuedDraft = !story.published && (new Set([
      'AI_BUDGET_OR_BATCH_LIMIT', 'AI_HOURLY_CALL_LIMIT', 'AI_PROVIDER_UNAVAILABLE',
      'AI_DISABLED', 'AI_BUDGET_BLOCKED', 'AI_RUN_TIME_LIMIT', 'SOURCE_INTEGRITY_OPEN',
    ]).has(reason) || shouldRetryQualityGate(reason, pending.quality_errors || [], 0));
    // Old unpublished queues must obey the same direct-event rule as new
    // arrivals, even below the input-size limit. Final editorial rejections and
    // normal published files are not silently reopened or rewritten.
    if (!queuedDraft && reason !== 'AI_INPUT_TOO_LARGE' && !(reason === 'SOURCE_INTEGRITY_OPEN' && sources.length > 12)) continue;
    const originalLead = story.sources?.[0];
    if (!originalLead || sources.length < 2) continue;
    const leading = sources.find(source => source.url === originalLead.url);
    if (!leading) continue; // Never guess the original subject.
    const rooted = { ...story, sources: [leading, ...sources.filter(source => source !== leading)] };
    const kept = anchoredSources(rooted), keptSet = new Set(kept);
    const detached = sources.filter(source => !keptSet.has(source));
    if (!detached.length) continue; // A genuinely large single event remains on hold.
    // This changes only queued source ownership, never published text/claims.
    // All detached metadata is retained and re-enters the normal local gates.
    const record = { version: 1, at: now, retained_urls: kept.map(source => source.url),
      detached_sources: detached.map(({article_excerpt, evidence_segments, ...source}) => source) };
    story.queue_source_repartitions = [...(story.queue_source_repartitions || []), record];
    delete story.review_checkpoint; // Its cached source set has been repartitioned.
    for (const source of detached) {
      const prior = requeued.get(source.url);
      if (!prior || Date.parse(source.published_at || 0) >= Date.parse(prior.published_at || 0)) requeued.set(source.url, source);
    }
    pending.sources = kept;
    if (story.pending_update) pending.reason = 'AI_BUDGET_OR_BATCH_LIMIT';
    else {
      pending.pending_reason = 'AI_BUDGET_OR_BATCH_LIMIT';
      pending.claims = claimLedgerFor(kept, story.story_id, now);
    }
    pending.quality_errors = [];
    pending.content_hash = storyContentHash({sources:kept});
    changes.push({story_id:story.story_id, before:sources.length, retained:kept.length, requeued:detached.length});
  }
  return {changes, requeued_sources:[...requeued.values()]};
}

export function refreshUnpublishedDraftTitle(candidate) {
  // A never-published, single-document draft follows that document's current
  // observed title, not the headline seen during its first queue arrival.
  // Do not relabel published stories or infer a title for a multi-source file.
  if (candidate.existing_story?.published || !candidate.sources?.length) return candidate;
  const urls = new Set(candidate.sources.map(source => source.url));
  const source = candidate.sources[0];
  const previous = candidate.existing_story;
  if (urls.size !== 1 || !source.title?.trim() || !previous
      || !(previous.sources || []).some(old => old.url === source.url)) return candidate;
  if (candidate.title !== source.title) {
    candidate.previous_draft_title = candidate.title;
    candidate.title = source.title;
  }
  return candidate;
}

function pendingRecord(candidate, reason, now, qualityErrors = []) {
  const existing = candidate.existing_story;
  const sameAttempt = existing?.ai_retry?.fingerprint === retryInputFingerprint(candidate)
    && existing?.ai_retry?.version === AI_PROCESSING_VERSION;
  const previousQualityRetries = Number(existing?.pending_update?.quality_retry_count ?? existing?.quality_retry_count ?? 0);
  const retryableOutput = reason === "QUALITY_GATE_FAILED" || reason === "AI_OUTPUT_INVALID";
  const qualityRetryCount = previousQualityRetries + (retryableOutput ? 1 : 0);
  const consecutiveRetries = (sameAttempt ? Number(existing.ai_retry.retry_count || 0) : 0) + (retryableOutput ? 1 : 0);
  const retryDelayMinutes = consecutiveRetries <= 1 ? 15 : consecutiveRetries === 2 ? 30 : consecutiveRetries === 3 ? 60 : Math.min(720, 180 * (2 ** Math.min(2, consecutiveRetries - 4)));
  const qualityRetryAfter = retryableOutput ? new Date(Date.parse(now) + retryDelayMinutes * 60000).toISOString() : null;
  const aiRetry = retryableOutput ? {
    version: AI_PROCESSING_VERSION, fingerprint: retryInputFingerprint(candidate),
    first_failed_at: sameAttempt ? existing.ai_retry.first_failed_at || existing.ai_retry.failed_at || now : now,
    failed_at: now, retry_after: qualityRetryAfter, retry_count: consecutiveRetries,
  } : existing?.ai_retry;
  if (existing?.published) {
    return {
      ...existing,
      ...(aiRetry ? { ai_retry: aiRetry } : {}),
      pending_update: {
        detected_at: existing.pending_update?.detected_at || now,
        content_hash: candidate.content_hash,
        sources: candidate.sources,
        reason,
        quality_errors: qualityErrors,
        quality_retry_count: qualityRetryCount,
        quality_retry_after: qualityRetryAfter,
        reassessment: Boolean(candidate.reassessment),
        fresh: Boolean(candidate.fresh),
        consolidation: Boolean(existing.pending_update?.consolidation),
        source_integrity: sourceIntegrityRecord(candidate.source_integrity),
      },
    };
  }
  return {
    story_id: candidate.story_id,
    ...(aiRetry ? { ai_retry: aiRetry } : {}),
    slug: candidate.slug,
    title: candidate.title,
    ...(existing?.title_image ? { title_image: existing.title_image } : {}),
    ...(existing?.corrections ? { corrections: existing.corrections } : {}),
    ...(existing?.queue_source_repartitions ? {queue_source_repartitions:existing.queue_source_repartitions} : {}),
    ...(existing?.living_file ? { living_file: existing.living_file } : {}),
    ...(existing?.review_checkpoint ? { review_checkpoint: existing.review_checkpoint } : {}),
    ...(existing?.publication_decision_review ? { publication_decision_review: existing.publication_decision_review, rejection_history: existing.rejection_history || [] } : {}),
    first_seen: candidate.first_seen,
    last_updated: candidate.last_updated,
    topic: candidate.topic,
    sources: candidate.sources,
    claims: candidate.claims,
    content_hash: candidate.content_hash,
    published: false,
    analysis_status: "automatische Veröffentlichung zurückgestellt",
    quality_errors: qualityErrors,
    quality_retry_count: qualityRetryCount,
    quality_retry_after: qualityRetryAfter,
    reassessment: Boolean(candidate.reassessment),
    fresh: Boolean(candidate.fresh),
    pending_reason: reason,
    versions: existing?.versions || [],
    updated_at: now,
    event_first_seen_at: candidate.event_first_seen_at,
    event_detected_at: candidate.event_detected_at,
    event_id: candidate.event_id,
    preanalysis: candidate.preanalysis,
    freshness: freshnessFor(candidate, now),
    source_integrity: sourceIntegrityRecord(candidate.source_integrity),
  };
}

function shouldRetireAfterReassessment(candidate, errors) {
  return Boolean(candidate.reassessment)
    && errors.length > 0
    && errors.some(error => ["AI_MATERIALITY_TOO_LOW", "AI_NEWS_VALUE_CONTEXT_ONLY", "AI_MATERIALITY_GATE_FAILED"].includes(error))
    && errors.every((error) => EDITORIAL_REJECTION_ERRORS.has(error));
}

function rejectedRecord(record, now, qualityErrors) {
  const { pending_update: _pendingUpdate, pending_reason: _pendingReason, quality_retry_count: _qualityRetryCount, reassessment: _reassessment, ...preserved } = record;
  return {
    ...preserved,
    listed: false,
    analysis_status: "nach Relevanzprüfung nicht veröffentlicht",
    relevance_filter_version: RELEVANCE_FILTER_VERSION,
    rejected_at: now,
    rejection: {
      at: now,
      filter_version: RELEVANCE_FILTER_VERSION,
      reason_code: "FILTER_NOT_MATERIAL",
      quality_errors: qualityErrors,
    },
  };
}

export function recoverAmbiguousPublicationDecisions(stories, decisions, now) {
  const latest = new Map((decisions || []).map(decision => [decision.story_id, decision]));
  const recovered = [];
  for (const story of stories || []) {
    const errors = story.rejection?.quality_errors;
    const decision = latest.get(story.story_id);
    // Old NOT_RECOMMENDED conflated explicit false with an absent/non-boolean
    // field. Review only this ambiguous, never-published class once; preserve
    // every explicit decision and never infer permission to publish.
    if (story.published || story.listed !== false || story.publication_decision_review
      || errors?.length !== 1 || errors[0] !== 'AI_PUBLICATION_NOT_RECOMMENDED'
      || typeof decision?.publication_recommendation === 'boolean' || decision?.rejection_code) continue;
    story.rejection_history = [...(story.rejection_history || []), structuredClone(story.rejection)];
    story.publication_decision_review = { at: now, reason: 'ambiguous_legacy_decision', version: '1.0' };
    story.listed = true;
    story.pending_reason = 'QUALITY_GATE_FAILED';
    story.quality_errors = ['AI_PUBLICATION_DECISION_UNRECORDED'];
    story.quality_retry_count = 0;
    story.quality_retry_after = null;
    story.analysis_status = 'Veröffentlichungsentscheidung wird erneut geprüft';
    recovered.push(story.story_id);
  }
  return recovered;
}

function retiredRecord(candidate, now, qualityErrors) {
  const existing = candidate.existing_story;
  const { pending_update: _pendingUpdate, ...preserved } = existing;
  return {
    ...preserved,
    listed: false,
    analysis_status: "nach erneuter Relevanzprüfung nicht mehr in der laufenden Auswahl",
    relevance_filter_version: RELEVANCE_FILTER_VERSION,
    retired_at: now,
    retirement: {
      at: now,
      filter_version: RELEVANCE_FILTER_VERSION,
      reason_code: "FILTER_REASSESSMENT_NOT_MATERIAL",
      quality_errors: qualityErrors,
      note: "Die historische Veröffentlichung bleibt transparent erhalten, wird aber nicht mehr im aktuellen Ticker oder in dessen Feeds geführt.",
    },
  };
}

export function shouldRetryQualityGate(reason, qualityErrors, retryCount = 0, retryAfter = null, now = null) {
  if (!["QUALITY_GATE_FAILED", "AI_OUTPUT_INVALID"].includes(reason) || !Array.isArray(qualityErrors) || !qualityErrors.length) return false;
  if (retryAfter && now && Date.parse(retryAfter) > Date.parse(now)) return false;
  // Older queue records have a retry count but no retry timestamp. They must
  // not remain permanently parked after the old three-attempt ceiling. The
  // next failed attempt writes the existing bounded exponential backoff.
  // Pure, well-formed editorial rejections still do not retry unchanged data.
  if (reason === "AI_OUTPUT_INVALID") return qualityErrors.every((error) => OUTPUT_FORMAT_ERRORS.has(error));
  const hasStructuralError = qualityErrors.some((error) => RETRYABLE_QUALITY_ERRORS.some((pattern) => pattern.test(error)));
  return hasStructuralError && qualityErrors.every((error) => (
    RETRYABLE_QUALITY_ERRORS.some((pattern) => pattern.test(error)) || RETRY_COMPANION_ERRORS.has(error)
  ));
}

export function sanitizeAnalysisVisuals(analysis, candidate, report = {}) {
  if (!analysis || typeof analysis !== "object" || Array.isArray(analysis)) return analysis;
  const { visuals, dropped } = sanitizeVisuals(analysis.visuals, { ...candidate, source_summary: analysis.source_summary });
  analysis.visuals = visuals;
  if (dropped.length) {
    report.visuals_dropped ||= [];
    report.visuals_dropped.push({ story_id: candidate.story_id, dropped });
  }
  return analysis;
}

export function normalizeEditorialDecision(analysis) {
  // The duplicate-status enum occasionally appears in the rejection slot.
  // This exact synonym can only reject, never authorize publication.
  if (analysis?.publication_recommendation === false
      && analysis.rejection?.code === "duplicate_without_new_information") {
    analysis.rejection.original_code = analysis.rejection.code;
    analysis.rejection.code = "no_new_information";
  }
  return analysis;
}

export function normalizeAnalysisParagraphs(analysis) {
  const value = analysis?.source_summary;
  if (typeof value !== 'string' || /\n\s*\n/.test(value)) return analysis;
  const words = value.trim().split(/\s+/).length;
  if (words < (analysis.publication_depth === 'initial' ? 60 : 100) || words > 180) return analysis;
  const sentences = value.trim().split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„“"])/u);
  if (sentences.length < 2) return analysis;
  const middle = Math.ceil(sentences.length / 2);
  analysis.source_summary = `${sentences.slice(0,middle).join(' ')}\n\n${sentences.slice(middle).join(' ')}`;
  return analysis;
}

export function analysisValidationDiagnostics(analysis, mediaExplanationBeforeSanitizing) {
  if (!analysis) return null;
  return {
    publication_depth: analysis.publication_depth || null,
    publication_decision_type: typeof analysis.publication_recommendation,
    publication_decision_value: ['string','boolean','number'].includes(typeof analysis.publication_recommendation)
      ? String(analysis.publication_recommendation).slice(0,60) : null,
    media_public_explanation_words: String(analysis.media_impact?.public_explanation || '').trim().split(/\s+/).filter(Boolean).length,
    media_public_explanation_paragraphs: String(analysis.media_impact?.public_explanation || '').split(/\n\s*\n/).filter(s=>s.trim()).length,
    ...(mediaExplanationBeforeSanitizing === undefined ? {} : {
      media_public_explanation_input_words: String(mediaExplanationBeforeSanitizing || '').trim().split(/\s+/).filter(Boolean).length,
      media_public_explanation_input_paragraphs: String(mediaExplanationBeforeSanitizing || '').split(/\n\s*\n/).filter(s=>s.trim()).length,
    }),
    source_summary_words: String(analysis.source_summary || '').trim().split(/\s+/).filter(Boolean).length,
    source_summary_paragraphs: String(analysis.source_summary || '').split(/\n\s*\n/).filter(s=>s.trim()).length,
    missing_claim_numbers: (Array.isArray(analysis.event_claims) ? analysis.event_claims : []).flatMap((claim,index) => {
      const cited = numberTokens((Array.isArray(claim?.evidence) ? claim.evidence : []).map(proof=>typeof proof?.excerpt === 'string' ? proof.excerpt : '').join('\n'));
      const missing = [...numberTokens(typeof claim?.claim === 'string' ? claim.claim : '')].filter(n=>!cited.has(n));
      return missing.length ? [{claim_index:index,missing,cited_numbers:[...cited]}] : [];
    }),
  };
}

export function sanitizeAnalysisMediaImpact(analysis, candidate, report = {}, now = new Date().toISOString()) {
  if (!analysis || typeof analysis !== "object" || Array.isArray(analysis)) return analysis;
  const localTrigger = candidate.media_trigger || detectMediaImpactTrigger(candidate);
  const trigger = effectiveMediaImpactTrigger(localTrigger, analysis.media_impact, candidate);
  if (!localTrigger.relevant && trigger.relevant) {
    report.media_checks_ai_promoted = Number(report.media_checks_ai_promoted || 0) + 1;
    report.media_check_promotions ||= [];
    report.media_check_promotions.push({ story_id: candidate.story_id, reason: "SUBSTANTIVE_ANALYSIS_FINDING" });
  }
  const { media_impact: mediaImpact, dropped } = sanitizeMediaImpact(analysis.media_impact, candidate, trigger);
  analysis.media_impact = mediaImpact;
  analysis.media_analysis_version = MEDIA_ANALYSIS_VERSION;
  analysis.media_checked_at = now;
  analysis.media_trigger_fingerprint = trigger.fingerprint;
  analysis.media_trigger = mediaTriggerRecord(trigger, candidate);
  if (dropped.length) {
    report.media_impact_dropped ||= [];
    report.media_impact_dropped.push({ story_id: candidate.story_id, dropped });
  }
  applySelfFrameRewrites(analysis, candidate, report);
  return analysis;
}

export function publishedRecord(candidate, analysis, ai, now) {
  const existing = candidate.existing_story;
  const versionNumber = Number(existing?.current_version || 0) + 1;
  const { source_summary: sourceSummary, event_claims: _eventClaims, followups: newFollowups = [], ...woekAnalysis } = analysis;
  const version = {
    version: versionNumber,
    analyzed_at: now,
    content_hash: candidate.content_hash,
    source_summary: sourceSummary,
    analysis: woekAnalysis,
    provider: ai.provider,
    model: ai.model,
    mode: ai.mode,
    method_sources: ai.method_sources,
    claims: analysis.event_claims ? persistClaimEvidence(analysis, candidate, now) : candidate.claims,
    source_versions: candidate.sources.map((source) => ({ source_id: source.source_id, url: source.url, content_hash: source.content_hash })),
    numeric_evidence: numericEvidenceReceipt(candidate, versionNumber, now),
  };
  return {
    ...(existing?.queue_source_repartitions ? {queue_source_repartitions:existing.queue_source_repartitions} : {}),
    ...(existing?.publication_decision_review ? { publication_decision_review: existing.publication_decision_review, rejection_history: existing.rejection_history || [] } : {}),
    story_id: candidate.story_id,
    slug: candidate.slug,
    title: candidate.title,
    first_seen: candidate.first_seen,
    last_updated: now,
    published_at: existing?.published_at || now,
    updated_at: now,
    topic: candidate.topic,
    sources: candidate.sources.map(sourcePublicRecord),
    claims: analysis.event_claims ? persistClaimEvidence(analysis, candidate, now) : candidate.claims,
    event_id: candidate.event_id,
    event_first_seen_at: candidate.event_first_seen_at,
    event_detected_at: candidate.event_detected_at,
    verification_started_at: candidate.verification_started_at || now,
    publish_ready_at: now,
    news_status: analysis.news_status || "preliminary",
    deepening_due_at: analysis.publication_depth === "initial" ? nextDeepeningCheckpoint(now) : null,
    evidence_groups: candidate.evidence_groups,
    source_integrity: sourceIntegrityRecord(candidate.source_integrity),
    followups: [
      ...(existing?.followups || []),
      ...newFollowups.filter((followup) => !(existing?.followups || []).some((old) => old.claim === followup.claim && old.source_id === followup.source_id)).map(({ expected_by_evidence, ...followup }) => ({
        ...followup, expected_by_evidence_hash: expected_by_evidence ? sha256(expected_by_evidence) : null, followup_id: `followup-${sha256(`${candidate.story_id}:${followup.claim}`).slice(0, 16)}`,
        announced_at: candidate.sources.find((source) => source.source_id === followup.source_id)?.published_at || null,
        follow_up_date: followup.expected_by ? new Date(Math.max(Date.parse(followup.expected_by), Date.parse(now) + 86400000)).toISOString() : new Date(Date.parse(now) + 7 * 86400000).toISOString(),
        status: "scheduled",
      })),
    ],
    content_hash: candidate.content_hash,
    published: true,
    ...(existing?.title_image ? { title_image: existing.title_image } : {}),
    ...(existing?.corrections ? { corrections: existing.corrections } : {}),
    ...(existing?.living_file ? { living_file: existing.living_file } : {}),
    listed: true,
    analysis_status: "veröffentlicht",
    relevance_filter_version: RELEVANCE_FILTER_VERSION,
    current_version: versionNumber,
    numeric_evidence: version.numeric_evidence,
    source_summary: sourceSummary,
    analysis: woekAnalysis,
    versions: [...(existing?.versions || []), version],
    publication_history: [
      ...(existing?.publication_history || []),
      { version: versionNumber, published_at: now, source_count: candidate.sources.length },
    ],
    retirement_history: existing?.retirement
      ? [...(existing?.retirement_history || []), existing.retirement]
      : (existing?.retirement_history || []),
  };
}

function latestSourceDate(items) {
  return items.reduce((latest, item) => {
    const value = Date.parse(item.published_at || 0);
    return value > latest ? value : latest;
  }, 0);
}

function candidateQueuedAt(candidate) {
  const existing = candidate.existing_story;
  return existing?.pending_update?.detected_at
    || (!existing?.published ? existing?.event_detected_at || candidate.event_detected_at : null)
    || existing?.updated_at;
}

export function queuePriority(candidate, now) {
  const existing = candidate.existing_story;
  const ageSinceEvidence = Math.max(0, Date.parse(now) - latestSourceDate(candidate.sources || []));
  // Ingestion is not publication: a current, unpublished fact must not lose
  // its freshness merely because a previous provider attempt failed.
  const fresh = (candidate.fresh || !existing?.published) && ageSinceEvidence <= 3 * 60 * 60 * 1000;
  const freshBonus = fresh ? 120 : 0;
  const publishedUpdateBonus = fresh && existing?.published && candidate.content_hash !== existing.content_hash ? 30 : 0;
  const firstPublicationBonus = !existing?.published ? 45 : 0;
  const reassessmentPenalty = candidate.reassessment && !fresh ? -60 : 0;
  const queuedAt = Date.parse(candidateQueuedAt(candidate) || now);
  const ageHours = Number.isFinite(queuedAt) ? Math.max(0, (Date.parse(now) - queuedAt) / (60 * 60 * 1000)) : 0;
  const waitingBonus = Math.min(36, Math.floor(ageHours / 6));
  const urgentReviewBonus = candidate.preanalysis.material_development_review?.time_sensitive ? 72 : 0;
  const concreteNewsBonus = candidate.preanalysis.news_value_signals?.length ? 24 : 0;
  return candidate.preanalysis.internal_relevance_score + freshBonus + publishedUpdateBonus + firstPublicationBonus + reassessmentPenalty + waitingBonus + urgentReviewBonus + concreteNewsBonus;
}

function retryInputFingerprint(candidate) {
  return sha256(JSON.stringify({ title: candidate.title,
    published_version: candidate.existing_story?.current_version || 0,
    sources: (candidate.sources || []).map(sourceReviewFingerprint).sort() }));
}

export function retryCoolingDown(candidate, now) {
  const previous = candidate.existing_story?.ai_retry;
  return previous?.version === AI_PROCESSING_VERSION
    && previous.fingerprint === retryInputFingerprint(candidate)
    && Date.parse(previous.retry_after) > Date.parse(now);
}

export function aiRequestsInWindow(usage, now, windowMinutes = 60) {
  const nowMs = new Date(now).getTime();
  if (!Number.isFinite(nowMs)) throw new Error("INVALID_AI_USAGE_TIME");
  const cutoff = nowMs - Math.max(1, Number(windowMinutes || 60)) * 60 * 1000;
  return (usage.runs || [])
    .filter((run) => {
      const startedAt = Date.parse(run.started_at || 0);
      return Number.isFinite(startedAt) && startedAt > cutoff && startedAt <= nowMs;
    })
    .reduce((sum, run) => {
      const requests = Number(run.ai?.requests ?? run.counts?.ai_stories ?? 0);
      return sum + (Number.isFinite(requests) ? Math.max(0, requests) : 0);
    }, 0);
}

export function catchUpQueueStage(stage, ready, usage, now, budget, spend) {
  const control = { enabled: false, base_limit: stage.max_stories_per_run ?? null,
    effective_limit: stage.max_stories_per_run ?? null, reason: "not_constrained_stage" };
  const result = () => ({ stage: control.enabled ? { ...stage, max_stories_per_run: 6 } : stage, control });
  // A measured, temporary soft-throttle adjustment, never a larger budget or
  // permission to publish lower-quality material. Cheap checks are NOT cheap
  // first publications; the publication-cost report retains that denominator.
  if (stage.stage !== 2 || !Number.isFinite(budget) || !Number.isFinite(spend)) return result();
  const nowMs = Date.parse(now);
  control.reason = "no_aged_backlog";
  const uniqueReady = [...new Map(ready.map(candidate => [candidate.story_id, candidate])).values()];
  const aged = uniqueReady.filter(candidate => candidate.existing_story
    && nowMs - Date.parse(candidateQueuedAt(candidate)) >= 90 * 60000);
  if (!Number.isFinite(nowMs) || uniqueReady.length < 12 || aged.length < 2) return result();
  control.headroom_to_stop_usd = Number((budget * 0.95 - spend).toFixed(6));
  control.reason = "insufficient_budget_reserve";
  if (control.headroom_to_stop_usd < 2 * NEWS_REQUEST_RESERVATION_USD) return result();
  const recent = (usage.runs || []).filter(run => String(run.run_id).startsWith("news-run-")
    && Date.parse(run.completed_at) <= nowMs && Date.parse(run.started_at) > nowMs - 2 * 3600000
    && Date.parse(run.started_at) <= nowMs && Number(run.ai?.requests) > 0)
    .sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at));
  const uniqueRuns = new Map();
  control.reason = "incomplete_cost_sample";
  for (const run of recent) {
    const previous = uniqueRuns.get(run.run_id);
    if (previous && JSON.stringify(previous.ai) !== JSON.stringify(run.ai)) return result();
    uniqueRuns.set(run.run_id, run);
  }
  const sample = [...uniqueRuns.values()].slice(0, 6);
  if (!sample.length || sample.some(run => run.ai.token_source !== "provider_reported_usage"
    || !Number.isInteger(run.ai.requests) || run.ai.requests <= 0
    || !Number.isFinite(run.ai.estimated_cost_usd) || run.ai.estimated_cost_usd < 0)) return result();
  control.sample_calls = sample.reduce((sum, run) => sum + run.ai.requests, 0);
  if (control.sample_calls < 12) return result();
  const meanCost = sample.reduce((sum, run) => sum + run.ai.estimated_cost_usd, 0) / control.sample_calls;
  control.mean_check_cost_usd = Number(meanCost.toFixed(6));
  control.reason = "checks_too_expensive";
  if (meanCost > 0.012) return result();
  control.enabled = true;
  control.effective_limit = 6;
  control.reason = "aged_backlog_with_measured_low_check_cost";
  return result();
}

export function partitionAiQueue(eligible, stage, maxStories, now = new Date().toISOString()) {
  const allowed = stage.stage >= 3 ? [] : eligible
    .filter((candidate) => candidate.reassessment || candidate.preanalysis.internal_relevance_score >= stage.threshold);
  const limit = Math.max(0, Math.min(maxStories, stage.max_stories_per_run ?? Infinity));
  let selected = allowed.slice(0, limit);
  // With the normal 12-slot run, reserve a quarter for older retryable work.
  // Fresh material keeps the majority, but a continuous news stream can no
  // longer starve the durable queue indefinitely.
  if (limit >= 4 && allowed.length > limit) {
    const queued = allowed.filter((candidate) => candidate.existing_story
      && (!candidate.fresh || Date.parse(now) - Date.parse(candidateQueuedAt(candidate)) >= 90 * 60000))
      .sort((left, right) => {
        const leftReason = left.existing_story?.pending_update?.reason || left.existing_story?.pending_reason;
        const rightReason = right.existing_story?.pending_update?.reason || right.existing_story?.pending_reason;
        const leftTechnical = TECHNICAL_HOLD_REASONS.has(leftReason) || leftReason === "QUALITY_GATE_FAILED";
        const rightTechnical = TECHNICAL_HOLD_REASONS.has(rightReason) || rightReason === "QUALITY_GATE_FAILED";
        return Number(rightTechnical) - Number(leftTechnical)
          || Date.parse(candidateQueuedAt(left) || 0) - Date.parse(candidateQueuedAt(right) || 0);
      });
    const reserve = Math.min(queued.length, Math.max(1, Math.ceil(limit / 4)));
    const reserved = queued.slice(0, reserve);
    const reservedIds = new Set(reserved.map((candidate) => candidate.story_id));
    selected = [...allowed.filter((candidate) => !reservedIds.has(candidate.story_id)).slice(0, limit - reserve), ...reserved];
  }
  const selectedIds = new Set(selected.map((candidate) => candidate.story_id));
  return { selected, deferred: eligible.filter((candidate) => !selectedIds.has(candidate.story_id)) };
}

export function aiDeferralReason(candidate, stage, remainingCalls) {
  if (stage.stage >= 3 || (!candidate.reassessment && candidate.preanalysis.internal_relevance_score < stage.threshold)) return "AI_BUDGET_BLOCKED";
  return remainingCalls === 0 ? "AI_HOURLY_CALL_LIMIT" : "AI_BUDGET_OR_BATCH_LIMIT";
}

export function retainUsageHistory(runs, now) {
  const month = String(now).slice(0, 7);
  // Frequent headless runs must not erase this month's spend after 400 runs.
  return [
    ...runs.filter((run) => !String(run.started_at).startsWith(month)).slice(-400),
    ...runs.filter((run) => String(run.started_at).startsWith(month)),
  ];
}

export function aiProviderCoverageDegraded(report = {}) {
  const failures = Math.max(0, Number(report.ai_provider_failures || 0));
  const successes = Math.max(0, Number(report.ai_provider_successes || 0));
  if (!failures) return false;
  const providerErrors = Array.isArray(report.ai_provider_errors) ? report.ai_provider_errors : [];
  const onlyCapacityThrottles = providerErrors.length >= failures
    && providerErrors.slice(-failures).every((entry) => /AI_PROVIDER_ERROR:429/.test(String(entry?.error || "")));
  // The shared Oracle route deliberately returns 429 when its rolling
  // capacity is exhausted. This is an expected queue condition, not a
  // provider outage, even when it happens on the first request of a run.
  if (onlyCapacityThrottles) return false;
  if (!successes) return true;
  // A single late timeout after successful responses is observable but does
  // not make the whole provider unavailable. Escalate repeated failures.
  return failures >= 3 || (failures >= 2 && failures / (failures + successes) >= 0.2);
}

export function queueSnapshot(stories = [], now = new Date().toISOString(), before = 0, { budgetBlocked = false } = {}) {
  const rows = stories.filter((story) => !isMerged(story) && ((!story.published && story.listed !== false) || story.pending_update));
  const snapshot = { before: Number(before || 0), after: rows.length, retryable: 0, capacity: 0, technical: 0, editorial: 0, oldest_minutes: 0, oldest_technical_minutes: 0, by_reason: {} };
  for (const story of rows) {
    const pending = story.pending_update || story;
    const reason = pending.reason || story.pending_reason || "UNCLASSIFIED";
    const errors = pending.quality_errors || story.quality_errors || [];
    const retryCount = pending.quality_retry_count ?? story.quality_retry_count ?? 0;
    const retryAfter = pending.quality_retry_after || story.quality_retry_after || null;
    // Legacy first_seen is sometimes the source's publication date, not our
    // receipt time. Never turn an older article into an invented queue delay.
    const queuedAt = Date.parse(pending.detected_at || (!story.published ? story.event_detected_at : null) || story.updated_at || now);
    const ageMinutes = Number.isFinite(queuedAt) ? Math.max(0, (Date.parse(now) - queuedAt) / 60000) : 0;
    snapshot.oldest_minutes = Math.max(snapshot.oldest_minutes, ageMinutes);
    snapshot.by_reason[reason] = Number(snapshot.by_reason[reason] || 0) + 1;
    const structuralRetry = shouldRetryQualityGate(reason, errors, retryCount, retryAfter, retryAfter || now);
    if (CAPACITY_HOLD_REASONS.has(reason)) {
      snapshot.capacity += 1;
      snapshot.retryable += 1;
    } else if (TECHNICAL_HOLD_REASONS.has(reason) || structuralRetry) {
      snapshot.technical += 1;
      snapshot.retryable += 1;
      const failedAt = Date.parse(story.ai_retry?.first_failed_at || story.ai_retry?.failed_at || '');
      const technicalAge = Number.isFinite(failedAt) ? Math.max(0, (Date.parse(now) - failedAt) / 60000) : ageMinutes;
      snapshot.oldest_technical_minutes = Math.max(snapshot.oldest_technical_minutes, technicalAge);
    } else {
      snapshot.editorial += 1;
    }
  }
  snapshot.budget_blocked = Boolean(budgetBlocked && snapshot.retryable);
  snapshot.status = snapshot.budget_blocked
    ? "budget_blocked"
    : snapshot.technical && snapshot.oldest_technical_minutes >= 90
    ? "technical_delay"
    : snapshot.retryable
      ? "draining"
      : snapshot.editorial
        ? "editorial_holds"
        : "clear";
  return snapshot;
}

function sanitizeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/[A-Za-z0-9_-]{24,}/g, "[redacted]").slice(0, 240);
}

function governanceHoldFor(error, now) {
  const message = error instanceof Error ? error.message : String(error);
  if (!/^(?:ROBOTS_DISALLOWED|ROBOTS_UNAVAILABLE_|ROBOTS_REDIRECT_LIMIT|ROBOTS_CROSS_ORIGIN_REDIRECT|RSL_AI_INPUT_DISALLOWED|RSL_STATUS_OPEN|RSL_UNAVAILABLE_|RSL_REDIRECT_LIMIT|RSL_CROSS_ORIGIN_REDIRECT|SOURCE_ACCESS_NOT_CLEARED)/i.test(message)) return null;
  return {
    reason: message.split(":")[0],
    set_at: now,
    // Retry only the policy probe after one day. A successful fetch clears the
    // hold; a still-restrictive policy renews it without touching article data.
    until: new Date(Date.parse(now) + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function isRetryableFeedError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /fetch failed|network|socket|timed?\s*out|abort|ECONNRESET|EAI_AGAIN|FEED_HTTP_(?:408|425|429|5\d\d)/i.test(message);
}

export async function fetchFeedWithRetry(source, policy, fetchImpl = fetchFeed, options = {}) {
  const attempts = Math.max(1, Math.min(4, Number(options.attempts || policy.fetch_attempts || 3)));
  const delay = options.delayImpl || ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return { fetched: await fetchImpl(source, policy), attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !isRetryableFeedError(error)) throw error;
      await delay(400 * (2 ** (attempt - 1)));
    }
  }
  throw lastError;
}

export async function runWirkungsticker(options = {}) {
  const changedStoryIds = new Set();
  const nowDate = options.now ? new Date(options.now) : process.env.WOEK_NEWS_NOW ? new Date(process.env.WOEK_NEWS_NOW) : new Date();
  if (!Number.isFinite(nowDate.getTime())) throw new Error("INVALID_RUN_TIME");
  const now = nowDate.toISOString();
  const runSchedule = scheduledSlot(nowDate);
  const isAutomatedRun = process.env.GITHUB_EVENT_NAME === "schedule"
    || (process.env.GITHUB_EVENT_NAME === "push" && process.env.GITHUB_REF === "refs/heads/codex/wirkungsticker-clock");
  const registry = options.registry ? normalizeNewsRegistry(options.registry) : loadNewsRegistry(ROOT);
  const invalidRegistry = registryErrors(registry);
  if (invalidRegistry.length) throw new Error(invalidRegistry.join(","));
  const state = structuredClone(options.state || readJson(files.state));
  state.cost_monitoring_started_at ||= now;
  const storyStore = structuredClone(options.storyStore || readJson(files.stories));
  const usage = structuredClone(options.usage || readJson(files.usage));
  const newsroom = options.newsroom || (fs.existsSync(files.newsroom) ? readJson(files.newsroom) : { schema_version: "1.0", source_items: {}, events: {}, event_sources: [], discovery_candidates: [] });
  const enabledSources = registry.sources.filter((source) => source.enabled && sourceAccess(source).allowed);
  const dueSources = enabledSources.filter((source) => sourceDue(source, state.source_status[source.source_id], now));
  const previousSourceStatus = structuredClone(state.source_status);
  const pendingStoryCountBefore = (state.pending_story_ids || []).length;
  const pendingStoryIdsBefore = new Set(state.pending_story_ids || []);
  const sourceFunnel = createSourceFunnel(enabledSources, dueSources);
  const report = {
    schema_version: "1.2",
    processing_version: AI_PROCESSING_VERSION,
    usage_recovery: usage.failed_run_recovery ? { status: usage.failed_run_recovery.status,
      checked_at: usage.failed_run_recovery.checked_at,
      unresolved_run_ids: usage.failed_run_recovery.unresolved_run_ids || [] } : null,
    status: "running",
    started_at: now,
    berlin_slot: runSchedule.slot || (isAutomatedRun ? `Automatischer Lauf ${String(runSchedule.hourNumber).padStart(2, "0")}:00` : "manueller Lauf"),
    feed_entries_fetched: 0,
    feed_entries_new: 0,
    feed_entries_updated: 0,
    feed_entries_backfilled: 0,
    feed_entries_deduplicated: 0,
    feed_entries_future_dated: 0,
    story_clusters: 0,
    locally_rejected: 0,
    eligible_stories: 0,
    ai_stories: 0,
    ai_calls: 0,
    reviews_reused: 0,
    input_holds: [],
    prompt_chars_sent: 0,
    ai_batches_planned: 0,
    ai_batches_completed: 0,
    published_stories: 0,
    updated_stories: 0,
    retired_stories: 0,
    reactivated_stories: 0,
    provider: null,
    model: null,
    input_tokens: 0,
    output_tokens: 0,
    estimated_cost_usd: 0,
    source_successes: 0,
    source_failures: 0,
    source_retry_attempts: 0,
    source_errors: [],
    ai_provider_successes: 0,
    ai_provider_failures: 0,
    ai_provider_errors: [],
    ai_output_invalid: 0,
    budget_blocked: false,
    quality_holds: [],
    article_excerpts_fetched: 0,
    article_excerpt_failures: 0,
    visuals_dropped: [],
    media_impact_dropped: [],
    media_checks_triggered: 0,
    media_checks_skipped: 0,
    media_checks_ai_promoted: 0,
    media_check_promotions: [],
    media_check_tokens: 0,
    media_check_cost_usd: 0,
    self_frame_rewrites: 0,
    source_integrity_holds: [],
    budget_stage: 0,
    completed_at: null,
    sources_scheduled: dueSources.length,
    sources_not_due: enabledSources.length - dueSources.length,
    sources_not_modified: 0,
    pending_story_count_before: pendingStoryCountBefore,
    source_funnel: [],
    queue: null,
    operational_status: "running",
    editorial_status: "running",
  };

  report.ambiguous_decisions_requeued = [];
  if (!state.publication_decision_review_v1_at) {
    report.ambiguous_decisions_requeued = recoverAmbiguousPublicationDecisions(storyStore.stories, newsroom.decisions, now);
    state.publication_decision_review_v1_at = now;
  }

  const fetchResults = await mapLimit(dueSources, Number(process.env.WOEK_NEWS_FETCH_CONCURRENCY || 3), async (source) => {
    const fetchResult = await fetchFeedWithRetry(
      { ...datedSource(source, now), etag: state.source_status[source.source_id]?.etag, last_modified: state.source_status[source.source_id]?.last_modified, max_items: source.max_items || registry.policy.max_items_per_source },
      registry.policy,
      options.fetchFeedImpl || fetchFeed,
      { delayImpl: options.fetchRetryDelayImpl },
    );
    const { fetched } = fetchResult;
    const items = fetched.not_modified ? [] : parseFeed(fetched.body, { ...source, max_items: source.max_items || registry.policy.max_items_per_source })
      .map((item) => annotateSourceItem(item, source, now))
      .map((item) => reconcileSourceIdentity(item, source, registry));
    if (!source.allow_empty && !fetched.not_modified && !items.length && Number(state.source_status[source.source_id]?.items || 0) > 0) throw new Error("SOURCE_PARSER_DRIFT_OR_EMPTY_FEED");
    return { source, fetched, items, fetchAttempts: fetchResult.attempts };
  });

  const allItems = [];
  for (let index = 0; index < fetchResults.length; index += 1) {
    const result = fetchResults[index];
    const source = dueSources[index];
    const previousStatus = state.source_status[source.source_id] || {};
    if (result.status === "rejected") {
      const error = sanitizeError(result.reason);
      const governanceHold = governanceHoldFor(result.reason, now);
      bumpSourceFunnel(sourceFunnel, source.source_id, "fetch_failures");
      if (/PARSER|XML|JSON|FEED_FORMAT|EMPTY_FEED/i.test(error)) bumpSourceFunnel(sourceFunnel, source.source_id, "parse_failures");
      report.source_failures += 1;
      report.source_errors.push({ source_id: source.source_id, error });
      state.source_status[source.source_id] = { ...previousStatus, last_attempt: now, attempts: Number(previousStatus.attempts || 0) + 1, failures: Number(previousStatus.failures || 0) + 1, consecutive_failures: Number(previousStatus.consecutive_failures || 0) + 1, last_error_at: now, last_error: error, last_success: previousStatus.last_success || null, governance_hold_reason: governanceHold?.reason || previousStatus.governance_hold_reason || null, governance_hold_until: governanceHold?.until || previousStatus.governance_hold_until || null };
      continue;
    }
    bumpSourceFunnel(sourceFunnel, source.source_id, "fetch_successes");
    bumpSourceFunnel(sourceFunnel, source.source_id, "feed_items", result.value.items.length);
    report.source_successes += 1;
    if (result.value.fetched.not_modified) report.sources_not_modified += 1;
    report.source_retry_attempts += Math.max(0, Number(result.value.fetchAttempts || 1) - 1);
    report.feed_entries_fetched += result.value.items.length;
    allItems.push(...result.value.items);
    state.source_status[source.source_id] = {
      ...previousStatus,
      last_attempt: now,
      attempts: Number(previousStatus.attempts || 0) + 1,
      consecutive_failures: 0,
      last_success: now,
      last_error: null,
      governance_hold_reason: null,
      governance_hold_until: null,
      feed_url: result.value.fetched.final_url,
      items: result.value.fetched.not_modified ? previousStatus.items : result.value.items.length,
      latest_item: result.value.items.map((item) => item.published_at).filter(Boolean).sort().at(-1) || previousStatus.latest_item || null,
      etag: result.value.fetched.etag,
      last_modified: result.value.fetched.last_modified,
    };
  }
  if (dueSources.length && report.source_successes === 0) report.all_sources_failed = true;

  const lookbackMs = Number(registry.policy.bootstrap_lookback_hours || 36) * 60 * 60 * 1000;
  const backfillCutoff = nowDate.getTime() - RELEVANCE_BACKFILL_DAYS * 24 * 60 * 60 * 1000;
  const needsRelevanceBackfill = state.relevance_filter_version !== RELEVANCE_FILTER_VERSION;
  const futureToleranceMs = 10 * 60 * 1000;
  const changedItems = [];
  const freshItemIds = new Set();
  for (const item of allItems) {
    const sourceCursor = previousSourceStatus[item.source_id]?.last_success;
    const cutoff = sourceCursor ? Date.parse(sourceCursor) - 5 * 60 * 1000 : nowDate.getTime() - lookbackMs;
    const previous = state.seen_items[item.item_id];
    const published = Date.parse(item.published_at || 0);
    if (published > nowDate.getTime() + futureToleranceMs) {
      report.feed_entries_future_dated += 1;
      bumpSourceFunnel(sourceFunnel, item.source_id, "future_dated_items");
      continue;
    }
    const backfillCandidate = needsRelevanceBackfill && (!published || published >= backfillCutoff);
    if (!previous && published && published < cutoff && !backfillCandidate) continue;
    if (!previous || backfillCandidate) {
      changedItems.push(item);
      if (previous) report.feed_entries_backfilled += 1;
      else {
        report.feed_entries_new += 1;
        bumpSourceFunnel(sourceFunnel, item.source_id, "new_items");
        freshItemIds.add(item.item_id);
      }
    } else if (previous.content_hash !== item.content_hash) {
      changedItems.push(item);
      report.feed_entries_updated += 1;
      bumpSourceFunnel(sourceFunnel, item.source_id, "updated_items");
      freshItemIds.add(item.item_id);
    } else {
      report.feed_entries_deduplicated += 1;
      bumpSourceFunnel(sourceFunnel, item.source_id, "unchanged_items");
    }
    state.seen_items[item.item_id] = {
      source_id: item.source_id,
      url: item.url,
      content_hash: item.content_hash,
      published_at: item.published_at,
      last_seen: now,
    };
    const fingerprint = eventFingerprint(item);
    newsroom.source_items[item.source_item_id] = { ...sourcePublicRecord(item), event_id: fingerprint.id, first_seen_at: newsroom.source_items[item.source_item_id]?.first_seen_at || now };
    newsroom.events[fingerprint.id] = { ...fingerprint, event_detected_at: newsroom.events[fingerprint.id]?.event_detected_at || now };
  }
  const pruneBefore = nowDate.getTime() - 120 * 24 * 60 * 60 * 1000;
  for (const [id, record] of Object.entries(state.seen_items)) if (Date.parse(record.last_seen || 0) < pruneBefore) delete state.seen_items[id];

  const repartition = repartitionOversizedSourceQueues(storyStore.stories || [], now);
  report.source_queue_repartitions = repartition.changes;
  const freshUrls = new Set(changedItems.map(item => item.url));
  changedItems.push(...repartition.requeued_sources.filter(item => !freshUrls.has(item.url)));
  report.living_file_merges = mergeLivingFiles(storyStore.stories || [], duplicateGroups(storyStore.stories || []), now);
  report.retired_stories += report.living_file_merges.filter((change) => storyStore.stories.find((story) => story.story_id === change.story_id)?.published).length;
  const matchableStories = (storyStore.stories || [])
    .filter((story) => story.retirement?.reason_code !== "MERGED_INTO_LIVING_FILE");
  const scheduledFollowups = dueFollowups(matchableStories, now);
  const dueFollowupIds = new Set(scheduledFollowups.map((followup) => followup.story_id));
  const dueDeepeningIds = new Set(matchableStories.filter((story) => story.published && story.listed !== false && story.deepening_due_at && Date.parse(story.deepening_due_at) <= nowDate.getTime()).map((story) => story.story_id));
  const freshCandidates = clusterItems(changedItems, storyStore.stories || [], now)
    .map((cluster) => createCandidate(
      cluster,
      now,
      Boolean(needsRelevanceBackfill
        && cluster.existing_story?.published
        && cluster.existing_story?.retirement?.reason_code !== "MERGED_INTO_LIVING_FILE"),
      cluster.sources.some((source) => freshItemIds.has(source.item_id)),
    ));
  const freshIds = new Set(freshCandidates.map((candidate) => candidate.story_id));
  const retryableReasons = new Set(["AI_BUDGET_OR_BATCH_LIMIT", "AI_HOURLY_CALL_LIMIT", "AI_PROVIDER_UNAVAILABLE", "AI_DISABLED", "AI_BUDGET_BLOCKED", "AI_RUN_TIME_LIMIT", "AI_INPUT_TOO_LARGE", "SOURCE_INTEGRITY_OPEN"]);
  const retryCandidates = (storyStore.stories || [])
    .filter((story) => !isMerged(story))
    .filter((story) => (!story.published || story.pending_update || dueFollowupIds.has(story.story_id) || dueDeepeningIds.has(story.story_id)) && !freshIds.has(story.story_id))
    .filter((story) => {
      const reason = story.pending_update?.reason || story.pending_reason;
      const qualityErrors = story.pending_update?.quality_errors || story.quality_errors || [];
      const retryCount = story.pending_update?.quality_retry_count ?? story.quality_retry_count ?? 0;
      const retryAfter = story.pending_update?.quality_retry_after || story.quality_retry_after || null;
      const changedRules = story.ai_retry?.version !== AI_PROCESSING_VERSION
        && shouldRetryQualityGate(reason, qualityErrors, retryCount);
      return changedRules || dueFollowupIds.has(story.story_id) || dueDeepeningIds.has(story.story_id) || retryableReasons.has(reason) || shouldRetryQualityGate(reason, qualityErrors, retryCount, retryAfter, now);
    })
    .filter((story) => (story.pending_update?.sources || story.review_checkpoint?.sources || story.sources || []).some((source) => Date.parse(source.published_at || 0) <= nowDate.getTime() + futureToleranceMs))
    .map((story) => {
      const sources = (story.pending_update?.sources || story.review_checkpoint?.sources || story.sources).filter((source) => Date.parse(source.published_at || 0) <= nowDate.getTime() + futureToleranceMs);
      const candidate = {
        story_id: story.story_id,
        slug: story.slug,
        title: story.title,
        first_seen: story.first_seen,
        last_updated: story.pending_update?.detected_at || story.last_updated || now,
        sources,
        existing_story: story,
        reassessment: Boolean(story.pending_update?.reassessment || story.reassessment),
        fresh: Boolean(story.pending_update?.fresh || story.fresh),
        event_id: story.event_id || eventFingerprint(sources[0] || {}).id,
        event_first_seen_at: story.event_first_seen_at || story.first_seen,
        event_detected_at: story.event_detected_at || story.first_seen,
        followup_due: dueFollowupIds.has(story.story_id),
        deepening_due: dueDeepeningIds.has(story.story_id),
        evidence_groups: evidenceGroups(sources),
      };
      candidate.claims = claimLedgerFor(sources, candidate.story_id, now);
      candidate.preanalysis = preAnalyzeStory(candidate, now);
      candidate.topic = candidate.preanalysis.topics;
      candidate.content_hash = story.pending_update?.content_hash || storyContentHash(candidate);
      return candidate;
    });
  for (const candidate of freshCandidates) bumpCandidateFunnel(sourceFunnel, candidate, "story_candidates");
  for (const candidate of retryCandidates) bumpCandidateFunnel(sourceFunnel, candidate, "queue_retries");
  const clusters = attachRelatedTickerHistory([...freshCandidates, ...retryCandidates], storyStore.stories);
  for (const candidate of clusters) {
    candidate.followup_due = dueFollowupIds.has(candidate.story_id);
    candidate.deepening_due = dueDeepeningIds.has(candidate.story_id);
    const matchingEntry = {story:candidate,last_updated:candidate.last_updated,
      anchored_story:{...candidate,sources:anchoredSources(candidate)}};
    const alternativeItems = allItems.filter((item) => existingStoryMatch(item, matchingEntry, now) >= 0.64);
    const mergedSources = mergeSources(candidate.sources, alternativeItems);
    candidate.sources = reconcileKnownSourceAliases(mergedSources.map(source =>
      reconcileSourceIdentity(source, registry.sources.find(entry => entry.source_id === source.source_id), registry)));
    refreshUnpublishedDraftTitle(candidate);
    candidate.preanalysis = preAnalyzeStory(candidate, now);
    candidate.topic = candidate.preanalysis.topics;
    report.source_aliases_reconciled = Number(report.source_aliases_reconciled || 0) + mergedSources.length - candidate.sources.length;
    candidate.claims = claimLedgerFor(candidate.sources, candidate.story_id, now);
    candidate.evidence_groups = evidenceGroups(candidate.sources);
    candidate.content_hash = storyContentHash(candidate);
    candidate.currentness = { ...freshnessFor(candidate, now), checked_at: now, compared_current_feed_items: allItems.length, matching_current_feed_items: alternativeItems.length, followups_due: scheduledFollowups.filter((followup) => followup.story_id === candidate.story_id) };
    candidate.attention_impact_gap = candidate.preanalysis.internal_relevance_score >= 48 && candidate.evidence_groups.possible_independent_origins <= 2
      ? { status: "possible_gap_in_observed_sources", observed_origins: candidate.evidence_groups.possible_independent_origins, note: "Geringe beobachtete Quellenbreite, keine Aussage über die gesamte Medienaufmerksamkeit." } : null;
    candidate.source_integrity = sourceIntegrityForStory(candidate, registry, matchableStories, now);
    const event = newsroom.events[candidate.event_id] || { ...eventFingerprint(candidate.sources[0]), id: candidate.event_id, event_detected_at: candidate.event_detected_at };
    newsroom.events[candidate.event_id] = { ...event, story_id: candidate.story_id, relevance: candidate.preanalysis, attention_impact_gap: candidate.attention_impact_gap };
    for (const source of candidate.sources) if (source.source_item_id && newsroom.source_items[source.source_item_id]) newsroom.source_items[source.source_item_id].event_id = candidate.event_id;
  }
  report.story_clusters = freshCandidates.length;
  report.pending_stories_retried = retryCandidates.length;
  const month = now.slice(0, 7);
  state.budget_fx = options.budgetFx || await refreshBudgetFx(state.budget_fx, now, options.fetchFxImpl || fetch);
  const budgetPolicy = newsBudget(state.budget_fx, now, Number(process.env.WOEK_NEWS_MONTHLY_AI_BUDGET_EUR || 25));
  const budget = Math.min(budgetPolicy.technical_limit_usd, Number(process.env.WOEK_NEWS_MONTHLY_AI_BUDGET_USD || Infinity));
  report.budget_policy = budgetPolicy;
  const spendBefore = monthlyUsage(usage, month);
  const stage = budgetStage(spendBefore, budget);
  report.budget_stage = stage.stage;
  report.budget_throttle = { policy_version: "2.0", relevance_threshold: stage.threshold, max_stories_per_run: stage.max_stories_per_run ?? null, mode: stage.stage >= 3 ? "budget_stop" : stage.stage ? "bounded_throughput" : "normal" };
  report.monthly_spend_before_usd = Number(spendBefore.toFixed(6));
  report.monthly_budget_usd = budget;
  const eligible = clusters
    .filter((candidate) => candidate.reassessment || candidate.preanalysis.internal_relevance_score >= 30)
    .sort((a, b) => queuePriority(b, now) - queuePriority(a, now) || latestSourceDate(b.sources) - latestSourceDate(a.sources));
  report.locally_rejected = clusters.length - eligible.length;
  report.eligible_stories = eligible.length;
  for (const candidate of eligible) bumpCandidateFunnel(sourceFunnel, candidate, "eligible_stories");
  for (const candidate of clusters.filter((candidate) => !eligible.includes(candidate))) bumpCandidateFunnel(sourceFunnel, candidate, "local_rejections");
  newsroom.decisions ||= [];
  for (const candidate of clusters.filter((candidate) => !eligible.includes(candidate))) newsroom.decisions.push({ at: now, story_id: candidate.story_id, event_id: candidate.event_id, decision: "local_relevance_below_threshold", preanalysis: candidate.preanalysis });
  const byId = new Map((storyStore.stories || []).map((story) => [story.story_id, story]));
  // A local relevance rejection is a completed decision, not an AI-capacity
  // backlog. Preserve published text and history; changed source arrivals can
  // still reopen the same story through normal discovery.
  for (const candidate of clusters.filter(candidate => !eligible.includes(candidate))) {
    const existing = candidate.existing_story;
    if (!existing) continue;
    if (existing.published) {
      const { pending_update: _pendingUpdate, ...preserved } = existing;
      byId.set(candidate.story_id, { ...preserved, review_checkpoint: { ...reviewCheckpoint(candidate, now, "no_material_update"), reviewed_by: "local_relevance_filter" } });
    } else {
      byId.set(candidate.story_id, rejectedRecord(existing, now, ["LOCAL_RELEVANCE_BELOW_THRESHOLD"]));
    }
    report.local_queue_completed = Number(report.local_queue_completed || 0) + 1;
  }
  // Check size before assigning paid slots. A blocked file must never starve the
  // next eligible story or be mislabeled as an outage of the AI provider.
  const ready = eligible.filter(candidate => {
    // One durable retry clock for fresh feed arrivals, deepening and followups.
    // New evidence or changed processing rules may retry immediately.
    if (retryCoolingDown(candidate, now)) {
      report.ai_retries_cooling_down = Number(report.ai_retries_cooling_down || 0) + 1;
      return false;
    }
    if (candidate.source_integrity?.status !== "verified") {
      bumpCandidateFunnel(sourceFunnel, candidate, "source_integrity_holds");
      byId.set(candidate.story_id, pendingRecord(candidate, "SOURCE_INTEGRITY_OPEN", now, candidate.source_integrity?.issues?.map((issue) => issue.code) || ["SOURCE_INTEGRITY_OPEN"]));
      report.source_integrity_holds.push({ story_id: candidate.story_id, issues: candidate.source_integrity?.issues || [] });
      newsroom.decisions.push({ at: now, story_id: candidate.story_id, event_id: candidate.event_id, decision: "source_integrity_hold", issues: candidate.source_integrity?.issues || [] });
      return false;
    }
    if (canReuseReview(candidate, now)) {
      report.reviews_reused += 1;
      if (candidate.existing_story.review_checkpoint.outcome === "input_too_large") report.input_holds.push({ story_id: candidate.story_id, reason: "AI_INPUT_TOO_LARGE", reused: true });
      else {
        const { pending_update: _pendingUpdate, ...preserved } = candidate.existing_story;
        byId.set(candidate.story_id, preserved);
      }
      newsroom.decisions.push({ at: now, story_id: candidate.story_id, decision: "unchanged_review_reused", checked_at: candidate.existing_story.review_checkpoint.checked_at });
      return false;
    }
    try { buildAnalysisPrompt([candidate]); return true; }
    catch (error) {
      if (error.message !== "AI_INPUT_TOO_LARGE") throw error;
      byId.set(candidate.story_id, { ...pendingRecord(candidate, "AI_INPUT_TOO_LARGE", now, [error.message]), review_checkpoint: reviewCheckpoint(candidate, now, "input_too_large") });
      report.input_holds.push({ story_id: candidate.story_id, reason: error.message, input_chars: error.inputChars, input_budget: error.inputBudget });
      newsroom.decisions.push({ at: now, story_id: candidate.story_id, decision: "input_size_hold", reason: error.message });
      return false;
    }
  });
  const configuredMaxAiStories = Math.max(0, Number(process.env.WOEK_NEWS_MAX_AI_STORIES_PER_RUN || 2));
  const maxAiCallsPerHour = Math.max(0, Number(process.env.WOEK_NEWS_MAX_AI_CALLS_PER_HOUR || 4));
  const aiCallsInLastHour = aiRequestsInWindow(usage, now);
  const remainingAiCallsThisHour = Math.max(0, maxAiCallsPerHour - aiCallsInLastHour);
  const maxAiStories = Math.min(configuredMaxAiStories, remainingAiCallsThisHour);
  report.ai_hourly_limit = maxAiCallsPerHour;
  report.ai_calls_in_last_hour = aiCallsInLastHour;
  report.ai_calls_available_this_run = remainingAiCallsThisHour;
  const catchUp = catchUpQueueStage(stage, ready, usage, now, budget, spendBefore);
  report.catchup_control = catchUp.control;
  if (catchUp.control.enabled) report.budget_throttle = { ...report.budget_throttle,
    policy_version: "2.1", max_stories_per_run: 6, mode: "bounded_backlog_catchup" };
  const { selected, deferred } = partitionAiQueue(ready, catchUp.stage, maxAiStories, now);
  for (const candidate of selected) bumpCandidateFunnel(sourceFunnel, candidate, "ai_selected");
  const aiBatchSize = Math.max(1, Math.min(maxAiStories || 1, Number(process.env.WOEK_NEWS_AI_BATCH_SIZE || 2)));
  report.ai_stories = selected.length;
  report.ai_batch_size = aiBatchSize;
  report.ai_batches_planned = Math.ceil(selected.length / aiBatchSize);

  for (const candidate of deferred) {
    const deferredReason = aiDeferralReason(candidate, stage, remainingAiCallsThisHour);
    if (deferredReason === "AI_BUDGET_BLOCKED") report.budget_deferred = Number(report.budget_deferred || 0) + 1;
    bumpCandidateFunnel(sourceFunnel, candidate, "capacity_deferred");
    byId.set(candidate.story_id, pendingRecord(candidate, deferredReason, now));
    report.quality_holds.push({ story_id: candidate.story_id, reason: deferredReason });
  }

  const aiEnabled = String(process.env.WOEK_NEWS_AI_ENABLED ?? "true").toLowerCase() !== "false";
  if (selected.length && aiEnabled) {
    const aiDeadline = Date.now() + 7 * 60000;
    const sourceRegistryById = new Map(enabledSources.map((source) => [source.source_id, source]));
    for (let offset = 0; offset < selected.length; offset += aiBatchSize) {
      const batch = selected.slice(offset, offset + aiBatchSize);
      if (Date.now() >= aiDeadline) {
        for (const candidate of selected.slice(offset)) {
          byId.set(candidate.story_id, pendingRecord(candidate, "AI_RUN_TIME_LIMIT", now));
          report.quality_holds.push({ story_id: candidate.story_id, reason: "AI_RUN_TIME_LIMIT" });
        }
        break;
      }
      const requestBudget = catchUp.control.enabled ? budget * 0.95 : budget;
      if (spendBefore + report.estimated_cost_usd + NEWS_REQUEST_RESERVATION_USD > requestBudget) {
        for (const candidate of selected.slice(offset)) {
          byId.set(candidate.story_id, pendingRecord(candidate, "AI_BUDGET_BLOCKED", now));
          report.quality_holds.push({ story_id: candidate.story_id, reason: "AI_BUDGET_BLOCKED" });
        }
        break;
      }
      try {
        if (offset > 0) await (options.aiBatchDelayImpl || ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))))(
          Number(process.env.WOEK_NEWS_AI_BATCH_DELAY_MS || 2500),
        );
        const analysisBatch = await Promise.all(batch.map(async (candidate) => {
          candidate.verification_started_at = options.now ? now : new Date().toISOString();
          const articleUrls = new Set(articleSourceOrder(candidate).filter(source => {
            const registrySource = sourceRegistryById.get(source.source_id);
            return registrySource && sourceAccess(registrySource, "article").allowed;
          }).slice(0, 3).map(source => source.url));
          const sources = await Promise.all(candidate.sources.map(async (source) => {
            const registrySource = sourceRegistryById.get(source.source_id);
            if (!articleUrls.has(source.url)) return source;
            try {
              const result = await (options.fetchArticleImpl || fetchArticleExcerpt)(source, registrySource, registry.policy);
              report.article_excerpts_fetched += 1;
              return { ...source, article_excerpt: result.excerpt };
            } catch (_error) {
              report.article_excerpt_failures += 1;
              return source;
            }
          }));
          const currentness = { ...candidate.currentness, ...freshnessFor(candidate, now) };
          const enriched = { ...candidate, sources, currentness };
          enriched.media_trigger = detectMediaImpactTrigger(enriched);
          return enriched;
        }));
        const aiResult = await (options.callAiImpl || callWoekAi)(analysisBatch, {
          apiUrl: process.env.WOEK_NEWS_API_URL,
          authToken: process.env.WOEK_NEWS_ANALYSIS_TOKEN,
          timeoutMs: Number(process.env.WOEK_NEWS_AI_TIMEOUT_MS || 120000),
          attempts: Number(process.env.WOEK_NEWS_AI_ATTEMPTS_PER_STORY || 1),
        });
        report.ai_provider_successes += 1;
        report.provider ||= aiResult.provider;
        report.model ||= aiResult.model;
        report.ai_calls += Number(aiResult.request_attempts || 1);
        report.prompt_chars_sent += Number(aiResult.prompt_chars || 0);
        report.optional_visuals_deferred = Number(report.optional_visuals_deferred || 0) + Number(Boolean(aiResult.optional_visuals_deferred));
        report.ai_batches_completed += 1;
        const estimated = costFromUsage(aiResult, estimateUsage(aiResult.prompt_chars, aiResult.answer_chars, aiResult.model, modelRates(aiResult.model)));
        report.input_tokens += estimated.input_tokens;
        report.output_tokens += estimated.output_tokens;
        report.estimated_cost_usd = Number((report.estimated_cost_usd + estimated.estimated_cost_usd).toFixed(6));
        report.token_source = estimated.token_source;
        for (const candidate of batch) {
          bumpCandidateFunnel(sourceFunnel, candidate, "items_full_analyzed");
          const sourceCount = Math.max(1, new Set((candidate.sources || []).map((source) => source.source_id).filter(Boolean)).size);
          const share = 1 / Math.max(1, batch.length) / sourceCount;
          bumpCandidateFunnel(sourceFunnel, candidate, "ai_input_tokens", estimated.input_tokens * share);
          bumpCandidateFunnel(sourceFunnel, candidate, "ai_output_tokens", estimated.output_tokens * share);
          bumpCandidateFunnel(sourceFunnel, candidate, "estimated_ai_cost", estimated.estimated_cost_usd * share);
        }
        const analyses = new Map(aiResult.analyses.map((analysis) => [analysis.story_id, analysis]));
        for (const candidate of batch) {
          const analysis = analyses.get(candidate.story_id);
          const mediaExplanationBeforeSanitizing = analysis?.media_impact?.public_explanation || analysis?.media_impact?.editorial_assessment || '';
          if (analysis) normalizeEditorialDecision(analysis);
          if (analysis) normalizeAnalysisParagraphs(analysis);
          const analysisCandidate = analysisBatch.find((item) => item.story_id === candidate.story_id) || candidate;
          if (analysis) sanitizeAnalysisVisuals(analysis, analysisCandidate, report);
          if (analysis) {
            sanitizeAnalysisMediaImpact(analysis, analysisCandidate, report, now);
            if (analysis.media_trigger?.relevant) report.media_checks_triggered += 1;
            else report.media_checks_skipped += 1;
            const mediaUsage = estimateMediaUsage(analysis.media_impact, modelRates(aiResult.model));
            report.media_check_tokens += mediaUsage.input_tokens + mediaUsage.output_tokens;
            report.media_check_cost_usd = Number((report.media_check_cost_usd + mediaUsage.estimated_cost_usd).toFixed(6));
          } else if (analysisCandidate.media_trigger?.relevant) report.media_checks_triggered += 1;
          else report.media_checks_skipped += 1;
          if (analysis) resolveEvidenceReferences(analysis, analysisCandidate, aiResult.supplied_evidence_ids?.[candidate.story_id] || []);
          if (analysis) normalizeEvidenceExcerpts(analysis, analysisCandidate);
          const errors = analysis ? validateAnalysis(analysis, analysisCandidate) : ["AI_ANALYSIS_MISSING"];
          // Check the durable representation before accepting a publication.
          // A single transition defect must not invalidate the whole run later.
          let nextPublished;
          if (!errors.length) {
            nextPublished = publishedRecord(analysisCandidate, analysis, aiResult, options.now ? now : new Date().toISOString());
            errors.push(...validateAnalysis({ source_summary: nextPublished.source_summary, ...nextPublished.analysis }, nextPublished, { validateSourceSummaryNumbers: false, persisted: true }));
          }
          newsroom.decisions.push({ at: now, story_id: candidate.story_id, event_id: candidate.event_id, decision: errors.length ? "held_or_rejected" : "publish", publication_recommendation: typeof analysis?.publication_recommendation === "boolean" ? analysis.publication_recommendation : null, rejection_code: analysis?.rejection?.code || null, errors, diagnostics: errors.length ? analysisValidationDiagnostics(analysis, mediaExplanationBeforeSanitizing) : null, rationale: analysis?.rejection?.reason || analysis?.publication_gate?.rationale || null });
          if (errors.length) {
            const noUpdate = errors.includes("AI_DUPLICATE_WITHOUT_UPDATE")
              && errors.every(error => ["AI_PUBLICATION_NOT_RECOMMENDED", "AI_DUPLICATE_WITHOUT_UPDATE"].includes(error));
            if (candidate.existing_story?.published && (!candidate.reassessment || noUpdate) && errors.every((error) => EDITORIAL_REJECTION_ERRORS.has(error))) {
              bumpCandidateFunnel(sourceFunnel, candidate, "editorial_rejections");
              const { pending_update: _pendingUpdate, ...preserved } = candidate.existing_story;
              // Cache only a well-formed editorial no-update decision, never a
              // technical failure or an insufficient-evidence retry.
              if (["no_new_information", "not_material", "superseded"].includes(analysis?.rejection?.code)) preserved.review_checkpoint = reviewCheckpoint(candidate, now, "no_material_update");
              if (candidate.deepening_due) {
                preserved.deepening_checks = Number(preserved.deepening_checks || 0) + 1;
                // No repeated paid rewording of unchanged evidence. Three scheduled
                // attempts, then new source arrivals can reactivate the same case.
                preserved.deepening_due_at = preserved.deepening_checks < 3 ? nextDeepeningCheckpoint(now) : null;
              }
              byId.set(candidate.story_id, { ...preserved, followups: (preserved.followups || []).map((followup) => dueFollowupIds.has(candidate.story_id) ? { ...followup, last_checked_at: now, last_check_result: "no_verified_material_update", follow_up_date: new Date(Date.parse(now) + 7 * 86400000).toISOString() } : followup) });
              report.quality_holds.push({ story_id: candidate.story_id, reason: "NO_VERIFIED_MATERIAL_UPDATE", errors });
              continue;
            }
            if (shouldRetireAfterReassessment(candidate, errors)) {
              bumpCandidateFunnel(sourceFunnel, candidate, "editorial_rejections");
              byId.set(candidate.story_id, retiredRecord(candidate, now, errors));
              report.retired_stories += 1;
              report.quality_holds.push({ story_id: candidate.story_id, reason: "FILTER_REASSESSMENT_NOT_MATERIAL", errors });
              continue;
            }
            byId.set(candidate.story_id, pendingRecord(candidate, "QUALITY_GATE_FAILED", now, errors));
            if (shouldRetryQualityGate("QUALITY_GATE_FAILED", errors, Number(candidate.existing_story?.pending_update?.quality_retry_count ?? candidate.existing_story?.quality_retry_count ?? 0))) bumpCandidateFunnel(sourceFunnel, candidate, "technical_retries");
            else bumpCandidateFunnel(sourceFunnel, candidate, "editorial_rejections");
            report.quality_holds.push({ story_id: candidate.story_id, reason: "QUALITY_GATE_FAILED", errors });
            continue;
          }
          const wasPublished = Boolean(candidate.existing_story?.published);
          const wasListed = candidate.existing_story?.listed !== false;
          byId.set(candidate.story_id, nextPublished);
          changedStoryIds.add(candidate.story_id);
          report.published_stories += wasPublished ? 0 : 1;
          report.updated_stories += wasPublished ? 1 : 0;
          bumpCandidateFunnel(sourceFunnel, candidate, wasPublished ? "updated_stories" : "published_stories");
          report.reactivated_stories += wasPublished && !wasListed ? 1 : 0;
        }
      } catch (error) {
        report.ai_calls += Number(error?.requestAttempts ?? 1);
        report.estimated_cost_usd = Number((report.estimated_cost_usd + (error.providerNotCalled ? 0 : NEWS_REQUEST_RESERVATION_USD * Number(error?.requestAttempts ?? 1))).toFixed(6));
        if (!error.providerNotCalled) report.token_source = "includes_conservative_failed_request_reservations";
        const reason = sanitizeError(error);
        if (reason === "AI_INPUT_TOO_LARGE" && error?.requestAttempts === 0) {
          for (const candidate of batch) {
            bumpCandidateFunnel(sourceFunnel, candidate, "technical_retries");
            byId.set(candidate.story_id, { ...pendingRecord(candidate, "AI_INPUT_TOO_LARGE", now, [reason]), review_checkpoint: reviewCheckpoint(candidate, now, "input_too_large") });
            report.input_holds.push({ story_id: candidate.story_id, reason, input_chars: error.inputChars, input_budget: error.inputBudget });
          }
          continue;
        }
        if (OUTPUT_FORMAT_ERRORS.has(reason)) {
          report.ai_output_invalid += batch.length;
          for (const candidate of batch) {
            bumpCandidateFunnel(sourceFunnel, candidate, "technical_retries");
            byId.set(candidate.story_id, pendingRecord(candidate, "AI_OUTPUT_INVALID", now, [reason]));
            report.quality_holds.push({ story_id: candidate.story_id, reason: "AI_OUTPUT_INVALID", errors: [reason] });
          }
          continue;
        }
        const budgetBlocked = reason === 'AI_BUDGET_EXHAUSTED';
        const providerRateLimited = /AI_PROVIDER_ERROR:429/.test(reason);
        const rateLimited = budgetBlocked || providerRateLimited;
        const deferred = rateLimited ? selected.slice(offset) : batch;
        if (budgetBlocked) report.budget_blocked = true;
        else {
          report.ai_provider_failures += 1;
          report.ai_provider_errors.push({ batch_offset: offset, error: reason });
          report.failed_batch_offset = offset;
        }
        for (const candidate of deferred) {
          const holdReason = budgetBlocked ? 'AI_BUDGET_BLOCKED' : providerRateLimited ? 'AI_HOURLY_CALL_LIMIT' : 'AI_PROVIDER_UNAVAILABLE';
          bumpCandidateFunnel(sourceFunnel, candidate, rateLimited ? "capacity_deferred" : "technical_retries");
          byId.set(candidate.story_id, pendingRecord(candidate, holdReason, now, [reason]));
          report.quality_holds.push({ story_id: candidate.story_id, reason: holdReason });
        }
        // Ein ausgeschöpftes Client-Limit sperrt alle weiteren Aufrufe dieses
        // Laufs. Bei 5xx/Timeout ist dagegen nur die betroffene Story vertagt;
        // die übrigen vier reservierten Slots dürfen unabhängig weiterarbeiten.
        if (rateLimited) break;
      }
    }
  } else {
    for (const candidate of selected) {
      byId.set(candidate.story_id, pendingRecord(candidate, aiEnabled ? "AI_BUDGET_BLOCKED" : "AI_DISABLED", now));
      report.quality_holds.push({ story_id: candidate.story_id, reason: aiEnabled ? "AI_BUDGET_BLOCKED" : "AI_DISABLED" });
    }
  }

  // Enhancement failures cannot enter the AI-error catch above or suppress a
  // validated article. Drain a bounded image queue without redoing news AI.
  report.title_images = [];
  report.title_images_changed = 0;
  if (!options.dryRun) {
    const prepareImage = options.prepareTitleImage || createTitleImagePipeline();
    const pendingImages = [...byId.values()].filter((story) => story.published && story.listed !== false && !changedStoryIds.has(story.story_id) && story.title_image?.retry_after && Date.parse(story.title_image.retry_after) <= nowDate.getTime()).sort((a, b) => Date.parse(a.title_image.retry_after) - Date.parse(b.title_image.retry_after)).slice(0, IMAGE_CONFIG.max_generations_per_run);
    const imageIds = [...changedStoryIds, ...pendingImages.map(story => story.story_id)];
    const imageDeadline = Date.now() + 4 * 60000;
    for (const storyId of imageIds) {
      const story = byId.get(storyId);
      if (Date.now() >= imageDeadline) {
        story.title_image = { ...story.title_image, retry_after: new Date(Date.now() + 15 * 60000).toISOString() };
        report.title_images.push({ story_id: storyId, status: "deferred", reason: "IMAGE_RUN_TIME_LIMIT" });
        continue;
      }
      try {
        const result = await prepareImage(story);
        if (result.title_image) {
          if (JSON.stringify(publicTitleImage(story.title_image)) !== JSON.stringify(publicTitleImage(result.title_image))) report.title_images_changed += 1;
          story.title_image = result.title_image;
        }
        report.title_images.push(result.report);
      } catch {
        report.title_images.push({ story_id: storyId, status: "fallback", fallback_reason: "TITLE_IMAGE_UNAVAILABLE" });
      }
    }
  }
  report.completed_at = new Date().toISOString();
  const currentItems = allItems.filter((item) => Date.parse(item.published_at || 0) <= nowDate.getTime() + futureToleranceMs);
  report.latest_source_timestamp = latestSourceDate(currentItems) ? new Date(latestSourceDate(currentItems)).toISOString() : null;
  report.ai_provider_degraded = aiProviderCoverageDegraded(report);
  if (report.ai_provider_degraded) report.ai_error = report.ai_provider_errors.at(-1)?.error || "AI_PROVIDER_DEGRADED";
  report.ai_calls_remaining_this_hour = Math.max(0, maxAiCallsPerHour - aiCallsInLastHour - report.ai_calls);
  report.public_changed = [
    report.published_stories,
    report.updated_stories,
    report.retired_stories,
    report.reactivated_stories,
    report.title_images_changed,
  ].some((count) => Number(count || 0) > 0);
  state.last_attempted_run = now;
  state.relevance_filter_version = RELEVANCE_FILTER_VERSION;
  for (const [storyId, story] of byId) {
    if (story.published || story.listed === false) continue;
    const reason = story.pending_update?.reason || story.pending_reason;
    const qualityErrors = story.pending_update?.quality_errors || story.quality_errors || [];
    const retryCount = story.pending_update?.quality_retry_count ?? story.quality_retry_count ?? 0;
    if (reason === "QUALITY_GATE_FAILED"
      && !shouldRetryQualityGate(reason, qualityErrors, retryCount)
      && qualityErrors.some((error) => EDITORIAL_REJECTION_ERRORS.has(error))) {
      byId.set(storyId, rejectedRecord(story, now, qualityErrors));
    }
  }
  state.pending_story_ids = [...byId.values()].filter((story) => !isMerged(story) && ((!story.published && story.listed !== false) || story.pending_update)).map((story) => story.story_id);
  report.pending_story_count = state.pending_story_ids.length;
  const remainingPendingIds = new Set(state.pending_story_ids);
  report.queue_completed = [...pendingStoryIdsBefore].filter(id => !remainingPendingIds.has(id)).length;
  report.queue = queueSnapshot([...byId.values()], now, pendingStoryCountBefore, { budgetBlocked: report.budget_blocked || report.budget_stage >= 3 });
  report.queue_status = report.queue.status;
  report.source_funnel = finalizeSourceFunnel(sourceFunnel);
  report.source_health = registry.sources.map((source) => sourceHealth(source, state, now));
  report.source_coverage_status = isolatedSourceThrottleWithRecentCoverage(report)
    ? "isolated_throttle_with_recent_coverage" : sourceCoverageDegraded(report) ? "degraded" : "ok";
  const sourceHealthDegraded = report.source_health.some((source) => ["disturbed", "stale"].includes(source.status));
  report.operational_status = report.ai_provider_degraded || sourceCoverageDegraded(report) || sourceHealthDegraded ? "degraded" : "ok";
  report.editorial_status = report.queue.editorial || report.source_integrity_holds.length ? "holds" : "clear";
  report.status = report.operational_status;
  if (report.status === "ok") state.last_successful_run = now;
  report.coverage = coverageReport(enabledSources, [...byId.values()]);
  report.regional_coverage = regionalCoverage(registry, state, now);
  report.freshness = [...byId.values()].filter((story) => story.listed !== false).map((story) => ({ story_id: story.story_id, published: Boolean(story.published), ...freshnessFor(story, now) }));
  report.freshness_warnings = report.freshness.filter((story) => story.freshness_warning);
  report.followups_due = dueFollowups([...byId.values()].filter((story) => !isMerged(story)), now);
  newsroom.updated_at = now;
  newsroom.decisions = newsroom.decisions.filter((decision) => Date.parse(decision.at) >= pruneBefore).slice(-20000);
  newsroom.event_sources = Object.values(newsroom.source_items).map((item) => ({ event_id: item.event_id, source_item_id: item.source_item_id, source_id: item.source_id, role: item.source_role }));
  newsroom.discovery_candidates = [...new Map([...newsroom.discovery_candidates, ...discoveryCandidates(allItems, enabledSources, now)].map((candidate) => [candidate.id, candidate])).values()];
  storyStore.updated_at = now;
  storyStore.stories = [...byId.values()].sort((a, b) => Date.parse(b.last_updated || 0) - Date.parse(a.last_updated || 0));
  const latestPublishedChange = storyStore.stories
    .filter((story) => story.published)
    .reduce((latest, story) => Math.max(latest, Date.parse(story.updated_at || story.last_updated || story.published_at || 0) || 0), 0);
  if (report.public_changed) storyStore.public_updated_at = now;
  else if (!storyStore.public_updated_at) storyStore.public_updated_at = latestPublishedChange ? new Date(latestPublishedChange).toISOString() : now;
  usage.runs.push({
    processing_version: AI_PROCESSING_VERSION,
    run_id: `news-run-${sha256(now).slice(0, 12)}`,
    started_at: now,
    completed_at: report.completed_at,
    berlin_slot: report.berlin_slot,
    counts: {
      feed_entries_fetched: report.feed_entries_fetched,
      feed_entries_new: report.feed_entries_new,
      feed_entries_updated: report.feed_entries_updated,
      feed_entries_backfilled: report.feed_entries_backfilled,
      feed_entries_deduplicated: report.feed_entries_deduplicated,
      story_clusters: report.story_clusters,
      locally_rejected: report.locally_rejected,
      eligible_stories: report.eligible_stories,
      ai_stories: report.ai_stories,
      ai_requests: report.ai_calls,
      reviews_reused: report.reviews_reused,
      ai_retries_cooling_down: report.ai_retries_cooling_down || 0,
      input_holds: report.input_holds.length,
      prompt_chars_sent: report.prompt_chars_sent,
      media_checks_triggered: report.media_checks_triggered,
      media_checks_skipped: report.media_checks_skipped,
      media_checks_ai_promoted: report.media_checks_ai_promoted,
      media_check_tokens: report.media_check_tokens,
      self_frame_rewrites: report.self_frame_rewrites,
      source_integrity_holds: report.source_integrity_holds.length,
      published_stories: report.published_stories,
      updated_stories: report.updated_stories,
      queue_completed: report.queue_completed,
    },
    ai: report.ai_calls ? {
      requests: report.ai_calls,
      provider: report.provider,
      model: report.model,
      input_tokens: report.input_tokens,
      output_tokens: report.output_tokens,
      estimated_cost_usd: report.estimated_cost_usd,
      token_source: report.token_source || "unavailable",
      media_check_tokens: report.media_check_tokens,
      media_check_cost_usd: report.media_check_cost_usd,
    } : null,
    source_failures: report.source_failures,
    quality_holds: report.quality_holds.length,
    queue: report.queue,
    source_funnel: report.source_funnel,
  });
  usage.runs = retainUsageHistory(usage.runs, now);
  report.cost_monitoring = operatingCostSummary(usage, state.cost_monitoring_started_at, state.budget_fx, report.completed_at);

  if (!options.dryRun) {
    writeJson(files.state, state);
    writeJson(files.stories, storyStore);
    writeJson(files.usage, usage);
    writeJson(files.report, report);
    writeJson(files.newsroom, newsroom);
    buildNewsSite();
  }
  options.captureState?.({ state, storyStore, usage, newsroom });
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await runWirkungsticker({ dryRun: process.argv.includes("--dry-run") });
  console.log(JSON.stringify(report, null, 2));
}
