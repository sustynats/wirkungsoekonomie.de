import { supabaseRest } from "@/lib/database/supabase-admin";
import { fetchOfficialCurrentMembersCached, memberSlug, normalizedMemberName, type OfficialMemberRecord } from "@/lib/bundestag/member-stammdaten";
import { getMemberImpactProfileByOfficialName, getMemberImpactProfileBySourceKey, listMemberImpactProfiles, type MemberImpactProfile } from "@/lib/members/impact-profiles";

type MemberRow = {
  id: string;
  slug: string;
  display_name: string;
  official_member_url: string;
  parliamentary_group: string | null;
  federal_state: string | null;
  constituency: string | null;
  mandate_type: string | null;
  portrait_status: "NOT_USED" | "AWAITING_RIGHTS_CHECK" | "VERIFIED_FOR_USE" | "WITHDRAWN";
  portrait_source_url: string | null;
  portrait_credit: string | null;
  portrait_usage_terms_url: string | null;
};

export type PublicMemberDirectoryProfile = {
  slug: string;
  displayName: string;
  officialMemberUrl: string;
  parliamentaryGroup: string | null;
  federalState: string | null;
  constituency: string | null;
  mandateType: string | null;
  portrait: { sourceUrl: string; credit: string; termsUrl: string } | null;
  currentMandate: boolean;
  impactProfileAvailable: boolean;
  documentedVotes: number;
  coverageStatus: string | null;
};

export type PublicMemberProfile = PublicMemberDirectoryProfile & {
  impactProfile: MemberImpactProfile | null;
};

function storedPresentation(row: MemberRow) {
  return {
    slug: row.slug,
    displayName: row.display_name,
    officialMemberUrl: row.official_member_url,
    parliamentaryGroup: row.parliamentary_group,
    federalState: row.federal_state,
    constituency: row.constituency,
    mandateType: row.mandate_type,
    portrait: row.portrait_status === "VERIFIED_FOR_USE" && row.portrait_source_url && row.portrait_credit && row.portrait_usage_terms_url
      ? { sourceUrl: row.portrait_source_url, credit: row.portrait_credit, termsUrl: row.portrait_usage_terms_url }
      : null
  };
}

function officialPresentation(member: OfficialMemberRecord): PublicMemberDirectoryProfile {
  const impactProfile = getMemberImpactProfileByOfficialName(member.familyName, member.givenName);
  return {
    slug: memberSlug(member),
    displayName: member.displayName,
    officialMemberUrl: member.officialMemberUrl,
    parliamentaryGroup: member.parliamentaryGroup,
    federalState: member.federalState,
    constituency: member.constituency,
    mandateType: member.mandateType,
    portrait: null,
    currentMandate: true,
    impactProfileAvailable: Boolean(impactProfile),
    documentedVotes: impactProfile?.coverage.official_member_vote_records_ingested ?? 0,
    coverageStatus: impactProfile?.coverage.coverage_status ?? null
  };
}

function historicalPresentation(profile: MemberImpactProfile): PublicMemberDirectoryProfile {
  return {
    slug: profile.member.profile_source_key,
    displayName: profile.member.name,
    officialMemberUrl: "https://www.bundestag.de/abgeordnete",
    parliamentaryGroup: profile.member.faction_at_vote,
    federalState: null,
    constituency: null,
    mandateType: "Mandat zum Abstimmungszeitpunkt",
    portrait: null,
    currentMandate: false,
    impactProfileAvailable: true,
    documentedVotes: profile.coverage.official_member_vote_records_ingested,
    coverageStatus: profile.coverage.coverage_status
  };
}

async function storedMemberRows() {
  try {
    return await supabaseRest<MemberRow[]>("parliament.members?select=id,slug,display_name,official_member_url,parliamentary_group,federal_state,constituency,mandate_type,portrait_status,portrait_source_url,portrait_credit,portrait_usage_terms_url&order=display_name.asc&limit=900");
  } catch {
    return [];
  }
}

async function officialMembers() {
  try {
    return await fetchOfficialCurrentMembersCached();
  } catch {
    return [];
  }
}

export async function listPublishedMemberProfiles(): Promise<PublicMemberDirectoryProfile[]> {
  const [official, stored] = await Promise.all([officialMembers(), storedMemberRows()]);
  const storedBySlug = new Map(stored.map((row) => [row.slug, storedPresentation(row)]));
  const usedImpactKeys = new Set<string>();
  const currentProfiles = official.map((member) => {
    const base = officialPresentation(member);
    const impact = getMemberImpactProfileByOfficialName(member.familyName, member.givenName);
    if (impact) usedImpactKeys.add(impact.member.profile_source_key);
    const db = storedBySlug.get(base.slug);
    return db ? {
      ...base,
      ...db,
      federalState: db.federalState ?? base.federalState,
      constituency: db.constituency ?? base.constituency,
      mandateType: db.mandateType ?? base.mandateType,
      currentMandate: true,
      impactProfileAvailable: base.impactProfileAvailable,
      documentedVotes: base.documentedVotes,
      coverageStatus: base.coverageStatus
    } : base;
  });
  const historicalProfiles = listMemberImpactProfiles().filter((profile) => !usedImpactKeys.has(profile.member.profile_source_key)).map(historicalPresentation);
  const profiles = currentProfiles.length > 0 ? [...currentProfiles, ...historicalProfiles] : listMemberImpactProfiles().map(historicalPresentation);
  return profiles.sort((left, right) => left.displayName.localeCompare(right.displayName, "de-DE"));
}

async function currentProfileForSlug(slug: string) {
  const official = (await officialMembers()).find((member) => memberSlug(member) === slug);
  if (!official) return null;
  const base = officialPresentation(official);
  const stored = (await storedMemberRows()).find((row) => row.slug === slug);
  const presentation = stored ? storedPresentation(stored) : null;
  const impactProfile = getMemberImpactProfileByOfficialName(official.familyName, official.givenName);
  return {
    ...base,
    ...(presentation ?? {}),
    federalState: presentation?.federalState ?? base.federalState,
    constituency: presentation?.constituency ?? base.constituency,
    mandateType: presentation?.mandateType ?? base.mandateType,
    currentMandate: true,
    impactProfileAvailable: Boolean(impactProfile),
    documentedVotes: impactProfile?.coverage.official_member_vote_records_ingested ?? 0,
    coverageStatus: impactProfile?.coverage.coverage_status ?? null,
    impactProfile
  } satisfies PublicMemberProfile;
}

export async function getPublishedMemberProfile(slug: string): Promise<PublicMemberProfile | null> {
  const current = await currentProfileForSlug(slug);
  if (current) return current;
  const impactProfile = getMemberImpactProfileBySourceKey(slug);
  if (!impactProfile) return null;
  return { ...historicalPresentation(impactProfile), impactProfile };
}

export function exactMemberProfileKey(familyName: string, givenName: string) {
  return normalizedMemberName(familyName, givenName);
}
