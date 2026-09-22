import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { buildSaxonyAnhaltProgrammeIndex } from "@/lib/presentation/sachsen-anhalt-programme-index";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return saxonyAnhaltElectionProgrammes.map((programme) => ({ sourceKey: programme.sourceKey }));
}

export async function GET(_: Request, context: { params: Promise<{ sourceKey: string }> }) {
  const { sourceKey } = await context.params;
  const payload = await buildSaxonyAnhaltProgrammeIndex(sourceKey);
  if (!payload) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json(payload, {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
