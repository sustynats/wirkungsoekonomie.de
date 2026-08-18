#!/usr/bin/env node

import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const inputRoot = process.env.WOEK_GOVERNMENT_1_1_ROOT
  ?? path.join(projectRoot, "government-data", "input", "WOEK-GOVERNMENT-DATA-2025-2026-INGEST-1.1");
const deliverableRoot = process.env.WOEK_GOVERNMENT_1_2_ROOT
  ?? path.join(projectRoot, "deliverables", "WOEK-GOVERNMENT-DATA-2025-2026-INGEST-1.2");
const appRoot = path.join(projectRoot, "data", "government");
const generatedAt = "2026-08-18T12:00:00Z";

const knownOvermerges = [
  "govaction:dip:321575",
  "govaction:dip:328503",
  "govaction:dip:325255",
  "govaction:dip:328937",
  "govaction:dip:336982",
  "govaction:dip:333505",
  "govaction:breg-cabinet:2445448:top:4",
];

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function readJsonl(file) {
  return readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeJsonl(file, values) {
  ensureDir(path.dirname(file));
  writeFileSync(file, values.map((value) => JSON.stringify(value)).join("\n") + (values.length ? "\n" : ""));
}

function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
}

function fileSha256(file) {
  return sha256(readFileSync(file));
}

function stableRelationId(parts) {
  return `rel:${sha256(parts.join("|" )).slice(0, 24)}`;
}

function parseBody(event) {
  if (!event?.body_text_original) return {};
  try {
    return JSON.parse(event.body_text_original);
  } catch {
    return {};
  }
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))];
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function normalizeDocumentNumber(value) {
  if (!value) return null;
  const normalized = String(value).trim();
  if (/^(BT|BR)\s/.test(normalized)) return normalized;
  if (/^\d+\/\d+/.test(normalized)) return `BT ${normalized}`;
  return normalized;
}

function documentsForSources(events) {
  const documents = [];
  for (const event of events) {
    const ids = event.official_identifiers ?? {};
    for (const value of ids.drucksachen ?? []) documents.push(normalizeDocumentNumber(value));
    if (ids.document_number) documents.push(normalizeDocumentNumber(ids.document_number));
    const body = parseBody(event);
    for (const fundstelle of asArray(body.fundstelle)) {
      for (const number of String(fundstelle.dokumentnummer ?? "").split(",")) {
        documents.push(normalizeDocumentNumber(number));
      }
    }
  }
  return unique(documents);
}

function otherIdentifiersForSources(events) {
  const other = [];
  const seen = new Set();
  for (const event of events) {
    for (const value of event.official_identifiers?.other ?? []) {
      const key = JSON.stringify(value);
      if (!seen.has(key)) {
        seen.add(key);
        other.push(value);
      }
    }
    const body = parseBody(event);
    for (const fundstelle of asArray(body.fundstelle)) {
      if (!fundstelle.id && !fundstelle.pdf_url) continue;
      const value = {
        ...(fundstelle.id ? { dip_document_id: String(fundstelle.id) } : {}),
        ...(fundstelle.pdf_url ? { document_url: fundstelle.pdf_url } : {}),
      };
      const key = JSON.stringify(value);
      if (!seen.has(key)) {
        seen.add(key);
        other.push(value);
      }
    }
  }
  return other;
}

function lifecycleFromProcedure(body) {
  const status = String(body.beratungsstand ?? "").toLowerCase();
  if (status.includes("verkündet")) return "PROMULGATED";
  if (status.includes("verabschiedet") || status.includes("angenommen") || status.includes("beschlossen")) return "ADOPTED";
  if (status.includes("abgelehnt")) return "ADOPTED";
  if (status.includes("zurückgezogen")) return "WITHDRAWN";
  return "PARLIAMENTARY_PROCESS";
}

function actionTypeFromProcedure(body) {
  const type = String(body.vorgangstyp ?? "").toLowerCase();
  if (type.includes("gesetzgebung")) return "GOVERNMENT_BILL";
  if (type.includes("rechtsverordnung")) return "REGULATION";
  if (type.includes("verwaltungsvorschrift")) return "ADMINISTRATIVE_RULE";
  if (type.includes("haushalt") || type.includes("budget")) return "BUDGET_ACTION";
  if (type.includes("bericht")) return "GOVERNMENT_REPORT";
  if (type.includes("antrag")) return "OTHER";
  return "OTHER";
}

function sourceRef(event) {
  return {
    source_event_id: event.source_event_id,
    source_function: event.source_function,
    title: event.title_original,
    url: event.canonical_source_url ?? event.source_url,
    published_at: event.published_at,
    retrieved_at: event.retrieved_at,
    official_identifiers: event.official_identifiers ?? {},
  };
}

function fieldProvenance(field, value, event, locator) {
  return { field, value, source_event_id: event.source_event_id, locator };
}

const sourceEvents = readJsonl(path.join(inputRoot, "normalized", "source-events.jsonl"));
const canonical11 = readJsonl(path.join(inputRoot, "canonical", "government-actions.jsonl"));
const relationships11 = readJsonl(path.join(inputRoot, "canonical", "relationships.jsonl"));
const public11 = readJsonl(path.join(inputRoot, "public", "government-actions.jsonl"));
const eventById = new Map(sourceEvents.map((event) => [event.source_event_id, event]));
const public11Ids = new Set(public11.map((action) => action.government_action_id));

const multiDipReview = [];
const superseded = [];
const canonical12 = [];
const review12 = [];

function dipEventsForAction(action) {
  return action.source_event_ids.map((id) => eventById.get(id)).filter(Boolean);
}

function buildDipAction(procedureEvent, exactEvents, previousActionId) {
  const body = parseBody(procedureEvent);
  const dipId = String(body.id ?? procedureEvent.external_id);
  const events = unique(exactEvents.map((event) => event.source_event_id)).map((id) => eventById.get(id)).filter(Boolean);
  const decisionDate = String(body.datum ?? procedureEvent.published_at ?? "").slice(0, 10) || null;
  const ministries = unique(events.flatMap((event) => event.named_ministries ?? []));
  const institutions = unique([...(body.initiative ?? []), ...ministries]);
  const lifecycleStatus = lifecycleFromProcedure(body);
  const governmentActionId = `govaction:dip:${dipId}`;
  const sourcesAreComplete = events.length > 0 && events.every((event) => event.parse_status === "SUCCESS" && event.source_url && event.raw_blob_sha256);
  const sourceIds = events.map((event) => event.source_event_id);

  return {
    action_type: actionTypeFromProcedure(body),
    budget_refs: [],
    cabinet_decision_date: null,
    canonicalization_notes: [
      `Data 1.2: eigenständiger amtlicher DIP-Vorgang ${dipId}.`,
      "Gemeinsame Drucksachen, Plenarprotokolle oder Tagesordnungen wurden nicht als Identitätsbeweis verwendet.",
      ...(previousActionId !== governmentActionId ? [`Aus Data-1.1-Cluster ${previousActionId} herausgelöst.`] : []),
    ],
    coalition_commitment_refs: [],
    coverage_scope_status: "COMPLETE_ENUMERATED_SOURCE",
    created_at: generatedAt,
    duplicate_cluster_id: null,
    effective_date: null,
    fach_review_status: "CONFIRMED_ACTION",
    field_provenance: [
      fieldProvenance("title_official_preferred", body.titel ?? procedureEvent.title_original, procedureEvent, `DIP Vorgang ${dipId}`),
      fieldProvenance("first_known_date", decisionDate, procedureEvent, `DIP Vorgang ${dipId}`),
      fieldProvenance("lifecycle_status", lifecycleStatus, procedureEvent, `DIP Beratungsstand: ${body.beratungsstand ?? "offen"}`),
    ],
    first_known_date: decisionDate,
    funding_refs: [],
    government_action_id: governmentActionId,
    government_term_id: "bund-2025",
    identity_status: "VERIFIED",
    legal_basis_refs: [],
    lifecycle_events: [{ date: decisionDate, source_event_id: procedureEvent.source_event_id, status: lifecycleStatus }],
    lifecycle_status: lifecycleStatus,
    manual_review_required: false,
    materiality_signals: {
      affected_population_explicit: null,
      budget_amount_explicit: null,
      constitutional_reference_explicit: null,
      legal_change: String(body.vorgangstyp ?? "").includes("Gesetz"),
      long_term_strategy: null,
      major_infrastructure: null,
      multi_ministry: ministries.length > 1,
      national_scope: true,
    },
    no_open_p0_overmerge: true,
    official_identifiers: {
      bgbl: [],
      dip_ids: [dipId],
      drucksachen: documentsForSources(events),
      eli: [],
      other: otherIdentifiersForSources(events),
    },
    parliamentary_case_refs: [`dip-vorgang:${dipId}`],
    procurement_refs: [],
    promulgated_date: null,
    publication_status: sourcesAreComplete ? "APPROVED" : "BLOCKED_SOURCE",
    related_government_action_ids: [],
    relationship_review_status: "CONFIRMED",
    responsible_institutions: institutions.length ? institutions : ["Bundesregierung"],
    responsible_ministries: ministries,
    review_method: "OFFICIAL_IDENTIFIER",
    review_notes: ["Amtliche DIP-Verfahrenskennung ist der starke Identitätsanker."],
    review_rule_id: "DATA-1.2-DIP-PROCEDURE-IDENTITY",
    reviewed_at: generatedAt,
    schema_version: "1.2",
    source_completeness: sourcesAreComplete ? "COMPLETE_ENUMERATED_SOURCE" : "PARTIAL",
    source_event_ids: sourceIds,
    source_integrity_status: sourcesAreComplete ? "PASS" : "FAIL",
    source_provenance: sourcesAreComplete ? "PASS" : "FAIL",
    submitted_to_parliament_date: decisionDate,
    title_canonical: body.titel ?? procedureEvent.title_original,
    title_official_preferred: body.titel ?? procedureEvent.title_original,
    updated_at: generatedAt,
  };
}

for (const action of canonical11) {
  const events = dipEventsForAction(action);
  const procedureEvents = events.filter((event) => event.event_type === "PARLIAMENTARY_PROCEDURE");
  if (procedureEvents.length) {
    const procedureIds = unique(procedureEvents.map((event) => String(parseBody(event).id ?? event.external_id)));
    if (procedureIds.length > 1) {
      const dates = events.map((event) => event.published_at).filter(Boolean).sort();
      multiDipReview.push({
        object_id: action.government_action_id,
        primary_dip_id: String(action.official_identifiers?.dip_ids?.[0] ?? ""),
        all_dip_ids: procedureIds.join("|"),
        source_ref_count: events.length,
        distinct_titles: unique(events.map((event) => event.title_original)).length,
        responsible_ministries: unique(events.flatMap((event) => event.named_ministries ?? [])).join("|"),
        date_span: dates.length ? `${dates[0]}..${dates.at(-1)}` : "",
        shared_document_ids: documentsForSources(events).join("|"),
        strong_identity_anchor: "dip_procedure_id",
        explicit_official_same_measure_reference: false,
        review_result: "SPLIT_BY_OFFICIAL_PROCEDURE_ID",
      });
    }

    const childIds = [];
    for (const procedureEvent of procedureEvents) {
      const dipId = String(parseBody(procedureEvent).id ?? procedureEvent.external_id);
      const exactEvents = events.filter((event) => {
        const ids = event.official_identifiers ?? {};
        const body = parseBody(event);
        return String(body.id ?? ids.dip_procedure_id ?? event.external_id) === dipId
          || String(ids.dip_procedure_id ?? "") === dipId;
      });
      const rebuilt = buildDipAction(procedureEvent, exactEvents, action.government_action_id);
      if (!canonical12.some((candidate) => candidate.government_action_id === rebuilt.government_action_id)) {
        canonical12.push(rebuilt);
        childIds.push(rebuilt.government_action_id);
      }
    }
    if (action.government_action_id !== childIds[0] || childIds.length > 1) {
      superseded.push({
        old_id: action.government_action_id,
        new_ids: childIds,
        reason: childIds.length > 1 ? "DATA_1_1_OVERMERGE_SPLIT_BY_DIP_PROCEDURE_ID" : "DATA_1_2_IDENTITY_REBUILT",
        date: "2026-08-18",
      });
    }
    continue;
  }

  if (action.government_action_id === "govaction:breg-cabinet:2445448:top:4") {
    const [primaryEventId, ...contextEventIds] = action.source_event_ids;
    const common = {
      ...action,
      created_at: generatedAt,
      updated_at: generatedAt,
      reviewed_at: generatedAt,
      schema_version: "1.2",
      identity_status: "VERIFIED",
      no_open_p0_overmerge: true,
      publication_status: "APPROVED",
      source_provenance: "PASS",
      source_integrity_status: "PASS",
      relationship_review_status: "CONFIRMED",
      source_event_ids: [primaryEventId, ...contextEventIds],
      review_method: "MANUAL",
      review_rule_id: "DATA-1.2-MULTI-ACTION-AGENDA-SPLIT",
    };
    const infrastructureId = `${action.government_action_id}:bundeswehr-infrastruktur`;
    const preparednessId = `${action.government_action_id}:sicherstellung-vorsorge`;
    canonical12.push({
      ...common,
      government_action_id: infrastructureId,
      title_canonical: "Entwurf eines Bundeswehr-Infrastrukturbeschleunigungsgesetzes",
      title_official_preferred: "Entwurf eines Bundeswehr-Infrastrukturbeschleunigungsgesetzes",
      responsible_ministries: ["Bundesministerium der Verteidigung", "Bundesministerium für Umwelt, Klimaschutz, Naturschutz und nukleare Sicherheit"],
      canonicalization_notes: ["Data 1.2: amtlich eigenständiger Beschlussgegenstand aus Kabinetts-TOP 4 vom 1. Juli 2026."],
    });
    canonical12.push({
      ...common,
      action_type: "STRATEGY",
      government_action_id: preparednessId,
      title_canonical: "Eckpunkte zur Novellierung der Sicherstellungs- und Vorsorgegesetze",
      title_official_preferred: "Eckpunkte zur Novellierung der Sicherstellungs- und Vorsorgegesetze",
      responsible_ministries: ["Bundesministerium des Innern", "Bundesministerium der Verteidigung"],
      canonicalization_notes: ["Data 1.2: amtlich eigenständiger Beschlussgegenstand aus Kabinetts-TOP 4 vom 1. Juli 2026."],
    });
    superseded.push({
      old_id: action.government_action_id,
      new_ids: [infrastructureId, preparednessId],
      reason: "DATA_1_1_COMPOUND_CABINET_ITEM_SPLIT",
      date: "2026-08-18",
    });
    continue;
  }

  const sourceIntegrity = action.source_integrity_status === "PASS" && action.source_event_ids.length > 0;
  const rebuilt = {
    ...action,
    created_at: action.created_at,
    updated_at: generatedAt,
    reviewed_at: generatedAt,
    schema_version: "1.2",
    identity_status: action.manual_review_required ? "REVIEW_REQUIRED" : "VERIFIED",
    no_open_p0_overmerge: !action.manual_review_required,
    publication_status: sourceIntegrity && !action.manual_review_required ? "APPROVED" : "OPEN_DATA_ISSUE",
    source_provenance: sourceIntegrity ? "PASS" : "FAIL",
  };
  if (rebuilt.publication_status === "APPROVED") canonical12.push(rebuilt);
  else review12.push(rebuilt);
}

const overmergeReview = [];
const verifiedCanonical = [];
for (const action of canonical12) {
  const events = action.source_event_ids.map((id) => eventById.get(id)).filter(Boolean);
  const dates = events.map((event) => event.published_at).filter(Boolean).sort();
  const title = String(action.title_official_preferred ?? action.title_canonical ?? "");
  const titleFlags = [];
  const dipIdsForAction = action.official_identifiers?.dip_ids ?? [];
  const exactDipIdentity = dipIdsForAction.length === 1 && action.government_action_id === `govaction:dip:${dipIdsForAction[0]}`;
  if (!exactDipIdentity) {
    if (/\ba\)\s.+\bb\)\s/is.test(title)) titleFlags.push("MULTIPLE_LETTERED_AGENDA_ITEMS");
    if (/\bsowie\s+Kenntnisnahme\s+des\s+Entwurfs/i.test(title)) titleFlags.push("MULTIPLE_DECISION_VERBS");
    if ((title.match(/\bEntwurf\b/gi) ?? []).length >= 3) titleFlags.push("MULTIPLE_DRAFT_OBJECTS");
    if (title.length > 1200) titleFlags.push("UNUSUALLY_LONG_COMPOUND_TITLE");
    if (dipIdsForAction.length > 1) titleFlags.push("MULTIPLE_DIP_PROCEDURE_IDS");
    if (events.length > 10) titleFlags.push("UNUSUALLY_MANY_SOURCES");
    if (unique(events.map((event) => event.title_original)).length > 5) titleFlags.push("HIGH_SOURCE_TITLE_ENTROPY");
    if ((action.responsible_ministries ?? []).length > 4) titleFlags.push("UNUSUALLY_MANY_MINISTRIES");
    if ((action.legal_basis_refs ?? []).length > 4) titleFlags.push("MULTIPLE_UNRELATED_LEGAL_ACTS_REVIEW");
    if (dates.length > 1 && (new Date(dates.at(-1)).getTime() - new Date(dates[0]).getTime()) / 86_400_000 > 366) titleFlags.push("LARGE_SOURCE_TIME_SPAN");
  }
  const reviewRow = {
    object_id: action.government_action_id,
    dip_ids: (action.official_identifiers?.dip_ids ?? []).join("|"),
    source_ref_count: events.length,
    distinct_titles: unique(events.map((event) => event.title_original)).length,
    responsible_ministries: (action.responsible_ministries ?? []).join("|"),
    date_span: dates.length ? `${dates[0]}..${dates.at(-1)}` : "",
    title_length: title.length,
    review_flags: titleFlags.join("|"),
    review_status: titleFlags.length ? "SEMANTIC_ENTITY_REVIEW_REQUIRED" : "PASS_AUTOMATED_IDENTITY_GUARDS",
  };
  overmergeReview.push(reviewRow);
  if (titleFlags.length) {
    review12.push({
      ...action,
      identity_status: "REVIEW_REQUIRED",
      manual_review_required: true,
      no_open_p0_overmerge: false,
      publication_status: "BLOCKED_DATA_IDENTITY",
      relationship_review_status: "REVIEW_REQUIRED",
      canonicalization_notes: [...(action.canonicalization_notes ?? []), `Data 1.2 systemweite Overmerge-Heuristik: ${titleFlags.join(", ")}.`],
    });
  } else {
    verifiedCanonical.push(action);
  }
}
canonical12.length = 0;
canonical12.push(...verifiedCanonical);

canonical12.sort((a, b) => a.government_action_id.localeCompare(b.government_action_id));
review12.sort((a, b) => a.government_action_id.localeCompare(b.government_action_id));

const canonicalIds = new Set(canonical12.map((action) => action.government_action_id));
const canonicalById = new Map(canonical12.map((action) => [action.government_action_id, action]));
const relations12 = [];
for (const action of canonical12) {
  for (const sourceEventId of action.source_event_ids) {
    relations12.push({
      relationship_id: stableRelationId([action.government_action_id, "HAS_SOURCE_EVENT", sourceEventId]),
      source_object_id: action.government_action_id,
      target_object_id: sourceEventId,
      relationship_type: "HAS_SOURCE_EVENT",
      evidence_source_event_ids: [sourceEventId],
      confidence: "EXACT",
      method: "OFFICIAL_IDENTIFIER",
      review_status: "CONFIRMED",
      created_at: generatedAt,
    });
  }
  for (const parliamentaryCaseRef of action.parliamentary_case_refs ?? []) {
    relations12.push({
      relationship_id: stableRelationId([action.government_action_id, "RELATED_TO_PARLIAMENTARY_CASE", parliamentaryCaseRef]),
      source_object_id: action.government_action_id,
      target_object_id: parliamentaryCaseRef,
      relationship_type: "RELATED_TO_PARLIAMENTARY_CASE",
      evidence_source_event_ids: action.source_event_ids,
      confidence: "EXACT",
      method: "OFFICIAL_IDENTIFIER",
      review_status: "CONFIRMED",
      created_at: generatedAt,
    });
  }
}

const publicActions = canonical12
  .filter((action) => action.publication_status === "APPROVED" && action.identity_status === "VERIFIED" && action.source_provenance === "PASS" && action.no_open_p0_overmerge)
  .map((action) => ({
    government_action_id: action.government_action_id,
    title: action.title_official_preferred,
    action_type: action.action_type,
    responsible_institutions: action.responsible_institutions,
    responsible_ministries: action.responsible_ministries,
    decision_date: action.cabinet_decision_date ?? action.first_known_date,
    effective_date: action.effective_date,
    lifecycle_status: action.lifecycle_status,
    publication_status: "APPROVED",
    identity_status: action.identity_status,
    source_provenance: action.source_provenance,
    no_open_p0_overmerge: action.no_open_p0_overmerge,
    coverage_scope_status: action.coverage_scope_status,
    official_identifiers: action.official_identifiers,
    source_refs: action.source_event_ids.map((id) => eventById.get(id)).filter(Boolean).map(sourceRef),
    parliamentary_case_refs: action.parliamentary_case_refs,
    related_actions: action.related_government_action_ids,
    has_woek_analysis: false,
    analysis_stage: null,
    last_verified_at: generatedAt,
    data_version: "1.2",
  }))
  .sort((a, b) => (b.decision_date ?? "").localeCompare(a.decision_date ?? "") || a.government_action_id.localeCompare(b.government_action_id));

const publicSourceIndex = Object.fromEntries(publicActions.map((action) => [action.government_action_id, action.source_refs]));
const dipIds = canonical12.flatMap((action) => action.official_identifiers?.dip_ids ?? []);
const duplicateDipIds = [...new Set(dipIds.filter((id, index) => dipIds.indexOf(id) !== index))];
const multiDipRemaining = canonical12.filter((action) => (action.official_identifiers?.dip_ids ?? []).length > 1);

const knownRegressionResults = knownOvermerges.map((oldId) => {
  const replacement = superseded.find((entry) => entry.old_id === oldId);
  return {
    old_id: oldId,
    superseded: Boolean(replacement),
    new_ids: replacement?.new_ids ?? [],
    replacements_exist: Boolean(replacement) && replacement.new_ids.every((id) => canonicalIds.has(id)),
    result: replacement && replacement.new_ids.every((id) => canonicalIds.has(id)) ? "PASS" : "FAIL",
  };
});

const validation = {
  data_version: "1.2",
  generated_at: generatedAt,
  canonical_objects: canonical12.length,
  public_objects: publicActions.length,
  review_objects: review12.length,
  relationships: relations12.length,
  source_events: sourceEvents.length,
  multi_dip_clusters_reviewed: multiDipReview.length,
  overmerge_guard_objects_scanned: overmergeReview.length,
  semantic_entity_review_required: overmergeReview.filter((row) => row.review_status === "SEMANTIC_ENTITY_REVIEW_REQUIRED").length,
  multi_dip_remaining: multiDipRemaining.length,
  duplicate_dip_ids: duplicateDipIds,
  known_overmerge_regressions: knownRegressionResults,
  gates: {
    DATA_1_2_VALIDATION: multiDipRemaining.length === 0 && duplicateDipIds.length === 0 ? "PASS" : "FAIL",
    KNOWN_OVERMERGE_REGRESSIONS: knownRegressionResults.every((item) => item.result === "PASS") ? "PASS" : "FAIL",
    PUBLIC_EXPORT: publicActions.every((action) => action.source_refs.length > 0 && action.identity_status === "VERIFIED") ? "PASS" : "FAIL",
  },
};

const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
function writeCsv(file, rows) {
  ensureDir(path.dirname(file));
  if (!rows.length) {
    writeFileSync(file, "");
    return;
  }
  const headers = Object.keys(rows[0]);
  writeFileSync(file, `${headers.map(csvEscape).join(",")}\n${rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")).join("\n")}\n`);
}

rmSync(deliverableRoot, { recursive: true, force: true });
for (const dir of ["canonical", "public", "review", "audit", "normalized", "contracts"]) ensureDir(path.join(deliverableRoot, dir));
writeJsonl(path.join(deliverableRoot, "canonical", "government-actions.jsonl"), canonical12);
writeJsonl(path.join(deliverableRoot, "canonical", "relationships.jsonl"), relations12);
writeJsonl(path.join(deliverableRoot, "canonical", "superseded_id_map.jsonl"), superseded);
writeJsonl(path.join(deliverableRoot, "review", "government-actions.jsonl"), review12);
writeJsonl(path.join(deliverableRoot, "public", "government-actions.jsonl"), publicActions);
writeJson(path.join(deliverableRoot, "public", "source-index.json"), publicSourceIndex);
writeJson(path.join(deliverableRoot, "audit", "VALIDATION-RESULT.json"), validation);
writeJson(path.join(deliverableRoot, "audit", "KNOWN-OVERMERGE-REGRESSION.json"), knownRegressionResults);
writeCsv(path.join(deliverableRoot, "audit", "MULTI-DIP-IDENTITY-REVIEW.csv"), multiDipReview);
writeCsv(path.join(deliverableRoot, "audit", "OVERMERGE-REVIEW.csv"), overmergeReview);
copyFileSync(path.join(inputRoot, "normalized", "source-events.jsonl"), path.join(deliverableRoot, "normalized", "source-events.jsonl"));
for (const name of ["source-event.schema.json", "government-action.schema.json", "relationship.schema.json", "enums.json"]) {
  const source = path.join(inputRoot, "contracts", name);
  copyFileSync(source, path.join(deliverableRoot, "contracts", name));
}
for (const name of ["executive-institutions.json", "external-actor-events.jsonl", "government-term.json", "cabinet-sessions.jsonl", "parliamentary-cases.jsonl", "promulgated-legal-acts.jsonl"]) {
  const source = path.join(inputRoot, "canonical", name);
  try { copyFileSync(source, path.join(deliverableRoot, "canonical", name)); } catch { /* optional 1.1 file */ }
}

const coverage = {
  as_of: "2026-08-18",
  data_version: "1.2",
  disclaimer: "Der amtliche Faktenbestand und die fachlichen Wirkungsanalysen besitzen unterschiedliche Abdeckung. Public Data 1.2 enthält ausschließlich objektweise geprüfte Faktenobjekte. Offene Identitäts- und Quellenfälle bleiben ausgeschlossen oder ausdrücklich im Review-Store.",
  counts: {
    government_actions_total: canonical12.length + review12.length,
    government_actions_public: publicActions.length,
    government_actions_review: review12.length,
    multi_dip_clusters_split: multiDipReview.length,
    superseded_ids: superseded.length,
  },
  sources: readJson(path.join(inputRoot, "public", "coverage.json")).sources,
};
writeJson(path.join(deliverableRoot, "public", "coverage.json"), coverage);
copyFileSync(path.join(inputRoot, "public", "executive-institutions.json"), path.join(deliverableRoot, "public", "executive-institutions.json"));

const generatedFiles = [
  "canonical/government-actions.jsonl",
  "canonical/relationships.jsonl",
  "canonical/superseded_id_map.jsonl",
  "public/government-actions.jsonl",
  "public/source-index.json",
  "public/coverage.json",
  "review/government-actions.jsonl",
  "audit/VALIDATION-RESULT.json",
  "audit/KNOWN-OVERMERGE-REGRESSION.json",
  "audit/MULTI-DIP-IDENTITY-REVIEW.csv",
  "audit/OVERMERGE-REVIEW.csv",
];
const manifest = {
  package: "WOEK-GOVERNMENT-DATA-2025-2026-INGEST-1.2",
  generated_at: generatedAt,
  input: {
    package: inputRoot,
    government_actions_sha256: fileSha256(path.join(inputRoot, "canonical", "government-actions.jsonl")),
    source_events_sha256: fileSha256(path.join(inputRoot, "normalized", "source-events.jsonl")),
  },
  files: Object.fromEntries(generatedFiles.map((name) => [name, fileSha256(path.join(deliverableRoot, name))])),
  counts: validation,
};
writeJson(path.join(deliverableRoot, "MANIFEST.json"), manifest);
writeFileSync(path.join(deliverableRoot, "README.md"), `# WÖk Government Data 1.2\n\nData 1.2 wurde aus dem unveränderten amtlichen SourceEvent-Bestand von Data 1.1 neu kanonisiert. Gemeinsamer Dokument- oder Sitzungskontext ist kein Identitätsbeweis. Jeder DIP-Vorgang besitzt genau eine eigenständige GovernmentAction.\n\n## Stores\n\n- \`canonical/\`: kanonischer Faktenbestand\n- \`public/\`: objektweise freigegebener Ausschnitt\n- \`review/\`: nicht veröffentlichte Prüffälle\n- \`audit/\`: Vollprüfung und Overmerge-Regressionen\n\nRaw-Dateien und Blobs werden nicht dupliziert. Ihre unveränderte Data-1.1-Eingangsquelle und SHA-256-Prüfsummen stehen im Manifest.\n`);

rmSync(path.join(appRoot, "canonical"), { recursive: true, force: true });
rmSync(path.join(appRoot, "review"), { recursive: true, force: true });
ensureDir(path.join(appRoot, "canonical"));
ensureDir(path.join(appRoot, "review"));
ensureDir(path.join(appRoot, "public"));
for (const name of ["government-actions.jsonl", "relationships.jsonl", "superseded_id_map.jsonl"]) {
  copyFileSync(path.join(deliverableRoot, "canonical", name), path.join(appRoot, "canonical", name));
}
copyFileSync(path.join(deliverableRoot, "review", "government-actions.jsonl"), path.join(appRoot, "review", "government-actions.jsonl"));
for (const name of ["government-actions.jsonl", "source-index.json", "coverage.json", "executive-institutions.json"]) {
  copyFileSync(path.join(deliverableRoot, "public", name), path.join(appRoot, "public", name));
}
ensureDir(path.join(appRoot, "audit"));
for (const name of ["VALIDATION-RESULT.json", "KNOWN-OVERMERGE-REGRESSION.json", "MULTI-DIP-IDENTITY-REVIEW.csv", "OVERMERGE-REVIEW.csv"]) {
  copyFileSync(path.join(deliverableRoot, "audit", name), path.join(appRoot, "audit", name));
}

console.log(JSON.stringify({ deliverableRoot, validation, superseded: superseded.length }, null, 2));
