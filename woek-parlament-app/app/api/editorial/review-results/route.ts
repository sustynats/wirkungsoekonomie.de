import JSZip from "jszip";
import { NextResponse } from "next/server";
import { EditorialAuthorizationError, requireEditorialRequest } from "@/lib/editorial/auth";
import { DatabaseConfigurationError } from "@/lib/database/supabase-admin";
import { importReviewResult } from "@/lib/editorial/review-results";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxResultArchiveBytes = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    requireEditorialRequest(request);
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "A review result ZIP is required." }, { status: 400 });
    if (file.size === 0 || file.size > maxResultArchiveBytes) return NextResponse.json({ error: "Review result ZIP has an invalid size." }, { status: 400 });
    if (!file.name.toLowerCase().endsWith(".zip")) return NextResponse.json({ error: "Only ZIP review results are accepted." }, { status: 400 });

    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const resultEntries = Object.values(zip.files).filter((entry) => !entry.dir && /(^|\/)review-result\.json$/.test(entry.name));
    if (resultEntries.length === 0) return NextResponse.json({ error: "ZIP contains no review-result.json." }, { status: 400 });
    if (resultEntries.length > 15) return NextResponse.json({ error: "ZIP contains too many review results." }, { status: 400 });

    const results = [];
    for (const entry of resultEntries) {
      const content = await entry.async("string");
      results.push(await importReviewResult(JSON.parse(content)));
    }
    return NextResponse.json({ imported: results.length, results }, { status: 201 });
  } catch (error) {
    if (error instanceof EditorialAuthorizationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not import review result." }, { status: 422 });
  }
}
