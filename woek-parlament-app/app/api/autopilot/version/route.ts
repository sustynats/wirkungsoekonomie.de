import { NextResponse } from "next/server";
import parliamentState from "@/data/generated/parliament-daily-state.json";
import governmentState from "@/data/government/impact-cases/public-impact-cases-meta.json";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    parliament_public_hash: parliamentState.source_hash,
    parliament_updated_at: parliamentState.updated_at,
    government_public_hash: governmentState.source_hash,
    government_updated_at: governmentState.generated_at,
    schema_version: parliamentState.schema_version,
  }, { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } });
}
