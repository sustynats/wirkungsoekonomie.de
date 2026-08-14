import { NextResponse } from "next/server";
import { getDipConfiguration, buildImportWindows } from "@/lib/dip";
import { publicCases } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export function GET() {
  const dip = getDipConfiguration();
  return NextResponse.json({
    data: publicCases().filter((item) => item.type === "RADAR"),
    importStatus: dip.configured ? "CONFIGURED_NO_SCHEDULED_IMPORT" : "DIP_API_KEY_MISSING",
    plannedWindows: buildImportWindows(new Date(), dip.requestedLeadDays)
  });
}
