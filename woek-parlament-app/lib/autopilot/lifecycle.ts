/**
 * The executive term and an election cycle are deliberately independent.
 * A state government normally remains under GOVERNMENT_MONITORING while the
 * next election is already in PRE_ELECTION_WATCH or PROGRAMME_ANALYSIS.
 */
export type GovernmentLifecycleState =
  | "DORMANT"
  | "GOVERNMENT_FORMED"
  | "GOVERNMENT_MONITORING"
  | "TRANSITION_TO_NEXT_TERM";

export type ElectionCycleState =
  | "DORMANT"
  | "PRE_ELECTION_WATCH"
  | "PROGRAMME_ANALYSIS"
  | "ELECTION_RESULT"
  | "COALITION_FORMATION"
  | "GOVERNMENT_FORMED"
  | "CLOSED";

/** @deprecated Use GovernmentLifecycleState or ElectionCycleState explicitly. */
export type PoliticalLifecycleState = GovernmentLifecycleState | ElectionCycleState;

export type PoliticalLifecycleEvent =
  | "OFFICIAL_ELECTION_DATE_CONFIRMED"
  | "OFFICIAL_PROGRAMME_PUBLISHED"
  | "OFFICIAL_ELECTION_RESULT_FINAL"
  | "FORMATION_PROCESS_STARTED"
  | "NEW_GOVERNMENT_FORMED"
  | "MONITORING_ACTIVATED"
  | "TERM_TRANSITION_STARTED";

const electionTransitions: Record<ElectionCycleState, Partial<Record<PoliticalLifecycleEvent, ElectionCycleState>>> = {
  DORMANT: { OFFICIAL_ELECTION_DATE_CONFIRMED: "PRE_ELECTION_WATCH" },
  PRE_ELECTION_WATCH: { OFFICIAL_PROGRAMME_PUBLISHED: "PROGRAMME_ANALYSIS" },
  PROGRAMME_ANALYSIS: { OFFICIAL_ELECTION_RESULT_FINAL: "ELECTION_RESULT" },
  ELECTION_RESULT: { FORMATION_PROCESS_STARTED: "COALITION_FORMATION" },
  COALITION_FORMATION: { NEW_GOVERNMENT_FORMED: "GOVERNMENT_FORMED" },
  GOVERNMENT_FORMED: {},
  CLOSED: {},
};

export function nextElectionCycleState(current: ElectionCycleState, event: PoliticalLifecycleEvent) {
  const next = electionTransitions[current]?.[event];
  if (!next) throw new Error(`INVALID_LIFECYCLE_TRANSITION: ${current} + ${event}`);
  return next;
}

/** Backward-compatible name for callers that exclusively advance elections. */
export const nextPoliticalLifecycleState = nextElectionCycleState;

export function requiresProgrammeCollection(state: ElectionCycleState) {
  return state === "PRE_ELECTION_WATCH" || state === "PROGRAMME_ANALYSIS";
}

export function requiresGovernmentMonitoring(state: GovernmentLifecycleState) {
  return state === "GOVERNMENT_FORMED" || state === "GOVERNMENT_MONITORING";
}

export function closeTermOnlyAfterOfficialFormation(event: PoliticalLifecycleEvent) {
  return event === "NEW_GOVERNMENT_FORMED";
}

export type ElectionCycleStatus =
  | "ANNOUNCED"
  | "PROGRAMMES_COLLECTING"
  | "PROGRAMMES_REVIEW"
  | "ELECTION_COMPLETE"
  | "COALITION_FORMATION"
  | "GOVERNMENT_FORMED"
  | "CLOSED";

export function lifecycleStateForElectionCycle(status: ElectionCycleStatus): ElectionCycleState {
  const mapping: Record<ElectionCycleStatus, ElectionCycleState> = {
    ANNOUNCED: "PRE_ELECTION_WATCH",
    PROGRAMMES_COLLECTING: "PRE_ELECTION_WATCH",
    PROGRAMMES_REVIEW: "PROGRAMME_ANALYSIS",
    ELECTION_COMPLETE: "ELECTION_RESULT",
    COALITION_FORMATION: "COALITION_FORMATION",
    GOVERNMENT_FORMED: "GOVERNMENT_FORMED",
    CLOSED: "CLOSED",
  };
  return mapping[status];
}
