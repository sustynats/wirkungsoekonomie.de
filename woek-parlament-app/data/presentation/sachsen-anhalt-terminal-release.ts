import terminalRelease from "../fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-six-party-terminal-release-v1.json";

export type SachsenAnhaltTerminalParty = (typeof terminalRelease.parties)[number];

export const saxonyAnhaltTerminalRelease = terminalRelease;

export const saxonyAnhaltTerminalPartyBySourceKey = new Map(
  terminalRelease.parties.map((party) => [party.source_key, party] as const),
);
