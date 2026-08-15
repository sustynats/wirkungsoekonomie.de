import { NextResponse } from "next/server";
import { allowedNewsletterOrigin, newsletterCors, newsletterPreflight, setNewsletterSession } from "@/lib/woek-newsletter/http";
import { NewsletterConfirmationError, confirmNewsletterSubscription } from "@/lib/woek-newsletter/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return newsletterPreflight(request);
}

export async function POST(request: Request) {
  if (!allowedNewsletterOrigin(request)) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  try {
    const { subscription, token, unsubscribe_token } = await request.json() as { subscription?: string; token?: string; unsubscribe_token?: string };
    if (!subscription || !token) return newsletterCors(NextResponse.json({ error: "Ungültiger Bestätigungslink." }, { status: 400 }), request);
    const result = await confirmNewsletterSubscription(subscription, token, unsubscribe_token);
    const response = NextResponse.json({ outcome: result.outcome });
    setNewsletterSession(response, result.session);
    return newsletterCors(response, request);
  } catch (error) {
    if (error instanceof NewsletterConfirmationError) return newsletterCors(NextResponse.json({ error: error.message }, { status: 400 }), request);
    return newsletterCors(NextResponse.json({ error: "Die Bestätigung konnte nicht abgeschlossen werden." }, { status: 503 }), request);
  }
}
