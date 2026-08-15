import { NextResponse } from "next/server";
import { unsubscribeNewsletterDelivery } from "@/lib/newsletter-engagement";
import { allowedNewsletterOrigin, clearNewsletterSession, newsletterCors, newsletterPreflight } from "@/lib/woek-newsletter/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return newsletterPreflight(request);
}

export async function POST(request: Request) {
  if (!allowedNewsletterOrigin(request)) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  try {
    const { delivery, token } = await request.json() as { delivery?: string; token?: string };
    if (!delivery || !token || !(await unsubscribeNewsletterDelivery(delivery, token))) {
      return newsletterCors(NextResponse.json({ error: "Dieser Abmeldelink ist ungültig." }, { status: 400 }), request);
    }
    const response = NextResponse.json({ outcome: "unsubscribed" });
    clearNewsletterSession(response);
    return newsletterCors(response, request);
  } catch (error) {
    console.error("Newsletter campaign unsubscribe failed", { message: error instanceof Error ? error.message : "Unknown failure" });
    return newsletterCors(NextResponse.json({ error: "Die Abmeldung konnte nicht abgeschlossen werden." }, { status: 503 }), request);
  }
}
