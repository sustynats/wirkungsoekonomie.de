import { NextResponse } from "next/server";
import { z } from "zod";
import { EditorialAuthorizationError, requireEditorialRequest } from "@/lib/editorial/auth";
import { DatabaseConfigurationError } from "@/lib/database/supabase-admin";
import { DipConfigurationError } from "@/lib/dip";
import { historicalWoeKBackfillStart } from "@/lib/dip-backfill";
import { runHistoricalDipBackfill } from "@/lib/editorial/historical-backfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  start_date: z.string().date().default(historicalWoeKBackfillStart),
  end_date: z.string().date().optional()
});

export async function POST(request: Request) {
  try {
    requireEditorialRequest(request);
    const body = requestSchema.parse(await request.json().catch(() => ({})));
    const result = await runHistoricalDipBackfill({ startDate: body.start_date, endDate: body.end_date });
    return NextResponse.json({ status: "completed", ...result });
  } catch (error) {
    if (error instanceof EditorialAuthorizationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof DipConfigurationError || error instanceof DatabaseConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid historical backfill request.", details: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: "Historical backfill failed." }, { status: 500 });
  }
}
