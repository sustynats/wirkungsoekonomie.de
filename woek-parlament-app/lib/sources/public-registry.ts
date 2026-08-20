import { supabaseRest } from "@/lib/database/supabase-admin";
import { parliamentaryCases, type CaseSource } from "@/data/cases";
import { politicalSourceCatalog } from "@/lib/commitments/source-catalog";
import { fachanalyseSources } from "@/data/fachanalysen";
import { stateTargetRegisters } from "@/data/state-target-registers";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { getAllCommunicationMediaImpactRecords } from "@/lib/state-programmes/communication-media-impact";
import releasePublicationSourceLinks from "@/data/generated/release-1/publication-source-links.json";
import { directionLabels, evidenceLabels, getPublicImpactCases, governmentEditorialProjection } from "@/lib/government/impact-cases";
import { getGovernmentPublicData, sourceFunctionLabels } from "@/lib/government/public-data";
import { publicOfficialIdentifierRows } from "@/lib/government/official-identifiers";
import { listPublicEvidenceEvents } from "@/lib/observatory/public-data";
import { euEditorialProjection, getEuImpactCases } from "@/lib/eu/impact-cases";
import { getPublicRecommendations, recommendationStatusLabels } from "@/lib/recommendations";
import { impactRecordAssessmentIconKind, parliamentaryOverviewAssessment, type OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import { publicDecisionReviews, publicReviewSystemLabel, reviewSourceRefs, reviewText } from "@/lib/decision-method";
import dnsRegistry from "@/data/indicators/dns-official-registry.json";
import { isSafePublicSourceUrl, sourceDetailHrefForUrl, sourceSlugForCanonicalUrl } from "@/lib/sources/url";

export { isSafePublicSourceUrl, sourceDetailHrefForUrl, sourceSlugForCanonicalUrl } from "@/lib/sources/url";

export const sourceCategories = [
  "PARLIAMENTARY_RECORD",
  "GOVERNMENT_RECORD",
  "OFFICIAL_STATISTICS",
  "OFFICIAL_EVALUATION",
  "SCIENTIFIC_SOURCE",
  "WOEK_METHOD_REFERENCE",
  "OTHER_PRIMARY_SOURCE"
] as const;

export type SourceCategory = (typeof sourceCategories)[number];

export const sourceRoles = [
  "DECISION_FACT",
  "EX_ANTE_EVIDENCE",
  "EX_POST_EVIDENCE",
  "CALCULATION_INPUT",
  "NORMATIVE_REFERENCE",
  "METHODOLOGY_REFERENCE",
  "CONTEXT"
] as const;

export type SourceRole = (typeof sourceRoles)[number];

type SourceRow = {
  id: string;
  slug: string;
  title: string;
  institution: string;
  source_category: SourceCategory;
  source_role: SourceRole;
  document_type: string;
  canonical_url: string;
  document_date: string | null;
  retrieved_at: string;
  version_label: string | null;
  source_hash: string | null;
  temporal_class: "AVAILABLE_AT_DECISION_TIME" | "PUBLISHED_AFTER_DECISION" | "CURRENT_REFERENCE";
  abstract: string | null;
};

type UsageRow = {
  public_source_id: string;
  case_id: string;
  source_role: SourceRole;
  relevant_locations: unknown;
  use_note: string | null;
};

type CaseRow = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  decision_date: string | null;
};

export type PublicSourceUsage = {
  caseSlug: string;
  caseTitle: string;
  caseKind: string;
  decisionDate: string | null;
  sourceRole: SourceRole;
  locations: string[];
  note: string | null;
  caseHref?: string;
  analysisSummary?: string | null;
  analysisDirection?: string | null;
  evidenceLevel?: string | null;
  assessment?: OverviewAssessmentData | null;
};

export type PublicSource = {
  id: string;
  slug: string;
  title: string;
  institution: string;
  category: SourceCategory;
  role: SourceRole;
  documentType: string;
  canonicalUrl: string;
  documentDate: string | null;
  retrievedAt: string;
  versionLabel: string | null;
  sourceHash: string | null;
  temporalClass: SourceRow["temporal_class"];
  abstract: string | null;
  usages: PublicSourceUsage[];
};

type StaticPublicSource = Omit<PublicSource, "usages"> & { usages: PublicSourceUsage[] };

type ReleasedPublicationSourceLink = {
  source_slug: string;
  canonical_url: string;
  title: string;
  institution: string;
  document_type: string;
  document_date: string | null;
  retrieved_at: string | null;
  temporal_class: SourceRow["temporal_class"];
  relevant_location: string | null;
  rendered_routes: string[];
};

/**
 * Public source URLs are never linked directly from a published check. This
 * stable route key lets a reader see provenance first and deliberately choose
 * whether to leave the portal for the original publication.
 */
function readLocations(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0).slice(0, 12);
}

function mapSource(row: SourceRow, usages: PublicSourceUsage[]): PublicSource | null {
  const canonicalUrl = isSafePublicSourceUrl(row.canonical_url);
  if (!canonicalUrl) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    institution: row.institution,
    category: row.source_category,
    role: row.source_role,
    documentType: row.document_type,
    canonicalUrl,
    documentDate: row.document_date,
    retrievedAt: row.retrieved_at,
    versionLabel: row.version_label,
    sourceHash: row.source_hash,
    temporalClass: row.temporal_class,
    abstract: row.abstract,
    usages
  };
}

function sourceRoleForCaseSource(source: CaseSource): SourceRole {
  if (/DIP API/i.test(source.title)) return "METHODOLOGY_REFERENCE";
  return "DECISION_FACT";
}

function sourceCategoryForCaseSource(source: CaseSource): SourceCategory {
  if (/Bundestag|DIP|Bundesrat/i.test(source.publisher)) return "PARLIAMENTARY_RECORD";
  return "OTHER_PRIMARY_SOURCE";
}

function publishedStaticCaseSources(): StaticPublicSource[] {
  const grouped = new Map<string, { source: CaseSource; usages: PublicSourceUsage[] }>();
  const publicCases = parliamentaryCases.filter((item) =>
    item.statusVerification === "VERIFIED" && ["PUBLISHED", "PREPARATION_PUBLISHED", "WORKING_ACT_PUBLISHED"].includes(item.editorialStatus)
  );

  for (const item of publicCases) {
    const editorialAssessment = parliamentaryOverviewAssessment(item);
    const completeSourceManifest = item.publicWorkingAct?.fullReview?.sourceManifest ?? [];
    const sources = [
      ...item.sources,
      ...completeSourceManifest.flatMap((value) => {
        const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
        const url = typeof source.url === "string" ? source.url : "";
        if (!url) return [];
        return [{
          title: typeof source.title === "string" && source.title.trim() ? source.title : "Quellenangabe der Fachakte",
          publisher: typeof source.institution === "string" && source.institution.trim() ? source.institution : "In der Fachakte dokumentierte Stelle",
          url,
          retrievedAt: typeof source.retrieved_at === "string" && source.retrieved_at.trim() ? source.retrieved_at.slice(0, 10) : item.lastUpdated,
          note: typeof source.document_type === "string" && source.document_type.trim() ? source.document_type : "Quellenangabe der Fachakte"
        } satisfies CaseSource];
      })
    ];
    for (const source of sources) {
      const safeUrl = isSafePublicSourceUrl(source.url);
      const slug = sourceSlugForCanonicalUrl(source.url);
      if (!safeUrl || !slug) continue;
      const entry = grouped.get(slug) ?? { source, usages: [] };
      entry.usages.push({
        caseSlug: item.slug,
        caseTitle: item.title,
        caseKind: item.kind,
        decisionDate: null,
        sourceRole: sourceRoleForCaseSource(source),
        locations: [],
        note: source.note || null,
        caseHref: `/entscheidungen/${item.slug}`,
        analysisSummary: editorialAssessment?.editorialSummary ?? "WÖk-Analyse noch nicht redaktionell veröffentlicht.",
        analysisDirection: editorialAssessment?.assessmentLabel ?? null,
        evidenceLevel: editorialAssessment?.evidenceSummary ?? null,
        assessment: editorialAssessment,
      });
      grouped.set(slug, entry);
    }
  }

  return [...grouped.entries()].map(([slug, entry]) => ({
    id: `static-${slug}`,
    slug,
    title: entry.source.title,
    institution: entry.source.publisher,
    category: sourceCategoryForCaseSource(entry.source),
    role: sourceRoleForCaseSource(entry.source),
    documentType: /\.pdf(?:$|\?)/i.test(entry.source.url) ? "PDF-Dokument" : "Webseite bzw. Vorgangsseite",
    canonicalUrl: entry.source.url,
    documentDate: null,
    retrievedAt: entry.source.retrievedAt,
    versionLabel: null,
    sourceHash: null,
    temporalClass: "CURRENT_REFERENCE",
    abstract: null,
    usages: entry.usages
  }));
}

function politicalCatalogSources(): StaticPublicSource[] {
  return politicalSourceCatalog.flatMap((source) => {
    const canonicalUrl = isSafePublicSourceUrl(source.canonicalUrl);
    if (!canonicalUrl) return [];
    return [{
      id: `catalog-${source.sourceKey}`,
      slug: source.sourceKey,
      title: source.title,
      institution: source.actor,
      category: source.sourceType === "COALITION_AGREEMENT" ? "GOVERNMENT_RECORD" : "OTHER_PRIMARY_SOURCE",
      role: "CONTEXT",
      documentType: source.sourceType === "COALITION_AGREEMENT" ? "Koalitionsvertrag" : "Wahlprogramm",
      canonicalUrl,
      documentDate: source.documentDate,
      retrievedAt: "2026-08-15",
      versionLabel: source.sourceStatus === "EDITORIALLY_VERIFIED" ? "Quellenstand geprüft" : source.sourceStatus === "STRUCTURED" ? "Strukturiert erfasst" : "Im Quellenregister erfasst",
      sourceHash: source.sourceHash,
      temporalClass: "CURRENT_REFERENCE",
      abstract: source.note,
      usages: []
    } satisfies StaticPublicSource];
  });
}

function categoryForFachanalyseSource(documentType: string): SourceCategory {
  if (/PARLIAMENTARY|BUNDESTAG|BUNDESRAT/i.test(documentType)) return "PARLIAMENTARY_RECORD";
  if (/OFFICIAL_STATISTICS/i.test(documentType)) return "OFFICIAL_STATISTICS";
  if (/SCIENTIFIC/i.test(documentType)) return "SCIENTIFIC_SOURCE";
  if (/GOVERNMENT/i.test(documentType)) return "GOVERNMENT_RECORD";
  return "OTHER_PRIMARY_SOURCE";
}

/** Sources that belong to a published specialist analysis use the same public
 * detail route as sources attached to a parliamentary case. */
function fachanalyseCatalogSources(): StaticPublicSource[] {
  return fachanalyseSources().flatMap((source) => {
    const canonicalUrl = isSafePublicSourceUrl(source.canonicalUrl);
    const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
    if (!canonicalUrl || !slug) return [];
    return [{
      id: `fachanalyse-${source.slug}`,
      slug,
      title: source.title,
      institution: source.institution,
      category: categoryForFachanalyseSource(source.documentType),
      role: "CONTEXT",
      documentType: source.documentType.replaceAll("_", " "),
      canonicalUrl,
      documentDate: source.documentDate,
      retrievedAt: "2026-08-15",
      versionLabel: "Im Fachanalyse-Dossier dokumentiert",
      sourceHash: null,
      temporalClass: source.temporalClass,
      abstract: `${source.supports} Nicht belegt: ${source.doesNotSupport}`,
      usages: []
    } satisfies StaticPublicSource];
  });
}

function stateTargetCatalogSources(): StaticPublicSource[] {
  return stateTargetRegisters.flatMap((register) => {
    const canonicalUrl = isSafePublicSourceUrl(register.sourceUrl);
    const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
    if (!canonicalUrl || !slug) return [];
    return [{
      id: `state-target-${register.id}`,
      slug,
      title: register.title,
      institution: "Land Sachsen-Anhalt",
      category: "GOVERNMENT_RECORD",
      role: "NORMATIVE_REFERENCE",
      documentType: "Landesnachhaltigkeitsstrategie",
      canonicalUrl,
      documentDate: register.sourcePublishedAt,
      retrievedAt: "2026-08-15",
      versionLabel: `${register.declaredTargetCount} Zieltexte mit Fundstellen dokumentiert`,
      sourceHash: register.sourceSha256,
      temporalClass: "CURRENT_REFERENCE",
      abstract: "Landeseigener, versionierter Zielrahmen. Er ergänzt die SDGs für Sachsen-Anhalt und wird je Fall mit Zuständigkeit, Wirkungsraum und Schutzgrenzen verbunden.",
      usages: []
    } satisfies StaticPublicSource];
  });
}

function saxonyAnhaltProgrammeCatalogSources(): StaticPublicSource[] {
  return saxonyAnhaltElectionProgrammes.flatMap((programme) => {
    const canonicalUrl = isSafePublicSourceUrl(programme.canonicalUrl);
    const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
    if (!canonicalUrl || !slug) return [];
    return [{
      id: `sachsen-anhalt-programme-${programme.sourceKey}`,
      slug,
      title: programme.title,
      institution: programme.party,
      category: "OTHER_PRIMARY_SOURCE",
      role: "CONTEXT",
      documentType: programme.sourceFormat === "PDF" ? "Wahlprogramm (PDF)" : "Wahlprogramm (Webfassung)",
      canonicalUrl,
      documentDate: programme.decisionDate,
      retrievedAt: "2026-08-16",
      versionLabel: programme.documentStatus === "BESCHLOSSEN" ? "Beschlossene Programmfassung" : "Veröffentlichte Programmfassung",
      sourceHash: null,
      temporalClass: "CURRENT_REFERENCE",
      abstract: "Politische Originalquelle für die Wirkungsakte zur Landtagswahl Sachsen-Anhalt 2026. Sie belegt den Programmwortlaut, keine eingetretene Wirkung.",
      usages: []
    } satisfies StaticPublicSource];
  });
}

function communicationMediaImpactSources(): StaticPublicSource[] {
  const programmeByKey = new Map(saxonyAnhaltElectionProgrammes.map((programme) => [programme.sourceKey, programme]));
  return getAllCommunicationMediaImpactRecords().flatMap((record) => {
    const programme = programmeByKey.get(record.programme_source_key);
    if (!programme) return [];
    const sources = [...record.source_refs, {
      title: `WÖk-Fachreview Kommunikationswirkung – ${programme.party}`,
      url: record.fach_source.url,
      locator: `Fachreview ${record.communication_review_version}`,
    }];
    return sources.flatMap((source) => {
      const canonicalUrl = isSafePublicSourceUrl(source.url);
      const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
      if (!canonicalUrl || !slug) return [];
      const hostname = new URL(canonicalUrl).hostname;
      const woekReference = hostname === "wirkungsoekonomie.de" || (hostname === "github.com" && canonicalUrl.includes("/sustynats/wirkungsoekonomie.de/"));
      return [{
        id: `communication-media-${record.communication_review_id}-${slug}`,
        slug,
        title: source.title,
        institution: woekReference ? "Institut für Wirkungsökonomie" : programme.party,
        category: woekReference ? "WOEK_METHOD_REFERENCE" : "OTHER_PRIMARY_SOURCE",
        role: woekReference ? "METHODOLOGY_REFERENCE" : "CONTEXT",
        documentType: woekReference ? "WÖk-Fach- oder Methodenquelle" : "Offizielle Programm- oder Kampagnenquelle",
        canonicalUrl,
        documentDate: programme.decisionDate,
        retrievedAt: "2026-08-20",
        versionLabel: source.locator,
        sourceHash: null,
        temporalClass: "CURRENT_REFERENCE",
        abstract: woekReference
          ? `Der Fachreview ${record.communication_review_version} dokumentiert die freigegebene, von der Maßnahmenwirkung getrennte Kommunikationswirkungsanalyse zum ${programme.title}. Er legt Befund, Evidenzgrenzen und offene Prüfungen offen.`
          : `„${source.title}“ dokumentiert ${source.locator}. Die politische Originalquelle belegt den geprüften Wortlaut; eine eingetretene gesellschaftliche Wirkung folgt daraus nicht automatisch.`,
        usages: [{
          caseSlug: record.programme_source_key,
          caseTitle: `${programme.party}: Kommunikationswirkung des Wahlprogramms`,
          caseKind: "STATE_PROGRAMME_COMMUNICATION_MEDIA_IMPACT",
          decisionDate: programme.decisionDate,
          sourceRole: woekReference ? "METHODOLOGY_REFERENCE" : "CONTEXT",
          locations: [source.locator],
          note: "Maßnahmenwirkung und Kommunikationswirkung werden als getrennte Achsen veröffentlicht.",
          caseHref: `/laender/sachsen-anhalt/wahlprogramme/${record.programme_source_key}#kommunikationswirkung`,
          analysisSummary: record.public_summary,
          analysisDirection: record.overview_assessment_label,
          evidenceLevel: `Text-Evidenz ${record.evidence.text}; beobachtete Wirkung ${record.evidence.observed_outcome}`,
          assessment: {
            assessmentLabel: record.overview_assessment_label,
            impactCoreSummary: record.public_summary,
            editorialSummary: record.noncompensation,
            keyFinding: `${record.positive_potentials[0]} ${record.material_risks[0]}`,
            directionLabel: record.overview_assessment_label,
            directionKind: record.assessment_icon_kind,
            evidenceSummary: `Text-Evidenz ${record.evidence.text}; Mechanismus ${record.evidence.mechanism}; beobachtete Wirkung ${record.evidence.observed_outcome}.`,
            realityCheckSummary: `Reichweite und Resonanz: ${record.evidence.reach_resonance}; Zurechnung: ${record.evidence.attribution}.`,
          },
        }],
      } satisfies StaticPublicSource];
    });
  });
}

function releasedFachakteSources(): StaticPublicSource[] {
  const records = Array.isArray((releasePublicationSourceLinks as { sources?: unknown }).sources)
    ? (releasePublicationSourceLinks as { sources: ReleasedPublicationSourceLink[] }).sources
    : [];
  return records.flatMap((source) => {
    const canonicalUrl = isSafePublicSourceUrl(source.canonical_url);
    const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
    if (!canonicalUrl || !slug || slug !== source.source_slug) return [];
    const category = categoryForFachanalyseSource(source.document_type);
    return [{
      id: `release-1-${slug}`,
      slug,
      title: source.title || "Dokumentierte Quelle",
      institution: source.institution || "In der Fachakte dokumentierte Stelle",
      category,
      role: "CONTEXT",
      documentType: source.document_type || "Dokumentierte Quelle",
      canonicalUrl,
      documentDate: source.document_date,
      retrievedAt: source.retrieved_at || "2026-08-16",
      versionLabel: source.relevant_location ? `Fundstelle: ${source.relevant_location}` : "In einer vollständigen Fachakte dokumentiert",
      sourceHash: null,
      temporalClass: source.temporal_class,
      abstract: "Diese Quelle ist in einer veröffentlichten vollständigen Fachakte mit ihrer Rolle und Fundstelle dokumentiert.",
      usages: []
    } satisfies StaticPublicSource];
  });
}

function institutionForUrl(value: string) {
  const hostname = new URL(value).hostname.replace(/^www\./, "");
  const known: Record<string, string> = {
    "bundeswirtschaftsministerium.de": "Bundesministerium für Wirtschaft und Energie",
    "bundesgesundheitsministerium.de": "Bundesministerium für Gesundheit",
    "bundesfinanzministerium.de": "Bundesministerium der Finanzen",
    "bundestag.de": "Deutscher Bundestag",
    "search.dip.bundestag.de": "Deutscher Bundestag - DIP",
    "bundesnetzagentur.de": "Bundesnetzagentur",
    "bundesbank.de": "Deutsche Bundesbank",
    "bmas.de": "Bundesministerium für Arbeit und Soziales",
    "bundesregierung.de": "Bundesregierung",
    "iab.de": "Institut für Arbeitsmarkt- und Berufsforschung",
    "pubmed.ncbi.nlm.nih.gov": "PubMed / U.S. National Library of Medicine",
    "commission.europa.eu": "Europäische Kommission",
    "eur-lex.europa.eu": "EUR-Lex",
    "consilium.europa.eu": "Rat der Europäischen Union",
  };
  return known[hostname] ?? hostname;
}

const curatedSourceSummaries: Record<string, { title: string; summary: string }> = {
  "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/05/20260513-gemeinsame-pressemitteilung-neue-weichenstellung-fuer-den-gebaeudebereich-bundeskabinett-beschliesst-gebaeudemodernisierungsgesetz.html": {
    title: "Bundeskabinett beschließt Gebäudemodernisierungsgesetz",
    summary: "Die gemeinsame amtliche Pressemitteilung dokumentiert den Kabinettsbeschluss zum Gebäudemodernisierungsgesetz und die von der Bundesregierung veröffentlichten Eckpunkte. Sie belegt Entscheidung und Regierungsbegründung, nicht den späteren Gebäudebestand oder eine eingetretene Emissionswirkung.",
  },
  "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Artikel/Service/Gesetzesvorhaben/20260513-entwurf-eines-gesetzes-zur-aenderung-des-gebaeudeenergiegesetzes.html": {
    title: "Entwurf zur Änderung des Gebäudeenergiegesetzes",
    summary: "Die amtliche Gesetzesvorhabenseite stellt den Regierungsentwurf zur Änderung des Gebäudeenergiegesetzes und dessen Dokumentfassung bereit. Sie trägt den Wortlaut des vorgeschlagenen Instruments; tatsächliche Investitionen, Wärmepfade und Emissionen müssen später getrennt beobachtet werden.",
  },
  "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/07/20260729-eeg-novelle-und-netzanschlusspaket.html": {
    title: "EEG-Novelle und Netzanschlusspaket",
    summary: "Die amtliche Mitteilung beschreibt das von der Bundesregierung veröffentlichte EEG- und Netzanschlusspaket. Sie dokumentiert Maßnahmen und Zielsetzung, liefert aber noch keinen Nachweis für schnellere Netzanschlüsse, zusätzlichen Ausbau oder vermiedene Engpässe.",
  },
  "https://search.dip.bundestag.de/api/v1/vorgang/338361?format=json": {
    title: "DIP-Vorgang 338361",
    summary: "Der maschinenlesbare DIP-Datensatz dokumentiert den parlamentarischen Vorgang 338361 mit amtlichen Identifikatoren, Dokumentbezügen und Verfahrensstand. Er ist eine Verfahrensquelle und kein Wirkungsnachweis.",
  },
  "https://search.dip.bundestag.de/api/v1/vorgang/338371?format=json": {
    title: "DIP-Vorgang 338371",
    summary: "Der maschinenlesbare DIP-Datensatz dokumentiert den eigenständigen parlamentarischen Vorgang 338371 mit amtlichen Identifikatoren, Dokumentbezügen und Verfahrensstand. Die getrennte Vorgangsnummer bleibt erhalten; ein gemeinsamer Themenkontext ist kein Identitätsbeweis.",
  },
  "https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20250903_Versorgungsmonitoring.html": {
    title: "Versorgungssicherheitsmonitoring Strom 2025",
    summary: "Die Bundesnetzagentur fasst ihr Monitoring bis 2035 zusammen. Es untersucht ein Zielszenario und ein Szenario mit verzögerter Energiewende und beschreibt den Bedarf an steuerbarer Kapazität, Flexibilität, Speichern und Netzausbau. Die Ergebnisse sind szenarioabhängig und keine Prognose einer bereits eingetretenen Wirkung.",
  },
  "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/07/20260710-meilenstein-fuer-versorgungssicherheit.html": {
    title: "Amtliche Mitteilung zum Strom-Versorgungssicherheits- und Kapazitätengesetz",
    summary: "Die amtliche Mitteilung dokumentiert den von der Bundesregierung veröffentlichten gesetzlichen Rahmen für zusätzliche gesicherte Kapazität. Sie belegt Instrument und Regierungsziel, nicht den späteren Anlagenzubau oder eine schon nachgewiesene Versorgungssicherheitswirkung.",
  },
  "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Versorgungssicherheit/Monitoring_Strom/artikel.html": {
    title: "Monitoring der Versorgungssicherheit Strom",
    summary: "Die Fachseite der Bundesnetzagentur erläutert Auftrag und Ergebnisse des Versorgungssicherheitsmonitorings. Sie dient als institutionelle Grundlage für Szenarien zu Erzeugung, steuerbarer Leistung, Nachfrageflexibilität, Speichern und Netzen; ihre Annahmen bleiben für die Wirkungsanalyse sichtbar.",
  },
  "https://www.bundesgesundheitsministerium.de/ministerium/meldungen/bundeskabinett-beschliesst-notfallreform-22-04-2026": {
    title: "Bundeskabinett beschließt Notfallreform",
    summary: "Die amtliche Mitteilung dokumentiert den Kabinettsbeschluss und das Ziel einer bedarfsgerechten, qualitativ hochwertigen und wirtschaftlichen Notfallversorgung. Sie beschreibt die beabsichtigte Steuerung, belegt aber noch keine veränderten Wartezeiten, Behandlungsqualität oder Auslastung.",
  },
  "https://www.bundesgesundheitsministerium.de/service/gesetze-und-verordnungen/guv-21-lp/notfallreform/faq-notfallreform": {
    title: "Fragen und Antworten zur Reform der Notfallversorgung",
    summary: "Die FAQ des Bundesgesundheitsministeriums erläutern die vorgesehenen Zugangs- und Steuerungswege der Notfallreform. Sie sind eine amtliche Erläuterung des Instruments, keine unabhängige Evaluation seiner späteren Versorgungswirkung.",
  },
  "https://pubmed.ncbi.nlm.nih.gov/41645205/": {
    title: "Systematischer Review zu weniger dringlicher Notfallnutzung",
    summary: "Der systematische Review untersucht, wie Interventionen in Primärversorgung oder Notaufnahmen die Nutzung von Notfallversorgung durch weniger dringliche Patientengruppen beeinflussen. Er dient als Mechanismusbeleg; Übertragbarkeit und konkrete Ausgestaltung der deutschen Reform sind gesondert zu prüfen.",
  },
  "https://pubmed.ncbi.nlm.nih.gov/41793896/": {
    title: "Systematischer Review zu Notaufnahme und integrierter Akut-Primärversorgung",
    summary: "Der systematische Review vergleicht klinische Nutzen und Risiken von Notaufnahmen mit oder ohne räumlich angebundene, primärversorgungsgeführte Akutzentren. Er trägt die Mechanismusprüfung, ersetzt aber keine Evaluation der konkreten deutschen Umsetzung.",
  },
  "https://pubmed.ncbi.nlm.nih.gov/40739617/": {
    title: "Studie zur Umsteuerung niedrig dringlicher Rettungsdienstfälle in Berlin",
    summary: "Die multizentrische Berliner Befragungsstudie untersucht, ob niedrig dringliche Rettungsdienstpatientinnen und -patienten in die Primärversorgung umgesteuert werden könnten. Sie beleuchtet einen Teilmechanismus; beobachtete Eignung ist nicht mit realer Systemwirkung gleichzusetzen.",
  },
  "https://pubmed.ncbi.nlm.nih.gov/41351990/": {
    title: "Umbrella Review zu Überbelegung von Notaufnahmen",
    summary: "Der Umbrella Review bündelt Reviews zu Maßnahmen gegen Überbelegung in Notaufnahmen. Er hebt unter anderem Triage, Patientenfluss und Fast-Track-Strukturen hervor. Die zusammengefasste Evidenz stützt mögliche Mechanismen, nicht automatisch die Wirksamkeit eines einzelnen Gesetzes.",
  },
  "https://www.bundesgesundheitsministerium.de/ministerium/meldungen/warken-khag-bundesrat-27-03-2026": {
    title: "Bundesrat billigt Krankenhausreformanpassungsgesetz",
    summary: "Die amtliche Mitteilung dokumentiert die Billigung des Krankenhausreformanpassungsgesetzes durch den Bundesrat und die Regierungsbegründung der Anpassungen. Sie belegt den Rechts- und Verfahrensstand, nicht spätere Versorgungsqualität oder Standortwirkungen.",
  },
  "https://www.bundesgesundheitsministerium.de/presse/reden/krankenhausreformanpassungsgesetz-bundestag-06-03-26": {
    title: "Regierungsrede zum Krankenhausreformanpassungsgesetz",
    summary: "Die Rede dokumentiert die politische Begründung des Krankenhausreformanpassungsgesetzes im Bundestag. Sie ist eine amtliche Kommunikations- und Zielquelle, aber weder neutraler Mechanismusbeleg noch Evaluation.",
  },
  "https://pubmed.ncbi.nlm.nih.gov/28379871/": {
    title: "Krankenhausfallzahl und Ergebnisse nach Pankreaschirurgie in Deutschland",
    summary: "Die Studie untersucht den Zusammenhang zwischen Krankenhausfallzahl und innerklinischer Morbidität beziehungsweise Mortalität nach Pankreaschirurgie in Deutschland. Sie trägt die Evidenz zu Konzentrationsmechanismen, beweist aber nicht die Wirkung des KHAG als Gesamtinstrument.",
  },
  "https://pubmed.ncbi.nlm.nih.gov/40134472/": {
    title: "Fallzahl, Patientenauswahl und Mortalität nach Pankreasresektion",
    summary: "Die Studie analysiert neben Fallzahlen auch die Patientenauswahl als Prädiktor der Mortalität nach Pankreasresektion. Sie relativiert eine reine Mengendeutung und macht zusätzliche Struktur- und Selektionsfaktoren sichtbar.",
  },
  "https://pubmed.ncbi.nlm.nih.gov/30636674/": {
    title: "Krankenhausfallzahl, Mortalität und Failure-to-rescue in der Ösophaguschirurgie",
    summary: "Die Studie untersucht bei Ösophaguschirurgie den Zusammenhang von Krankenhausfallzahl, innerklinischer Mortalität und Failure-to-rescue. Sie stützt die Prüfung eines Volumen- und Strukturmechanismus; die Übertragung auf die gesamte Krankenhausreform bleibt begrenzt.",
  },
  "https://www.bundesfinanzministerium.de/Content/DE/FAQ/reform-der-privaten-altersvorsorge.html": {
    title: "Fragen und Antworten zur Reform der geförderten privaten Altersvorsorge",
    summary: "Die amtlichen FAQ erläutern vorgesehene Förderung, Produktlogik und Folgen der Reform für Bürgerinnen und Bürger. Sie dokumentieren Instrument und Regierungsdarstellung, nicht spätere Teilnahme, Kosten, Renditen oder Verteilungswirkungen.",
  },
  "https://www.bundestag.de/dokumente/textarchiv/2026/kw13-de-altersvorsorge-1156798": {
    title: "Bundestag beschließt das Altersvorsorgedepot",
    summary: "Die Bundestagsseite dokumentiert Beschluss, Abstimmungszeitpunkt und parlamentarische Dokumente zur Reform der privaten Altersvorsorge. Sie ist eine Verfahrens- und Entscheidungsquelle, keine Wirkungsbeobachtung.",
  },
  "https://www.bundesbank.de/de/presse/stellungnahmen/stellungnahme-der-deutschen-bundesbank-zur-alterssicherungskommission-vom-12-maerz-2026-991388": {
    title: "Bundesbank-Stellungnahme zur Alterssicherungskommission",
    summary: "Die Bundesbank legt Problemlagen, Wechselwirkungen und Reformoptionen der Alterssicherung dar. Die Stellungnahme wird für Mechanismen und Systemzusammenhänge herangezogen; sie ist keine Ex-post-Evaluation des Altersvorsorgereformgesetzes.",
  },
};

function governmentImpactSources(): StaticPublicSource[] {
  const grouped = new Map<string, StaticPublicSource>();
  const roles = [
    { key: "official_fact_sources", role: "DECISION_FACT", category: "GOVERNMENT_RECORD", label: "Amtliche Faktenquelle", summary: "Die Quelle dokumentiert den amtlichen Gegenstand, seinen Stand oder eine veröffentlichte Entscheidung. Sie ist für sich allein kein Wirkungsnachweis." },
    { key: "mechanism_sources", role: "EX_ANTE_EVIDENCE", category: "SCIENTIFIC_SOURCE", label: "Quelle zum Wirkmechanismus", summary: "Die Quelle wird zur fachlichen Herleitung eines möglichen Wirkmechanismus herangezogen. Sie ersetzt weder die amtliche Faktenquelle noch eine spätere Kausalprüfung." },
    { key: "post_decision_sources", role: "EX_POST_EVIDENCE", category: "OFFICIAL_EVALUATION", label: "Quelle nach der Entscheidung", summary: "Die Quelle dokumentiert eine spätere Beobachtung oder Evaluation. Beobachtung und kausale Zurechnung bleiben getrennt." },
  ] as const;
  for (const impact of getPublicImpactCases()) {
    const editorial = governmentEditorialProjection(impact);
    for (const role of roles) {
      for (const url of impact[role.key]) {
        const canonicalUrl = isSafePublicSourceUrl(url);
        const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
        if (!canonicalUrl || !slug) continue;
        const institution = institutionForUrl(canonicalUrl);
        const curated = curatedSourceSummaries[canonicalUrl];
        const assessment = editorial.status === "PASS" ? {
          assessmentLabel: editorial.fields.overview_assessment_label,
          impactCoreSummary: editorial.fields.impact_core_summary,
          editorialSummary: editorial.fields.editorial_summary,
          keyFinding: editorial.fields.key_finding,
          directionLabel: directionLabels[impact.primary_direction] ?? impact.primary_direction,
          directionKind: impactRecordAssessmentIconKind(impact),
          evidenceSummary: `${evidenceLabels[impact.evidence_level] ?? impact.evidence_level}. ${editorial.fields.evidence_summary}`,
          realityCheckSummary: editorial.fields.reality_check_summary,
        } : null;
        const usage: PublicSourceUsage = {
          caseSlug: impact.impact_case_id,
          caseTitle: impact.title,
          caseKind: "GOVERNMENT_IMPACT_CASE",
          decisionDate: impact.analysis_as_of,
          sourceRole: role.role,
          locations: [],
          note: role.summary,
          caseHref: `/regierung/wirkungsanalysen/${encodeURIComponent(impact.impact_case_id)}`,
          analysisSummary: impact.editorial_summary,
          analysisDirection: directionLabels[impact.primary_direction] ?? impact.primary_direction,
          evidenceLevel: evidenceLabels[impact.evidence_level] ?? impact.evidence_level,
          assessment,
        };
        const existing = grouped.get(slug);
        if (existing) {
          existing.usages.push(usage);
          continue;
        }
        grouped.set(slug, {
          id: `government-impact-${slug}`,
          slug,
          title: curated?.title ?? `${role.label}: ${institution}`,
          institution,
          category: role.category,
          role: role.role,
          documentType: /\.pdf(?:$|\?)/i.test(canonicalUrl) ? "Dokument (PDF)" : "Webseite, Datensatz oder Dokument",
          canonicalUrl,
          documentDate: null,
          retrievedAt: `${impact.analysis_as_of}T12:00:00Z`,
          versionLabel: `In Analyseversion ${impact.analysis_version} dokumentiert`,
          sourceHash: null,
          temporalClass: role.role === "EX_POST_EVIDENCE" ? "PUBLISHED_AFTER_DECISION" : "AVAILABLE_AT_DECISION_TIME",
          abstract: curated?.summary ?? null,
          usages: [usage],
        });
      }
    }
  }
  return [...grouped.values()];
}

function decisionReviewSources(): StaticPublicSource[] {
  const grouped = new Map<string, StaticPublicSource>();
  const governmentImpacts = new Map(getPublicImpactCases().map((impact) => [impact.impact_case_id, impact]));
  const euImpacts = new Map(getEuImpactCases().map((impact) => [impact.impact_case_id, impact]));
  const parliamentCases = new Map(parliamentaryCases.map((item) => [item.slug, item]));
  for (const review of publicDecisionReviews()) {
    const governmentImpact = governmentImpacts.get(review.impact_case_id);
    const euImpact = euImpacts.get(review.impact_case_id);
    const parliamentCase = parliamentCases.get(review.impact_case_id);
    if (!governmentImpact && !euImpact && !parliamentCase) continue;
    const editorial = governmentImpact ? governmentEditorialProjection(governmentImpact) : null;
    const assessment = governmentImpact && editorial?.status === "PASS" ? {
      assessmentLabel: editorial.fields.overview_assessment_label,
      impactCoreSummary: editorial.fields.impact_core_summary,
      editorialSummary: editorial.fields.editorial_summary,
      keyFinding: editorial.fields.key_finding,
      directionLabel: directionLabels[governmentImpact.primary_direction] ?? governmentImpact.primary_direction,
      directionKind: impactRecordAssessmentIconKind(governmentImpact),
      evidenceSummary: `${evidenceLabels[governmentImpact.evidence_level] ?? governmentImpact.evidence_level}. ${editorial.fields.evidence_summary}`,
      realityCheckSummary: editorial.fields.reality_check_summary,
    } : null;
    const title = review.title ?? governmentImpact?.title ?? euImpact?.title ?? parliamentCase?.title ?? "Geprüfter politischer Wirkungsfall";
    const caseHref = governmentImpact
      ? `/regierung/wirkungsanalysen/${encodeURIComponent(review.impact_case_id)}`
      : euImpact
        ? `/eu/wirkungsfaelle/${encodeURIComponent(review.impact_case_id)}`
        : `/entscheidungen/${encodeURIComponent(review.impact_case_id)}`;
    const caseKind = governmentImpact ? "GOVERNMENT_PROBLEM_GOAL_REVIEW" : euImpact ? "EU_PROBLEM_GOAL_REVIEW" : "PARLIAMENT_PROBLEM_GOAL_REVIEW";
    const rationale = [reviewText(review.problem_review.rationale), reviewText(review.goal_review.rationale)].filter(Boolean).join(" ");
    const evidence = publicReviewSystemLabel(review.problem_review.evidence_grade);
    const sources = reviewSourceRefs(review);
    for (const source of sources) {
      const canonicalUrl = isSafePublicSourceUrl(source);
      const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
      if (!canonicalUrl || !slug) continue;
      const institution = institutionForUrl(canonicalUrl);
      const curated = curatedSourceSummaries[canonicalUrl];
      const usage: PublicSourceUsage = {
        caseSlug: review.impact_case_id,
        caseTitle: title,
        caseKind,
        decisionDate: review.knowledge_cutoff_date ?? review.reviewed_at.slice(0, 10),
        sourceRole: "EX_ANTE_EVIDENCE",
        locations: [],
        note: "Die Quelle wird in der fachlich freigegebenen Problem- und Zielprüfung verwendet. Politische Problembehauptung, beobachteter Ausgangszustand und WÖk-Einordnung bleiben getrennt.",
        caseHref,
        analysisSummary: rationale || null,
        analysisDirection: "Problem- und Zielprüfung fachlich freigegeben",
        evidenceLevel: evidence,
        assessment,
      };
      const existing = grouped.get(slug);
      if (existing) {
        existing.usages.push(usage);
        continue;
      }
      grouped.set(slug, {
        id: `decision-review-${slug}`,
        slug,
        title: curated?.title ?? `Quelle zur Problem- und Zielprüfung: ${institution}`,
        institution,
        category: /iab\.de|bundesbank\.de|pubmed/i.test(canonicalUrl) ? "SCIENTIFIC_SOURCE" : "GOVERNMENT_RECORD",
        role: "EX_ANTE_EVIDENCE",
        documentType: /\.pdf(?:$|\?)/i.test(canonicalUrl) ? "Dokument (PDF)" : "Webseite, Datensatz oder Dokument",
        canonicalUrl,
        documentDate: null,
        retrievedAt: review.reviewed_at,
        versionLabel: review.review_version ? `Problem- und Zielprüfung ${review.review_version}` : "Fachlich freigegebene Problem- und Zielprüfung",
        sourceHash: null,
        temporalClass: "AVAILABLE_AT_DECISION_TIME",
        abstract: curated?.summary ?? "Die Quelle gehört zur geprüften Fakten- oder Evidenzbasis der Problem- und Zielprüfung. Sie wird weder als automatische Problemdefinition noch als Beleg einer bereits eingetretenen Wirkung behandelt.",
        usages: [usage],
      });
    }
  }
  return [...grouped.values()];
}

function recommendationSources(): StaticPublicSource[] {
  const grouped = new Map<string, StaticPublicSource>();
  const impacts = new Map(getPublicImpactCases().map((impact) => [impact.impact_case_id, impact]));
  for (const recommendation of getPublicRecommendations()) {
    const impact = impacts.get(recommendation.impact_case_id);
    const editorial = impact ? governmentEditorialProjection(impact) : null;
    const assessment = impact && editorial?.status === "PASS" ? {
      assessmentLabel: editorial.fields.overview_assessment_label,
      impactCoreSummary: editorial.fields.impact_core_summary,
      editorialSummary: editorial.fields.editorial_summary,
      keyFinding: editorial.fields.key_finding,
      directionLabel: directionLabels[impact.primary_direction] ?? impact.primary_direction,
      directionKind: impactRecordAssessmentIconKind(impact),
      evidenceSummary: `${evidenceLabels[impact.evidence_level] ?? impact.evidence_level}. ${editorial.fields.evidence_summary}`,
      realityCheckSummary: editorial.fields.reality_check_summary,
    } : null;
    for (const source of recommendation.source_refs) {
      const canonicalUrl = isSafePublicSourceUrl(source);
      const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
      if (!canonicalUrl || !slug) continue;
      const institution = institutionForUrl(canonicalUrl);
      const curated = curatedSourceSummaries[canonicalUrl];
      const usage: PublicSourceUsage = {
        caseSlug: recommendation.impact_case_id,
        caseTitle: impact?.title ?? recommendation.impact_case_id,
        caseKind: "GOVERNMENT_RECOMMENDATION",
        decisionDate: recommendation.decision_date ?? null,
        sourceRole: "CONTEXT",
        locations: [],
        note: "Die Quelle gehört zur fachlich freigegebenen WÖk-Handlungsoption. Ihr Aussageumfang, der damalige Wissensstand und später verfügbare Evidenz bleiben im Hindsight Guard getrennt.",
        caseHref: `/regierung/wirkungsanalysen/${encodeURIComponent(recommendation.impact_case_id)}`,
        analysisSummary: recommendation.recommendation_core_summary,
        analysisDirection: recommendationStatusLabels[recommendation.recommendation_status],
        evidenceLevel: evidenceLabels[recommendation.evidence_grade] ?? recommendation.evidence_grade,
        assessment,
      };
      const existing = grouped.get(slug);
      if (existing) {
        existing.usages.push(usage);
        continue;
      }
      grouped.set(slug, {
        id: `government-recommendation-${slug}`,
        slug,
        title: curated?.title ?? `Quelle zur WÖk-Handlungsoption: ${institution}`,
        institution,
        category: /pubmed|bundesbank/i.test(canonicalUrl) ? "SCIENTIFIC_SOURCE" : "GOVERNMENT_RECORD",
        role: "CONTEXT",
        documentType: /\.pdf(?:$|\?)/i.test(canonicalUrl) ? "Dokument (PDF)" : "Webseite, Datensatz oder Dokument",
        canonicalUrl,
        documentDate: null,
        retrievedAt: "2026-08-18T12:00:00Z",
        versionLabel: `In Fassung ${recommendation.recommendation_version} der WÖk-Handlungsoption dokumentiert`,
        sourceHash: null,
        temporalClass: "AVAILABLE_AT_DECISION_TIME",
        abstract: curated?.summary ?? "Diese Quelle gehört zur Fakten- oder Evidenzbasis der fachlich freigegebenen WÖk-Handlungsoption. Sie wird nicht automatisch als Wirkungs- oder Kausalitätsnachweis behandelt.",
        usages: [usage],
      });
    }
  }
  return [...grouped.values()];
}

function euImpactSources(): StaticPublicSource[] {
  const grouped = new Map<string, StaticPublicSource>();
  for (const impact of getEuImpactCases()) {
    const editorial = euEditorialProjection(impact);
    for (const url of [...new Set([...(impact.official_sources ?? []), ...(impact.source_refs ?? [])])]) {
      const canonicalUrl = isSafePublicSourceUrl(url);
      const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
      if (!canonicalUrl || !slug) continue;
      const assessment = editorial.status === "PASS" ? {
        assessmentLabel: editorial.fields.overview_assessment_label,
        impactCoreSummary: editorial.fields.impact_core_summary,
        editorialSummary: editorial.fields.editorial_summary,
        keyFinding: editorial.fields.key_finding,
        directionLabel: directionLabels[impact.primary_direction] ?? impact.primary_direction,
        directionKind: impactRecordAssessmentIconKind(impact),
        evidenceSummary: `${evidenceLabels[impact.evidence_level] ?? impact.evidence_level}. ${editorial.fields.evidence_summary}`,
        realityCheckSummary: editorial.fields.reality_check_summary,
      } : null;
      const usage: PublicSourceUsage = {
        caseSlug: impact.impact_case_id,
        caseTitle: impact.title,
        caseKind: "EU_IMPACT_CASE",
        decisionDate: impact.analysis_as_of,
        sourceRole: "DECISION_FACT",
        locations: [],
        note: impact.editorial_evidence_overlay
          ? "Die Quelle trägt die fachlich freigegebene Evidenzzusammenfassung zu Regelungsstand oder Wirkmechanismus. Ihre ausdrücklich dokumentierten Aussagegrenzen verhindern eine Gleichsetzung mit beobachteter oder kausal zugerechneter Wirkung."
          : "Die Quelle dokumentiert den amtlichen EU-Gegenstand oder seinen Verfahrensstand. Sie ist kein eigenständiger Nachweis einer eingetretenen Wirkung.",
        caseHref: `/eu/wirkungsfaelle/${encodeURIComponent(impact.impact_case_id)}`,
        analysisSummary: impact.editorial_summary,
        analysisDirection: directionLabels[impact.primary_direction] ?? impact.primary_direction,
        evidenceLevel: evidenceLabels[impact.evidence_level] ?? impact.evidence_level,
        assessment,
      };
      const existing = grouped.get(slug);
      if (existing) { existing.usages.push(usage); continue; }
      const institution = institutionForUrl(canonicalUrl);
      grouped.set(slug, {
        id: `eu-impact-${slug}`,
        slug,
        title: `Amtliche EU-Quelle zu „${impact.title}“`,
        institution,
        category: /eur-lex/i.test(canonicalUrl) ? "OTHER_PRIMARY_SOURCE" : "GOVERNMENT_RECORD",
        role: "DECISION_FACT",
        documentType: /eur-lex/i.test(canonicalUrl) ? "EU-Rechts- oder Verfahrensdokument" : "Amtliche EU-Veröffentlichung",
        canonicalUrl,
        documentDate: null,
        retrievedAt: `${impact.analysis_as_of}T12:00:00Z`,
        versionLabel: `In EU-Initialanalyse ${impact.analysis_version} dokumentiert`,
        sourceHash: null,
        temporalClass: "AVAILABLE_AT_DECISION_TIME",
        abstract: `Die amtliche Veröffentlichung dokumentiert den Gegenstand „${impact.title}“ oder seinen institutionellen beziehungsweise rechtlichen Stand. Sie trägt die Faktenbasis der WÖk-Analyse; Wirkungspotenziale, Risiken und spätere Zustandsänderungen werden davon getrennt geprüft.`,
        usages: [usage],
      });
    }
  }
  return [...grouped.values()];
}

function governmentFactSources(): StaticPublicSource[] {
  const grouped = new Map<string, StaticPublicSource>();
  for (const action of getGovernmentPublicData().actions) {
    for (const source of action.source_refs) {
      const canonicalUrl = isSafePublicSourceUrl(source.url);
      const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
      if (!canonicalUrl || !slug) continue;
      const sourceFunction = sourceFunctionLabels[source.source_function] ?? source.source_function;
      const usage: PublicSourceUsage = {
        caseSlug: action.government_action_id,
        caseTitle: action.title,
        caseKind: "GOVERNMENT_FACT_RECORD",
        decisionDate: action.decision_date,
        sourceRole: "DECISION_FACT",
        locations: [],
        note: `Die Quelle trägt in der Faktenakte die Funktion „${sourceFunction}“. Aus ihr wird keine Wirkungsrichtung abgeleitet.`,
        caseHref: `/regierung/akte/${encodeURIComponent(action.government_action_id)}`,
        analysisSummary: action.has_woek_analysis ? "Für den verknüpften Wirkungsgegenstand liegt eine separat freigegebene WÖk-Analyse vor." : "Faktenakte. WÖk-Wirkungsanalyse noch nicht veröffentlicht.",
        analysisDirection: null,
        evidenceLevel: null,
      };
      const existing = grouped.get(slug);
      if (existing) {
        existing.usages.push(usage);
        continue;
      }
      grouped.set(slug, {
        id: `government-fact-${slug}`,
        slug,
        title: source.title,
        institution: institutionForUrl(canonicalUrl),
        category: /LEGAL|CONSOLIDATED/i.test(source.source_function) ? "OTHER_PRIMARY_SOURCE" : "GOVERNMENT_RECORD",
        role: "DECISION_FACT",
        documentType: sourceFunction,
        canonicalUrl,
        documentDate: source.published_at?.slice(0, 10) ?? null,
        retrievedAt: source.retrieved_at,
        versionLabel: `In Government Data ${action.data_version} geprüft`,
        sourceHash: null,
        temporalClass: "CURRENT_REFERENCE",
        abstract: `Diese Originalquelle dokumentiert „${source.title}“ als ${sourceFunction.toLowerCase()}. Sie belegt den amtlichen Sachverhalt; eine eingetretene Wirkung oder WÖk-Richtung belegt sie nicht automatisch.`,
        usages: [usage],
      });
    }

    for (const identifier of publicOfficialIdentifierRows(action.official_identifiers)) {
      if (!identifier.sourceUrl) continue;
      const canonicalUrl = isSafePublicSourceUrl(identifier.sourceUrl);
      const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
      if (!canonicalUrl || !slug) continue;
      const usage: PublicSourceUsage = {
        caseSlug: action.government_action_id,
        caseTitle: action.title,
        caseKind: "GOVERNMENT_FACT_RECORD",
        decisionDate: action.decision_date,
        sourceRole: "DECISION_FACT",
        locations: [],
        note: `Das amtliche Dokument ist über die ${identifier.label} ${identifier.value} mit dieser Faktenakte verknüpft. Daraus wird keine Wirkungsrichtung abgeleitet.`,
        caseHref: `/regierung/akte/${encodeURIComponent(action.government_action_id)}`,
        analysisSummary: action.has_woek_analysis ? "Für den verknüpften Wirkungsgegenstand liegt eine separat freigegebene WÖk-Analyse vor." : "Faktenakte. WÖk-Wirkungsanalyse noch nicht veröffentlicht.",
        analysisDirection: null,
        evidenceLevel: null,
      };
      const existing = grouped.get(slug);
      if (existing) {
        existing.usages.push(usage);
        continue;
      }
      grouped.set(slug, {
        id: `government-identifier-${slug}`,
        slug,
        title: `Amtliches Dokument zu „${action.title}“`,
        institution: institutionForUrl(canonicalUrl),
        category: "PARLIAMENTARY_RECORD",
        role: "DECISION_FACT",
        documentType: "Amtliches Dokument aus dem parlamentarischen Informationssystem",
        canonicalUrl,
        documentDate: action.decision_date,
        retrievedAt: action.last_verified_at,
        versionLabel: `${identifier.label} ${identifier.value}`,
        sourceHash: null,
        temporalClass: "CURRENT_REFERENCE",
        abstract: `Das amtliche Dokument ist über die ${identifier.label} ${identifier.value} mit der Faktenakte „${action.title}“ verknüpft. Es belegt Dokumentbezug und veröffentlichten Wortlaut; eine eingetretene Wirkung oder WÖk-Richtung belegt es nicht.`,
        usages: [usage],
      });
    }
  }
  return [...grouped.values()];
}

function observatorySources(): StaticPublicSource[] {
  const grouped = new Map<string, StaticPublicSource>();
  for (const event of listPublicEvidenceEvents()) {
    for (const reference of event.official_source_refs) {
      const url = typeof reference === "string" ? reference : reference.url;
      const canonicalUrl = isSafePublicSourceUrl(url);
      const slug = canonicalUrl ? sourceSlugForCanonicalUrl(canonicalUrl) : null;
      if (!canonicalUrl || !slug) continue;
      const claim = typeof reference === "string" ? "Die Quelle trägt die veröffentlichte Beobachtung mit der im Evidenzereignis dokumentierten Quellenfunktion." : reference.claim;
      const sourceName = typeof reference === "string" ? institutionForUrl(canonicalUrl) : reference.source;
      const usage: PublicSourceUsage = {
        caseSlug: event.evidence_event_id,
        caseTitle: event.title,
        caseKind: "EVIDENCE_EVENT",
        decisionDate: event.observation_date.slice(0, 10),
        sourceRole: "EX_POST_EVIDENCE",
        locations: [],
        note: `Zurechnung: ${event.attribution_status}. Der Datenpunkt verändert die WÖk-Bewertung nicht automatisch.`,
        caseHref: `/wirkungsobservatorium#${encodeURIComponent(event.evidence_event_id)}`,
        analysisSummary: event.what_changed_or_may_change,
        analysisDirection: null,
        evidenceLevel: typeof event.data_quality === "string" ? event.data_quality : `Messung: ${event.data_quality.measurement ?? "offen"}; Zurechnung: ${event.data_quality.causal_attribution ?? "offen"}`,
      };
      const existing = grouped.get(slug);
      if (existing) {
        existing.usages.push(usage);
        continue;
      }
      grouped.set(slug, {
        id: `observatory-${slug}`,
        slug,
        title: sourceName,
        institution: sourceName,
        category: /JRC|Copernicus|Drought Observatory/i.test(sourceName) ? "OTHER_PRIMARY_SOURCE" : "OFFICIAL_STATISTICS",
        role: "EX_POST_EVIDENCE",
        documentType: "Amtliche Mess-, Referenz- oder Kontextquelle",
        canonicalUrl,
        documentDate: event.publication_date.slice(0, 10),
        retrievedAt: event.publication_date,
        versionLabel: `Evidenzereignis ${event.evidence_event_id}`,
        sourceHash: null,
        temporalClass: "PUBLISHED_AFTER_DECISION",
        abstract: `${claim} Die Quelle wird als Beobachtung bzw. Kontext geführt; aus zeitlicher Nähe allein folgt keine politische Zurechnung.`,
        usages: [usage],
      });
    }
  }
  return [...grouped.values()];
}

function foundationalReferenceSources(): StaticPublicSource[] {
  return [
    {
      id: "foundation-agenda-2030",
      slug: "agenda-2030-sdgs",
      title: "Agenda 2030 für nachhaltige Entwicklung und die 17 SDGs",
      institution: "Vereinte Nationen",
      category: "OTHER_PRIMARY_SOURCE",
      role: "NORMATIVE_REFERENCE",
      documentType: "Internationale Agenda",
      canonicalUrl: "https://sdgs.un.org/2030agenda",
      documentDate: "2015-09-25",
      retrievedAt: "2026-08-15",
      versionLabel: "Verabschiedete Fassung",
      sourceHash: null,
      temporalClass: "CURRENT_REFERENCE",
      abstract: "Der globale, von den Mitgliedstaaten der Vereinten Nationen vereinbarte Zielrahmen. Er ist im Portal Referenz für die offene normative Einordnung – nicht eine automatische Entscheidung.",
      usages: []
    },
    {
      id: "foundation-germany-agenda-2030",
      slug: "deutschland-agenda-2030",
      title: "Globale Nachhaltigkeitsziele: Die Agenda 2030",
      institution: "Bundesregierung der Bundesrepublik Deutschland",
      category: "GOVERNMENT_RECORD",
      role: "NORMATIVE_REFERENCE",
      documentType: "Amtliche Umsetzungsinformation",
      canonicalUrl: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/agenda-2030-355966",
      documentDate: null,
      retrievedAt: "2026-08-15",
      versionLabel: "Aktuelle amtliche Information",
      sourceHash: null,
      temporalClass: "CURRENT_REFERENCE",
      abstract: "Dokumentiert die deutsche Umsetzung der Agenda 2030 über die Deutsche Nachhaltigkeitsstrategie. Die Referenz gilt der Bundesrepublik Deutschland; sie wird nicht einer einzelnen Regierung zugeschrieben.",
      usages: []
    },
    {
      id: "foundation-sdg-plus",
      slug: "sdg-plus-referenzrahmen",
      title: "SDG+ als Erweiterung der Wirkungsökonomie",
      institution: "Institut für Wirkungsökonomie",
      category: "WOEK_METHOD_REFERENCE",
      role: "NORMATIVE_REFERENCE",
      documentType: "Methodendossier",
      canonicalUrl: "https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/dossiers/sdg-als-erweiterung-der-wirkungsoekonomie/",
      documentDate: "2026-05-24",
      retrievedAt: "2026-08-15",
      versionLabel: "v0.4",
      sourceHash: null,
      temporalClass: "CURRENT_REFERENCE",
      abstract: "Transparente WÖk-Erweiterung der SDGs für demokratische, mediale, rechtsstaatliche und digitale Voraussetzungen. SDG+ ist keine offizielle UN-Kategorie.",
      usages: []
    },
    {
      id: "foundation-state-sustainability-strategies",
      slug: "nachhaltigkeitsstrategien-bundeslaender",
      title: "Nachhaltigkeitsstrategien der Bundesländer",
      institution: "Statistisches Bundesamt",
      category: "OFFICIAL_STATISTICS",
      role: "NORMATIVE_REFERENCE",
      documentType: "Amtliche Übersicht",
      canonicalUrl: "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html",
      documentDate: null,
      retrievedAt: "2026-08-15",
      versionLabel: "Aktuelle Übersicht",
      sourceHash: null,
      temporalClass: "CURRENT_REFERENCE",
      abstract: "Die Länder setzen die Agenda 2030 in eigener Zuständigkeit und mit unterschiedlichem Stand um. Für jeden Landesfall wird deshalb die konkrete Nachhaltigkeitsstrategie, das Indikatorenset oder ein offen ausgewiesener Quellenstatus des jeweiligen Landes dokumentiert.",
      usages: []
    },
    {
      id: "foundation-eu-agenda-2030",
      slug: "eu-agenda-2030-nachhaltige-entwicklung",
      title: "Nachhaltige Entwicklung in der Europäischen Union",
      institution: "Europäische Union – EUR-Lex",
      category: "OTHER_PRIMARY_SOURCE",
      role: "NORMATIVE_REFERENCE",
      documentType: "EU-Rechts- und Politikübersicht",
      canonicalUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=legissum%3Asustainable_development",
      documentDate: null,
      retrievedAt: "2026-08-15",
      versionLabel: "Aktuelle Übersicht",
      sourceHash: null,
      temporalClass: "CURRENT_REFERENCE",
      abstract: "Nachhaltige Entwicklung ist ein langfristiges Ziel der Europäischen Union; die EU bekennt sich zur Umsetzung der Agenda 2030 und ihrer 17 Ziele. EU-Fälle erhalten daneben ihren eigenen institutionellen und rechtlichen Kontext.",
      usages: []
    },
    {
      id: "foundation-eu-treaties",
      slug: "eu-vertraege-und-grundrechte",
      title: "Vertrag über die Arbeitsweise der Europäischen Union und Grundrechte",
      institution: "Europäische Union – EUR-Lex",
      category: "OTHER_PRIMARY_SOURCE",
      role: "NORMATIVE_REFERENCE",
      documentType: "EU-Primärrecht",
      canonicalUrl: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:12012E/TXT",
      documentDate: null,
      retrievedAt: "2026-08-15",
      versionLabel: "Konsolidierte Fassung",
      sourceHash: null,
      temporalClass: "CURRENT_REFERENCE",
      abstract: "Primärrechtlicher Bezugsrahmen für EU-bezogene Fälle. Er wird im Portal als normativer Anker, nicht als automatisches Rechtsurteil oder zusätzlicher Wirkungspunkt geführt.",
      usages: []
    },
    {
      id: "foundation-basic-law",
      slug: "grundgesetz-bundesrepublik-deutschland",
      title: "Grundgesetz für die Bundesrepublik Deutschland",
      institution: "Bundesministerium der Justiz / Bundesamt für Justiz",
      category: "OTHER_PRIMARY_SOURCE",
      role: "NORMATIVE_REFERENCE",
      documentType: "Verfassungstext",
      canonicalUrl: "https://www.gesetze-im-internet.de/gg/",
      documentDate: null,
      retrievedAt: "2026-08-15",
      versionLabel: "Geltende Fassung",
      sourceHash: null,
      temporalClass: "CURRENT_REFERENCE",
      abstract: "Rechtsstaatlicher Bezugsrahmen für deutsche Fälle. Er ergänzt die Wirkungsprüfung dort, wo Grundrechte, Staatsstrukturprinzipien oder Staatsziele berührt sind; das Portal erstellt keine Rechtsgutachten.",
      usages: []
    }
  ];
}

function staticPublicSources() {
  const deduplicated = new Map<string, StaticPublicSource>();
  for (const source of [
    ...publishedStaticCaseSources(),
    ...politicalCatalogSources(),
    ...fachanalyseCatalogSources(),
    ...stateTargetCatalogSources(),
    ...saxonyAnhaltProgrammeCatalogSources(),
    ...communicationMediaImpactSources(),
    ...foundationalReferenceSources(),
    ...releasedFachakteSources(),
    ...governmentFactSources(),
    ...governmentImpactSources(),
    ...decisionReviewSources(),
    ...recommendationSources(),
    ...euImpactSources(),
    ...observatorySources(),
    ...dnsIndicatorSources(),
  ]) {
    const existing = deduplicated.get(source.slug);
    if (!existing) {
      deduplicated.set(source.slug, source);
    } else {
      existing.usages = [...existing.usages, ...source.usages].filter((usage, index, usages) =>
        usages.findIndex((candidate) => (candidate.caseHref ?? candidate.caseSlug) === (usage.caseHref ?? usage.caseSlug) && candidate.sourceRole === usage.sourceRole) === index
      );
    }
  }
  return [...deduplicated.values()];
}

function dnsIndicatorSources(): StaticPublicSource[] {
  return dnsRegistry.records.map((indicator) => ({
    id: `dns-indicator-${indicator.indicator_id.toLowerCase()}`,
    slug: sourceSlugForCanonicalUrl(indicator.source_page_url) ?? `dns-${indicator.indicator_id.toLowerCase()}`,
    title: `${indicator.indicator_id}: ${indicator.official_name_2025}`,
    institution: "Statistisches Bundesamt / Deutsche Nachhaltigkeitsstrategie",
    category: "OFFICIAL_STATISTICS" as const,
    role: "CALCULATION_INPUT" as const,
    documentType: "Amtlicher DNS-Indikator",
    canonicalUrl: indicator.source_page_url,
    documentDate: indicator.national_metadata_updated_date || null,
    retrievedAt: "2026-08-19",
    versionLabel: `Amtlicher Repository-Stand ${dnsRegistry.official_repository_commit.slice(0, 12)}`,
    sourceHash: null,
    temporalClass: "CURRENT_REFERENCE" as const,
    abstract: indicator.official_definition || "Amtliche Indikatorseite der Deutschen Nachhaltigkeitsstrategie.",
    usages: [{
      caseSlug: indicator.indicator_id,
      caseTitle: indicator.official_name_2025,
      caseKind: "Wirkindikator",
      decisionDate: null,
      sourceRole: "CALCULATION_INPUT" as const,
      locations: ["Definition", "Ziel", "Datenstand", "Vergleichbarkeit"],
      note: "Der Indikator dokumentiert einen Zustand. Wirkung, Zurechnung und Empfehlung werden daraus nicht automatisch abgeleitet.",
      caseHref: `/methodik/wirkindikatoren/${indicator.indicator_id}`,
      analysisSummary: "Amtliche Messgröße; fachliche WÖk-Zuordnung noch offen.",
      analysisDirection: null,
      evidenceLevel: null,
      assessment: null,
    }],
  }));
}

async function usagesForSources(sourceIds: string[]) {
  if (sourceIds.length === 0) return new Map<string, PublicSourceUsage[]>();
  const sourceList = sourceIds.map(encodeURIComponent).join(",");
  const usages = await supabaseRest<UsageRow[]>(
    `parliament.public_source_usages?public_source_id=in.(${sourceList})&select=public_source_id,case_id,source_role,relevant_locations,use_note`
  );
  const caseIds = [...new Set(usages.map((usage) => usage.case_id))];
  if (caseIds.length === 0) return new Map<string, PublicSourceUsage[]>();
  const caseList = caseIds.map(encodeURIComponent).join(",");
  const publicCases = await supabaseRest<CaseRow[]>(
    `parliament.cases?id=in.(${caseList})&publication_status=eq.PUBLISHED&select=id,slug,title,kind,decision_date`
  );
  const caseById = new Map(publicCases.map((item) => [item.id, item]));
  const result = new Map<string, PublicSourceUsage[]>();
  for (const usage of usages) {
    const item = caseById.get(usage.case_id);
    if (!item) continue;
    const publicUsage: PublicSourceUsage = {
      caseSlug: item.slug,
      caseTitle: item.title,
      caseKind: item.kind,
      decisionDate: item.decision_date,
      sourceRole: usage.source_role,
      locations: readLocations(usage.relevant_locations),
      note: usage.use_note,
      caseHref: `/entscheidungen/${item.slug}`,
      analysisSummary: null,
      analysisDirection: null,
      evidenceLevel: null,
    };
    result.set(usage.public_source_id, [...(result.get(usage.public_source_id) ?? []), publicUsage]);
  }
  return result;
}

async function publishedSourceRows(query = "") {
  return supabaseRest<SourceRow[]>(
    `parliament.public_source_registry?public_status=eq.PUBLISHED&select=id,slug,title,institution,source_category,source_role,document_type,canonical_url,document_date,retrieved_at,version_label,source_hash,temporal_class,abstract${query}&order=document_date.desc.nullslast,title.asc`
  );
}

export async function listPublicSources() {
  let databaseSources: PublicSource[] = [];
  try {
    const rows = await publishedSourceRows();
    const usages = await usagesForSources(rows.map((row) => row.id));
    databaseSources = rows
      .map((row) => mapSource(row, usages.get(row.id) ?? []))
      .filter((source): source is PublicSource => source !== null);
  } catch {
    // The independently versioned, static sources remain useful even while
    // the optional registry store is temporarily unavailable.
  }
  const knownSlugs = new Set(databaseSources.map((source) => source.slug));
  return [...databaseSources, ...staticPublicSources().filter((source) => !knownSlugs.has(source.slug))]
    .sort((left, right) => (right.documentDate ?? "").localeCompare(left.documentDate ?? "") || left.title.localeCompare(right.title, "de"));
}

export async function getPublicSource(slug: string) {
  const safeSlug = slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(safeSlug)) return null;
  try {
    const rows = await publishedSourceRows(`&slug=eq.${encodeURIComponent(safeSlug)}&limit=1`);
    const row = rows[0];
    if (row) {
      const usages = await usagesForSources([row.id]);
      return mapSource(row, usages.get(row.id) ?? []);
    }
  } catch {
    // Fall through to the independently versioned source catalog.
  }
  return staticPublicSources().find((source) => source.slug === safeSlug) ?? null;
}

export const sourceCategoryLabel: Record<SourceCategory, string> = {
  PARLIAMENTARY_RECORD: "Parlamentarische Primärquelle",
  GOVERNMENT_RECORD: "Amtliche Regierungsquelle",
  OFFICIAL_STATISTICS: "Amtliche Statistik",
  OFFICIAL_EVALUATION: "Amtliche Evaluation",
  SCIENTIFIC_SOURCE: "Wissenschaftliche Primärquelle",
  WOEK_METHOD_REFERENCE: "WÖk-Methodenreferenz",
  OTHER_PRIMARY_SOURCE: "Weitere Primärquelle"
};

export const sourceRoleLabel: Record<SourceRole, string> = {
  DECISION_FACT: "Parlamentarischer Sachverhalt",
  EX_ANTE_EVIDENCE: "Damals verfügbare Evidenz",
  EX_POST_EVIDENCE: "Später veröffentlichte Evidenz",
  CALCULATION_INPUT: "Rechen- bzw. Eingangswert",
  NORMATIVE_REFERENCE: "Normativer Referenzrahmen",
  METHODOLOGY_REFERENCE: "Methodischer Referenzrahmen",
  CONTEXT: "Kontext"
};

export const temporalClassLabel: Record<PublicSource["temporalClass"], string> = {
  AVAILABLE_AT_DECISION_TIME: "Zum Entscheidungszeitpunkt verfügbar",
  PUBLISHED_AFTER_DECISION: "Erst nach der Entscheidung veröffentlicht",
  CURRENT_REFERENCE: "Aktuelle Referenz"
};
