import { NextResponse } from "next/server";
import { EditorialAuthorizationError, requireEditorialRequest } from "@/lib/editorial/auth";
import { DatabaseConfigurationError } from "@/lib/database/supabase-admin";
import { exportReviewBatch } from "@/lib/editorial/review-export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ batchId: string }> }) {
  try {
    requireEditorialRequest(request);
    const { batchId } = await params;
    const result = await exportReviewBatch(batchId);
    return new NextResponse(result.zip.bytes, {
      headers: {
        "content-type": result.zip.contentType,
        "content-disposition": `attachment; filename="${result.zip.filename}"`,
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff"
      }
    });
  } catch (error) {
    if (error instanceof EditorialAuthorizationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not export review batch." }, { status: 422 });
  }
}
