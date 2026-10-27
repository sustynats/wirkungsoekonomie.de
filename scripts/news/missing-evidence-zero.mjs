import {createHash} from 'node:crypto';
import {MAGNITUDE_FACTORS} from './impact-magnitude.mjs';
import {observationContextFingerprint} from './observation-context.mjs';

const normalize = value => String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ');
const list = value => Array.isArray(value) ? value : [];
// A conservative contradiction check, not a judgement based on a topic or on
// low evidence alone. A source's silence cannot establish a zero change.
const missing = value => /(?:\bkein\w*\b|\bnicht\b|\bfehl\w*\b|\bmangels\b).{0,140}(?:belegt|beschrieben|benannt|genannt|ausgewiesen|bestimmbar|bewertbar|quantifizierbar|ableitbar|erkennbar|quellengebunden plausibel|angaben|daten|informationen)/u.test(normalize(value));
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
      // The contradiction is structural: all factors are zero, most are
      // justified by absent evidence, and the zero rationale also cites that
      // absence. It does not depend on a connector such as "deshalb".
      if (absentFactors >= 4 && missing(path.negligibility_rationale)) {
        issues.push('IMPACT_ZERO_FROM_MISSING_EVIDENCE:' + key);
        break;
      }
    }
  }
  return issues;
}

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const REVIEWED = Object.freeze([Object.freeze({
  story_id: 'wt-0927106fd294a8d0', published_at: '2026-10-27T08:30:58.112Z', version: 1,
  content_hash: 'a6d81da81913d2e84cdb772b412fe82966cc4b510132446f9badde5c900ff69d',
  target_label: 'Neuausrichtung des Festivals DOK Leipzig', dimension: 'planet',
  profile_sha256: 'd0c079105bad82751d14c710f8507629617b7f5fae19cd17d12bc36b9154dafb',
  dimension_sha256: '34e2770606416032b7e9c7720c8fa85d5fb22aeaf8feabe8b9865a7c7aabc86d',
  at: '2026-10-27T09:43:00.000Z',
  note: 'Die zuvor für Planet angezeigte Stufe 0 wurde mit fehlenden Umweltangaben begründet. Fehlende Daten belegen keine vernachlässigbare Veränderung. Die Planet-Tragweite bleibt deshalb offen und muss fachlich nachgeprüft werden. Die übrigen Dimensionen und der berichtete Sachverhalt bleiben unverändert.',
}), Object.freeze({
  story_id: 'wt-de5c18859f6150cf', published_at: '2026-10-27T12:17:07.962Z',
  updated_at: '2026-10-27T12:17:07.962Z', version: 1,
  content_hash: '65154429d5da712a5019d30fab8769f38fae28df8a5070bfe881b390e73c4f58',
  target_label: 'Sicherheits- und Vertrauensfolgen eines berichteten Schussvorfalls', dimension: 'planet',
  profile_sha256: '191f440c97fa8edf7ce5d2c9c0d42302cec28eca7281e0c79abda7f380ab0300',
  dimension_sha256: '2564d62182fcf214f7c2b91e7a14bcc50252e8bd59ca4c4c9541dd74f57c4750',
  at: '2026-10-27T12:56:00.000Z',
  note: 'Die zuvor für Planet angezeigte Stufe 0 wurde mit fehlenden Umweltbelegen begründet. Fehlende Daten belegen keine vernachlässigbare Veränderung. Die Planet-Tragweite bleibt deshalb offen und muss fachlich nachgeprüft werden. Die übrigen Dimensionen und der berichtete Sachverhalt bleiben unverändert.',
}), Object.freeze({
  story_id: 'wt-5987621cd126d543', published_at: '2026-10-26T06:03:41.150Z',
  updated_at: '2026-10-27T10:50:31.103Z', version: 2,
  content_hash: 'c74554152ad2165539701a54556c9fdeb1f6ed7d64a34b1531a8705d24f2096e',
  target_label: 'weiterer gerichtlicher Verfahrensgang', dimension: 'planet',
  profile_sha256: '9d65e3ac2c67fee3bfe4835a3d7bac839dab87cf8fa973df3735b00c8f32240d',
  dimension_sha256: '4649b0c59f03ad715cbb0f6b28ef0f6a5fd22f24f4848f13ab17102489ee3cad',
  at: '2026-10-27T12:56:00.000Z',
  note: 'Die zuvor für Planet angezeigte Stufe 0 wurde mit fehlenden Umweltbelegen begründet. Fehlende Daten belegen keine vernachlässigbare Veränderung. Die Planet-Tragweite bleibt deshalb offen und muss fachlich nachgeprüft werden. Die übrigen Dimensionen und der berichtete Sachverhalt bleiben unverändert.',
}), Object.freeze({
  story_id: 'wt-2fb8d2cf3286781b', published_at: '2026-10-21T20:51:28.785Z',
  updated_at: '2026-10-27T12:02:26.862Z', version: 2,
  content_hash: '0c73e67a9c1a7b5707220d8f05647a0b7415e0863da871e2267000f1d74fbb31',
  target_label: 'Öffentliche Forderung nach Beteiligung an einem möglichen diplomatischen Treffen', dimension: 'planet',
  profile_sha256: 'eeb229c62a8c5a436d072b916fd29baac357bc99a5de6dcb72e0c66dae04e7ba',
  dimension_sha256: '1fefa47a931ecc0874ee4bec92e30c100225929ca64cf574357642be921b5b91',
  at: '2026-10-27T13:04:00.000Z',
  note: 'Die zuvor für Planet angezeigte Stufe 0 wurde mit fehlenden Umweltbelegen begründet. Fehlende Daten belegen keine vernachlässigbare Veränderung. Die Planet-Tragweite bleibt deshalb offen und muss fachlich nachgeprüft werden. Die übrigen Dimensionen und der berichtete Sachverhalt bleiben unverändert.',
}), Object.freeze({
  story_id: 'wt-19479b38bc79f2bc', published_at: '2026-10-27T13:00:48.573Z',
  updated_at: '2026-10-27T13:00:48.573Z', version: 1,
  content_hash: 'fe8df641c77efc9613b2d3a2b815c0cdfd7868c6bec5fcbe44e1e4bd17c84f75',
  target_label: 'Ermittlungsmaßnahme und ihre mögliche Wirkung auf Sicherheit, Öffentlichkeit und Institutionen', dimension: 'planet',
  profile_sha256: '9a2e4bbb7dfd24bce21314e75d959028d65ed128e1e89eb6647a8fa2d1c7cbcc',
  dimension_sha256: 'b4a8cda5a76ce255e24ccdadea30bf72e18c499915f0ca65d31ee7881ff3324f',
  at: '2026-10-27T17:04:00.000Z',
  note: 'Die zuvor für Planet angezeigte Stufe 0 wurde mit fehlenden Umweltbelegen begründet. Fehlende Daten belegen keine vernachlässigbare Veränderung. Die Planet-Tragweite bleibt deshalb offen und muss fachlich nachgeprüft werden. Die übrigen Dimensionen und der berichtete Sachverhalt bleiben unverändert.',
})]);

// Audited, already published editions. Paid originals, stored versions and
// receipts are immutable. A changed profile or source binding needs a new audit.
export function projectMissingEvidenceCorrection(input = {}, assessment = {}, reviewed = REVIEWED) {
  if (Array.isArray(reviewed)) {
    for (const binding of reviewed) {
      const projected = projectMissingEvidenceCorrection(input, assessment, binding);
      if (projected !== assessment) return projected;
    }
    return assessment;
  }
  if (!input || !assessment || !reviewed || input.published === false || input.manual_only || input.editorial_approval_hash
    || input.story_id && input.story_id !== reviewed.story_id
    || input.published_at && input.published_at !== reviewed.published_at
    || input.updated_at && reviewed.updated_at && input.updated_at !== reviewed.updated_at
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
