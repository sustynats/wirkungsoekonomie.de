import { NextResponse } from "next/server";
import { listPublishedCases } from "@/lib/cases";
import { publicCase } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ data: listPublishedCases("RADAR").map(publicCase), dataStatus: "editorial_seed_only" });
}
