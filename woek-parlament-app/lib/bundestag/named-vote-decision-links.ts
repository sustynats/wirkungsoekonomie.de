import { supabaseRest } from "@/lib/database/supabase-admin";

type VoteEvent = {
  id: string;
  case_id: string;
  decision_unit_id: string | null;
  result: Record<string, unknown>;
};

type NamedDecisionUnit = { id: string };

/**
 * A vote event may receive a decision-unit link only after its case has an
 * exact official-document bridge and that case has exactly one decision unit
 * marked as a named vote by the DIP import. Multiple candidates deliberately
 * remain unresolved rather than being selected by title similarity.
 */
export async function linkUniqueNamedVoteDecisionUnits() {
  const events = await supabaseRest<VoteEvent[]>(
    "parliament.vote_events?is_named_vote=eq.true&case_id=not.is.null&decision_unit_id=is.null&select=id,case_id,decision_unit_id,result&limit=500"
  );
  let linked = 0;
  let ambiguous = 0;
  let missing = 0;

  for (const event of events) {
    const units = await supabaseRest<NamedDecisionUnit[]>(
      `parliament.decision_units?case_id=eq.${encodeURIComponent(event.case_id)}&named_vote_available=eq.true&select=id&limit=20`
    );
    if (units.length === 1) {
      await supabaseRest(`parliament.vote_events?id=eq.${encodeURIComponent(event.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          decision_unit_id: units[0].id,
          result: { ...event.result, decision_unit_link_status: "LINKED_BY_UNIQUE_NAMED_DECISION", decision_unit_link_checked_at: new Date().toISOString() }
        })
      });
      linked += 1;
    } else if (units.length === 0) {
      await supabaseRest(`parliament.vote_events?id=eq.${encodeURIComponent(event.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ result: { ...event.result, decision_unit_link_status: "NO_NAMED_DECISION_UNIT", decision_unit_link_checked_at: new Date().toISOString() } })
      });
      missing += 1;
    } else {
      await supabaseRest(`parliament.vote_events?id=eq.${encodeURIComponent(event.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ result: { ...event.result, decision_unit_link_status: "AMBIGUOUS_NAMED_DECISION_UNIT", decision_unit_link_checked_at: new Date().toISOString() } })
      });
      ambiguous += 1;
    }
  }
  return { checked: events.length, linked, ambiguous, missing };
}
