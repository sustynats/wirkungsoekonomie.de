import { searchableOfficialIdentifierText } from "@/lib/government/official-identifiers";
import { getGovernmentPublicData, readableInstitution } from "@/lib/government/public-data";
import type { GovernmentActionIndexEntry } from "@/lib/government/public-contract";

export const dynamic = "force-static";

export function GET() {
  const entries: GovernmentActionIndexEntry[] = getGovernmentPublicData().actions.map((action) => {
    const responsibleInstitutions = action.responsible_institutions.map(readableInstitution);
    return {
      id: action.government_action_id,
      title: action.title,
      actionType: action.action_type,
      responsibleInstitutions,
      decisionDate: action.decision_date,
      lifecycleStatus: action.lifecycle_status,
      coverageScopeStatus: action.coverage_scope_status,
      haystack: [action.title, ...responsibleInstitutions, searchableOfficialIdentifierText(action.official_identifiers)]
        .join(" ")
        .toLocaleLowerCase("de"),
    };
  });

  return Response.json(entries, {
    headers: { "cache-control": "public, max-age=0, s-maxage=31536000, immutable" },
  });
}
