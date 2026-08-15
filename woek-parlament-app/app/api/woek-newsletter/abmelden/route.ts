import { NextResponse } from "next/server";
import { allowedNewsletterOrigin, clearNewsletterSession, newsletterCors, newsletterPreflight } from "@/lib/woek-newsletter/http";
import { NewsletterConfirmationError, unsubscribeNewsletter } from "@/lib/woek-newsletter/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return newsletterPreflight(request);
}

export async function POST(request: Request) {
  if (!allowedNewsletterOrigin(request)) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  try {
    const { subscription, token } = await request.json() as { subscription?: string; token?: string };
    if (!subscription || !token) return newsletterCors(NextResponse.json({ error: "Ungültiger Abmeldelink." }, { status: 400 }), request);
    const response = NextResponse.json(await unsubscribeNewsletter(subscription, token));
    clearNewsletterSession(response);
    return newsletterCors(response, request);
  } catch (error) {
    if (error instanceof NewsletterConfirmationError) return newsletterCors(NextResponse.json({ error: error.message }, { status: 400 }), request);
    return newsletterCors(NextResponse.json({ error: "Die Abmeldung konnte nicht abgeschlossen werden." }, { status: 503 }), request);
  }
}
