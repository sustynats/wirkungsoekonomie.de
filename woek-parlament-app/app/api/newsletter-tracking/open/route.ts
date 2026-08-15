import { NextRequest, NextResponse } from "next/server";
import { recordNewsletterOpen, transparentGif } from "@/lib/newsletter-engagement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const deliveryId = request.nextUrl.searchParams.get("d") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  try {
    await recordNewsletterOpen(deliveryId, token);
  } catch (error) {
    console.error("Newsletter open tracking failed", { message: error instanceof Error ? error.message : "Unknown failure" });
  }
  return new NextResponse(transparentGif(), {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
