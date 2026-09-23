export type StateElectionResultStatus = "NOT_AVAILABLE" | "PRELIMINARY" | "FINAL_OFFICIAL";

export type StateElectionCycle = {
  election_cycle_id: string;
  jurisdiction_id: string;
  election_date: string;
  election_cycle_state?: string;
  status: string;
  official_source_refs: string[];
  programme_collection_status: string;
  programme_analysis_status?: string;
  result_status: StateElectionResultStatus;
  coalition_formation_status?: string;
  new_government_status?: string;
};

export type StateElectionResultSource = {
  election_cycle_id: string;
  jurisdiction_id: string;
  election_date: string;
  result_status: Exclude<StateElectionResultStatus, "NOT_AVAILABLE">;
  source_url: string;
  allowed_host: string;
  required_markers: string[];
};

export function officialResultPageMatches(source: StateElectionResultSource, html: string) {
  const url = new URL(source.source_url);
  if (url.protocol !== "https:" || url.hostname !== source.allowed_host) return false;
  const normalized = html.replace(/\s+/g, " ").toLocaleLowerCase("de-DE");
  return source.required_markers.length > 0 && source.required_markers.every((marker) => normalized.includes(marker.toLocaleLowerCase("de-DE")));
}

export function applyOfficialResultPage(args: {
  cycle: StateElectionCycle;
  source: StateElectionResultSource;
  html: string;
  today: string;
}) {
  const { cycle, source, html, today } = args;
  if (cycle.election_cycle_id !== source.election_cycle_id || cycle.jurisdiction_id !== source.jurisdiction_id) return { cycle, changed: false };
  if (cycle.election_date !== source.election_date || source.election_date > today) return { cycle, changed: false };
  if (!officialResultPageMatches(source, html)) return { cycle, changed: false };

  const next: StateElectionCycle = {
    ...cycle,
    election_cycle_state: "ELECTION_RESULT",
    status: "ELECTION_COMPLETE",
    result_status: source.result_status,
    official_source_refs: [...new Set([...cycle.official_source_refs, source.source_url])],
  };
  return { cycle: next, changed: JSON.stringify(next) !== JSON.stringify(cycle) };
}
