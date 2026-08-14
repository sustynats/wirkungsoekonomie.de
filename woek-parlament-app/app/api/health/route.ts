import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "woek-parlament-app",
    dipImport: process.env.DIP_API_KEY ? "configured_not_scheduled" : "disabled_missing_key",
    timestamp: new Date().toISOString()
  });
}
