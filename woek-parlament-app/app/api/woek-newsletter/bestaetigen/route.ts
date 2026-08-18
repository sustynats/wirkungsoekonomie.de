import { NextResponse } from "next/server";
import { setNewsletterSession } from "@/lib/woek-newsletter/http";
import { NewsletterConfirmationError, confirmNewsletterSubscription } from "@/lib/woek-newsletter/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { subscription, token, unsubscribe_token } = await request.json() as { subscription?: string; token?: string; unsubscribe_token?: string };
    if (!subscription || !token) return NextResponse.json({ error: "Ungültiger Bestätigungslink." }, { status: 400 });
    const result = await confirmNewsletterSubscription(subscription, token, unsubscribe_token);
    const response = NextResponse.json({ outcome: result.outcome });
    setNewsletterSession(response, result.session);
    return response;
  } catch (error) {
    if (error instanceof NewsletterConfirmationError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Die Bestätigung konnte nicht abgeschlossen werden." }, { status: 503 });
  }
}
