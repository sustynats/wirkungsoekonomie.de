export type MemberVote = "YES" | "NO" | "ABSTENTION" | "DID_NOT_VOTE";
export type PreferredVote = "YES" | "NO" | "ABSTENTION" | "NO_SCORE";
export type AgreementStatus = "ALIGNED" | "NOT_ALIGNED" | "ABSTAINED" | "DID_NOT_VOTE" | "NOT_SCORABLE";

/** Deterministic, personal-data-minimal classification for an official named vote. */
export function agreementForNamedVote(actualVote: MemberVote, preferredVote: PreferredVote): AgreementStatus {
  if (preferredVote === "NO_SCORE") return "NOT_SCORABLE";
  if (actualVote === "ABSTENTION") return "ABSTAINED";
  if (actualVote === "DID_NOT_VOTE") return "DID_NOT_VOTE";
  return actualVote === preferredVote ? "ALIGNED" : "NOT_ALIGNED";
}

export type VoteLedgerSummary = {
  scorable: number;
  aligned: number;
  notAligned: number;
  abstained: number;
  didNotVote: number;
  notScorable: number;
};

export function summarizeVoteLedger(statuses: AgreementStatus[]): VoteLedgerSummary {
  const summary: VoteLedgerSummary = { scorable: 0, aligned: 0, notAligned: 0, abstained: 0, didNotVote: 0, notScorable: 0 };
  for (const status of statuses) {
    if (status === "ALIGNED") { summary.aligned += 1; summary.scorable += 1; }
    if (status === "NOT_ALIGNED") { summary.notAligned += 1; summary.scorable += 1; }
    if (status === "ABSTAINED") summary.abstained += 1;
    if (status === "DID_NOT_VOTE") summary.didNotVote += 1;
    if (status === "NOT_SCORABLE") summary.notScorable += 1;
  }
  return summary;
}
