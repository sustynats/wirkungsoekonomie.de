import { NextResponse } from "next/server";
import { getCase } from "@/lib/cases";
import { publicImpact, publicSources, publicVersions } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string; resource: string }> }) {
  const { slug, resource } = await params;
  const item = getCase(slug);
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const body = resource === "impact" ? publicImpact(item) : resource === "sources" ? publicSources(item) : resource === "versions" ? publicVersions(item) : resource === "monitoring" ? { slug, observations: [], status: "CONTENT_REQUIRED" } : null;
  return body ? NextResponse.json({ data: body, dataStatus: "editorial_seed_only" }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
