import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { IMPACT_VERSION, migrateImpactAssessment, impactAssessmentErrors } from './impact-assessment.mjs';

export const assessmentHash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function assessmentBasis(record) {
  return assessmentHash({ analysis: record.analysis || null, source_snapshot: record.source_snapshot || null,
    impact_reassessment_request: record.impact_reassessment_request || null,
    sources: record.sources || null, impact_sources: record.impact_sources || null, content_hash: record.content_hash || null,
    // Editorial content is the assessed object; metadata-only changes are not.
    sections: record.sections || null, subject_dimensions: record.subject_dimensions || null });
}

// Only the reproducible conservative projection is eligible for historical
// display while reassessment is pending. An arbitrary review flag must never
// exempt generated or edited assessments from publication validation.
export function persistedImpactAssessmentErrors(record) {
  if (record.manual_authority || record.format === 'book_review' || record.book) return [];
  const assessment = record.impact_assessment;
  if (!assessment) return ['IMPACT_PERSISTED_ASSESSMENT_REQUIRED'];
  if (record.impact_assessment_basis !== assessmentBasis(record)) return ['IMPACT_PERSISTED_BASIS_MISMATCH'];
  if (assessment.review?.status === 'needs_reassessment') {
    const { impact_assessment: _old, ...original } = record.analysis || record;
    const expected = migrateImpactAssessment(original, { title: record.title, news_event: record.title, version: assessment.version });
    const actual = structuredClone(assessment);
    delete actual.review.migrated_at;
    return assessmentHash(actual) === assessmentHash(expected) ? [] : ['IMPACT_LEGACY_PROJECTION_MODIFIED'];
  }
  return impactAssessmentErrors(assessment, [...(record.sources || record.source_snapshot || []), ...(record.impact_sources || [])], { required: true, version: assessment.version });
}
export function migrateImpactCatalog(records, { now = '2026-09-10T10:30:00.000Z' } = {}) {
  const report = { checked: 0, automatically_migrated: 0, reassessed: 0, needs_reassessment: 0, errors: [], changed: 0, records: [] };
  const result = records.map(original => {
    if (!original.published && original.status !== 'published') return original;
    // Manuscripts and self-authored books have no automatic MPD assessment.
    if (original.manual_authority || original.format === 'book_review' || original.book) return original;
    const record = structuredClone(original), id = record.story_id || record.analysis_id;
    report.checked++;
    const basis = assessmentBasis(record), sources = record.sources || record.source_snapshot || [];
    let assessment = record.impact_assessment || record.analysis?.impact_assessment;
    if (assessment && record.impact_assessment_basis && record.impact_assessment_basis !== basis) assessment = null;
    if (assessment && !assessment.review?.missing?.length) {
      const errors = impactAssessmentErrors(assessment, [...sources, ...(record.impact_sources || [])], assessment.version === '2.0' ? {version:'2.0'} : {});
      if (errors.length) { report.errors.push({ id, errors }); assessment = null; }
    }
    if (!assessment || assessment.version !== IMPACT_VERSION || !Object.values(assessment.dimensions || {}).every(d => d.path_status && d.likelihood)) {
      const { impact_assessment: _old, ...analysis } = record.analysis || record;
      assessment = migrateImpactAssessment(analysis, { title: record.title, news_event: record.title });
      assessment.review.migrated_at = now;
    }
    record.impact_assessment = assessment;
    record.impact_assessment_basis = basis;
    const pending = assessment.review?.status === 'needs_reassessment';
    if (pending) report.needs_reassessment++;
    else if (assessment.review?.status === 'reassessed') report.reassessed++;
    else report.automatically_migrated++;
    if (JSON.stringify(original) !== JSON.stringify(record)) report.changed++;
    report.records.push({ id, status: pending ? 'needs_reassessment' : assessment.review?.status || 'migrated', missing: assessment.review?.missing || [] });
    return record;
  });
  return { records: result, report };
}

export function migrateImpactFiles(root, options = {}) {
  const reports = [];
  for (const [file, key] of [['stories.json', 'stories'], ['editorial-analyses.json', 'analyses']]) {
    const filename = path.join(root, 'data/news', file), catalog = JSON.parse(fs.readFileSync(filename, 'utf8'));
    const result = migrateImpactCatalog(catalog[key], options);
    if (result.report.changed) {
      catalog[key] = result.records;
      const temp = `${filename}.tmp-${process.pid}`;
      fs.writeFileSync(temp, JSON.stringify(catalog, null, 2) + '\n'); fs.renameSync(temp, filename);
    }
    reports.push({ file, ...result.report });
  }
  return reports;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const reports = migrateImpactFiles(root);
  const report = { version: IMPACT_VERSION, reports };
  fs.writeFileSync(path.join(root, 'reports/wirkungsticker-impact-migration.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(reports.map(({ records, ...summary }) => summary)));
}
