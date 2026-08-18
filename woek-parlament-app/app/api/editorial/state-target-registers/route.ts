import { NextResponse } from "next/server";
import { z } from "zod";
import { EditorialAuthorizationError, requireEditorialRequest } from "@/lib/editorial/auth";
import { DatabaseConfigurationError } from "@/lib/database/supabase-admin";
import { importStateTargetRegister } from "@/lib/editorial/state-target-registers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireEditorialRequest(request);
    const result = await importStateTargetRegister(await request.json());
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof EditorialAuthorizationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "The state target register is invalid.", details: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not import state targets." }, { status: 422 });
  }
}
