import { z } from "zod";

export const EVENT_NAMES = [
  "SURVEY_STARTED",
  "STEP_VIEWED",
  "STEP_BACK_NAVIGATED",
  "QUESTION_VIEWED",
  "QUESTION_COMPLETED",
  "QUESTION_SKIPPED",
  "ANSWER_CHANGED",
  "SURVEY_REVIEWED",
  "SURVEY_COMPLETED",
  "REPORT_GENERATED",
  "EXPLAINABILITY_OPENED",
  "IMPACT_PATH_OPENED",
  "ALTERNATIVES_OPENED",
  "SENSITIVITY_OPENED",
  "SOURCE_OPENED",
  "PDF_GENERATED",
  "RESEARCH_OPT_IN_SHOWN",
  "RESEARCH_OPT_IN_ACCEPTED",
  "PUBLIC_SHARE_OPT_IN_SHOWN",
  "PUBLIC_SHARE_OPT_IN_ACCEPTED",
  "REPORT_FEEDBACK_SUBMITTED"
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

const pageKeys = [
  "survey_intro",
  "survey_step",
  "survey_review",
  "survey_complete",
  "report_overview",
  "report_explainability",
  "report_impact_path",
  "report_alternatives",
  "report_sensitivity",
  "report_sources",
  "research_consent",
  "public_share_consent"
] as const;

const questionTypes = ["single_choice", "multiple_choice", "scale", "ranking", "text"] as const;
const componentTypes = ["panel", "accordion", "link", "pdf", "rating"] as const;
const durationBuckets = ["lt_10s", "10_30s", "30_60s", "1_2m", "gt_2m"] as const;

const EventSchema = z
  .object({
    eventName: z.enum(EVENT_NAMES),
    schemaVersion: z.literal("1.0"),
    timestamp: z.string().datetime({ offset: true }),
    pageKey: z.enum(pageKeys).optional(),
    stepIndex: z.number().int().positive().max(99).optional(),
    questionType: z.enum(questionTypes).optional(),
    componentType: z.enum(componentTypes).optional(),
    viewportClass: z.enum(["mobile", "tablet", "desktop"]).optional(),
    locale: z.literal("de-DE").optional(),
    durationBucket: z.enum(durationBuckets).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    clientEventId: z.string().uuid()
  })
  .strict();

export type AnalyticsEvent = z.infer<typeof EventSchema>;

export type EventDefinition = {
  description: string;
  allowedProperties: readonly (keyof AnalyticsEvent)[];
  requiredProperties?: readonly (keyof AnalyticsEvent)[];
  privacyClass: "product_pseudonym_free";
  rawTtlHours: 72;
  schemaVersion: "1.0";
};

const base = ["eventName", "schemaVersion", "timestamp", "clientEventId"] as const;
const event = (description: string, allowedProperties: readonly (keyof AnalyticsEvent)[], requiredProperties?: readonly (keyof AnalyticsEvent)[]): EventDefinition => ({
  description,
  allowedProperties,
  requiredProperties,
  privacyClass: "product_pseudonym_free",
  rawTtlHours: 72,
  schemaVersion: "1.0"
});

export const EVENT_CATALOG: Record<EventName, EventDefinition> = {
  SURVEY_STARTED: event("Befragung begonnen", [...base, "pageKey", "viewportClass", "locale"]),
  STEP_VIEWED: event("Befragungsschritt angezeigt", [...base, "pageKey", "stepIndex", "viewportClass"], ["stepIndex"]),
  STEP_BACK_NAVIGATED: event("Zurücknavigation im Befragungsschritt", [...base, "stepIndex"], ["stepIndex"]),
  QUESTION_VIEWED: event("Frage angezeigt, ohne Antwortinhalt", [...base, "stepIndex", "questionType"], ["stepIndex", "questionType"]),
  QUESTION_COMPLETED: event("Frage ohne Antwortwert abgeschlossen", [...base, "stepIndex", "questionType", "durationBucket"], ["stepIndex", "questionType"]),
  QUESTION_SKIPPED: event("Frage ohne Angabe übersprungen", [...base, "stepIndex", "questionType"], ["stepIndex", "questionType"]),
  ANSWER_CHANGED: event("Antwort geändert, ohne alten oder neuen Antwortwert", [...base, "stepIndex", "questionType"], ["stepIndex", "questionType"]),
  SURVEY_REVIEWED: event("Review-Schritt gezeigt", [...base, "pageKey", "viewportClass"]),
  SURVEY_COMPLETED: event("Befragung abgeschlossen", [...base, "pageKey", "durationBucket"]),
  REPORT_GENERATED: event("Neutraler Report generiert", [...base, "pageKey"]),
  EXPLAINABILITY_OPENED: event("Erklärbarkeit geöffnet", [...base, "pageKey", "componentType"]),
  IMPACT_PATH_OPENED: event("Wirkpfad geöffnet", [...base, "pageKey", "componentType"]),
  ALTERNATIVES_OPENED: event("Alternativen geöffnet", [...base, "pageKey", "componentType"]),
  SENSITIVITY_OPENED: event("Sensitivität geöffnet", [...base, "pageKey", "componentType"]),
  SOURCE_OPENED: event("Quellenbereich geöffnet", [...base, "pageKey", "componentType"]),
  PDF_GENERATED: event("PDF-Erstellung ausgelöst", [...base, "pageKey"]),
  RESEARCH_OPT_IN_SHOWN: event("Research-Freigabe gezeigt", [...base, "pageKey"]),
  RESEARCH_OPT_IN_ACCEPTED: event("Research-Freigabe akzeptiert", [...base, "pageKey"]),
  PUBLIC_SHARE_OPT_IN_SHOWN: event("Freigabe für öffentliche Nutzung gezeigt", [...base, "pageKey"]),
  PUBLIC_SHARE_OPT_IN_ACCEPTED: event("Freigabe für öffentliche Nutzung akzeptiert", [...base, "pageKey"]),
  REPORT_FEEDBACK_SUBMITTED: event("Report-Bewertung ohne Freitext übermittelt", [...base, "pageKey", "componentType", "rating"], ["rating"])
};

const forbiddenKeyFragments = [
  "email",
  "mail",
  "party",
  "fraktion",
  "faction",
  "invite",
  "invitation",
  "token",
  "response",
  "answer",
  "constituency",
  "wahlkreis",
  "recommendation",
  "reportid",
  "userid",
  "participant",
  "respondent",
  "subject",
  "topic",
  "option",
  "freetext",
  "textanswer",
  "useragent",
  "ip"
];

const emailPattern = /(?:^|[^\w.+-])[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}(?:$|[^\w.+-])/;
const noncePattern = /^[A-Za-z0-9_-]{43}$/;

export type ValidationResult =
  | { ok: true; event: AnalyticsEvent }
  | { ok: false; reason: "invalid_schema" | "invalid_event_properties" | "sensitive_data" };

function isForbiddenKey(key: string): boolean {
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  // eventName is a required registry field, while all other name-bearing
  // fields are personal data and must be rejected before schema validation.
  if (normalizedKey && normalizedKey !== "eventname" && normalizedKey.endsWith("name")) return true;
  return Boolean(normalizedKey && forbiddenKeyFragments.some((fragment) => normalizedKey.includes(fragment)));
}

function containsSensitiveData(input: unknown, key = ""): boolean {
  if (isForbiddenKey(key)) return true;
  if (typeof input === "string") return emailPattern.test(input);
  if (Array.isArray(input)) return input.some((value) => containsSensitiveData(value));
  if (input && typeof input === "object") {
    return Object.entries(input as Record<string, unknown>).some(([childKey, value]) => containsSensitiveData(value, childKey));
  }
  return false;
}

export function isValidAnalyticsNonce(value: string | undefined): value is string {
  return Boolean(value && noncePattern.test(value));
}

export function validateAnalyticsEvent(input: unknown): ValidationResult {
  if (containsSensitiveData(input)) return { ok: false, reason: "sensitive_data" };
  const parsed = EventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid_schema" };

  const event = parsed.data;
  const definition = EVENT_CATALOG[event.eventName];
  const allowed = definition.allowedProperties;
  const keys = Object.keys(event) as (keyof AnalyticsEvent)[];
  if (keys.some((key) => !allowed.includes(key))) return { ok: false, reason: "invalid_event_properties" };
  if ((definition.requiredProperties ?? []).some((key) => event[key] === undefined)) {
    return { ok: false, reason: "invalid_event_properties" };
  }

  const eventTime = Date.parse(event.timestamp);
  if (!Number.isFinite(eventTime) || Math.abs(Date.now() - eventTime) > 24 * 60 * 60 * 1000) {
    return { ok: false, reason: "invalid_schema" };
  }

  return { ok: true, event };
}
