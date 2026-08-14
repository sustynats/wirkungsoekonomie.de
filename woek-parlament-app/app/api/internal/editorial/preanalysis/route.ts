import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runDeterministicPreAnalysis } from "@/lib/editorial/preanalysis";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const requestSchema = z.object({ caseId: z.string().uuid() });

function isAuthorized(request: NextRequest) {
  const secret = process.env.EDITORIAL_WORKER_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  try {
    const result = await runDeterministicPreAnalysis(parsed.data.caseId);
    return NextResponse.json({ data: result, notice: "The result is an internal task package, never a publication or political verdict." });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PREANALYSIS_FAILED";
    return NextResponse.json({ error: "PREANALYSIS_FAILED", code }, { status: 502 });
  }
}
