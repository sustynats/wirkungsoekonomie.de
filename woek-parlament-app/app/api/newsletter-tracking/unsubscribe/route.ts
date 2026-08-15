import { NextResponse } from "next/server";
import { unsubscribeNewsletterDelivery } from "@/lib/newsletter-engagement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { delivery, token } = await request.json() as { delivery?: string; token?: string };
    if (!delivery || !token || !(await unsubscribeNewsletterDelivery(delivery, token))) {
      return NextResponse.json({ error: "Dieser Abmeldelink ist ungültig." }, { status: 400 });
    }
    return NextResponse.json({ outcome: "unsubscribed" });
  } catch (error) {
    console.error("Newsletter campaign unsubscribe failed", { message: error instanceof Error ? error.message : "Unknown failure" });
    return NextResponse.json({ error: "Die Abmeldung konnte nicht abgeschlossen werden." }, { status: 503 });
  }
}
