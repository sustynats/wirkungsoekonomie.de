import { randomUUID } from "node:crypto";
import pg, { type Pool as PgPool, type PoolClient } from "pg";
import type { AnalyticsConfig } from "./config.js";
import type { AnalyticsEvent } from "./event-registry.js";

const { Pool } = pg;

export function createPool(config: AnalyticsConfig) {
  return new Pool({ connectionString: config.DATABASE_URL, max: 8 });
}

function dateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

type AggregateContext = {
  date: string;
  studyId: string;
  waveId: string;
  surveyVersion: string;
};

function aggregateContext(config: AnalyticsConfig): AggregateContext {
  return {
    date: dateKey(),
    studyId: config.ANALYTICS_STUDY_ID,
    waveId: config.ANALYTICS_WAVE_ID,
    surveyVersion: config.ANALYTICS_SURVEY_VERSION
  };
}

async function incrementFunnel(client: PoolClient, context: AggregateContext, event: AnalyticsEvent) {
  const counters = {
    started: event.eventName === "SURVEY_STARTED" ? 1 : 0,
    completed: event.eventName === "SURVEY_COMPLETED" ? 1 : 0,
    reportGenerated: event.eventName === "REPORT_GENERATED" ? 1 : 0,
    researchShown: event.eventName === "RESEARCH_OPT_IN_SHOWN" ? 1 : 0,
    researchAccepted: event.eventName === "RESEARCH_OPT_IN_ACCEPTED" ? 1 : 0,
    publicShown: event.eventName === "PUBLIC_SHARE_OPT_IN_SHOWN" ? 1 : 0,
    publicAccepted: event.eventName === "PUBLIC_SHARE_OPT_IN_ACCEPTED" ? 1 : 0
  };
  if (!Object.values(counters).some(Boolean)) return;

  await client.query(
    `insert into analytics.daily_funnel (
       date, study_id, wave_id, survey_version, started_count, completed_count,
       report_generated_count, research_opt_in_shown_count, research_opt_in_count,
       public_opt_in_shown_count, public_opt_in_count
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     on conflict (date, study_id, wave_id, survey_version) do update set
       started_count = analytics.daily_funnel.started_count + excluded.started_count,
       completed_count = analytics.daily_funnel.completed_count + excluded.completed_count,
       report_generated_count = analytics.daily_funnel.report_generated_count + excluded.report_generated_count,
       research_opt_in_shown_count = analytics.daily_funnel.research_opt_in_shown_count + excluded.research_opt_in_shown_count,
       research_opt_in_count = analytics.daily_funnel.research_opt_in_count + excluded.research_opt_in_count,
       public_opt_in_shown_count = analytics.daily_funnel.public_opt_in_shown_count + excluded.public_opt_in_shown_count,
       public_opt_in_count = analytics.daily_funnel.public_opt_in_count + excluded.public_opt_in_count`,
    [
      context.date,
      context.studyId,
      context.waveId,
      context.surveyVersion,
      counters.started,
      counters.completed,
      counters.reportGenerated,
      counters.researchShown,
      counters.researchAccepted,
      counters.publicShown,
      counters.publicAccepted
    ]
  );
}

async function incrementSteps(client: PoolClient, context: AggregateContext, event: AnalyticsEvent) {
  if (!event.stepIndex || !["STEP_VIEWED", "STEP_BACK_NAVIGATED"].includes(event.eventName)) return;
  const viewCount = event.eventName === "STEP_VIEWED" ? 1 : 0;
  const backNavigationCount = event.eventName === "STEP_BACK_NAVIGATED" ? 1 : 0;
  await client.query(
    `insert into analytics.daily_steps (date, study_id, wave_id, survey_version, step_index, view_count, back_navigation_count)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (date, study_id, wave_id, survey_version, step_index) do update set
       view_count = analytics.daily_steps.view_count + excluded.view_count,
       back_navigation_count = analytics.daily_steps.back_navigation_count + excluded.back_navigation_count`,
    [context.date, context.studyId, context.waveId, context.surveyVersion, event.stepIndex, viewCount, backNavigationCount]
  );
}

async function incrementQuestions(client: PoolClient, context: AggregateContext, event: AnalyticsEvent) {
  if (!event.stepIndex || !event.questionType || !["QUESTION_VIEWED", "QUESTION_COMPLETED", "QUESTION_SKIPPED", "ANSWER_CHANGED"].includes(event.eventName)) return;
  const bucket = event.durationBucket;
  const viewCount = event.eventName === "QUESTION_VIEWED" ? 1 : 0;
  const completionCount = event.eventName === "QUESTION_COMPLETED" ? 1 : 0;
  const skipCount = event.eventName === "QUESTION_SKIPPED" ? 1 : 0;
  const answerChangeCount = event.eventName === "ANSWER_CHANGED" ? 1 : 0;
  const updated = await client.query<{ duration_bucket_counts: Record<string, number> }>(
    `insert into analytics.daily_questions (
       date, study_id, wave_id, survey_version, step_index, question_type,
       view_count, completion_count, skip_count, answer_change_count, duration_bucket_counts
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, case when $11::text is null then '{}'::jsonb else jsonb_build_object($11::text, 1) end)
     on conflict (date, study_id, wave_id, survey_version, step_index, question_type) do update set
       view_count = analytics.daily_questions.view_count + excluded.view_count,
       completion_count = analytics.daily_questions.completion_count + excluded.completion_count,
       skip_count = analytics.daily_questions.skip_count + excluded.skip_count,
       answer_change_count = analytics.daily_questions.answer_change_count + excluded.answer_change_count,
       duration_bucket_counts = case
         when $11::text is null then analytics.daily_questions.duration_bucket_counts
         else jsonb_set(
           analytics.daily_questions.duration_bucket_counts,
           array[$11::text],
           to_jsonb(coalesce((analytics.daily_questions.duration_bucket_counts ->> $11::text)::integer, 0) + 1),
           true
         )
       end
     returning duration_bucket_counts`,
    [
      context.date,
      context.studyId,
      context.waveId,
      context.surveyVersion,
      event.stepIndex,
      event.questionType,
      viewCount,
      completionCount,
      skipCount,
      answerChangeCount,
      event.eventName === "QUESTION_COMPLETED" ? bucket ?? null : null
    ]
  );
  const counts = updated.rows[0]?.duration_bucket_counts ?? {};
  const percentileBucket = (percentile: number) => {
    const order = ["lt_10s", "10_30s", "30_60s", "1_2m", "gt_2m"];
    const total = order.reduce((sum, key) => sum + (counts[key] ?? 0), 0);
    if (!total) return null;
    const threshold = Math.ceil(total * percentile);
    let current = 0;
    for (const key of order) {
      current += counts[key] ?? 0;
      if (current >= threshold) return key;
    }
    return null;
  };
  await client.query(
    `update analytics.daily_questions
     set duration_p50_bucket = $7, duration_p90_bucket = $8
     where date = $1 and study_id = $2 and wave_id = $3 and survey_version = $4 and step_index = $5 and question_type = $6`,
    [
      context.date,
      context.studyId,
      context.waveId,
      context.surveyVersion,
      event.stepIndex,
      event.questionType,
      percentileBucket(0.5),
      percentileBucket(0.9)
    ]
  );
}

const reportEvents = new Set([
  "EXPLAINABILITY_OPENED",
  "IMPACT_PATH_OPENED",
  "ALTERNATIVES_OPENED",
  "SENSITIVITY_OPENED",
  "SOURCE_OPENED",
  "PDF_GENERATED"
]);

async function incrementReportUsage(client: PoolClient, context: AggregateContext, event: AnalyticsEvent) {
  if (!reportEvents.has(event.eventName)) return;
  await client.query(
    `insert into analytics.daily_report_usage (date, study_id, wave_id, survey_version, metric_key, count)
     values ($1, $2, $3, $4, $5, 1)
     on conflict (date, study_id, wave_id, survey_version, metric_key) do update set
       count = analytics.daily_report_usage.count + 1`,
    [context.date, context.studyId, context.waveId, context.surveyVersion, event.eventName]
  );
}

async function incrementConsentUsage(client: PoolClient, context: AggregateContext, event: AnalyticsEvent) {
  const details =
    event.eventName === "RESEARCH_OPT_IN_SHOWN"
      ? ["research", 1, 0]
      : event.eventName === "RESEARCH_OPT_IN_ACCEPTED"
        ? ["research", 0, 1]
        : event.eventName === "PUBLIC_SHARE_OPT_IN_SHOWN"
          ? ["public_share", 1, 0]
          : event.eventName === "PUBLIC_SHARE_OPT_IN_ACCEPTED"
            ? ["public_share", 0, 1]
            : null;
  if (!details) return;

  await client.query(
    `insert into analytics.daily_consent_usage (
       date, study_id, wave_id, survey_version, consent_key, shown_count, accepted_count
     ) values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (date, study_id, wave_id, survey_version, consent_key) do update set
       shown_count = analytics.daily_consent_usage.shown_count + excluded.shown_count,
       accepted_count = analytics.daily_consent_usage.accepted_count + excluded.accepted_count`,
    [context.date, context.studyId, context.waveId, context.surveyVersion, ...details]
  );
}

async function incrementFeedback(client: PoolClient, context: AggregateContext, event: AnalyticsEvent) {
  if (event.eventName !== "REPORT_FEEDBACK_SUBMITTED" || !event.rating) return;
  await client.query(
    `insert into analytics.daily_feedback (date, study_id, wave_id, survey_version, rating, submission_count)
     values ($1, $2, $3, $4, $5, 1)
     on conflict (date, study_id, wave_id, survey_version, rating) do update set
       submission_count = analytics.daily_feedback.submission_count + 1`,
    [context.date, context.studyId, context.waveId, context.surveyVersion, event.rating]
  );
}

async function applyAggregates(client: PoolClient, context: AggregateContext, event: AnalyticsEvent) {
  await incrementFunnel(client, context, event);
  await incrementSteps(client, context, event);
  await incrementQuestions(client, context, event);
  await incrementReportUsage(client, context, event);
  await incrementConsentUsage(client, context, event);
  await incrementFeedback(client, context, event);
}

export async function recordEvent(pool: PgPool, config: AnalyticsConfig, nonce: string, event: AnalyticsEvent) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const inserted = await client.query(
      `insert into analytics.raw_events (
         id, client_timestamp, analytics_session_nonce, client_event_id, event_name, schema_version,
         page_key, step_index, question_type, component_type, viewport_class, locale, duration_bucket,
         rating, study_id, wave_id, survey_version
       ) values (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
       ) on conflict (analytics_session_nonce, client_event_id) do nothing returning id`,
      [
        randomUUID(),
        event.timestamp,
        nonce,
        event.clientEventId,
        event.eventName,
        event.schemaVersion,
        event.pageKey ?? null,
        event.stepIndex ?? null,
        event.questionType ?? null,
        event.componentType ?? null,
        event.viewportClass ?? null,
        event.locale ?? null,
        event.durationBucket ?? null,
        event.rating ?? null,
        config.ANALYTICS_STUDY_ID,
        config.ANALYTICS_WAVE_ID,
        config.ANALYTICS_SURVEY_VERSION
      ]
    );
    if (!inserted.rowCount) {
      await client.query("commit");
      return { inserted: false };
    }
    await applyAggregates(client, aggregateContext(config), event);
    await client.query("commit");
    return { inserted: true };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function recordSecurityAlert(pool: PgPool, alertCode: string) {
  await pool.query(
    "insert into security_monitoring.alerts (id, alert_code, source) values ($1, $2, 'analytics_collector')",
    [randomUUID(), alertCode]
  );
}

export async function purgeExpiredAnalyticsEvents(pool: PgPool, rawTtlHours: number) {
  const startedAt = new Date();
  const runId = randomUUID();
  await pool.query(
    "insert into privacy_ops.retention_runs (id, job_name, started_at, status) values ($1, 'purgeExpiredAnalyticsEvents', $2, 'running')",
    [runId, startedAt]
  );
  try {
    const raw = await pool.query("delete from analytics.raw_events where received_at < now() - make_interval(hours => $1)", [rawTtlHours]);
    await pool.query(
      `update privacy_ops.retention_runs
       set completed_at = now(), status = 'succeeded', deleted_raw_events = $2, deleted_dedupe_keys = $2
       where id = $1`,
      [runId, raw.rowCount ?? 0]
    );
    return { deletedRawEvents: raw.rowCount ?? 0 };
  } catch (error) {
    await pool.query(
      "update privacy_ops.retention_runs set completed_at = now(), status = 'failed', error_code = 'purge_failed' where id = $1",
      [runId]
    );
    throw error;
  }
}
