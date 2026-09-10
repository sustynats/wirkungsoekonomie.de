import { buildAnalysisPrompt, sanitizeFeedText, sha256, suppliedEvidenceIds } from '../lib.mjs';
import { assertAutomatable } from '../manual-policy.mjs';
import { visualContext } from './visual.mjs';
import { eventCompatibility, evidenceGroups, resolveEvidenceReferences, normalizeEvidenceExcerpts } from '../newsroom.mjs';
import { prepareReviewedStory } from '../publish-reviewed.mjs';
import { inputSchema, outputSchema, assertSchema, hash, safeUrl } from './contract.mjs';

export function bridgeInput(candidate, now, { testOnly = false, canonicalFingerprint = candidate.event_id || candidate.story_id, stories = [] } = {}) {
  assertAutomatable(candidate); assertAutomatable(candidate.existing_story);
  const existing = candidate.existing_story;
  const firstSeen = candidate.event_first_seen_at || candidate.first_seen || candidate.event_detected_at;
  if (!firstSeen) throw new Error('BRIDGE_FIRST_SEEN_REQUIRED');
  const summary = sanitizeFeedText(candidate.source_summary || candidate.sources[0]?.summary || '', 20000);
  const sources = candidate.sources.map(s => ({ source_id: s.source_id, publisher: s.publisher || s.source_id,
    title: sanitizeFeedText(s.title, 1000), url: safeUrl(s.url), published_at: s.published_at || null,
    retrieved_at: s.retrieved_at || s.fetched_at || now, source_type: s.source_type || 'news', is_primary_source: Boolean(s.primary_source),
    // Public excerpts already fetched under the production source-access policy.
    // Never copy credentials, whole source objects or paywall HTML into the queue.
    text: '', excerpt: sanitizeFeedText(s.article_excerpt || s.summary || '', 20000), language: s.language || 'de' }));
  const inputHash = hash({ canonicalFingerprint, content_hash: candidate.content_hash,
    source_versions: candidate.sources.map(s => [s.source_id, s.url, s.content_hash, hash(s.article_excerpt || s.summary || '')]).sort(),
    analysis_hash: existing?.published ? sha256(JSON.stringify(existing.analysis)) : null });
  const stamp = new Date(firstSeen).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const jobId = `wt_${stamp}_${hash({ canonicalFingerprint, firstSeen, inputHash, testOnly }).slice(0, 24)}`;
  const input = {
    schema_version: '1.0', job_id: jobId, created_at: now, processing_mode: 'dropbox_chatgpt_bridge',
    job_type: existing?.published ? 'story_update' : 'new_story', input_hash: inputHash, test_only: testOnly,
    event: { canonical_title: sanitizeFeedText(candidate.title, 1000), event_summary_machine: summary,
      first_seen_at: new Date(firstSeen).toISOString(), latest_seen_at: now,
      category: String(candidate.preanalysis?.event_category || candidate.topic?.[0] || ''),
      region: [].concat(candidate.event_geography || []).join(', '), entities: candidate.preanalysis?.entities || [],
      keywords: candidate.preanalysis?.keywords || [], canonical_fingerprint: canonicalFingerprint || candidate.story_id },
    sources,
    discovery: { source_count: sources.length, independent_source_count: evidenceGroups(candidate.sources).possible_independent_origins || 0,
      duplicate_group: null, existing_story_candidates: existing ? [existing.story_id] : [],
      importance_signals: [`local_relevance:${candidate.preanalysis?.internal_relevance_score ?? 'unknown'}`],
      freshness_minutes: Math.max(0, (Date.parse(now) - Date.parse(firstSeen)) / 60000) },
    requested_output: { publication_candidate: true, fact_check: true, consequence_check: true, frame_check: true, impact_analysis: true, title_image: true },
    visual_context: visualContext(candidate, stories),
    wirkungsticker: { story_id: candidate.story_id, expected_content_hash: candidate.content_hash,
      expected_analysis_hash: existing?.published ? sha256(JSON.stringify(existing.analysis)) : null,
      analysis_prompt: buildAnalysisPrompt([candidate]), governance_version: '1.7', output_extension: 'wirkungsticker.analysis' },
  };
  return assertSchema(inputSchema, input);
}

export function sameBridgeEvent(a, b) {
  return Boolean(a.event_id && a.event_id === b.event_id) || a.sources.some(left => b.sources.some(right => eventCompatibility(left, right).same_event));
}

export function adaptOutput(output, job, registry, stories, now) {
  assertSchema(outputSchema, output);
  if (output.job_id !== job.input.job_id || output.input_hash !== job.input.input_hash) throw new Error('BRIDGE_JOB_BINDING_MISMATCH');
  if (Date.parse(output.processed_at) < Date.parse(job.input.created_at) || Date.parse(output.processed_at) > Date.parse(now) + 300000) throw new Error('BRIDGE_OUTPUT_TIME_INVALID');
  const decision = output.decision.status;
  if (['hold', 'reject'].includes(decision)) return { decision, record: null };
  if (!output.editorial.publishable || output.quality.needs_human_review) throw new Error('BRIDGE_HUMAN_REVIEW_REQUIRED');
  if (!output.wirkungsticker?.analysis) throw new Error('BRIDGE_PRODUCTION_ANALYSIS_REQUIRED');
  const id = decision === 'merge' ? output.decision.merge_into : job.candidate.story_id;
  const target = stories.find(s => s.story_id === id);
  if (!target || target.retired || target.redirect_to || target.listed === false) throw new Error('BRIDGE_TARGET_INVALID');
  assertAutomatable(target);
  if (decision === 'merge' && (!target.published || !sameBridgeEvent(job.candidate, target))) throw new Error('BRIDGE_MERGE_EVENT_MISMATCH');
  const expected = decision === 'merge' ? output.wirkungsticker.merge_expected_content_hash : job.input.wirkungsticker.expected_content_hash;
  const currentHash = target.pending_update?.content_hash || target.content_hash;
  if (currentHash !== expected) throw new Error('BRIDGE_STALE_SOURCE');
  const analysisHash = decision === 'merge' ? output.wirkungsticker.merge_expected_analysis_hash : job.input.wirkungsticker.expected_analysis_hash;
  if (target.published && sha256(JSON.stringify(target.analysis)) !== analysisHash) throw new Error('BRIDGE_STALE_ANALYSIS');
  const declared = new Set(output.sources.map(s => `${s.source_id}\n${safeUrl(s.url)}`));
  const sourcePool = [...job.candidate.sources, ...(decision === 'merge' ? target.sources : [])];
  if (!declared.size || [...declared].some(key => !sourcePool.some(s => `${s.source_id}\n${safeUrl(s.url)}` === key))) throw new Error('BRIDGE_UNBOUND_SOURCE');
  let analysis = structuredClone(output.wirkungsticker.analysis);
  // The native prompt wraps its response in analyses; accept exactly this job.
  if (Array.isArray(analysis.analyses)) {
    if (analysis.analyses.length !== 1 || analysis.analyses[0]?.story_id !== job.candidate.story_id) throw new Error('BRIDGE_ANALYSIS_BINDING_MISMATCH');
    analysis = analysis.analyses[0];
  }
  // Do not manufacture scores, causal evidence or an MPD direction from a label.
  if (output.story.short_summary !== analysis.summary || output.story.detailed_summary !== analysis.source_summary) throw new Error('BRIDGE_SUMMARY_MISMATCH');
  // Same lossless evidence-ID expansion as the existing API publication path.
  // Only IDs actually supplied in this immutable prompt can resolve.
  resolveEvidenceReferences(analysis, job.candidate, suppliedEvidenceIds(job.input.wirkungsticker.analysis_prompt)[job.candidate.story_id] || []);
  normalizeEvidenceExcerpts(analysis, job.candidate);
  const review = {
    review_type: target.published ? 'story_correction' : 'story_draft_review', story_id: id,
    expected_content_hash: target.content_hash, ...(target.published ? { expected_analysis_hash: analysisHash } : {}),
    title: sanitizeFeedText(output.story.headline, 500), topics: [output.editorial.category].filter(Boolean),
    research_checked_at: output.processed_at, review_basis: `ChatGPT Dropbox Bridge; ${job.input.job_id}; ${output.decision.reason}`,
    sources: sourcePool.filter(s => declared.has(`${s.source_id}\n${safeUrl(s.url)}`)), analysis,
    ...(target.published ? { correction_note: output.wirkungsticker.correction_note } : {}),
  };
  if (target.published && !review.correction_note) throw new Error('BRIDGE_CORRECTION_NOTE_REQUIRED');
  const result = prepareReviewedStory(review, registry, stories, now);
  if (result.errors.length) throw Object.assign(new Error('BRIDGE_PUBLICATION_GATE_FAILED'), { issues: result.errors });
  result.record.bridge_import = { job_id: job.input.job_id, output_hash: hash(output), imported_at: now };
  return { decision, record: result.record, unchanged: result.unchanged, mergeFrom: decision === 'merge' ? job.candidate.story_id : null };
}
