import { strToU8, zipSync } from "fflate";
import { NextRequest, NextResponse } from "next/server";
import { requireEditorialSession } from "@/lib/editorial/auth";
import { createHistoricalReviewZipPayload, markHistoricalReviewBatchExported } from "@/lib/editorial/historical-review-pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  // Native form posts supply Origin. A missing header is tolerated for a
  // same-site navigation in restrictive browser/privacy setups; a different
  // explicit origin is never accepted.
  if (origin && origin !== request.nextUrl.origin) throw new Error("EDITORIAL_EXPORT_CSRF_ORIGIN_MISMATCH");
}

export async function POST(request: NextRequest, context: { params: Promise<{ batchId: string }> }) {
  try {
    assertSameOrigin(request);
    await requireEditorialSession();
    const { batchId } = await context.params;
    const payload = await createHistoricalReviewZipPayload(batchId);
    const archive = zipSync(Object.fromEntries(Object.entries(payload.files).map(([path, content]) => [path, strToU8(content)])), { level: 6 });
    await markHistoricalReviewBatchExported(batchId);
    return new NextResponse(archive, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${payload.fileName}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "HISTORICAL_REVIEW_EXPORT_FAILED";
    const status = code === "EDITORIAL_AUTH_REQUIRED" ? 401 : code === "EDITORIAL_EXPORT_CSRF_ORIGIN_MISMATCH" ? 403 : 400;
    return NextResponse.json({ error: code }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
