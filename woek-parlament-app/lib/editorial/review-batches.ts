import { prepareFactPackage, type ReviewContext } from "@/lib/editorial/fact-packages";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { currentReferenceSnapshot } from "@/lib/review/reference-snapshot";
import { sha256 } from "@/lib/review/privacy";
import { reviewBatchPackageSchema, reviewPackageSchemaVersion, type ReviewBatchPackage, type ReviewCasePackage, type ReviewType } from "@/lib/review/contracts";
import { normativeReferenceRegistry } from "@/lib/normative/reference-registry";

type BatchRow = { id: string };

function bounded(value: unknown, maximum: number, fallback: string) {
  const text = typeof value === "string" && value.trim() ? value.trim() : fallback;
  return text.length <= maximum ? text : `${text.slice(0, Math.max(0, maximum - 1)).trimEnd()}…`;
}

function isoDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("A source has an invalid retrieval timestamp.");
  return date.toISOString();
}

function sourceTitle(source: { document_type: string; source_metadata: Record<string, unknown> }) {
  const title = source.source_metadata.title;
  return bounded(title, 600, source.document_type);
}

function sourceVersion(source: { source_hash: string | null }) {
  return source.source_hash ? `sha256:${source.source_hash}` : null;
}

function temporalClassForDecision(source: { document_date: string | null; temporal_class: "AVAILABLE_AT_DECISION_TIME" | "PUBLISHED_AFTER_DECISION" | "CURRENT_REFERENCE" }, decisionDate: string | null) {
  if (decisionDate && source.document_date) return source.document_date <= decisionDate ? "AVAILABLE_AT_DECISION_TIME" as const : "PUBLISHED_AFTER_DECISION" as const;
  return source.temporal_class;
}

function relevantLocations(excerpts: Array<{ sourceId: string; location: string }>, sourceId: string) {
  return excerpts
    .filter((excerpt) => excerpt.sourceId === sourceId)
    .slice(0, 40)
    .map((excerpt) => ({ section: bounded(excerpt.location, 500, "Amtliche Fundstelle") }));
}

function buildReviewRequest(reviewType: ReviewType, reviewContext: ReviewContext, dataGapMessages: string[]) {
  const incremental = reviewType === "INCREMENTAL_REVIEW";
  const exAnte = reviewContext === "EX_ANTE";
  return {
    questions_to_answer: incremental
      ? ["Prüfe ausschließlich die im Faktenpaket als geändert oder abhängig markierten Wirkpfade, Claims und Berechnungsanforderungen."]
      : exAnte
        ? ["Strukturiere vor der parlamentarischen Entscheidung die fachlich relevanten Wirkungspotenziale, Wirkungsrisiken, Änderungshebel, Datenanforderungen, Gegenfaktumfragen und normativen Zuordnungen für die aktuelle amtliche Fassung."]
        : ["Strukturiere die fachlich relevanten Wirkpfade, Datenanforderungen, Risiken, Gegenfaktumfragen und normativen Zuordnungen für die abgegrenzte Entscheidung."],
    required_outputs: [
      exAnte
        ? "Nur Wirkungspotenziale und Wirkungsrisiken vor der Entscheidung ausweisen; keine beobachtete Wirkung und kein nachträgliches Urteil behaupten."
        : "Ex-ante- und Ex-post-Perspektive getrennt ausweisen.",
      exAnte
        ? "Je materiellem Punkt liefern: Stellschraube, Wirkungspotenzial, betroffene Gruppen, Voraussetzungen, Risiken, Evidenzgrenze und – soweit noch möglich – konkrete veränderbare Stelle für robustere positive Netto-Wirkung. Keine parteipolitische Bewertung."
        : "Historische alternative Optionen klar als Gegenfaktum statt als beobachtete Realität kennzeichnen.",
      "Keine fehlenden Zahlen schätzen; stattdessen DATA_GAP dokumentieren.",
      "Quellen nur über die mitgelieferten source_id referenzieren.",
      "Berechnungsanforderungen statt freier Rechenprosa liefern.",
      "Jede materielle Zuordnung zu SDG, SDG+ oder einem Rechts-/Schutzanker als tile_mappings aus dem mitgelieferten normativen Referenzregister ausgeben. SDG+ und Staatsziele, Grundrechte sowie Schutzaufträge nicht vermischen. Tierschutz und Tierwohl sind eigenständig und nicht als Biodiversität zu behandeln."
    ],
    known_data_gaps: dataGapMessages,
    known_source_conflicts: [],
    calculation_inputs_available: [],
    calculation_inputs_missing: dataGapMessages
  };
}

function addCaseHash(input: Omit<ReviewCasePackage, "package_hash">): ReviewCasePackage {
  return { ...input, package_hash: sha256(input) };
}

async function nextBatchCode() {
  const year = new Date().getUTCFullYear();
  // PostgREST accepts `*` as a LIKE wildcard.  Do not put a raw `%` into the
  // request URL: an unescaped percent can be rejected by intermediary proxies
  // before it reaches PostgREST.
  const pattern = encodeURIComponent(`WOEK-REVIEW-${year}-*`);
  const rows = await supabaseRest<Array<{ id: string }>>(`parliament.review_batches?select=id&batch_code=like.${pattern}`);
  return `WOEK-REVIEW-${year}-${String(rows.length + 1).padStart(4, "0")}`;
}

export async function createReviewBatch({
  caseIds,
  decisionUnitIds = {},
  reviewType,
  reviewContext = "HISTORICAL",
  createdBy
}: {
  caseIds: string[];
  decisionUnitIds?: Record<string, string>;
  reviewType: ReviewType;
  reviewContext?: ReviewContext;
  createdBy: string;
}) {
  const uniqueCaseIds = [...new Set(caseIds)];
  if (uniqueCaseIds.length === 0) throw new Error("At least one case is required for a review batch.");
  if (uniqueCaseIds.length > 15) throw new Error("A review batch may contain at most 15 cases.");

  const cases: ReviewCasePackage[] = [];
  for (const caseId of uniqueCaseIds) {
    const decisionUnitId = decisionUnitIds[caseId];
    const fact = await prepareFactPackage(caseId, { decisionUnitId, reviewContext });
    if (fact.completenessStatus !== "READY_FOR_REVIEW") {
      throw new Error(`Case ${caseId} is not ready for external review: required source data is missing.`);
    }
    const decisionObject = String(fact.factPackage.decision_object ?? "");
    const reviewRequest = buildReviewRequest(reviewType, reviewContext, Array.isArray(fact.factPackage.uncertainties) ? fact.factPackage.uncertainties.map(String) : []);
    cases.push(addCaseHash({
      case_id: caseId,
      case_title: decisionObject,
      review_type: reviewType,
      previous_review_id: null,
      decision: {
        decision_unit_id: fact.decisionUnitId,
        decision_object: decisionObject,
        decision_date: typeof fact.factPackage.decision_date === "string" ? fact.factPackage.decision_date : null,
        parliamentary_status: String(fact.factPackage.parliamentary_status ?? "STATUS_UNVERIFIED"),
        final_version: typeof fact.factPackage.final_decision_text === "string" ? fact.factPackage.final_decision_text : null,
        actual_outcome: typeof fact.factPackage.actual_outcome === "string" ? fact.factPackage.actual_outcome : null,
        vote_type: typeof fact.factPackage.vote_type === "string" ? fact.factPackage.vote_type : null,
        vote_result: typeof fact.factPackage.vote_result === "object" && fact.factPackage.vote_result ? fact.factPackage.vote_result as Record<string, unknown> : {}
      },
      fact_package: fact.factPackage,
      source_manifest: fact.sourceRows.map((source) => ({
        source_id: source.id,
        title: sourceTitle(source),
        institution: bounded(source.source_attribution, 240, "Amtliche Quelle"),
        url: source.source_url,
        document_date: source.document_date,
        retrieved_at: isoDateTime(source.retrieved_at),
        document_type: source.document_type,
        version: sourceVersion(source),
        temporal_class: temporalClassForDecision(source, typeof fact.factPackage.decision_date === "string" ? fact.factPackage.decision_date : null),
        relevant_locations: relevantLocations(fact.sourceExcerpts, source.id)
      })),
      excerpts: fact.sourceExcerpts.map((excerpt) => ({
        source_id: excerpt.sourceId,
        location: excerpt.location,
        text: excerpt.text,
        why_required: excerpt.whyRequired
      })),
      evidence: {
        ex_ante_source_ids: reviewContext === "EX_ANTE"
          ? fact.sourceRows.map((source) => source.id)
          : fact.sourceRows.filter((source) => temporalClassForDecision(source, typeof fact.factPackage.decision_date === "string" ? fact.factPackage.decision_date : null) === "AVAILABLE_AT_DECISION_TIME").map((source) => source.id),
        ex_post_source_ids: reviewContext === "EX_ANTE"
          ? []
          : fact.sourceRows.filter((source) => temporalClassForDecision(source, typeof fact.factPackage.decision_date === "string" ? fact.factPackage.decision_date : null) === "PUBLISHED_AFTER_DECISION").map((source) => source.id)
      },
      woek_reference_snapshot: currentReferenceSnapshot(),
      normative_reference_catalog: normativeReferenceRegistry.map((reference) => ({
        id: reference.id,
        framework: reference.framework,
        code: reference.code,
        label: reference.label,
        short_description: reference.shortDescription,
        source_slug: reference.sourceSlug,
        constitutional_anchor_type: reference.constitutionalAnchorType,
        legal_reference: reference.legalReference
      })),
      review_request: reviewRequest
    }));
  }

  const batchCode = await nextBatchCode();
  const batchWithoutHash = {
    schema_version: reviewPackageSchemaVersion as typeof reviewPackageSchemaVersion,
    batch_code: batchCode,
    review_type: reviewType,
    created_at: new Date().toISOString(),
    cases
  };
  const batch: ReviewBatchPackage = { ...batchWithoutHash, package_hash: sha256(batchWithoutHash) };
  // Validate the exact payload before any protected workflow state is created.
  // A malformed package must never leave a misleading READY batch behind.
  reviewBatchPackageSchema.parse(batch);

  const batchRows = await supabaseRest<BatchRow[]>("parliament.review_batches", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      batch_code: batch.batch_code,
      review_type: batch.review_type,
      status: "READY",
      package_schema_version: batch.schema_version,
      package_hash: batch.package_hash,
      source_reference_snapshot: currentReferenceSnapshot(),
      created_by: createdBy
    })
  });
  const persisted = batchRows[0];
  if (!persisted) throw new Error("Could not persist review batch.");

  for (const casePackage of batch.cases) {
    const fact = await prepareFactPackage(casePackage.case_id, {
      decisionUnitId: casePackage.decision.decision_unit_id ?? undefined,
      reviewContext
    });
    await supabaseRest("parliament.review_batch_cases", {
      method: "POST",
      body: JSON.stringify({
        review_batch_id: persisted.id,
        case_id: casePackage.case_id,
        decision_fact_package_id: fact.factPackageId,
        review_request: casePackage.review_request,
        package_payload: casePackage,
        package_hash: casePackage.package_hash
      })
    });
    await supabaseRest(`parliament.cases?id=eq.${encodeURIComponent(casePackage.case_id)}`, {
      method: "PATCH",
      body: JSON.stringify({ review_status: "REVIEW_PACKAGE_READY" })
    });
  }
  return { id: persisted.id, batch };
}
