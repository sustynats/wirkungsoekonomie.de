import { z } from "zod";

const ConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  ANALYTICS_STUDY_ID: z.string().regex(/^[A-Z0-9_]{3,40}$/),
  ANALYTICS_WAVE_ID: z.string().regex(/^[A-Z0-9_]{1,40}$/),
  ANALYTICS_SURVEY_VERSION: z.string().regex(/^[A-Za-z0-9._-]{1,40}$/),
  ANALYTICS_RAW_TTL_HOURS: z.coerce.number().int().positive().max(168).default(72),
  ANALYTICS_ALLOWED_ORIGINS: z.string().default(""),
  PORT: z.coerce.number().int().positive().default(3000)
});

export type AnalyticsConfig = z.infer<typeof ConfigSchema> & { allowedOrigins: ReadonlySet<string> };

export function readConfig(environment = process.env): AnalyticsConfig {
  const parsed = ConfigSchema.parse(environment);
  return {
    ...parsed,
    allowedOrigins: new Set(parsed.ANALYTICS_ALLOWED_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean))
  };
}
