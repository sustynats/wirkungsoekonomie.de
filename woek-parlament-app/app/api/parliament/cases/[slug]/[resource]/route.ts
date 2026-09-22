import { NextResponse } from "next/server";
import { getCase, listPublishedCases } from "@/lib/cases";
import { publicImpact, publicSources, publicVersions } from "@/lib/public-api";

export const dynamic = "force-static";
export const dynamicParams = false;

const publicResources = ["impact", "sources", "versions", "monitoring"] as const;

export function generateStaticParams() {
  return listPublishedCases().flatMap((item) => publicResources.map((resource) => ({ slug: item.slug, resource })));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string; resource: string }> }) {
  const { slug, resource } = await params;
  const item = getCase(slug);
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const body = resource === "impact" ? publicImpact(item) : resource === "sources" ? publicSources(item) : resource === "versions" ? publicVersions(item) : resource === "monitoring" ? { slug, observations: [], status: "CONTENT_REQUIRED" } : null;
  return body ? NextResponse.json({ data: body, dataStatus: "public_preview" }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
