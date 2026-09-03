import { NextResponse } from "next/server";
import { processDropboxReviewInbox } from "@/lib/review/dropbox-inbox";

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
    return NextResponse.json(await processDropboxReviewInbox());
  } catch (error) {
    console.error("Scheduled review inbox processing failed", {
      error: error instanceof Error ? error.message : "Unexpected review inbox error",
    });
    return NextResponse.json({ error: "Review inbox processing failed." }, { status: 500 });
  }
}
