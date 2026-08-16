import { supabaseRest } from "@/lib/database/supabase-admin";
import { isSafePublicSourceUrl } from "@/lib/sources/public-registry";
import { listMemberImpactProfiles } from "@/lib/members/impact-profiles";

type VoteEventRow = {
  external_vote_id: string;
  vote_date: string;
  official_title: string;
  source_url: string;
  is_named_vote: boolean;
};

export type PublicVoteReference = {
  externalVoteId: string;
  voteDate: string;
  title: string;
  sourceUrl: string;
  totals: Record<"YES" | "NO" | "ABSTENTION" | "DID_NOT_VOTE", number>;
  members: Array<{
    slug: string;
    name: string;
    faction: string;
    vote: "YES" | "NO" | "ABSTENTION" | "DID_NOT_VOTE";
  }>;
};

export async function getPublicVoteReference(externalVoteId: string): Promise<PublicVoteReference | null> {
  const safeId = externalVoteId.trim();
  if (!/^[A-Za-z0-9_-]{4,120}$/.test(safeId)) return null;
  let rows: VoteEventRow[] = [];
  try {
    rows = await supabaseRest<VoteEventRow[]>(
      `parliament.vote_events?external_vote_id=eq.${encodeURIComponent(safeId)}&is_named_vote=eq.true&select=external_vote_id,vote_date,official_title,source_url,is_named_vote&limit=1`
    );
  } catch {
    // The signed release below remains available if the operational database
    // is temporarily unavailable.
  }
  const releasedMembers = listMemberImpactProfiles().flatMap((profile) => {
    const decision = profile.decisions.find((item) => item.official_vote_id === safeId);
    return decision ? [{ slug: profile.member.profile_source_key, name: profile.member.name, faction: profile.member.faction_at_vote, vote: decision.official_vote }] : [];
  }).sort((left, right) => left.name.localeCompare(right.name, "de-DE"));
  const totals = releasedMembers.reduce<Record<"YES" | "NO" | "ABSTENTION" | "DID_NOT_VOTE", number>>((result, member) => {
    result[member.vote] += 1;
    return result;
  }, { YES: 0, NO: 0, ABSTENTION: 0, DID_NOT_VOTE: 0 });
  const row = rows[0];
  const sourceUrl = row ? isSafePublicSourceUrl(row.source_url) : null;
  if (row && sourceUrl) return { externalVoteId: row.external_vote_id, voteDate: row.vote_date, title: row.official_title, sourceUrl, totals, members: releasedMembers };
  const releasedDecision = listMemberImpactProfiles().flatMap((profile) => profile.decisions).find((decision) => decision.official_vote_id === safeId);
  const releasedSourceUrl = releasedDecision ? isSafePublicSourceUrl(releasedDecision.source_url) : null;
  return releasedDecision && releasedSourceUrl ? {
    externalVoteId: releasedDecision.official_vote_id,
    voteDate: releasedDecision.decision_date,
    title: releasedDecision.decision_object,
    sourceUrl: releasedSourceUrl,
    totals,
    members: releasedMembers
  } : null;
}
