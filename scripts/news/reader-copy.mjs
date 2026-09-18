// Only reader-facing prose is checked. Internal instructions/diagnostics and
// source records stay intact; this gate never silently rewrites journalism.
export const READER_COPY_RULE = "Lesertexte liefern konkrete Befunde, Quellen und Wissensgrenzen, keine Redaktionsanweisungen, internen Prüfcodes oder Erklärungen der eigenen Arbeitsregeln. Methodik nur verlinken; Korrekturhinweise erhalten.";

// Am 18.09.2026 stand eine an Natalie gerichtete Rueckfrage als Lesertext in
// "Meine Einordnung": "Redaktionelle Rueckfrage vor der abschliessenden
// Natalie-Freigabe: Eine persoenliche Gewichtung ist in den vorliegenden
// author_notes nicht mitgeteilt. Bitte festlegen, ob ...". Geprueft wurde
// vorher nur "Bestaetigung durch Natalie" - eine Wortliste aus dem Vorfall vom
// 16.09., die der naechsten Formulierung nicht gewachsen war.
//
// Erfasst wird deshalb die Klasse, nicht der Wortlaut: der Freigabevorbehalt,
// die Anrede der Redaktion, die Aufgabe an sie und die internen Feldnamen.
export const PROCESS_NOTE_PATTERN = new RegExp([
  '\\b(?:Freigabe|Bestätigung|Genehmigung|Zustimmung|Rückfrage)\\s+(?:durch|von|bei)\\s+Natalie\\b',
  '\\bNatalie[- ]?(?:Freigabe|Bestätigung|Genehmigung|Zustimmung|Rückfrage)\\b',
  '\\b(?:Vorschlag|Vorbehalt|Entwurf)\\s+zur\\s+(?:[a-zäöüß]+\\s+)?(?:Bestätigung|Freigabe|Genehmigung|Zustimmung)\\b',
  // Der Beitrag spricht nie ueber seine Entstehung (18.09.2026: ein Entwurf begann
  // mit "Vier von Natalie bereitgestellte Screenshots ..." unter der Zeile
  // "privater Entwurf zur finalen Freigabe").
  '\\b(?:private[rn]?|interne[rn]?|vorläufige[rn]?)\\s+Entwurf\\b',
  '\\b(?:von|durch)\\s+Natalie\\s+(?:\\w+\\s+){0,2}(?:bereitgestellt|eingereicht|übermittelt|zugesandt|geschickt|hochgeladen|geteilt|angehängt)\\w*',
  // Nur Auftragsmaterial: "hochgeladenen Dateien" steht auch in echter
  // Berichterstattung (Leak-Seite einer Hackergruppe, Meldung vom 18.09.).
  '\\b(?:bereitgestellte|eingereichte|zugesandte|hochgeladene|angehängte|beigefügte)n?\\s+(?:Screenshots?|Bildschirmfotos?|JPEG\\S*)',
  '\\b(?:Rechercheauftrag|Redaktionsauftrag|Auftragstext|Auftragsmaterial)\\w*\\b',
  '\\bzur\\s+(?:Bestätigung|Freigabe)\\s+(?:durch|vorgelegt|eingereicht)\\b',
  '\\bvor\\s+der\\s+(?:abschließenden|endgültigen|finalen)\\s+(?:Freigabe|Bestätigung|Natalie)',
  '\\b(?:Redaktionelle[rs]?\\s+)?Rückfrage\\s+(?:an|vor|zur)\\b',
  '\\bBitte\\s+(?:festlegen|entscheiden|ergänzen|bestätigen|freigeben|prüfen,\\s*ob)\\b',
  '\\b(?:Hinweis|Anmerkung|Notiz)\\s+an\\s+(?:die\\s+)?Redaktion\\b',
  '\\bWerkstattnotiz\\b',
  '\\b(?:author_notes|body_markdown|source_summary|impact_assessment|author_perspective|claim_indices|job_id|hold_code|editorial_revision|contract_path)\\b',
].join('|'), 'u');

const EDITORIAL_RESIDUE = [
  PROCESS_NOTE_PATTERN,
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
  return [[analysis.assessment_frame?.subject, analysis.assessment_frame?.baseline, analysis.observed_outcome?.change], keys.map(key => ['human', 'planet', 'democracy'].includes(key)
    ? [analysis[key]?.rationale, ...['positive_path', 'negative_path'].flatMap(p => [analysis[key]?.[p]?.mechanism, analysis[key]?.[p]?.state_change, analysis[key]?.[p]?.condition])]
    : analysis[key]), media.relevant ? mediaKeys.map(key => media[key]) : [],
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
