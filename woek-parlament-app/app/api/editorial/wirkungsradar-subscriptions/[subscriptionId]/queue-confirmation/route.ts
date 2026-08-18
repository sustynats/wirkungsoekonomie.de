import { NextResponse } from "next/server";
import { z } from "zod";
import { EditorialAuthorizationError, requireEditorialRequest } from "@/lib/editorial/auth";
import { SubscriptionConfirmationError, SubscriptionDeliveryConfigurationError, queueExistingConfirmation } from "@/lib/wirkungsradar/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const paramsSchema = z.object({ subscriptionId: z.string().uuid() });

export async function POST(request: Request, context: { params: Promise<{ subscriptionId: string }> }) {
  try {
    requireEditorialRequest(request);
    const { subscriptionId } = paramsSchema.parse(await context.params);
    return NextResponse.json(await queueExistingConfirmation(subscriptionId));
  } catch (error) {
    if (error instanceof EditorialAuthorizationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError || error instanceof SubscriptionConfirmationError) return NextResponse.json({ error: error instanceof Error ? error.message : "Ungültige Anfrage." }, { status: 400 });
    if (error instanceof SubscriptionDeliveryConfigurationError) return NextResponse.json({ error: "Der Bestätigungsversand ist nicht bereit." }, { status: 503 });
    return NextResponse.json({ error: "Die Bestätigung konnte nicht angestoßen werden." }, { status: 503 });
  }
}
