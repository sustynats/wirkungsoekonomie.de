import { stateJurisdictions, stateSlug } from "./autopilot/registry";
import { statePublicContent } from "./states/public-content";
import { saxonyAnhaltTerminalRelease } from "../data/presentation/sachsen-anhalt-terminal-release";
import { effectPhases } from "./presentation/impact-signature";
import type { RegisterObject } from "./register-model";

export const stateReviewCategories = [
  { id: "complete", symbol: "✓", label: "Prüfpaket vollständig", compactLabel: "Voll" },
  { id: "initial", symbol: "◐", label: "Initialer Fachstand", compactLabel: "Initial" },
  { id: "materiality", symbol: "◇", label: "Materialitätsreview", compactLabel: "Teil" },
  { id: "open", symbol: "?", label: "Ausdrücklich offen", compactLabel: "Offen" },
] as const;
export type StateReviewCategory = typeof stateReviewCategories[number]["id"];

/** Classifies the explicitly published scope, never all government activity in a state. */
export function stateReviewStand() {
  const terminal = saxonyAnhaltTerminalRelease;
  const terminalVerified = terminal.status === "TERMINAL_6_OF_6"
    && terminal.parties.length === terminal.expected_party_count
    && terminal.terminal_party_count === terminal.parties.length
    && Object.values(terminal.gates).every((gate) => gate.startsWith("PASS"))
    && terminal.parties.every((party) => party.terminal_fach_gate.startsWith("PASS") && party.source_gap_count === 0);
  return stateJurisdictions.map((state) => {
    const slug = stateSlug(state.jurisdiction_id);
    const review = statePublicContent[slug]?.review;
    const category: StateReviewCategory = slug === terminal.jurisdiction && terminalVerified ? "complete"
      : review?.area === "regierung" ? "initial" : review?.area === "wahl" ? "materiality" : "open";
    const definition = stateReviewCategories.find((item) => item.id === category)!;
    return {
      id: state.jurisdiction_id, abbreviation: state.jurisdiction_id.replace("DE-", ""), slug, name: state.name,
      category, symbol: definition.symbol, label: definition.label, compactLabel: definition.compactLabel,
      detail: category === "complete" ? `${terminal.parties.length} freigegebene Wahlprogramme 2026; kein Vollständigkeitsurteil über das gesamte Land.`
        : review?.shortLabel ?? "Kein veröffentlichter Fachstand in diesem Prüfpaket ausgewiesen.",
      source: category === "complete" ? "data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-six-party-terminal-release-v1.json"
        : review?.repoPath ?? "data/political-jurisdictions.json",
    };
  });
}

/** Absolute counts of published register records. Unknown phase remains its own category. */
export function portalStand(objects: RegisterObject[], radarSlugs: string[]) {
  if (new Set(objects.map((item) => item.id)).size !== objects.length) throw new Error("Duplicate portal register IDs");
  const dates = objects.flatMap((item) => item.date && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(item.date) ? [item.date.slice(0, 10)] : []).sort();
  const states = stateReviewStand();
  const stages = [...effectPhases.map((phase, index) => ({ ...phase, symbol: String(index + 1) })), { id: "open", label: "Offen / nicht zugeordnet", symbol: "?" }];
  return {
    published: objects.length,
    radar: new Set(radarSlugs).size,
    states, statesWithReview: states.filter((state) => state.category !== "open").length,
    stateDistribution: stateReviewCategories.map((category) => ({ ...category, count: states.filter((state) => state.category === category.id).length })),
    maturity: stages.map((stage) => ({ ...stage, count: objects.filter((item) => (item.signature.maturity.phase ?? "open") === stage.id).length })),
    latestRecordDate: dates.at(-1) ?? null,
    undatedRecords: objects.length - dates.length,
    // No explicit official-source Fach-verification field exists. Registration is not review.
    reviewedOfficialSources: null,
  };
}

export type PortalStand = ReturnType<typeof portalStand>;
