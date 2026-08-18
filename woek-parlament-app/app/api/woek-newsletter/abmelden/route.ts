import { NextResponse } from "next/server";
import { clearNewsletterSession } from "@/lib/woek-newsletter/http";
import { NewsletterConfirmationError, unsubscribeNewsletter } from "@/lib/woek-newsletter/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { subscription, token } = await request.json() as { subscription?: string; token?: string };
    if (!subscription || !token) return NextResponse.json({ error: "Ungültiger Abmeldelink." }, { status: 400 });
    const response = NextResponse.json(await unsubscribeNewsletter(subscription, token));
    clearNewsletterSession(response);
    return response;
  } catch (error) {
    if (error instanceof NewsletterConfirmationError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Die Abmeldung konnte nicht abgeschlossen werden." }, { status: 503 });
  }
}
