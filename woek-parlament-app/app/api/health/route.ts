import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { governmentDailyIngestReady } from "@/lib/government/daily-impact-ingest";
import { reviewNotificationDeliveryReady } from "@/lib/notifications/discord";
import { wirkungsradarDigestDelivery } from "@/lib/wirkungsradar/subscriptions";

export const dynamic = "force-dynamic";

function dipImportStatus() {
  const key = process.env.DIP_API_KEY?.trim();
  if (!key) return "disabled_missing_key";
  // This reports only configuration state, never the value or a derived secret.
  return key.length === 42 ? "configured_not_scheduled" : "disabled_invalid_key_format";
}

function dailyNewsletterStatus() {
  try {
    return wirkungsradarDigestDelivery() ? "configured_server_delivery" : "disabled_missing_configuration";
  } catch {
    return "disabled_invalid_configuration";
  }
}

export async function GET() {
  let database = "unavailable";
  try {
    await supabaseRest<unknown[]>("parliament.parliaments?select=id&limit=1");
    database = "ready";
  } catch {
    // A health response must never disclose database URLs, provider details,
    // credentials, or internal error strings.
  }
  return NextResponse.json({
    status: "ok",
    service: "woek-parlament-app",
    database,
    dipImport: dipImportStatus(),
    governmentImpactDaily: governmentDailyIngestReady() ? "configured_fail_closed" : "disabled_missing_configuration",
    backgroundScheduler: process.env.CRON_SECRET ? "configured_cloud_trigger" : "disabled_missing_configuration",
    dailyNewsletter: dailyNewsletterStatus(),
    discordDirectMessages: reviewNotificationDeliveryReady() ? "configured" : "disabled_missing_configuration",
    timestamp: new Date().toISOString()
  });
}
