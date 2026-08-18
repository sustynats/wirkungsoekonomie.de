export type PoliticalLifecycleState =
  | "DORMANT"
  | "PRE_ELECTION_WATCH"
  | "PROGRAMME_ANALYSIS"
  | "ELECTION_RESULT"
  | "COALITION_FORMATION"
  | "GOVERNMENT_FORMED"
  | "GOVERNMENT_MONITORING"
  | "TRANSITION_TO_NEXT_TERM";

export type PoliticalLifecycleEvent =
  | "OFFICIAL_ELECTION_DATE_CONFIRMED"
  | "OFFICIAL_PROGRAMME_PUBLISHED"
  | "OFFICIAL_ELECTION_RESULT_FINAL"
  | "FORMATION_PROCESS_STARTED"
  | "NEW_GOVERNMENT_FORMED"
  | "MONITORING_ACTIVATED"
  | "TERM_TRANSITION_STARTED";

const transitions: Record<PoliticalLifecycleState, Partial<Record<PoliticalLifecycleEvent, PoliticalLifecycleState>>> = {
  DORMANT: { OFFICIAL_ELECTION_DATE_CONFIRMED: "PRE_ELECTION_WATCH" },
  PRE_ELECTION_WATCH: { OFFICIAL_PROGRAMME_PUBLISHED: "PROGRAMME_ANALYSIS" },
  PROGRAMME_ANALYSIS: { OFFICIAL_ELECTION_RESULT_FINAL: "ELECTION_RESULT" },
  ELECTION_RESULT: { FORMATION_PROCESS_STARTED: "COALITION_FORMATION" },
  COALITION_FORMATION: { NEW_GOVERNMENT_FORMED: "GOVERNMENT_FORMED" },
  GOVERNMENT_FORMED: { MONITORING_ACTIVATED: "GOVERNMENT_MONITORING" },
  GOVERNMENT_MONITORING: {
    OFFICIAL_ELECTION_DATE_CONFIRMED: "PRE_ELECTION_WATCH",
    TERM_TRANSITION_STARTED: "TRANSITION_TO_NEXT_TERM",
  },
  TRANSITION_TO_NEXT_TERM: { NEW_GOVERNMENT_FORMED: "GOVERNMENT_FORMED" },
};

export function nextPoliticalLifecycleState(current: PoliticalLifecycleState, event: PoliticalLifecycleEvent) {
  const next = transitions[current]?.[event];
  if (!next) throw new Error(`INVALID_LIFECYCLE_TRANSITION: ${current} + ${event}`);
  return next;
}

export function requiresProgrammeCollection(state: PoliticalLifecycleState) {
  return state === "PRE_ELECTION_WATCH" || state === "PROGRAMME_ANALYSIS";
}

export function requiresGovernmentMonitoring(state: PoliticalLifecycleState) {
  return state === "GOVERNMENT_FORMED" || state === "GOVERNMENT_MONITORING";
}

export type ElectionCycleStatus =
  | "ANNOUNCED"
  | "PROGRAMMES_COLLECTING"
  | "PROGRAMMES_REVIEW"
  | "ELECTION_COMPLETE"
  | "COALITION_FORMATION"
  | "GOVERNMENT_FORMED"
  | "CLOSED";

export function lifecycleStateForElectionCycle(status: ElectionCycleStatus): PoliticalLifecycleState {
  const mapping: Record<ElectionCycleStatus, PoliticalLifecycleState> = {
    ANNOUNCED: "PRE_ELECTION_WATCH",
    PROGRAMMES_COLLECTING: "PRE_ELECTION_WATCH",
    PROGRAMMES_REVIEW: "PROGRAMME_ANALYSIS",
    ELECTION_COMPLETE: "ELECTION_RESULT",
    COALITION_FORMATION: "COALITION_FORMATION",
    GOVERNMENT_FORMED: "GOVERNMENT_FORMED",
    CLOSED: "GOVERNMENT_MONITORING",
  };
  return mapping[status];
}
