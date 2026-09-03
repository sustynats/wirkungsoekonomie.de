import { NextResponse } from "next/server";
import { SubscriptionConfirmationError, unsubscribe } from "@/lib/wirkungsradar/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const querySubscription = url.searchParams.get("subscription") ?? undefined;
    const queryToken = url.searchParams.get("token") ?? undefined;
    const contentType = request.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await request.json() as { subscription?: string; token?: string }
      : {};
    const subscription = body.subscription ?? querySubscription;
    const token = body.token ?? queryToken;
    if (!subscription || !token) return NextResponse.json({ error: "Ungültiger Abmeldelink." }, { status: 400 });
    return NextResponse.json(await unsubscribe(subscription, token));
  } catch (error) {
    if (error instanceof SubscriptionConfirmationError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Die Abmeldung konnte nicht abgeschlossen werden." }, { status: 503 });
  }
}
