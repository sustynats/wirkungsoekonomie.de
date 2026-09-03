import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  budgetStage,
  callWoekAi,
  claimLedgerFor,
  clusterItems,
  estimateUsage,
  fetchFeed,
  monthlyUsage,
  parseFeed,
  preAnalyzeStory,
  scheduledSlot,
  sha256,
  slugify,
  validateAnalysis,
} from "./lib.mjs";
import { buildNewsSite } from "./build.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const files = {
  registry: path.join(ROOT, "content/news/source-registry.json"),
  state: path.join(ROOT, "data/news/state.json"),
  stories: path.join(ROOT, "data/news/stories.json"),
  usage: path.join(ROOT, "data/news/usage.json"),
  report: path.join(ROOT, "reports/wirkungsticker-latest-run.json"),
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
    primary_source: item.primary_source,
    source_priority: item.source_priority,
    source_topic: item.source_topic,
    content_hash: item.content_hash,
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

function createCandidate(cluster, now) {
  const existing = cluster.existing_story;
  const sources = mergeSources(existing?.sources, cluster.sources);
  const candidate = {
    story_id: cluster.story_id,
    slug: existing?.slug || `${slugify(cluster.title)}-${cluster.story_id.slice(-6)}`,
    title: cluster.title,
    first_seen: existing?.first_seen || cluster.first_seen || now,
    last_updated: cluster.last_updated || now,
    sources,
    existing_story: existing || null,
  };
  candidate.claims = claimLedgerFor(sources, candidate.story_id, now);
  candidate.preanalysis = preAnalyzeStory(candidate);
  candidate.topic = candidate.preanalysis.topics;
  candidate.content_hash = storyContentHash(candidate);
  return candidate;
}

function pendingRecord(candidate, reason, now, qualityErrors = []) {
  const existing = candidate.existing_story;
  if (existing?.published) {
    return {
      ...existing,
      pending_update: {
        detected_at: now,
        content_hash: candidate.content_hash,
        sources: candidate.sources,
        reason,
        quality_errors: qualityErrors,
      },
    };
  }
  return {
    story_id: candidate.story_id,
    slug: candidate.slug,
    title: candidate.title,
    first_seen: candidate.first_seen,
    last_updated: candidate.last_updated,
    topic: candidate.topic,
    sources: candidate.sources,
    claims: candidate.claims,
    content_hash: candidate.content_hash,
    published: false,
    analysis_status: "automatische Veröffentlichung zurückgestellt",
    quality_errors: qualityErrors,
    pending_reason: reason,
    versions: existing?.versions || [],
    updated_at: now,
  };
}

function publishedRecord(candidate, analysis, ai, now) {
  const existing = candidate.existing_story;
  const versionNumber = Number(existing?.current_version || 0) + 1;
  const version = {
    version: versionNumber,
    analyzed_at: now,
    content_hash: candidate.content_hash,
    analysis,
    provider: ai.provider,
    model: ai.model,
    mode: ai.mode,
    method_sources: ai.method_sources,
  };
  return {
    story_id: candidate.story_id,
    slug: candidate.slug,
    title: candidate.title,
    first_seen: candidate.first_seen,
    last_updated: now,
    published_at: existing?.published_at || now,
    updated_at: now,
    topic: candidate.topic,
    sources: candidate.sources,
    claims: candidate.claims,
    content_hash: candidate.content_hash,
    published: true,
    analysis_status: "veröffentlicht",
    current_version: versionNumber,
    analysis,
    versions: [...(existing?.versions || []), version],
    publication_history: [
      ...(existing?.publication_history || []),
      { version: versionNumber, published_at: now, source_count: candidate.sources.length },
    ],
  };
}

function latestSourceDate(items) {
  return items.reduce((latest, item) => {
    const value = Date.parse(item.published_at || 0);
    return value > latest ? value : latest;
  }, 0);
}

function sanitizeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/[A-Za-z0-9_-]{24,}/g, "[redacted]").slice(0, 240);
}

export async function runWirkungsticker(options = {}) {
  const nowDate = options.now ? new Date(options.now) : process.env.WOEK_NEWS_NOW ? new Date(process.env.WOEK_NEWS_NOW) : new Date();
  if (!Number.isFinite(nowDate.getTime())) throw new Error("INVALID_RUN_TIME");
  const now = nowDate.toISOString();
  const registry = readJson(files.registry);
  const state = readJson(files.state);
  const storyStore = readJson(files.stories);
  const usage = readJson(files.usage);
  const enabledSources = registry.sources.filter((source) => source.enabled);
  const report = {
    schema_version: "1.1",
    started_at: now,
    berlin_slot: scheduledSlot(nowDate).slot || "manueller Lauf",
    feed_entries_fetched: 0,
    feed_entries_new: 0,
    feed_entries_updated: 0,
    feed_entries_deduplicated: 0,
    feed_entries_future_dated: 0,
    story_clusters: 0,
    locally_rejected: 0,
    ai_stories: 0,
    ai_calls: 0,
    ai_batches_planned: 0,
    ai_batches_completed: 0,
    published_stories: 0,
    updated_stories: 0,
    provider: null,
    model: null,
    input_tokens: 0,
    output_tokens: 0,
    estimated_cost_usd: 0,
    source_successes: 0,
    source_failures: 0,
    source_errors: [],
    quality_holds: [],
    budget_stage: 0,
    completed_at: null,
  };

  const fetchResults = await mapLimit(enabledSources, Number(process.env.WOEK_NEWS_FETCH_CONCURRENCY || 3), async (source) => {
    const fetched = await (options.fetchFeedImpl || fetchFeed)({ ...source, max_items: registry.policy.max_items_per_source }, registry.policy);
    const items = parseFeed(fetched.body, { ...source, max_items: registry.policy.max_items_per_source });
    return { source, fetched, items };
  });

  const allItems = [];
  for (let index = 0; index < fetchResults.length; index += 1) {
    const result = fetchResults[index];
    const source = enabledSources[index];
    if (result.status === "rejected") {
      const error = sanitizeError(result.reason);
      report.source_failures += 1;
      report.source_errors.push({ source_id: source.source_id, error });
      state.source_status[source.source_id] = { last_error_at: now, last_error: error, last_success: state.source_status[source.source_id]?.last_success || null };
      continue;
    }
    report.source_successes += 1;
    report.feed_entries_fetched += result.value.items.length;
    allItems.push(...result.value.items);
    state.source_status[source.source_id] = {
      last_success: now,
      last_error: null,
      feed_url: result.value.fetched.final_url,
      items: result.value.items.length,
      etag: result.value.fetched.etag,
      last_modified: result.value.fetched.last_modified,
    };
  }
  if (report.source_successes === 0) throw new Error("ALL_NEWS_SOURCES_FAILED");

  const lookbackMs = Number(registry.policy.bootstrap_lookback_hours || 36) * 60 * 60 * 1000;
  const futureToleranceMs = 10 * 60 * 1000;
  const cutoff = state.last_successful_run ? Date.parse(state.last_successful_run) - 5 * 60 * 1000 : nowDate.getTime() - lookbackMs;
  const changedItems = [];
  for (const item of allItems) {
    const previous = state.seen_items[item.item_id];
    const published = Date.parse(item.published_at || 0);
    if (published > nowDate.getTime() + futureToleranceMs) {
      report.feed_entries_future_dated += 1;
      continue;
    }
    if (!previous && published && published < cutoff) continue;
    if (!previous) {
      changedItems.push(item);
      report.feed_entries_new += 1;
    } else if (previous.content_hash !== item.content_hash) {
      changedItems.push(item);
      report.feed_entries_updated += 1;
    } else {
      report.feed_entries_deduplicated += 1;
    }
    state.seen_items[item.item_id] = {
      source_id: item.source_id,
      url: item.url,
      content_hash: item.content_hash,
      published_at: item.published_at,
      last_seen: now,
    };
  }
  const pruneBefore = nowDate.getTime() - 120 * 24 * 60 * 60 * 1000;
  for (const [id, record] of Object.entries(state.seen_items)) if (Date.parse(record.last_seen || 0) < pruneBefore) delete state.seen_items[id];

  const freshCandidates = clusterItems(changedItems, storyStore.stories || [], now).map((cluster) => createCandidate(cluster, now));
  const freshIds = new Set(freshCandidates.map((candidate) => candidate.story_id));
  const retryableReasons = new Set(["AI_BUDGET_OR_BATCH_LIMIT", "AI_PROVIDER_UNAVAILABLE", "AI_DISABLED", "AI_BUDGET_BLOCKED"]);
  const retryCandidates = (storyStore.stories || [])
    .filter((story) => (!story.published || story.pending_update) && !freshIds.has(story.story_id))
    .filter((story) => {
      const reason = story.pending_update?.reason || story.pending_reason;
      const qualityErrors = story.pending_update?.quality_errors || story.quality_errors || [];
      return retryableReasons.has(reason)
        || (reason === "QUALITY_GATE_FAILED" && qualityErrors.length > 0 && qualityErrors.every((error) => error.startsWith("AI_UNSUPPORTED_NUMBER:")));
    })
    .filter((story) => (story.pending_update?.sources || story.sources || []).some((source) => Date.parse(source.published_at || 0) <= nowDate.getTime() + futureToleranceMs))
    .map((story) => {
      const sources = (story.pending_update?.sources || story.sources).filter((source) => Date.parse(source.published_at || 0) <= nowDate.getTime() + futureToleranceMs);
      const candidate = {
        story_id: story.story_id,
        slug: story.slug,
        title: story.title,
        first_seen: story.first_seen,
        last_updated: story.pending_update?.detected_at || story.last_updated || now,
        sources,
        existing_story: story,
      };
      candidate.claims = claimLedgerFor(sources, candidate.story_id, now);
      candidate.preanalysis = preAnalyzeStory(candidate);
      candidate.topic = candidate.preanalysis.topics;
      candidate.content_hash = story.pending_update?.content_hash || storyContentHash(candidate);
      return candidate;
    });
  const clusters = [...freshCandidates, ...retryCandidates];
  report.story_clusters = freshCandidates.length;
  report.pending_stories_retried = retryCandidates.length;
  const month = now.slice(0, 7);
  const budget = Number(process.env.WOEK_NEWS_MONTHLY_AI_BUDGET_USD || 5);
  const spendBefore = monthlyUsage(usage, month);
  const stage = budgetStage(spendBefore, budget);
  report.budget_stage = stage.stage;
  report.monthly_spend_before_usd = Number(spendBefore.toFixed(6));
  report.monthly_budget_usd = budget;
  const eligible = clusters
    .filter((candidate) => candidate.preanalysis.internal_relevance_score >= stage.threshold && candidate.sources.some((source) => source.primary_source))
    .sort((a, b) => b.preanalysis.internal_relevance_score - a.preanalysis.internal_relevance_score || latestSourceDate(b.sources) - latestSourceDate(a.sources));
  report.locally_rejected = clusters.length - eligible.length;
  const maxAiStories = Math.max(0, Number(process.env.WOEK_NEWS_MAX_AI_STORIES_PER_RUN || 2));
  const selected = stage.stage >= 3 ? [] : eligible.slice(0, maxAiStories);
  const aiBatchSize = Math.max(1, Math.min(maxAiStories || 1, Number(process.env.WOEK_NEWS_AI_BATCH_SIZE || 2)));
  report.ai_stories = selected.length;
  report.ai_batch_size = aiBatchSize;
  report.ai_batches_planned = Math.ceil(selected.length / aiBatchSize);

  const byId = new Map((storyStore.stories || []).map((story) => [story.story_id, story]));
  for (const candidate of eligible.slice(maxAiStories)) {
    byId.set(candidate.story_id, pendingRecord(candidate, "AI_BUDGET_OR_BATCH_LIMIT", now));
    report.quality_holds.push({ story_id: candidate.story_id, reason: "AI_BUDGET_OR_BATCH_LIMIT" });
  }

  const aiEnabled = String(process.env.WOEK_NEWS_AI_ENABLED ?? "true").toLowerCase() !== "false";
  if (selected.length && aiEnabled) {
    for (let offset = 0; offset < selected.length; offset += aiBatchSize) {
      const batch = selected.slice(offset, offset + aiBatchSize);
      try {
        const aiResult = await (options.callAiImpl || callWoekAi)(batch, {
          apiUrl: process.env.WOEK_NEWS_API_URL,
          timeoutMs: Number(process.env.WOEK_NEWS_AI_TIMEOUT_MS || 120000),
        });
        report.provider ||= aiResult.provider;
        report.model ||= aiResult.model;
        report.ai_calls += Number(aiResult.request_attempts || 1);
        report.ai_batches_completed += 1;
        const estimated = estimateUsage(aiResult.prompt_chars, aiResult.answer_chars, aiResult.model, {
          inputUsdPerMillion: Number(process.env.WOEK_NEWS_INPUT_USD_PER_MILLION || 5),
          outputUsdPerMillion: Number(process.env.WOEK_NEWS_OUTPUT_USD_PER_MILLION || 30),
        });
        report.input_tokens += estimated.input_tokens;
        report.output_tokens += estimated.output_tokens;
        report.estimated_cost_usd = Number((report.estimated_cost_usd + estimated.estimated_cost_usd).toFixed(6));
        report.token_source = estimated.token_source;
        const analyses = new Map(aiResult.analyses.map((analysis) => [analysis.story_id, analysis]));
        for (const candidate of batch) {
          const analysis = analyses.get(candidate.story_id);
          const errors = analysis ? validateAnalysis(analysis, candidate) : ["AI_ANALYSIS_MISSING"];
          if (errors.length) {
            byId.set(candidate.story_id, pendingRecord(candidate, "QUALITY_GATE_FAILED", now, errors));
            report.quality_holds.push({ story_id: candidate.story_id, reason: "QUALITY_GATE_FAILED", errors });
            continue;
          }
          const wasPublished = Boolean(candidate.existing_story?.published);
          byId.set(candidate.story_id, publishedRecord(candidate, analysis, aiResult, now));
          report.published_stories += wasPublished ? 0 : 1;
          report.updated_stories += wasPublished ? 1 : 0;
        }
      } catch (error) {
        report.ai_calls += Number(error?.requestAttempts || 1);
        const reason = sanitizeError(error);
        report.ai_error = reason;
        report.failed_batch_offset = offset;
        for (const candidate of selected.slice(offset)) {
          byId.set(candidate.story_id, pendingRecord(candidate, "AI_PROVIDER_UNAVAILABLE", now, [reason]));
          report.quality_holds.push({ story_id: candidate.story_id, reason: "AI_PROVIDER_UNAVAILABLE" });
        }
        break;
      }
    }
  } else {
    for (const candidate of selected) {
      byId.set(candidate.story_id, pendingRecord(candidate, aiEnabled ? "AI_BUDGET_BLOCKED" : "AI_DISABLED", now));
      report.quality_holds.push({ story_id: candidate.story_id, reason: aiEnabled ? "AI_BUDGET_BLOCKED" : "AI_DISABLED" });
    }
  }

  report.completed_at = new Date().toISOString();
  const currentItems = allItems.filter((item) => Date.parse(item.published_at || 0) <= nowDate.getTime() + futureToleranceMs);
  report.latest_source_timestamp = latestSourceDate(currentItems) ? new Date(latestSourceDate(currentItems)).toISOString() : null;
  state.last_successful_run = now;
  state.pending_story_ids = [...byId.values()].filter((story) => !story.published || story.pending_update).map((story) => story.story_id);
  storyStore.updated_at = now;
  storyStore.stories = [...byId.values()].sort((a, b) => Date.parse(b.last_updated || 0) - Date.parse(a.last_updated || 0));
  usage.runs.push({
    run_id: `news-run-${sha256(now).slice(0, 12)}`,
    started_at: now,
    completed_at: report.completed_at,
    berlin_slot: report.berlin_slot,
    counts: {
      feed_entries_fetched: report.feed_entries_fetched,
      feed_entries_new: report.feed_entries_new,
      feed_entries_deduplicated: report.feed_entries_deduplicated,
      story_clusters: report.story_clusters,
      locally_rejected: report.locally_rejected,
      ai_stories: report.ai_stories,
      published_stories: report.published_stories,
    },
    ai: report.ai_calls ? {
      provider: report.provider,
      model: report.model,
      input_tokens: report.input_tokens,
      output_tokens: report.output_tokens,
      estimated_cost_usd: report.estimated_cost_usd,
      token_source: report.token_source || "unavailable",
    } : null,
    source_failures: report.source_failures,
    quality_holds: report.quality_holds.length,
  });
  usage.runs = usage.runs.slice(-400);

  if (!options.dryRun) {
    writeJson(files.state, state);
    writeJson(files.stories, storyStore);
    writeJson(files.usage, usage);
    writeJson(files.report, report);
    buildNewsSite();
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await runWirkungsticker({ dryRun: process.argv.includes("--dry-run") });
  console.log(JSON.stringify(report, null, 2));
}
