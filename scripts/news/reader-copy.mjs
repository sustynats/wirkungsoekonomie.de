// Only reader-facing prose is checked. Internal instructions/diagnostics and
// source records stay intact; this gate never silently rewrites journalism.
export const READER_COPY_RULE = "Lesertexte liefern konkrete Befunde, Quellen und Wissensgrenzen, keine Redaktionsanweisungen, internen Prüfcodes oder Erklärungen der eigenen Arbeitsregeln. Methodik nur verlinken; Korrekturhinweise erhalten.";

const EDITORIAL_RESIDUE = [
  /\bWahrheit\s+zuerst\s*:/iu,
  /\b(?:das\s+interne\s+)?Claim[-\s]+Ledger\b/iu,
  /\b(?:Redaktionshinweis|interne[rns]?\s+(?:Hinweis|Prüfvermerk|Arbeitsanweisung))\s*:/iu,
  /\b(?:bitte\s+)?(?:vor\s+(?:der\s+)?Veröffentlichung|im\s+nächsten\s+Schritt)\s+(?:noch\s+)?(?:prüfen|ergänzen|überarbeiten|entfernen)\b/iu,
  /\b(?:TODO|TBD)\s*:/u,
  /\b(?:media_trigger|controlled_source_text|provider_reported_usage|AI_INPUT_[A-Z_]+)\b/u,
  /Die Akteursaussage bleibt vom belegten Ereignis/iu,
  /Dieser Check untersucht die konkrete Vermittlung, nicht die Gesinnung/iu,
  /Keine Absichtszuschreibung und keine Bewertung des Medienhauses/iu,
];

function strings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

export function hasEditorialResidue(value) {
  return strings(value).some(text => EDITORIAL_RESIDUE.some(pattern => pattern.test(text.normalize("NFKC").replace(/\u00ad/g, ""))));
}

// Explicit public-field boundary: never scan self-check problems, trigger
// reasons, provider usage, source evidence, IDs or publication-gate rationale.
export function analysisReaderCopy(analysis = {}) {
  analysis ||= {};
  const keys = ["source_summary", "summary", "detail_summary", "why_relevant", "impact_potential", "systemic_relevance", "transformation_potential", "resilience", "attribution", "human", "planet", "democracy", "impact_risks", "mechanisms", "first_order", "second_order", "third_order", "side_effects", "uncertainties", "watch_next", "reference_frameworks", "visuals"];
  const media = analysis.media_impact || {};
  const mediaKeys = ["factual_core", "public_explanation", "editorial_assessment", "fact_first_alternative", "fact_first_reframe", "speaker_statement", "frame_analysis", "framing", "resonance", "discourse_effect", "impact_path", "evidence", "observed_impact", "political_context", "source_comparison"];
  return [keys.map(key => analysis[key]), media.relevant ? mediaKeys.map(key => media[key]) : [],
    media.self_frame_check?.recommended_title, media.self_frame_check?.recommended_summary, media.self_frame_check?.recommended_meta_description,
    (analysis.event_claims || []).map(claim => [claim.statement, claim.claim, claim.uncertainty]),
    (analysis.followups || []).map(item => [item.claim, item.measurable_indicator])];
}

export function readerHtmlHasEditorialResidue(html) {
  // Scripts include structured data; source URLs/attributes are not prose.
  const text = String(html).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;|&#x0*a0;/gi, " ").replace(/&shy;|&#173;|&#xad;/gi, "").replace(/\s+/g, " ");
  return hasEditorialResidue(text);
}
