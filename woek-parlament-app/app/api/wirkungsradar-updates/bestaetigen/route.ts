import { NextResponse } from "next/server";
import { SubscriptionConfirmationError, confirmSubscription } from "@/lib/wirkungsradar/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { subscription, token, unsubscribe_token } = await request.json() as { subscription?: string; token?: string; unsubscribe_token?: string };
    if (!subscription || !token) return NextResponse.json({ error: "Ungültiger Bestätigungslink." }, { status: 400 });
    return NextResponse.json(await confirmSubscription(subscription, token, unsubscribe_token));
  } catch (error) {
    if (error instanceof SubscriptionConfirmationError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Die Bestätigung konnte nicht abgeschlossen werden." }, { status: 503 });
  }
}
