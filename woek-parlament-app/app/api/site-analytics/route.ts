import { NextRequest, NextResponse } from "next/server";

const upstream = process.env.SITE_ANALYTICS_ENDPOINT ?? "https://fganranxrdyewbjpvubx.supabase.co/functions/v1/site-event";
const acceptedEvents = new Set(["page_view", "heartbeat"]);

type AnalyticsPayload = {
  eventType?: unknown;
  path?: unknown;
  title?: unknown;
  referrer?: unknown;
  sessionId?: unknown;
  visitorId?: unknown;
  site?: unknown;
  hostname?: unknown;
  device?: unknown;
};

function text(value: unknown, maximum: number) {
  return typeof value === "string" ? value.slice(0, maximum) : "";
}

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 16_384) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  let input: AnalyticsPayload;
  try { input = await request.json() as AnalyticsPayload; }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (typeof input.eventType !== "string" || !acceptedEvents.has(input.eventType)) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const payload = {
    eventType: input.eventType,
    path: text(input.path, 700),
    title: text(input.title, 300),
    referrer: text(input.referrer, 900),
    sessionId: text(input.sessionId, 100),
    visitorId: text(input.visitorId, 100),
    site: "parlament",
    hostname: text(input.hostname, 200),
    device: typeof input.device === "object" && input.device !== null ? input.device : {}
  };
  try {
    const response = await fetch(upstream, { method: "POST", headers: { "content-type": "application/json", origin: "https://parlament.wirkungsoekonomie.de" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(5_000), cache: "no-store" });
    if (!response.ok) return new NextResponse(null, { status: 202 });
  } catch {
    return new NextResponse(null, { status: 202 });
  }
  return new NextResponse(null, { status: 204 });
}
