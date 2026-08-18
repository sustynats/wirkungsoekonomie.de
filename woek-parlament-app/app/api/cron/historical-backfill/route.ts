import { NextResponse } from "next/server";
import { runHistoricalDipBackfillStep } from "@/lib/editorial/historical-backfill";
import { purgeUnconfirmedSubscriptions } from "@/lib/wirkungsradar/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const [result, purgedSubscriptions] = await Promise.all([
      runHistoricalDipBackfillStep({ pageBudget: 100 }),
      purgeUnconfirmedSubscriptions()
    ]);
    return NextResponse.json({ status: "completed_step", purged_unconfirmed_subscriptions: purgedSubscriptions, ...result });
  } catch (error) {
    console.error("Scheduled historical backfill failed", {
      error: error instanceof Error ? error.message : "Unexpected scheduled import error"
    });
    return NextResponse.json({ error: "Historical backfill step failed." }, { status: 500 });
  }
}
