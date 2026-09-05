import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildNewsSite } from "./build.mjs";
import { buildCaseFiles } from "./case-files.mjs";
import { callWoekAi, estimateUsage, monthlyUsage, sha256, storySimilarity } from "./lib.mjs";
import { eventCompatibility } from "./newsroom.mjs";
import { loadNewsRegistry } from "./registry.mjs";
import { sourceIntegrityForStory } from "./source-integrity.mjs";
import { NEWS_REQUEST_RESERVATION_USD, costFromUsage, modelRates, newsBudget } from "./budget.mjs";
import {
  EDITORIAL_ANALYSIS_VERSION, buildEditorialAnalysisPrompt, editorialAnalysisAssessment,
  editorialAnalysisValidationErrors, editorialSlug, editorialSourceRef, sanitizeEditorialAnalysis,
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
    evidence_gate: assessment.evidence_gate,
    fingerprint: assessment.fingerprint,
    status: existing && existing.source_fingerprint === assessment.fingerprint ? "published" : assessment.status,
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
  apiUrl = process.env.WOEK_NEWS_API_URL, authToken = process.env.WOEK_NEWS_ANALYSIS_TOKEN,
} = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error("EDITORIAL_ANALYSIS_LIMIT_INVALID");
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
  const activeStories = (storyStore.stories || []).filter((story) => story.published && story.listed !== false && story.analysis);
  const baseSubjects = editorialSubjects(activeStories);
  const researchExpansion = execute ? enrichEditorialResearchSubjects(baseSubjects, newsroom, newsRegistry, now) : { subjects: baseSubjects, added: 0 };
  const subjects = researchExpansion.subjects;
  const assessed = subjects.map((story) => ({ story, assessment: editorialAnalysisAssessment(story) }));
  const candidateRows = assessed.filter(({ assessment }) => assessment.candidate).map(({ story, assessment }) => publicCandidate(assessment, story, existingForStory(store, story.story_id)));
  const changedCandidateState = JSON.stringify(store.candidates || []) !== JSON.stringify(candidateRows);
  const ready = assessed
    .filter(({ story, assessment }) => assessment.candidate && assessment.evidence_gate.passed && existingForStory(store, story.story_id)?.source_fingerprint !== assessment.fingerprint)
    .sort((left, right) => right.assessment.editorial_analysis_score - left.assessment.editorial_analysis_score || right.assessment.analysis_gain - left.assessment.analysis_gain || Date.parse(right.story.last_updated || 0) - Date.parse(left.story.last_updated || 0));
  const researchPending = candidateRows.filter((candidate) => candidate.status === "research_pending");
  const report = {
    schema_version: "1.0", execute, bootstrap, started_at: now, scanned_stories: activeStories.length, scanned_subjects: subjects.length,
    editorial_candidates: candidateRows.length, ready_for_research: ready.length, research_pending: researchPending.length,
    editorial_research_sources_discovered: researchExpansion.added,
    selected: 0, editorial_research_started: 0, editorial_analyses_published: 0, editorial_analyses_updated: 0,
    research_calls: 0, research_tokens: 0, analysis_tokens: 0, estimated_cost_usd: 0, quality_retries: 0,
    publication_deferred: false, failed: [], candidates: candidateRows,
  };
  if (!execute) return report;
  if (changedCandidateState) {
    store.candidates = candidateRows;
    store.method_version = EDITORIAL_ANALYSIS_VERSION;
    store.updated_at = now;
    writeAtomic(analysesFile, store);
  }
  if (!ready.length) return report;
  const budget = newsBudget(state.budget_fx, now, Number(process.env.WOEK_NEWS_MONTHLY_AI_BUDGET_EUR || 25));
  if (budget.status !== "ok") {
    report.failed.push({ reason: "EDITORIAL_BUDGET_FX_UNAVAILABLE" });
    return report;
  }
  let spend = monthlyUsage(usage, now.slice(0, 7));
  // `limit` protects one worker run from provider/time exhaustion. It is not an
  // editorial quota: every remaining relevant candidate stays in the queue.
  const selected = ready.slice(0, limit);
  report.selected = selected.length;
  for (const { story, assessment } of selected) {
    if (spend + NEWS_REQUEST_RESERVATION_USD > budget.technical_limit_usd) {
      report.failed.push({ story_id: story.story_id, reason: "EDITORIAL_AI_BUDGET_BLOCKED" });
      break;
    }
    const existing = existingForStory(store, story.story_id);
    let result;
    let analysis;
    let errors = [];
    try {
      for (let qualityAttempt = 0; qualityAttempt < 2; qualityAttempt += 1) {
        if (qualityAttempt && spend + NEWS_REQUEST_RESERVATION_USD > budget.technical_limit_usd) throw new Error("EDITORIAL_AI_BUDGET_BLOCKED");
        const prompt = buildEditorialAnalysisPrompt(story, assessment, errors);
        result = await callAiImpl([story], {
          apiUrl, authToken, attempts: 2, timeoutMs: 180000,
          clientId: "woek-wirkungsticker-editorial-analysis-v1",
          context: "Wirkungsticker: eigenständige, quellengebundene WÖK-Analyse mit Claim Ledger, Gegenbefund und Self-Frame-Check",
          prompt,
        });
        report.editorial_research_started += 1;
        report.research_calls += 1;
        const callUsage = costFromUsage(result, estimateUsage(result.prompt_chars, result.answer_chars, result.model, modelRates(result.model)));
        spend += callUsage.estimated_cost_usd;
        report.research_tokens += callUsage.input_tokens;
        report.analysis_tokens += callUsage.output_tokens;
        report.estimated_cost_usd = Number((report.estimated_cost_usd + callUsage.estimated_cost_usd).toFixed(6));
        const raw = result.analyses?.find((item) => item.story_id === story.story_id)?.editorial_analysis;
        analysis = sanitizeEditorialAnalysis(raw, story);
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
        transparency_note: "Automatisiert nach der von Natalie Weber entwickelten Methodik der Wirkungsökonomie erstellt.",
        method_version: EDITORIAL_ANALYSIS_VERSION, source_fingerprint: assessment.fingerprint,
        candidate_score: assessment.editorial_analysis_score, analysis_gain_score: assessment.analysis_gain,
        evidence_gate: assessment.evidence_gate, published_at: publishedAt, updated_at: now, version,
        ...analysis,
        reading_time_minutes: Math.max(5, Math.ceil((analysis.sections || []).flatMap((section) => section.paragraphs || []).join(" ").split(/\s+/).filter(Boolean).length / 210)),
        source_snapshot: (story.sources || []).map((source) => ({ source_id: editorialSourceRef(source), registry_source_id: source.source_id, publisher_id: source.publisher_id || null, publisher: source.publisher, title: source.title, url: source.url, published_at: source.published_at, primary_source: Boolean(source.primary_source) })),
        versions: [...(existing?.versions || []), { version, analyzed_at: now, source_fingerprint: assessment.fingerprint, title: analysis.title, provider: result.provider, model: result.model, claim_ledger: analysis.claim_ledger }],
      };
      const index = (store.analyses || []).findIndex((item) => item.analysis_id === analysisId);
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
    } catch (error) {
      report.failed.push({ story_id: story.story_id, reason: String(error?.message || error).slice(0, 700) });
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
  const report = await runEditorialAnalyses({ execute: process.argv.includes("--execute"), bootstrap: process.argv.includes("--bootstrap"), limit });
  writeAtomic(path.join(DEFAULT_ROOT, "reports/wirkungsticker-editorial-analyses.json"), report);
  console.log(JSON.stringify(report, null, 2));
  if (report.failed.length) process.exitCode = 1;
}
