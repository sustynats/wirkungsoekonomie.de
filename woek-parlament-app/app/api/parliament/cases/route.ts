import { NextResponse } from "next/server";
import { publicCases } from "@/lib/public-api";

export async function GET() {
  return NextResponse.json({ data: await publicCases(), meta: { publicReadOnly: true, containsPublishedPoliticalVerdicts: false } });
}
