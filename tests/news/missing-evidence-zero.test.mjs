import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {missingEvidenceZeroIssues, projectMissingEvidenceCorrection as project} from '../../scripts/news/missing-evidence-zero.mjs';
import {deterministicGateIssues, releaseDeterministicImpact} from '../../scripts/news/impact-gate.mjs';
import {deriveImpactPresentation} from '../../scripts/news/impact-assessment.mjs';
import {isGroundedOpenDimension} from '../../scripts/news/impact-potential.mjs';
import {observationContextFingerprint} from '../../scripts/news/observation-context.mjs';
import {renderDimensionMeters} from '../../scripts/news/visuals.mjs';
import {impactCoverage} from '../../scripts/news/impact-coverage.mjs';
import {auditImpactProfiles} from '../../scripts/news/audit-impact-profiles.mjs';
import {publicTitleImage} from '../../scripts/news/title-image/pipeline.mjs';
import {syntheticPotentialAssessment, syntheticPotentialPath} from './fixtures/impact21.mjs';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('malformed input stays with the structural validator instead of throwing here', () => {
  for (const value of [null, {}, {dimensions:{planet:{primary_paths:{},secondary_paths:'invalid'}}}])
    assert.deepEqual(missingEvidenceZeroIssues(value),[]);
  assert.equal(project({},null),null);
});
function fixture(key = 'planet') {
  const assessment = syntheticPotentialAssessment();
  const path = syntheticPotentialPath({direction:'open', magnitude:0,
    mechanism:'Die Informationen beschreiben ein Programm, nicht ökologische Inputs oder Folgen.',
    negligibility_rationale:'Kein ökologischer Mechanismus ist belegt; deshalb wird die Änderung als vernachlässigbar modelliert.'});
  const reasons = ['Keine Reichweite ist in den Quellen ausgewiesen.',
    'Keine Intensität wird im Beleg beschrieben.', 'Keine Dauer wird im Beleg genannt.',
    'Keine irreversible Veränderung ist belegt.', 'Betroffene Systeme werden nicht benannt.',
    'Kein Systempfad ist aus dem Material ableitbar.'];
  Object.values(path.magnitude_factors).forEach((factor, i) => {factor.rationale = reasons[i];});
  Object.assign(assessment.dimensions[key], {direction:'open', dominance:'none', magnitude:0,
    evidence:'not_assessable', likelihood:'unknown', primary_paths:[path], secondary_paths:[],
    rationale:'Ohne Angaben aus den Quellen lässt sich kein belastbarer Pfad ableiten.',
    reviewed_source_ids:['official'],
    research_result:'Die Quellen enthalten keine Angaben; der Pfad ist daher nicht bestimmbar.'});
  const record = {story_id:'wt-synthetic-zero', published:true, published_at:'2026-10-27T08:30:00.000Z',
    current_version:1, content_hash:'synthetic-source-binding', title:'Synthetische Programmänderung',
    sources:[{source_id:'official', url:'https://example.org/synthetic'}],
    impact_assessment:assessment, versions:[{version:1, analysis:{impact_assessment:structuredClone(assessment)}}],
    original_potential_assessment:{assessment:structuredClone(assessment)}};
  const reviewed = {story_id:record.story_id, published_at:record.published_at,
    version:record.current_version, content_hash:record.content_hash, dimension:key,
    target_label:assessment.evaluation_target.label,
    profile_sha256:observationContextFingerprint(assessment), dimension_sha256:hash(assessment.dimensions[key]),
    at:'2026-10-27T09:43:00.000Z', note:'Die frühere Null beruhte auf einer Datenlücke. Die Tragweite bleibt offen.'};
  return {record, assessment, reviewed};
}

test('a zero inferred from source silence is held in every MPD dimension, without mutating paid data', () => {
  for (const key of ['human','planet','democracy']) {
    const {record} = fixture(key), before = structuredClone(record);
    assert.ok(deterministicGateIssues(record).includes('IMPACT_ZERO_FROM_MISSING_EVIDENCE:' + key));
    const result = releaseDeterministicImpact(record, {now:'2026-10-27T09:43:00.000Z'});
    assert.equal(result.released, false);
    assert.ok(result.issues.includes('IMPACT_ZERO_FROM_MISSING_EVIDENCE:' + key));
    assert.deepEqual(record, before, 'no restamping, retry, invented factor or source write');
  }
});

test('a bounded zero remains admissible even when measurements are missing', () => {
  const {record, assessment} = fixture();
  assessment.dimensions.planet.primary_paths[0].negligibility_rationale =
    'Messdaten fehlen. Identische Räume und unveränderte Wege begrenzen die Änderung; es gibt keine zusätzlichen Reisen.';
  assert.deepEqual(missingEvidenceZeroIssues(assessment), []);
  assert.ok(!deterministicGateIssues(record).some(x => x.startsWith('IMPACT_ZERO_FROM_MISSING_EVIDENCE')));
});

test('zero factors justified by absent evidence are held without a causal connector', () => {
  for (const key of ['human','planet','democracy']) {
    const {record,assessment} = fixture(key), path = assessment.dimensions[key].primary_paths[0];
    path.negligibility_rationale = 'Für das betroffene Umfeld ist keine materielle Zustandsänderung belegt oder plausibel spezifiziert.';
    const before = structuredClone(record);
    assert.deepEqual(missingEvidenceZeroIssues(assessment), ['IMPACT_ZERO_FROM_MISSING_EVIDENCE:' + key]);
    assert.equal(releaseDeterministicImpact(record).released, false);
    assert.deepEqual(record,before);
  }
});

test('not demonstrable and not proven cannot bypass the same missing-evidence zero gate', () => {
  for (const key of ['human', 'planet', 'democracy']) for (const reason of [
    'Für den geprüften Zeitraum und Quellenbestand ist keine belastbare Zustandsänderung nachweisbar.',
    'Eine Veränderung ist im vorliegenden Material nicht nachgewiesen.',
  ]) {
    const {record, assessment} = fixture(key);
    assessment.dimensions[key].primary_paths[0].negligibility_rationale = reason;
    const original = structuredClone(record);
    assert.deepEqual(missingEvidenceZeroIssues(assessment), ['IMPACT_ZERO_FROM_MISSING_EVIDENCE:' + key]);
    assert.equal(releaseDeterministicImpact(record).released, false);
    assert.deepEqual(record, original, 'no provider retry, restamping or rewriting the supplied profile');
  }
});

test('a positive bound remains admissible beside missing-proof wording', () => {
  const {assessment} = fixture();
  assessment.dimensions.planet.primary_paths[0].negligibility_rationale =
    'Messwerte sind nicht nachweisbar. Identische Räume und unveränderte Wege begrenzen die Änderung; keine zusätzlichen Reisen.';
  assert.deepEqual(missingEvidenceZeroIssues(assessment), []);
});

test('an audited open projection names its own dimension and preserves every paid field', () => {
  for (const [key, subject] of [['human', 'menschlich'], ['planet', 'ökologisch'], ['democracy', 'demokratisch']]) {
    const {record, assessment, reviewed} = fixture(key), before = structuredClone(record);
    const projected = project(record, assessment, reviewed);
    assert.equal(projected.dimensions[key].magnitude, null);
    assert.ok(isGroundedOpenDimension(projected.dimensions[key], new Set(['official'])));
    assert.ok(projected.dimensions[key].rationale.includes(subject + 'en Tragweite'));
    assert.ok(projected.dimensions[key].research_result.includes(subject + 'e Veränderung'));
    for (const other of ['human', 'planet', 'democracy'].filter(value => value !== key))
      assert.deepEqual(projected.dimensions[other], assessment.dimensions[other]);
    assert.deepEqual(projected.observed_effects, assessment.observed_effects);
    assert.deepEqual(record, before);
  }
});

test('an unrecognized change in the supplied sources does not establish zero', () => {
  const {assessment} = fixture(), path = assessment.dimensions.planet.primary_paths[0];
  for (const reason of [
    'Für den berichteten Vorgang ist in den gelieferten Quellen kein ökologischer Zustandswechsel erkennbar.',
    'Für den abgegrenzten Gegenstand ist keine materielle Zustandsänderung quellengebunden plausibel.',
  ]) {
    path.negligibility_rationale = reason;
    assert.deepEqual(missingEvidenceZeroIssues(assessment), ['IMPACT_ZERO_FROM_MISSING_EVIDENCE:planet']);
  }
  path.negligibility_rationale = 'Identische Räume und unveränderte Wege begrenzen den Vorgang; keine zusätzlichen Reisen.';
  assert.deepEqual(missingEvidenceZeroIssues(assessment), [], 'a positive bounded basis remains admissible');
});

test('only an explicitly audited correction withholds a stale rating image without regenerating it', () => {
  const {record, assessment, reviewed} = fixture('democracy');
  record.title_image = {mode:'impact_card', wide:{
    url:'https://github.com/sustynats/wirkungsoekonomie.de/releases/download/wirkungsticker-media-2026-10/wt-0000000000000000-0000000000000000-wide.png',
  }};
  const original = structuredClone(record), legacy = publicTitleImage(record.title_image);
  assert.ok(legacy?.wide, 'the retained immutable image remains a valid legacy DTO');
  const withoutFlag = project(record, assessment, reviewed);
  assert.deepEqual(publicTitleImage(record.title_image, {...record, impact_assessment:withoutFlag}), legacy);
  const projected = project(record, assessment, {...reviewed, withhold_title_image:true});
  assert.equal(projected.zero_evidence_correction.withhold_title_image, true);
  assert.equal(publicTitleImage(record.title_image, {...record, impact_assessment:projected}), null);
  assert.deepEqual(publicTitleImage(record.title_image), legacy, 'an unbound call does not hide unrelated cards');
  assert.deepEqual(record, original, 'no image request, raw profile or stored metadata mutation');
});

for (const key of ['human','planet','democracy']) test('a source topic omission does not establish a zero change: ' + key, () => {
  const {record,assessment} = fixture(key), path = assessment.dimensions[key].primary_paths[0];
  for (const reason of [
    'Die Quelle enthält keinen Umweltbezug und keinen Mechanismus, der innerhalb des betrachteten Gegenstands ökologische Systeme verändert.',
    'Die Quellen enthalten keinen materiellen Wirkpfad für diese Dimension.',
    'In der vorgelegten Textauswahl gibt es keinen Umweltbezug.',
  ]) {
    path.negligibility_rationale = reason;
    const before = structuredClone(record);
    assert.deepEqual(missingEvidenceZeroIssues(assessment), ['IMPACT_ZERO_FROM_MISSING_EVIDENCE:' + key]);
    assert.ok(deterministicGateIssues(record).includes('IMPACT_ZERO_FROM_MISSING_EVIDENCE:' + key));
    assert.equal(releaseDeterministicImpact(record).released, false);
    assert.deepEqual(record,before, 'the paid record and its original profile remain unchanged');
  }
  path.negligibility_rationale = 'Die Quelle enthält keinen Umweltbezug. Identische Räume und unveränderte Wege begrenzen die Änderung; keine zusätzlichen Reisen.';
  assert.deepEqual(missingEvidenceZeroIssues(assessment), [], 'an explicit bounded basis is preserved despite source silence');
});

test('an audited correction list selects only the matching edition and semantic profile', () => {
  const first = fixture(), second = fixture();
  second.record.story_id = second.reviewed.story_id = 'wt-second-audited-zero';
  second.record.updated_at = second.reviewed.updated_at = '2026-10-27T10:50:00.000Z';
  second.assessment.evaluation_target.label = second.reviewed.target_label = 'Zweiter synthetischer Vorgang';
  second.reviewed.profile_sha256 = observationContextFingerprint(second.assessment);
  const bindings = [first.reviewed,second.reviewed], before = structuredClone(second.record);
  const projected = project(second.record,second.assessment,bindings);
  assert.equal(projected.dimensions.planet.magnitude,null);
  assert.deepEqual(second.record,before);
  assert.deepEqual(project({},second.assessment,bindings),projected, 'the stripped public DTO selects the same semantic binding');
  assert.equal(project({...second.record,updated_at:'2026-10-27T11:00:00.000Z'},second.assessment,bindings),second.assessment);
  assert.equal(project({...second.record,content_hash:'changed'},second.assessment,bindings),second.assessment);
  assert.equal(project({...second.record,manual_only:true},second.assessment,bindings),second.assessment);
});

test('the absence check requires all zero factors and several explicit missing-evidence reasons', () => {
  const {assessment} = fixture(), path = assessment.dimensions.planet.primary_paths[0];
  path.magnitude_factors.reach.value = 1;
  assert.deepEqual(missingEvidenceZeroIssues(assessment), []);
  path.magnitude_factors.reach.value = 0;
  Object.values(path.magnitude_factors).slice(3).forEach(factor => {factor.rationale = 'Im eng begrenzten Betrachtungsraum praktisch unerheblich.';});
  assert.deepEqual(missingEvidenceZeroIssues(assessment), [], 'three missing reasons are insufficient for this conservative check');
  path.magnitude_factors.irreversibility.rationale = 'Keine irreversible Veränderung ist belegt.';
  assert.deepEqual(missingEvidenceZeroIssues(assessment), ['IMPACT_ZERO_FROM_MISSING_EVIDENCE:planet']);
});

test('coverage and operational audits do not count an unsupported zero as a complete assessment', () => {
  const {record,assessment,reviewed} = fixture();
  const coverage = impactCoverage([record]);
  assert.equal(coverage.fully_assessed,0);
  assert.ok(coverage.errors[0].errors.includes('IMPACT_ZERO_FROM_MISSING_EVIDENCE:planet'));
  const audit = auditImpactProfiles([{...record,analysis:{},slug:'synthetic-programme'}]);
  assert.ok(audit.review_candidates[0].research_issues.includes('IMPACT_ZERO_FROM_MISSING_EVIDENCE:planet'));
  const historical = impactCoverage([{...record,impact_assessment:project(record,assessment,reviewed)}]);
  assert.equal(historical.fully_assessed,0);
  assert.equal(historical.needs_reassessment,1);
  assert.equal(historical.magnitude_null,1);
  assert.equal(historical.by_dimension.planet.insufficient_basis,1);
});

test('low evidence and an uncertain nonzero model are not converted into a zero or a hold by this check', () => {
  const {assessment} = fixture(), path = assessment.dimensions.planet.primary_paths[0];
  path.magnitude = 3;
  const before = structuredClone(assessment);
  assert.deepEqual(missingEvidenceZeroIssues(assessment), []);
  assert.deepEqual(assessment, before);
});

test('a passing zero does not require an absence-of-evidence wording', () => {
  const assessment = syntheticPotentialAssessment(), path = syntheticPotentialPath({direction:'open',magnitude:0});
  assessment.dimensions.planet.primary_paths = [path];
  assert.deepEqual(missingEvidenceZeroIssues(assessment), []);
});

test('one audited historical correction opens only the unsupported dimension and preserves the original', () => {
  const {record, assessment, reviewed} = fixture(), before = structuredClone(record);
  const projected = project(record, assessment, reviewed);
  assert.notEqual(projected, assessment);
  assert.ok(isGroundedOpenDimension(projected.dimensions.planet, new Set(['official'])));
  assert.equal(projected.dimensions.planet.magnitude, null);
  assert.deepEqual(projected.dimensions.human, assessment.dimensions.human);
  assert.deepEqual(projected.dimensions.democracy, assessment.dimensions.democracy);
  assert.deepEqual(projected.observed_effects, assessment.observed_effects);
  assert.equal(projected.zero_evidence_correction.previous_magnitude, 0);
  assert.deepEqual(record, before, 'stored first edition, paid forecast and history stay byte-equivalent');
  assert.equal(project(record, projected, reviewed), projected);
});

test('changed editions, bindings and private approvals do not inherit a correction', () => {
  const mutations = [
    (r) => {r.story_id = 'different-story';}, (r) => {r.published = false;},
    (r) => {r.manual_only = true;}, (r) => {r.editorial_approval_hash = 'private-approval';},
    (r) => {r.published_at = '2026-10-28T00:00:00.000Z';},
    (r) => {r.current_version = 2;}, (r) => {r.content_hash += '-changed';},
    (_r,a) => {a.baseline += ' Changed baseline.';},
    (_r,a) => {a.dimensions.human.rationale += ' Changed assessment.';},
    (_r,a) => {a.dimensions.planet.primary_paths[0].source_ids.push('other-source');},
  ];
  for (const mutate of mutations) {
    const {record, assessment, reviewed} = fixture(); mutate(record,assessment);
    const before = structuredClone(record);
    assert.equal(project(record,assessment,reviewed),assessment);
    assert.deepEqual(record,before);
  }
});

test('a stripped public DTO retains the same semantic binding', () => {
  const {record, assessment, reviewed} = fixture();
  const {review, research_check, ...dto} = structuredClone(assessment);
  const projected = project({},dto,reviewed);
  assert.equal(projected.dimensions.planet.magnitude,null);
  assert.deepEqual(projected.zero_evidence_correction,project(record,assessment,reviewed).zero_evidence_correction);
});

test('the shared reader shows a dated correction and an open scale, with no zero factors', () => {
  const {record,assessment,reviewed} = fixture(), projected = project(record,assessment,reviewed);
  const view = deriveImpactPresentation(projected);
  assert.equal(view.dimensions.planet.magnitude,null);
  assert.equal(view.dimensions.planet.magnitude_label,'Tragweite offen');
  const html = renderDimensionMeters({impact_assessment:projected},{context:{privateImpactPreview:true}});
  assert.match(html,/data-impact-zero-evidence-correction/);
  assert.match(html,/Darstellungskorrektur vom 27\.10\.2026/);
  const planet = html.split('wt-dim--planet')[1].split('wt-dim--democracy')[0];
  assert.match(planet,/data-magnitude="open"/);
  assert.match(planet,/keine Bewertung mit null Punkten/);
  assert.doesNotMatch(planet,/0\/5|data-magnitude="0"|Grundwert:/);
  assert.equal((html.match(/class="wt-dim wt-dim--/g)||[]).length,3);
});
