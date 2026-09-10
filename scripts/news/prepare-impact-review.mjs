import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash } from './bridge/contract.mjs';
import { semanticIssues } from './impact-publication.mjs';
import { assessmentBasis } from './migrate-impact-assessments.mjs';

// Source-bound editorial research is handed to the normal bridge and its
// independent second pass. This command grants no publication approval.
export function prepareImpactReview(record, review) {
  if (record.story_id !== review.story_id || hash(record.analysis) !== review.expected_analysis_hash) throw Error('IMPACT_REVIEW_STALE_ANALYSIS');
  const candidate = structuredClone(record);
  candidate.impact_sources = review.assessment_sources;
  const issues = semanticIssues(review.impact_assessment, candidate);
  if (issues.length) throw Object.assign(Error('IMPACT_REVIEW_INVALID'), { issues });
  candidate.impact_reassessment_request = { checked_at: review.checked_at, note: review.note, proposed_assessment: review.impact_assessment, review_hash: hash(review) };
  candidate.impact_assessment_basis = assessmentBasis(candidate);
  return candidate;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const filename = path.join(root, 'data/news/stories.json'), data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const reviews = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).reviews;
  for (const review of reviews) {
    const index = data.stories.findIndex(s => s.story_id === review.story_id);
    if (index < 0) throw Error('IMPACT_REVIEW_STORY_MISSING');
    data.stories[index] = prepareImpactReview(data.stories[index], review);
  }
  const temp = filename + '.tmp-' + process.pid;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2) + '\n'); fs.renameSync(temp, filename);
  console.log(`Wirkungsprüfungen für den normalen Bridge-Prozess vorbereitet: ${reviews.length}. Noch keine Produktionsfreigabe.`);
}
