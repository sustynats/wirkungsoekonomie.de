import registryData from "@/data/political-jurisdictions.json";

export type JurisdictionType = "FEDERAL" | "STATE" | "EU";
export type GovernmentLifecycle = "OUT_OF_INITIAL_SCOPE" | "LEGACY_TERM_NOT_BACKFILLED" | "GOVERNMENT_FORMATION" | "GOVERNMENT_MONITORING" | "TRANSITION_TO_NEXT_TERM" | "CLOSED";
export type ElectionLifecycle = "DORMANT" | "PRE_ELECTION_WATCH" | "PROGRAMME_ANALYSIS" | "ELECTION_RESULT" | "COALITION_FORMATION" | "GOVERNMENT_FORMED" | "CLOSED";

export type PoliticalJurisdiction = {
  jurisdiction_id: string;
  jurisdiction_type: JurisdictionType;
  name: string;
  active_term_id: string;
  active_government_term_id: string;
  government_lifecycle_state: GovernmentLifecycle | string;
  government_monitoring_scope_start: string | null;
  election_cycle_state: ElectionLifecycle | string;
  next_election_date: string | null;
  last_election_check: string | null;
  last_government_sync: string | null;
  last_fachreview: string | null;
  last_deploy: string | null;
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
  "DE-BW": "baden-wuerttemberg", "DE-BY": "bayern", "DE-BE": "berlin", "DE-BB": "brandenburg",
  "DE-HB": "bremen", "DE-HH": "hamburg", "DE-HE": "hessen", "DE-MV": "mecklenburg-vorpommern",
  "DE-NI": "niedersachsen", "DE-NW": "nordrhein-westfalen", "DE-RP": "rheinland-pfalz", "DE-SL": "saarland",
  "DE-SN": "sachsen", "DE-ST": "sachsen-anhalt", "DE-SH": "schleswig-holstein", "DE-TH": "thueringen",
};

export const politicalJurisdictions = registryData.jurisdictions as PoliticalJurisdiction[];
export const stateJurisdictions = politicalJurisdictions.filter((entry) => entry.jurisdiction_type === "STATE");

export function stateSlug(jurisdictionId: string) {
  return slugById[jurisdictionId] ?? jurisdictionId.replace(/^DE-/, "").toLowerCase();
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

export function governmentLifecycleLabel(state: string) {
  const labels: Record<string, string> = {
    OUT_OF_INITIAL_SCOPE: "Regierungsbestand noch nicht im Initialscope",
    LEGACY_TERM_NOT_BACKFILLED: "Laufender Regierungsterm noch nicht rückwirkend erschlossen",
    GOVERNMENT_FORMATION: "Regierungsbildung",
    GOVERNMENT_MONITORING: "Regierungsmonitor aktiv",
    TRANSITION_TO_NEXT_TERM: "Regierungsübergang",
  };
  return labels[state] ?? "Regierungsstatus offen";
}
