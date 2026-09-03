const PLACEHOLDER_PATTERNS = [
  /\b\x6c\x6f\x72\x65\x6d \x69\x70\x73\x75\x6d\b/i,
  /\b(?:\x74\x62\x64|\x74\x6f\x64\x6f|coming soon)\b/i,
  /dieser bereich wird weiter ausgebaut/i,
  /hier finden sie weitere informationen/i,
  /die auswirkungen sind vielfaeltig/i,
  /es gibt chancen und herausforderungen/i,
  /die umsetzung bleibt abzuwarten(?:\.|$)/i,
];

const GENERIC_PATTERNS = [
  /auswirkungen auf mensch, planet und demokratie/i,
  /positive wirtschaftliche effekte.*risiken fuer umwelt und gesellschaft/i,
  /sowohl positive als auch negative wirkungspfade/i,
  /die evidenz wird als (?:hoch|mittel|gering) eingeschaetzt/i,
  /verschiedene gesellschaftliche folgen/i,
];

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizedTokens(value) {
  return new Set(text(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 5));
}

function jaccard(left, right) {
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

function evidenceExplained(record) {
  const publicSummary = text(record?.evidence_summary ?? record?.evidence_summary_text);
  const publicExplanation = text(record?.public_evidence_explanation);
  if (publicSummary.length >= 60
    && !GENERIC_PATTERNS.some((pattern) => pattern.test(publicSummary))
    && !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(publicSummary))
    && (publicExplanation.length === 0 || publicExplanation.length >= 60)) return true;
  const summary = record?.raw_record?.evidence_summary;
  if (summary && typeof summary === "object" && [summary.fact_evidence, summary.mechanism_evidence, summary.effect_evidence, summary.uncertainty]
    .every((value) => text(value).length >= 3)) return true;
  const evidenceLevel = text(record?.evidence_level);
  const officialSources = Array.isArray(record?.official_fact_sources) ? record.official_fact_sources : [];
  const fullAnalysis = text(record?.full_analysis_markdown);
  return evidenceLevel.length > 0
    && evidenceLevel !== "NOT_ASSESSABLE"
    && officialSources.some((source) => /^https?:\/\//.test(text(source)))
    && fullAnalysis.length >= 300;
}

function overviewAssessmentVisible(record) {
  return text(record?.overview_assessment_label).length >= 20;
}

function structuredPublicationIsHonest(record) {
  const depth = text(record?.public_analysis_depth);
  const missing = Array.isArray(record?.missing_structured_fields) ? record.missing_structured_fields : [];
  if (depth === "FULL_STRUCTURED") return missing.length === 0 && text(record?.competence_review_status) !== "NOT_STRUCTURED";
  return depth === "LIMITED_FACH_RECORD" && missing.length > 0;
}

/**
 * Portalweites P0-Gate. Es erzeugt keine Redaktionstexte, sondern prueft nur
 * bereits fachlich freigegebene Inhalte. Fehlende Inhalte bleiben im Review-
 * Store und werden nicht durch Templates ersetzt.
 */
export function assessEditorialQuality(record) {
  const impactCore = text(record?.impact_core_summary ?? record?.impact_summary?.central_lever);
  const editorialSummary = text(record?.editorial_summary ?? record?.impact_summary?.public_summary);
  const positivePotential = text(record?.impact_summary?.strongest_positive_potential);
  const mainRisk = text(record?.impact_summary?.main_risk_or_tradeoff);
  const keyFinding = text(record?.key_finding);
  const combined = [impactCore, editorialSummary, positivePotential, mainRisk].join(" ");
  const hasPlaceholders = PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(combined));
  const hasGenericTemplate = GENERIC_PATTERNS.some((pattern) => pattern.test(combined));
  const competence = text(record?.competence_review_status);
  const gates = {
    EDITORIAL_SPECIFICITY: editorialSummary.length >= 90 && normalizedTokens(editorialSummary).size >= 8,
    IMPACT_CORE_SPECIFICITY: impactCore.length >= 55 && normalizedTokens(impactCore).size >= 6,
    SUMMARY_IS_CASE_SPECIFIC: editorialSummary.length >= 90 && !hasGenericTemplate,
    NO_TEMPLATE_LANGUAGE: !hasGenericTemplate,
    NO_PLACEHOLDER_TEXT: !hasPlaceholders,
    DIRECTION_HAS_REASON: impactCore.length >= 55 && keyFinding.length >= 20 && (positivePotential.length >= 35 || mainRisk.length >= 35 || editorialSummary.length >= 140),
    EVIDENCE_IS_EXPLAINED: evidenceExplained(record),
    KEY_TRADEOFF_VISIBLE: mainRisk.length >= 35 || (keyFinding.length >= 20 && editorialSummary.length >= 140),
    COMPETENCE_VISIBLE_IF_MATERIAL: ["REVIEWED_CONCRETE", "REVIEWED_OPEN", "NOT_STRUCTURED"].includes(competence),
    REALITY_STATUS_VISIBLE: text(record?.reality_check_status).length > 0,
    OVERVIEW_ASSESSMENT_VISIBLE: overviewAssessmentVisible(record),
    IMPACT_ANALYSIS_DOMINANT: impactCore.length >= 55 && editorialSummary.length >= 90,
    PROCESS_DOES_NOT_DOMINATE: !/^(drucksache|vorgang|verfahren|kabinettssitzung)\b/i.test(editorialSummary),
    STRUCTURED_PUBLICATION_STATUS_HONEST: structuredPublicationIsHonest(record),
  };
  const failed = Object.entries(gates).filter(([, passed]) => !passed).map(([name]) => name);
  return { status: failed.length === 0 ? "PASS" : "FAIL", gates, failed };
}

/** Finds suspiciously interchangeable summaries without rewriting them. */
export function findGenericEditorialPatterns(records, threshold = 0.82) {
  const candidates = records.map((record) => ({
    id: record.impact_case_id,
    summary: text(record.editorial_summary ?? record.impact_summary?.public_summary),
  })).filter((item) => item.summary.length > 0);
  const flags = [];
  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
      const similarity = jaccard(normalizedTokens(candidates[leftIndex].summary), normalizedTokens(candidates[rightIndex].summary));
      if (similarity >= threshold) flags.push({
        code: "GENERIC_EDITORIAL_PATTERN_DETECTED",
        impact_case_ids: [candidates[leftIndex].id, candidates[rightIndex].id],
        similarity: Number(similarity.toFixed(3)),
      });
    }
  }
  return flags;
}
