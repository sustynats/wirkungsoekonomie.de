import { NextResponse } from "next/server";
import { DatabaseConfigurationError } from "@/lib/database/supabase-admin";
import { requestSubscription, subscriptionDeliveryReady, subscriptionRequestSchema } from "@/lib/wirkungsradar/subscriptions";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sameSiteRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const expected = new URL(process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://parlament.wirkungsoekonomie.de").origin;
    return new URL(origin).origin === expected;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameSiteRequest(request)) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  if (!subscriptionDeliveryReady()) {
    return NextResponse.json({ error: "Die Anmeldung wird erst nach dem technischen Zustelltest freigeschaltet." }, { status: 503 });
  }
  try {
    const payload = subscriptionRequestSchema.parse(await request.json());
    const result = await requestSubscription(payload);
    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Bitte prüfen Sie die Angaben und bestätigen Sie die Einwilligung." }, { status: 400 });
    if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: "Die Anmeldung ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut." }, { status: 503 });
    return NextResponse.json({ error: "Die Anmeldung konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut." }, { status: 503 });
  }
}
