import { supabaseRest } from "@/lib/database/supabase-admin";
import { fetchOfficialCurrentMembers, memberSlug, normalizedMemberName, type OfficialMemberRecord } from "@/lib/bundestag/member-stammdaten";
import { listOfficialNamedVoteSources, parseOfficialNamedVoteWorkbook } from "@/lib/bundestag/named-votes";

type StoredMember = { id: string; external_member_id: string };
type StoredVoteEvent = { id: string };

async function persistMembers(members: OfficialMemberRecord[]) {
  await supabaseRest("parliament.members?on_conflict=external_member_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(members.map((member) => ({
      external_member_id: member.externalMemberId,
      slug: memberSlug(member),
      display_name: member.displayName,
      official_member_url: member.officialMemberUrl,
      parliamentary_group: member.parliamentaryGroup,
      federal_state: member.federalState,
      constituency: member.constituency,
      mandate_type: member.mandateType,
      status: "ACTIVE",
      publication_status: "DRAFT",
      portrait_status: "NOT_USED"
    })))
  });
  const stored = await supabaseRest<StoredMember[]>("parliament.members?select=id,external_member_id&status=eq.ACTIVE&limit=1000");
  return new Map(stored.map((member) => [member.external_member_id, member.id]));
}

async function knownSource(sourceUrl: string) {
  const rows = await supabaseRest<Array<{ id: string }>>(`parliament.vote_events?source_url=eq.${encodeURIComponent(sourceUrl)}&select=id&limit=1`);
  return rows[0]?.id ?? null;
}

async function knownSourceUrls(startDate: string, endDate: string) {
  const rows = await supabaseRest<Array<{ source_url: string }>>(
    `parliament.vote_events?select=source_url&is_named_vote=eq.true&vote_date=gte.${startDate}&vote_date=lte.${endDate}&limit=1000`
  );
  return new Set(rows.map((row) => row.source_url));
}

export async function importOfficialNamedVotes({ startDate, endDate, maximumVotes = 100 }: { startDate: string; endDate: string; maximumVotes?: number }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) throw new Error("Dates must use YYYY-MM-DD.");
  if (!Number.isInteger(maximumVotes) || maximumVotes < 1 || maximumVotes > 300) throw new Error("maximumVotes must be an integer between 1 and 300.");
  const members = await fetchOfficialCurrentMembers();
  const storedMemberIds = await persistMembers(members);
  const memberIdsByName = new Map<string, string[]>();
  for (const member of members) {
    const storedId = storedMemberIds.get(member.externalMemberId);
    if (!storedId) continue;
    const key = normalizedMemberName(member.familyName, member.givenName);
    memberIdsByName.set(key, [...(memberIdsByName.get(key) ?? []), storedId]);
  }
  const allSources = await listOfficialNamedVoteSources(startDate, endDate);
  const existingSources = await knownSourceUrls(startDate, endDate);
  // Each run advances to the next unimported official file.  This makes the
  // importer resumable after a network interruption without ever skipping an
  // earlier ballot or repeatedly stopping at an already imported batch.
  const sources = allSources.filter((source) => !existingSources.has(source.sourceUrl)).slice(0, maximumVotes);
  let importedVoteEvents = 0;
  let importedMemberVotes = 0;
  let unassignableRows = 0;
  let alreadyPresent = 0;
  for (const source of sources) {
    if (await knownSource(source.sourceUrl)) {
      alreadyPresent += 1;
      continue;
    }
    const response = await fetch(source.sourceUrl, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Official named vote workbook request failed with ${response.status} for ${source.sourceUrl}.`);
    let workbook;
    try {
      workbook = await parseOfficialNamedVoteWorkbook(source.sourceUrl, await response.arrayBuffer());
    } catch (error) {
      throw new Error(`Official named vote workbook could not be parsed (${source.sourceUrl}): ${error instanceof Error ? error.message : "unknown error"}`);
    }
    const eventRows = await supabaseRest<StoredVoteEvent[]>("parliament.vote_events?on_conflict=external_vote_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        external_vote_id: workbook.externalVoteId,
        vote_date: source.voteDate,
        official_title: source.officialTitle,
        source_url: source.sourceUrl,
        is_named_vote: true,
        result: { source_page_url: source.sourcePageUrl, legislative_term: workbook.legislativeTerm, sitting_number: workbook.sittingNumber, vote_number: workbook.voteNumber, unassignable_workbook_rows: workbook.unassignableRows }
      })
    });
    const event = eventRows[0];
    if (!event) throw new Error("Official named vote event could not be stored.");
    const memberVotes = workbook.rows.flatMap((row) => {
      const candidateMemberIds = memberIdsByName.get(normalizedMemberName(row.familyName, row.givenName)) ?? [];
      if (candidateMemberIds.length !== 1) {
        unassignableRows += 1;
        return [];
      }
      return [{
        member_id: candidateMemberIds[0],
        vote_event_id: event.id,
        actual_vote: row.actualVote,
        parliamentary_group_at_vote: row.parliamentaryGroup,
        source_url: row.sourceUrl
      }];
    });
    if (memberVotes.length > 0) {
      await supabaseRest("parliament.member_votes?on_conflict=member_id,vote_event_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify(memberVotes)
      });
    }
    importedVoteEvents += 1;
    importedMemberVotes += memberVotes.length;
    unassignableRows += workbook.unassignableRows;
  }
  return {
    membersImported: members.length,
    sourcesFound: allSources.length,
    sourcesSelected: sources.length,
    sourcesRemaining: Math.max(allSources.length - existingSources.size - sources.length, 0),
    importedVoteEvents,
    importedMemberVotes,
    unassignableRows,
    alreadyPresent
  };
}
