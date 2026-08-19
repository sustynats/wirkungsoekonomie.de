import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { governmentDailyIngestReady } from "@/lib/government/daily-impact-ingest";
import { reviewNotificationDeliveryChannel, reviewNotificationDeliveryReady } from "@/lib/notifications/discord";
import { wirkungsradarDigestDelivery } from "@/lib/wirkungsradar/subscriptions";
import { newsletterDeliveryReady } from "@/lib/woek-newsletter/subscriptions";

export const dynamic = "force-dynamic";

function dipImportStatus() {
  const key = process.env.DIP_API_KEY?.trim();
  if (!key) return "disabled_missing_key";
  // This reports only configuration state, never the value or a derived secret.
  return key.length === 42 ? "configured_not_scheduled" : "disabled_invalid_key_format";
}

function wirkungsradarDigestStatus() {
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
    // credentials, recipient addresses, or internal error strings.
  }
  const reviewReady = reviewNotificationDeliveryReady();
  const reviewChannel = reviewNotificationDeliveryChannel();
  const digestStatus = wirkungsradarDigestStatus();
  return NextResponse.json({
    status: "ok",
    service: "woek-parlament-app",
    database,
    dipImport: dipImportStatus(),
    governmentImpactDaily: governmentDailyIngestReady() ? "configured_fail_closed" : "disabled_missing_configuration",
    backgroundScheduler: process.env.CRON_SECRET ? "configured_cloud_trigger" : "disabled_missing_configuration",
    dailyNewsletter: digestStatus,
    wirkungsradarDailyDigest: digestStatus,
    wirkungsradarCronSchedule: process.env.CRON_SECRET ? "configured_dual_utc_dst_safe" : "disabled_missing_configuration",
    woekNewsletter: newsletterDeliveryReady() ? "configured_double_opt_in_delivery" : "disabled_missing_configuration",
    reviewNotifications: reviewReady ? `configured_${reviewChannel}` : "disabled_missing_configuration",
    discordDirectMessages: reviewChannel === "discord_dm" ? "configured" : "not_selected_email_fallback_available",
    timestamp: new Date().toISOString()
  });
}
