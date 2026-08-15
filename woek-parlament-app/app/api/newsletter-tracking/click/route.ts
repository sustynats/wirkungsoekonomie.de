import { NextRequest, NextResponse } from "next/server";
import { recordNewsletterClick } from "@/lib/newsletter-engagement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const deliveryId = request.nextUrl.searchParams.get("d") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const code = request.nextUrl.searchParams.get("l") ?? "";
  try {
    const targetUrl = await recordNewsletterClick(deliveryId, token, code);
    if (targetUrl) return NextResponse.redirect(targetUrl, { status: 302 });
  } catch (error) {
    console.error("Newsletter click tracking failed", { message: error instanceof Error ? error.message : "Unknown failure" });
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}
