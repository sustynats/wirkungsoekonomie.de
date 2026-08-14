import { NextResponse } from "next/server";
import { getDipConfiguration, buildImportWindows } from "@/lib/dip";
import { publicCases } from "@/lib/public-api";
import { getSupabaseConfiguration } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function GET() {
  const dip = getDipConfiguration();
  const supabase = getSupabaseConfiguration();
  return NextResponse.json({
    data: (await publicCases()).filter((item) => item.type === "RADAR"),
    importStatus: dip.configured && supabase.configured ? "CONFIGURED_DAILY_LOOKAHEAD_DRAFT_ONLY" : "CONFIGURATION_INCOMPLETE",
    plannedWindows: buildImportWindows(new Date(), dip.requestedLeadDays)
  });
}
