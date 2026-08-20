const KNOWN_GENERIC_PATTERNS = [
  /die fallakte wird auf grundlage der amtlichen unterlagen strukturiert/i,
  /wirkpfade und risiken sind aus den vorliegenden amtlichen quellen strukturiert/i,
  /der kompakte fachdatensatz enthaelt noch keine vollstaendig strukturierte/i,
  /der kompakte fachdatensatz enthält noch keine vollständig strukturierte/i,
  /die akte ist in der ausgewiesenen reifestufe öffentlich nutzbar/i,
  /eine belastbare netto-wirkung ist erst nach baseline/i,
  /die maßnahme hat auswirkungen auf mensch, planet und demokratie/i,
  /die auswirkungen sind vielfältig/i,
  /es gibt chancen und herausforderungen/i,
  /verschiedene gesellschaftliche folgen/i,
  /die umsetzung bleibt abzuwarten(?:\.|$)/i,
];

const PLACEHOLDER_PATTERNS = [
  /\b\x6c\x6f\x72\x65\x6d \x69\x70\x73\x75\x6d\b/i,
  /\b(?:\x74\x62\x64|\x74\x6f\x64\x6f|\x63\x6f\x6d\x69\x6e\x67 \x73\x6f\x6f\x6e)\b/i,
  /dieser bereich wird weiter ausgebaut/i,
  /hier finden sie weitere informationen/i,
];

const PUBLIC_ENUM_LABELS = {
  "DECISION_CONTEXT_SOURCE_ONLY; ANALYTICAL_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION": "Amtliche Ausgangslage belegt; Wirkannahme muss noch geprüft werden",
  "OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION": "Amtliche Vorlage belegt; Wirkannahme muss noch geprüft werden",
  POSITIVES_WIRKUNGSPOTENZIAL: "Positives Wirkungspotenzial",
  UEBERWIEGEND_POSITIVES_WIRKUNGSPOTENZIAL: "Überwiegend positives Wirkungspotenzial",
  UEBERWIEGEND_POSITIVES_WIRKUNGSPOTENZIAL_MIT_SEPARAT_SICHTBAREN_RISIKEN: "Überwiegend positives Wirkungspotenzial mit separat sichtbaren Risiken",
  AMBIVALENTES_WIRKUNGSPOTENZIAL: "Gegenläufige Wirkungspotenziale und Risiken",
  POSITIVE_POTENTIAL: "Positives Wirkungspotenzial",
  NEGATIVE_RISK: "Materielles Wirkungsrisiko",
  AMBIVALENT: "Gegenläufige Wirkungsrichtungen",
  "OPEN-not-neutral": "Offen ist nicht neutral",
  OPEN: "Wirkungseinordnung noch offen",
  PORTFOLIO_DISAGGREGATION_REQUIRED: "Wirkung nur auf Ebene der Einzelmaßnahmen belastbar bewertbar",
  NO_ROBUST_OVERALL_DIRECTION: "Keine belastbare einheitliche Wirkungsrichtung",
  NOT_YET_OBSERVABLE: "Noch nicht beobachtbar",
  OBSERVATION_ONLY: "Beobachtung ohne Zurechnung",
  PLAUSIBLE_CONTRIBUTION: "Plausibler Beitrag",
  PARTIAL_ATTRIBUTION: "Teilweise Zurechnung",
  CAUSAL_EVIDENCE: "Kausale Evidenz",
  CONFLICTING_EVIDENCE: "Widersprüchliche Evidenz",
  NOT_APPLICABLE: "Noch nicht anwendbar",
  NOT_APPLICABLE_YET: "Noch nicht anwendbar",
  MAIN_MECHANISM_NOT_YET_FULLY_OPERATIONAL: "Zentraler Wirkmechanismus noch nicht vollständig wirksam",
  MEDIUM: "Mittlere Evidenz",
  HIGH: "Hohe Evidenz",
  LOW: "Geringe Evidenz",
  NOT_ASSESSABLE: "Evidenz noch nicht bewertbar",
};

const PUBLIC_INDICATOR_LABELS = {
  low_carbon_material_share: "den Anteil CO2-armer Materialien in der betroffenen Beschaffung",
  material_carbon_intensity: "die reale CO2-Intensität der eingesetzten Materialien",
  public_procurement_cost: "die Kosten der öffentlichen Beschaffung",
  eu_manufacturing_capacity: "zusätzliche industrielle Produktionskapazität in der EU",
  supply_concentration: "Importkonzentration und Lieferkettenabhängigkeit",
  fdi_quality: "die Qualität ausländischer Direktinvestitionen",
  permit_duration_with_protection: "die Genehmigungsdauer bei gleichbleibenden Schutzstandards",
};

const REQUIRED_EDITORIAL_FIELDS = [
  "impact_core_summary",
  "editorial_summary",
  "evidence_summary",
  "key_finding",
  "reality_check_summary",
];

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalize(value) {
  return text(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  return new Set(normalize(value).split(" ").filter((token) => token.length >= 5));
}

function jaccard(left, right) {
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

function replaceEnums(value) {
  return Object.entries(PUBLIC_ENUM_LABELS).sort(([left], [right]) => right.length - left.length).reduce(
    (result, [systemValue, label]) => result.replaceAll(systemValue, label),
    text(value),
  );
}

function humanizeSystemValue(value) {
  return replaceEnums(value).replace(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g, (systemValue) => {
    const words = systemValue.toLocaleLowerCase("de-DE").replaceAll("_", " ");
    return `${words.charAt(0).toLocaleUpperCase("de-DE")}${words.slice(1)}`;
  }).replace(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g, (systemValue) => {
    const words = systemValue.replaceAll("_", " ");
    return `${words.charAt(0).toLocaleUpperCase("de-DE")}${words.slice(1)}`;
  });
}

function cleanRealitySummary(value) {
  return text(value)
    .replace(/\s+Quellen\b[\s\S]*$/i, "")
    .replace(/(?:^|\s)---(?:\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function markdownToPlain(value) {
  return replaceEnums(value)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[>*_#]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentences(value, maximum = 3) {
  const plain = markdownToPlain(value);
  if (!plain) return "";
  const sentences = plain.match(/[^.!?]+[.!?]+(?:[”"])?|[^.!?]+$/g) ?? [plain];
  return sentences.slice(0, maximum).join(" ").replace(/\s+/g, " ").trim();
}

function markdownSections(markdown) {
  const matches = [...text(markdown).matchAll(/^(#{2,3})\s+(.+)$/gm)];
  return matches.map((match, index) => ({
    heading: match[2].trim(),
    body: text(markdown).slice(
      match.index + match[0].length,
      matches.slice(index + 1).find((candidate) => candidate[1].length <= match[1].length)?.index ?? text(markdown).length,
    ).trim(),
  }));
}

function sectionSummary(markdown, headingPattern) {
  const section = markdownSections(markdown).find((candidate) => headingPattern.test(candidate.heading));
  return section ? firstSentences(section.body, 3) : "";
}

function inlineEvidenceSummary(markdown) {
  const match = text(markdown).match(/\*\*(?:Evidenzbasis|Evidenzgrad|Evidenz):\*\*\s*([^\n]+)/i);
  return match ? firstSentences(match[1], 3) : "";
}

function hasRawInternalEnum(value) {
  const withoutAllowedLabels = text(value);
  return /\b(?:POSITIVE_POTENTIAL|NEGATIVE_RISK|PORTFOLIO_DISAGGREGATION_REQUIRED|NO_ROBUST_OVERALL_DIRECTION|NOT_YET_OBSERVABLE|OBSERVATION_ONLY|PLAUSIBLE_CONTRIBUTION|PARTIAL_ATTRIBUTION|CAUSAL_EVIDENCE|CONFLICTING_EVIDENCE|NOT_APPLICABLE|NOT_ASSESSABLE)\b/.test(withoutAllowedLabels)
    || /\b[\p{L}0-9]+(?:_[\p{L}0-9]+)+\b/u.test(withoutAllowedLabels);
}

export function isGenericPublicEditorialText(value) {
  const candidate = text(value);
  if (!candidate) return true;
  return KNOWN_GENERIC_PATTERNS.some((pattern) => pattern.test(candidate))
    || PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(candidate));
}

function validateProjection(fields) {
  const failed = [];
  for (const field of REQUIRED_EDITORIAL_FIELDS) {
    const value = text(fields[field]);
    if (!value) failed.push(`${field}:EMPTY`);
    else if (isGenericPublicEditorialText(value)) failed.push(`${field}:GENERIC`);
    else if (hasRawInternalEnum(value)) failed.push(`${field}:RAW_ENUM`);
  }
  if (text(fields.editorial_summary).length < 90) failed.push("editorial_summary:TOO_SHORT");
  if (text(fields.impact_core_summary).length < 55) failed.push("impact_core_summary:TOO_SHORT");
  if (text(fields.evidence_summary).length < 45) failed.push("evidence_summary:TOO_SHORT");
  if (text(fields.key_finding).length < 20) failed.push("key_finding:TOO_SHORT");
  if (normalize(fields.overview_assessment_label) === normalize(fields.impact_core_summary)) failed.push("ASSESSMENT_EQUALS_IMPACT_CORE");
  return [...new Set(failed)];
}

function projectionResult(fields) {
  const failed = validateProjection(fields);
  return { status: failed.length ? "PUBLICATION_REVIEW_REQUIRED" : "PASS", failed, fields };
}

export function projectGovernmentEditorial(record) {
  const markdown = text(record?.full_analysis_markdown);
  const isFullSchema = record?.record_profile === "FULL_SCHEMA_2_0_1";
  const evidenceSummary = text(record?.evidence_summary) || (isFullSchema
    ? firstSentences(record?.evidence_summary_text, 3)
    : sectionSummary(markdown, /(?:^|\s)Evidenz(?:grad|basis)?(?:\s|$)/i) || inlineEvidenceSummary(markdown));
  const realitySummary = cleanRealitySummary(text(record?.editorial_evidence_overlay ? record?.reality_check_summary : "")
    || sectionSummary(markdown, /Reality.Check|Wirkungsprüfung/i));
  return projectionResult({
    overview_assessment_label: publicEnumLabel(record?.overview_assessment_label),
    impact_core_summary: text(record?.impact_core_summary),
    editorial_summary: text(record?.editorial_summary),
    evidence_summary: evidenceSummary,
    key_finding: text(record?.key_finding),
    reality_check_summary: humanizeSystemValue(realitySummary),
  });
}

export function projectEuEditorial(record) {
  const markdown = text(record?.full_analysis_markdown);
  const evidenceSummary = text(record?.evidence_summary)
    || sectionSummary(markdown, /(?:^|\s)Evidenzgrad(?:\s|$)/i)
    || inlineEvidenceSummary(markdown);
  const indicators = (record?.key_indicators ?? []).slice(0, 2)
    .map((indicator) => PUBLIC_INDICATOR_LABELS[indicator])
    .filter(Boolean);
  const realityStatus = PUBLIC_ENUM_LABELS[text(record?.reality_check_status)] ?? "";
  const realitySummary = text(record?.reality_check_summary) || (realityStatus && indicators.length
    ? `${realityStatus}. Der Reality Check beobachtet dafür ${indicators.join(" und ")}.`
    : realityStatus
      ? `${realityStatus}. Für „${text(record?.title)}“ sind noch keine Messgrößen mit freigegebener öffentlicher Klartextbezeichnung hinterlegt.`
      : `Für „${text(record?.title)}“ liegt noch keine freigegebene öffentliche Reality-Check-Kurzfassung vor.`);
  return projectionResult({
    overview_assessment_label: publicEnumLabel(record?.overview_assessment_label ?? record?.key_finding),
    impact_core_summary: text(record?.impact_core_summary),
    editorial_summary: text(record?.editorial_summary),
    evidence_summary: evidenceSummary,
    key_finding: text(record?.key_finding),
    reality_check_summary: humanizeSystemValue(realitySummary),
  });
}

export function projectParliamentEditorial(record) {
  const workingAct = record?.publicWorkingAct;
  const editorial = workingAct?.editorialSummary;
  const firstPath = workingAct?.reviewDetail?.impactPaths?.[0];
  const assessmentLabel = text(workingAct?.overallPotential);
  const impactCoreSummary = text(editorial?.keyStatement);
  const editorialSummary = [...new Set([impactCoreSummary, assessmentLabel].filter(Boolean))].join(" ");
  const keyFinding = text(workingAct?.risks?.[0] ?? workingAct?.changeLevers?.[0] ?? editorial?.whatIsNotYetKnown);
  const evidenceSummary = [
    firstPath?.hypothesis ? `Getragene Wirkannahme: ${text(firstPath.hypothesis)}` : "",
    firstPath?.evidenceStatus ? `Evidenzstatus: ${humanizeSystemValue(firstPath.evidenceStatus)}.` : "",
    firstPath?.evidenceBoundary ? `Aussagegrenze: ${text(firstPath.evidenceBoundary)}` : "",
    workingAct?.dataGaps?.[0] ? `Zentrale Datenlücke: ${text(workingAct.dataGaps[0])}` : "",
  ].filter(Boolean).join(" ");
  const realityCheckSummary = text(workingAct?.reviewDetail?.feedback?.interpretation
    ?? workingAct?.reviewDetail?.feedback?.currentStatus
    ?? workingAct?.counterfactualQuestions?.[0]);
  return projectionResult({
    overview_assessment_label: assessmentLabel,
    impact_core_summary: impactCoreSummary,
    editorial_summary: editorialSummary,
    evidence_summary: evidenceSummary,
    key_finding: keyFinding,
    reality_check_summary: humanizeSystemValue(realityCheckSummary),
  });
}

export function findGenericProjectionPatterns(records, threshold = 0.9) {
  const fields = ["impact_core_summary", "editorial_summary", "evidence_summary", "key_finding", "reality_check_summary", "recommendation_core_summary", "why_preferred"];
  const flags = [];
  for (const field of fields) {
    const candidates = records.map((record) => ({ id: record.id, value: text(record.fields?.[field]) })).filter((entry) => entry.value);
    for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
        const left = candidates[leftIndex];
        const right = candidates[rightIndex];
        const similarity = left.value === right.value ? 1 : jaccard(tokens(left.value), tokens(right.value));
        if (similarity >= threshold) flags.push({
          code: "GENERIC_PUBLIC_EDITORIAL_PATTERN_DETECTED",
          field,
          ids: [left.id, right.id],
          similarity: Number(similarity.toFixed(3)),
        });
      }
    }
  }
  return flags;
}

export function publicEnumLabel(value) {
  const candidate = text(value);
  const reviewedLabel = PUBLIC_ENUM_LABELS[candidate];
  if (reviewedLabel) return reviewedLabel;
  return /\b[\p{L}0-9]+(?:_[\p{L}0-9]+)+\b/u.test(candidate) ? "" : candidate;
}

/**
 * Projects reviewed control vocabulary that occurs inside an otherwise
 * narrative Fachtext. Unknown machine tokens fail closed instead of being
 * cosmetically title-cased for the public UI.
 */
export function publicNarrativeEnumText(value) {
  const candidate = replaceEnums(value);
  return hasRawInternalEnum(candidate) ? "" : candidate;
}
