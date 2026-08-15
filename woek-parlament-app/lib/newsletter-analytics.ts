import { supabaseRpc } from "@/lib/database/supabase-admin";

export type NewsletterAnalyticsRow = {
  newsletter_key: "wirkungsradar" | "wirkungsbrief";
  active_addresses: number;
  pending_confirmations: number;
  requested: number;
  confirmation_sends: number;
  confirmed: number;
  unsubscribed: number;
  delivery_failures: number;
  welcome_sends: number;
  issue_sends: number;
  unique_opens: number;
  unique_clicks: number;
};

export function validAnalyticsRange(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getNewsletterAnalytics(rangeStart: Date, rangeEnd: Date) {
  return supabaseRpc<NewsletterAnalyticsRow[]>("get_newsletter_analytics", {
    range_start_input: rangeStart.toISOString(),
    range_end_input: rangeEnd.toISOString()
  });
}
