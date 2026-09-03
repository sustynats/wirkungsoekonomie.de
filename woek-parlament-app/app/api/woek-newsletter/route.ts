import { NextResponse } from "next/server";
import { DatabaseConfigurationError } from "@/lib/database/supabase-admin";
import { allowedNewsletterOrigin, clearNewsletterSession, newsletterCors, newsletterPreflight, readNewsletterSession } from "@/lib/woek-newsletter/http";
import { newsletterDeliveryReady, newsletterRequestSchema, newsletterSessionStatus, requestNewsletterSubscription } from "@/lib/woek-newsletter/subscriptions";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return newsletterPreflight(request);
}

export async function GET(request: Request) {
  if (!allowedNewsletterOrigin(request)) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  try {
    const state = await newsletterSessionStatus(readNewsletterSession(request));
    const response = NextResponse.json({ state, signup_available: newsletterDeliveryReady() }, { headers: { "Cache-Control": "no-store" } });
    if (state !== "active") clearNewsletterSession(response);
    return newsletterCors(response, request);
  } catch {
    return newsletterCors(NextResponse.json({ state: "unknown", signup_available: false }, { headers: { "Cache-Control": "no-store" } }), request);
  }
}

export async function POST(request: Request) {
  if (!allowedNewsletterOrigin(request)) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  if (!newsletterDeliveryReady()) return newsletterCors(NextResponse.json({ error: "Die Newsletter-Anmeldung ist derzeit nicht verfügbar." }, { status: 503 }), request);
  try {
    const result = await requestNewsletterSubscription(newsletterRequestSchema.parse(await request.json()));
    return newsletterCors(NextResponse.json(result, { status: 202 }), request);
  } catch (error) {
    if (error instanceof z.ZodError) return newsletterCors(NextResponse.json({ error: "Bitte prüfen Sie die E-Mail-Adresse und bestätigen Sie die Einwilligung." }, { status: 400 }), request);
    if (error instanceof DatabaseConfigurationError) return newsletterCors(NextResponse.json({ error: "Die Newsletter-Anmeldung ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut." }, { status: 503 }), request);
    return newsletterCors(NextResponse.json({ error: "Die Newsletter-Anmeldung konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut." }, { status: 503 }), request);
  }
}
