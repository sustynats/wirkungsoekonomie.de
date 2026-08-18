import { NextResponse } from "next/server";
import { processGovernmentDailyImpactIngest } from "@/lib/government/daily-impact-ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json(await processGovernmentDailyImpactIngest());
  } catch (error) {
    console.error("Government daily impact ingest failed", {
      error: error instanceof Error ? error.message : "Unexpected daily ingest error",
    });
    return NextResponse.json({ error: "Government daily impact ingest failed closed." }, { status: 500 });
  }
}
