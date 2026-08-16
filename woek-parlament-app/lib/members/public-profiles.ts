import { supabaseRest } from "@/lib/database/supabase-admin";
import { fetchOfficialCurrentMembersCached, memberSlug } from "@/lib/bundestag/member-stammdaten";
import { summarizeVoteLedger, type AgreementStatus, type MemberVote, type PreferredVote } from "@/lib/members/vote-ledger";

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

type VoteRow = {
  id: string;
  actual_vote: MemberVote;
  parliamentary_group_at_vote: string | null;
  source_url: string;
  vote_event: {
    external_vote_id: string;
    vote_date: string;
    official_title: string;
    source_url: string;
  } | null;
};

type LedgerRow = {
  member_vote_id: string;
  preferred_vote_at_decision_time: PreferredVote;
  agreement_status: AgreementStatus;
  materiality_class: "VERY_HIGH" | "HIGH" | "MEDIUM" | "WATCH" | null;
  ex_post_confirmation_status: string | null;
  evidence_refs: string[];
};

export type PublicMemberProfile = {
  slug: string;
  displayName: string;
  officialMemberUrl: string;
  parliamentaryGroup: string | null;
  federalState: string | null;
  constituency: string | null;
  mandateType: string | null;
  portrait: { sourceUrl: string; credit: string; termsUrl: string } | null;
  summary: ReturnType<typeof summarizeVoteLedger>;
  votes: Array<{
    officialVoteId: string;
    voteDate: string;
    title: string;
    sourceUrl: string;
    actualVote: MemberVote;
    preferredVote: PreferredVote;
    agreementStatus: AgreementStatus;
    materiality: "VERY_HIGH" | "HIGH" | "MEDIUM" | "WATCH" | null;
    exPostStatus: string | null;
  }>;
};

function toPublicProfile(row: MemberRow) {
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

async function officialRosterProfiles() {
  return (await fetchOfficialCurrentMembersCached()).map((member) => ({
    slug: memberSlug(member),
    displayName: member.displayName,
    officialMemberUrl: member.officialMemberUrl,
    parliamentaryGroup: member.parliamentaryGroup,
    federalState: member.federalState,
    constituency: member.constituency,
    mandateType: member.mandateType,
    portrait: null
  }));
}

export async function listPublishedMemberProfiles() {
  const official = await officialRosterProfiles();
  try {
    // The roster is official public source data. Analytical statements stay
    // protected by the separate public_eligible ledger flag below.
    const rows = await supabaseRest<MemberRow[]>("parliament.members?status=eq.ACTIVE&select=id,slug,display_name,official_member_url,parliamentary_group,federal_state,constituency,mandate_type,portrait_status,portrait_source_url,portrait_credit,portrait_usage_terms_url&order=display_name.asc&limit=800");
    const storedBySlug = new Map(rows.map((row) => [row.slug, toPublicProfile(row)]));
    return official.map((profile) => {
      const stored = storedBySlug.get(profile.slug);
      return stored ? {
        ...profile,
        ...stored,
        federalState: stored.federalState ?? profile.federalState,
        constituency: stored.constituency ?? profile.constituency,
        mandateType: stored.mandateType ?? profile.mandateType
      } : profile;
    });
  } catch {
    // A database interruption must not erase the official public roster.
  }
  return official;
}

export async function getPublishedMemberProfile(slug: string): Promise<PublicMemberProfile | null> {
  const official = (await officialRosterProfiles()).find((profile) => profile.slug === slug);
  if (!official) return null;
  let member: MemberRow | undefined;
  try {
    const memberRows = await supabaseRest<MemberRow[]>(`parliament.members?slug=eq.${encodeURIComponent(slug)}&status=eq.ACTIVE&select=id,slug,display_name,official_member_url,parliamentary_group,federal_state,constituency,mandate_type,portrait_status,portrait_source_url,portrait_credit,portrait_usage_terms_url&limit=1`);
    member = memberRows[0];
  } catch {
    // Fall back to the cached official source below.
  }
  if (!member) {
    return { ...official, summary: summarizeVoteLedger([]), votes: [] };
  }
  const votes = await supabaseRest<VoteRow[]>(`parliament.member_votes?member_id=eq.${encodeURIComponent(member.id)}&select=id,actual_vote,parliamentary_group_at_vote,source_url,vote_event:vote_events(external_vote_id,vote_date,official_title,source_url)&order=imported_at.desc&limit=500`);
  const stored = toPublicProfile(member);
  const baseProfile = {
    ...official,
    ...stored,
    federalState: stored.federalState ?? official.federalState,
    constituency: stored.constituency ?? official.constituency,
    mandateType: stored.mandateType ?? official.mandateType
  };
  if (votes.length === 0) return { ...baseProfile, summary: summarizeVoteLedger([]), votes: [] };
  const voteIds = votes.map((vote) => vote.id).join(",");
  const ledgerRows = await supabaseRest<LedgerRow[]>(`parliament.member_vote_impact_ledger?member_vote_id=in.(${encodeURIComponent(voteIds)})&public_eligible=eq.true&select=member_vote_id,preferred_vote_at_decision_time,agreement_status,materiality_class,ex_post_confirmation_status,evidence_refs&limit=500`);
  const ledgers = new Map(ledgerRows.map((ledger) => [ledger.member_vote_id, ledger]));
  const publishedVotes = votes.flatMap((vote) => {
    const ledger = ledgers.get(vote.id);
    if (!ledger || !vote.vote_event) return [];
    return [{
      officialVoteId: vote.vote_event.external_vote_id,
      voteDate: vote.vote_event.vote_date,
      title: vote.vote_event.official_title,
      sourceUrl: vote.vote_event.source_url,
      actualVote: vote.actual_vote,
      preferredVote: ledger.preferred_vote_at_decision_time,
      agreementStatus: ledger.agreement_status,
      materiality: ledger.materiality_class,
      exPostStatus: ledger.ex_post_confirmation_status
    }];
  });
  return { ...baseProfile, summary: summarizeVoteLedger(publishedVotes.map((vote) => vote.agreementStatus)), votes: publishedVotes };
}
