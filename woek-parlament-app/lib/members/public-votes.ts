import { supabaseRest } from "@/lib/database/supabase-admin";
import { isSafePublicSourceUrl } from "@/lib/sources/public-registry";

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
};

export async function getPublicVoteReference(externalVoteId: string): Promise<PublicVoteReference | null> {
  const safeId = externalVoteId.trim();
  if (!/^[A-Za-z0-9_-]{4,120}$/.test(safeId)) return null;
  const rows = await supabaseRest<VoteEventRow[]>(
    `parliament.vote_events?external_vote_id=eq.${encodeURIComponent(safeId)}&is_named_vote=eq.true&select=external_vote_id,vote_date,official_title,source_url,is_named_vote&limit=1`
  );
  const row = rows[0];
  const sourceUrl = row ? isSafePublicSourceUrl(row.source_url) : null;
  if (!row || !sourceUrl) return null;
  return { externalVoteId: row.external_vote_id, voteDate: row.vote_date, title: row.official_title, sourceUrl };
}
