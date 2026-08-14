import { NextResponse } from "next/server";
import { z } from "zod";
import { EditorialAuthorizationError, requireEditorialRequest } from "@/lib/editorial/auth";
import { DatabaseConfigurationError } from "@/lib/database/supabase-admin";
import { DipConfigurationError } from "@/lib/dip";
import { historicalWoeKBackfillStart } from "@/lib/dip-backfill";
import { runHistoricalDipBackfillStep } from "@/lib/editorial/historical-backfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The historical importer processes one bounded official time window at a
// time. A longer duration prevents a valid window from being interrupted
// while its verified source records are being persisted.
export const maxDuration = 300;

const requestSchema = z.object({
  start_date: z.string().date().default(historicalWoeKBackfillStart),
  end_date: z.string().date().optional(),
  page_budget: z.number().int().min(1).max(25).default(8)
});

export async function POST(request: Request) {
  try {
    requireEditorialRequest(request);
    const body = requestSchema.parse(await request.json().catch(() => ({})));
    const result = await runHistoricalDipBackfillStep({
      startDate: body.start_date,
      endDate: body.end_date,
      pageBudget: body.page_budget
    });
    return NextResponse.json({ status: "completed", ...result });
  } catch (error) {
    if (error instanceof EditorialAuthorizationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof DipConfigurationError || error instanceof DatabaseConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid historical backfill request.", details: error.flatten() }, { status: 400 });
    // Keep the response deliberately generic.  The server log contains the
    // operational reason without ever returning configuration details to a
    // browser or a public caller.
    console.error("Historical DIP backfill failed", {
      error: error instanceof Error ? error.message : "Unexpected import error"
    });
    const diagnostic = error instanceof Error
      ? error.message.replace(/https?:\/\/\S+/g, "[redacted-url]")
      : "Unexpected import error";
    return NextResponse.json({ error: "Historical backfill failed.", diagnostic }, { status: 500 });
  }
}
