import parliamentState from "@/data/generated/parliament-daily-state.json";
import governmentState from "@/data/government/impact-cases/public-impact-cases-meta.json";

export const dynamic = "force-static";

export function GET() {
  return Response.json({
    status: "ok",
    service: "woek-parlament-public",
    delivery: "static-cdn",
    backgroundExecution: "external",
    parliamentUpdatedAt: parliamentState.updated_at,
    governmentUpdatedAt: governmentState.generated_at,
  }, {
    headers: { "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" },
  });
}
