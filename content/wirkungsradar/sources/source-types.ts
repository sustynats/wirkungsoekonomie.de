// Vertrauen entsteht nicht durch Autorität, sondern durch sichtbare Prüfung: Datenstand, Quellen, Grenzen, Gegenposition, Bilanzgrenze und Korrekturfähigkeit. Der Wirkungsradar muss nicht unfehlbar wirken. Er muss lernfähig, transparent und überprüfbar sein.
export type SourceType =
  | "primary_data"
  | "official_statistics"
  | "peer_review"
  | "official_agency"
  | "research_institute"
  | "government"
  | "ngo"
  | "industry"
  | "media"
  | "explainer"
  | "opinion";

export type ReliabilityTier = "A" | "B" | "C" | "D";
export type UpdateFrequency = "static" | "annual" | "quarterly" | "monthly" | "event_based" | "unknown";

export type SourceCard = {
  id: string;
  label: string;
  organization: string;
  url: string;
  sourceType: SourceType;
  countryOrRegion?: string;
  language?: string;
  publicationDate?: string;
  lastAccessed: string;
  useFor: string[];
  doesNotProve?: string[];
  limitations: string[];
  updateFrequency: UpdateFrequency;
  reliabilityTier: ReliabilityTier;
  notes?: string;
};
