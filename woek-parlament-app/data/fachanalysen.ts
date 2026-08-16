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
  referenceStatus?: string;
  referenceStatusLabel?: string;
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
  fullPublicationSource?: { href: string; label: string; description: string };
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
    sources: [
      {
        slug: "grundgesetz-artikel-143h",
        title: "Grundgesetz, Artikel 143h",
        institution: "Bundesministerium der Justiz / Bundesamt für Justiz",
        canonicalUrl: "https://www.gesetze-im-internet.de/gg/art_143h.html",
        documentDate: "2025-03-25",
        documentType: "RECHTSGRUNDLAGE",
        temporalClass: "AVAILABLE_AT_DECISION_TIME",
        location: "Artikel 143h Absatz 1 und 2",
        supports: "Belegt Volumen, Zusätzlichkeitsanforderung, Laufzeit, KTF-Zuführung und Länderanteil des Sondervermögens.",
        doesNotSupport: "Belegt nicht, welche einzelnen Investitionen zusätzliche positive Zustandsveränderungen erzeugen."
      },
      {
        slug: "svikg-zweck-sondervermoegen",
        title: "Gesetz zur Errichtung eines Sondervermögens Infrastruktur und Klimaneutralität – § 2",
        institution: "Bundesministerium der Justiz / Bundesamt für Justiz",
        canonicalUrl: "https://www.gesetze-im-internet.de/svikg/__2.html",
        documentDate: "2025-10-02",
        documentType: "RECHTSGRUNDLAGE",
        temporalClass: "CURRENT_REFERENCE",
        location: "§ 2 Zweck des Sondervermögens",
        supports: "Belegt den gesetzlichen Zweck und den Rahmen von bis zu 500 Milliarden Euro.",
        doesNotSupport: "Belegt weder Mittelabfluss noch Zusätzlichkeit oder beobachtete Infrastruktur- und Klimawirkung."
      },
      {
        slug: "lukifg-infrastrukturinvestitionen-laender-kommunen",
        title: "Länder-und-Kommunal-Infrastrukturfinanzierungsgesetz",
        institution: "Bundesministerium der Justiz / Bundesamt für Justiz",
        canonicalUrl: "https://www.gesetze-im-internet.de/lukifg/",
        documentDate: "2025-10-20",
        documentType: "RECHTSGRUNDLAGE",
        temporalClass: "CURRENT_REFERENCE",
        location: "§§ 1–10",
        supports: "Belegt Ziel, Verteilung, Förderbereiche, Berichtspflichten und Rückforderungsregeln für die Ländersäule.",
        doesNotSupport: "Belegt keine projektspezifische Wirkung in Ländern oder Kommunen."
      },
      {
        slug: "bmf-svik-monitoringbericht-2025",
        title: "Monitoringbericht zum Sondervermögen für Infrastruktur und Klimaneutralität über das Jahr 2025",
        institution: "Bundesministerium der Finanzen",
        canonicalUrl: "https://www.bundesfinanzministerium.de/Content/DE/Downloads/Broschueren_Bestellservice/svik-monitoringbericht-2025.html",
        documentDate: "2026-06-01",
        documentType: "AMTLICHER_MONITORINGBERICHT",
        temporalClass: "PUBLISHED_AFTER_DECISION",
        location: "Gesamtbericht, insbesondere Mittelabfluss, Projektphasen und Monitoringmethodik",
        supports: "Belegt erste Vollzugs-, Planungs- und Auszahlungsstände des Jahres 2025.",
        doesNotSupport: "Mittelbindung und Mittelabfluss allein belegen keine kausal zurechenbare Zustandswirkung."
      },
      {
        slug: "uba-treibhausgas-projektionen-2026",
        title: "Treibhausgas-Projektionen 2026 für Deutschland",
        institution: "Umweltbundesamt",
        canonicalUrl: "https://www.umweltbundesamt.de/publikationen/treibhausgas-projektionen-2026-fur-deutschland",
        documentDate: "2026-06-12",
        documentType: "AMTLICHE_PROJEKTION",
        temporalClass: "PUBLISHED_AFTER_DECISION",
        location: "Projektionsbericht und sektorale Sensitivitätsanalysen",
        supports: "Belegt modellierte Emissionspfade, sektorale Zielabstände und Sensitivitäten im aktuellen Instrumentenrahmen.",
        doesNotSupport: "Isoliert nicht den kausalen Beitrag einzelner SVIK-Projekte."
      },
      {
        slug: "kfw-kommunalpanel-2026",
        title: "KfW-Kommunalpanel 2026",
        institution: "KfW Bankengruppe",
        canonicalUrl: "https://www.kfw.de/%C3%9Cber-die-KfW/Service/Download-Center/Konzernthemen/Research/KfW-Kommunalpanel/",
        documentDate: "2026-05-01",
        documentType: "REPRAESENTATIVE_BEFRAGUNG",
        temporalClass: "PUBLISHED_AFTER_DECISION",
        location: "Bericht und Tabellenband 2026",
        supports: "Belegt kommunale Investitionsbedarfe, Planungen und Umsetzungshemmnisse aus der repräsentativen Kommunalbefragung.",
        doesNotSupport: "Belegt keine Wirkung einzelner geförderter Projekte und keine vollständige Kausalität des Sondervermögens."
      },
      {
        slug: "bundestag-sondervermoegen-ueberblick",
        title: "Die Sondervermögen des Bundes – ein Überblick",
        institution: "Deutscher Bundestag",
        canonicalUrl: "https://www.bundestag.de/dokumente/textarchiv/sondervermoegen-doku-1106000",
        documentDate: "2026-08-01",
        documentType: "PARLAMENTARISCHER_UEBERBLICK",
        temporalClass: "CURRENT_REFERENCE",
        location: "Abschnitt zum Sondervermögen Infrastruktur und Klimaneutralität und verlinkte Drucksachen",
        supports: "Belegt parlamentarische Einordnung, Beschlussweg, Volumen und zentrale Dokumente.",
        doesNotSupport: "Belegt keine positive Netto-Wirkung des Portfolios."
      }
    ],
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
