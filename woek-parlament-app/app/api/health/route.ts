import { NextResponse } from "next/server";
import { getDipConfiguration } from "@/lib/dip";

export const dynamic = "force-dynamic";

export function GET() {
  const dip = getDipConfiguration();
  return NextResponse.json({ status: "ok", service: "woek-parlament-app", dip: { status: dip.configured ? "configured_not_run" : "disabled_missing_key", leadDays: dip.requestedLeadDays } });
}
