import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/database/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  let database = "unavailable";
  try {
    await supabaseRest<unknown[]>("parliament.parliaments?select=id&limit=1");
    database = "ready";
  } catch {
    // A health response must never disclose database URLs, provider details,
    // credentials, or internal error strings.
  }
  return NextResponse.json({
    status: "ok",
    service: "woek-parlament-app",
    database,
    dipImport: process.env.DIP_API_KEY ? "configured_not_scheduled" : "disabled_missing_key",
    timestamp: new Date().toISOString()
  });
}
