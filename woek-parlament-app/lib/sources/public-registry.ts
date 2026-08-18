import { createHash } from "node:crypto";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { parliamentaryCases, type CaseSource } from "@/data/cases";
import { politicalSourceCatalog } from "@/lib/commitments/source-catalog";
import { fachanalyseSources } from "@/data/fachanalysen";
import { stateTargetRegisters } from "@/data/state-target-registers";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import releasePublicationSourceLinks from "@/data/generated/release-1/publication-source-links.json";

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
export function sourceSlugForCanonicalUrl(value: string) {
  const safeUrl = isSafePublicSourceUrl(value);
  if (!safeUrl) return null;
  return `quelle-${createHash("sha256").update(safeUrl).digest("hex").slice(0, 16)}`;
}

export function sourceDetailHrefForUrl(value: string) {
  const slug = sourceSlugForCanonicalUrl(value);
  return slug ? `/quellen/${slug}` : "/quellen";
}

export function isSafePublicSourceUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

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
        note: source.note || null
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
    abstract: "Amtliche Primärquelle, die in einem veröffentlichten Wirkungscheck als Sachverhalt oder Dokumentfassung nachgewiesen wird.",
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
    ...foundationalReferenceSources(),
    ...releasedFachakteSources()
  ]) {
    if (!deduplicated.has(source.slug)) deduplicated.set(source.slug, source);
  }
  return [...deduplicated.values()];
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
      note: usage.use_note
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
