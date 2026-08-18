import { NextResponse } from "next/server";
import { processPoliticalDailyDigest } from "@/lib/autopilot/daily-digest-runner";
import { bootstrapDisabledResponse, recurringWritersEnabled } from "@/lib/autopilot/runtime-mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!recurringWritersEnabled()) return NextResponse.json(bootstrapDisabledResponse(), { status: 503 });
  try {
    return NextResponse.json(await processPoliticalDailyDigest());
  } catch (error) {
    console.error("Political daily digest failed closed", { error: error instanceof Error ? error.message : "Unexpected digest failure" });
    return NextResponse.json({ error: "Political daily digest failed closed." }, { status: 500 });
  }
}
