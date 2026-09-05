import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildNewsSite } from "./build.mjs";
import { callWoekAi, estimateUsage, monthlyUsage, sha256, validateAnalysis } from "./lib.mjs";
import { NEWS_REQUEST_RESERVATION_USD, costFromUsage, modelRates, newsBudget } from "./budget.mjs";
import { MEDIA_ANALYSIS_VERSION, MEDIA_IMPACT_SCHEMA, MEDIA_PROMPT_RULES, applySelfFrameRewrites, detectMediaImpactTrigger, estimateMediaUsage, mediaTriggerForAnalysis, mediaTriggerRecord, sanitizeMediaImpact } from "./media-impact.mjs";

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function read(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeAtomic(file, value) {
  const temporary = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, file);
}

function clean(value, max = 1400) { return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }

export function buildMediaBackfillPrompt(story, trigger = detectMediaImpactTrigger(story), qualityErrors = []) {
  const input = {
    story_id: story.story_id,
    media_trigger: trigger,
    current_title: clean(story.title, 220),
    current_source_summary: clean(story.source_summary, 1400),
    current_analysis: {
      summary: clean(story.analysis?.summary, 420), detail_summary: clean(story.analysis?.detail_summary, 1200),
      facts: (story.claims || []).slice(0, 6).map((claim) => ({ claim: clean(claim.claim, 500), uncertainty: clean(claim.uncertainty, 260), source_id: claim.source_id })),
      consequences: [...(story.analysis?.first_order || []), ...(story.analysis?.second_order || []), ...(story.analysis?.third_order || [])].map((item) => clean(item, 260)).slice(0, 6),
    },
    sources: (story.sources || []).slice(0, 12).map((source) => ({ source_id: source.source_id, publisher: source.publisher, title: clean(source.title, 220), abstract: clean(source.summary, 900), primary_source: Boolean(source.primary_source), role: source.source_role || null, url: source.url })),
  };
  const correction = qualityErrors.length ? [
    `QUALITÄTSKORREKTUR: Die vorige Ausgabe wurde wegen ${qualityErrors.join(", ")} gesperrt. Erzeuge den JSON-Datensatz vollständig neu.`,
    "Wenn self_frame_warning=true ist, muss fact_first_reframe.source_summary aus 100–180 Wörtern in 2–3 durch Leerzeilen getrennten Absätzen bestehen. Beginne mit dem belegten Ereignis, attribuiere die Akteursaussage erst danach und erfinde keine Angaben.",
  ] : [];
  return [
    "Du ergänzt eine bereits veröffentlichte Wirkungsakte ausschließlich um den selektiven Medien- & Sprachwirkungscheck. Verändere keine vorhandenen Fakten, Claims, Quellen, Ereignisfolgen oder Scores.",
    ...MEDIA_PROMPT_RULES,
    "Prüfe nur die gelieferte Story. Gib ausschließlich valides JSON als {analyses:[{story_id,media_impact}]} aus. Keine Einleitung.",
    ...correction,
    `Schema: ${JSON.stringify({ analyses: [{ story_id: "string", media_impact: MEDIA_IMPACT_SCHEMA }] })}`,
    "UNTRUSTED_SOURCE_DATA_BEGIN",
    JSON.stringify(input),
    "UNTRUSTED_SOURCE_DATA_END",
  ].join("\n");
}

export async function backfillMediaImpact({
  root = DEFAULT_ROOT, limit = 10, dryRun = true, now = new Date().toISOString(), callAiImpl = callWoekAi, build = buildNewsSite,
  apiUrl = process.env.WOEK_NEWS_API_URL, authToken = process.env.WOEK_NEWS_ANALYSIS_TOKEN,
} = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("MEDIA_BACKFILL_LIMIT_INVALID");
  const storiesFile = path.join(root, "data/news/stories.json");
  const usageFile = path.join(root, "data/news/usage.json");
  const stateFile = path.join(root, "data/news/state.json");
  const store = read(storiesFile);
  const usage = read(usageFile);
  const state = read(stateFile);
  const month = now.slice(0, 7);
  const budget = newsBudget(state.budget_fx, now, Number(process.env.WOEK_NEWS_MONTHLY_AI_BUDGET_EUR || 25));
  let spend = monthlyUsage(usage, month);
  const reviewed = store.stories.filter((story) => story.published && story.listed !== false && story.analysis).map((story) => ({ story, trigger: mediaTriggerForAnalysis(story.analysis, story) }));
  const obsolete = reviewed.filter(({ story, trigger }) => !trigger.relevant && story.analysis.media_analysis_version === MEDIA_ANALYSIS_VERSION && story.analysis.media_impact?.relevant);
  const normalizable = reviewed.map(({ story, trigger }) => ({ story, trigger, sanitized: trigger.relevant && story.analysis.media_analysis_version === MEDIA_ANALYSIS_VERSION && story.analysis.media_trigger_fingerprint === trigger.fingerprint && story.analysis.media_impact ? sanitizeMediaImpact(story.analysis.media_impact, story, trigger).media_impact : null })).filter(({ story, sanitized }) => sanitized && JSON.stringify(sanitized) !== JSON.stringify(story.analysis.media_impact));
  const candidates = reviewed.filter(({ story, trigger }) => trigger.relevant && !(story.analysis.media_analysis_version === MEDIA_ANALYSIS_VERSION && story.analysis.media_trigger_fingerprint === trigger.fingerprint));
  const selected = candidates.slice(0, limit);
  const result = { schema_version: "1.0", dry_run: dryRun, started_at: now, candidates: candidates.length, selected: selected.length, obsolete_checks: obsolete.length, normalizable_checks: normalizable.length, completed: 0, cleaned: 0, normalized: 0, failed: [], ai_requests: 0, quality_retries: 0, media_check_tokens: 0, media_check_cost_usd: 0, self_frame_rewrites: 0, budget_status: budget.status };
  if (dryRun) return result;
  if (budget.status !== "ok") throw new Error("MEDIA_BACKFILL_BUDGET_FX_UNAVAILABLE");
  for (const { story, trigger } of obsolete) {
    const version = Number(story.current_version || 0) + 1;
    const nextAnalysis = { ...story.analysis, media_impact: null, media_checked_at: now, media_trigger_fingerprint: trigger.fingerprint, media_trigger: mediaTriggerRecord(trigger, story) };
    story.analysis = nextAnalysis;
    story.current_version = version;
    story.updated_at = now;
    story.versions = [...(story.versions || []), {
      version, analyzed_at: now, content_hash: story.content_hash, source_summary: story.source_summary, analysis: nextAnalysis,
      provider: null, model: null, mode: "media_impact_trigger_cleanup", method_sources: [], claims: story.claims,
      source_versions: (story.sources || []).map((source) => ({ source_id: source.source_id, url: source.url, content_hash: source.content_hash })),
    }];
    result.cleaned += 1;
    writeAtomic(storiesFile, store);
  }
  for (const { story, trigger, sanitized } of normalizable) {
    const version = Number(story.current_version || 0) + 1;
    const nextAnalysis = { ...story.analysis, media_impact: sanitized, media_checked_at: now, media_trigger_fingerprint: trigger.fingerprint, media_trigger: mediaTriggerRecord(trigger, story) };
    story.analysis = nextAnalysis;
    story.current_version = version;
    story.updated_at = now;
    story.versions = [...(story.versions || []), {
      version, analyzed_at: now, content_hash: story.content_hash, source_summary: story.source_summary, analysis: nextAnalysis,
      provider: null, model: null, mode: "media_impact_deterministic_normalization", method_sources: [], claims: story.claims,
      source_versions: (story.sources || []).map((source) => ({ source_id: source.source_id, url: source.url, content_hash: source.content_hash })),
    }];
    result.normalized += 1;
    writeAtomic(storiesFile, store);
  }
  for (const { story, trigger } of selected) {
    if (spend + NEWS_REQUEST_RESERVATION_USD > budget.technical_limit_usd) { result.failed.push({ story_id: story.story_id, reason: "AI_BUDGET_BLOCKED" }); break; }
    try {
      let ai;
      let workingStory;
      let nextAnalysis;
      let localReport;
      let qualityErrors = [];
      for (let qualityAttempt = 0; qualityAttempt < 2; qualityAttempt += 1) {
        if (qualityAttempt && spend + NEWS_REQUEST_RESERVATION_USD > budget.technical_limit_usd) throw new Error("AI_BUDGET_BLOCKED");
        ai = await callAiImpl([story], { apiUrl, authToken, attempts: 3, timeoutMs: 120000, clientId: "woek-wirkungsticker-media-backfill-v1", context: "Wirkungsticker: selektiver, versionierter Medien- und Sprachwirkungs-Backfill", prompt: buildMediaBackfillPrompt(story, trigger, qualityErrors) });
        result.ai_requests += 1;
        result.last_model = ai.model;
        result.last_provider = ai.provider;
        const callCost = costFromUsage(ai, estimateUsage(ai.prompt_chars, ai.answer_chars, ai.model, modelRates(ai.model)));
        spend += callCost.estimated_cost_usd;
        result.media_check_tokens += callCost.input_tokens + callCost.output_tokens;
        result.media_check_cost_usd = Number((result.media_check_cost_usd + callCost.estimated_cost_usd).toFixed(6));

        const raw = ai.analyses?.find((entry) => entry.story_id === story.story_id)?.media_impact;
        const sanitized = sanitizeMediaImpact(raw, story, trigger);
        workingStory = structuredClone(story);
        nextAnalysis = { ...workingStory.analysis, media_impact: sanitized.media_impact, media_analysis_version: MEDIA_ANALYSIS_VERSION, media_checked_at: now, media_trigger_fingerprint: trigger.fingerprint, media_trigger: mediaTriggerRecord(trigger, workingStory) };
        localReport = {};
        applySelfFrameRewrites(nextAnalysis, workingStory, localReport);
        qualityErrors = validateAnalysis({ source_summary: workingStory.source_summary, ...nextAnalysis }, { ...workingStory, media_trigger: trigger }, { validateSourceSummaryNumbers: false, persisted: true });
        if (!qualityErrors.length) break;
        if (qualityAttempt === 0) { result.quality_retries += 1; continue; }
        throw new Error(`MEDIA_BACKFILL_QUALITY:${qualityErrors.join(",")}`);
      }
      const version = Number(story.current_version || 0) + 1;
      story.title = workingStory.title;
      story.source_summary = workingStory.source_summary;
      story.analysis = nextAnalysis;
      story.analysis.media_trigger = mediaTriggerRecord(trigger, story);
      story.current_version = version;
      story.last_updated = now;
      story.updated_at = now;
      story.versions = [...(story.versions || []), {
        version, analyzed_at: now, content_hash: story.content_hash, source_summary: story.source_summary, analysis: nextAnalysis,
        provider: ai.provider, model: ai.model, mode: "media_impact_backfill", method_sources: ai.method_sources || [], claims: story.claims,
        source_versions: (story.sources || []).map((source) => ({ source_id: source.source_id, url: source.url, content_hash: source.content_hash })),
      }];
      story.publication_history = [...(story.publication_history || []), { version, published_at: now, source_count: story.sources.length, change: "media_impact_added" }];
      const mediaUsage = estimateMediaUsage(nextAnalysis.media_impact, modelRates(ai.model));
      result.self_frame_rewrites += Number(localReport.self_frame_rewrites || 0);
      result.completed += 1;
      result.estimated_media_payload_tokens = Number(result.estimated_media_payload_tokens || 0) + mediaUsage.input_tokens + mediaUsage.output_tokens;
      writeAtomic(storiesFile, store);
    } catch (error) {
      result.failed.push({ story_id: story.story_id, reason: String(error?.message || error).slice(0, 500) });
    }
  }
  result.completed_at = new Date().toISOString();
  if (result.completed || result.cleaned || result.normalized) {
    store.updated_at = now;
    store.public_updated_at = now;
    writeAtomic(storiesFile, store);
    build();
  }
  if (result.ai_requests) {
    usage.runs.push({
      run_id: `media-backfill-${sha256(now).slice(0, 12)}`, started_at: now, completed_at: result.completed_at, berlin_slot: "kontrollierter Medienwirkungs-Backfill",
      counts: { media_checks_triggered: selected.length, media_checks_skipped: store.stories.filter((story) => story.published && story.listed !== false).length - candidates.length, media_check_tokens: result.media_check_tokens, self_frame_rewrites: result.self_frame_rewrites, media_quality_retries: result.quality_retries, media_checks_cleaned: result.cleaned, media_checks_normalized: result.normalized, updated_stories: result.completed },
      ai: { requests: result.ai_requests, provider: result.last_provider || null, model: result.last_model || null, input_tokens: result.media_check_tokens, output_tokens: 0, estimated_cost_usd: result.media_check_cost_usd, media_check_tokens: result.media_check_tokens, media_check_cost_usd: result.media_check_cost_usd, token_source: "provider_or_conservative_media_backfill" },
      source_failures: 0, quality_holds: result.failed.length,
    });
    writeAtomic(usageFile, usage);
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const limit = Number(process.argv.find((argument) => argument.startsWith("--limit="))?.slice(8) || 10);
  const result = await backfillMediaImpact({ limit, dryRun: !process.argv.includes("--execute") || process.argv.includes("--dry-run") });
  console.log(JSON.stringify(result, null, 2));
}
