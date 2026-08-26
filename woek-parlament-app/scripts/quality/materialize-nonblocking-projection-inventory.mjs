#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT_PATH = resolve(
  APP_ROOT,
  "data/executive-impact/nonblocking-projection-inventory-v1.json",
);

const GOVERNANCE = Object.freeze({
  contract_id: "AGGREGATION-AND-MATERIALITY-DECISIONS",
  contract_version: "1.0",
  contract_path:
    "/WOEK/WOEK-PARLAMENT-FACHREVIEW-2026-08-26/05-nonblocking-projections/AGGREGATION-AND-MATERIALITY-DECISIONS.md",
  editorial_protocol: "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL",
  projection_rule:
    "Only explicit structured Fach values are projected. Titles, keywords, party identity and free-text claims are never used to derive direction, materiality, MPD, SDG, non-compensation or communication values.",
});

const EXPECTED_CARDINALITIES = Object.freeze({
  SACHSEN_ANHALT_6: 6,
  GOVERNMENT_COMPACT_57: 57,
  GOVERNMENT_DEEP_6: 6,
  EU_21: 21,
  BADEN_WUERTTEMBERG: 1,
  RHEINLAND_PFALZ: 1,
  HISTORICAL_PARLIAMENT_28: 28,
  FEDERAL_PROGRAMMES_6: 6,
  FEDERAL_COALITION_1: 1,
  SPECIALIST_FILE_1: 1,
  OBSERVATORY_1: 1,
});

const PATHS = Object.freeze({
  publicationSources: "data/generated/release-1/publication-sources.json",
  historicalReviews: "data/generated/release-1/case-reviews.json",
  government: "data/government/impact-cases/public-impact-records.jsonl",
  eu: "data/eu/impact-cases/public-impact-records.jsonl",
  bw: "data/states/baden-wuerttemberg-coalition-commitments.json",
  rlp: "data/states/rheinland-pfalz-coalition-commitments.json",
  observatory: [
    "data/observatory/public/analysis-version-updates.jsonl",
    "data/observatory/public/evidence-events.jsonl",
    "data/observatory/public/external-shocks.jsonl",
    "data/observatory/public/outcome-series.jsonl",
    "data/observatory/public/reality-check-candidates.jsonl",
    "data/observatory/public/state-observations.jsonl",
  ],
});

const REQUIRED_PROCESSING_COMPONENTS = Object.freeze([
  "aggregate_direction",
  "aggregate_materiality",
  "editorial_provenance",
  "public_bottom_line",
  "material_paths",
  "mpd",
  "sdg",
  "sdg_plus",
  "evidence",
  "reality_check",
  "noncompensation",
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function readText(path) {
  return readFile(resolve(APP_ROOT, path), "utf8");
}

async function readJsonl(path) {
  const text = await readText(path);
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function present(value) {
  return value !== null && value !== undefined && value !== "";
}

function available(value, sourceFieldPaths) {
  return {
    status: "AVAILABLE",
    value,
    source_field_paths: sourceFieldPaths,
  };
}

function unavailable(objectId, sourcePath, missingFieldPaths, detail) {
  const fields = missingFieldPaths.join(", ");
  return {
    status: "NOT_AVAILABLE",
    missing_field_paths: missingFieldPaths,
    reason: `${objectId}: ${sourcePath} lacks the explicit structured field${
      missingFieldPaths.length === 1 ? "" : "s"
    } ${fields}${detail ? `; ${detail}` : ""}. No value was inferred.`,
  };
}

function sourceRef(path, text, record = {}) {
  return {
    path,
    file_sha256: sha256(text),
    ...record,
  };
}

function publicationSourceRef(document, publicationText) {
  return sourceRef(PATHS.publicationSources, publicationText, {
    record_id: document.id,
    record_markdown_file: document.markdown_file,
    record_markdown_sha256: document.markdown_sha256,
    source_records: document.source_records,
    source_version: document.source_version,
    verified_at: document.verified_at,
  });
}

function communicationProjection(objectId) {
  return {
    status: "SEPARATE_NOT_PROJECTED",
    value: null,
    source_field_paths: [],
    reason: `${objectId}: AGGREGATION-AND-MATERIALITY-DECISIONS v1.0 requires communication to remain separate; no approved structured communication projection is attached to this inventory object.`,
  };
}

function baseRecord({ scope, objectId, objectType, title, sourceProfile, refs }) {
  return {
    inventory_id: `${scope}:${objectId}`,
    scope,
    object_id: objectId,
    object_type: objectType,
    title,
    source_profile: sourceProfile,
    source_refs: refs,
  };
}

function finalizeRecord(record) {
  const required = [
    record.aggregate_direction,
    record.aggregate_materiality,
    record.editorial_provenance,
  ];
  const missing = required.filter((entry) => entry.status !== "AVAILABLE");
  const missingProcessingComponents = REQUIRED_PROCESSING_COMPONENTS.filter(
    (component) => record[component]?.status !== "AVAILABLE",
  );
  const substantiveAvailable = REQUIRED_PROCESSING_COMPONENTS.filter(
    (component) => component !== "editorial_provenance",
  ).some((component) => record[component]?.status === "AVAILABLE");
  return {
    ...record,
    projection_status: missing.length === 0 ? "AVAILABLE" : "NOT_AVAILABLE",
    projection_gate:
      missing.length === 0
        ? {
            status: "PASS",
            rule: "direction + materiality + editorial provenance are explicit structured values",
          }
        : {
            status: "FAIL_CLOSED",
            rule: "direction + materiality + editorial provenance are required",
            missing_components: [
              ...(record.aggregate_direction.status === "AVAILABLE"
                ? []
                : ["aggregate_direction"]),
              ...(record.aggregate_materiality.status === "AVAILABLE"
                ? []
                : ["aggregate_materiality"]),
              ...(record.editorial_provenance.status === "AVAILABLE"
                ? []
                : ["editorial_provenance"]),
            ],
          },
    processing_status:
      missingProcessingComponents.length === 0
        ? "COMPLETE"
        : substantiveAvailable
          ? "PARTIAL_SOURCE_BOUND"
          : "NOT_AVAILABLE",
    processing_gate:
      missingProcessingComponents.length === 0
        ? {
            status: "PASS",
            required_components: REQUIRED_PROCESSING_COMPONENTS,
          }
        : {
            status: "FAIL_CLOSED",
            required_components: REQUIRED_PROCESSING_COMPONENTS,
            missing_components: missingProcessingComponents,
          },
  };
}

function publicationArchiveRecord({
  scope,
  objectType,
  document,
  publicationText,
}) {
  const objectId = document.source_key ?? document.case_id ?? document.id;
  const sourcePath = `${PATHS.publicationSources}#documents[id=${document.id}]`;
  const base = baseRecord({
    scope,
    objectId,
    objectType,
    title: document.title,
    sourceProfile: document.kind,
    refs: [publicationSourceRef(document, publicationText)],
  });

  return finalizeRecord({
    ...base,
    aggregate_direction: unavailable(objectId, sourcePath, [
      "aggregate_direction",
    ]),
    aggregate_materiality: unavailable(objectId, sourcePath, [
      "aggregate_materiality",
    ]),
    editorial_provenance: available(
      {
        source_version: document.source_version,
        markdown_sha256: document.markdown_sha256,
        source_records: document.source_records,
      },
      ["source_version", "markdown_sha256", "source_records"],
    ),
    public_bottom_line: unavailable(
      objectId,
      sourcePath,
      ["overview.approved_public_bottom_line"],
      "overview.summary is a corpus/process description, not an approved case-specific Impact-First bottom line",
    ),
    material_paths: unavailable(objectId, sourcePath, [
      "approved_material_paths",
    ]),
    mpd: unavailable(objectId, sourcePath, ["approved_mpd_projection"]),
    sdg: unavailable(objectId, sourcePath, ["approved_sdg_projection"]),
    sdg_plus: unavailable(objectId, sourcePath, [
      "approved_sdg_plus_projection",
    ]),
    evidence: unavailable(objectId, sourcePath, [
      "approved_aggregate_evidence_level",
    ]),
    reality_check: unavailable(objectId, sourcePath, [
      "approved_reality_check_status",
    ]),
    noncompensation: unavailable(objectId, sourcePath, [
      "approved_noncompensation_review",
    ]),
    communication_projection: communicationProjection(objectId),
  });
}

function selectedPathProjection(objectId, sourcePath, paths) {
  if (!Array.isArray(paths)) {
    return unavailable(objectId, sourcePath, ["impact_paths"]);
  }
  if (paths.length > 5) {
    return unavailable(
      objectId,
      sourcePath,
      ["approved_material_paths_max_5_selection"],
      `impact_paths contains ${paths.length} entries and no approved deterministic selection of at most five is present`,
    );
  }
  if (paths.length === 0 || paths.some((path) => !present(path.path_id))) {
    return unavailable(
      objectId,
      sourcePath,
      ["impact_paths[].path_id"],
      "one to five explicit path identifiers are required",
    );
  }
  return available(
    paths.map((path) => path.path_id),
    ["impact_paths[].path_id"],
  );
}

function aggregateDirection(values) {
  const directions = new Set(values);
  if (directions.has("OPEN")) return "OPEN";
  if (directions.size === 1) return [...directions][0];
  if (directions.has("POSITIVE") && directions.has("NEGATIVE")) {
    return "AMBIVALENT";
  }
  if (directions.has("AMBIVALENT")) return "AMBIVALENT";
  if (directions.has("NEUTRAL") && directions.size > 1) return "AMBIVALENT";
  return "OPEN";
}

function pathMappedValues(objectId, sourcePath, paths, field, label) {
  const selection = selectedPathProjection(objectId, sourcePath, paths);
  if (selection.status !== "AVAILABLE") {
    return unavailable(
      objectId,
      sourcePath,
      [`approved_material_paths_max_5_selection -> impact_paths[].${field}`],
      `the ${label} projection cannot be bound until the max-five material path selection is explicit`,
    );
  }
  const allDirectional = paths.every(
    (path) =>
      present(path.path_id) &&
      present(path.direction) &&
      Array.isArray(path[field]),
  );
  if (!allDirectional) {
    return unavailable(objectId, sourcePath, [
      "impact_paths[].path_id",
      "impact_paths[].direction",
      `impact_paths[].${field}`,
    ]);
  }
  const values = [...new Set(paths.flatMap((path) => path[field]))].sort();
  return available(
        values.map((value) => {
          const boundPaths = paths.filter((path) => path[field].includes(value));
          return {
            id: value,
            direction: aggregateDirection(boundPaths.map((path) => path.direction)),
            source_path_ids: boundPaths.map((path) => path.path_id),
          };
        }),
        [
          "impact_paths[].path_id",
          "impact_paths[].direction",
          `impact_paths[].${field}`,
          "AGGREGATION-AND-MATERIALITY-DECISIONS.v1.sections_5_6",
        ],
      );
}

function normativeMappingValues(
  objectId,
  sourcePath,
  paths,
  mappings,
  fieldPath,
  label,
) {
  if (selectedPathProjection(objectId, sourcePath, paths).status !== "AVAILABLE") {
    return unavailable(
      objectId,
      sourcePath,
      [`approved_material_paths_max_5_selection -> ${fieldPath}`],
      `the directional ${label} projection cannot be bound until the max-five material path selection is explicit`,
    );
  }
  if (
    !Array.isArray(mappings) ||
    !mappings.every(
      (mapping) =>
        present(mapping.id) &&
        present(mapping.direction) &&
        Array.isArray(mapping.impact_path_refs),
    )
  ) {
    return unavailable(objectId, sourcePath, [
      `${fieldPath}[].id`,
      `${fieldPath}[].direction`,
      `${fieldPath}[].impact_path_refs`,
    ]);
  }
  return available(
    mappings.map((mapping) => ({
      id: mapping.id,
      direction: mapping.direction,
      impact_path_refs: mapping.impact_path_refs,
    })),
    [
      `${fieldPath}[].id`,
      `${fieldPath}[].direction`,
      `${fieldPath}[].impact_path_refs`,
    ],
  );
}

function governmentRecord(record, governmentText) {
  const isDeep = record.record_profile === "FULL_SCHEMA_2_0_1";
  const scope = isDeep ? "GOVERNMENT_DEEP_6" : "GOVERNMENT_COMPACT_57";
  const objectId = record.impact_case_id;
  const sourcePath = `${PATHS.government}#impact_case_id=${objectId}`;
  const refs = [
    sourceRef(PATHS.government, governmentText, {
      record_id: objectId,
      record_profile: record.record_profile,
      schema_id: record.schema_id,
      schema_validation: record.schema_validation,
      source_release: record.source_release,
    }),
  ];
  const base = baseRecord({
    scope,
    objectId,
    objectType: isDeep ? "GOVERNMENT_IMPACT_CASE_DEEP" : "GOVERNMENT_IMPACT_CASE_COMPACT",
    title: record.title,
    sourceProfile: record.record_profile,
    refs,
  });
  const paths = isDeep ? record.raw_record?.impact_paths : null;
  const materialPaths = isDeep
    ? selectedPathProjection(objectId, `${sourcePath}.raw_record`, paths)
    : unavailable(
        objectId,
        sourcePath,
        ["approved_material_paths"],
        "record_profile is VERIFIED_FACH_RELEASE_COMPACT and the compact release has no approved max-five path selection",
      );
  const structuredProvenance =
    present(record.source_release?.jsonl_sha256) &&
    present(record.source_release?.case_markdown_sha256);

  return finalizeRecord({
    ...base,
    aggregate_direction: present(record.primary_direction)
      ? available(record.primary_direction, ["primary_direction"])
      : unavailable(objectId, sourcePath, ["primary_direction"]),
    aggregate_materiality: present(record.materiality)
      ? available(record.materiality, ["materiality"])
      : unavailable(objectId, sourcePath, ["materiality"]),
    editorial_provenance: structuredProvenance
      ? available(record.source_release, ["source_release"])
      : unavailable(objectId, sourcePath, [
          "source_release.jsonl_sha256",
          "source_release.case_markdown_sha256",
        ]),
    public_bottom_line:
      present(record.overview_assessment_label) &&
      present(record.impact_core_summary)
        ? available(
            {
              label: record.overview_assessment_label,
              summary: record.impact_core_summary,
            },
            ["overview_assessment_label", "impact_core_summary"],
          )
        : unavailable(objectId, sourcePath, [
            "overview_assessment_label",
            "impact_core_summary",
          ]),
    material_paths: materialPaths,
    mpd: isDeep
      ? pathMappedValues(objectId, `${sourcePath}.raw_record`, paths, "mpd", "MPD")
      : unavailable(objectId, sourcePath, ["raw_record.impact_paths[].mpd"]),
    sdg: isDeep
      ? pathMappedValues(
          objectId,
          `${sourcePath}.raw_record`,
          paths,
          "sdg_refs",
          "SDG",
        )
      : unavailable(objectId, sourcePath, ["raw_record.impact_paths[].sdg_refs"]),
    sdg_plus: isDeep
      ? pathMappedValues(
          objectId,
          `${sourcePath}.raw_record`,
          paths,
          "sdg_plus_refs",
          "SDG+",
        )
      : unavailable(objectId, sourcePath, [
          "raw_record.impact_paths[].sdg_plus_refs",
        ]),
    evidence: present(record.evidence_level)
      ? available(record.evidence_level, ["evidence_level"])
      : unavailable(objectId, sourcePath, ["evidence_level"]),
    reality_check: present(record.reality_check_status)
      ? available(
          {
            status: record.reality_check_status,
            summary: record.reality_check_summary ?? null,
          },
          ["reality_check_status", "reality_check_summary"],
        )
      : unavailable(objectId, sourcePath, ["reality_check_status"]),
    noncompensation: present(record.boundary_status)
      ? available(
          {
            boundary_status: record.boundary_status,
            review: isDeep ? record.raw_record?.boundary_review ?? null : null,
          },
          isDeep
            ? ["boundary_status", "raw_record.boundary_review"]
            : ["boundary_status"],
        )
      : unavailable(objectId, sourcePath, ["boundary_status"]),
    communication_projection: communicationProjection(objectId),
  });
}

function euRecord(record, euText) {
  const objectId = record.impact_case_id;
  const sourcePath = `${PATHS.eu}#impact_case_id=${objectId}`;
  const base = baseRecord({
    scope: "EU_21",
    objectId,
    objectType: "EU_IMPACT_CASE",
    title: record.title,
    sourceProfile: record.analysis_mode,
    refs: [
      sourceRef(PATHS.eu, euText, {
        record_id: objectId,
        analysis_version: record.analysis_version,
        source_release: record.source_release,
      }),
    ],
  });
  const structuredProvenance = present(record.source_release);

  return finalizeRecord({
    ...base,
    aggregate_direction: present(record.primary_direction)
      ? available(record.primary_direction, ["primary_direction"])
      : unavailable(objectId, sourcePath, ["primary_direction"]),
    aggregate_materiality: unavailable(objectId, sourcePath, [
      "aggregate_materiality",
    ]),
    editorial_provenance: structuredProvenance
      ? available(record.source_release, ["source_release"])
      : unavailable(objectId, sourcePath, ["source_release"]),
    public_bottom_line:
      record.publication_status === "APPROVED" &&
      present(record.impact_core_summary)
        ? available(record.impact_core_summary, ["impact_core_summary"])
        : unavailable(objectId, sourcePath, [
            "publication_status=APPROVED",
            "impact_core_summary",
          ]),
    material_paths: unavailable(objectId, sourcePath, [
      "approved_material_paths",
    ]),
    mpd: unavailable(objectId, sourcePath, ["approved_mpd_projection"]),
    sdg: unavailable(objectId, sourcePath, ["approved_sdg_projection"]),
    sdg_plus: unavailable(objectId, sourcePath, [
      "approved_sdg_plus_projection",
    ]),
    evidence: present(record.evidence_level)
      ? available(record.evidence_level, ["evidence_level"])
      : unavailable(objectId, sourcePath, ["evidence_level"]),
    reality_check: present(record.reality_check_status)
      ? available(
          {
            status: record.reality_check_status,
            summary: record.reality_check_summary ?? null,
          },
          ["reality_check_status", "reality_check_summary"],
        )
      : unavailable(objectId, sourcePath, ["reality_check_status"]),
    noncompensation: present(record.boundary_status)
      ? available(record.boundary_status, ["boundary_status"])
      : unavailable(objectId, sourcePath, ["boundary_status"]),
    communication_projection: communicationProjection(objectId),
  });
}

function stateRecord({ scope, objectType, sourcePath, sourceText, source }) {
  const objectId = source.document_id;
  const base = baseRecord({
    scope,
    objectId,
    objectType,
    title: source.document_title,
    sourceProfile: source.schema_version,
    refs: [
      sourceRef(sourcePath, sourceText, {
        record_id: objectId,
        fach_status: source.fach_status,
        publication_status: source.publication_status,
        provenance_status: source.provenance_status,
        coverage_scope: source.coverage_scope,
        source_record_count: source.source_record_count,
        atomic_commitment_count: source.atomic_commitment_count,
      }),
    ],
  });

  return finalizeRecord({
    ...base,
    aggregate_direction: unavailable(objectId, sourcePath, [
      "aggregate_direction",
    ]),
    aggregate_materiality: unavailable(objectId, sourcePath, [
      "aggregate_materiality",
    ]),
    editorial_provenance: available(
      {
        fach_status: source.fach_status,
        provenance_status: source.provenance_status,
        fach_comment_ids: source.fach_comment_ids,
      },
      ["fach_status", "provenance_status", "fach_comment_ids"],
    ),
    public_bottom_line: unavailable(objectId, sourcePath, [
      "approved_public_bottom_line",
    ]),
    material_paths: unavailable(objectId, sourcePath, [
      "approved_material_paths",
    ]),
    mpd: unavailable(objectId, sourcePath, ["approved_mpd_projection"]),
    sdg: unavailable(objectId, sourcePath, ["approved_sdg_projection"]),
    sdg_plus: unavailable(objectId, sourcePath, [
      "approved_sdg_plus_projection",
    ]),
    evidence: unavailable(objectId, sourcePath, [
      "approved_aggregate_evidence_level",
    ]),
    reality_check: unavailable(objectId, sourcePath, [
      "approved_reality_check_status",
    ]),
    noncompensation: unavailable(objectId, sourcePath, [
      "approved_noncompensation_review",
    ]),
    communication_projection: communicationProjection(objectId),
  });
}

function historicalRecord(review, document, historicalText, publicationText) {
  const objectId = review.case_id;
  const sourcePath = `${PATHS.historicalReviews}#reviews[case_id=${objectId}]`;
  const paths = review.impact_paths;
  const base = baseRecord({
    scope: "HISTORICAL_PARLIAMENT_28",
    objectId,
    objectType: "HISTORICAL_PARLIAMENT_CASE",
    title: document.title,
    sourceProfile: review.schema_version,
    refs: [
      sourceRef(PATHS.historicalReviews, historicalText, {
        record_id: review.review_id,
        case_id: objectId,
        input_package_hash: review.input_package_hash,
        review_status: review.review_status,
        provenance: review.provenance,
      }),
      publicationSourceRef(document, publicationText),
    ],
  });

  return finalizeRecord({
    ...base,
    aggregate_direction: unavailable(objectId, sourcePath, [
      "aggregate_direction",
    ]),
    aggregate_materiality: unavailable(objectId, sourcePath, [
      "aggregate_materiality",
    ]),
    editorial_provenance: available(
      {
        review_id: review.review_id,
        review_status: review.review_status,
        input_package_hash: review.input_package_hash,
        provenance: review.provenance,
        markdown_sha256: document.markdown_sha256,
      },
      [
        "review_id",
        "review_status",
        "input_package_hash",
        "provenance",
        `${PATHS.publicationSources}#markdown_sha256`,
      ],
    ),
    public_bottom_line: present(document.overview?.key_statement)
      ? available(document.overview.key_statement, [
          `${PATHS.publicationSources}#overview.key_statement`,
        ])
      : unavailable(objectId, sourcePath, [
          `${PATHS.publicationSources}#overview.key_statement`,
        ]),
    material_paths: selectedPathProjection(objectId, sourcePath, paths),
    mpd: pathMappedValues(
      objectId,
      sourcePath,
      paths,
      "affected_mpd_dimensions",
      "MPD",
    ),
    sdg: normativeMappingValues(
      objectId,
      sourcePath,
      paths,
      review.normative_mapping?.sdg_mappings,
      "normative_mapping.sdg_mappings",
      "SDG",
    ),
    sdg_plus: normativeMappingValues(
      objectId,
      sourcePath,
      paths,
      review.normative_mapping?.sdg_plus_mappings,
      "normative_mapping.sdg_plus_mappings",
      "SDG+",
    ),
    evidence: unavailable(objectId, sourcePath, [
      "approved_aggregate_evidence_level",
    ]),
    reality_check: unavailable(objectId, sourcePath, [
      "approved_reality_check_status",
    ]),
    noncompensation: Array.isArray(review.non_compensable_boundaries)
      ? available(review.non_compensable_boundaries, [
          "non_compensable_boundaries",
        ])
      : unavailable(objectId, sourcePath, ["non_compensable_boundaries"]),
    communication_projection: communicationProjection(objectId),
  });
}

function observatoryRecord(observatoryFiles) {
  const objectId = "WOEK-OBSERVATORY-PUBLIC";
  const counts = Object.fromEntries(
    observatoryFiles.map(({ path, records }) => [path, records.length]),
  );
  const sourcePath = "data/observatory/public/*.jsonl";
  const base = baseRecord({
    scope: "OBSERVATORY_1",
    objectId,
    objectType: "OBSERVATORY_PORTAL",
    title: "WÖk Observatory",
    sourceProfile: "PUBLIC_OBSERVATORY_JSONL_COLLECTION",
    refs: observatoryFiles.map(({ path, text, records }) =>
      sourceRef(path, text, { record_count: records.length }),
    ),
  });

  return finalizeRecord({
    ...base,
    aggregate_direction: unavailable(objectId, sourcePath, [
      "approved_portal_aggregate_direction",
    ]),
    aggregate_materiality: unavailable(objectId, sourcePath, [
      "approved_portal_aggregate_materiality",
    ]),
    editorial_provenance: available(
      { public_record_counts: counts },
      observatoryFiles.map(({ path }) => `${path}#all-records`),
    ),
    public_bottom_line: unavailable(objectId, sourcePath, [
      "approved_portal_public_bottom_line",
    ]),
    material_paths: unavailable(objectId, sourcePath, [
      "approved_portal_material_paths",
    ]),
    mpd: unavailable(objectId, sourcePath, ["approved_portal_mpd_projection"]),
    sdg: unavailable(objectId, sourcePath, ["approved_portal_sdg_projection"]),
    sdg_plus: unavailable(objectId, sourcePath, [
      "approved_portal_sdg_plus_projection",
    ]),
    evidence: unavailable(
      objectId,
      sourcePath,
      ["approved_portal_evidence_selection"],
      "source events remain individually versioned and are not ranked or aggregated by this inventory",
    ),
    reality_check: unavailable(
      objectId,
      sourcePath,
      ["approved_portal_reality_check_selection"],
      "source candidates remain individual records and are not ranked or aggregated by this inventory",
    ),
    noncompensation: unavailable(objectId, sourcePath, [
      "approved_portal_noncompensation_review",
    ]),
    communication_projection: communicationProjection(objectId),
  });
}

function countScopes(records) {
  const counts = Object.fromEntries(
    Object.keys(EXPECTED_CARDINALITIES).map((scope) => [scope, 0]),
  );
  for (const record of records) counts[record.scope] += 1;
  return counts;
}

async function materialize() {
  const [
    publicationText,
    historicalText,
    governmentText,
    euText,
    bwText,
    rlpText,
  ] = await Promise.all([
    readText(PATHS.publicationSources),
    readText(PATHS.historicalReviews),
    readText(PATHS.government),
    readText(PATHS.eu),
    readText(PATHS.bw),
    readText(PATHS.rlp),
  ]);
  const publication = JSON.parse(publicationText);
  const historical = JSON.parse(historicalText);
  const government = governmentText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const eu = euText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const bw = JSON.parse(bwText);
  const rlp = JSON.parse(rlpText);
  const observatoryFiles = await Promise.all(
    PATHS.observatory.map(async (path) => {
      const text = await readText(path);
      return { path, text, records: await readJsonl(path) };
    }),
  );

  const documents = publication.documents;
  const publicationRecords = (kind, scope, objectType) =>
    documents
      .filter((document) => document.kind === kind)
      .map((document) =>
        publicationArchiveRecord({
          scope,
          objectType,
          document,
          publicationText,
        }),
      );
  const parliamentDocuments = new Map(
    documents
      .filter((document) => document.kind === "PARLIAMENTARY_CASE")
      .map((document) => [document.case_id, document]),
  );

  const records = [
    ...publicationRecords(
      "SAXONY_ANHALT_ELECTION_PROGRAMME_REVIEW",
      "SACHSEN_ANHALT_6",
      "STATE_ELECTION_PROGRAMME_REVIEW",
    ),
    ...government.map((record) => governmentRecord(record, governmentText)),
    ...eu.map((record) => euRecord(record, euText)),
    stateRecord({
      scope: "BADEN_WUERTTEMBERG",
      objectType: "STATE_COALITION_COMMITMENT_REGISTER",
      sourcePath: PATHS.bw,
      sourceText: bwText,
      source: bw,
    }),
    stateRecord({
      scope: "RHEINLAND_PFALZ",
      objectType: "STATE_COALITION_COMMITMENT_REGISTER",
      sourcePath: PATHS.rlp,
      sourceText: rlpText,
      source: rlp,
    }),
    ...historical.reviews.map((review) => {
      const document = parliamentDocuments.get(review.case_id);
      if (!document) {
        throw new Error(
          `Historical review ${review.case_id} has no publication source document.`,
        );
      }
      return historicalRecord(
        review,
        document,
        historicalText,
        publicationText,
      );
    }),
    ...publicationRecords(
      "FEDERAL_ELECTION_PROGRAMME",
      "FEDERAL_PROGRAMMES_6",
      "FEDERAL_ELECTION_PROGRAMME",
    ),
    ...publicationRecords(
      "COALITION_AGREEMENT",
      "FEDERAL_COALITION_1",
      "FEDERAL_COALITION_AGREEMENT",
    ),
    ...publicationRecords(
      "SPECIALIST_ANALYSIS",
      "SPECIALIST_FILE_1",
      "SPECIALIST_ANALYSIS_FILE",
    ),
    observatoryRecord(observatoryFiles),
  ].sort((left, right) => left.inventory_id.localeCompare(right.inventory_id));

  const sourceFiles = [
    { path: PATHS.publicationSources, text: publicationText },
    { path: PATHS.historicalReviews, text: historicalText },
    { path: PATHS.government, text: governmentText },
    { path: PATHS.eu, text: euText },
    { path: PATHS.bw, text: bwText },
    { path: PATHS.rlp, text: rlpText },
    ...observatoryFiles,
  ].map(({ path, text }) => ({ path, sha256: sha256(text) }));

  const inventory = {
    schema_version: "woek-nonblocking-projection-inventory-1.0",
    inventory_version: "1.0",
    generated_on: "2026-08-26",
    governance: GOVERNANCE,
    policies: {
      maximum_material_paths: 5,
      open_is_neutral: false,
      direction_policy: "PRESERVE_EXACT_STRUCTURED_VALUE",
      communication_policy: "SEPARATE_NOT_PROJECTED",
      noncompensation_policy: "VISIBLE_FOR_EVERY_OBJECT",
      missing_required_value_policy: "NOT_AVAILABLE_FAIL_CLOSED",
    },
    source_snapshot: {
      binding: "EXACT_SOURCE_FILE_SHA256",
      files: sourceFiles,
      combined_sha256: sha256(JSON.stringify(sourceFiles)),
    },
    expected_cardinalities: EXPECTED_CARDINALITIES,
    actual_cardinalities: countScopes(records),
    total_records: records.length,
    available_records: records.filter(
      (record) => record.projection_status === "AVAILABLE",
    ).length,
    not_available_records: records.filter(
      (record) => record.projection_status === "NOT_AVAILABLE",
    ).length,
    processing_status_counts: {
      COMPLETE: records.filter(
        (record) => record.processing_status === "COMPLETE",
      ).length,
      PARTIAL_SOURCE_BOUND: records.filter(
        (record) => record.processing_status === "PARTIAL_SOURCE_BOUND",
      ).length,
      NOT_AVAILABLE: records.filter(
        (record) => record.processing_status === "NOT_AVAILABLE",
      ).length,
    },
    records,
  };
  const artifact = {
    ...inventory,
    manifest_sha256: sha256(JSON.stringify(inventory)),
  };
  return `${JSON.stringify(artifact, null, 2)}\n`;
}

const output = await materialize();
if (process.argv.includes("--check")) {
  const current = await readFile(OUTPUT_PATH, "utf8").catch(() => null);
  if (current !== output) {
    console.error(
      "FAIL nonblocking projection inventory is stale; run materialize-nonblocking-projection-inventory.mjs",
    );
    process.exit(1);
  }
  console.log("PASS nonblocking projection inventory is deterministic and current");
} else {
  await writeFile(OUTPUT_PATH, output, "utf8");
  console.log(`WROTE ${OUTPUT_PATH}`);
}
