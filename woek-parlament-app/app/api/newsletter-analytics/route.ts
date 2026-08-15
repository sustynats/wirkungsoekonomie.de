import { NextRequest, NextResponse } from "next/server";
import { getNewsletterAnalytics, validAnalyticsRange } from "@/lib/newsletter-analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function authorized(request: NextRequest) {
  const expected = process.env.NEWSLETTER_ANALYTICS_TOKEN?.trim();
  const provided = request.headers.get("authorization");
  return Boolean(expected && provided === `Bearer ${expected}`);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });

  const rangeStart = validAnalyticsRange(request.nextUrl.searchParams.get("from"));
  const rangeEnd = validAnalyticsRange(request.nextUrl.searchParams.get("to"));
  if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
    return NextResponse.json({ ok: false, reason: "invalid-range" }, { status: 400 });
  }

  try {
    const newsletters = await getNewsletterAnalytics(rangeStart, rangeEnd);
    return NextResponse.json(
      { ok: true, newsletters },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Newsletter analytics query failed", {
      message: error instanceof Error ? error.message : "Unknown failure"
    });
    return NextResponse.json({ ok: false, reason: "storage-unavailable" }, { status: 503 });
  }
}
