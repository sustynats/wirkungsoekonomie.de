import { NextResponse } from "next/server";
import { SubscriptionConfirmationError, unsubscribe } from "@/lib/wirkungsradar/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { subscription, token } = await request.json() as { subscription?: string; token?: string };
    if (!subscription || !token) return NextResponse.json({ error: "Ungültiger Abmeldelink." }, { status: 400 });
    return NextResponse.json(await unsubscribe(subscription, token));
  } catch (error) {
    if (error instanceof SubscriptionConfirmationError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Die Abmeldung konnte nicht abgeschlossen werden." }, { status: 503 });
  }
}
