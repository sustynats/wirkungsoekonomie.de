import { NextRequest, NextResponse } from "next/server";
import { runDipImport } from "@/lib/dip-import";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const allowedSecrets = [process.env.IMPORT_CRON_SECRET, process.env.CRON_SECRET].filter(Boolean);
  return allowedSecrets.some((secret) => authorization === `Bearer ${secret}`);
}

function requestedScope(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope")?.toUpperCase();
  return scope === "BOOTSTRAP" || scope === "LOOKAHEAD" || scope === "BOTH" ? scope : "LOOKAHEAD";
}

async function execute(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    const result = await runDipImport(requestedScope(request));
    return NextResponse.json({
      data: result,
      notice: result.status === "PARTIAL"
        ? "The DIP cursor checkpoint was stored. Invoke the same scope again to continue; no result set was silently truncated. Imported records remain DRAFT."
        : "The selected import window is complete. Imported records remain DRAFT and require editorial review before publication."
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "IMPORT_FAILED";
    return NextResponse.json({ error: "IMPORT_FAILED", code }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  return execute(request);
}

export async function POST(request: NextRequest) {
  return execute(request);
}
