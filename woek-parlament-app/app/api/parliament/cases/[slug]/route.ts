import { NextResponse } from "next/server";
import { getCase } from "@/lib/cases";
import { toPublicCase } from "@/lib/public-api";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ data: toPublicCase(item), provenance: { synthetic: item.editorialStatus === "DEMONSTRATOR", sourceCount: item.sources.length } });
}
