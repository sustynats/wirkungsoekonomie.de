import { NextResponse } from "next/server";
import { processPoliticalDailyDigest } from "@/lib/autopilot/daily-digest-runner";
import { wirkungsradarDigestDelivery } from "@/lib/wirkungsradar/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

function digestReady() {
  try {
    return Boolean(wirkungsradarDigestDelivery());
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!digestReady()) return NextResponse.json({ status: "NOT_CONFIGURED", reason: "Wirkungsradar daily digest delivery is not configured." }, { status: 503 });
  try {
    return NextResponse.json(await processPoliticalDailyDigest());
  } catch (error) {
    console.error("Political daily digest failed closed", { error: error instanceof Error ? error.message : "Unexpected digest failure" });
    return NextResponse.json({ error: "Political daily digest failed closed." }, { status: 500 });
  }
}
