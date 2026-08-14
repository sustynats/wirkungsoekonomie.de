import { NextResponse } from "next/server";
import { publicCases } from "@/lib/public-api";

export function GET() {
  return NextResponse.json({ data: publicCases(), meta: { publicReadOnly: true, containsPublishedPoliticalVerdicts: false } });
}
