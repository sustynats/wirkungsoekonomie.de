import {createHash} from 'node:crypto';
import {MAGNITUDE_FACTORS} from './impact-magnitude.mjs';
import {observationContextFingerprint} from './observation-context.mjs';

const normalize = value => String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ');
const list = value => Array.isArray(value) ? value : [];
// A conservative contradiction check, not a judgement based on a topic or on
// low evidence alone. A source's silence cannot establish a zero change.
const missing = value => /(?:\bkein\w*\b|\bnicht\b|\bfehl\w*\b|\bmangels\b).{0,140}(?:belegt|beschrieben|benannt|genannt|ausgewiesen|bestimmbar|bewertbar|quantifizierbar|ableitbar|angaben|daten|informationen)/u.test(normalize(value));
const bounded = value => /(?:unverandert|identisch|gleichbleibend).{0,60}(?:raume|flache|wege|betrieb|material|energie|volumen|termine|verfahren)|(?:raume|flache|wege|betrieb|material|energie|volumen|termine|verfahren).{0,60}(?:unverandert|identisch|gleichbleibend)|keine? zusatzlichen? (?:wege|reisen|material|energie|flachen|stoffstrome)/u.test(normalize(value));

export function missingEvidenceZeroIssues(assessment = {}) {
  const issues = [];
  for (const key of ['human', 'planet', 'democracy']) {
    const dimension = assessment?.dimensions?.[key];
    for (const path of [...list(dimension?.primary_paths), ...list(dimension?.secondary_paths)]) {
      if (path?.magnitude !== 0 || bounded(path.negligibility_rationale)) continue;
      const factors = Object.keys(MAGNITUDE_FACTORS).map(name => path.magnitude_factors?.[name]);
      if (!factors.every(factor => factor?.value === 0)) continue;
      const absentFactors = factors.filter(factor => missing(factor.rationale)).length;
      const rationale = normalize(path.negligibility_rationale);
      const absenceUsedAsReason = missing(rationale)
        && /(?:belegt|bestimmbar|bewertbar|quantifizierbar|ableitbar)[^.!?]{0,120}\b(?:daher|deshalb|somit|folglich)\b/u.test(rationale);
      if (absentFactors >= 4 && (absenceUsedAsReason
        || missing(dimension?.research_result) && missing(path.mechanism) && missing(path.negligibility_rationale))) {
        issues.push('IMPACT_ZERO_FROM_MISSING_EVIDENCE:' + key);
        break;
      }
    }
  }
  return issues;
}

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const REVIEWED = Object.freeze({
  story_id: 'wt-0927106fd294a8d0', published_at: '2026-10-27T08:30:58.112Z', version: 1,
  content_hash: 'a6d81da81913d2e84cdb772b412fe82966cc4b510132446f9badde5c900ff69d',
  target_label: 'Neuausrichtung des Festivals DOK Leipzig', dimension: 'planet',
  profile_sha256: 'd0c079105bad82751d14c710f8507629617b7f5fae19cd17d12bc36b9154dafb',
  dimension_sha256: '34e2770606416032b7e9c7720c8fa85d5fb22aeaf8feabe8b9865a7c7aabc86d',
  at: '2026-10-27T09:43:00.000Z',
  note: 'Die zuvor für Planet angezeigte Stufe 0 wurde mit fehlenden Umweltangaben begründet. Fehlende Daten belegen keine vernachlässigbare Veränderung. Die Planet-Tragweite bleibt deshalb offen und muss fachlich nachgeprüft werden. Die übrigen Dimensionen und der berichtete Sachverhalt bleiben unverändert.',
});

// One audited, already published edition. Paid originals, stored versions and
// receipts are immutable. A changed profile or source binding needs a new audit.
export function projectMissingEvidenceCorrection(input = {}, assessment = {}, reviewed = REVIEWED) {
  if (!input || !assessment || input.published === false || input.manual_only || input.editorial_approval_hash
    || input.story_id && input.story_id !== reviewed.story_id
    || input.published_at && input.published_at !== reviewed.published_at
    || input.current_version && input.current_version !== reviewed.version
    || input.content_hash && input.content_hash !== reviewed.content_hash
    || assessment.zero_evidence_correction
    || assessment.evaluation_target?.label !== reviewed.target_label
    || !Number.isFinite(Date.parse(reviewed.at))
    || observationContextFingerprint(assessment) !== reviewed.profile_sha256
    || hash(assessment.dimensions?.[reviewed.dimension]) !== reviewed.dimension_sha256
    || !missingEvidenceZeroIssues(assessment).includes('IMPACT_ZERO_FROM_MISSING_EVIDENCE:' + reviewed.dimension)) return assessment;
  const projected = structuredClone(assessment), original = assessment.dimensions[reviewed.dimension];
  projected.dimensions[reviewed.dimension] = {
    path_status: 'insufficient_basis', direction: 'open', dominance: 'none', magnitude: null,
    evidence: 'not_assessable', likelihood: 'unknown', data_status: 'missing', temporal_status: 'ex_ante',
    primary_paths: [], secondary_paths: [], balance: null,
    rationale: 'Die verfügbaren Angaben tragen derzeit keine belastbare Einschätzung der ökologischen Tragweite. Offen bedeutet keine Bewertung mit null Punkten.',
    research_pass: 'second_pass',
    research_result: 'Die bisherigen Quellen nennen keine Grundlage für eine begründet vernachlässigbare ökologische Veränderung. Die ursprüngliche Nullbewertung ersetzt die noch offene fachliche Prüfung nicht.',
    reviewed_source_ids: [...(original.reviewed_source_ids || [])],
  };
  projected.zero_evidence_correction = {
    at: reviewed.at, note: reviewed.note, dimension: reviewed.dimension, previous_magnitude: 0,
    original_profile_sha256: reviewed.profile_sha256, original_dimension_sha256: reviewed.dimension_sha256,
  };
  return projected;
}
