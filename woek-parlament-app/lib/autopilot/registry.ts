import registryData from "@/data/political-jurisdictions.json";

export type JurisdictionType = "FEDERAL" | "STATE" | "EU";
export type StateLifecycle = "DORMANT" | "PRE_ELECTION_WATCH" | "PROGRAMME_ANALYSIS" | "ELECTION_RESULT" | "COALITION_FORMATION" | "GOVERNMENT_FORMED" | "GOVERNMENT_MONITORING" | "TRANSITION_TO_NEXT_TERM";

export type PoliticalJurisdiction = {
  jurisdiction_id: string;
  jurisdiction_type: JurisdictionType;
  name: string;
  active_term_id: string;
  lifecycle_state: StateLifecycle | string;
  next_election_date: string | null;
  last_checked_at: string | null;
  source_status: string;
  monitoring_enabled: boolean;
  institutional_terms?: {
    european_parliament_term_id: string;
    european_parliament_term_start: string;
    european_commission_term_id: string;
    european_commission_term_start: string;
  };
};

const slugById: Record<string, string> = {
  "de-bw": "baden-wuerttemberg", "de-by": "bayern", "de-be": "berlin", "de-bb": "brandenburg",
  "de-hb": "bremen", "de-hh": "hamburg", "de-he": "hessen", "de-mv": "mecklenburg-vorpommern",
  "de-ni": "niedersachsen", "de-nw": "nordrhein-westfalen", "de-rp": "rheinland-pfalz", "de-sl": "saarland",
  "de-sn": "sachsen", "de-st": "sachsen-anhalt", "de-sh": "schleswig-holstein", "de-th": "thueringen",
};

export const politicalJurisdictions = registryData.jurisdictions as PoliticalJurisdiction[];
export const stateJurisdictions = politicalJurisdictions.filter((entry) => entry.jurisdiction_type === "STATE");

export function stateSlug(jurisdictionId: string) {
  return slugById[jurisdictionId] ?? jurisdictionId.replace(/^de-/, "");
}

export function stateJurisdictionBySlug(slug: string) {
  return stateJurisdictions.find((entry) => stateSlug(entry.jurisdiction_id) === slug);
}

export function lifecycleLabel(state: string) {
  const labels: Record<string, string> = {
    DORMANT: "Amtliche Quellen werden beobachtet",
    PRE_ELECTION_WATCH: "Wahl steht an",
    PROGRAMME_ANALYSIS: "Programme in Analyse",
    ELECTION_RESULT: "Wahlergebnis wird eingeordnet",
    COALITION_FORMATION: "Regierungsbildung",
    GOVERNMENT_FORMED: "Neue Regierung gebildet",
    GOVERNMENT_MONITORING: "Regierungsmonitor aktiv",
    TRANSITION_TO_NEXT_TERM: "Übergang zur nächsten Wahlperiode",
  };
  return labels[state] ?? "Status offen";
}
