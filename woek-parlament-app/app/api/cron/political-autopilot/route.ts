import { NextResponse } from "next/server";
import { processPoliticalAutopilot } from "@/lib/autopilot/runner";

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
    return NextResponse.json(await processPoliticalAutopilot());
  } catch (error) {
    console.error("Political impact autopilot failed closed", { error: error instanceof Error ? error.message : "Unexpected autopilot failure" });
    return NextResponse.json({ error: "Political impact autopilot failed closed." }, { status: 500 });
  }
}
