import { NextResponse } from "next/server";
import { EditorialAuthorizationError, requireEditorialRequest } from "@/lib/editorial/auth";
import { SubscriptionDeliveryConfigurationError, sendConfiguredDeliveryTest } from "@/lib/wirkungsradar/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireEditorialRequest(request);
    return NextResponse.json(await sendConfiguredDeliveryTest());
  } catch (error) {
    if (error instanceof EditorialAuthorizationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof SubscriptionDeliveryConfigurationError) return NextResponse.json({ error: "Der geschützte E-Mail-Test ist noch nicht bereit." }, { status: 503 });
    console.error("Wirkungsradar SMTP delivery test failed", { message: error instanceof Error ? error.message : "Unknown failure" });
    return NextResponse.json({ error: "Der E-Mail-Test konnte nicht zugestellt werden." }, { status: 503 });
  }
}
