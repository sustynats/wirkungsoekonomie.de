import "server-only";

import { createHash } from "node:crypto";
import { supabaseRest } from "@/lib/supabase-rest";

export const HISTORICAL_REVIEW_METHOD_VERSION = "parliament-method-v0.2";
export const WOEK_REFERENCE_SNAPSHOT = "woek-leading-references-2026-08-14";

type RegistryRow = {
  id: string;
  registry_key: string;
  government_term_id: string;
  parliamentary_case_id: string;
  decision_unit_id: string | null;
  decision_date: string;
  parliamentary_stage: string | null;
  final_decision_text: string | null;
  analysed_document_version_id: string | null;
  proposer: unknown[];
  decision_type: string | null;
  vote_type: string | null;
  vote_result: Record<string, unknown>;
  adopted_or_rejected: string | null;
  official_objective: string | null;
  materiality_assessment: string;
  selection_status: string;
  selection_reason: string | null;
  source_snapshot: Record<string, unknown>;
  named_vote_source_url: string | null;
  individual_votes_available: boolean;
};

type CaseRow = {
  id: string;
  title: string;
  original_title: string | null;
  external_system: string;
  external_id: string;
  legislative_term: string;
  workflow_status: string;
};

type SourceRow = {
  id: string;
  external_url: string;
  publisher: string;
  source_published_on: string;
  content_sha256: string | null;
  retrieved_at: string;
  raw_payload: unknown;
};

type DocumentVersionRow = {
  id: string;
  version_label: string;
  is_final_voting_version: boolean;
  impact_change: string;
  change_rationale_url: string | null;
  source_document_id: string;
  source_documents: SourceRow | null;
};

type KnowledgeRow = {
  time_side: "AS_KNOWN_ON_DECISION" | "POST_DECISION";
  evidence_text: string;
  source_documents: SourceRow | null;
};

type FactPackageRow = {
  id: string;
  package_version: number;
  parliamentary_status: string | null;
  decision_object: string | null;
  official_objective: string | null;
  baseline: string | null;
  affected_rules: unknown[];
  financial_elements: unknown[];
  implementation_actors: unknown[];
  dates: unknown[];
  source_document_ids: unknown[];
  uncertainties: unknown[];
  fact_status: string;
};

export type ReviewSourceManifestEntry = {
  source_id: string;
  title: string;
  institution: string;
  url: string;
  document_date: string;
  retrieved_at: string;
  document_type: "DIP_DECISION_METADATA" | "OFFICIAL_DOCUMENT_VERSION" | "OFFICIAL_EVIDENCE" | "NAMED_VOTE_METADATA";
  version: string | null;
  relevant_locations: string[];
  temporal_class: "AVAILABLE_AT_DECISION_TIME" | "PUBLISHED_AFTER_DECISION" | "CURRENT_REFERENCE";
  content_sha256: string | null;
};

export type HistoricalReviewPackage = {
  caseId: string;
  registryId: string;
  status: "READY" | "SOURCE_INCOMPLETE";
  packageHash: string;
  manifest: {
    case_id: string;
    registry_id: string;
    decision_date: string;
    reference_snapshot: string;
    method_version: string;
    source_ids: string[];
    required_files: string[];
    package_status: "READY" | "SOURCE_INCOMPLETE";
  };
  files: Record<string, string>;
};

function json(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function hashFiles(files: Record<string, string>) {
  const canonical = Object.entries(files)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([path, content]) => `${path}\u0000${content}`)
    .join("\n");
  return createHash("sha256").update(canonical).digest("hex");
}

function markdownEscape(value: string | null | undefined) {
  return (value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function dateTime(value: string) {
  return value ? new Date(value).toISOString() : value;
}

function decisionMetadataPresent(source: SourceRow | null) {
  if (!source?.raw_payload || typeof source.raw_payload !== "object") return false;
  const payload = source.raw_payload as Record<string, unknown>;
  return Array.isArray(payload.beschlussfassung) && payload.beschlussfassung.length > 0;
}

function sourceEntry(source: SourceRow, input: {
  decisionDate: string;
  title: string;
  type: ReviewSourceManifestEntry["document_type"];
  version?: string | null;
  location?: string | null;
}): ReviewSourceManifestEntry {
  return {
    source_id: source.id,
    title: input.title,
    institution: source.publisher,
    url: source.external_url,
    document_date: source.source_published_on,
    retrieved_at: dateTime(source.retrieved_at),
    document_type: input.type,
    version: input.version ?? null,
    relevant_locations: input.location ? [input.location] : [],
    temporal_class: source.source_published_on <= input.decisionDate ? "AVAILABLE_AT_DECISION_TIME" : "PUBLISHED_AFTER_DECISION",
    content_sha256: source.content_sha256
  };
}

function emptyEvidenceReadme(timeSide: "ex ante" | "ex post", sources: ReviewSourceManifestEntry[]) {
  const selected = sources.filter((source) => timeSide === "ex ante"
    ? source.temporal_class === "AVAILABLE_AT_DECISION_TIME"
    : source.temporal_class === "PUBLISHED_AFTER_DECISION");
  if (!selected.length) {
    return `# ${timeSide === "ex ante" ? "Evidenz zum Entscheidungszeitpunkt" : "Spätere Evidenz"}\n\n**DATA_GAP:** Im amtlichen Paket wurde noch keine inhaltlich abgegrenzte Evidenzquelle mit dieser Zeitklasse gespeichert. Dies ist kein negativer Befund und darf nicht ersetzt oder geschätzt werden.\n`;
  }
  return `# ${timeSide === "ex ante" ? "Evidenz zum Entscheidungszeitpunkt" : "Spätere Evidenz"}\n\n${selected.map((source) => `- [${source.title}](${source.url}) · ${source.document_date}${source.relevant_locations.length ? ` · Fundstelle: ${source.relevant_locations.join(", ")}` : " · konkrete Fundstelle noch zu extrahieren"}`).join("\n")}\n`;
}

/**
 * The snapshot is deliberately small and versioned. It identifies leading
 * material without copying the WÖk library into a third-party upload.
 */
export function woekReferenceSnapshot() {
  return {
    reference_snapshot_id: WOEK_REFERENCE_SNAPSHOT,
    generated_at: "2026-08-14",
    manifest_path: "docs/woek-knowledge/reference-manifest.yaml",
    leading_references: [
      { reference_id: "WOEK_BUCH", version: null, url: "https://wirkungsoekonomie.de/buch.html" },
      { reference_id: "WOEMM_2_0", version: "2.0", url: "https://wirkungsoekonomie.de/bibliothek/eintraege/woemm-2-0/lesen/" },
      { reference_id: "WOEMS_2_0", version: "2.0", url: "https://wirkungsoekonomie.de/bibliothek/eintraege/woems-2-0/lesen/" },
      { reference_id: "WOEK_BEGRIFFSLEITFADEN", version: "1.3", url: "https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/" },
      { reference_id: "WOEK_GLOSSAR", version: null, url: "https://wirkungsoekonomie.de/glossar.html" },
      { reference_id: "SDG_SDGPLUS_REFERENZRAHMEN", version: "0.3", url: "https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/" },
      { reference_id: "WOEK_MASTER_ITEMS", version: "1.3", url: "https://wirkungsoekonomie.de/bibliothek/woek-master-items-register/" },
      { reference_id: "T_SROI_RECHENSTANDARD", version: "1.1", url: "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/" }
    ],
    rule: "Nur führende Referenzen. Ersetzte Fassungen sind keine Grundlage für neue Regeln oder Berechnungen."
  };
}

async function loadRegistry(registryId: string) {
  const registry = await supabaseRest<RegistryRow[]>(
    `historical_decision_registry?id=eq.${encodeURIComponent(registryId)}&select=id,registry_key,government_term_id,parliamentary_case_id,decision_unit_id,decision_date,parliamentary_stage,final_decision_text,analysed_document_version_id,proposer,decision_type,vote_type,vote_result,adopted_or_rejected,official_objective,materiality_assessment,selection_status,selection_reason,source_snapshot,named_vote_source_url,individual_votes_available&limit=1`
  );
  const row = registry[0];
  if (!row) throw new Error("HISTORICAL_REGISTRY_ENTRY_NOT_FOUND");
  return row;
}

export async function buildHistoricalReviewPackage(registryId: string): Promise<HistoricalReviewPackage> {
  const registry = await loadRegistry(registryId);
  const [cases, documentVersions, knowledge, factPackages] = await Promise.all([
    supabaseRest<CaseRow[]>(`parliamentary_cases?id=eq.${encodeURIComponent(registry.parliamentary_case_id)}&select=id,title,original_title,external_system,external_id,legislative_term,workflow_status&limit=1`),
    supabaseRest<DocumentVersionRow[]>(`document_versions?parliamentary_case_id=eq.${encodeURIComponent(registry.parliamentary_case_id)}&select=id,version_label,is_final_voting_version,impact_change,change_rationale_url,source_document_id,source_documents(id,external_url,publisher,source_published_on,content_sha256,retrieved_at,raw_payload)&order=is_final_voting_version.desc,created_at.desc&limit=30`),
    supabaseRest<KnowledgeRow[]>(`case_knowledge_entries?parliamentary_case_id=eq.${encodeURIComponent(registry.parliamentary_case_id)}&select=time_side,evidence_text,source_documents(id,external_url,publisher,source_published_on,content_sha256,retrieved_at,raw_payload)&limit=60`),
    supabaseRest<FactPackageRow[]>(`decision_fact_packages?parliamentary_case_id=eq.${encodeURIComponent(registry.parliamentary_case_id)}&select=id,package_version,parliamentary_status,decision_object,official_objective,baseline,affected_rules,financial_elements,implementation_actors,dates,source_document_ids,uncertainties,fact_status&order=package_version.desc&limit=1`)
  ]);
  const parliamentaryCase = cases[0];
  if (!parliamentaryCase) throw new Error("HISTORICAL_CASE_NOT_FOUND");
  const finalVersion = documentVersions.find((version) => version.id === registry.analysed_document_version_id)
    ?? documentVersions.find((version) => version.is_final_voting_version)
    ?? null;
  const sourceEntries = new Map<string, ReviewSourceManifestEntry>();
  for (const version of documentVersions) {
    if (!version.source_documents) continue;
    sourceEntries.set(version.source_documents.id, sourceEntry(version.source_documents, {
      decisionDate: registry.decision_date,
      title: version.version_label,
      type: "OFFICIAL_DOCUMENT_VERSION",
      version: version.version_label,
      location: version.is_final_voting_version ? "Amtliche Schluss-/Abstimmungsfassung" : "Vorherige amtliche Fassung"
    }));
  }
  for (const entry of knowledge) {
    if (!entry.source_documents) continue;
    sourceEntries.set(entry.source_documents.id, sourceEntry(entry.source_documents, {
      decisionDate: registry.decision_date,
      title: `Amtliche Evidenz: ${entry.time_side === "AS_KNOWN_ON_DECISION" ? "zum Entscheidungszeitpunkt" : "nach der Entscheidung"}`,
      type: "OFFICIAL_EVIDENCE",
      location: "Fundstelle im Paket: evidence/"
    }));
  }
  if (registry.named_vote_source_url) {
    const namedVoteId = `named-vote:${registry.id}`;
    sourceEntries.set(namedVoteId, {
      source_id: namedVoteId,
      title: "Amtliche namentliche Abstimmung (Metadaten)",
      institution: "Deutscher Bundestag",
      url: registry.named_vote_source_url,
      document_date: registry.decision_date,
      retrieved_at: typeof registry.source_snapshot.imported_at === "string" ? registry.source_snapshot.imported_at : "UNKNOWN",
      document_type: "NAMED_VOTE_METADATA",
      version: null,
      relevant_locations: ["Ergebnis der namentlichen Abstimmung"],
      temporal_class: "AVAILABLE_AT_DECISION_TIME",
      content_sha256: null
    });
  }
  const sources = [...sourceEntries.values()];
  const finalSourceHasDecisionMetadata = decisionMetadataPresent(finalVersion?.source_documents ?? null);
  // A DIP position and its JSON response establish that a decision exists, but
  // they are not automatically the legally/factually relevant final text. The
  // package must carry an extracted final decision passage before it can leave
  // the protected system for a substantive review. This is intentionally more
  // conservative than merely having a source URL.
  const finalDecisionTextAvailable = Boolean(registry.final_decision_text?.trim());
  const complete = Boolean(finalVersion && finalVersion.source_documents && finalDecisionTextAvailable && (registry.adopted_or_rejected || finalSourceHasDecisionMetadata));
  const packageStatus = complete ? "READY" : "SOURCE_INCOMPLETE";
  const factPackage = factPackages[0] ?? null;
  const dataGaps = [
    ...(!finalVersion ? ["Keine amtliche Schluss-/Abstimmungsfassung im Datenbestand verknüpft."] : []),
    ...(!finalDecisionTextAvailable ? ["Die relevante finale Entscheidungs-/Gesetzespassage ist noch nicht aus der amtlichen Fassung extrahiert."] : []),
    ...(!registry.adopted_or_rejected && !finalSourceHasDecisionMetadata ? ["Beschlussstatus ist nicht aus einer amtlichen Quelle strukturiert ableitbar."] : []),
    ...(knowledge.filter((entry) => entry.time_side === "POST_DECISION").length ? [] : ["Keine gesonderte Ex-post-Evidenz ist im Fallpaket verknüpft."]),
    ...(!factPackage ? ["Noch kein bestätigtes Decision Fact Package vorhanden."] : [])
  ];
  const basePath = `cases/${parliamentaryCase.id}`;
  const decisionDescription = registry.final_decision_text
    ?? (finalVersion ? `Amtliche Fassung verlinkt: ${finalVersion.source_documents?.external_url ?? "Quelle fehlt"}` : "DATA_GAP: finale Fassung noch nicht verknüpft.");
  const caseManifest = {
    case_id: parliamentaryCase.id,
    registry_id: registry.id,
    registry_key: registry.registry_key,
    title: parliamentaryCase.title,
    official_title: parliamentaryCase.original_title,
    decision_date: registry.decision_date,
    decision_unit_id: registry.decision_unit_id,
    parliamentary_stage: registry.parliamentary_stage,
    case_status: parliamentaryCase.workflow_status,
    source_system: parliamentaryCase.external_system,
    source_external_id: parliamentaryCase.external_id,
    decision_unit_note: "Individuelle Abstimmungsdaten werden nicht exportiert und nicht bewertet.",
    package_status: packageStatus,
    data_gaps: dataGaps
  };
  const materiality = {
    status: registry.materiality_assessment,
    selection_status: registry.selection_status,
    reason: registry.selection_reason,
    rule: "Einbringung, Partei, Regierungs- oder Oppositionsstatus sind keine Auswahlparameter."
  };
  const reviewRequest = {
    case_id: parliamentaryCase.id,
    review_type: "HISTORICAL_WOEK_REVIEW",
    decision_object: registry.final_decision_text ?? parliamentaryCase.title,
    questions_to_answer: [
      "Ist der Entscheidungsgegenstand, die maßgebliche Fassung und der Beschlussstatus anhand der beigefügten Primärquellen ausreichend bestimmt?",
      "Welche Wirkpfade erster, zweiter und dritter Ordnung sind mit den Quellen begründbar – und welche bleiben DATA_GAP?",
      "Welche Daten, Gegenfaktualszenarien und Formel-/Regeltypen benötigt die deterministische Calculation Engine?",
      "Welche WÖk-ID-, SDG-/SDG+- und Mensch–Planet–Demokratie-Zuordnungen sind als prüfbare Vorschläge naheliegend?",
      "Was war am Entscheidungstag wissbar, und welche spätere Evidenz darf nur ex post verwendet werden?"
    ],
    required_outputs: ["review-result.json entsprechend dem Exportvertrag", "keine freie produktive Zahl", "Quellenreferenzen nur aus source-manifest.json"],
    known_data_gaps: dataGaps,
    known_source_conflicts: [],
    calculation_inputs_available: [],
    calculation_inputs_missing: ["Baseline, Gegenfaktum, Reichweite und Attribution nur benennen, wenn keine belastbare Quelle im Paket vorliegt."],
    constraints: {
      no_person_or_party_assessment: true,
      no_individual_vote_export: true,
      no_ai_generated_numeric_operand: true,
      ex_ante_knowledge_cutoff: registry.decision_date,
      woek_reference_snapshot: WOEK_REFERENCE_SNAPSHOT
    }
  };
  const sourceManifest = {
    case_id: parliamentaryCase.id,
    decision_date: registry.decision_date,
    sources,
    temporal_rule: "AVAILABLE_AT_DECISION_TIME darf für Ex-ante verwendet werden. PUBLISHED_AFTER_DECISION nur ex post. CURRENT_REFERENCE beschreibt Methodik, nicht parlamentarische Tatsachen."
  };
  const facts = factPackage ?? {
    fact_status: "SOURCE_REQUIRED",
    decision_object: registry.final_decision_text ?? parliamentaryCase.title,
    official_objective: registry.official_objective,
    source_document_ids: sources.map((source) => source.source_id),
    uncertainties: dataGaps
  };
  const previousVersions = documentVersions.filter((version) => version.id !== finalVersion?.id);
  const files: Record<string, string> = {
    [`${basePath}/README.md`]: `# ${parliamentaryCase.title}\n\n**Paketstatus:** ${packageStatus}\n\nDieses Paket enthält ausschließlich die minimale, amtlich referenzierbare Grundlage für einen strukturierten historischen WÖk-Review. Fehlende Nachweise bleiben DATA_GAP. Es enthält keine individuellen Stimmzeilen, Profile oder Bewertungen von Personen/Parteien.\n`,
    [`${basePath}/case-manifest.json`]: json(caseManifest),
    [`${basePath}/fact-package.json`]: json(facts),
    [`${basePath}/decision.md`]: `# Was wurde entschieden?\n\n| Feld | Amtlicher Stand |\n| --- | --- |\n| Entscheidungsgegenstand | ${markdownEscape(registry.final_decision_text ?? parliamentaryCase.title)} |\n| Datum | ${registry.decision_date} |\n| Beschlussstatus | ${markdownEscape(registry.adopted_or_rejected)} |\n| Abstimmungsart | ${markdownEscape(registry.vote_type)} |\n| Abstimmungsergebnis | \`${JSON.stringify(registry.vote_result)}\` |\n| Maßgebliche Fassung | ${finalVersion?.source_documents?.external_url ? `[${markdownEscape(finalVersion.version_label)}](${finalVersion.source_documents.external_url})` : "DATA_GAP"} |\n\n${registry.final_decision_text ? registry.final_decision_text : "**DATA_GAP:** Der maschinenlesche Import enthält noch keinen extrahierten Wortlaut der finalen Entscheidung. Die amtliche Originalquelle ist oben verlinkt."}\n`,
    [`${basePath}/parliamentary-history.md`]: `# Parlamentarische Geschichte\n\n- Vorgang: ${markdownEscape(parliamentaryCase.original_title ?? parliamentaryCase.title)}\n- DIP-Identität: ${parliamentaryCase.external_id}\n- Parlamentarische Stufe: ${markdownEscape(registry.parliamentary_stage)}\n- Finale Fassung: ${finalVersion ? finalVersion.version_label : "DATA_GAP"}\n- Frühere im Paket bekannte Fassungen: ${previousVersions.length}\n- Namentliche Abstimmung amtlich verfügbar: ${registry.individual_votes_available ? "Ja (nur Fallmetadaten exportiert; keine Personenstimmen)" : "Nein bzw. nicht verknüpft"}\n`,
    [`${basePath}/source-manifest.json`]: json(sourceManifest),
    [`${basePath}/materiality.json`]: json(materiality),
    [`${basePath}/evidence/ex-ante/README.md`]: emptyEvidenceReadme("ex ante", sources),
    [`${basePath}/evidence/ex-post/README.md`]: emptyEvidenceReadme("ex post", sources),
    [`${basePath}/documents/final-decision/README.md`]: finalVersion?.source_documents?.external_url
      ? `# Amtliche finale Fassung\n\n- Version: ${finalVersion.version_label}\n- Quelle: ${finalVersion.source_documents.external_url}\n- Lokale Kopie: nicht exportiert. Amtliche Dokumente bleiben per Primärquelle referenziert; keine unnötigen Binärdateien im Review-ZIP.\n`
      : "# Amtliche finale Fassung\n\n**DATA_GAP:** Für diesen Fall ist keine finale amtliche Fassung im Datenbestand verknüpft.\n",
    [`${basePath}/documents/relevant-previous-versions/README.md`]: `# Relevante frühere Fassungen\n\n${previousVersions.length ? previousVersions.map((version) => `- ${version.source_documents?.external_url ? `[${version.version_label}](${version.source_documents.external_url})` : version.version_label}`).join("\n") : "Keine frühere Fassung im Paket verknüpft."}\n`,
    [`${basePath}/woek/reference-snapshot.json`]: json(woekReferenceSnapshot()),
    [`${basePath}/woek/candidate-woek-ids.json`]: json({ status: "DATA_GAP", candidate_woek_ids: [], rule: "IDs werden erst als prüfbarer Review-Vorschlag oder regelbasiert ergänzt; keine Altversion verwenden." }),
    [`${basePath}/woek/candidate-normative-mapping.json`]: json({ status: "DATA_GAP", candidate_sdgs: [], candidate_sdg_plus: [], candidate_mpd_dimensions: [], rule: "Mapping ist keine Bewertung und wird nicht aus Parteimetadaten abgeleitet." }),
    [`${basePath}/review-request.json`]: json(reviewRequest)
  };
  const packageHash = hashFiles(files);
  const manifest = {
    case_id: parliamentaryCase.id,
    registry_id: registry.id,
    decision_date: registry.decision_date,
    reference_snapshot: WOEK_REFERENCE_SNAPSHOT,
    method_version: HISTORICAL_REVIEW_METHOD_VERSION,
    source_ids: sources.map((source) => source.source_id),
    required_files: Object.keys(files).sort(),
    package_status: packageStatus
  } as const;
  files[`${basePath}/case-manifest.json`] = json({ ...caseManifest, package_hash: packageHash, reference_snapshot: WOEK_REFERENCE_SNAPSHOT, source_ids: manifest.source_ids });
  files[`${basePath}/review-request.json`] = json({ ...reviewRequest, exported_package_hash: packageHash, source_ids: manifest.source_ids });
  return { caseId: parliamentaryCase.id, registryId: registry.id, status: packageStatus, packageHash, manifest, files };
}

export type RegistryExportEntry = {
  registry_id: string;
  case_id: string;
  title: string;
  original_title: string | null;
  decision_date: string;
  decision_unit_id: string | null;
  parliamentary_stage: string | null;
  final_version: string | null;
  vote_type: string | null;
  vote_result: Record<string, unknown>;
  materiality_status: string;
  source_status: string;
  detail_package_path: string;
  review_status: string;
};

export async function listHistoricalRegistryEntries(governmentTermId: string): Promise<RegistryExportEntry[]> {
  const registry = await supabaseRest<Array<RegistryRow & { parliamentary_cases: CaseRow | null }>>(
    `historical_decision_registry?government_term_id=eq.${encodeURIComponent(governmentTermId)}&select=id,registry_key,government_term_id,parliamentary_case_id,decision_unit_id,decision_date,parliamentary_stage,final_decision_text,analysed_document_version_id,proposer,decision_type,vote_type,vote_result,adopted_or_rejected,official_objective,materiality_assessment,selection_status,selection_reason,source_snapshot,named_vote_source_url,individual_votes_available,review_package_status,review_import_status,parliamentary_cases(id,title,original_title,external_system,external_id,legislative_term,workflow_status)&order=decision_date.asc&limit=5000`
  );
  return registry.map((entry) => ({
    registry_id: entry.id,
    case_id: entry.parliamentary_case_id,
    title: entry.parliamentary_cases?.title ?? "Unbenannter Vorgang",
    original_title: entry.parliamentary_cases?.original_title ?? null,
    decision_date: entry.decision_date,
    decision_unit_id: entry.decision_unit_id,
    parliamentary_stage: entry.parliamentary_stage,
    final_version: entry.final_decision_text,
    vote_type: entry.vote_type,
    vote_result: entry.vote_result,
    materiality_status: entry.materiality_assessment,
    source_status: (entry as RegistryRow & { review_package_status?: string }).review_package_status ?? "NOT_READY",
    detail_package_path: `cases/${entry.parliamentary_case_id}/`,
    review_status: (entry as RegistryRow & { review_import_status?: string }).review_import_status ?? "NOT_REVIEWED"
  }));
}

export function decisionRegistryMarkdown(entries: RegistryExportEntry[]) {
  const header = "# Wirkungsbilanz der laufenden Regierungszeit – Entscheidungsregister\n\n" +
    "Amtlicher Arbeitsbestand ab 2025-05-06. Dieses Register ist kein Analysebericht. Die Detailpakete enthalten nur die für einen Review notwendigen, primärquellenbasierten Daten.\n\n" +
    "| case_id | Verständlicher Titel | Datum | DecisionUnit | Beschlussstatus | finale Fassung | Abstimmungsart/-ergebnis | Materialität | Quellenstatus | Detailpaket | Review-Status |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n";
  return header + entries.map((entry) => `| ${entry.case_id} | ${markdownEscape(entry.title)} | ${entry.decision_date} | ${entry.decision_unit_id ?? "DATA_GAP"} | ${markdownEscape(entry.parliamentary_stage)} | ${markdownEscape(entry.final_version)} | ${markdownEscape(entry.vote_type)} / \`${JSON.stringify(entry.vote_result)}\` | ${entry.materiality_status} | ${entry.source_status} | ${entry.detail_package_path} | ${entry.review_status} |`).join("\n") + "\n";
}
