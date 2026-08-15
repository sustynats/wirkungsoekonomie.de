import { NextResponse } from "next/server";
import { z } from "zod";
import { EditorialAuthorizationError, requireEditorialRequest } from "@/lib/editorial/auth";
import { DatabaseConfigurationError } from "@/lib/database/supabase-admin";
import { importCommitmentAssessment, importCommitmentDecisionLink, importCommitmentRegister } from "@/lib/editorial/commitment-comparisons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("IMPORT_COMMITMENT_REGISTER"), payload: z.unknown() }),
  z.object({ operation: z.literal("IMPORT_DECISION_LINK"), payload: z.unknown() }),
  z.object({ operation: z.literal("IMPORT_IMPACT_ASSESSMENT"), payload: z.unknown() })
]);

export async function POST(request: Request) {
  try {
    requireEditorialRequest(request);
    const body = requestSchema.parse(await request.json());
    const result = body.operation === "IMPORT_COMMITMENT_REGISTER"
      ? await importCommitmentRegister(body.payload)
      : body.operation === "IMPORT_DECISION_LINK"
        ? await importCommitmentDecisionLink(body.payload)
        : await importCommitmentAssessment(body.payload);
    return NextResponse.json({ operation: body.operation, result }, { status: 201 });
  } catch (error) {
    if (error instanceof EditorialAuthorizationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "The commitment comparison payload is invalid.", details: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not import commitment comparison data." }, { status: 422 });
  }
}
