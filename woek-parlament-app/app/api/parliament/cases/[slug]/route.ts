import { NextResponse } from "next/server";
import { getCase } from "@/lib/cases";
import { toPublicCase } from "@/lib/public-api";
import { getPublishedPortalCase } from "@/lib/published-cases";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) {
    const published = await getPublishedPortalCase(slug);
    if (!published) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ data: published, provenance: { synthetic: false, publicationStatus: "PUBLISHED" } });
  }
  return NextResponse.json({ data: toPublicCase(item), provenance: { synthetic: item.editorialStatus === "DEMONSTRATOR", sourceCount: item.sources.length } });
}
