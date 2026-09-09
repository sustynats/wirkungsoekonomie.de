import fs from "node:fs";
import { backgroundBatchEligibility, batchStoryFingerprint, batchWorkPriority, createNewsBatchClient, BATCH_RESERVATION_USD } from './batch.mjs';
import { editorialContentSnapshot } from "./editorial-judgment.mjs";
import { commissionedReviewState, isCommissionedAnalysis } from "./systemic-analysis.mjs";
import { isManualEditorial } from "./manual-policy.mjs";
import { applyEditorialRepair, buildEditorialRepairPrompt, editorialQualityExhausted, editorialResearchFingerprint, isEditorialQualityFailure, EDITORIAL_ECONOMY_VERSION } from './editorial-economy.mjs';
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildNewsSite } from "./build.mjs";
import { buildCaseFiles } from "./case-files.mjs";
import { callWoekAi, estimateUsage, monthlyUsage, sha256, storySimilarity } from "./lib.mjs";
import { eventCompatibility } from "./newsroom.mjs";
import { loadNewsRegistry } from "./registry.mjs";
import { sourceIntegrityForStory } from "./source-integrity.mjs";
import { NEWS_REQUEST_RESERVATION_USD, costFromUsage, failedRequestCost, modelRates, newsBudget } from "./budget.mjs";
import {
  EDITORIAL_ANALYSIS_VERSION, buildEditorialAnalysisPrompt, editorialAnalysisAssessment,
  editorialAnalysisValidationErrors, editorialSlug, editorialSourceRef, sanitizeEditorialAnalysis,
  editorialSources, withEditorialResearch,
} from "./editorial-analysis.mjs";

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function read(file, fallback = null) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

function writeAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, file);
}

function publicCandidate(assessment, story, existing) {
  return {
    story_id: story.story_id, story_slug: story.slug, story_title: story.title,
    editorial_analysis_score: assessment.editorial_analysis_score,
    analysis_gain: assessment.analysis_gain,
    factors: assessment.factors,
    factor_status: assessment.factor_status,
    evidence_gate: assessment.evidence_gate,
    fingerprint: assessment.fingerprint,
    status: commissionedReviewState(existing, story)?.status || (existing && existing.source_fingerprint === assessment.fingerprint ? "published" : assessment.status),
    ...(commissionedReviewState(existing, story) ? { review: commissionedReviewState(existing, story) } : {}),
    analysis_id: existing?.analysis_id || null,
  };
}

function existingForStory(store, storyId) {
  return (store.analyses || []).find((analysis) => analysis.story_id === storyId && analysis.status === "published");
}

const GENERIC_SUBJECT_WORDS = new Set("aktuell aktuelle bericht berichtet meldung meldet nachricht neu neue neuen einer eines einem politik wirtschaft gesellschaft mensch planet demokratie wirkung folgen analyse system systemisch systemische systemischen bedeutung entscheidung kritisch kritische infrastruktur warum was wie mehr weniger aktuell current report reports news politics economy society impact analysis systemic decision critical infrastructure workers rescued after from with into about".split(" "));
function subjectIdentityTokens(value) {
  return [...new Set(String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]{5,}/g) || [])]
    .filter((word) => !GENERIC_SUBJECT_WORDS.has(word));
}

function sameEditorialSubject(left, right) {
  const compatibility = eventCompatibility(
    { ...left, summary: left.source_summary, published_at: left.last_updated },
    { ...right, summary: right.source_summary, published_at: right.last_updated },
  );
  const leftIdentity = subjectIdentityTokens(left.title);
  const rightIdentity = subjectIdentityTokens(right.title);
  const sharedIdentity = leftIdentity.filter((word) => rightIdentity.includes(word)).length;
  if (compatibility.same_event) return compatibility.reason === "shared_document_reference" || sharedIdentity >= 2;
  return compatibility.related && storySimilarity(left.title, right.title) >= 0.5 && sharedIdentity >= 2;
}

function researchSourceFromItem(item, registrySource) {
  return {
    ...item,
    source_id: registrySource.source_id,
    publisher_id: registrySource.publisher_id || registrySource.source_id,
    publisher: registrySource.name,
    source_type: registrySource.source_type,
    publisher_kind: registrySource.publisher_kind,
    source_role: registrySource.source_role || (registrySource.primary_source ? "institutional_statement" : "journalistic_report"),
    primary_source: Boolean(registrySource.primary_source),
    source_priority: Number(registrySource.priority || item.source_priority || 0),
    source_topic: registrySource.topic,
    language: registrySource.language || item.language,
    geography: registrySource.geography || item.geography,
    research_lane: registrySource.research_lane || item.research_lane,
    requires_corroboration: Boolean(registrySource.requires_corroboration),
    source_published_at: item.source_published_at || item.published_at,
    provenance: { ...(item.provenance || {}), origin: `publisher:${registrySource.publisher_id || registrySource.source_id}`, basis: "registered_open_research_pool" },
    editorial_research_source: true,
  };
}

export function enrichEditorialResearchSubjects(subjects, newsroom, registry, now = new Date().toISOString()) {
  const registryById = new Map((registry?.sources || []).filter((source) => source.enabled).map((source) => [source.source_id, source]));
  const pool = Object.values(newsroom?.source_items || {}).filter((item) => registryById.has(item.source_id) && item.url && item.title && item.published_at);
  let added = 0;
  const enriched = subjects.map((story) => {
    const initial = editorialAnalysisAssessment(story);
    if (!initial.candidate || initial.evidence_gate.passed) return story;
    const existingUrls = new Set((story.sources || []).map((source) => source.url));
    const baseDate = Date.parse(story.last_updated || story.published_at || now);
    const matches = pool.flatMap((item) => {
      if (existingUrls.has(item.url) || Math.abs(Date.parse(item.published_at) - baseDate) > 21 * 86400000) return [];
      const titleFit = storySimilarity(item.title, story.title);
      const contextFit = storySimilarity(`${item.title} ${item.summary || ""}`, `${story.title} ${story.source_summary || ""}`);
      const compatibility = eventCompatibility(item, { ...story, summary: story.source_summary, published_at: story.last_updated });
      if (!compatibility.same_event && !(titleFit >= 0.28 && contextFit >= 0.18) && !(titleFit >= 0.2 && contextFit >= 0.24)) return [];
      const source = researchSourceFromItem(item, registryById.get(item.source_id));
      // Validate the newly discovered document itself. Existing story sources
      // have already passed the publication gate and are not reinterpreted by
      // this research-only expansion.
      const integrity = sourceIntegrityForStory({ ...story, sources: [source] }, registry, [], now);
      if (integrity.status !== "verified") return [];
      return [{ source, score: Number(compatibility.same_event) * 2 + titleFit + contextFit }];
    }).sort((left, right) => right.score - left.score).slice(0, 6);
    if (!matches.length) return story;
    added += matches.length;
    return { ...story, sources: [...(story.sources || []), ...matches.map((match) => match.source)], editorial_research_sources_added: matches.length };
  });
  return { subjects: enriched, added };
}

function editorialSubjects(activeStories) {
  const grouping = buildCaseFiles(activeStories);
  const originals = new Map(activeStories.map((story) => [story.story_id, story]));
  const caseSubjects = grouping.visibleStories.map((representative) => {
    const caseFile = grouping.caseByStory.get(representative.story_id);
    if (!caseFile) return representative;
    const members = caseFile.members.map((member) => originals.get(member.story_id)).filter(Boolean);
    const sourceMap = new Map(members.flatMap((story) => story.sources || []).map((source) => [source.url, source]));
    const claimMap = new Map(members.flatMap((story) => story.claims || []).map((claim) => [claim.claim, claim]));
    return {
      ...representative,
      case_file: caseFile,
      sources: [...sourceMap.values()],
      claims: [...claimMap.values()],
      topic: [...new Set(members.flatMap((story) => story.topic || []))],
      content_hash: sha256(JSON.stringify(members.map((story) => [story.story_id, story.content_hash, story.current_version]))),
      last_updated: members.map((story) => story.last_updated).sort((left, right) => Date.parse(right) - Date.parse(left))[0] || representative.last_updated,
    };
  });
  // A Deep Dive belongs to an analytical subject, not to every near-identical
  // headline. This conservative, non-transitive pass joins only directly
  // related recent reports with strong title overlap. It does not merge or
  // rewrite the underlying ticker stories.
  const used = new Set();
  const subjects = [];
  for (const representative of caseSubjects) {
    if (used.has(representative.story_id)) continue;
    const members = caseSubjects.filter((other) => {
      if (other.story_id === representative.story_id || used.has(other.story_id)) return false;
      return sameEditorialSubject(representative, other);
    });
    members.forEach((member) => used.add(member.story_id));
    if (!members.length) { subjects.push(representative); continue; }
    const all = [representative, ...members];
    const sourceMap = new Map(all.flatMap((story) => story.sources || []).map((source) => [source.url, source]));
    const claimMap = new Map(all.flatMap((story) => story.claims || []).map((claim) => [claim.claim, claim]));
    subjects.push({
      ...representative,
      editorial_subject: { member_story_ids: all.flatMap((story) => story.editorial_subject?.member_story_ids || [story.story_id]), member_count: all.length },
      sources: [...sourceMap.values()], claims: [...claimMap.values()],
      topic: [...new Set(all.flatMap((story) => story.topic || []))],
      content_hash: sha256(JSON.stringify(all.map((story) => [story.story_id, story.content_hash, story.current_version]))),
      last_updated: all.map((story) => story.last_updated).sort((left, right) => Date.parse(right) - Date.parse(left))[0] || representative.last_updated,
    });
  }
  return subjects;
}

export async function runEditorialAnalyses({
  root = DEFAULT_ROOT, limit = 1, execute = false, bootstrap = false, now = new Date().toISOString(),
  callAiImpl = callWoekAi, build = buildNewsSite,
  registry = null,
  batchEnabled = process.env.WOEK_NEWS_BATCH_ENABLED === 'true', batchFetchImpl,
  apiUrl = process.env.WOEK_NEWS_API_URL, authToken = process.env.WOEK_NEWS_ANALYSIS_TOKEN,
  backgroundOnly = false, requestedStoryIds = [],
} = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error("EDITORIAL_ANALYSIS_LIMIT_INVALID");
  if (!Array.isArray(requestedStoryIds) || requestedStoryIds.length > 20 || requestedStoryIds.some(id => !/^wt-[a-z0-9]+$/.test(id))) throw new Error('EDITORIAL_REQUEST_INVALID');
  const storiesFile = path.join(root, "data/news/stories.json");
  const analysesFile = path.join(root, "data/news/editorial-analyses.json");
  const usageFile = path.join(root, "data/news/usage.json");
  const stateFile = path.join(root, "data/news/state.json");
  const storyStore = read(storiesFile, { stories: [] });
  const newsroom = read(path.join(root, "data/news/newsroom.json"), { source_items: {} });
  const newsRegistry = registry || (fs.existsSync(path.join(root, "content/news/source-registry.json")) ? loadNewsRegistry(root) : { sources: [] });
  const state = read(stateFile, {});
  const usage = read(usageFile, { runs: [] });
  const store = read(analysesFile, { schema_version: "1.0", method_version: EDITORIAL_ANALYSIS_VERSION, updated_at: null, candidates: [], analyses: [] });
  store.retry_state ||= {};
  const activeStories = (storyStore.stories || []).filter((story) => !isManualEditorial(story) && !isManualEditorial(existingForStory(store, story.story_id)) && story.published && story.listed !== false && story.analysis);
  if (requestedStoryIds.some(id => !activeStories.some(story => story.story_id === id))) throw new Error('EDITORIAL_REQUEST_ORIGIN_NOT_PUBLISHED');
  store.editorial_requests ||= {};
  for (const id of new Set(requestedStoryIds)) store.editorial_requests[id] = {
    request_id: sha256(`${id}:${now}`), requested_at: now, status: 'queued',
  };
  const requests = new Map(Object.entries(store.editorial_requests).filter(([, request]) => request.status !== 'published'));
  const retryFor = (story, assessment) => {
    const retry = store.retry_state[story.story_id];
    return (retry?.fingerprint === assessment.fingerprint || (retry?.research_fingerprint && retry.research_fingerprint === assessment.research_fingerprint)) && retry.method_version === EDITORIAL_ANALYSIS_VERSION ? retry : null;
  };
  // An owner-selected origin stays addressable even when the presentation
  // grouping chooses another representative. This does not merge event facts.
  const baseSubjects = [...editorialSubjects(activeStories.filter(story => !requests.has(story.story_id))), ...activeStories.filter(story => requests.has(story.story_id))].map(story => ({
    ...story, source_integrity: sourceIntegrityForStory(story, newsRegistry, [], now),
  }));
  const researchExpansion = execute ? enrichEditorialResearchSubjects(baseSubjects, newsroom, newsRegistry, now) : { subjects: baseSubjects, added: 0 };
  // Revalidate the final combined source set locally, including legacy records
  // without a stored integrity result. No paid analysis or article fetch required.
  const subjects = researchExpansion.subjects.map((story) => withEditorialResearch({
    ...story, source_integrity: sourceIntegrityForStory(story, newsRegistry, [], now),
  }, existingForStory(store, story.story_id)));
  const assessed = subjects.map((story) => ({ story, assessment: { ...editorialAnalysisAssessment(story), research_fingerprint: editorialResearchFingerprint(story) } }));
  const isCurrent = (existing, assessment) => existing && (!existing.method_version || existing.method_version === EDITORIAL_ANALYSIS_VERSION)
    && (existing.research_fingerprint ? existing.research_fingerprint === assessment.research_fingerprint : existing.source_fingerprint === assessment.fingerprint);
  const candidateRows = assessed.filter(({ assessment }) => assessment.candidate).map(({ story, assessment }) => {
    const existing = existingForStory(store, story.story_id);
    const row = publicCandidate(assessment, story, existing);
    if (!isCommissionedAnalysis(existing) && isCurrent(existing, assessment)) row.status = 'published';
    else if (editorialQualityExhausted(retryFor(story, assessment), requests.get(story.story_id)?.request_id)) row.status = 'quality_hold';
    return row;
  });
  const changedCandidateState = JSON.stringify(store.candidates || []) !== JSON.stringify(candidateRows);
  const ready = assessed
    .filter(({ story, assessment }) => !isCommissionedAnalysis(existingForStory(store, story.story_id)) && assessment.candidate && assessment.evidence_gate.passed && !isCurrent(existingForStory(store, story.story_id), assessment))
    .sort((left, right) => Number(requests.has(right.story.story_id)) - Number(requests.has(left.story.story_id)) || right.assessment.editorial_analysis_score - left.assessment.editorial_analysis_score || right.assessment.analysis_gain - left.assessment.analysis_gain || Date.parse(right.story.last_updated || 0) - Date.parse(left.story.last_updated || 0));
  const runnable = ready.filter(({ story, assessment }) => {
    const retry = retryFor(story, assessment);
    const request = requests.get(story.story_id);
    if (editorialQualityExhausted(retry, request?.request_id)) return false;
    if (request && retry?.request_id !== request.request_id) return true;
    let next = Date.parse(retry?.next_attempt_at);
    const last = Date.parse(retry?.last_attempt_at);
    // Legacy budget refusals accumulated the quality backoff up to 12 hours.
    // Keep their history, but do not let capacity masquerade as a quality fault.
    if (retry?.reason === 'AI_BUDGET_EXHAUSTED' && Number.isFinite(last) && last <= Date.parse(now)) next = Math.min(next, last + 15 * 60000);
    return !(next > Date.parse(now));
  });
  const researchPending = candidateRows.filter((candidate) => candidate.status === "research_pending");
  const report = {
    schema_version: "1.0", execute, bootstrap, started_at: now, scanned_stories: activeStories.length, scanned_subjects: subjects.length,
    editorial_candidates: candidateRows.length, ready_for_research: ready.length, research_pending: researchPending.length,
    retry_deferred: ready.length - runnable.length,
    editorial_research_sources_discovered: researchExpansion.added,
    selected: 0, editorial_research_started: 0, editorial_analyses_published: 0, editorial_analyses_updated: 0,
    research_calls: 0, research_tokens: 0, analysis_tokens: 0, estimated_cost_usd: 0, quality_retries: 0,
    economy_version: EDITORIAL_ECONOMY_VERSION, background_only: backgroundOnly,
    full_generations: 0, targeted_repairs: 0, batch_results_reviewed: 0, background_waiting: 0,
    quality_held: candidateRows.filter(row => row.status === 'quality_hold').length,
    unchanged_research_skipped: assessed.filter(({ story, assessment }) => isCurrent(existingForStory(store, story.story_id), assessment)).length,
    requested: [],
    publication_deferred: false, failed: [], candidates: candidateRows,
  };
  if (!execute) return report;
  for (const { story, assessment } of assessed) {
    const request = requests.get(story.story_id);
    if (!request) continue;
    const existing = existingForStory(store, story.story_id);
    request.status = isCurrent(existing, assessment) ? 'published'
      : isCommissionedAnalysis(existing) ? 'commissioned_review_required'
      : !assessment.candidate || !assessment.evidence_gate.passed ? 'research_pending'
      : editorialQualityExhausted(retryFor(story, assessment), request.request_id) ? 'quality_hold' : 'queued';
    report.requested.push({ story_id: story.story_id, status: request.status });
  }
  if (requests.size) writeAtomic(analysesFile, store);
  const budget = newsBudget(state.budget_fx, now, process.env.WOEK_NEWS_MONTHLY_AI_BUDGET_EUR);
  const batchClient = batchEnabled ? createNewsBatchClient({ state, usage, apiUrl, authToken, now, fetchImpl: batchFetchImpl,
    canSubmit: () => budget.status === 'ok' && monthlyUsage(usage, now.slice(0, 7)) + report.estimated_cost_usd + BATCH_RESERVATION_USD + 1 <= budget.technical_limit_usd,
    save: () => { writeAtomic(usageFile, usage); writeAtomic(stateFile, state); } }) : null;
  if (batchClient) { await batchClient.reconcile(); report.batch = batchClient.report; }
  if (batchClient) for (const record of store.analyses || []) for (const version of record.versions || []) {
    if (version.batch_key) batchClient.applied(version, { [version.version === 1 ? 'editorial_analyses_published' : 'editorial_analyses_updated']: 1 });
  }
  if (changedCandidateState) {
    store.candidates = candidateRows;
    store.method_version = EDITORIAL_ANALYSIS_VERSION;
    store.updated_at = now;
    writeAtomic(analysesFile, store);
  }
  if (!runnable.length) return report;
  if (budget.status !== "ok" && !batchClient) {
    report.failed.push({ reason: "EDITORIAL_BUDGET_FX_UNAVAILABLE" });
    return report;
  }
  let spend = monthlyUsage(usage, now.slice(0, 7));
  // `limit` protects one worker run from provider/time exhaustion. It is not an
  // editorial quota: every remaining relevant candidate stays in the queue.
  const scheduling = story => {
    const eligibility = backgroundBatchEligibility(story, { kind: 'editorial_background', now, state });
    if (backgroundOnly && (eligibility.reason === 'news_update_pending' || story.pending_update)) return 'waiting';
    const paidJob = batchClient && Object.values(state.batch_jobs || {}).some(job => job.story_id === story.story_id
      && job.kind === 'editorial_background' && !job.applied_at && !['failed', 'not_submitted'].includes(job.status)
      && job.fingerprint === batchStoryFingerprint(story, 'editorial_background', EDITORIAL_ANALYSIS_VERSION));
    // Never duplicate a paid background job just because its owner now asks
    // about it. Paid retrieval comes first; current news has its own worker.
    if (batchClient && eligibility.eligible && (paidJob || !requests.has(story.story_id))) return 'batch';
    if (paidJob) return 'waiting';
    const deadline = Date.parse(story.next_event_at || story.event_deadline_at || '');
    const nearDeadline = Number.isFinite(deadline) && deadline > Date.parse(now) && deadline - Date.parse(now) < 48 * 3600000;
    if (!backgroundOnly || requests.has(story.story_id) || story.urgent || story.breaking || story.editorial_priority === 'urgent' || nearDeadline) return 'sync';
    return 'waiting';
  };
  const schedulable = runnable.filter(({ story }) => scheduling(story) !== 'waiting');
  report.background_waiting = runnable.length - schedulable.length;
  const selected = [...schedulable].sort((a, b) => Number(requests.has(b.story.story_id)) - Number(requests.has(a.story.story_id))
    || (batchClient ? batchWorkPriority(state, a.story, 'editorial_background') - batchWorkPriority(state, b.story, 'editorial_background') : 0)).slice(0, limit);
  report.selected = selected.length;
  for (const { story, assessment } of selected) {
    const batchEligible = scheduling(story) === 'batch';
    if (!batchEligible && (budget.status !== 'ok' || spend + NEWS_REQUEST_RESERVATION_USD > budget.technical_limit_usd)) {
      report.failed.push({ story_id: story.story_id, reason: "EDITORIAL_AI_BUDGET_BLOCKED" });
      continue;
    }
    const existing = existingForStory(store, story.story_id);
    let result;
    let analysis;
    const previousRetry = retryFor(story, assessment);
    const requestId = requests.get(story.story_id)?.request_id || null;
    let errors = previousRetry?.quality_errors || [];
    let requestPending = false;
    try {
      for (let qualityAttempt = 0; qualityAttempt < 2; qualityAttempt += 1) {
        if (!batchEligible && qualityAttempt && spend + NEWS_REQUEST_RESERVATION_USD > budget.technical_limit_usd) throw new Error("EDITORIAL_AI_BUDGET_BLOCKED");
        // Batch jobs remain single, idempotent full requests. Targeted sync
        // corrections need no persistent unapproved drafts in the public repo.
        const repairPrompt = !batchEligible && buildEditorialRepairPrompt(story, assessment, analysis, errors);
        const prompt = repairPrompt || buildEditorialAnalysisPrompt(story, assessment, errors);
        if (prompt.length > 39000) throw new Error('EDITORIAL_INPUT_TOO_LARGE');
        requestPending = !batchEligible;
        result = batchEligible ? await batchClient.call(story, { kind: 'editorial_background', methodVersion: EDITORIAL_ANALYSIS_VERSION, prompt }) : await callAiImpl([story], {
          apiUrl, authToken, attempts: 1, timeoutMs: 180000,
          clientId: "woek-wirkungsticker-editorial-analysis-v1",
          context: "Wirkungsticker: eigenständige, quellengebundene WÖK-Analyse mit Claim Ledger, Gegenbefund und Self-Frame-Check",
          prompt,
        });
        requestPending = false;
        report.editorial_research_started += 1;
        report[result.batch_key ? 'batch_results_reviewed' : repairPrompt ? 'targeted_repairs' : 'full_generations'] += 1;
        report.research_calls += result.batch_key ? 0 : Number(result.request_attempts || 1);
        // Batch usage is already durably booked once under its job key.
        const callUsage = result.batch_key ? { input_tokens: 0, output_tokens: 0, estimated_cost_usd: 0 } : costFromUsage(result, estimateUsage(result.prompt_chars, result.answer_chars, result.model, modelRates(result.model)));
        spend += callUsage.estimated_cost_usd;
        report.research_tokens += callUsage.input_tokens;
        report.analysis_tokens += callUsage.output_tokens;
        report.estimated_cost_usd = Number((report.estimated_cost_usd + callUsage.estimated_cost_usd).toFixed(6));
        const response = result.analyses?.find((item) => item.story_id === story.story_id);
        try {
          analysis = repairPrompt ? applyEditorialRepair(analysis, response?.editorial_analysis_patch, errors, story)
            : sanitizeEditorialAnalysis(response?.editorial_analysis, story);
        } catch (error) {
          if (error.message === 'EDITORIAL_REPAIR_SCOPE_INVALID') throw error;
          throw new Error('EDITORIAL_SCHEMA_INVALID');
        }
        errors = editorialAnalysisValidationErrors(analysis, story, assessment);
        if (!errors.length) break;
        if (qualityAttempt === 0) { report.quality_retries += 1; continue; }
        throw new Error(`EDITORIAL_QUALITY:${errors.join(",")}`);
      }
      const publishedAt = existing?.published_at || now;
      const version = Number(existing?.version || 0) + 1;
      const analysisId = existing?.analysis_id || `woek-analysis-${sha256(story.story_id).slice(0, 12)}`;
      const record = {
        analysis_id: analysisId, story_id: story.story_id,
        related_story_ids: story.case_file?.members?.map((member) => member.story_id) || story.editorial_subject?.member_story_ids || [story.story_id], related_case_id: story.case_file?.case_id || null,
        slug: existing?.slug || editorialSlug(analysis.title, story.story_id), status: "published",
        author: { name: "Natalie Weber", role: "Methodik & redaktionelle Verantwortung", image: "/assets/img/people/natalie-weber-woek-analyse.jpg" },
        transparency_note: "Nach der von Natalie Weber entwickelten Methodik der Wirkungsökonomie",
        method_version: EDITORIAL_ANALYSIS_VERSION, source_fingerprint: assessment.fingerprint,
        research_fingerprint: assessment.research_fingerprint,
        candidate_score: assessment.editorial_analysis_score, analysis_gain_score: assessment.analysis_gain,
        evidence_gate: assessment.evidence_gate, published_at: publishedAt, updated_at: now, version,
        ...analysis,
        reading_time_minutes: Math.max(5, Math.ceil([analysis.executive_finding || "", ...(analysis.sections || []).flatMap(section => [...(section.paragraphs || []), ...(section.visual?.items || []).map(item => `${item.title} ${item.text}`)]), ...(analysis.author_perspective?.paragraphs || [])].join(" ").split(/\s+/).filter(Boolean).length / 210)),
        source_snapshot: editorialSources(story).map((source) => ({ source_id: editorialSourceRef(source), registry_source_id: source.registry_source_id || source.source_id, publisher_id: source.publisher_id || null, publisher: source.publisher, title: source.title, url: source.url, published_at: source.published_at, primary_source: Boolean(source.primary_source), ...(source.editorial_review ? { source_item_id: editorialSourceRef(source), summary: source.summary, canonical_domain: source.canonical_domain, source_function: source.source_function, editorial_review: source.editorial_review } : {}) })),
        versions: [...(existing?.versions || []), { version, analyzed_at: now, source_fingerprint: assessment.fingerprint, title: analysis.title, provider: result.provider, model: result.model, ...(result.batch_key ? { batch_key: result.batch_key, processing_mode: 'batch' } : {}), claim_ledger: analysis.claim_ledger, ...(existing ? { previous_content: editorialContentSnapshot(existing) } : {}) }],
      };
      const index = (store.analyses || []).findIndex((item) => item.analysis_id === analysisId);
      delete store.retry_state[story.story_id];
      if (store.editorial_requests[story.story_id]) {
        store.editorial_requests[story.story_id].status = 'published';
        store.editorial_requests[story.story_id].completed_at = now;
        const row = report.requested.find(item => item.story_id === story.story_id);
        if (row) row.status = 'published';
      }
      if (index >= 0) {
        store.analyses[index] = record;
        report.editorial_analyses_updated += 1;
      } else {
        store.analyses = [...(store.analyses || []), record];
        report.editorial_analyses_published += 1;
      }
      store.candidates = assessed.filter(({ assessment: item }) => item.candidate).map(({ story: item, assessment: itemAssessment }) => publicCandidate(itemAssessment, item, existingForStory(store, item.story_id)));
      store.updated_at = now;
      writeAtomic(analysesFile, store);
      if (result.batch_key) batchClient.applied(result, { [existing ? 'editorial_analyses_updated' : 'editorial_analyses_published']: 1 });
    } catch (error) {
      const reason = String(error?.message || error).slice(0, 700);
      if (error.batchDeferred) {
        report.publication_deferred = true;
        report.batch_deferred = Number(report.batch_deferred || 0) + 1;
        store.retry_state[story.story_id] = { fingerprint: assessment.fingerprint, research_fingerprint: assessment.research_fingerprint, method_version: EDITORIAL_ANALYSIS_VERSION,
          quality_cycles: Number(previousRetry?.quality_cycles || 0), request_id: requestId,
          attempts: Number(previousRetry?.attempts || 0), last_attempt_at: now, next_attempt_at: new Date(Date.parse(now) + 15 * 60000).toISOString(), quality_errors: errors, reason };
        writeAtomic(analysesFile, store);
        spend = monthlyUsage(usage, now.slice(0, 7)) + report.estimated_cost_usd;
        continue;
      }
      if (requestPending) {
        const cost = failedRequestCost(error);
        report.research_calls += Number(error?.requestAttempts ?? 1);
        if (!error.providerNotCalled) report.editorial_research_started += 1;
        spend += cost.estimated_cost_usd;
        report.research_tokens += cost.input_tokens;
        report.analysis_tokens += cost.output_tokens;
        report.estimated_cost_usd = Number((report.estimated_cost_usd + cost.estimated_cost_usd).toFixed(6));
      }
      const budgetBlocked = ['AI_BUDGET_EXHAUSTED', 'EDITORIAL_AI_BUDGET_BLOCKED'].includes(reason);
      const attempts = Number(previousRetry?.attempts || 0) + (budgetBlocked ? 0 : 1);
      const delayMinutes = budgetBlocked ? 15 : Math.min(720, 15 * (2 ** Math.min(6, attempts - 1)));
      store.retry_state[story.story_id] = {
        fingerprint: assessment.fingerprint, research_fingerprint: assessment.research_fingerprint, method_version: EDITORIAL_ANALYSIS_VERSION,
        request_id: requestId,
        quality_cycles: (requestId && previousRetry?.request_id !== requestId ? 0 : Number(previousRetry?.quality_cycles || 0))
          + Number(isEditorialQualityFailure(reason)),
        attempts, last_attempt_at: now, next_attempt_at: new Date(Date.parse(now) + delayMinutes * 60000).toISOString(),
        quality_errors: errors, reason,
      };
      if (editorialQualityExhausted(store.retry_state[story.story_id], requestId)) {
        report.quality_held += 1;
        const row = store.candidates.find(item => item.story_id === story.story_id);
        if (row) row.status = 'quality_hold';
        const reported = report.candidates.find(item => item.story_id === story.story_id);
        if (reported) reported.status = 'quality_hold';
        if (store.editorial_requests[story.story_id]) store.editorial_requests[story.story_id].status = 'quality_hold';
        const requested = report.requested.find(item => item.story_id === story.story_id);
        if (requested) requested.status = 'quality_hold';
      }
      writeAtomic(analysesFile, store);
      report.failed.push({ story_id: story.story_id, reason, next_attempt_at: store.retry_state[story.story_id].next_attempt_at });
      if (budgetBlocked) {
        report.budget_blocked = true;
        report.budget_block_scope = ['news', 'shared'].includes(error.budgetScope) ? error.budgetScope : 'unknown';
        break;
      }
    }
  }
  report.completed_at = new Date().toISOString();
  if (report.editorial_analyses_published || report.editorial_analyses_updated) build();
  if (report.research_calls) {
    usage.runs = [...(usage.runs || []), {
      run_id: `editorial-${sha256(now).slice(0, 12)}`, started_at: now, completed_at: report.completed_at,
      berlin_slot: bootstrap ? "kontrollierter WÖK-Analyse-Erstbackfill" : "automatische WÖK-Analyse",
      counts: {
        editorial_candidates: report.editorial_candidates, editorial_research_started: report.editorial_research_started,
        editorial_analyses_published: report.editorial_analyses_published, editorial_analyses_updated: report.editorial_analyses_updated,
        editorial_research_sources_discovered: report.editorial_research_sources_discovered,
        research_calls: report.research_calls, research_tokens: report.research_tokens, analysis_tokens: report.analysis_tokens,
        full_generations: report.full_generations, targeted_repairs: report.targeted_repairs,
        batch_results_reviewed: report.batch_results_reviewed,
        background_waiting: report.background_waiting, quality_held: report.quality_held,
      },
      ai: { requests: report.research_calls, provider: "Oracle WOeK-KI API", model: resultModel(store), input_tokens: report.research_tokens, output_tokens: report.analysis_tokens, estimated_cost_usd: report.estimated_cost_usd, token_source: "provider_or_conservative_editorial_analysis" },
      source_failures: 0, quality_holds: report.failed.length,
    }];
    writeAtomic(usageFile, usage);
  }
  return report;
}

function resultModel(store) {
  const versions = (store.analyses || []).flatMap((analysis) => analysis.versions || []);
  return versions.at(-1)?.model || null;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const limit = Number(process.argv.find((argument) => argument.startsWith("--limit="))?.slice(8) || 1);
  const requestedStoryIds = process.argv.filter(argument => argument.startsWith('--request=')).flatMap(argument => argument.slice(10).split(','));
  const report = await runEditorialAnalyses({ execute: process.argv.includes("--execute"), bootstrap: process.argv.includes("--bootstrap"), backgroundOnly: process.argv.includes('--background-only'), requestedStoryIds, limit });
  writeAtomic(path.join(DEFAULT_ROOT, "reports/wirkungsticker-editorial-analyses.json"), report);
  console.log(JSON.stringify(report, null, 2));
  if (report.failed.length) process.exitCode = 1;
}
