/** The single source of truth for dashboard and export formulas. */
export type MetricDefinition = {
  key: string;
  name: string;
  businessMeaning: string;
  numerator: string | null;
  denominator: string | null;
  source: string;
  refreshRate: "hourly" | "daily";
  privacyClass: "invitation_aggregate" | "product_aggregate";
  methodVersion: "1.0";
};

export const METRIC_REGISTRY: readonly MetricDefinition[] = [
  {
    key: "survey_completion_rate",
    name: "Completion Rate",
    businessMeaning: "Anteil abgeschlossener unter den begonnenen Befragungen.",
    numerator: "SURVEY_COMPLETED",
    denominator: "SURVEY_STARTED",
    source: "analytics.daily_funnel",
    refreshRate: "hourly",
    privacyClass: "product_aggregate",
    methodVersion: "1.0"
  },
  {
    key: "research_opt_in_rate",
    name: "Research Opt-in Rate",
    businessMeaning: "Anteil angenommener Research-Freigaben unter den angezeigten Freigaben.",
    numerator: "RESEARCH_OPT_IN_ACCEPTED",
    denominator: "RESEARCH_OPT_IN_SHOWN",
    source: "analytics.daily_consent_usage",
    refreshRate: "hourly",
    privacyClass: "product_aggregate",
    methodVersion: "1.0"
  },
  {
    key: "public_share_opt_in_rate",
    name: "Public Opt-in Rate",
    businessMeaning: "Anteil angenommener öffentlicher Freigaben unter den angezeigten Freigaben.",
    numerator: "PUBLIC_SHARE_OPT_IN_ACCEPTED",
    denominator: "PUBLIC_SHARE_OPT_IN_SHOWN",
    source: "analytics.daily_consent_usage",
    refreshRate: "hourly",
    privacyClass: "product_aggregate",
    methodVersion: "1.0"
  }
];

export function percentage(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  return (numerator / denominator) * 100;
}

export function surveyCompletionRate(startedCount: number, completedCount: number): number | null {
  return percentage(completedCount, startedCount);
}
