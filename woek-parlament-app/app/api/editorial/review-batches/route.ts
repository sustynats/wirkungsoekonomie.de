import { NextResponse } from "next/server";
import { z } from "zod";
import { EditorialAuthorizationError, requireEditorialRequest } from "@/lib/editorial/auth";
import { createReviewBatch } from "@/lib/editorial/review-batches";
import { DatabaseConfigurationError } from "@/lib/database/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  case_ids: z.array(z.string().uuid()).min(1).max(15),
  decision_unit_ids: z.record(z.string().uuid()).default({}),
  review_type: z.enum(["FULL_REVIEW", "INCREMENTAL_REVIEW", "EXCEPTION_REVIEW"]),
  review_context: z.enum(["HISTORICAL", "EX_ANTE"]).default("HISTORICAL")
});

export async function POST(request: Request) {
  try {
    requireEditorialRequest(request);
    const body = requestSchema.parse(await request.json());
    const createdBy = request.headers.get("x-woek-editorial-actor")?.slice(0, 120) || "editorial-service";
    const result = await createReviewBatch({
      caseIds: body.case_ids,
      decisionUnitIds: body.decision_unit_ids,
      reviewType: body.review_type,
      reviewContext: body.review_context,
      createdBy
    });
    return NextResponse.json({
      batch_id: result.id,
      batch_code: result.batch.batch_code,
      case_count: result.batch.cases.length,
      export_path: `/api/editorial/review-batches/${result.id}/export`
    }, { status: 201 });
  } catch (error) {
    if (error instanceof EditorialAuthorizationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid review batch request.", details: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create review batch." }, { status: 422 });
  }
}
