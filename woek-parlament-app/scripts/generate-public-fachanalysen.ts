import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type RecordValue = Record<string, unknown>;

function object(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
}

function strings(value: unknown, limit = 64) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()).slice(0, limit)
    : [];
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function publicStatus(value: unknown) {
  const normalized = text(value).trim().toUpperCase().replaceAll("_", " ");
  const labels: Record<string, string> = {
    "EX ANTE CAUSAL HYPOTHESIS WITH MODEL INPUTS": "Ex-ante-Wirkungshypothese · modellgestützt",
    "EX ANTE DESIGN POTENTIAL": "Ex-ante-Designpotenzial",
    "MECHANISM PARTLY TESTED EFFECT LIMITED IN ONE STUDY": "Mechanismus teilweise untersucht · Wirkung nur begrenzt belegt",
    "FRAME EXISTENCE SUPPORTED CAUSAL BEHAVIOUR UNRESOLVED": "Frame belegt · Verhaltenswirkung kausal offen",
    "IMPACT POTENTIAL WITH DOCUMENTED MEDIA FRAME": "Wirkungspotenzial mit dokumentiertem Medienframe",
    "IMPACT POTENTIAL WITH DOCUMENTED FRAME": "Wirkungspotenzial mit dokumentiertem Frame",
    "DOCUMENTED COMPLEXITY AND LIMITED KNOWLEDGE": "Komplexität dokumentiert · Wissensstand begrenzt",
    "POLICY DESIGN AND MODELLED PATH": "Politikdesign · modellierter Wirkpfad",
    "OFFICIAL OBJECTIVE AND MODELLED POTENTIAL": "Amtliches Ziel · modelliertes Wirkungspotenzial",
    "NOT CAUSALLY ATTRIBUTED": "nicht kausal zugerechnet",
    "PARTIAL MECHANISM SUPPORTED NO BEHAVIOURAL ATTRIBUTION": "Teilmechanismus gestützt · keine Verhaltenszurechnung",
    "UNRESOLVED": "offen"
  };
  return labels[normalized] ?? text(value).replaceAll("_", " ");
}

function publicReferenceFields(values: string[]) {
  const mapped = values.flatMap((value) => {
    if (value === "SDG+ Diskurskultur") return ["SDG+ Diskursfähigkeit"];
    if (value === "SDG+ Resilienz") return ["Systemdimension: Wirkungsresilienz"];
    if (value === "SDG+ Transparenz/Open Data") return ["Kontextbezug: Transparenz und offene Daten"];
    return [value];
  });
  return [...new Set(mapped)];
}

function safeUrl(value: unknown) {
  try {
    const url = new URL(text(value));
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readEntry(archive: string, entry: string) {
  return JSON.parse(execFileSync("unzip", ["-p", archive, entry], { encoding: "utf8", maxBuffer: 4_000_000 })) as RecordValue;
}

function listEntries(archive: string) {
  return execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" })
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function publicSource(source: RecordValue) {
  const canonicalUrl = safeUrl(source.canonical_url);
  if (!canonicalUrl) return null;
  return {
    slug: safeSlug(`${text(source.institution)}-${text(source.title)}`),
    title: text(source.title),
    institution: text(source.institution),
    canonicalUrl,
    documentDate: typeof source.document_date === "string" ? source.document_date : null,
    documentType: text(source.source_type, "Quellenmaterial"),
    temporalClass: text(source.temporal_class, "CURRENT_REFERENCE"),
    location: text(source.exact_location),
    supports: text(source.what_it_supports),
    doesNotSupport: text(source.what_it_does_not_support)
  };
}

function toPublicFachanalyse(input: RecordValue) {
  const decision = object(input.decision);
  const visualisation = object(input.visualisation_data);
  const provenance = object(input.provenance);
  const normativeMapping = object(input.normative_mapping);
  const sourceList = Array.isArray(provenance.sources)
    ? provenance.sources.map((item) => publicSource(object(item))).filter((item): item is NonNullable<ReturnType<typeof publicSource>> => Boolean(item))
    : [];
  const sourceById = new Map(
    (Array.isArray(provenance.sources) ? provenance.sources : []).map((item) => [text(object(item).source_id), publicSource(object(item))])
  );
  const withSources = (item: RecordValue) => {
    const { source_refs: _sourceRefs, ...publicFields } = item;
    return {
      ...publicFields,
      sources: strings(_sourceRefs).map((sourceId) => sourceById.get(sourceId)).filter(Boolean)
    };
  };
  const publicPhase = (item: unknown) => {
    const value = object(item);
    return {
      cutoff: text(value.knowledge_cutoff ?? value.observation_cutoff),
      summary: text(value.summary),
      sources: strings(value.source_refs).map((sourceId) => sourceById.get(sourceId)).filter(Boolean)
    };
  };
  const timeline = (Array.isArray(input.version_timeline) ? input.version_timeline : [])
    .map((item) => {
      const value = object(item);
      return {
        date: text(value.date),
        label: text(value.version).replaceAll("_", " "),
        status: text(value.status).replaceAll("_", " "),
        summary: text(value.core_content),
        change: text(value.change_from_previous),
        potential: text(value.expected_impact_potential),
        sources: strings(value.source_refs).map((sourceId) => sourceById.get(sourceId)).filter(Boolean)
      };
    });
  const compare = (Array.isArray(visualisation.version_comparison) ? visualisation.version_comparison : []).map((item) => {
    const value = object(item);
    const sourceIds = text(value.evidence).split(",").map((id) => id.trim()).filter(Boolean);
    return {
      dimension: text(value.dimension),
      draft: text(value.government_draft),
      final: text(value["committee/final"]),
      sources: sourceIds.map((sourceId) => sourceById.get(sourceId)).filter(Boolean)
    };
  });
  return {
    slug: "gebaeudeenergiegesetz-medienwirkung",
    title: text(input.title),
    subtitle: "Was sich am Gesetz änderte, was heute beobachtbar ist – und was sich über Medienwirkung belastbar sagen lässt.",
    type: "SYSTEM_ANALYSIS",
    status: "PUBLISHED",
    analysisDate: text(input.analysis_cutoff),
    scope: "Gebäudeenergiegesetz 2023, parlamentarische Fassung, Umsetzung und öffentlicher Resonanzraum",
    summary: "Die Analyse trennt Gesetzesfassung, Wirkungspotenzial, beobachtbare Entwicklung und offene Kausalfragen. Sie zeigt: Ein dokumentierter Medienframe ist kein Nachweis dafür, dass Medien individuelles Verhalten oder die Wirkung des Gesetzes verursacht haben.",
    decision: {
      officialName: text(decision.official_name),
      date: text(decision.bundestag_decision_date),
      promulgation: text(decision.promulgation),
      inForce: text(decision.principal_entry_into_force)
    },
    publicationBoundary: text(input.release_boundary),
    referenceStatus: text(normativeMapping.reference_status),
    referenceStatusLabel: text(normativeMapping.reference_status).startsWith("PROPOSED_PENDING")
      ? "Vorgeschlagener Prüfbezug – Referenzabgleich ausstehend"
      : "Referenzabgleich abgeschlossen",
    exAnte: publicPhase(input.ex_ante),
    exPost: publicPhase(input.ex_post),
    timeline,
    comparison: compare,
    evidenceMap: object(visualisation.evidence_map),
    mediaPatterns: (Array.isArray(input.media_and_perception_layer) ? input.media_and_perception_layer : []).map((item) => {
      const value = object(item);
      return {
        label: text(value.pattern),
        period: text(value.period),
        potentialPath: text(value.potential_path),
        evidenceStatus: publicStatus(value.evidence_status),
        alternativeExplanation: text(value.strongest_alternative_explanation),
        causalStatus: publicStatus(value.causal_status),
        affectedGroups: strings(value.affected_groups),
        sources: strings(value.source_refs).map((sourceId) => sourceById.get(sourceId)).filter(Boolean)
      };
    }),
    referenceFields: {
      mpd: strings(normativeMapping.mpd_dimensions),
      sdgAndPlus: publicReferenceFields(strings(normativeMapping.sdg_sdgplus))
    },
    impactPaths: (Array.isArray(input.impact_paths) ? input.impact_paths : []).map((item) => {
      const value = object(item);
      return {
        lever: text(value.lever),
        hypothesis: text(value.hypothesis),
        prerequisites: strings(value.prerequisites),
        risks: strings(value.risks),
        evidenceStatus: publicStatus(value.evidence_status),
        sources: strings(value.source_refs).map((sourceId) => sourceById.get(sourceId)).filter(Boolean)
      };
    }),
    observedOutcomes: (Array.isArray(input.observed_outcomes) ? input.observed_outcomes : []).map((item) => withSources(object(item))),
    counterfactuals: (Array.isArray(input.counterfactuals) ? input.counterfactuals : []).map((item) => withSources(object(item))),
    calculationRequirements: (Array.isArray(input.calculation_requirements) ? input.calculation_requirements : []).map((item) => object(item)),
    risksAndBoundaries: (Array.isArray(input.risks_and_boundaries) ? input.risks_and_boundaries : []).map((item) => object(item)),
    dataGaps: [
      ...strings(input.data_gaps),
      ...(Array.isArray(input.data_gaps) ? input.data_gaps.map((item) => object(item)).filter((item) => Object.keys(item).length > 0) : [])
    ],
    counterarguments: (Array.isArray(input.counterarguments) ? input.counterarguments : []).map((item) => object(item)),
    retrospective: object(input.retrospective),
    learningPoints: strings(input.learning_points),
    sources: sourceList
  };
}

const archive = process.argv[2];
if (!archive) throw new Error("Usage: tsx scripts/generate-public-fachanalysen.ts <release-archive.zip>");
const resolvedArchive = resolve(archive);
const entry = listEntries(resolvedArchive).find((item) => item.endsWith("fachanalysen/gebaeudeenergiegesetz-medienwirkung.json"));
if (!entry) throw new Error("The release archive does not contain the GEG fachanalysis.");
const geg = toPublicFachanalyse(readEntry(resolvedArchive, entry));
const output = resolve("data/public-fachanalysen.json");
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify([geg], null, 2)}\n`);
console.log(JSON.stringify({ output: "data/public-fachanalysen.json", analyses: 1, sources: geg.sources.length }));
