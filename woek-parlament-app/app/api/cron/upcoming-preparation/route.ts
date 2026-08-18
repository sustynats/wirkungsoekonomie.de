import { NextResponse } from "next/server";
import { prepareUpcomingDecisionReviews } from "@/lib/editorial/upcoming-preparation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const result = await prepareUpcomingDecisionReviews({
      maximumCases: 15,
      exportWhenPrivateNotificationReady: true
    });
    return NextResponse.json({ status: "completed", ...result });
  } catch (error) {
    console.error("Scheduled upcoming-decision preparation failed", {
      error: error instanceof Error ? error.message : "Unexpected scheduled preparation error"
    });
    return NextResponse.json({ error: "Upcoming-decision preparation failed." }, { status: 500 });
  }
}
