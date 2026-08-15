import { NextResponse } from "next/server";
import { getCase } from "@/lib/cases";
import { publicCase } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const item = getCase((await params).slug);
  return item ? NextResponse.json({ data: publicCase(item), dataStatus: "public_preview" }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
