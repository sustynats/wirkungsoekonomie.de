import publicationData from "@/data/public-fachanalysen.json";

export type FachanalyseType = "PORTFOLIO_ANALYSIS" | "SYSTEM_ANALYSIS" | "POLICY_FIELD_ANALYSIS";
export type FachanalyseStatus = "DOCUMENTATION_PUBLISHED" | "PUBLISHED";

export type FachanalyseSource = {
  slug: string;
  title: string;
  institution: string;
  canonicalUrl: string;
  documentDate: string | null;
  documentType: string;
  temporalClass: "AVAILABLE_AT_DECISION_TIME" | "PUBLISHED_AFTER_DECISION" | "CURRENT_REFERENCE";
  location: string;
  supports: string;
  doesNotSupport: string;
};

export type Fachanalyse = {
  slug: string;
  title: string;
  subtitle: string;
  type: FachanalyseType;
  status: FachanalyseStatus;
  analysisDate: string;
  scope: string;
  summary: string;
  focusAreas?: string[];
  decision?: { officialName: string; date: string; promulgation: string; inForce: string };
  publicationBoundary?: string;
  exAnte?: { cutoff: string; summary: string; sources: FachanalyseSource[] };
  exPost?: { cutoff: string; summary: string; sources: FachanalyseSource[] };
  timeline?: Array<{ date: string; label: string; status: string; summary: string; change: string; potential: string; sources: FachanalyseSource[] }>;
  comparison?: Array<{ dimension: string; draft: string; final: string; sources: FachanalyseSource[] }>;
  evidenceMap?: Record<string, string[]>;
  mediaPatterns?: Array<{ label: string; period: string; potentialPath: string; evidenceStatus: string; alternativeExplanation: string; causalStatus: string; affectedGroups: string[]; sources: FachanalyseSource[] }>;
  referenceFields?: { mpd: string[]; sdgAndPlus: string[] };
  impactPaths?: Array<{ lever: string; hypothesis: string; prerequisites: string[]; risks: string[]; evidenceStatus: string; sources: FachanalyseSource[] }>;
  observedOutcomes?: Array<{ outcome_id?: string; classification?: string; observation?: string; value_series?: Array<{ year: number; value: number; unit: string }>; causal_attribution?: string; causal_limit?: string; sources: FachanalyseSource[] }>;
  counterfactuals?: Array<{ scenario_id?: string; status?: string; description?: string; required_inputs?: string[]; not_observed_reason?: string; sources: FachanalyseSource[] }>;
  calculationRequirements?: Array<{ calculation_id?: string; question?: string; baseline?: string; observation?: string; counterfactual?: string; unit?: string; attribution_basis?: string; uncertainty?: string; data_quality?: string; causal_quality?: string; model_quality?: string }>;
  risksAndBoundaries?: Array<{ risk?: string; boundary?: string }>;
  dataGaps?: Array<string | Record<string, unknown>>;
  counterarguments?: Array<{ argument?: string; response?: string }>;
  retrospective?: Record<string, string>;
  learningPoints?: string[];
  sources: FachanalyseSource[];
  publicDownload?: { href: string; label: string; description: string };
};

const publishedFachanalysen = publicationData as Fachanalyse[];

/**
 * A source publication may be available before an analysis contains a fully
 * structured impact account. It remains a clearly labelled documentation,
 * never a fabricated assessment.
 */
const documentedAnalyses: Fachanalyse[] = [
  {
    slug: "sondervermoegen-infrastruktur-klimaneutralitaet",
    title: "Sondervermögen Infrastruktur und Klimaneutralität im Wirkungscheck",
    subtitle: "Fachliche Dokumentation zu Wirkungslogik, Zusätzlichkeit und Rückkopplung eines Investitionsportfolios",
    type: "PORTFOLIO_ANALYSIS",
    status: "DOCUMENTATION_PUBLISHED",
    analysisDate: "2026-08-15",
    scope: "Sondervermögen Infrastruktur und Klimaneutralität",
    summary: "Die Dokumentation ordnet die Investitionsarchitektur nach Wirkungspotenzialen, Wirkungsrisiken und Prüffragen. Sie ersetzt keine Gesamtwertung: zusätzliche Veränderungen, Schutzgrenzen und spätere Beobachtung bleiben getrennt.",
    sources: [],
    publicDownload: {
      href: "/downloads/fachanalysen/wirkungsoekonomische-analyse-sondervermoegen-infrastruktur-klimaneutralitaet.pdf",
      label: "Fachliche Dokumentation als PDF",
      description: "Dokumentation mit Quellen, Annahmen und Prüffragen"
    }
  }
];

export const fachanalysen: Fachanalyse[] = [...publishedFachanalysen, ...documentedAnalyses];

export function fachanalyseSources() {
  const sources = new Map<string, FachanalyseSource>();
  for (const analysis of fachanalysen) {
    for (const source of analysis.sources) sources.set(source.slug, source);
  }
  return [...sources.values()];
}
