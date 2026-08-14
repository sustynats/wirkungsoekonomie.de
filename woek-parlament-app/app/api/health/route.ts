import { NextResponse } from "next/server";
import { getDipConfiguration } from "@/lib/dip";
import { getSupabaseConfiguration } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export function GET() {
  const dip = getDipConfiguration();
  const supabase = getSupabaseConfiguration();
  return NextResponse.json({
    status: "ok",
    service: "woek-parlament-app",
    dip: { status: dip.configured ? "configured" : "disabled_missing_key", leadDays: dip.requestedLeadDays },
    supabase: { status: supabase.configured ? "configured" : "disabled_missing_server_credentials" }
  });
}
