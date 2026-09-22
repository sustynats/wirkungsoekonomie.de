import { NextResponse } from "next/server";
import { listPublishedCases } from "@/lib/cases";
import { publicCase } from "@/lib/public-api";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ data: listPublishedCases().map(publicCase), dataStatus: "published_only" });
}
